# X-18 Project - Социальная сеть для трейдеров

**Последнее обновление:** 05.11.2025  
**Статус:** Production Ready ✅  
**Production URL:** https://app.x18.pro

---

## 📋 Обзор

X-18 - это современная социальная сеть для трейдеров и инвесторов с функционалом премиум контента, монетизации и real-time уведомлений. Проект построен на микросервисной архитектуре с разделением frontend и backend.

### Ключевые возможности

- 📝 Посты и комментарии с поддержкой медиа
- 👥 Система подписок и подписчиков
- 💰 Монетизация через премиум контент
- 🔒 **Закрытые профили с Paywall** ⭐ NEW
- 🔔 Real-time уведомления
- 📊 Виджеты (новости, тикеры, статистика)
- 🎨 Темная тема с адаптивным дизайном
- 🔐 JWT аутентификация с 2FA
- 📧 Email верификация через AWS SES
- 💳 Stripe payments (сохраненные карты, промо-цены)

---

## 🏗 Архитектура

### Общая схема

```
┌─────────────────────┐
│   CloudFront CDN    │  ← app.x18.pro (Frontend)
│   React SPA Build   │
└──────────┬──────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐
│  Go Backend (Fiber)  │              │ AWS SES Email        │
│  api.x18.pro         │────────────▶ │ Verification         │
│  Port 8080           │              └──────────────────────┘
└──────────┬───────────┘
           │
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  PostgreSQL    │  │  Redis Cache   │  │  S3 Storage    │
│  Database      │  │  Sessions      │  │  Media Files   │
└────────────────┘  └────────────────┘  └────────────────┘
```

### Компоненты

1. **Frontend (React + TypeScript + Vite)**
   - Локация: `client/`
   - Production: CloudFront CDN
   - Dev Server: http://localhost:5173

2. **Backend (Go + Fiber v2)**
   - Локация: `custom-backend/`
   - Production: AWS ECS на api.x18.pro
   - Dev Server: http://localhost:8080

3. **Database (PostgreSQL 15)**
   - Production: AWS RDS
   - Dev: Local PostgreSQL

4. **Cache (Redis 7)**
   - Production: AWS ElastiCache
   - Dev: Local Redis

5. **Email (AWS SES)**
   - Production: SES в sandbox mode (только верифицированные адреса)
   - Domain: x18.pro

---

## 🚀 Production URLs

### Основные

- **Frontend:** https://app.x18.pro
- **Backend API:** https://api.x18.pro
- **Admin Panel:** https://app.x18.pro/admin

### API Endpoints

```
Base URL: https://api.x18.pro/api

Authentication:
- POST   /auth/register          # Регистрация
- POST   /auth/login             # Вход
- POST   /auth/refresh           # Обновление токена
- POST   /auth/verify-email      # Верификация email
- POST   /auth/resend-verification # Повторная отправка кода

Posts:
- GET    /posts/                 # Список постов
- POST   /posts/                 # Создание поста
- GET    /posts/:id              # Детали поста
- DELETE /posts/:id              # Удаление поста
- POST   /posts/:id/like         # Лайк
- GET    /posts/:id/replies      # Комментарии

Timeline:
- GET    /timeline/home          # Главная лента
- GET    /timeline/user/:id      # Лента пользователя

Users:
- GET    /users/:id              # Профиль
- PUT    /users/:id              # Обновление профиля
- POST   /users/:id/follow       # Подписка

Notifications:
- GET    /notifications/         # Список уведомлений
- PUT    /notifications/read     # Отметить прочитанными
```

---

## 💻 Технологический стек

### Frontend

```json
{
  "framework": "React 18.3",
  "language": "TypeScript 5.6",
  "build": "Vite 5.4",
  "styling": "Tailwind CSS 3.4",
  "ui": "shadcn/ui (Radix UI)",
  "routing": "React Router v6",
  "state": "React Query + Context API",
  "forms": "React Hook Form + Zod"
}
```

### Backend

```json
{
  "language": "Go 1.22",
  "framework": "Fiber v2",
  "orm": "GORM",
  "database": "PostgreSQL 15",
  "cache": "Redis 7",
  "auth": "JWT (golang-jwt)",
  "email": "AWS SES",
  "validation": "go-playground/validator"
}
```

### DevOps

```json
{
  "hosting": {
    "frontend": "AWS CloudFront + S3",
    "backend": "AWS ECS Fargate",
    "database": "AWS RDS PostgreSQL",
    "cache": "AWS ElastiCache Redis"
  },
  "ci_cd": "GitHub Actions",
  "monitoring": "CloudWatch",
  "domains": "Route 53"
}
```

