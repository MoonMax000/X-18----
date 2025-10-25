# ✅ Railway Deployment Checklist

## 🎯 Быстрая инструкция (5 минут)

### 1. Создай проект на Railway

- [ ] Открой [railway.app](https://railway.app)
- [ ] Войди через GitHub
- [ ] Нажми **"New Project"**
- [ ] ��ыбери **"Deploy from GitHub repo"**
- [ ] Выбери этот репозиторий
- [ ] Установи **Root Directory:** `backend`

---

### 2. Добавь переменные окружения

В Railway Dashboard → **Variables**, добавь:

#### Минимально необходимые:

```env
DATABASE_URL=postgresql://postgres:honRic-mewpi3-qivtup@db.htyjjpbqpkgwubgjkwdt.supabase.co:5432/postgres
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
STRIPE_SECRET_KEY=sk_test_51SAAyA5L1ldpQtHX17gnzofPNpsvEELkWDNPbCCGBaBTfd3ksebJknSVcsXmg1FPHapHySFbArhbGGJaRwh8k7Dj00lY6E5CSJ
STRIPE_PUBLISHABLE_KEY=pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE
STRIPE_CLIENT_ID=ca_T79vAXmyMeRCfLB7JH9A80KplW3sRJs7
RESEND_API_KEY=re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh
EMAIL_FROM=noreply@tyriantrade.com
ENCRYPTION_KEY=ffe29af2f7bb9b687514844ffb26aa7122c5539ecf33549172461b37b8770ae5
```

#### Обновятся автоматически после деплоя:

```env
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=http://localhost:8080
```

**💡 Совет:** Скопируй все сразу из этого блока в Railway Variables!

---

### 3. Задеплой

- [ ] Нажми **"Deploy"** в Railway
- [ ] Жди 1-3 минуты
- [ ] Проверь логи (должно быть "Backend server running")

---

### 4. Получи публичный URL

- [ ] **Settings** → **Networking** → **Generate Domain**
- [ ] Скопируй URL (например: `tyrian-trade.up.railway.app`)
- [ ] Сохрани этот URL!

---

### 5. Обнови переменные

- [ ] Вернись в **Variables**
- [ ] Обнови `BACKEND_URL` на твой Railway URL:
  ```env
  BACKEND_URL=https://tyrian-trade.up.railway.app
  ```

---

### 6. Проверь что работает

```bash
curl https://your-railway-url.up.railway.app/health
```

**Ожидаемый ответ:**
```json
{"status":"ok","timestamp":"2024-01-15T..."}
```

---

## ✅ Готово!

**Backend запущен на Railway!** 🎉

**Твой backend URL:** `https://your-railway-url.up.railway.app`

---

## ⏭️ Что дальше?

1. **Обнови frontend:**
   - Измени `BACKEND_URL` в frontend на Railway URL
   - Задеплой frontend на Netlify/Vercel

2. **Протестируй API:**
   - Попробуй регистрацию
   - Попробуй логин
   - Проверь другие endpoints

3. **Настрой дом��ны** (опционально):
   - Frontend: `tyriantrade.com`
   - Backend: `api.tyriantrade.com`

---

## 📊 Полезные ссылки

- **Railway Dashboard:** [railway.app/dashboard](https://railway.app/dashboard)
- **Документация:** [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)
- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com/project/htyjjpbqpkgwubgjkwdt)

---

**Время на деплой:** ~5 минут  
**Статус:** ✅ Готово к деплою!
