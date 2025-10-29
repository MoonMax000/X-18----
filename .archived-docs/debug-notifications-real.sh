#!/bin/bash

echo "🔍 Отладка уведомлений - проверка реального API ответа"
echo "======================================================="
echo ""

# Создаем нового тестового пользователя
TEST_USER="debug_$(date +%s)"
echo "1️⃣ Создаем тестового пользователя: $TEST_USER"

REGISTER=$(curl -s http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USER\",
        \"email\": \"${TEST_USER}@test.com\",
        \"password\": \"Test123!@#456\"
    }")

TOKEN=$(echo "$REGISTER" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ]; then
    echo "❌ Не удалось зарегистрировать пользователя"
    echo "$REGISTER" | jq
    exit 1
fi

USER_ID=$(echo "$REGISTER" | jq -r '.user.id')
echo "✅ Пользователь создан: $USER_ID"
echo ""

# Создаем другого пользователя который будет "actor"
ACTOR_USER="actor_$(date +%s)"
echo "2️⃣ Создаем пользователя-актера: $ACTOR_USER"

ACTOR_REG=$(curl -s http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$ACTOR_USER\",
        \"email\": \"${ACTOR_USER}@test.com\",
        \"password\": \"Test123!@#456\"
    }")

ACTOR_ID=$(echo "$ACTOR_REG" | jq -r '.user.id')
echo "✅ Актер создан: $ACTOR_ID"
echo ""

# Обновляем профиль актера
echo "3️⃣ Обновляем профиль актера..."
curl -s http://localhost:8080/api/users/me \
    -X PATCH \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $(echo "$ACTOR_REG" | jq -r '.access_token')" \
    -d "{
        \"display_name\": \"Test Actor\",
        \"bio\": \"This is a test actor\"
    }" > /dev/null

echo "✅ Профиль обновлен"
echo ""

# Создаем уведомление напрямую в БД
echo "4️⃣ Создаем тестовое уведомление в БД..."
psql -d x18_backend -c "
INSERT INTO notifications (id, user_id, from_user_id, type, read, created_at)
VALUES (gen_random_uuid(), '$USER_ID', '$ACTOR_ID', 'like', false, NOW())
RETURNING id;" > /dev/null

echo "✅ Уведомление создано"
echo ""

# Проверяем в БД
echo "5️⃣ Проверка в БД:"
psql -d x18_backend -c "
SELECT 
    n.id as notif_id,
    n.from_user_id,
    u.username as actor_username,
    u.display_name as actor_display_name
FROM notifications n
LEFT JOIN users u ON n.from_user_id = u.id
WHERE n.user_id = '$USER_ID'
LIMIT 1;"

echo ""

# Запрашиваем через API
echo "6️⃣ Запрос к API /api/notifications:"
API_RESPONSE=$(curl -s "http://localhost:8080/api/notifications?limit=1" \
    -H "Authorization: Bearer $TOKEN")

echo "$API_RESPONSE" | jq

echo ""
echo "7️⃣ Структура первого уведомления:"
FIRST=$(echo "$API_RESPONSE" | jq '.notifications[0]')
echo "$FIRST" | jq

echo ""
echo "8️⃣ Проверка поля actor:"
ACTOR=$(echo "$FIRST" | jq '.actor')

if [ "$ACTOR" = "null" ]; then
    echo "❌ ПРОБЛЕМА: actor = null!"
    echo ""
    echo "📊 Проверим скомпилированный бинарник:"
    echo "Binary modified:"
    stat -f "%Sm" custom-backend/bin/server 2>/dev/null || stat -c "%y" custom-backend/bin/server 2>/dev/null
    echo ""
    echo "Source modified:"
    stat -f "%Sm" custom-backend/internal/models/relations.go 2>/dev/null || stat -c "%y" custom-backend/internal/models/relations.go 2>/dev/null
else
    echo "✅ Actor НЕ null:"
    echo "$ACTOR" | jq
fi

echo ""
echo "======================================================"
echo "Диагностика завершена"
