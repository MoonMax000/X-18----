#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Простой тест уведомлений о подписках ===${NC}\n"

# Проверка, что backend запущен
echo -e "${YELLOW}Шаг 1: Проверка работы backend...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:8080/api/health || echo "FAILED")
if [[ $HEALTH_CHECK == *"FAILED"* ]]; then
    echo -e "${RED}❌ Backend не запущен! Запустите: ./START_CUSTOM_BACKEND_STACK.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend работает${NC}\n"

# Регистрация первого пользователя
echo -e "${YELLOW}Шаг 2: Регистрация testuser1...${NC}"
REGISTER1=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "username": "testuser1",
    "password": "Test1234!",
    "display_name": "Test User 1"
  }')

TOKEN1=$(echo $REGISTER1 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER1_ID=$(echo $REGISTER1 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN1" ]; then
    echo -e "${YELLOW}⚠ Пользователь уже существует, пробуем войти...${NC}"
    LOGIN1=$(curl -s -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser1@example.com",
        "password": "Test1234!"
      }')
    TOKEN1=$(echo $LOGIN1 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    USER1_ID=$(echo $LOGIN1 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')
fi

if [ -z "$TOKEN1" ]; then
    echo -e "${RED}❌ Не удалось авторизовать testuser1${NC}"
    exit 1
fi
echo -e "${GREEN}✓ testuser1 авторизован (ID: ${USER1_ID})${NC}\n"

# Регистрация второго пользователя
echo -e "${YELLOW}Шаг 3: Регистрация testuser2...${NC}"
REGISTER2=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "username": "testuser2",
    "password": "Test1234!",
    "display_name": "Test User 2"
  }')

TOKEN2=$(echo $REGISTER2 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER2_ID=$(echo $REGISTER2 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN2" ]; then
    echo -e "${YELLOW}⚠ Пользователь уже существует, пробуем войти...${NC}"
    LOGIN2=$(curl -s -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "testuser2@example.com",
        "password": "Test1234!"
      }')
    TOKEN2=$(echo $LOGIN2 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
    USER2_ID=$(echo $LOGIN2 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')
fi

if [ -z "$TOKEN2" ]; then
    echo -e "${RED}❌ Не удалось авторизовать testuser2${NC}"
    exit 1
fi
echo -e "${GREEN}✓ testuser2 авторизован (ID: ${USER2_ID})${NC}\n"

# testuser2 подписывается на testuser1
echo -e "${YELLOW}Шаг 4: testuser2 подписывается на testuser1...${NC}"
FOLLOW_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/users/${USER1_ID}/follow" \
  -H "Authorization: Bearer ${TOKEN2}" \
  -H "Content-Type: application/json")

echo -e "${BLUE}Ответ API:${NC}"
echo "$FOLLOW_RESPONSE" | jq '.' 2>/dev/null || echo "$FOLLOW_RESPONSE"
echo ""

# Проверка уведомлений testuser1
echo -e "${YELLOW}Шаг 5: Получение уведомлений testuser1...${NC}"
sleep 1
NOTIFICATIONS=$(curl -s "http://localhost:8080/api/notifications?limit=20" \
  -H "Authorization: Bearer ${TOKEN1}")

echo -e "${BLUE}Полный ответ API:${NC}"
echo "$NOTIFICATIONS" | jq '.' 2>/dev/null || echo "$NOTIFICATIONS"
echo ""

# Подсчет уведомлений
NOTIF_COUNT=$(echo "$NOTIFICATIONS" | jq 'length' 2>/dev/null || echo "0")
echo -e "${BLUE}Всего уведомлений: ${NOTIF_COUNT}${NC}"

if [ "$NOTIF_COUNT" -gt 0 ]; then
    # Поиск уведомлений о подписке
    FOLLOW_NOTIFS=$(echo "$NOTIFICATIONS" | jq '[.[] | select(.type == "follow")]' 2>/dev/null)
    FOLLOW_COUNT=$(echo "$FOLLOW_NOTIFS" | jq 'length' 2>/dev/null || echo "0")
    
    echo -e "${BLUE}Уведомлений о подписке: ${FOLLOW_COUNT}${NC}\n"
    
    if [ "$FOLLOW_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Уведомления о подписке найдены!${NC}\n"
        echo -e "${BLUE}Последнее уведомление о подписке:${NC}"
        echo "$FOLLOW_NOTIFS" | jq '.[-1]'
        
        # Проверка наличия actor
        HAS_ACTOR=$(echo "$FOLLOW_NOTIFS" | jq '.[-1].actor != null' 2>/dev/null || echo "false")
        echo -e "\n${BLUE}Есть поле actor: ${HAS_ACTOR}${NC}"
        
        if [ "$HAS_ACTOR" = "true" ]; then
            echo -e "\n${GREEN}✓ Данные actor присутствуют:${NC}"
            echo "$FOLLOW_NOTIFS" | jq '.[-1].actor'
            
            ACTOR_USERNAME=$(echo "$FOLLOW_NOTIFS" | jq -r '.[-1].actor.username' 2>/dev/null)
            echo -e "\n${GREEN}✓ Username в actor: ${ACTOR_USERNAME}${NC}"
        else
            echo -e "\n${RED}❌ Поле actor отсутствует или null!${NC}"
        fi
    else
        echo -e "${RED}❌ Уведомления о подписке не найдены${NC}"
        echo -e "${YELLOW}Показываем все уведомления:${NC}"
        echo "$NOTIFICATIONS" | jq '.'
    fi
else
    echo -e "${YELLOW}⚠ Уведомлений пока нет, но это может быть нормально${NC}"
    echo -e "${YELLOW}Попробуйте проверить в браузере${NC}"
fi

# Проверка счетчика непрочитанных
echo -e "\n${YELLOW}Шаг 6: Проверка непрочитанных уведомлений...${NC}"
UNREAD=$(curl -s http://localhost:8080/api/notifications/unread \
  -H "Authorization: Bearer ${TOKEN1}")

echo -e "${BLUE}Непрочитанных:${NC}"
echo "$UNREAD" | jq '.' 2>/dev/null || echo "$UNREAD"

echo -e "\n${GREEN}=== Тест завершен ===${NC}"
echo -e "\n${YELLOW}Учетные данные для браузера:${NC}"
echo "Пользователь 1: testuser1@example.com / Test1234!"
echo "Пользователь 2: testuser2@example.com / Test1234!"
echo -e "\n${YELLOW}Для проверки в браузере:${NC}"
echo "1. Откройте: http://localhost:3000"
echo "2. Войдите как testuser1@example.com / Test1234!"
echo "3. Откройте консоль (F12)"
echo "4. Перейдите на /social/notifications"
echo "5. Проверьте логи с префиксами:"
echo "   [useCustomNotifications] [SocialNotifications] [convertNotification]"
