#!/bin/bash

# Простая очистка базы данных

DB_HOST=$(grep '^DB_HOST=' custom-backend/.env | cut -d'=' -f2)
DB_PORT=$(grep '^DB_PORT=' custom-backend/.env | cut -d'=' -f2)
DB_NAME=$(grep '^DB_NAME=' custom-backend/.env | cut -d'=' -f2)
DB_USER=$(grep '^DB_USER=' custom-backend/.env | cut -d'=' -f2)
DB_PASSWORD=$(grep '^DB_PASSWORD=' custom-backend/.env | cut -d'=' -f2)

echo "🗑️  Простая очистка production базы данных"
echo ""

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'SQL'

BEGIN;

-- Удаляем только основные связанные данные
DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM likes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM bookmarks WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM media WHERE post_id IN (SELECT id FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin'));
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM follows WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем пользователей
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

COMMIT;

-- Показать результат
SELECT 'Результат:' as info;
SELECT username, email, role FROM users;

SQL

echo ""
echo "✅ Готово!"
