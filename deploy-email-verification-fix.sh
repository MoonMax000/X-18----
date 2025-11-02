#!/bin/bash

# Email Verification Fix - Deployment Script
# Этот скрипт деплоит все изменения для исправления email verification

set -e

echo "🚀 Starting Email Verification Fix Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build and Push Backend
echo -e "${YELLOW}Step 1: Building Backend Docker Image...${NC}"
cd custom-backend
docker build -t tyriantrade-backend:latest .

echo -e "${YELLOW}Step 2: Logging into ECR...${NC}"
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 506675684508.dkr.ecr.us-east-1.amazonaws.com

echo -e "${YELLOW}Step 3: Tagging Image...${NC}"
docker tag tyriantrade-backend:latest 506675684508.dkr.ecr.us-east-1.amazonaws.com/tyriantrade-backend:latest

echo -e "${YELLOW}Step 4: Pushing to ECR...${NC}"
docker push 506675684508.dkr.ecr.us-east-1.amazonaws.com/tyriantrade-backend:latest

echo -e "${YELLOW}Step 5: Forcing ECS Deployment...${NC}"
cd ..
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --force-new-deployment \
  --region us-east-1

echo -e "${GREEN}✅ Backend deployment initiated!${NC}"
echo ""

# Step 2: Deploy Frontend
echo -e "${YELLOW}Step 6: Building Frontend...${NC}"
cd client
npm run build

echo -e "${YELLOW}Step 7: Deploying to Netlify...${NC}"
netlify deploy --prod

echo -e "${GREEN}✅ Frontend deployed to Netlify!${NC}"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Изменения:"
echo "1. ✅ Backend Register - не генерирует токены при регистрации"
echo "2. ✅ Backend VerifyEmail - генерирует токены после verification"
echo "3. ✅ Frontend SignUpModal - показывает VerificationModal"
echo "4. ✅ Frontend VerificationModal - вызывает verifyEmail() и перенаправляет"
echo ""
echo "Тестирование:"
echo "1. Откройте https://tyriantrade.net"
echo "2. Нажмите 'Sign Up'"
echo "3. Введите email и пароль"
echo "4. Нажмите 'Create account'"
echo "5. Должно показаться окно для ввода кода из email"
echo "6. Введите 6-значный код из email"
echo "7. После успешной verification - редирект на /dashboard"
echo ""
echo -e "${YELLOW}⚠️  Важно: Проверьте что RESEND_API_KEY настроен в ECS!${NC}"
echo ""

# Check ECS deployment status
echo -e "${YELLOW}Проверка статуса ECS deployment...${NC}"
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --region us-east-1 \
  --query 'services[0].deployments[0].{Status:status,Running:runningCount,Desired:desiredCount}' \
  --output table

echo ""
echo -e "${GREEN}Deployment script completed!${NC}"
