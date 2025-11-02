#!/bin/bash

# Deploy username limitation feature to production
# This script deploys both backend and frontend changes

set -e

echo "🚀 Starting deployment of username limitation feature..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Build and Push Backend Docker Image
# ============================================================================

echo -e "${BLUE}📦 STEP 1: Building and pushing backend Docker image...${NC}"
cd custom-backend

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_REPOSITORY="tyriantrade-backend"
IMAGE_TAG="username-limitation-$(date +%Y%m%d-%H%M%S)"

echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   Region: $AWS_REGION"
echo "   Image tag: $IMAGE_TAG"

# Login to ECR
echo "   🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build Docker image
echo "   🔨 Building Docker image..."
docker build -t $ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REPOSITORY:latest .

# Tag for ECR
docker tag $ECR_REPOSITORY:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Push to ECR
echo "   📤 Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

echo -e "${GREEN}✅ Backend image pushed successfully${NC}"
echo ""

cd ..

# ============================================================================
# STEP 2: Update ECS Service
# ============================================================================

echo -e "${BLUE}📦 STEP 2: Updating ECS service...${NC}"

# Force new deployment of ECS service
echo "   🔄 Forcing new deployment..."
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --force-new-deployment \
  --region $AWS_REGION \
  --output json > /dev/null

echo -e "${GREEN}✅ ECS service update initiated${NC}"
echo "   ⏳ Waiting for service to stabilize..."

# Wait for service to become stable
aws ecs wait services-stable \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --region $AWS_REGION

echo -e "${GREEN}✅ ECS service is stable and running new version${NC}"
echo ""

# ============================================================================
# STEP 3: Deploy Frontend to S3
# ============================================================================

echo -e "${BLUE}📦 STEP 3: Building and deploying frontend...${NC}"

# Build frontend
echo "   🔨 Building frontend..."
cd client
cp .env.aws.production .env.production
npm run build

# Sync to S3
echo "   📤 Deploying to S3..."
aws s3 sync dist/ s3://tyriantrade-frontend-bucket --delete

echo -e "${GREEN}✅ Frontend deployed to S3${NC}"
echo ""

cd ..

# ============================================================================
# STEP 4: Invalidate CloudFront Cache
# ============================================================================

echo -e "${BLUE}📦 STEP 4: Invalidating CloudFront cache...${NC}"

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, 'social.tyriantrade.com')]].Id" --output text)

if [ -z "$DISTRIBUTION_ID" ]; then
  echo -e "${YELLOW}⚠️  Could not find CloudFront distribution${NC}"
else
  echo "   Distribution ID: $DISTRIBUTION_ID"
  
  # Create invalidation
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
  
  echo "   Invalidation ID: $INVALIDATION_ID"
  echo -e "${GREEN}✅ CloudFront cache invalidation started${NC}"
fi

echo ""

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ DEPLOYMENT COMPLETED${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "   • Backend image: $IMAGE_TAG"
echo "   • ECS service: Updated and stable"
echo "   • Frontend: Deployed to S3"
echo "   • CloudFront: Cache invalidated"
echo ""
echo "🌐 URLs:"
echo "   • Backend API: https://api.tyriantrade.com"
echo "   • Frontend: https://social.tyriantrade.com"
echo "   • Profile Settings: https://social.tyriantrade.com/profile?tab=profile"
echo ""
echo "📝 Next Steps:"
echo "   1. Test username change on production"
echo "   2. Verify counter works correctly"
echo "   3. Check error messages for 4th change"
echo "   4. Monitor CloudWatch logs for any issues"
echo ""
echo -e "${YELLOW}⚠️  Important: Migration 015 must be completed before testing${NC}"
echo "   Run: ./apply-migration-015-direct.sh (if not already done)"
echo ""
