#!/bin/bash
set -e

echo "🚀 Deploying migration fix for News and VerificationCode tables..."

# Variables
AWS_REGION="us-east-1"
ECR_REGISTRY="506675684508.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPOSITORY="tyriantrade-backend"
IMAGE_TAG="migration-fix-$(date +%Y%m%d-%H%M%S)"
CLUSTER_NAME="tyriantrade-cluster"
SERVICE_NAME="tyriantrade-backend-service"

echo "📦 Building Docker image..."
cd custom-backend
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} .

echo "🔑 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo "🏷️  Tagging image..."
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest

echo "⬆️  Pushing image to ECR..."
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest

echo "📝 Updating ECS service..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment \
  --region ${AWS_REGION}

echo "✅ Deployment initiated!"
echo "🔍 Monitor deployment: aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --region ${AWS_REGION}"
echo "📊 Check logs: aws logs tail /ecs/tyriantrade-backend --follow --region ${AWS_REGION}"
