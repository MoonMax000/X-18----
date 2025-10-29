# Настройка проекта в VS Code с AI-агентом (Claude Desktop)

## Шаг 1: Установка необходимых инструментов

### 1.1 Установите VS Code
```bash
# Скачайте с официального сайта
https://code.visualstudio.com/
```

### 1.2 Установите Git
```bash
# Проверьте, установлен ли Git
git --version

# Если нет, скачайте с
https://git-scm.com/downloads
```

### 1.3 Установите Node.js и npm
```bash
# Скачайте Node.js LTS версию с
https://nodejs.org/

# Проверьте установку
node --version  # должно быть v18+ или v20+
npm --version
```

### 1.4 Установите Claude Desktop
```bash
# Скачайте с официального сайта Anthropic
https://claude.ai/download

# Или для macOS через Homebrew
brew install --cask claude
```

## Шаг 2: Клонирование проекта

### 2.1 Создайте папку для проектов
```bash
# В удобном месте (например, Documents)
mkdir ~/Projects
cd ~/Projects
```

### 2.2 Клонируйте репозиторий
```bash
git clone https://github.com/MoonMax000/X-18----.git tyrian-trade
cd tyrian-trade
```

### 2.3 Переключитесь на рабочую ветку
```bash
git checkout nova-hub
git pull origin nova-hub
```

### 2.4 Настройте Git credentials
```bash
# Настройте ваше имя и email
git config --global user.name "Kyvaldov"
git config --global user.email "kyvaldov@gmail.com"

# Сохраните credentials для GitHub
git config --global credential.helper store

# При следующем push введите GitHub токен
# Токен можно создать на: https://github.com/settings/tokens
```

## Шаг 3: Установка зависимостей

### 3.1 Frontend зависимости
```bash
# В корне проекта
npm install

# Или если используете pnpm
pnpm install
```

### 3.2 Backend зависимости
```bash
cd backend
npm install

# Сгенерируйте Prisma Client
npx prisma generate
cd ..
```

## Шаг 4: Настройка Environment Variables

### 4.1 Frontend (.env)
```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте .env
cat > .env << 'EOF'
# GoToSocial API URL (now points to our backend)
VITE_API_URL=https://x-18-production.up.railway.app/api/v1

# Backend API URL (Railway)
VITE_BACKEND_URL=https://x-18-production.up.railway.app

# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# App URL
VITE_APP_URL=http://localhost:8080
EOF
```

### 4.2 Backend (.env)
```bash
cd backend

# Создайте .env файл
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:honRic-mewpi3-qivtup@db.htyjjpbqpkgwubgjkwdt.supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-minimum-32-characters-long"

# Backend URL
BACKEND_URL="https://x-18-production.up.railway.app"
FRONTEND_URL="http://localhost:8080"

# Email (Resend)
RESEND_API_KEY="re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh"
EMAIL_FROM="noreply@tyriantrade.com"

# Stripe
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# AWS S3 (для загрузки файлов)
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="tyrian-trade-uploads"

# Node Environment
NODE_ENV="development"
EOF

cd ..
```

## Шаг 5: Открытие проекта в VS Code

### 5.1 Откройте проект
```bash
# Из терминала
code ~/Projects/tyrian-trade

# Или через VS Code: File → Open Folder
```

### 5.2 Установите рекомендуемые расширения

Создайте `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "github.copilot",
    "eamodio.gitlens"
  ]
}
```

### 5.3 Настройте VS Code settings

Создайте `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## Шаг 6: Настройка Claude Desktop с MCP

### 6.1 Найдите конфиг файл Claude Desktop

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### 6.2 Настройте MCP серверы

Отредактируйте `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "postgresql://postgres:honRic-mewpi3-qivtup@db.htyjjpbqpkgwubgjkwdt.supabase.co:5432/postgres"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/YOUR_USERNAME/Projects/tyrian-trade"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

### 6.3 Создайте GitHub Personal Access Token

1. Откройте: https://github.com/settings/tokens
2. Generate new token (classic)
3. Выберите scopes:
   - ✅ repo (full control)
   - ✅ workflow
   - ✅ write:packages
4. Скопируйте токен и добавьте в config

### 6.4 Перезапустите Claude Desktop

После изменения config:
1. Полностью закройте Claude Desktop (Cmd+Q / Alt+F4)
2. Откройте заново
3. MCP серверы должны подключиться автоматически

### 6.5 Проверьте MCP подключение

В Claude Desktop напишите:
```
Покажи мне список таблиц в базе данных
```

Если MCP работает, Claude сможет выполнить запрос к Supabase.

## Шаг 7: Создание контекстного файла для AI

