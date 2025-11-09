#!/bin/bash

# ============================================
# Прямая очистка production базы данных
# ============================================

set -e

# Читаем параметры из custom-backend/.env
DB_HOST=$(grep '^DB_HOST=' custom-backend/.env | cut -d'=' -f2)
DB_PORT=$(grep '^DB_PORT=' custom-backend/.env | cut -d'=' -f2)
DB_NAME=$(grep '^DB_NAME=' custom-backend/.env | cut -d'=' -f2)
DB_USER=$(grep '^DB_USER=' custom-backend/.env | cut -d'=' -f2)
DB_PASSWORD=$(grep '^DB_PASSWORD=' custom-backend/.env | cut -d'=' -f2)

echo "🗑️  Очистка production базы данных"
echo "===================================="
echo ""
echo "📡 Подключение:"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Проверяем пользователей
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'

-- Показать текущих пользователей
SELECT 'Текущие пользователи:' as info;
SELECT username, email, role FROM users;

-- Показать сколько будет удалено
SELECT COUNT(*) as users_to_delete 
FROM users 
WHERE username != 'admin' AND role != 'admin';

-- Выполнить очистку
BEGIN;

DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM post_likes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM follows WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM referral_uses WHERE referrer_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR referred_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM subscriptions WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

COMMIT;

-- Показать результат
SELECT 'Оставшиеся пользователи:' as info;
SELECT username, email, role, created_at FROM users;

SQL

echo ""
echo "✅ Готово!"
