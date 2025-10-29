#!/bin/bash

echo "🧪 Тестирование блоков кода в постах"
echo "===================================="

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Проверка токена
echo -e "\n${YELLOW}1. Проверка аутентификации...${NC}"
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ AUTH_TOKEN не установлен${NC}"
    echo "Установите: export AUTH_TOKEN='your_token_here'"
    exit 1
fi
echo -e "${GREEN}✓ Токен найден${NC}"

# 2. Создание поста с блоком кода
echo -e "\n${YELLOW}2. Создание поста с блоком кода...${NC}"

POST_DATA='{
  "content": "Тестирование блоков кода! 🧪\n\nВот пример React компонента:",
  "metadata": {
    "post_type": "code",
    "code_blocks": [
      {
        "language": "typescript",
        "code": "import React from '\''react'\'';\n\ninterface Props {\n  message: string;\n}\n\nexport const Hello: React.FC<Props> = ({ message }) => {\n  const [count, setCount] = React.useState(0);\n  \n  return (\n    <div>\n      <h1>{message}</h1>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n};"
      }
    ]
  },
  "visibility": "public"
}'

RESPONSE=$(curl -s -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$POST_DATA")

POST_ID=$(echo $RESPONSE | jq -r '.id')

if [ "$POST_ID" != "null" ] && [ -n "$POST_ID" ]; then
    echo -e "${GREEN}✓ Пост создан: ID = $POST_ID${NC}"
    echo "Response: $RESPONSE" | jq '.'
else
    echo -e "${RED}❌ Ошибка создания поста${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

# 3. Получение поста и проверка metadata
echo -e "\n${YELLOW}3. Проверка поста из БД...${NC}"

GET_RESPONSE=$(curl -s http://localhost:8080/api/posts/$POST_ID \
  -H "Authorization: Bearer $AUTH_TOKEN")

# Проверяем наличие code_blocks в metadata
CODE_BLOCKS=$(echo $GET_RESPONSE | jq -r '.metadata.code_blocks')

if [ "$CODE_BLOCKS" != "null" ]; then
    echo -e "${GREEN}✓ code_blocks найдены в metadata${NC}"
    echo "Code blocks:" | jq '.'
    echo $CODE_BLOCKS | jq '.'
else
    echo -e "${RED}❌ code_blocks не найдены в metadata${NC}"
    echo "Full response:"
    echo $GET_RESPONSE | jq '.'
fi

# 4. Получение timeline и проверка
echo -e "\n${YELLOW}4. Проверка в timeline...${NC}"

TIMELINE_RESPONSE=$(curl -s "http://localhost:8080/api/timeline/explore?limit=1" \
  -H "Authorization: Bearer $AUTH_TOKEN")

FIRST_POST=$(echo $TIMELINE_RESPONSE | jq '.[0]')
TIMELINE_CODE_BLOCKS=$(echo $FIRST_POST | jq -r '.metadata.code_blocks')

if [ "$TIMELINE_CODE_BLOCKS" != "null" ]; then
    echo -e "${GREEN}✓ code_blocks присутствуют в timeline${NC}"
else
    echo -e "${YELLOW}⚠ code_blocks не найдены в первом посте timeline${NC}"
    echo "Проверьте, что это ваш пост"
fi

# 5. Создание длинного поста для проверки overflow
echo -e "\n${YELLOW}5. Тест с длинным кодом (overflow check)...${NC}"

LONG_POST_DATA='{
  "content": "Проверка длинного кода без переносов строк:",
  "metadata": {
    "code_blocks": [
      {
        "language": "javascript",
        "code": "const veryLongVariableName = '\''thisIsAVeryLongStringWithoutAnySpacesOrBreaksThatShouldBeHandledProperlyByTheWordBreakCSS'\'';\nconst anotherVeryLongLineOfCodeThatGoesOnAndOnWithoutAnyBreaksOrSpacesToTestTheHorizontalScrollingAndWordWrapping = true;\nfunction veryLongFunctionNameThatIsUnreasonablyLongButShouldStillBeHandledCorrectly() { return '\''test'\''; }"
      }
    ]
  }
}'

LONG_RESPONSE=$(curl -s -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$LONG_POST_DATA")

LONG_POST_ID=$(echo $LONG_RESPONSE | jq -r '.id')

if [ "$LONG_POST_ID" != "null" ]; then
    echo -e "${GREEN}✓ Длинный пост создан: ID = $LONG_POST_ID${NC}"
else
    echo -e "${RED}❌ Ошибка создания длинного поста${NC}"
fi

# Итоги
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Тестирование завершено!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Созданные посты:"
echo "  1. Обычный код: $POST_ID"
echo "  2. Длинный код: $LONG_POST_ID"
echo ""
echo "Проверьте в браузере:"
echo "  - http://localhost:5173/home"
echo "  - Откройте пост $POST_ID"
echo "  - Блок кода должен:"
echo "    ✓ Отображаться с правильной подсветкой"
echo "    ✓ Не выходить за границы контейнера"
echo "    ✓ Переносить длинные строки"
echo ""
