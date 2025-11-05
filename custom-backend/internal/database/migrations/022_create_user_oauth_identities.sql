-- Migration: Create user_oauth_identities table for multiple OAuth provider support
-- Description: Allows users to link multiple OAuth providers (Google, Apple, Twitter, etc.)
-- This replaces the single oauth_provider/oauth_provider_id columns in users table

CREATE TABLE IF NOT EXISTS user_oauth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'apple', 'twitter', etc.
    provider_user_id VARCHAR(255) NOT NULL, -- OAuth provider's user ID (sub claim)
    email VARCHAR(255), -- Email from OAuth provider
    email_verified BOOLEAN DEFAULT false, -- Whether email is verified by provider
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure one OAuth identity per provider per user ID from provider
    UNIQUE(provider, provider_user_id)
);

-- Index for looking up user's OAuth identities
CREATE INDEX IF NOT EXISTS idx_oauth_identities_user_id ON user_oauth_identities(user_id);

-- Index for OAuth provider lookups (used during login)
CREATE INDEX IF NOT EXISTS idx_oauth_identities_provider ON user_oauth_identities(provider, provider_user_id);

-- Add comments for documentation
COMMENT ON TABLE user_oauth_identities IS 'Stores multiple OAuth provider identities for each user';
COMMENT ON COLUMN user_oauth_identities.provider IS 'OAuth provider name (google, apple, twitter, etc.)';
COMMENT ON COLUMN user_oauth_identities.provider_user_id IS 'User ID from OAuth provider (sub claim from ID token)';
COMMENT ON COLUMN user_oauth_identities.email IS 'Email address from OAuth provider';
COMMENT ON COLUMN user_oauth_identities.email_verified IS 'Whether email is verified by OAuth provider';
