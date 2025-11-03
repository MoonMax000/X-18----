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
	"github.com/golang-jwt/jwt/v5"
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
		log.Printf("✅ Google OAuth configured: ClientID=%s", config.OAuth.Google.ClientID[:6]+"...")
	} else {
		log.Printf("⚠️ Google OAuth not configured - missing CLIENT_ID")
	}

	// Initialize Apple OAuth
	if config.OAuth.Apple.ClientID != "" && config.OAuth.Apple.TeamID != "" && config.OAuth.Apple.KeyID != "" {
		// Parse Apple private key
		privateKey, err := configs.ParseApplePrivateKey(config.OAuth.Apple)
		if err != nil {
			log.Printf("❌ Failed to parse Apple Private Key: %v", err)
		} else {
			// Generate Apple Client Secret (JWT)
			clientSecret, err := utils.GenerateAppleClientSecret(
				config.OAuth.Apple.TeamID,
				config.OAuth.Apple.KeyID,
				config.OAuth.Apple.ClientID,
				privateKey,
			)
			if err != nil {
				log.Printf("❌ Failed to generate Apple Client Secret: %v", err)
			} else {
				log.Printf("✅ Apple OAuth configured: ClientID=%s, TeamID=%s",
					config.OAuth.Apple.ClientID, config.OAuth.Apple.TeamID)
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
	} else {
		log.Printf("⚠️ Apple OAuth not configured - missing credentials")
	}

	return handler
}

// GoogleUser represents Google user info
type GoogleUser struct {
	ID            string `json:"sub"` // Google uses "sub" for user ID in OIDC
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	HD            string `json:"hd,omitempty"` // Hosted domain for G Suite accounts
}

// AppleUser represents Apple user info from ID token
type AppleUser struct {
	Sub            string `json:"sub"` // User ID
	Email          string `json:"email"`
	EmailVerified  string `json:"email_verified"` // "true" or "false" as string
	IsPrivateEmail string `json:"is_private_email"`
	RealUserStatus int    `json:"real_user_status"` // 0: unsupported, 1: unknown, 2: likely real
}

// AppleIDTokenClaims represents the full Apple ID token structure
type AppleIDTokenClaims struct {
	jwt.RegisteredClaims
	Email          string `json:"email"`
	EmailVerified  string `json:"email_verified"`
	AuthTime       int64  `json:"auth_time"`
	NonceSupported bool   `json:"nonce_supported"`
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
	errorParam := c.Query("error")

	// Check for OAuth error
	if errorParam != "" {
		errorDesc := c.Query("error_description", "Unknown error")
		log.Printf("ERROR: OAuth provider returned error: %s - %s", errorParam, errorDesc)
		return c.Status(400).JSON(fiber.Map{
			"error": fmt.Sprintf("OAuth error: %s", errorDesc),
		})
	}

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

	if !found || cachedProvider != "google" {
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
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	token, err := h.googleOAuth.Exchange(ctx, code)
	if err != nil {
		log.Printf("ERROR: Failed to exchange token: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to exchange authorization code",
		})
	}
	log.Printf("Token exchange successful, AccessToken present: %v", token.AccessToken != "")

	// Check if token is nil
	if token == nil || token.AccessToken == "" {
		log.Printf("ERROR: Received invalid token after exchange")
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

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("ERROR: Non-200 status from Google: %d, body: %s", resp.StatusCode, string(body))
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to get user information from Google",
		})
	}

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
		log.Printf("ERROR: Apple OAuth not configured in handler")
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

	log.Printf("Generated Apple OAuth URL for redirect: %s", h.config.OAuth.Apple.RedirectURL)

	return c.JSON(fiber.Map{
		"url": url,
	})
}

