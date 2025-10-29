# 🔑 Как получить РЕАЛЬНЫЙ DATABASE_URL из Railway

## ❌ Проблема
Вы копируете шаблон: `postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@...`
Это НЕ настоящие данные!

## ✅ Решение - 4 простых шага

### Шаг 1: Откройте Railway Dashboard
```
https://railway.app/dashboard
```

### Шаг 2: Найдите сервис PostgreSQL
- В списке проектов найдите "X-18----" 
- Внутри проекта найдите **Postgres** (НЕ "X-18----" основной сервис!)
- Кликните на **Postgres**

### Шаг 3: Откройте вкладку Variables
- В левом меню Postgres сервиса кликните на **"Variables"** (Переменные)
- Найдите переменную **DATABASE_URL**

### Шаг 4: Раскройте значение (САМОЕ ВАЖНОЕ!)
Вы увидите что-то вроде:
```
postgresql://${{PGUSER}}:${{POSTGR... ••••••
```

**ОБЯЗАТЕЛЬНО КЛИКНИТЕ НА ИКОНКУ ГЛАЗА 👁 или кнопку "Show"!**

После клика вы увидите НАСТОЯЩЕЕ значение:
```
postgresql://postgres:KJH234kljh5lkjh3@containers-us-west-123.railway.app:5432/railway
```

### Шаг 5: Скопируйте полностью
- Кликните **Copy** или выделите весь текст
- Значение должно содержать:
  - ✅ Реальный пароль (длинная строка символов, НЕ "ваш_пароль")
  - ✅ Реальный хост (типа containers-us-west-123.railway.app, НЕ viaduct.proxy.rlwy.net)
  - ✅ Реальный порт (например 5432, НЕ 12345)

## 📝 Как использовать

Теперь запустите команды, заменив `РЕАЛЬНЫЙ_URL` на скопированное значение:

### 1. Применить миграцию:
```bash
psql "РЕАЛЬНЫЙ_URL" -f custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql
```

### 2. Сделать себя админом (замените YOUR_EMAIL на ваш email):
```bash
psql "РЕАЛЬНЫЙ_URL" -c "UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';"
```

## 🎯 Пример ПРАВИЛЬНОГО значения:
```
postgresql://postgres:a8Hf9kL2mP5nQ1rT3vW6xY9zA2bC4dE7@containers-us-west-45.railway.app:5432/railway
```

## 🚫 Примеры НЕПРАВИЛЬНЫХ значений:
❌ `postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}...` - это шаблон
❌ `postgresql://postgres:ваш_пароль@viaduct...` - это пример
❌ `РЕАЛЬНЫЙ_DATABASE_URL_ЗДЕСЬ` - это заполнитель

## 💡 Подсказка
Если после клика на 👁 вы видите те же `${{...}}` - значит вы в неправильном месте!
Нужно зайти в **Postgres service**, а не в основной сервис X-18----.

## ❓ Всё ещё не работает?

Попробуйте альтернативный способ через Railway CLI:

```bash
# Установите Railway CLI (если ещё не установлен)
npm install -g @railway/cli

# Войдите в Railway
railway login

# Подключитесь к вашему проекту
railway link

# Получите DATABASE_URL
railway variables --service postgres
```

Эта команда покажет все переменные, включая расшифрованный DATABASE_URL.
