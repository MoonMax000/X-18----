#!/bin/bash
echo "🔍 Получаю последние логи за последние 2 минуты..."
START_TIME=$(($(date +%s)-120))000
aws logs filter-log-events \
    --log-group-name /ecs/tyriantrade/backend \
    --start-time $START_TIME \
    --region us-east-1 \
    --max-items 50 \
    --query 'events[].message' \
    --output text
