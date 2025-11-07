#!/bin/bash
set -e

echo "🧹 Очистка тестовых пользователей из БД..."
echo "⚠️  Сохраняем только admin (kyvaldov@gmail.com)"
echo ""

# Подключение к Lightsail Database
PGPASSWORD='TyrianTrade2024SecurePass' psql \
  -h ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com \
  -U dbadmin \
  -d tyriantrade \
  -c "DELETE FROM users WHERE email != 'kyvaldov@gmail.com';"

echo ""
echo "✅ Очистка завершена!"
echo ""
echo "📋 Оставшиеся пользователи:"

PGPASSWORD='TyrianTrade2024SecurePass' psql \
  -h ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com \
  -U dbadmin \
  -d tyriantrade \
  -c "SELECT username, email, role, is_email_verified, created_at FROM users ORDER BY created_at;"
