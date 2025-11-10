package services

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"custom-backend/internal/cache"
	"custom-backend/internal/models"
	"custom-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/pquerna/otp"
	"gorm.io/gorm"
)

const (
	// Security constants
	MaxLoginAttempts        = 5
	IPLockoutDuration       = 15 * time.Minute
	UserLockoutDuration     = 30 * time.Minute
	VerificationCodeLength  = 6
	VerificationCodeExpiry  = 15 * time.Minute
	PasswordResetCodeExpiry = 1 * time.Hour
)

// SecurityService handles authentication security
type SecurityService struct {
	db    *gorm.DB
	cache *cache.Cache
}

// NewSecurityService creates a new security service
func NewSecurityService(db *gorm.DB, cache *cache.Cache) *SecurityService {
	return &SecurityService{
		db:    db,
		cache: cache,
	}
}

// RecordLoginAttempt records a login attempt and handles lockouts
func (s *SecurityService) RecordLoginAttempt(email string, ipAddress string, userAgent string, success bool, failureReason string) error {
	// Clean up IP address (remove port if present)
	if idx := strings.LastIndex(ipAddress, ":"); idx != -1 {
		ipAddress = ipAddress[:idx]
	}

	// Find user by email
	var user models.User
	var userID *uuid.UUID
	if err := s.db.Where("email = ?", email).First(&user).Error; err == nil {
		userID = &user.ID
	}

	// Record the attempt
	attempt := models.LoginAttempt{
		Email:         email,
		UserID:        userID,
		IPAddress:     ipAddress,
		UserAgent:     userAgent,
		Success:       success,
		FailureReason: failureReason,
		AttemptedAt:   time.Now(),
	}
	s.db.Create(&attempt)

	// If successful, clear any lockouts
	if success {
		if userID != nil {
			s.db.Where("user_id = ?", userID).Delete(&models.UserLockout{})
		}
		s.db.Where("ip_address = ?", ipAddress).Delete(&models.IPLockout{})
		return nil
	}

	// Handle failed attempts
	if err := s.handleFailedAttempt(userID, ipAddress); err != nil {
		return err
	}

	return nil
}

// handleFailedAttempt manages lockouts for failed login attempts
func (s *SecurityService) handleFailedAttempt(userID *uuid.UUID, ipAddress string) error {
	// Handle user lockout
	if userID != nil {
		var userLockout models.UserLockout
		if err := s.db.Where("user_id = ?", userID).First(&userLockout).Error; err != nil {
			// Create new lockout record
			userLockout = models.UserLockout{
				UserID:   *userID,
				Attempts: 1,
			}
			s.db.Create(&userLockout)
		} else {
			// Update existing lockout
			userLockout.Attempts++
			if userLockout.Attempts >= MaxLoginAttempts {
				blockedUntil := time.Now().Add(UserLockoutDuration)
				userLockout.BlockedUntil = &blockedUntil
			}
			s.db.Save(&userLockout)
		}
	}

	// Handle IP lockout
	var ipLockout models.IPLockout
	if err := s.db.Where("ip_address = ?", ipAddress).First(&ipLockout).Error; err != nil {
		// Create new lockout record
		ipLockout = models.IPLockout{
			IPAddress: ipAddress,
			Attempts:  1,
		}
		s.db.Create(&ipLockout)
	} else {
		// Update existing lockout
		ipLockout.Attempts++
		if ipLockout.Attempts >= MaxLoginAttempts {
			blockedUntil := time.Now().Add(IPLockoutDuration)
			ipLockout.BlockedUntil = &blockedUntil
		}
		s.db.Save(&ipLockout)
	}

	return nil
}

// CheckLockouts checks if a user or IP is currently locked out
func (s *SecurityService) CheckLockouts(email string, ipAddress string) (bool, string, *time.Time) {
	// Clean up IP address
	if idx := strings.LastIndex(ipAddress, ":"); idx != -1 {
		ipAddress = ipAddress[:idx]
	}

	// Check IP lockout
	var ipLockout models.IPLockout
	if err := s.db.Where("ip_address = ? AND blocked_until > ?", ipAddress, time.Now()).First(&ipLockout).Error; err == nil {
		return true, "ip_blocked", ipLockout.BlockedUntil
	}

	// Check user lockout
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err == nil {
		var userLockout models.UserLockout
		if err := s.db.Where("user_id = ? AND blocked_until > ?", user.ID, time.Now()).First(&userLockout).Error; err == nil {
			return true, "account_locked", userLockout.BlockedUntil
		}
	}

	return false, "", nil
}

