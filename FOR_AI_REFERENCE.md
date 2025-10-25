# 🤖 Справочник для AI - Tyrian Trade Project

> Этот файл создан специально для языковых моделей и разработчиков, чтобы быстро понять структуру проекта.

---

## 📂 Структура проекта

```
tyrian-trade/
├── backend/                    ← Node.js + Express API
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/   ← Бизнес-логика endpoints
│   │   │   ├── routes/        ← API routes (REST)
│   │   │   ├── validators/    ← Zod validation schemas
│   │   │   └── middleware/    ← Auth, validation, errors
│   │   ├── services/          ← Внешние сервисы (S3, Stripe, Email)
│   │   ├── database/          ← Prisma client
│   │   └── utils/             ← Helpers (logger, crypto)
│   └── prisma/
│       └── schema.prisma      ← Database schema
│
└── client/                    ← React + TypeScript frontend
    ├── components/            ← React components
    ├── pages/                 ← Page components
    ├── services/api/          ← API clients
    ├── hooks/                 ← Custom React hooks
    └── lib/                   ← Utilities
```

---

## 🎯 Backend (где что искать)

### Authentication (auth)
**Локация:** `backend/src/api/controllers/auth.controller.ts`

**Endpoints:**
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `POST /api/v1/auth/logout` - Выход

**Важные файлы:**
- Controller: `backend/src/api/controllers/auth.controller.ts`
- Routes: `backend/src/api/routes/auth.routes.ts`
- Validators: `backend/src/api/validators/auth.validator.ts`
- Middleware: `backend/src/api/middleware/auth.ts` (JWT verify)

**Как работает:**
1. User отправляет email + password
2. Validator проверяет данные (Zod)
3. Controller хеширует password (bcrypt)
4. Сохраняет в DB (Prisma)
5. Возвращает JWT token
6. Frontend сохраняет token в localStorage
7. Все запросы идут с header: `Authorization: Bearer TOKEN`

---

### Profile Management (профиль)
**Локация:** `backend/src/api/controllers/profile.controller.ts`

**Endpoints:**
- `GET /api/v1/profile` - Получить профиль
- `PUT /api/v1/profile` - Обновить профиль
- `POST /api/v1/profile/avatar` - Загрузить avatar
- `POST /api/v1/profile/cover` - Загрузить cover
- `GET /api/v1/profile/settings` - Получить настройки

**Важные файлы:**
- Controller: `backend/src/api/controllers/profile.controller.ts`
- Routes: `backend/src/api/routes/profile.routes.ts`
- Validators: `backend/src/api/validators/profile.validator.ts`
- S3 Service: `backend/src/services/storage/s3.service.ts`

**Как работает file upload:**
1. Frontend отправляет `multipart/form-data` с файлом
2. Multer middleware обрабатывает файл → `req.file`
3. Controller вызывает `s3Service.uploadAvatar(file.buffer, ...)`
4. S3 service загружает в AWS S3
5. Возвращается public URL
6. URL сохраняется в DB (user.avatar)
7. Старый файл удаляется из S3

---

### File Uploads (S3)
**Локация:** `backend/src/services/storage/s3.service.ts`

**Методы:**
- `uploadAvatar(file, fileName, mimeType)` → URL
- `uploadCover(file, fileName, mimeType)` → URL
- `deleteFile(url)` → void
- `isConfigured()` → boolean

**Environment variables:**
```env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

**Структура в S3:**
```
s3://bucket/
  ├── avatars/1234567890-abc-image.jpg
  ├── covers/1234567891-def-cover.jpg
  └── kyc/1234567892-ghi-passport.jpg
```

---

### Stripe Connect (monetization)
**Локация:** `backend/src/api/controllers/stripeConnect.controller.ts`

**Endpoints:**
- `GET /api/v1/stripe-connect/oauth-url` - Получить OAuth URL
- `GET /api/v1/stripe-connect/callback` - OAuth callback (от Stripe)
- `GET /api/v1/stripe-connect/account` - Инфо о подключенном аккаунте
- `DELETE /api/v1/stripe-connect/account` - Отключить аккаунт

**Важные файлы:**
- Controller: `backend/src/api/controllers/stripeConnect.controller.ts`
- Service: `backend/src/services/stripe/stripeConnect.service.ts`
- Routes: `backend/src/api/routes/stripeConnect.routes.ts`

**Как работает:**
1. User нажимает "Connect Stripe Account"
2. Frontend вызывает `GET /stripe-connect/oauth-url`
3. Backend генерирует OAuth URL с state=userId
4. User redirect на Stripe OAuth
5. После авторизации Stripe redirect на `callback?code=xxx&state=userId`
6. Backend обменивает code на access_token
7. Сохраняет Stripe account ID в DB
8. Redirect на frontend `/settings?tab=monetization&connected=true`

---

## 🎨 Frontend (где что искать)

### API Clients
**Локация:** `client/services/api/`

**Файлы:**
- `backend.ts` - Наш backend API (auth, profile, stripe)
- `gotosocial.ts` - GoToSocial API
- `stripeConnect.ts` - Stripe Connect API wrapper

**Пример использования:**
```typescript
import { backendApi } from '@/services/api/backend';

