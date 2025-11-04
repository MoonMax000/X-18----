-- +goose Up
-- Create permanent admin user that cannot be deleted
INSERT INTO users (
    id,
    username,
    email,
    password,
    display_name,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin',
    'kyvaldov@gmail.com',
    -- Default password: Admin123! (hashed with bcrypt)
    -- Change this after first login!
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL/Ek8n6',
    'System Admin',
    'admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create referral code for admin
INSERT INTO referral_codes (
    id,
    user_id,
    code,
    total_uses,
    is_active,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'ADMIN2024',
    0,
    true,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- +goose Down
-- Don't delete admin user on rollback
-- Admin user should persist
