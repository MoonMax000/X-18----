#!/bin/bash

# 🔐 Применить SQL для создания пользователя db_agent
# =====================================================

set -e

echo "🔐 Создание пользователя db_agent в PostgreSQL"
echo "==============================================="

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен"
    exit 1
fi

echo ""
echo "📋 Этот скрипт выполнит SQL через ECS exec"
echo ""
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

# Найти активный ECS task
echo ""
echo "🔍 Поиск активного ECS task..."

TASK_ARN=$(aws ecs list-tasks \
  --cluster tyriantrade-cluster \
  --service-name tyriantrade-backend-service \
  --desired-status RUNNING \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo "❌ Активный task не найден"
    exit 1
fi

TASK_ID=$(basename $TASK_ARN)
echo "✅ Найден task: $TASK_ID"

# Получаем директорию скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Читаем SQL файл
SQL_CONTENT=$(cat "$SCRIPT_DIR/02-create-db-agent-user.sql")

echo ""
echo "🔄 Выполнение SQL команд..."

# Выполняем SQL через ECS exec
aws ecs execute-command \
  --cluster tyriantrade-cluster \
  --task "$TASK_ID" \
  --container backend \
  --interactive \
  --region us-east-1 \
  --command "psql \$DATABASE_URL -c \"$SQL_CONTENT\""

echo ""
echo "✅ Пользователь db_agent создан!"
echo ""
echo "Проверка пользователя:"

# Проверяем что пользователь создан
aws ecs execute-command \
  --cluster tyriantrade-cluster \
  --task "$TASK_ID" \
  --container backend \
  --interactive \
  --region us-east-1 \
  --command "psql \$DATABASE_URL -c \"SELECT usename, usesuper FROM pg_user WHERE usename = 'db_agent'\""

echo ""
echo "🎯 Следующий шаг: Создать IAM политику для rds-db:connect"
echo "   Выполните: ./03-create-iam-policy.sh"
