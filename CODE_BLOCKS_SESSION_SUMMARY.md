# Сводка сессии: Проблема с блоками кода в постах

## 📋 Исходная проблема

Пользователь сообщил о двух проблемах при добавлении блоков кода в посты:

1. **Горизонтальное расширение**: Контейнер с кодом расширяется горизонтально за пределы экрана, расширяя даже кнопку "Post"
2. **Код не отображается**: Блоки кода не отображаются в опубликованных постах

## 🏗️ Архитектура системы

### Backend (Custom Backend - Go)
- PostgreSQL с полем `metadata` типа JSONB в таблице `posts`
- API endpoint: `POST /api/posts`
- Структура: `custom-backend/internal/api/posts.go`
- Модель: `custom-backend/internal/models/post.go`

### Frontend (React + TypeScript)
- CreatePostModal: `client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx`
- Конвертер: `client/pages/FeedTest.tsx` (функция `customPostToFeedPost`)
- Отображение: `client/features/feed/components/posts/FeedPost.tsx`

### Поток данных
```
CreatePostModal (создание)
  ↓ [code_blocks в metadata]
Custom Backend API
  ↓ [сохранение в PostgreSQL JSONB]
Database (metadata.code_blocks)
  ↓ [получение через timeline API]
FeedTest (конвертер)
  ↓ [преобразование в codeBlocks]
FeedPost (рендеринг)
  ↓ [отображение блоков кода]
```

## ✅ Выполненные изменения

### 1. Исправление горизонтального переполнения

**Файл**: `client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx`

```tsx
// Добавлено к контейнеру блоков кода:
<div className="mt-3 space-y-2 max-w-full overflow-hidden">

// Изменено в <pre> элементе:
<code className="block break-all whitespace-pre-wrap">{cb.code}</code>
```

**Что сделано**:
- Добавлен `max-w-full overflow-hidden` к родительскому контейнеру
- Использован `break-all whitespace-pre-wrap` для переноса длинных строк
- Блоки кода теперь НЕ должны расширять контейнер

### 2. Добавлено логирование для отладки

#### CreatePostModal
```typescript
// Логирует при добавлении code_blocks в metadata
console.log('[CreatePostModal] Added code blocks to metadata:', {
  count: codeBlocks.length,
  codeBlocks: metadata.code_blocks,
});

// Логирует полный payload перед отправкой
console.log('[CreatePostModal] Creating post with payload:', postPayload);

// Логирует ответ от сервера
console.log('[CreatePostModal] Post created successfully:', {
  postId: createdPost.id,
  hasMetadata: !!createdPost.metadata,
  metadata: createdPost.metadata,
});
```

#### FeedTest (конвертер)
```typescript
// Логирует при конвертации поста с блоками кода
if (post.metadata?.code_blocks) {
  console.log('[FeedTest] Converting post with code blocks:', {
    postId: post.id,
    metadata: post.metadata,
    codeBlocks: post.metadata.code_blocks,
  });
}

// Логирует результат конвертации
if (convertedPost.codeBlocks && convertedPost.codeBlocks.length > 0) {
  console.log('[FeedTest] Converted post with codeBlocks:', {
    postId: convertedPost.id,
    codeBlocksCount: convertedPost.codeBlocks.length,
    codeBlocks: convertedPost.codeBlocks,
  });
}
```

#### FeedPost (рендеринг)
```typescript
// Логирует при рендеринге блоков кода
console.log('[FeedPost] Rendering code blocks:', {
  postId: post.id,
  count: post.codeBlocks.length,
  codeBlocks: post.codeBlocks,
});
```

### 3. Созданы тестовые скрипты

- `test-code-blocks-full.sh` - комплексный тест всей цепочки
- Проверяет создание через API, сохранение в БД, получение через timeline

## 🔍 Структура данных

### В CreatePostModal (отправка)
```json
{
  "content": "Текст поста",
  "metadata": {
    "code_blocks": [
      {
        "language": "javascript",
        "code": "console.log('hello');"
      }
    ]
  }
}
```

### В PostgreSQL (хранение)
```sql
-- Таблица posts
-- Поле metadata типа JSONB
{
  "code_blocks": [
    {
      "language": "javascript",
      "code": "console.log('hello');"
    }
  ]
}
```

### В FeedTest (конвертация)
```typescript
codeBlocks: post.metadata?.code_blocks || []
```

### В FeedPost (рендеринг)
```tsx
{post.codeBlocks && post.codeBlocks.length > 0 && (() => {
  // Рендерим блоки кода
})()}
```

