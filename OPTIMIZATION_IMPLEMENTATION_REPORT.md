# Отчет о реализации плана оптимизации для 100K+ пользователей

## Дата: 27.10.2025

## Обзор

Этот документ объясняет, что было реализовано из большого плана оптимизации системы для поддержки 100,000+ пользователей с возможностью масштабирования до 1 миллиона.

---

## ✅ ЧТО РЕАЛИЗОВАНО

### 1. **Функционал редактирования изображений (Edit/Crop)**

#### Реализовано на Frontend:
```typescript
// client/components/CreatePostBox/MediaEditor.tsx
- Модальное окно редактирования с тремя пресетами aspect ratio (Original/16:9/1:1)
- Zoom контролы (1-4x) с плавной регулировкой
- Drag & Drop с Pointer Events API
- Сетка обрезки (Grid 3x3)
- Вычисление cropRect в координатах оригинального изображения
```

**Где применилось:**
- `client/features/feed/components/composers/QuickComposer.tsx` - собирает media_transforms и отправляет на backend
- `client/components/CreatePostBox/MediaGrid.tsx` - показывает preview с применением CSS transform
- `client/services/api/custom-backend.ts` - расширен интерфейс для передачи media_transforms

#### Реализовано на Backend:
```go
// custom-backend/internal/api/posts.go

type CropRectReq struct {
    X    int `json:"x"`
    Y    int `json:"y"`
    W    int `json:"w"`
    H    int `json:"h"`
    SrcW int `json:"src_w"`
    SrcH int `json:"src_h"`
}

// В CreatePostRequest:
MediaTransforms map[string]CropRectReq `json:"media_transforms"`

// Метод applyCropToMedia():
- Открывает оригинальное изображение
- Декодирует через stdlib (image/jpeg, image/png)
- Применяет crop через image/draw
- Сохраняет как <uuid>.crop.<ext>
- Обновляет media.url на cropped версию
- Сохраняет оригинал в media.original_url
```

**Флоу:**
1. Пользователь редактирует изображение в MediaEditor
2. Frontend вычисляет cropRect в пикселях оригинала
3. Отправляет в POST /api/posts с media_transforms
4. Backend физически обрезает файл и сохраняет
5. Timeline отдает уже cropped версию через /storage/media/<uuid>.crop.jpg

---

### 2. **Premium контент (Paywall)**

#### Реализовано в базе данных:
```go
// custom-backend/internal/models/post.go
type Post struct {
    // ... другие поля
    IsPremium   bool   `json:"is_premium"`
    PriceCents  int    `json:"price_cents"`
    PreviewText string `json:"preview_text"`
    Category    string `json:"category"`
    Tags        string `json:"tags"`
}
```

**Где применилось:**
- `custom-backend/internal/api/posts.go` - валидация премиум контента при создании
- `custom-backend/internal/database/migrations/005_add_premium_content_fields.sql` - миграция БД
- Автоматическая генерация preview из первых 100 символов, если не указан

**Логика:**
```go
if post.IsPremium {
    if post.PriceCents <= 0 {
        return fmt.Errorf("premium content requires a price")
    }
    if post.PreviewText == "" {
        post.PreviewText = utils.ExtractPreview(contentHTML, 100)
    }
}
```

---

### 3. **Безопасность контента (Sanitization)**

#### Реализовано:
```go
// custom-backend/pkg/utils/sanitize.go
- SanitizeUserInput() - очистка пользовательского ввода
- SanitizeHTML() - безопасный HTML из Markdown
- ExtractPreview() - генерация превью без опасных тегов
```

**Где применилось:**
```go
// В CreatePost():
sanitizedContent := utils.SanitizeUserInput(req.Content)
contentHTML := utils.SanitizeHTML(sanitizedContent)

// Теперь в БД хранится:
- Content (сырой текст)
- ContentHTML (безопасный HTML для отображения)
```

**Защита от:**
- XSS атак через скрипты в постах
- SQL инъекций через спецсимволы
- Вредоносных HTML тегов
- Небезопасных атрибутов

---

### 4. **Перекодирование изображений**

