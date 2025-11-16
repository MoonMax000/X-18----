package api

import (
	"custom-backend/configs"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/pkg/email"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/customer"
	"github.com/stripe/stripe-go/v74/paymentintent"
	"github.com/stripe/stripe-go/v74/paymentmethod"
	"github.com/stripe/stripe-go/v74/setupintent"
	"github.com/stripe/stripe-go/v74/webhook"
	"gorm.io/gorm"
)

type StripeHandler struct {
	db          *database.Database
	cache       *cache.Cache
	config      *configs.Config
	emailClient email.EmailClient
}

func NewStripeHandler(db *database.Database, cache *cache.Cache, config *configs.Config, emailClient email.EmailClient) *StripeHandler {
	// Initialize Stripe with secret key
	stripe.Key = config.Stripe.SecretKey

	return &StripeHandler{
		db:          db,
		cache:       cache,
		config:      config,
		emailClient: emailClient,
	}
}

// CreatePaymentIntent создает PaymentIntent для разблокировки поста
func (h *StripeHandler) CreatePaymentIntent(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req struct {
		PostID string `json:"post_id"`
		Type   string `json:"type"` // "unlock" или "subscribe"
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Получаем информацию о посте
	var post models.Post
	if err := h.db.DB.Where("id = ?", req.PostID).First(&post).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	// Проверяем, не является ли пользователь владельцем поста
	if post.UserID == userID.(uuid.UUID) {
		return c.Status(400).JSON(fiber.Map{
			"error": "You cannot purchase your own post",
		})
	}

	// Get post author for subscription
	var postAuthor models.User
	if err := h.db.DB.Where("id = ?", post.UserID).First(&postAuthor).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Post author not found",
		})
	}

	// Определяем сумму платежа в центах
	var amountCents int64
	var description string

	switch req.Type {
	case "unlock":
		if post.AccessLevel != "pay-per-post" {
			return c.Status(400).JSON(fiber.Map{
				"error": "This post does not require payment",
			})
		}
		if post.PriceCents == 0 {
			return c.Status(400).JSON(fiber.Map{
				"error": "Post price not set",
			})
		}
		amountCents = int64(post.PriceCents)
		description = fmt.Sprintf("Unlock post #%s", req.PostID)

	case "subscribe":
		if post.AccessLevel != "subscribers-only" && post.AccessLevel != "premium" {
			return c.Status(400).JSON(fiber.Map{
				"error": "This post does not require subscription",
			})
		}
		if postAuthor.SubscriptionPrice == 0 {
			return c.Status(400).JSON(fiber.Map{
				"error": "Subscription price not set",
			})
		}
		amountCents = int64(postAuthor.SubscriptionPrice * 100)
		description = fmt.Sprintf("Subscribe to author of post #%s", req.PostID)

	default:
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid payment type",
		})
	}

	// Get user email for Stripe
	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get user data",
		})
	}

	// Get or create Stripe customer
	customerID, err := h.getOrCreateStripeCustomer(user.ID, user.Email)
	if err != nil {
		log.Printf("Failed to get/create Stripe customer: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create payment",
		})
	}

	// Create PaymentIntent through Stripe API
	params := &stripe.PaymentIntentParams{
		Amount:       stripe.Int64(amountCents),
		Currency:     stripe.String(string(stripe.CurrencyUSD)),
		Description:  stripe.String(description),
		Customer:     stripe.String(customerID),
		ReceiptEmail: stripe.String(user.Email),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	// Add metadata after creating params
	params.AddMetadata("user_id", userID.(uuid.UUID).String())
	params.AddMetadata("post_id", req.PostID)
	params.AddMetadata("post_user_id", post.UserID.String())
	params.AddMetadata("type", req.Type)

	pi, err := paymentintent.New(params)
	if err != nil {
		log.Printf("Failed to create payment intent: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create payment",
		})
	}

	return c.JSON(fiber.Map{
		"client_secret":     pi.ClientSecret,
		"payment_intent_id": pi.ID,
		"amount":            amountCents,
	})
}

