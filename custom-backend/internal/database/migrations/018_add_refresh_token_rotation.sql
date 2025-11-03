-- Add refresh token rotation tracking to sessions table
-- This migration adds fields needed for refresh token rotation with reuse detection

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS jti UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS prev_jti UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS replaced_by_jti UUID;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN DEFAULT false;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at) WHERE is_active = true;

-- Add comment
COMMENT ON COLUMN sessions.jti IS 'JWT ID - unique identifier for this refresh token';
COMMENT ON COLUMN sessions.prev_jti IS 'Previous JTI when this token was rotated from another';
COMMENT ON COLUMN sessions.replaced_by_jti IS 'JTI of the token that replaced this one';
COMMENT ON COLUMN sessions.is_active IS 'Whether this session is currently active';
COMMENT ON COLUMN sessions.is_revoked IS 'Whether this token was revoked (manual logout or reuse detected)';
