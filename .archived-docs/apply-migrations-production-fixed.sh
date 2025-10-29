#!/bin/bash

# 🔧 Применение миграций к production базе данных Railway
# Исправленная версия с правильным подключением

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
echo "📝 Проверка подключения к Railway..."

# Проверка что мы залогинены и связаны с проектом
railway status || {
    echo "❌ Не подключен к проекту Railway"
    echo "Выполните:"
    echo "  railway login"
    echo "  railway link"
    exit 1
}

echo ""
echo "✅ Подключение к Railway установлено"
echo ""

# Проверка текущего сервиса 
CURRENT_SERVICE=$(railway status 2>/dev/null | grep "Service:" | awk '{print $2}')
echo "📝 Текущий сервис: $CURRENT_SERVICE"

# X-18---- это имя сервиса custom-backend в Railway
if [[ "$CURRENT_SERVICE" != "custom-backend" ]] && [[ "$CURRENT_SERVICE" != "X-18----" ]]; then
    echo "🔄 Переключение на backend сервис..."
    echo "❗ Выберите сервис X-18---- при запросе"
    railway link 2>/dev/null || {
        echo "⚠️  Не удалось переключиться автоматически"
        echo ""
        echo "📝 Выполните вручную:"
        echo "  railway link"
        echo "  Выберите сервис: X-18----"
        echo ""
        echo "После этого запустите скрипт снова"
        exit 1
    }
else
    echo "✅ Подключен к правильному сервису: $CURRENT_SERVICE"
fi

echo ""
echo "📝 Будут применены следующие миграции:"
echo "  - 007: Добавление роли admin и связанных таблиц"
echo "  - 008: Расширенные поля безопасности"
echo ""

# Получаем DATABASE_URL из Railway
echo "🔄 Получение DATABASE_URL..."
DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")

# Если не получилось, пробуем альтернативные имена
if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL=$(railway variables get DATABASE_PUBLIC_URL 2>/dev/null || echo "")
fi

# Если все еще пусто, пробуем получить отдельные компоненты
if [ -z "$DATABASE_URL" ]; then
    DB_HOST=$(railway variables get PGHOST 2>/dev/null || echo "")
    DB_PORT=$(railway variables get PGPORT 2>/dev/null || echo "")
    DB_NAME=$(railway variables get PGDATABASE 2>/dev/null || echo "")
    DB_USER=$(railway variables get PGUSER 2>/dev/null || echo "")
    DB_PASS=$(railway variables get PGPASSWORD 2>/dev/null || echo "")
    
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_NAME" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_PASS" ]; then
        DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require"
        echo "✅ Собран DATABASE_URL из компонентов"
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Не удалось получить DATABASE_URL"
    echo "Убедитесь, что:"
    echo "  1. Вы подключены к правильному проекту Railway"
    echo "  2. В проекте есть PostgreSQL сервис"
    echo "  3. Вы выбрали правильный сервис при railway link"
    exit 1
fi

echo "✅ DATABASE_URL получен"
echo ""

# Миграция 007
echo "🔄 Применение миграции 007 (роли admin)..."
psql "$DATABASE_URL" << 'EOF'
-- Добавление поля role в таблицу users если его нет
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;
END $$;

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
);
EOF

if [ $? -eq 0 ]; then
    echo "✅ Миграция 007 применена"
else
    echo "⚠️ Ошибка при применении миграции 007 (возможно уже применена)"
fi

# Миграция 008
echo ""
echo "🔄 Применение миграции 008 (расширенная безопасность)..."
psql "$DATABASE_URL" << 'EOF'
-- Добавление полей безопасности в таблицу users
DO $$ 
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
END $$;

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
CREATE INDEX IF NOT EXISTS idx_lockouts_identifier ON lockouts(identifier);
EOF

if [ $? -eq 0 ]; then
    echo "✅ Миграция 008 применена"
else
    echo "⚠️ Ошибка при применении миграции 008 (возможно уже применена)"
fi

echo ""
echo "📊 Проверка структуры таблиц..."
psql "$DATABASE_URL" -c "\dt"

echo ""
echo "✨ Применение миграций завершено!"
echo ""
echo "🔐 Теперь вы можете:"
echo "  1. Назначить администратора: ./setup-admin-role.sh"
echo "  2. Управлять пользователями: ./manage-admins.sh"
echo "  3. Попасть в админ панель: https://social.tyriantrade.com/admin"
echo ""
echo "📝 Примечание: Все миграции применены к production базе данных"
