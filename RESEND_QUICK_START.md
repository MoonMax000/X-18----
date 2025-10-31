# 🚀 Быстрый старт с Resend Email

## ✅ Локальная настройка готова!

API ключ уже добавлен в `custom-backend/.env`:
```env
RESEND_API_KEY=re_BKqv1J39_4uLyK6KWKn4jvvztrZBRvyBv
RESEND_FROM_EMAIL=noreply@tyriantrade.com
```

## 📋 Следующие шаги

### 1. Верифицировать тестовый email в Resend

⚠️ **ВАЖНО**: В development режиме Resend отправляет email только на verified адреса!

1. Откройте https://resend.com/emails
2. Перейдите в Settings → Domains → Add email
3. Добавьте свой email для тестирования (например, ваш личный email)
4. Подтвердите email по ссылке из письма

### 2. Запустить backend локально

```bash
cd custom-backend
go run cmd/server/main.go
```

Вы должны увидеть:
```
✅ Resend email client initialized (from: noreply@tyriantrade.com)
```

### 3. Протестировать регистрацию

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "ВАШ_VERIFIED_EMAIL@example.com",
    "password": "SecurePass123!"
  }'
```

Email с 6-значным кодом придет на ваш verified email!

### 4. Верифицировать email

Используйте код из email:
```bash
curl -X POST http://localhost:8080/api/auth/verify/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token_из_регистрации>" \
  -d '{
    "code": "123456"
  }'
```

## 🚀 Добавить API ключ в Railway (Production)

### Вариант 1: Через Railway Dashboard

1. Откройте https://railway.app
2. Выберите проект X-18
3. Выберите сервис `custom-backend`
4. Variables → New Variable:
   ```
   RESEND_API_KEY=re_BKqv1J39_4uLyK6KWKn4jvvztrZBRvyBv
   RESEND_FROM_EMAIL=noreply@tyriantrade.com
   ```
5. Нажмите Deploy

### Вариант 2: Через Railway CLI

```bash
# Установите Railway CLI если еще не установлен
brew install railway

# Войдите в аккаунт
railway login

# Выберите проект
railway link

# Добавьте переменные
railway variables set RESEND_API_KEY=re_BKqv1J39_4uLyK6KWKn4jvvztrZBRvyBv
railway variables set RESEND_FROM_EMAIL=noreply@tyriantrade.com
```

## 📧 Верификация домена для Production

Для production нужно верифицировать домен `tyriantrade.com`:

1. Откройте https://resend.com/domains
2. Add Domain → введите `tyriantrade.com`
3. Добавьте DNS записи в FirstVDS:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: [будет показан в Resend Dashboard]
```

**DMARC Record (опционально):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@tyriantrade.com
```

4. Дождитесь верификации (5-10 минут)
5. После верификации можно отправлять с любых @tyriantrade.com адресов!

## 🧪 Тестирование всех функций

### 1. Email Verification (при регистрации)
✅ Уже протестировали выше

### 2. Password Reset
```bash
curl -X POST http://localhost:8080/api/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ВАШ_VERIFIED_EMAIL@example.com"
  }'
```

### 3. Resend Verification Email
```bash
curl -X POST http://localhost:8080/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "type": "email"
  }'
```

### 4. 2FA Email (после включения 2FA)
```bash
# Сначала включите 2FA
curl -X POST http://localhost:8080/api/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "method": "email",
    "password": "SecurePass123!"
  }'

# Войдите - код придет на email
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ВАШ_VERIFIED_EMAIL@example.com",
    "password": "SecurePass123!"
  }'
```

## 🎨 Как выглядят email

Все email используют фирменный дизайн с:
- 🟣 Фиолетовый градиент header
- 📧 6-значный код крупным шрифтом
- ⏰ Информация о времени истечения
- 🎯 Call-to-action кнопка
- 🔒 Footer с security информацией

## 📊 Мониторинг отправок

### В Resend Dashboard:
https://resend.com/emails

Здесь вы увидите:
- Все отправленные email
- Статус доставки (Sent, Delivered, Bounced)
- Открытия и клики
- Ошибки

### В логах backend:
```bash
# Локально
go run cmd/server/main.go

# Railway
railway logs
```

Ошибки логируются:
```
Failed to send verification email: <error>
Failed to send password reset email: <error>
Failed to send 2FA email: <error>
```

## ⚠️ Важные замечания

1. **Free tier лимит**: 100 emails/день
2. **Verified emails**: В development тестируйте только на verified адресах
3. **Production domain**: Обязательно верифицируйте домен для production
4. **Spam folder**: Первые письма могут попасть в спам
5. **Rate limiting**: Уже настроен на auth endpoints (не беспокойтесь)

## 🐛 Если что-то не работает

### Email не приходит
- ✅ Проверьте spam folder
- ✅ Убедитесь что email verified в Resend Dashboard
- ✅ Проверьте логи backend на ошибки
- ✅ Проверьте лимиты в Resend Dashboard (100/day на free tier)

### Ошибка "Failed to send email"
- ✅ Проверьте API ключ в .env
- ✅ Проверьте FROM email адрес
- ✅ Проверьте интернет соединение

### Backend не видит RESEND_API_KEY
- ✅ Убедитесь что .env файл в `custom-backend/` директории
- ✅ Перезапустите backend
- ✅ Проверьте что нет опечаток в названии переменной

## 🎉 Готово!

Теперь у вас работает полноценная email-верификация:
- ✅ При регистрации автоматически отправляется код
- ✅ Можно повторно запросить код
- ✅ Сброс пароля через email
- ✅ 2FA через email
- ✅ Красивые branded email templates

Документация: См. `RESEND_EMAIL_SETUP_GUIDE.md` для подробностей
