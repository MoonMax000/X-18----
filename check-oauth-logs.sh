#!/bin/bash

echo "🔍 Checking OAuth callback errors on production..."
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the latest ECS task ARN
echo -e "\n${YELLOW}Getting latest ECS task...${NC}"
TASK_ARN=$(aws ecs list-tasks \
    --cluster tyriantrade-cluster \
    --service-name tyriantrade-backend-service \
    --region us-east-1 \
    --query 'taskArns[0]' \
    --output text)

if [ -z "$TASK_ARN" ]; then
    echo -e "${RED}❌ No running tasks found${NC}"
    exit 1
fi

echo "Task ARN: $TASK_ARN"

# Get container logs
echo -e "\n${YELLOW}📋 Recent OAuth logs:${NC}"
aws logs filter-log-events \
    --log-group-name /ecs/tyriantrade-backend \
    --filter-pattern "OAuth OR oauth OR Apple OR apple OR Google OR google OR callback" \
    --start-time $(date -u -d '5 minutes ago' +%s)000 \
    --region us-east-1 \
    --query 'events[*].message' \
    --output text | tail -50

echo -e "\n${YELLOW}📋 Recent error logs:${NC}"
aws logs filter-log-events \
    --log-group-name /ecs/tyriantrade-backend \
    --filter-pattern "ERROR OR error OR panic OR 500" \
    --start-time $(date -u -d '5 minutes ago' +%s)000 \
    --region us-east-1 \
    --query 'events[*].message' \
    --output text | tail -20

echo -e "\n${YELLOW}💡 Common issues:${NC}"
echo "1. Apple 'Hide My Email' - email might be a proxy address"
echo "2. Apple only sends email on first authorization"
echo "3. Check if id_token is being parsed correctly"
echo "4. Verify APPLE_PRIVATE_KEY_PATH is accessible in container"
