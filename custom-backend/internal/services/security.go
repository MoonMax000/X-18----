package services

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/yourusername/x18-backend/internal/cache"
	"github.com/yourusername/x18-backend/internal/models"
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

// CreateSession creates a new session with enhanced tracking
func (ss *SessionService) CreateSession(userID uuid.UUID, c *fiber.Ctx, refreshTokenHash string, expiresAt time.Time) (*models.Session, error) {
	// Parse user agent info
	userAgent := c.Get("User-Agent")
	security := NewSecurityService(ss.db, ss.cache)
	deviceType, browser, os := security.ParseUserAgent(userAgent)

	// Get client IP
	ipAddress := GetClientIP(c)

	// Create session
	session := models.Session{
		UserID:           userID,
		RefreshTokenHash: refreshTokenHash,
		ExpiresAt:        expiresAt,
	}

	// Note: These fields would need to be added to the Session model
	// For now, we'll just save the basic session
	// In a real implementation, you'd extend the Session model or use ExtendedSession

	if err := ss.db.Create(&session).Error; err != nil {
		return nil, err
	}

	// Log session info (for now, just for tracking)
	// You could store this in a separate table or extend the Session model
	fmt.Printf("Session created - IP: %s, Device: %s, Browser: %s, OS: %s\n",
		ipAddress, deviceType, browser, os)

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
	return ss.db.Where("user_id = ?", userID).Delete(&models.Session{}).Error
}

// CleanupExpiredSessions removes expired sessions from database
func (ss *SessionService) CleanupExpiredSessions() error {
	return ss.db.Where("expires_at < ?", time.Now()).Delete(&models.Session{}).Error
}
