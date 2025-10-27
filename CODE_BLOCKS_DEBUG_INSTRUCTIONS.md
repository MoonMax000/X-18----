# Инструкции по отладке блоков кода

## Проблема
Блоки кода не отображаются в опубликованных постах, несмотря на то что они добавляются при создании поста.

## Что уже сделано

### ✅ Проверенные компоненты

1. **CreatePostModal** (`client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx`)
   - Отправляет `code_blocks` в metadata
   - Структура: `{ code_blocks: [{ language: string, code: string }] }`

2. **FeedTest** (`client/pages/FeedTest.tsx`)
   - Конвертирует посты из Custom Backend в формат для ленты
   - Включает: `codeBlocks: post.metadata?.code_blocks || []`

3. **FeedPost** (`client/features/feed/components/posts/FeedPost.tsx`)
   - Рендерит блоки кода
   - Имеет правильную логику отображения с inline styles для переноса текста

4. **Backend API** (`custom-backend/internal/api/posts.go`)
   - Метод CreatePost принимает metadata как `map[string]interface{}`
   - Сохраняет metadata в поле JSONB в PostgreSQL
   - **ДОБАВЛЕНО: Debug логирование для отслеживания metadata**

5. **Post модель** (`custom-backend/internal/models/post.go`)
   - Поле Metadata определено как `type Metadata map[string]interface{}`
   - Имеет правильные методы Scan и Value для работы с JSONB

6. **Timeline API** (`custom-backend/internal/api/timeline.go`)
   - Возвращает посты с полным metadata через Preload

## Текущий статус

### 🔍 Добавлено Debug логирование

В `custom-backend/internal/api/posts.go` добавлено логирование в метод CreatePost:

1. **При получении запроса:**
   ```go
   fmt.Printf("[CreatePost DEBUG] Request received:\n")
   fmt.Printf("  Content: %s\n", req.Content)
   fmt.Printf("  Metadata: %+v\n", req.Metadata)
   if codeBlocks, ok := req.Metadata["code_blocks"]; ok {
       fmt.Printf("  Code blocks found: %+v\n", codeBlocks)
   }
   ```

2. **Перед сохранением в БД:**
   ```go
   fmt.Printf("[CreatePost DEBUG] Saving post with metadata: %+v\n", post.Metadata)
   ```

3. **После сохранения:**
   ```go
   fmt.Printf("[CreatePost DEBUG] Post saved with ID: %s\n", post.ID)
   fmt.Printf("[CreatePost DEBUG] Metadata after save: %+v\n", post.Metadata)
   ```

4. **При возврате финального поста:**
   ```go
   fmt.Printf("[CreatePost DEBUG] Final post metadata: %+v\n", fullPost.Metadata)
   ```

## Инструкции по тестированию

### Шаг 1: Откройте приложение
```bash
# Приложение уже запущено на http://localhost:5173
open http://localhost:5173
```

### Шаг 2: Войдите или создайте аккаунт
- Используйте существующий аккаунт или зарегистрируйте новый

### Шаг 3: Создайте пост с блоком кода

1. Откройте модальное окно создания поста
2. Добавьте текст, например: "Тестовый пост с блоком кода"
3. Нажмите кнопку добавления блока кода `</>` 
4. Выберите язык (например, JavaScript)
5. Введите код, например:
   ```javascript
   function test() {
     console.log('Hello World');
     return 42;
   }
   ```
6. Нажмите "Опубликовать"

### Шаг 4: Проверьте логи бэкенда

В отдельном терминале выполните:

```bash
tail -f custom-backend.log
```

Вы должны увидеть что-то вроде:

```
[CreatePost DEBUG] Request received:
  Content: Тестовый пост с блоком кода
  Metadata: map[code_blocks:[map[code:function test() {
  console.log('Hello World');
  return 42;
} language:javascript]]]
  Code blocks found: [map[code:function test() {
  console.log('Hello World');
  return 42;
} language:javascript]]
[CreatePost DEBUG] Saving post with metadata: map[code_blocks:[map[code:function test() {
  console.log('Hello World');
  return 42;
} language:javascript]]]
[CreatePost DEBUG] Post saved with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[CreatePost DEBUG] Metadata after save: map[code_blocks:[map[code:function test() {
  console.log('Hello World');
  return 42;
} language:javascript]]]
[CreatePost DEBUG] Final post metadata: map[code_blocks:[map[code:function test() {
  console.log('Hello World');
  return 42;
} language:javascript]]
```

