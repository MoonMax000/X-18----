# Полная отладка подписок и уведомлений

## Что изменилось

Добавлено детальное логирование в:
1. **custom-backend/internal/api/users.go** - Follow/Unfollow операции
2. **custom-backend/internal/api/notifications.go** - Получение уведомлений
3. **client/hooks/useCustomUserProfile.ts** - Определение состояния подписки
4. **client/hooks/useFollow.ts** - Управление подписками

## Шаг 1: Перезапуск бэкенда с логированием

### Остановить текущий бэкенд
```bash
./STOP_CUSTOM_BACKEND_STACK.sh
```

### Убедиться, что процесс остановлен
```bash
# Проверить, не запущен ли еще бэкенд
ps aux | grep "go run"
# Если найден процесс, убить его
kill -9 <PID>
```

### Запустить бэкенд заново
```bash
./START_CUSTOM_BACKEND_STACK.sh
```

### Мониторинг логов бэкенда

**Вариант 1: В отдельном терминале**
```bash
tail -f custom-backend.log
```

**Вариант 2: Просмотр в реальном времени**
```bash
cd custom-backend
go run cmd/server/main.go 2>&1 | tee ../custom-backend-debug.log
```

## Шаг 2: Тестирование подписки

### 1. Откройте браузер и авторизуйтесь
- Откройте http://localhost:5173
- Войдите под пользователем A (например, devidandersoncrypto)

### 2. Откройте профиль другого пользователя
- Перейдите на профиль пользователя B
- URL: http://localhost:5173/profile/@username

### 3. Откройте консоль браузера (F12)
Следите за логами с префиксами:
- `[useCustomUserProfile]`
- `[ProfilePageLayout]`
- `[useFollow]`

### 4. Проверьте начальное состояние
**В консоли браузера должно быть:**
```
[useCustomUserProfile] Computing isFollowing: {profile: "...", followersCount: X, followers: [...]}
[useCustomUserProfile] Current user ID from useAuth: e78a789d-...
[useCustomUserProfile] isFollowing result: true/false
[ProfilePageLayout] initialFollowingState: true/false
```

**В логах бэкенда должно быть:**
```
[GetFollowers] Fetching followers for user: ...
```

### 5. Нажмите кнопку Follow
**В консоли браузера:**
```
[useFollow] followUser called: {userId: "...", currentState: false}
```

**В логах бэкенда:**
```
[FollowUser] User ... attempting to follow ...
[FollowUser] Target user found: ... (@username)
[FollowUser] No existing follow found, proceeding with follow
[FollowUser] ✓ Follow record created: ... -> ...
[FollowUser] ✓ Updated following_count for user ...
[FollowUser] ✓ Updated followers_count for user ...
[FollowUser] Creating notification: ID=..., UserID=..., FromUserID=..., Type=follow
[FollowUser] ✓ Notification created successfully: ID=...
[FollowUser] ✓ Notification verified in DB: ...
[FollowUser] ✓✓✓ Follow completed successfully: ... -> ...
```

### 6. Перезагрузите страницу (F5)
**В консоли браузера:**
```
[useCustomUserProfile] isFollowing result: true
[ProfilePageLayout] initialFollowingState: true
```

Кнопка должна показывать "Following" без ошибок 409!

### 7. Откройте уведомления пользователя B
- Выйдите из аккаунта A
- Войдите под пользователем B
- Перейдите на страницу уведомлений

**В консоли браузера:**
```
[Hook: useCustomNotifications] Fetching notifications...
```

**В логах бэкенда:**
```
[GetNotifications] Fetching notifications for user: ...
[GetNotifications] Parameters: limit=20, offset=0, unread_only=false
[GetNotifications] Total notifications in DB: X
[GetNotifications] Found X notifications
[GetNotifications]   [0] ID=..., Type=follow, FromUser=... (@username), Read=false, CreatedAt=...
[GetNotifications] Unread count: X
[GetNotifications] ✓ Returning X notifications to client
```

## Шаг 3: Диагностика проблем

### Проблема: Кнопка показывает "Follow" хотя подписка существует

**Проверьте в консоли браузера:**
```
[useCustomUserProfile] Current user ID from useAuth: ...
```

Если `null` или `undefined`:
- Проблема с авторизацией
- Проверьте localStorage: `custom_user`, `custom_token`

**Проверьте в консоли браузера:**
```
[useCustomUserProfile] followersCount: X
[useCustomUserProfile] followers: [...]
```

