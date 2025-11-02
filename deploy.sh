#!/bin/bash

# Простой скрипт для деплоя на AWS
# Использование: ./deploy.sh [backend|frontend|all]

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Конфигурация
AWS_REGION="us-east-1"
ECR_REGISTRY="506675684508.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPOSITORY="tyriantrade/backend"
ECS_CLUSTER="tyriantrade-cluster"
ECS_SERVICE="tyriantrade-backend-service"
S3_BUCKET="tyriantrade-frontend"
CLOUDFRONT_DISTRIBUTION_ID="E2V60CFOUD2P7L"

# Функция для деплоя backend
deploy_backend() {
    echo -e "${YELLOW}🚀 Deploying Backend...${NC}"
    
    # 1. Login в ECR
    echo -e "${YELLOW}📦 Logging into ECR...${NC}"
    aws ecr get-login-password --region $AWS_REGION | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
    
    # 2. Build Docker image
    echo -e "${YELLOW}🔨 Building Docker image...${NC}"
    cd custom-backend
    docker build -t $ECR_REPOSITORY:latest .
    cd ..
    
    # 3. Tag image
    echo -e "${YELLOW}🏷️  Tagging image...${NC}"
    IMAGE_TAG=$(git rev-parse --short HEAD)
    docker tag $ECR_REPOSITORY:latest $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker tag $ECR_REPOSITORY:latest $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    # 4. Push в ECR
    echo -e "${YELLOW}⬆️  Pushing to ECR...${NC}"
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    # 5. Force new deployment
    echo -e "${YELLOW}🔄 Forcing ECS deployment...${NC}"
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $ECS_SERVICE \
        --force-new-deployment \
        --region $AWS_REGION > /dev/null
    
    echo -e "${GREEN}✅ Backend deployment initiated!${NC}"
    echo -e "${YELLOW}⏳ ECS is rolling out new tasks (takes 3-5 minutes)${NC}"
}

# Функция для деплоя frontend
deploy_frontend() {
    echo -e "${YELLOW}🚀 Deploying Frontend...${NC}"
    
    # 1. Build frontend
    echo -e "${YELLOW}🔨 Building frontend...${NC}"
    cd client
    npm run build
    cd ..
    
    # 2. Upload в S3
    echo -e "${YELLOW}⬆️  Uploading to S3...${NC}"
    aws s3 sync dist/spa/ s3://$S3_BUCKET/ --delete
    
    # 3. Invalidate CloudFront cache
    echo -e "${YELLOW}🗑️  Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --region $AWS_REGION \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
    echo -e "${YELLOW}⏳ CloudFront invalidation in progress (ID: $INVALIDATION_ID)${NC}"
}

# Проверка статуса
check_status() {
    echo -e "${YELLOW}📊 Checking deployment status...${NC}"
    echo ""
    
    # Backend status
    echo -e "${YELLOW}Backend (ECS):${NC}"
    aws ecs describe-services \
        --cluster $ECS_CLUSTER \
        --services $ECS_SERVICE \
        --region $AWS_REGION \
        --query 'services[0].deployments[0].{TaskDef:taskDefinitionArn,Running:runningCount,Desired:desiredCount,Status:rolloutState}' \
        --output table
    
    echo ""
    
    # Frontend status
    echo -e "${YELLOW}Frontend (CloudFront):${NC}"
    echo "Distribution: https://d3d3yzz21b5b34.cloudfront.net"
    echo "S3 Bucket: s3://$S3_BUCKET"
}

# Главная логика
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        echo ""
        deploy_frontend
        ;;
    status)
        check_status
        ;;
    *)
        echo "Usage: $0 {backend|frontend|all|status}"
        echo ""
        echo "Examples:"
        echo "  $0 backend   # Deploy only backend"
        echo "  $0 frontend  # Deploy only frontend"
        echo "  $0 all       # Deploy both (default)"
        echo "  $0 status    # Check deployment status"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