// AppleCallback handles Apple OAuth callback
// POST /api/auth/apple/callback
func (h *OAuthHandler) AppleCallback(c *fiber.Ctx) (err error) {
	// Panic recovery for debugging
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🔥 PANIC in AppleCallback: %v", r)
			err = c.Status(500).JSON(fiber.Map{"error": "internal server error"})
		}
	}()

	log.Printf("=== Apple OAuth Callback Started ===")
	log.Printf("Request Method: %s", c.Method())
	log.Printf("Content-Type: %s", c.Get("Content-Type"))

	if h.appleOAuth == nil {
		log.Printf("ERROR: Apple OAuth not configured")
		return c.Status(500).JSON(fiber.Map{
			"error": "Apple OAuth not configured",
		})
	}

	// Get code and state from form data (Apple uses form_post)
	code := c.FormValue("code")
	state := c.FormValue("state")
	idToken := c.FormValue("id_token")
	user := c.FormValue("user") // Only sent on first authorization

	log.Printf("Code present: %v, State present: %v, ID Token present: %v",
		code != "", state != "", idToken != "")

	if user != "" {
		log.Printf("Apple user data (first login only): %s", user)
	}

	// Check for error
	if errorParam := c.FormValue("error"); errorParam != "" {
		errorDesc := c.FormValue("error_description", "Unknown error")
		log.Printf("ERROR: Apple returned error: %s - %s", errorParam, errorDesc)
		return c.Status(400).JSON(fiber.Map{
			"error": fmt.Sprintf("Apple OAuth error: %s", errorDesc),
		})
	}

	if code == "" || state == "" {
		log.Printf("ERROR: Missing required parameters - code: %v, state: %v", code != "", state != "")
		return c.Status(400).JSON(fiber.Map{
			"error": "Missing code or state parameter",
		})
	}

	// Verify state
	cachedProvider, found := h.cache.Get(fmt.Sprintf("oauth_state:%s", state))
	log.Printf("State verification - found: %v, provider: %s", found, cachedProvider)

	if !found || cachedProvider != "apple" {
		log.Printf("ERROR: Invalid state - expected 'apple', got '%s'", cachedProvider)
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid state parameter",
		})
	}

	// Delete used state
	h.cache.Delete(fmt.Sprintf("oauth_state:%s", state))
	log.Printf("State deleted from cache")

	// Exchange code for tokens
	log.Printf("Exchanging code for token...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	token, err := h.appleOAuth.Exchange(ctx, code)
	if err != nil {
		log.Printf("ERROR: Failed to exchange Apple token: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to exchange authorization code",
		})
	}
	log.Printf("Token exchange successful")

	// Extract user info from id_token
	var appleUser AppleUser

	// Get id_token from exchange response or form data
	receivedIDToken, ok := token.Extra("id_token").(string)
	if !ok || receivedIDToken == "" {
		receivedIDToken = idToken
	}

	if receivedIDToken != "" {
		log.Printf("Parsing Apple ID token...")

		// Parse JWT without verification (Apple doesn't provide easy way to get public keys)
		// In production, you should verify the signature using Apple's public keys
		parser := jwt.NewParser(jwt.WithoutClaimsValidation())
		var claims AppleIDTokenClaims

		_, _, err := parser.ParseUnverified(receivedIDToken, &claims)
		if err != nil {
			log.Printf("ERROR: Failed to parse Apple ID token: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to parse Apple ID token",
			})
		}

		appleUser.Sub = claims.Subject
		appleUser.Email = claims.Email
		appleUser.EmailVerified = claims.EmailVerified

		log.Printf("Parsed Apple user: Sub=%s, Email=%s, EmailVerified=%s",
			appleUser.Sub, appleUser.Email, appleUser.EmailVerified)
	} else {
		log.Printf("WARNING: No ID token received from Apple")
		return c.Status(500).JSON(fiber.Map{
			"error": "No ID token received from Apple",
		})
	}

	// Handle first-time authorization user data
	var displayName string
	if user != "" {
		var userData struct {
			Name struct {
				FirstName string `json:"firstName"`
				LastName  string `json:"lastName"`
			} `json:"name"`
		}
		if err := json.Unmarshal([]byte(user), &userData); err == nil {
			displayName = fmt.Sprintf("%s %s", userData.Name.FirstName, userData.Name.LastName)
			log.Printf("Parsed first-time user name: %s", displayName)
		}
	}

	// Process OAuth login/registration
	log.Printf("Processing OAuth user...")
	return h.processOAuthUser(c, "apple", appleUser.Sub, appleUser.Email, displayName, "", appleUser.EmailVerified == "true")
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

	log.Printf("=== Processing OAuth User ===")
	log.Printf("Provider: %s, ProviderID: %s, Email: %s, Name: %s, EmailVerified: %v",
		provider, providerID, email, name, emailVerified)

	// Validate required fields
	if providerID == "" {
		log.Printf("ERROR: Empty provider ID")
		return c.Status(500).JSON(fiber.Map{
			"error": "Invalid OAuth response: missing user ID",
		})
	}

	var (
		user      models.User
		tokenPair *auth.TokenPairWithJTI
		session   *models.Session
		isNewUser bool
	)

	// Try to find user by OAuth provider
	err = h.db.DB.Where("oauth_provider = ? AND oauth_provider_id = ?", provider, providerID).First(&user).Error
	log.Printf("Search by OAuth provider result: found=%v, err=%v", err == nil, err)

	if err == gorm.ErrRecordNotFound {
		// Check if email already exists
		if email != "" {
			existingUser := models.User{}
			if err := h.db.DB.Where("email = ?", email).First(&existingUser).Error; err == nil {
				log.Printf("Email already exists for user: %s", existingUser.ID)

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
				log.Printf("Creating new user with OAuth...")
				isNewUser = true

				// Validate email
				if email == "" {
					log.Printf("ERROR: No email provided by OAuth provider")
					return c.Status(400).JSON(fiber.Map{
						"error": "Email not provided by OAuth provider. Please grant email permissions.",
					})
				}

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
					log.Printf("ERROR: Failed to create user: %v", err)
					return c.Status(500).JSON(fiber.Map{
						"error": "Failed to create user",
					})
				}
				log.Printf("Created new user: ID=%s, Username=%s", user.ID, user.Username)

				// Generate referral code
				referralCode := models.ReferralCode{
					ID:        uuid.New(),
					UserID:    user.ID,
					Code:      utils.GenerateReferralCode(),
					TotalUses: 0,
					IsActive:  true,
				}
				if err := h.db.DB.Create(&referralCode).Error; err != nil {
					log.Printf("WARNING: Failed to create referral code: %v", err)
				}
			}
		} else {
			log.Printf("ERROR: No email provided by OAuth provider")
			return c.Status(400).JSON(fiber.Map{
				"error": "Email not provided by OAuth provider",
			})
		}
	} else if err != nil {
		log.Printf("ERROR: Database error: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	} else {
		log.Printf("Found existing user: ID=%s, Username=%s", user.ID, user.Username)
	}

	// Check if 2FA is enabled
	if user.Is2FAEnabled {
		log.Printf("User has 2FA enabled, requiring verification")
		return c.Status(200).JSON(fiber.Map{
			"requires_2fa":        true,
			"verification_method": user.VerificationMethod,
			"email":               user.Email,
		})
	}

	// Generate tokens
	log.Printf("Generating authentication tokens...")
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
		log.Printf("ERROR: Failed to generate tokens: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}
	log.Printf("Tokens generated successfully")

	// Create session
	log.Printf("Creating user session...")
	sessionService := services.NewSessionService(h.db.DB, h.cache)
	refreshTokenHash, hashErr := utils.HashPassword(tokenPair.TokenPair.RefreshToken)
	if hashErr != nil {
		log.Printf("ERROR: Failed to hash refresh token: %v", hashErr)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to process tokens",
		})
	}
	expiresAt := time.Now().Add(time.Duration(h.config.JWT.RefreshExpiry) * 24 * time.Hour)

	session, err = sessionService.CreateSession(user.ID, c, refreshTokenHash, tokenPair.RefreshJTI, expiresAt)
	if err != nil {
		log.Printf("ERROR: Failed to create session: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create session",
		})
	}
	log.Printf("Session created: ID=%s", session.ID)

	// Update last active
	now := time.Now()
	user.LastActiveAt = &now
	if err := h.db.DB.Save(&user).Error; err != nil {
		log.Printf("WARNING: Failed to update last active: %v", err)
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

	log.Printf("OAuth login successful for user: %s", user.ID)

	// Add flag to indicate if this is a new user registration
	response := fiber.Map{
		"user":         user.ToMe(),
		"access_token": tokenPair.TokenPair.AccessToken,
		"token_type":   "Bearer",
		"expires_in":   tokenPair.TokenPair.ExpiresIn,
		"session_id":   session.ID,
	}

	if isNewUser {
		response["is_new_user"] = true
		response["message"] = "Account created successfully"
	}

	return c.JSON(response)
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
