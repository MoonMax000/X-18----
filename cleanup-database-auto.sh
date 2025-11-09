#!/bin/bash

# ============================================
# Автоматическая очистка базы данных (кроме админа)
# ============================================

set -e

echo "🗑️  Автоматическая очистка базы данных Tyrian Trade"
echo "===================================================="
echo ""

# Определяем окружение
if [ "$1" == "production" ] || [ "$1" == "prod" ]; then
    ENV="production"
    echo "🚀 Окружение: PRODUCTION"
    echo ""
    
    # Загружаем переменные из custom-backend/.env
    if [ -f custom-backend/.env ]; then
        source <(grep -v '^#' custom-backend/.env | sed 's/^/export /')
    fi
    
elif [ "$1" == "local" ]; then
    ENV="local"
    echo "💻 Окружение: LOCAL"
    echo ""
    
    # Загружаем переменные из .env.local
    if [ -f .env.local ]; then
        source <(grep -v '^#' .env.local | sed 's/^/export /')
    fi
    
    # Дефолтные значения для local
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-x18_db}"
    DB_USER="${DB_USER:-postgres}"
    DB_PASSWORD="${DB_PASSWORD:-password}"
    
else
    echo "❌ Ошибка: Не указано окружение!"
    echo ""
    echo "Использование:"
    echo "  ./cleanup-database-auto.sh local       # Для локальной базы данных"
    echo "  ./cleanup-database-auto.sh production  # Для production базы данных"
    echo ""
    exit 1
fi

# Проверка переменных
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Ошибка: Не все переменные окружения установлены!"
    echo "   DB_HOST: ${DB_HOST:-не установлен}"
    echo "   DB_NAME: ${DB_NAME:-не установлен}"
    echo "   DB_USER: ${DB_USER:-не установлен}"
    echo "   DB_PASSWORD: ${DB_PASSWORD:+установлен}"
    exit 1
fi

# Проверка подключения
echo "📡 Подключение к базе данных..."
echo "   Host: $DB_HOST"
echo "   Port: ${DB_PORT:-5432}"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Устанавливаем дефолтный порт если не указан
DB_PORT="${DB_PORT:-5432}"

# Проверяем количество пользователей
USER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users WHERE username != 'admin' AND role != 'admin';" 2>/dev/null | xargs)

if [ -z "$USER_COUNT" ]; then
    echo "❌ Не удалось подключиться к базе данных!"
    echo "   Проверьте настройки подключения и доступность базы данных."
    exit 1
fi

echo "📊 Статистика базы данных:"
echo "   Пользователей для удаления: $USER_COUNT"
echo ""

if [ "$USER_COUNT" == "0" ]; then
    echo "✅ База данных уже чистая (только админ)"
    exit 0
fi

echo "🔄 Начинаю очистку базы данных..."
echo ""

# Выполняем очистку
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'EOF'

BEGIN;

-- 1. Удаление кодов верификации
DELETE FROM verification_codes 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 2. Удаление сессий
DELETE FROM sessions 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 3. Удаление попыток входа
DELETE FROM login_attempts 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 4. Удаление лайков постов
DELETE FROM post_likes 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 5. Удаление комментариев
DELETE FROM comments 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 6. Удаление постов
DELETE FROM posts 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 7. Удаление подписок
DELETE FROM follows 
WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin')
   OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 8. Удаление использований реферальных кодов
DELETE FROM referral_uses 
WHERE referrer_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin')
   OR referred_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 9. Удаление реферальных кодов
DELETE FROM referral_codes 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 10. Удаление OAuth идентификаторов
DELETE FROM user_oauth_identities 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 11. Удаление уведомлений
DELETE FROM notifications 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 12. Удаление настроек уведомлений
DELETE FROM notification_preferences 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 13. Удаление подписок
DELETE FROM subscriptions 
WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin')
   OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 14. ФИНАЛ: Удаление пользователей
DELETE FROM users 
WHERE username != 'admin' AND role != 'admin';

COMMIT;

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ База данных успешно очищена!"
    echo ""
    
    # Показываем оставшихся пользователей
    echo "📊 Оставшиеся пользователи:"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT username, email, role, created_at FROM users;"
    
    echo ""
    echo "✨ Готово!"
else
    echo ""
    echo "❌ Ошибка при очистке базы данных"
    exit 1
fi
