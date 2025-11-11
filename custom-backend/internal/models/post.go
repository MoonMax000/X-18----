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
	UserID uuid.UUID `gorm:"type:uuid;not null;index:idx_user_posts" json:"userId"`

	// Content
	Content        string `gorm:"type:text;not null" json:"content"`
	ContentHTML    string `gorm:"type:text" json:"contentHTML,omitempty"` // Sanitized HTML version
	ContentWarning string `gorm:"type:text" json:"contentWarning,omitempty"`

	// Visibility & Type
	Visibility string  `gorm:"size:20;default:'public';index" json:"visibility"`    // public, followers, private
	IsPaid     bool    `gorm:"default:false" json:"isPaid"`                         // Legacy field
	Price      float64 `gorm:"type:decimal(10,2);default:0" json:"price,omitempty"` // Legacy field

	// Premium Content (Phase 2)
	IsPremium   bool   `gorm:"column:is_premium;default:false;index" json:"isPremium"`     // Is this premium content
	PriceCents  int    `gorm:"column:price_cents;default:0" json:"priceCents"`             // Price in cents (100 = $1.00)
	PreviewText string `gorm:"column:preview_text;type:text" json:"previewText,omitempty"` // Preview for non-subscribers
	Category    string `gorm:"column:category;size:50;index" json:"category,omitempty"`    // Content category
	Tags        string `gorm:"column:tags;type:text" json:"tags,omitempty"`                // Comma-separated tags

	// Access Control (Phase 3)
	AccessLevel string `gorm:"column:access_level;size:30;default:'free';index" json:"accessLevel"` // free, pay-per-post, subscribers-only, followers-only, premium
	ReplyPolicy string `gorm:"column:reply_policy;size:30;default:'everyone'" json:"replyPolicy"`   // everyone, following, verified, mentioned

	// Thread/Reply
	ReplyToID  *uuid.UUID `gorm:"type:uuid;index:idx_replies" json:"replyToId,omitempty"`
	RootPostID *uuid.UUID `gorm:"type:uuid;index:idx_thread" json:"rootPostId,omitempty"`

	// Stats (denormalized)
	LikesCount    int `gorm:"default:0" json:"likesCount"`
	RetweetsCount int `gorm:"default:0" json:"retweetsCount"`
	RepliesCount  int `gorm:"default:0" json:"repliesCount"`
	ViewsCount    int `gorm:"default:0" json:"viewsCount"`

	// Trading metadata (JSONB)
	Metadata Metadata `gorm:"type:jsonb" json:"metadata,omitempty"`

	CreatedAt time.Time `gorm:"index:idx_timeline" json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Relationships
	User     User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	ReplyTo  *Post      `gorm:"foreignKey:ReplyToID" json:"replyTo,omitempty"`
	Media    []Media    `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"media,omitempty"`
	Likes    []Like     `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
	Retweets []Retweet  `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
	Bookmark []Bookmark `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`

	// Transient fields (not stored in DB, computed per-request)
	IsLiked      bool    `gorm:"-" json:"isLiked,omitempty"`
	IsRetweeted  bool    `gorm:"-" json:"isRetweeted,omitempty"`
	IsBookmarked bool    `gorm:"-" json:"isBookmarked,omitempty"`
	IsPurchased  bool    `gorm:"-" json:"isPurchased,omitempty"`
	IsSubscriber bool    `gorm:"-" json:"isSubscriber,omitempty"`
	IsFollower   bool    `gorm:"-" json:"isFollower,omitempty"`
	PostPrice    float64 `gorm:"-" json:"postPrice,omitempty"`
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
	UserID         uuid.UUID  `json:"userId"`
	Content        string     `json:"content"`
	ContentWarning string     `json:"contentWarning,omitempty"`
	Visibility     string     `json:"visibility"`
	IsPaid         bool       `json:"isPaid"`
	Price          float64    `json:"price,omitempty"`
	ReplyToID      *uuid.UUID `json:"replyToId,omitempty"`
	RootPostID     *uuid.UUID `json:"rootPostId,omitempty"`
	LikesCount     int        `json:"likesCount"`
	RetweetsCount  int        `json:"retweetsCount"`
	RepliesCount   int        `json:"repliesCount"`
	ViewsCount     int        `json:"viewsCount"`
	Metadata       Metadata   `json:"metadata,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
	User           PublicUser `json:"user"`
	Media          []Media    `json:"media,omitempty"`
	IsLiked        bool       `json:"isLiked"`
	IsRetweeted    bool       `json:"isRetweeted"`
	IsBookmarked   bool       `json:"isBookmarked"`
}
