# Authentication Testing Guide

## Что было исправлено

### 1. **Loading States**
- ✅ Добавлены loading indicators для кнопок "Create account" и "Sign In"
- ✅ Кнопки отключаются во время запроса к API
- ✅ Показывается спиннер и текст "Creating account..." / "Signing in..."

### 2. **Debug Logging**
- ✅ Подробное логирование в console для отладки
- ✅ Логи показывают:
  - Клик по кнопке
  - Auth method (email/phone)
  - Backend URL
  - Request payload
  - Response status
  - Response data
  - Errors (network/validation)

### 3. **Проверки**
- Backend health: ✅ https://x-18-production.up.railway.app/health работает
- Frontend dev server: ✅ Работает на localhost:8080
- Environment variables: ✅ VITE_BACKEND_URL настроен

## Как тестировать

### 1. Откройте Browser DevTools Console

```
F12 → Console Tab
```

### 2. Очистите консоль

```
Clear console
```

### 3. Попробуйте зарегистрироваться

**Шаги:**
1. Откройте http://localhost:8080
2. Нажмите Sign Up
3. Выберите Email или Phone
4. Введите данные:
   - Email: `test@example.com`
   - Password: `TestPassword123!` (должен соответствовать требованиям)
   - Confirm Password: `TestPassword123!`
5. Нажмите "Create account"

**Что должно произойти:**

✅ **Успех (если email не существует):**
```javascript
=== SignUp Button Clicked ===
Auth method: email
Email: test@example.com
Backend URL: https://x-18-production.up.railway.app
Sending registration request: {email: 'test@example.com', password: '...', ...}
Response status: 201
Response data: {message: 'Registration successful...', userId: '...'}
✅ Registration successful: {...}
```
- Кнопка показывает спиннер и "Creating account..."
- После успеха открывается VerificationModal
- Проверьте email для verification code

❌ **Ош��бка (если email уже существует):**
```javascript
=== SignUp Button Clicked ===
...
Response status: 400
Response data: {error: 'Email already registered'}
❌ Registration failed: {error: 'Email already registered'}
```
- Под полем email показывается: "This email is already registered"

❌ **Network Error:**
```javascript
=== SignUp Button Clicked ===
...
❌ Registration error (network): TypeError: Failed to fetch
```
- Под полем email показывается: "Connection error. Please try again."

### 4. Попробуйте войти

**Шаги:**
1. Откройте http://localhost:8080
2. Нажмите Log In (или используйте существующий LoginModal)
3. Введите данные:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. Нажмите "Sign In"

**Что должно произойти:**

✅ **Успех:**
```javascript
=== Login Button Clicked ===
Auth method: email
Email: test@example.com
Backend URL: https://x-18-production.up.railway.app
Sending login request: {email: 'test@example.com'}
Response status: 200
Response data: {token: 'eyJhbGci...', user: {...}}
✅ Login successful: {...}
```
- Кнопка показывает спиннер и "Signing in..."
- Token сохраняется в localStorage
- Страница перезагружается
- Пользователь залогинен

❌ **Неверные credentials:**
```javascript
=== Login Button Clicked ===
...
Response status: 401
Response data: {error: 'Invalid email or password'}
❌ Login failed: {error: 'Invalid email or password'}
```
- Показывается ошибка: "Invalid login or password."
- Счетчик попыток уменьшается

## Проверка Environment Variables

### Frontend (.env)
```bash
cat .env
```

Должно быть:
```env
VITE_API_URL=https://x-18-production.up.railway.app/api/v1
VITE_BACKEND_URL=https://x-18-production.up.railway.app
```

### В Browser Console
```javascript
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
```

Должно показать:
```
VITE_BACKEND_URL: https://x-18-production.up.railway.app
```

## Проверка Backend API

### Health Check
```bash
curl https://x-18-production.up.railway.app/health
```

Ответ:
```json
{"status":"ok","timestamp":"2025-10-25T08:47:35.839Z"}
```

### Test Register (через Postman/Insomnia)
```bash
POST https://x-18-production.up.railway.app/api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "TestPassword123!",
  "username": "newuser",
  "firstName": "",
  "lastName": ""
}
```

Ответ (успех):
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "...",
  "email": "newuser@example.com"
}
```

### Test Login (через Postman/Insomnia)
```bash
POST https://x-18-production.up.railway.app/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

Ответ (успех):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "test",
    "emailVerified": false
  }
}
```

## Типичные проблемы

### 1. Кнопка не нажимается

**Причина:** Валидация не пройдена

**Решение:**
- Проверьте, что все поля заполнены
- Email должен быть валидным
- Password должен соответствовать всем требованиям:
  - Минимум 12 символов
  - Uppercase и lowercase буквы
  - Цифра
  - Специаль��ый символ
- Пароли должны совпадать

### 2. "Connection error. Please try again."

**Причина:** Backend недоступен или CORS

**Решение:**
1. Проверьте, что backend запущен:
   ```bash
   curl https://x-18-production.up.railway.app/health
   ```

2. Проверьте CORS настройки в `backend/src/index.ts`:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:8080',
     credentials: true,
   }));
   ```

3. Проверьте Railway environment variables:
   - `FRONTEND_URL` должен содержать `https://tyrian-trade-frontend.netlify.app`
   - Или для localhost: `http://localhost:8080`

### 3. "This email is already registered"

**Причина:** Email уже существует в БД

**Решение:**
- Используйте другой email
- Или войдите с существующим email

### 4. Ничего не происходит

**Причина:** JavaScript ошибки

**Решение:**
1. Откройте Console в DevTools
2. Посмотрите на красные ошибки
3. Если видите `=== SignUp Button Clicked ===`, значит кнопка работает
4. Если не ви��ите логи, значит onClick не срабатывает

### 5. VITE_BACKEND_URL undefined

**Причина:** .env не загружен или неправильное имя переменной

**Решение:**
1. Убедитесь, что `.env` файл в корне проекта
2. Переменные должны начинаться с `VITE_`
3. Перезапустите dev server:
   ```bash
   npm run dev
   ```

## Next Steps

1. **Тестируйте регистрацию** с разными email
2. **Проверьте email** на verification code
3. **Введите код** в VerificationModal
4. **Войдите** с подтвержденным email

## Production Testing

### На Netlify (после deploy)

1. Откройте https://tyrian-trade-frontend.netlify.app
2. Откройте DevTools Console
3. Попробуйте зарегистрироваться/войти
4. Проверьте логи в консоли

**Важно:** Убедитесь, что Netlify Environment Variables настроены:
- `VITE_BACKEND_URL` = `https://x-18-production.up.railway.app`

### Railway Backend Logs

```bash
# В Railway Dashboard
1. Откройте проект "X-18"
2. Перейдите в Deployments
3. Нажмите на ��оследний deployment
4. Посмотрите logs
```

Логи должны показывать:
```
[INFO] New user registered: test@example.com
[INFO] Verification email sent to: test@example.com
[INFO] User logged in: test@example.com
```

## Summary

✅ **Исправлено:**
- Loading states добавлены
- Debug logging добавлен
- Environment variables проверены
- Backend health проверен

📝 **Следующие шаги:**
1. Откройте http://localhost:8080
2. Откройте DevTools Console
3. Попробуйте зарегистрироваться
4. Посмотрите логи в консоли
5. Сообщите, что видите в console

Если увидите ошибки - скопируйте их сюда, и я помогу исправить!
