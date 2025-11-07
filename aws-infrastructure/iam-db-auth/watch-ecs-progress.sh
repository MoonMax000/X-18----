#!/bin/bash

# 📊 Мониторинг прогресса ECS deployment
# =======================================

echo "📊 Мониторинг ECS Deployment для tyriantrade-backend-service"
echo "============================================================="
echo ""
echo "Нажмите Ctrl+C для выхода"
echo ""

while true; do
    clear
    echo "📊 Мониторинг ECS Deployment"
    echo "============================"
    echo ""
    
    # Получаем информацию о deployments
    DEPLOYMENT_INFO=$(aws ecs describe-services \
        --cluster tyriantrade-cluster \
        --services tyriantrade-backend-service \
        --region us-east-1 \
        --query 'services[0].deployments[*].[id,status,desiredCount,runningCount,pendingCount,createdAt]' \
        --output text 2>/dev/null)
    
    if [ -z "$DEPLOYMENT_INFO" ]; then
        echo "❌ Не удалось получить информацию о deployment"
        sleep 5
        continue
    fi
    
    echo "$DEPLOYMENT_INFO" | while read line; do
        DEPLOYMENT_ID=$(echo $line | awk '{print $1}')
        STATUS=$(echo $line | awk '{print $2}')
        DESIRED=$(echo $line | awk '{print $3}')
        RUNNING=$(echo $line | awk '{print $4}')
        PENDING=$(echo $line | awk '{print $5}')
        CREATED=$(echo $line | awk '{print $6}')
        
        echo "🔹 Deployment: ${DEPLOYMENT_ID:0:8}..."
        echo "   Статус:    $STATUS"
        echo "   Desired:   $DESIRED"
        echo "   Running:   $RUNNING"
        echo "   Pending:   $PENDING"
        echo "   Создан:    $CREATED"
        
        # Прогресс-бар
        if [ "$DESIRED" -gt 0 ]; then
            PERCENT=$((RUNNING * 100 / DESIRED))
            FILLED=$((PERCENT / 5))
            EMPTY=$((20 - FILLED))
            
            printf "   Прогресс:  ["
            for i in $(seq 1 $FILLED); do printf "█"; done
            for i in $(seq 1 $EMPTY); do printf "░"; done
            printf "] %d%%\n" $PERCENT
        fi
        echo ""
    done
    
    # Получаем информацию о tasks
    TASKS=$(aws ecs list-tasks \
        --cluster tyriantrade-cluster \
        --service-name tyriantrade-backend-service \
        --region us-east-1 \
        --query 'taskArns[*]' \
        --output text 2>/dev/null)
    
    if [ -n "$TASKS" ]; then
        echo "📋 Tasks:"
        for TASK_ARN in $TASKS; do
            TASK_ID=$(basename $TASK_ARN)
            TASK_INFO=$(aws ecs describe-tasks \
                --cluster tyriantrade-cluster \
                --tasks "$TASK_ID" \
                --region us-east-1 \
                --query 'tasks[0].[lastStatus,healthStatus,enableExecuteCommand,createdAt]' \
                --output text 2>/dev/null)
            
            LAST_STATUS=$(echo $TASK_INFO | awk '{print $1}')
            HEALTH=$(echo $TASK_INFO | awk '{print $2}')
            EXEC_ENABLED=$(echo $TASK_INFO | awk '{print $3}')
            
            echo "   • ${TASK_ID:0:8}... | Status: $LAST_STATUS | Health: $HEALTH | Exec: $EXEC_ENABLED"
        done
    fi
    
    echo ""
    echo "🕐 Обновлено: $(date '+%H:%M:%S')"
    echo ""
    echo "⏸  Обновление каждые 5 секунд..."
    
    sleep 5
done