// Register
const { user, token } = await backendApi.register({ email, password, username });

// Upload avatar
const { avatar } = await backendApi.uploadAvatar(file);
```

---

### Components

**Auth:**
- `client/components/auth/LoginModal.tsx` - Модалка логина
- `client/components/auth/SignUpModal.tsx` - Модалка регистрации

**Profile:**
- `client/pages/ProfileNew.tsx` - Страница профиля
- `client/components/UserHeader/UserHeader.tsx` - Хедер профиля (avatar, cover)

**Monetization:**
- `client/components/Monetization/StripeConnectSettings.tsx` - Stripe Connect UI
- `client/components/monetization/PaymentModal.tsx` - Payment modal
- `client/components/BillingSettings/BillingSettings.tsx` - Billing & payment methods

---

## 🗄️ Database (Prisma)

**Schema:** `backend/prisma/schema.prisma`

**Основные модели:**

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  username      String   @unique
  firstName     String?
  lastName      String?
  displayName   String?
  bio           String?
  avatar        String?     ← S3 URL
  coverImage    String?     ← S3 URL
  // ...
}

model UserSettings {
  id                String  @id
  userId            String  @unique
  profileVisibility String  @default("public")
  language          String  @default("en")
  timezone          String  @default("UTC")
  // ...
}

model StripeConnectAccount {
  id               String   @id
  userId           String   @unique
  stripeAccountId  String   @unique
  accessToken      String   ← Encrypted
  refreshToken     String?  ← Encrypted
  chargesEnabled   Boolean
  payoutsEnabled   Boolean
  // ...
}
```

**Команды:**
```bash
npm run db:push        # Синхронизировать schema с DB
npm run migrate:dev    # Создать migration
npm run db:studio      # Открыть Prisma Studio (GUI)
```

---

## 🔐 Authentication Flow (полный цикл)

### 1. Registration
```
Frontend                         Backend                      Database
   │                                │                             │
   ├──POST /auth/register──────────>│                             │
   │  { email, password, username } │                             │
   │                                ├──validate (Zod)             │
   │                                ├──hash password (bcrypt)     │
   │                                ├──save user─────────────────>│
   │                                │                             │
   │<─────{ user, token }───────────┤                             │
   │                                │                             │
   ├──localStorage.setItem('token')│                             │
```

### 2. Login
```
Frontend                         Backend                      Database
   │                                │                             │
   ├──POST /auth/login─────────────>│                             │
   │  { email, password }           │                             │
   │                                ├──find user─────────────────>│
   │                                │<────user + passwordHash─────┤
   │                                ├──bcrypt.compare(password)   │
   │                                ├──generate JWT token         │
   │<─────{ user, token }───────────┤                             │
   │                                │                             │
   ├──localStorage.setItem('token')│                             │
```

### 3. Protected Request
```
Frontend                         Backend                      Database
   │                                │                             │
   ├──GET /profile─────────────────>│                             │
   │  Header: Bearer TOKEN          │                             │
   │                                ├──verify JWT (middleware)    │
   │                                ├──find user─────────────────>│
   │                                │<────user data───────────────┤
   │<─────{ user }──────────────────┤                             │
```

---

## 🔧 Environment Variables (что где)

### Backend (`backend/.env`)
```env
# Database
DATABASE_URL="postgresql://..."

# Server
PORT=3001
BACKEND_URL="https://social.tyriantrade.ngrok.pro"  ← ngrok tunnel
FRONTEND_URL="http://localhost:8080"

# JWT
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_S3_BUCKET="bucket-name"
AWS_REGION="us-east-1"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_CLIENT_ID="ca_..."
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8080         ← GoToSocial
VITE_BACKEND_URL=http://localhost:3001     ← Our backend
```

---

## 🧪 Как тестировать

### 1. Запустить backend
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:3001
```

### 2. Тестовые запросы

**Register:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","username":"test"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'
```

