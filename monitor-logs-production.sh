#!/bin/bash

# Улучшенный скрипт мониторинга логов продакшен-сервера
# Использование: ./monitor-logs-production.sh [опции]
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

# Параметры AWS
REGION="us-east-1"
LOG_GROUP="/ecs/tyriantrade/backend"
CLUSTER="tyriantrade-cluster"
SERVICE="tyriantrade-backend-service"

# Время для фильтрации (последние N минут)
MINUTES_AGO=${MINUTES_AGO:-10}

# Режим фильтрации
MODE=${1:-all}

clear
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}        🔍 МОНИТОРИНГ ПРОДАКШЕН ЛОГОВ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Регион:     ${YELLOW}$REGION${NC}"
echo -e "Кластер:    ${YELLOW}$CLUSTER${NC}"
echo -e "Сервис:     ${YELLOW}$SERVICE${NC}"
echo -e "Период:     ${YELLOW}Последние $MINUTES_AGO минут${NC}"
echo -e "Режим:      ${YELLOW}$MODE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Проверка наличия AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI не установлен${NC}"
    exit 1
fi

# Получение информации о запущенных задачах
echo -e "\n${BLUE}📦 Получение информации о задачах...${NC}"
TASK_ARN=$(aws ecs list-tasks \
    --cluster "$CLUSTER" \
    --service-name "$SERVICE" \
    --region "$REGION" \
    --query 'taskArns[0]' \
    --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo -e "${RED}❌ Нет запущенных задач в сервисе${NC}"
    exit 1
fi

TASK_ID=$(basename "$TASK_ARN")
echo -e "${GREEN}✅ Задача найдена: ${TASK_ID}${NC}"

# Вычисление времени начала (для macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    START_TIME=$(date -u -v-${MINUTES_AGO}M +%s)000
else
    # Linux
    START_TIME=$(date -u -d "$MINUTES_AGO minutes ago" +%s)000
fi

# Функция для отображения логов
show_logs() {
    local filter_pattern=$1
    local title=$2
    local limit=${3:-100}
    
    echo -e "\n${YELLOW}$title${NC}"
    echo -e "${CYAN}$(printf '━%.0s' {1..60})${NC}"
    
    aws logs filter-log-events \
        --log-group-name "$LOG_GROUP" \
        --filter-pattern "$filter_pattern" \
        --start-time "$START_TIME" \
        --region "$REGION" \
        --query 'events[*].[timestamp,message]' \
        --output text | \
        awk '{
            timestamp = strftime("%H:%M:%S", $1/1000);
            $1="";
            message=$0;
            if (message ~ /ERROR|error|❌|Failed|failed/) {
                printf "\033[0;31m[%s]\033[0m %s\n", timestamp, message;
            } else if (message ~ /WARN|warn|⚠️|Warning/) {
                printf "\033[1;33m[%s]\033[0m %s\n", timestamp, message;
            } else if (message ~ /✅|SUCCESS|success|completed/) {
                printf "\033[0;32m[%s]\033[0m %s\n", timestamp, message;
            } else if (message ~ /OAuth|oauth|Apple|Google/) {
                printf "\033[0;36m[%s]\033[0m %s\n", timestamp, message;
            } else {
                printf "[%s] %s\n", timestamp, message;
            }
        }' | tail -n "$limit"
}

# Отображение логов в зависимости от режима
case "$MODE" in
    --oauth)
        show_logs "OAuth OR oauth OR Apple OR apple OR Google OR google OR callback" "📱 OAUTH ЛОГИ" 50
        ;;
    --errors)
        show_logs "ERROR OR error OR Failed OR failed OR panic OR 500 OR 401 OR 403" "🚨 ОШИБКИ" 30
        ;;
    --all|*)
        show_logs "OAuth OR oauth OR Apple OR apple OR Google OR google OR callback" "📱 OAUTH ЛОГИ" 30
        show_logs "ERROR OR error OR Failed OR failed OR panic OR 500" "🚨 ОШИБКИ" 20
        show_logs "SUCCESS OR success OR completed" "✨ УСПЕШНЫЕ ОПЕРАЦИИ" 20
        ;;
esac

# Статистика
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 СТАТИСТИКА (последние $MINUTES_AGO минут)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Подсчет событий
OAUTH_REQUESTS=$(aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --filter-pattern "OAuth OR oauth" \
    --start-time "$START_TIME" \
    --region "$REGION" \
    --query 'length(events)' \
    --output text)

ERROR_COUNT=$(aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --filter-pattern "ERROR OR error OR Failed OR failed" \
    --start-time "$START_TIME" \
    --region "$REGION" \
    --query 'length(events)' \
    --output text)

SUCCESS_COUNT=$(aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --filter-pattern "✅ OR SUCCESS OR success OR completed" \
    --start-time "$START_TIME" \
    --region "$REGION" \
    --query 'length(events)' \
    --output text)

echo -e "OAuth запросов:      ${CYAN}$OAUTH_REQUESTS${NC}"
echo -e "Ошибок:              ${RED}$ERROR_COUNT${NC}"
echo -e "Успешных операций:   ${GREEN}$SUCCESS_COUNT${NC}"

# Полезные команды
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 ПОЛЕЗНЫЕ КОМАНДЫ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Обновить логи:           ${GREEN}./monitor-logs-production.sh${NC}"
echo -e "Только OAuth:            ${GREEN}./monitor-logs-production.sh --oauth${NC}"
echo -e "Только ошибки:           ${GREEN}./monitor-logs-production.sh --errors${NC}"
echo -e "Последние 30 минут:      ${GREEN}MINUTES_AGO=30 ./monitor-logs-production.sh${NC}"
echo -e "Непрерывный мониторинг:  ${GREEN}watch -n 10 ./monitor-logs-production.sh${NC}"

# Проверка OAuth конфигурации
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔑 ПРОВЕРКА OAUTH КОНФИГУРАЦИИ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Google redirect:  ${GREEN}https://api.tyriantrade.com/api/auth/google/callback${NC}"
echo -e "Apple redirect:   ${GREEN}https://api.tyriantrade.com/api/auth/apple/callback${NC}"
echo -e "Frontend URL:     ${GREEN}https://social.tyriantrade.com${NC}"

# Тестовые ссылки
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🧪 ТЕСТОВЫЕ ССЫЛКИ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Авторизация Google: ${BLUE}https://api.tyriantrade.com/api/auth/google${NC}"
echo -e "Авторизация Apple:  ${BLUE}https://api.tyriantrade.com/api/auth/apple${NC}"
echo -e "Главная страница:   ${BLUE}https://social.tyriantrade.com${NC}"

echo ""
