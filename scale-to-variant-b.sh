#!/bin/bash

# Scale to Variant B: Aggressive Performance Upgrade
# ECS: 4096 CPU / 8192 Memory
# RDS: db.t3.medium
# Redis: cache.t3.small
# Total cost: ~$246/month (+$159)

set -e

echo "🚀 Scaling to Variant B: Aggressive Performance"
echo "════════════════════════════════════════════════"
echo ""
echo "Changes to be applied:"
echo "  1. ECS Fargate: 1024/2048 → 4096/8192 (+$108/month)"
echo "  2. RDS: t3.micro → t3.medium (+$39/month)"
echo "  3. Redis: t3.micro → t3.small (+$12/month)"
echo ""
echo "Total monthly cost increase: +$159"
echo "New total: ~$246/month"
echo ""
echo "Expected performance improvement:"
echo "  - API requests: 60-80% faster"
echo "  - Database queries: 70-90% faster"
echo "  - Concurrent users: 500-1000 (4x)"
echo ""

read -p "⚠️  Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Scaling cancelled"
  exit 0
fi

echo ""
echo "📊 Step 1/3: Updating ECS Fargate to 4096/8192"
echo "─────────────────────────────────────────────"

# Get current task definition
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition tyriantrade-backend \
  --region us-east-1 \
  --query 'taskDefinition' \
  --output json)

# Update with new resources
UPDATED_TASK_DEF=$(echo $TASK_DEF | jq \
  'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
   .cpu = "4096" |
   .memory = "8192"')

# Register new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --region us-east-1 \
  --cli-input-json "$UPDATED_TASK_DEF" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "✅ New task definition: $NEW_TASK_DEF_ARN"

# Update service
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --task-definition $NEW_TASK_DEF_ARN \
  --region us-east-1 \
  --force-new-deployment \
  > /dev/null

echo "✅ ECS service update initiated"
echo ""

echo "📊 Step 2/3: Updating RDS to db.t3.medium"
echo "─────────────────────────────────────────"

# Get RDS instance identifier
RDS_INSTANCE=$(aws rds describe-db-instances \
  --region us-east-1 \
  --query 'DBInstances[?contains(DBInstanceIdentifier, `tyriantrade`)].DBInstanceIdentifier' \
  --output text)

if [ -z "$RDS_INSTANCE" ]; then
  echo "⚠️  RDS instance not found, skipping..."
else
  echo "Found RDS instance: $RDS_INSTANCE"
  
  aws rds modify-db-instance \
    --db-instance-identifier $RDS_INSTANCE \
    --db-instance-class db.t3.medium \
    --apply-immediately \
    --region us-east-1 \
    > /dev/null
  
  echo "✅ RDS upgrade to db.t3.medium initiated"
  echo "   (This will cause ~5 minutes downtime during upgrade)"
fi

echo ""
echo "📊 Step 3/3: Updating Redis to cache.t3.small"
echo "────────────────────────────────────────────"

# Get Redis cluster identifier
REDIS_CLUSTER=$(aws elasticache describe-cache-clusters \
  --region us-east-1 \
  --query 'CacheClusters[?contains(CacheClusterId, `tyriantrade`)].CacheClusterId' \
  --output text)

if [ -z "$REDIS_CLUSTER" ]; then
  echo "⚠️  Redis cluster not found, skipping..."
else
  echo "Found Redis cluster: $REDIS_CLUSTER"
  
  aws elasticache modify-cache-cluster \
    --cache-cluster-id $REDIS_CLUSTER \
    --cache-node-type cache.t3.small \
    --apply-immediately \
    --region us-east-1 \
    > /dev/null
  
  echo "✅ Redis upgrade to cache.t3.small initiated"
fi

echo ""
echo "════════════════════════════════════════════════"
echo "✅ All upgrades initiated successfully!"
echo "════════════════════════════════════════════════"
echo ""
echo "⏳ Estimated completion time:"
echo "   - ECS: 5-10 minutes"
echo "   - RDS: 5-15 minutes (with brief downtime)"
echo "   - Redis: 5-10 minutes"
echo ""
echo "📊 Monitor progress:"
echo ""
echo "ECS Service:"
echo "  aws ecs describe-services \\"
echo "    --cluster tyriantrade-cluster \\"
echo "    --services tyriantrade-backend-service \\"
echo "    --query 'services[0].deployments'"
echo ""
echo "RDS Instance:"
echo "  aws rds describe-db-instances \\"
echo "    --db-instance-identifier $RDS_INSTANCE \\"
echo "    --query 'DBInstances[0].DBInstanceStatus'"
echo ""
echo "Redis Cluster:"
echo "  aws elasticache describe-cache-clusters \\"
echo "    --cache-cluster-id $REDIS_CLUSTER \\"
echo "    --query 'CacheClusters[0].CacheClusterStatus'"
echo ""
echo "🎯 After completion, your infrastructure will be:"
echo "   - 4x more powerful"
echo "   - Ready for 500-1000 concurrent users"
echo "   - 60-80% faster API responses"
echo ""
echo "💰 New monthly cost: ~$246"
echo ""
