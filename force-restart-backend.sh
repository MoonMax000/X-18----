#!/bin/bash

echo "🔄 Принудительный перезапуск backend service..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CLUSTER_NAME="tyriantrade-cluster"
SERVICE_NAME="tyriantrade-backend-service"
REGION="us-east-1"

echo "📋 Параметры:"
echo "   Cluster: $CLUSTER_NAME"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo ""

echo "1️⃣ Проверяем текущий статус service..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].{desiredCount:desiredCount,runningCount:runningCount,status:status}' \
  --output table

echo ""
echo "2️⃣ Принудительно запускаем новый deployment..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --region $REGION \
  --force-new-deployment \
  --desired-count 1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment запущен успешно${NC}"
    echo ""
    echo "3️⃣ Ожидаем стабилизации service (это может занять 2-5 минут)..."
    echo "   Вы можете следить за прогрессом в AWS Console:"
    echo "   https://console.aws.amazon.com/ecs/home?region=us-east-1#/clusters/$CLUSTER_NAME/services/$SERVICE_NAME/events"
    echo ""
    
    # Ждем стабилизации
    aws ecs wait services-stable \
      --cluster $CLUSTER_NAME \
      --services $SERVICE_NAME \
      --region $REGION
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Service стабилизирован и работает!${NC}"
        echo ""
        echo "4️⃣ Проверяем API..."
        sleep 5
        
        response=$(curl -s -w "\n%{http_code}" https://api.tyriantrade.com/health)
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✅ API работает!${NC}"
            echo "Response: $body"
        else
            echo -e "${RED}❌ API не отвечает (HTTP $http_code)${NC}"
        fi
    else
        echo -e "${RED}❌ Service не стабилизировался${NC}"
        echo "Проверьте логи в CloudWatch:"
        echo "aws logs tail /ecs/tyriantrade/backend --follow --region us-east-1"
    fi
else
    echo -e "${RED}❌ Не удалось запустить deployment${NC}"
    echo "Проверьте права доступа AWS CLI"
fi

echo ""
echo "📊 Финальный статус service:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].{desiredCount:desiredCount,runningCount:runningCount,status:status}' \
  --output table
