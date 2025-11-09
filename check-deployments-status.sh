#!/bin/bash

echo "================================================"
echo "📊 СТАТУС ВСЕХ ДЕПЛОЕВ"
echo "================================================"
echo ""

# Получаем список последних 5 запусков
echo "🔍 Проверка GitHub Actions..."
RUNS=$(gh run list --limit 5 --json databaseId,displayTitle,status,conclusion,createdAt,updatedAt 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Ошибка получения статуса GitHub Actions"
    echo "$RUNS"
    exit 1
fi

echo "$RUNS" | jq -r '.[] | 
    "-------------------\n" +
    "ID: \(.databaseId)\n" +
    "Название: \(.displayTitle)\n" +
    "Статус: \(.status)\n" +
    "Результат: \(if .conclusion == "" then "в процессе" else .conclusion end)\n" +
    "Создан: \(.createdAt)\n" +
    "Обновлен: \(.updatedAt)"
'

echo ""
echo "================================================"
echo "🎯 КРАТКИЙ ИТОГ"
echo "================================================"

# Подсчитываем статусы
IN_PROGRESS=$(echo "$RUNS" | jq '[.[] | select(.status == "in_progress")] | length')
SUCCESS=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "success")] | length')
FAILED=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "failure")] | length')

echo "⏳ В процессе: $IN_PROGRESS"
echo "✅ Успешно: $SUCCESS"
echo "❌ Ошибка: $FAILED"

echo ""
echo "================================================"
echo "🔧 СТАТУС ECS BACKEND"
echo "================================================"

# Проверяем статус ECS
ECS_STATUS=$(aws ecs describe-services \
    --cluster tyriantrade-cluster \
    --services tyriantrade-backend-service \
    --region us-east-1 \
    --query 'services[0]' \
    --output json 2>&1)

if [ $? -eq 0 ]; then
    RUNNING=$(echo "$ECS_STATUS" | jq -r '.runningCount')
    DESIRED=$(echo "$ECS_STATUS" | jq -r '.desiredCount')
    STATUS=$(echo "$ECS_STATUS" | jq -r '.status')
    
    echo "Статус сервиса: $STATUS"
    echo "Запущено задач: $RUNNING"
    echo "Требуется задач: $DESIRED"
    
    echo ""
    echo "Deployments:"
    echo "$ECS_STATUS" | jq -r '.deployments[] | 
        "  - Статус: \(.status)\n" +
        "    Требуется: \(.desiredCount)\n" +
        "    Запущено: \(.runningCount)\n" +
        "    Rollout: \(.rolloutState // "N/A")\n" +
        "    Создан: \(.createdAt)"
    '
else
    echo "⚠️  Не удалось получить статус ECS"
    echo "$ECS_STATUS"
fi

echo ""
echo "================================================"

if [ "$IN_PROGRESS" -gt 0 ]; then
    echo "⏳ Деплои все еще выполняются. Проверьте статус позже."
    exit 0
elif [ "$FAILED" -gt 0 ]; then
    echo "❌ Есть неудачные деплои. Требуется проверка."
    exit 1
else
    echo "✅ Все деплои завершены успешно!"
    exit 0
fi