### Шаг 5: Откройте консоль разработчика браузера

1. Откройте DevTools (F12 или Cmd+Option+I)
2. Перейдите на вкладку Console
3. Обновите ленту или перейдите на неё

Ищите логи от FeedTest и FeedPost:

```
[FeedTest] Fetched 10 posts from Custom Backend
[FeedTest] Post with code_blocks: {id: "...", codeBlocks: Array(1)}
[FeedPost] Rendering code blocks: {postId: "...", count: 1, codeBlocks: Array(1)}
```

### Шаг 6: Проверьте визуально

Пост должен отображаться с:
- Текстом поста
- Блоком кода в темном фоне с синтаксической подсветкой
- Правильным переносом длинных строк

## Возможные проблемы и решения

### Проблема 1: Логи показывают, что metadata пустая при получении

**Признаки:**
```
[CreatePost DEBUG] Metadata: map[]
```

**Причина:** Frontend не отправляет metadata

**Решение:** Проверить network tab в DevTools, убедиться что POST запрос содержит metadata

### Проблема 2: Metadata есть при получении, но теряется после сохранения

**Признаки:**
```
[CreatePost DEBUG] Saving post with metadata: map[code_blocks:[...]]
[CreatePost DEBUG] Metadata after save: map[]
```

**Причина:** GORM не сериализует metadata правильно в JSONB

**Решение:** Проверить методы Scan/Value в модели Post

### Проблема 3: Metadata сохраняется, но не возвращается через API

**Признаки:**
```
[CreatePost DEBUG] Final post metadata: map[]
```

**Причина:** Preload не загружает JSONB поля

**Решение:** Проверить запрос в timeline.go

### Проблема 4: Данные приходят на frontend, но не отображаются

**Признаки:** В консоли браузера нет логов от FeedPost о рендеринге code_blocks

**Причина:** Конвертация в FeedTest не работает или post.codeBlocks undefined

**Решение:** Добавить больше логирования в FeedTest.tsx

## Дополнительные команды для отладки

### Проверка данных в БД напрямую:

```bash
# Подключение к PostgreSQL
docker exec -it x-18-----postgres-1 psql -U postgres -d x18_dev

# В psql:
SELECT id, content, metadata FROM posts ORDER BY created_at DESC LIMIT 1;

# Красивый вывод JSON:
SELECT id, content, jsonb_pretty(metadata) FROM posts ORDER BY created_at DESC LIMIT 1;

# Поиск постов с code_blocks:
SELECT id, content, metadata->'code_blocks' as code_blocks 
FROM posts 
WHERE metadata ? 'code_blocks' 
ORDER BY created_at DESC 
LIMIT 3;
```

### Проверка всей цепочки:

```bash
# 1. Создать пост через API напрямую
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post with code",
    "metadata": {
      "code_blocks": [
        {
          "language": "javascript",
          "code": "console.log(\"test\");"
        }
      ]
    }
  }'

# 2. Получить пост обратно
curl http://localhost:8080/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Получить timeline
curl http://localhost:8080/api/timeline/home \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Что делать дальше

1. **Создайте пост с блоком кода** через UI
2. **Проверьте логи** в `custom-backend.log`
3. **Сообщите результаты:**
   - Появились ли логи с metadata?
   - На каком этапе metadata теряется (если теряется)?
   - Что показывает консоль браузера?
   - Что показывает прямой запрос к БД?

## Известные факты

- ✅ Frontend правильно формирует и отправляет metadata с code_blocks
- ✅ Backend API принимает metadata как map[string]interface{}
- ✅ Post модель поддерживает JSONB через custom Metadata type
- ✅ Frontend правильно конвертирует и рендерит code_blocks
- ❓ Неизвестно: сохраняется ли metadata в БД и возвращается ли обратно

Следующий шаг - определить, где именно теряются данные в цепочке.
