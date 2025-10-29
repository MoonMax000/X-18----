#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚂 Проверка Backend на Railway${NC}\n"

API_URL="https://api.tyriantrade.com"

echo -e "${BLUE}1. Проверка Health Endpoint${NC}"
HEALTH=$(curl -s "$API_URL/health" 2>/dev/null)
echo "Response: $HEALTH"

if [[ "$HEALTH" == *"ok"* ]]; then
    echo -e "${GREEN}✓ Backend работает${NC}\n"
else
    echo -e "${RED}✗ Backend не отвечает${NC}\n"
fi

echo -e "${BLUE}2. Проверка API Роутов${NC}"

# Проверяем разные роуты
ROUTES=(
    "/api/auth/signup"
    "/api/notifications"
    "/api/timeline/explore"
    "/api/posts"
)

for route in "${ROUTES[@]}"; do
    echo -e "${YELLOW}Проверка: $API_URL$route${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$route" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "404" ]; then
        echo -e "  ${RED}✗ 404 - Роут не найден${NC}"
    elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        echo -e "  ${GREEN}✓ Роут существует (требует авторизацию)${NC}"
    elif [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✓ 200 - Роут работает${NC}"
    else
        echo -e "  ${YELLOW}? HTTP $HTTP_CODE${NC}"
    fi
done

echo -e "\n${BLUE}3. Проверка CORS${NC}"
CORS=$(curl -s -H "Origin: https://social.tyriantrade.com" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS "$API_URL/api/notifications" \
    -I 2>/dev/null | grep -i "access-control")
    
if [ -n "$CORS" ]; then
    echo -e "${GREEN}✓ CORS настроен${NC}"
    echo "$CORS"
else
    echo -e "${RED}✗ CORS не найден${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 ДИАГНОЗ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [[ "$HEALTH" == *"ok"* ]]; then
    echo -e "${YELLOW}Backend запущен, но API роуты недоступны${NC}\n"
    echo "Возможные причины:"
    echo "1. Backend не полностью задеплоен на Railway"
    echo "2. Код не запушен в Git / Railway"
    echo "3. Railway деплоит старую версию кода"
    echo ""
    echo -e "${BLUE}РЕШЕНИЕ:${NC}"
    echo "1. Проверить Railway → Deployments → последний деплой"
    echo "2. Убедиться что custom-backend код задеплоен"
    echo "3. Возможно нужен редеплой с правильным кодом"
else
    echo -e "${RED}Backend вообще не запущен!${NC}\n"
    echo -e "${BLUE}РЕШЕНИЕ:${NC}"
    echo "1. Зайти на https://railway.app"
    echo "2. Проверить статус сервиса X-18----"
    echo "3. Посмотреть логи деплоя"
    echo "4. Возможно нужен ручной Deploy"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
