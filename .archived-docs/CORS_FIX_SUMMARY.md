# CORS & Auth Token Fix - Summary

## Проблема

Ошибки "Failed to fetch" при попытке загрузить API keys и Stripe settings:

```
TypeError: Failed to fetch
    at BackendApiClient.request
    at BackendApiClient.getApiKeys
    at BackendApiClient.getStripeSettings
```

## Причины

### 1. **CORS блокировка** 🚫
Backend был настроен только на production URL:
```typescript
// Было:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
```

В `backend/.env`:
```
FRONTEND_URL="https://tyrian-trade-frontend.netlify.app"
```

**Проблема:** Localhost:8080 блокировался, т.к. `FRONTEND_URL` был установлен в production URL.

### 2. **Неправильный ключ токена** 🔑
Backend API клиент использовал `auth_token`, а LoginModal сохранял `token`:
```typescript
// Было:
const token = localStorage.getItem('auth_token'); // ❌

// LoginModal сохранял:
localStorage.setItem('token', data.token); // ✅
```

**Проблема:** API запросы не находили токен и отправлялись без авторизации.

## Исправления

### 1. **Обновлен CORS в backend** ✅

**Файл:** `backend/src/index.ts`

```typescript
// CORS - allow both localhost and production
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://tyrian-trade-frontend.netlify.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

**Что изменилось:**
- ✅ Разрешены запросы с `localhost:8080` (dev server)
- ✅ Разрешены запросы с `localhost:5173` (Vite default port)
- ✅ Разрешены запросы с Netlify production
- ✅ Разрешены запросы без origin (Postman, mobile apps)

### 2. **Исправлен ключ токена в BackendApiClient** ✅

**Файл:** `client/services/api/backend.ts`

```typescript
// Было:
private getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('auth_token'); // ❌
  ...
}

// Стало:
private getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token'); // ✅
  ...
}
```

**Обновлены методы:**
- ✅ `getAuthHeader()` - основной метод для всех запросов
- ✅ `uploadAvatar()` - загрузка аватара
- ✅ `uploadCover()` - загрузка обложки
- ✅ `uploadKycDocument()` - загрузка KYC документов

## Как проверить исправления

### 1. После deploy на Railway (5-10 минут)

**Проверьте CORS:**
```bash
curl -H "Origin: http://localhost:8080" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://x-18-production.up.railway.app/api/v1/api-keys \
     -v
```

Должны увидеть:
```
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Allow-Credentials: true
```

### 2. В браузере (после deploy)

**Шаги:**
1. Откройте http://localhost:8080
2. Войдите в систему (Sign In)
3. Откройте DevTools Console (F12)
4. Перейдите на страницу с API Settings
5. Проверьте Console

**Ожидаемый результат:**
```javascript
✅ Token найден: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ API keys загружены успешно
✅ Stripe settings загружены успешно
```

**Если ошибка:**
```javascript
❌ Failed to fetch
```
Значит Railway еще не задеплоил изменения. Подождите 5-10 минут.

### 3. Проверка токена в localStorage

**В Console:**
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('Old token:', localStorage.getItem('auth_token'));
```

**Ожидается:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Old token: null
```

## Deployment Status

### Backend (Railway)
- ✅ CORS исправлен
- ✅ Commits pushed: `0eb31b4`
- ⏳ Railway auto-deploy: ~5-10 минут
- 🔗 URL: https://x-18-production.up.railway.app

### Frontend (Netlify)
- ✅ Token key исправлен в `BackendApiClient`
- ✅ Commits pushed
- ⏳ Netlify auto-deploy: ~2-5 минут
- 🔗 URL: https://tyrian-trade-frontend.netlify.app

## Проверка Railway Deployment

### В Railway Dashboard:
1. Откройте https://railway.app
2. Перейдите в проект "X-18"
3. Нажмите на "Deployments"
4. Посмотрите статус последнего деплоя

**Статусы:**
- 🟡 Building - еще собирается
- 🟢 Success - успешно задеплоено
- 🔴 Failed - ошибка (проверьте logs)

### Проверить logs:
```
1. Откройте Deployment
2. Нажмите "View Logs"
3. Поищите ошибки или "🚀 Backend server running"
```

**Ожидаемые логи:**
```
🚀 Backend server running on port 3001
📝 Environment: production
🌐 CORS enabled for: https://tyrian-trade-frontend.netlify.app
```

## Что дальше?

### После успешн��го deploy:

1. **Очистите localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Войдите заново:**
   - Sign In с вашим email/password
   - Token сохранится с правильным ключом

3. **Проверьте API Settings:**
   - Откройте страницу с API Settings
   - API keys должны загрузиться
   - Stripe settings должны загрузиться

4. **Если все работает:**
   - ✅ CORS исправлен
   - ✅ Auth token работает
   - ✅ Можете использовать все API endpoints

## Troubleshooting

### Если все еще "Failed to fetch"

**1. Проверьте Railway deployment:**
```bash
curl https://x-18-production.up.railway.app/health
```

Должно вернуть:
```json
{"status":"ok","timestamp":"2025-10-25T..."}
```

**2. Проверьте CORS headers:**
```bash
curl -I https://x-18-production.up.railway.app/api/v1/api-keys
```

Должно содержать:
```
Access-Control-Allow-Origin: http://localhost:8080
```

**3. Проверьте token в DevTools:**
```javascript
console.log(localStorage.getItem('token'));
```

Если `null` - нужно войти заново.

**4. Проверьте Network tab:**
- Откройте DevTools → Network
- Попробуйте загрузить API Settings
- Посмотрите на запрос к `/api/v1/api-keys`
- Проверьте Headers → Request Headers → Authorization

Должно быть:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Если видите CORS error в Console:

```
Access to fetch at 'https://...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Решение:**
- Railway еще не задеплоил изменения
- Подождите 5-10 минут
- Проверьте Railway deployment status

### Если видите 401 Unauthorized:

```
HTTP 401 Unauthorized
```

**Решение:**
- Token отсутствует или невалиден
- Войдите заново (Sign In)
- Проверьте `localStorage.getItem('token')`

## Summary

**Исправлено:**
- ✅ CORS настроен для localhost и production
- ✅ Auth token key исправлен на `token`
- ✅ Все методы BackendApiClient обновлены
- ✅ Changes pushed to GitHub
- ⏳ Railway auto-deploy в процессе

**Ожидание:**
- ~5-10 минут для Railway deployment
- ~2-5 минут для Netlify deployment

**После deploy:**
- Очистите localStorage
- Войдите заново
- API Settings должны загрузиться без ошибок