// HandleStripeWebhook обрабатывает вебхуки от Stripe
func (h *StripeHandler) HandleStripeWebhook(c *fiber.Ctx) error {
	// Get payload and signature
	payload := c.Body()
	signatureHeader := c.Get("Stripe-Signature")

	// Verify webhook signature
	event, err := webhook.ConstructEvent(payload, signatureHeader, h.config.Stripe.WebhookSecret)
	if err != nil {
		log.Printf("Failed to verify webhook signature: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid webhook signature",
		})
	}

	// Handle different event types
	switch event.Type {
	case "payment_intent.succeeded":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
			log.Printf("Failed to parse payment intent: %v", err)
			return c.Status(400).JSON(fiber.Map{
				"error": "Failed to parse data",
			})
		}

		// Extract metadata
		userID := pi.Metadata["user_id"]
		postID := pi.Metadata["post_id"]
		postUserID := pi.Metadata["post_user_id"]
		paymentType := pi.Metadata["type"]

		// Parse UUIDs
		userUUID, _ := uuid.Parse(userID)
		postUUID, _ := uuid.Parse(postID)
		postUserUUID, _ := uuid.Parse(postUserID)

		if paymentType == "unlock" {
			// Save post purchase
			purchase := models.PostPurchase{
				ID:                    uuid.New(),
				UserID:                userUUID,
				PostID:                postUUID,
				AmountCents:           pi.Amount,
				StripePaymentIntentID: pi.ID,
				PurchasedAt:           time.Now(),
			}

			if err := h.db.DB.Create(&purchase).Error; err != nil {
				log.Printf("Failed to save post purchase: %v", err)
			}

			// Create notification for post author
			notification := models.Notification{
				ID:         uuid.New(),
				UserID:     postUserUUID,
				Type:       "post_purchased",
				PostID:     &postUUID,
				FromUserID: &userUUID,
				CreatedAt:  time.Now(),
			}
			h.db.DB.Create(&notification)

		} else if paymentType == "subscribe" {
			// Create subscription
			subscription := models.Subscription{
				ID:                   uuid.New(),
				SubscriberID:         userUUID,
				CreatorID:            postUserUUID,
				Status:               "active",
				StripeSubscriptionID: &pi.ID,
				CreatedAt:            time.Now(),
			}

			if err := h.db.DB.Create(&subscription).Error; err != nil {
				// Try to update existing subscription
				h.db.DB.Model(&models.Subscription{}).
					Where("subscriber_id = ? AND creator_id = ?", userUUID, postUserUUID).
					Updates(map[string]interface{}{
						"status":     "active",
						"updated_at": time.Now(),
					})
			}

			// Create notification for new subscriber
			notification := models.Notification{
				ID:         uuid.New(),
				UserID:     postUserUUID,
				Type:       "new_subscriber",
				FromUserID: &userUUID,
				CreatedAt:  time.Now(),
			}
			h.db.DB.Create(&notification)
		}

	case "payment_intent.payment_failed":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err == nil {
			log.Printf("Payment failed: %s", pi.ID)
		}

	default:
		log.Printf("Received webhook type: %s", event.Type)
	}

	return c.SendStatus(200)
}

// CheckPostAccess проверяет, имеет ли пользователь доступ к посту
func (h *StripeHandler) CheckPostAccess(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	postID := c.Params("id")

	// Get post info
	var post models.Post
	if err := h.db.DB.Where("id = ?", postID).First(&post).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	// Owner always has access
	if post.UserID == userID.(uuid.UUID) {
		return c.JSON(fiber.Map{
			"has_access":   true,
			"access_level": post.AccessLevel,
			"is_owner":     true,
		})
	}

	hasAccess := false
	var reason string

	switch post.AccessLevel {
	case "public", "free":
		hasAccess = true

	case "pay-per-post":
		// Check if user purchased this post
		var purchased bool
		err := h.db.DB.Model(&models.PostPurchase{}).
			Select("count(*) > 0").
			Where("user_id = ? AND post_id = ?", userID, postID).
			Find(&purchased).Error

		if err == nil && purchased {
			hasAccess = true
		} else {
			reason = "requires_payment"
		}

	case "subscribers-only", "premium":
		// Check active subscription
		var subscribed bool
		err := h.db.DB.Model(&models.Subscription{}).
			Select("count(*) > 0").
			Where("subscriber_id = ? AND creator_id = ? AND status = ?",
				userID, post.UserID, "active").
			Find(&subscribed).Error

		if err == nil && subscribed {
			hasAccess = true
		} else {
			reason = "requires_subscription"
		}

	case "followers-only":
		// Check if following
		var following bool
		err := h.db.DB.Model(&models.Follow{}).
			Select("count(*) > 0").
			Where("follower_id = ? AND following_id = ?", userID, post.UserID).
			Find(&following).Error

		if err == nil && following {
			hasAccess = true
		} else {
			reason = "requires_follow"
		}
	}

	return c.JSON(fiber.Map{
		"has_access":   hasAccess,
		"access_level": post.AccessLevel,
		"is_owner":     false,
		"reason":       reason,
	})
}