// GenerateVerificationCode generates a random verification code
func (s *SecurityService) GenerateVerificationCode(userID uuid.UUID, codeType models.VerificationType, method models.VerificationMethod) (*models.VerificationCode, error) {
	// Generate random code
	code := s.generateRandomCode(VerificationCodeLength)

	// Set expiry based on type
	var expiry time.Duration
	switch codeType {
	case models.VerificationTypePasswordReset:
		expiry = PasswordResetCodeExpiry
	default:
		expiry = VerificationCodeExpiry
	}

	// Create verification code record
	verificationCode := models.VerificationCode{
		UserID:    userID,
		Code:      code,
		Type:      codeType,
		Method:    method,
		ExpiresAt: time.Now().Add(expiry),
	}

	// Invalidate any existing codes of the same type
	s.db.Model(&models.VerificationCode{}).
		Where("user_id = ? AND type = ? AND used = false", userID, codeType).
		Update("used", true)

	// Save new code
	if err := s.db.Create(&verificationCode).Error; err != nil {
		return nil, err
	}

	// Also cache the code for quick access (especially for 2FA)
	if codeType == models.VerificationType2FA {
		cacheKey := fmt.Sprintf("2fa:%s", userID.String())
		s.cache.Set(cacheKey, code, expiry)
	}

	return &verificationCode, nil
}

// VerifyCode verifies a verification code
func (s *SecurityService) VerifyCode(userID uuid.UUID, code string, codeType models.VerificationType) (bool, error) {
	// Check cache first for 2FA codes
	if codeType == models.VerificationType2FA {
		cacheKey := fmt.Sprintf("2fa:%s", userID.String())
		if cachedCode, exists := s.cache.Get(cacheKey); exists {
			if cachedCode == code {
				s.cache.Delete(cacheKey)
				return true, nil
			}
		}
	}

	// Check database
	var verificationCode models.VerificationCode
	err := s.db.Where(
		"user_id = ? AND code = ? AND type = ? AND used = false AND expires_at > ?",
		userID, code, codeType, time.Now(),
	).First(&verificationCode).Error

	if err != nil {
		return false, err
	}

	// Mark as used
	verificationCode.Used = true
	s.db.Save(&verificationCode)

	return true, nil
}

// GetUserTOTPStatus returns whether the user has TOTP enabled
func (s *SecurityService) GetUserTOTPStatus(userID uuid.UUID) (bool, error) {
	var user models.User
	if err := s.db.Select("totp_enabled").First(&user, "id = ?", userID).Error; err != nil {
		return false, err
	}
	return user.TOTPEnabled, nil
}

// VerifyTOTPCode verifies a TOTP code for a user
// Note: Backup codes support will be added in a future update
func (s *SecurityService) VerifyTOTPCode(userID uuid.UUID, code string) (bool, error) {
	// Get user
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return false, fmt.Errorf("user not found: %w", err)
	}

	// Check if TOTP is enabled
	if !user.TOTPEnabled {
		return false, fmt.Errorf("TOTP not enabled for this user")
	}

	// Verify as TOTP code (6 digits)
	if len(code) != 6 {
		return false, fmt.Errorf("invalid TOTP code format - must be 6 digits")
	}

	totpService := NewTOTPService(s.db, s.cache)
	return totpService.VerifyTOTPCode(user.ID, code)
}

// generateRandomCode generates a random numeric code
func (s *SecurityService) generateRandomCode(length int) string {
	const digits = "0123456789"
	b := make([]byte, length)
	rand.Read(b)
	for i := range b {
		b[i] = digits[b[i]%byte(len(digits))]
	}
	return string(b)
}

