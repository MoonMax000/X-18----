#!/bin/bash
set -e

echo "🧪 Тестирование Resend API..."
echo ""

# Test data
API_KEY="re_YEUF4847_PF1mdVzH7jbpRkxeuYT56kbH"
FROM_EMAIL="noreply@tyriantrade.com"
TO_EMAIL="test@example.com"

echo "📧 Отправка тестового email через Resend API..."
echo "   From: Tyrian Trade <$FROM_EMAIL>"
echo "   To: $TO_EMAIL"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"from\": \"Tyrian Trade <$FROM_EMAIL>\",
    \"to\": [\"$TO_EMAIL\"],
    \"subject\": \"Test Email from Tyrian Trade\",
    \"html\": \"<p>This is a test email to verify Resend API configuration.</p>\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "📥 HTTP Code: $HTTP_CODE"
echo "📥 Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Email отправлен успешно!"
    echo ""
    echo "🎉 Resend API работает корректно!"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Ошибка авторизации (401 Unauthorized)"
    echo ""
    echo "Возможные причины:"
    echo "  • API ключ недействителен"
    echo "  • API ключ истек"
else
    echo "❌ Ошибка отправки email"
    echo ""
    echo "HTTP Code: $HTTP_CODE"
    
    # Parse error message if available
    ERROR_MSG=$(echo "$BODY" | jq -r '.message // .error // "Unknown error"' 2>/dev/null)
    echo "Error: $ERROR_MSG"
    
    # Check if domain verification is the issue
    if echo "$BODY" | grep -qi "domain\|verification\|verified"; then
        echo ""
        echo "⚠️  ПРОБЛЕМА: Домен tyriantrade.com НЕ ВЕРИФИЦИРОВАН в Resend!"
        echo ""
        echo "Решение:"
        echo "  1. Зайдите в Resend Dashboard: https://resend.com/domains"
        echo "  2. Добавьте домен tyriantrade.com"
        echo "  3. Настройте DNS записи для верификации"
        echo "  4. Дождитесь верификации домена"
        echo ""
        echo "Альтернатива:"
        echo "  • Используйте тестовый домен onboarding@resend.dev (только для тестирования)"
        echo "  • Или используйте другой верифицированный домен"
    fi
fi
