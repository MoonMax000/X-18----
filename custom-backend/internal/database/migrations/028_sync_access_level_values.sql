-- Migration: Sync access_level values and add 'public' support
-- Created: 2025-11-11
-- Description: Updates access_level constraint to support 'public' value and migrates existing data

-- Step 1: Remove old constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_access_level;

-- Step 2: Add new constraint with 'public' value
ALTER TABLE posts 
ADD CONSTRAINT check_access_level 
CHECK (access_level IN ('free', 'public', 'pay-per-post', 'paid', 'subscribers-only', 'followers-only', 'premium'));

-- Step 3: Update existing posts - convert 'free' to 'public' for consistency
-- This ensures frontend can use 'public' universally
UPDATE posts 
SET access_level = 'public' 
WHERE access_level = 'free' OR access_level IS NULL OR access_level = '';

-- Step 4: Update default value to 'public'
ALTER TABLE posts 
ALTER COLUMN access_level SET DEFAULT 'public';

-- Step 5: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_access_level_filtered ON posts(access_level) 
WHERE access_level != 'public';

-- Comments
COMMENT ON COLUMN posts.access_level IS 'Controls who can view the post: public/free (open), pay-per-post/paid ($), subscribers-only (subscription), followers-only (follow), premium (tier)';
COMMENT ON CONSTRAINT check_access_level ON posts IS 'Validates access_level values - supports both legacy (free/pay-per-post) and new (public/paid) naming';
