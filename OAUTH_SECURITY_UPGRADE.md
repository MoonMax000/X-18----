# OAuth Security Upgrade Guide

## 🔴 Критические исправления безопасности

Этот апгрейд устраняет серьезные уязвимости в OAuth реализации и добавляет поддержку множественных OAuth провайдеров.

## Что исправлено

### 1. ✅ Токены в httpOnly cookies (вместо URL)

**До:**
```
/auth/callback?success=true&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Проблемы:**
- Токены попадают в browser history
- Токены попадают в логи веб-сервера
- Уязвимость к XSS атакам
- Утечка через Referer header

**После:**
```
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax
/auth/callback?success=true
```

**Преимущества:**
- ✅ Защита от XSS
- ✅ Защита от CSRF (SameSite=Lax)
- ✅ Токены не попадают в логи
- ✅ Автоматическая отправка с запросами

### 2. ✅ Множественные OAuth привязки

**До:**
```sql
-- users table
oauth_provider VARCHAR(50)      -- только ОДИН провайдер
oauth_provider_id VARCHAR(255)  -- только ОДНА привязка
```

**После:**
```sql
-- user_oauth_identities table
CREATE TABLE user_oauth_identities (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50),           -- 'google', 'apple', 'twitter'
    provider_user_id VARCHAR(255),
    email VARCHAR(255),
    email_verified BOOLEAN,
    UNIQUE(provider, provider_user_id)
);
```

**Преимущества:**
- ✅ Неограниченное количество OAuth привязок
- ✅ Пользователь может войти через Google, Apple, Twitter и т.д.
- ✅ История всех OAuth привязок сохраняется

---

## Миграции БД

### Migration 022: user_oauth_identities table
```sql
CREATE TABLE IF NOT EXISTS user_oauth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
```

### Migration 023: Migrate existing data
```sql
-- Переносит существующие OAuth данные из users в user_oauth_identities
INSERT INTO user_oauth_identities (user_id, provider, provider_user_id, email, email_verified)
SELECT id, oauth_provider, oauth_provider_id, email, is_email_verified
FROM users
WHERE oauth_provider IS NOT NULL AND oauth_provider != '';
```

---

## Применение обновлений

### Шаг 1: Применить миграции БД

#### Локально
```bash
./apply-oauth-security-migrations.sh
```

#### На продакшене (через TablePlus)
1. Подключиться к продакшен БД
2. Выполнить миграции в порядке:
   - `022_create_user_oauth_identities.sql`
   - `023_migrate_oauth_data.sql`

### Шаг 2: Деплой нового кода

```bash
# Коммит изменений
git add .
git commit -m "security: upgrade OAuth to httpOnly cookies + multiple providers support"

# Деплой
git push origin main
```

### Шаг 3: Проверка

После деплоя проверьте OAuth авторизацию:

#### Google OAuth
1. Откройте DevTools → Network
2. Нажмите "Sign in with Google"
3. Авторизуйтесь через Google
4. В Network должен быть redirect на `/auth/callback?success=true` (БЕЗ токена в URL)
5. В DevTools → Application → Cookies должны быть:
   - `access_token` (HttpOnly: ✓, Secure: ✓)
   - `refresh_token` (HttpOnly: ✓, Secure: ✓)

#### Apple OAuth
1. Откройте DevTools → Network
2. Нажмите "Sign in with Apple"
3. Авторизуйтесь через Apple
4. Проверьте cookies аналогично Google

---

## Изменения в коде

### Backend

**custom-backend/internal/api/oauth_handlers.go**
```go
// ДО: Небезопасная передача токена в URL
redirectURL := fmt.Sprintf("%s/auth/callback?success=true&token=%s", frontendURL, token)

// ПОСЛЕ: Безопасные httpOnly cookies
c.Cookie(&fiber.Cookie{
    Name:     "access_token",
    Value:    tokenPair.TokenPair.AccessToken,
    HTTPOnly: true,
    Secure:   h.config.Server.Env == "production",
    SameSite: "Lax",
    MaxAge:   h.config.JWT.AccessExpiry * 60,
    Path:     "/",
})

redirectURL := fmt.Sprintf("%s/auth/callback?success=true", frontendURL)
```

### Frontend

**client/pages/OAuthCallback.tsx**
```typescript
// ДО: Чтение токена из URL и сохранение в localStorage
const token = searchParams.get('token');
localStorage.setItem('custom_token', token);

