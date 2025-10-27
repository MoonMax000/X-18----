#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Тестирование потока уведомлений ===${NC}\n"

# Проверка, что backend запущен
echo -e "${YELLOW}Шаг 1: Проверка работы backend...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:8080/api/health || echo "FAILED")
if [[ $HEALTH_CHECK == *"FAILED"* ]]; then
    echo -e "${RED}❌ Backend не запущен! Запустите: ./START_CUSTOM_BACKEND_STACK.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend работает${NC}\n"

# Получение токена первого пользователя
echo -e "${YELLOW}Шаг 2: Авторизация пользователя...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Не удалось получить токен${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✓ Токен получен${NC}\n"

# Проверка уведомлений через API
echo -e "${YELLOW}Шаг 3: Получение уведомлений через API...${NC}"
NOTIFICATIONS=$(curl -s http://localhost:8080/api/notifications \
  -H "Authorization: Bearer $TOKEN")

echo -e "${BLUE}Полный ответ API:${NC}"
echo "$NOTIFICATIONS" | jq '.' || echo "$NOTIFICATIONS"
echo ""

# Подсчет уведомлений
NOTIF_COUNT=$(echo "$NOTIFICATIONS" | jq 'length' 2>/dev/null || echo "0")
echo -e "${BLUE}Всего уведомлений: ${NOTIF_COUNT}${NC}"

if [ "$NOTIF_COUNT" -gt 0 ]; then
    echo -e "\n${BLUE}Первое уведомление:${NC}"
    echo "$NOTIFICATIONS" | jq '.[0]' || echo "$NOTIFICATIONS"
    
    # Проверка наличия actor
    HAS_ACTOR=$(echo "$NOTIFICATIONS" | jq '.[0].actor != null' 2>/dev/null || echo "false")
    echo -e "\n${BLUE}Есть поле actor: ${HAS_ACTOR}${NC}"
    
    if [ "$HAS_ACTOR" = "true" ]; then
        echo -e "\n${BLUE}Данные actor:${NC}"
        echo "$NOTIFICATIONS" | jq '.[0].actor'
    fi
fi

# Проверка счетчика непрочитанных
echo -e "\n${YELLOW}Шаг 4: Проверка непрочитанных уведомлений...${NC}"
UNREAD=$(curl -s http://localhost:8080/api/notifications/unread \
  -H "Authorization: Bearer $TOKEN")

echo -e "${BLUE}Непрочитанных:${NC}"
echo "$UNREAD" | jq '.' || echo "$UNREAD"

echo -e "\n${GREEN}=== Тест завершен ===${NC}"
echo -e "${YELLOW}Инструкции для дальнейшей отладки:${NC}"
echo "1. Откройте браузер и зайдите на http://localhost:3000"
echo "2. Войдите как user1 / password123"
echo "3. Откройте консоль разработчика (F12)"
echo "4. Перейдите на страницу уведомлений (/social/notifications)"
echo "5. Проверьте логи в консоли, начинающиеся с:"
echo "   - [useCustomNotifications]"
echo "   - [SocialNotifications]"
echo "   - [convertNotification]"
