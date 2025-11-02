-- Migration 015: Add username change tracking fields
-- This enables Twitter-like username change limitation:
-- - 3 free username changes
-- - After that, only once per week

-- Add username_changes_count column (default 0)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username_changes_count INTEGER DEFAULT 0;

-- Add last_username_change_at column (nullable timestamp)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_username_change_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN users.username_changes_count IS 'Number of times user has changed their username';
COMMENT ON COLUMN users.last_username_change_at IS 'Timestamp of the last username change';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_username_changes ON users(username_changes_count, last_username_change_at);
