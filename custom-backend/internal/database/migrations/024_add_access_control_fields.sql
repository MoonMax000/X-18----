-- Migration: Add access control fields to posts table
-- Created: 2025-11-09
-- Description: Adds access_level and reply_policy fields for Phase 3 composer integration

-- Add access_level field (replaces visibility for new system)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS access_level VARCHAR(30) DEFAULT 'free';

-- Add reply_policy field (who can reply to this post)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS reply_policy VARCHAR(30) DEFAULT 'everyone';

-- Create index for access_level (for filtering/querying)
CREATE INDEX IF NOT EXISTS idx_posts_access_level ON posts(access_level);

-- Add check constraint for valid access_level values
ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_access_level;
ALTER TABLE posts 
ADD CONSTRAINT check_access_level 
CHECK (access_level IN ('free', 'pay-per-post', 'subscribers-only', 'followers-only', 'premium'));

-- Add check constraint for valid reply_policy values
ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_reply_policy;
ALTER TABLE posts 
ADD CONSTRAINT check_reply_policy 
CHECK (reply_policy IN ('everyone', 'following', 'verified', 'mentioned'));

-- Update existing posts to have default values
UPDATE posts 
SET access_level = 'free' 
WHERE access_level IS NULL OR access_level = '';

UPDATE posts 
SET reply_policy = 'everyone' 
WHERE reply_policy IS NULL OR reply_policy = '';

-- Comment on columns
COMMENT ON COLUMN posts.access_level IS 'Controls who can view the post: free, pay-per-post, subscribers-only, followers-only, premium';
COMMENT ON COLUMN posts.reply_policy IS 'Controls who can reply to the post: everyone, following, verified, mentioned';
