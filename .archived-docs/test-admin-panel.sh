#!/bin/bash

# Скрипт для проверки и настройки админ панели
# Создает админ пользователя и проверяет доступ к админ панели

echo "================================================="
echo "ПРОВЕРКА И НАСТРОЙКА АДМИН ПАНЕЛИ"
echo "================================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# API URL
API_URL="http://localhost:8080/api"

echo "🔍 1. Проверка подключения к базе данных"
echo "==========================================="

# Проверка PostgreSQL
psql postgres://postgres:postgres@localhost:5432/x18_db -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PostgreSQL доступна${NC}"
else
  echo -e "${RED}✗ PostgreSQL недоступна${NC}"
  echo "  Запустите: ./START_CUSTOM_BACKEND_STACK.sh"
  exit 1
fi

echo ""
echo "👤 2. Создание администратора"
echo "==========================================="

# Создаем администратора через SQL
echo "Создание пользователя admin@example.com..."

ADMIN_SQL="
-- Удаляем существующего администратора если есть
DELETE FROM users WHERE email = 'admin@example.com';

-- Создаем нового администратора
INSERT INTO users (
    id,
    username,
    email,
    password,
    display_name,
    role,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    -- Пароль: Admin123!
    '\$2a\$10\$K7L1OJ5/4Y2YF5uxL3MFJ.1JgJHPVkPRqUr6kHXqWmhGq0CnWEqDu',
    'Administrator',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    password = '\$2a\$10\$K7L1OJ5/4Y2YF5uxL3MFJ.1JgJHPVkPRqUr6kHXqWmhGq0CnWEqDu',
    display_name = 'Administrator';
"

psql postgres://postgres:postgres@localhost:5432/x18_db -c "$ADMIN_SQL" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Администратор создан${NC}"
  echo "  Email: admin@example.com"
  echo "  Пароль: Admin123!"
else
  echo -e "${RED}✗ Ошибка создания администратора${NC}"
fi

echo ""
echo "🔐 3. Проверка авторизации администратора"
echo "==========================================="

# Попытка входа как администратор
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
USER_ROLE=$(echo $LOGIN_RESPONSE | jq -r '.user.role')

if [ "$ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Авторизация успешна${NC}"
  echo "  Роль пользователя: $USER_ROLE"
  
  if [ "$USER_ROLE" == "admin" ]; then
    echo -e "${GREEN}✓ Роль администратора подтверждена${NC}"
  else
    echo -e "${YELLOW}⚠ Роль не 'admin', а '$USER_ROLE'${NC}"
  fi
else
  echo -e "${RED}✗ Ошибка авторизации${NC}"
  echo "$LOGIN_RESPONSE"
fi

echo ""
echo "📊 4. Проверка админ API endpoints"
echo "==========================================="

if [ "$ACCESS_TOKEN" != "null" ]; then
  # Проверка доступа к админ эндпоинтам
  echo "Проверка /api/admin/stats..."
  STATS_RESPONSE=$(curl -s -X GET $API_URL/admin/stats \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$STATS_RESPONSE" | jq -e '.total_users' > /dev/null 2>&1; then
    TOTAL_USERS=$(echo $STATS_RESPONSE | jq -r '.total_users')
    TOTAL_POSTS=$(echo $STATS_RESPONSE | jq -r '.total_posts')
    echo -e "${GREEN}✓ Админ API доступен${NC}"
    echo "  Всего пользователей: $TOTAL_USERS"
    echo "  Всего постов: $TOTAL_POSTS"
  else
    echo -e "${RED}✗ Админ API недоступен${NC}"
    echo "$STATS_RESPONSE"
  fi
  
  echo ""
  echo "Проверка /api/admin/users..."
  USERS_RESPONSE=$(curl -s -X GET $API_URL/admin/users?limit=5 \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$USERS_RESPONSE" | jq -e '.users' > /dev/null 2>&1; then
    USERS_COUNT=$(echo $USERS_RESPONSE | jq '.users | length')
    echo -e "${GREEN}✓ Список пользователей доступен${NC}"
    echo "  Получено пользователей: $USERS_COUNT"
  else
    echo -e "${RED}✗ Список пользователей недоступен${NC}"
  fi
fi

echo ""
echo "🌐 5. Проверка Frontend админ панели"
echo "==========================================="

echo -e "${BLUE}Инструкции для проверки:${NC}"
echo ""
echo "1. Убедитесь, что backend запущен:"
echo "   ./START_CUSTOM_BACKEND_STACK.sh"
echo ""
echo "2. Убедитесь, что frontend запущен:"
echo "   cd client && npm run dev"
echo ""
echo "3. Откройте браузер и перейдите на:"
echo "   http://localhost:5173"
echo ""
echo "4. Войдите с учетными данными администратора:"
echo "   Email: admin@example.com"
echo "   Пароль: Admin123!"
echo ""
echo "5. После входа перейдите на админ панель:"
echo "   http://localhost:5173/admin"
echo ""
echo "6. Проверьте доступные разделы:"
echo "   - Панель управления (/admin/dashboard)"
echo "   - Новости (/admin/news)"
echo "   - Пользователи (/admin/users)"
echo "   - Жалобы (/admin/reports)"

echo ""
echo "================================================="
echo "ДИАГНОСТИКА ПРОБЛЕМ"
echo "================================================="

if [ "$USER_ROLE" != "admin" ]; then
  echo ""
  echo -e "${YELLOW}⚠ Проблема с ролью пользователя${NC}"
  echo ""
  echo "Решение:"
  echo "1. Проверьте миграцию базы данных:"
  echo "   psql postgres://postgres:postgres@localhost:5432/x18_db -c \"SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role';\""
  echo ""
  echo "2. Если колонки 'role' нет, выполните миграцию:"
  echo "   psql postgres://postgres:postgres@localhost:5432/x18_db -c \"ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';\""
fi

if [ "$ACCESS_TOKEN" == "null" ]; then
  echo ""
  echo -e "${YELLOW}⚠ Проблема с авторизацией${NC}"
  echo ""
  echo "Решение:"
  echo "1. Проверьте, что backend запущен"
  echo "2. Проверьте логи backend для ошибок"
  echo "3. Убедитесь, что пользователь создан в БД"
fi

echo ""
echo "================================================="
echo "РЕЗУЛЬТАТЫ ПРОВЕРКИ"
echo "================================================="

echo ""
if [ "$USER_ROLE" == "admin" ] && [ "$ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✅ Админ панель готова к использованию!${NC}"
  echo ""
  echo "Данные для входа:"
  echo "  Email: admin@example.com"
  echo "  Пароль: Admin123!"
  echo ""
  echo "URL админ панели: http://localhost:5173/admin"
else
  echo -e "${YELLOW}⚠ Требуется дополнительная настройка${NC}"
  echo ""
  echo "Проверьте секцию 'ДИАГНОСТИКА ПРОБЛЕМ' выше"
fi

echo ""
echo "📝 Дополнительные администраторы"
echo "=================================="
echo ""
echo "Чтобы сделать существующего пользователя администратором:"
echo "psql postgres://postgres:postgres@localhost:5432/x18_db -c \"UPDATE users SET role='admin' WHERE email='user@example.com';\""
