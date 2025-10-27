# Руководство по отладке блоков кода

## 🔍 Проблема
Блоки кода не отображаются в опубликованных постах.

## ✅ Что уже сделано

### 1. Frontend изменения
- ✅ CSS для предотвращения горизонтального переполнения
- ✅ Логирование в CreatePostModal
- ✅ Логирование в FeedTest (конвертер)
- ✅ Логирование в FeedPost (рендеринг)

### 2. Структура данных
```typescript
// В CreatePostModal при создании поста:
metadata.code_blocks = [
  {
    language: "javascript",
    code: "console.log('hello')"
  }
]

// В FeedTest конвертер должен преобразовать в:
codeBlocks: post.metadata?.code_blocks || []

// В FeedPost должно отобразиться
```

## 🧪 Пошаговая отладка

### Шаг 1: Открыть DevTools
1. Откройте http://localhost:5173
2. Нажмите F12 (или Cmd+Option+I на Mac)
3. Перейдите на вкладку **Console**

### Шаг 2: Создать пост с кодом
1. Войдите в систему (если нужно)
2. Нажмите на кнопку `</>` (Code) в создании поста
3. Введите код, например:
   ```javascript
   function hello() {
     console.log("Hello World");
   }
   ```
4. Выберите язык: JavaScript
5. Нажмите "Insert Code"
6. Нажмите "Post"

### Шаг 3: Проверить логи в Console

#### 3.1 При создании поста ищите:
```
[CreatePostModal] Added code blocks to metadata: {...}
```
**Что проверить:**
- Есть ли этот лог?
