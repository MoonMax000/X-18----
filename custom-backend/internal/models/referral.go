package models

import (
	"time"

	"github.com/google/uuid"
)

// ReferralCode представляет реферальный код пользователя
type ReferralCode struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	Code      string     `json:"code" gorm:"type:varchar(8);unique;not null"`
	TotalUses int        `json:"total_uses" gorm:"default:0"`
	MaxUses   *int       `json:"max_uses,omitempty"`
	IsActive  bool       `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time  `json:"created_at" gorm:"default:NOW()"`
	UpdatedAt time.Time  `json:"updated_at" gorm:"default:NOW()"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

// ReferralInvitation представляет приглашение по реферальному коду
type ReferralInvitation struct {
	ID             uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ReferrerID     uuid.UUID  `json:"referrer_id" gorm:"type:uuid;not null"`
	ReferredUserID *uuid.UUID `json:"referred_user_id,omitempty" gorm:"type:uuid"`
	Code           string     `json:"code" gorm:"type:varchar(8);not null"`
	Status         string     `json:"status" gorm:"type:varchar(20);default:'pending'"` // pending, completed, rewarded
	IPAddress      string     `json:"ip_address,omitempty"`
	UserAgent      string     `json:"user_agent,omitempty"`
	CreatedAt      time.Time  `json:"created_at" gorm:"default:NOW()"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`
}

// ReferralReward представляет награду за реферал
type ReferralReward struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	InvitationID uuid.UUID  `json:"invitation_id" gorm:"type:uuid;not null"`
	RewardType   string     `json:"reward_type" gorm:"type:varchar(50);not null"` // credit, plan_upgrade, bonus_features
	RewardAmount float64    `json:"reward_amount"`
	Currency     string     `json:"currency,omitempty" gorm:"type:varchar(3)"`
	Tier         int        `json:"tier" gorm:"default:1"`                            // 1, 2, or 3
	Status       string     `json:"status" gorm:"type:varchar(20);default:'pending'"` // pending, credited, expired
	Description  string     `json:"description,omitempty"`
	CreatedAt    time.Time  `json:"created_at" gorm:"default:NOW()"`
	CreditedAt   *time.Time `json:"credited_at,omitempty"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty"`
}

// ReferralStats представляет статистику рефералов пользователя
type ReferralStats struct {
	TotalInvites     int     `json:"total_invites"`
	CompletedInvites int     `json:"completed_invites"`
	PendingInvites   int     `json:"pending_invites"`
	TotalEarnings    float64 `json:"total_earnings"`
	CurrentTier      int     `json:"current_tier"`
	NextTierProgress int     `json:"next_tier_progress"` // Сколько до следующего тира
}

// TableName specifies the table name for ReferralCode
func (ReferralCode) TableName() string {
	return "referral_codes"
}

// TableName specifies the table name for ReferralInvitation
func (ReferralInvitation) TableName() string {
	return "referral_invitations"
}

// TableName specifies the table name for ReferralReward
func (ReferralReward) TableName() string {
	return "referral_rewards"
}
