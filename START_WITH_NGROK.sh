#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск X-18 через ngrok${NC}"
echo "=================================="

# Проверка установки ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok не установлен${NC}"
    echo "Установите ngrok: https://ngrok.com/download"
    exit 1
fi

# Проверка авторизации ngrok
if ! ngrok config check &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok не авторизован${NC}"
    echo "Выполните: ngrok authtoken YOUR_TOKEN"
    echo "Токен можно найти на: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

# Функция для остановки всех процессов при выходе
cleanup() {
    echo -e "\n${YELLOW}🛑 Остановка всех сервисов...${NC}"
    
    # Остановка ngrok
    pkill -f "ngrok http"
    
    # Остановка процессов
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null
        rm .frontend.pid
    fi
    
    if [ -f .custombackend.pid ]; then
        kill $(cat .custombackend.pid) 2>/dev/null
        rm .custombackend.pid
    fi
    
    echo -e "${GREEN}✅ Все сервисы остановлены${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Запуск Custom Backend
echo -e "\n${BLUE}📦 Запуск Custom Backend...${NC}"
cd custom-backend
if [ ! -f "server" ]; then
    echo -e "${YELLOW}⚙️  Компиляция бэкенда...${NC}"
    go build -o server cmd/server/main.go
fi
./server > ../custom-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.custombackend.pid
cd ..
echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"

# Ждем запуска бэкенда
sleep 3

# 2. Запуск ngrok для бэкенда
echo -e "\n${BLUE}🌐 Запуск ngrok для бэкенда (порт 8080)...${NC}"
ngrok http 8080 --log=stdout > ngrok-backend.log 2>&1 &
NGROK_BACKEND_PID=$!
sleep 2

# Получаем URL бэкенда
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://.*' | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Не удалось получить ngrok URL для бэкенда${NC}"
    cleanup
fi

echo -e "${GREEN}✅ Backend ngrok URL: ${BACKEND_URL}${NC}"

# 3. Обновляем .env с новым backend URL
echo -e "\n${BLUE}⚙️  Обновление конфигурации фронтенда...${NC}"
cat > .env << EOF
VITE_CUSTOM_BACKEND_URL=${BACKEND_URL}
VITE_GOTOSOCIAL_URL=http://localhost:8082
EOF
echo -e "${GREEN}✅ Конфигурация обновлена${NC}"

# 4. Запуск Frontend
echo -e "\n${BLUE}🎨 Запуск Frontend (Vite)...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid
echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"

# Ждем запуска фронтенда
sleep 5

# 5. Запуск ngrok для фронтенда
echo -e "\n${BLUE}🌐 Запуск ngrok для фронтенда (порт 5173)...${NC}"
ngrok http 5173 --log=stdout > ngrok-frontend.log 2>&1 &
NGROK_FRONTEND_PID=$!
sleep 2

# Получаем URL фронтенда
FRONTEND_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://.*' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Не удалось получить ngrok URL для фронтенда${NC}"
    cleanup
fi

# Вывод информации
echo ""
echo "=================================="
echo -e "${GREEN}✅ Все сервисы запущены!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📱 Ваш сайт доступен по адресу:${NC}"
echo -e "${GREEN}   ${FRONTEND_URL}${NC}"
echo ""
echo -e "${BLUE}🔧 Backend API доступен по адресу:${NC}"
echo -e "${GREEN}   ${BACKEND_URL}${NC}"
echo ""
echo -e "${BLUE}📊 Панели управления ngrok:${NC}"
echo "   Frontend: http://localhost:4041"
echo "   Backend:  http://localhost:4040"
echo ""
echo -e "${YELLOW}💡 Совет: Откройте эти URL в браузере для мониторинга запросов${NC}"
echo ""
echo -e "${BLUE}📝 Логи:${NC}"
echo "   Frontend: tail -f frontend.log"
echo "   Backend:  tail -f custom-backend.log"
echo "   ngrok Frontend: tail -f ngrok-frontend.log"
echo "   ngrok Backend:  tail -f ngrok-backend.log"
echo ""
echo -e "${RED}⚠️  Нажмите Ctrl+C для остановки всех сервисов${NC}"
echo ""

# Сохраняем URL в файл
cat > NGROK_URLS.txt << EOF
=================================
🌐 NGROK URLs для X-18
=================================

Frontend (Сайт):
${FRONTEND_URL}

Backend API:
${BACKEND_URL}

Панели управления:
Frontend ngrok: http://localhost:4041
Backend ngrok:  http://localhost:4040

=================================
Запущено: $(date)
=================================
EOF

echo -e "${GREEN}✅ URL сохранены в файл: NGROK_URLS.txt${NC}"
echo ""

# Бесконечный цикл для поддержания работы
while true; do
    sleep 1
done
