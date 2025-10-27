# Архитектура проекта - Структура Frontend & Backend

## 📂 Общая структура проекта

Ваш проект состоит из **нескольких** компонентов, которые находятся в разных директориях:

```
/Users/devidanderson/Projects/X-18----/  (корневая директория)
│
├── 🎨 FRONTEND (React/TypeScript/Vite)
│   └── client/                    # Основной React фронтенд
│       ├── components/           # React компоненты
│       ├── pages/                # Страницы приложения
│       ├── services/             # API клиенты
│       │   └── api/
│       │       ├── gotosocial.ts  # ✅ Обновлен для custom_metadata
│       │       ├── client.ts
│       │       └── backend.ts
│       ├── hooks/                # React хуки
│       ├── store/                # State management
│       └── ...
│
├── 🔧 BACKEND #1 - GoToSocial (Go)
│   └── gotosocial/               # ✅ Кастомизированный GoToSocial
│       ├── internal/
│       │   ├── gtsmodel/         # Модели данных (✅ custom_metadata)
│       │   ├── api/              # API endpoints (✅ фильтрация)
│       │   ├── processing/       # Бизнес-логика (✅ timeline)
│       │   └── db/               # База данных (✅ JSONB queries)
│       ├── migrations/           # ✅ Добавлена миграция custom_metadata
│       └── ...
│
├── 🔧 BACKEND #2 - Django (Python)
│   └── backend/                  # Django REST API (альтернативный)
│       └── ...
│
├── 🔧 SERVER - Node.js (опционально)
│   └── server/                   # Node.js сервер
│       └── ...
│
└── 📄 Конфигурация
    ├── .env                      # Environment variables
    ├── package.json              # Frontend dependencies
    └── ...
```

---

## 🎯 Какой backend используется?

### У вас **ДВА** backend:

### 1. **GoToSocial Backend** (Go) - ✅ ИСПОЛЬЗУЕМ ЭТОТ
- **Локация:** `gotosocial/`
- **Назначение:** Социальная сеть (посты, timeline, уведомления, подписки)
- **Порт:** `8080` (по умолчанию)
- **Статус:** ✅ **Кастомизирован с поддержкой custom_metadata**
- **API:** `/api/v1/...` (Mastodon-compatible API)

**Что было сделано:**
- ✅ Добавлено поле `custom_metadata` в модель Status
- ✅ Миграция БД для JSONB колонки
- ✅ API endpoints для создания постов с метаданными
- ✅ Фильтрация timeline по метаданным (category, market, symbol, timeframe, risk)
- ✅ Все тесты обновлены

### 2. **Django Backend** (Python) - Дополнительный
- **Локация:** `backend/`
- **Назначение:** Возможно OAuth, платежи, или другие функции
- **Порт:** Обычно `8000`

---

## 🎨 Frontend (React)

### Локация: `client/`

```
client/
├── components/          # UI компоненты
│   ├── PostCard/       # Карточка поста (✅ отображает custom_metadata)
│   ├── CreatePostBox/  # Создание поста (✅ нужно добавить поля метаданных)
│   └── ...
│
├── pages/              # Страницы приложения
│   ├── FeedTest.tsx    # Timeline (✅ нужно добавить фильтры)
│   ├── ProfilePage.tsx # Профиль пользователя
│   ├── SocialNotifications.tsx  # Уведомления
│   └── ...
│
├── services/api/       # ✅ API клиенты (ОБНОВЛЕНЫ)
│   ├── gotosocial.ts   # ✅ Поддержка custom_metadata + фильтрация
│   ├── client.ts       # HTTP клиент
│   └── backend.ts      # Django API клиент
│
├── hooks/              # React хуки
├── store/              # State management
└── ...
```

### Frontend запускается:
```bash
# Из корневой директории проекта
npm run dev
# OR
pnpm dev

# Frontend будет доступен на http://localhost:5173
```

---

## 🔗 Как они связаны?

### Схема взаимодействия:

```
┌─────────────────────────────────────────────────┐
│  BROWSER (http://localhost:5173)                │
│  ┌──────────────────────────────────────────┐   │
│  │  React Frontend (client/)                │   │
│  │  - Feed Page                             │   │
│  │  - Profile Page                          │   │
│  │  - Create Post Modal                     │   │
│  └──────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────┘
                     │
                     │ HTTP Requests
                     │ (fetch/axios)
                     │
        ┌────────────▼────────────┐
        │  API Client Layer       │
        │  (gotosocial.ts)        │
        │  ✅ custom_metadata     │
        │  ✅ filters support     │
        └────────────┬────────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
       │                           │
┌──────▼────────┐         ┌────────▼────────┐
│ GoToSocial    │         │ Django Backend  │
│ (Port 8080)   │         │ (Port 8000)     │
│               │         │                 │
│ ✅ /api/v1/   │         │ /api/           │
│   statuses    │         │ (OAuth, etc)    │
│   timelines   │         │                 │
│   accounts    │         │                 │
└───────┬───────┘         └─────────────────┘
        │
        │
   ┌────▼─────┐
   │ PostgreSQL│
   │ Database  │
   │           │
   │ ✅ custom_│
   │   metadata│
   │   (JSONB) │
   └───────────┘
```

---

## ⚙️ Настройка Environment Variables

### `.env` файл (в корне проекта):

