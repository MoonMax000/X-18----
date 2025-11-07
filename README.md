# X-18 - Социальная сеть для трейдеров

<div align="center">

**Production Ready** ✅

[Live Demo](https://app.x18.pro) • [API Docs](#api-endpoints) • [Getting Started](#quick-start)

</div>

---

## 📋 Обзор

X-18 - современная социальная сеть для трейдеров и инвесторов с функционалом премиум контента, монетизации и real-time уведомлений.

### ⚡ Ключевые возможности

- 📝 Посты и комментарии с медиа
- 👥 Система подписок
- 💰 Монетизация контента
- 🔔 Real-time уведомления
- 🔐 JWT + 2FA аутентификация
- 📧 Email верификация

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+
- Go 1.22+
- PostgreSQL 15+
- Redis 7+
```

### 1. Clone Repository

```bash
git clone https://github.com/MoonMax000/X-18----.git
cd X-18----
```

### 2. Setup Backend

```bash
cd custom-backend
cp .env.example .env
# Отредактируйте .env с вашими параметрами
go mod download
go run cmd/server/main.go
```

Backend запустится на `http://localhost:8080`

### 3. Setup Frontend

```bash
cd client
pnpm install
pnpm dev
```

Frontend запустится на `http://localhost:5173`

---

## 🏗 Архитектура

```
Frontend (React) ──▶ Backend (Go) ──▶ PostgreSQL
                         │
                         ├──▶ Redis (Cache)
                         ├──▶ AWS S3 (Media)
                         └──▶ AWS SES (Email)
```

### Tech Stack

**Frontend:** React 18 • TypeScript • Tailwind CSS • shadcn/ui  
**Backend:** Go 1.22 • Fiber v2 • GORM  
**Database:** PostgreSQL 15 • Redis 7  
**Cloud:** AWS (ECS, S3, SES, CloudFront)

---

## 📚 Документация

- [PROJECT.md](PROJECT.md) - Детальное описание проекта
- [DEVELOPMENT.md](DEVELOPMENT.md) - Настройка разработки
- [DEPLOYMENT.md](DEPLOYMENT.md) - Деплой в production
- [DATABASE.md](DATABASE.md) - Работа с базой данных
- [FEATURES.md](FEATURES.md) - Список возможностей

---

## 🔌 API Endpoints

Base URL: `https://api.x18.pro/api`

### Authentication

```
POST   /auth/register          # Регистрация
POST   /auth/login             # Вход
POST   /auth/refresh           # Обновление токена
POST   /auth/verify-email      # Верификация email
```

### Posts

```
GET    /posts/                 # Список постов
POST   /posts/                 # Создание поста
GET    /posts/:id              # Детали поста
DELETE /posts/:id              # Удаление поста
POST   /posts/:id/like         # Лайк
```

### Users

```
GET    /users/:id              # Профиль
PUT    /users/:id              # Обновление профиля
POST   /users/:id/follow       # Подписка
```

---

## 🌐 Production URLs

- **Frontend:** https://app.x18.pro
- **Backend API:** https://api.x18.pro
- **Admin Panel:** https://app.x18.pro/admin

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

Proprietary - All rights reserved

---

**Версия:** 1.0.0  
**Последнее обновление:** 06.11.2025
