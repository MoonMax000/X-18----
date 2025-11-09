#!/bin/bash

# ============================================
# Проверка статуса деплоя и сервисов
# ============================================

echo "🚀 Проверка статуса деплоя Tyrian Trade"
echo "========================================"
echo ""

# 1. Проверка GitHub Actions
echo "📦 GitHub Actions:"
echo ""
gh run list --limit 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 2. Проверка ECS сервиса
echo "☁️  AWS ECS Service:"
echo ""
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Deployment:deployments[0].status}' \
  --output table

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 3. Проверка задач ECS
echo "📋 ECS Tasks:"
echo ""
aws ecs list-tasks \
  --cluster tyriantrade-cluster \
  --service-name tyriantrade-backend-service \
  --query 'taskArns[0]' \
  --output text | xargs -I {} aws ecs describe-tasks \
  --cluster tyriantrade-cluster \
  --tasks {} \
  --query 'tasks[0].{Status:lastStatus,Health:healthStatus,StartedAt:startedAt}' \
  --output table

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 4. Проверка API
echo "🌐 API Health Check:"
echo ""
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.tyriantrade.com/health || echo "ERROR")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API работает (HTTP $API_STATUS)"
    curl -s https://api.tyriantrade.com/health | jq '.' || echo "Не удалось получить детали"
else
    echo "❌ API недоступен (HTTP $API_STATUS)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. Проверка Frontend
echo "🎨 Frontend Health Check:"
echo ""
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://social.tyriantrade.com || echo "ERROR")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend работает (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend недоступен (HTTP $FRONTEND_STATUS)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 6. Последние логи
echo "📝 Последние логи backend (последние 10 строк):"
echo ""
aws logs tail /ecs/tyriantrade-backend --since 5m --format short | tail -10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Проверка завершена!"
echo ""
echo "💡 Полезные команды:"
echo "  gh run watch           # Следить за текущим деплоем"
echo "  gh run view --log      # Посмотреть логи деплоя"
echo "  ./watch-deployment.sh  # Постоянный мониторинг"