---

## 📂 Структура проекта

```
X-18/
├── client/                      # Frontend React приложение
│   ├── src/
│   │   ├── components/         # React компоненты
│   │   │   ├── ui/            # Базовые UI (shadcn)
│   │   │   ├── auth/          # Аутентификация
│   │   │   ├── PostCard/      # Карточки постов
│   │   │   └── socialProfile/ # Профили
│   │   ├── pages/             # Страницы
│   │   ├── services/          # API клиенты
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # State management
│   │   └── lib/               # Утилиты
│   ├── public/                # Статичные файлы
│   └── dist/                  # Production build
│
├── custom-backend/             # Backend Go приложение
│   ├── cmd/server/            # Точка входа
│   ├── internal/
│   │   ├── api/              # HTTP handlers
│   │   ├── auth/             # JWT auth
│   │   ├── database/         # БД и миграции
│   │   ├── models/           # Data models
│   │   └── services/         # Бизнес-логика
│   ├── pkg/
│   │   ├── email/            # AWS SES
│   │   ├── middleware/       # HTTP middleware
│   │   └── utils/            # Утилиты
│   └── storage/              # Локальные файлы
│
├── .github/workflows/         # CI/CD
│   └── deploy.yml            # Деплой в AWS
│
├── DEPLOYMENT.md             # Руководство по деплою
├── PROJECT.md                # Этот файл
└── .env.production           # Production переменные
```

---

## 🗄 База данных

### Основные таблицы

```sql
-- Пользователи
users (
  id, username, email, password_hash,
  display_name, bio, avatar_url,
  verified, role, subscription_price,
  created_at, updated_at
)

-- Посты (включая комментарии)
posts (
  id, user_id, content, content_html,
  reply_to_id,      -- NULL = пост, NOT NULL = комментарий
  root_post_id,     -- корневой пост для веток
  metadata JSONB,   -- гибкие данные
  likes_count, replies_count,
  visibility, is_premium, price_cents,
  created_at
)

-- Подписки между пользователями
follows (
  follower_id, following_id, created_at
)

-- Лайки
likes (
  user_id, post_id, created_at
)

-- Уведомления
notifications (
  user_id, from_user_id, type, post_id,
  read, created_at
)

-- Медиа файлы
media (
  id, post_id, user_id, type, url,
  width, height, size, status
)

-- Премиум подписки
subscriptions (
  subscriber_id, creator_id, status,
  price_cents, stripe_sub_id,
  current_period_end, created_at
)
```

---

## 🔐 Аутентификация

### JWT Tokens

```go
// Access Token - 15 минут
{
  "user_id": "uuid",
  "exp": 900,  // 15 мин
  "iat": timestamp
}

// Refresh Token - 30 дней (хранится в Redis)
{
  "user_id": "uuid",
  "exp": 2592000,  // 30 дней
  "type": "refresh"
}
```

### Flow

1. **Регистрация:** POST /auth/register
   - Отправка verification code на email
   - Пользователь неактивен до верификации

2. **Верификация:** POST /auth/verify-email
   - Проверка 6-значного кода
   - Активация аккаунта

3. **Вход:** POST /auth/login
   - Проверка email + password
   - Возврат access + refresh tokens

4. **Обновление:** POST /auth/refresh
   - Проверка refresh token в Redis
   - Выдача нового access token

---

## 🎨 Frontend особенности

### Ключевые компоненты

```typescript
// AuthContext - глобальная аутентификация
const { user, login, logout } = useAuth();

// API клиент с автоматическим refresh
const api = new CustomBackendAPI();
await api.post('/posts/', { content: 'Hello' });

// React Query для кэширования
const { data: posts } = useQuery('posts', fetchPosts);

// Form валидация с Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// ProfilePaywall - закрытый профиль ⭐ NEW
<ProfilePaywall
  authorId={profile.id}
  authorName={profile.display_name}
  subscriptionPrice={30}
  discountedPrice={3}
  discountPercentage={90}
  discountDays={30}
  postsCount={150}
  photosCount={45}
  videosCount={12}
  premiumPostsCount={20}
/>

// useStripePayment - оплата сохраненной картой ⭐ NEW
const { initiatePayment, isProcessing } = useStripePayment();
await initiatePayment({
  amount: 3,
  description: 'Subscription',
  metadata: { type: 'subscription', authorId: '...' }
});

// Toast с вариантами ⭐ NEW
const { toast } = useToast();
toast({
  title: "Успех!",
  description: "Подписка оформлена",
  variant: "success" // default | success | destructive
});
```

