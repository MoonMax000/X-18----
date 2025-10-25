# Phase 1 Implementation - Backend Core Features

Это документация по реализации **Фазы 1** backend функционала для Tyrian Trade.

## 📋 Реализовано

### ✅ 1. Authentication (Auth)

**Файлы:**
- `backend/src/api/controllers/auth.controller.ts` - Основная логика аутентификации
- `backend/src/api/routes/auth.routes.ts` - Роуты для auth endpoints
- `backend/src/api/validators/auth.validator.ts` - Zod валидация для auth запросов

**Endpoints:**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Регистрация нового пользователя | ✅ Работает |
| POST | `/api/v1/auth/login` | Вход пользователя | ✅ Работает |
| POST | `/api/v1/auth/logout` | Выход пользователя | ✅ Работает |
| POST | `/api/v1/auth/refresh` | Обновление JWT токена | ⚠️ TODO |
| POST | `/api/v1/auth/forgot-password` | Запрос сброса пароля | ⚠️ Требует Email Service |
| POST | `/api/v1/auth/reset-password` | Сброс пароля по токену | ⚠️ Требует Email Service |
| POST | `/api/v1/auth/verify-email` | Верификация email | ⚠️ Требует Email Service |

**Функционал:**
- ✅ Регистрация с валидацией (email, password strength, username)
- ✅ Login с проверкой credentials
- ✅ JWT token generation
- ✅ Password hashing (bcrypt)
- ✅ Проверка активности аккаунта
- ⚠️ Email verification (требует Email Service)
- ⚠️ Password reset (требует Email Service)
- ⚠️ Refresh token mechanism (TODO)

**Пример запроса (Register):**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Пример ответа:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Пример запроса (Login):**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

---

### ✅ 2. Profile Management

**Файлы:**
- `backend/src/api/controllers/profile.controller.ts` - Profile CRUD + file uploads
- `backend/src/api/routes/profile.routes.ts` - Profile routes
- `backend/src/api/validators/profile.validator.ts` - Zod валидация

**Endpoints:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/profile` | Получить профиль текущего юзера | ✅ |
| PUT | `/api/v1/profile` | Обновить профиль | ✅ |
| POST | `/api/v1/profile/avatar` | Загрузить avatar | ✅ |
| DELETE | `/api/v1/profile/avatar` | Удалить avatar | ✅ |
| POST | `/api/v1/profile/cover` | Загрузить cover image | ✅ |
| DELETE | `/api/v1/profile/cover` | Удалить cover image | ✅ |
| GET | `/api/v1/profile/settings` | Получить настройки юзера | ✅ |
| PUT | `/api/v1/profile/settings` | Обновить настройки | ✅ |

**Функционал:**
- ✅ Получение и обновление профиля
- ✅ File upload (avatar, cover) через Multer + S3
- ✅ Автоматическое удаление старых файлов из S3
- ✅ Валидация image файлов (mimetype check)
- ✅ Лимит размера файла (5MB)
- ✅ User settings management (privacy, language, timezone, etc.)

**Пример запроса (Update Profile):**
```bash
curl -X PUT http://localhost:3001/api/v1/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Crypto trader and investor",
    "location": "New York, USA",
    "website": "https://johndoe.com",
    "role": "Trader",
    "sectors": ["DeFi", "NFT", "Layer 2"]
  }'
```

**Пример запроса (Upload Avatar):**
```bash
curl -X POST http://localhost:3001/api/v1/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Пример ответа:**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar": "https://bucket-name.s3.us-east-1.amazonaws.com/avatars/1234567890-abc123-image.jpg"
}
```

---

### ✅ 3. File Upload Service (S3)

**Файлы:**
- `backend/src/services/storage/s3.service.ts` - AWS S3 интеграция

**Функционал:**
- ✅ Upload файлов в S3 с unique naming
- ✅ Организация по папкам (`avatars/`, `covers/`, `kyc/`)
- ✅ Публичный доступ к файлам (ACL: public-read)
- ✅ Удаление файлов из S3
- ✅ Проверка конфигурации S3

**Методы:**
- `uploadFile(params)` - Общий метод загрузки
- `uploadAvatar(file, fileName, mimeType)` - Загрузка avatar
- `uploadCover(file, fileName, mimeType)` - Загру��ка cover
- `uploadKycDocument(file, fileName, mimeType)` - Загрузка KYC документов
- `deleteFile(url)` - Удаление файла по URL
- `isConfigured()` - Проверка наличия credentials

**Структура файлов в S3:**
```
s3://your-bucket/
  ├── avatars/
  │   └── 1705320000000-abc123-profile.jpg
  ├── covers/
  │   └── 1705320001000-def456-cover.jpg
  └── kyc/
      └── 1705320002000-ghi789-passport.jpg
