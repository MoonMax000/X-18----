package api

import (
	"net/http"
	"time"

	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NewsletterHandler struct {
	DB *gorm.DB
}

func NewNewsletterHandler(db *gorm.DB) *NewsletterHandler {
	return &NewsletterHandler{DB: db}
}

// Subscribe handles newsletter subscription
func (h *NewsletterHandler) Subscribe(c *fiber.Ctx) error {
	var req models.SubscribeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if email is already subscribed
	var existing models.EmailSubscription
	err := h.DB.Where("email = ?", req.Email).First(&existing).Error

	if err == nil {
		// Email exists
		if existing.IsActive {
			return c.Status(http.StatusConflict).JSON(fiber.Map{
				"error": "This email is already subscribed to our newsletter",
			})
		}
		// Re-activate subscription
		existing.IsActive = true
		existing.SubscribedAt = time.Now()
		existing.UnsubscribedAt = nil
		if err := h.DB.Save(&existing).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to reactivate subscription",
			})
		}
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"message": "Successfully subscribed to newsletter",
		})
	}

	// Create new subscription
	subscription := models.EmailSubscription{
		Email:     req.Email,
		IsActive:  true,
		Source:    "footer_form",
		IPAddress: c.IP(),
		UserAgent: c.Get("User-Agent"),
	}

	if err := h.DB.Create(&subscription).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to subscribe",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message": "Successfully subscribed to newsletter",
	})
}

// Unsubscribe handles newsletter unsubscription
func (h *NewsletterHandler) Unsubscribe(c *fiber.Ctx) error {
	var req models.UnsubscribeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var subscription models.EmailSubscription
	if err := h.DB.Where("email = ? AND is_active = ?", req.Email, true).First(&subscription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Subscription not found or already inactive",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process unsubscription",
		})
	}

	now := time.Now()
	subscription.IsActive = false
	subscription.UnsubscribedAt = &now

	if err := h.DB.Save(&subscription).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to unsubscribe",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Successfully unsubscribed from newsletter",
	})
}

// GetAllSubscriptions returns all newsletter subscriptions (admin only)
func (h *NewsletterHandler) GetAllSubscriptions(c *fiber.Ctx) error {
	var subscriptions []models.EmailSubscription

	// Parse query parameters
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 50)
	isActive := c.Query("is_active")

	query := h.DB.Model(&models.EmailSubscription{})

	// Filter by active status if provided
	if isActive == "true" {
		query = query.Where("is_active = ?", true)
	} else if isActive == "false" {
		query = query.Where("is_active = ?", false)
	}

	// Count total records
	var total int64
	query.Count(&total)

	// Apply pagination
	offset := (page - 1) * limit
	if err := query.Order("subscribed_at DESC").Offset(offset).Limit(limit).Find(&subscriptions).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch subscriptions",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"subscriptions": subscriptions,
		"total":         total,
		"page":          page,
		"limit":         limit,
		"total_pages":   (total + int64(limit) - 1) / int64(limit),
	})
}

// GetSubscriptionStats returns subscription statistics (admin only)
func (h *NewsletterHandler) GetSubscriptionStats(c *fiber.Ctx) error {
	var totalActive int64
	var totalInactive int64
	var totalAll int64

	h.DB.Model(&models.EmailSubscription{}).Where("is_active = ?", true).Count(&totalActive)
	h.DB.Model(&models.EmailSubscription{}).Where("is_active = ?", false).Count(&totalInactive)
	h.DB.Model(&models.EmailSubscription{}).Count(&totalAll)

	// Get subscriptions from last 30 days
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	var recentSubscriptions int64
	h.DB.Model(&models.EmailSubscription{}).
		Where("subscribed_at >= ? AND is_active = ?", thirtyDaysAgo, true).
		Count(&recentSubscriptions)

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"total_active":         totalActive,
		"total_inactive":       totalInactive,
		"total_all":            totalAll,
		"recent_subscriptions": recentSubscriptions,
	})
}

// DeleteSubscription deletes a subscription (admin only)
func (h *NewsletterHandler) DeleteSubscription(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subscription ID",
		})
	}

	var subscription models.EmailSubscription
	if err := h.DB.Where("id = ?", id).First(&subscription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"error": "Subscription not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find subscription",
		})
	}

	if err := h.DB.Delete(&subscription).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete subscription",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Subscription deleted successfully",
		"email":   subscription.Email,
	})
}

// ExportSubscriptions exports all active email addresses (admin only)
func (h *NewsletterHandler) ExportSubscriptions(c *fiber.Ctx) error {
	var subscriptions []models.EmailSubscription

	if err := h.DB.Where("is_active = ?", true).
		Order("subscribed_at DESC").
		Find(&subscriptions).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch subscriptions",
		})
	}

	// Extract emails
	emails := make([]string, len(subscriptions))
	for i, sub := range subscriptions {
		emails[i] = sub.Email
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"emails": emails,
		"total":  len(emails),
	})
}
