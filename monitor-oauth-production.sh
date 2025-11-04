#!/bin/bash

# 🔍 Real-time OAuth monitoring for production
# This script continuously monitors OAuth-related logs

echo "🔍 Starting OAuth monitoring for PRODUCTION..."
echo "================================================"
echo "📍 Environment: AWS ECS Production"
echo "🌐 Backend URL: https://backend.tyriantrade.com"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure'${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ AWS CLI configured${NC}"

# Get the latest ECS task
echo -e "\n${YELLOW}🔍 Getting latest ECS task...${NC}"
TASK_ARN=$(aws ecs list-tasks \
    --cluster tyriantrade-cluster \
    --service-name tyriantrade-backend-service \
    --region us-east-1 \
    --query 'taskArns[0]' \
    --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo -e "${RED}❌ No running tasks found${NC}"
    exit 1
fi

TASK_ID=$(echo $TASK_ARN | cut -d'/' -f3)
echo -e "${GREEN}✅ Found task: ${TASK_ID}${NC}"

echo -e "\n${CYAN}===========================================${NC}"
echo -e "${CYAN}📊 OAUTH TEST URLS:${NC}"
echo -e "${CYAN}===========================================${NC}"
echo -e "${GREEN}Google OAuth:${NC}"
echo -e "  https://x-18.pages.dev/login"
echo -e "\n${GREEN}Apple OAuth:${NC}"
echo -e "  https://x-18.pages.dev/login"
echo -e "\n${YELLOW}💡 Click 'Sign in with Google' or 'Sign in with Apple'${NC}"
echo -e "${CYAN}===========================================${NC}"

echo -e "\n${MAGENTA}🔄 Starting live log monitoring...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Start time for filtering logs (from now)
START_TIME=$(date -u +%s)000

# Function to display logs with color coding
display_logs() {
    local pattern=$1
    local label=$2
    local color=$3
    
    aws logs filter-log-events \
        --log-group-name /ecs/tyriantrade-backend \
        --filter-pattern "$pattern" \
        --start-time $START_TIME \
        --region us-east-1 \
        --query 'events[*].[timestamp,message]' \
        --output text 2>/dev/null | while IFS=$'\t' read -r timestamp message; do
        if [ ! -z "$message" ]; then
            # Convert timestamp to readable format
            readable_time=$(date -d "@$((timestamp/1000))" '+%H:%M:%S' 2>/dev/null || date -r $((timestamp/1000)) '+%H:%M:%S')
            echo -e "${color}[$readable_time] $label:${NC} $message"
        fi
    done
}

# Monitor in a loop
while true; do
    # Check OAuth-related logs
    display_logs "OAuth OR oauth OR /oauth" "OAUTH" "$BLUE"
    
    # Check Apple-specific logs
    display_logs "Apple OR apple" "APPLE" "$MAGENTA"
    
    # Check Google-specific logs  
    display_logs "Google OR google" "GOOGLE" "$CYAN"
    
    # Check callback logs
    display_logs "callback" "CALLBACK" "$YELLOW"
    
    # Check error logs
    display_logs "ERROR OR error OR failed OR panic" "ERROR" "$RED"
    
    # Check success logs
    display_logs "success OR Success OR created user" "SUCCESS" "$GREEN"
    
    # Wait before next check
    sleep 2
    
    # Update start time to only show new logs
    START_TIME=$(date -u +%s)000
done
