#!/bin/bash

# Скрипт для применения миграции 007 к production БД на Railway
# Этот скрипт добавляет поле 'role' в таблицу users и создает таблицы для виджетов

echo "🚀 Применение миграции 007 к production БД..."
echo ""

# Проверяем наличие Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo ""
    echo "📦 Установка Railway CLI:"
    echo "  macOS: brew install railway"
    echo "  Windows: npm install -g @railway/cli"
    echo "  Linux: npm install -g @railway/cli"
    echo ""
    exit 1
fi

echo "✅ Railway CLI обнаружен"
echo ""

# Проверяем что мы залогинены
echo "🔐 Проверка авторизации Railway..."
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Вы не авторизованы в Railway"
    echo ""
    echo "Выполните: railway login"
    echo ""
    exit 1
fi

echo "✅ Авторизация подтверждена"
echo ""

# Проверяем что проект связан
echo "🔗 Проверка связи с проектом..."
railway status &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Проект не связан с Railway"
    echo ""
    echo "Выполните: railway link"
    echo ""
    exit 1
fi

echo "✅ Проект связан"
echo ""

# Применяем миграцию
echo "📝 Применение миграции 007..."
echo ""

railway run psql \$DATABASE_URL << 'EOF'

-- Миграция 007: Widgets and Admin System

-- 1. Добавляем поле role в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- 2. Создаем таблицу news для виджета новостей
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    image_url TEXT,
    category VARCHAR(50),
    source VARCHAR(100),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Создаем таблицу user_blocks для блокировки пользователей
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- 4. Создаем таблицу post_reports для жалоб на посты
CREATE TABLE IF NOT EXISTS post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Создаем таблицу pinned_posts для закрепленных постов
CREATE TABLE IF NOT EXISTS pinned_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- Один закрепленный пост на пользователя
);

-- 6. Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_post ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter ON post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_pinned_posts_user ON pinned_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Проверяем результат
\dt

-- Проверяем колонку role в users
\d users

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Миграция 007 успешно применена!"
    echo ""
    echo "📊 Созданные таблицы:"
    echo "  - news (виджет новостей)"
    echo "  - user_blocks (блокировка пользователей)"
    echo "  - post_reports (жалобы на посты)"
    echo "  - pinned_posts (закрепленные посты)"
    echo ""
    echo "🔧 Добавленные поля:"
    echo "  - users.role (роль пользователя: user/moderator/admin)"
    echo ""
else
    echo ""
    echo "❌ Ошибка при применении миграции"
    echo ""
    exit 1
fi
