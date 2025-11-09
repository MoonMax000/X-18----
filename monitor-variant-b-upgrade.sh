#!/bin/bash

# Monitor Variant B Upgrade Progress
# Checks status of ECS, RDS, and Redis upgrades

echo "🔍 Monitoring Variant B Upgrade Progress"
echo "========================================"
echo ""

# Check ECS Service
echo "📊 ECS Service Status:"
echo "─────────────────────"
ECS_STATUS=$(aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --region us-east-1 \
  --query 'services[0]' \
  --output json 2>/dev/null)

if [ $? -eq 0 ]; then
  CURRENT_TASK_DEF=$(echo "$ECS_STATUS" | jq -r '.taskDefinition' | grep -o '[0-9]*$')
  DESIRED_COUNT=$(echo "$ECS_STATUS" | jq -r '.desiredCount')
  RUNNING_COUNT=$(echo "$ECS_STATUS" | jq -r '.runningCount')
  PENDING_COUNT=$(echo "$ECS_STATUS" | jq -r '.pendingCount')
  
  echo "Current Task Definition: revision $CURRENT_TASK_DEF"
  echo "Desired: $DESIRED_COUNT | Running: $RUNNING_COUNT | Pending: $PENDING_COUNT"
  
  # Check if upgraded to revision 128
  if [ "$CURRENT_TASK_DEF" -ge "128" ]; then
    echo "✅ ECS upgraded to 4096/8192"
  else
    echo "⏳ ECS upgrade in progress..."
  fi
else
  echo "⚠️  Failed to get ECS status"
fi

echo ""

# Check RDS Instance
echo "📊 RDS Instance Status:"
echo "──────────────────────"
RDS_INSTANCE=$(aws rds describe-db-instances \
  --region us-east-1 \
  --query 'DBInstances[?contains(DBInstanceIdentifier, `tyriantrade`)]' \
  --output json 2>/dev/null | jq -r '.[0]')

if [ "$RDS_INSTANCE" != "null" ] && [ -n "$RDS_INSTANCE" ]; then
  RDS_ID=$(echo "$RDS_INSTANCE" | jq -r '.DBInstanceIdentifier')
  RDS_CLASS=$(echo "$RDS_INSTANCE" | jq -r '.DBInstanceClass')
  RDS_STATUS=$(echo "$RDS_INSTANCE" | jq -r '.DBInstanceStatus')
  
  echo "Instance: $RDS_ID"
  echo "Class: $RDS_CLASS"
  echo "Status: $RDS_STATUS"
  
  if [ "$RDS_CLASS" == "db.t3.medium" ]; then
    echo "✅ RDS upgraded to db.t3.medium"
  else
    echo "⏳ RDS upgrade in progress or not started..."
  fi
else
  echo "⚠️  RDS instance not found"
fi

echo ""

# Check Redis Cluster
echo "📊 Redis Cluster Status:"
echo "───────────────────────"
REDIS_CLUSTER=$(aws elasticache describe-cache-clusters \
  --region us-east-1 \
  --query 'CacheClusters[?contains(CacheClusterId, `tyriantrade`)]' \
  --output json 2>/dev/null | jq -r '.[0]')

if [ "$REDIS_CLUSTER" != "null" ] && [ -n "$REDIS_CLUSTER" ]; then
  REDIS_ID=$(echo "$REDIS_CLUSTER" | jq -r '.CacheClusterId')
  REDIS_TYPE=$(echo "$REDIS_CLUSTER" | jq -r '.CacheNodeType')
  REDIS_STATUS=$(echo "$REDIS_CLUSTER" | jq -r '.CacheClusterStatus')
  
  echo "Cluster: $REDIS_ID"
  echo "Type: $REDIS_TYPE"
  echo "Status: $REDIS_STATUS"
  
  if [ "$REDIS_TYPE" == "cache.t3.small" ]; then
    echo "✅ Redis upgraded to cache.t3.small"
  else
    echo "⏳ Redis upgrade in progress or not started..."
  fi
else
  echo "⚠️  Redis cluster not found"
fi

echo ""
echo "========================================"
echo "🔄 Run this script again to check progress"
echo "💡 Upgrades typically take 5-15 minutes"
