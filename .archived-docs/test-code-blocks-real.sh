#!/bin/bash

echo "================================================"
echo "   РЕАЛЬНАЯ ПРОВЕРКА БЛОКОВ КОДА"
echo "================================================"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Проверка что backend запущен
echo -e "${BLUE}1. Проверка backend...${NC}"
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend не запущен на порту 8080${NC}"
    echo "Запустите: ./START_CUSTOM_BACKEND_STACK.sh"
    exit 1
fi
echo -e "${GREEN}✓ Backend работает${NC}"
echo ""

# 2. Логин (используем существующего пользователя)
echo -e "${BLUE}2. Попытка входа...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "devidandersoncrypto@gmail.com",
    "password": "Test123!@#"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ Не удалось войти${NC}"
    echo "Ответ сервера:"
    echo "$LOGIN_RESPONSE" | jq '.'
    echo ""
    echo "Попробуйте другие учетные данные или создайте пользователя"
    exit 1
fi

echo -e "${GREEN}✓ Успешный вход. Токен получен${NC}"
echo ""

# 3. Создание поста с блоком кода
echo -e "${BLUE}3. Создание поста с блоком кода...${NC}"

POST_DATA='{
  "content": "Тестовый пост с блоком JavaScript кода",
  "metadata": {
    "post_type": "code",
    "code_blocks": [
      {
        "language": "javascript",
        "code": "function hello() {\n  console.log(\"Hello World!\");\n  return true;\n}"
      }
    ]
  },
  "visibility": "public"
}'

echo "Отправка поста..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$POST_DATA")

echo "Ответ от сервера:"
echo "$CREATE_RESPONSE" | jq '.'
echo ""

POST_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id // empty')

if [ -z "$POST_ID" ] || [ "$POST_ID" == "null" ]; then
    echo -e "${RED}❌ Не удалось создать пост${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Пост создан. ID: $POST_ID${NC}"
echo ""

# 4. Проверка metadata в созданном посте
echo -e "${BLUE}4. Проверка metadata в созданном посте...${NC}"
METADATA=$(echo "$CREATE_RESPONSE" | jq '.metadata')
echo "Metadata:"
echo "$METADATA" | jq '.'

if echo "$METADATA" | jq -e '.code_blocks' > /dev/null 2>&1; then
    CODE_BLOCKS_COUNT=$(echo "$METADATA" | jq '.code_blocks | length')
    echo -e "${GREEN}✓ code_blocks присутствуют в metadata (количество: $CODE_BLOCKS_COUNT)${NC}"
else
    echo -e "${RED}❌ code_blocks ОТСУТСТВУЮТ в metadata${NC}"
    echo -e "${YELLOW}ПРОБЛЕМА: Backend не возвращает code_blocks!${NC}"
fi
echo ""

# 5. Получение поста через timeline API
echo -e "${BLUE}5. Получение поста через timeline API...${NC}"
sleep 1  # Даем время на сохранение

TIMELINE_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/timelines/public?limit=20" \
  -H "Authorization: Bearer $TOKEN")

echo "Количество постов в timeline: $(echo "$TIMELINE_RESPONSE" | jq 'length')"

# Ищем наш пост
OUR_POST=$(echo "$TIMELINE_RESPONSE" | jq ".[] | select(.id == \"$POST_ID\")")

if [ -z "$OUR_POST" ]; then
    echo -e "${RED}❌ Пост не найден в timeline${NC}"
else
    echo -e "${GREEN}✓ Пост найден в timeline${NC}"
    echo ""
    
    # Проверяем metadata в timeline
    TIMELINE_METADATA=$(echo "$OUR_POST" | jq '.metadata')
    echo "Metadata из timeline:"
    echo "$TIMELINE_METADATA" | jq '.'
    
    if echo "$TIMELINE_METADATA" | jq -e '.code_blocks' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ code_blocks присутствуют в timeline${NC}"
    else
        echo -e "${RED}❌ code_blocks ОТСУТСТВУЮТ в timeline${NC}"
        echo -e "${YELLOW}ПРОБЛЕМА: Timeline API не возвращает code_blocks!${NC}"
    fi
fi
echo ""

# 6. Прямая проверка в БД
echo -e "${BLUE}6. Проверка записи в базе данных...${NC}"
DB_QUERY="SELECT id, content, metadata FROM posts WHERE id = '$POST_ID';"

DB_RESULT=$(psql -U postgres -d gotosocial_db -t -c "$DB_QUERY" 2>&1)

if [ $? -eq 0 ]; then
    echo "Запись из БД:"
    echo "$DB_RESULT"
    echo ""
    
    if echo "$DB_RESULT" | grep -q "code_blocks"; then
        echo -e "${GREEN}✓ code_blocks найдены в БД${NC}"
    else
        echo -e "${RED}❌ code_blocks НЕ найдены в БД${NC}"
        echo -e "${YELLOW}ПРОБЛЕМА: Данные не сохраняются в БД!${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Не удалось подключиться к БД напрямую${NC}"
    echo "Ошибка: $DB_RESULT"
fi
echo ""

# 7. Итоги
echo "================================================"
echo -e "${BLUE}   ИТОГИ ДИАГНОСТИКИ${NC}"
echo "================================================"
echo ""
echo "Проверьте в браузере:"
echo "  1. Откройте http://localhost:5173"
echo "  2. Войдите в систему"
echo "  3. Найдите пост с ID: $POST_ID"
echo "  4. Откройте DevTools (F12) -> Console"
echo "  5. Обновите страницу"
echo ""
echo "Ищите в консоли:"
echo "  - [FeedTest] Converting post with code blocks"
echo "  - [FeedPost] Rendering code blocks"
echo ""
echo "Если блок кода НЕ отображается:"
echo "  - Проверьте что metadata.code_blocks существует в API"
echo "  - Проверьте конвертер customPostToFeedPost"
echo "  - Проверьте условие рендеринга post.codeBlocks"
echo ""