### Страницы

- `/` - Главная лента (требует auth)
- `/login` - Вход
- `/register` - Регистрация
- `/profile/:username` - Профиль пользователя
- `/post/:id` - Детальный вид поста
- `/notifications` - Уведомления
- `/admin` - Админ панель (только для админов)

---

## ⚙️ Environment Variables

### Frontend (.env.production)

```bash
# API
VITE_API_URL=https://api.x18.pro

# Features
VITE_ENABLE_COMMENTS=true
VITE_ENABLE_PREMIUM=true
```

### Backend (.env.production)

```bash
# Server
PORT=8080
HOST=0.0.0.0
CORS_ORIGINS=https://app.x18.pro

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_MAX_CONNECTIONS=25

# Redis
REDIS_URL=redis://:pass@host:6379/0

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=720h

# AWS SES
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@x18.pro
AWS_SES_FROM_NAME=X18 Team

# Stripe (для монетизации)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📊 Производительность

### Оптимизации

1. **Frontend**
   - Code splitting по роутам
   - Lazy loading компонентов
   - Image optimization (WebP)
   - React Query кэширование

2. **Backend**
   - Redis кэширование популярных данных
   - Database индексы (user_id, created_at, reply_to_id)
   - Connection pooling (25 connections)
   - GORM preloading для N+1

3. **CDN**
   - CloudFront для статики
   - Gzip/Brotli компрессия
   - Cache-Control headers

### Метрики

- **Response Time:** < 200ms (p95)
- **Database Queries:** < 50ms
- **Redis Cache Hit Rate:** > 80%
- **CDN Cache Hit Rate:** > 95%

---

## 🔄 Deployment

### Автоматический деплой через GitHub Actions

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    - Build React app
    - Upload to S3
    - Invalidate CloudFront cache

  deploy-backend:
    - Build Go binary
    - Build Docker image
    - Push to ECR
    - Update ECS service
```

### Ручной деплой

```bash
# Frontend
cd client
pnpm build:client
aws s3 sync dist/spa/ s3://x18-frontend-bucket/
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"

# Backend
cd custom-backend
docker build -t x18-backend .
docker tag x18-backend:latest <ECR-URL>:latest
docker push <ECR-URL>:latest
aws ecs update-service --cluster x18-cluster --service x18-backend --force-new-deployment
```

Подробнее в [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🐛 Отладка

### Логи

```bash
# Frontend (browser console)
localStorage.debug = 'app:*'

# Backend (CloudWatch)
aws logs tail /ecs/x18-backend --follow

# Database
psql $DATABASE_URL -c "SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;"
```

### Частые проблемы

1. **CORS errors**
   - Проверить CORS_ORIGINS в backend
   - Убедиться что frontend использует правильный API_URL

2. **401 Unauthorized**
   - Проверить JWT token в localStorage
   - Проверить время жизни токена
   - Попробовать /auth/refresh

3. **Email не отправляется**
   - Проверить AWS SES sandbox mode
   - Добавить email в verified addresses
   - Проверить CloudWatch logs

---

## 📈 Roadmap

### Q4 2025
- [x] MVP функционал (посты, комментарии, подписки)
- [x] JWT аутентификация
- [x] Email верификация
- [x] AWS deployment
- [x] CloudFront CDN
- [ ] WebSocket для real-time уведомлений
- [ ] Полноценная монетизация (Stripe)

### Q1 2026
- [ ] Mobile приложение (React Native)
- [ ] Push уведомления
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] API rate limiting

---

## 👥 Team

- **Frontend:** React + TypeScript
- **Backend:** Go + Fiber
- **DevOps:** AWS + GitHub Actions
- **Database:** PostgreSQL + Redis

---

## 📝 Лицензия

Proprietary - All rights reserved

---

**Последнее обновление:** 05.11.2025  
**Версия проекта:** 1.0.0 (1.1.0 в разработке)  
**Production Status:** ✅ Live

---

## 📚 Дополнительная документация

- [FEATURES.md](FEATURES.md) - Полный список реализованных фич
- [CHANGELOG.md](CHANGELOG.md) - История изменений по версиям
- [DEPLOYMENT.md](DEPLOYMENT.md) - Руководство по деплою
- [DEVELOPMENT.md](DEVELOPMENT.md) - Настройка локальной разработки
- [DATABASE.md](DATABASE.md) - Схема базы данных
