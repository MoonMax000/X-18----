package api

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	"custom-backend/configs"
	"custom-backend/internal/auth"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/internal/services"
	"custom-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/gorm"
)

type OAuthHandler struct {
	db          *database.Database
	cache       *cache.Cache
	config      *configs.Config
	googleOAuth *oauth2.Config
	appleOAuth  *oauth2.Config
}

func NewOAuthHandler(db *database.Database, cache *cache.Cache, config *configs.Config) *OAuthHandler {
	handler := &OAuthHandler{
		db:     db,
		cache:  cache,
		config: config,
	}

	// Initialize Google OAuth
	if config.OAuth.Google.ClientID != "" {
		handler.googleOAuth = &oauth2.Config{
			ClientID:     config.OAuth.Google.ClientID,
			ClientSecret: config.OAuth.Google.ClientSecret,
			RedirectURL:  config.OAuth.Google.RedirectURL,
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		}
	}

	// Initialize Apple OAuth
	if config.OAuth.Apple.ClientID != "" && config.OAuth.Apple.TeamID != "" && config.OAuth.Apple.KeyID != "" {
		// Parse Apple private key
		privateKey, err := configs.ParseApplePrivateKey(config.OAuth.Apple)
		if err != nil {
			log.Printf("Warning: Failed to parse Apple Private Key: %v", err)
		} else {
			// Generate Apple Client Secret (JWT)
			clientSecret, err := utils.GenerateAppleClientSecret(
				config.OAuth.Apple.TeamID,
				config.OAuth.Apple.KeyID,
				config.OAuth.Apple.ClientID,
				privateKey,
			)
			if err != nil {
				log.Printf("Warning: Failed to generate Apple Client Secret: %v", err)
			} else {
				log.Printf("✅ Apple Client Secret generated successfully")
				handler.appleOAuth = &oauth2.Config{
					ClientID:     config.OAuth.Apple.ClientID,
					ClientSecret: clientSecret,
					RedirectURL:  config.OAuth.Apple.RedirectURL,
					Scopes:       []string{"name", "email"},
					Endpoint: oauth2.Endpoint{
						AuthURL:  "https://appleid.apple.com/auth/authorize",
						TokenURL: "https://appleid.apple.com/auth/token",
					},
				}
			}
		}
	}

	return handler
}

// GoogleUser represents Google user info
type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

// AppleUser represents Apple user info
type AppleUser struct {
	Sub            string `json:"sub"`
	Email          string `json:"email"`
	EmailVerified  string `json:"email_verified"`
	IsPrivateEmail string `json:"is_private_email"`
}

// generateState creates a random state token for OAuth
func generateState() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}

// GoogleLogin initiates Google OAuth flow
// GET /api/auth/google
func (h *OAuthHandler) GoogleLogin(c *fiber.Ctx) error {
	if h.googleOAuth == nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Google OAuth not configured",
		})
	}

	// Generate state token
	state := generateState()

	// Store state in cache with 10 minute expiration
	h.cache.Set(fmt.Sprintf("oauth_state:%s", state), "google", 10*time.Minute)

	// Generate OAuth URL
	url := h.googleOAuth.AuthCodeURL(state, oauth2.AccessTypeOffline)

	return c.JSON(fiber.Map{
		"url": url,
	})
}

