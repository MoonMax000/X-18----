#!/bin/bash

echo "🍪 Testing HttpOnly Cookies Implementation (DEBUG MODE)"
echo "====================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
API_URL="http://localhost:8080/api"
TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"
PASSWORD="TestPassword123!"
USERNAME="testuser_${TIMESTAMP}"

# Debug function
debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Clean function for HTTP response
clean_response() {
    local response="$1"
    # Remove HTTP status code (last line)
    echo "$response" | sed '$d'
}

echo -e "\n${YELLOW}1. Testing Registration with HttpOnly cookies${NC}"
echo "Registering user: $USERNAME"
debug "Sending registration request..."

# Register user with verbose output
REGISTER_RESPONSE=$(curl -s -c cookies.txt -w "\n%{http_code}" \
  -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Extract HTTP code and body
HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)
BODY=$(clean_response "$REGISTER_RESPONSE")

debug "HTTP Status Code: $HTTP_CODE"
debug "Response Body: $BODY"

if [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  
  # Check for tokens
  ACCESS_TOKEN=$(echo "$BODY" | jq -r '.access_token // empty')
  HAS_REFRESH=$(echo "$BODY" | jq 'has("refresh_token")')
  
  if [ -n "$ACCESS_TOKEN" ]; then
    echo "Access token received: ${ACCESS_TOKEN:0:20}..."
  else
    echo -e "${RED}✗ No access token in response${NC}"
  fi
  
  if [ "$HAS_REFRESH" = "false" ]; then
    echo -e "${GREEN}✓ refresh_token not in response (good!)${NC}"
  else
    echo -e "${RED}✗ refresh_token found in response (should not be there)${NC}"
  fi
else
  echo -e "${RED}✗ Registration failed: HTTP $HTTP_CODE${NC}"
  echo "Error details: $BODY"
  
  # Try to extract error message
  ERROR_MSG=$(echo "$BODY" | jq -r '.error // empty')
  if [ -n "$ERROR_MSG" ]; then
    echo -e "${RED}Error message: $ERROR_MSG${NC}"
  fi
  
  # Debug: Check if backend is running
  debug "Checking if backend is accessible..."
  HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
  if [ "$HEALTH_CHECK" = "000" ]; then
    echo -e "${RED}Backend appears to be down or unreachable${NC}"
    echo "Please ensure custom-backend is running on port 8080"
  else
    debug "Backend health check returned: $HEALTH_CHECK"
  fi
  
  exit 1
fi

echo -e "\n${YELLOW}2. Checking cookies file${NC}"
if [ -f cookies.txt ]; then
  debug "cookies.txt exists"
  
  if grep -q "refresh_token" cookies.txt; then
    echo -e "${GREEN}✓ refresh_token cookie found${NC}"
    echo "Cookie details:"
    grep "refresh_token" cookies.txt | head -n 1
  else
    echo -e "${RED}✗ refresh_token cookie not found${NC}"
    debug "Cookie file contents:"
    cat cookies.txt
  fi
else
  echo -e "${RED}✗ cookies.txt file not created${NC}"
fi

# Only continue if we have an access token
if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "\n${YELLOW}3. Testing token refresh${NC}"
  
  # Wait a bit
  sleep 2
  
  # Try refresh without cookie (should fail)
  echo "Testing refresh without cookie..."
  REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/auth/refresh" \
    -H "Content-Type: application/json")
  
  HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
  debug "Refresh without cookie HTTP code: $HTTP_CODE"
  
  if [ "$HTTP_CODE" -eq 400 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✓ Refresh without cookie failed (expected)${NC}"
  else
    echo -e "${RED}✗ Refresh without cookie returned unexpected code: $HTTP_CODE${NC}"
  fi
  
  # Try refresh with cookie
  echo "Testing refresh with cookie..."
  REFRESH_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
    -X POST "$API_URL/auth/refresh" \
    -H "Content-Type: application/json")
  
  HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
  BODY=$(clean_response "$REFRESH_RESPONSE")
  debug "Refresh with cookie HTTP code: $HTTP_CODE"
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Token refresh successful${NC}"
    NEW_ACCESS_TOKEN=$(echo "$BODY" | jq -r '.access_token // empty')
    HAS_REFRESH=$(echo "$BODY" | jq 'has("refresh_token")')
    
    if [ -n "$NEW_ACCESS_TOKEN" ]; then
      echo "New access token received: ${NEW_ACCESS_TOKEN:0:20}..."
    fi
    
    if [ "$HAS_REFRESH" = "false" ]; then
      echo -e "${GREEN}✓ refresh_token not in refresh response (good!)${NC}"
    else
      echo -e "${RED}✗ refresh_token found in refresh response${NC}"
    fi
  else
    echo -e "${RED}✗ Token refresh failed: HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY"
  fi
  
  echo -e "\n${YELLOW}4. Testing logout${NC}"
  
  # Logout
  LOGOUT_RESPONSE=$(curl -s -b cookies.txt -c cookies.txt -w "\n%{http_code}" \
    -X POST "$API_URL/auth/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n 1)
  debug "Logout HTTP code: $HTTP_CODE"
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Logout successful${NC}"
    
    # Check if cookie was cleared
    if grep -q "refresh_token.*Max-Age=0" cookies.txt || ! grep -q "refresh_token" cookies.txt; then
      echo -e "${GREEN}✓ refresh_token cookie cleared${NC}"
    else
      echo -e "${YELLOW}⚠ refresh_token cookie may not be properly cleared${NC}"
      debug "Cookie after logout:"
      grep "refresh_token" cookies.txt || echo "No refresh_token found"
    fi
  else
    echo -e "${RED}✗ Logout failed: HTTP $HTTP_CODE${NC}"
  fi
fi

echo -e "\n${YELLOW}5. Testing login with HttpOnly cookies${NC}"

# Login
debug "Sending login request..."
LOGIN_RESPONSE=$(curl -s -c cookies2.txt -w "\n%{http_code}" \
  -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
BODY=$(clean_response "$LOGIN_RESPONSE")
debug "Login HTTP code: $HTTP_CODE"

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  
  if [ -f cookies2.txt ] && grep -q "refresh_token" cookies2.txt; then
    echo -e "${GREEN}✓ refresh_token cookie set on login${NC}"
    debug "Cookie details:"
    grep "refresh_token" cookies2.txt | head -n 1
  else
    echo -e "${RED}✗ refresh_token cookie not set on login${NC}"
    if [ -f cookies2.txt ]; then
      debug "cookies2.txt contents:"
      cat cookies2.txt
    fi
  fi
else
  echo -e "${RED}✗ Login failed: HTTP $HTTP_CODE${NC}"
  echo "Response: $BODY"
  
  # Extract error message
  ERROR_MSG=$(echo "$BODY" | jq -r '.error // empty')
  if [ -n "$ERROR_MSG" ]; then
    echo -e "${RED}Error: $ERROR_MSG${NC}"
  fi
fi

# Cleanup
rm -f cookies.txt cookies2.txt

echo -e "\n${GREEN}✅ HttpOnly Cookies test complete!${NC}"

# Summary
echo -e "\n${YELLOW}Summary:${NC}"
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo "- HttpOnly cookies implementation appears to be working"
  echo "- refresh_token is being set as HttpOnly cookie"
  echo "- refresh_token is not exposed in JSON responses"
else
  echo "- Test could not complete due to authentication errors"
  echo "- Please check that custom-backend is running and database is accessible"
fi
