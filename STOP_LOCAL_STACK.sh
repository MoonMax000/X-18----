#!/bin/bash

# Скрипт для остановки всех локальных сервисов

echo "🛑 Остановка локального стека"
echo "=============================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Остановка GoToSocial
if [ -f ".gotosocial.pid" ]; then
    GOTOSOCIAL_PID=$(cat .gotosocial.pid)
    echo -e "${YELLOW}Остановка GoToSocial (PID: $GOTOSOCIAL_PID)...${NC}"
    kill $GOTOSOCIAL_PID 2>/dev/null || echo "Процесс уже остановлен"
    rm .gotosocial.pid
else
    echo "Остановка всех процессов GoToSocial..."
    pkill -f "gotosocial.*server start" || true
fi

# Остановка Frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo -e "${YELLOW}Остановка Frontend (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null || echo "Процесс уже остановлен"
    rm .frontend.pid
else
    echo "Остановка всех процессов Vite..."
    pkill -f "vite" || true
fi

# Остановка PostgreSQL контейнера (опционально)
echo -e "${YELLOW}Остановка PostgreSQL контейнера...${NC}"
docker stop gotosocial-postgres 2>/dev/null || echo "Контейнер уже остановлен"

echo ""
echo -e "${GREEN}✅ Все сервисы остановлены${NC}"
echo ""
echo "💡 Для удаления данных PostgreSQL:"
echo "   docker rm gotosocial-postgres"
echo ""
