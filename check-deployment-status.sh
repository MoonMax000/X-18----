#!/bin/bash

echo "=================================================="
echo "🚀 ECS Deployment Status Monitor"
echo "=================================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

while true; do
    echo "⏰ Проверка в $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # 1. Проверка ECS deployments
    echo "📦 1. ECS Service Deployments:"
    DEPLOYMENTS=$(aws ecs describe-services \
        --cluster tyriantrade-cluster \
        --services tyriantrade-backend-service \
        --region us-east-1 \
        --query 'services[0].deployments[*].{Status:status,TaskDef:taskDefinition,Desired:desiredCount,Running:runningCount}' \
        --output json 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        PRIMARY_COUNT=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.Status=="PRIMARY") | .Running' 2>/dev/null)
        PRIMARY_DESIRED=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.Status=="PRIMARY") | .Desired' 2>/dev/null)
        PRIMARY_TASKDEF=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.Status=="PRIMARY") | .TaskDef' 2>/dev/null | grep -o 'tyriantrade-backend:[0-9]*')
        
        if [ "$PRIMARY_COUNT" == "$PRIMARY_DESIRED" ] && [ ! -z "$PRIMARY_COUNT" ]; then
            echo -e "   ${GREEN}✅ PRIMARY: $PRIMARY_COUNT/$PRIMARY_DESIRED tasks (${PRIMARY_TASKDEF})${NC}"
        else
            echo -e "   ${YELLOW}⏳ PRIMARY: $PRIMARY_COUNT/$PRIMARY_DESIRED tasks (${PRIMARY_TASKDEF})${NC}"
        fi
        
        # Проверяем старые deployments
        ACTIVE_COUNT=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.Status=="ACTIVE") | .Running' 2>/dev/null)
        if [ ! -z "$ACTIVE_COUNT" ]; then
            echo -e "   ${YELLOW}⏳ ACTIVE (stopping): $ACTIVE_COUNT tasks${NC}"
        fi
    else
        echo -e "   ${RED}❌ Не удалось получить статус${NC}"
    fi
    
    echo ""
    
    # 2. Проверка Backend Health
    echo "🏥 2. Backend Health Check:"
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.tyriantrade.com/health 2>/dev/null)
    
    if [ "$HEALTH_RESPONSE" == "200" ]; then
        echo -e "   ${GREEN}✅ https://api.tyriantrade.com/health - OK (200)${NC}"
    elif [ "$HEALTH_RESPONSE" == "000" ]; then
        echo -e "   ${RED}❌ Backend недоступен${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Backend отвечает с кодом: $HEALTH_RESPONSE${NC}"
    fi
    
    echo ""
    
    # 3. Последние логи
    echo "📋 3. Последние логи backend (последние 5 сообщений):"
    RECENT_LOGS=$(aws logs tail /ecs/tyriantrade/backend \
        --since 2m \
        --format short \
        --region us-east-1 \
        2>/dev/null | tail -5)
    
    if [ ! -z "$RECENT_LOGS" ]; then
        echo "$RECENT_LOGS" | sed 's/^/   /'
    else
        echo "   (нет новых логов)"
    fi
    
    echo ""
    echo "=================================================="
    
    # Проверяем если всё готово
    if [ "$PRIMARY_COUNT" == "$PRIMARY_DESIRED" ] && [ "$HEALTH_RESPONSE" == "200" ] && [ -z "$ACTIVE_COUNT" ]; then
        echo ""
        echo -e "${GREEN}🎉🎉🎉 РАЗВЁРТЫВАНИЕ ЗАВЕРШЕНО! 🎉🎉🎉${NC}"
        echo -e "${GREEN}   ✅ Все tasks запущены${NC}"
        echo -e "${GREEN}   ✅ Backend отвечает${NC}"
        echo -e "${GREEN}   ✅ Старые deployments остановлены${NC}"
        echo ""
        echo "Можно проверять работу приложения:"
        echo "   • Frontend: https://social.tyriantrade.com"
        echo "   • Backend:  https://api.tyriantrade.com/health"
        echo ""
        break
    fi
    
    echo ""
    echo "⏰ Следующая проверка через 30 секунд..."
    echo "❌ Ctrl+C чтобы остановить"
    echo ""
    
    sleep 30
done
