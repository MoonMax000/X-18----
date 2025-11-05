package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserOAuthIdentity represents an OAuth provider identity linked to a user account
// Allows users to link multiple OAuth providers (Google, Apple, Twitter, etc.)
type UserOAuthIdentity struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID `gorm:"type:uuid;not null;index:idx_oauth_identities_user_id" json:"user_id"`
	Provider       string    `gorm:"size:50;not null;uniqueIndex:idx_provider_user" json:"provider"`          // 'google', 'apple', 'twitter'
	ProviderUserID string    `gorm:"size:255;not null;uniqueIndex:idx_provider_user" json:"provider_user_id"` // OAuth provider's user ID (sub claim)
	Email          string    `gorm:"size:255" json:"email"`
	EmailVerified  bool      `gorm:"default:false" json:"email_verified"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (UserOAuthIdentity) TableName() string {
	return "user_oauth_identities"
}

// BeforeCreate hook to generate UUID
func (uoi *UserOAuthIdentity) BeforeCreate(tx *gorm.DB) error {
	if uoi.ID == uuid.Nil {
		uoi.ID = uuid.New()
	}
	return nil
}

// FindByProvider finds an OAuth identity by provider and provider user ID
func FindOAuthIdentityByProvider(db *gorm.DB, provider, providerUserID string) (*UserOAuthIdentity, error) {
	var identity UserOAuthIdentity
	err := db.Where("provider = ? AND provider_user_id = ?", provider, providerUserID).First(&identity).Error
	if err != nil {
		return nil, err
	}
	return &identity, nil
}

// FindUserOAuthIdentities gets all OAuth identities for a user
func FindUserOAuthIdentities(db *gorm.DB, userID uuid.UUID) ([]UserOAuthIdentity, error) {
	var identities []UserOAuthIdentity
	err := db.Where("user_id = ?", userID).Find(&identities).Error
	return identities, err
}

// CreateOAuthIdentity creates a new OAuth identity for a user
func CreateOAuthIdentity(db *gorm.DB, userID uuid.UUID, provider, providerUserID, email string, emailVerified bool) (*UserOAuthIdentity, error) {
	identity := &UserOAuthIdentity{
		UserID:         userID,
		Provider:       provider,
		ProviderUserID: providerUserID,
		Email:          email,
		EmailVerified:  emailVerified,
	}

	err := db.Create(identity).Error
	if err != nil {
		return nil, err
	}

	return identity, nil
}

// UpdateOAuthIdentity updates an existing OAuth identity
func UpdateOAuthIdentity(db *gorm.DB, identity *UserOAuthIdentity) error {
	return db.Save(identity).Error
}

// DeleteOAuthIdentity removes an OAuth identity
func DeleteOAuthIdentity(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&UserOAuthIdentity{}, "id = ?", id).Error
}

// HasOAuthProvider checks if a user has a specific OAuth provider linked
func HasOAuthProvider(db *gorm.DB, userID uuid.UUID, provider string) (bool, error) {
	var count int64
	err := db.Model(&UserOAuthIdentity{}).
		Where("user_id = ? AND provider = ?", userID, provider).
		Count(&count).Error
	return count > 0, err
}
