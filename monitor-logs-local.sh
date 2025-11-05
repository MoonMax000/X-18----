#!/bin/bash

# Скрипт мониторинга логов локального сервера
# Использование: ./monitor-logs-local.sh [опции]
# Опции:
#   --oauth    - Показать только OAuth логи
#   --errors   - Показать только ошибки
#   --follow   - Непрерывный мониторинг (tail -f)
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

# Путь к логу (Docker или локальный процесс)
LOG_SOURCE=""

# Функция для поиска Docker контейнера
find_docker_container() {
    local container_id=$(docker ps --filter "name=custom-backend" --format "{{.ID}}" 2>/dev/null | head -n 1)
    if [ -n "$container_id" ]; then
        echo "$container_id"
        return 0
    fi
    
    container_id=$(docker ps --filter "ancestor=custom-backend" --format "{{.ID}}" 2>/dev/null | head -n 1)
    if [ -n "$container_id" ]; then
        echo "$container_id"
        return 0
    fi
    
    return 1
}

# Функция для фильтрации логов
filter_logs() {
    local pattern=$1
    
    if [ "$pattern" == "oauth" ]; then
        grep -iE "oauth|apple|google|callback|/auth/" --color=always
    elif [ "$pattern" == "errors" ]; then
        grep -iE "error|failed|panic|❌|500|401|403" --color=always
    else
        cat
    fi
}

# Функция для раскрашивания вывода
colorize_output() {
    awk '{
        line = $0;
        if (line ~ /ERROR|error|❌|Failed|failed/) {
            printf "\033[0;31m%s\033[0m\n", line;
        } else if (line ~ /WARN|warn|⚠️|Warning/) {
            printf "\033[1;33m%s\033[0m\n", line;
        } else if (line ~ /✅|SUCCESS|success|completed/) {
            printf "\033[0;32m%s\033[0m\n", line;
        } else if (line ~ /OAuth|oauth|Apple|Google/) {
            printf "\033[0;36m%s\033[0m\n", line;
        } else {
            print line;
        }
    }'
}

clear
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}        🔍 МОНИТОРИНГ ЛОКАЛЬНЫХ ЛОГОВ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Режим:      ${YELLOW}$MODE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Определение источника логов
if CONTAINER_ID=$(find_docker_container); then
    echo -e "${GREEN}✅ Docker контейнер найден: $CONTAINER_ID${NC}"
    LOG_SOURCE="docker"
else
    echo -e "${YELLOW}⚠️  Docker контейнер не найден, поиск локального процесса...${NC}"
    
    # Поиск процесса Go
    if pgrep -f "custom-backend" > /dev/null; then
        echo -e "${GREEN}✅ Локальный процесс custom-backend найден${NC}"
        LOG_SOURCE="process"
    else
        echo -e "${RED}❌ Ни Docker контейнер, ни локальный процесс не найдены${NC}"
        echo -e "${YELLOW}💡 Запустите сервер с помощью:${NC}"
        echo -e "   ${GREEN}./START_CUSTOM_BACKEND_STACK.sh${NC}  (Docker)"
        echo -e "   ${GREEN}cd custom-backend && go run cmd/server/main.go${NC}  (Локально)"
        exit 1
    fi
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Отображение логов в зависимости от источника и режима
if [ "$LOG_SOURCE" == "docker" ]; then
    case "$MODE" in
        --oauth)
            echo -e "${YELLOW}📱 OAUTH ЛОГИ (непрерывный режим)${NC}"
            echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}\n"
            docker logs -f "$CONTAINER_ID" 2>&1 | filter_logs "oauth" | colorize_output
            ;;
        --errors)
            echo -e "${RED}🚨 ОШИБКИ (непрерывный режим)${NC}"
            echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}\n"
            docker logs -f "$CONTAINER_ID" 2>&1 | filter_logs "errors" | colorize_output
            ;;
        --follow)
            echo -e "${BLUE}📊 ВСЕ ЛОГИ (непрерывный режим)${NC}"
            echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}\n"
            docker logs -f "$CONTAINER_ID" 2>&1 | colorize_output
            ;;
        --all|*)
            echo -e "${BLUE}📊 ПОСЛЕДНИЕ ЛОГИ${NC}"
            echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}\n"
            docker logs --tail 100 "$CONTAINER_ID" 2>&1 | colorize_output
            ;;
    esac
else
    # Для локального процесса выводим информацию о логировании
    echo -e "${YELLOW}💡 Для мониторинга локального процесса используйте:${NC}"
    echo -e "   ${GREEN}journalctl -u custom-backend -f${NC}  (если systemd)"
    echo -e "   или проверьте вывод в терминале, где запущен процесс"
fi

# Если не в режиме follow, показываем полезные команды
if [ "$MODE" != "--follow" ] && [ "$LOG_SOURCE" == "docker" ]; then
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}💡 ПОЛЕЗНЫЕ КОМАНДЫ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Обновить логи:           ${GREEN}./monitor-logs-local.sh${NC}"
    echo -e "Только OAuth:            ${GREEN}./monitor-logs-local.sh --oauth${NC}"
    echo -e "Только ошибки:           ${GREEN}./monitor-logs-local.sh --errors${NC}"
    echo -e "Непрерывный мониторинг:  ${GREEN}./monitor-logs-local.sh --follow${NC}"
    echo -e "Docker логи напрямую:    ${GREEN}docker logs -f $CONTAINER_ID${NC}"
    
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔑 ЛОКАЛЬНАЯ КОНФИГУРАЦИЯ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "API URL:         ${GREEN}http://localhost:8080${NC}"
    echo -e "Frontend URL:    ${GREEN}http://localhost:5173${NC}"
    echo -e "Google redirect: ${GREEN}http://localhost:8080/api/auth/google/callback${NC}"
    echo -e "Apple redirect:  ${GREEN}http://localhost:8080/api/auth/apple/callback${NC}"
    
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🧪 ТЕСТОВЫЕ ССЫЛКИ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Health check:         ${BLUE}http://localhost:8080/health${NC}"
    echo -e "API info:             ${BLUE}http://localhost:8080/api${NC}"
    echo -e "Авторизация Google:   ${BLUE}http://localhost:8080/api/auth/google${NC}"
    echo -e "Авторизация Apple:    ${BLUE}http://localhost:8080/api/auth/apple${NC}"
    echo -e "Frontend:             ${BLUE}http://localhost:5173${NC}"
    
    echo ""
fi
