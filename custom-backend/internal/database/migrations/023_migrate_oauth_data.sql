-- Migration: Migrate existing OAuth data to user_oauth_identities table
-- Description: Transfers oauth_provider/oauth_provider_id from users table to new user_oauth_identities table
-- This migration is idempotent - it can be run multiple times safely

-- Migrate existing OAuth data from users table
INSERT INTO user_oauth_identities (user_id, provider, provider_user_id, email, email_verified, created_at, updated_at)
SELECT 
    id as user_id,
    oauth_provider as provider,
    oauth_provider_id as provider_user_id,
    email,
    is_email_verified as email_verified,
    created_at,
    NOW() as updated_at
FROM users
WHERE oauth_provider IS NOT NULL 
    AND oauth_provider != ''
    AND oauth_provider_id IS NOT NULL
    AND oauth_provider_id != ''
    -- Don't duplicate if already exists
    AND NOT EXISTS (
        SELECT 1 FROM user_oauth_identities uoi
        WHERE uoi.user_id = users.id
        AND uoi.provider = users.oauth_provider
        AND uoi.provider_user_id = users.oauth_provider_id
    );

-- Add comments to deprecated columns
COMMENT ON COLUMN users.oauth_provider IS 'DEPRECATED: Use user_oauth_identities table instead. Kept for backward compatibility during migration.';
COMMENT ON COLUMN users.oauth_provider_id IS 'DEPRECATED: Use user_oauth_identities table instead. Kept for backward compatibility during migration.';

-- Log migration results
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count FROM user_oauth_identities;
    RAISE NOTICE 'OAuth migration completed. Total identities in user_oauth_identities: %', migrated_count;
END $$;
