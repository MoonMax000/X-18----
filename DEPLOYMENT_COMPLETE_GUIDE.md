# 🚀 Полное руководство по деплою проекта

## 📋 Обзор архитектуры

**Ваш проект состоит из:**
- **Frontend (React/TypeScript/Vite)** → Деплой на **Netlify** 
- **Custom Backend (Go)** → Деплой на **Railway**
- **PostgreSQL** → Railway Database
- **Redis** → Railway Redis

---

## 🎯 ЧАСТЬ 1: Деплой Backend на Railway

### Шаг 1: Создание проекта на Railway

1. Откройте [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите ваш репозиторий `X-18----`

### Шаг 2: Настройка PostgreSQL

1. В вашем Railway проекте нажмите **"+ New"**
2. Выберите **"Database" → "PostgreSQL"**
3. Railway автоматически создаст базу данных
4. Скопируйте **DATABASE_URL** из вкладки **Variables**

### Шаг 3: Настройка Redis (опционально)

1. Нажмите **"+ New"**
2. Выберите **"Database" → "Redis"**
3. Скопируйте **REDIS_URL** из вкладки **Variables**

### Шаг 4: Настройка Custom Backend Service

1. Нажмите **"+ New"** → **"GitHub Repo"**
2. Выберите ваш репозиторий
3. В **Settings** → **Service Settings**:
   - **Root Directory**: `custom-backend`
   - **Build Command**: (оставьте пустым, Railway автоопределит Go)
   - **Start Command**: `./server` (или как называется ваш исполняемый файл)

### Шаг 5: Добавление переменных окружения

В Railway Dashboard → **Variables**, добавьте:

```env
# Database (автоматически от Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (если добавили)
REDIS_URL=${{Redis.REDIS_URL}}

# Server
PORT=8080
GIN_MODE=release

# JWT
JWT_SECRET=замените-на-случайную-строку-минимум-32-символа
JWT_EXPIRES_IN=7d

# CORS (обновите после деплоя frontend)
FRONTEND_URL=https://your-app.netlify.app
ALLOWED_ORIGINS=https://your-app.netlify.app

# Email (Resend)
RESEND_API_KEY=re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh
EMAIL_FROM=noreply@tyriantrade.com

# Stripe
STRIPE_SECRET_KEY=sk_test_51SAAyA5L1ldpQtHX17gnzofPNpsvEELkWDNPbCCGBaBTfd3ksebJknSVcsXmg1FPHapHySFbArhbGGJaRwh8k7Dj00lY6E5CSJ
STRIPE_PUBLISHABLE_KEY=pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE

# S3 (если используете)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
AWS_REGION=us-east-1
```

### Шаг 6: Генерация публичного домена

1. В Railway Dashboard → **Settings** → **Networking**
2. Нажмите **"Generate Domain"**
3. Railway даст вам URL вида: `your-backend.up.railway.app`
4. **Сохраните этот URL!** Он понадобится для frontend

### Шаг 7: Первый деплой

1. Railway автоматически начнёт деплой
2. Следите за логами в **Deployments** tab
3. Дождитесь успешного деплоя (зелёный статус)

### Шаг 8: Проверка backend

Откройте в браузере или curl:

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Должно вернуть:
{"status":"ok"}
```

### Шаг 9: Запуск миграций базы данных

Если у вас есть миграции, выполните их через Railway CLI:

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Авторизуйтесь
railway login

# Подключитесь к проекту
railway link

# Выполните миграции
railway run go run custom-backend/cmd/migrate/main.go
```

---

## 🎨 ЧАСТЬ 2: Деплой Frontend на Netlify

### Шаг 1: Подготовка проекта

1. Убедитесь что в корне проекта есть `netlify.toml` (уже есть)
2. Обновите файл `.env` с URL вашего backend

### Шаг 2: Создание сайта на Netlify

1. Откройте [netlify.com](https://app.netlify.com)
2. Войдите через GitHub
3. Нажмите **"Add new site" → "Import an existing project"**
4. Выберите **"GitHub"**
5. Выберите репозиторий `X-18----`

### Шаг 3: Настройка Build Settings

Netlify должен автоматически определить настройки из `netlify.toml`:

- **Build command**: `npm run build:client`
- **Publish directory**: `dist/spa`
- **Base directory**: (оставьте пустым)

Если не определилось, введите вручную.

### Шаг 4: Environment Variables

В Netlify Dashboard → **Site settings** → **Environment variables**, добавьте:

```env
# Backend URL (замените на ваш Railway URL)
VITE_CUSTOM_BACKEND_URL=https://your-backend.up.railway.app

# Stripe (используйте test keys для тестирования)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE
```

### Шаг 5: Deploy!

1. Нажмите **"Deploy site"**
2. Netlify начнёт сборку и деплой
3. Следите за логами в **Deploys** tab
4. Дождитесь успешного деплоя

### Шаг 6: Получение URL

После деплоя Netlify даст вам URL вида:
- `https://random-name-123.netlify.app`

Вы можете изменить название в **Site settings** → **Site details** → **Change site name**

---

## 🔗 ЧАСТЬ 3: Связывание Frontend и Backend

### Обновление CORS на Backend

1. Вернитесь в Railway Dashboard
2. Обновите переменную `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://your-app.netlify.app
   ALLOWED_ORIGINS=https://your-app.netlify.app
   ```
3. Railway автоматически пересоздаст backend

### Обновление API URL на Frontend

1. В Netlify Dashboard → **Environment variables**
2. Убедитесь что `VITE_CUSTOM_BACKEND_URL` указывает на ваш Railway URL
3. Пересоздайте деплой: **Deploys** → **Trigger deploy**

---

## ✅ ЧАСТЬ 4: Проверка работы

### 1. Откройте frontend

```
https://your-app.netlify.app
```

### 2. Проверьте Developer Console

- Не должно быть CORS ошибок
- Запросы к backend должны проходить успешно

### 3. Тестирование функционала

- [ ] Регистрация нового пользователя
- [ ] Вход в систему
- [ ] Создание поста
- [ ] Просмотр timeline
- [ ] Комментарии
- [ ] Уведомления

---

## 🔒 ЧАСТЬ 5: Безопасность в Production

### Railway Backend:

1. **Обновите JWT_SECRET**:
   ```bash
   # Сгенерируйте случайную строку
   openssl rand -base64 32
   ```

2. **Настройте Rate Limiting** (уже есть в коде)

3. **Включите HTTPS** (Railway делает автоматически)

### Netlify Frontend:

1. **Настройте Custom Domain** (опционально):
   - Site settings → Domain management → Add custom domain
   - Настройте DNS у регистратора

2. **Настройте Security Headers** (уже есть в `netlify.toml`)

---

## 📊 ЧАСТЬ 6: Мониторинг

### Railway:

- **Логи**: Deployments → View logs
- **Метрики**: Metrics tab (CPU, Memory, Network)
- **Алерты**: Settings → Configure alerts

### Netlify:

- **Analytics**: Site overview → Analytics
- **Deploy logs**: Deploys → View deploy log
- **Performance**: Site performance metrics

---

## 🚨 Troubleshooting

### Проблема: CORS errors

**Решение:**
```env
# Railway Variables
ALLOWED_ORIGINS=https://your-app.netlify.app,http://localhost:5173
```

### Проблема: Database connection failed

**Решение:**
```bash
# Проверьте DATABASE_URL в Railway
# Убедитесь что PostgreSQL сервис запущен
```

### Проблема: Frontend не может подключиться к backend

**Решение:**
```env
# Netlify Environment Variables
VITE_CUSTOM_BACKEND_URL=https://your-backend.up.railway.app
# (без trailing slash!)
```

### Проблема: Build failed на Railway

**Решение:**
```bash
# Проверьте что custom-backend/go.mod существует
# Убедитесь что Root Directory = "custom-backend"
```

### Проблема: Build failed на Netlify

**Решение:**
```bash
# Проверьте что package.json содержит скрипт "build:client"
# Убедитесь что все зависимости установлены
```

---

## 💰 Стоимость

### Railway:
- **Hobby Plan**: $5/месяц + usage-based
- Для вашего проекта: ~$10-20/месяц
- Включает: PostgreSQL, Redis, Custom Backend

### Netlify:
- **Starter Plan**: $0 (Free)
- **Pro Plan**: $19/месяц (больше bandwidth)
- Для вашего проекта: Free план достаточен для начала

**Общая стоимость:** ~$10-20/месяц для production-ready деплоя

---

## 📝 Checklist перед запуском

### Backend (Railway):
- [ ] PostgreSQL создана и подключена
- [ ] Redis создан (если используется)
- [ ] Все env variables установлены
- [ ] JWT_SECRET обновлён на случайный
- [ ] CORS настроен правильно
- [ ] Public domain сгенерирован
- [ ] Деплой успешен
- [ ] Health check проходит

### Frontend (Netlify):
- [ ] Build успешен
- [ ] Environment variables установлены
- [ ] VITE_CUSTOM_BACKEND_URL указывает на Railway
- [ ] Сайт доступен
- [ ] Нет CORS ошибок
- [ ] API запросы работают

### Интеграция:
- [ ] Frontend может регистрировать пользователей
- [ ] Frontend может создавать посты
- [ ] Timeline загружается
- [ ] Уведомления работают

---

## 🎓 Дополнительные ресурсы

- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)
- [Custom Backend README](custom-backend/README.md)
- [Custom Backend 100% Complete Report](CUSTOM_BACKEND_100_COMPLETE.md)

---

## ⏭️ Следующие шаги

После успешного деплоя:

1. **Custom Domain**:
   - Frontend: `app.tyriantrade.com`
   - Backend: `api.tyriantrade.com`

2. **SSL Certificates**:
   - Railway и Netlify делают автоматически

3. **Мониторинг**:
   - Настройте Sentry для отслеживания ошибок
   - Настройте uptime monitoring

4. **Backups**:
   - Railway делает автоматические backups PostgreSQL
   - Настройте дополнительные backups если нужно

5. **CI/CD**:
   - Автоматический деплой уже настроен через GitHub

---

## 🆘 Нужна помощь?

Если возникли проблемы:

1. Проверьте логи в Railway и Netlify
2. Убедитесь что все env variables установлены правильно
3. Проверьте CORS настройки
4. Попробуйте пересоздать деплой

---

**Готово к деплою!** 🚀

Весь процесс займёт **15-30 минут**.

Следуйте инструкциям шаг за шагом, и ваше приложение будет в интернете!
