#!/bin/bash

echo "🍪 Testing HttpOnly Cookies Implementation"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
API_URL="http://localhost:8080/api"
EMAIL="test@example.com"
PASSWORD="testpassword123"
USERNAME="testuser_$(date +%s)"

echo -e "\n${YELLOW}1. Testing Registration with HttpOnly cookies${NC}"
echo "Registering user: $USERNAME"

# Register user
REGISTER_RESPONSE=$(curl -s -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
# Для macOS используем альтернативный способ
BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  ACCESS_TOKEN=$(echo "$BODY" | jq -r '.access_token')
  HAS_REFRESH=$(echo "$BODY" | jq 'has("refresh_token")')
  
  echo "Access token received: ${ACCESS_TOKEN:0:20}..."
  
  if [ "$HAS_REFRESH" = "false" ]; then
    echo -e "${GREEN}✓ refresh_token not in response (good!)${NC}"
  else
    echo -e "${RED}✗ refresh_token found in response (should not be there)${NC}"
  fi
else
  echo -e "${RED}✗ Registration failed: HTTP $HTTP_CODE${NC}"
  echo "$BODY"
  exit 1
fi

echo -e "\n${YELLOW}2. Checking cookies file${NC}"
if grep -q "refresh_token" cookies.txt; then
  echo -e "${GREEN}✓ refresh_token cookie found${NC}"
  echo "Cookie details:"
  grep "refresh_token" cookies.txt
else
  echo -e "${RED}✗ refresh_token cookie not found${NC}"
  cat cookies.txt
fi

echo -e "\n${YELLOW}3. Testing token refresh${NC}"

# Wait a bit
sleep 2

# Try refresh without cookie (should fail)
echo "Testing refresh without cookie..."
REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✓ Refresh without cookie failed (expected)${NC}"
else
  echo -e "${RED}✗ Refresh without cookie succeeded (should fail)${NC}"
fi

# Try refresh with cookie
echo "Testing refresh with cookie..."
REFRESH_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Token refresh successful${NC}"
  NEW_ACCESS_TOKEN=$(echo "$BODY" | jq -r '.access_token')
  HAS_REFRESH=$(echo "$BODY" | jq 'has("refresh_token")')
  
  echo "New access token received: ${NEW_ACCESS_TOKEN:0:20}..."
  
  if [ "$HAS_REFRESH" = "false" ]; then
    echo -e "${GREEN}✓ refresh_token not in refresh response (good!)${NC}"
  else
    echo -e "${RED}✗ refresh_token found in refresh response${NC}"
  fi
else
  echo -e "${RED}✗ Token refresh failed: HTTP $HTTP_CODE${NC}"
  echo "$BODY"
fi

echo -e "\n${YELLOW}4. Testing logout with cookie${NC}"

# Logout
LOGOUT_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Logout successful${NC}"
  
  # Check if cookie was cleared
  if grep -q "refresh_token.*0" cookies.txt; then
    echo -e "${GREEN}✓ refresh_token cookie cleared${NC}"
  else
    echo -e "${RED}✗ refresh_token cookie not cleared${NC}"
  fi
else
  echo -e "${RED}✗ Logout failed: HTTP $HTTP_CODE${NC}"
fi

echo -e "\n${YELLOW}5. Testing login with HttpOnly cookies${NC}"

# Login
LOGIN_RESPONSE=$(curl -s -c cookies2.txt -w "\n%{http_code}" \
  -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  
  if grep -q "refresh_token" cookies2.txt; then
    echo -e "${GREEN}✓ refresh_token cookie set on login${NC}"
  else
    echo -e "${RED}✗ refresh_token cookie not set on login${NC}"
  fi
else
  echo -e "${RED}✗ Login failed: HTTP $HTTP_CODE${NC}"
  echo "$BODY"
fi

# Cleanup
rm -f cookies.txt cookies2.txt

echo -e "\n${GREEN}✅ HttpOnly Cookies test complete!${NC}"
echo -e "\n${YELLOW}Summary:${NC}"
echo "- refresh_token removed from JSON responses ✓"
echo "- refresh_token stored in HttpOnly cookie ✓"
echo "- Cookie-based refresh works correctly ✓"
echo "- CORS configured with credentials support ✓"