// GoogleCallback handles Google OAuth callback
// GET /api/auth/google/callback
func (h *OAuthHandler) GoogleCallback(c *fiber.Ctx) (err error) {
	// Panic recovery for debugging
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🔥 PANIC in GoogleCallback: %v", r)
			err = c.Status(500).JSON(fiber.Map{"error": "internal server error"})
		}
	}()

	log.Printf("=== Google OAuth Callback Started ===")
	log.Printf("Request URL: %s", c.OriginalURL())
	log.Printf("Query params: %v", c.Queries())

	if h.googleOAuth == nil {
		log.Printf("ERROR: Google OAuth not configured")
		return c.Status(500).JSON(fiber.Map{
			"error": "Google OAuth not configured",
		})
	}

	// Get code and state from query params
	code := c.Query("code")
	state := c.Query("state")

	log.Printf("Code present: %v, State present: %v", code != "", state != "")

	if code == "" || state == "" {
		log.Printf("ERROR: Missing code or state - code: %v, state: %v", code != "", state != "")
		return c.Status(400).JSON(fiber.Map{
			"error": "Missing code or state parameter",
		})
	}

	// Verify state
	cachedProvider, found := h.cache.Get(fmt.Sprintf("oauth_state:%s", state))
	log.Printf("State verification - found: %v, provider: %s", found, cachedProvider)

	if cachedProvider != "google" {
		log.Printf("ERROR: Invalid state - expected 'google', got '%s'", cachedProvider)
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid state parameter",
		})
	}

	// Delete used state
	h.cache.Delete(fmt.Sprintf("oauth_state:%s", state))
	log.Printf("State deleted from cache")

	// Exchange code for token
	log.Printf("Exchanging code for token...")
	token, err := h.googleOAuth.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("ERROR: Failed to exchange token: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to exchange authorization code",
		})
	}
	log.Printf("Token exchange successful")

	// Check if token is nil
	if token == nil {
		log.Printf("ERROR: Received nil token after exchange")
		return c.Status(500).JSON(fiber.Map{"error": "empty token from provider"})
	}

	// Get user info
	log.Printf("Creating OAuth client with received token...")
	client := h.googleOAuth.Client(context.Background(), token)

	// Use OIDC endpoint for better reliability
	log.Printf("Fetching user info from Google OIDC endpoint...")
	resp, err := client.Get("https://openidconnect.googleapis.com/v1/userinfo")
	if err != nil {
		log.Printf("ERROR: Failed to get user info: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get user information",
		})
	}
	defer resp.Body.Close()
	log.Printf("User info response status: %d", resp.StatusCode)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ERROR: Failed to read user info body: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to read user information",
		})
	}
	log.Printf("User info body: %s", string(body))

	var googleUser GoogleUser
	if err := json.Unmarshal(body, &googleUser); err != nil {
		log.Printf("ERROR: Failed to parse user info JSON: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to parse user information",
		})
	}
	log.Printf("Parsed user: ID=%s, Email=%s, Name=%s", googleUser.ID, googleUser.Email, googleUser.Name)

	// Process OAuth login/registration
	log.Printf("Processing OAuth user...")
	return h.processOAuthUser(c, "google", googleUser.ID, googleUser.Email, googleUser.Name, googleUser.Picture, googleUser.VerifiedEmail)
}

// AppleLogin initiates Apple OAuth flow
// GET /api/auth/apple
func (h *OAuthHandler) AppleLogin(c *fiber.Ctx) error {
	if h.appleOAuth == nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Apple OAuth not configured",
		})
	}

	// Generate state token
	state := generateState()

	// Store state in cache with 10 minute expiration
	h.cache.Set(fmt.Sprintf("oauth_state:%s", state), "apple", 10*time.Minute)

	// Generate OAuth URL with response_mode=form_post for Apple
	url := h.appleOAuth.AuthCodeURL(state,
		oauth2.SetAuthURLParam("response_mode", "form_post"),
		oauth2.SetAuthURLParam("response_type", "code id_token"),
	)

	return c.JSON(fiber.Map{
		"url": url,
	})
}

