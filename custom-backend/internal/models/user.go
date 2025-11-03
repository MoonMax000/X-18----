package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Username string    `gorm:"uniqueIndex;not null;size:50" json:"username"`
	Email    string    `gorm:"uniqueIndex;not null;size:255" json:"email"`
	Password string    `gorm:"not null;size:255" json:"-"` // excluded from JSON

	// Profile
	FirstName   string `gorm:"size:50" json:"first_name"`
	LastName    string `gorm:"size:50" json:"last_name"`
	DisplayName string `gorm:"size:100" json:"display_name"`
	Bio         string `gorm:"type:text" json:"bio"`
	Location    string `gorm:"size:100" json:"location"`
	Website     string `gorm:"size:255" json:"website"`
	Role        string `gorm:"size:100" json:"role"`
	Sectors     string `gorm:"type:text" json:"sectors"` // JSON array stored as text
	AvatarURL   string `gorm:"size:500" json:"avatar_url"`
	HeaderURL   string `gorm:"size:500" json:"header_url"`

	// OAuth fields
	OAuthProvider   string `gorm:"size:50" json:"oauth_provider,omitempty"`     // google, apple, twitter
	OAuthProviderID string `gorm:"size:255" json:"oauth_provider_id,omitempty"` // provider's user ID

	// Extended fields from Django
	BackupEmail        string     `gorm:"size:255" json:"backup_email,omitempty"`
	BackupPhone        string     `gorm:"size:20" json:"backup_phone,omitempty"`
	Phone              string     `gorm:"size:20" json:"phone,omitempty"`
	Is2FAEnabled       bool       `gorm:"default:false" json:"is_2fa_enabled"`
	VerificationMethod string     `gorm:"size:10;default:'email'" json:"verification_method"` // email or sms
	IsEmailVerified    bool       `gorm:"default:false" json:"is_email_verified"`
	IsPhoneVerified    bool       `gorm:"default:false" json:"is_phone_verified"`
	EmailVerifiedAt    *time.Time `json:"email_verified_at,omitempty"`
	PhoneVerifiedAt    *time.Time `json:"phone_verified_at,omitempty"`

	// TOTP 2FA fields
	TOTPSecret  string `gorm:"size:255" json:"-"` // Hidden from JSON, encrypted secret
	TOTPEnabled bool   `gorm:"default:false" json:"totp_enabled"`

	// Account deactivation fields (30-day recovery period)
	DeactivatedAt       *time.Time `json:"deactivated_at,omitempty"`
	DeletionScheduledAt *time.Time `json:"deletion_scheduled_at,omitempty"`

	// Soft delete
	IsDeleted           bool       `gorm:"default:false" json:"is_deleted"`
	DeletionRequestedAt *time.Time `json:"deletion_requested_at,omitempty"`

	// Username change tracking (Twitter-like: 3 free changes, then once per week)
	UsernameChangesCount int        `gorm:"default:0" json:"username_changes_count"`
	LastUsernameChangeAt *time.Time `json:"last_username_change_at,omitempty"`

	// Monetization
	Verified          bool    `gorm:"default:false" json:"verified"`
	SubscriptionPrice float64 `gorm:"type:decimal(10,2);default:0" json:"subscription_price"`
	StripeAccountID   string  `gorm:"size:100" json:"stripe_account_id,omitempty"`

	// Stats (denormalized for performance)
	FollowersCount int `gorm:"default:0" json:"followers_count"`
	FollowingCount int `gorm:"default:0" json:"following_count"`
	PostsCount     int `gorm:"default:0" json:"posts_count"`

	// Settings
	PrivateAccount bool `gorm:"default:false" json:"private_account"`
	AllowComments  bool `gorm:"default:true" json:"allow_comments"`

	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	LastActiveAt *time.Time `json:"last_active_at,omitempty"`

	// Relationships
	Posts         []Post         `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Followers     []Follow       `gorm:"foreignKey:FollowingID;constraint:OnDelete:CASCADE" json:"-"`
	Following     []Follow       `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE" json:"-"`
	Likes         []Like         `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Retweets      []Retweet      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Bookmarks     []Bookmark     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Notifications []Notification `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Sessions      []Session      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// PublicUser returns user data safe for public display
type PublicUser struct {
	ID                uuid.UUID  `json:"id"`
	Username          string     `json:"username"`
	FirstName         string     `json:"first_name"`
	LastName          string     `json:"last_name"`
	DisplayName       string     `json:"display_name"`
	Bio               string     `json:"bio"`
	Location          string     `json:"location"`
	Website           string     `json:"website"`
	Role              string     `json:"role"`
	Sectors           string     `json:"sectors"`
	AvatarURL         string     `json:"avatar_url"`
	HeaderURL         string     `json:"header_url"`
	Verified          bool       `json:"verified"`
	SubscriptionPrice float64    `json:"subscription_price"`
	FollowersCount    int        `json:"followers_count"`
	FollowingCount    int        `json:"following_count"`
	PostsCount        int        `json:"posts_count"`
	PrivateAccount    bool       `json:"private_account"`
	CreatedAt         time.Time  `json:"created_at"`
	LastActiveAt      *time.Time `json:"last_active_at,omitempty"`
}

func (u *User) ToPublic() PublicUser {
	return PublicUser{
		ID:                u.ID,
		Username:          u.Username,
		FirstName:         u.FirstName,
		LastName:          u.LastName,
		DisplayName:       u.DisplayName,
		Bio:               u.Bio,
		Location:          u.Location,
		Website:           u.Website,
		Role:              u.Role,
		Sectors:           u.Sectors,
		AvatarURL:         u.AvatarURL,
		HeaderURL:         u.HeaderURL,
		Verified:          u.Verified,
		SubscriptionPrice: u.SubscriptionPrice,
		FollowersCount:    u.FollowersCount,
		FollowingCount:    u.FollowingCount,
		PostsCount:        u.PostsCount,
		PrivateAccount:    u.PrivateAccount,
		CreatedAt:         u.CreatedAt,
		LastActiveAt:      u.LastActiveAt,
	}
}

// MeUser returns user data for authenticated user (includes email)
type MeUser struct {
	PublicUser
	Email string `json:"email"`
}

func (u *User) ToMe() MeUser {
	return MeUser{
		PublicUser: u.ToPublic(),
		Email:      u.Email,
	}
}