#### Реализовано в media.go:
```go
// custom-backend/pkg/utils/media.go
- ReencodeImage() - перекодирует JPEG/PNG
- GenerateThumbnail() - создает превью 400x400
- CalculateImageHash() - вычисляет хеш для дубликатов
- DetectMIMEType() - определяет реальный MIME тип по содержимому
```

**Защита:**
- Удаление EXIF метаданных
- Удаление потенциально вредоносных данных в файлах
- Ограничение размера (4096x4096 px, 10MB)
- Проверка MIME типа по magic bytes (не по расширению)

**Где применилось:**
- `custom-backend/internal/api/media.go` - UploadMedia() использует перекодирование
- Все загруженные изображения автоматически "чистятся"

---

### 5. **Транзакции и целостность данных**

#### Реализовано:
```go
// В CreatePost():
err := h.db.DB.Transaction(func(tx *gorm.DB) error {
    // Создание поста
    if err := tx.Create(&post).Error; err != nil { return err }
    
    // Привязка медиа
    // Применение crop
    // Создание уведомлений
    
    return nil // коммит только если все успешно
})
```

**Преимущества:**
- Атомарность операций
- Откат при ошибке
- Консистентность данных
- Защита от race conditions

---

### 6. **Система уведомлений**

#### Реализовано:
```go
// При лайке, ретвите, комментарии:
if post.UserID != userID {
    notification := models.Notification{
        ID:         uuid.New(),
        UserID:     post.UserID,
        FromUserID: &userID,
        Type:       "like", // "retweet", "reply", "follow"
        PostID:     &postID,
        Read:       false,
        CreatedAt:  time.Now(),
    }
    h.db.DB.Create(&notification)
}
```

**Где применилось:**
- `custom-backend/internal/api/posts.go` - уведомления для лайков/ретвитов/комментариев
- `custom-backend/internal/api/users.go` - уведомления для подписок
- `custom-backend/internal/api/notifications.go` - API для получения уведомлений

---

### 7. **Базовая оптимизация БД**

#### Реализовано:
```sql
-- Индексы для частых запросов:
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_media_post ON media(post_id);
CREATE INDEX idx_likes_user_post ON likes(user_id, post_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at);
```

**Улучшения:**
- Быстрые запросы к timeline
- Эффективная проверка лайков/ретвитов
- Оптимизация JOIN с media через Preload("Media")

---

## ⚠️ ЧТО НЕ РЕАЛИЗОВАНО (из плана на 100K)

### 1. **Инфраструктура**

❌ **PostgreSQL вместо SQLite**
- Текущее: SQLite (app.db)
- План: PostgreSQL с PgBouncer
- Необходимо для: горизонтальное масштабирование, реплики

❌ **Redis для кэша и очередей**
- Текущее: нет кэширования
- План: Redis для кэша ленты, счетчиков, сессий
- План: Asynq (Redis-based) для фоновых задач

❌ **S3/MinIO для медиа**
- Текущее: локальная папка ./storage/media
- План: S3-совместимое хранилище
- План: CDN для раздачи статики

### 2. **Безопасность медиа**

❌ **Антивирусная проверка (ClamAV)**
```go
// Планировалось:
func avScan(all []byte) (bool, error) {
    addr := os.Getenv("CLAMD_ADDR")
    if addr == "" { return true, nil }
    c := clamd.NewClamd("tcp://" + addr)
    // ... сканирование
}
```
- Сейчас: файлы не проверяются на вирусы
- Критично для: продакшена

❌ **PDF санитизация (pdfcpu)**
```go
// Планировалось:
func sanitizePDF(in []byte, outPath string) error {
    if err := pdfapi.ValidateFile(tmp, nil); err != nil { return err }
    return pdfapi.OptimizeFile(tmp, outPath, nil)
}
```
- Сейчас: PDF не поддерживается
- План: только валидные и очищенные PDF

### 3. **Защищенный стриминг премиум медиа**

