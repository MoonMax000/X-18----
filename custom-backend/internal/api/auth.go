package api

import (
	"fmt"
	"log"
	"time"

	"custom-backend/configs"
	"custom-backend/internal/auth"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/internal/services"
	"custom-backend/pkg/email"
	"custom-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db          *database.Database
	cache       *cache.Cache
	config      *configs.Config
	emailClient email.EmailClient
}

func NewAuthHandler(db *database.Database, cache *cache.Cache, config *configs.Config, emailClient email.EmailClient) *AuthHandler {
	return &AuthHandler{
		db:          db,
		cache:       cache,
		config:      config,
		emailClient: emailClient,
	}
}

// RegisterRequest represents registration request body
type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// LoginRequest represents login request body
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	User         models.MeUser `json:"user"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token,omitempty"` // Deprecated: только для обратной совместимости
	TokenType    string        `json:"token_type"`
	ExpiresIn    int64         `json:"expires_in"`
	SessionID    uuid.UUID     `json:"session_id,omitempty"`
}

// Register handles user registration
// POST /api/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate email format
	if !utils.ValidateEmail(req.Email) {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid email format",
		})
	}

	// Validate username
	if valid, msg := utils.ValidateUsername(req.Username); !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": msg,
		})
	}

	// Validate password strength
	if valid, msg := utils.ValidatePassword(req.Password); !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": msg,
		})
	}

	// Check if username exists
	var existingUser models.User
	if err := h.db.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Username already taken",
		})
	}

	// Check if email exists
	if err := h.db.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Email already registered",
		})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process password",
		})
	}

	// Create user
	user := models.User{
		Username:    req.Username,
		Email:       req.Email,
		Password:    hashedPassword,
		DisplayName: req.Username, // Default display name
	}

	if err := h.db.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Generate unique referral code for the new user
	referralCode := models.ReferralCode{
		ID:        uuid.New(),
		UserID:    user.ID,
		Code:      utils.GenerateReferralCode(),
		TotalUses: 0,
		IsActive:  true,
	}

	if err := h.db.DB.Create(&referralCode).Error; err != nil {
		log.Printf("Failed to create referral code: %v", err)
		// Don't fail registration if referral code creation fails
	}

	// Generate email verification code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	verificationCode, err := securityService.GenerateVerificationCode(
		user.ID,
		models.VerificationTypeEmail,
		models.VerificationMethodEmail,
	)
	if err != nil {
		log.Printf("Failed to generate verification code: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate verification code",
		})
	}

	// Send verification email
	if h.emailClient != nil {
		if err := h.emailClient.SendVerificationEmail(user.Email, verificationCode.Code); err != nil {
			log.Printf("Failed to send verification email: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to send verification email",
			})
		}
	} else {
		return c.Status(500).JSON(fiber.Map{
			"error": "Email service not configured",
		})
	}

	// НЕ генерируем токены - возвращаем требование email verification
	return c.Status(201).JSON(fiber.Map{
		"user":                        user.ToMe(),
		"requires_email_verification": true,
		"message":                     "Please check your email for verification code",
	})
}

