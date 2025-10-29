# Финальная отладка блоков кода - Инструкции

## 🔍 Что мы ищем

Мы добавили детальное логирование на всех этапах создания поста с блоками кода, чтобы найти, где именно теряются данные.

## 📋 Инструкции по тестированию

### Шаг 1: Откройте консоль браузера

1. Откройте приложение в браузере
2. Нажмите `F12` или `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
3. Перейдите на вкладку **Console**

### Шаг 2: Создайте пост с блоком кода

1. Нажмите кнопку "Create Post" или откройте модальное окно создания поста
2. Введите любой текст (например: "Test post with code")
3. Нажмите кнопку **`</>`** (Code Block)
4. В открывшемся окне:
   - Выберите язык (например, JavaScript)
   - Вставьте код:
     ```javascript
     console.log("Hello, World!");
     const x = 42;
     ```
5. Нажмите **"Insert Code"**
6. Убедитесь, что блок кода отображается в preview
7. Нажмите **"Post"**

### Шаг 3: Скопируйте логи

В консоли вы должны увидеть логи в следующем порядке:

```
[CodeBlockModal] Inserting code block: { language: "javascript", codeLength: 45, code: "..." }
[useSimpleComposer - insertCodeBlock] Adding code block: { id: "code-...", language: "javascript", codeLength: 45 }
[useSimpleComposer - insertCodeBlock] Updated codeBlocks: { previousLength: 0, newLength: 1, allBlocks: [...] }
[CreatePostModal - handlePost START] codeBlocks state: { codeBlocks: [...], length: 1, isEmpty: false, items: [...] }
[CreatePostModal] Added code blocks to metadata: { count: 1, codeBlocks: [...] }
[CreatePostModal] Creating post with payload: { content: "...", metadata: { code_blocks: [...], ... }, ... }
```

### Шаг 4: Проверьте результат

**ВАЖНО:** Скопируйте ВСЕ логи из консоли, особенно:
- Лог `[CreatePostModal - handlePost START]` - показывает состояние codeBlocks
- Лог `[CreatePostModal] Creating post with payload` - показывает финальный payload

## 🔎 Что мы проверяем

### Ожидаемое поведение

1. **CodeBlockModal** должен вызвать `onInsert` с кодом
2. **useSimpleComposer** должен добавить блок в state
3. **CreatePostModal** должен увидеть этот блок в `codeBlocks` array
4. **Payload** должен содержать `metadata.code_blocks`

### Возможные проблемы

#### Проблема 1: codeBlocks пустой в handlePost
```javascript
[CreatePostModal - handlePost START] codeBlocks state: { length: 0, isEmpty: true }
```
**Означает**: Блок не добавился в state хука или произошла проблема с React state

#### Проблема 2: codeBlocks есть, но не попал в metadata
```javascript
[CreatePostModal - handlePost START] codeBlocks state: { length: 1, isEmpty: false }
// НО нет лога: [CreatePostModal] Added code blocks to metadata
```
**Означает**: Условие `if (codeBlocks.length > 0)` не сработало

#### Проблема 3: metadata есть, но не в payload
```javascript
[CreatePostModal] Added code blocks to metadata: { count: 1 }
// НО в payload:
[CreatePostModal] Creating post with payload: { metadata: { /* нет code_blocks */ } }
```
**Означает**: Что-то перезаписало metadata между созданием и отправкой

## 📊 Backend логи

Backend также логирует входящие запросы. После создания поста проверьте terminal где запущен backend:

```bash
tail -f custom-backend.log
```

Вы должны увидеть:
```
[CreatePost] Received request
[CreatePost] Request body: ...
[CreatePost] Metadata: map[code_blocks:[...] ...]
```

## 🎯 Что делать дальше

После тестирования предоставьте:

1. **Скриншот консоли** с логами
2. **Backend логи** из terminal
3. **Описание**: видели ли вы блок кода в preview перед отправкой?

Это поможет точно определить, на каком этапе теряются данные.

## 🛠️ Альтернативный метод отладки

Если консоль недоступна, можно проверить backend напрямую:

```bash
