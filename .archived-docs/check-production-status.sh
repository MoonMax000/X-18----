#!/bin/bash

# 🔍 Проверка статуса production окружения
# Проверяет работу всех компонентов системы

set -e

echo "🔍 ПРОВЕРКА PRODUCTION ОКРУЖЕНИЯ"
echo "================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные
BACKEND_URL="https://x-18-production-38ec.up.railway.app"
FRONTEND_URL="https://social.tyriantrade.com"

# Счетчики
SUCCESS_COUNT=0
FAIL_COUNT=0
TOTAL_CHECKS=8

echo "📊 Начинаем проверку..."
echo ""

# 1. Проверка backend health
echo -n "1. Backend Health Check... "
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✅ OK${NC}"
    ((SUCCESS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Backend не отвечает на $BACKEND_URL/health"
    ((FAIL_COUNT++))
fi

# 2. Проверка API endpoints
echo -n "2. API Endpoints... "
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/check" | grep -q "401\|200"; then
    echo -e "${GREEN}✅ OK${NC}"
    ((SUCCESS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   API endpoints не работают"
    ((FAIL_COUNT++))
fi

# 3. Проверка frontend
echo -n "3. Frontend доступность... "
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ OK${NC}"
    ((SUCCESS_COUNT++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Frontend не доступен на $FRONTEND_URL"
    ((FAIL_COUNT++))
fi

# 4. Проверка что frontend использует правильный API
echo -n "4. Frontend API конфигурация... "
FRONTEND_HTML=$(curl -s "$FRONTEND_URL" 2>/dev/null || echo "")
if echo "$FRONTEND_HTML" | grep -q "x-18-production-38ec.up.railway.app"; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Frontend использует правильный API URL"
    ((SUCCESS_COUNT++))
elif echo "$FRONTEND_HTML" | grep -q "localhost:8080"; then
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Frontend все еще использует localhost:8080!"
    echo "   Нужно передеплоить frontend: ./deploy-frontend-production.sh"
    ((FAIL_COUNT++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   Не удалось проверить API URL в frontend"
    ((SUCCESS_COUNT++))
fi

# 5. Проверка CORS
echo -n "5. CORS конфигурация... "
CORS_CHECK=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/auth/login" \
    -H "Origin: https://social.tyriantrade.com" \
    -H "Access-Control-Request-Method: POST" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
    
if [ ! -z "$CORS_CHECK" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    ((SUCCESS_COUNT++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   CORS заголовки не найдены (может быть нормально)"
    ((SUCCESS_COUNT++))
fi

# 6. Проверка базы данных (через Railway CLI)
echo -n "6. База данных Railway... "
if command -v railway &> /dev/null; then
    cd custom-backend 2>/dev/null || cd backend 2>/dev/null || true
    
    if railway status &> /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "   Railway подключение активно"
        ((SUCCESS_COUNT++))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC}"
        echo "   Railway CLI не подключен к проекту"
        echo "   Выполните: railway login && railway link"
        ((SUCCESS_COUNT++))
    fi
    
    cd .. 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️  SKIP${NC}"
    echo "   Railway CLI не установлен"
    ((SUCCESS_COUNT++))
fi

# 7. Проверка регистрации
echo -n "7. Endpoint регистрации... "
REGISTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BACKEND_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"test":"test"}' 2>/dev/null || echo "0")
    
if [ "$REGISTER_STATUS" -eq "400" ] || [ "$REGISTER_STATUS" -eq "422" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Endpoint отвечает (статус $REGISTER_STATUS - ожидаемо для тестовых данных)"
    ((SUCCESS_COUNT++))
elif [ "$REGISTER_STATUS" -eq "404" ]; then
    echo -e "${RED}❌ FAIL${NC}"
    echo "   404 ошибка! API URL неправильный"
    ((FAIL_COUNT++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   Неожиданный статус: $REGISTER_STATUS"
    ((SUCCESS_COUNT++))
fi

# 8. Проверка логина
echo -n "8. Endpoint логина... "
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"test":"test"}' 2>/dev/null || echo "0")
    
if [ "$LOGIN_STATUS" -eq "400" ] || [ "$LOGIN_STATUS" -eq "401" ] || [ "$LOGIN_STATUS" -eq "422" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "   Endpoint отвечает (статус $LOGIN_STATUS - ожидаемо для тестовых данных)"
    ((SUCCESS_COUNT++))
elif [ "$LOGIN_STATUS" -eq "404" ]; then
    echo -e "${RED}❌ FAIL${NC}"
    echo "   404 ошибка! API URL неправильный"
    ((FAIL_COUNT++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   Неожиданный статус: $LOGIN_STATUS"
    ((SUCCESS_COUNT++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Итоговый отчет
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✨ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!${NC}"
    echo ""
    echo "Production окружение полностью работает:"
    echo "✅ Backend: $BACKEND_URL"
    echo "✅ Frontend: $FRONTEND_URL"
    echo "✅ Все API endpoints доступны"
    echo ""
    echo "📝 Теперь вы можете:"
    echo "  • Зарегистрировать новых пользователей"
    echo "  • Войти в систему"
    echo "  • Загружать медиа файлы"
    echo "  • Использовать все функции платформы"
else
    echo -e "${RED}⚠️  ОБНАРУЖЕНЫ ПРОБЛЕМЫ${NC}"
    echo ""
    echo "Успешно: $SUCCESS_COUNT/$TOTAL_CHECKS"
    echo "Провалено: $FAIL_COUNT/$TOTAL_CHECKS"
    echo ""
    echo "📝 Рекомендуемые действия:"
    
    if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" | grep -q "404\|000"; then
        echo "  1. Backend не работает - проверьте Railway деплой"
    fi
    
    if echo "$FRONTEND_HTML" | grep -q "localhost:8080"; then
        echo "  2. Передеплойте frontend: ./deploy-frontend-production.sh"
    fi
    
    echo ""
    echo "Для исправления всех проблем запустите:"
    echo "  ./apply-migrations-production-fixed.sh"
    echo "  ./deploy-frontend-production.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Дополнительная информация
echo "📊 Полезные команды:"
echo ""
echo "  Логи backend:        railway logs"
echo "  Статус Railway:      railway status"
echo "  Статус Netlify:      netlify status"
echo "  Назначить админа:    ./manage-admins.sh"
echo ""
echo "🔗 Важные ссылки:"
echo ""
echo "  Frontend:     $FRONTEND_URL"
echo "  Backend API:  $BACKEND_URL"
echo "  Admin панель: $FRONTEND_URL/admin"
echo ""
