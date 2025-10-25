# ✅ Setup Checklist - Stripe Connect Marketplace

**Статус на данный момент:**
- ✅ Stripe test ключи добавлены
- ✅ Encryption key сгенерирован
- ⚠️ Stripe Client ID нужно получить
- ⚠️ Database нужно настроить

---

## 📋 Что делать дальше

### 1. **Получи Stripe Client ID** 🔴 ВАЖНО!

Без Client ID Stripe Connect не будет работать!

**Инструкция:** `GET_STRIPE_CLIENT_ID.md`

**Кратко:**
1. https://dashboard.stripe.com/test/settings/connect
2. **Get started with Connect** → Platform or marketplace
3. **Integration** → Redirect URIs → добавь:
   ```
   http://localhost:8080/profile?tab=social&subtab=monetization
   ```
4. **OAuth settings** → скопируй `Client ID: ca_...`
5. Обнови `backend/.env`:
   ```env
   STRIPE_CLIENT_ID="ca_..."
   ```

---

### 2. **Настрой Database** 🔴 ВАЖНО!

**Если PostgreSQL уже установлен:**

```bash
# Создай базу данных
createdb tyrian_trade

# Обнови в backend/.env:
DATABASE_URL="postgresql://твой_юзер:твой_пароль@localhost:5432/tyrian_trade"
```

**Если PostgreSQL НЕ установлен:**

```bash
# macOS
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql

# Windows
# Скачай https://www.postgresql.org/download/windows/

# Создай базу
createdb tyrian_trade
```

---

### 3. **Запусти Backend**

```bash
cd backend

# Установи зависимости
npm install

# Генерация Prisma client
npx prisma generate

# Создание таблиц в базе
npx prisma migrate dev --name stripe_connect_marketplace

# Запуск сервера
npm run dev
```

**Backend должен запуститься на:** `http://localhost:3001`

**Проверка:**
```bash
curl http://localhost:3001/health
# Должно вернуть: {"status":"ok","timestamp":"..."}
```

---

### 4. **Тест Stripe Connect**

1. Открой: http://localhost:8080/profile?tab=social&subtab=monetization
2. Должен появиться блок **"Connect Stripe to Start Earning"**
3. Нажми **"Connect with Stripe"**
4. Откроется Stripe OAuth popup
5. Войди/создай test аккаунт
6. Нажми **"Connect"**
7. Вернет обратно → статус **"Stripe Connected"** ✅

---

### 5. **Frontend готов**

Frontend уже настроен и готов работать с backend!

Никаких изменений в frontend не нужно.

---

## 🐛 Troubleshooting

### **Ошибка: "Invalid DATABASE_URL"**

```bash
# Проверь что PostgreSQL запущен
pg_isready

# Проверь DATABASE_URL в .env
cat backend/.env | grep DATABASE_URL

# Создай базу если не существует
createdb tyrian_trade
```

---

### **Ошибка: "Stripe Client ID not configured"**

Значит не добавил `STRIPE_CLIENT_ID` в `.env`

См. шаг 1 выше и инструкцию в `GET_STRIPE_CLIENT_ID.md`

---

### **Ошибка: "Port 3001 already in use"**

```bash
# Убей процесс на порту
lsof -ti:3001 | xargs kill -9

# Или смени порт в backend/.env:
PORT=3002
```

---

### **Backend не запускается**

```bash
# Проверь логи
cd backend
npm run dev

# Проверь что все env переменные заполнены
cat .env

# Убедись что PostgreSQL запущен
pg_isready
```

---

### **Stripe Connect редирект не работает**

1. Проверь что `FRONTEND_URL` в backend/.env = `http://localhost:8080`
2. Проверь что в Stripe Dashboard Redirect URI = `http://localhost:8080/profile?tab=social&subtab=monetization`
3. Они должны **точно совпадать!**

---

## 📊 Чеклист

- [ ] Получил Stripe Client ID
- [ ] Обновил `backend/.env` (STRIPE_CLIENT_ID)
- [ ] PostgreSQL установлен и запущен
- [ ] База данных создана
- [ ] Обновил `DATABASE_URL` в `.env`
- [ ] Запустил `npm install` в backend
- [ ] Запустил `npx prisma generate`
- [ ] Запустил `npx prisma migrate dev`
- [ ] Backend запустился на :3001
- [ ] Health check работает (`curl localhost:3001/health`)
- [ ] Frontend открывается на :8080
- [ ] Страница Monetization загружае��ся
- [ ] Кнопка "Connect with Stripe" появилась
- [ ] OAuth flow работает
- [ ] Stripe Connected статус появился

---

## 🎯 Следующие шаги (после успешного теста)

1. ⬜ **Payment Methods UI** - форма добавления карт для покупателей
2. ⬜ **Purchase Flow** - покупка premium контента
3. ⬜ **Subscriptions** - месячные подписки на авторов
4. ⬜ **Earnings Dashboard** - статистика доходов для авторов
5. ⬜ **Webhooks** - обработка событий от Stripe

---

## 📚 Документация

- `GET_STRIPE_CLIENT_ID.md` - Как получить Client ID
- `STRIPE_MARKETPLACE_SUMMARY.md` - Quick Start
- `STRIPE_CONNECT_MARKETPLACE_COMPLETE.md` - Полная документация
- `QUICK_START_BACKEND.md` - Быстрый старт backend

---

**Текущий приоритет:** Получить Stripe Client ID! 🔴

Без него Stripe Connect не заработает.

**Инструкция:** `GET_STRIPE_CLIENT_ID.md`
