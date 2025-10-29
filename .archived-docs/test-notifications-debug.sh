#!/bin/bash

echo "🔍 Полная диагностика уведомлений"
echo "=================================="
echo ""

# Проверяем, что backend запущен
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "❌ Backend не запущен на порту 8080"
    exit 1
fi

echo "✅ Backend запущен"
echo ""

# Получаем токен
TOKEN=$(grep VITE_AUTH_TOKEN .env.local | cut -d'"' -f2)

if [ -z "$TOKEN" ]; then
    echo "❌ Токен не найден в .env.local"
    exit 1
fi

echo "✅ Токен найден: ${TOKEN:0:20}..."
echo ""

# Получаем текущего пользователя
echo "1️⃣ Проверка текущего пользователя:"
CURRENT_USER=$(curl -s http://localhost:8080/api/users/me \
    -H "Authorization: Bearer $TOKEN" | jq -r '.id // "null"')

if [ "$CURRENT_USER" = "null" ]; then
    echo "❌ Не удалось получить текущего пользователя. Токен невалидный!"
    echo "Ответ API:"
    curl -s http://localhost:8080/api/users/me -H "Authorization: Bearer $TOKEN" | jq
    exit 1
fi

echo "✅ User ID: $CURRENT_USER"
echo ""

# Проверяем уведомления в БД
echo "2️⃣ Уведомления в базе данных:"
psql -d x18_backend -t -c "
SELECT 
    n.id,
    n.type,
    n.from_user_id,
    n.read,
    n.created_at,
    u.username as from_user_username,
    u.display_name as from_user_display_name
FROM notifications n
LEFT JOIN users u ON n.from_user_id = u.id
WHERE n.user_id = '$CURRENT_USER'
ORDER BY n.created_at DESC
LIMIT 3;" 2>/dev/null || echo "⚠️ Не удалось подключиться к БД"

echo ""

# Запрос к API уведомлений
echo "3️⃣ Ответ API /api/notifications:"
NOTIF_RESPONSE=$(curl -s "http://localhost:8080/api/notifications?limit=3" \
    -H "Authorization: Bearer $TOKEN")

echo "$NOTIF_RESPONSE" | jq

echo ""

# Проверяем структуру первого уведомления
echo "4️⃣ Детали первого уведомления:"
echo "$NOTIF_RESPONSE" | jq '.notifications[0] | {
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

# Проверка compiled binary
echo "5️⃣ Проверка бинарника backend:"
BACKEND_MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" custom-backend/cmd/server/main.go 2>/dev/null || stat -c "%y" custom-backend/cmd/server/main.go 2>/dev/null | cut -d'.' -f1)
BINARY_DATE=$(ps aux | grep "custom-backend" | grep -v grep | awk '{print $9, $10}' | head -1)

echo "Последнее изменение main.go: $BACKEND_MODIFIED"
echo "Backend процесс запущен: $BINARY_DATE"
echo ""

# Пересобираем backend для гарантии
echo "6️⃣ Пересборка backend с новыми изменениями:"
cd custom-backend
echo "Компилируем..."
go build -o bin/server cmd/server/main.go
cd ..

if [ $? -eq 0 ]; then
    echo "✅ Backend успешно скомпилирован"
    echo ""
    echo "⚠️ ВАЖНО: Нужно перезапустить backend, чтобы изменения вступили в силу!"
    echo "Выполните: ./STOP_CUSTOM_BACKEND_STACK.sh && ./START_CUSTOM_BACKEND_STACK.sh"
else
    echo "❌ Ошибка компиляции backend"
fi

echo ""
echo "=================================="
echo "Диагностика завершена"
