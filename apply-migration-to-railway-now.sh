#!/bin/bash

# Скрипт для применения миграции к Railway PostgreSQL

echo "🔧 Применение миграции к Railway PostgreSQL..."

# Данные подключения
DB_HOST="postgres.railway.internal"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="gAEAlBZMKubjsFaPtlzIxzZIKEyIUcuf"
DB_NAME="railway"

# Формируем DATABASE_URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📊 Подключение к базе данных..."

# Применяем миграцию
cd custom-backend
railway run bash -c "psql \$DATABASE_URL -f ../add-news-content-status-fields.sql"

echo "✅ Миграция применена!"