// Login handles user login with security features
// POST /api/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get client IP and user agent
	ipAddress := services.GetClientIP(c)
	userAgent := c.Get("User-Agent")

	// Initialize security service
	securityService := services.NewSecurityService(h.db.DB, h.cache)

	// Check for lockouts first
	isLocked, lockoutType, blockedUntil := securityService.CheckLockouts(req.Email, ipAddress)
	if isLocked {
		var message string
		if lockoutType == "ip_blocked" {
			message = fmt.Sprintf("IP address is blocked until %s", blockedUntil.Format("15:04:05"))
		} else {
			message = fmt.Sprintf("Account is locked until %s", blockedUntil.Format("15:04:05"))
		}

		// Record failed attempt
		securityService.RecordLoginAttempt(req.Email, ipAddress, userAgent, false, lockoutType)

		return c.Status(403).JSON(fiber.Map{
			"error":        message,
			"locked_until": blockedUntil,
		})
	}

	// Find user by email
	var user models.User
	if err := h.db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Record failed attempt for unknown user
			securityService.RecordLoginAttempt(req.Email, ipAddress, userAgent, false, "user_not_found")

			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid email or password",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	// Check if account is soft deleted
	if user.IsDeleted {
		return c.Status(403).JSON(fiber.Map{
			"error":                 "Account has been deleted",
			"deletion_requested_at": user.DeletionRequestedAt,
		})
	}

	// Verify password
	if !utils.CheckPassword(req.Password, user.Password) {
		// Record failed attempt
		securityService.RecordLoginAttempt(req.Email, ipAddress, userAgent, false, "wrong_password")

		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Check if 2FA is enabled
	if user.Is2FAEnabled {
		// Generate and send 2FA code
		code, err := securityService.GenerateVerificationCode(
			user.ID,
			models.VerificationType2FA,
			models.VerificationMethod(user.VerificationMethod),
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to generate 2FA code",
			})
		}

		// Send 2FA code via email if method is email
		if user.VerificationMethod == "email" && h.emailClient != nil {
			if err := h.emailClient.Send2FAEmail(user.Email, code.Code); err != nil {
				log.Printf("Failed to send 2FA email: %v", err)
			}
		}

		return c.Status(200).JSON(fiber.Map{
			"requires_2fa":        true,
			"verification_method": user.VerificationMethod,
		})
	}

	// Generate tokens
	tokens, err := auth.GenerateTokenPair(
		user.ID,
		user.Username,
		user.Email,
		user.Role, // Добавляем роль
		h.config.JWT.AccessSecret,
		h.config.JWT.RefreshSecret,
		h.config.JWT.AccessExpiry,
		h.config.JWT.RefreshExpiry,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Create enhanced session
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	refreshTokenHash, _ := utils.HashPassword(tokens.RefreshToken)
	expiresAt := time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour)

	session, err := sessionService.CreateSession(user.ID, c, refreshTokenHash, expiresAt)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	// Record successful login
	securityService.RecordLoginAttempt(req.Email, ipAddress, userAgent, true, "")

	// Update last active
	now := time.Now()
	user.LastActiveAt = &now
	h.db.DB.Save(&user)

	// Устанавливаем refresh token в HttpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   86400 * h.config.JWT.RefreshExpiry,
		Path:     "/",
	})

	// Проверяем заголовок для обратной совместимости
	includeRefreshToken := c.Get("X-Include-Refresh-Token") == "true"

	// Создаем ответ БЕЗ refresh_token
	response := fiber.Map{
		"user":         user.ToMe(),
		"access_token": tokens.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokens.ExpiresIn,
		"session_id":   session.ID,
	}

	// Включаем refresh_token только если клиент явно запросил (для обратной совместимости)
	if includeRefreshToken {
		response["refresh_token"] = tokens.RefreshToken
	}

	return c.JSON(response)
}

// Logout handles user logout
// POST /api/auth/logout
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	// Get user from context (set by auth middleware)
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Delete all user sessions
	h.db.DB.Where("user_id = ?", userID).Delete(&models.Session{})

	// Очищаем refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   -1, // Удаляем cookie
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"message": "Logged out successfully",
	})
}

// Login2FA handles 2FA verification
// POST /api/auth/login/2fa
func (h *AuthHandler) Login2FA(c *fiber.Ctx) error {
	type TwoFactorRequest struct {
		Email string `json:"email" validate:"required,email"`
		Code  string `json:"code" validate:"required,len=6"`
	}

	var req TwoFactorRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find user
	var user models.User
	if err := h.db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Verify 2FA code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	valid, err := securityService.VerifyCode(user.ID, req.Code, models.VerificationType2FA)
	if err != nil || !valid {
		// Record failed 2FA attempt
		ipAddress := services.GetClientIP(c)
		userAgent := c.Get("User-Agent")
		securityService.RecordLoginAttempt(req.Email, ipAddress, userAgent, false, "invalid_2fa_code")

		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid or expired 2FA code",
		})
	}

	// Generate tokens
	tokens, err := auth.GenerateTokenPair(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		h.config.JWT.AccessSecret,
		h.config.JWT.RefreshSecret,
		h.config.JWT.AccessExpiry,
		h.config.JWT.RefreshExpiry,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Create session
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	refreshTokenHash, _ := utils.HashPassword(tokens.RefreshToken)
	expiresAt := time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour)

	session, err := sessionService.CreateSession(user.ID, c, refreshTokenHash, expiresAt)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	// Record successful login with 2FA
	ipAddress := services.GetClientIP(c)
	userAgent := c.Get("User-Agent")
	securityService.RecordLoginAttempt(req.Email, ipAddress, userAgent, true, "2fa_success")

	// Update last active
	now := time.Now()
	user.LastActiveAt = &now
	h.db.DB.Save(&user)

	// Устанавливаем refresh token в HttpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   86400 * h.config.JWT.RefreshExpiry,
		Path:     "/",
	})

	// Проверяем заголовок для обратной совместимости
	includeRefreshToken := c.Get("X-Include-Refresh-Token") == "true"

	// Создаем ответ БЕЗ refresh_token
	response := fiber.Map{
		"user":         user.ToMe(),
		"access_token": tokens.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokens.ExpiresIn,
		"session_id":   session.ID,
	}

	// Включаем refresh_token только если клиент явно запросил (для обратной совместимости)
	if includeRefreshToken {
		response["refresh_token"] = tokens.RefreshToken
	}

	return c.JSON(response)
}

