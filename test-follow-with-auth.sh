#!/bin/bash

# Test follow notifications with proper authentication
# This script creates two users, logs them in, and tests follow functionality

API_URL="http://localhost:8080/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Follow Notifications with Authentication ===${NC}\n"

# Step 1: Create User 1
echo -e "${YELLOW}[1/8] Creating User 1...${NC}"
USER1_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1_'$(date +%s)'",
    "email": "testuser1_'$(date +%s)'@test.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User1"
  }')

USER1_TOKEN=$(echo $USER1_RESPONSE | jq -r '.access_token // empty')
if [ -z "$USER1_TOKEN" ] || [ "$USER1_TOKEN" == "null" ]; then
  echo -e "${RED}✗ Failed to create User 1${NC}"
  echo "Response: $USER1_RESPONSE"
  exit 1
fi

USER1_ID=$(echo $USER1_RESPONSE | jq -r '.user.id')
echo -e "${GREEN}✓ User 1 created: ID=$USER1_ID${NC}"
echo "  Token: ${USER1_TOKEN:0:20}..."

# Step 2: Create User 2
echo -e "\n${YELLOW}[2/8] Creating User 2...${NC}"
USER2_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2_'$(date +%s)'",
    "email": "testuser2_'$(date +%s)'@test.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User2"
  }')

USER2_TOKEN=$(echo $USER2_RESPONSE | jq -r '.access_token // empty')
if [ -z "$USER2_TOKEN" ] || [ "$USER2_TOKEN" == "null" ]; then
  echo -e "${RED}✗ Failed to create User 2${NC}"
  echo "Response: $USER2_RESPONSE"
  exit 1
fi

USER2_ID=$(echo $USER2_RESPONSE | jq -r '.user.id')
echo -e "${GREEN}✓ User 2 created: ID=$USER2_ID${NC}"
echo "  Token: ${USER2_TOKEN:0:20}..."

# Step 3: User 1 follows User 2
echo -e "\n${YELLOW}[3/8] User 1 following User 2...${NC}"
FOLLOW_RESPONSE=$(curl -s -X POST "${API_URL}/users/${USER2_ID}/follow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}")

echo "Follow Response: $FOLLOW_RESPONSE"

if echo $FOLLOW_RESPONSE | jq -e '.error' > /dev/null 2>&1; then
  ERROR=$(echo $FOLLOW_RESPONSE | jq -r '.error')
  echo -e "${RED}✗ Follow failed: $ERROR${NC}"
else
  echo -e "${GREEN}✓ Follow successful${NC}"
fi

# Step 4: Wait a moment for database operations
echo -e "\n${YELLOW}[4/8] Waiting for database operations...${NC}"
sleep 2

# Step 5: Check User 2's notifications
echo -e "\n${YELLOW}[5/8] Checking User 2's notifications...${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "${API_URL}/notifications" \
  -H "Authorization: Bearer ${USER2_TOKEN}")

echo "Notifications Response:"
echo $NOTIFICATIONS_RESPONSE | jq '.'

# Count follow notifications
FOLLOW_COUNT=$(echo $NOTIFICATIONS_RESPONSE | jq '[.[] | select(.type == "follow")] | length')
echo -e "\n${BLUE}Follow notifications count: $FOLLOW_COUNT${NC}"

if [ "$FOLLOW_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Follow notification found!${NC}"
  echo $NOTIFICATIONS_RESPONSE | jq '[.[] | select(.type == "follow")][0]'
else
  echo -e "${RED}✗ No follow notifications found${NC}"
fi

# Step 6: Check unread count
echo -e "\n${YELLOW}[6/8] Checking unread count...${NC}"
UNREAD_RESPONSE=$(curl -s -X GET "${API_URL}/notifications/unread-count" \
  -H "Authorization: Bearer ${USER2_TOKEN}")

echo "Unread count: $(echo $UNREAD_RESPONSE | jq '.count')"

# Step 7: User 1 unfollows User 2
echo -e "\n${YELLOW}[7/8] User 1 unfollowing User 2...${NC}"
UNFOLLOW_RESPONSE=$(curl -s -X DELETE "${API_URL}/users/${USER2_ID}/follow" \
  -H "Authorization: Bearer ${USER1_TOKEN}")

echo "Unfollow Response: $UNFOLLOW_RESPONSE"

if echo $UNFOLLOW_RESPONSE | jq -e '.error' > /dev/null 2>&1; then
  ERROR=$(echo $UNFOLLOW_RESPONSE | jq -r '.error')
  echo -e "${RED}✗ Unfollow failed: $ERROR${NC}"
else
  echo -e "${GREEN}✓ Unfollow successful${NC}"
fi

# Step 8: Check backend logs
echo -e "\n${YELLOW}[8/8] Recent backend logs:${NC}"
if [ -f "custom-backend.log" ]; then
  echo -e "${BLUE}Last 30 lines from custom-backend.log:${NC}"
  tail -n 30 custom-backend.log | grep -E "\[Follow|notification|ERROR" || echo "No relevant log entries found"
else
  echo -e "${YELLOW}No custom-backend.log file found${NC}"
fi

echo -e "\n${BLUE}=== Test Complete ===${NC}"
echo -e "\n${BLUE}Summary:${NC}"
echo "  User 1 ID: $USER1_ID"
echo "  User 2 ID: $USER2_ID"
echo "  Follow notifications: $FOLLOW_COUNT"
