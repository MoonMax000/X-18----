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

read -p "Удалить всех пользователей кроме админа? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Операция отменена"
    exit 0
fi

echo ""
echo "🗑️  Начинаем очистку..."
echo ""

# Выполняем удаление БЕЗ транзакции, пропуская ошибки
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Удаляем verification_codes
DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем sessions
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем referral_codes
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем user_oauth_identities
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- Удаляем пользователей
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

-- Проверка
SELECT COUNT(*) as remaining_users FROM users;
EOF

echo ""
echo "✅ Очистка завершена!"
echo ""

# Финальная проверка
echo "📊 Оставшиеся пользователи:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, username, email, role FROM users;"

unset PGPASSWORD
