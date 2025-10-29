#!/bin/bash

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== ПОЛНЫЙ ТЕСТ УВЕДОМЛЕНИЙ О ПОДПИСКАХ ===${NC}\n"

# Шаг 1: Очистить логи backend
echo -e "${YELLOW}Шаг 1: Очистка логов backend...${NC}"
> custom-backend.log
echo -e "${GREEN}✓ Логи очищены${NC}\n"

# Шаг 2: Регистрация testuser1
echo -e "${YELLOW}Шаг 2: Создание testuser1...${NC}"
REGISTER1=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testnotif1@example.com",
    "username": "testnotif1",
    "password": "Test1234!",
    "display_name": "Test Notif 1"
  }')

TOKEN1=$(echo $REGISTER1 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER1_ID=$(echo $REGISTER1 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN1" ]; then
    # Пользователь существует, войти
    LOGIN1=$(curl -s -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "testnotif1@example.com", "password": "Test1234!"}')
    TOKEN1=$(echo $LOGIN1 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    USER1_ID=$(echo $LOGIN1 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')
fi

echo -e "${GREEN}✓ testnotif1: ${USER1_ID}${NC}\n"

# Шаг 3: Регистрация testuser2
echo -e "${YELLOW}Шаг 3: Создание testuser2...${NC}"
REGISTER2=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testnotif2@example.com",
    "username": "testnotif2",
    "password": "Test1234!",
    "display_name": "Test Notif 2"
  }')

TOKEN2=$(echo $REGISTER2 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER2_ID=$(echo $REGISTER2 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN2" ]; then
    LOGIN2=$(curl -s -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "testnotif2@example.com", "password": "Test1234!"}')
    TOKEN2=$(echo $LOGIN2 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    USER2_ID=$(echo $LOGIN2 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')
fi

echo -e "${GREEN}✓ testnotif2: ${USER2_ID}${NC}\n"

# Шаг 4: testnotif2 подписывается на testnotif1
echo -e "${YELLOW}Шаг 4: testnotif2 подписывается на testnotif1...${NC}"
FOLLOW_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/users/${USER1_ID}/follow" \
  -H "Authorization: Bearer ${TOKEN2}")

echo -e "${BLUE}API Response:${NC}"
echo "$FOLLOW_RESPONSE" | jq '.' 2>/dev/null || echo "$FOLLOW_RESPONSE"
echo ""

# Шаг 5: Проверить логи backend
echo -e "${YELLOW}Шаг 5: Проверка логов backend...${NC}"
echo -e "${BLUE}Логи FollowUser:${NC}"
grep "\[FollowUser\]" custom-backend.log | tail -20
echo ""

# Шаг 6: Проверить уведомления через API
echo -e "${YELLOW}Шаг 6: Получение уведомлений testnotif1 через API...${NC}"
sleep 1
NOTIFICATIONS=$(curl -s "http://localhost:8080/api/notifications?limit=20" \
  -H "Authorization: Bearer ${TOKEN1}")

echo -e "${BLUE}API Response:${NC}"
echo "$NOTIFICATIONS" | jq '.' 2>/dev/null || echo "$NOTIFICATIONS"
echo ""

# Шаг 7: Поиск follow уведомлений
NOTIF_ARRAY=$(echo "$NOTIFICATIONS" | jq '.notifications' 2>/dev/null)
if [ "$NOTIF_ARRAY" != "null" ] && [ ! -z "$NOTIF_ARRAY" ]; then
    FOLLOW_NOTIFS=$(echo "$NOTIF_ARRAY" | jq '[.[] | select(.type == "follow")]' 2>/dev/null)
    FOLLOW_COUNT=$(echo "$FOLLOW_NOTIFS" | jq 'length' 2>/dev/null || echo "0")
    
    echo -e "${BLUE}Follow уведомлений: ${FOLLOW_COUNT}${NC}"
    
    if [ "$FOLLOW_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓✓✓ УСПЕХ! Follow уведомления найдены!${NC}\n"
        echo -e "${BLUE}Последнее follow уведомление:${NC}"
        echo "$FOLLOW_NOTIFS" | jq '.[-1]'
        
        # Проверка actor
        HAS_ACTOR=$(echo "$FOLLOW_NOTIFS" | jq '.[-1].actor != null' 2>/dev/null)
        if [ "$HAS_ACTOR" = "true" ]; then
            echo -e "\n${GREEN}✓ Actor присутствует${NC}"
        else
            HAS_FROM_USER=$(echo "$FOLLOW_NOTIFS" | jq '.[-1].from_user != null' 2>/dev/null)
            if [ "$HAS_FROM_USER" = "true" ]; then
                echo -e "\n${GREEN}✓ from_user присутствует${NC}"
            else
                echo -e "\n${RED}❌ Нет данных пользователя!${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Follow уведомления НЕ найдены${NC}"
        echo -e "${YELLOW}Проверим все уведомления:${NC}"
        echo "$NOTIF_ARRAY" | jq '.'
    fi
fi

# Шаг 8: Проверка логов GetNotifications
echo -e "\n${YELLOW}Шаг 8: Логи GetNotifications:${NC}"
grep "\[GetNotifications\]" custom-backend.log | tail -10

echo -e "\n${GREEN}=== ТЕСТ ЗАВЕРШЕН ===${NC}"
