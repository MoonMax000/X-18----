-- Migration: Add OAuth fields to users table
-- Description: Add oauth_provider and oauth_provider_id for Google/Apple sign in

ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255);

-- Create index for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider, oauth_provider_id);

-- Allow password to be NULL for OAuth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
