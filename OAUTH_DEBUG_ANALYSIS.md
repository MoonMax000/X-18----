# OAuth Integration Debugging Analysis

## Проблема
Google и Apple OAuth возвращают 500 Internal Server Error при попытке callback после успешной авторизации.

## Симптомы

### Frontend Errors:
```
GET http://localhost:8080/api/auth/google/callback?state=...&code=... 500 (Internal Server Error)
GET https://appleid.apple.com/auth/authorize?client_id=... 500 (Internal Server Error)
```

### Backend Logs:
```
2025/11/03 22:27:51 === Google OAuth Callback Started ===
2025/11/03 22:27:51 Token exchange successful
[22:27:51] 500 - GET /api/auth/google/callback ( 292.987958ms)
```

**Важно:** После "Token exchange successful" логи обрываются, что указывает на panic или критическую ошибку.

## Код - Проблемные файлы

### 1. custom-backend/internal/api/oauth_handlers.go

#### GoogleCallback функция (строки 132-213):
```go
func (h *OAuthHandler) GoogleCallback(c *fiber.Ctx) error {
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

	// ⚠️ ПРОБЛЕМА ЗДЕСЬ - После этой строки код падает
	// Get user info
	log.Printf("Creating OAuth client...")
	client := h.googleOAuth.Client(context.Background(), token)

	log.Printf("Fetching user info from Google API...")
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
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
```

#### processOAuthUser функция (строки 275-401):
```go
func (h *OAuthHandler) processOAuthUser(c *fiber.Ctx, provider, providerID, email, name, avatarURL string, emailVerified bool) error {
	var user models.User

	// Try to find user by OAuth provider
	err := h.db.DB.Where("oauth_provider = ? AND oauth_provider_id = ?", provider, providerID).First(&user).Error

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

	// ⚠️ ИСПРАВЛЕНО: Правильный доступ к TokenPairWithJTI
	tokenPair, err := auth.GenerateTokenPair(
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

	session, err := sessionService.CreateSession(user.ID, c, refreshTokenHash, tokenPair.RefreshJTI, expiresAt)
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
```

### 2. custom-backend/internal/auth/jwt.go

#### TokenPairWithJTI структура:
```go
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// TokenPairWithJTI includes the JTI for refresh token tracking
type TokenPairWithJTI struct {
	*TokenPair            // ⚠️ ВЛОЖЕННАЯ СТРУКТУРА - доступ через tokenPair.TokenPair
	RefreshJTI uuid.UUID `json:"-"` // Not exposed to client
}

func GenerateTokenPair(...) (*TokenPairWithJTI, error) {
	accessToken, err := GenerateAccessToken(...)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, jti, err := GenerateRefreshToken(...)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPairWithJTI{
		TokenPair: &TokenPair{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    int64(accessExpiry * 60),
		},
		RefreshJTI: jti,
	}, nil
}
```

### 3. custom-backend/internal/models/user.go

#### User модель с ToMe():
```go
type User struct {
	ID              uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Username        string     `json:"username" gorm:"uniqueIndex;not null"`
	Email           string     `json:"email" gorm:"uniqueIndex;not null"`
	Password        string     `json:"-" gorm:"not null"`
	DisplayName     string     `json:"display_name"`
	Bio             string     `json:"bio"`
	AvatarURL       string     `json:"avatar_url"`
	HeaderURL       string     `json:"header_url"`
	// ... другие поля ...
	OAuthProvider   string     `json:"oauth_provider"`
	OAuthProviderID string     `json:"oauth_provider_id"`
	IsEmailVerified bool       `json:"is_email_verified" gorm:"default:false"`
	// ... остальные поля ...
}

func (u *User) ToMe() *UserResponse {
	// ⚠️ ПОТЕНЦИАЛЬНАЯ ПРОБЛЕМА: возможно метод падает с panic
	return &UserResponse{
		ID:          u.ID.String(),
		Username:    u.Username,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		// ... mapping полей ...
	}
}
```

## Гипотезы причины 500 ошибки

### Гипотеза 1: Panic в user.ToMe()
Логи показывают, что после "Token exchange successful" код просто обрывается без какого-либо log.Printf. Это может быть:
- Panic в методе `user.ToMe()`
- Nil pointer dereference
- Отсутствующее обязательное поле

### Гипотеза 2: Проблема в client.Get()
Код может упасть при попытке:
```go
client := h.googleOAuth.Client(context.Background(), token)
resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
```

Но логи "Creating OAuth client..." не появляются, что странно.

### Гипотеза 3: Старый скомпилированный код
Возможно backend использует старый бинарник в `custom-backend/bin/server` или `custom-backend/server`, а не новый код.

## Что нужно проверить

### 1. Проверить какой бинарник запускается
```bash
ls -la custom-backend/server custom-backend/bin/server
```

### 2. Убедиться что используется свежий код
```bash
cd custom-backend && go build -o server ./cmd/server
./server
```

### 3. Добавить panic recovery middleware
В `custom-backend/cmd/server/main.go` добавить:
```go
app.Use(recover.New(recover.Config{
	EnableStackTrace: true,
}))
```

### 4. Добавить defer recover в processOAuthUser
```go
func (h *OAuthHandler) processOAuthUser(...) (err error) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("PANIC in processOAuthUser: %v", r)
			err = fmt.Errorf("internal server error: %v", r)
		}
	}()
	// ... остальной код
}
```

## Текущие исправления

### Commit 1: 5d9c0358
- Исправлен hardcoded localhost URL в LoginModal
- Используется `import.meta.env.VITE_API_URL`

### Commit 2: c870591b  
- Исправлен доступ к `TokenPairWithJTI`:
  - Было: `tokens.RefreshToken` ❌
  - Стало: `tokenPair.TokenPair.RefreshToken` ✅
- Добавлено логирование ошибок
- Исправлено в двух местах: `processOAuthUser` и `ConfirmOAuthLinking`

## Дополнительная информация

### OAuth конфигурация (.env):
```env
GOOGLE_CLIENT_ID=659860871739-9dh0mon5vggkf3iotffpg09a71o61p90.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-***
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback

APPLE_CLIENT_ID=com.tyriantrade.web
APPLE_TEAM_ID=4QUQ4U396S
APPLE_KEY_ID=4QUQ4U396S
APPLE_PRIVATE_KEY=[PEM формат - есть проблема с парсингом]
APPLE_REDIRECT_URL=http://localhost:8080/api/auth/apple/callback
```

### Связанные файлы:
1. `custom-backend/internal/api/oauth_handlers.go` - OAuth handlers
2. `custom-backend/internal/auth/jwt.go` - Token generation
3. `custom-backend/internal/models/user.go` - User model с ToMe()
4. `custom-backend/internal/services/security.go` - Session management
5. `custom-backend/configs/config.go` - OAuth configuration
6. `client/components/auth/LoginModal.tsx` - Frontend OAuth buttons

## Рекомендуемые следующие шаги

1. Добавить panic recovery для отлова критических ошибок
2. Добавить логирование в каждую строку после "Token exchange successful"
3. Проверить что `user.ToMe()` не падает с nil pointer
4. Убедиться что используется свежескомпилированный бинарник
5. Проверить что все обязательные поля User заполнены перед ToMe()
