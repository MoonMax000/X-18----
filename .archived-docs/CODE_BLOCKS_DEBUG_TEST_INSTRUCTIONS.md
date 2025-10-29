# Инструкции для тестирования блоков кода с отладкой

## Что было сделано

Добавлено детальное логирование в 3 ключевых местах:

1. **CodeBlockModal** - когда нажимается кнопка "Insert Code"
2. **useSimpleComposer.insertCodeBlock** - когда код добавляется в состояние
3. **CreatePostModal.handlePost** - когда отправляется пост

## Как протестировать

### Шаг 1: Откройте консоль браузера
- Chrome/Edge: F12 или Cmd+Option+I (Mac)
- Перейдите на вкладку Console

### Шаг 2: Откройте приложение
```bash
# Если фронтенд не запущен
npm run dev
```

### Шаг 3: Создайте пост с блоком кода
1. Нажмите кнопку создать пост
2. Нажмите кнопку `</>` (Insert Code Block)
3. Вставьте любой код, например:
   ```javascript
   console.log("Hello");
   ```
4. Выберите язык (например JavaScript)
5. Нажмите "Insert Code"
6. **ВАЖНО:** Проверьте консоль - должны появиться логи
7. Добавьте текст в пост
8. Нажмите "Post"
9. **ВАЖНО:** Проверьте консоль снова

## Что искать в консоли

### Лог 1: При вставке кода (CodeBlockModal)
```
[CodeBlockModal] Inserting code block: {
  language: "javascript",
  codeLength: 24,
  code: "console.log(\"Hello\");"
}
```

### Лог 2: При добавлении в состояние (useSimpleComposer)
```
[useSimpleComposer - insertCodeBlock] Adding code block: {
  id: "code-1730000000000",
  language: "javascript",
  codeLength: 24
}

[useSimpleComposer - insertCodeBlock] Updated codeBlocks: {
  previousLength: 0,
  newLength: 1,
  allBlocks: [{id: "code-1730000000000", language: "javascript"}]
}
```

### Лог 3: При отправке поста (CreatePostModal)
```
[CreatePostModal - handlePost START] codeBlocks state: {
  codeBlocks: [{...}],
  length: 1,
  isEmpty: false,
  items: [{id: "code-...", language: "javascript", codeLength: 24}]
}

[CreatePostModal] Added code blocks to metadata: {
  count: 1,
  codeBlocks: [{language: "javascript", code: "console.log(\"Hello\");"}]
}

[CreatePostModal] Creating post with payload: {
  content: "...",
  metadata: {
    code_blocks: [{...}],
    ...
  }
}
```

## Возможные проблемы

### Проблема 1: Нет Лога 1
- **Значит:** CodeBlockModal не вызывает onInsert
- **Решение:** Проверить связь между CodeBlockModal и CreatePostModal

### Проблема 2: Есть Лог 1, но нет Лога 2
- **Значит:** onInsert из CodeBlockModal не вызывает insertCodeBlock из useSimpleComposer
- **Решение:** Проверить props в CreatePostModal

### Проблема 3: Есть Логи 1 и 2, но Лог 3 показывает length: 0
- **Значит:** Состояние codeBlocks теряется между добавлением и отправкой
- **Решение:** Проблема с замыканием в handlePost callback

### Проблема 4: Все логи есть, но backend не получает code_blocks
- **Значит:** Проблема в serialization или в API запросе
- **Решение:** Проверить customBackendAPI.createPost

## Backend логи

Также проверьте логи backend:
```bash
tail -f custom-backend-live.log
```

Должны увидеть:
```
[CreatePost] Received metadata: map[code_blocks:[map[code:... language:javascript]]]
```

## Следующие шаги

После тестирования сообщите какие логи вы видели, чтобы мы могли определить где именно теряются данные.