**Get Profile:**
```bash
curl http://localhost:3001/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Upload Avatar:**
```bash
curl -X POST http://localhost:3001/api/v1/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@./image.jpg"
```

---

## 🚨 Частые ошибки и решения

### 1. "process is not defined"
**Проблема:** В Vite используется `import.meta.env`, а не `process.env`

**Решение:**
```typescript
// ❌ Wrong
const url = process.env.VITE_API_URL;

// ✅ Correct
const url = import.meta.env.VITE_API_URL;
```

---

### 2. "Duplicate key" warning в React
**Проблема:** Два элемента с одинаковым key в массиве

**Решение:** Убедись что все `id` уникальные в массиве данных
```typescript
// ❌ Wrong
tabs.map(tab => <Tab key={tab.label}>...)

// ✅ Correct
tabs.map(tab => <Tab key={tab.id}>...)
```

---

### 3. "File upload service not configured"
**Проблема:** AWS credentials не настроены

**Решение:** Добавь в `backend/.env`:
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

---

### 4. CORS error
**Проблема:** Backend блокирует запросы с frontend

**Решение:** Проверь `FRONTEND_URL` в `backend/.env`:
```env
FRONTEND_URL="http://localhost:8080"
```

И в `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

## 📝 Как добавить новую фичу

### Пример: Add "Post" feature

**1. Backend:**

```typescript
// 1. Create validator
// backend/src/api/validators/post.validator.ts
export const createPostSchema = z.object({
  body: z.object({
    title: z.string(),
    content: z.string(),
  }),
});

// 2. Create controller
// backend/src/api/controllers/post.controller.ts
class PostController {
  async createPost(req: AuthRequest, res: Response) {
    const { title, content } = req.body;
    const userId = req.user!.id;
    
    const post = await prisma.post.create({
      data: { title, content, userId },
    });
    
    res.json({ post });
  }
}

// 3. Create routes
// backend/src/api/routes/post.routes.ts
router.post('/', authenticate, validateRequest(createPostSchema), postController.createPost);

// 4. Register in index.ts
import postRoutes from './post.routes';
router.use('/posts', postRoutes);
```

**2. Frontend:**

```typescript
// 1. Add API client method
// client/services/api/backend.ts
async createPost(data: { title: string; content: string }) {
  return this.request('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 2. Use in component
const handleCreate = async () => {
  const post = await backendApi.createPost({ title, content });
};
```

---

## 🎓 Best Practices

### Backend
1. **Всегда используй validators** (Zod) для входящих данных
2. **Используй try/catch** в controllers и передавай в `next(error)`
3. **Логируй важные операции** через `logger.info/error`
4. **Не возвращай sensitive data** (passwordHash, tokens)
5. **Используй transactions** для множественных DB операций

### Frontend
1. **Храни tokens в localStorage**, не в state
2. **Используй React Query** для кеширования API запросов (если есть)
3. **Обрабатывай errors** с user-friendly сообщениями
4. **Используй TypeScript types** из `shared/types/`

---

## 📚 Полезные файлы для чтения

**Backend documentation:**
- `PHASE_1_IMPLEMENTATION.md` - Полная документация Phase 1
- `STRIPE_SETUP_NEXT_STEPS.md` - Stripe Connect setup
- `backend/README.md` - Backend README

**Architecture docs:**
- `ARCHITECTURE.md` - Общая архитектура
- `SPECIFICATION.md` - Specification
- `AGENTS.md` - Инструкции для AI

**Status files:**
- `PHASE_1_SUMMARY.md` - Краткое резюме Phase 1
- `BACKEND_INTEGRATION_COMPLETE.md` - Backend integration status

---

## ✅ Quick Checklist для AI

Когда работаешь с этим проектом:

- [ ] Прочитал `PHASE_1_IMPLEMENTATION.md` для контекста
- [ ] Понял где Backend (`backend/src/`) и Frontend (`client/`)
- [ ] Знаю где искать controllers, routes, validators
- [ ] Понял flow: Request → Validator �� Controller → Service → DB
- [ ] Знаю как работает Auth (JWT в `Authorization` header)
- [ ] Понял как работает file upload (Multer → S3)
- [ ] Знаю environment variables (`backend/.env`)
- [ ] Могу добавить новый endpoint по примеру

---

**Если нужна помощь:** Просто скажи "Помоги с [feature]" и укажи что именно нужно сделать.

**Последнее обновление:** Phase 1 completed (2024-01-15)
