#!/bin/bash

echo "🔧 Исправление Health Check для Backend (правильная версия)..."

# Получить текущую task definition
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition tyriantrade-backend \
  --region us-east-1 \
  --query 'taskDefinition' \
  --output json)

# Создать новую версию с ПРАВИЛЬНЫМ health check
NEW_TASK_DEF=$(echo "$TASK_DEF" | jq '
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
  .containerDefinitions[0].healthCheck.command[1] = "curl -f http://localhost:8080/health || exit 1"
')

# Зарегистрировать новую версию task definition
echo "📝 Регистрация новой task definition..."
aws ecs register-task-definition \
  --cli-input-json "$NEW_TASK_DEF" \
  --region us-east-1 > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Task definition зарегистрирована"
else
  echo "❌ Ошибка регистрации task definition"
  exit 1
fi

# Обновить сервис с новой task definition
echo "🚀 Обновление сервиса..."
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --force-new-deployment \
  --region us-east-1 > /dev/null

echo "✅ Health check исправлен ПРАВИЛЬНО!"
echo "⏳ Ожидание запуска сервиса (это займет 2-3 минуты)..."
echo ""
echo "Проверить health check:"
echo "aws ecs describe-task-definition --task-definition tyriantrade-backend --region us-east-1 --query 'taskDefinition.containerDefinitions[0].healthCheck.command'"
