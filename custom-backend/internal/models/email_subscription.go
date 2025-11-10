package models

import (
	"time"

	"github.com/google/uuid"
)

// EmailSubscription represents a newsletter subscription
type EmailSubscription struct {
	ID             uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email          string     `gorm:"type:varchar(255);not null;unique" json:"email"`
	SubscribedAt   time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"subscribed_at"`
	UnsubscribedAt *time.Time `json:"unsubscribed_at,omitempty"`
	IsActive       bool       `gorm:"default:true" json:"is_active"`
	Source         string     `gorm:"type:varchar(50);default:'footer_form'" json:"source"`
	IPAddress      string     `gorm:"type:varchar(45)" json:"ip_address,omitempty"`
	UserAgent      string     `gorm:"type:text" json:"user_agent,omitempty"`
	CreatedAt      time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// TableName specifies the table name for the EmailSubscription model
func (EmailSubscription) TableName() string {
	return "email_subscriptions"
}

// SubscribeRequest represents the request body for subscribing to newsletter
type SubscribeRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// UnsubscribeRequest represents the request body for unsubscribing from newsletter
type UnsubscribeRequest struct {
	Email string `json:"email" binding:"required,email"`
}
