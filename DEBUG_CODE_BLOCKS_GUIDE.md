# 🔍 Руководство по отладке блоков кода в постах

## 📁 Ключевые файлы

### Frontend - Отображение блоков кода
**Файл**: `client/features/feed/components/posts/FeedPost.tsx`
**Строки**: ~238-257

```tsx
{/* Code Blocks */}
{post.codeBlocks && post.codeBlocks.length > 0 && (() => {
  console.log('[FeedPost] Rendering code blocks:', {
    postId: post.id,
    count: post.codeBlocks.length,
    codeBlocks: post.codeBlocks,
  });
  return (
    <div className="flex flex-col gap-3 mt-2">
      {post.codeBlocks.map((cb, idx) => (
      <div key={idx} className="rounded-lg border border-[#2D2D2D] bg-[#0A0A0A] overflow-hidden w-full max-w-full">
        {/* ... */}
      </div>
      ))}
    </div>
  );
})()}
```

**Проблемы растяжения секции**: Строка 248 - если убрать `max-w-full` или `overflow-hidden`, секция будет растягиваться.

### Frontend - Конвертер данных
**Файл**: `client/pages/FeedTest.tsx`
**Строки**: ~36-79 (функция `customPostToFeedPost`)

```typescript
// Debug logging for code blocks
if (post.metadata?.code_blocks) {
  console.log('[FeedTest] Converting post with code blocks:', {
    postId: post.id,
    metadata: post.metadata,
    codeBlocks: post.metadata.code_blocks,
  });
}

// ...

codeBlocks: post.metadata?.code_blocks || [],
```

### Frontend - Создание поста
**Файл**: `client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx`
**Строки**: ~114-127

```typescript
// Add code blocks to metadata
if (codeBlocks.length > 0) {
  metadata.code_blocks = codeBlocks.map(cb => ({
    language: cb.language,
    code: cb.code
  }));
  console.log('[CreatePostModal] Added code blocks to metadata:', {
    count: codeBlocks.length,
    codeBlocks: metadata.code_blocks,
  });
}
```

### Backend - API создания постов
**Файл**: `custom-backend/internal/api/posts.go`
**Строка**: 86 - Metadata принимается и сохраняется

```go
post := models.Post{
    // ...
    Metadata:    req.Metadata,  // <-- Здесь сохраняется
    // ...
}
```

### Backend - Модель Post
**Файл**: `custom-backend/internal/models/post.go`
**Строки**: 46-47

```go
// Trading metadata (JSONB)
Metadata Metadata `gorm:"type:jsonb" json:"metadata,omitempty"`
```

### Backend - Timeline API
**Файл**: `custom-backend/internal/api/timeline.go`
**Строка**: 122 - Возвращает посты с metadata

```go
return c.JSON(fiber.Map{
    "posts":  posts,  // <-- Включает metadata
    // ...
})
```

## 🧪 Пошаговая отладка

### Шаг 1: Проверить создание поста

1. Открыть DevTools (F12) → Console
2. Очистить консоль
3. Создать пост с блоком кода:
   - Нажать кнопку `</>`
   - Выбрать язык: `javascript`
   - Вставить код: `console.log("test");`
   - Нажать "Add Code Block"
   - Нажать "Post"

**Ожидаемые логи**:
```
[CreatePostModal] Added code blocks to metadata: {
  count: 1,
  codeBlocks: [{language: "javascript", code: "console.log(\"test\");"}]
}

[CreatePostModal] Creating post with payload: {
  content: "...",
  metadata: {
    code_blocks: [{language: "javascript", code: "..."}]
  }
}

[CreatePostModal] Post created successfully: {
  postId: "...",
  hasMetadata: true,
  metadata: {code_blocks: [...]}
}
```

❌ **Если логов нет** → Проблема в CreatePostModal
✅ **Если логи есть** → Переходим к шагу 2

### Шаг 2: Проверить backend

Выполнить команду:
```bash
# Проверить последний пост в БД
psql -U postgres -d x18_db -c "SELECT id, content, metadata FROM posts ORDER BY created_at DESC LIMIT 1;"
```

**Ожидаемый результат**:
```
id     | content | metadata
-------|---------|----------
abc123 | test    | {"code_blocks":[{"language":"javascript","code":"console.log(\"test\");"}]}
```

❌ **Если metadata пустой или NULL** → Проблема в backend API
✅ **Если metadata содержит code_blocks** → Переходим к шагу 3

### Шаг 3: Проверить Timeline API

Выполнить команду:
```bash
# Получить timeline через API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/timeline/explore?limit=1 | jq '.posts[0].metadata'
```

**Ожидаемый результат**:
```json
{
  "code_blocks": [
    {
      "language": "javascript",
      "code": "console.log(\"test\");"
    }
  ]
}
```

❌ **Если metadata пустой** → Проблема в Timeline API
✅ **Если metadata содержит code_blocks** → Переходим к шагу 4

### Шаг 4: Проверить конвертер данных

1. В DevTools → Console
2. Обновить страницу (F5)
3. Посмотреть логи загрузки

