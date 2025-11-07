#!/bin/bash
set -e

echo "🚀 Создание Task Definition 117 с правильным RESEND_FROM_EMAIL..."

# Получаем текущий task definition
aws ecs describe-task-definition --task-definition tyriantrade-backend:116 \
  --query 'taskDefinition' > task-def-116.json

# Создаем новый task definition с исправленным RESEND_FROM_EMAIL
cat task-def-116.json | jq '
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
  .containerDefinitions[0].environment = [
    .containerDefinitions[0].environment[] |
    if .name == "RESEND_FROM_EMAIL" then
      .value = "noreply@tyriantrade.com"
    else
      .
    end
  ]
' > task-def-117.json

echo ""
echo "📋 Проверяем RESEND настройки в новом task definition:"
cat task-def-117.json | jq '.containerDefinitions[0].environment[] | select(.name | contains("RESEND") or .name == "EMAIL_PROVIDER" or .name == "DB_HOST")'

echo ""
echo "✅ Регистрируем новый Task Definition 117..."
aws ecs register-task-definition --cli-input-json file://task-def-117.json

echo ""
echo "🔄 Обновляем сервис на Task Definition 117..."
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --task-definition tyriantrade-backend:117 \
  --force-new-deployment

echo ""
echo "✅ Task Definition 117 создан и развертывание запущено!"
echo ""
echo "📊 Следите за статусом развертывания:"
echo "   ./watch-deployment.sh"
