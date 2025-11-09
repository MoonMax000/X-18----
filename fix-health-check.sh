#!/bin/bash

echo "🔧 Исправление Health Check для Backend..."

# Получить текущую task definition
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition tyriantrade-backend \
  --region us-east-1 \
  --query 'taskDefinition' \
  --output json)

# Создать новую версию с исправленным health check
NEW_TASK_DEF=$(echo $TASK_DEF | jq '
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
  .containerDefinitions[0].healthCheck.command = [
    "CMD-SHELL",
    "curl -f http://localhost:8080/health || exit 1"
  ]
')

# Зарегистрировать новую версию task definition
echo "📝 Регистрация новой task definition..."
aws ecs register-task-definition \
  --cli-input-json "$NEW_TASK_DEF" \
  --region us-east-1 > /dev/null

# Обновить сервис с новой task definition
echo "🚀 Обновление сервиса..."
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --force-new-deployment \
  --region us-east-1 > /dev/null

echo "✅ Health check исправлен!"
echo "⏳ Ожидание запуска сервиса (это займет 2-3 минуты)..."
echo ""
echo "Проверить статус:"
echo "aws ecs describe-services --cluster tyriantrade-cluster --services tyriantrade-backend-service --region us-east-1 --query 'services[0].{runningCount:runningCount,desiredCount:desiredCount}'"
