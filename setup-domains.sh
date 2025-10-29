#!/bin/bash

# Скрипт настройки доменов для production окружения
# Домены: app.tyriantrade.com (frontend), api.tyriantrade.com (backend), admin.tyriantrade.com

echo "🌐 Настройка доменов для production..."
echo "================================================"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Переменные доменов
FRONTEND_DOMAIN="social.tyriantrade.com"
BACKEND_DOMAIN="api.tyriantrade.com"
ADMIN_DOMAIN="admin.tyriantrade.com"

# Railway переменные
RAILWAY_APP_NAME="x-18-production"
RAILWAY_SERVICE_NAME="custom-backend"

echo -e "${BLUE}📋 План настройки:${NC}"
echo "1. Social Network: $FRONTEND_DOMAIN (Netlify)"
echo "2. Backend API: $BACKEND_DOMAIN (Railway)"
echo "3. Admin Panel: $ADMIN_DOMAIN (Netlify)"
echo ""

# Функция для проверки DNS
check_dns() {
    local domain=$1
    echo -e "${YELLOW}Проверка DNS для $domain...${NC}"
    
    if host $domain > /dev/null 2>&1; then
        echo -e "${GREEN}✅ DNS записи найдены для $domain${NC}"
        host $domain | head -5
    else
        echo -e "${RED}❌ DNS записи не найдены для $domain${NC}"
        echo "   Необходимо настроить DNS в панели FirstVDS"
    fi
    echo ""
}

# Функция для обновления переменных окружения в Railway
update_railway_env() {
    echo -e "${BLUE}🚂 Обновление переменных окружения Railway...${NC}"
    
    # Проверяем установлен ли Railway CLI
    if ! command -v railway &> /dev/null; then
        echo -e "${YELLOW}⚠️  Railway CLI не установлен${NC}"
        echo "Установите Railway CLI: npm install -g @railway/cli"
        echo ""
        echo "После установки выполните:"
        echo "1. railway login"
        echo "2. railway link"
        echo "3. Запустите этот скрипт снова"
        return 1
    fi
    
    # Обновляем CORS_ORIGIN
    echo "Обновление CORS_ORIGIN..."
    railway variables set CORS_ORIGIN="https://$FRONTEND_DOMAIN,https://$ADMIN_DOMAIN" 2>/dev/null || {
        echo -e "${YELLOW}Не удалось обновить через CLI. Установите вручную в Railway Dashboard:${NC}"
        echo "CORS_ORIGIN=https://$FRONTEND_DOMAIN,https://$ADMIN_DOMAIN"
    }
    
    echo -e "${GREEN}✅ Переменные окружения обновлены${NC}"
    echo ""
}

# Функция для настройки Netlify
setup_netlify() {
    echo -e "${BLUE}🚀 Настройка Netlify...${NC}"
    
    # Проверяем установлен ли Netlify CLI
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}⚠️  Netlify CLI не установлен${NC}"
        echo "Установите Netlify CLI: npm install -g netlify-cli"
        echo ""
        echo "После установки выполните:"
        echo "1. netlify login"
        echo "2. netlify link"
        echo "3. Запустите этот скрипт снова"
        return 1
    fi
    
    echo "Добавление доменов в Netlify..."
    
    # Добавляем основной домен
    netlify domains:add $FRONTEND_DOMAIN 2>/dev/null || echo "Домен $FRONTEND_DOMAIN уже добавлен или требует ручной настройки"
    
    # Добавляем домен админки как алиас
    netlify domains:add $ADMIN_DOMAIN 2>/dev/null || echo "Домен $ADMIN_DOMAIN уже добавлен или требует ручной настройки"
    
    echo -e "${GREEN}✅ Домены добавлены в Netlify${NC}"
    echo ""
}

# Главное меню
main_menu() {
    echo -e "${BLUE}Выберите действие:${NC}"
    echo "1. Показать инструкции по настройке DNS в FirstVDS"
    echo "2. Проверить текущие DNS записи"
    echo "3. Обновить переменные окружения Railway"
    echo "4. Настроить домены в Netlify"
    echo "5. Показать инструкции по ручной настройке"
    echo "6. Проверить статус всех сервисов"
    echo "7. Выход"
    echo ""
    read -p "Выберите опцию (1-7): " choice
    
    case $choice in
        1)
            show_dns_instructions
            ;;
        2)
            check_all_dns
            ;;
        3)
            update_railway_env
            ;;
        4)
            setup_netlify
            ;;
        5)
            show_manual_instructions
            ;;
        6)
            check_all_services
            ;;
        7)
            exit 0
            ;;
        *)
            echo -e "${RED}Неверный выбор${NC}"
            ;;
    esac
}

# Показать инструкции по DNS
show_dns_instructions() {
    echo -e "${BLUE}📝 Инструкции по настройке DNS в FirstVDS:${NC}"
    echo "================================================"
    echo ""
    echo "1. Войдите в панель управления FirstVDS:"
    echo "   https://my.firstvds.ru"
    echo ""
    echo "2. Перейдите в раздел 'Домены' → Ваш домен (tyriantrade.com)"
    echo ""
    echo "3. Добавьте следующие DNS записи:"
    echo ""
    echo -e "${GREEN}Для Social (Netlify):${NC}"
    echo "   Тип: CNAME"
    echo "   Имя: social"
    echo "   Значение: [ваш-сайт].netlify.app"
    echo ""
    echo -e "${GREEN}Для Backend (Railway):${NC}"
    echo "   Тип: CNAME"
    echo "   Имя: api"
    echo "   Значение: $RAILWAY_APP_NAME.up.railway.app"
    echo ""
    echo -e "${GREEN}Для Admin Panel (Netlify):${NC}"
    echo "   Тип: CNAME"
    echo "   Имя: admin"
    echo "   Значение: [ваш-сайт].netlify.app"
    echo ""
    echo "4. Сохраните изменения и подождите 5-30 минут для распространения DNS"
    echo ""
}

