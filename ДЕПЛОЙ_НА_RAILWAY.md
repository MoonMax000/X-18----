# 🚂 Деплой на Railway - Простая инструкция

**Время:** 5-10 минут  
**Сложность:** ⭐ Легко

---

## 📋 Что нужно сделать

### 1️⃣ Зайди н�� Railway (1 мин)

1. Открой → [railway.app](https://railway.app)
2. Нажми **"Login"**
3. Войди через **GitHub**

---

### 2️⃣ Создай проект (2 мин)

1. Нажми **"New Project"**
2. Выбери **"Deploy from GitHub repo"**
3. Найди и выбери свой репозиторий `tyrian-trade`
4. Railway автоматически определит Node.js проект

**Если спросит Root Directory:**
- Укажи: `backend`

---

### 3️⃣ Добавь переменные окружения (2 мин)

1. В Railway Dashboard кликни на свой проект
2. Перейди во вкладку **"Variables"** (или Settings → Environment)
3. Нажми **"Raw Editor"**
4. Вставь этот блок целиком:

```env
DATABASE_URL=postgresql://postgres:honRic-mewpi3-qivtup@db.htyjjpbqpkgwubgjkwdt.supabase.co:5432/postgres
NODE_ENV=production
PORT=3001
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=ffe29af2f7bb9b687514844ffb26aa7122c5539ecf33549172461b37b8770ae5
STRIPE_SECRET_KEY=sk_test_51SAAyA5L1ldpQtHX17gnzofPNpsvEELkWDNPbCCGBaBTfd3ksebJknSVcsXmg1FPHapHySFbArhbGGJaRwh8k7Dj00lY6E5CSJ
STRIPE_PUBLISHABLE_KEY=pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE
STRIPE_CLIENT_ID=ca_T79vAXmyMeRCfLB7JH9A80KplW3sRJs7
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh
EMAIL_FROM=noreply@tyriantrade.com
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Нажми **"Save"** или **"Update Variables"**

---

### 4️⃣ Запусти деплой (3 мин)

1. Нажми **"Deploy"** (если не начался автоматически)
2. Жди 1-3 минуты
3. Смотри логи деплоя в реальном времени

**Что должно быть в логах:**
```
✔ Prisma schema loaded
✔ Generated Prisma Client
✔ Build complete
🚀 Backend server running on port 3001
```

---

### 5️⃣ Получи публичный URL (1 мин)

1. Перейди в **Settings** → **Networking**
2. Нажми **"Generate Domain"**
3. Railway даст URL вида: `your-project.up.railway.app`

**Скопируй и сохрани этот URL!**

---

### 6️⃣ Обнови BACKEND_URL (1 мин)

1. Вернись в **Variables**
2. Найди переменную `BACKEND_URL`
3. Замени на свой Railway URL:
   ```
   BACKEND_URL=https://your-project.up.railway.app
   ```
4. Сохрани

Railway автоматически перезапустит приложение.

---

### 7️⃣ Проверь что работает (1 мин)

Открой в браузере или терминале:

```bash
# В браузере:
https://your-project.up.railway.app/health

# Или в терминале:
curl https://your-project.up.railway.app/health
```

**Ожидаемый ответ:**
```json
{"status":"ok","timestamp":"2024-01-15T12:34:56.789Z"}
```

---

## ✅ Готово! Backend в продакшене! 🎉

**Твой backend теперь доступен по адресу:**
```
https://your-project.up.railway.app
```

**Все API endpoints работают:**
- `https://your-project.up.railway.app/api/v1/auth/login`
- `https://your-project.up.railway.app/api/v1/profile`
- И все остальные...

---

## 🎯 Что дальше?

### Обнови frontend

1. Открой `client/.env` (или создай если нет)
2. Добавь:
   ```env
   VITE_BACKEND_URL=https://your-project.up.railway.app
   ```
3. Обнови `client/services/api/backend.ts`:
   ```typescript
   const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
   ```

### Задеплой frontend

**Netlify (рекомендуется):**
1. Открой [netlify.com](https://netlify.com)
2. Войди через GitHub
3. "New site from Git" → выбери репозиторий
4. Build settings:
   - Base directory: `./`
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. Environment variables:
   - `VITE_BACKEND_URL=https://your-railway-backend.up.railway.app`

**Или Vercel:**
1. Открой [vercel.com](https://vercel.com)
2. "Import Project" → GitHub
3. Настройки аналогичны Netlify

---

## 🔄 Автоматический деплой

Railway уже настроил автоматический деплой!

**Теперь:**
- Каждый `git push` в `main` → автоматический деплой
- Новая версия live через 2-3 минуты
- Логи доступны в Railway Dashboard

**Отключить автодеплой:**
Settings → Service → Auto Deploy → Off

---

## 💰 Стоимость

**Текущий план:** Бесплатный trial
- $5 кредитов в подарок
- Хватит на ~2 недели тестировани��

**Потом:**
- Hobby: $5/месяц
- Pro: $20/месяц (больше ресурсов)

**Оплата:** Usage-based (платишь только за использование)

---

## 📊 Мониторинг

### Просмотр логов:

1. Railway Dashboard → твой проект
2. Вкладка **"Deployments"**
3. Кликни на активный деплой
4. Смотри логи в реальном времени

### Метрики:

1. Вкладка **"Metrics"**
2. Видишь:
   - CPU usage
   - Memory usage
   - Network traffic
   - HTTP requests

---

## 🐛 Если что-то не работает

### Backend не запускается

**Проверь:**
1. Логи в Railway (ищи ошибки красным цветом)
2. Все ли переменные окружения добавлены
3. `DATABASE_URL` правильный

**Попробуй:**
- Settings → Restart

### 502 Bad Gateway

**Причина:** Приложение не отвечает

**Решение:**
1. Проверь логи
2. Убедись что порт правильный (должен быть `process.env.PORT`)
3. Перезапусти проект

### Database connection error

**Проверь:**
1. `DATABASE_URL` в Variables
2. Пароль правильный: `honRic-mewpi3-qivtup`
3. Supabase проект активен

---

## 🔒 Безопасность

### ⚠️ Важно:

1. **Измени JWT_SECRET** на случайную строку:
   ```bash
   # Сгенерируй случайный ключ:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Не коммить .env** в Git (уже в .gitignore)

3. **Используй разные ключи** для production и development

---

## 🎓 Полезные ссылки

- **Твой Railway Dashboard:** [railway.app/dashboard](https://railway.app/dashboard)
- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com/project/htyjjpbqpkgwubgjkwdt)
- **Полная документация:** [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)

---

## 📞 Помощь

**Если застрял:**
1. Смотри [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) - детальная инструкция
2. Проверь логи в Railway
3. Railway Discord: [discord.gg/railway](https://discord.gg/railway)

---

## ✅ Checklist

- [ ] Создал проект на Railway
- [ ] Добавил переменные о��ружения
- [ ] Деплой прошел успешно
- [ ] Получил публичный URL
- [ ] Обновил BACKEND_URL
- [ ] Проверил `/health` endpoint
- [ ] Обновил frontend с новым BACKEND_URL
- [ ] Задеплоил frontend на Netlify/Vercel
- [ ] Протестировал регистрацию/логин
- [ ] Все работает! 🎉

---

## 🎊 Поздравляю!

**Backend успешно задеплоен на Railway!**

**Статус проекта:**
```
✅ Database: Supabase (готово)
✅ Backend: Railway (готово)
⏳ Frontend: Netlify/Vercel (следующий шаг)
```

**Время деплоя:** ~10 минут  
**Результат:** Работающий backend API в production! 🚀

---

**Следующий шаг:** Деплой frontend на Netlify или Vercel
