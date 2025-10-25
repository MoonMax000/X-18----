# Backend Architecture

**Status:** ✅ 85% Complete → 🔴 Database Setup Required → 🚀 Ready to Run

Этот каталог содержит весь backend код проекта, организованный для легкого переноса на отдельный сервер.

---

## ⚡ Quick Start

### 1. Setup Database (Choose One)

**Option A: Supabase** ⭐ Recommended
- [Connect to Supabase](#open-mcp-popover)
- Copy connection string from Supabase Dashboard
- Update `DATABASE_URL` in `.env`

**Option B: Docker**
```bash
docker run --name tyrian-postgres \
  -e POSTGRES_USER=tyrian_user \
  -e POSTGRES_PASSWORD=tyrian_password_2024 \
  -e POSTGRES_DB=tyrian_trade \
  -p 5432:5432 -d postgres:15
```

**Option C: Local PostgreSQL**
```bash
bash setup-db.sh  # macOS/Linux only
```

**📖 See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions**

---

### 2. Install & Initialize

```bash
npm install              # Install dependencies
npm run db:push          # Apply database schema
npm run dev              # Start server
```

**Expected output:**
```
🚀 Backend server running on port 3001
📝 Environment: development
🌐 CORS enabled for: http://localhost:8080
```

**Verify it works:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## 📚 Documentation

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database setup guide (all platforms)
- **[../SESSION_CONTINUATION_SUMMARY.md](../SESSION_CONTINUATION_SUMMARY.md)** - Complete project status
- **[../СЛЕДУЮЩИЕ_ШАГИ.md](../СЛЕДУЮЩИЕ_ШАГИ.md)** - Next steps (Russian)
- **[../PHASE_2_BACKEND_COMPLETE.md](../PHASE_2_BACKEND_COMPLETE.md)** - Backend implementation details

---

## Структура

```
backend/
├── src/
│   ├── api/              # API endpoints (REST)
│   │   ├── routes/       # Route handlers
│   │   ├── controllers/  # Business logic
│   │   └── middleware/   # Auth, validation, etc.
│   ├── services/         # Business services
│   │   ├── stripe/       # Stripe integration
│   │   ├── kyc/          # KYC verification
│   │   ├── analytics/    # Analytics tracking
│   │   └── notifications/ # Email/Push notifications
│   ├── database/         # Database layer
│   │   ├── models/       # Database models (Prisma/TypeORM)
│   │   ├── migrations/   # Database migrations
│   │   └── seeds/        # Seed data
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   └── config/           # Configuration
├── prisma/               # Prisma schema (или другая ORM)
├── scripts/              # Utility scripts
└── tests/                # Backend tests

## Технологии

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js (или Fastify)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + HTTP-only cookies
- **Payments:** Stripe
- **File Storage:** AWS S3 (или Cloudflare R2)
- **Email:** SendGrid (или AWS SES)

## Переход на отдельный backend

Когда будешь переносить на отдельный сервер:

1. Скопируй всю папку `backend/` в новый проект
2. Обнови `backend/src/config/cors.ts` (добавь frontend URL)
3. Обнови переменные окружения в `.env`
4. Запусти миграции: `npm run migrate`
5. Запусти сервер: `npm run start`

Frontend будет работать ��ез изменений (все API вызовы уже настроены).

## Endpoints

См. `backend/src/api/routes/README.md` для полного списка endpoints.
