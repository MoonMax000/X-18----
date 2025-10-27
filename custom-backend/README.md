# X-18 Custom Backend - Упрощённая Социальная Сеть

Собственный backend без Mastodon-совместимости и федерации. Простой, быстрый и полностью под контролем.

## 🎯 Особенности

- ✅ **Без OAuth сложностей** - простая JWT аутентификация
- ✅ **Без федерации** - закрытая социальная сеть
- ✅ **Быстрая разработка** - чистая архитектура
- ✅ **Масштабируемость** - готово к росту до 100k+ пользователей
- ✅ **Простой API** - RESTful endpoints
- ✅ **Metadata поддержка** - JSONB для гибких данных

## 📂 Структура проекта

```
custom-backend/
├── cmd/
│   └── server/          # Главное приложение (TODO)
├── internal/
│   ├── api/             # REST API handlers (TODO)
│   ├── auth/            # ✅ JWT authentication
│   ├── cache/           # ✅ Redis cache layer
│   ├── database/        # ✅ PostgreSQL connection
│   └── models/          # ✅ Data models
├── pkg/
│   ├── middleware/      # HTTP middleware (TODO)
│   └── utils/           # ✅ Utilities (password hashing)
├── configs/             # ✅ Configuration
├── migrations/          # Database migrations (TODO)
├── go.mod               # ✅ Dependencies
└── .env.example         # ✅ Environment template
```

## ✅ Что уже готово

### 1. Модели данных (100%)
- ✅ User (пользователи)
- ✅ Post (посты с JSONB metadata)
- ✅ Follow (подписки)
- ✅ Like (лайки)
- ✅ Retweet (репосты)
- ✅ Bookmark (закладки)
- ✅ Notification (уведомления)
- ✅ Media (медиа файлы)
- ✅ Session (JWT сессии)
- ✅ Subscription (платные подписки)
- ✅ Purchase (покупка постов)

### 2. Инфраструктура (100%)
- ✅ PostgreSQL подключение (GORM)
- ✅ Redis cache
- ✅ JWT генерация и валидация
- ✅ Password hashing (bcrypt)
- ✅ Configuration management

### 3. Кэширование (100%)
- ✅ Timeline cache (sorted sets)
- ✅ Session storage
- ✅ Rate limiting
- ✅ Pub/Sub для уведомлений

## 🚧 Что нужно доделать (следующие шаги)

### Week 1: Core API (3-4 дня)
- [ ] **cmd/server/main.go** - главное приложение с Fiber
- [ ] **internal/api/auth.go** - регистрация/логин/logout
- [ ] **internal/api/users.go** - user endpoints
- [ ] **internal/api/posts.go** - post CRUD
- [ ] **pkg/middleware/auth.go** - JWT middleware

### Week 2: Social Features (3-4 дня)
- [ ] **internal/api/timeline.go** - home/explore timelines
- [ ] **internal/api/interactions.go** - like/retweet/bookmark
- [ ] **internal/api/follows.go** - follow/unfollow
- [ ] **internal/api/notifications.go** - уведомления
- [ ] **internal/api/search.go** - поиск

### Week 3: Advanced Features (3-4 дня)
- [ ] **internal/api/media.go** - загрузка файлов
- [ ] **internal/api/monetization.go** - покупки/подписки
- [ ] Timeline background worker
- [ ] Notification dispatcher
- [ ] Tests

## 🔧 Установка и запуск

### Предварительные требования

```bash
# PostgreSQL
brew install postgresql
brew services start postgresql

# Redis
brew install redis
brew services start redis

# Go 1.21+
brew install go
```

### Настройка

1. Создать базу данных:
```bash
createdb x18_backend
```

2. Скопировать .env:
```bash
cp .env.example .env
# Отредактировать .env с вашими настройками
```

3. Установить зависимости:
```bash
go mod tidy
```

4. (После создания main.go) Запустить миграции:
```bash
go run cmd/server/main.go migrate
```

5. (После создания main.go) Запустить сервер:
```bash
go run cmd/server/main.go serve
```

## 📡 API Endpoints (планируемые)

### Authentication
```
POST   /api/auth/register      - Регистрация
POST   /api/auth/login         - Логин
POST   /api/auth/logout        - Выход
POST   /api/auth/refresh       - Обновить токен
```

### Users
```
GET    /api/users/me           - Текущий юзер
GET    /api/users/:id          - Юзер по ID
GET    /api/users/username/:username  - Юзер по username
PATCH  /api/users/me           - Обновить профиль
GET    /api/users/:id/posts    - Посты юзера
GET    /api/users/:id/followers - Подписчики
GET    /api/users/:id/following - Подписки
POST   /api/users/:id/follow   - Подписаться
DELETE /api/users/:id/follow   - Отписаться
```

