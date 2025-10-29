#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔍 Полная Проверка Настройки Доменов${NC}\n"

# Домены для проверки
SOCIAL_DOMAIN="social.tyriantrade.com"
ADMIN_DOMAIN="admin.tyriantrade.com"
API_DOMAIN="api.tyriantrade.com"

# ==============================================
# 1. Проверка DNS записей
# ==============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Проверка DNS Записей${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

check_dns() {
    local domain=$1
    local expected=$2
    
    echo -e "${YELLOW}Проверка: $domain${NC}"
    
    # Получаем CNAME или A запись
    CNAME=$(dig +short CNAME $domain | head -n 1)
    A_RECORD=$(dig +short A $domain | head -n 1)
    
    if [ -n "$CNAME" ]; then
        echo "  DNS тип: CNAME"
        echo "  Указывает на: $CNAME"
        if [[ "$CNAME" == *"$expected"* ]]; then
            echo -e "  ${GREEN}✓ DNS правильно настроен${NC}"
            return 0
        else
            echo -e "  ${RED}✗ DNS НЕправильно настроен${NC}"
            echo -e "  ${RED}  Ожидается: $expected${NC}"
            return 1
        fi
    elif [ -n "$A_RECORD" ]; then
        echo "  DNS тип: A запись"
        echo "  IP адрес: $A_RECORD"
        echo -e "  ${YELLOW}⚠ Используется A запись вместо CNAME${NC}"
        echo -e "  ${YELLOW}  Рекомендуется изменить на CNAME: $expected${NC}"
        return 2
    else
        echo -e "  ${RED}✗ DNS запись не найдена${NC}"
        echo -e "  ${RED}  Добавьте CNAME: $domain → $expected${NC}"
        return 1
    fi
}

# Проверяем social
check_dns "$SOCIAL_DOMAIN" "netlify.app"
SOCIAL_DNS=$?

echo ""

# Проверяем admin
check_dns "$ADMIN_DOMAIN" "netlify.app"
ADMIN_DNS=$?

echo ""

# Проверяем API
check_dns "$API_DOMAIN" "railway.app"
API_DNS=$?

echo ""

# ==============================================
# 2. Проверка доступности сайтов
# ==============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Проверка Доступности Сайтов${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

