package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Sector represents a user category/interest
type Sector struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null;size:100" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Icon        string    `gorm:"size:50" json:"icon"`
	Color       string    `gorm:"size:7" json:"color"` // hex color
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Many-to-many relationship with users
	Users []User `gorm:"many2many:user_sectors" json:"-"`
}

// LoginAttempt tracks login attempts for security
type LoginAttempt struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	Email         string     `gorm:"size:255" json:"email"`
	UserID        *uuid.UUID `gorm:"type:uuid" json:"user_id,omitempty"`
	IPAddress     string     `gorm:"not null;size:45" json:"ip_address"` // Support IPv6
	UserAgent     string     `gorm:"type:text" json:"user_agent"`
	Success       bool       `gorm:"default:false" json:"success"`
	FailureReason string     `gorm:"size:100" json:"failure_reason,omitempty"` // wrong_password, account_locked, ip_blocked
	AttemptedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"attempted_at"`

	// Relations
	User *User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// IPLockout tracks IP-based lockouts
type IPLockout struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	IPAddress    string     `gorm:"uniqueIndex;not null;size:45" json:"ip_address"`
	Attempts     int        `gorm:"default:1" json:"attempts"`
	BlockedUntil *time.Time `json:"blocked_until,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// UserLockout tracks user-based lockouts
type UserLockout struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	Attempts     int        `gorm:"default:1" json:"attempts"`
	BlockedUntil *time.Time `json:"blocked_until,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// VerificationType represents the type of verification code
type VerificationType string

const (
	VerificationTypeEmail         VerificationType = "email_verification"
	VerificationTypePhone         VerificationType = "phone_verification"
	VerificationType2FA           VerificationType = "2fa"
	VerificationTypePasswordReset VerificationType = "password_reset"
)

// VerificationMethod represents how the code is sent
type VerificationMethod string

const (
	VerificationMethodEmail VerificationMethod = "email"
	VerificationMethodSMS   VerificationMethod = "sms"
)

// VerificationCode stores temporary verification codes
type VerificationCode struct {
	ID        uint               `gorm:"primaryKey" json:"id"`
	UserID    uuid.UUID          `gorm:"type:uuid;not null" json:"user_id"`
	Code      string             `gorm:"not null;size:10" json:"code"`
	Type      VerificationType   `gorm:"not null;size:20" json:"type"`
	Method    VerificationMethod `gorm:"not null;size:10" json:"method"`
	Used      bool               `gorm:"default:false" json:"used"`
	ExpiresAt time.Time          `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time          `json:"created_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// IsExpired checks if the verification code has expired
func (v *VerificationCode) IsExpired() bool {
	return time.Now().After(v.ExpiresAt)
}

// SocialProvider represents OAuth provider type
type SocialProvider string

const (
	SocialProviderGoogle   SocialProvider = "google"
	SocialProviderGitHub   SocialProvider = "github"
	SocialProviderFacebook SocialProvider = "facebook"
	SocialProviderTwitter  SocialProvider = "twitter"
)

// JSONB type for storing raw OAuth data
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONB)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// SocialAccount represents linked OAuth accounts
type SocialAccount struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	Provider       SocialProvider `gorm:"not null;size:50" json:"provider"`
	ProviderUserID string         `gorm:"not null;size:255" json:"provider_user_id"`
	AccessToken    string         `gorm:"type:text" json:"-"` // Hidden in JSON
	RefreshToken   string         `gorm:"type:text" json:"-"` // Hidden in JSON
	TokenExpiresAt *time.Time     `json:"token_expires_at,omitempty"`
	Email          string         `gorm:"size:255" json:"email"`
	Name           string         `gorm:"size:255" json:"name"`
	AvatarURL      string         `gorm:"type:text" json:"avatar_url"`
	RawData        JSONB          `gorm:"type:jsonb" json:"raw_data,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// ExtendedSession represents enhanced session tracking
type ExtendedSession struct {
	Session
	IPAddress    string    `gorm:"size:45" json:"ip_address"`
	UserAgent    string    `gorm:"type:text" json:"user_agent"`
	Fingerprint  string    `gorm:"type:text" json:"fingerprint"`
	DeviceName   string    `gorm:"size:100" json:"device_name"`
	DeviceType   string    `gorm:"size:50" json:"device_type"` // mobile, desktop, tablet
	Browser      string    `gorm:"size:50" json:"browser"`
	OS           string    `gorm:"size:50" json:"os"`
	Location     string    `gorm:"size:100" json:"location"` // City, Country from IP
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	LastActivity time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"last_activity"`
}

// Table name specifications
func (Sector) TableName() string           { return "sectors" }
func (LoginAttempt) TableName() string     { return "login_attempts" }
func (IPLockout) TableName() string        { return "ip_lockouts" }
func (UserLockout) TableName() string      { return "user_lockouts" }
func (VerificationCode) TableName() string { return "verification_codes" }
func (SocialAccount) TableName() string    { return "social_accounts" }
func (ExtendedSession) TableName() string  { return "sessions" }

// Helper methods for security checks

// IsIPBlocked checks if an IP is currently blocked
func IsIPBlocked(db interface {
	First(interface{}, ...interface{}) error
}, ipAddress string) (bool, *time.Time) {
	var lockout IPLockout
	err := db.First(&lockout, "ip_address = ? AND blocked_until > ?", ipAddress, time.Now())
	if err != nil {
		return false, nil
	}
	return true, lockout.BlockedUntil
}

// IsUserBlocked checks if a user is currently blocked
func IsUserBlocked(db interface {
	First(interface{}, ...interface{}) error
}, userID uuid.UUID) (bool, *time.Time) {
	var lockout UserLockout
	err := db.First(&lockout, "user_id = ? AND blocked_until > ?", userID, time.Now())
	if err != nil {
		return false, nil
	}
	return true, lockout.BlockedUntil
}
