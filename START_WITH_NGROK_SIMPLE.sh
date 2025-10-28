#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск X-18 через ngrok (упрощённый режим)${NC}"
echo "=================================="

# Проверка установки ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok не установлен${NC}"
    echo "Установите ngrok: https://ngrok.com/download"
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

# 1. Запуск Custom Backend локально
echo -e "\n${BLUE}📦 Запуск Custom Backend (локально)...${NC}"
cd custom-backend
if [ ! -f "server" ]; then
    echo -e "${YELLOW}⚙️  Компиляция бэкенда...${NC}"
    go build -o server cmd/server/main.go
fi
./server > ../custom-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.custombackend.pid
cd ..
echo -e "${GREEN}✅ Backend запущен локально (PID: $BACKEND_PID)${NC}"
echo -e "   URL: http://localhost:8080"

# Ждем запуска бэкенда
sleep 3

# 2. Настраиваем .env для локального бэкенда
echo -e "\n${BLUE}⚙️  Настройка конфигурации...${NC}"
cat > .env << EOF
VITE_CUSTOM_BACKEND_URL=http://localhost:8080
VITE_GOTOSOCIAL_URL=http://localhost:8082
EOF
echo -e "${GREEN}✅ Конфигурация обновлена${NC}"

# 3. Запуск Frontend
echo -e "\n${BLUE}🎨 Запуск Frontend (Vite)...${NC}"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid
echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"
echo -e "   Локальный URL: http://localhost:5173"

# Ждем запуска фронтенда
sleep 5

# 4. Запуск ngrok только для фронтенда
echo -e "\n${BLUE}🌐 Запуск ngrok для фронтенда (порт 5173)...${NC}"
ngrok http 5173 --log=stdout > ngrok-frontend.log 2>&1 &
NGROK_PID=$!
sleep 3

# Получаем URL фронтенда
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://.*' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Не удалось получить ngrok URL${NC}"
    echo -e "${YELLOW}Проверьте логи: tail -f ngrok-frontend.log${NC}"
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
echo -e "${YELLOW}⚠️  Важно: Сайт работает с вашего компьютера${NC}"
echo -e "${YELLOW}   Backend доступен только локально (localhost:8080)${NC}"
echo -e "${YELLOW}   Это нормально для тестирования!${NC}"
echo ""
echo -e "${BLUE}🔧 Локальные адреса:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8080"
echo ""
echo -e "${BLUE}📊 Панель управления ngrok:${NC}"
echo "   http://localhost:4040"
echo ""
echo -e "${BLUE}📝 Логи:${NC}"
echo "   Frontend: tail -f frontend.log"
echo "   Backend:  tail -f custom-backend.log"
echo "   ngrok:    tail -f ngrok-frontend.log"
echo ""
echo -e "${RED}⚠️  Нажмите Ctrl+C для остановки всех сервисов${NC}"
echo ""

# Сохраняем URL в файл
cat > NGROK_URLS.txt << EOF
=================================
🌐 NGROK URL для X-18
=================================

Frontend (Сайт):
${FRONTEND_URL}

Backend:
http://localhost:8080 (только локально)

Панель управления:
http://localhost:4040

=================================
Режим: Упрощённый (один тоннель)
Запущено: $(date)
=================================

Примечание:
- Сайт доступен из интернета
- Backend работает локально
- Для полноценной работы используйте Railway/Netlify
=================================
EOF

echo -e "${GREEN}✅ URL сохранён в файл: NGROK_URLS.txt${NC}"
echo ""

# Бесконечный цикл для поддержания работы
while true; do
    sleep 1
done
