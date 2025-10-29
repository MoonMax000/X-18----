#!/bin/bash

echo "================================================"
echo "   Полное тестирование блоков кода"
echo "================================================"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка что backend запущен
echo "Проверка backend..."
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend не запущен на порту 8080${NC}"
    echo "Запустите: ./START_CUSTOM_BACKEND_STACK.sh"
    exit 1
fi
echo -e "${GREEN}✓ Backend запущен${NC}"
echo ""

# Получаем токен (предполагается что пользователь уже залогинен)
echo "Получение токена авторизации..."
# Попробуем получить токен из localStorage через curl (упрощенно)
# В реальности токен берется из браузера
TOKEN="test-token-placeholder"
echo -e "${YELLOW}⚠ Используем тестовый токен: $TOKEN${NC}"
echo -e "${YELLOW}⚠ Для полного теста нужно взять реальный токен из браузера (DevTools -> Application -> LocalStorage)${NC}"
echo ""

# Создаем тестовый пост с блоком кода
echo "================================================"
echo "1. Создание поста с блоком кода"
echo "================================================"
echo ""

CODE_CONTENT='function hello() {\n  console.log("Hello World!");\n}'

POST_DATA=$(cat <<EOF
{
  "content": "Тестовый пост с блоком кода JavaScript",
  "metadata": {
    "post_type": "code",
    "code_blocks": [
      {
        "language": "javascript",
        "code": "$CODE_CONTENT"
      }
    ]
  },
  "visibility": "public"
}
EOF
)

echo "Отправка запроса..."
echo "POST /api/posts"
echo ""
echo "Payload:"
echo "$POST_DATA" | jq '.'
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$POST_DATA")

echo "Ответ от сервера:"
echo "$RESPONSE" | jq '.'
echo ""

# Извлекаем ID поста
POST_ID=$(echo "$RESPONSE" | jq -r '.id // empty')

if [ -z "$POST_ID" ]; then
    echo -e "${RED}❌ Не удалось создать пост${NC}"
    echo "Детали ошибки:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}✓ Пост создан с ID: $POST_ID${NC}"
echo ""

# Проверяем что пост сохранился в БД с metadata
echo "================================================"
echo "2. Проверка записи в базе данных"
echo "================================================"
echo ""

echo "Запрос к БД для проверки metadata..."
DB_CHECK=$(psql -U postgres -d gotosocial_db -t -c "SELECT metadata FROM posts WHERE id = '$POST_ID';" 2>&1)

if [ $? -eq 0 ]; then
    echo "Metadata в БД:"
    echo "$DB_CHECK" | jq '.' 2>/dev/null || echo "$DB_CHECK"
    
    # Проверяем есть ли code_blocks в metadata
    if echo "$DB_CHECK" | grep -q "code_blocks"; then
        echo -e "${GREEN}✓ code_blocks найдены в metadata${NC}"
    else
        echo -e "${RED}❌ code_blocks НЕ найдены в metadata${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Не удалось подключиться к БД напрямую${NC}"
    echo "Проверьте через pgAdmin или psql вручную"
fi
echo ""

# Получаем пост через API timeline
echo "================================================"
echo "3. Получение поста через API timeline"
echo "================================================"
echo ""

echo "GET /api/timelines/public?limit=20"
TIMELINE_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/timelines/public?limit=20" \
  -H "Authorization: Bearer $TOKEN")

echo "Количество постов в timeline: $(echo "$TIMELINE_RESPONSE" | jq 'length')"
echo ""

# Ищем наш пост
OUR_POST=$(echo "$TIMELINE_RESPONSE" | jq ".[] | select(.id == \"$POST_ID\")")

if [ -z "$OUR_POST" ]; then
    echo -e "${RED}❌ Пост не найден в timeline${NC}"
else
    echo -e "${GREEN}✓ Пост найден в timeline${NC}"
    echo ""
    echo "Данные поста:"
    echo "$OUR_POST" | jq '.'
    echo ""
    
    # Проверяем metadata
    METADATA=$(echo "$OUR_POST" | jq '.metadata')
    echo "Metadata в ответе API:"
    echo "$METADATA" | jq '.'
    
    if [ "$METADATA" != "null" ] && [ ! -z "$METADATA" ]; then
        echo -e "${GREEN}✓ Metadata присутствует${NC}"
        
        # Проверяем code_blocks
        CODE_BLOCKS=$(echo "$METADATA" | jq '.code_blocks')
        if [ "$CODE_BLOCKS" != "null" ] && [ ! -z "$CODE_BLOCKS" ]; then
            echo -e "${GREEN}✓ code_blocks присутствуют в metadata${NC}"
            echo ""
            echo "Code blocks:"
            echo "$CODE_BLOCKS" | jq '.'
        else
            echo -e "${RED}❌ code_blocks отсутствуют в metadata${NC}"
        fi
    else
        echo -e "${RED}❌ Metadata отсутствует в ответе${NC}"
    fi
fi
echo ""

# Итоги
echo "================================================"
echo "   Итоги тестирования"
echo "================================================"
echo ""
echo "Проверьте следующее:"
echo ""
echo "1. ${BLUE}Frontend (CreatePostModal)${NC}"
echo "   - Открывается ли модальное окно кода?"
echo "   - Отображается ли блок кода в превью?"
echo "   - Есть ли горизонтальное переполнение?"
echo ""
echo "2. ${BLUE}Backend (API)${NC}"
echo "   - Сохраняется ли metadata.code_blocks в БД?"
echo "   - Возвращается ли metadata в timeline API?"
echo ""
echo "3. ${BLUE}Frontend (Отображение)${NC}"
echo "   - Конвертируется ли post.metadata?.code_blocks в codeBlocks?"
echo "   - Отображается ли блок кода в FeedPost?"
echo ""
echo "Чтобы увидеть логи в реальном времени:"
echo "  Backend:  tail -f custom-backend.log"
echo "  Frontend: Откройте DevTools -> Console"
echo ""
echo "Для ручного тестирования:"
echo "  1. Откройте http://localhost:5173"
echo "  2. Создайте пост с блоком кода"
echo "  3. Проверьте отображение в ленте"
echo ""

# Если пост создан, выводим ссылки
if [ ! -z "$POST_ID" ]; then
    echo -e "${GREEN}Созданный пост:${NC}"
    echo "  ID: $POST_ID"
    echo "  URL: http://localhost:5173/home/post/$POST_ID"
    echo ""
fi

echo "================================================"
