#!/bin/bash

# Параметры подключения к БД
export PGPASSWORD='TyrianTrade2024SecurePass'
DB_HOST='ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com'
DB_PORT='5432'
DB_USER='dbadmin'
DB_NAME='tyriantrade'

echo "🔍 Подключение к базе данных..."
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo ""

# Проверка: сколько пользователей сейчас
echo "📊 Текущее количество пользователей:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as total_users FROM users;"
echo ""

# Проверка: кто админ
echo "👤 Проверка администратора:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, username, email, role FROM users WHERE username = 'admin' OR role = 'admin';"
echo ""

# Проверка: сколько пользователей будет удалено
echo "⚠️  Пользователей будет удалено:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as users_to_delete FROM users WHERE username != 'admin' AND role != 'admin';"
echo ""

read -p "Вы уверены, что хотите удалить всех пользователей кроме админа? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Операция отменена"
    exit 0
fi

echo ""
echo "🗑️  Начинаем очистку базы данных..."
echo ""

# Выполняем удаление в транзакции
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
BEGIN;

-- 1. Удаление кодов верификации
DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 2. Удаление сессий
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 3. Удаление попыток входа
DELETE FROM login_attempts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 4. Удаление лайков постов
DELETE FROM post_likes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 5. Удаление комментариев
DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 6. Удаление постов
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 7. Удаление подписок
DELETE FROM follows WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 8. Удаление использований реферальных кодов
DELETE FROM referral_uses WHERE referrer_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR referred_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 9. Удаление реферальных кодов
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 10. Удаление OAuth идентификаторов
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 11. Удаление уведомлений
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 12. Удаление настроек уведомлений
DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 13. Удаление подписок
DELETE FROM subscriptions WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 14. ФИНАЛ: Удаление пользователей
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

-- Проверка результата
SELECT COUNT(*) as remaining_users FROM users;

COMMIT;
EOF

echo ""
echo "✅ Очистка завершена!"
echo ""

# Финальная проверка
echo "📊 Оставшиеся пользователи:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, username, email, role, created_at FROM users;"

# Очищаем пароль из окружения
unset PGPASSWORD
