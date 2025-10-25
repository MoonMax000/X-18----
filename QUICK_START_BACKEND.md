# ⚡ Quick Start - Backend Setup

**5-минутный гайд по запуску backend сервера**

---

## 1️⃣ Установка

```bash
cd backend
npm install
```

---

## 2️⃣ Настройка .env

```bash
cp .env.example .env
```

Обнови **только эти строки**:

```env
# Database (используй свой PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/tyrian_trade"

# JWT (сгенерируй случайную строку)
JWT_SECRET="your-random-secret-key-here"

# Encryption (сгенерируй 32 байта)
ENCRYPTION_KEY="your-32-byte-hex-string-here"
```

**Генерация секретов:**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3️⃣ Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
```

---

## 4️⃣ Запуск Backend

```bash
npm run dev
```

**Backend запущен на:** `http://localhost:3001`

---

## 5️⃣ Тест интеграции

### Option A: Через UI

1. Открой frontend: `http://localhost:8080`
2. Перейди в: **Profile → API & Integrations**
3. Введи Stripe test ключи:
   - Secret: `sk_test_...` (получи на stripe.com)
   - Publishable: `pk_test_...`
4. Нажми **"Save Settings"**
5. Нажми **"Test Connection"**

✅ Должно появиться: **"Connection successful!"**

### Option B: Через curl

```bash
# Health check
curl http://localhost:3001/health

# Get Stripe settings (requires auth)
curl http://localhost:3001/api/v1/stripe-settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Что дальше?

### Готово к использованию:
- ✅ `/profile?tab=profile&subtab=api` - Stripe настройки
- ✅ API Keys management
- ✅ Database готова

### Нужно доделать:
- ⚠️ Регистрация/Login (Auth routes)
- ⚠️ Profile update endpoints
- ⚠️ File upload (avatars, covers)
- ⚠️ Остальные вкладки настроек

---

## 🐛 Troubleshooting

### Backend не запускается?

**Проблема:** `Error: Invalid DATABASE_URL`
```bash
# Проверь что PostgreSQL запущен
pg_isready

# Проверь DATABASE_URL в .env
cat .env | grep DATABASE_URL
```

**Проблема:** `Error: Prisma Client not generated`
```bash
npx prisma generate
```

**Проблема:** `Port 3001 already in use`
```bash
# Убей процесс на порту 3001
lsof -ti:3001 | xargs kill -9

# Или измени PORT в .env
PORT=3002
```

---

## 📖 Полная документация

- `backend/README.md` - Backend overview
- `BACKEND_INTEGRATION_COMPLETE.md` - Детальная документация
- `backend/prisma/schema.prisma` - Database schema

---

**Готово!** Backend запущен на `http://localhost:3001` 🚀