check_http() {
    local domain=$1
    local url="https://$domain"
    
    echo -e "${YELLOW}Проверка: $url${NC}"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
    REDIRECT=$(curl -s -I -L --connect-timeout 10 "$url" 2>/dev/null | grep -i "location:" | tail -n 1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✓ Сайт доступен (HTTP $HTTP_CODE)${NC}"
        
        # Проверяем SSL
        SSL_INFO=$(echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | grep "Verify return code")
        if [[ "$SSL_INFO" == *"0 (ok)"* ]]; then
            echo -e "  ${GREEN}✓ SSL сертификат валиден${NC}"
        fi
        
        return 0
    elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo -e "  ${YELLOW}⚠ Редирект (HTTP $HTTP_CODE)${NC}"
        if [ -n "$REDIRECT" ]; then
            echo "  Редирект на: $REDIRECT"
        fi
        return 2
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "  ${RED}✗ Страница не найдена (HTTP 404)${NC}"
        echo -e "  ${YELLOW}  Возможно DNS еще не пропагировался${NC}"
        return 1
    elif [ -z "$HTTP_CODE" ]; then
        echo -e "  ${RED}✗ Сайт недоступен (нет ответа)${NC}"
        echo -e "  ${YELLOW}  DNS может быть не настроен или еще не пропагировался${NC}"
        return 1
    else
        echo -e "  ${RED}✗ Ошибка (HTTP $HTTP_CODE)${NC}"
        return 1
    fi
}

# Проверяем social
check_http "$SOCIAL_DOMAIN"
SOCIAL_HTTP=$?

echo ""

# Проверяем admin
check_http "$ADMIN_DOMAIN"
ADMIN_HTTP=$?

echo ""

# Проверяем API
echo -e "${YELLOW}Проверка: https://$API_DOMAIN/health${NC}"
API_RESPONSE=$(curl -s --connect-timeout 10 "https://$API_DOMAIN/health" 2>/dev/null)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$API_DOMAIN/health" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✓ API доступен (HTTP $HTTP_CODE)${NC}"
    if [[ "$API_RESPONSE" == *"ok"* ]]; then
        echo -e "  ${GREEN}✓ API работает корректно${NC}"
        echo "  Ответ: $API_RESPONSE"
    fi
    API_HTTP=0
elif [ -z "$HTTP_CODE" ]; then
    echo -e "  ${RED}✗ API недоступен (нет ответа)${NC}"
    API_HTTP=1
else
    echo -e "  ${RED}✗ API ошибка (HTTP $HTTP_CODE)${NC}"
    API_HTTP=1
fi

echo ""

# ==============================================
# 3. Проверка CORS между доменами
# ==============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. Проверка CORS Настройки${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Проверка CORS для social.tyriantrade.com${NC}"
CORS_HEADER=$(curl -s -H "Origin: https://$SOCIAL_DOMAIN" \
    -H "Access-Control-Request-Method: POST" \
    -X OPTIONS "https://$API_DOMAIN/api/auth/signup" \
    -I 2>/dev/null | grep -i "access-control-allow-origin")

if [[ "$CORS_HEADER" == *"$SOCIAL_DOMAIN"* ]] || [[ "$CORS_HEADER" == *"*"* ]]; then
    echo -e "  ${GREEN}✓ CORS настроен для social.tyriantrade.com${NC}"
    echo "  Header: $CORS_HEADER"
elif [ -z "$CORS_HEADER" ]; then
    echo -e "  ${YELLOW}⚠ CORS заголовок не найден${NC}"
    echo -e "  ${YELLOW}  Проверьте переменную CORS_ORIGIN в Railway${NC}"
else
    echo -e "  ${RED}✗ CORS не настроен${NC}"
fi

echo ""

echo -e "${YELLOW}Проверка CORS для admin.tyriantrade.com${NC}"
CORS_HEADER=$(curl -s -H "Origin: https://$ADMIN_DOMAIN" \
    -H "Access-Control-Request-Method: POST" \
    -X OPTIONS "https://$API_DOMAIN/api/auth/signup" \
    -I 2>/dev/null | grep -i "access-control-allow-origin")

if [[ "$CORS_HEADER" == *"$ADMIN_DOMAIN"* ]] || [[ "$CORS_HEADER" == *"*"* ]]; then
    echo -e "  ${GREEN}✓ CORS настроен для admin.tyriantrade.com${NC}"
    echo "  Header: $CORS_HEADER"
elif [ -z "$CORS_HEADER" ]; then
    echo -e "  ${YELLOW}⚠ CORS заголовок не найден${NC}"
    echo -e "  ${YELLOW}  Проверьте переменную CORS_ORIGIN в Railway${NC}"
else
    echo -e "  ${RED}✗ CORS не настроен${NC}"
fi

echo ""

# ==============================================
# 4. Проверка Netlify настройки
# ==============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Проверка Netlify${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Проверяем X-Nf-Request-Id (признак Netlify)
NETLIFY_HEADER=$(curl -s -I "https://$SOCIAL_DOMAIN" 2>/dev/null | grep -i "x-nf-request-id")
if [ -n "$NETLIFY_HEADER" ]; then
    echo -e "${GREEN}✓ Сайт обслуживается через Netlify${NC}"
else
    echo -e "${YELLOW}⚠ Не удалось подтвердить что сайт на Netlify${NC}"
fi

echo ""

# ==============================================
# 5. Проверка Railway настройки
# ==============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Проверка Railway${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Проверяем что API отвечает с Railway
RAILWAY_RESPONSE=$(curl -s "https://$API_DOMAIN/health" 2>/dev/null)
if [[ "$RAILWAY_RESPONSE" == *"ok"* ]]; then
    echo -e "${GREEN}✓ Backend обслуживается через Railway${NC}"
    echo "  Health check: OK"
else
    echo -e "${YELLOW}⚠ Не удалось получить ответ от Railway${NC}"
fi

echo ""

# ==============================================
# ИТОГОВЫЙ ОТЧЕТ
# ==============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 ИТОГОВЫЙ ОТЧЕТ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ISSUES_FOUND=0

echo "🌐 Домены:"
if [ $SOCIAL_DNS -eq 0 ] && [ $SOCIAL_HTTP -eq 0 ]; then
    echo -e "  ${GREEN}✓ social.tyriantrade.com - настроен правильно${NC}"
else
    echo -e "  ${RED}✗ social.tyriantrade.com - требует настройки${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ADMIN_DNS -eq 0 ] && [ $ADMIN_HTTP -eq 0 ]; then
    echo -e "  ${GREEN}✓ admin.tyriantrade.com - настроен правильно${NC}"
else
    echo -e "  ${RED}✗ admin.tyriantrade.com - требует настройки${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $API_DNS -eq 0 ] && [ $API_HTTP -eq 0 ]; then
    echo -e "  ${GREEN}✓ api.tyriantrade.com - настроен правильно${NC}"
else
    echo -e "  ${RED}✗ api.tyriantrade.com - требует настройки${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Что нужно сделать
if [ $ISSUES_FOUND -gt 0 ]; then
    echo -e "${YELLOW}📋 ЧТО НУЖНО НАСТРОИТЬ:${NC}\n"
    
    if [ $SOCIAL_DNS -ne 0 ] || [ $ADMIN_DNS -ne 0 ]; then
        echo -e "${YELLOW}1. В FirstVDS добавить DNS записи:${NC}"
        if [ $SOCIAL_DNS -ne 0 ]; then
            echo "   social  CNAME  tyrian-trade-frontend.netlify.app"
        fi
        if [ $ADMIN_DNS -ne 0 ]; then
            echo "   admin   CNAME  tyrian-trade-frontend.netlify.app"
        fi
        echo ""
    fi
    
    if [ $API_DNS -ne 0 ]; then
        echo -e "${YELLOW}2. В FirstVDS добавить DNS запись:${NC}"
        echo "   api     CNAME  tjpcog02.up.railway.app"
        echo ""
    fi
    
    echo -e "${YELLOW}3. Подождать 10-30 минут для DNS пропагации${NC}"
    echo ""
    
    if [ $SOCIAL_HTTP -eq 0 ] && [ $ADMIN_HTTP -eq 0 ] && [ $API_HTTP -ne 0 ]; then
        echo -e "${YELLOW}4. Проверить Railway:${NC}"
        echo "   - Убедиться что backend запущен"
        echo "   - Проверить переменную CORS_ORIGIN"
        echo ""
    fi
else
    echo -e "${GREEN}✅ ВСЕ НАСТРОЕНО ПРАВИЛЬНО!${NC}\n"
    echo "Домены работают:"
    echo "  • https://social.tyriantrade.com - Frontend (Netlify)"
    echo "  • https://admin.tyriantrade.com - Frontend (Netlify)"
    echo "  • https://api.tyriantrade.com - Backend (Railway)"
    echo ""
    echo "Связь между Netlify и Railway настроена через CORS"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