// AppleCallback handles Apple OAuth callback
// POST /api/auth/apple/callback
func (h *OAuthHandler) AppleCallback(c *fiber.Ctx) error {
	if h.appleOAuth == nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Apple OAuth not configured",
		})
	}

	// Get code and state from form data (Apple uses form_post)
	code := c.FormValue("code")
	state := c.FormValue("state")
	idToken := c.FormValue("id_token")

	if code == "" || state == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Missing code or state parameter",
		})
	}

	// Verify state
	cachedProvider, _ := h.cache.Get(fmt.Sprintf("oauth_state:%s", state))
	if cachedProvider != "apple" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid state parameter",
		})
	}

	// Delete used state
	h.cache.Delete(fmt.Sprintf("oauth_state:%s", state))

	// For Apple, we can decode the id_token to get user info
	// In production, you should verify the JWT signature
	var appleUser AppleUser
	if idToken != "" {
		// Decode ID token (simplified - in production, verify signature)
		// For now, we'll exchange the code for user info
		token, err := h.appleOAuth.Exchange(context.Background(), code)
		if err != nil {
			log.Printf("Failed to exchange token: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to exchange authorization code",
			})
		}

		// Apple doesn't provide a user info endpoint
		// We need to decode the id_token JWT
		// For simplicity, we'll use the token's extra data
		if _, ok := token.Extra("id_token").(string); ok {
			// In production, verify and decode the JWT properly
			// For now, return basic info
			appleUser.Email = c.FormValue("user") // Apple sends user data in first login only
		}
	}

	// Process OAuth login/registration
	return h.processOAuthUser(c, "apple", appleUser.Sub, appleUser.Email, "", "", appleUser.EmailVerified == "true")
}

// processOAuthUser handles user creation or login for OAuth providers
func (h *OAuthHandler) processOAuthUser(c *fiber.Ctx, provider, providerID, email, name, avatarURL string, emailVerified bool) (err error) {
	// Panic recovery for debugging
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🔥 PANIC in processOAuthUser: %v", r)
			err = c.Status(500).JSON(fiber.Map{"error": "internal server error"})
		}
	}()

	log.Printf("processOAuthUser called: provider=%s, providerID=%s, email=%s, name=%s", provider, providerID, email, name)

	var (
		user      models.User
		tokenPair *auth.TokenPairWithJTI
		session   *models.Session
	)

	// Try to find user by OAuth provider
	err = h.db.DB.Where("oauth_provider = ? AND oauth_provider_id = ?", provider, providerID).First(&user).Error

	if err == gorm.ErrRecordNotFound {
		// Check if email already exists
		if email != "" {
			existingUser := models.User{}
			if err := h.db.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
				// SECURITY: Email exists but account is not linked
				// Store linking request in cache for user confirmation
				linkingToken := generateState()

				// Store for 10 minutes
				cacheKey := fmt.Sprintf("oauth_link_request:%s", linkingToken)
				cacheData := fmt.Sprintf("%s|%s|%s|%s|%s|%t|%s", provider, providerID, email, name, avatarURL, emailVerified, existingUser.ID.String())
				h.cache.Set(cacheKey, cacheData, 10*time.Minute)

				return c.Status(409).JSON(fiber.Map{
					"requires_account_linking": true,
					"email":                    email,
					"provider":                 provider,
					"linking_token":            linkingToken,
					"message":                  "An account with this email already exists. Please confirm to link your OAuth account.",
				})
			} else {
				// Create new user
				username := generateUsernameFromEmail(email)
				// Ensure username is unique
				username = ensureUniqueUsername(h.db.DB, username)

				user = models.User{
					Username:        username,
					Email:           email,
					DisplayName:     name,
					AvatarURL:       avatarURL,
					OAuthProvider:   provider,
					OAuthProviderID: providerID,
					IsEmailVerified: emailVerified,
					Password:        "", // No password for OAuth users initially
				}

				if err := h.db.DB.Create(&user).Error; err != nil {
					return c.Status(500).JSON(fiber.Map{
						"error": "Failed to create user",
					})
				}

				// Generate referral code
				referralCode := models.ReferralCode{
					ID:        uuid.New(),
					UserID:    user.ID,
					Code:      utils.GenerateReferralCode(),
					TotalUses: 0,
					IsActive:  true,
				}
				h.db.DB.Create(&referralCode)
			}
		} else {
			return c.Status(400).JSON(fiber.Map{
				"error": "Email not provided by OAuth provider",
			})
		}
	} else if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	// Check if 2FA is enabled
	if user.Is2FAEnabled {
		return c.Status(200).JSON(fiber.Map{
			"requires_2fa":        true,
			"verification_method": user.VerificationMethod,
			"email":               user.Email,
		})
	}

	// Generate tokens
	tokenPair, err = auth.GenerateTokenPair(
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
		log.Printf("Failed to generate tokens for OAuth user %s: %v", user.ID, err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Create session
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	refreshTokenHash, hashErr := utils.HashPassword(tokenPair.TokenPair.RefreshToken)
	if hashErr != nil {
		log.Printf("Failed to hash refresh token: %v", hashErr)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process tokens",
		})
	}
	expiresAt := time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour)

	session, err = sessionService.CreateSession(user.ID, c, refreshTokenHash, tokenPair.RefreshJTI, expiresAt)
	if err != nil {
		log.Printf("Failed to create session for OAuth user %s: %v", user.ID, err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	// Update last active
	now := time.Now()
	user.LastActiveAt = &now
	if err := h.db.DB.Save(&user).Error; err != nil {
		log.Printf("Failed to update last active for user %s: %v", user.ID, err)
	}

	// Set refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokenPair.TokenPair.RefreshToken,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   86400 * h.config.JWT.RefreshExpiry,
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"user":         user.ToMe(),
		"access_token": tokenPair.TokenPair.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokenPair.TokenPair.ExpiresIn,
		"session_id":   session.ID,
	})
}