// RefreshToken handles token refresh
// POST /api/auth/refresh
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	// Сначала пробуем получить из cookie
	refreshToken := c.Cookies("refresh_token")

	// Если нет в cookie, пробуем из body (для обратной совместимости)
	if refreshToken == "" {
		type RefreshRequest struct {
			RefreshToken string `json:"refresh_token"`
		}

		var req RefreshRequest
		if err := c.BodyParser(&req); err == nil && req.RefreshToken != "" {
			refreshToken = req.RefreshToken
		}
	}

	if refreshToken == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Refresh token not provided",
		})
	}

	// Validate refresh token
	userID, err := auth.ValidateRefreshToken(refreshToken, h.config.JWT.RefreshSecret)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid refresh token",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Generate new tokens
	tokens, err := auth.GenerateTokenPair(
		user.ID,
		user.Username,
		user.Email,
		user.Role, // Добавляем роль
		h.config.JWT.AccessSecret,
		h.config.JWT.RefreshSecret,
		h.config.JWT.AccessExpiry,
		h.config.JWT.RefreshExpiry,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Update session
	refreshTokenHash, _ := utils.HashPassword(tokens.RefreshToken)
	h.db.DB.Model(&models.Session{}).
		Where("user_id = ?", userID).
		Updates(map[string]interface{}{
			"refresh_token_hash": refreshTokenHash,
			"expires_at":         time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour),
		})

	// Обновляем refresh token в cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   86400 * h.config.JWT.RefreshExpiry,
		Path:     "/",
	})

	// Проверяем заголовок для обратной совместимости
	includeRefreshToken := c.Get("X-Include-Refresh-Token") == "true"

	result := fiber.Map{
		"access_token": tokens.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokens.ExpiresIn,
	}

	// Включаем refresh_token только если клиент явно запросил (для обратной совместимости)
	if includeRefreshToken {
		result["refresh_token"] = tokens.RefreshToken
	}

	return c.JSON(result)
}

// VerifyEmail handles email verification
// POST /api/auth/verify/email
func (h *AuthHandler) VerifyEmail(c *fiber.Ctx) error {
	type VerifyRequest struct {
		Email string `json:"email" validate:"required,email"`
		Code  string `json:"code" validate:"required,len=6"`
	}

	var req VerifyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find user by email
	var user models.User
	if err := h.db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Verify code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	valid, err := securityService.VerifyCode(user.ID, req.Code, models.VerificationTypeEmail)
	if err != nil || !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid or expired verification code",
		})
	}

	// Update user's email verification status
	h.db.DB.Model(&user).Update("is_email_verified", true)

	// Generate tokens after successful verification
	tokens, err := auth.GenerateTokenPair(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		h.config.JWT.AccessSecret,
		h.config.JWT.RefreshSecret,
		h.config.JWT.AccessExpiry,
		h.config.JWT.RefreshExpiry,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Create session
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	refreshTokenHash, _ := utils.HashPassword(tokens.RefreshToken)
	expiresAt := time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour)

	session, err := sessionService.CreateSession(user.ID, c, refreshTokenHash, expiresAt)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	// Update last active
	now := time.Now()
	user.LastActiveAt = &now
	h.db.DB.Save(&user)

	// Set refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   86400 * h.config.JWT.RefreshExpiry,
		Path:     "/",
	})

	// Return tokens
	return c.JSON(fiber.Map{
		"user":         user.ToMe(),
		"access_token": tokens.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokens.ExpiresIn,
		"session_id":   session.ID,
		"message":      "Email verified successfully",
	})
}

// RequestPasswordReset initiates password reset process
// POST /api/auth/password/reset
func (h *AuthHandler) RequestPasswordReset(c *fiber.Ctx) error {
	type ResetRequest struct {
		Email string `json:"email" validate:"required,email"`
	}

	var req ResetRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find user
	var user models.User
	if err := h.db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Don't reveal if email exists
		return c.JSON(fiber.Map{
			"message": "If the email exists, a reset link has been sent",
		})
	}

	// Generate password reset code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	code, err := securityService.GenerateVerificationCode(
		user.ID,
		models.VerificationTypePasswordReset,
		models.VerificationMethodEmail,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate reset code",
		})
	}

	// Send password reset email
	if h.emailClient != nil {
		if err := h.emailClient.SendPasswordResetEmail(user.Email, code.Code); err != nil {
			log.Printf("Failed to send password reset email: %v", err)
		}
	}

	return c.JSON(fiber.Map{
		"message": "If the email exists, a reset link has been sent",
	})
}

