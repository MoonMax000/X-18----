# Tyrian Trade - Project Context for AI Agent

## Проект
- **Название:** Tyrian Trade
- **Тип:** Social trading platform (Twitter/X клон для трейдеров)
- **Stack:** React + TypeScript (Frontend), Node.js + Express (Backend)

## Архитектура

### Frontend
- **Framework:** React 18 + Vite
- **UI:** Tailwind CSS + shadcn/ui components
- **State:** Redux Toolkit
- **Routing:** React Router v6
- **Deployment:** Netlify
- **URL:** https://tyrian-trade-frontend.netlify.app
- **Dev:** http://localhost:8080

### Backend
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** JWT tokens
- **Email:** Resend API
- **Payment:** Stripe
- **Deployment:** Railway
- **URL:** https://x-18-production.up.railway.app

### Database
- **Provider:** Supabase (PostgreSQL)
- **Host:** db.htyjjpbqpkgwubgjkwdt.supabase.co
- **Connection:** через Prisma ORM

## Основные фичи

### Реализовано ✅
1. **Authentication:**
   - Email/Password регистрация
   - Email verification (6-digit code)
   - JWT tokens
   - LoginModal и SignUpModal

2. **Profile:**
   - User profiles
   - Avatar upload
   - Cover image upload
   - Bio and settings

3. **API Integration:**
   - Backend API client (`client/services/api/backend.ts`)
   - GoToSocial API client (`client/services/api/gotosocial.ts`)
   - Stripe integration

4. **Settings Pages:**
   - API Settings (keys management)
   - Billing Settings
   - KYC Settings
   - Notifications Settings
   - Stripe Connect Settings

5. **Monetization:**
   - Stripe Connect for creators
   - Payment methods
   - Referrals system

### В разработк�� 🚧
1. GoToSocial integration (отдельный Go сервис)
2. Trading signals (платные посты)
3. Subscriptions
4. Live streaming

## Важные изменения (последняя сессия)

### CORS Fix
- Добавлен CORS для localhost:8080 и production
- Файл: `backend/src/index.ts`

### Auth Token Fix
- Исправлен ключ токена с `auth_token` на `token`
- Файл: `client/services/api/backend.ts`

### Email Verification
- 6-значные коды вместо hex токенов
- Интеграция с VerificationModal
- Отправка через Resend

### Loading States
- Добавлены спиннеры для кнопок Sign In / Create Account
- Debug logging в console

## Git Workflow

### Branches
- `main` - production branch
- `nova-hub` - development branch (текущая работа)

### Pull Request
- URL: https://github.com/MoonMax000/X-18----/pull/1
- Status: Open, готов к merge

### Deployment
- Frontend: автоматический deploy при push в `nova-hub` → Netlify
- Backend: автоматический deploy при push → Railway

## Environment Variables

### Критические переменные
- `DATABASE_URL` - Supabase connection string
- `JWT_SECRET` - для токенов
- `RESEND_API_KEY` - для email
- `VITE_BACKEND_URL` - frontend → backend connection

### Не коммитить в Git
- `.env` файлы (в .gitignore)
- Секреты и токены
- API keys

## Команды для разработки

### Frontend
```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
npm run dev          # Start dev server (localhost:3001)
npm run build        # Compile TypeScript
npm start            # Start production server
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate   # Run migrations
```

## Документация

### Основные файлы
- `README.md` - общая информация
- `ARCHITECTURE.md` - архитектура
- `EMAIL_VERIFICATION_FIXED.md` - email setup
- `CORS_FIX_SUMMARY.md` - CORS fix details
- `AUTH_TESTING_GUIDE.md` - как тестировать auth
- `SETUP_VS_CODE_WITH_AI.md` - настройка VS Code с AI

### Для AI Reference
- `FOR_AI_REFERENCE.md` - инструкции для AI
- `AGENTS.md` - agent-specific notes
- `PROJECT_CONTEXT.md` - этот файл

## Часто используемые паттерны

### API Calls
```typescript
import { backendApi } from '@/services/api/backend';

const data = await backendApi.getProfile();
```

### Auth Check
```typescript
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

### Modal Pattern
```typescript
const [isOpen, setIsOpen] = useState(false);

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  {/* content */}
</Dialog>
```

## Troubleshooting

### Common Issues
1. **"Failed to fetch"** - проверьте CORS и backend URL
2. **401 Unauthorized** - войдите заново, проверьте token
3. **Database errors** - проверьте DATABASE_URL
4. **Email не приходят** - проверьте RESEND_API_KEY

### Debug Tools
- Browser DevTools Console (F12)
- Network tab для API calls
- Prisma Studio для БД
- Railway logs для backend
- Netlify logs для frontend

## Следующие шаги

1. **GoToSocial Integration:**
   - Форкнуть https://github.com/superseriousbusiness/gotosocial
   - Добавить custom metadata
   - Deploy на Railway

2. **Paid Posts:**
   - Реализовать access control
   - Stripe payments integration
   - Unlock механизм

3. **Tests:**
   - Unit tests с Vitest
   - E2E tests с Playwright

## Контакты и ресурсы

- **GitHub:** https://github.com/MoonMax000/X-18----
- **Frontend (Netlify):** https://tyrian-trade-frontend.netlify.app
- **Backend (Railway):** https://x-18-production.up.railway.app
- **Database (Supabase):** https://supabase.com/dashboard/project/htyjjpbqpkgwubgjkwdt
