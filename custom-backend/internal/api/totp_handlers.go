package api

import (
	"encoding/json"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/x18-backend/internal/cache"
	"github.com/yourusername/x18-backend/internal/models"
	"github.com/yourusername/x18-backend/internal/services"
	"github.com/yourusername/x18-backend/pkg/utils"
	"gorm.io/gorm"
)

// TOTPHandler handles TOTP 2FA operations
type TOTPHandler struct {
	db          *gorm.DB
	cache       *cache.Cache
	totpService *services.TOTPService
}

// NewTOTPHandler creates a new TOTP handler
func NewTOTPHandler(db *gorm.DB, cache *cache.Cache) *TOTPHandler {
	return &TOTPHandler{
		db:          db,
		cache:       cache,
		totpService: services.NewTOTPService(db, cache),
	}
}

// GenerateTOTPSecret generates a new TOTP secret and QR code for the user
//
// POST /api/totp/generate
//
// This endpoint:
// 1. Checks if TOTP is already enabled (returns error if yes)
// 2. Generates a new TOTP secret and QR code
// 3. Returns the secret (for manual entry) and QR code (base64 image)
// 4. Does NOT enable TOTP yet - user must verify first
//
// Response:
//
//	{
//	  "secret": "JBSWY3DPEHPK3PXP",
//	  "formatted_secret": "JBSW Y3DP EHPK 3PXP",
//	  "qr_code": "data:image/png;base64,iVBORw0KG...",
//	  "backup_codes": ["ABCD-1234-56", "EFGH-5678-90", ...]
//	}
func (h *TOTPHandler) GenerateTOTPSecret(c *fiber.Ctx) error {
	// Get user from context (set by auth middleware)
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Get user email for TOTP account name
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Generate TOTP secret and QR code
	secret, qrCode, err := h.totpService.GenerateTOTPSecret(userID, user.Email, "TyrianTrade")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Generate backup codes
	backupCodes, err := utils.GenerateBackupCodes(8)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate backup codes",
		})
	}

	// Format secret for display
	formattedSecret := utils.FormatTOTPSecret(secret)

	// Store the secret and backup codes temporarily in cache
	// They will be permanently saved when user verifies and enables TOTP
	cacheKey := fmt.Sprintf("totp_setup:%s", userID.String())
	setupData := map[string]interface{}{
		"secret":       secret,
		"backup_codes": backupCodes,
	}
	setupDataJSON, _ := json.Marshal(setupData)
	h.cache.Set(cacheKey, string(setupDataJSON), 15*60) // 15 minutes

	return c.JSON(fiber.Map{
		"secret":           secret,
		"formatted_secret": formattedSecret,
		"qr_code":          qrCode,
		"backup_codes":     backupCodes,
	})
}

