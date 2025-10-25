# 🚂 Railway Deployment Guide

Полная инструкция по деплою backend на Railway.

---

## ⚡ Быстрый старт (5 минут)

### Шаг 1: Создай аккаунт на Railway

1. Открой [railway.app](https://railway.app)
2. Кликни **"Start a New Project"**
3. Войди через GitHub (рекомендуется)

---

### Шаг 2: Создай новый проект

#### Вариант A: Деплой из GitHub (Рекомендуется)

1. В Railway нажми **"New Project"**
2. Выбери **"Deploy from GitHub repo"**
3. Выбери репозиторий с твоим проектом
4. Railway спросит какую папку деплоить:
   - Установи **Root Directory:** `backend`
   - Или Railway автоматически определит Node.js проект

#### Вариант B: Деплой из локальных файлов

1. Установи Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Авторизуйся:
   ```bash
   railway login
   ```

3. В папке `backend`:
   ```bash
   cd backend
   railway init
   railway up
   ```

---

### Шаг 3: Настрой переменные окружения

В Railway Dashboard:

1. Перейди в **Variables** (или Settings → Environment)
2. Добавь следующие переменные:

#### Обязательные переменные:

```env
# Database (твой Supabase)
DATABASE_URL=postgresql://postgres:honRic-mewpi3-qivtup@db.htyjjpbqpkgwubgjkwdt.supabase.co:5432/postgres

# Server
NODE_ENV=production
PORT=3001

# Frontend URL (обнови после деплоя frontend)
FRONTEND_URL=http://localhost:8080

# Backend URL (Railway даст свой URL, обнови после первого деплоя)
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=ffe29af2f7bb9b687514844ffb26aa7122c5539ecf33549172461b37b8770ae5

# Stripe
STRIPE_SECRET_KEY=sk_test_51SAAyA5L1ldpQtHX17gnzofPNpsvEELkWDNPbCCGBaBTfd3ksebJknSVcsXmg1FPHapHySFbArhbGGJaRwh8k7Dj00lY6E5CSJ
STRIPE_PUBLISHABLE_KEY=pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE
STRIPE_CLIENT_ID=ca_T79vAXmyMeRCfLB7JH9A80KplW3sRJs7
STRIPE_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh
EMAIL_FROM=noreply@tyriantrade.com

# Redis (опционально)
REDIS_URL=

# AWS S3 (опционально)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 💡 Совет: Используй Railway Variables

Railway автоматически предоставляет:
- `${{RAILWAY_PUBLIC_DOMAIN}}` - публичный URL твоего backend
- `${{PORT}}` - порт (обычно 3001)

---

### Шаг 4: Деплой!

#### Если через GitHub:
1. Railway автоматически задеплоит при push в main
2. Или нажми **"Deploy"** в Dashboard

#### Если через CLI:
```bash
railway up
```

**Время деплоя:** 1-3 минуты

---

### Шаг 5: Получи URL backend

После успешного деплоя:

1. В Railway Dashboard перейди в **Settings** → **Networking**
2. Нажми **"Generate Domain"**
3. Railway даст URL вида: `your-project.up.railway.app`

**Сохрани этот URL!**

---

### Шаг 6: Обнови переменные

1. Вернись в **Variables**
2. Обнови:
   ```env
   BACKEND_URL=https://your-project.up.railway.app
   FRONTEND_URL=https://your-frontend-domain.com
   ```

3. Обнови CORS в `backend/src/index.ts` если нужно

---

### Шаг 7: Проверь что работает

```bash
# Health check
curl https://your-project.up.railway.app/health

# Должен вернуть:
{"status":"ok","timestamp":"2024-01-15T..."}
```

---

## 🎯 Custom Domain (опционально)

### Добавить свой домен:

1. В Railway: **Settings** → **Networking** → **Custom Domain**
2. Введи домен: `api.tyriantrade.com`
3. Добавь CNAME запись у регистратора:
   ```
   CNAME api.tyriantrade.com -> your-project.up.railway.app
   ```
4. Railway автоматически настроит SSL (Let's Encrypt)

---

## 🔄 Автоматический деплой (CI/CD)

### Через GitHub:

1. В Railway: **Settings** → **Service**
2. Включи **"Auto Deploy"**
3. Выбери ветку (обычно `main`)

Теперь каждый push в `main` автоматически деплоится!

---

## 📊 Мониторинг

### Логи в реальном времени:

1. В Railway Dashboard: **Deployments**
2. Кликни на активный деплой
3. Смотри логи в реальном времени

### Метрики:

1. **Metrics** tab покажет:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

---

## 💰 Цены

### Бесплатный план:
- $5 в месяц кредитов (примерно 500 часов)
- 1 GB RAM
- 1 vCPU

### Hobby Plan ($5/месяц):
- $5 в месяц подписка + usage-based billing
- До 8 GB RAM
- До 8 vCPU

**Для твоего проекта:** Бесплатного плана хватит на 1-2 недели тестирования

---

## 🚀 Production Checklist

Перед запуском в продакшн:

- [ ] Обнови `JWT_SECRET` на случайную строку
- [ ] Обнови `ENCRYPTION_KEY` на случайную строку
- [ ] Настрой custom domain
- [ ] Включи автоматический деплой из GitHub
- [ ] Проверь все endpoints
- [ ] Настрой мониторинг ошибок (Sentry)
- [ ] Настрой backups базы данных (Supabase автоматически)
- [ ] Обнови `FRONTEND_URL` на реальный домен
- [ ] Проверь CORS настройки
- [ ] Включи production mode (`NODE_ENV=production`)

---

## 🐛 Troubleshooting

### Проблема: Build failed

**Решение:**
1. Проверь логи деплоя в Railway
2. Убедись что `package.json` содержит все зависимости
3. Проверь что `backend/` содержит все нужные файлы

### Проблема: Database connection error

**Решение:**
1. Проверь `DATABASE_URL` в Variables
2. Убедись что Supabase разрешает внешние подключения
3. Проверь что пароль правильный

### Проблема: Application crashed

**Решение:**
1. Смотри логи в Railway Dashboard
2. Проверь что все env variables установлены
3. Попробуй перезапустить: **Settings** → **Restart**

### Проблема: 502 Bad Gateway

**Решение:**
1. Убедись что приложение слушает правильный порт:
   ```javascript
   const PORT = process.env.PORT || 3001;
   ```
2. Проверь что приложение запущено (смотри логи)

---

## 🔒 Безопасность

### Важно:

1. **Никогда** не коммить `.env` в Git
2. Используй разные ключи для production и development
3. Регулярно обновляй зависимости: `npm audit fix`
4. Используй Stripe test keys для тестирования
5. Настрой rate limiting (уже есть в коде)

---

## 📚 Полезные команды Railway CLI

```bash
# Установка
npm install -g @railway/cli

# Авторизация
railway login

# Инициализация проекта
railway init

# Деплой
railway up

# Просмотр логов
railway logs

# Подключение к базе данных
railway connect

# Просмотр переменных
railway variables

# Установка переменной
railway variables set KEY=value

# Открыть проект в браузере
railway open

# Запустить команду в Railway окружении
railway run npm run migrate
```

---

## 🎓 Дополнительные ресурсы

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Templates](https://railway.app/templates)
- [Railway Blog](https://blog.railway.app)

---

## ⏭️ Следующие шаги

После деплоя backend:

1. **Деплой Frontend:**
   - Netlify или Vercel
   - Обнови `BACKEND_URL` в frontend
   
2. **Настрой домены:**
   - Frontend: `tyriantrade.com`
   - Backend: `api.tyriantrade.com`

3. **Интеграция:**
   - Подключи frontend к backend API
   - Протестируй все функции

4. **Мониторинг:**
   - Подключи Sentry для отслеживания ошибок
   - Настрой uptime monitoring

---

## ✅ Что дальше?

**Текущий статус:**
```
✅ Backend код готов
✅ Supabase база данных настроена
✅ Railway конфигурация создана
⏳ Нужно задеплоить на Railway
⏳ Нужно задеплоить frontend
```

**Следующий шаг:** Зайди на [railway.app](https://railway.app) и начни деплой! 🚀

---

**Время на деплой:** 5-10 минут  
**Сложность:** ⭐ Легко  
**Результат:** Работающий backend в продакшене! 🎉
