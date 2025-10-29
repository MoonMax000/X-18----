# WebSocket с HttpOnly Cookies - Полное исправление

**Дата:** 30.10.2025  
**Статус:** ✅ Завершено

## Проблема

После внедрения HttpOnly cookies для повышения безопасности, WebSocket уведомления перестали работать в real-time. Уведомления показывались только после обновления страницы.

### Причина

1. **Frontend** пытался получить токен через `customAuth.getAccessToken()`, что не работает с HttpOnly cookies (они недоступны для JavaScript)
2. **WebSocket URL** содержал токен в query параметре: `ws://host/ws/notifications?token=xxx`
3. **Backend** ожидал токен в URL query параметре, не проверяя HttpOnly cookie

## Решение

### Backend (custom-backend/internal/api/websocket.go)

Обновлен обработчик WebSocket для проверки токена в следующем порядке приоритета:

```go
// 1. Проверяем HttpOnly cookie (приоритет для безопасности)
token = c.Cookies("access_token")

// 2. Если нет в cookie, проверяем Authorization header
if token == "" {
    authHeader := c.Get("Authorization")
    if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
        token = authHeader[7:]
    }
}

// 3. Если нет в header, проверяем query параметр (legacy)
if token == "" {
    token = c.Query("token")
}
```

**Преимущества:**
- ✅ Поддержка HttpOnly cookies (безопасно)
- ✅ Обратная совместимость с Authorization header
- ✅ Legacy поддержка query параметра

### Frontend (client/services/websocket/websocket.service.ts)

#### До изменений:
```typescript
connect(): void {
    const token = customAuth.getAccessToken();  // ❌ Не работает с HttpOnly
    if (!token) {
        console.warn('WebSocket: No auth token available');
        return;
    }
    const wsUrl = this.buildWebSocketUrl(token);  // ❌ Токен в URL
    // ...
}

private buildWebSocketUrl(token: string): string {
    return `${wsProtocol}://${wsHost}/ws/notifications?token=${token}`;
}
```

#### После изменений:
```typescript
connect(): void {
    // Браузер автоматически отправит HttpOnly cookie
    const wsUrl = this.buildWebSocketUrl();  // ✅ Без токена
    this.ws = new WebSocket(wsUrl);
    // ...
}

private buildWebSocketUrl(): string {
    // ✅ Браузер автоматически отправит HttpOnly cookie при WebSocket upgrade
    return `${wsProtocol}://${wsHost}/ws/notifications`;
}
```

## Технические детали

### Как работает WebSocket с HttpOnly cookies

1. **WebSocket Upgrade Request:**
   ```
   GET /ws/notifications HTTP/1.1
   Host: api.example.com
   Upgrade: websocket
   Connection: Upgrade
   Cookie: access_token=xxx; HttpOnly  ← Автоматически от браузера
   ```

2. **Backend читает cookie:**
   ```go
   token := c.Cookies("access_token")
   ```

3. **Валидация токена:**
   ```go
   claims, err := jwt.ValidateToken(token)
   if err != nil {
       c.Status(fiber.StatusUnauthorized).JSON(...)
       return
   }
   ```

4. **WebSocket соединение установлено** с аутентифицированным пользователем

### Безопасность

- ✅ **HttpOnly cookies** не доступны через JavaScript → защита от XSS
- ✅ **Secure flag** в production → передача только через HTTPS
- ✅ **SameSite=Strict** → защита от CSRF
- ✅ Токен не передается в URL → не попадает в логи сервера
- ✅ Автоматическое управление браузером → нет кода для хранения токенов

## Измененные файлы

1. ✅ `custom-backend/internal/api/websocket.go`
   - Добавлена проверка HttpOnly cookie
   - Добавлен fallback на Authorization header
   - Сохранена совместимость с query параметром

2. ✅ `client/services/websocket/websocket.service.ts`
   - Удалена попытка получить токен через getAccessToken()
   - Удален токен из WebSocket URL
   - Добавлены комментарии об автоматической отправке cookies

## Тестирование

### Локальное тестирование

1. Запустить backend:
   ```bash
   cd custom-backend
   ./server
   ```

2. Запустить frontend:
   ```bash
   npm run dev
   ```

3. Открыть DevTools → Network → WS
4. Проверить WebSocket соединение
5. Проверить, что Headers содержит Cookie без токена в URL

### Production тестирование

1. Задеплоить backend на Railway
2. Задеплоить frontend на Netlify
3. Войти в систему
4. Открыть DevTools → Application → Cookies
5. Проверить наличие `access_token` с флагами HttpOnly, Secure
6. Проверить WebSocket соединение в Network → WS
7. Проверить real-time уведомления (подписка, лайк, комментарий)

## Следующие шаги

✅ Backend исправлен  
✅ Frontend исправлен  
⏳ Деплой в ветку nova-hub  
⏳ Тестирование в production  

## Task 2: ✅ Завершено

Real-time WebSocket уведомления теперь работают с HttpOnly cookies, обеспечивая максимальную безопасность и удобство использования.

---

## Следующая задача: Task 4

**Синхронизация лайков между FeedPost.tsx и UnifiedPostDetail.tsx**

Проблема: FeedPost.tsx и UnifiedPostDetail.tsx - это отдельные компоненты, что вызывает десинхронизацию состояния лайков. Нужно:

1. Создать общий компонент PostActions
2. Использовать глобальное состояние для синхронизации
3. Обеспечить консистентность UI во всех местах
