#!/bin/bash

# Скрипт для запуска полного локального стека
# Frontend + Backend (GoToSocial) + PostgreSQL

set -e

echo "🚀 Запуск локального стека для разработки"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для проверки команды
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Проверка необходимых инструментов
echo -e "${YELLOW}📋 Проверка необходимых инструментов...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker не установлен. Установите Docker Desktop.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm не установлен. Установите Node.js.${NC}"
    exit 1
fi

if ! command_exists go; then
    echo -e "${RED}❌ Go не установлен. Установите Go 1.21+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Все инструменты установлены${NC}"
echo ""

# 1. Запуск PostgreSQL в Docker
echo -e "${YELLOW}🐘 Запуск PostgreSQL в Docker...${NC}"

# Проверяем запущен ли уже контейнер
if docker ps -a | grep -q gotosocial-postgres; then
    echo "Контейнер gotosocial-postgres уже существует"
    
    # Если существует но не запущен, запускаем его
    if ! docker ps | grep -q gotosocial-postgres; then
        echo "Запускаем существующий контейнер..."
        docker start gotosocial-postgres
    else
        echo "Контейнер уже запущен"
    fi
else
    echo "Создаём новый контейнер PostgreSQL..."
    docker run -d \
        --name gotosocial-postgres \
        -e POSTGRES_USER=gotosocial \
        -e POSTGRES_PASSWORD=gotosocial \
        -e POSTGRES_DB=gotosocial \
        -p 5432:5432 \
        postgres:15-alpine
fi

echo -e "${GREEN}✅ PostgreSQL запущен на порту 5432${NC}"
echo ""

# Ждём пока PostgreSQL запустится
echo "Ожидание готовности PostgreSQL..."
sleep 5

# 2. Сборка и запуск GoToSocial
echo -e "${YELLOW}🔧 Сборка GoToSocial...${NC}"

cd gotosocial

# Проверяем существует ли бинарник
if [ ! -f "gotosocial" ]; then
    echo "Компилируем GoToSocial..."
    go build -o gotosocial ./cmd/gotosocial
else
    echo "Бинарник GoToSocial уже существует"
fi

# Создаём базовый config.yaml если его нет
if [ ! -f "config.yaml" ]; then
    echo "Создаём config.yaml..."
    cat > config.yaml <<EOF
# GoToSocial Local Development Configuration

# Server
host: "localhost"
port: 8080
protocol: "http"
bind-address: "0.0.0.0"
trusted-proxies:
  - "127.0.0.1/32"

# Database
db-type: "postgres"
db-address: "localhost"
db-port: 5432
db-user: "gotosocial"
db-password: "gotosocial"
db-database: "gotosocial"

# Account domain
account-domain: "localhost:8080"
instance-inject-mastodon-version: true

# Storage
storage-backend: "local"
storage-local-base-path: "./storage"

# Media
media-image-max-size: 10485760
media-video-max-size: 41943040
media-description-min-chars: 0
media-description-max-chars: 500
media-remote-cache-days: 30
media-emoji-local-max-size: 51200
media-emoji-remote-max-size: 102400

# Log level
log-level: "info"
log-db-queries: false

# CORS (для локальной разработки)
cors-allow-origins:
  - "http://localhost:5173"
  - "http://localhost:3000"
EOF
fi

echo -e "${GREEN}✅ GoToSocial собран${NC}"
echo ""

# Запуск GoToSocial в фоне
echo -e "${YELLOW}🚀 Запуск GoToSocial backend...${NC}"

# Убиваем предыдущий процесс если есть
pkill -f "gotosocial.*server start" || true

# Запускаем в фоне и перенаправляем логи
nohup ./gotosocial --config-path ./config.yaml server start > ../gotosocial.log 2>&1 &
GOTOSOCIAL_PID=$!

echo -e "${GREEN}✅ GoToSocial запущен (PID: $GOTOSOCIAL_PID)${NC}"
echo "   Логи: gotosocial.log"
echo "   API: http://localhost:8080"
echo ""

cd ..

# Ждём пока GoToSocial запустится
echo "Ожидание готовности GoToSocial API..."
sleep 3

# Проверяем что GoToSocial запущен
for i in {1..10}; do
    if curl -s http://localhost:8080/api/v1/instance > /dev/null 2>&1; then
        echo -e "${GREEN}✅ GoToSocial API готов к работе${NC}"
        break
    fi
    
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ GoToSocial не запустился. Проверьте логи: gotosocial.log${NC}"
        exit 1
    fi
    
    echo "Попытка $i/10..."
    sleep 2
done

echo ""

# 3. Запуск Frontend
echo -e "${YELLOW}⚛️  Установка зависимостей Frontend...${NC}"

# Проверяем установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "Устанавливаем npm зависимости..."
    npm install
else
    echo "Зависимости уже установлены"
fi

echo -e "${GREEN}✅ Зависимости установлены${NC}"
echo ""

# Создаём .env.local если его нет
if [ ! -f ".env.local" ]; then
    echo "Создаём .env.local..."
    cat > .env.local <<EOF
# Local Development Environment
VITE_GOTOSOCIAL_API_URL=http://localhost:8080
EOF
fi

echo -e "${YELLOW}🚀 Запуск Frontend dev server...${NC}"
echo ""

# Запускаем Frontend
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"
echo ""

# Вывод итоговой информации
echo "=========================================="
echo -e "${GREEN}✅ Все сервисы запущены успешно!${NC}"
echo "=========================================="
echo ""
echo "📍 Доступные сервисы:"
echo ""
echo "   🌐 Frontend:      http://localhost:5173"
echo "   🔧 Backend API:   http://localhost:8080"
echo "   🐘 PostgreSQL:    localhost:5432"
echo ""
echo "📋 Управление:"
echo ""
echo "   Логи GoToSocial:  tail -f gotosocial.log"
echo "   Остановить все:   ./STOP_LOCAL_STACK.sh"
echo ""
echo "🧪 Тестирование:"
echo ""
echo "   1. Откройте http://localhost:5173"
echo "   2. Попробуйте создать пост с метаданными"
echo "   3. Проверьте фильтрацию timeline"
echo ""
echo "=========================================="

# Сохраняем PIDs для остановки
echo "$GOTOSOCIAL_PID" > .gotosocial.pid
echo "$FRONTEND_PID" > .frontend.pid

# Держим скрипт запущенным
wait
