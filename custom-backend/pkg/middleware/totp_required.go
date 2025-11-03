package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// TOTPRequired middleware checks if user has TOTP enabled and validates the provided code
// This should be used for sensitive operations like password/email/phone changes
func TOTPRequired(securityService interface {
	VerifyTOTPCode(userID uuid.UUID, code string) (bool, error)
}) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user ID from context (set by auth middleware)
		// JWT middleware sets "userID" (camelCase), not "user_id"
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not authenticated",
			})
		}

		// Check if user has TOTP enabled
		// This is done by checking if they can verify a code (the service will handle this)

		// Get TOTP code from header
		totpCode := c.Get("X-TOTP-Code")
		if totpCode == "" {
			// Also try from query parameter (for some edge cases)
			totpCode = c.Query("totp_code")
		}

		// Clean the code
		totpCode = strings.TrimSpace(totpCode)

		if totpCode == "" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":             "TOTP code required",
				"requires_totp":     true,
				"totp_code_missing": true,
			})
		}

		// Validate the code length
		if len(totpCode) != 6 && len(totpCode) != 10 {
			// 6 digits for TOTP, 10 for backup codes (XXXX-XXXX-XX)
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":         "Invalid TOTP code format",
				"requires_totp": true,
			})
		}

		// Verify the TOTP code
		uid, ok := userID.(uuid.UUID)
		if !ok {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Invalid user ID type",
			})
		}

		valid, err := securityService.VerifyTOTPCode(uid, totpCode)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to verify TOTP code: " + err.Error(),
			})
		}

		if !valid {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":         "Invalid TOTP code",
				"requires_totp": true,
			})
		}

		// TOTP code is valid, proceed to the next handler
		return c.Next()
	}
}

// TOTPOptional middleware checks TOTP only if the user has it enabled
// Returns user's TOTP status in locals for the handler to use
func TOTPOptional(securityService interface {
	GetUserTOTPStatus(userID uint) (bool, error)
	VerifyTOTPCode(userID uint, code string) (bool, error)
}) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user ID from context
		// JWT middleware sets "userID" (camelCase), not "user_id"
		userID := c.Locals("userID")
		if userID == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not authenticated",
			})
		}

		uid, ok := userID.(uint)
		if !ok {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Invalid user ID type",
			})
		}

		// Check if user has TOTP enabled
		totpEnabled, err := securityService.GetUserTOTPStatus(uid)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to check TOTP status",
			})
		}

		// Store TOTP status in locals
		c.Locals("totp_enabled", totpEnabled)

		// If TOTP is not enabled, proceed without checking
		if !totpEnabled {
			return c.Next()
		}

		// TOTP is enabled, check for code
		totpCode := c.Get("X-TOTP-Code")
		if totpCode == "" {
			totpCode = c.Query("totp_code")
		}

		totpCode = strings.TrimSpace(totpCode)

		if totpCode == "" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":         "TOTP code required for this operation",
				"requires_totp": true,
			})
		}

		// Verify the code
		valid, err := securityService.VerifyTOTPCode(uid, totpCode)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to verify TOTP code",
			})
		}

		if !valid {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":         "Invalid TOTP code",
				"requires_totp": true,
			})
		}

		// Code is valid
		c.Locals("totp_verified", true)
		return c.Next()
	}
}
