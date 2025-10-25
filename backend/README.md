# Backend Architecture

Этот каталог содержит весь backend код проекта, организованный для легкого переноса на отдельный сервер.

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

Frontend будет работать без изменений (все API вызовы уже настроены).

## Endpoints

См. `backend/src/api/routes/README.md` для полного списка endpoints.
