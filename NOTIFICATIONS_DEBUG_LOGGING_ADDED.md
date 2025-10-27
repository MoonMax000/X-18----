# Отчет: Добавлено максимальное логирование для отладки уведомлений

## 🎯 Выполнено

Добавлено расширенное логирование на всех уровнях системы уведомлений для отладки проблемы с отображением подписок/отписок.

## 📊 Добавленное логирование

### 1. Frontend Hook (useCustomNotifications.ts)

**Функция `loadInitial`** - логирование получения данных:
```typescript
console.log('[useCustomNotifications] loadInitial called');
console.log('[useCustomNotifications] Fetching notifications with limit:', limit);
console.log('[useCustomNotifications] Received notifications:', notifs);
console.log('[useCustomNotifications] Notifications count:', notifs?.length);
console.log('[useCustomNotifications] Unread count:', countResult.count);

if (notifs && notifs.length > 0) {
  console.log('[useCustomNotifications] First notification:', notifs[0]);
  console.log('[useCustomNotifications] First notification actor:', notifs[0]?.actor);
}
```

### 2. Notifications Page (SocialNotifications.tsx)

**Функция `convertNotification`** - логирование преобразования:
```typescript
console.log('[convertNotification] Full notification:', JSON.stringify(notification, null, 2));
console.log('[convertNotification] notification.actor:', notification.actor);
console.log('[convertNotification] notification type:', type);
console.log('[convertNotification] Extracted actor:', actor);
```

**Компонент SocialNotifications** - логирование состояния:
```typescript
console.log('[SocialNotifications] Raw customNotifications:', customNotifications);
console.log('[SocialNotifications] customNotifications length:', customNotifications?.length);
console.log('[SocialNotifications] isLoading:', isLoading);
console.log('[SocialNotifications] error:', error);
```

## 🧪 Тестовый скрипт

Создан скрипт `test-notifications-flow.sh` для проверки API:
- ✅ Проверка работы backend
- ✅ Авторизация пользователя
- ✅ Получение уведомлений через API
- ✅ Проверка наличия поля `actor`
- ✅ Подсчет непрочитанных уведомлений

## 📝 Инструкции для отладки

### Шаг 1: Запустить тест API
```bash
./test-notifications-flow.sh
```

Это покажет:
- Работает ли backend
- Какие данные возвращает API
- Есть ли поле `actor` в уведомлениях
- Структуру данных

### Шаг 2: Проверить браузер

1. Откройте http://localhost:3000
2. Войдите как `user1` / `password123`
3. Откройте консоль разработчика (F12)
4. Перейдите на `/social/notifications`
5. Изучите логи в консоли:

**Ожидаемые логи:**

```
[useCustomNotifications] loadInitial called
[useCustomNotifications] Fetching notifications with limit: 20
[useCustomNotifications] Received notifications: [...]
[useCustomNotifications] First notification: {...}
[useCustomNotifications] First notification actor: {...}

[SocialNotifications] Raw customNotifications: [...]
[SocialNotifications] customNotifications length: X

[convertNotification] Full notification: {...}
[convertNotification] notification.actor: {...}
[convertNotification] notification type: follow
[convertNotification] Extracted actor: {...}
```

## 🔍 Что искать в логах

### 1. Проверка данных от API
- Приходят ли уведомления? (`customNotifications length`)
- Есть ли поле `actor`? (`notification.actor`)
- Заполнено ли поле `actor`? (не `null`, не `undefined`)

### 2. Проверка типов уведомлений
- Какие типы приходят? (`notification type`)
- Есть ли среди них `follow`/`unfollow`?

### 3. Проверка преобразования
- Правильно ли извлекается `actor`? (`Extracted actor`)
- Создается ли UI объект с правильными данными?

## 🐛 Возможные проблемы и решения

### Проблема 1: `actor` = null или undefined
**Причина:** Backend не загружает связанные данные пользователя
**Решение:** Проверить `Preload("FromUser")` в `GetNotifications`

### Проблема 2: Уведомлений нет в базе
**Причина:** Не создаются уведомления при подписке
**Решение:** Проверить `FollowUser` функцию, создает ли она notification

### Проблема 3: Неправильный тип уведомления
**Причина:** Backend отправляет другой тип
**Решение:** Проверить `type` поля в логах, возможно нужно изменить маппинг

### Проблема 4: Ошибка при загрузке
**Причина:** Ошибка авторизации или API
**Решение:** Проверить `error` в логах, токен, CORS

## 📦 Измененные файлы

1. ✅ `client/hooks/useCustomNotifications.ts` - добавлено логирование в hook
2. ✅ `client/pages/SocialNotifications.tsx` - добавлено логирование в компонент
3. ✅ `test-notifications-flow.sh` - создан тестовый скрипт

## 🎯 Следующие шаги

1. Запустить `./test-notifications-flow.sh`
2. Проверить вывод API
3. Открыть браузер и проверить консоль
4. Отправить найденные логи для анализа

## 💡 Важно

Все логи начинаются с префикса для легкой фильтрации:
- `[useCustomNotifications]` - hook для загрузки данных
- `[SocialNotifications]` - главный компонент
- `[convertNotification]` - функция преобразования

Используйте фильтр в консоли браузера для поиска этих логов.