// generateUsernameFromEmail creates a username from email
func generateUsernameFromEmail(email string) string {
	// Extract username part before @
	atIndex := 0
	for i, char := range email {
		if char == '@' {
			atIndex = i
			break
		}
	}

	if atIndex == 0 {
		return fmt.Sprintf("user_%d", time.Now().Unix())
	}

	username := email[:atIndex]
	// Remove special characters
	cleaned := ""
	for _, char := range username {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '_' {
			cleaned += string(char)
		}
	}

	if len(cleaned) < 3 {
		return fmt.Sprintf("user_%d", time.Now().Unix())
	}

	return cleaned
}

// ensureUniqueUsername checks if username exists and appends number if needed
func ensureUniqueUsername(db *gorm.DB, username string) string {
	originalUsername := username
	counter := 1

	for {
		var existingUser models.User
		if err := db.Where("username = ?", username).First(&existingUser).Error; err == gorm.ErrRecordNotFound {
			return username
		}
		username = fmt.Sprintf("%s%d", originalUsername, counter)
		counter++
	}
}

// ConfirmOAuthLinking confirms linking OAuth provider to existing account
// POST /api/auth/oauth/link/confirm
func (h *OAuthHandler) ConfirmOAuthLinking(c *fiber.Ctx) error {
	type ConfirmLinkingRequest struct {
		LinkingToken string `json:"linking_token" validate:"required"`
		Password     string `json:"password" validate:"required"`
	}

	var req ConfirmLinkingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Retrieve linking data from cache
	cacheKey := fmt.Sprintf("oauth_link_request:%s", req.LinkingToken)
	cacheData, found := h.cache.Get(cacheKey)
	if !found || cacheData == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid or expired linking token",
		})
	}

	// Parse cache data: provider|provider_id|email|name|avatar_url|email_verified|user_id
	var provider, providerID, email, name, avatarURL, userIDStr string
	var emailVerified bool
	_, parseErr := fmt.Sscanf(cacheData, "%s|%s|%s|%s|%s|%t|%s", &provider, &providerID, &email, &name, &avatarURL, &emailVerified, &userIDStr)
	if parseErr != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to parse linking data",
		})
	}

	// Parse user ID
	userID, parseIDErr := uuid.Parse(userIDStr)
	if parseIDErr != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Verify password (OAuth users might not have password, check first)
	if user.Password != "" {
		if !utils.CheckPassword(req.Password, user.Password) {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid password",
			})
		}
	} else {
		return c.Status(400).JSON(fiber.Map{
			"error": "Please set a password for your account first",
		})
	}

	// Link OAuth provider to account
	h.db.DB.Model(&user).Updates(map[string]interface{}{
		"oauth_provider":    provider,
		"oauth_provider_id": providerID,
	})

	// Delete used linking token
	h.cache.Delete(cacheKey)

	// Generate tokens for immediate login
	tokenPair, tokenErr := auth.GenerateTokenPair(
		user.ID,
		user.Username,
		user.Email,
		user.Role,
		h.config.JWT.AccessSecret,
		h.config.JWT.RefreshSecret,
		h.config.JWT.AccessExpiry,
		h.config.JWT.RefreshExpiry,
	)
	if tokenErr != nil {
		log.Printf("Failed to generate tokens for OAuth linking: %v", tokenErr)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Create session
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	refreshTokenHash, hashErr := utils.HashPassword(tokenPair.TokenPair.RefreshToken)
	if hashErr != nil {
		log.Printf("Failed to hash refresh token: %v", hashErr)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process tokens",
		})
	}
	expiresAt := time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour)

	session, sessionErr := sessionService.CreateSession(user.ID, c, refreshTokenHash, tokenPair.RefreshJTI, expiresAt)
	if sessionErr != nil {
		log.Printf("Failed to create session for OAuth linking: %v", sessionErr)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}

	// Set refresh token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    tokenPair.TokenPair.RefreshToken,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   86400 * h.config.JWT.RefreshExpiry,
		Path:     "/",
	})

	return c.JSON(fiber.Map{
		"message":      "OAuth provider linked successfully",
		"user":         user.ToMe(),
		"access_token": tokenPair.TokenPair.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokenPair.TokenPair.ExpiresIn,
		"session_id":   session.ID,
	})
}

