#!/bin/bash

# ===================================================================
# ПРОДАКШЕН: Мониторинг OAuth логов в реальном времени
# Использование: ./monitor-oauth-production-enhanced.sh [--follow]
# ===================================================================

echo "🔍 OAuth Production Logs Monitor"
echo "=================================="

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

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI не установлен${NC}"
    echo "Установите: brew install awscli"
    exit 1
fi

# Проверка авторизации AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials не настроены${NC}"
    echo "Запустите: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS подключен${NC}"
echo ""

# Получение информации о задаче
echo -e "${YELLOW}📋 Информация о сервисе:${NC}"
SERVICE_INFO=$(aws ecs describe-services \
    --cluster tyriantrade-cluster \
    --services tyriantrade-backend-service \
    --region us-east-1 \
    --query 'services[0]' 2>/dev/null)

if [ $? -eq 0 ]; then
    RUNNING_COUNT=$(echo "$SERVICE_INFO" | jq -r '.runningCount')
    DESIRED_COUNT=$(echo "$SERVICE_INFO" | jq -r '.desiredCount')
    TASK_DEF=$(echo "$SERVICE_INFO" | jq -r '.taskDefinition' | grep -o 'tyriantrade-backend:[0-9]*')
    
    echo -e "  Статус: ${GREEN}${RUNNING_COUNT}${NC}/${DESIRED_COUNT} задач запущено"
    echo -e "  Task Definition: ${CYAN}${TASK_DEF}${NC}"
else
    echo -e "${RED}❌ Не удалось получить информацию о сервисе${NC}"
fi

# Получение текущей задачи
echo -e "\n${YELLOW}🔍 Получение текущей задачи...${NC}"
TASK_ARN=$(aws ecs list-tasks \
    --cluster tyriantrade-cluster \
    --service-name tyriantrade-backend-service \
    --region us-east-1 \
    --query 'taskArns[0]' \
    --output text 2>/dev/null)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo -e "${RED}❌ Нет запущенных задач${NC}"
    exit 1
fi

TASK_ID=$(echo "$TASK_ARN" | grep -o '[^/]*$')
echo -e "  Task ID: ${CYAN}${TASK_ID}${NC}"

# Функция для форматирования логов
format_log_line() {
    local line="$1"
    
    # Подсветка ключевых слов
    line=$(echo "$line" | sed -E "s/(ERROR|error|❌)/$(printf "${RED}")\1$(printf "${NC}")/g")
    line=$(echo "$line" | sed -E "s/(SUCCESS|success|✅)/$(printf "${GREEN}")\1$(printf "${NC}")/g")
    line=$(echo "$line" | sed -E "s/(WARNING|warning|⚠️)/$(printf "${YELLOW}")\1$(printf "${NC}")/g")
    line=$(echo "$line" | sed -E "s/(Apple|apple)/$(printf "${MAGENTA}")Apple$(printf "${NC}")/g")
    line=$(echo "$line" | sed -E "s/(Google|google)/$(printf "${BLUE}")Google$(printf "${NC}")/g")
    line=$(echo "$line" | sed -E "s/(OAuth|oauth)/$(printf "${CYAN}")OAuth$(printf "${NC}")/g")
    
    echo -e "$line"
}

# Функция получения логов
get_logs() {
    local start_time=$1
    local query=$2
    
    aws logs filter-log-events \
        --log-group-name /ecs/tyriantrade-backend \
        --filter-pattern "$query" \
        --start-time "$start_time" \
        --region us-east-1 \
        --query 'events[*].[timestamp,message]' \
        --output text 2>/dev/null | while IFS=$'\t' read -r timestamp message; do
            # Конвертация timestamp в человеческий формат
            local date_str=$(date -r $((timestamp/1000)) '+%H:%M:%S' 2>/dev/null || echo "")
            echo "[$date_str] $message"
        done
}

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$FOLLOW_MODE" = true ]; then
    echo -e "${GREEN}🔄 Режим непрерывного мониторинга (Ctrl+C для выхода)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Начальная временная метка
    START_TIME=$(date -u +%s)000
    
    while true; do
        # Получение новых логов
        LOGS=$(get_logs "$START_TIME" "OAuth OR oauth OR Apple OR apple OR Google OR google OR callback OR error OR panic")
        
        if [ ! -z "$LOGS" ]; then
            echo "$LOGS" | while IFS= read -r line; do
                format_log_line "$line"
            done
        fi
        
        # Обновление временной метки для следующей итерации
        START_TIME=$(date -u +%s)000
        
        sleep 2
    done
else
    echo -e "${YELLOW}📊 Последние 15 минут логов${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Время 15 минут назад
    START_TIME=$(date -u -d '15 minutes ago' +%s)000
    
    # 1. OAuth конфигурация
    echo -e "${MAGENTA}🔧 OAuth Configuration:${NC}"
    CONFIG_LOGS=$(get_logs "$START_TIME" "OAuth configured OR Apple OAuth OR Google OAuth")
    if [ ! -z "$CONFIG_LOGS" ]; then
        echo "$CONFIG_LOGS" | tail -5 | while IFS= read -r line; do
            format_log_line "$line"
        done
    else
        echo -e "${YELLOW}  Нет логов конфигурации${NC}"
    fi
    
    echo ""
    
    # 2. OAuth запросы
    echo -e "${BLUE}🌐 OAuth Requests:${NC}"
    REQUEST_LOGS=$(get_logs "$START_TIME" "OAuth Callback Started OR OAuth Login")
    if [ ! -z "$REQUEST_LOGS" ]; then
        echo "$REQUEST_LOGS" | tail -10 | while IFS= read -r line; do
            format_log_line "$line"
        done
    else
        echo -e "${YELLOW}  Нет OAuth запросов${NC}"
    fi
    
    echo ""
    
    # 3. Ошибки
    echo -e "${RED}❌ Errors:${NC}"
    ERROR_LOGS=$(get_logs "$START_TIME" "ERROR OR error OR panic OR failed OR invalid")
    if [ ! -z "$ERROR_LOGS" ]; then
        echo "$ERROR_LOGS" | tail -15 | while IFS= read -r line; do
            format_log_line "$line"
        done
    else
        echo -e "${GREEN}  ✅ Ошибок нет${NC}"
    fi
    
    echo ""
    
    # 4. Успешные авторизации
    echo -e "${GREEN}✅ Successful Logins:${NC}"
    SUCCESS_LOGS=$(get_logs "$START_TIME" "OAuth login successful OR successful")
    if [ ! -z "$SUCCESS_LOGS" ]; then
        echo "$SUCCESS_LOGS" | tail -5 | while IFS= read -r line; do
            format_log_line "$line"
        done
    else
        echo -e "${YELLOW}  Нет успешных авторизаций${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Подсказки
    echo ""
    echo -e "${YELLOW}💡 Подсказки:${NC}"
    echo "  • Запустите с --follow для непрерывного мониторинга"
    echo "  • Проверьте переменные окружения: ./check-production-oauth.sh"
    echo "  • Логи полностью: aws logs tail /ecs/tyriantrade-backend --follow"
    echo ""
    echo -e "${YELLOW}🔗 OAuth URLs для тестирования:${NC}"
    echo "  Google: https://social.tyriantrade.com/ (нажмите 'Sign in with Google')"
    echo "  Apple:  https://social.tyriantrade.com/ (нажмите 'Sign in with Apple')"
fi
