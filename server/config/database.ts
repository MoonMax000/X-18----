import { createClient } from '@supabase/supabase-js';

// Database configuration
// For now using environment variables, can be connected via Supabase MCP
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  password_hash: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  trading_style: string | null;
  specialization: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  is_blocked: boolean;
  failed_login_attempts: number;
  last_failed_login: Date | null;
  // Profile stats
  followers_count: number;
  following_count: number;
  posts_count: number;
  accuracy_rate: number;
  win_rate: number;
  total_trades: number;
  verified: boolean;
  premium: boolean;
  joined_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  device_info: string | null;
  ip_address: string | null;
}

export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: 'email_verification' | 'phone_verification' | 'password_reset' | '2fa';
  expires_at: Date;
  attempts: number;
  is_used: boolean;
  created_at: Date;
}

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}

// SQL migrations for database setup
export const migrations = `
-- Users table (extended for trading platform)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  trading_style VARCHAR(100),
  specialization VARCHAR(100),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  is_blocked BOOLEAN DEFAULT FALSE,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMP,
  -- Profile stats
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  accuracy_rate INTEGER DEFAULT 0,
  win_rate INTEGER DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  joined_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  device_info TEXT,
  ip_address VARCHAR(45)
);

-- Verification codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Password reset table
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(50),
  market VARCHAR(50),
  ticker VARCHAR(20),
  direction VARCHAR(10),
  timeframe VARCHAR(10),
  entry_price DECIMAL(20, 8),
  target_price DECIMAL(20, 8),
  stop_loss DECIMAL(20, 8),
  is_paid BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;
