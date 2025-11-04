# 🔍 Руководство по мониторингу OAuth

Создано: 04.11.2025

## 📊 Обзор

Для отладки проблем с OAuth авторизацией через Google и Apple созданы два скрипта мониторинга логов в реальном времени:

1. **monitor-oauth-production.sh** - для продакшена (AWS ECS)
2. **monitor-oauth-local.sh** - для локальной разработки

---

## 🌐 ПРОДАКШЕН (Production)

### Конфигурация OAuth

#### Backend API
- **URL**: `https://api.tyriantrade.com`
- **Health check**: `https://api.tyriantrade.com/health`

#### Frontend
- **URL**: `https://social.tyriantrade.com`
- **Login page**: `https://social.tyriantrade.com/login`

#### OAuth Callback URLs
- **Google**: `https://api.tyriantrade.com/api/auth/google/callback`
- **Apple**: `https://api.tyriantrade.com/api/auth/apple/callback`

### Запуск мониторинга продакшена

```bash
./monitor-oauth-production.sh
```

**Что делает скрипт:**
- Подключается к AWS CloudWatch Logs
- Фильтрует OAuth-связанные события в реальном времени
- Цветовое кодирование:
  - 🔵 СИНИЙ - OAuth события
  - 🟣 ФИОЛЕТОВЫЙ - Apple события
  - 🔷 ГОЛУБОЙ - Google события
  - 🟡 ЖЕЛТЫЙ - Callback события
  - 🔴 КРАСНЫЙ - Ошибки
  - 🟢 ЗЕЛЕНЫЙ - Успешные операции

### Ссылки для тестирования продакшена

#### ✅ Основная ссылка для теста (через модальное окно):
```
https://social.tyriantrade.com/login
```

**Инструкция:**
1. Откройте: https://social.tyriantrade.com/login
2. Нажмите кнопку "Sign in with Google" или "Sign in with Apple"
3. Следуйте OAuth flow
4. Наблюдайте за логами в терминале с запущенным скриптом мониторинга

---

## 💻 ЛОКАЛЬНАЯ РАЗРАБОТКА (Local)

### Конфигурация OAuth

#### Backend API
- **URL**: `http://localhost:8080`
- **Health check**: `http://localhost:8080/health`

#### Frontend
- **URL**: `http://localhost:5173`
- **Login page**: `http://localhost:5173/login`

#### OAuth Callback URLs
- **Google**: `http://localhost:8080/api/auth/google/callback`
- **Apple**: `http://localhost:8080/api/auth/apple/callback`

### Запуск локального окружения

1. **Запустите backend и frontend:**
```bash
./START_CUSTOM_BACKEND_STACK.sh
```

2. **В отдельном терминале запустите мониторинг:**
```bash
./monitor-oauth-local.sh
```

### Ссылки для тестирования локально

#### ✅ Основная ссылка для теста (через модальное окно):
```
http://localhost:5173/login
```

**Инструкция:**
1. Убедитесь, что backend и frontend запущены
2. Откройте: http://localhost:5173/login
3. Нажмите кнопку "Sign in with Google" или "Sign in with Apple"
4. Следуйте OAuth flow
5. Наблюдайте за логами в терминале с запущенным скриптом мониторинга

---

## 🔧 Что искать в логах

### Успешный OAuth flow:
```
✅ OAuth initiated
✅ State generated and cached
✅ User redirected to provider
✅ Callback received with code and state
✅ State verified
✅ Token exchange successful
✅ User info fetched
✅ User created/found
✅ JWT tokens generated
✅ Session created
```

### Типичные проблемы:

#### 1. Invalid state parameter
```
ERROR: Invalid state - expected 'google/apple', got 'something else'
```
**Решение:** Проверьте Redis cache, убедитесь что state токены сохраняются

#### 2. Failed to exchange token
```
ERROR: Failed to exchange token: oauth2: cannot fetch token
```
**Решение:** Проверьте CLIENT_ID и CLIENT_SECRET в переменных окружения

#### 3. Email not provided
```
ERROR: Email not provided by OAuth provider
```
**Решение:** 
- Для Google: убедитесь что scope включает "email"
- Для Apple: убедитесь что пользователь разрешил доступ к email

#### 4. Apple "Hide My Email"
```
Email might be a proxy address (privaterelay.appleid.com)
```
**Информация:** Apple использует proxy email при первой авторизации

---

## 📝 Важные замечания

### Google OAuth
- Использует OIDC (OpenID Connect)
- Email всегда предоставляется если запрошен scope
- Аватар доступен через поле `picture`

### Apple OAuth
- Использует form_post для callback (не query params)
- Email и имя предоставляются только при первой авторизации
- Может использовать "Hide My Email" функцию
- Требует .p8 ключ для генерации client_secret

### Общие требования
- HTTPS обязателен для продакшена
- Callback URLs должны точно совпадать с настройками в Google/Apple консолях
- State token используется для защиты от CSRF атак
- Redis cache должен быть доступен для хранения state токенов

---

## 🛠️ Настройка OAuth провайдеров

### Google OAuth Console
1. Перейдите: https://console.cloud.google.com/apis/credentials
2. Создайте OAuth 2.0 Client ID
3. Добавьте Authorized redirect URIs:
   - Локально: `http://localhost:8080/api/auth/google/callback`
   - Продакшен: `https://api.tyriantrade.com/api/auth/google/callback`
4. Скопируйте CLIENT_ID и CLIENT_SECRET

### Apple Developer Console
1. Перейдите: https://developer.apple.com/account/resources/identifiers
2. Создайте Services ID
3. Настройте Sign in with Apple
4. Добавьте Return URLs:
   - Локально: `http://localhost:8080/api/auth/apple/callback`
   - Продакшен: `https://api.tyriantrade.com/api/auth/apple/callback`
5. Создайте приватный ключ (.p8) и настройте его на сервере

---

## 🔄 Остановка мониторинга

Для остановки скриптов мониторинга нажмите:
```
Ctrl+C
```

---

## 📞 Поддержка

Если возникают проблемы:
1. Проверьте логи через соответствующий скрипт мониторинга
2. Убедитесь что все переменные окружения настроены
3. Проверьте что callback URLs совпадают в настройках провайдера и в .env файлах
4. Убедитесь что сервисы (Redis, PostgreSQL) работают

---

## 📚 Связанные документы

- `APPLE_OAUTH_PRODUCTION_SETUP.md` - Детальная настройка Apple OAuth
- `OAUTH_DEPLOYMENT_GUIDE.md` - Гид по деплою OAuth
- `OAUTH_IMPROVEMENTS_COMPLETED.md` - История улучшений OAuth
- `custom-backend/.env` - Локальная конфигурация
- `.env.production` - Продакшен конфигурация