## ❓ Текущий статус

**ПРОБЛЕМА НЕ РЕШЕНА** - Пользователь сообщил что "ничего не работает"

### Возможные причины

1. **Backend не сохраняет metadata**
   - Возможно API не передает `metadata.code_blocks` в БД
   - Нужно проверить логи backend: `tail -f custom-backend.log`

2. **Metadata не возвращается в timeline API**
   - Backend может не включать metadata в ответ
   - Нужно проверить endpoint `/api/timelines/public`

3. **Конвертер не преобразует данные**
   - `post.metadata?.code_blocks` может быть undefined
   - Нужно проверить консоль браузера на наличие логов `[FeedTest]`

4. **Компонент не рендерит блоки**
   - `post.codeBlocks` может быть пустым массивом
   - Нужно проверить логи `[FeedPost]` в консоли

## 🔧 Что нужно проверить

### 1. Проверка в DevTools Console (браузер)

Открыть http://localhost:5173, F12 → Console

**При создании поста**:
- Должен быть лог `[CreatePostModal] Added code blocks to metadata`
- Должен быть лог `[CreatePostModal] Creating post with payload`
- Payload должен содержать `metadata.code_blocks`

**При загрузке ленты**:
- Должен быть лог `[FeedTest] Converting post with code blocks`
- Должен быть лог `[FeedTest] Converted post with codeBlocks`

**При рендеринге**:
- Должен быть лог `[FeedPost] Rendering code blocks`

### 2. Проверка Backend

```bash
# Проверить логи backend
tail -f custom-backend.log

# Проверить БД напрямую
psql -U postgres -d gotosocial_db
SELECT id, content, metadata FROM posts ORDER BY created_at DESC LIMIT 1;
```

### 3. Проверка API

```bash
# Получить timeline
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/timelines/public

# Посмотреть есть ли metadata в ответе
```

## 📁 Ключевые файлы для отладки

### Frontend
1. `client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx` - создание поста
2. `client/pages/FeedTest.tsx` - конвертер данных
3. `client/features/feed/components/posts/FeedPost.tsx` - отображение
4. `client/features/feed/types.ts` - типы данных

### Backend
1. `custom-backend/internal/api/posts.go` - API создания постов
2. `custom-backend/internal/models/post.go` - модель поста
3. `custom-backend/internal/api/timeline.go` - API timeline

### Другие
1. `test-code-blocks-full.sh` - тестовый скрипт
2. `CODE_BLOCKS_DEBUG_GUIDE.md` - руководство по отладке

## 🎯 Следующие шаги

1. **Войти в систему** на http://localhost:5173
2. **Открыть DevTools** (F12) → вкладка Console
3. **Создать пост с блоком кода**:
   - Нажать кнопку `</>` 
   - Ввести код
   - Нажать "Post"
4. **Проверить логи в Console**:
   - Искать `[CreatePostModal]`, `[FeedTest]`, `[FeedPost]`
   - Определить на каком этапе теряются данные
5. **Проверить backend логи**:
   - `tail -f custom-backend.log`
   - Посмотреть сохраняется ли metadata
6. **Проверить БД**:
   - Посмотреть содержит ли поле metadata блоки кода

## 💡 Дополнительная информация

### Запуск стека
```bash
./START_CUSTOM_BACKEND_STACK.sh  # запуск backend
npm run dev                        # запуск frontend
```

### Тестовые данные
- Email: `test@example.com` (или создать через Sign Up)
- Пароль: `password123`

### Проверка статуса
```bash
# Backend
curl http://localhost:8080/health

# Frontend
curl http://localhost:5173
```

## 🚨 Важные замечания

1. Backend сохраняет metadata напрямую без дополнительной обработки
2. Конвертер должен читать `post.metadata?.code_blocks`
3. FeedPost проверяет `post.codeBlocks && post.codeBlocks.length > 0`
4. Все логирование уже добавлено - нужно только проверить в консоли

## 📊 Статус исправлений

- ✅ Горизонтальное переполнение - ИСПРАВЛЕНО (CSS)
- ❌ Отображение блоков кода - НЕ РАБОТАЕТ (требуется отладка)
- ✅ Логирование - ДОБАВЛЕНО (во всех точках)
- ✅ Тестовые скрипты - СОЗДАНЫ

---

**Дата сессии**: 27.10.2025, ~18:30-18:47
**Основная проблема**: Блоки кода не отображаются в постах
**Требуется**: Отладка с реальным тестированием в браузере
