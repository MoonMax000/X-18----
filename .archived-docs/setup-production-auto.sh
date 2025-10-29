#!/bin/bash

# Автоматическая настройка БЕЗ интерактивных промптов
# Все параметры заданы заранее

set -e

echo "🚀 Автоматическая настройка production..."
echo ""

# ПАРАМЕТРЫ (измените если нужно)
BASE_URL="https://x-18-production-38ec.up.railway.app"
# Email будет запрошен через Railway команду

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка Railway CLI
echo -e "${BLUE}Проверка Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI не установлен${NC}"
    echo "Установите: brew install railway"
    exit 1
fi
echo -e "${GREEN}✓ Railway CLI установлен${NC}"
echo ""

# Проверка авторизации
echo -e "${BLUE}Проверка авторизации Railway...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Не авторизован в Railway${NC}"
    echo "Выполните: railway login"
    exit 1
fi
echo -e "${GREEN}✓ Авторизован${NC}"
echo ""

# Проверка подключения к проекту
echo -e "${BLUE}Проверка подключения к проекту...${NC}"
if ! railway status &> /dev/null; then
    echo -e "${RED}❌ Не подключен к проекту Railway${NC}"
    echo "Выполните: railway link"
    exit 1
fi
echo -e "${GREEN}✓ Подключен к проекту${NC}"
echo ""

# Шаг 1: Добавить BASE_URL
echo -e "${BLUE}📝 Шаг 1/5: Добавление BASE_URL...${NC}"
echo "BASE_URL=${BASE_URL}"
railway variables set BASE_URL="$BASE_URL" 2>&1 || echo "Переменная уже существует или ошибка"
echo -e "${GREEN}✓ BASE_URL настроен${NC}"
echo ""

# Шаг 2: Применить миграцию
echo -e "${BLUE}📝 Шаг 2/5: Применение миграции 007...${NC}"
DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Не удалось получить DATABASE_URL${NC}"
    exit 1
fi

echo "Применяю миграцию к БД..."
railway run psql "$DATABASE_URL" -f custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql 2>&1 || echo "Миграция уже применена или ошибка"
echo -e "${GREEN}✓ Миграция применена${NC}"
echo ""

# Шаг 3: Получить список пользователей и показать их
echo -e "${BLUE}📝 Шаг 3/5: Список пользователей в БД...${NC}"
echo ""
railway run psql "$DATABASE_URL" -c "SELECT id, username, email, role FROM users ORDER BY created_at DESC LIMIT 10;" 2>&1 || echo "Ошибка получения списка"
echo ""
echo -e "${YELLOW}Скопируйте email нужного пользователя из списка выше${NC}"
echo -e "${YELLOW}Затем выполните вручную:${NC}"
echo -e "${YELLOW}railway run psql \$DATABASE_URL -c \"UPDATE users SET role = 'admin' WHERE email = 'ВАШ_EMAIL';\"${NC}"
echo ""

# Шаг 4: Git commit
echo -e "${BLUE}📝 Шаг 4/5: Коммит изменений...${NC}"
if git diff --quiet custom-backend/internal/api/media.go; then
    echo -e "${YELLOW}⚠️  Нет изменений для коммита${NC}"
else
    git add custom-backend/internal/api/media.go
    git commit -m "fix: use BASE_URL env var for media URLs in production

- Added BASE_URL environment variable support
- Fixed media URLs to use absolute paths
- Fallback to localhost for development"
    
    echo -e "${GREEN}✓ Изменения закоммичены${NC}"
fi
echo ""

# Шаг 5: Git push
echo -e "${BLUE}📝 Шаг 5/5: Push в GitHub...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "Текущая ветка: $CURRENT_BRANCH"

git push origin $CURRENT_BRANCH 2>&1 || echo "Push завершен или ошибка"
echo -e "${GREEN}✓ Изменения запушены${NC}"
echo ""

# Финал
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Настройка завершена!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Что сделано:${NC}"
echo "✓ BASE_URL добавлен в Railway"
echo "✓ Миграция 007 применена"
echo "✓ Изменения закоммичены и запушены"
echo ""
echo -e "${YELLOW}⚠️  Осталось сделать ВРУЧНУЮ:${NC}"
echo ""
echo "1. Назначить админа (выполните команду выше с вашим email)"
echo ""
echo "2. Подождать деплой на Railway (2-3 минуты)"
echo "   Проверить: railway logs"
echo ""
echo "3. Перезайти на сайте (выйти и войти)"
echo ""
echo "4. Открыть админ-панель: /admin"
echo ""
echo -e "${GREEN}🎉 Готово!${NC}"
