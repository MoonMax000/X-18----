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
	// For now, we'll create a new customer each time
	// In production, you'd want to store and retrieve customer IDs

	// Create new customer in Stripe
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
	}
	params.AddMetadata("user_id", userID.String())

	customer, err := customer.New(params)
	if err != nil {
		return "", err
	}

	return customer.ID, nil
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
