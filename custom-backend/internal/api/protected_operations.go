package api

import (
	"custom-backend/configs"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/internal/services"
	"custom-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ProtectedOperationsHandler handles operations that require TOTP verification
type ProtectedOperationsHandler struct {
	db     *database.Database
	cache  *cache.Cache
	config *configs.Config
}

func NewProtectedOperationsHandler(db *database.Database, cache *cache.Cache, config *configs.Config) *ProtectedOperationsHandler {
	return &ProtectedOperationsHandler{
		db:     db,
		cache:  cache,
		config: config,
	}
}

// ChangePassword handles password change with TOTP verification
// POST /api/auth/password/change
// Requires: X-TOTP-Code header if user has TOTP enabled
func (h *ProtectedOperationsHandler) ChangePassword(c *fiber.Ctx) error {
	type ChangePasswordRequest struct {
		CurrentPassword string `json:"current_password" validate:"required"`
		NewPassword     string `json:"new_password" validate:"required,min=8"`
	}

	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user from context (set by auth middleware)
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Verify current password
	if !utils.CheckPassword(req.CurrentPassword, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Current password is incorrect",
		})
	}

	// Validate new password strength
	if valid, msg := utils.ValidatePassword(req.NewPassword); !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": msg,
		})
	}

	// Check if new password is same as current
	if req.CurrentPassword == req.NewPassword {
		return c.Status(400).JSON(fiber.Map{
			"error": "New password must be different from current password",
		})
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process password",
		})
	}

	// Update password
	if err := h.db.DB.Model(&user).Update("password", hashedPassword).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update password",
		})
	}

	// SECURITY: Revoke all sessions except current one
	// This forces logout on all other devices for security
	sessionService := services.NewSessionService(h.db.DB, h.cache)

	// Get current session ID from JWT context
	currentSessionID := c.Locals("sessionID")
	if currentSessionID != nil {
		// Parse session ID string to UUID
		if sessionUUID, parseErr := uuid.Parse(currentSessionID.(string)); parseErr == nil {
			// Revoke all OTHER sessions
			sessionService.RevokeAllSessionsExceptCurrent(user.ID, sessionUUID)
		} else {
			// Fallback: revoke all if can't parse
			sessionService.RevokeAllSessions(user.ID)
		}
	} else {
		// No session ID in context - revoke all sessions
		sessionService.RevokeAllSessions(user.ID)
	}

	return c.JSON(fiber.Map{
		"message": "Password changed successfully. All other devices have been logged out.",
	})
}

// ChangeEmail handles email change with TOTP verification
// POST /api/user/email/change
// Requires: X-TOTP-Code header if user has TOTP enabled
func (h *ProtectedOperationsHandler) ChangeEmail(c *fiber.Ctx) error {
	type ChangeEmailRequest struct {
		NewEmail        string `json:"new_email" validate:"required,email"`
		CurrentPassword string `json:"current_password" validate:"required"`
	}

	var req ChangeEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Verify password
	if !utils.CheckPassword(req.CurrentPassword, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Password is incorrect",
		})
	}

	// Validate email format
	if !utils.ValidateEmail(req.NewEmail) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid email format",
		})
	}

	// Check if email is same as current
	if req.NewEmail == user.Email {
		return c.Status(400).JSON(fiber.Map{
			"error": "New email must be different from current email",
		})
	}

	// Check if email is already taken
	var existingUser models.User
	if err := h.db.DB.Where("email = ? AND id != ?", req.NewEmail, userID).First(&existingUser).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Email is already taken",
		})
	}

	// Update email and mark as unverified
	updates := map[string]interface{}{
		"email":             req.NewEmail,
		"is_email_verified": false,
	}

	if err := h.db.DB.Model(&user).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update email",
		})
	}

	// Generate verification code for new email
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	code, err := securityService.GenerateVerificationCode(
		user.ID,
		models.VerificationTypeEmail,
		models.VerificationMethodEmail,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate verification code",
		})
	}

	// TODO: Send verification email to new address
	// For now, include in response (remove in production!)
	return c.JSON(fiber.Map{
		"message":    "Email changed successfully. Please verify your new email.",
		"new_email":  req.NewEmail,
		"debug_code": code.Code, // REMOVE IN PRODUCTION
	})
}

// ChangePhone handles phone change with TOTP verification
// POST /api/user/phone/change
// Requires: X-TOTP-Code header if user has TOTP enabled
func (h *ProtectedOperationsHandler) ChangePhone(c *fiber.Ctx) error {
	type ChangePhoneRequest struct {
		NewPhone        string `json:"new_phone" validate:"required"`
		CurrentPassword string `json:"current_password" validate:"required"`
	}

	var req ChangePhoneRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Verify password
	if !utils.CheckPassword(req.CurrentPassword, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Password is incorrect",
		})
	}

	// Validate phone format
	if valid, msg := utils.ValidatePhone(req.NewPhone); !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": msg,
		})
	}

	// Check if phone is same as current
	if req.NewPhone == user.Phone {
		return c.Status(400).JSON(fiber.Map{
			"error": "New phone must be different from current phone",
		})
	}

	// Check if phone is already taken
	var existingUser models.User
	if err := h.db.DB.Where("phone = ? AND id != ?", req.NewPhone, userID).First(&existingUser).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Phone number is already taken",
		})
	}

	// Update phone and mark as unverified
	updates := map[string]interface{}{
		"phone":             req.NewPhone,
		"is_phone_verified": false,
	}

	if err := h.db.DB.Model(&user).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update phone",
		})
	}

	// Generate verification code for new phone
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	code, err := securityService.GenerateVerificationCode(
		user.ID,
		models.VerificationTypePhone,
		models.VerificationMethodSMS,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate verification code",
		})
	}

	// TODO: Send verification SMS to new phone
	// For now, include in response (remove in production!)
	return c.JSON(fiber.Map{
		"message":    "Phone changed successfully. Please verify your new phone number.",
		"new_phone":  req.NewPhone,
		"debug_code": code.Code, // REMOVE IN PRODUCTION
	})
}
