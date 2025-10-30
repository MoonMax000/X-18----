-- Migration 013: Add Referral System
-- Description: Add referral codes, invitations, and rewards tracking
-- Created: 2025-10-30

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    total_uses INT DEFAULT 0,
    max_uses INT DEFAULT NULL -- NULL = unlimited
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);

-- Create referral_invitations table
CREATE TABLE IF NOT EXISTS referral_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
    ip_address INET,
    user_agent TEXT,
    registered_at TIMESTAMP,
    verified_at TIMESTAMP,
    rewarded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (code) REFERENCES referral_codes(code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referral_invitations_referrer_id ON referral_invitations(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_referred_user_id ON referral_invitations(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_code ON referral_invitations(code);
CREATE INDEX IF NOT EXISTS idx_referral_invitations_status ON referral_invitations(status);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitation_id UUID NOT NULL REFERENCES referral_invitations(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL, -- 'credit', 'plan_upgrade', 'bonus_features'
    reward_value DECIMAL(10,2),
    reward_description TEXT,
    tier INT DEFAULT 1, -- 1: 1-5 refs, 2: 6-10 refs, 3: 11+ refs
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'credited', 'expired'
    created_at TIMESTAMP DEFAULT NOW(),
    credited_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_invitation_id ON referral_rewards(invitation_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_tier ON referral_rewards(tier);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS VARCHAR(8) AS $$
DECLARE
    new_code VARCHAR(8);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character alphanumeric code
        new_code := UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate referral tier
CREATE OR REPLACE FUNCTION calculate_referral_tier(p_referrer_id UUID) RETURNS INT AS $$
DECLARE
    total_referrals INT;
BEGIN
    -- Count completed referrals
    SELECT COUNT(*) INTO total_referrals
    FROM referral_invitations
    WHERE referrer_id = p_referrer_id 
    AND status = 'completed';
    
    -- Determine tier based on count
    IF total_referrals >= 11 THEN
        RETURN 3; -- Tier 3: 11+ referrals
    ELSIF total_referrals >= 6 THEN
        RETURN 2; -- Tier 2: 6-10 referrals
    ELSE
        RETURN 1; -- Tier 1: 1-5 referrals
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate referral code for new users
CREATE OR REPLACE FUNCTION auto_create_referral_code() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO referral_codes (user_id, code)
    VALUES (NEW.id, generate_referral_code());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_referral_code
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_referral_code();

-- Add comments for documentation
COMMENT ON TABLE referral_codes IS 'Stores unique referral codes for users';
COMMENT ON TABLE referral_invitations IS 'Tracks referral invitations and their status';
COMMENT ON TABLE referral_rewards IS 'Stores rewards earned through referrals';

COMMENT ON COLUMN referral_codes.code IS 'Unique 8-character referral code';
COMMENT ON COLUMN referral_codes.total_uses IS 'Total number of times this code has been used';
COMMENT ON COLUMN referral_codes.max_uses IS 'Maximum allowed uses (NULL = unlimited)';

COMMENT ON COLUMN referral_invitations.status IS 'pending: clicked link, completed: registered, rewarded: reward given';
COMMENT ON COLUMN referral_invitations.ip_address IS 'IP address of referred user for fraud detection';

COMMENT ON COLUMN referral_rewards.tier IS 'Reward tier: 1 (1-5 refs), 2 (6-10 refs), 3 (11+ refs)';
COMMENT ON COLUMN referral_rewards.reward_type IS 'Type of reward: credit, plan_upgrade, bonus_features';
