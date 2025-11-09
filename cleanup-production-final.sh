#!/bin/bash

# ============================================
# Финальная очистка production базы данных
# (на основе реальной структуры БД)
# ============================================

set -e

DB_HOST=$(grep '^DB_HOST=' custom-backend/.env | cut -d'=' -f2)
DB_PORT=$(grep '^DB_PORT=' custom-backend/.env | cut -d'=' -f2)
DB_NAME=$(grep '^DB_NAME=' custom-backend/.env | cut -d'=' -f2)
DB_USER=$(grep '^DB_USER=' custom-backend/.env | cut -d'=' -f2)
DB_PASSWORD=$(grep '^DB_PASSWORD=' custom-backend/.env | cut -d'=' -f2)

echo "🗑️  Финальная очистка production базы данных"
echo "============================================="
echo ""
echo "📡 Подключение:"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo ""

# Проверяем и очищаем
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'

-- Показать текущих пользователей
SELECT 'Текущие пользователи:' as info;
SELECT username, email, role FROM users;

-- Показать сколько будет удалено
SELECT COUNT(*) as users_to_delete FROM users WHERE username != 'admin' AND role != 'admin';

-- Выполнить очистку
BEGIN;

-- Удаляем связанные данные
DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM likes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM bookmarks WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем посты и медиа
DELETE FROM media WHERE post_id IN (SELECT id FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin'));
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем подписки
DELETE FROM follows WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем рефералы
DELETE FROM referral_invitations WHERE inviter_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR invitee_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем OAuth данные
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем уведомления
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем подписки (subscriptions)
DELETE FROM subscriptions WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- ФИНАЛ: Удаляем пользователей
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

COMMIT;

-- Показать результат
SELECT 'Оставшиеся пользователи:' as info;
SELECT username, email, role, created_at FROM users;

SQL

echo ""
echo "✅ База данных успешно очищена!"
