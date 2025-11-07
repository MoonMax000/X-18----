#!/bin/bash

# Update ECS Task Definition to Production Resources (1024 CPU / 2048 Memory)
# This implements Option 3 from BACKEND_OPTIMIZATION_GUIDE.md

set -e

echo "🚀 Updating ECS Task Definition to Production Resources..."
echo ""

# Configuration
CLUSTER_NAME="tyriantrade-cluster"
SERVICE_NAME="tyriantrade-backend-service"
TASK_FAMILY="tyriantrade-backend"
REGION="us-east-1"

# New resource configuration
NEW_CPU="1024"      # 1 vCPU
NEW_MEMORY="2048"   # 2 GB

echo "📋 Configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  Task Family: $TASK_FAMILY"
echo "  New CPU: $NEW_CPU (1 vCPU)"
echo "  New Memory: $NEW_MEMORY MB (2 GB)"
echo ""

# Get current task definition
echo "⬇️  Downloading current task definition..."
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition $TASK_FAMILY \
  --region $REGION \
  --query 'taskDefinition' \
  --output json)

# Check if task definition was retrieved
if [ -z "$TASK_DEF" ] || [ "$TASK_DEF" == "null" ]; then
  echo "❌ Failed to retrieve task definition"
  exit 1
fi

echo "✅ Current task definition retrieved"
echo ""

# Extract current values for comparison
CURRENT_CPU=$(echo $TASK_DEF | jq -r '.cpu // "256"')
CURRENT_MEMORY=$(echo $TASK_DEF | jq -r '.memory // "512"')

echo "📊 Current Resources:"
echo "  CPU: $CURRENT_CPU"
echo "  Memory: $CURRENT_MEMORY MB"
echo ""

# Create updated task definition
echo "🔧 Creating updated task definition..."
UPDATED_TASK_DEF=$(echo $TASK_DEF | jq \
  --arg cpu "$NEW_CPU" \
  --arg memory "$NEW_MEMORY" \
  'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
   .cpu = $cpu |
   .memory = $memory')

# Save to temporary file for review
echo "$UPDATED_TASK_DEF" > /tmp/updated-task-def.json
echo "✅ Updated task definition created (saved to /tmp/updated-task-def.json)"
echo ""

# Show the changes
echo "📝 Changes to be applied:"
echo "  CPU: $CURRENT_CPU → $NEW_CPU (+$(($NEW_CPU - $CURRENT_CPU)))"
echo "  Memory: $CURRENT_MEMORY MB → $NEW_MEMORY MB (+$(($NEW_MEMORY - $CURRENT_MEMORY)) MB)"
echo ""

# Calculate cost increase (approximate)
COST_INCREASE=$(echo "scale=2; (($NEW_CPU - $CURRENT_CPU) * 0.04048 + ($NEW_MEMORY - $CURRENT_MEMORY) * 0.004445) * 730 / 1024" | bc)
echo "💰 Estimated monthly cost increase: ~\$${COST_INCREASE}"
echo "   (Based on us-east-1 Fargate pricing: \$0.04048/vCPU-hour, \$0.004445/GB-hour)"
echo ""

# Ask for confirmation
read -p "⚠️  Do you want to proceed with these changes? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Update cancelled"
  exit 0
fi

echo ""
echo "📤 Registering new task definition..."

# Register new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --region $REGION \
  --cli-input-json "$UPDATED_TASK_DEF" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

if [ -z "$NEW_TASK_DEF_ARN" ] || [ "$NEW_TASK_DEF_ARN" == "None" ]; then
  echo "❌ Failed to register new task definition"
  exit 1
fi

echo "✅ New task definition registered: $NEW_TASK_DEF_ARN"
echo ""

# Update service with new task definition
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $NEW_TASK_DEF_ARN \
  --region $REGION \
  --force-new-deployment \
  > /dev/null

echo "✅ Service update initiated"
echo ""

# Wait for service to stabilize
echo "⏳ Waiting for service to stabilize (this may take 5-10 minutes)..."
echo "   Press Ctrl+C to stop waiting (service will continue updating in background)"
echo ""

aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION

echo ""
echo "✅ Service update complete!"
echo ""

# Show final status
echo "📊 Final Status:"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].[deployments[0].status, deployments[0].runningCount, deployments[0].desiredCount]' \
  --output table

echo ""
echo "🎉 ECS Task Definition successfully updated to production resources!"
echo ""
echo "Next steps:"
echo "1. Monitor your backend logs: ./monitor-logs-production.sh"
echo "2. Test your application thoroughly"
echo "3. Set up CloudWatch alarms (see BACKEND_OPTIMIZATION_GUIDE.md)"
echo "4. Configure Blue-Green deployment (see BACKEND_OPTIMIZATION_GUIDE.md)"
echo ""