```bash
# ========================================
# FRONTEND CONFIGURATION
# ========================================

# GoToSocial Backend URL
VITE_GOTOSOCIAL_API_URL=http://localhost:8080

# Django Backend URL (если используется)
VITE_BACKEND_API_URL=http://localhost:8000

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=your_client_id
VITE_OAUTH_CLIENT_SECRET=your_client_secret
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# ========================================
# BACKEND CONFIGURATION (GoToSocial)
# ========================================

# Database
GTS_DB_TYPE=postgres
GTS_DB_ADDRESS=localhost
GTS_DB_PORT=5432
GTS_DB_USER=gotosocial
GTS_DB_PASSWORD=your_password
GTS_DB_DATABASE=gotosocial

# Server
GTS_HOST=localhost
GTS_PORT=8080
GTS_PROTOCOL=http

# Account Domain
GTS_ACCOUNT_DOMAIN=localhost:8080
```

---

## 🚀 Запуск проекта

### 1. Запустить GoToSocial Backend:

```bash
# Из корневой директории
cd gotosocial

# Запустить GoToSocial
./gotosocial --config-path ./config.yaml server start

# GoToSocial будет доступен на http://localhost:8080
```

### 2. Запустить Frontend:

```bash
# Из корневой директории (НЕ из client/)
npm run dev
# OR
pnpm dev

# Frontend будет доступен на http://localhost:5173
```

### 3. (Опционально) Запустить Django Backend:

```bash
# Если используется Django
cd backend
python manage.py runserver

# Django будет доступен на http://localhost:8000
```

---

## 📡 API Endpoints

### GoToSocial API (Port 8080)

**Базовый URL:** `http://localhost:8080/api/v1/`

#### ✅ Обновленные endpoints:

```bash
# Создание поста с метаданными
POST /api/v1/statuses
Content-Type: application/json
{
  "status": "EUR/USD Long Setup",
  "custom_metadata": {
    "category": "trade",
    "market": "forex",
    "symbol": "EURUSD",
    "timeframe": "4h",
    "risk": "medium"
  }
}

# Timeline с фильтрацией
GET /api/v1/timelines/home?market=forex&category=trade&symbol=EURUSD

# Profile
GET /api/v1/accounts/verify_credentials

# User statuses
GET /api/v1/accounts/:id/statuses

# Notifications
GET /api/v1/notifications
```

---

## 🔄 Workflow разработки

### Типичный процесс:

1. **Frontend разработка** (`client/`)
   ```bash
   # Работаете в client/pages/ или client/components/
   # Используете API из client/services/api/gotosocial.ts
   ```

2. **Backend кастомизация** (`gotosocial/`)
   ```bash
   # Изменения в gotosocial/internal/
   # Добавление новых endpoints, логики, моделей
   ```

3. **Тестирование**
   ```bash
   # Frontend: http://localhost:5173
   # Backend API: http://localhost:8080/api/v1/
   ```

---

## 📝 Текущий статус

### ✅ Backend (GoToSocial):
- [x] Custom metadata поддержка
- [x] JSONB колонка в БД
- [x] Фильтрация timeline
- [x] Все тесты обновлены
- [x] Готов к использованию

### ✅ Frontend (React):
- [x] API клиент обновлен (`gotosocial.ts`)
- [x] Типы TypeScript обновлены
- [ ] **TODO:** Добавить UI для метаданных в Create Post Modal
- [ ] **TODO:** Добавить фильтры в Feed Page
- [ ] **TODO:** Добавить бейджи метаданных в Post Card

---

## 🎯 Следующие шаги для интеграции

### 1. Обновите `client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx`:

Добавьте поля для метаданных (см. `GOTOSOCIAL_FRONTEND_INTEGRATION_COMPLETE.md`)

### 2. Обновите `client/pages/FeedTest.tsx`:

Добавьте фильтры timeline (см. примеры в документации)

### 3. Обновите `client/components/PostCard/PostCard.tsx`:

Добавьте отображение бейджей метаданных

### 4. Проверьте `.env`:

Убедитесь что `VITE_GOTOSOCIAL_API_URL` указывает на правильный URL

---

## 🔍 Как проверить что все работает

### Test 1: Backend доступен
```bash
curl http://localhost:8080/api/v1/instance
```

### Test 2: Frontend может подключиться к backend
```bash
# Откройте Developer Tools в браузере
# Проверьте Network tab
# Должны видеть запросы к http://localhost:8080/api/v1/...
```

### Test 3: Создание поста с метаданными
```bash
# Используйте Create Post Modal
# Заполните поля метаданных
# Проверьте что пост создался с custom_metadata
```

---

## 📚 Документация

1. **PROJECT_ARCHITECTURE_EXPLAINED.md** (этот файл) - архитектура проекта
2. **GOTOSOCIAL_FRONTEND_INTEGRATION_COMPLETE.md** - примеры кода для интеграции
3. **gotosocial/IMPLEMENTATION_REPORT.md** - технический отчет backend
4. **gotosocial/CUSTOM_METADATA_README.md** - API документация
5. **GOTOSOCIAL_PAGES_INTEGRATION.md** - интеграция страниц

---

## ❓ FAQ

**Q: Почему два backend?**  
A: GoToSocial для социальных функций, Django возможно для OAuth/платежей/других сервисов.

**Q: Где писать код фронтенда?**  
A: В `client/` директории (компоненты, страницы, хуки).

**Q: Где запускать npm команды?**  
A: Из **корневой директории** проекта, НЕ из client/.

**Q: Нужно ли мне менять GoToSocial код?**  
A: Нет! Все изменения уже сделаны. Просто запустите его.

**Q: Как добавить новые поля метаданных?**  
A: Просто передайте их в `custom_metadata` - это flexible `Record<string, string>`.

---

**Автор:** AI Assistant  
**Дата:** 25 октября 2025  
**Статус:** ✅ Готово к разработке
