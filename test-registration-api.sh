#!/bin/bash
set -e

echo "🧪 Тестирование регистрации через API напрямую"
echo ""

# Test data
USERNAME="testuser$(date +%s)"
EMAIL="test$(date +%s)@example.com"
PASSWORD="TestPass123!"

echo "📝 Тестовые данные:"
echo "  Username: $USERNAME"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

echo "📤 Отправка запроса на https://api.tyriantrade.com/api/auth/register..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST https://api.tyriantrade.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "📥 HTTP Code: $HTTP_CODE"
echo "📥 Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Регистрация успешна!"
    echo ""
    echo "📧 Проверьте email $EMAIL для кода верификации"
elif [ "$HTTP_CODE" = "409" ]; then
    echo "❌ Конфликт! Username или email уже заняты"
    echo ""
    echo "🔍 Проверяем базу данных..."
    PGPASSWORD='TyrianTrade2024SecurePass' psql -h ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com -U dbadmin -d tyriantrade -c "SELECT username, email, created_at FROM users WHERE username = '$USERNAME' OR email = '$EMAIL';"
else
    echo "⚠️  Неожиданный код ответа: $HTTP_CODE"
fi

echo ""
echo "🔄 Теперь попробуйте зарегистрировать 'devidandersoncrypto'..."
echo ""

# Try the problematic username
echo "📤 Попытка регистрации с username 'devidandersoncrypto'..."
RESPONSE2=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST https://api.tyriantrade.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"devidandersoncrypto\",
    \"email\": \"devidandersoncrypto@gmail.com\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE2=$(echo "$RESPONSE2" | grep "HTTP_CODE:" | cut -d: -f2)
BODY2=$(echo "$RESPONSE2" | grep -v "HTTP_CODE:")

echo "📥 HTTP Code: $HTTP_CODE2"
echo "📥 Response:"
echo "$BODY2" | jq '.' 2>/dev/null || echo "$BODY2"
echo ""

if [ "$HTTP_CODE2" = "409" ]; then
    echo "❌ Подтверждено: 'devidandersoncrypto' занят!"
    echo "🔍 Ищем в базе данных..."
    PGPASSWORD='TyrianTrade2024SecurePass' psql -h ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com -U dbadmin -d tyriantrade -c "SELECT username, email, created_at FROM users WHERE username = 'devidandersoncrypto' OR email = 'devidandersoncrypto@gmail.com';"
elif [ "$HTTP_CODE2" = "201" ]; then
    echo "✅ 'devidandersoncrypto' успешно зарегистрирован!"
    echo "🎉 Проблема решена!"
fi
