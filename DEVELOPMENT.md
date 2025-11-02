# Development Guide - Разработка X-18

**Последнее обновление:** 02.11.2025

Это руководство поможет настроить локальное окружение для разработки проекта X-18.

---

## 📋 Требования к системе

### Обязательные

- **Node.js** >= 18.0.0 (рекомендуется 20.x LTS)
- **pnpm** >= 8.0.0 (package manager)
- **Go** >= 1.22 (для backend)
- **PostgreSQL** >= 15
- **Redis** >= 7
- **Git**

### Опциональные

- **Docker** & Docker Compose (для изолированного запуска БД)
- **AWS CLI** (для деплоя)
- **Postman** или **curl** (для тестирования API)

---

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/MoonMax000/X-18----.git
cd X-18----
```

### 2. Установка зависимостей

#### Frontend

```bash
# Используйте pnpm (НЕ npm!)
pnpm install
```

#### Backend

```bash
cd custom-backend
go mod download
cd ..
```

### 3. Настройка переменных окружения

#### Frontend (.env.local)

```bash
# Скопируйте шаблон
cp client/.env.example client/.env.local

# Отредактируйте client/.env.local
VITE_API_URL=http://localhost:8080
VITE_ENABLE_COMMENTS=true
VITE_ENABLE_PREMIUM=true
```

#### Backend (.env.local)

```bash
# В корне проекта создайте .env.local
cat > .env.local << EOF
# Server
PORT=8080
HOST=localhost
CORS_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgresql://x18_user:x18_password@localhost:5432/x18_dev
DB_MAX_CONNECTIONS=10

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-local-dev-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=720h

# AWS SES (для локальной разработки можно использовать моки)
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@localhost
AWS_SES_FROM_NAME=X18 Dev

# Features
ENABLE_EMAIL=false  # Отключить email для локальной разработки
EOF
```

### 4. Настройка базы данных

#### Вариант A: Локальный PostgreSQL

```bash
# Создайте пользователя и БД
sudo -u postgres psql << EOF
CREATE USER x18_user WITH PASSWORD 'x18_password';
CREATE DATABASE x18_dev OWNER x18_user;
GRANT ALL PRIVILEGES ON DATABASE x18_dev TO x18_user;
\q
EOF

# Проверьте подключение
psql -U x18_user -d x18_dev -h localhost
```

#### Вариант B: Docker

```bash
# Создайте docker-compose.yml для локальной разработки
cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: x18_dev
      POSTGRES_USER: x18_user
      POSTGRES_PASSWORD: x18_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Запустите контейнеры
docker-compose -f docker-compose.dev.yml up -d
```

### 5. Применение миграций

```bash
cd custom-backend

# Миграции применятся автоматически при запуске сервера
# Или вручную:
go run cmd/server/main.go migrate

cd ..
```

### 6. Запуск проекта

#### Терминал 1: Backend

```bash
cd custom-backend
go run cmd/server/main.go

# Backend запустится на http://localhost:8080
```

#### Терминал 2: Frontend

```bash
# Из корневой директории (НЕ из client/)
pnpm dev

# Frontend запустится на http://localhost:5173
```

### 7. Открыть в браузере

```
http://localhost:5173
```

---

## 📁 Структура проекта для разработчика

```
X-18/
├── client/                      # 👉 Frontend разработка
│   ├── src/
│   │   ├── components/         # Создавать новые компоненты здесь
│   │   ├── pages/              # Добавлять новые страницы здесь
│   │   ├── services/api/       # Модифицировать API клиенты
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Утилиты и хелперы
│   ├── .env.local              # ⚙️ Локальные переменные
│   └── vite.config.ts          # Конфигурация Vite
│
├── custom-backend/             # 👉 Backend разработка
│   ├── cmd/server/            
│   │   └── main.go            # 🚀 Точка входа
│   ├── internal/
│   │   ├── api/               # Добавлять новые endpoints
│   │   ├── models/            # Модели данных
│   │   ├── database/          
│   │   │   └── migrations/    # SQL миграции
│   │   └── services/          # Бизнес-логика
│   ├── go.mod                 # Go зависимости
│   └── .env.local             # ⚙️ Локальные переменные
│
├── .env.local                  # 🔧 Общие переменные
├── pnpm-lock.yaml             # Lock file (НЕ удалять!)
└── package.json               # Скрипты для разработки
```

---

## 🛠 Полезные команды

### Frontend

```bash
# Разработка с hot reload
pnpm dev