// GetUserPurchases возвращает список купленных постов пользователя
func (h *StripeHandler) GetUserPurchases(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var purchases []models.PostPurchase
	err := h.db.DB.Where("user_id = ?", userID).
		Preload("Post").
		Preload("Post.User").
		Order("purchased_at DESC").
		Find(&purchases).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get purchases",
		})
	}

	// Format response
	result := make([]fiber.Map, 0, len(purchases))
	for _, purchase := range purchases {
		result = append(result, fiber.Map{
			"post_id":      purchase.PostID,
			"amount_cents": purchase.AmountCents,
			"purchased_at": purchase.PurchasedAt,
			"post": fiber.Map{
				"id":      purchase.Post.ID,
				"content": purchase.Post.Content,
				"author": fiber.Map{
					"id":           purchase.Post.User.ID,
					"username":     purchase.Post.User.Username,
					"display_name": purchase.Post.User.DisplayName,
					"avatar_url":   purchase.Post.User.AvatarURL,
				},
			},
		})
	}

	return c.JSON(result)
}

// getOrCreateStripeCustomer creates or retrieves Stripe Customer for user
func (h *StripeHandler) getOrCreateStripeCustomer(userID uuid.UUID, email string) (string, error) {
	// Check if user already has a Stripe customer ID
	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return "", err
	}

	// If user already has a customer ID, return it
	if user.StripeCustomerID != nil && *user.StripeCustomerID != "" {
		return *user.StripeCustomerID, nil
	}

	// Create new customer in Stripe
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
	}
	params.AddMetadata("user_id", userID.String())

	cust, err := customer.New(params)
	if err != nil {
		return "", err
	}

	// Save customer ID to database
	customerID := cust.ID
	h.db.DB.Model(&user).Update("stripe_customer_id", customerID)

	return customerID, nil
}

// CreateSetupIntent создает Setup Intent для сохранения карты без списания средств
func (h *StripeHandler) CreateSetupIntent(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get user email
	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get user data",
		})
	}

	// Get or create Stripe customer
	customerID, err := h.getOrCreateStripeCustomer(user.ID, user.Email)
	if err != nil {
		log.Printf("Failed to get/create Stripe customer: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create setup intent",
		})
	}

	// Create Setup Intent
	params := &stripe.SetupIntentParams{
		Customer: stripe.String(customerID),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
	}
	params.AddMetadata("user_id", userID.(uuid.UUID).String())

	si, err := setupintent.New(params)
	if err != nil {
		log.Printf("Failed to create setup intent: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create setup intent",
		})
	}

	return c.JSON(models.SetupIntentResponse{
		ClientSecret: si.ClientSecret,
	})
}

