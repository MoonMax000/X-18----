package models

import (
	"time"

	"github.com/google/uuid"
)

// News - новости для виджета (управляются через админку)
type News struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Content     string    `gorm:"type:text" json:"content,omitempty"` // Полный текст новости
	URL         string    `gorm:"type:text" json:"url,omitempty"`     // Внешняя ссылка (опционально)
	ImageURL    string    `gorm:"type:text" json:"image_url,omitempty"`
	Category    string    `gorm:"type:varchar(50);index" json:"category"` // crypto, stocks, market
	Source      string    `gorm:"type:varchar(100)" json:"source"`
	Status      string    `gorm:"type:varchar(20);default:'draft';index" json:"status"` // draft, published
	CreatedBy   uuid.UUID `gorm:"type:uuid;not null" json:"created_by"`
	IsActive    bool      `gorm:"default:true;index" json:"is_active"`
	PublishedAt time.Time `gorm:"index" json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Creator User `gorm:"foreignKey:CreatedBy;constraint:OnDelete:CASCADE" json:"creator,omitempty"`
}

func (News) TableName() string {
	return "news"
}

// UserBlock - блокировка пользователей
type UserBlock struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	BlockerID uuid.UUID `gorm:"type:uuid;not null;index:idx_blocker_blocked,unique" json:"blocker_id"`
	BlockedID uuid.UUID `gorm:"type:uuid;not null;index:idx_blocker_blocked,unique;index:idx_blocked" json:"blocked_id"`
	Reason    string    `gorm:"type:text" json:"reason,omitempty"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	Blocker User `gorm:"foreignKey:BlockerID;constraint:OnDelete:CASCADE" json:"blocker,omitempty"`
	Blocked User `gorm:"foreignKey:BlockedID;constraint:OnDelete:CASCADE" json:"blocked,omitempty"`
}

func (UserBlock) TableName() string {
	return "user_blocks"
}

// PostReport - жалобы на посты
type PostReport struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PostID     uuid.UUID  `gorm:"type:uuid;not null;index" json:"post_id"`
	ReporterID uuid.UUID  `gorm:"type:uuid;not null;index" json:"reporter_id"`
	Reason     string     `gorm:"type:varchar(50);not null" json:"reason"` // spam, harassment, inappropriate, etc
	Details    string     `gorm:"type:text" json:"details,omitempty"`
	Status     string     `gorm:"type:varchar(20);default:'pending';index" json:"status"` // pending, reviewed, resolved, dismissed
	ReviewedBy *uuid.UUID `gorm:"type:uuid" json:"reviewed_by,omitempty"`
	ReviewNote string     `gorm:"type:text" json:"review_note,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`

	// Relationships
	Post     Post  `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"post,omitempty"`
	Reporter User  `gorm:"foreignKey:ReporterID;constraint:OnDelete:CASCADE" json:"reporter,omitempty"`
	Reviewer *User `gorm:"foreignKey:ReviewedBy;constraint:OnDelete:SET NULL" json:"reviewer,omitempty"`
}

func (PostReport) TableName() string {
	return "post_reports"
}

// PinnedPost - закрепленные посты (один пост на пользователя)
type PinnedPost struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null" json:"post_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Post Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"post,omitempty"`
}

func (PinnedPost) TableName() string {
	return "pinned_posts"
}
