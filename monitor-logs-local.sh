#!/bin/bash

# Скрипт мониторинга логов локального сервера
# Использование: ./monitor-logs-local.sh [опции]
# Опции:
#   --oauth    - Показать только OAuth логи
#   --errors   - Показать только ошибки
#   --all      - Показать все логи (по умолчанию)

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Режим фильтрации
MODE=${1:-all}

# Количество строк для отображения
LINES=${LINES:-50}

clear
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}        🔍 МОНИТОРИНГ ЛОКАЛЬНЫХ ЛОГОВ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Режим:      ${YELLOW}$MODE${NC}"
echo -e "Строк:      ${YELLOW}$LINES${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Проверка, запущен ли локальный сервер
if ! pgrep -f "go run.*cmd/server/main.go" > /dev/null && ! pgrep -f "./server" > /dev/null; then
    echo -e "${RED}❌ Локальный сервер не запущен${NC}"
    echo -e "${YELLOW}💡 Запустите сервер командой:${NC}"
    echo -e "   ${GREEN}cd custom-backend && go run cmd/server/main.go${NC}"
    echo -e "   ${GREEN}или${NC}"
    echo -e "   ${GREEN}./START_CUSTOM_BACKEND_STACK.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Локальный сервер работает${NC}\n"

# Функция для фильтрации и раскраски логов
filter_logs() {
    local filter=$1
    
    awk -v filter="$filter" '{
        line = $0;
        
        # Определяем, соответствует ли строка фильтру
        match_filter = 0;
        if (filter == "all") {
            match_filter = 1;
        } else if (filter == "oauth") {
            if (line ~ /OAuth|oauth|Apple|apple|Google|google|callback/) {
                match_filter = 1;
            }
        } else if (filter == "errors") {
            if (line ~ /ERROR|error|Failed|failed|panic|500|401|403/) {
                match_filter = 1;
            }
        }
        
        if (match_filter) {
            # Раскраска
            if (line ~ /ERROR|error|❌|Failed|failed/) {
                printf "\033[0;31m%s\033[0m\n", line;
            } else if (line ~ /WARN|warn|⚠️|Warning/) {
                printf "\033[1;33m%s\033[0m\n", line;
            } else if (line ~ /✅|SUCCESS|success|completed/) {
                printf "\033[0;32m%s\033[0m\n", line;
            } else if (line ~ /OAuth|oauth|Apple|Google|callback/) {
                printf "\033[0;36m%s\033[0m\n", line;
            } else {
                print line;
            }
        }
    }'
}

# Отображение логов
case "$MODE" in
    --oauth)
        echo -e "${YELLOW}📱 OAUTH ЛОГИ (последние $LINES строк)${NC}"
        echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}"
        if [ -f "custom-backend/server.log" ]; then
            tail -n "$LINES" custom-backend/server.log | filter_logs "oauth"
        else
            # Попытка получить логи из запущенного процесса
            pkill -USR1 -f "go run.*cmd/server/main.go" 2>/dev/null || true
            echo -e "${YELLOW}Логи отображаются в терминале, где запущен сервер${NC}"
        fi
        ;;
    --errors)
        echo -e "${YELLOW}🚨 ОШИБКИ (последние $LINES строк)${NC}"
        echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}"
        if [ -f "custom-backend/server.log" ]; then
            tail -n "$LINES" custom-backend/server.log | filter_logs "errors"
        else
            echo -e "${YELLOW}Логи отображаются в терминале, где запущен сервер${NC}"
        fi
        ;;
    --all|*)
        echo -e "${YELLOW}📋 ВСЕ ЛОГИ (последние $LINES строк)${NC}"
        echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}"
        if [ -f "custom-backend/server.log" ]; then
            tail -n "$LINES" custom-backend/server.log | filter_logs "all"
        else
            echo -e "${YELLOW}Логи отображаются в терминале, где запущен сервер${NC}"
            echo -e "${YELLOW}Для сохранения логов перенаправьте вывод в файл:${NC}"
            echo -e "   ${GREEN}cd custom-backend && go run cmd/server/main.go > server.log 2>&1${NC}"
        fi
        ;;
esac

# Статистика процесса
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 СТАТУС СЕРВЕРА${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Получаем PID процесса
PID=$(pgrep -f "go run.*cmd/server/main.go" || pgrep -f "./server")
if [ -n "$PID" ]; then
    echo -e "PID:                 ${CYAN}$PID${NC}"
    
    # Проверяем порт
    if command -v lsof &> /dev/null; then
        PORT=$(lsof -nP -iTCP -sTCP:LISTEN -p "$PID" 2>/dev/null | grep LISTEN | awk '{print $9}' | cut -d: -f2 | head -1)
        if [ -n "$PORT" ]; then
            echo -e "Порт:                ${CYAN}$PORT${NC}"
            echo -e "URL:                 ${GREEN}http://localhost:$PORT${NC}"
        fi
    fi
    
    # Использование памяти
    if [[ "$OSTYPE" == "darwin"* ]]; then
        MEM=$(ps -o rss= -p "$PID" | awk '{printf "%.1f MB", $1/1024}')
        CPU=$(ps -o %cpu= -p "$PID" | awk '{print $1"%"}')
    else
        MEM=$(ps -o rss= -p "$PID" | awk '{printf "%.1f MB", $1/1024}')
        CPU=$(ps -o %cpu= -p "$PID" | awk '{print $1"%"}')
    fi
    
    echo -e "Память:              ${CYAN}$MEM${NC}"
    echo -e "CPU:                 ${CYAN}$CPU${NC}"
fi

# Полезные команды
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 ПОЛЕЗНЫЕ КОМАНДЫ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Обновить логи:           ${GREEN}./monitor-logs-local.sh${NC}"
echo -e "Только OAuth:            ${GREEN}./monitor-logs-local.sh --oauth${NC}"
echo -e "Только ошибки:           ${GREEN}./monitor-logs-local.sh --errors${NC}"
echo -e "Больше строк:            ${GREEN}LINES=100 ./monitor-logs-local.sh${NC}"
echo -e "Непрерывный мониторинг:  ${GREEN}watch -n 5 ./monitor-logs-local.sh${NC}"
echo -e "Остановить сервер:       ${GREEN}./STOP_CUSTOM_BACKEND_STACK.sh${NC}"

# Проверка OAuth конфигурации
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔑 ЛОКАЛЬНАЯ OAUTH КОНФИГУРАЦИЯ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Определяем порт из .env.local
if [ -f ".env.local" ]; then
    BACKEND_PORT=$(grep BACKEND_PORT .env.local | cut -d= -f2 | tr -d ' "')
    FRONTEND_PORT=$(grep VITE_PORT .env.local | cut -d= -f2 | tr -d ' "')
else
    BACKEND_PORT="8080"
    FRONTEND_PORT="5173"
fi

echo -e "Backend:      ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "Frontend:     ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e ""
echo -e "Google OAuth: ${BLUE}http://localhost:${BACKEND_PORT}/api/auth/google${NC}"
echo -e "Apple OAuth:  ${BLUE}http://localhost:${BACKEND_PORT}/api/auth/apple${NC}"

# Предупреждение о callback URL
echo -e "\n${YELLOW}⚠️  ВАЖНО:${NC}"
echo -e "Для тестирования OAuth локально убедитесь, что в настройках:"
echo -e "- Google: добавлен redirect URI ${CYAN}http://localhost:${BACKEND_PORT}/api/auth/google/callback${NC}"
echo -e "- Apple: добавлен redirect URI ${CYAN}http://localhost:${BACKEND_PORT}/api/auth/apple/callback${NC}"

echo ""