### Posts
```
GET    /api/posts/:id          - Пост по ID
POST   /api/posts              - Создать пост
DELETE /api/posts/:id          - Удалить пост
POST   /api/posts/:id/like     - Лайкнуть
DELETE /api/posts/:id/like     - Убрать лайк
POST   /api/posts/:id/retweet  - Ретвитнуть
DELETE /api/posts/:id/retweet  - Убрать ретвит
POST   /api/posts/:id/bookmark - Добавить в закладки
DELETE /api/posts/:id/bookmark - Убрать из закладок
```

### Timeline
```
GET    /api/timeline/home      - Home timeline (с фильтрами)
GET    /api/timeline/explore   - Public timeline
GET    /api/timeline/trending  - Трендовые посты
```

### Notifications
```
GET    /api/notifications      - Уведомления
POST   /api/notifications/:id/read  - Отметить прочитанным
POST   /api/notifications/read-all  - Отметить всё
```

### Media
```
POST   /api/media              - Загрузить медиа
```

### Search
```
GET    /api/search             - Поиск (users, posts)
```

### Monetization
```
POST   /api/posts/:id/purchase - Купить пост
POST   /api/users/:id/subscribe - Подписаться (платно)
GET    /api/subscriptions/my   - Мои подписки
GET    /api/purchases/my       - Мои покупки
```

## 🗄️ База данных

### Схема создана автоматически через GORM:
- `users` - пользователи
- `posts` - посты с JSONB metadata
- `follows` - подписки
- `likes` - лайки
- `retweets` - репосты
- `bookmarks` - закладки
- `notifications` - уведомления
- `media` - медиа файлы
- `sessions` - JWT refresh tokens
- `subscriptions` - платные подписки
- `purchases` - покупки постов

## 🚀 Production Deployment

### Docker (рекомендуется)
```dockerfile
# Dockerfile (нужно создать)
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server cmd/server/main.go

FROM alpine:latest
COPY --from=builder /app/server /server
CMD ["/server", "serve"]
```

### Railway.app / Render.com
- Добавить PostgreSQL addon
- Добавить Redis addon
- Настроить environment variables
- Deploy!

## 📈 Производительность

### Целевые метрики:
- **Latency**: < 50ms (p95)
- **Throughput**: 2000+ req/sec
- **Timeline generation**: < 30ms
- **Users supported**: 100k+

### Оптимизации:
- Redis для hot data (timelines)
- Denormalized counts (followers, likes)
- JSONB indexes для metadata
- Database connection pooling
- Горизонтальное масштабирование

## 🔐 Безопасность

- ✅ JWT токены (access + refresh)
- ✅ Bcrypt password hashing
- 🚧 Rate limiting (TODO)
- 🚧 CORS configuration (TODO)
- 🚧 Request validation (TODO)
- 🚧 SQL injection protection (GORM handles это)

## 📚 Используемые технологии

- **Go 1.21** - язык программирования
- **Fiber v2** - web framework (TODO)
- **GORM** - ORM для PostgreSQL
- **Redis** - caching & pub/sub
- **JWT** - authentication
- **PostgreSQL** - главная БД
- **Bcrypt** - password hashing

## 🎯 Следующий шаг

Создать **cmd/server/main.go** с Fiber сервером:

```go
package main

import (
    "log"
    
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    
    "github.com/yourusername/x18-backend/configs"
    "github.com/yourusername/x18-backend/internal/database"
    "github.com/yourusername/x18-backend/internal/cache"
)

func main() {
    // Load config
    cfg := configs.LoadConfig()
    
    // Connect database
    db, err := database.Connect(&cfg.Database)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()
    
    // Run migrations
    if err := db.AutoMigrate(); err != nil {
        log.Fatal(err)
    }
    
    // Connect Redis
    redis, err := cache.Connect(&cfg.Redis)
    if err != nil {
        log.Fatal(err)
    }
    defer redis.Close()
    
    // Create Fiber app
    app := fiber.New()
    
    // Middleware
    app.Use(logger.New())
    app.Use(cors.New())
    
    // Routes (TODO)
    // api := app.Group("/api")
    // auth := api.Group("/auth")
    // ...
    
    // Start server
    log.Printf("🚀 Server starting on :%s", cfg.Server.Port)
    log.Fatal(app.Listen(":" + cfg.Server.Port))
}
```

## 📝 Лицензия

MIT

## 👨‍💻 Автор

AI Assistant + Your Team

---

**Статус проекта**: 🟡 Фундамент готов, API endpoints в разработке

**Время до готовности**: 2-3 недели при полной разработке
