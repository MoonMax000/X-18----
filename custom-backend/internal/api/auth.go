package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/yourusername/x18-backend/configs"
	"github.com/yourusername/x18-backend/internal/auth"
	"github.com/yourusername/x18-backend/internal/cache"
	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/internal/models"
	"github.com/yourusername/x18-backend/pkg/utils"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db     *database.Database
	cache  *cache.Cache
	config *configs.Config
}

func NewAuthHandler(db *database.Database, cache *cache.Cache, config *configs.Config) *AuthHandler {
	return &AuthHandler{
		db:     db,
		cache:  cache,
		config: config,
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
	RefreshToken string        `json:"refresh_token"`
	TokenType    string        `json:"token_type"`
	ExpiresIn    int64         `json:"expires_in"`
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

	// Store refresh token in database
	refreshTokenHash, _ := utils.HashPassword(tokens.RefreshToken)
	session := models.Session{
		UserID:           user.ID,
		RefreshTokenHash: refreshTokenHash,
		ExpiresAt:        time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour),
	}
	h.db.DB.Create(&session)

	return c.Status(201).JSON(AuthResponse{
		User:         user.ToMe(),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    tokens.ExpiresIn,
	})
}

// Login handles user login
// POST /api/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find user by email
	var user models.User
	if err := h.db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid email or password",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	// Verify password
	if !utils.CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid email or password",
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

	// Store refresh token in database
	refreshTokenHash, _ := utils.HashPassword(tokens.RefreshToken)
	session := models.Session{
		UserID:           user.ID,
		RefreshTokenHash: refreshTokenHash,
		ExpiresAt:        time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour),
	}
	h.db.DB.Create(&session)

	// Update last active
	now := time.Now()
	user.LastActiveAt = &now
	h.db.DB.Save(&user)

	return c.JSON(AuthResponse{
		User:         user.ToMe(),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    tokens.ExpiresIn,
	})
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

	return c.JSON(fiber.Map{
		"message": "Logged out successfully",
	})
}

// RefreshToken handles token refresh
// POST /api/auth/refresh
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}

	var req RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate refresh token
	userID, err := auth.ValidateRefreshToken(req.RefreshToken, h.config.JWT.RefreshSecret)
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

	return c.JSON(fiber.Map{
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
		"token_type":    "Bearer",
		"expires_in":    tokens.ExpiresIn,
	})
}
