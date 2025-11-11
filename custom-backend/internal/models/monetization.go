package models

import (
	"time"

	"github.com/google/uuid"
)

// PostPurchase represents a purchase of a pay-per-post content
type PostPurchase struct {
	ID                    uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID                uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	PostID                uuid.UUID `gorm:"type:uuid;not null;index" json:"post_id"`
	AmountCents           int64     `gorm:"not null" json:"amount_cents"`
	StripePaymentIntentID string    `gorm:"size:255" json:"stripe_payment_intent_id"`
	PurchasedAt           time.Time `gorm:"not null" json:"purchased_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Post Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"post,omitempty"`
}

func (PostPurchase) TableName() string {
	return "post_purchases"
}

// Subscription represents a subscription to a creator
type Subscription struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SubscriberID         uuid.UUID  `gorm:"type:uuid;not null;index" json:"subscriber_id"`
	CreatorID            uuid.UUID  `gorm:"type:uuid;not null;index" json:"creator_id"`
	Status               string     `gorm:"size:20;not null;default:'active'" json:"status"` // active, cancelled, expired
	StripeSubscriptionID *string    `gorm:"size:255" json:"stripe_subscription_id,omitempty"`
	CreatedAt            time.Time  `gorm:"not null" json:"created_at"`
	UpdatedAt            *time.Time `json:"updated_at,omitempty"`
	ExpiresAt            *time.Time `json:"expires_at,omitempty"`

	// Relationships
	Subscriber User `gorm:"foreignKey:SubscriberID;constraint:OnDelete:CASCADE" json:"subscriber,omitempty"`
	Creator    User `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"creator,omitempty"`
}

func (Subscription) TableName() string {
	return "subscriptions"
}

// PaymentHistory represents payment transaction history
type PaymentHistory struct {
	ID              uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;not null;index" json:"user_id"`
	RecipientID     uuid.UUID  `gorm:"type:uuid;not null;index" json:"recipient_id"`
	AmountCents     int64      `gorm:"not null" json:"amount_cents"`
	Type            string     `gorm:"size:20;not null" json:"type"`                     // post_purchase, subscription
	Status          string     `gorm:"size:20;not null;default:'pending'" json:"status"` // pending, completed, failed, refunded
	StripePaymentID string     `gorm:"size:255" json:"stripe_payment_id"`
	Description     string     `gorm:"type:text" json:"description,omitempty"`
	CreatedAt       time.Time  `gorm:"not null" json:"created_at"`
	ProcessedAt     *time.Time `json:"processed_at,omitempty"`

	// Relationships
	User      User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Recipient User `gorm:"foreignKey:RecipientID;constraint:OnDelete:CASCADE" json:"recipient,omitempty"`
}

func (PaymentHistory) TableName() string {
	return "payment_history"
}
