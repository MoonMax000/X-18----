#!/bin/bash

# Скрипт для полного деплоя с очисткой кэша
# Использование: ./deploy-no-cache.sh

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

echo -e "${YELLOW}🚀 Full Deployment with Cache Clearing${NC}"
echo ""

# BACKEND DEPLOYMENT
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 BACKEND DEPLOYMENT${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 1. Login в ECR
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY

# 2. Build Docker image with --no-cache
echo -e "${YELLOW}🔨 Building Docker image (--no-cache)...${NC}"
cd custom-backend
docker build --no-cache -t $ECR_REPOSITORY:latest .
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
echo ""

# FRONTEND DEPLOYMENT
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 FRONTEND DEPLOYMENT${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 1. Clear dist directory
echo -e "${YELLOW}🗑️  Clearing dist directory...${NC}"
cd client
rm -rf dist

# 2. Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build
cd ..

# 3. Upload в S3
echo -e "${YELLOW}⬆️  Uploading to S3...${NC}"
aws s3 sync dist/spa/ s3://$S3_BUCKET/ --delete

# 4. Invalidate CloudFront cache
echo -e "${YELLOW}🗑️  Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*" \
    --region $AWS_REGION \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${GREEN}✅ Frontend deployed!${NC}"
echo -e "${YELLOW}⏳ CloudFront invalidation in progress (ID: $INVALIDATION_ID)${NC}"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Full Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait 3-5 minutes for ECS to roll out new backend tasks"
echo "2. Wait for CloudFront invalidation to complete"
echo "3. Check backend logs: aws ecs execute-command --cluster $ECS_CLUSTER --task <task-id> --container backend --command '/bin/sh' --interactive"
echo "4. Test avatar upload on https://social.tyriantrade.com/profile"
echo "5. Verify sync on https://social.tyriantrade.com/profile-page"
