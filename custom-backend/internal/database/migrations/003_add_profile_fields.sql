-- Migration: Add profile fields to users table
-- Created: 2024-10-26

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS sectors TEXT;

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