```

---

## 🔧 Environment Variables

Обнови `backend/.env` с этими переменными:

### AWS S3 Configuration
```env
# AWS S3 (для загрузки аватаров и файлов)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-bucket-name"
AWS_REGION="us-east-1"
```

### Existing Variables (уже настроены)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tyrian_trade"

# Server
NODE_ENV="development"
PORT=3001
BACKEND_URL="https://social.tyriantrade.ngrok.pro"
FRONTEND_URL="http://localhost:8080"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="ffe29af2f7bb9b687514844ffb26aa7122c5539ecf33549172461b37b8770ae5"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_CLIENT_ID="ca_T79v..."
```

---

## 📦 Dependencies

Обновлены зависимости в `backend/package.json`:

**Новые dependencies:**
- `@aws-sdk/client-s3@^3.515.0` - AWS SDK v3 для S3
- `multer@^1.4.5-lts.1` - Multipart/form-data handling для file uploads

**Новые devDependencies:**
- `@types/multer@^1.4.11` - TypeScript типы для multer

**Установка:**
```bash
cd backend
npm install
```

---

## 🗄️ Database Schema

Используется существующая Prisma схема (`backend/prisma/schema.prisma`):

**User Model:**
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
  avatar        String?        // S3 URL
  coverImage    String?        // S3 URL
  location      String?
  website       String?
  role          String?
  sectors       String[]
  emailVerified Boolean  @default(false)
  isActive      Boolean  @default(true)
  isBanned      Boolean  @default(false)
  // ... timestamps и relations
}

model UserSettings {
  id                String  @id @default(uuid())
  userId            String  @unique
  profileVisibility String  @default("public")
  showEmail         Boolean @default(false)
  showLocation      Boolean @default(true)
  language          String  @default("en")
  timezone          String  @default("UTC")
  currency          String  @default("USD")
  preferences       Json?
  // ...
}
```

---

## 🚀 Как запустить

### 1. Установить зависимости
```bash
cd backend
npm install
```

### 2. Настроить .env
Скопируй `.env.example` в `.env` и заполни все переменные (особенно AWS credentials).

### 3. Запустить database migrations
```bash
npm run db:push
# или
npm run migrate:dev
```

### 4. Запустить backend
```bash
npm run dev
```

Backend будет доступен на `http://localhost:3001`

---

## 🧪 Тестирование Endpoints

### Test Auth Flow
```bash
# 1. Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","username":"testuser"}'

# 2. Login (сохрани token из ответа)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Ответ вернет token - используй его в следующих запросах
```

### Test Profile Flow
```bash
# 3. Get Profile
curl -X GET http://localhost:3001/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Update Profile
curl -X PUT http://localhost:3001/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"New bio","location":"NYC"}'

# 5. Upload Avatar (замени путь на реальный image file)
curl -X POST http://localhost:3001/api/v1/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@./test-image.jpg"
```

---

## ✅ Email Service - COMPLETED!

### Email Service Implementation
- ✅ Created `backend/src/services/email/email.service.ts`
- ✅ Integrated **Resend** (modern email provider)
- ✅ Implemented email verification
- ✅ Implemented password reset emails
- ✅ HTML email templates with Tyrian Trade branding
- ✅ Token-based security (24h expiry)

**See:** [EMAIL_SERVICE_SETUP.md](./EMAIL_SERVICE_SETUP.md) for full documentation

## ⚠️ Что еще нужно доделать (TODO)

### Refresh Token Mechanism
- Добавить `RefreshToken` model в Prisma
- Обновить `auth.controller.ts` для работы с refresh tokens
- Реализова��ь rotation и blacklisting

### Остальные контроллеры
- Notifications controller
- Billing controller
- KYC controller (уже есть routes, нужен controller)
- Referrals controller

