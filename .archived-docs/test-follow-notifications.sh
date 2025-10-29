#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Тестирование уведомлений о подписках ===${NC}\n"

# Проверка, что backend запущен
echo -e "${YELLOW}Шаг 1: Проверка работы backend...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:8080/api/health || echo "FAILED")
if [[ $HEALTH_CHECK == *"FAILED"* ]]; then
    echo -e "${RED}❌ Backend не запущен! Запустите: ./START_CUSTOM_BACKEND_STACK.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend работает${NC}\n"

# Авторизация первого пользователя
echo -e "${YELLOW}Шаг 2: Авторизация пользователя crypto_trader_pro...${NC}"
LOGIN1=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "crypto_trader_pro",
    "password": "TradePro2024!"
  }')

TOKEN1=$(echo $LOGIN1 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER1_ID=$(echo $LOGIN1 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN1" ]; then
    echo -e "${RED}❌ Не удалось войти как crypto_trader_pro${NC}"
    exit 1
fi
echo -e "${GREEN}✓ crypto_trader_pro авторизован${NC}"
echo -e "   User ID: ${USER1_ID}\n"

# Авторизация второго пользователя
echo -e "${YELLOW}Шаг 3: Авторизация пользователя forex_master_fx...${NC}"
LOGIN2=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "forex_master_fx",
    "password": "ForexPro2024!"
  }')

TOKEN2=$(echo $LOGIN2 | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
USER2_ID=$(echo $LOGIN2 | grep -o '"user_id":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN2" ]; then
    echo -e "${RED}❌ Не удалось войти как forex_master_fx${NC}"
    exit 1
fi
echo -e "${GREEN}✓ forex_master_fx авторизован${NC}"
echo -e "   User ID: ${USER2_ID}\n"

# forex_master_fx подписывается на crypto_trader_pro
echo -e "${YELLOW}Шаг 4: forex_master_fx подписывается на crypto_trader_pro...${NC}"
FOLLOW_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/users/${USER1_ID}/follow" \
  -H "Authorization: Bearer ${TOKEN2}" \
  -H "Content-Type: application/json")

echo -e "${BLUE}Ответ API:${NC}"
echo "$FOLLOW_RESPONSE" | jq '.' || echo "$FOLLOW_RESPONSE"
echo ""

# Проверка уведомлений crypto_trader_pro
echo -e "${YELLOW}Шаг 5: Получение уведомлений crypto_trader_pro...${NC}"
sleep 1  # Небольшая задержка для обработки
NOTIFICATIONS=$(curl -s http://localhost:8080/api/notifications \
  -H "Authorization: Bearer ${TOKEN1}")

echo -e "${BLUE}Полный ответ API:${NC}"
echo "$NOTIFICATIONS" | jq '.' || echo "$NOTIFICATIONS"
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
        echo -e "${BLUE}Первое уведомление о подписке:${NC}"
        echo "$FOLLOW_NOTIFS" | jq '.[0]'
        
        # Проверка наличия actor
        HAS_ACTOR=$(echo "$FOLLOW_NOTIFS" | jq '.[0].actor != null' 2>/dev/null || echo "false")
        echo -e "\n${BLUE}Есть поле actor: ${HAS_ACTOR}${NC}"
        
        if [ "$HAS_ACTOR" = "true" ]; then
            echo -e "\n${GREEN}✓ Данные actor присутствуют:${NC}"
            echo "$FOLLOW_NOTIFS" | jq '.[0].actor'
        else
            echo -e "\n${RED}❌ Поле actor отсутствует или null!${NC}"
        fi
    else
        echo -e "${RED}❌ Уведомления о подписке не найдены${NC}"
        echo -e "${YELLOW}Показываем все уведомления:${NC}"
        echo "$NOTIFICATIONS" | jq '.'
    fi
else
    echo -e "${RED}❌ Уведомлений нет${NC}"
fi

# Проверка счетчика непрочитанных
echo -e "\n${YELLOW}Шаг 6: Проверка непрочитанных уведомлений...${NC}"
UNREAD=$(curl -s http://localhost:8080/api/notifications/unread \
  -H "Authorization: Bearer ${TOKEN1}")

echo -e "${BLUE}Непрочитанных:${NC}"
echo "$UNREAD" | jq '.' || echo "$UNREAD"

echo -e "\n${GREEN}=== Тест завершен ===${NC}"
echo -e "\n${YELLOW}Что дальше:${NC}"
echo "1. Откройте браузер: http://localhost:3000"
echo "2. Войдите как crypto_trader_pro / TradePro2024!"
echo "3. Откройте консоль (F12)"
echo "4. Перейдите на /social/notifications"
echo "5. Проверьте логи в консоли с префиксами:"
echo "   - [useCustomNotifications]"
echo "   - [SocialNotifications]"
echo "   - [convertNotification]"
