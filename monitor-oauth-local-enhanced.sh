#!/bin/bash

# ===================================================================
# ЛОКАЛЬНАЯ РАЗРАБОТКА: Мониторинг OAuth логов в реальном времени
# Использование: ./monitor-oauth-local-enhanced.sh [--follow]
# ===================================================================

echo "🔍 OAuth Local Development Logs Monitor"
echo "========================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Параметры
FOLLOW_MODE=false
if [ "$1" == "--follow" ]; then
    FOLLOW_MODE=true
fi

# Проверка, запущен ли бэкенд
BACKEND_PORT=8080
if ! lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}❌ Бэкенд не запущен на порту ${BACKEND_PORT}${NC}"
    echo ""
    echo "Запустите бэкенд:"
    echo "  cd custom-backend"
    echo "  ./START_CUSTOM_BACKEND_STACK.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Бэкенд запущен на порту ${BACKEND_PORT}${NC}"

# Проверка переменных окружения
echo ""
echo -e "${YELLOW}🔧 Проверка конфигурации OAuth:${NC}"

cd custom-backend 2>/dev/null || {
    echo -e "${RED}❌ Директория custom-backend не найдена${NC}"
    exit 1
}

# Загрузка .env файла
if [ -f ".env" ]; then
    source .env
    
    echo -e "  ${CYAN}Google OAuth:${NC}"
    if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
        echo -e "    ${GREEN}✅${NC} CLIENT_ID настроен"
        echo -e "    ${GREEN}✅${NC} REDIRECT_URL: ${GOOGLE_REDIRECT_URL:-http://localhost:8080/api/auth/google/callback}"
    else
        echo -e "    ${RED}❌${NC} CLIENT_ID не настроен"
    fi
    
    echo -e "  ${MAGENTA}Apple OAuth:${NC}"
    if [ ! -z "$APPLE_CLIENT_ID" ]; then
        echo -e "    ${GREEN}✅${NC} CLIENT_ID: $APPLE_CLIENT_ID"
        echo -e "    ${GREEN}✅${NC} TEAM_ID: $APPLE_TEAM_ID"
        echo -e "    ${GREEN}✅${NC} KEY_ID: $APPLE_KEY_ID"
        echo -e "    ${GREEN}✅${NC} REDIRECT_URL: ${APPLE_REDIRECT_URL:-http://localhost:8080/api/auth/apple/callback}"
        
        # Проверка файла ключа
        if [ -f "$APPLE_PRIVATE_KEY_PATH" ]; then
            echo -e "    ${GREEN}✅${NC} Private Key найден: $APPLE_PRIVATE_KEY_PATH"
        else
            echo -e "    ${RED}❌${NC} Private Key НЕ найден: $APPLE_PRIVATE_KEY_PATH"
        fi
    else
        echo -e "    ${RED}❌${NC} CLIENT_ID не настроен"
    fi
else
    echo -e "${RED}❌ Файл .env не найден${NC}"
    exit 1
fi

cd ..

# Лог файл (если используется)
LOG_FILE="custom-backend/server.log"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$FOLLOW_MODE" = true ]; then
    echo -e "${GREEN}🔄 Режим непрерывного мониторинга (Ctrl+C для выхода)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}💡 Откройте браузер и попробуйте авторизацию:${NC}"
    echo "  Google: http://localhost:5173/ (нажмите 'Sign in with Google')"
    echo "  Apple:  http://localhost:5173/ (нажмите 'Sign in with Apple')"
    echo ""
    
    # Мониторинг логов из журнала системы (если бэкенд логирует в stdout)
    # Используем grep для фильтрации релевантных логов
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE" | grep --line-buffered -iE "(oauth|google|apple|callback|error|panic|success|login)" | while IFS= read -r line; do
            # Подсветка ключевых слов
            line=$(echo "$line" | sed -E "s/(ERROR|error|❌)/$(printf "${RED}")\1$(printf "${NC}")/g")
            line=$(echo "$line" | sed -E "s/(SUCCESS|success|✅)/$(printf "${GREEN}")\1$(printf "${NC}")/g")
            line=$(echo "$line" | sed -E "s/(WARNING|warning|⚠️)/$(printf "${YELLOW}")\1$(printf "${NC}")/g")
            line=$(echo "$line" | sed -E "s/(Apple|apple)/$(printf "${MAGENTA}")Apple$(printf "${NC}")/g")
            line=$(echo "$line" | sed -E "s/(Google|google)/$(printf "${BLUE}")Google$(printf "${NC}")/g")
            line=$(echo "$line" | sed -E "s/(OAuth|oauth)/$(printf "${CYAN}")OAuth$(printf "${NC}")/g")
            
            echo -e "$line"
        done
    else
        echo -e "${YELLOW}⚠️  Лог файл не найден: $LOG_FILE${NC}"
        echo -e "${YELLOW}   Логи выводятся в stdout. Запустите бэкенд с перенаправлением:${NC}"
        echo "   cd custom-backend && go run cmd/server/main.go 2>&1 | tee server.log"
        echo ""
        echo -e "${CYAN}   Альтернатива: Смотрите логи в терминале где запущен бэкенд${NC}"
    fi