// ResetPassword completes password reset process
// POST /api/auth/password/reset/confirm
func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	type ResetConfirmRequest struct {
		Email       string `json:"email" validate:"required,email"`
		Code        string `json:"code" validate:"required,len=6"`
		NewPassword string `json:"new_password" validate:"required,min=8"`
	}

	var req ResetConfirmRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate password strength
	if valid, msg := utils.ValidatePassword(req.NewPassword); !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": msg,
		})
	}

	// Find user
	var user models.User
	if err := h.db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Verify reset code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	valid, err := securityService.VerifyCode(user.ID, req.Code, models.VerificationTypePasswordReset)
	if err != nil || !valid {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid or expired reset code",
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
	h.db.DB.Model(&user).Update("password", hashedPassword)

	// Revoke all existing sessions for security
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	sessionService.RevokeAllSessions(user.ID)

	return c.JSON(fiber.Map{
		"message": "Password reset successfully",
	})
}

// GetSessions returns all active sessions for the authenticated user
// GET /api/auth/sessions
func (h *AuthHandler) GetSessions(c *fiber.Ctx) error {
	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get all active sessions
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	sessions, err := sessionService.GetActiveSessions(userID.(uuid.UUID))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch sessions",
		})
	}

	return c.JSON(fiber.Map{
		"sessions": sessions,
	})
}

// RevokeSession revokes a specific session
// DELETE /api/auth/sessions/:sessionId
func (h *AuthHandler) RevokeSession(c *fiber.Ctx) error {
	sessionID := c.Params("sessionId")
	if sessionID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Session ID required",
		})
	}

	// Get user from context
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Parse session ID
	id, err := uuid.Parse(sessionID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid session ID",
		})
	}

	// Verify session belongs to user
	var session models.Session
	if err := h.db.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Session not found",
		})
	}

	// Revoke session
	h.db.DB.Delete(&session)

	return c.JSON(fiber.Map{
		"message": "Session revoked successfully",
	})
}

// Get2FASettings returns current 2FA settings for user
// GET /api/auth/2fa/settings
func (h *AuthHandler) Get2FASettings(c *fiber.Ctx) error {
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

	return c.JSON(fiber.Map{
		"is_2fa_enabled":      user.Is2FAEnabled,
		"verification_method": user.VerificationMethod,
		"backup_email":        user.BackupEmail,
		"backup_phone":        user.BackupPhone,
		"is_email_verified":   user.IsEmailVerified,
		"is_phone_verified":   user.IsPhoneVerified,
	})
}

// Enable2FA enables two-factor authentication
// POST /api/auth/2fa/enable
func (h *AuthHandler) Enable2FA(c *fiber.Ctx) error {
	type Enable2FARequest struct {
		Method   string `json:"method" validate:"required,oneof=email sms"`
		Password string `json:"password" validate:"required"`
	}

	var req Enable2FARequest
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
	if !utils.CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid password",
		})
	}

	// Check if email/phone is verified based on method
	if req.Method == "email" && !user.IsEmailVerified {
		return c.Status(400).JSON(fiber.Map{
			"error": "Please verify your email first",
		})
	}
	if req.Method == "sms" && !user.IsPhoneVerified {
		return c.Status(400).JSON(fiber.Map{
			"error": "Please verify your phone number first",
		})
	}

	// Generate verification code to confirm 2FA setup
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	code, err := securityService.GenerateVerificationCode(
		user.ID,
		models.VerificationType2FA,
		models.VerificationMethod(req.Method),
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate verification code",
		})
	}

	// Send verification code via email if method is email
	if req.Method == "email" && h.emailClient != nil {
		if err := h.emailClient.Send2FAEmail(user.Email, code.Code); err != nil {
			log.Printf("Failed to send 2FA setup email: %v", err)
		}
	}

	return c.JSON(fiber.Map{
		"message": "Verification code sent. Please confirm to enable 2FA",
		"method":  req.Method,
	})
}

