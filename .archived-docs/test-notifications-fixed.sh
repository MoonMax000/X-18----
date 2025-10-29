#!/bin/bash

echo "🔍 Тест уведомлений с правильными учетными данными"
echo "=================================================="
echo ""

# Логин с учетными данными из seed-test-users.sh
PASSWORD="TestPass123!@#"

# Находим первого пользователя
FIRST_USER=$(psql -d x18_backend -t -c "SELECT username FROM users LIMIT 1;" | tr -d ' ')

if [ -z "$FIRST_USER" ]; then
    echo "❌ Пользователи не найдены в БД"
    exit 1
fi

echo "1️⃣ Вход как пользователь: $FIRST_USER"

LOGIN_RESPONSE=$(curl -s http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"${FIRST_USER}@example.com\",
        \"password\": \"$PASSWORD\"
    }")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo "❌ Не удалось войти с паролем из seed-test-users.sh"
    echo "Ответ API:"
    echo "$LOGIN_RESPONSE" | jq
    echo ""
    echo "⚠️ Попробую создать нового пользователя для теста..."
    
    # Создаем нового пользователя
    TEST_USER="notif_test_$(date +%s)"
    REGISTER_RESPONSE=$(curl -s http://localhost:8080/api/auth/register \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"$TEST_USER\",
            \"email\": \"${TEST_USER}@example.com\",
            \"password\": \"TestPass123!@#\"
        }")
    
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token // empty')
    
    if [ -z "$TOKEN" ]; then
        echo "❌ Не удалось создать тестового пользователя"
        exit 1
    fi
    
    echo "✅ Создан тестовый пользователь: $TEST_USER"
fi

echo "✅ Авторизация успешна"
echo "Token: ${TOKEN:0:30}..."
echo ""

# Получаем информацию о пользователе
echo "2️⃣ Получение информации о пользователе..."
ME=$(curl -s http://localhost:8080/api/users/me \
    -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo "$ME" | jq -r '.id')
USERNAME=$(echo "$ME" | jq -r '.username')

echo "✅ User ID: $USER_ID"
echo "✅ Username: $USERNAME"
echo ""

# Создаем тестовое уведомление если нет
echo "3️⃣ Проверка уведомлений..."
NOTIF_COUNT=$(psql -d x18_backend -t -c "SELECT COUNT(*) FROM notifications WHERE user_id = '$USER_ID';" | tr -d ' ')

if [ "$NOTIF_COUNT" -eq "0" ]; then
    echo "⚠️ Уведомлений нет, создаю тестовое..."
    
    OTHER_USER=$(psql -d x18_backend -t -c "SELECT id FROM users WHERE id != '$USER_ID' LIMIT 1;" | tr -d ' ')
    
    if [ -z "$OTHER_USER" ]; then
        echo "❌ Нет других пользователей для создания уведомления"
        exit 1
    fi
    
    psql -d x18_backend -c "
    INSERT INTO notifications (id, user_id, from_user_id, type, read, created_at)
    VALUES (gen_random_uuid(), '$USER_ID', '$OTHER_USER', 'like', false, NOW());" > /dev/null
    
    echo "✅ Тестовое уведомление создано"
fi

echo ""

# Получаем уведомления через API
echo "4️⃣ Запрос к API /api/notifications..."
NOTIFICATIONS=$(curl -s "http://localhost:8080/api/notifications?limit=3" \
    -H "Authorization: Bearer $TOKEN")

echo "Общая информация:"
echo "$NOTIFICATIONS" | jq '{
    total: .total,
    unread_count: .unread_count,
    count: (.notifications | length)
}'

echo ""
echo "5️⃣ Структура первого уведомления:"
FIRST_NOTIF=$(echo "$NOTIFICATIONS" | jq '.notifications[0]')

if [ "$FIRST_NOTIF" = "null" ]; then
    echo "❌ Уведомления не получены из API!"
    exit 1
fi

echo "$FIRST_NOTIF" | jq

echo ""
echo "6️⃣ Проверка поля actor:"
ACTOR=$(echo "$FIRST_NOTIF" | jq '.actor')
ACTOR_ID=$(echo "$FIRST_NOTIF" | jq -r '.actor_id')

if [ "$ACTOR" = "null" ]; then
    echo "❌ ПРОБЛЕМА: actor = null"
    echo ""
    echo "Проверим данные в БД для этого уведомления:"
    NOTIF_ID=$(echo "$FIRST_NOTIF" | jq -r '.id')
    
    psql -d x18_backend -c "
    SELECT 
        n.id as notification_id,
        n.from_user_id,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_url
    FROM notifications n
    LEFT JOIN users u ON n.from_user_id = u.id
    WHERE n.id = '$NOTIF_ID';"
    
    echo ""
    echo "💡 Данные в БД есть, но API возвращает null."
    echo "Проблема: GORM Preload или сериализация JSON"
    echo ""
    echo "🔧 РЕШЕНИЕ: Нужно перезапустить backend с новым кодом!"
    echo "Выполните: ./STOP_CUSTOM_BACKEND_STACK.sh && ./START_CUSTOM_BACKEND_STACK.sh"
else
    echo "✅ Actor данные получены!"
    echo "$ACTOR" | jq '{
        id,
        username,
        display_name,
        avatar_url
    }'
    echo ""
    echo "🎉 Уведомления работают правильно!"
fi

echo ""
echo "=================================================="
echo "Диагностика завершена"
