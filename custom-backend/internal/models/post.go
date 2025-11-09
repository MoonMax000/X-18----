package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Metadata is a custom type for JSONB storage
type Metadata map[string]interface{}

// Scan implements sql.Scanner interface
func (m *Metadata) Scan(value interface{}) error {
	if value == nil {
		*m = make(Metadata)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, m)
}

// Value implements driver.Valuer interface
func (m Metadata) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	return json.Marshal(m)
}

type Post struct {
	ID     uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID uuid.UUID `gorm:"type:uuid;not null;index:idx_user_posts" json:"user_id"`

	// Content
	Content        string `gorm:"type:text;not null" json:"content"`
	ContentHTML    string `gorm:"type:text" json:"content_html,omitempty"` // Sanitized HTML version
	ContentWarning string `gorm:"type:text" json:"content_warning,omitempty"`

	// Visibility & Type
	Visibility string  `gorm:"size:20;default:'public';index" json:"visibility"`    // public, followers, private
	IsPaid     bool    `gorm:"default:false" json:"is_paid"`                        // Legacy field
	Price      float64 `gorm:"type:decimal(10,2);default:0" json:"price,omitempty"` // Legacy field

	// Premium Content (Phase 2)
	IsPremium   bool   `gorm:"default:false;index" json:"is_premium"`   // Is this premium content
	PriceCents  int    `gorm:"default:0" json:"price_cents,omitempty"`  // Price in cents (100 = $1.00)
	PreviewText string `gorm:"type:text" json:"preview_text,omitempty"` // Preview for non-subscribers
	Category    string `gorm:"size:50;index" json:"category,omitempty"` // Content category
	Tags        string `gorm:"type:text" json:"tags,omitempty"`         // Comma-separated tags

	// Access Control (Phase 3)
	AccessLevel string `gorm:"size:30;default:'free';index" json:"access_level"` // free, pay-per-post, subscribers-only, followers-only, premium
	ReplyPolicy string `gorm:"size:30;default:'everyone'" json:"reply_policy"`   // everyone, following, verified, mentioned

	// Thread/Reply
	ReplyToID  *uuid.UUID `gorm:"type:uuid;index:idx_replies" json:"reply_to_id,omitempty"`
	RootPostID *uuid.UUID `gorm:"type:uuid;index:idx_thread" json:"root_post_id,omitempty"`

	// Stats (denormalized)
	LikesCount    int `gorm:"default:0" json:"likes_count"`
	RetweetsCount int `gorm:"default:0" json:"retweets_count"`
	RepliesCount  int `gorm:"default:0" json:"replies_count"`
	ViewsCount    int `gorm:"default:0" json:"views_count"`

	// Trading metadata (JSONB)
	Metadata Metadata `gorm:"type:jsonb" json:"metadata,omitempty"`

	CreatedAt time.Time `gorm:"index:idx_timeline" json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	User     User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	ReplyTo  *Post      `gorm:"foreignKey:ReplyToID" json:"reply_to,omitempty"`
	Media    []Media    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"media,omitempty"`
	Likes    []Like     `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
	Retweets []Retweet  `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
	Bookmark []Bookmark `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`

	// Transient fields (not stored in DB, computed per-request)
	IsLiked      bool `gorm:"-" json:"is_liked,omitempty"`
	IsRetweeted  bool `gorm:"-" json:"is_retweeted,omitempty"`
	IsBookmarked bool `gorm:"-" json:"is_bookmarked,omitempty"`
}

func (Post) TableName() string {
	return "posts"
}

func (p *Post) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// PostWithUser is a post with user information included
type PostWithUser struct {
	Post
	User PublicUser `json:"user"`
}

// PostResponse is the API response format
type PostResponse struct {
	ID             uuid.UUID  `json:"id"`
	UserID         uuid.UUID  `json:"user_id"`
	Content        string     `json:"content"`
	ContentWarning string     `json:"content_warning,omitempty"`
	Visibility     string     `json:"visibility"`
	IsPaid         bool       `json:"is_paid"`
	Price          float64    `json:"price,omitempty"`
	ReplyToID      *uuid.UUID `json:"reply_to_id,omitempty"`
	RootPostID     *uuid.UUID `json:"root_post_id,omitempty"`
	LikesCount     int        `json:"likes_count"`
	RetweetsCount  int        `json:"retweets_count"`
	RepliesCount   int        `json:"replies_count"`
	ViewsCount     int        `json:"views_count"`
	Metadata       Metadata   `json:"metadata,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	User           PublicUser `json:"user"`
	Media          []Media    `json:"media,omitempty"`
	IsLiked        bool       `json:"is_liked"`
	IsRetweeted    bool       `json:"is_retweeted"`
	IsBookmarked   bool       `json:"is_bookmarked"`
}
