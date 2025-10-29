#!/bin/bash

# Мастер-скрипт для полной настройки функциональности admin
# Выполняет миграцию 007 и назначает роль admin

echo "🚀 Полная настройка функциональности админа"
echo "=============================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Шаг 1: Применение миграции 007
echo "📋 Шаг 1/2: Применение миграции 007..."
echo ""

if [ -f "./apply-migration-007.sh" ]; then
    chmod +x ./apply-migration-007.sh
    ./apply-migration-007.sh
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Ошибка при применении миграции${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Файл apply-migration-007.sh не найден${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo ""

# Шаг 2: Назначение роли admin
echo "📋 Шаг 2/2: Назначение роли администратора..."
echo ""

if [ -f "./setup-admin-role.sh" ]; then
    chmod +x ./setup-admin-role.sh
    ./setup-admin-role.sh
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Ошибка при назначении роли админа${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Файл setup-admin-role.sh не найден${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo ""
echo -e "${GREEN}✅ Настройка завершена успешно!${NC}"
echo ""
echo "📝 Что дальше:"
echo ""
echo "1. Перезайдите в приложение (выйдите и войдите снова)"
echo "   URL: https://social.tyriantrade.com"
echo ""
echo "2. Откройте чужой пост"
echo ""
echo "3. Нажмите на три точки (⋮) в правом верхнем углу поста"
echo ""
echo "4. Вы должны увидеть кнопку 'Удалить (admin)' красного цвета"
echo ""
echo "5. При нажатии пост будет удален (даже если это не ваш пост)"
echo ""
echo -e "${YELLOW}⚠️  Важно:${NC}"
echo "  - Используйте эту функцию ответственно"
echo "  - Backend проверяет роль при каждом запросе"
echo "  - Удаление необратимо"
echo ""
echo "📚 Документация: ADMIN_DELETE_FUNCTIONALITY_COMPLETE.md"
echo ""
