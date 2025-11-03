#!/bin/bash

echo "🚀 Starting X-18 Custom Backend Stack..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка PostgreSQL
echo -e "${YELLOW}📊 Checking PostgreSQL...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo "Please start PostgreSQL first:"
    echo "  brew services start postgresql@15"
    echo "  or: pg_ctl -D /usr/local/var/postgres start"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Проверка Redis
echo -e "${YELLOW}📦 Checking Redis...${NC}"
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${RED}❌ Redis is not running!${NC}"
    echo "Please start Redis first:"
    echo "  brew services start redis"
    echo "  or: redis-server"
    exit 1
fi
echo -e "${GREEN}✅ Redis is running${NC}"
echo ""

# Создаем БД если не существует
echo -e "${YELLOW}🗄️  Creating database if not exists...${NC}"
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'x18_backend'" | grep -q 1 || psql -h localhost -U postgres -c "CREATE DATABASE x18_backend"
echo -e "${GREEN}✅ Database ready${NC}"
echo ""

# Создаем storage директорию
mkdir -p custom-backend/storage/media
echo -e "${GREEN}✅ Storage directory created${NC}"
echo ""

# Останавливаем предыдущие процессы если есть
if [ -f .custom-backend.pid ]; then
    OLD_PID=$(cat .custom-backend.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Stopping previous backend (PID: $OLD_PID)...${NC}"
        kill $OLD_PID 2>/dev/null
        sleep 2
    fi
    rm .custom-backend.pid
fi

if [ -f .frontend.pid ]; then
    OLD_PID=$(cat .frontend.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Stopping previous frontend (PID: $OLD_PID)...${NC}"
        kill $OLD_PID 2>/dev/null
        sleep 2
    fi
    rm .frontend.pid
fi

# Запускаем Backend
echo -e "${YELLOW}🔧 Starting Custom Backend...${NC}"
cd custom-backend

# Проверяем go.mod
if [ ! -f "go.mod" ]; then
    echo -e "${RED}❌ go.mod not found!${NC}"
    exit 1
fi

# Загружаем переменные из .env файла
if [ -f ".env" ]; then
    echo "📝 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found, using defaults${NC}"
fi

# Устанавливаем зависимости
echo "📦 Installing Go dependencies..."
go mod download

# Компилируем backend
echo "🔨 Building backend..."
go build -o bin/server cmd/server/main.go

# Запускаем скомпилированный бинарник с экспортированными переменными
nohup ./bin/server > ../custom-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../.custom-backend.pid

cd ..

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Logs: custom-backend.log"
echo "   URL: http://localhost:8080"
echo ""

# Ждем пока backend поднимется
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""
echo ""

# Обновляем frontend конфиг для custom backend
echo -e "${YELLOW}⚙️  Configuring frontend for custom backend...${NC}"
cat > .env.local << 'EOF'
# Custom Backend Configuration
VITE_API_URL=http://localhost:8080
VITE_BACKEND_TYPE=custom

# Resend Email (optional)
VITE_RESEND_API_KEY=re_123456789_placeholder
EOF
echo -e "${GREEN}✅ Frontend configured${NC}"
echo ""

# Запускаем Frontend
echo -e "${YELLOW}🎨 Starting Frontend...${NC}"

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Запускаем frontend в фоне с явным указанием порта
nohup env PORT=5173 npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > .frontend.pid

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Logs: frontend.log"
echo "   URL: http://localhost:5173"
echo ""

# Ждем пока frontend поднимется
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready!${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""
echo ""

# Итоговая информация
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 X-18 Custom Backend Stack is READY!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📊 Services:${NC}"
echo "   • Backend:    http://localhost:8080"
echo "   • Frontend:   http://localhost:5173"
echo "   • API:        http://localhost:8080/api"
echo "   • Health:     http://localhost:8080/health"
echo ""
echo -e "${YELLOW}📝 PIDs:${NC}"
echo "   • Backend:    $BACKEND_PID (.custom-backend.pid)"
echo "   • Frontend:   $FRONTEND_PID (.frontend.pid)"
echo ""
echo -e "${YELLOW}📄 Logs:${NC}"
echo "   • Backend:    tail -f custom-backend.log"
echo "   • Frontend:   tail -f frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop:${NC}"
echo "   ./STOP_CUSTOM_BACKEND_STACK.sh"
echo ""
echo -e "${GREEN}✨ Ready to use! Open http://localhost:5173 in your browser${NC}"
echo ""
