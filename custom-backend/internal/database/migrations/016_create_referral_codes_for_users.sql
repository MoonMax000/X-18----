-- Migration: Create referral codes for existing users
-- This migration generates unique referral codes for all users who don't have one yet

-- Create referral codes for existing users
INSERT INTO referral_codes (id, user_id, code, total_uses, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    u.id,
    UPPER(SUBSTRING(MD5(RANDOM()::text || u.id::text || NOW()::text) FROM 1 FOR 8)),
    0,
    true,
    NOW(),
    NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM referral_codes rc WHERE rc.user_id = u.id
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
