# Руководство по локальной разработке X-18

## Быстрый старт

### Требования
- macOS/Linux
- PostgreSQL 15+
- Redis
- Node.js 18+
- Go 1.21+
- pnpm

### Запуск за один шаг
```bash
./START_CUSTOM_BACKEND_STACK.sh
```

Этот скрипт автоматически:
- Проверит PostgreSQL и Redis
- Создаст базу данных `x18_backend`
- Настроит переменные окружения
- Запустит бэкенд на порту 8080
- Запустит фронтенд на порту 5173

### Остановка сервисов
```bash
./STOP_CUSTOM_BACKEND_STACK.sh
```

## Структура проекта

```
X-18----/
├── client/               # Frontend (React + TypeScript)
│   ├── components/       # Компоненты React
│   ├── pages/           # Страницы приложения
│   ├── hooks/           # Custom хуки
│   ├── services/        # API сервисы
│   └── store/           # Redux store
├── custom-backend/       # Backend (Go)
│   ├── cmd/server/      # Точка входа
│   ├── internal/        # Внутренняя логика
│   │   ├── api/         # HTTP handlers
│   │   ├── models/      # Модели данных
│   │   └── database/    # База данных и миграции
│   └── pkg/            # Переиспользуемые пакеты
└── aws-infrastructure/  # Инфраструктура AWS
```

## Конфигурация окружения

### Backend (.env файл)
```bash
# custom-backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=x18_backend
DB_SSLMODE=disable

REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env.local)
```bash
# client/.env.local
VITE_API_URL=http://localhost:8080
VITE_BACKEND_TYPE=custom
```

## Работа с базой данных

### Подключение к локальной БД
```bash
psql -h localhost -U postgres -d x18_backend
```

### Миграции базы данных
Миграции автоматически применяются при запуске бэкенда.
Файлы миграций находятся в `custom-backend/internal/database/migrations/`

### Создание новой миграции
```bash
touch custom-backend/internal/database/migrations/XXX_migration_name.sql
```

## Разработка

### Backend (Go)

#### Запуск в режиме разработки
```bash
cd custom-backend
go run cmd/server/main.go
```

#### Компиляция
```bash
cd custom-backend
go build -o bin/server cmd/server/main.go
```

#### Добавление зависимостей
```bash
cd custom-backend
go get github.com/package/name
go mod tidy
```

### Frontend (React)

#### Запуск в режиме разработки
```bash
cd client
pnpm dev
```

#### Сборка для production
```bash
cd client
pnpm build
```

#### Добавление зависимостей
```bash
cd client
pnpm add package-name
```

## Тестирование

### Проверка health endpoint
```bash
curl http://localhost:8080/health
```

### Тестовая регистрация пользователя
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "display_name": "Test User"
  }'
```

### Тестовый вход
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

## Логи

### Backend логи
```bash
tail -f custom-backend.log
```

### Frontend логи
```bash
tail -f frontend.log
```

### PostgreSQL логи
```bash
tail -f /usr/local/var/log/postgresql@15.log
```

## Отладка

### Backend с отладчиком
```bash
cd custom-backend
dlv debug cmd/server/main.go
```

### Frontend с React DevTools
1. Установите расширение React Developer Tools в браузере
2. Откройте http://localhost:5173
3. Откройте DevTools → React

### Просмотр запущенных процессов
```bash
# Backend PID
cat .custom-backend.pid

# Frontend PID  
cat .frontend.pid

# Проверка процессов
ps aux | grep -E "server|vite"
```

## Частые проблемы

### PostgreSQL не запущен
```bash
brew services start postgresql@15
```

### Redis не запущен
```bash
brew services start redis
```

### Порт 8080 занят
```bash
# Найти процесс
lsof -i :8080

# Убить процесс
kill -9 PID
```

### Порт 5173 занят
```bash
# Найти процесс
lsof -i :5173

# Убить процесс
kill -9 PID
```

### База данных не создана
```bash
psql -h localhost -U postgres -c "CREATE DATABASE x18_backend"
```

## Переключение между локальным и AWS окружением

### Для использования AWS базы данных
```bash
# Восстановить AWS конфигурацию
cp custom-backend/.env.aws-backup custom-backend/.env
```

### Для использования локальной базы данных
```bash
# Использовать локальную конфигурацию (уже настроено)
./START_CUSTOM_BACKEND_STACK.sh
```

## Полезные команды

```bash
# Очистить всех пользователей кроме админа
psql -h localhost -U postgres -d x18_backend < cleanup-all-except-admin.sql

# Проверить таблицы в БД
psql -h localhost -U postgres -d x18_backend -c "\dt"

# Экспорт схемы БД
pg_dump -h localhost -U postgres -d x18_backend --schema-only > schema.sql

# Импорт данных из production
pg_dump -h <aws-host> -U dbadmin -d tyriantrade > prod_dump.sql
psql -h localhost -U postgres -d x18_backend < prod_dump.sql
```

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи (`tail -f custom-backend.log`)
2. Проверьте статус сервисов (`curl http://localhost:8080/health`)
3. Проверьте переменные окружения (`cat custom-backend/.env`)
