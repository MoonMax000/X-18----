#!/bin/bash

# 🔧 Включить ECS Exec на сервисе
# ================================

set -e

echo "🔧 Включение ECS Exec на tyriantrade-backend-service"
echo "===================================================="

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен"
    exit 1
fi

echo ""
echo "⚠️  ВНИМАНИЕ:"
echo "   - Это обновит ECS service"
echo "   - Текущий task будет заменен новым"
echo "   - Может занять 1-2 минуты"
echo ""
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

echo ""
echo "🔄 Обновление ECS service для включения exec..."

# Обновляем service с enableExecuteCommand=true
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --enable-execute-command \
  --region us-east-1 \
  --force-new-deployment

echo ""
echo "✅ ECS service обновлен!"
echo ""
echo "⏳ Ожидание создания нового task с exec..."
echo "   (это займет ~1-2 минуты)"
echo ""

# Ждем пока сервис стабилизируется
aws ecs wait services-stable \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --region us-east-1

echo ""
echo "✅ Новый task создан с ECS exec!"
echo ""
echo "Проверка нового task:"

# Получаем новый task
NEW_TASK_ARN=$(aws ecs list-tasks \
  --cluster tyriantrade-cluster \
  --service-name tyriantrade-backend-service \
  --desired-status RUNNING \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text)

if [ -z "$NEW_TASK_ARN" ] || [ "$NEW_TASK_ARN" == "None" ]; then
    echo "❌ Task не найден"
    exit 1
fi

NEW_TASK_ID=$(basename $NEW_TASK_ARN)

# Проверяем что exec включен
EXEC_ENABLED=$(aws ecs describe-tasks \
  --cluster tyriantrade-cluster \
  --tasks "$NEW_TASK_ID" \
  --region us-east-1 \
  --query 'tasks[0].enableExecuteCommand' \
  --output text)

echo ""
echo "📋 Новый task: $NEW_TASK_ID"
echo "📋 Execute Command: $EXEC_ENABLED"
echo ""

if [ "$EXEC_ENABLED" == "True" ] || [ "$EXEC_ENABLED" == "true" ]; then
    echo "✅ ECS Exec успешно включен!"
    echo ""
    echo "🎯 Теперь можно создать пользователя db_agent:"
    echo "   ./02-apply-db-agent-user.sh"
else
    echo "❌ ECS Exec не включен"
    echo ""
    echo "Возможные причины:"
    echo "  - Task Role не имеет необходимых прав"
    echo "  - SSM endpoints недоступны"
    echo ""
    echo "Проверьте Task Role:"
    aws iam list-attached-role-policies \
      --role-name tyriantrade-ecs-task-role \
      --region us-east-1 \
      --output table
fi
