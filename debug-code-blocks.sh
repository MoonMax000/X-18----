#!/bin/bash

# Скрипт для отладки блоков кода в постах
# Проверяет всю цепочку от создания до отображения

echo "🔍 Проверка системы блоков кода"
echo "================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для проверки
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# Шаг 1: Проверка backend
echo -e "${BLUE}Шаг 1: Проверка Backend${NC}"
echo "------------------------"

# Проверка что backend запущен
curl -s http://localhost:8080/health > /dev/null 2>&1
check "Backend запущен на порту 8080"

# Проверка PostgreSQL
psql -U postgres -d x18_backend -c "SELECT 1;" > /dev/null 2>&1
check "PostgreSQL доступна"

# Шаг 2: Проверка структуры БД
echo ""
echo -e "${BLUE}Шаг 2: Проверка структуры БД${NC}"
echo "-----------------------------"

# Проверяем что таблица posts существует
psql -U postgres -d x18_backend -c "\d posts" > /dev/null 2>&1
check "Таблица posts существует"

# Проверяем что поле metadata есть
METADATA_EXISTS=$(psql -U postgres -d x18_backend -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='posts' AND column_name='metadata';" | tr -d ' ')
if [ "$METADATA_EXISTS" = "metadata" ]; then
    echo -e "${GREEN}✓${NC} Поле metadata существует"
else
    echo -e "${RED}✗${NC} Поле metadata НЕ существует"
fi

# Проверяем тип поля metadata
METADATA_TYPE=$(psql -U postgres -d x18_backend -t -c "SELECT data_type FROM information_schema.columns WHERE table_name='posts' AND column_name='metadata';" | tr -d ' ')
if [ "$METADATA_TYPE" = "jsonb" ]; then
    echo -e "${GREEN}✓${NC} Поле metadata типа JSONB"
else
    echo -e "${YELLOW}⚠${NC} Поле metadata типа $METADATA_TYPE (должен быть JSONB)"
fi

# Шаг 3: Проверка постов с code_blocks
echo ""
echo -e "${BLUE}Шаг 3: Проверка постов с code_blocks${NC}"
echo "--------------------------------------"

# Подсчитываем посты с code_blocks
CODE_BLOCKS_COUNT=$(psql -U postgres -d x18_backend -t -c "SELECT COUNT(*) FROM posts WHERE metadata ? 'code_blocks';" | tr -d ' ')
echo "Найдено постов с code_blocks: $CODE_BLOCKS_COUNT"

if [ "$CODE_BLOCKS_COUNT" -gt "0" ]; then
    echo ""
    echo "Последний пост с code_blocks:"
    psql -U postgres -d x18_backend -c "SELECT id, LEFT(content, 30) as content, metadata->'code_blocks' as code_blocks FROM posts WHERE metadata ? 'code_blocks' ORDER BY created_at DESC LIMIT 1;"
fi

# Шаг 4: Проверка последнего поста
echo ""
echo -e "${BLUE}Шаг 4: Последний пост в БД${NC}"
echo "---------------------------"

LAST_POST=$(psql -U postgres -d x18_backend -t -c "SELECT id, content, metadata FROM posts ORDER BY created_at DESC LIMIT 1;")
echo "$LAST_POST"

# Проверяем есть ли metadata
HAS_METADATA=$(echo "$LAST_POST" | grep -o "code_blocks" | wc -l)
if [ "$HAS_METADATA" -gt "0" ]; then
    echo -e "${GREEN}✓${NC} Последний пост содержит code_blocks в metadata"
else
    echo -e "${YELLOW}⚠${NC} Последний пост НЕ содержит code_blocks"
fi

# Шаг 5: Проверка Timeline API
echo ""
echo -e "${BLUE}Шаг 5: Проверка Timeline API${NC}"
echo "-----------------------------"

# Получаем токен из localStorage (если есть)
# Примечание: это для ручной проверки
echo "Для проверки Timeline API выполните:"
echo ""
echo -e "${YELLOW}curl -H \"Authorization: Bearer YOUR_TOKEN\" http://localhost:8080/api/timeline/explore?limit=1 | jq '.posts[0].metadata'${NC}"
echo ""
echo "Замените YOUR_TOKEN на ваш токен из localStorage (custom_token)"

# Шаг 6: Проверка файлов Frontend
echo ""
echo -e "${BLUE}Шаг 6: Проверка файлов Frontend${NC}"
echo "--------------------------------"

# Проверяем что файлы существуют
FILES=(
    "client/services/api/custom-backend.ts"
    "client/pages/FeedTest.tsx"
    "client/features/feed/components/posts/FeedPost.tsx"
    "client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file НЕ найден"
    fi
done

# Шаг 7: Проверка TypeScript типов
echo ""
echo -e "${BLUE}Шаг 7: Проверка TypeScript типов${NC}"
echo "----------------------------------"

# Проверяем что metadata имеет правильный тип
METADATA_TYPE_CHECK=$(grep "metadata?: Record<string, any>" client/services/api/custom-backend.ts | wc -l)
if [ "$METADATA_TYPE_CHECK" -ge "2" ]; then
    echo -e "${GREEN}✓${NC} TypeScript типы metadata правильные (Record<string, any>)"
else
    echo -e "${RED}✗${NC} TypeScript типы metadata НЕПРАВИЛЬНЫЕ"
    echo "   В файле client/services/api/custom-backend.ts должно быть:"
    echo "   metadata?: Record<string, any>  // НЕ Record<string, string>!"
fi

# Шаг 8: Проверка логирования
echo ""
echo -e "${BLUE}Шаг 8: Проверка логирования${NC}"
echo "----------------------------"

# CreatePostModal
if grep -q "\[CreatePostModal\] Added code blocks to metadata" client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx; then
    echo -e "${GREEN}✓${NC} Логирование в CreatePostModal"
else
    echo -e "${RED}✗${NC} Логирование в CreatePostModal отсутствует"
fi

# FeedTest
if grep -q "\[FeedTest\] Converting post with code blocks" client/pages/FeedTest.tsx; then
    echo -e "${GREEN}✓${NC} Логирование в FeedTest"
else
    echo -e "${RED}✗${NC} Логирование в FeedTest отсутствует"
fi

# FeedPost
if grep -q "\[FeedPost\] Rendering code blocks" client/features/feed/components/posts/FeedPost.tsx; then
    echo -e "${GREEN}✓${NC} Логирование в FeedPost"
else
    echo -e "${RED}✗${NC} Логирование в FeedPost отсутствует"
fi

# Итоги
echo ""
echo "================================"
echo -e "${BLUE}📊 ИТОГИ${NC}"
echo "================================"
echo ""
echo "Ключевые файлы для проверки:"
echo ""
echo "1. ОТОБРАЖЕНИЕ блоков кода:"
echo "   ${YELLOW}client/features/feed/components/posts/FeedPost.tsx${NC}"
echo "   Строки: ~238-257"
echo ""
echo "2. КОНВЕРТЕР данных:"
echo "   ${YELLOW}client/pages/FeedTest.tsx${NC}"
echo "   Строка: 71 (codeBlocks: post.metadata?.code_blocks || [])"
echo ""
echo "3. СОЗДАНИЕ поста:"
echo "   ${YELLOW}client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx${NC}"
echo "   Строки: ~114-127"
echo ""
echo "4. BACKEND API:"
echo "   ${YELLOW}custom-backend/internal/api/posts.go${NC}"
echo "   Строка: 86 (Metadata: req.Metadata)"
echo ""
echo "5. TYPESCRIPT ТИПЫ:"
echo "   ${YELLOW}client/services/api/custom-backend.ts${NC}"
echo "   Строки: 522, 543 (metadata?: Record<string, any>)"
echo ""
echo "================================"
echo ""
echo "Для проверки растяжения секции смотрите:"
echo "  ${YELLOW}FeedPost.tsx${NC} строка 248: max-w-full overflow-hidden"
echo "  ${YELLOW}FeedPost.tsx${NC} строка 252: overflow-x-auto w-full"
echo "  ${YELLOW}FeedPost.tsx${NC} строка 253: whiteSpace, wordBreak, overflowWrap"
echo ""
echo "Подробное руководство: ${YELLOW}DEBUG_CODE_BLOCKS_GUIDE.md${NC}"
echo ""
