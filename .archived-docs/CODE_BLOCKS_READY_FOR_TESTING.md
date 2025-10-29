# 🔍 Система отладки блоков кода готова к тестированию

## ✅ Что было сделано

### 1. Добавлено Debug логирование в Backend
В `custom-backend/internal/api/posts.go` добавлено 4 точки логирования:

```go
// При получении запроса
fmt.Printf("[CreatePost DEBUG] Request received:\n")
fmt.Printf("  Content: %s\n", req.Content)
fmt.Printf("  Metadata: %+v\n", req.Metadata)
if codeBlocks, ok := req.Metadata["code_blocks"]; ok {
    fmt.Printf("  Code blocks found: %+v\n", codeBlocks)
}

// Перед сохранением в БД
fmt.Printf("[CreatePost DEBUG] Saving post with metadata: %+v\n", post.Metadata)

// После сохранения
fmt.Printf("[CreatePost DEBUG] Post saved with ID: %s\n", post.ID)
fmt.Printf("[CreatePost DEBUG] Metadata after save: %+v\n", post.Metadata)

// При возврате финального поста
fmt.Printf("[CreatePost DEBUG] Final post metadata: %+v\n", fullPost.Metadata)
```

### 2. Перезапущен бэкенд
- Старый процесс (PID 5220) был остановлен
- Новый процесс (PID 38313) запущен с изменениями
- Frontend перезапущен (PID 38319)

### 3. Все компоненты проверены
✅ CreatePostModal - отправляет code_blocks  
✅ FeedTest - конвертирует данные  
✅ FeedPost - рендерит блоки  
✅ Backend API - принимает metadata  
✅ Post модель - поддерживает JSONB  
✅ Timeline API - возвращает metadata  

## 🧪 СЛЕДУЮЩИЙ ШАГ - ТЕСТИРОВАНИЕ

### Шаг 1: Создайте пост с блоком кода

1. Откройте http://localhost:5173
2. Войдите в аккаунт
3. Создайте новый пост:
   - Добавьте текст: "Test code block"
   - Нажмите кнопку `</>` для добавления блока кода
   - Выберите язык (JavaScript, Python и т.д.)
   - Введите код, например:
     ```javascript
     function hello() {
       console.log('test');
     }
     ```
4. Нажмите "Опубликовать"

### Шаг 2: Проверьте логи

В другом терминале запустите:
```bash
tail -f custom-backend.log | grep -A 5 "CreatePost DEBUG"
```

Вы должны увидеть логи вроде:
```
[CreatePost DEBUG] Request received:
  Content: Test code block
  Metadata: map[code_blocks:[map[code:function hello() {
  console.log('test');
} language:javascript]]]
  Code blocks found: [map[code:function hello() {
  console.log('test');
} language:javascript]]
[CreatePost DEBUG] Saving post with metadata: map[code_blocks:...]
[CreatePost DEBUG] Post saved with ID: xxx-xxx-xxx
[CreatePost DEBUG] Metadata after save: map[code_blocks:...]
[CreatePost DEBUG] Final post metadata: map[code_blocks:...]
```

### Шаг 3: Проверьте консоль браузера

1. Откройте DevTools (F12)
2. Перейдите на вкладку Console
3. Обновите ленту
4. Ищите логи:
```
[FeedTest] Post with code_blocks: {id: "...", codeBlocks: Array(1)}
[FeedPost] Rendering code blocks: {postId: "...", count: 1}
```

### Шаг 4: Проверьте визуально

Пост должен отображаться с блоком кода в темном фоне.

## 🔍 Что покажут логи

Логи точно покажут, где теряются данные:

**Сценарий 1: Metadata не приходит на backend**
```
[CreatePost DEBUG] Metadata: map[]
```
→ Проблема в frontend (CreatePostModal)

**Сценарий 2: Metadata теряется при сохранении**
```
[CreatePost DEBUG] Saving post with metadata: map[code_blocks:...]
[CreatePost DEBUG] Metadata after save: map[]
```
→ Проблема в GORM сериализации

**Сценарий 3: Metadata не возвращается**
```
[CreatePost DEBUG] Metadata after save: map[code_blocks:...]
[CreatePost DEBUG] Final post metadata: map[]
```
→ Проблема в Preload

**Сценарий 4: Все работает на backend, но не на frontend**
→ Проблема в FeedTest конвертации или FeedPost рендеринге

## 📋 Дополнительные команды

### Прямая проверка БД
```bash
docker exec -it x-18-----postgres-1 psql -U postgres -d x18_dev

# В psql:
SELECT id, content, jsonb_pretty(metadata) 
FROM posts 
WHERE metadata ? 'code_blocks' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Проверка через API
```bash
# Получить последний пост
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/timeline/explore?limit=1 | jq '.posts[0].metadata'
```

## 🎯 Сообщите результаты

После создания поста с кодом, скопируйте сюда:

1. **Логи бэкенда** (то, что показал grep CreatePost)
2. **Консоль браузера** (скриншот или текст логов)
3. **Визуальный результат** (отображается ли блок кода?)

Это позволит точно определить, где теряются данные!

## 📄 Документация

- **CODE_BLOCKS_DEBUG_INSTRUCTIONS.md** - подробное руководство
- **custom-backend/internal/api/posts.go** - измененный файл с логами
- **tail -f custom-backend.log** - мониторинг логов в реальном времени

---

**Статус**: ✅ Готово к тестированию  
**Бэкенд**: http://localhost:8080 (PID 38313)  
**Frontend**: http://localhost:5173 (PID 38319)  
**Логи**: `tail -f custom-backend.log`