# Production build
pnpm build:client

# Линтинг
pnpm lint

# Форматирование кода
pnpm format

# Проверка типов TypeScript
pnpm type-check

# Запуск тестов
pnpm test

# Очистка кэша
pnpm clean
rm -rf client/dist client/node_modules/.vite
```

### Backend

```bash
cd custom-backend

# Запуск с hot reload (air)
go install github.com/cosmtrek/air@latest
air

# Обычный запуск
go run cmd/server/main.go

# Build
go build -o bin/server cmd/server/main.go

# Тесты
go test ./...

# Тесты с покрытием
go test -cover ./...

# Форматирование
go fmt ./...

# Линтинг
golangci-lint run

# Обновление зависимостей
go get -u ./...
go mod tidy
```

### Database

```bash
# Подключение к БД
psql -U x18_user -d x18_dev -h localhost

# Создание новой миграции
cd custom-backend/internal/database/migrations
cat > 999_your_migration_name.sql << EOF
-- Migration: Your description
-- Created: $(date +%Y-%m-%d)

-- Add your SQL here

EOF

# Просмотр таблиц
psql -U x18_user -d x18_dev -h localhost -c "\dt"

# Экспорт схемы
pg_dump -U x18_user -d x18_dev -h localhost --schema-only > schema.sql

# Очистка БД (ОСТОРОЖНО!)
psql -U x18_user -d x18_dev -h localhost -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Docker

```bash
# Запустить контейнеры
docker-compose -f docker-compose.dev.yml up -d

# Остановить
docker-compose -f docker-compose.dev.yml down

# Логи
docker-compose -f docker-compose.dev.yml logs -f

# Перезапуск
docker-compose -f docker-compose.dev.yml restart

# Очистка (удалит данные!)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🧪 Тестирование

### Frontend тесты

```bash
# Unit тесты (Vitest)
pnpm test

# E2E тесты (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Backend тесты

```bash
cd custom-backend

# Все тесты
go test ./...

# Конкретный пакет
go test ./internal/api

# С verbose
go test -v ./...

# Benchmark
go test -bench=. ./...
```

### Manual API тестирование

```bash
# Регистрация
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Логин
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Получить токен из ответа и использовать для следующих запросов
TOKEN="your_access_token_here"

# Создать пост
curl -X POST http://localhost:8080/api/posts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from API!",
    "metadata": {"category": "general"}
  }'

# Получить timeline
curl -X GET http://localhost:8080/api/timeline/home \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Frontend проблемы

#### 1. "Cannot find module" errors

```bash
# Переустановите зависимости
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Port 5173 уже занят

```bash
# Убить процесс на порту 5173
lsof -ti:5173 | xargs kill -9

# Или изменить порт в vite.config.ts
server: {
  port: 5174  // другой порт
}
```

#### 3. CORS errors

```bash
# Проверьте что backend CORS_ORIGINS включает http://localhost:5173
# В custom-backend/.env.local:
CORS_ORIGINS=http://localhost:5173
```

#### 4. "Failed to fetch" errors

```bash
# Проверьте что backend запущен
curl http://localhost:8080/health

# Проверьте VITE_API_URL в client/.env.local
VITE_API_URL=http://localhost:8080
```

### Backend проблемы

#### 1. Database connection failed

```bash
# Проверьте что PostgreSQL запущен
sudo systemctl status postgresql
# Или для Docker:
docker ps | grep postgres

# Проверьте DATABASE_URL
psql "postgresql://x18_user:x18_password@localhost:5432/x18_dev"
```

#### 2. Redis connection failed

```bash
# Проверьте Redis
redis-cli ping
# Должно вернуть PONG

# Или для Docker:
docker ps | grep redis
```

#### 3. "module not found" errors

```bash
cd custom-backend
go mod tidy
go mod download
```

#### 4. Migration errors

```bash
# Проверьте существующие миграции
psql -U x18_user -d x18_dev -h localhost \
  -c "SELECT * FROM schema_migrations;"

# Ручное применение миграции
psql -U x18_user -d x18_dev -h localhost \
  -f custom-backend/internal/database/migrations/001_initial.sql
```

