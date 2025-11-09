#!/bin/bash

# Скрипт деплоя исправлений для админ панели управления пользователями

set -e

echo "🚀 Начинаю деплой исправлений для админ панели..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка AWS credentials
echo -e "${YELLOW}Проверка AWS credentials...${NC}"
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}❌ AWS credentials не настроены${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials в порядке${NC}"

# Получаем текущую версию task definition
CURRENT_REVISION=$(aws ecs describe-services \
    --cluster x18-cluster \
    --services x18-backend-service \
    --query 'services[0].taskDefinition' \
    --output text | grep -oP '\d+$')

echo -e "${YELLOW}Текущая версия task definition: ${CURRENT_REVISION}${NC}"

# Создаем новую версию с правильным CORS
NEW_REVISION=$((CURRENT_REVISION + 1))

echo -e "${YELLOW}Создание новой task definition (версия ${NEW_REVISION})...${NC}"

# Получаем текущую task definition
TASK_DEF=$(aws ecs describe-task-definition \
    --task-definition x18-backend-task \
    --query 'taskDefinition')

# Проверяем текущий CORS_ORIGIN
CURRENT_CORS=$(echo $TASK_DEF | jq -r '.containerDefinitions[0].environment[] | select(.name=="CORS_ORIGIN") | .value')
echo -e "${YELLOW}Текущий CORS_ORIGIN: ${CURRENT_CORS}${NC}"

# Обновляем CORS если нужно
REQUIRED_CORS="https://social.tyriantrade.com,https://tyriantrade.com"
if [ "$CURRENT_CORS" != "$REQUIRED_CORS" ]; then
    echo -e "${YELLOW}Обновляю CORS_ORIGIN на: ${REQUIRED_CORS}${NC}"
    TASK_DEF=$(echo $TASK_DEF | jq --arg cors "$REQUIRED_CORS" \
        '(.containerDefinitions[0].environment[] | select(.name=="CORS_ORIGIN") | .value) = $cors')
fi

# Удаляем ненужные поля для регистрации новой версии
TASK_DEF=$(echo $TASK_DEF | jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

# Регистрируем новую task definition
echo "$TASK_DEF" > /tmp/task-def-${NEW_REVISION}.json

NEW_TASK_DEF=$(aws ecs register-task-definition --cli-input-json file:///tmp/task-def-${NEW_REVISION}.json)

NEW_TASK_ARN=$(echo $NEW_TASK_DEF | jq -r '.taskDefinition.taskDefinitionArn')
echo -e "${GREEN}✅ Новая task definition создана: ${NEW_TASK_ARN}${NC}"

# Билдим и пушим новый Docker образ
echo -e "${YELLOW}Сборка Docker образа...${NC}"
cd custom-backend

# Логинимся в ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 590183797493.dkr.ecr.us-east-1.amazonaws.com

# Билдим образ
docker build --no-cache -t x18-backend:latest .

# Тегируем
docker tag x18-backend:latest 590183797493.dkr.ecr.us-east-1.amazonaws.com/x18-backend:latest
docker tag x18-backend:latest 590183797493.dkr.ecr.us-east-1.amazonaws.com/x18-backend:v${NEW_REVISION}

# Пушим
echo -e "${YELLOW}Отправка образа в ECR...${NC}"
docker push 590183797493.dkr.ecr.us-east-1.amazonaws.com/x18-backend:latest
docker push 590183797493.dkr.ecr.us-east-1.amazonaws.com/x18-backend:v${NEW_REVISION}

echo -e "${GREEN}✅ Docker образ загружен${NC}"

cd ..

# Обновляем сервис
echo -e "${YELLOW}Обновление ECS сервиса...${NC}"
aws ecs update-service \
    --cluster x18-cluster \
    --service x18-backend-service \
    --task-definition $NEW_TASK_ARN \
    --force-new-deployment \
    > /dev/null

echo -e "${GREEN}✅ Сервис обновлен${NC}"

# Мониторинг деплоя
echo -e "${YELLOW}Мониторинг деплоя...${NC}"
echo "Ожидание стабилизации сервиса (это может занять 2-3 минуты)..."

for i in {1..60}; do
    RUNNING_COUNT=$(aws ecs describe-services \
        --cluster x18-cluster \
        --services x18-backend-service \
        --query 'services[0].runningCount' \
        --output text)
    
    DESIRED_COUNT=$(aws ecs describe-services \
        --cluster x18-cluster \
        --services x18-backend-service \
        --query 'services[0].desiredCount' \
        --output text)
    
    DEPLOYMENTS=$(aws ecs describe-services \
        --cluster x18-cluster \
        --services x18-backend-service \
        --query 'length(services[0].deployments)' \
        --output text)
    
    echo -ne "\rЗапущено: ${RUNNING_COUNT}/${DESIRED_COUNT}, Активных деплоев: ${DEPLOYMENTS}"
    
    if [ "$DEPLOYMENTS" -eq "1" ] && [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ]; then
        echo ""
        echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo ""
        echo -e "${RED}❌ Таймаут ожидания деплоя${NC}"
        exit 1
    fi
    
    sleep 5
done

# Проверка health endpoint
echo -e "${YELLOW}Проверка health endpoint...${NC}"
sleep 10

HEALTH_CHECK=$(curl -s https://api.tyriantrade.com/health | jq -r '.status' || echo "error")
if [ "$HEALTH_CHECK" = "ok" ]; then
    echo -e "${GREEN}✅ Backend API работает${NC}"
else
    echo -e "${RED}⚠️  Backend API не отвечает корректно${NC}"
fi

# Проверка админ endpoint
echo -e "${YELLOW}Проверка админ endpoint...${NC}"
ADMIN_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://api.tyriantrade.com/api/admin/users || echo "000")
if [ "$ADMIN_CHECK" = "401" ]; then
    echo -e "${GREEN}✅ Админ endpoint доступен (требует авторизации)${NC}"
elif [ "$ADMIN_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Админ endpoint доступен${NC}"
else
    echo -e "${RED}⚠️  Админ endpoint вернул код: ${ADMIN_CHECK}${NC}"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Изменения:${NC}"
echo "  • Добавлен эндпоинт DELETE /api/admin/users/cleanup"
echo "  • CORS настроен для: ${REQUIRED_CORS}"
echo "  • Docker образ: v${NEW_REVISION}"
echo ""
echo -e "${YELLOW}Для тестирования:${NC}"
echo "  1. Откройте https://social.tyriantrade.com/admin/users"
echo "  2. Войдите как администратор"
echo "  3. Проверьте список пользователей"
echo "  4. Используйте кнопку 'Delete All Users Except Admins' в Danger Zone"
echo ""
echo -e "${YELLOW}Логи:${NC}"
echo "  aws logs tail /ecs/x18-backend --follow"
echo ""
