package api

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"custom-backend/internal/database"

	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/webhook"
)

type StripeWebhookHandler struct {
	db              *database.Database
	webhookSecret   string
	stripeSecretKey string
}

type WebhookEvent struct {
	ID              string     `json:"id"`
	EventID         string     `json:"event_id"`
	EventType       string     `json:"event_type"`
	Payload         string     `json:"payload"`
	Processed       bool       `json:"processed"`
	ProcessingError *string    `json:"processing_error,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	ProcessedAt     *time.Time `json:"processed_at,omitempty"`
}

func NewStripeWebhookHandler(db *database.Database, webhookSecret, stripeSecretKey string) *StripeWebhookHandler {
	stripe.Key = stripeSecretKey
	return &StripeWebhookHandler{
		db:              db,
		webhookSecret:   webhookSecret,
		stripeSecretKey: stripeSecretKey,
	}
}

// HandleWebhook processes incoming Stripe webhook events
func (h *StripeWebhookHandler) HandleWebhook(c *fiber.Ctx) error {
	// Read the request body
	body := c.Body()

	// Get the Stripe signature from headers
	signature := c.Get("Stripe-Signature")

	// Verify the webhook signature
	event, err := webhook.ConstructEvent(body, signature, h.webhookSecret)
	if err != nil {
		log.Printf("[StripeWebhook] Signature verification failed: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid signature",
		})
	}

	log.Printf("[StripeWebhook] Received event: %s (ID: %s)", event.Type, event.ID)

	// Check if we've already processed this event (idempotency)
	var existingEvent WebhookEvent
	err = h.db.DB.Raw(`
		SELECT id, event_id, processed
		FROM stripe_webhook_events
		WHERE event_id = $1
	`, event.ID).Scan(&existingEvent).Error

	if err == nil && existingEvent.Processed {
		log.Printf("[StripeWebhook] Event %s already processed, skipping", event.ID)
		return c.JSON(fiber.Map{"received": true, "status": "already_processed"})
	}

	// Store the event in the database
	payloadJSON, _ := json.Marshal(event)
	err = h.db.DB.Exec(`
		INSERT INTO stripe_webhook_events (event_id, event_type, payload, processed)
		VALUES ($1, $2, $3, false)
		ON CONFLICT (event_id) DO NOTHING
	`, event.ID, event.Type, string(payloadJSON)).Error

	if err != nil {
		log.Printf("[StripeWebhook] Failed to store event: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store event",
		})
	}

	// Process the event based on its type
	processingErr := h.processEvent(&event)

	// Update the event processing status
	var errorStr *string
	if processingErr != nil {
		errStr := processingErr.Error()
		errorStr = &errStr
	}

	now := time.Now()
	err = h.db.DB.Exec(`
		UPDATE stripe_webhook_events
		SET processed = $1, processing_error = $2, processed_at = $3
		WHERE event_id = $4
	`, processingErr == nil, errorStr, now, event.ID).Error

	if err != nil {
		log.Printf("[StripeWebhook] Failed to update event status: %v", err)
	}

	if processingErr != nil {
		log.Printf("[StripeWebhook] Event processing failed: %v", processingErr)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Event processing failed",
			"details": processingErr.Error(),
		})
	}

	return c.JSON(fiber.Map{"received": true})
}

// processEvent routes the event to the appropriate handler
func (h *StripeWebhookHandler) processEvent(event *stripe.Event) error {
	switch event.Type {
	// Payment Intent events
	case "payment_intent.succeeded":
		return h.handlePaymentIntentSucceeded(event)
	case "payment_intent.payment_failed":
		return h.handlePaymentIntentFailed(event)

	// Customer events
	case "customer.created":
		return h.handleCustomerCreated(event)
	case "customer.updated":
		return h.handleCustomerUpdated(event)
	case "customer.deleted":
		return h.handleCustomerDeleted(event)

	// Subscription events
	case "customer.subscription.created":
		return h.handleSubscriptionCreated(event)
	case "customer.subscription.updated":
		return h.handleSubscriptionUpdated(event)
	case "customer.subscription.deleted":
		return h.handleSubscriptionDeleted(event)

	// Invoice events
	case "invoice.payment_succeeded":
		return h.handleInvoicePaymentSucceeded(event)
	case "invoice.payment_failed":
		return h.handleInvoicePaymentFailed(event)
	case "invoice.finalized":
		return h.handleInvoiceFinalized(event)

	default:
		log.Printf("[StripeWebhook] Unhandled event type: %s", event.Type)
		return nil // Don't fail on unknown events
	}
}

// Payment Intent handlers
func (h *StripeWebhookHandler) handlePaymentIntentSucceeded(event *stripe.Event) error {
	var paymentIntent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
		return fmt.Errorf("failed to parse payment intent: %w", err)
	}

	log.Printf("[StripeWebhook] Payment succeeded: %s (amount: %d %s)",
		paymentIntent.ID, paymentIntent.Amount, paymentIntent.Currency)

	// TODO: Update billing_history table when it's created in migration 012
	// For now, just log the event

	return nil
}

func (h *StripeWebhookHandler) handlePaymentIntentFailed(event *stripe.Event) error {
	var paymentIntent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
		return fmt.Errorf("failed to parse payment intent: %w", err)
	}

	log.Printf("[StripeWebhook] Payment failed: %s (reason: %s)",
		paymentIntent.ID, paymentIntent.LastPaymentError)

	// TODO: Notify user of payment failure

	return nil
}

// Customer handlers
func (h *StripeWebhookHandler) handleCustomerCreated(event *stripe.Event) error {
	var customer stripe.Customer
	if err := json.Unmarshal(event.Data.Raw, &customer); err != nil {
		return fmt.Errorf("failed to parse customer: %w", err)
	}

	log.Printf("[StripeWebhook] Customer created: %s (email: %s)", customer.ID, customer.Email)

	// Update user record with stripe_customer_id if email matches
	if customer.Email != "" {
		result := h.db.DB.Exec(`
			UPDATE users
			SET stripe_customer_id = $1, updated_at = NOW()
			WHERE email = $2 AND stripe_customer_id IS NULL
		`, customer.ID, customer.Email)

		if result.Error != nil {
			return fmt.Errorf("failed to update user stripe_customer_id: %w", result.Error)
		}

		if result.RowsAffected > 0 {
			log.Printf("[StripeWebhook] Updated user with email %s to have stripe_customer_id %s",
				customer.Email, customer.ID)
		}
	}

	return nil
}

func (h *StripeWebhookHandler) handleCustomerUpdated(event *stripe.Event) error {
	var customer stripe.Customer
	if err := json.Unmarshal(event.Data.Raw, &customer); err != nil {
		return fmt.Errorf("failed to parse customer: %w", err)
	}

	log.Printf("[StripeWebhook] Customer updated: %s", customer.ID)
	return nil
}

func (h *StripeWebhookHandler) handleCustomerDeleted(event *stripe.Event) error {
	var customer stripe.Customer
	if err := json.Unmarshal(event.Data.Raw, &customer); err != nil {
		return fmt.Errorf("failed to parse customer: %w", err)
	}

	log.Printf("[StripeWebhook] Customer deleted: %s", customer.ID)

	// Remove stripe_customer_id from user
	result := h.db.DB.Exec(`
		UPDATE users
		SET stripe_customer_id = NULL, updated_at = NOW()
		WHERE stripe_customer_id = $1
	`, customer.ID)

	if result.Error != nil {
		return fmt.Errorf("failed to clear user stripe_customer_id: %w", result.Error)
	}

	return nil
}

// Subscription handlers
func (h *StripeWebhookHandler) handleSubscriptionCreated(event *stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return fmt.Errorf("failed to parse subscription: %w", err)
	}

	log.Printf("[StripeWebhook] Subscription created: %s (customer: %s, status: %s)",
		subscription.ID, subscription.Customer.ID, subscription.Status)

	// TODO: Create subscription record in subscriptions table (migration 012)

	return nil
}

func (h *StripeWebhookHandler) handleSubscriptionUpdated(event *stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return fmt.Errorf("failed to parse subscription: %w", err)
	}

	log.Printf("[StripeWebhook] Subscription updated: %s (status: %s)",
		subscription.ID, subscription.Status)

	// TODO: Update subscription record in subscriptions table (migration 012)

	return nil
}

func (h *StripeWebhookHandler) handleSubscriptionDeleted(event *stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return fmt.Errorf("failed to parse subscription: %w", err)
	}

	log.Printf("[StripeWebhook] Subscription deleted: %s", subscription.ID)

	// TODO: Update subscription status to canceled in subscriptions table (migration 012)

	return nil
}

// Invoice handlers
func (h *StripeWebhookHandler) handleInvoicePaymentSucceeded(event *stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		return fmt.Errorf("failed to parse invoice: %w", err)
	}

	log.Printf("[StripeWebhook] Invoice payment succeeded: %s (amount: %d %s)",
		invoice.ID, invoice.AmountPaid, invoice.Currency)

	// TODO: Create billing_history record (migration 012)

	return nil
}

func (h *StripeWebhookHandler) handleInvoicePaymentFailed(event *stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		return fmt.Errorf("failed to parse invoice: %w", err)
	}

	log.Printf("[StripeWebhook] Invoice payment failed: %s", invoice.ID)

	// TODO: Create billing_history record with failed status (migration 012)
	// TODO: Notify user of payment failure

	return nil
}

func (h *StripeWebhookHandler) handleInvoiceFinalized(event *stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		return fmt.Errorf("failed to parse invoice: %w", err)
	}

	log.Printf("[StripeWebhook] Invoice finalized: %s", invoice.ID)
	return nil
}
