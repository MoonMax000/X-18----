#!/bin/bash

# Скрипт для применения миграции 009 на Railway PostgreSQL
# Использование: ./apply-migration-009-railway.sh

echo "🚀 Применение миграции 009 на Railway..."
echo ""

# Проверка что Railway CLI установлен
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен!"
    echo "Установите: npm i -g @railway/cli"
    exit 1
fi

# Проверка что пользователь залогинен
echo "Проверка Railway авторизации..."
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Вы не авторизованы в Railway!"
    echo "Выполните: railway login"
    exit 1
fi

echo "✅ Railway CLI готов"
echo ""

# Подключение к Railway Postgres
echo "📊 Подключение к Railway PostgreSQL..."
echo ""
echo "Вы увидите приглашение psql. Выполните следующую команду:"
echo ""
echo "\\i custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql"
echo ""
echo "После успешного применения введите \\q для выхода"
echo ""
read -p "Нажмите Enter чтобы подключиться к базе данных..."

# Подключаемся к Railway Postgres
railway connect postgres

echo ""
echo "✅ Миграция должна быть применена!"
echo ""
echo "Проверьте что таблица users содержит новые поля:"
echo "  - totp_secret"
echo "  - totp_enabled"
echo "  - is_deactivated"
echo "  - deactivation_reason"
echo "  - deactivated_at"
echo "  - deletion_scheduled_at"
echo ""