// ParseUserAgent extracts device info from user agent string
func (s *SecurityService) ParseUserAgent(userAgent string) (deviceType, browser, os string) {
	ua := strings.ToLower(userAgent)

	// Detect device type
	switch {
	case strings.Contains(ua, "mobile"):
		deviceType = "mobile"
	case strings.Contains(ua, "tablet"):
		deviceType = "tablet"
	default:
		deviceType = "desktop"
	}

	// Detect browser
	switch {
	case strings.Contains(ua, "chrome"):
		browser = "Chrome"
	case strings.Contains(ua, "firefox"):
		browser = "Firefox"
	case strings.Contains(ua, "safari"):
		browser = "Safari"
	case strings.Contains(ua, "edge"):
		browser = "Edge"
	default:
		browser = "Unknown"
	}

	// Detect OS
	switch {
	case strings.Contains(ua, "windows"):
		os = "Windows"
	case strings.Contains(ua, "mac"):
		os = "macOS"
	case strings.Contains(ua, "linux"):
		os = "Linux"
	case strings.Contains(ua, "android"):
		os = "Android"
	case strings.Contains(ua, "ios") || strings.Contains(ua, "iphone"):
		os = "iOS"
	default:
		os = "Unknown"
	}

	return
}

// GetClientIP extracts the real client IP from request
func GetClientIP(c *fiber.Ctx) string {
	// Check X-Real-IP header (from nginx/proxy)
	if ip := c.Get("X-Real-IP"); ip != "" {
		return ip
	}

	// Check X-Forwarded-For header
	if ip := c.Get("X-Forwarded-For"); ip != "" {
		// Take the first IP if there are multiple
		parts := strings.Split(ip, ",")
		return strings.TrimSpace(parts[0])
	}

	// Fall back to RemoteIP
	return c.IP()
}

// GenerateSessionToken generates a secure session token
func GenerateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// SessionService handles session management
type SessionService struct {
	db    *gorm.DB
	cache *cache.Cache
}

// NewSessionService creates a new session service
func NewSessionService(db *gorm.DB, cache *cache.Cache) *SessionService {
	return &SessionService{
		db:    db,
		cache: cache,
	}
}

// CreateSession creates a new session with enhanced tracking and JTI for rotation
func (ss *SessionService) CreateSession(userID uuid.UUID, c *fiber.Ctx, refreshTokenHash string, jti uuid.UUID, expiresAt time.Time) (*models.Session, error) {
	// Parse user agent info
	userAgent := c.Get("User-Agent")
	security := NewSecurityService(ss.db, ss.cache)
	deviceType, browser, os := security.ParseUserAgent(userAgent)

	// Get client IP
	ipAddress := GetClientIP(c)

	// Get GeoIP location data (non-blocking)
	geoData := utils.GetGeoIPDataSafe(ipAddress)

	// Get current time for last activity
	now := time.Now()

	// Create session with full device tracking info and GeoIP data
	session := models.Session{
		UserID:           userID,
		RefreshTokenHash: refreshTokenHash,
		JTI:              &jti,
		ExpiresAt:        expiresAt,
		DeviceType:       deviceType,
		Browser:          browser,
		OS:               os,
		IPAddress:        ipAddress,
		UserAgent:        userAgent,
		LastActiveAt:     &now,
		IsActive:         true,
	}

	// Add GeoIP data if available
	if geoData != nil {
		session.Country = geoData.Country
		session.CountryCode = geoData.CountryCode
		session.City = geoData.City
		session.Region = geoData.Region
		session.Timezone = geoData.Timezone
	}

	if err := ss.db.Create(&session).Error; err != nil {
		return nil, err
	}

	return &session, nil
}

// GetActiveSessions gets all active sessions for a user
func (ss *SessionService) GetActiveSessions(userID uuid.UUID) ([]models.Session, error) {
	var sessions []models.Session
	err := ss.db.Where("user_id = ? AND expires_at > ?", userID, time.Now()).Find(&sessions).Error
	return sessions, err
}

// RevokeSession revokes a specific session
func (ss *SessionService) RevokeSession(sessionID uint) error {
	return ss.db.Delete(&models.Session{}, sessionID).Error
}

