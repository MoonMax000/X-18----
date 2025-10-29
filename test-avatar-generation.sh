#!/bin/bash

# Скрипт для тестирования генерации аватарок и виджета топ авторов

echo "=============================================="
echo "Тест генерации аватарок и виджета топ авторов"
echo "=============================================="

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# URL API
API_URL="${API_URL:-http://localhost:8080/api}"

# Проверка доступности backend
echo -e "\n${YELLOW}1. Проверка доступности backend...${NC}"
if curl -s -f "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✓ Backend доступен${NC}"
else
    echo -e "${RED}✗ Backend недоступен на $API_URL${NC}"
    exit 1
fi

# Получение топ авторов
echo -e "\n${YELLOW}2. Получение топ авторов за последние 7 дней...${NC}"
RESPONSE=$(curl -s "$API_URL/widgets/top-authors?limit=5&timeframe=7d")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Запрос успешно выполнен${NC}"
    
    # Проверка наличия данных
    AUTHOR_COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
    
    if [ "$AUTHOR_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Найдено авторов: $AUTHOR_COUNT${NC}"
        
        # Выводим информацию о каждом авторе
        echo -e "\n${YELLOW}Информация об авторах:${NC}"
        for i in $(seq 0 $((AUTHOR_COUNT - 1))); do
            AUTHOR=$(echo "$RESPONSE" | jq ".[$i]")
            USERNAME=$(echo "$AUTHOR" | jq -r '.username')
            DISPLAY_NAME=$(echo "$AUTHOR" | jq -r '.display_name')
            AVATAR_URL=$(echo "$AUTHOR" | jq -r '.avatar_url // "null"')
            POSTS=$(echo "$AUTHOR" | jq -r '.posts_count')
            LIKES=$(echo "$AUTHOR" | jq -r '.likes_count')
            
            echo -e "\n${YELLOW}Автор #$((i + 1)):${NC}"
            echo "  Username: $USERNAME"
            echo "  Display Name: $DISPLAY_NAME"
            echo "  Posts: $POSTS"
            echo "  Likes: $LIKES"
            
            if [ "$AVATAR_URL" != "null" ] && [ "$AVATAR_URL" != "" ]; then
                echo -e "  Avatar: ${GREEN}✓ Есть пользовательская аватарка${NC}"
                echo "  URL: $AVATAR_URL"
            else
                echo -e "  Avatar: ${YELLOW}⚠ Будет сгенерирована аватарка с инициалами${NC}"
                
                # Вычисляем инициалы
                if [ "$DISPLAY_NAME" != "null" ] && [ "$DISPLAY_NAME" != "" ]; then
                    INITIALS=$(echo "$DISPLAY_NAME" | awk '{print toupper(substr($1,1,1) substr($NF,1,1))}')
                else
                    INITIALS=$(echo "$USERNAME" | awk '{print toupper(substr($0,1,2))}')
                fi
                echo "  Инициалы: $INITIALS"
            fi
        done
    else
        echo -e "${YELLOW}⚠ Авторы не найдены (возможно, нет постов за последние 7 дней)${NC}"
    fi
else
    echo -e "${RED}✗ Ошибка при получении данных${NC}"
    echo "$RESPONSE"
fi

# Проверка других временных промежутков
echo -e "\n${YELLOW}3. Проверка других временных промежутков...${NC}"

for TIMEFRAME in "24h" "30d"; do
    echo -e "\nПроверка за $TIMEFRAME:"
    RESPONSE=$(curl -s "$API_URL/widgets/top-authors?limit=3&timeframe=$TIMEFRAME")
    AUTHOR_COUNT=$(echo "$RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
    
    if [ "$AUTHOR_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Найдено авторов: $AUTHOR_COUNT${NC}"
    else
        echo -e "${YELLOW}⚠ Авторы не найдены за период $TIMEFRAME${NC}"
    fi
done

echo -e "\n${GREEN}=============================================="
echo -e "Тестирование завершено!"
echo -e "==============================================${NC}"

echo -e "\n${YELLOW}Примечание:${NC}"
echo "- Аватарки с инициалами генерируются на frontend"
echo "- Цвет фона аватарки основан на user_id"
echo "- Если у пользователя нет загруженной аватарки, будет использована сгенерированная"