else
    echo -e "${YELLOW}📊 Текущий статус OAuth${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Проверка последних логов (если файл существует)
    if [ -f "$LOG_FILE" ]; then
        echo -e "${MAGENTA}🔧 Последние логи конфигурации:${NC}"
        grep -iE "oauth.*configured|apple.*oauth|google.*oauth" "$LOG_FILE" | tail -5 | while IFS= read -r line; do
            echo "  $line"
        done
        
        echo ""
        echo -e "${BLUE}🌐 Последние OAuth запросы:${NC}"
        grep -iE "oauth.*callback.*started|oauth.*login" "$LOG_FILE" | tail -5 | while IFS= read -r line; do
            echo "  $line"
        done
        
        echo ""
        echo -e "${RED}❌ Последние ошибки:${NC}"
        ERRORS=$(grep -iE "error|panic|failed|invalid" "$LOG_FILE" | tail -10)
        if [ ! -z "$ERRORS" ]; then
            echo "$ERRORS" | while IFS= read -r line; do
                echo -e "  ${RED}$line${NC}"
            done
        else
            echo -e "  ${GREEN}✅ Ошибок нет${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Успешные авторизации:${NC}"
        SUCCESSES=$(grep -iE "oauth login successful|successful" "$LOG_FILE" | tail -5)
        if [ ! -z "$SUCCESSES" ]; then
            echo "$SUCCESSES" | while IFS= read -r line; do
                echo "  $line"
            done
        else
            echo -e "  ${YELLOW}Нет успешных авторизаций${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Лог файл не найден: $LOG_FILE${NC}"
        echo ""
        echo "Создайте лог файл при запуске бэкенда:"
        echo "  cd custom-backend"
        echo "  go run cmd/server/main.go 2>&1 | tee server.log"
    fi
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Тестирование endpoints
    echo ""
    echo -e "${YELLOW}🧪 Тестирование OAuth endpoints:${NC}"
    
    # Test Google OAuth
    echo -e "\n  ${BLUE}Google OAuth:${NC}"
    GOOGLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/google)
    if [ "$GOOGLE_RESPONSE" == "200" ]; then
        echo -e "    ${GREEN}✅ Endpoint доступен (HTTP $GOOGLE_RESPONSE)${NC}"
    else
        echo -e "    ${RED}❌ Endpoint недоступен (HTTP $GOOGLE_RESPONSE)${NC}"
    fi
    
    # Test Apple OAuth
    echo -e "  ${MAGENTA}Apple OAuth:${NC}"
    APPLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/apple)
    if [ "$APPLE_RESPONSE" == "200" ]; then
        echo -e "    ${GREEN}✅ Endpoint доступен (HTTP $APPLE_RESPONSE)${NC}"
    else
        echo -e "    ${RED}❌ Endpoint недоступен (HTTP $APPLE_RESPONSE)${NC}"
    fi
    
    # Подсказки
    echo ""
    echo -e "${YELLOW}💡 Подсказки:${NC}"
    echo "  • Запустите с --follow для непрерывного мониторинга"
    echo "  • Для подробных логов: tail -f custom-backend/server.log"
    echo "  • Проверьте .env файл: cat custom-backend/.env"
    echo ""
    echo -e "${YELLOW}🔗 OAuth URLs для тестирования:${NC}"
    echo "  Frontend: http://localhost:5173/"
    echo "  Google:   http://localhost:5173/ (нажмите 'Sign in with Google')"
    echo "  Apple:    http://localhost:5173/ (нажмите 'Sign in with Apple')"
    echo ""
    echo -e "${CYAN}📝 Логи бэкенда также доступны в терминале где запущен сервер${NC}"
fi
