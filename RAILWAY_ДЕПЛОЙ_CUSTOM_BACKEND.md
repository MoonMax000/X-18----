# 🚂 Railway Деплоит Старый Код! Решение

## 🔴 Проблема

Railway сейчас деплоит **старый backend** (не custom-backend):

**Работают (старый backend):**
- ✅ `/health` - работает
- ✅ `/api/timeline/explore` - работает
- ✅ `/api/notifications` - требует auth (работает)

**НЕ работают (custom-backend роуты):**
- ❌ `/api/auth/signup` - 404
- ❌ `/api/posts` - 404

## 🎯 Причина

Railway настроен на деплой из корня проекта, где находится старый GoToSocial.
Нужно настроить Railway деплоить код из `custom-backend/`

---

## ✅ РЕШЕНИЕ

### Вариант 1: Настроить Root Directory в Railway

1. Открыть https://railway.app
2. Выбрать проект **X-18----**
3. Перейти в **Settings**
4. Найти секцию **Build Configuration**
5. **Root Directory**: указать `custom-backend`
6. **Build Command**: `go build -o main cmd/server/main.go`
7. **Start Command**: `./main`
8. Нажать **Save**
9. Railway автоматически пересоберет проект

### Вариант 2: Создать railway.toml

Создать файл `custom-backend/railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "./main"
```

Затем задеплоить через Git.

---

## 📝 Пошаговая Инструкция (Вариант 1)

### Шаг 1: Открыть Railway Settings

```
1. https://railway.app
2. Выбрать проект X-18----
3. Settings
```

### Шаг 2: Настроить Build

В **Build Configuration** установить:

```
Root Directory: custom-backend
Build Command: go build -o main cmd/server/main.go  
Start Command: ./main
```

### Шаг 3: Проверить Environment Variables

Убедиться что есть:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `CORS_ORIGIN=https://social.tyriantrade.com,https://admin.tyriantrade.com`
- `BASE_URL=https://api.tyriantrade.com`

### Шаг 4: Trigger Deploy

1. **Deployments** → **Trigger Deploy**
2. Подождать 3-5 минут
3. Проверить логи деплоя

---

## 🔍 Проверка После Деплоя

```bash
# Проверить что signup работает
curl -X POST https://api.tyriantrade.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@test.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'

# Должен быть ответ (не 404):
# {"user": {...}, "token": "..."}
```

---

## 🚀 Альтернатива: GitHub Integration

Если у вас настроен GitHub:

### 1. Push код в GitHub

```bash
git add custom-backend/
git commit -m "Add custom-backend for Railway"
git push origin main
```

### 2. Настроить Railway

1. Railway → **Settings** → **Source**
2. Подключить GitHub репозиторий
3. **Root Directory**: `custom-backend`
4. Railway будет автоматически деплоить при push

---

## 📊 Ожидаемый Результат

После правильного деплоя:

**Все роуты будут работать:**
- ✅ `/health`
- ✅ `/api/auth/signup`
- ✅ `/api/auth/login`
- ✅ `/api/posts`
- ✅ `/api/timeline/explore`
- ✅ `/api/notifications`
- ✅ и все остальные

---

## 🐛 Troubleshooting

### Проблема: Build fails

**Проверить логи:**
1. Railway → Deployments → последний деплой
2. Смотреть секцию **Build Logs**

**Частые ошибки:**
- Неправильный Root Directory
- Отсутствует go.mod в custom-backend/
- Неправильный build command

### Проблема: Сервис не стартует

**Проверить:**
1. Start Command правильный: `./main`
2. Executable создан: `go build -o main ...`
3. Environment variables установлены

### Проблема: 404 все еще

**Значит:**
- Railway еще не пересобрал проект
- Или деплоится не из custom-backend/

**Решение:**
1. Проверить Root Directory в Settings
2. Сделать Redeploy
3. Подождать 5 минут

---

## 💡 Важно

### Структура проекта:

```
X-18----/
├── custom-backend/          ← НУЖНО ДЕПЛОИТЬ ЭТО
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   ├── pkg/
│   └── go.mod
├── gotosocial/             ← НЕ ЭТО
├── client/                 ← И НЕ ЭТО (Netlify)
└── ...
```

Railway должен деплоить **custom-backend/**, не корень!

---

## 📞 Что Делать Прямо Сейчас

1. **Открыть** https://railway.app
2. **X-18---- проект** → Settings
3. **Build Configuration**:
   - Root Directory: `custom-backend`
   - Build Command: `go build -o main cmd/server/main.go`
   - Start Command: `./main`
4. **Save**
5. **Deployments** → **Trigger Deploy**
6. Подождать 5 минут
7. Проверить `/api/auth/signup` - должен работать!

---

## ✅ После Настройки

Все будет работать:
- ✅ Frontend (Netlify) → https://social.tyriantrade.com
- ✅ Backend (Railway custom-backend) → https://api.tyriantrade.com
- ✅ CORS настроен
- ✅ Все API роуты доступны

**Ваш сайт заработает полностью! 🎉**
