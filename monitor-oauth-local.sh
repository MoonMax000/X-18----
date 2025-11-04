#!/bin/bash

# 🔍 Real-time OAuth monitoring for local development
# This script continuously monitors OAuth-related logs

echo "🔍 Starting OAuth monitoring for LOCAL DEVELOPMENT..."
echo "===================================================="
echo "📍 Environment: Local Development"
echo "🌐 Backend URL: http://localhost:8080"
echo "🌐 Frontend URL: http://localhost:5173"
echo "===================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if backend is running
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo -e "${YELLOW}💡 Start it with: ./START_CUSTOM_BACKEND_STACK.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend is running${NC}"

# Check if frontend is running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    echo -e "${YELLOW}💡 It should start with: ./START_CUSTOM_BACKEND_STACK.sh${NC}"
else
    echo -e "${GREEN}✅ Frontend is running${NC}"
fi

# Check if log files exist
if [ ! -f "custom-backend.log" ]; then
    echo -e "${RED}❌ custom-backend.log not found${NC}"
    echo -e "${YELLOW}💡 Make sure backend is started with START_CUSTOM_BACKEND_STACK.sh${NC}"
    exit 1
fi

echo -e "\n${CYAN}===========================================${NC}"
echo -e "${CYAN}📊 OAUTH TEST URLS:${NC}"
echo -e "${CYAN}===========================================${NC}"
echo -e "${GREEN}Local Frontend (OAuth):${NC}"
echo -e "  http://localhost:5173/login"
echo -e "\n${GREEN}Backend OAuth Endpoints:${NC}"
echo -e "  Google: http://localhost:8080/oauth/google"
echo -e "  Apple:  http://localhost:8080/oauth/apple"
echo -e "\n${YELLOW}💡 Click 'Sign in with Google' or 'Sign in with Apple'${NC}"
echo -e "${CYAN}===========================================${NC}"

echo -e "\n${MAGENTA}🔄 Starting live log monitoring...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Get current position in log file
LAST_LINE=$(wc -l < custom-backend.log)

# Function to highlight OAuth-related lines
highlight_line() {
    local line=$1
    local timestamp=$(date '+%H:%M:%S')
    
    # Color code based on content
    if echo "$line" | grep -iq "error\|failed\|panic"; then
        echo -e "${RED}[$timestamp] ERROR:${NC} $line"
    elif echo "$line" | grep -iq "oauth\|/oauth"; then
        echo -e "${BLUE}[$timestamp] OAUTH:${NC} $line"
    elif echo "$line" | grep -iq "apple"; then
        echo -e "${MAGENTA}[$timestamp] APPLE:${NC} $line"
    elif echo "$line" | grep -iq "google"; then
        echo -e "${CYAN}[$timestamp] GOOGLE:${NC} $line"
    elif echo "$line" | grep -iq "callback"; then
        echo -e "${YELLOW}[$timestamp] CALLBACK:${NC} $line"
    elif echo "$line" | grep -iq "success\|created user\|token generated"; then
        echo -e "${GREEN}[$timestamp] SUCCESS:${NC} $line"
    elif echo "$line" | grep -iq "jwt\|token"; then
        echo -e "${BLUE}[$timestamp] AUTH:${NC} $line"
    fi
}

# Monitor backend log in real-time
tail -f custom-backend.log | while read line; do
    # Filter for OAuth-related content
    if echo "$line" | grep -iq "oauth\|apple\|google\|callback\|error\|success\|jwt\|token\|/oauth"; then
        highlight_line "$line"
    fi
done
