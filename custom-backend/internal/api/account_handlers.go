package api

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/x18-backend/internal/cache"
	"github.com/yourusername/x18-backend/internal/services"
	"gorm.io/gorm"
)

// AccountHandler handles account lifecycle operations
type AccountHandler struct {
	db             *gorm.DB
	cache          *cache.Cache
	accountService *services.AccountService
}

// NewAccountHandler creates a new account handler
func NewAccountHandler(db *gorm.DB, cache *cache.Cache) *AccountHandler {
	return &AccountHandler{
		db:             db,
		cache:          cache,
		accountService: services.NewAccountService(db, cache),
	}
}

// DeactivateAccount deactivates user account with 30-day recovery period
//
// POST /api/account/deactivate
// Body: { "reason": "optional reason for deactivation" }
//
// This endpoint:
// 1. Marks the account as deactivated
// 2. Schedules deletion for 30 days from now
// 3. User can still log in during recovery period to restore account
// 4. After 30 days, cleanup service will permanently delete the account
//
// Response:
//
//	{
//	  "message": "Account deactivated successfully",
//	  "deletion_date": "2024-02-15T10:30:00Z",
//	  "days_until_deletion": 30
//	}
func (h *AccountHandler) DeactivateAccount(c *fiber.Ctx) error {
	// Get user from context (set by auth middleware)
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Parse request body (optional reason)
	var req struct {
		Reason string `json:"reason"`
	}
	// Body is optional, so we don't fail if parsing errors
	c.BodyParser(&req)

	// Deactivate the account
	deletionDate, err := h.accountService.DeactivateAccount(userID, req.Reason)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Calculate days until deletion
	daysUntilDeletion := 30

	return c.JSON(fiber.Map{
		"message":             "Account deactivated successfully. You have 30 days to restore your account.",
		"deletion_date":       deletionDate,
		"days_until_deletion": daysUntilDeletion,
	})
}

// RestoreAccount restores a deactivated account during recovery period
//
// POST /api/account/restore
//
// This endpoint:
// 1. Checks if account is deactivated
// 2. Verifies recovery period hasn't expired (30 days)
// 3. Restores the account if within recovery period
//
// Response:
//
//	{
//	  "message": "Account restored successfully"
//	}
func (h *AccountHandler) RestoreAccount(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Restore the account
	if err := h.accountService.RestoreAccount(userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Account restored successfully. Welcome back!",
	})
}

// GetRecoveryInfo returns information about account recovery status
//
// GET /api/account/recovery-info
//
// This endpoint returns:
// - Whether account is deactivated
// - When it was deactivated
// - When it will be permanently deleted
// - Days remaining in recovery period
//
// Response:
//
//	{
//	  "is_deactivated": true,
//	  "deactivated_at": "2024-01-15T10:30:00Z",
//	  "deletion_scheduled_at": "2024-02-15T10:30:00Z",
//	  "days_remaining": 25
//	}
func (h *AccountHandler) GetRecoveryInfo(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Check if account is deactivated
	isDeactivated, _, err := h.accountService.IsAccountDeactivated(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// If not deactivated, return simple response
	if !isDeactivated {
		return c.JSON(fiber.Map{
			"is_deactivated": false,
		})
	}

	// Get detailed recovery info
	deactivatedAt, deletionScheduledAt, daysRemaining, err := h.accountService.GetAccountRecoveryInfo(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"is_deactivated":        true,
		"deactivated_at":        deactivatedAt,
		"deletion_scheduled_at": deletionScheduledAt,
		"days_remaining":        daysRemaining,
		"message":               fmt.Sprintf("You have %d days to restore your account before permanent deletion.", daysRemaining),
	})
}
