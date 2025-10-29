# 🔧 Решение проблемы подключения к Railway PostgreSQL

## ❌ Проблема

При попытке выполнить `railway run psql` получаем ошибку:
```
psql: error: connection to server at "postgres.railway.internal" (125.235.4.59), port 5432 failed: Operation timed out
```

## 🔍 Причина

Railway CLI использует **внутренний адрес** `postgres.railway.internal`, который работает только внутри Railway контейнеров, но недоступен с вашего локального компьютера.

## ✅ Решение

### Вариант 1: Через Railway Dashboard (РЕКОМЕНДУЕТСЯ)

1. **Откройте Railway Dashboard:**
   - Перейдите на https://railway.app
   - Выберите проект **TT PROD1**
   - Выберите сервис **Postgres**

2. **Скопируйте DATABASE_URL:**
   - Перейдите на вкладку **Variables**
   - Найдите переменную `DATABASE_URL`
   - Нажмите на значок копирования
   - Это будет публичный URL вида: `postgresql://postgres:password@host.railway.app:port/railway`

3. **Подключитесь напрямую:**
   ```bash
   psql "postgresql://postgres:password@host.railway.app:port/railway"
   ```

### Вариант 2: Через правильный railway link (БЫСТРЕЕ)

Проблема в том, что вы связали директорию с сервисом **Postgres**, а нужно связать с **X-18----** (бэкенд), где есть правильный DATABASE_URL.

```bash
# 1. Переключитесь на сервис бэкенда
cd /Users/devidanderson/Projects/X-18----/custom-backend

# 2. Пересвяжите с правильным сервисом
railway link
# Выберите:
# - Workspace: Max's Projects
# - Project: TT PROD1
# - Environment: production
# - Service: X-18---- (НЕ Postgres!)

# 3. Теперь подключитесь
railway run psql $DATABASE_URL
```

### Вариант 3: Использовать переменные напрямую

```bash
# Получить все переменные окружения
railway variables

# Скопировать DATABASE_URL и использовать напрямую
psql "скопированный_DATABASE_URL"
```

## 🎯 Правильная последовательность действий

1. **Убедитесь, что находитесь в директории custom-backend:**
   ```bash
   cd /Users/devidanderson/Projects/X-18----/custom-backend
   ```

2. **Проверьте текущую связь:**
   ```bash
   railway status
   ```

3. **Если связано с Postgres, пересвяжите с бэкендом:**
   ```bash
   railway unlink
   railway link
   # Выберите сервис X-18---- (бэкенд)
   ```

4. **Проверьте переменные:**
   ```bash
   railway variables | grep DATABASE_URL
   ```

5. **Подключитесь:**
   ```bash
   railway run psql $DATABASE_URL
   ```

## 📋 Обновленные скрипты

Я создам обновленные скрипты, которые автоматически получают правильный DATABASE_URL.

## ⚠️ Важно

- **ВСЕГДА** связывайтесь с сервисом **X-18----** (бэкенд), а не с Postgres
- Бэкенд имеет доступ к **публичному** DATABASE_URL
- Сервис Postgres предоставляет только **внутренний** адрес

## 🔐 Альтернатива: Ручное подключение

Если railway run не работает, используйте ручное подключение:

1. Получите DATABASE_URL из Railway Dashboard
2. Подключитесь напрямую:
   ```bash
   psql "postgresql://user:pass@host:port/db"
   ```

---

**Дата создания:** 29 октября 2025  
