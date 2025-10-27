#!/bin/bash

echo "🔍 Тест уведомлений с реальной аутентификацией"
echo "=============================================="
echo ""

# 1. Логинимся как devidandersoncrypto
echo "1️⃣ Вход как devidandersoncrypto..."
LOGIN_RESPONSE=$(curl -s http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "devidandersoncrypto@gmail.com",
        "password": "123456"
    }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo "❌ Не удалось войти. Ответ API:"
    echo "$LOGIN_RESPONSE" | jq
    exit 1
fi

echo "✅ Вошли успешно"
echo "Token: ${TOKEN:0:30}..."
echo ""

# 2. Получаем инфо о текущем пользователе
echo "2️⃣ Получение информации о пользователе..."
ME=$(curl -s http://localhost:8080/api/users/me \
    -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo "$ME" | jq -r '.id')
USERNAME=$(echo "$ME" | jq -r '.username')

echo "✅ User ID: $USER_ID"
echo "✅ Username: $USERNAME"
echo ""

# 3. Получаем уведомления
echo "3️⃣ Получение уведомлений..."
NOTIFICATIONS=$(curl -s "http://localhost:8080/api/notifications?limit=5" \
    -H "Authorization: Bearer $TOKEN")

echo "$NOTIFICATIONS" | jq '{
    total: .total,
    unread_count: .unread_count,
    notifications: .notifications | length
}'

echo ""

# 4. Проверяем структуру первого уведомления
echo "4️⃣ Детали первого уведомления:"
FIRST_NOTIF=$(echo "$NOTIFICATIONS" | jq '.notifications[0]')

if [ "$FIRST_NOTIF" = "null" ] || [ -z "$FIRST_NOTIF" ]; then
    echo "⚠️ Уведомлений нет. Создадим тестовое..."
    
    # Получаем другого пользователя для теста
    OTHER_USER=$(psql -d x18_backend -t -c "
        SELECT id FROM users WHERE id != '$USER_ID' LIMIT 1;" | tr -d ' ')
    
    if [ -z "$OTHER_USER" ]; then
        echo "❌ Нет других пользователей для теста"
        exit 1
    fi
    
    # Создаем тестовое уведомление
    psql -d x18_backend -c "
    INSERT INTO notifications (id, user_id, from_user_id, type, read, created_at)
    VALUES (gen_random_uuid(), '$USER_ID', '$OTHER_USER', 'like', false, NOW());"
    
    echo "✅ Тестовое уведомление создано"
    echo ""
    
    # Повторно получаем уведомления
    echo "5️⃣ Повторное получение уведомлений..."
    NOTIFICATIONS=$(curl -s "http://localhost:8080/api/notifications?limit=5" \
        -H "Authorization: Bearer $TOKEN")
    
    FIRST_NOTIF=$(echo "$NOTIFICATIONS" | jq '.notifications[0]')
fi

# Показываем полную структуру
echo "Полная структура:"
echo "$FIRST_NOTIF" | jq

echo ""
echo "Ключевые поля:"
echo "$FIRST_NOTIF" | jq '{
    id,
    type,
    actor_id,
    actor: (.actor | {
        id,
        username,
        display_name,
        avatar_url
    }),
    is_read,
    created_at
}'

echo ""

# 5. Проверяем что actor не null
ACTOR=$(echo "$FIRST_NOTIF" | jq -r '.actor')

if [ "$ACTOR" = "null" ] || [ -z "$ACTOR" ]; then
    echo "❌ ПРОБЛЕМА: actor = null!"
    echo ""
    echo "Проверка в БД:"
    NOTIF_ID=$(echo "$FIRST_NOTIF" | jq -r '.id')
    
    psql -d x18_backend -c "
    SELECT 
        n.id,
        n.from_user_id,
        u.username as actor_username,
        u.display_name as actor_display_name
    FROM notifications n
    LEFT JOIN users u ON n.from_user_id = u.id
    WHERE n.id = '$NOTIF_ID';"
    
    echo ""
    echo "⚠️ Данные в БД есть, но API их не возвращает!"
    echo "Это значит проблема в сериализации GORM или Preload не работает."
else
    echo "✅ Actor данные получены успешно!"
    echo ""
    echo "Actor info:"
    echo "$ACTOR" | jq
fi

echo ""
echo "=============================================="
echo "Диагностика завершена"