❌ **HMAC-токены для медиа**
```go
// Планировалось:
func signMediaToken(userID, mediaID uuid.UUID, expire time.Time, secret []byte) string
func verifyMediaToken(token string, secret []byte) (uuid.UUID, uuid.UUID, ok bool)

// Эндпоинт:
GET /api/media/:id/stream?token=HMAC_TOKEN
```

**Проблема сейчас:**
- Все медиа доступны через /storage/media/ без проверки доступа
- Премиум контент может быть скачан напрямую по URL

**Должно быть:**
- Публичные посты → /storage/media/... (как сейчас)
- Премиум посты → /api/media/:id/stream с проверкой покупки

### 4. **Система покупок (Purchases)**

❌ **Модель Purchase**
```go
type Purchase struct {
    ID        uuid.UUID
    UserID    uuid.UUID  // покупатель
    PostID    uuid.UUID  // премиум пост
    Provider  string     // stripe
    AmountCents int
    Currency  string
    Status    string     // succeeded|pending|failed
    CreatedAt time.Time
}
```

❌ **Проверка доступа к премиум контенту**
```go
func (h *PostsHandler) hasAccess(userID, postID uuid.UUID) bool {
    // 1. Автор поста?
    // 2. Есть подписка?
    // 3. Есть разовая покупка?
}
```

### 5. **Фоновая обработка**

❌ **Asynq воркеры**
```go
// Планировалось:
type Tasks struct{ db *gorm.DB; redis *redis.Client }

func (t *Tasks) HandleTimelineFanout(ctx context.Context, task *asynq.Task) error
func (t *Tasks) HandleMediaTranscode(ctx context.Context, task *asynq.Task) error
func (t *Tasks) HandleSearchIndex(ctx context.Context, task *asynq.Task) error
```

**Что должно быть в фоне:**
- Генерация thumbnails
- Обрезка изображений (crop)
- Индексация для поиска
- Раскладка постов в timeline подписчиков (fanout)
- Отправка email уведомлений

**Сейчас:**
- Все выполняется синхронно в HTTP запросе
- При большой нагрузке будут timeout'ы

### 6. **Кэширование**

❌ **Redis кэш ленты**
```go
// Планировалось:
cacheKey := fmt.Sprintf("explore:%s:%s:%d", lang, category, page)
if cached, err := redis.Get(ctx, cacheKey).Bytes(); err == nil {
    return cached
}
// ... запрос к БД
redis.Set(ctx, cacheKey, result, 30*time.Second)
```

❌ **Кэш счетчиков**
- Сейчас: каждый лайк = UPDATE в БД
- План: Redis INCR, периодический flush в Postgres

### 7. **Фильтры и поиск**

❌ **Расширенные фильтры timeline**
```go
// Планировалось:
GET /api/timeline/explore?lang=ru&category=stocks&is_premium=false&min_price=0

// С индексами:
CREATE INDEX idx_posts_filters ON posts(lang, category, created_at);
```

❌ **Full-text поиск**
- Сейчас: нет поиска по постам
- План: PostgreSQL full-text search или Elasticsearch

### 8. **Rate Limiting**

❌ **Ограничение запросов**
```go
// Планировалось:
app.Use("/api/posts", limiter.New(limiter.Config{
    Max: 10,
    Expiration: time.Minute,
}))
```

### 9. **Мониторинг и логирование**

❌ **Structured logging**
❌ **Metrics (Prometheus)**
❌ **Tracing (OpenTelemetry)**
❌ **Health checks**

---

## 📊 СТАТУС: MVP готов, но не для 100K

### Что работает сейчас:
- ✅ Создание постов с медиа
- ✅ Редактирование изображений (crop)
- ✅ Премиум контент (структура данных)
- ✅ Базовая безопасность (sanitization)
- ✅ Уведомления
- ✅ Лайки/ретвиты/комментарии
- ✅ Timeline с Preload("Media")

### Узкие места для 100K пользователей:

1. **SQLite → станет bottleneck**
   - Нет параллельных записей
   - Нет репликации
   - Файл на диске

2. **Синхронная обработка медиа**
   - Crop выполняется в HTTP запросе
   - При загрузке больших файлов - timeout
   - Нет масштабирования воркеров

