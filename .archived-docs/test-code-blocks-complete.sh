#!/bin/bash

echo "🔍 ПОЛНАЯ ПРОВЕРКА БЛОКОВ КОДА"
echo "================================"
echo ""

# Check if backend is running
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "❌ Backend не запущен на localhost:8080"
    echo "Запустите: ./START_CUSTOM_BACKEND_STACK.sh"
    exit 1
fi

echo "✅ Backend запущен"
echo ""

# Get auth token
TOKEN=$(curl -s http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}' | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Не удалось получить токен авторизации"
    exit 1
fi

echo "✅ Авторизация успешна"
echo ""

# Create a test post with code block
echo "📝 Создаю пост с блоком кода..."
RESPONSE=$(curl -s http://localhost:8080/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Тест блоков кода через скрипт",
    "metadata": {
      "code_blocks": [
        {
          "language": "javascript",
          "code": "console.log(\"Hello from test!\");"
        }
      ]
    }
  }')

POST_ID=$(echo "$RESPONSE" | jq -r '.id')

if [ -z "$POST_ID" ] || [ "$POST_ID" = "null" ]; then
    echo "❌ Не удалось создать пост"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Пост создан с ID: $POST_ID"
echo ""

# Fetch the post back
echo "🔄 Получаю пост обратно..."
POST_DATA=$(curl -s "http://localhost:8080/api/timeline/explore?limit=1" \
  -H "Authorization: Bearer $TOKEN")

echo "$POST_DATA" | jq '.[0] | {
  id,
  content,
  metadata: .metadata,
  has_code_blocks: (.metadata.code_blocks != null),
  code_blocks_count: (.metadata.code_blocks | length)
}'

echo ""
echo "📊 ИТОГОВАЯ ПРОВЕРКА:"
CODE_BLOCKS=$(echo "$POST_DATA" | jq '.[0].metadata.code_blocks')
if [ "$CODE_BLOCKS" != "null" ] && [ "$CODE_BLOCKS" != "[]" ]; then
    echo "✅ Блоки кода СОХРАНЕНЫ и ДОСТУПНЫ"
    echo ""
    echo "Детали блока:"
    echo "$CODE_BLOCKS" | jq '.'
else
    echo "❌ Блоки кода НЕ НАЙДЕНЫ"
fi

