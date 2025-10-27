#!/bin/bash

# Debug script для диагностики системы уведомлений

echo "==================================="
echo "ДИАГНОСТИКА СИСТЕМЫ УВЕДОМЛЕНИЙ"
echo "==================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Проверка работы backend
echo "1. Проверка backend..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend работает${NC}"
else
    echo -e "${RED}✗ Backend не отвечает${NC}"
    exit 1
fi

# 2. Проверка базы данных PostgreSQL
echo ""
echo "2. Проверка базы данных..."
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✓ PostgreSQL контейнер работает${NC}"
    
    # Проверка таблицы notifications
    echo ""
    echo "Содержимое таблицы notifications:"
    docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d x18_db -c "SELECT COUNT(*) as total_notifications FROM notifications;" 2>/dev/null || echo -e "${RED}Ошибка доступа к БД${NC}"
    
    echo ""
    echo "Последние 5 уведомлений:"
    docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d x18_db -c "SELECT id, user_id, type, from_user_id, read, created_at FROM notifications ORDER BY created_at DESC LIMIT 5;" 2>/dev/null || echo -e "${RED}Ошибка чтения уведомлений${NC}"
    
    echo ""
    echo "Количество непрочитанных по пользователям:"
    docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d x18_db -c "SELECT user_id, COUNT(*) as unread_count FROM notifications WHERE read = false GROUP BY user_id;" 2>/dev/null || echo -e "${RED}Ошибка подсчета непрочитанных${NC}"
else
    echo -e "${RED}✗ PostgreSQL контейнер не найден${NC}"
fi

# 3. Получение токена из localStorage (требует manual проверки)
echo ""
echo "3. Для проверки API нужен токен из браузера:"
echo -e "${YELLOW}Откройте DevTools → Application → Local Storage → custom_token${NC}"
echo ""
read -p "Введите токен (или Enter для пропуска): " TOKEN

if [ ! -z "$TOKEN" ]; then
    echo ""
    echo "4. Тестирование API endpoints..."
    
    # Проверка GET /api/notifications
    echo ""
    echo "a) GET /api/notifications"
    RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/notifications?limit=5)
    if echo "$RESPONSE" | jq -e '.notifications' > /dev/null 2>&1; then
        COUNT=$(echo "$RESPONSE" | jq '.notifications | length')
        UNREAD=$(echo "$RESPONSE" | jq '.unread_count')
        echo -e "${GREEN}✓ Получено ${COUNT} уведомлений, непрочитанных: ${UNREAD}${NC}"
        echo "$RESPONSE" | jq '.notifications[0]' 2>/dev/null || echo "Нет уведомлений"
    else
        echo -e "${RED}✗ Ошибка получения уведомлений${NC}"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    fi
    
    # Проверка GET /api/notifications/unread-count
    echo ""
    echo "b) GET /api/notifications/unread-count"
    RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/notifications/unread-count)
    if echo "$RESPONSE" | jq -e '.unread_count' > /dev/null 2>&1; then
        UNREAD=$(echo "$RESPONSE" | jq '.unread_count')
        echo -e "${GREEN}✓ Непрочитанных уведомлений: ${UNREAD}${NC}"
    else
        echo -e "${RED}✗ Ошибка получения счетчика${NC}"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    fi
    
    # Проверка текущего пользователя
    echo ""
    echo "c) GET /api/users/me"
    RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/users/me)
    if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        USER_ID=$(echo "$RESPONSE" | jq -r '.id')
        USERNAME=$(echo "$RESPONSE" | jq -r '.username')
        echo -e "${GREEN}✓ Текущий пользователь: ${USERNAME} (ID: ${USER_ID})${NC}"
        
        # Проверка уведомлений конкретного пользователя в БД
        echo ""
        echo "Уведомления этого пользователя в БД:"
        docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d x18_db -c "SELECT id, type, from_user_id, read, created_at FROM notifications WHERE user_id = '$USER_ID' ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
    else
        echo -e "${RED}✗ Ошибка получения данных пользователя${NC}"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    fi
fi

# 5. Проверка логов backend
echo ""
echo "5. Последние логи backend (если есть):"
if [ -f "custom-backend.log" ]; then
    tail -20 custom-backend.log | grep -i "notification\|error" || echo "Нет релевантных логов"
else
    echo "Файл custom-backend.log не найден"
fi

echo ""
echo "==================================="
echo "ДИАГНОСТИКА ЗАВЕРШЕНА"
echo "==================================="