Если массив пустой:
- API не возвращает подписчиков
- Проверьте логи бэкенда

### Проблема: Ошибка 409 "Already following"

**Проверьте логи бэкенда:**
```
[FollowUser] ERROR: User ... already following ...
```

Это означает:
- В БД есть запись о подписке
- Но UI не знает об этом (isFollowing = false)

**Решение:**
1. Очистить состояние фронтенда
2. Перезагрузить страницу
3. Проверить логи: должно быть `isFollowing result: true`

### Проблема: Уведомления не показываются

**Проверьте логи бэкенда:**
```
[FollowUser] ✓ Notification created successfully: ID=...
[FollowUser] ✓ Notification verified in DB: ...
```

Если уведомление создано, но не показывается:

**Проверьте логи бэкенда при запросе уведомлений:**
```
[GetNotifications] Found 0 notifications
```

Если 0, хотя уведомление должно быть:
- Проверьте UserID в запросе
- Проверьте, что вы авторизованы под правильным пользователем

## Шаг 4: Проверка базы данных напрямую

```bash
sqlite3 custom-backend/storage/x18.db

-- Проверить подписки
SELECT * FROM follows ORDER BY created_at DESC LIMIT 5;

-- Проверить уведомления
SELECT id, user_id, type, from_user_id, read, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- Проверить пользователей
SELECT id, username, followers_count, following_count 
FROM users;
```

## Шаг 5: Очистка тестовых данных

```bash
# Очистить все уведомления
echo "DELETE FROM notifications;" | sqlite3 custom-backend/storage/x18.db

# Очистить все подписки
echo "DELETE FROM follows;" | sqlite3 custom-backend/storage/x18.db

# Сбросить счетчики
echo "UPDATE users SET followers_count = 0, following_count = 0;" | sqlite3 custom-backend/storage/x18.db
```

## Что искать в логах

### ✅ Успешная подписка
```
[FollowUser] User A attempting to follow B
[FollowUser] Target user found: B (@username)
[FollowUser] No existing follow found, proceeding with follow
[FollowUser] ✓ Follow record created
[FollowUser] ✓ Updated following_count
[FollowUser] ✓ Updated followers_count
[FollowUser] ✓ Notification created successfully
[FollowUser] ✓ Notification verified in DB
[FollowUser] ✓✓✓ Follow completed successfully
```

### ✅ Корректное отображение в UI
```
[useCustomUserProfile] isFollowing result: true
[ProfilePageLayout] initialFollowingState: true
[useFollow] Initializing with state: {userId: true}
```

### ✅ Уведомления загружаются
```
[GetNotifications] Fetching notifications for user: B
[GetNotifications] Total notifications in DB: 1
[GetNotifications] Found 1 notifications
[GetNotifications]   [0] Type=follow, FromUser=A (@username), Read=false
[GetNotifications] ✓ Returning 1 notifications to client
```

### ❌ Проблема: Already following
```
[FollowUser] ERROR: User A already following B
```
→ Перезагрузите страницу, состояние должно синхронизироваться

### ❌ Проблема: User ID is null
```
[useCustomUserProfile] Current user ID from useAuth: null
```
→ Проблема с авторизацией, проверьте localStorage

### ❌ Проблема: Failed to create notification
```
[FollowUser] ERROR: Failed to create notification: ...
```
→ Проверьте структуру БД, миграции

## Сохранение логов для анализа

```bash
# Сохранить логи бэкенда
cp custom-backend.log debug-backend-$(date +%Y%m%d-%H%M%S).log

# Сохранить логи браузера
# В консоли браузера: right-click → Save as...
```

## Следующие шаги

После тестирования с логами:
1. Убедитесь, что подписка работает
2. Убедитесь, что уведомления приходят
3. Удалите отладочные console.log из фронтенда
4. Можете оставить fmt.Printf в бэкенде или удалить

## Быстрая проверка

```bash
# 1. Перезапустить бэкенд
./STOP_CUSTOM_BACKEND_STACK.sh && ./START_CUSTOM_BACKEND_STACK.sh

# 2. В другом терминале смотреть логи
tail -f custom-backend.log

# 3. Открыть браузер с консолью (F12)
# 4. Протестировать подписку
# 5. Проверить уведомления
```

Готово! Теперь вы увидите весь путь данных от клика на кнопку Follow до появления уведомления.
