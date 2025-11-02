# Changelog - История изменений X-18

**Формат:** [Keep a Changelog](https://keepachangelog.com/)  
**Версионирование:** [Semantic Versioning](https://semver.org/)

---

## [1.0.0] - 2025-11-02

### Стабильная версия Production Release 🎉

Первый полноценный релиз проекта X-18 в production.

#### Added ✨

**Инфраструктура**
- Полный перенос на AWS (ECS, RDS, ElastiCache, S3, CloudFront, Route 53)
- CI/CD через GitHub Actions с автоматическим деплоем
- CloudFront CDN для frontend (app.x18.pro)
- AWS SES для email верификации
- Custom domains настроены (app.x18.pro, api.x18.pro)
- HTTPS на всех endpoints

**Аутентификация**
- Email верификация с 6-значным кодом (AWS SES)
- JWT аутентификация (access + refresh tokens)
- 2FA (TOTP) с Google Authenticator
- Backup коды для 2FA
- Автоматический refresh токенов при 401

**Профили**
- Auto-save для настроек профиля
- Ограничение смены username (1 раз в 30 дней)
- Username change tracking в БД
- Avatar crop с preview
- Статистика профиля (посты, подписчики, лайки)

**Контент**
- Посты с медиа (изображения, видео)
- Комментарии с древовидной структурой
- Лайки, ретвиты, закладки
- Упоминания (@username)
- Хештеги (#tag)
- Metadata (JSONB) для гибких данных

**UI/UX**
- Адаптивный дизайн (mobile/tablet/desktop)
- Темная тема
- shadcn/ui компоненты
- Toast уведомления
- Skeleton screens для loading states
- Empty states с призывом к действию

**Админ панель**
- Управление пользователями
- Управление контентом
- Управление новостями
- Статистика платформы
- Модерация постов

**Виджеты**
- News widget (RSS feeds)
- Trending tickers
- Community sentiment
- Suggested profiles
- Top authors

#### Changed 🔄

- Миграция с Railway на AWS ECS
- Переход с Resend на AWS SES для email
- Обновлен CORS для production URLs
- Изменена структура хранения session tokens (Redis)
- Оптимизированы database queries с индексами

#### Fixed 🐛

- CORS errors для production endpoints
- Mixed content issues (HTTP → HTTPS)
- Email верификация работает стабильно
- 401 ошибки при expired tokens (auto-refresh)
- Database migrations применяются автоматически
- Username validation для спецсимволов

#### Security 🔐

- HTTPS на всех endpoints
- HttpOnly cookies для refresh tokens
- Rate limiting на критичных endpoints
- SQL injection защита через GORM
- XSS защита через санитизацию HTML
- CSRF токены для форм

---

## [0.9.0] - 2025-10-25

### Beta Release - Подготовка к Production

#### Added ✨

- AWS infrastructure setup
- ECS Fargate deployment
- CloudFront distribution
- Route 53 DNS configuration
- AWS SES email service integration

#### Changed 🔄

- Backend перенесен на AWS ECS
- Frontend на CloudFront CDN
- Database на AWS RDS
- Redis на AWS ElastiCache

#### Fixed 🐛

- Production environment variables
- CORS для новых доменов
- SSL сертификаты

---

## [0.8.0] - 2025-10-15

### 2FA Implementation

#### Added ✨

- TOTP 2FA с Google Authenticator
- QR код для настройки 2FA
- Backup коды (10 штук)
- Защита критичных операций через 2FA
- UI для настройки 2FA в профиле

#### Changed 🔄

- Обновлена модель User с TOTP полями
- Расширен API для 2FA endpoints

---

## [0.7.0] - 2025-10-01

### Profile Enhancements

#### Added ✨

- Auto-save для настроек профиля
- Username change tracking
- Ограничение смены username (30 дней)
- Avatar crop с preview
- Cover image upload

#### Changed 🔄

- Улучшена форма редактирования профиля
- Optimistic UI updates для изменений

#### Fixed 🐛

- Баг с дублированием avatar при загрузке
- Validation для username с спецсимволами

---

## [0.6.0] - 2025-09-15

### Comments System

#### Added ✨

- Комментарии к постам (древовидные)
- Reply to reply functionality
- Вложенность комментариев до 5 уровней
- Счетчик комментариев на постах
- UI для отображения веток комментариев

#### Changed 🔄

- Модель Post расширена полями reply_to_id, root_post_id
- Timeline исключает комментарии (фильтр reply_to_id IS NULL)

---

## [0.5.0] - 2025-09-01

### Email Verification

#### Added ✨

- 6-значный verification code
- Отправка через Resend API
- Срок действия 15 минут
- Повторная отправка кода
- Rate limiting для защиты от спама

#### Changed 🔄

- Регистрация требует верификации email
- User неактивен до подтверждения

#### Fixed 🐛

- Resend API key rotation
- Email templates formatting

---

## [0.4.0] - 2025-08-15

### Media Upload

#### Added ✨

- Загрузка изображений (до 10MB)
- Загрузка видео (до 50MB)
- Image crop функция
- Автоматическая оптимизация
- Превью для media
- Поддержка GIF

#### Changed 🔄

- Увеличен body limit до 50MB
- Добавлено локальное хранилище ./storage/media

---

## [0.3.0] - 2025-08-01

### Widgets & Admin Panel

#### Added ✨

- News widget (CRUD в админ панели)
- Trending tickers widget
- Community sentiment widget
- Suggested profiles widget
- Top authors widget
- Админ панель с базовой статистикой
- Role-based access control (user/admin/moderator)

#### Changed 🔄

- Расширена модель User полем role
- Добавлен middleware RequireAdmin

---

## [0.2.0] - 2025-07-15

### Core Features

#### Added ✨

- JWT аутентификация (access + refresh)
- Refresh token flow
- Redis для session storage
- Timeline (home, user)
- Follow/Unfollow система
- Likes, Retweets, Bookmarks
- Notifications система (базовая)
- Infinite scroll для лент
- React Query для кэширования

#### Changed 🔄

- Миграция с localStorage на Redis для токенов
- Оптимизированы database queries

#### Fixed 🐛

- N+1 проблема в timeline queries
- Memory leaks в WebSocket connections

---

## [0.1.0] - 2025-07-01

### Initial Release (MVP)

#### Added ✨

- Регистрация и вход
- Профили пользователей
- Создание постов (текст only)
- Basic timeline
- Follow система
- PostgreSQL database
- Go backend (Fiber)
- React frontend (Vite + TypeScript)
- Tailwind CSS
- Railway deployment

---

## Типы изменений

- `Added` ✨ - Новая функциональность
- `Changed` 🔄 - Изменения в существующей функциональности
- `Deprecated` ⚠️ - Функциональность которая скоро будет удалена
- `Removed` 🗑️ - Удаленная функциональность
- `Fixed` 🐛 - Исправления багов
- `Security` 🔐 - Исправления уязвимостей

---

## Roadmap (Upcoming)

### [1.1.0] - Планируется Q1 2026

#### Planned ✨

- WebSocket для real-time уведомлений
- Push уведомления (PWA)
- Advanced search с фильтрами
- Polls (опросы)
- DM (Direct Messages) система
- Improved analytics dashboard

### [1.2.0] - Планируется Q1 2026

#### Planned ✨

- Полноценная монетизация (Stripe)
- Premium content gating
- Subscriptions для авторов
- Earnings dashboard
- Payout система

### [2.0.0] - Планируется Q2 2026

#### Planned ✨

- Mobile приложение (React Native)
- Stories
- Live streaming
- Groups / Communities
- Events календарь
- AI модерация контента

---

## Миграции БД

### Migration 015 (2025-10-01)
```sql
-- Username change tracking
ALTER TABLE users ADD COLUMN username_changed_at TIMESTAMP;
CREATE INDEX idx_users_username_changed ON users(username_changed_at);
```

### Migration 014 (2025-10-15)
```sql
-- 2FA TOTP
ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN backup_codes TEXT[];
```

### Migration 013 (2025-09-01)
```sql
-- Email verification
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN verification_code_expires_at TIMESTAMP;
```

### Migration 012 (2025-09-15)
```sql
-- Comments system
ALTER TABLE posts ADD COLUMN reply_to_id UUID REFERENCES posts(id);
ALTER TABLE posts ADD COLUMN root_post_id UUID REFERENCES posts(id);
CREATE INDEX idx_posts_reply_to ON posts(reply_to_id);
CREATE INDEX idx_posts_root_post ON posts(root_post_id);
```

### Migration 011 (2025-08-15)
```sql
-- Media
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    size BIGINT,
    status VARCHAR(20) DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_media_post_id ON media(post_id);
CREATE INDEX idx_media_user_id ON media(user_id);
```

### Migration 010 (2025-08-01)
```sql
-- News widget
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_url TEXT,
    source_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_is_active ON news(is_active);
```

---

## Известные проблемы

### [1.0.0]

- AWS SES в sandbox mode (только верифицированные email)
- WebSocket для real-time пока не реализован (используем polling)
- Mobile версия работает, но есть баги в swipe gestures
- Search функционал базовый (нет full-text search)

---

## Вклад в проект

Для вклада в проект:
1. Создайте issue с описанием проблемы или предложением
2. Fork репозиторий
3. Создайте feature branch
4. Внесите изменения с тестами
5. Создайте Pull Request

См. [DEVELOPMENT.md](DEVELOPMENT.md) для деталей.

---

**Последнее обновление:** 02.11.2025  
**Текущая версия:** 1.0.0  
**Следующий релиз:** 1.1.0 (Q1 2026)