// SavePaymentMethod сохраняет PaymentMethod после успешного Setup Intent
func (h *StripeHandler) SavePaymentMethod(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Log raw body for debugging
	log.Printf("[SavePaymentMethod] Raw body: %s", string(c.Body()))

	var req models.CreatePaymentMethodRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("[SavePaymentMethod] Body parse error: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	log.Printf("[SavePaymentMethod] Parsed request: StripePaymentMethodID='%s', SetAsDefault=%v",
		req.StripePaymentMethodID, req.SetAsDefault)

	// Check if payment method ID is empty
	if req.StripePaymentMethodID == "" {
		log.Printf("[SavePaymentMethod] ERROR: Empty payment method ID received")
		return c.Status(400).JSON(fiber.Map{
			"error": "Payment method ID is required",
		})
	}

	// Get PaymentMethod details from Stripe
	log.Printf("[SavePaymentMethod] Fetching payment method from Stripe: %s", req.StripePaymentMethodID)
	pm, err := paymentmethod.Get(req.StripePaymentMethodID, nil)
	if err != nil {
		log.Printf("[SavePaymentMethod] Stripe API error: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid payment method",
		})
	}
	log.Printf("[SavePaymentMethod] Successfully fetched payment method: %s, Customer: %s",
		pm.ID, pm.Customer.ID)

	// Verify payment method belongs to this user's customer
	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get user data",
		})
	}

	if user.StripeCustomerID == nil || pm.Customer.ID != *user.StripeCustomerID {
		return c.Status(403).JSON(fiber.Map{
			"error": "Payment method does not belong to this user",
		})
	}

	// Check if this payment method already exists
	var existingPM models.PaymentMethod
	if err := h.db.DB.Where("stripe_payment_method_id = ?", req.StripePaymentMethodID).First(&existingPM).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Payment method already saved",
		})
	}

	// If setting as default, unset other default payment methods
	if req.SetAsDefault {
		h.db.DB.Model(&models.PaymentMethod{}).
			Where("user_id = ?", userID).
			Update("is_default", false)
	}

	// Create payment method record
	newPM := models.PaymentMethod{
		ID:                    uuid.New(),
		UserID:                userID.(uuid.UUID),
		StripePaymentMethodID: req.StripePaymentMethodID,
		IsDefault:             req.SetAsDefault,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	// Extract card information
	log.Printf("[SavePaymentMethod] Checking card data: pm.Card != nil: %v", pm.Card != nil)
	if pm.Card != nil {
		brand := string(pm.Card.Brand)
		last4 := pm.Card.Last4
		funding := string(pm.Card.Funding)
		country := pm.Card.Country
		expMonth := int(pm.Card.ExpMonth)
		expYear := int(pm.Card.ExpYear)

		log.Printf("[SavePaymentMethod] Card data from Stripe: brand=%s, last4=%s, expMonth=%d, expYear=%d, funding=%s, country=%s",
			brand, last4, expMonth, expYear, funding, country)

		newPM.CardBrand = &brand
		newPM.CardLast4 = &last4
		newPM.CardFunding = &funding
		newPM.CardCountry = &country
		newPM.CardExpMonth = &expMonth
		newPM.CardExpYear = &expYear

		log.Printf("[SavePaymentMethod] Card data assigned to model: CardBrand=%v, CardLast4=%v, CardExpMonth=%v, CardExpYear=%v",
			*newPM.CardBrand, *newPM.CardLast4, *newPM.CardExpMonth, *newPM.CardExpYear)
	} else {
		log.Printf("[SavePaymentMethod] WARNING: pm.Card is nil - no card data available!")
	}

	// Save to database
	if err := h.db.DB.Create(&newPM).Error; err != nil {
		log.Printf("Failed to save payment method: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to save payment method",
		})
	}

	return c.JSON(newPM.ToResponse())
}

// GetPaymentMethods возвращает список сохраненных карт пользователя
func (h *StripeHandler) GetPaymentMethods(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var paymentMethods []models.PaymentMethod
	err := h.db.DB.Where("user_id = ?", userID).
		Order("is_default DESC, created_at DESC").
		Find(&paymentMethods).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get payment methods",
		})
	}

	// Convert to response format
	result := make([]models.PaymentMethodResponse, 0, len(paymentMethods))
	for _, pm := range paymentMethods {
		result = append(result, pm.ToResponse())
	}

	return c.JSON(fiber.Map{
		"paymentMethods": result,
	})
}

// DeletePaymentMethod удаляет сохраненную карту
func (h *StripeHandler) DeletePaymentMethod(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	paymentMethodID := c.Params("id")

	// Get payment method
	var pm models.PaymentMethod
	err := h.db.DB.Where("id = ? AND user_id = ?", paymentMethodID, userID).
		First(&pm).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "Payment method not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get payment method",
		})
	}

	// Detach payment method from Stripe
	_, err = paymentmethod.Detach(pm.StripePaymentMethodID, nil)
	if err != nil {
		log.Printf("Failed to detach payment method from Stripe: %v", err)
		// Continue with deletion even if Stripe detach fails
	}

	// Delete from database
	if err := h.db.DB.Delete(&pm).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete payment method",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Payment method deleted successfully",
	})
}

