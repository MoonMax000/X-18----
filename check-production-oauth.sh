#!/bin/bash

echo "🔍 Checking OAuth Production Configuration..."
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we can access the production API
echo -e "\n1. Checking API availability:"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.tyriantrade.com/health)
if [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ API is accessible${NC}"
else
    echo -e "${RED}✗ API returned status: $API_RESPONSE${NC}"
fi

# Check Google OAuth endpoint
echo -e "\n2. Checking Google OAuth endpoint:"
GOOGLE_RESPONSE=$(curl -s -w "\n%{http_code}" https://api.tyriantrade.com/api/auth/google)
GOOGLE_CODE=$(echo "$GOOGLE_RESPONSE" | tail -n 1)
GOOGLE_BODY=$(echo "$GOOGLE_RESPONSE" | sed '$d')

if [ "$GOOGLE_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Google OAuth endpoint is working${NC}"
    echo "Response: $GOOGLE_BODY"
else
    echo -e "${RED}✗ Google OAuth returned status: $GOOGLE_CODE${NC}"
    echo "Error: $GOOGLE_BODY"
fi

# Check Apple OAuth endpoint
echo -e "\n3. Checking Apple OAuth endpoint:"
APPLE_RESPONSE=$(curl -s -w "\n%{http_code}" https://api.tyriantrade.com/api/auth/apple)
APPLE_CODE=$(echo "$APPLE_RESPONSE" | tail -n 1)
APPLE_BODY=$(echo "$APPLE_RESPONSE" | sed '$d')

if [ "$APPLE_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Apple OAuth endpoint is working${NC}"
    echo "Response: $APPLE_BODY"
else
    echo -e "${RED}✗ Apple OAuth returned status: $APPLE_CODE${NC}"
    echo "Error: $APPLE_BODY"
fi

echo -e "\n============================================"
echo "📋 Production OAuth Checklist:"
echo "============================================"
echo ""
echo "1. Environment Variables (check on server):"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - GOOGLE_REDIRECT_URL=https://api.tyriantrade.com/api/auth/google/callback"
echo ""
echo "   - APPLE_CLIENT_ID=com.tyriantrade.web"
echo "   - APPLE_TEAM_ID"
echo "   - APPLE_KEY_ID"
echo "   - APPLE_PRIVATE_KEY_PATH=/path/to/AuthKey_XXX.p8"
echo "   - APPLE_REDIRECT_URL=https://api.tyriantrade.com/api/auth/apple/callback"
echo ""
echo "2. Files on Server:"
echo "   - Apple private key .p8 file exists and readable"
echo "   - Correct file permissions (600)"
echo ""
echo "3. CORS Configuration:"
echo "   - CORS_ORIGIN includes https://social.tyriantrade.com"
echo ""
echo "4. Check Backend Logs:"
echo "   - SSH to server and run: docker logs custom-backend --tail 100"
echo "   - Look for OAuth initialization messages"
echo "   - Check for error messages when accessing OAuth endpoints"
echo ""
echo "5. Apple Developer Console:"
echo "   - Services ID configured with domain: api.tyriantrade.com"
echo "   - Return URL: https://api.tyriantrade.com/api/auth/apple/callback"
echo ""
echo "6. Google Console:"
echo "   - Authorized redirect URI: https://api.tyriantrade.com/api/auth/google/callback"
