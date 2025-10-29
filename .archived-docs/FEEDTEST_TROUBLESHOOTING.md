# FeedTest Troubleshooting Guide

## ✅ Исправления в коде

Были исправлены следующие ошибки:

### 1. **TypeError: statuses.map is not a function**

**Проблема:**  
Hook `useGTSTimeline` возвращал данные, но компонент пытался вызвать `.map()` до проверки типа.

**Решение:**  
```typescript
// Было:
const posts = useMemo(() => statuses.map(gtsStatusToPost), [statuses]);

// Стало:
const posts = useMemo(
  () => Array.isArray(statuses) ? statuses.map(gtsStatusToPost) : [],
  [statuses]
);
```

### 2. **Нет отображения ошибок API**

**Проблема:**  
Когда GoToSocial API недоступен, страница просто зависала.

**Решение:**  
Добавлен экран ошибки с информацией и кнопкой "Try Again":

```typescript
if (error) {
  return (
    <div>
      <h3>Failed to load feed</h3>
      <p>{error}</p>
      <p>Make sure GoToSocial is running at {API_URL}</p>
      <button onClick={() => refresh()}>Try Again</button>
    </div>
  );
}
```

### 3. **custom_metadata может вызывать ошибки**

**Проблема:**  
Стандартный GoToSocial не поддерживает `custom_metadata`, что вызывает ошибку при создании поста.

**Решение:**  
Метаданные теперь добавляются только если заполнены поля:

```typescript
const statusData: any = {
  status: text,
  visibility: 'public',
};

// Добавляем custom_metadata только если есть данные
if (postCategory || postMarket || postSymbol || sentiment) {
  statusData.custom_metadata = { ... };
}

await createStatus(statusData);
```

---

## 🔧 Что проверить

### 1. **GoToSocial запущен?**

```bash
# Проверить что GoToSocial работает
curl http://localhost:8080/api/v1/instance

# Должен вернуть JSON с информацией о сервере
# Если ошибка - GoToSocial не запущен
```

**Если не запущен:**

```bash
# Опция 1: Docker
docker run -p 8080:8080 superseriousbusiness/gotosocial:latest

# Опция 2: Бинарник
./gotosocial server start
```

### 2. **VITE_API_URL настроен?**

Проверьте файл `.env`:

```bash
cat .env
```

Должно быть:

```bash
VITE_API_URL=http://localhost:8080
```

**Если файла нет, создайте:**

```bash
echo "VITE_API_URL=http://localhost:8080" > .env
```

**После изменения .env перезапустите dev server:**

```bash
npm run dev
```

### 3. **CORS настроен в GoToSocial?**

Если видите ошибку CORS в консоли браузера:

**Добавьте в config.yaml GoToSocial:**

```yaml
# config.yaml
web-cors-allow-origins:
  - "http://localhost:5173"  # Vite dev server
  - "http://localhost:3000"  # Если используете другой порт
```

**Перезапустите GoToSocial:**

```bash
./gotosocial server start
```

### 4. **Есть ли токен авторизации?**

��ткройте DevTools → Application → Local Storage → проверьте `auth_token`

**Если токена нет:**
1. Перейдите на страницу логина
2. Войдите в аккаунт
3. Токен должен сохраниться автоматически

---

## 🐛 Частые ошибки

### "Failed to load feed: Network Error"

**Причина:** GoToSocial не доступен

**Решение:**
1. Проверьте что GoToSocial запущен: `curl http://localhost:8080/api/v1/instance`
2. Проверьте `VITE_API_URL` в `.env`
3. Перезапустите dev server: `npm run dev`

### "Failed to load feed: 401 Unauthorized"

**Причина:** Нет токена авторизации или токен истёк

**Решение:**
1. Перелогиньтесь в приложении
2. Проверьте что токен есть в localStorage
3. Если используете OAuth2, обновите токен

### "Failed to create post: 422 Unprocessable Entity"

**Причина:** GoToSocial не понимает `custom_metadata` (если не доработан)

**Решение:**  
Код уже исправлен - `custom_metadata` отправляется только если есть данные. Но если всё равно ошибка:

1. Проверьте логи GoToSocial
2. Попробуйте создать пост без метаданных (оставьте Market/Category пустыми)
3. Доработайте GoToSocial по гайду `GOTOSOCIAL_SIMPLE_METADATA_GUIDE.md`

### "custom_metadata not found in response"

**Причина:** GoToSocial не возвращает `custom_metadata` (стандартное поведение)

**Решение:**  
Это нормально! Код безопасно обрабатывает отсутствие метаданных:

```typescript
ticker: status.custom_metadata?.ticker,  // Безопасный доступ с ?.
```

Посты будут создаваться и отображаться, просто без бейджей категорий.

---

## ✅ Чек-лист перед использованием

- [ ] GoToSocial запущен и доступен (`curl http://localhost:8080/api/v1/instance`)
- [ ] `.env` файл создан с `VITE_API_URL=http://localhost:8080`
- [ ] Dev server перезапущен после создания `.env` (`npm run dev`)
- [ ] CORS настроен в GoToSocial (если нужен)
- [ ] Пользователь залогинен (ес��ь токен в localStorage)
- [ ] Страница `/feedtest` открывается без ошибок

---

## 📝 Дополнительно

### Если хотите протестировать БЕЗ GoToSocial

Временно можете вернуть моки для тестирования UI:

```typescript
// В FeedTest.tsx закомментируйте useGTSTimeline и используйте MOCK_POSTS

import { MOCK_POSTS } from '@/features/feed/mocks';

// const { statuses, ... } = useGTSTimeline(...);

// Временный вариант для UI тестов:
const statuses = MOCK_POSTS;
const isLoading = false;
const error = null;
const loadMore = async () => {};
const refresh = async () => {};
const newCount = 0;
const loadNew = () => {};
```

**Не забудьте вернуть обратно для реальной интеграции!**

---

## 🎯 Следующие шаги

После того как `/feedtest` заработает:

1. Протестируйте создание поста
2. Протестируйте infinite scroll
3. Протестируйте auto-refresh
4. Интегрируйте другие страницы (profile, notifications)
5. Доработайте GoToSocial для метаданных (опционально)

**Удачи!** 🚀