// SetDefaultPaymentMethod устанавливает карту как основную
func (h *StripeHandler) SetDefaultPaymentMethod(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	paymentMethodID := c.Params("id")

	// Get payment method
	var pm models.PaymentMethod
	err := h.db.DB.Where("id = ? AND user_id = ?", paymentMethodID, userID).
		First(&pm).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "Payment method not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get payment method",
		})
	}

	// Start transaction
	tx := h.db.DB.Begin()

	// Unset other default payment methods
	if err := tx.Model(&models.PaymentMethod{}).
		Where("user_id = ?", userID).
		Update("is_default", false).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update payment methods",
		})
	}

	// Set this payment method as default
	pm.IsDefault = true
	pm.UpdatedAt = time.Now()
	if err := tx.Save(&pm).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to set default payment method",
		})
	}

	tx.Commit()

	return c.JSON(pm.ToResponse())
}

// GetUserSubscriptions returns user's active subscriptions
func (h *StripeHandler) GetUserSubscriptions(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var subscriptions []models.Subscription
	err := h.db.DB.Where("subscriber_id = ? AND status = ?", userID, "active").
		Preload("Creator").
		Find(&subscriptions).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get subscriptions",
		})
	}

	// Format response
	result := make([]fiber.Map, 0, len(subscriptions))
	for _, sub := range subscriptions {
		result = append(result, fiber.Map{
			"id":         sub.ID,
			"creator_id": sub.CreatorID,
			"status":     sub.Status,
			"created_at": sub.CreatedAt,
			"creator": fiber.Map{
				"id":           sub.Creator.ID,
				"username":     sub.Creator.Username,
				"display_name": sub.Creator.DisplayName,
				"avatar_url":   sub.Creator.AvatarURL,
			},
		})
	}

	return c.JSON(result)
}