# Проверить все DNS записи
check_all_dns() {
    echo -e "${BLUE}🔍 Проверка всех DNS записей...${NC}"
    echo "================================================"
    
    check_dns $FRONTEND_DOMAIN
    check_dns $BACKEND_DOMAIN
    check_dns $ADMIN_DOMAIN
}

# Показать инструкции по ручной настройке
show_manual_instructions() {
    echo -e "${BLUE}🛠️  Инструкции по ручной настройке:${NC}"
    echo "================================================"
    echo ""
    echo -e "${GREEN}Railway:${NC}"
    echo "1. Откройте https://railway.app/dashboard"
    echo "2. Выберите проект X-18"
    echo "3. Перейдите в Settings → Domains"
    echo "4. Добавьте домен: $BACKEND_DOMAIN"
    echo "5. В Variables добавьте:"
    echo "   CORS_ORIGIN=https://$FRONTEND_DOMAIN,https://$ADMIN_DOMAIN"
    echo ""
    echo -e "${GREEN}Netlify:${NC}"
    echo "1. Откройте https://app.netlify.com"
    echo "2. Выберите ваш сайт"
    echo "3. Перейдите в Domain settings"
    echo "4. Add custom domain → $FRONTEND_DOMAIN"
    echo "5. Add domain alias → $ADMIN_DOMAIN"
    echo ""
    echo -e "${GREEN}Проверка:${NC}"
    echo "После настройки DNS (через 5-30 минут) проверьте:"
    echo "- Frontend: https://$FRONTEND_DOMAIN"
    echo "- API Health: https://$BACKEND_DOMAIN/health"
    echo "- Admin Panel: https://$ADMIN_DOMAIN/admin"
    echo ""
}

# Проверить статус всех сервисов
check_all_services() {
    echo -e "${BLUE}🔍 Проверка статуса сервисов...${NC}"
    echo "================================================"
    echo ""
    
    # Проверяем Frontend
    echo -e "${YELLOW}Проверка Frontend ($FRONTEND_DOMAIN)...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" "https://$FRONTEND_DOMAIN" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Frontend доступен${NC}"
    else
        echo -e "${RED}❌ Frontend недоступен${NC}"
    fi
    echo ""
    
    # Проверяем Backend
    echo -e "${YELLOW}Проверка Backend API ($BACKEND_DOMAIN)...${NC}"
    if curl -s "https://$BACKEND_DOMAIN/health" | grep -q "ok"; then
        echo -e "${GREEN}✅ Backend API работает${NC}"
        curl -s "https://$BACKEND_DOMAIN/health" | jq '.' 2>/dev/null || curl -s "https://$BACKEND_DOMAIN/health"
    else
        echo -e "${RED}❌ Backend API недоступен${NC}"
    fi
    echo ""
    
    # Проверяем Admin Panel
    echo -e "${YELLOW}Проверка Admin Panel ($ADMIN_DOMAIN)...${NC}"
    if curl -s -o /dev/null -w "%{http_code}" "https://$ADMIN_DOMAIN" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Admin Panel доступен${NC}"
    else
        echo -e "${RED}❌ Admin Panel недоступен${NC}"
    fi
    echo ""
}

# Быстрая настройка
quick_setup() {
    echo -e "${BLUE}⚡ Быстрая настройка...${NC}"
    echo ""
    
    # Проверяем DNS
    check_all_dns
    
    # Обновляем Railway
    update_railway_env
    
    # Настраиваем Netlify
    setup_netlify
    
    echo ""
    echo -e "${GREEN}✅ Быстрая настройка завершена!${NC}"
    echo ""
    echo "Следующие шаги:"
    echo "1. Настройте DNS записи в FirstVDS (опция 1 в меню)"
    echo "2. Подождите 5-30 минут для распространения DNS"
    echo "3. Проверьте статус сервисов (опция 6 в меню)"
}

# Основная логика
echo ""
echo "Что вы хотите сделать?"
echo "1. Быстрая настройка (рекомендуется)"
echo "2. Пошаговая настройка (меню)"
echo ""
read -p "Выберите опцию (1-2): " setup_choice

case $setup_choice in
    1)
        quick_setup
        ;;
    2)
        while true; do
            main_menu
            echo ""
            read -p "Нажмите Enter для продолжения..."
            clear
        done
        ;;
    *)
        echo -e "${RED}Неверный выбор${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📌 Важные ссылки:${NC}"
echo "FirstVDS: https://my.firstvds.ru"
echo "Railway Dashboard: https://railway.app/dashboard"
echo "Netlify Dashboard: https://app.netlify.com"
echo ""
echo -e "${GREEN}После настройки DNS ваш сайт будет доступен по адресам:${NC}"
echo "Social Network: https://$FRONTEND_DOMAIN"
echo "API: https://$BACKEND_DOMAIN" 
echo "Admin: https://$ADMIN_DOMAIN"