// VerifyAndEnableTOTP verifies a TOTP code and enables 2FA
//
// POST /api/totp/enable
// Body: { "code": "123456" }
//
// This endpoint:
// 1. Retrieves the temporary TOTP secret from cache
// 2. Verifies the provided code against the secret
// 3. If valid, enables TOTP and saves encrypted secret to database
// 4. Clears the temporary cache
//
// Response:
//
//	{
//	  "message": "TOTP 2FA enabled successfully"
//	}
func (h *TOTPHandler) VerifyAndEnableTOTP(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Parse request body
	var req struct {
		Code string `json:"code"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "TOTP code is required",
		})
	}

	// Get temporary secret from cache
	cacheKey := fmt.Sprintf("totp_setup:%s", userID.String())
	setupDataJSON, exists := h.cache.Get(cacheKey)
	if !exists {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No TOTP setup found. Please generate a new secret first.",
		})
	}

	// Parse JSON data
	var setupData map[string]interface{}
	if err := json.Unmarshal([]byte(setupDataJSON), &setupData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse setup data",
		})
	}

	secret := setupData["secret"].(string)

	// Verify the TOTP code
	if !utils.ValidateTOTPCode(req.Code, secret) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid TOTP code. Please try again.",
		})
	}

	// Enable TOTP (this will encrypt and save the secret)
	if err := h.totpService.EnableTOTP(userID, secret); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to enable TOTP: %v", err),
		})
	}

	// TODO: Save hashed backup codes to database
	// For now, user should have saved them from the generate step

	// Clear temporary cache
	h.cache.Delete(cacheKey)

	return c.JSON(fiber.Map{
		"message": "TOTP 2FA enabled successfully",
	})
}

// DisableTOTP disables TOTP 2FA for the user
//
// POST /api/totp/disable
// Body: { "code": "123456" }
//
// This endpoint:
// 1. Verifies the current TOTP code
// 2. If valid, disables TOTP 2FA
// 3. Clears the encrypted secret from database
//
// Response:
//
//	{
//	  "message": "TOTP 2FA disabled successfully"
//	}
func (h *TOTPHandler) DisableTOTP(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Parse request body
	var req struct {
		Code string `json:"code"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "TOTP code is required to disable 2FA",
		})
	}

	// Verify the TOTP code before disabling
	valid, err := h.totpService.VerifyTOTPCode(userID, req.Code)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if !valid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid TOTP code. Cannot disable 2FA.",
		})
	}

	// Disable TOTP
	if err := h.totpService.DisableTOTP(userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to disable TOTP: %v", err),
		})
	}

	return c.JSON(fiber.Map{
		"message": "TOTP 2FA disabled successfully",
	})
}

// VerifyTOTP verifies a TOTP code (used during login or sensitive operations)
//
// POST /api/totp/verify
// Body: { "code": "123456" }
//
// This endpoint verifies a TOTP code for an authenticated user.
// It's used during:
// - Login process (after password verification)
// - Sensitive operations (change email, phone, etc.)
//
// Response:
//
//	{
//	  "valid": true
//	}
func (h *TOTPHandler) VerifyTOTP(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Parse request body
	var req struct {
		Code string `json:"code"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "TOTP code is required",
		})
	}

	// Verify the TOTP code
	valid, err := h.totpService.VerifyTOTPCode(userID, req.Code)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"valid": valid,
	})
}

// GetTOTPStatus returns the current TOTP 2FA status for the user
//
// GET /api/totp/status
//
// Response:
//
//	{
//	  "enabled": true,
//	  "has_backup_codes": true
//	}
func (h *TOTPHandler) GetTOTPStatus(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Get user from database
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// TODO: Check if user has backup codes stored
	hasBackupCodes := false

	return c.JSON(fiber.Map{
		"enabled":          user.TOTPEnabled,
		"has_backup_codes": hasBackupCodes,
	})
}

// RegenerateBackupCodes generates new backup codes
//
// POST /api/totp/backup-codes/regenerate
// Body: { "code": "123456" }
//
// This endpoint:
// 1. Verifies the current TOTP code
// 2. Generates new backup codes
// 3. Invalidates old backup codes
// 4. Returns new backup codes
//
// Response:
//
//	{
//	  "backup_codes": ["ABCD-1234-56", "EFGH-5678-90", ...]
//	}
func (h *TOTPHandler) RegenerateBackupCodes(c *fiber.Ctx) error {
	// Get user from context
	userIDStr := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Parse request body
	var req struct {
		Code string `json:"code"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "TOTP code is required",
		})
	}

	// Verify the TOTP code
	valid, err := h.totpService.VerifyTOTPCode(userID, req.Code)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if !valid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid TOTP code",
		})
	}

	// Generate new backup codes
	backupCodes, err := utils.GenerateBackupCodes(8)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate backup codes",
		})
	}

	// TODO: Hash and save backup codes to database
	// TODO: Invalidate old backup codes

	return c.JSON(fiber.Map{
		"backup_codes": backupCodes,
		"message":      "Backup codes regenerated. Please save them securely.",
	})
}