// ChargeSavedCard создает и подтверждает платеж с сохраненным payment method
func (h *StripeHandler) ChargeSavedCard(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req struct {
		PaymentMethodID string            `json:"payment_method_id"`
		PostID          *string           `json:"post_id,omitempty"` // Optional if using metadata.authorId
		Amount          *int              `json:"amount,omitempty"`  // Optional amount in cents
		Description     *string           `json:"description,omitempty"`
		Type            string            `json:"type"`               // "unlock" или "subscribe"
		Metadata        map[string]string `json:"metadata,omitempty"` // For direct subscription via authorId
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify payment method belongs to this user
	var pm models.PaymentMethod
	err := h.db.DB.Where("id = ? AND user_id = ?", req.PaymentMethodID, userID).
		First(&pm).Error
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Payment method not found",
		})
	}

	// Determine author (creator) ID
	var authorID uuid.UUID
	var postAuthor models.User

	// ⭐ Support direct subscription via metadata.authorId
	if req.Metadata != nil && req.Metadata["authorId"] != "" {
		// Direct subscription (ProfilePaywall flow)
		var err error
		authorID, err = uuid.Parse(req.Metadata["authorId"])
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid authorId in metadata",
			})
		}

		if err := h.db.DB.Where("id = ?", authorID).First(&postAuthor).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Author not found",
			})
		}
	} else if req.PostID != nil {
		// Post-based subscription (old flow)
		var post models.Post
		if err := h.db.DB.Where("id = ?", *req.PostID).First(&post).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Post not found",
			})
		}

		// Check ownership
		if post.UserID == userID.(uuid.UUID) {
			return c.Status(400).JSON(fiber.Map{
				"error": "You cannot purchase your own content",
			})
		}

		authorID = post.UserID
		if err := h.db.DB.Where("id = ?", authorID).First(&postAuthor).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Author not found",
			})
		}
	} else {
		return c.Status(400).JSON(fiber.Map{
			"error": "Either post_id or metadata.authorId required",
		})
	}

	// Check if not purchasing from self
	if authorID == userID.(uuid.UUID) {
		return c.Status(400).JSON(fiber.Map{
			"error": "You cannot purchase from yourself",
		})
	}

	// ⭐ Calculate amount and description
	var amountCents int64
	var description string

	// Use custom amount if provided (for promotional pricing)
	if req.Amount != nil && *req.Amount > 0 {
		amountCents = int64(*req.Amount)
	}

	// Use custom description if provided
	if req.Description != nil && *req.Description != "" {
		description = *req.Description
	}

	switch req.Type {
	case "unlock":
		if req.PostID == nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "post_id required for unlock",
			})
		}
		var post models.Post
		h.db.DB.Where("id = ?", *req.PostID).First(&post)

		if amountCents == 0 {
			if post.PriceCents == 0 {
				return c.Status(400).JSON(fiber.Map{
					"error": "Post price not set",
				})
			}
			amountCents = int64(post.PriceCents)
		}
		if description == "" {
			description = fmt.Sprintf("Unlock post #%s", *req.PostID)
		}

	case "subscribe":
		// ⭐ Use promotional pricing if available
		if amountCents == 0 {
			if postAuthor.SubscriptionDiscountPrice > 0 {
				amountCents = int64(postAuthor.SubscriptionDiscountPrice)
			} else if postAuthor.SubscriptionPrice > 0 {
				amountCents = int64(postAuthor.SubscriptionPrice * 100)
			} else {
				return c.Status(400).JSON(fiber.Map{
					"error": "Subscription price not set",
				})
			}
		}
		if description == "" {
			description = fmt.Sprintf("Subscribe to %s", postAuthor.DisplayName)
		}

	default:
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid payment type",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get user data",
		})
	}

	// Create PaymentIntent with saved payment method
	params := &stripe.PaymentIntentParams{
		Amount:        stripe.Int64(amountCents),
		Currency:      stripe.String(string(stripe.CurrencyUSD)),
		Description:   stripe.String(description),
		Customer:      stripe.String(*user.StripeCustomerID),
		PaymentMethod: stripe.String(pm.StripePaymentMethodID),
		Confirm:       stripe.Bool(true), // Immediately confirm
		OffSession:    stripe.Bool(true), // Allow off-session payment
		ReceiptEmail:  stripe.String(user.Email),
	}

	// Add metadata
	params.AddMetadata("user_id", userID.(uuid.UUID).String())
	if req.PostID != nil {
		params.AddMetadata("post_id", *req.PostID)
	}
	params.AddMetadata("author_id", authorID.String())
	params.AddMetadata("type", req.Type)

	// Add custom metadata if provided
	if req.Metadata != nil {
		for key, value := range req.Metadata {
			params.AddMetadata(key, value)
		}
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		log.Printf("Failed to create payment intent: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process payment",
		})
	}

	// Check payment status
	if pi.Status == stripe.PaymentIntentStatusSucceeded {
		// Payment succeeded - save purchase/subscription
		if req.Type == "unlock" && req.PostID != nil {
			postID := uuid.MustParse(*req.PostID)
			purchase := models.PostPurchase{
				ID:                    uuid.New(),
				UserID:                userID.(uuid.UUID),
				PostID:                postID,
				AmountCents:           amountCents,
				StripePaymentIntentID: pi.ID,
				PurchasedAt:           time.Now(),
			}
			h.db.DB.Create(&purchase)

			// Create notification
			fromUserUUID := userID.(uuid.UUID)
			notification := models.Notification{
				ID:         uuid.New(),
				UserID:     authorID,
				Type:       "post_purchased",
				PostID:     &postID,
				FromUserID: &fromUserUUID,
				CreatedAt:  time.Now(),
			}
			h.db.DB.Create(&notification)
		} else if req.Type == "subscribe" {
			// ⭐ Create subscription with expires_at
			var subscriptionDays int
			if postAuthor.SubscriptionDiscountDays > 0 {
				subscriptionDays = postAuthor.SubscriptionDiscountDays
			} else {
				subscriptionDays = 30 // Default 30 days
			}

			expiresAt := time.Now().Add(time.Duration(subscriptionDays) * 24 * time.Hour)

			subscription := models.Subscription{
				ID:                   uuid.New(),
				SubscriberID:         userID.(uuid.UUID),
				CreatorID:            authorID,
				Status:               "active",
				PriceCents:           int(amountCents),
				StripeSubscriptionID: &pi.ID,
				CurrentPeriodEnd:     expiresAt, // ⭐ Set expiration date
				CreatedAt:            time.Now(),
			}

			if err := h.db.DB.Create(&subscription).Error; err != nil {
				// If subscription already exists, update it
				log.Printf("[ChargeSavedCard] Subscription may exist, updating: %v", err)
				h.db.DB.Model(&models.Subscription{}).
					Where("subscriber_id = ? AND creator_id = ?", userID, authorID).
					Updates(map[string]interface{}{
						"status":                 "active",
						"current_period_end":     expiresAt,
						"price_cents":            amountCents,
						"stripe_subscription_id": pi.ID,
						"updated_at":             time.Now(),
					})
			} else {
				log.Printf("[ChargeSavedCard] ✅ Subscription created: %s -> %s (expires: %s)",
					userID.(uuid.UUID), authorID, expiresAt.Format(time.RFC3339))
			}

			// Create notification
			fromUserUUID := userID.(uuid.UUID)
			notification := models.Notification{
				ID:         uuid.New(),
				UserID:     authorID,
				Type:       "new_subscriber",
				FromUserID: &fromUserUUID,
				CreatedAt:  time.Now(),
			}
			h.db.DB.Create(&notification)
		}

		// ⭐ Return success with subscription info
		response := fiber.Map{
			"success":           true,
			"status":            "succeeded",
			"payment_intent_id": pi.ID,
			"paymentIntentId":   pi.ID, // camelCase for frontend
			"amount":            amountCents,
		}

		if req.Type == "subscribe" {
			response["subscription_created"] = true
		}

		return c.JSON(response)
	} else if pi.Status == stripe.PaymentIntentStatusRequiresAction {
		// 3D Secure required
		return c.JSON(fiber.Map{
			"status":        "requires_action",
			"client_secret": pi.ClientSecret,
		})
	} else {
		return c.JSON(fiber.Map{
			"status": pi.Status,
			"error":  "Payment failed",
		})
	}
}

