# OAuth Authentication Persistence Fix

## Проблема

После успешной OAuth авторизации (Google/Apple) пользователь НЕ оставался залогиненным после редиректа на главную страницу.

### Симптомы
- OAuth flow завершался успешно (видно в логах браузера)
- Данные пользователя корректно сохранялись в localStorage
- httpOnly cookies с токенами устанавливались корректно
- НО после редиректа на `/` пользователь НЕ был авторизован

### Логи браузера показывали
```
✅ OAuth successful! Tokens are in httpOnly cookies
✅ User data fetched: "devidandersoncrypto"
🚀 Redirecting to home...
[После редиректа пользователь не авторизован]
```

## Корневая причина

AuthContext при инициализации проверял наличие ОБОИХ условий:
1. Наличие user в localStorage ✅
2. Наличие access_token в localStorage ❌ (отсутствует при OAuth)

```typescript
// Старая логика
const storedUser = customAuth.getCurrentUser(); // ✅ есть
const token = customAuth.getAccessToken(); // ❌ НЕТ (при OAuth токен в httpOnly cookie)

if (storedUser && token) { // ❌ Условие не выполнялось
  // ... проверка аутентификации
}
```

**Проблема**: После OAuth авторизации токены находятся в httpOnly cookies (безопасно), но НЕ в localStorage. AuthContext ожидал токен в localStorage и не проверял cookies.

## Решение

Изменена логика инициализации AuthContext:

### До (client/contexts/AuthContext.tsx)
```typescript
if (storedUser && token) {
  // Проверяем токен из localStorage
  const freshUser = await customAuth.getCurrentUserFromAPI(token);
  setUser(freshUser);
}
```

### После
```typescript
if (storedUser) {
  // OAUTH FIX: Проверяем аутентификацию через cookies
  const response = await fetch(`${apiUrl}/api/users/me`, {
    credentials: 'include', // Отправляем httpOnly cookies
  });

  if (response.ok) {
    const freshUser = await response.json();
    setUser(freshUser);
    console.log('✅ Auth initialized successfully (via cookies)');
  } else if (response.status === 401) {
    // Пытаемся обновить токен через refresh
    const refreshed = await customAuth.refreshToken();
    setUser(refreshed.user);
  }
}
```

## Что изменилось

1. **AuthContext теперь проверяет cookies**: При инициализации делается запрос `/api/users/me` с `credentials: 'include'`, что отправляет httpOnly cookies на сервер
2. **Не требует токен в localStorage**: Условие изменено с `if (storedUser && token)` на `if (storedUser)`
3. **Работает для обоих типов авторизации**:
   - OAuth (токены в httpOnly cookies) ✅
   - Email/Password (токен в localStorage + cookies) ✅

## Тестирование

### Локальное тестирование

1. Запустите backend:
```bash
cd custom-backend
go run cmd/server/main.go
```

2. В другом терминале запустите frontend:
```bash
pnpm run dev
```

3. Откройте браузер (http://localhost:5173) и:
   - Откройте DevTools → Console
   - Включите "Preserve log" в Console
   - Нажмите "Sign In"
   - Выберите "Continue with Google" или "Continue with Apple"

4. Ожидаемое поведение:
```
=== OAuth Callback Handler ===
Success: true
✅ OAuth successful! Tokens are in httpOnly cookies
✅ User data fetched: [username]
🚀 Redirecting to home...
[После редиректа]
🔍 Checking authentication with cookies...
✅ Auth initialized successfully (via cookies)
```

5. Проверьте:
   - ✅ Имя пользователя отображается в header
   - ✅ Кнопка "Sign In" заменена на профиль пользователя
   - ✅ Можно создавать посты
   - ✅ Обновление страницы (F5) не разлогинивает

### Production тестирование

1. Задеплойте изменения:
```bash
./deploy.sh
```

2. Откройте https://tyriantrade.com:
   - Откройте DevTools → Console
   - Включите "Preserve log"
   - Авторизуйтесь через Google или Apple
   - Проверьте что остаётесь залогиненными после редиректа

3. Мониторинг логов:
```bash
# Локально
./monitor-logs-local.sh

# Production
./monitor-logs-production.sh
```

## Файлы изменены

- ✅ `client/contexts/AuthContext.tsx` - Исправлена логика инициализации для работы с cookies

## Backward Compatibility

Изменения полностью обратно совместимы:
- ✅ Email/Password авторизация продолжает работать (токен в localStorage + cookies)
- ✅ OAuth авторизация теперь работает корректно (токены только в cookies)
- ✅ Refresh token mechanism работает в обоих случаях

## Безопасность

Решение сохраняет все security преимущества:
- ✅ Токены в httpOnly cookies (защита от XSS)
- ✅ SameSite=None для cross-domain
- ✅ Secure=true для HTTPS only
- ✅ Domain=.tyriantrade.com для поддоменов
- ✅ Refresh token rotation

## Дата исправления
5 ноября 2025, 14:10 UTC+7

## Статус
✅ FIXED - Готово к тестированию
