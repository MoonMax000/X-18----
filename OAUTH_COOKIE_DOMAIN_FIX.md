# OAuth Cookie Domain Fix

## 🔍 Диагностика проблемы

### Текущая ситуация:
- ✅ Backend успешно устанавливает cookies после OAuth callback
- ✅ Redirect на frontend происходит с `success=true`
- ❌ Запрос `/api/users/me` возвращает 401 Unauthorized
- ❌ Frontend показывает "Token present: false"

### Корневая причина:

В файле `custom-backend/internal/api/oauth_handlers.go` (строки 589-599) cookies устанавливаются **БЕЗ указания Domain**:

```go
c.Cookie(&fiber.Cookie{
    Name:     "access_token",
    Value:    tokenPair.TokenPair.AccessToken,
    HTTPOnly: true,
    Secure:   h.config.Server.Env == "production",
    SameSite: "Lax",
    MaxAge:   h.config.JWT.AccessExpiry * 60,
    Path:     "/",
})
```

**Проблема:** Когда Domain не указан, cookie привязывается к точному домену, где он был установлен:
- Cookie устанавливается для: `api.tyriantrade.com`
- Frontend делает запрос с: `social.tyriantrade.com`
- Результат: Браузер не отправляет cookie из-за cross-origin

## ✅ Решение

### Вариант 1: Указать общий родительский домен (РЕКОМЕНДУЕТСЯ)

Установить `Domain: ".tyriantrade.com"` чтобы cookie работал для всех поддоменов:

```go
c.Cookie(&fiber.Cookie{
    Name:     "access_token",
    Value:    tokenPair.TokenPair.AccessToken,
    HTTPOnly: true,
    Secure:   true, // Всегда true в продакшене для безопасности
    SameSite: "None", // Необходимо для cross-site requests
    Domain:   ".tyriantrade.com", // Работает для всех поддоменов
    MaxAge:   h.config.JWT.AccessExpiry * 60,
    Path:     "/",
})
```

**Важно:**
- `SameSite: "None"` требует `Secure: true`
- Domain должен начинаться с точки `.tyriantrade.com` для работы с поддоменами

### Вариант 2: Использовать те же домены

Альтернативное решение - разместить frontend и backend на одном домене:
- Backend: `tyriantrade.com/api`
- Frontend: `tyriantrade.com`

Но это требует изменения инфраструктуры.

## 🔧 Файлы для изменения

### 1. `custom-backend/internal/api/oauth_handlers.go`

Обновить установку обоих cookies (access_token и refresh_token):

```go
// Access token cookie
c.Cookie(&fiber.Cookie{
    Name:     "access_token",
    Value:    tokenPair.TokenPair.AccessToken,
    HTTPOnly: true,
    Secure:   true,
    SameSite: "None",
    Domain:   ".tyriantrade.com",
    MaxAge:   h.config.JWT.AccessExpiry * 60,
    Path:     "/",
})

// Refresh token cookie
c.Cookie(&fiber.Cookie{
    Name:     "refresh_token",
    Value:    tokenPair.TokenPair.RefreshToken,
    HTTPOnly: true,
    Secure:   true,
    SameSite: "None",
    Domain:   ".tyriantrade.com",
    MaxAge:   86400 * h.config.JWT.RefreshExpiry,
    Path:     "/",
})
```

### 2. Проверить CORS настройки

Убедиться что в `custom-backend/cmd/server/main.go` CORS настроен правильно:

```go
app.Use(cors.New(cors.Config{
    AllowOrigins:     "https://social.tyriantrade.com",
    AllowMethods:     "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    AllowHeaders:     "Content-Type,Authorization",
    AllowCredentials: true, // КРИТИЧЕСКИ ВАЖНО для cookies
    ExposeHeaders:    "Content-Length",
    MaxAge:           12 * 60 * 60,
}))
```

## 🧪 Тестирование

После применения исправления:

1. **Задеплоить изменения:**
   ```bash
   ./deploy.sh
   ```

2. **Попробовать OAuth авторизацию:**
   - Откройте: https://social.tyriantrade.com
   - Нажмите "Sign in with Google"
   - После redirect проверьте cookies в DevTools

3. **Проверить cookies в браузере:**
   - Откройте DevTools → Application → Cookies
   - Должны быть cookies для `.tyriantrade.com`:
     - `access_token`
     - `refresh_token`
   - Параметры: `HttpOnly`, `Secure`, `SameSite=None`

4. **Проверить логи:**
   ```bash
   ./monitor-logs-production.sh --oauth
   ```

## 📊 Ожидаемый результат

После исправления:
- ✅ Cookie устанавливается для `.tyriantrade.com`
- ✅ Browser отправляет cookie с запросом от `social.tyriantrade.com`
- ✅ Middleware находит токен в cookie
- ✅ `/api/users/me` возвращает 200 OK
- ✅ Пользователь успешно авторизован

## 🚨 Важные замечания

1. **SameSite=None требует Secure=true**
   - Cookie с `SameSite=None` может быть установлен только через HTTPS
   - В production всегда используйте `Secure: true`

2. **Domain с точкой**
   - `.tyriantrade.com` - работает для всех поддоменов
   - `tyriantrade.com` - работает только для основного домена

3. **CORS AllowCredentials**
   - Должен быть `true` для работы с cookies
   - `AllowOrigins` не может быть `"*"` когда `AllowCredentials: true`

4. **Локальная разработка**
   - Для localhost используйте `SameSite: "Lax"` без Domain
   - Или настройте локальные домены через `/etc/hosts`

## 🔗 Ссылки для тестирования

После деплоя:
- Google OAuth: https://api.tyriantrade.com/api/auth/google
- Apple OAuth: https://api.tyriantrade.com/api/auth/apple
- Frontend: https://social.tyriantrade.com

## 📝 Дополнительная информация

- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite cookies explained](https://web.dev/samesite-cookies-explained/)
- [CORS with credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#credentialed_requests_and_wildcards)