**Ожидаемые логи**:
```
[FeedTest] Converting post with code blocks: {
  postId: "...",
  metadata: {code_blocks: [...]},
  codeBlocks: [...]
}

[FeedTest] Converted post with codeBlocks: {
  postId: "...",
  codeBlocksCount: 1,
  codeBlocks: [{language: "javascript", code: "..."}]
}
```

❌ **Если логов нет** → Проблема в конвертере FeedTest
✅ **Если логи есть** → Переходим к шагу 5

### Шаг 5: Проверить отображение

Посмотреть логи в Console:

**Ожидаемые логи**:
```
[FeedPost] Rendering code blocks: {
  postId: "...",
  count: 1,
  codeBlocks: [{language: "javascript", code: "..."}]
}
```

✅ **Если лог есть** → Блок должен отображаться
❌ **Если лога нет** → Проблема в FeedPost рендеринге

### Шаг 6: Проверить DOM

1. В DevTools → Elements
2. Найти пост (Ctrl+F → искать ID поста)
3. Проверить наличие блока кода:
   - Должен быть `<div>` с классом `flex flex-col gap-3 mt-2`
   - Внутри `<div>` с `border-[#2D2D2D] bg-[#0A0A0A]`
   - Внутри `<pre>` с кодом

❌ **Если элемента нет** → Код не рендерится (проблема в условии)
✅ **Если элемент есть** → Проблема в CSS (невидимость)

## 🔧 Типичные проблемы и решения

### Проблема 1: Блок кода растягивает секцию

**Файл**: `client/features/feed/components/posts/FeedPost.tsx`
**Строка**: 248

**Решение**: Убедиться что есть:
```tsx
<div className="... w-full max-w-full overflow-hidden">
<pre className="... overflow-x-auto w-full" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
<code className="block">
```

### Проблема 2: metadata не сохраняется в БД

**Файл**: `custom-backend/internal/api/posts.go`

**Проверить**: 
- Строка 86: `Metadata: req.Metadata`
- Строка 39-40: `Metadata map[string]interface{}`

### Проблема 3: code_blocks не попадают в codeBlocks

**Файл**: `client/pages/FeedTest.tsx`
**Строка**: 71

**Проверить**:
```typescript
codeBlocks: post.metadata?.code_blocks || [],
```

### Проблема 4: TypeScript типы блокируют данные

**Файл**: `client/services/api/custom-backend.ts`
**Строки**: 522, 543

**Должно быть**:
```typescript
metadata?: Record<string, any>;  // НЕ Record<string, string>!
```

## 📊 Диаграмма потока данных

```
1. CreatePostModal
   ↓ metadata.code_blocks = [{language, code}]
   
2. Backend API (/api/posts/)
   ↓ req.Metadata
   
3. PostgreSQL (JSONB)
   ↓ posts.metadata
   
4. Timeline API (/api/timeline/explore)
   ↓ JSON response
   
5. TypeScript deserialization
   ↓ post: Post
   
6. FeedTest.customPostToFeedPost()
   ↓ post.metadata?.code_blocks → codeBlocks
   
7. FeedPost component
   ↓ post.codeBlocks?.map()
   
8. DOM rendering
   ↓ <div><pre><code>
```

## 🚨 Быстрая проверка

Выполнить скрипт `./debug-code-blocks.sh` (см. ниже)

## 📝 Чек-лист отладки

- [ ] Логи в CreatePostModal присутствуют
- [ ] Metadata сохраняется в БД
- [ ] Timeline API возвращает metadata
- [ ] Конвертер создает codeBlocks
- [ ] FeedPost получает codeBlocks
- [ ] DOM содержит элементы блока кода
- [ ] CSS не скрывает блок (opacity, display, visibility)
- [ ] TypeScript типы правильные (Record<string, any>)

## 🔍 SQL запросы для отладки

```sql
-- Проверить последний пост
SELECT id, content, metadata 
FROM posts 
ORDER BY created_at DESC 
LIMIT 1;

-- Проверить все посты с code_blocks
SELECT id, content, metadata->'code_blocks' as code_blocks
FROM posts 
WHERE metadata ? 'code_blocks'
ORDER BY created_at DESC;

-- Посчитать посты с code_blocks
SELECT COUNT(*) 
FROM posts 
WHERE metadata ? 'code_blocks';
```

## 🛠️ Файлы для правки при проблемах с растяжением

1. **FeedPost.tsx** (строка 248):
   ```tsx
   <div className="... max-w-full overflow-hidden">
   ```

2. **FeedPost.tsx** (строка 252):
   ```tsx
   <pre className="... overflow-x-auto w-full max-w-full">
   ```

3. **FeedPost.tsx** (строка 253):
   ```tsx
   <code className="block" style={{
     whiteSpace: 'pre-wrap',
     wordBreak: 'break-word',
     overflowWrap: 'break-word'
   }}>
   ```

4. **CreatePostModal.tsx** (строка 206):
   ```tsx
   <div className="... max-w-full overflow-hidden">
   ```

## 📞 Поддержка

Если проблема не решается:
1. Соберите все логи из Console
2. Сделайте скриншот Elements (DOM)
3. Выполните SQL запросы
4. Проверьте Network tab (запрос /api/timeline/explore)
