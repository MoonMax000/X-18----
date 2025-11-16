-- Migration: Add Profile Paywall fields
-- Date: 2025-11-16
-- Description: Add fields for private profiles, subscription discounts, and content stats

-- Add paywall fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_profile_private BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_discount_price INTEGER DEFAULT 300,
ADD COLUMN IF NOT EXISTS subscription_discount_percentage INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS subscription_discount_days INTEGER DEFAULT 30;

-- Add index for performance on private profile checks
CREATE INDEX IF NOT EXISTS idx_users_profile_private ON users(is_profile_private);

-- Add created_via field to subscriptions table to track subscription source
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS created_via VARCHAR(50) DEFAULT 'card_charge';

-- Add composite index for fast subscription status checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
ON subscriptions(subscriber_id, creator_id, status, expires_at);

-- Add index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at 
ON subscriptions(expires_at) WHERE status = 'active';
