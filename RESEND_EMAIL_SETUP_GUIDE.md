# 📧 Resend Email Integration - Setup Guide

## Обзор

Интегрирована система отправки email-уведомлений через Resend API для:
- Email-верификации при регистрации
- Сброса пароля
- 2FA-кодов при входе
- Подтверждения включения 2FA

## 🔧 Настройка для Development

### 1. Получить API ключ Resend

1. Зарегистрируйтесь на https://resend.com
2. Создайте новый API ключ в Dashboard
3. Скопируйте API ключ (начинается с `re_`)

### 2. Настроить локальное окружение

Добавьте в `custom-backend/.env`:

```env
RESEND_API_KEY=re_BKqv1J39_4uLyK6KWKn4jvvztrZBRvyBv
RESEND_FROM_EMAIL=noreply@tyriantrade.com
```

**Важно**: В development режиме Resend может отправлять email только на:
- Verified email addresses в вашем аккаунте
- Email addresses в вашем домене (если домен verified)

### 3. Запустить backend

```bash
cd custom-backend
go run cmd/server/main.go
```

При старте вы увидите:
```
✅ Resend email client initialized (from: noreply@tyriantrade.com)
```

Если API ключ не настроен:
```
⚠️  Warning: RESEND_API_KEY not set - email sending will be disabled
```

## 🚀 Настройка для Production (Railway)

### 1. Добавить переменные окружения в Railway

В Railway Dashboard → custom-backend service → Variables:

```
RESEND_API_KEY=re_ВАШ_PRODUCTION_API_KEY
RESEND_FROM_EMAIL=noreply@tyriantrade.com
```

### 2. Верифицировать домен в Resend

Для production необходимо верифицировать домен:

1. Откройте Resend Dashboard → Domains
2. Добавьте домен `tyriantrade.com`
3. Добавьте DNS записи (SPF, DKIM, DMARC) в настройки вашего DNS провайдера
4. Дождитесь верификации (обычно 5-10 минут)

### 3. Обновить FROM email address

После верификации домена используйте verified email:

```env
RESEND_FROM_EMAIL=noreply@tyriantrade.com
# или
RESEND_FROM_EMAIL=support@tyriantrade.com
```

### 4. Деплой

```bash
# Railway автоматически задеплоит после push
git add .
git commit -m "Add Resend email integration"
git push origin main
```

## 📨 API Endpoints

### 1. Register (автоматическая отправка verification email)
```bash
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {...},
  "access_token": "...",
  "token_type": "Bearer"
}
```

Email с кодом верификации будет отправлен автоматически.

### 2. Verify Email
```bash
POST /api/auth/verify/email
Authorization: Bearer <token>
{
  "code": "123456"
}
```

### 3. Resend Verification Email
```bash
POST /api/auth/resend-verification
Authorization: Bearer <token>
{
  "type": "email"  // или "password_reset" или "2fa"
}
```

### 4. Password Reset Request
```bash
POST /api/auth/password/reset
{
  "email": "test@example.com"
}
```

Email с кодом сброса пароля будет отправлен.

### 5. Login with 2FA
```bash
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

Если 2FA включен и method = "email", код будет отправлен на email.

### 6. Enable 2FA
```bash
POST /api/auth/2fa/enable
Authorization: Bearer <token>
{
  "method": "email",
  "password": "SecurePass123!"
}
```

Код подтверждения будет отправлен на email.

## 🎨 Email Templates

Все email используют фирменный стиль с фиолетовым градиентом:

### Email Verification
- **Subject**: "Verify Your Email Address"
- **Content**: 6-digit verification code
- **Expires**: 10 минут

### Password Reset
- **Subject**: "Reset Your Password"
- **Content**: 6-digit reset code
- **Expires**: 10 минут

### 2FA Code
- **Subject**: "Your Two-Factor Authentication Code"
- **Content**: 6-digit 2FA code
- **Expires**: 5 минут

## 🧪 Тестирование

### Локальное тестирование

1. Запустите backend:
```bash
cd custom-backend
go run cmd/server/main.go
```

2. Зарегистрируйте пользователя:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "your-verified-email@example.com",
    "password": "SecurePass123!"
  }'
```

3. Проверьте email на вашем verified адресе
4. Используйте код для верификации:
```bash
curl -X POST http://localhost:8080/api/auth/verify/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "code": "123456"
  }'
```

### Тестирование resend endpoint

```bash
curl -X POST http://localhost:8080/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "type": "email"
  }'
```

## 🔍 Проверка логов

Backend логирует все попытки отправки email:

```
Failed to send verification email: <error>
Failed to send password reset email: <error>
Failed to send 2FA email: <error>
Failed to resend verification email: <error>
```

В случае успеха логи отсутствуют (silent success).

## 🐛 Troubleshooting

### Email не приходит

1. **Проверьте API ключ**:
   - В Railway Variables должен быть `RESEND_API_KEY`
   - Ключ должен быть валидным (начинается с `re_`)

2. **Проверьте FROM email**:
   - В development: email должен быть verified в Resend Dashboard
   - В production: домен должен быть verified

3. **Проверьте логи backend**:
   ```bash
   # Railway logs
   railway logs
   
   # Локально
   go run cmd/server/main.go
   ```

4. **Проверьте spam folder**:
   - Email может попасть в спам при первой отправке

### Ошибка "Email service not configured"

Это означает, что `RESEND_API_KEY` не установлен. Добавьте его в переменные окружения.

### Ошибка "Failed to send email"

Возможные причины:
- Невалидный API ключ
- Невалидный FROM email (не verified)
- Лимиты Resend (free tier: 100 emails/day)
- Сетевые проблемы

## 📊 Resend Limits

### Free Tier
- **100 emails/day**
- 1 verified domain
- 1 API key

### Pro Tier ($20/month)
- **50,000 emails/month**
- Unlimited domains
- Multiple API keys
- Better deliverability

## 🔐 Security Notes

1. **API ключ** - храните в секрете, не коммитьте в git
2. **Rate limiting** - уже настроен на auth endpoints
3. **Email validation** - проверяется перед отправкой
4. **Code expiry** - все коды истекают (5-10 минут)

## ✅ Checklist для Production

- [ ] API ключ Resend добавлен в Railway Variables
- [ ] Домен верифицирован в Resend Dashboard
- [ ] DNS записи (SPF, DKIM, DMARC) настроены
- [ ] FROM email address обновлен на verified
- [ ] Протестирована отправка email в production
- [ ] Проверены логи на ошибки
- [ ] Email не попадают в спам

## 📚 Дополнительные ресурсы

- [Resend Documentation](https://resend.com/docs)
- [Resend Go SDK](https://github.com/resend/resend-go)
- [SPF/DKIM Setup Guide](https://resend.com/docs/send-with-smtp)
