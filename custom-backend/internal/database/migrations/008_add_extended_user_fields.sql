-- Migration: Add extended user fields from Django models
-- Description: Add avatar, background, location, sectors, 2FA and soft delete fields

-- Add new fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method VARCHAR(10) DEFAULT 'email' CHECK (verification_method IN ('email', 'sms'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;

-- Create sectors table for user categories/interests
CREATE TABLE IF NOT EXISTS sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sectors junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_sectors (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sector_id INTEGER NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, sector_id)
);

-- Extend sessions table for better tracking
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45); -- Support IPv6
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS fingerprint TEXT; -- Browser fingerprint
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_name VARCHAR(100);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_type VARCHAR(50); -- mobile, desktop, tablet
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS browser VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS os VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS location VARCHAR(100); -- City, Country from IP
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create login_attempts table for security tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(100), -- wrong_password, account_locked, ip_blocked, etc.
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ip_lockouts table
CREATE TABLE IF NOT EXISTS ip_lockouts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    attempts INTEGER DEFAULT 1,
    blocked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_lockouts table
CREATE TABLE IF NOT EXISTS user_lockouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempts INTEGER DEFAULT 1,
    blocked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create verification_codes table for 2FA and email/phone verification
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL, -- email_verification, phone_verification, 2fa, password_reset
    method VARCHAR(10) NOT NULL, -- email, sms
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create social_accounts table for OAuth
CREATE TABLE IF NOT EXISTS social_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, github, facebook, etc.
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    raw_data JSONB, -- Store complete provider response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(is_email_verified);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_ip_lockouts_ip ON ip_lockouts(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_lockouts_user_id ON user_lockouts(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);

-- Insert default sectors
INSERT INTO sectors (name, description, icon, color) VALUES 
    ('Technology', 'Tech and Software', 'laptop', '#3B82F6'),
    ('Art & Design', 'Creative Arts', 'palette', '#EC4899'),
    ('Business', 'Business and Finance', 'briefcase', '#10B981'),
    ('Health', 'Health and Wellness', 'heart', '#EF4444'),
    ('Education', 'Learning and Teaching', 'book', '#8B5CF6'),
    ('Entertainment', 'Media and Entertainment', 'film', '#F59E0B'),
    ('Sports', 'Sports and Fitness', 'trophy', '#14B8A6'),
    ('Travel', 'Travel and Tourism', 'plane', '#06B6D4')
ON CONFLICT (name) DO NOTHING;
