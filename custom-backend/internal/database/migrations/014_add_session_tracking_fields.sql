-- Migration 014: Add session tracking fields
-- This migration adds device tracking fields to the sessions table

-- Add device tracking fields to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS browser VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS os VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN sessions.device_type IS 'Type of device: mobile, tablet, or desktop';
COMMENT ON COLUMN sessions.browser IS 'Browser name: Chrome, Firefox, Safari, Edge, etc.';
COMMENT ON COLUMN sessions.os IS 'Operating system: Windows, macOS, Linux, Android, iOS';
COMMENT ON COLUMN sessions.ip_address IS 'Client IP address (IPv4 or IPv6)';
COMMENT ON COLUMN sessions.user_agent IS 'Full user agent string from the request';
COMMENT ON COLUMN sessions.last_active_at IS 'Timestamp of last activity in this session';

-- Add index on ip_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_device_type ON sessions(device_type);