// RevokeAllSessions revokes all sessions for a user
func (ss *SessionService) RevokeAllSessions(userID uuid.UUID) error {
	now := time.Now()
	return ss.db.Model(&models.Session{}).
		Where("user_id = ?", userID).
		Updates(map[string]interface{}{
			"is_active":  false,
			"is_revoked": true,
			"revoked_at": now,
		}).Error
}

// RevokeAllSessionsExceptCurrent revokes all sessions except the current one
func (ss *SessionService) RevokeAllSessionsExceptCurrent(userID uuid.UUID, currentSessionID uuid.UUID) error {
	now := time.Now()
	return ss.db.Model(&models.Session{}).
		Where("user_id = ? AND id != ?", userID, currentSessionID).
		Updates(map[string]interface{}{
			"is_active":  false,
			"is_revoked": true,
			"revoked_at": now,
		}).Error
}

// RotateRefreshToken handles refresh token rotation with reuse detection
func (ss *SessionService) RotateRefreshToken(oldJTI uuid.UUID, newJTI uuid.UUID, newTokenHash string, newExpiresAt time.Time) error {
	// Find the session by old JTI
	var session models.Session
	if err := ss.db.Where("jti = ?", oldJTI).First(&session).Error; err != nil {
		return fmt.Errorf("session not found: %w", err)
	}

	// Check if already replaced (REUSE DETECTION!)
	if session.ReplacedByJTI != nil {
		// Token reuse detected - revoke entire session family
		return ss.RevokeSessionFamily(session.UserID, oldJTI)
	}

	// Check if revoked
	if session.IsRevoked || !session.IsActive {
		return fmt.Errorf("session is revoked or inactive")
	}

	// Mark old session as replaced
	now := time.Now()
	oldJTICopy := oldJTI
	if err := ss.db.Model(&session).Updates(map[string]interface{}{
		"replaced_by_jti": newJTI,
		"is_active":       false,
	}).Error; err != nil {
		return fmt.Errorf("failed to mark old session: %w", err)
	}

	// Create new session record
	newSession := models.Session{
		UserID:           session.UserID,
		RefreshTokenHash: newTokenHash,
		JTI:              &newJTI,
		PrevJTI:          &oldJTICopy,
		ExpiresAt:        newExpiresAt,
		DeviceType:       session.DeviceType,
		Browser:          session.Browser,
		OS:               session.OS,
		IPAddress:        session.IPAddress,
		UserAgent:        session.UserAgent,
		LastActiveAt:     &now,
		IsActive:         true,
	}

	if err := ss.db.Create(&newSession).Error; err != nil {
		return fmt.Errorf("failed to create new session: %w", err)
	}

	return nil
}

// RevokeSessionFamily revokes all sessions in a rotation chain (for reuse detection)
func (ss *SessionService) RevokeSessionFamily(userID uuid.UUID, suspiciousJTI uuid.UUID) error {
	now := time.Now()

	// Revoke all sessions for this user as a security measure
	// In production, you might want to be more selective and trace the family chain
	err := ss.db.Model(&models.Session{}).
		Where("user_id = ? AND is_active = true", userID).
		Updates(map[string]interface{}{
			"is_active":  false,
			"is_revoked": true,
			"revoked_at": now,
		}).Error

	if err != nil {
		return fmt.Errorf("failed to revoke session family: %w", err)
	}

	// Log the security event
	// TODO: Send email notification about suspicious activity
	return nil
}

// ValidateSession checks if a session with given JTI is valid
func (ss *SessionService) ValidateSession(jti uuid.UUID) (*models.Session, error) {
	var session models.Session
	if err := ss.db.Where("jti = ? AND is_active = true AND is_revoked = false AND expires_at > ?",
		jti, time.Now()).First(&session).Error; err != nil {
		return nil, fmt.Errorf("invalid or expired session: %w", err)
	}

	return &session, nil
}

// CleanupExpiredSessions removes expired sessions from database
func (ss *SessionService) CleanupExpiredSessions() error {
	return ss.db.Where("expires_at < ?", time.Now()).Delete(&models.Session{}).Error
}

