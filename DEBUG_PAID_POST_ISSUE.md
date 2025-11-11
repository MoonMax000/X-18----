# Диагностика проблемы с платными постами

## Проблема
Платный пост отображается как бесплатный в ленте.

## Что уже сделано

1. ✅ Добавлены Stripe ключи в `.env` файлы
2. ✅ Добавлено отладочное логирование в `FeedPost.tsx`
3. ✅ Исправлены TypeScript типы

## Шаги для диагностики

### 1. Откройте приложение в браузере
```bash
# Убедитесь, что бэкенд запущен
cd custom-backend
go run cmd/server/main.go

# В другом терминале запустите фронтенд
npm run dev
```

### 2. Откройте консоль разработчика
- Нажмите `F12` или `Cmd+Option+I` (Mac)
- Перейдите на вкладку `Console`

### 3. Создайте платный пост
- Откройте композер
- Напишите любой текст
- В разделе "Access Control":
  - Выберите `pay-per-post` или другой платный уровень
  - Укажите цену (например, $5.00)
- Опубликуйте пост

### 4. Проверьте логи в консоли

Вы должны увидеть два DEBUG лога для каждого поста:

**Лог 1: Post access control**
```
[FeedPost DEBUG] Post access control: {
  postId: "...",
  accessLevel: "pay-per-post",  // <-- должен быть НЕ "public"
  priceCents: 500,               // <-- должна быть цена
  postPrice: 5,                  // <-- цена в долларах
  isPurchased: false,            // <-- false если не куплен
  isSubscriber: false,           // <-- false если нет подписки
  isFollower: false,
  isOwnPost: true/false,         // <-- true если это ваш пост
  ...
}
```

**Лог 2: Lock calculation**
```
[FeedPost DEBUG] Lock calculation: {
  postId: "...",
  accessLevel: "pay-per-post",
  isPurchased: false,
  isSubscriber: false,
  isOwnPost: true/false,
  isLocked: true/false,          // <-- должен быть true если не ваш пост
  calculation: "..."
}
```

### 5. Проверьте данные

#### ✅ ПРАВИЛЬНО (пост должен быть заблокирован):
```javascript
accessLevel: "pay-per-post"  // НЕ "public"
priceCents: 500              // есть цена
isPurchased: false           // не куплен
isSubscriber: false          // нет подписки
isOwnPost: false             // не ваш пост
isLocked: true               // ЗАБЛОКИРОВАН
```

#### ❌ НЕПРАВИЛЬНО (возможные проблемы):

**Проблема 1: accessLevel = "public"**
```javascript
accessLevel: "public"  // <-- ПРОБЛЕМА! Должен быть "pay-per-post"
```
➡️ Пост сохранился в БД как публичный. Проверьте создание поста.

**Проблема 2: priceCents = 0 или undefined**
```javascript
priceCents: undefined  // <-- ПРОБЛЕМА! Цена не сохранилась
```
➡️ Цена не была сохранена в БД. Проверьте CreatePost API.

**Проблема 3: isOwnPost = true**
```javascript
isOwnPost: true  // <-- Это нормально! Ваш пост всегда открыт для вас
```
➡️ Это не проблема. Вы всегда видите свои посты открытыми.

**Проблема 4: isPurchased/isSubscriber = undefined**
```javascript
isPurchased: undefined  // <-- ПРОБЛЕМА! Поля не пришли с бэкенда
isSubscriber: undefined
```
➡️ Бэкенд не возвращает эти поля. Проверьте timeline.go

### 6. Проверьте Network запрос

В консоли разработчика:
1. Перейдите на вкладку `Network`
2. Найдите запрос к `/api/timeline/home` или `/api/timeline/explore`
3. Кликните на него
4. Перейдите на вкладку `Response`
5. Найдите ваш пост в JSON ответе

Проверьте структуру:
```json
{
  "id": "...",
  "content": "...",
  "access_level": "pay-per-post",  // <-- должен быть НЕ "public"
  "price_cents": 500,              // <-- должна быть цена
  "is_purchased": false,           // <-- должен присутствовать
  "is_subscriber": false,          // <-- должен присутствовать
  "is_follower": false,            // <-- должен присутствовать
  "post_price": 5                  // <-- цена в долларах
}
```

### 7. Если это ваш собственный пост

**ЭТО НОРМАЛЬНО!**

Если вы видите:
```javascript
isOwnPost: true
isLocked: false  // пост открыт для вас
```

Это ожидаемое поведение! Автор всегда видит свои посты открытыми.

**Чтобы проверить заблокирован ли пост:**
1. Выйдите из аккаунта (или откройте в режиме инкогнито)
2. Или попросите другого пользователя посмотреть пост
3. ИЛИ проверьте в БД:

```sql
SELECT id, content, access_level, price_cents 
FROM posts 
WHERE user_id = 'ваш_user_id'
ORDER BY created_at DESC 
LIMIT 5;
```

### 8. Возможные решения

#### Если accessLevel = "public" в БД:
Проблема в создании поста. Проверьте:
- `QuickComposer.tsx` - правильно ли формируется `access_level`
- `postPayloadBuilder.ts` - правильно ли мапится payload
- `posts.go` CreatePost - правильно ли сохраняется в БД

#### Если isPurchased/isSubscriber = undefined:
Проблема в timeline API. Проверьте:
- `timeline.go` GetHomeTimeline - добавлены ли проверки
- `timeline.go` GetExploreTimeline - добавлены ли проверки
- `users.go` GetUserPosts - добавлены ли проверки

#### Если всё правильно, но не работает:
Перезапустите бэкенд:
```bash
# Остановите текущий процесс (Ctrl+C)
# Запустите заново
cd custom-backend
go run cmd/server/main.go
```

## Следующие шаги

После проверки логов, сообщите:
1. Что показывает "Post access control" лог
2. Что показывает "Lock calculation" лог
3. Является ли этот пост вашим собственным (`isOwnPost: true/false`)
4. Что показывает Network Response для этого поста

Это поможет точно определить, где проблема!
