#!/bin/bash

# Скрипт для автоматической настройки production окружения
# Включает: добавление BASE_URL, применение миграции, настройку админа, деплой

set -e  # Остановка при ошибке

echo "🚀 Автоматическая настройка production окружения..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI не установлен${NC}"
    echo "Установите: brew install railway"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI установлен${NC}"

# Проверка авторизации Railway
echo ""
echo -e "${BLUE}📡 Проверка авторизации Railway...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Требуется авторизация в Railway${NC}"
    railway login
fi

echo -e "${GREEN}✓ Авторизован в Railway${NC}"

# Проверка подключения к проекту
echo ""
echo -e "${BLUE}🔗 Проверка подключения к проекту...${NC}"
if ! railway status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Требуется подключение к проекту${NC}"
    railway link
fi

echo -e "${GREEN}✓ Подключен к проекту Railway${NC}"

# Шаг 1: Добавить BASE_URL
echo ""
echo -e "${BLUE}📝 Шаг 1: Добавление BASE_URL в Railway...${NC}"
echo ""
echo "Введите URL вашего Railway бэкенда (например: https://x-18-production-38ec.up.railway.app)"
read -p "BASE_URL: " BASE_URL

if [ -z "$BASE_URL" ]; then
    echo -e "${RED}❌ BASE_URL не может быть пустым${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Добавляем BASE_URL=${BASE_URL}...${NC}"
railway variables set BASE_URL="$BASE_URL"
echo -e "${GREEN}✓ BASE_URL добавлен${NC}"

# Шаг 2: Применить миграцию 007
echo ""
echo -e "${BLUE}📝 Шаг 2: Применение миграции 007...${NC}"
echo ""

# Получаем DATABASE_URL
DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Не удалось получить DATABASE_URL${NC}"
    echo "Попробуйте вручную: railway run psql \$DATABASE_URL"
    exit 1
fi

echo -e "${YELLOW}Применяем миграцию...${NC}"
railway run psql "$DATABASE_URL" -f custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql

echo -e "${GREEN}✓ Миграция 007 применена${NC}"

# Шаг 3: Настроить админа
echo ""
echo -e "${BLUE}📝 Шаг 3: Настройка админа...${NC}"
echo ""
echo "Введите email пользователя, которому нужно дать права админа:"
read -p "Email: " ADMIN_EMAIL

if [ -z "$ADMIN_EMAIL" ]; then
    echo -e "${RED}❌ Email не может быть пустым${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Настраиваем админа для $ADMIN_EMAIL...${NC}"

# Проверяем существует ли пользователь
USER_EXISTS=$(railway run psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE email = '$ADMIN_EMAIL';" | tr -d ' ')

if [ "$USER_EXISTS" = "0" ]; then
    echo -e "${RED}❌ Пользователь с email $ADMIN_EMAIL не найден${NC}"
    echo "Сначала зарегистрируйтесь на сайте с этим email"
    exit 1
fi

# Обновляем роль
railway run psql "$DATABASE_URL" -c "UPDATE users SET role = 'admin' WHERE email = '$ADMIN_EMAIL';"

# Проверяем результат
ADMIN_ROLE=$(railway run psql "$DATABASE_URL" -t -c "SELECT role FROM users WHERE email = '$ADMIN_EMAIL';" | tr -d ' ')

if [ "$ADMIN_ROLE" = "admin" ]; then
    echo -e "${GREEN}✓ Пользователь $ADMIN_EMAIL теперь админ${NC}"
else
    echo -e "${RED}❌ Не удалось назначить роль админа${NC}"
    exit 1
fi

# Шаг 4: Коммит и деплой
echo ""
echo -e "${BLUE}📝 Шаг 4: Деплой изменений...${NC}"
echo ""

# Проверяем есть ли изменения для коммита
if git diff --quiet custom-backend/internal/api/media.go; then
    echo -e "${YELLOW}⚠️  Нет изменений в media.go для коммита${NC}"
else
    echo -e "${YELLOW}Коммитим изменения...${NC}"
    git add custom-backend/internal/api/media.go
    git commit -m "fix: use BASE_URL env var for media URLs in production

- Added BASE_URL environment variable support in media.go
- Fixed media URLs to use absolute paths instead of relative
- Fallback to localhost for development environment"
    
    echo ""
    echo -e "${YELLOW}Пушим в GitHub...${NC}"
    git push origin nova-hub
    
    echo -e "${GREEN}✓ Изменения задеплоены${NC}"
fi

# Шаг 5: Редеплой на Railway (чтобы применить BASE_URL)
echo ""
echo -e "${BLUE}📝 Шаг 5: Редеплой бэкенда на Railway...${NC}"
echo ""
echo -e "${YELLOW}Запускаем редеплой...${NC}"
railway up --detach

echo -e "${GREEN}✓ Редеплой запущен${NC}"

# Финальный отчет
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Настройка завершена успешно!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Что было сделано:${NC}"
echo ""
echo -e "✓ Добавлена переменная BASE_URL=$BASE_URL"
echo -e "✓ Применена миграция 007 (таблицы news, user_blocks, post_reports, pinned_posts, поле role)"
echo -e "✓ Пользователь $ADMIN_EMAIL назначен админом"
echo -e "✓ Изменения закоммичены и запушены в GitHub"
echo -e "✓ Запущен редеплой на Railway"
echo ""
echo -e "${YELLOW}⏳ Подождите 2-3 минуты пока Railway задеплоит изменения${NC}"
echo ""
echo -e "${BLUE}📝 Следующие шаги:${NC}"
echo ""
echo "1. Подождите завершения деплоя на Railway"
echo "   Проверить: railway logs"
echo ""
echo "2. Перезайдите на сайте (выйдите и войдите снова)"
echo "   Это обновит JWT токен с ролью admin"
echo ""
echo "3. Откройте админ-панель:"
echo "   ${BASE_URL}/admin"
echo ""
echo "4. Проверьте что фото в постах теперь загружаются корректно"
echo ""
echo -e "${GREEN}🎉 Готово!${NC}"