// ПОСЛЕ: Токены в httpOnly cookies, автоматически отправляются
const response = await fetch(`${apiUrl}/api/users/me`, {
    credentials: 'include', // Отправляет cookies автоматически
});
```

---

## Обратная совместимость

### Старые поля в users table

Поля `oauth_provider` и `oauth_provider_id` помечены как DEPRECATED, но **НЕ удалены**:

```sql
COMMENT ON COLUMN users.oauth_provider IS 'DEPRECATED: Use user_oauth_identities table';
COMMENT ON COLUMN users.oauth_provider_id IS 'DEPRECATED: Use user_oauth_identities table';
```

**Почему не удаляем сразу:**
1. Обратная совместимость со старым кодом
2. Возможность отката если что-то пойдет не так
3. Постепенная миграция

**Удаление в будущем:**
После проверки что все работает корректно (1-2 недели), можно удалить:
```sql
ALTER TABLE users DROP COLUMN oauth_provider;
ALTER TABLE users DROP COLUMN oauth_provider_id;
```

---

## Дальнейшие улучшения (опционально)

### 1. Добавить проверку nonce для Apple

**Эталонная реализация:**
```go
// Генерация nonce
nonce := generateRandomString(32)
nonceHash := sha256Hash(nonce)

// Сохранение в cache
h.cache.Set(fmt.Sprintf("oauth_nonce:%s", state), nonce, 10*time.Minute)

// URL с nonce
url := h.appleService.AuthorizationURL(state, nonceHash)

// Проверка в callback
storedNonce := h.cache.Get(fmt.Sprintf("oauth_nonce:%s", state))
expectedHash := sha256Hash(storedNonce)
if claims["nonce"] != expectedHash {
    return errors.New("nonce mismatch")
}
```

### 2. Account Linking в БД (вместо cache)

Создать таблицу `oauth_linking_requests`:
```sql
CREATE TABLE oauth_linking_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50),
    provider_user_id VARCHAR(255),
    token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Мониторинг

### Логи для отслеживания

После деплоя мониторьте логи на наличие ошибок:

```bash
# Продакшен
./monitor-oauth-production.sh

# Локально
./monitor-oauth-local.sh
```

### Метрики успеха

✅ Должны видеть в логах:
- `✅ OAuth cookies set, redirecting to frontend`
- `✅ User data fetched: [username]`
- `✅ OAuth successful! Tokens are in httpOnly cookies`

❌ НЕ должны видеть:
- Токены в URL (параметр `?token=...`)
- Ошибки парсинга cookies
- 401/403 ошибки после OAuth авторизации

---

## Откат изменений

Если что-то пошло не так:

### 1. Откат кода
```bash
git revert HEAD
git push origin main
```

### 2. Данные в БД остаются
Миграции не нужно откатывать - таблица `user_oauth_identities` не мешает старому коду.

### 3. Ручной фикс если нужно
```sql
-- Восстановить OAuth данные в users table из user_oauth_identities
UPDATE users u
SET oauth_provider = uoi.provider,
    oauth_provider_id = uoi.provider_user_id
FROM user_oauth_identities uoi
WHERE u.id = uoi.user_id
  AND u.oauth_provider IS NULL;
```

---

## FAQ

### Q: Будут ли работать старые сессии после обновления?
A: Да, refresh tokens в старых сессиях продолжат работать. Новые токены будут в cookies.

### Q: Нужно ли пересоздавать OAuth приложения в Google/Apple?
A: Нет, OAuth credentials остаются прежними.

### Q: Как проверить что cookies установлены?
A: DevTools → Application → Cookies → Должны быть `access_token` и `refresh_token` с флагом HttpOnly.

### Q: Почему Account Linking все еще через cache?
A: Это временное решение. В будущем можно переместить в БД для надежности.

### Q: Когда удалять старые oauth_provider поля?
A: После 1-2 недель работы в продакшене без проблем.

---

## Контакты

При возникновении проблем:
1. Проверьте логи: `./monitor-oauth-production.sh`
2. Проверьте cookies в DevTools
3. Проверьте что миграции применены: `SELECT COUNT(*) FROM user_oauth_identities`

## Статус

- ✅ Migration 022: user_oauth_identities table
- ✅ Migration 023: migrate existing OAuth data
- ✅ Backend: httpOnly cookies
- ✅ Frontend: cookie-based authentication
- ✅ Models: UserOAuthIdentity
- ⏳ TODO: Apple nonce verification
- ⏳ TODO: Account linking в БД
- ⏳ TODO: Полный переход на user_oauth_identities в коде
