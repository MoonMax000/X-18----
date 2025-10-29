#!/bin/bash

# 🔧 Применение миграций к production базе данных Railway
# Включает миграции 007 (admin роли) и 008 (расширенная безопасность)

set -e

echo "🔐 Применение миграций к production БД"
echo "======================================="
echo ""

# Проверка Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo "📦 Установите: brew install railway"
    exit 1
fi

echo "🔗 Переход в директорию backend..."
cd custom-backend

echo ""
echo "📝 Будут применены следующие миграции:"
echo "  - 007: Добавление роли admin и связанных таблиц"
echo "  - 008: Расширенные поля безопасности"
echo ""

# Миграция 007
echo "🔄 Применение миграции 007 (роли admin)..."
railway run psql -c "
-- Добавление поля role в таблицу users если его нет
DO \$\$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;
END \$\$;

-- Создание таблицы news если её нет
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    image_url VARCHAR(500),
    category VARCHAR(100),
    source VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы user_blocks если её нет
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    blocked_user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, blocked_user_id)
);

-- Создание таблицы post_reports если её нет
CREATE TABLE IF NOT EXISTS post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    reporter_id UUID NOT NULL,
    reason VARCHAR(500),
    details TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_by UUID,
    review_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Создание таблицы pinned_posts если её нет
CREATE TABLE IF NOT EXISTS pinned_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);"

if [ $? -eq 0 ]; then
    echo "✅ Миграция 007 применена"
else
    echo "⚠️ Ошибка при применении миграции 007 (возможно уже применена)"
fi

# Миграция 008
echo ""
echo "🔄 Применение миграции 008 (расширенная безопасность)..."
railway run psql -c "
-- Добавление полей безопасности в таблицу users
DO \$\$ 
BEGIN
    -- 2FA поля
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_2fa_enabled') THEN
        ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verification_method') THEN
        ALTER TABLE users ADD COLUMN verification_method VARCHAR(20) DEFAULT 'email';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='backup_email') THEN
        ALTER TABLE users ADD COLUMN backup_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='backup_phone') THEN
        ALTER TABLE users ADD COLUMN backup_phone VARCHAR(20);
    END IF;
    
    -- Верификация
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_email_verified') THEN
        ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_phone_verified') THEN
        ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Soft delete
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_deleted') THEN
        ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deletion_requested_at') THEN
        ALTER TABLE users ADD COLUMN deletion_requested_at TIMESTAMP;
    END IF;
    
    -- Активность
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_active_at') THEN
        ALTER TABLE users ADD COLUMN last_active_at TIMESTAMP;
    END IF;
END \$\$;

-- Создание таблицы sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_name VARCHAR(100),
    device_type VARCHAR(50),
    os VARCHAR(50),
    browser VARCHAR(50),
    location VARCHAR(100),
    is_revoked BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы verification_codes
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы login_attempts
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы lockouts
CREATE TABLE IF NOT EXISTS lockouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    lockout_type VARCHAR(20) NOT NULL,
    attempt_count INT DEFAULT 0,
    locked_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(identifier, lockout_type)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_lockouts_identifier ON lockouts(identifier);"

if [ $? -eq 0 ]; then
    echo "✅ Миграция 008 применена"
else
    echo "⚠️ Ошибка при применении миграции 008 (возможно уже применена)"
fi

echo ""
echo "📊 Проверка структуры таблиц..."
railway run psql -c "\dt"

echo ""
echo "✨ Применение миграций завершено!"
echo ""
echo "🔐 Теперь вы можете:"
echo "  1. Назначить администратора: ./setup-admin-role.sh"
echo "  2. Управлять пользователями: ./manage-admins.sh"
echo "  3. Попасть в админ панель: https://social.tyriantrade.com/admin"
echo ""
echo "📝 Примечание: Убедитесь, что вы находитесь в правильном проекте Railway"
