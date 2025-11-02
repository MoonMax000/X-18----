package api

import (
	"custom-backend/internal/database"
	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ReferralHandler struct {
	db *database.Database
}

func NewReferralHandler(db *database.Database) *ReferralHandler {
	return &ReferralHandler{db: db}
}

// GetReferralStats возвращает статистику рефералов пользователя
// GET /api/referrals/stats
func (h *ReferralHandler) GetReferralStats(c *fiber.Ctx) error {
	userIDVal := c.Locals("userID")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var stats models.ReferralStats

	// Получаем статистику из БД
	h.db.DB.Raw(`
		SELECT 
			COUNT(*) as total_invites,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_invites,
			COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invites
		FROM referral_invitations
		WHERE referrer_id = ?
	`, userID).Scan(&stats)

	// Получаем общий заработок
	h.db.DB.Raw(`
		SELECT COALESCE(SUM(reward_amount), 0) as total_earnings
		FROM referral_rewards
		WHERE user_id = ? AND status = 'credited'
	`, userID).Scan(&stats)

	// Вычисляем текущий тир
	if stats.CompletedInvites >= 11 {
		stats.CurrentTier = 3
		stats.NextTierProgress = 0
	} else if stats.CompletedInvites >= 6 {
		stats.CurrentTier = 2
		stats.NextTierProgress = 11 - stats.CompletedInvites
	} else {
		stats.CurrentTier = 1
		stats.NextTierProgress = 6 - stats.CompletedInvites
	}

	return c.JSON(stats)
}

// GetReferralCode возвращает реферальный код пользователя
// GET /api/referrals/code
func (h *ReferralHandler) GetReferralCode(c *fiber.Ctx) error {
	userIDVal := c.Locals("userID")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var code models.ReferralCode
	if err := h.db.DB.Where("user_id = ?", userID).First(&code).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Referral code not found"})
	}

	return c.JSON(code)
}

// GetReferralInvitations возвращает список приглашений пользователя
// GET /api/referrals/invitations?status=active
func (h *ReferralHandler) GetReferralInvitations(c *fiber.Ctx) error {
	userIDVal := c.Locals("userID")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	status := c.Query("status", "")

	query := h.db.DB.Where("referrer_id = ?", userID)
	if status == "active" {
		query = query.Where("status IN ?", []string{"pending", "completed"})
	} else if status == "inactive" {
		query = query.Where("status = ?", "rewarded")
	}

	var invitations []models.ReferralInvitation
	if err := query.Order("created_at DESC").Find(&invitations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch invitations"})
	}

	return c.JSON(fiber.Map{
		"invitations": invitations,
		"total":       len(invitations),
	})
}
