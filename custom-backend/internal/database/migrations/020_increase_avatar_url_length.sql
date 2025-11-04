-- Increase avatar_url length to handle long Google profile image URLs
-- Migration: 020_increase_avatar_url_length
-- Date: 2025-11-04

ALTER TABLE users ALTER COLUMN avatar_url TYPE VARCHAR(2000);

-- Add comment for documentation
COMMENT ON COLUMN users.avatar_url IS 'User avatar URL (supports long Google profile URLs up to 2000 chars)';
