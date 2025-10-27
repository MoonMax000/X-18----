#!/bin/bash

echo "🛑 Stopping X-18 Custom Backend Stack..."
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Останавливаем Backend
if [ -f .custom-backend.pid ]; then
    BACKEND_PID=$(cat .custom-backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        sleep 2
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Backend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend not running${NC}"
    fi
    rm .custom-backend.pid
fi

# Останавливаем Frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        sleep 2
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend not running${NC}"
    fi
    rm .frontend.pid
fi

echo ""
echo -e "${GREEN}✅ Stack stopped successfully!${NC}"
echo ""
