#!/bin/bash

# Скрипт для применения миграции к Railway PostgreSQL
# Применяет миграцию 009: TOTP и деактивация аккаунтов

echo "🔄 Применение миграции к Railway PostgreSQL..."
echo ""

cd custom-backend

# Применить миграцию используя Railway CLI
railway run sh -c 'psql "$DATABASE_URL" <<EOF
-- Migration: Add TOTP 2FA and Account Deactivation Fields
-- Description: Adds fields for TOTP authentication and 30-day account deactivation system

-- Add TOTP fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;

-- Add deactivation fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled ON users(totp_enabled);
CREATE INDEX IF NOT EXISTS idx_users_deactivated_at ON users(deactivated_at);
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON users(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;

-- Add comment explaining the 30-day deactivation system
COMMENT ON COLUMN users.deactivated_at IS '\''Timestamp when user requested account deactivation'\'';
COMMENT ON COLUMN users.deletion_scheduled_at IS '\''Timestamp when account will be permanently deleted (30 days after deactivation)'\'';
COMMENT ON COLUMN users.totp_secret IS '\''Encrypted TOTP secret for authenticator app'\'';
COMMENT ON COLUMN users.totp_enabled IS '\''Whether TOTP 2FA is enabled for this user'\'';
EOF
'

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Миграция успешно применена к production базе данных!"
    echo ""
    echo "📊 Проверка изменений..."
    railway run sh -c 'psql "$DATABASE_URL" -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '\''users'\'' AND column_name IN ('\''totp_secret'\'', '\''totp_enabled'\'', '\''deactivated_at'\'', '\''deletion_scheduled_at'\'');"'
else
    echo ""
    echo "❌ Ошибка при применении миграции"
    exit 1
fi