### Database проблемы

#### 1. "Permission denied for database"

```bash
# Дайте права пользователю
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE x18_dev TO x18_user;"
```

#### 2. "Too many connections"

```bash
# Проверьте открытые соединения
psql -U x18_user -d x18_dev -h localhost \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname='x18_dev';"

# Уменьшите DB_MAX_CONNECTIONS в .env.local
```

#### 3. Сброс БД для чистого старта

```bash
# ОСТОРОЖНО: Удалит все данные!
psql -U x18_user -d x18_dev -h localhost << EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO x18_user;
EOF

# Перезапустите backend чтобы миграции применились заново
```

---

## 🔧 Настройка IDE

### VS Code

#### Рекомендуемые расширения

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "golang.go",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "eamodio.gitlens"
  ]
}
```

#### Настройки (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "go.useLanguageServer": true,
  "go.lintTool": "golangci-lint",
  "go.formatTool": "gofmt",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[go]": {
    "editor.defaultFormatter": "golang.go"
  }
}
```

### GoLand / WebStorm

1. Откройте проект
2. Settings → Languages & Frameworks → TypeScript → включите TypeScript Language Service
3. Settings → Go → GOPATH → добавьте путь к проекту
4. Settings → Prettier → включите "On save"
5. Settings → ESLint → включите automatic ESLint configuration

---

## 📊 Мониторинг в разработке

### Backend логи

```bash
# Просмотр логов в реальном времени
cd custom-backend
go run cmd/server/main.go | jq .  # с форматированием JSON
```

### Database queries

```bash
# Включить логирование SQL запросов в GORM
# В custom-backend/internal/database/database.go:
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
    Logger: logger.Default.LogMode(logger.Info),  # Добавьте эту строку
})
```

### Redis monitoring

```bash
# Мониторинг команд
redis-cli monitor

# Статистика
redis-cli info stats
```

---

## 🎯 Workflow разработки

### Создание новой фичи

```bash
# 1. Создайте ветку
git checkout -b feature/your-feature-name

# 2. Разработка
# - Внесите изменения в код
# - Создайте миграции если нужно
# - Добавьте тесты

# 3. Тестирование
pnpm test
cd custom-backend && go test ./...

# 4. Commit
git add .
git commit -m "feat: добавлена фича X"

# 5. Push
git push origin feature/your-feature-name

# 6. Создайте Pull Request на GitHub
```

### Соглашения о коммитах

```
feat: новая функциональность
fix: исправление бага
docs: документация
style: форматирование кода
refactor: рефакторинг
test: тесты
chore: обновление зависимостей и т.д.

Примеры:
feat: добавлена страница профиля
fix: исправлена ошибка авторизации
docs: обновлена документация API
```

---

## 📚 Полезные ссылки

### Документация технологий

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Go](https://go.dev/doc)
- [Fiber](https://docs.gofiber.io)
- [GORM](https://gorm.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs)
- [Redis](https://redis.io/docs)

### Внутренняя документация

- [PROJECT.md](PROJECT.md) - Обзор проекта
- [DEPLOYMENT.md](DEPLOYMENT.md) - Деплой
- [FEATURES.md](FEATURES.md) - Список фич
- [CHANGELOG.md](CHANGELOG.md) - История изменений

---

## ❓ FAQ

**Q: Какой package manager использовать?**  
A: Только **pnpm**! Не используйте npm или yarn.

**Q: Где запускать команды npm?**  
A: Из **корневой директории** проекта, НЕ из client/.

**Q: Нужно ли коммитить .env.local?**  
A: **НЕТ!** Файлы .env.local в .gitignore.

**Q: Как добавить новую таблицу в БД?**  
A: Создайте SQL миграцию в `custom-backend/internal/database/migrations/`

**Q: Backend не видит изменения в коде?**  
A: Используйте `air` для hot reload или перезапустите сервер.

**Q: Как тестировать email локально?**  
A: Установите `ENABLE_EMAIL=false` в .env.local или используйте [MailHog](https://github.com/mailhog/MailHog).

---

**Happy Coding! 🚀**

**Последнее обновление:** 02.11.2025  
**Автор:** X-18 Team