// CancelSubscription cancels an active subscription
func (h *StripeHandler) CancelSubscription(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	subscriptionID := c.Params("id")

	// Get subscription
	var subscription models.Subscription
	err := h.db.DB.Where("id = ? AND subscriber_id = ?", subscriptionID, userID).
		First(&subscription).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "Subscription not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get subscription",
		})
	}

	// Update subscription status
	subscription.Status = "cancelled"
	subscription.UpdatedAt = &time.Time{}
	*subscription.UpdatedAt = time.Now()

	if err := h.db.DB.Save(&subscription).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to cancel subscription",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Subscription cancelled successfully",
	})
}

// GetAllPurchases возвращает историю всех покупок пользователя для billing page
func (h *StripeHandler) GetAllPurchases(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get all post purchases
	var postPurchases []models.PostPurchase
	h.db.DB.Where("user_id = ?", userID).
		Order("purchased_at DESC").
		Find(&postPurchases)

	// Convert to generic purchase format
	type PurchaseItem struct {
		ID           string    `json:"id"`
		PostID       *string   `json:"postId,omitempty"`
		AuthorID     string    `json:"authorId"`
		Amount       int64     `json:"amount"`
		Currency     string    `json:"currency"`
		Status       string    `json:"status"`
		PurchaseType string    `json:"purchaseType"`
		CreatedAt    time.Time `json:"createdAt"`
	}

	purchases := make([]PurchaseItem, 0)

	// Add post purchases
	for _, pp := range postPurchases {
		postIDStr := pp.PostID.String()
		purchases = append(purchases, PurchaseItem{
			ID:           pp.ID.String(),
			PostID:       &postIDStr,
			AuthorID:     pp.PostID.String(), // This would need post author lookup
			Amount:       pp.AmountCents,
			Currency:     "usd",
			Status:       "completed",
			PurchaseType: "post",
			CreatedAt:    pp.PurchasedAt,
		})
	}

	return c.JSON(fiber.Map{
		"purchases": purchases,
	})
}