3. **Отсутствие кэша**
   - Каждый запрос timeline → SELECT в БД
   - N+1 проблемы без кэша
   - Счетчики (likes/retweets) бьют по БД

4. **Все медиа публичны**
   - Нет защиты премиум контента
   - URL можно угадать и скачать напрямую

5. **Локальное хранилище**
   - Один сервер = один диск
   - Нет CDN
   - Нет горизонтального масштабирования

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ для 100K

### Критичные (обязательно):

1. **Миграция на PostgreSQL**
   ```bash
   # В docker-compose.yml добавить:
   postgres:
     image: postgres:16
     environment:
       POSTGRES_DB: x18
       POSTGRES_USER: app
       POSTGRES_PASSWORD: secret
   ```

2. **Redis для кэша**
   ```bash
   redis:
     image: redis:7
     ports: ["6379:6379"]
   ```

3. **Фоновые воркеры (Asynq)**
   ```go
   go func() {
       srv := asynq.NewServer(
           asynq.RedisClientOpt{Addr: "localhost:6379"},
           asynq.Config{Concurrency: 10},
       )
       srv.Run(mux)
   }()
   ```

4. **Защищенный стриминг медиа**
   - Реализовать /api/media/:id/stream с HMAC токенами
   - Проверять Purchase перед отдачей файла

### Важные (для масштабирования):

5. **S3/MinIO для медиа**
6. **Rate limiting**
7. **ClamAV антивирус**
8. **Monitoring (Prometheus + Grafana)**

### Опциональные (для 1M+):

9. **Read replicas Postgres**
10. **Redis Cluster**
11. **Отдельный сервис поиска**
12. **CDN (CloudFlare)**

---

## 📈 Текущая архитектура

```
┌─────────────┐
│   Frontend  │
│  (React/TS) │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────────────────────┐
│   Backend (Go + Fiber)      │
│                             │
│  ┌─────────┐  ┌──────────┐ │
│  │  API    │  │  Auth    │ │
│  └─────────┘  └──────────┘ │
│                             │
│  ┌─────────┐  ┌──────────┐ │
│  │ Posts   │  │  Media   │ │
│  └─────────┘  └──────────┘ │
└──────────┬──────────────────┘
           │
           ↓
    ┌──────────┐
    │  SQLite  │  ⚠️ УЗКОЕ МЕСТО
    └──────────┘
           │
           ↓
    ./storage/media/  ⚠️ НЕТ CDN
```

## 📈 Целевая архитектура (100K)

```
┌─────────────┐
│   Frontend  │
│  + CDN      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  Load Balancer (nginx)      │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│   Backend (Go) x3 instances │
│   (stateless)               │
└───┬───────────────────┬─────┘
    │                   │
    ↓                   ↓
┌──────────┐      ┌─────────┐
│ Postgres │      │  Redis  │
│ (master) │      │ (cache) │
│          │      │         │
│ + replica│      │ + Asynq │
└──────────┘      └─────────┘
    │                   │
    ↓                   ↓
┌──────────┐      ┌─────────┐
│   S3     │      │ Workers │
│ (media)  │      │ (async) │
└──────────┘      └─────────┘
```

---

## 🔍 Выводы

### ✅ Реализовано успешно:
- Функционал Edit изображений (frontend + backend crop)
- Premium контент (структура)
- Безопасность контента (sanitization)
- Перекодирование изображений
- Транзакции
- Уведомления

### ⚠️ Готово для MVP, но не для 100K:
- Текущий стек: SQLite + локальные файлы + синхронная обработка
- Выдержит: ~1000-5000 пользователей
- Для 100K нужно: PostgreSQL + Redis + Asynq + S3

### 📝 Приоритетный план:
1. PostgreSQL (критично)
2. Redis кэш (критично)
3. Asynq воркеры (критично)
4. Защищенный стриминг медиа (для премиум)
5. Monitoring + Rate limiting (обязательно)
6. S3 + CDN (желательно)

---

**Автор отчета:** AI Assistant  
**Дата:** 27.10.2025
