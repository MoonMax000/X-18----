-- Migration 010: Add notification preferences
-- Created: 2025-10-30

-- Add email notifications toggle to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Social notifications
    new_followers BOOLEAN DEFAULT true,
    mentions BOOLEAN DEFAULT true,
    replies BOOLEAN DEFAULT true,
    reposts BOOLEAN DEFAULT true,
    likes BOOLEAN DEFAULT true,
    
    -- Content notifications
    new_posts_from_following BOOLEAN DEFAULT false,
    post_recommendations BOOLEAN DEFAULT true,
    
    -- System notifications
    account_updates BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    product_updates BOOLEAN DEFAULT false,
    
    -- Financial notifications
    payment_received BOOLEAN DEFAULT true,
    subscription_renewal BOOLEAN DEFAULT true,
    payout_completed BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON user_notification_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_prefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_prefs_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_prefs_updated_at();

-- Insert default preferences for existing users
INSERT INTO user_notification_preferences (user_id)
SELECT id FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM user_notification_preferences WHERE user_id = users.id
);