// SetPasswordForOAuthUser allows OAuth users to set a password
// POST /api/auth/oauth/set-password
func (h *OAuthHandler) SetPasswordForOAuthUser(c *fiber.Ctx) error {
	type SetPasswordRequest struct {
		Password string `json:"password" validate:"required,min=8"`
	}

	var req SetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user from context (requires auth)
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Validate password strength
	if valid, msg := utils.ValidatePassword(req.Password); !valid {
		return c.Status(400).JSON(fiber.Map{
			"error": msg,
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Check if user already has a password
	if user.Password != "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Password already set. Use change password endpoint instead.",
		})
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process password",
		})
	}

	// Update password
	h.db.DB.Model(&user).Update("password", hashedPassword)

	return c.JSON(fiber.Map{
		"message": "Password set successfully. You can now login with email and password.",
	})
}

// UnlinkOAuthProvider removes OAuth provider from account
// POST /api/auth/oauth/unlink
func (h *OAuthHandler) UnlinkOAuthProvider(c *fiber.Ctx) error {
	type UnlinkRequest struct {
		Password string `json:"password" validate:"required"`
	}

	var req UnlinkRequest
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

	// Check if OAuth is linked
	if user.OAuthProvider == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "No OAuth provider linked to this account",
		})
	}

	// Verify user has a password (can't unlink if no alternative login method)
	if user.Password == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot unlink OAuth provider. Please set a password first.",
		})
	}

	// Verify password
	if !utils.CheckPassword(req.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid password",
		})
	}

	// Unlink OAuth provider
	h.db.DB.Model(&user).Updates(map[string]interface{}{
		"oauth_provider":    "",
		"oauth_provider_id": "",
	})

	return c.JSON(fiber.Map{
		"message": "OAuth provider unlinked successfully",
	})
}

// GetOAuthStatus returns current OAuth linking status
// GET /api/auth/oauth/status
func (h *OAuthHandler) GetOAuthStatus(c *fiber.Ctx) error {
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

	hasPassword := user.Password != ""
	hasOAuth := user.OAuthProvider != ""

	return c.JSON(fiber.Map{
		"has_password":     hasPassword,
		"has_oauth":        hasOAuth,
		"oauth_provider":   user.OAuthProvider,
		"can_unlink_oauth": hasPassword && hasOAuth,
		"can_set_password": hasOAuth && !hasPassword,
	})
}
