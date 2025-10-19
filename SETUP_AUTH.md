# Authentication System Setup Guide

Полное руководство по настройке системы авторизации для вашего проекта.

## 📋 Содержание

1. [Установка зависимостей](#установка-зависимостей)
2. [Настройка базы данных](#настройка-базы-данных)
3. [Конфигурация окружения](#конфигурация-окружения)
4. [Интеграция с фронтендом](#интеграция-с-фронтендом)
5. [API Endpoints](#api-endpoints)
6. [Защита маршрутов](#защита-маршрутов)
7. [Тестирование](#тестирование)

---

## 🚀 Установка зависимостей

### Бэкенд пакеты

```bash
pnpm add @supabase/supabase-js bcrypt jsonwebtoken
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

### Фронтенд пакеты (уже установлены)

- axios ✅
- zod ✅
- react ✅

---

## 🗄️ Настройка базы данных

### Вариант 1: Использовать Supabase (Рекомендуется)

1. **Подключите Supabase через MCP:**
   - [Connect to Supabase](#open-mcp-popover)
   - Или создайте проект вручную на [supabase.com](https://supabase.com)

2. **Выполните миграции:**
   ```sql
   -- Скопируйте SQL из файла server/config/database.ts
   -- Выполните в SQL Editor в Supabase Dashboard
   ```

3. **Получите учетные данные:**
   - Project URL: `https://your-project.supabase.co`
   - Service Role Key: из Settings → API

### Вариант 2: Использовать Neon (PostgreSQL)

1. **Подключите Neon через MCP:**
   - [Connect to Neon](#open-mcp-popover)

2. **Выполните те же миграции**

---

## ⚙️ Конфигурация окружения

1. **Скопируйте `.env.example` в `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Заполните переменные окружения:**
   ```env
   # Обязательные
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   JWT_SECRET=generate_strong_random_string_here
   JWT_REFRESH_SECRET=generate_another_strong_random_string
   
   # Опциональные (для production)
   NODE_ENV=production
   CLIENT_URL=https://your-domain.com
   ```

3. **Сгенерируйте секреты для JWT:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

---

## 🔗 Интеграция с фронтендом

### 1. Обновите App.tsx

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Ваш существующий код */}
    </AuthProvider>
  );
}
```

### 2. Используйте useAuth в компонентах

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Теперь вы можете использовать методы авторизации
}
```

### 3. Обновите LoginModal

Ваш�� модальные окна уже готовы к использованию! Просто подключите методы из `useAuth`:

```tsx
// В LoginModal.tsx
const { login, signup, verifyCode } = useAuth();

// Вызов при отправке формы
const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    if (result.requires2FA) {
      setCurrentScreen('2fa');
    } else {
      onClose(); // Закрыть модалку при успехе
    }
  } else {
    setAuthError(result.error);
  }
};
```

---

## 📡 API Endpoints

### Регистрация
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",  // или "phone": "+79991234567"
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "userId": "uuid",
  "message": "User created successfully",
  "verificationCode": "123456"  // только в dev
}
```

### Логин
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (без 2FA):
{
  "success": true,
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": null,
    "lastName": null,
    ...
  }
}

Response (с 2FA):
{
  "success": true,
  "requires2FA": true,
  "userId": "uuid",
  "maskedContact": "u***@example.com",
  "twoFactorCode": "123456"  // только в dev
}
```

### Верификация кода
```http
POST /api/auth/verify
Content-Type: application/json

{
  "userId": "uuid",
  "code": "123456",
  "type": "email_verification"  // или "2fa"
}

Response:
{
  "success": true,
  "message": "Verification successful"
}
```

### Обновление токена
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}

Response:
{
  "success": true,
  "accessToken": "new_jwt_token"
}
```

### Восстановление пароля
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "If the email exists, a reset link has been sent",
  "resetToken": "token"  // только в dev
}
```

### Сброс пароля
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}

Response:
{
  "success": true,
  "message": "Password reset successful"
}
```

### Выход
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔒 Защита маршрутов

### На бэкенде

```typescript
import { authenticateToken } from './middleware/auth';

// Защищенный маршрут
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  // Получить данные пользователя
});
```

### На фронтенде

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Использование
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🧪 Тестирование

### 1. Проверка базы данных

```bash
# Через Supabase Dashboard → SQL Editor
SELECT COUNT(*) FROM users;
SELECT * FROM users LIMIT 5;
```

### 2. Тест API (через curl или Postman)

```bash
# Регистрация
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Логин
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### 3. Тест через фронтенд

1. Откройте приложение
2. Нажмите на аватар → Login
3. Попробуйте зарегистрироваться
4. Проверьте консоль на наличие кода верификации (в dev режиме)
5. Введите код и завершите регистрацию

---

## 📝 Дополнительные возможности для реализации

### Отправка Email (Resend / SendGrid)

```typescript
// server/utils/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Verify your email',
    html: `Your verification code is: <strong>${code}</strong>`
  });
}
```

### Отправка SMS (Twilio)

```typescript
// server/utils/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationSMS(phone: string, code: string) {
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
    body: `Your verification code is: ${code}`
  });
}
```

### 2FA с TOTP (Google Authenticator)

```bash
pnpm add speakeasy qrcode
pnpm add -D @types/speakeasy @types/qrcode
```

---

## 🎯 Следующие шаги

1. ✅ Установить зависимости
2. ✅ Настроить базу данных (Supabase)
3. ✅ Заполнить .env файл
4. ✅ Обновить App.tsx с AuthProvider
5. ✅ Интегрировать useAuth в модальные окна
6. ✅ Протестировать регистрацию и логин
7. 🔄 Добавить отправку email/SMS
8. 🔄 Реализовать профиль пользователя
9. 🔄 Добавить социальные сети (OAuth)

---

## 🆘 Проблемы и решения

### Ошибка: "Module not found: @supabase/supabase-js"
```bash
pnpm add @supabase/supabase-js
```

### Ошибка: "JWT_SECRET is not defined"
Проверьте файл `.env` и убедитесь, что переменные заполнены

### Ошибка при создании пользователя
Проверьте миграции базы данных и убедитесь, что таблицы созданы

### CORS ошибки
Убедитесь, что `CLIENT_URL` в `.env` совпадает с URL вашего фронтенда

---

## 📚 Дополнительные ресурсы

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://github.com/auth0/node-jsonwebtoken)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Готово!** 🎉 Ваша система авторизации полностью настроена и готова к использованию.

Для дальнейшей помощи обращайтесь в документацию или оставляйте вопросы.