// TOTPService handles TOTP 2FA operations
type TOTPService struct {
	db    *gorm.DB
	cache *cache.Cache
}

// NewTOTPService creates a new TOTP service
func NewTOTPService(db *gorm.DB, cache *cache.Cache) *TOTPService {
	return &TOTPService{
		db:    db,
		cache: cache,
	}
}

// GenerateTOTPSecret generates a new TOTP secret and QR code for user
func (ts *TOTPService) GenerateTOTPSecret(userID uuid.UUID, email string, issuer string) (secret string, qrCode string, err error) {
	if email == "" {
		return "", "", fmt.Errorf("email cannot be empty")
	}

	// Check if user exists
	var user models.User
	if err := ts.db.First(&user, "id = ?", userID).Error; err != nil {
		return "", "", fmt.Errorf("user not found: %w", err)
	}

	// Check if TOTP is already enabled
	if user.TOTPEnabled {
		return "", "", fmt.Errorf("TOTP is already enabled for this user")
	}

	// Generate TOTP key using utils
	var key interface{}
	if issuer != "" {
		key, err = utils.GenerateTOTPKey(email, issuer)
	} else {
		key, err = utils.GenerateTOTPKey(email)
	}

	if err != nil {
		return "", "", fmt.Errorf("failed to generate TOTP key: %w", err)
	}

	// Type assert the key
	totpKey, ok := key.(*otp.Key)
	if !ok {
		return "", "", fmt.Errorf("invalid TOTP key type")
	}

	// Get the secret from the key
	secret = totpKey.Secret()

	// Generate QR code from the key
	qrCode, err = utils.GenerateQRCode(totpKey)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate QR code: %w", err)
	}

	// Return the unencrypted secret (it will be encrypted when EnableTOTP is called)
	// The QR code is returned as base64 data URL for frontend display
	return secret, qrCode, nil
}

// VerifyTOTPCode verifies a TOTP code against user's secret
func (ts *TOTPService) VerifyTOTPCode(userID uuid.UUID, code string) (bool, error) {
	if code == "" {
		return false, fmt.Errorf("TOTP code cannot be empty")
	}

	// Get user's TOTP secret from database
	var user models.User
	if err := ts.db.First(&user, "id = ?", userID).Error; err != nil {
		return false, fmt.Errorf("user not found: %w", err)
	}

	// Check if TOTP is enabled
	if !user.TOTPEnabled {
		return false, fmt.Errorf("TOTP not enabled for this user")
	}

	if user.TOTPSecret == "" {
		return false, fmt.Errorf("TOTP secret not found")
	}

	// Decrypt the TOTP secret
	secret, err := utils.DecryptString(user.TOTPSecret)
	if err != nil {
		return false, fmt.Errorf("failed to decrypt TOTP secret: %w", err)
	}

	// Validate the TOTP code using utils
	// This checks the code against the secret with ±30 second time skew
	isValid := utils.ValidateTOTPCode(code, secret)

	return isValid, nil
}

// EnableTOTP enables TOTP for a user and saves the encrypted secret
func (ts *TOTPService) EnableTOTP(userID uuid.UUID, secret string) error {
	if secret == "" {
		return fmt.Errorf("TOTP secret cannot be empty")
	}

	// Check if user exists
	var user models.User
	if err := ts.db.First(&user, "id = ?", userID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Check if TOTP is already enabled
	if user.TOTPEnabled {
		return fmt.Errorf("TOTP is already enabled for this user")
	}

	// Encrypt the TOTP secret before storing
	encryptedSecret, err := utils.EncryptString(secret)
	if err != nil {
		return fmt.Errorf("failed to encrypt TOTP secret: %w", err)
	}

	// Save encrypted secret and enable TOTP
	return ts.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"totp_secret":  encryptedSecret,
		"totp_enabled": true,
	}).Error
}

// DisableTOTP disables TOTP for a user
func (ts *TOTPService) DisableTOTP(userID uuid.UUID) error {
	return ts.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"totp_secret":  "",
		"totp_enabled": false,
	}).Error
}
