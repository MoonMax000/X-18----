# 🚂 Как Задеплоить Custom Backend на Railway

## 🔴 Текущая Проблема

Railway ещё деплоит старую версию (gotosocial). После удаления папки `gotosocial/`, Railway не знает, что деплоить.

**Ошибки на сайте:**
```
❌ /api/notifications - 404
❌ /api/timeline/explore - 404  
❌ /api/posts - 404
```

## ✅ Решение

Нужно настроить Railway на деплой из папки `custom-backend/`.

### Способ 1: Через Railway Dashboard (Рекомендуется)

1. **Откройте Railway:**
   ```
   https://railway.app/dashboard
   ```

2. **Найдите ваш проект** (где деплоится backend)

3. **Откройте Settings** проекта

4. **Найдите секцию "Build"** или "Root Directory"

5. **Установите Root Directory:**
   ```
   custom-backend
   ```

6. **Установите Build Command:**
   ```
   go build -o main cmd/server/main.go
   ```

7. **Установите Start Command:**
   ```
   ./main
   ```

8. **Сохраните** и нажмите **"Redeploy"**

### Способ 2: Через railway.json

Если в корне проекта есть файл `railway.json`, убедитесь что там:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd custom-backend && go build -o main cmd/server/main.go && ./main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Способ 3: Через Railway CLI

```bash
# Установите Railway CLI (если ещё не установлен)
npm i -g @railway/cli

# Войдите в Railway
railway login

# Линкуйте проект
railway link

# Настройте переменные
railway variables set ROOT_DIR=custom-backend

# Редеплой
railway up
```

## 🔍 Проверка После Деплоя

После того, как Railway задеплоит новую версию, проверьте:

```bash
# 1. Health Check (должен работать)
curl https://api.tyriantrade.com/health

# 2. Custom Backend API (должны работать)
curl https://api.tyriantrade.com/api/notifications
curl https://api.tyriantrade.com/api/timeline/explore
curl https://api.tyriantrade.com/api/posts

# Все должны вернуть ответ (не 404)
```

## 📊 Как Понять Что Деплой Прошёл?

В Railway Dashboard:
1. **Deployments** → смотрите последний деплой
2. Статус должен быть **"Success"** ✅
3. В логах не должно быть ошибок сборки
4. В логах должно быть: `Server starting on port 8080`

## ⚠️ Важные Переменные Окружения

Убедитесь, что в Railway настроены эти переменные:

```bash
DATABASE_URL=postgresql://...     # Ваша база данных
JWT_SECRET=...                     # Секретный ключ
CORS_ORIGIN=https://social.tyriantrade.com,https://admin.tyriantrade.com
BASE_URL=https://api.tyriantrade.com
PORT=8080
```

## 🎯 Ожидаемый Результат

После правильной настройки:

✅ Backend деплоится из `custom-backend/`  
✅ Все API роуты работают (/api/auth, /api/posts, /api/notifications и т.д.)  
✅ Frontend может нормально работать с backend  
✅ Нет ошибок 404 "Route not found"

## 💡 Подсказка

Если Railway показывает ошибку при сборке, проверьте:
- `custom-backend/go.mod` существует
- `custom-backend/cmd/server/main.go` существует  
- Все зависимости установлены