// Confirm2FA confirms and enables 2FA after verification
// POST /api/auth/2fa/confirm
func (h *AuthHandler) Confirm2FA(c *fiber.Ctx) error {
	type Confirm2FARequest struct {
		Code   string `json:"code" validate:"required,len=6"`
		Method string `json:"method" validate:"required,oneof=email sms"`
	}

	var req Confirm2FARequest
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

	// Verify code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	valid, err := securityService.VerifyCode(userID.(uuid.UUID), req.Code, models.VerificationType2FA)
	if err != nil || !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid or expired verification code",
		})
	}

	// Enable 2FA for user
	h.db.DB.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_2fa_enabled":      true,
		"verification_method": req.Method,
	})

	// Generate backup codes (optional, for future implementation)
	// backupCodes := generateBackupCodes()

	return c.JSON(fiber.Map{
		"message": "2FA enabled successfully",
		"method":  req.Method,
		// "backup_codes": backupCodes, // For future implementation
	})
}

// Disable2FA disables two-factor authentication
// POST /api/auth/2fa/disable
func (h *AuthHandler) Disable2FA(c *fiber.Ctx) error {
	type Disable2FARequest struct {
		Password string `json:"password" validate:"required"`
	}

	var req Disable2FARequest
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
	if !utils.CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid password",
		})
	}

	// Disable 2FA
	h.db.DB.Model(&user).Updates(map[string]interface{}{
		"is_2fa_enabled": false,
	})

	return c.JSON(fiber.Map{
		"message": "2FA disabled successfully",
	})
}

// UpdateBackupContact updates backup email or phone for recovery
// POST /api/auth/backup-contact
func (h *AuthHandler) UpdateBackupContact(c *fiber.Ctx) error {
	type UpdateBackupRequest struct {
		BackupEmail string `json:"backup_email,omitempty"`
		BackupPhone string `json:"backup_phone,omitempty"`
		Password    string `json:"password" validate:"required"`
	}

	var req UpdateBackupRequest
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
	if !utils.CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid password",
		})
	}

	// Update backup contacts
	updates := make(map[string]interface{})
	if req.BackupEmail != "" {
		if !utils.ValidateEmail(req.BackupEmail) {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid email format",
			})
		}
		updates["backup_email"] = req.BackupEmail
	}
	if req.BackupPhone != "" {
		// TODO: Validate phone format
		updates["backup_phone"] = req.BackupPhone
	}

	if len(updates) > 0 {
		h.db.DB.Model(&user).Updates(updates)
	}

	return c.JSON(fiber.Map{
		"message": "Backup contact updated successfully",
	})
}

// RequestAccountDeletion initiates soft delete process
// POST /api/auth/delete-account
func (h *AuthHandler) RequestAccountDeletion(c *fiber.Ctx) error {
	type DeleteRequest struct {
		Password string `json:"password" validate:"required"`
		Reason   string `json:"reason,omitempty"`
	}

	var req DeleteRequest
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
	if !utils.CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid password",
		})
	}

	// Mark account for deletion (soft delete)
	now := time.Now()
	h.db.DB.Model(&user).Updates(map[string]interface{}{
		"is_deleted":            true,
		"deletion_requested_at": now,
	})

	// Revoke all sessions
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	sessionService.RevokeAllSessions(user.ID)

	// TODO: Schedule permanent deletion after grace period (30 days)
	// TODO: Send confirmation email

	return c.JSON(fiber.Map{
		"message":       "Account marked for deletion. You have 30 days to restore it.",
		"deletion_date": now.Add(30 * 24 * time.Hour),
	})
}

// ResendVerificationEmail resends verification email to user
// POST /api/auth/resend-verification
func (h *AuthHandler) ResendVerificationEmail(c *fiber.Ctx) error {
	type ResendRequest struct {
		Type string `json:"type" validate:"required,oneof=email password_reset 2fa"`
	}

	var req ResendRequest
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

	// Determine verification type
	var verificationType models.VerificationType
	var emailMethod func(string, string) error

	switch req.Type {
	case "email":
		verificationType = models.VerificationTypeEmail
		emailMethod = h.emailClient.SendVerificationEmail
	case "password_reset":
		verificationType = models.VerificationTypePasswordReset
		emailMethod = h.emailClient.SendPasswordResetEmail
	case "2fa":
		verificationType = models.VerificationType2FA
		emailMethod = h.emailClient.Send2FAEmail
	default:
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid verification type",
		})
	}

	// Generate new verification code
	securityService := services.NewSecurityService(h.db.DB, h.cache)
	code, err := securityService.GenerateVerificationCode(
		user.ID,
		verificationType,
		models.VerificationMethodEmail,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate verification code",
		})
	}

	// Send email if client is configured
	if h.emailClient != nil {
		if err := emailMethod(user.Email, code.Code); err != nil {
			log.Printf("Failed to resend verification email: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to send verification email",
			})
		}
	} else {
		return c.Status(500).JSON(fiber.Map{
			"error": "Email service not configured",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Verification code sent successfully",
	})
}
