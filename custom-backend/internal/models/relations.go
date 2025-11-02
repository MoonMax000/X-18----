package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Follow represents a follow relationship between users
type Follow struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FollowerID  uuid.UUID `gorm:"type:uuid;not null;index:idx_follower;uniqueIndex:idx_follow_unique" json:"follower_id"`
	FollowingID uuid.UUID `gorm:"type:uuid;not null;index:idx_following;uniqueIndex:idx_follow_unique" json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`

	Follower  User `gorm:"foreignKey:FollowerID;constraint:OnDelete:CASCADE" json:"-"`
	Following User `gorm:"foreignKey:FollowingID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Follow) TableName() string {
	return "follows"
}

func (f *Follow) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

// Like represents a like on a post
type Like struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index:idx_user_likes;uniqueIndex:idx_like_unique" json:"user_id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null;index:idx_post_likes;uniqueIndex:idx_like_unique" json:"post_id"`
	CreatedAt time.Time `json:"created_at"`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Post Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Like) TableName() string {
	return "likes"
}

func (l *Like) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}

// Retweet represents a retweet of a post
type Retweet struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index:idx_user_retweets;uniqueIndex:idx_retweet_unique" json:"user_id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null;index:idx_post_retweets;uniqueIndex:idx_retweet_unique" json:"post_id"`
	CreatedAt time.Time `json:"created_at"`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Post Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Retweet) TableName() string {
	return "retweets"
}

func (r *Retweet) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// Bookmark represents a bookmarked post
type Bookmark struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index:idx_user_bookmarks;uniqueIndex:idx_bookmark_unique" json:"user_id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_bookmark_unique" json:"post_id"`
	CreatedAt time.Time `json:"created_at"`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Post Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Bookmark) TableName() string {
	return "bookmarks"
}

func (b *Bookmark) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// Notification represents a user notification
type Notification struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID  `gorm:"type:uuid;not null;index:idx_user_notifs" json:"user_id"`
	FromUserID *uuid.UUID `gorm:"type:uuid" json:"actor_id,omitempty"`

	Type   string     `gorm:"size:50;not null" json:"type"` // like, retweet, follow, reply, mention
	PostID *uuid.UUID `gorm:"type:uuid" json:"post_id,omitempty"`

	Read      bool      `gorm:"default:false;index:idx_unread" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`

	User     User  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	FromUser *User `gorm:"foreignKey:FromUserID" json:"actor,omitempty"`
	Post     *Post `gorm:"foreignKey:PostID" json:"post,omitempty"`
}

func (Notification) TableName() string {
	return "notifications"
}

func (n *Notification) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}
	return nil
}

// Media represents an uploaded media file
type Media struct {
	ID     uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID uuid.UUID  `gorm:"type:uuid;not null;index:idx_user_media" json:"user_id"`
	PostID *uuid.UUID `gorm:"type:uuid;index:idx_post_media" json:"post_id,omitempty"`

	Type         string `gorm:"size:20;not null" json:"type"` // image, video, gif
	URL          string `gorm:"size:500;not null" json:"url"`
	ThumbnailURL string `gorm:"size:500" json:"thumbnail_url,omitempty"`
	AltText      string `gorm:"type:text" json:"alt_text,omitempty"`

	Width     int   `json:"width,omitempty"`
	Height    int   `json:"height,omitempty"`
	SizeBytes int64 `json:"size_bytes,omitempty"`

	// Crop/Transform data (stores crop coordinates from MediaEditor)
	Transform   string `gorm:"type:text" json:"transform,omitempty"`   // JSON string with crop data
	OriginalURL string `gorm:"size:500" json:"original_url,omitempty"` // URL to original before crop

	// Security fields
	Status       string    `gorm:"size:20;default:'processing';index" json:"status,omitempty"` // processing, ready, failed
	ProcessedAt  time.Time `json:"processed_at,omitempty"`
	OriginalHash string    `gorm:"size:100" json:"-"` // Hash for duplicate detection

	CreatedAt time.Time `json:"created_at"`

	User User  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Post *Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Media) TableName() string {
	return "media"
}

func (m *Media) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

// Session represents a user session with refresh token and device tracking
type Session struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;not null;index:idx_user_sessions" json:"user_id"`
	RefreshTokenHash string    `gorm:"size:255;not null;index:idx_token" json:"-"`
	ExpiresAt        time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt        time.Time `json:"created_at"`

	// Device tracking fields
	DeviceType   string     `gorm:"size:20" json:"device_type,omitempty"` // mobile, tablet, desktop
	Browser      string     `gorm:"size:50" json:"browser,omitempty"`     // Chrome, Firefox, Safari, etc.
	OS           string     `gorm:"size:50" json:"os,omitempty"`          // Windows, macOS, Linux, Android, iOS
	IPAddress    string     `gorm:"size:45" json:"ip_address,omitempty"`  // IPv4 or IPv6
	UserAgent    string     `gorm:"size:500" json:"user_agent,omitempty"` // Full user agent string
	LastActiveAt *time.Time `json:"last_active_at,omitempty"`             // Last activity timestamp

	// Computed field (not stored in DB)
	IsCurrent bool `gorm:"-" json:"is_current"`

	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Session) TableName() string {
	return "sessions"
}

func (s *Session) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Subscription represents a paid subscription to an author
type Subscription struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SubscriberID         uuid.UUID  `gorm:"type:uuid;not null;index:idx_subscriber;uniqueIndex:idx_subscription_unique" json:"subscriber_id"`
	AuthorID             uuid.UUID  `gorm:"type:uuid;not null;index:idx_author;uniqueIndex:idx_subscription_unique" json:"author_id"`
	StripeSubscriptionID string     `gorm:"size:100" json:"stripe_subscription_id,omitempty"`
	Status               string     `gorm:"size:20;default:'active';index:idx_active_subs" json:"status"` // active, canceled, expired
	StartedAt            time.Time  `json:"started_at"`
	ExpiresAt            *time.Time `json:"expires_at,omitempty"`

	Subscriber User `gorm:"foreignKey:SubscriberID;constraint:OnDelete:CASCADE" json:"-"`
	Author     User `gorm:"foreignKey:AuthorID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Subscription) TableName() string {
	return "subscriptions"
}

func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// Purchase represents a one-time purchase of a post
type Purchase struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	BuyerID         uuid.UUID `gorm:"type:uuid;not null;index:idx_buyer_purchases;uniqueIndex:idx_purchase_unique" json:"buyer_id"`
	PostID          uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_purchase_unique" json:"post_id"`
	Amount          float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	StripePaymentID string    `gorm:"size:100" json:"stripe_payment_id,omitempty"`
	CreatedAt       time.Time `json:"created_at"`

	Buyer User `gorm:"foreignKey:BuyerID;constraint:OnDelete:CASCADE" json:"-"`
	Post  Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Purchase) TableName() string {
	return "purchases"
}

func (p *Purchase) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