### 7.1 Создайте PROJECT_CONTEXT.md

```bash
cat > PROJECT_CONTEXT.md << 'EOF'
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

### В разработке 🚧
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

### Для AI Reference
- `FOR_AI_REFERENCE.md` - инструкции для AI
- `AGENTS.md` - agent-specific notes
- `PROJECT_CONTEXT.md` - этот файл

## Часто используемые паттерн��

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
EOF
```

### 7.2 Создайте .claudeignore (опционально)

```bash
cat > .claudeignore << 'EOF'
node_modules/
.git/
dist/
build/
.next/
.turbo/
*.log
.env
.env.local
coverage/
EOF
```

## Шаг 8: Работа с Claude Desktop

### 8.1 Начало работы

1. Откройте Claude Desktop
2. Начните новый чат
3. Скажите Claude прочитать контекст:

```
Прочитай файл PROJECT_CONTEXT.md из корня проекта /Users/YOUR_USERNAME/Projects/tyrian-trade и запомни всю информацию о проекте.
```

### 8.2 Примеры команд для Claude

**Чтение кода:**
```
Покажи мне файл client/components/auth/LoginModal.tsx
```

**Изменение кода:**
```
Добавь loading state для кнопки logout в файле client/components/ui/Header/Header.tsx
```

**Git операции:**
```
Создай новую ветку feature/add-logout-loading и закоммить изменения
```

**Database queries:**
```
Покажи мне все таблицы в базе данных
```

**Push на GitHub:**
```
Запуш изменения в ветку nova-hub
```

### 8.3 Проверка доступа к файлам

```
Покажи структуру папок проекта
```

Claude должен показать:
```
tyrian-trade/
├── client/
├── backend/
├── shared/
├── public/
├── .env
├── package.json
└── ...
```

## Шаг 9: Настройка автоматизации

### 9.1 Создайте Git aliases

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### 9.2 Настройте pre-commit hooks (опционально)

```bash
# Установите husky
npm install --save-dev husky

# Инициализируйте
npx husky install

# Добавьте pre-commit hook
npx husky add .husky/pre-commit "npm run lint"
```

## Шаг 10: Тестирование setup

### 10.1 Запустите dev servers

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

### 10.2 Проверьте в браузере
```
http://localhost:8080
```

Должна открыться страница Tyrian Trade.

### 10.3 Проверьте Claude Desktop

В Claude Desktop:
```
Покажи мне список всех environment variables из файла .env
```

Claude должен прочитать файл и показать переменные.

### 10.4 Сделайте тестовый commit

```bash
# Создайте тестовый файл
echo "Test" > test.txt

# Добавьте в Git
git add test.txt
git commit -m "Test commit from local setup"

# Push
git push origin nova-hub

# Удалите тестовый файл
git rm test.txt
git commit -m "Remove test file"
git push origin nova-hub
```

## Troubleshooting

### Claude не видит файлы

**Проверьте путь в config:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/ПОЛНЫЙ/ПУТЬ/К/ПРОЕКТУ"  // <- должен быть абсолютный путь
      ]
    }
  }
}
```

### MCP серверы не подключаются

1. Проверьте логи Claude Desktop:
   ```bash
   # macOS
   ~/Library/Logs/Claude/
   ```

2. Перезапустите Claude полностью (Cmd+Q)

3. Проверьте, что npx работает:
   ```bash
   npx --version
   ```

### Git push не работает

**Настройте SSH ключ:**
```bash
# Сгенерируйте SSH ключ
ssh-keygen -t ed25519 -C "kyvaldov@gmail.com"

# Добавьте в ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Скопируйте публичный ключ
cat ~/.ssh/id_ed25519.pub

# Добавьте на GitHub
# https://github.com/settings/keys
```

**Или используйте HTTPS с токеном:**
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/MoonMax000/X-18----.git
```

## Summary

После выполнения всех шагов у вас будет:

✅ **Локальная копия проекта** в VS Code
✅ **Git настроен** для push/pull
✅ **MCP интеграции** подключены к Claude Desktop:
   - Filesystem (чтение/запись файлов)
   - Supabase (доступ к БД)
   - GitHub (Git операции)
✅ **Контекст проекта** доступен Claude через PROJECT_CONTEXT.md
✅ **Dev servers** запускаются локально

**Теперь вы можете:**
- Писать код в VS Code
- Просить Claude помочь через Desktop app
- Claude видит все файлы проекта
- Claude может делать Git commits и push
- Claude знает всю архитектуру и историю

**Следующие шаги:**
1. Откройте Claude Desktop
2. Скажите: "Прочитай PROJECT_CONTEXT.md и запомни всю информацию"
3. Начните работать над новыми фичами!