---

## 📚 Архитектура

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/        ← Бизнес-логика endpoints
│   │   │   ├── auth.controller.ts       ✅ NEW
│   │   │   ├── profile.controller.ts    ✅ NEW
│   │   │   ├── stripe.controller.ts     (существующий)
│   │   │   └── ...
│   │   ├── routes/            ← API routes
│   │   │   ├── auth.routes.ts           ✅ NEW
│   │   │   ├── profile.routes.ts        ✅ UPDATED
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   ├── validators/        ← Zod schemas для валидации
│   │   │   ├── auth.validator.ts        ✅ NEW
│   │   │   ├── profile.validator.ts     ✅ NEW
│   │   │   └── ...
│   │   └── middleware/        ← Middlewares
│   │       ├── auth.ts        (существующий - JWT verify)
│   │       ├── validation.ts  (существующий - Zod wrapper)
│   │       └── errorHandler.ts
│   ├── services/              ← Внешние сервисы
│   │   ├── storage/
│   │   │   └── s3.service.ts           ✅ NEW
│   │   ├── stripe/            (существующие Stripe сервисы)
│   │   │   ├── stripe.service.ts
│   │   │   ├── stripeConnect.service.ts
│   │   │   └── stripeCustomer.service.ts
│   │   └── email/             ⚠️ TODO
│   │       └── email.service.ts
│   ├── database/
│   │   └── client.ts          (Prisma client)
│   ├── utils/
│   │   ├── logger.ts
│   │   └── crypto.ts
│   └── index.ts               (Express app entry point)
└── prisma/
    └── schema.prisma          (Database schema)
```

---

## 🎯 Best Practices

### 1. Error Handling
Все controllers используют `try/catch` и передают errors в `next(error)` для централизованной обработки через `errorHandler` middleware.

### 2. Validation
Zod schemas используются для валидации всех входящих данных через `validateRequest` middleware.

### 3. Authentication
JWT токены ��роверяются через `authenticate` middleware. Все protected routes используют этот middleware.

### 4. Logging
Все важные операции логируются через `logger` utility (winston).

### 5. File Upload
- Файлы валидируются в multer middleware (mimetype, size)
- Старые файлы автоматически удаляются при загрузке новых
- Используется unique naming для предотвращения коллизий

---

## 🐛 Troubleshooting

### S3 Upload Error: "File upload service not configured"
**Проблема:** AWS credentials не настроены.

**Решение:**
```env
# Добавь в backend/.env:
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="your-bucket"
AWS_REGION="us-east-1"
```

### JWT Error: "Invalid token"
**Проблема:** Token expired или неверный.

**Решение:** Получи новый token через `/auth/login`.

### Multer Error: "Only image files are allowed"
**Проблема:** Пытаешься загрузить не-image файл.

**Решение:** Загружай только `.jpg`, `.png`, `.gif`, `.webp`.

---

## 🔐 Security Notes

1. **Passwords:** Хешируются с bcrypt (10 rounds)
2. **JWT Secret:** Храни в `.env`, НЕ коммить в git
3. **S3 Keys:** Храни в `.env`, НЕ коммить в git
4. **CORS:** Настроен только для `FRONTEND_URL`
5. **Rate Limiting:** Уже настроен в `backend/src/index.ts`
6. **File Uploads:** Лимит 5MB, только images

---

## ✅ Checklist для деплоя

- [ ] Все environment variables настроены
- [ ] AWS S3 bucket создан и настроен
- [ ] Database migrations выполнены
- [ ] JWT_SECRET изменен с дефолтного
- [ ] CORS настроен для production domain
- [ ] Rate limiting настроен адекватно
- [ ] Logs настроены (winston -> CloudWatch/Datadog)
- [ ] Email service настроен (SendGrid/SES)
- [ ] Refresh token mechanism реализован

---

## 📞 Контакты

Если нужна помощь с:
- Email service интеграцией
- Refresh token mechanism
- Остальными контроллерами (Notifications, Billing)

Просто скажи нейронке: "Помоги с [название]" и она продолжит с того места, где остановились.

---

**Статус:** Phase 1 ✅ **ЗАВЕРШЕНА**

**Следующий шаг:** Phase 2 - Payment Methods UI + Email Service
