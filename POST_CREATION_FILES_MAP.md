# Карта файлов: Создание постов и загрузка изображений

## 📁 Frontend - Компоненты создания постов

### 1. Главные компоненты создания постов

#### QuickComposer (быстрое создание)
```
📄 client/features/feed/components/composers/QuickComposer.tsx
```
- **Назначение:** Быстрое создание постов в верхней части ленты
- **Функции:**
  - Загрузка изображений через кнопку "Attach"
  - Выбор visibility (public/followers/private)
  - Metadata (market, category, sentiment)
  - Вызывает `customBackendAPI.uploadMedia()` для загрузки файлов
  - Вызывает `customBackendAPI.createPost()` для создания поста

#### CreatePostModal (расширенное создание)
```
📄 client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx
```
- **Назначение:** Модальное окно для создания постов с расширенными опциями
- **Функции:**
  - Полный редактор постов
  - Загрузка множественных изображений
  - Trading signals (entry, stop loss, take profit)
  - Premium контент (платные посты)

### 2. API Service Layer

#### Custom Backend API Client
```
📄 client/services/api/custom-backend.ts
```
- **Функции:**
  - `uploadMedia(file: File): Promise<Media>` - загрузка изображения
  - `createPost(data: CreatePostRequest): Promise<Post>` - создание поста
  - `getHomeTimeline()` - получение ленты
  - `getExploreTimeline()` - публичная лента

**Основные интерфейсы:**
```typescript
interface Media {
  id: string;
  user_id: string;
  post_id?: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media?: Media[];
  visibility: 'public' | 'followers' | 'private';
  metadata?: Record<string, any>;
  // ... другие поля
}
```

### 3. Hooks для работы с постами

#### useCustomTimeline
```
📄 client/hooks/useCustomTimeline.ts
```
- **Назначение:** Управление лентой постов
- **Функции:**
  - Загрузка постов из timeline
  - Пагинация (loadMore)
  - Авто-обновление (refresh)
  - Уведомления о новых постах

### 4. Типы данных

#### Feed Types
```
📄 client/features/feed/types.ts
```
- **Содержит:**
  - `MediaItem` - структура медиа для отображения
  - `Post` - структура поста для ленты
  - Другие типы для фильтров и metadata

### 5. Страница с лентой

#### FeedTest Page
```
📄 client/pages/FeedTest.tsx
```
- **Назначение:** Главная страница ленты
- **Содержит:**
  - QuickComposer для создания постов
  - Отображение ленты постов
  - Конвертер `customPostToFeedPost()` - преобразует данные с backend в формат для отображения

### 6. Компоненты отображения постов

#### FeedPost Component
```
📄 client/features/feed/components/posts/FeedPost.tsx
```
- **Назначение:** Отображение одного поста в ленте
- **Отображает:**
  - Текст поста
  - Изображения (массив media)
  - Engagement (лайки, комментарии, репосты)
  - Trading metadata (если это signal)

---

## 🔧 Backend - API и обработка данных

### 1. API Handlers

#### Posts Handler
```
📄 custom-backend/internal/api/posts.go
```
- **Endpoints:**
  - `POST /api/posts` - создание поста
  - `GET /api/posts/:id` - получение поста
  - `DELETE /api/posts/:id` - удаление поста
  - `POST /api/posts/:id/like` - лайк поста
  
**Ключевая функция CreatePost:**
```go
func (h *PostsHandler) CreatePost(c *fiber.Ctx) error {
    // 1. Парсинг request body
    // 2. Создание поста в БД
    // 3. Связывание media с постом через post_id
    // 4. Возврат созданного поста с media
}
```

#### Media Handler
```
📄 custom-backend/internal/api/media.go
```
- **Endpoints:**
  - `POST /api/media/upload` - загрузка изображения
  - `GET /api/media/:id` - получение info о media
  
**Ключевая функция UploadMedia:**
```go
func (h *MediaHandler) UploadMedia(c *fiber.Ctx) error {
    // 1. Получение файла из multipart/form-data
    // 2. Генерация UUID для имени файла
    // 3. Сохранение в ./storage/media/
    // 4. Создание записи в БД таблице media
    // 5. Возврат URL: /storage/media/{uuid}.ext
}
```

#### Timeline Handler
```
📄 custom-backend/internal/api/timeline.go
```
- **Endpoints:**
  - `GET /api/timeline/home` - лента подписок
  - `GET /api/timeline/explore` - публичная лента
  - `GET /api/timeline/trending` - трендовые посты
  - `GET /api/timeline/user/:id` - посты пользователя

**Ключевые моменты:**
```go
query := h.db.DB.Model(&models.Post{}).
    Preload("User").      // Загружает данные пользователя
    Preload("Media")      // Загружает массив media для каждого поста
```

### 2. Модели данных

#### Post Model
```
📄 custom-backend/internal/models/post.go
```
- **Структура:**
```go
type Post struct {
    ID            uuid.UUID
    UserID        uuid.UUID
    Content       string
    Visibility    string
    Metadata      Metadata  // JSONB
    Media         []Media   // Связь один-ко-многим
    LikesCount    int
    RetweetsCount int
    RepliesCount  int
    CreatedAt     time.Time
    UpdatedAt     time.Time
}
```

#### Media Model (Relations)
```
📄 custom-backend/internal/models/relations.go
```
- **Структура:**
```go
type Media struct {
    ID           uuid.UUID
    UserID       uuid.UUID
    PostID       *uuid.UUID  // Может быть NULL до привязки к посту
    Type         string      // image, video, gif
    URL          string      // /storage/media/{uuid}.ext
    ThumbnailURL string
    AltText      string
    Width        int
    Height       int
    SizeBytes    int64
    CreatedAt    time.Time
}
```

### 3. База данных

#### Database Layer
```
📄 custom-backend/internal/database/database.go
```
- **Назначение:** Подключение к БД и миграции
- **БД:** SQLite - `custom-backend/storage/app.db`

### 4. Главный файл сервера

#### Main Server File
```
📄 custom-backend/cmd/server/main.go
```
- **Содержит:**
  - Инициализацию Fiber app
  - Регистрацию роутов
  - **Static file serving:** `app.Static("/storage/media", "./storage/media")`
  - Middleware (CORS, JWT auth, logging)

**Ключевой момент - static serving:**
```go
// Line 172
app.Static("/storage/media", "./storage/media")
```
Это делает изображения доступными по URL: `http://localhost:8080/storage/media/{filename}`

### 5. Конфигурация

#### Config
```
📄 custom-backend/configs/config.go
```
- Настройки сервера
- Настройки БД
- JWT секреты

#### Environment
```
📄 custom-backend/.env
```
- Переменные окружения
- Ключи API
- Database path

---

## 💾 Хранилище файлов

### Директория для медиа
```
📁 custom-backend/storage/media/
```
- **Назначение:** Хранилище загруженных изображений
- **Формат имён:** `{uuid}.{extension}` (например: `09ca7dae-637e-48a0-aea1-80fad6aeedfb.jpeg`)
- **Доступ:** Через static route `/storage/media/`

### База данных
```
📁 custom-backend/storage/app.db
```
- **Тип:** SQLite
- **Таблицы:**
  - `users` - пользователи
  - `posts` - посты
  - `media` - медиа файлы
  - `likes`, `retweets`, `bookmarks` - взаимодействия
  - `follows` - подписки
  - `notifications` - уведомления

---

## 🔄 Поток данных при создании поста с изображением

### 1. Пользователь загружает изображение в QuickComposer

```
client/features/feed/components/composers/QuickComposer.tsx
  ↓
customBackendAPI.uploadMedia(file)
  ↓
POST http://localhost:8080/api/media/upload
```

### 2. Backend обрабатывает загрузку

```
custom-backend/cmd/server/main.go (роут)
  ↓
custom-backend/internal/api/media.go → UploadMedia()
  ↓
Сохранение файла: custom-backend/storage/media/{uuid}.jpeg
  ↓
Создание записи в БД: таблица media
  ↓
Возврат: { id, url: "/storage/media/{uuid}.jpeg", type: "image" }
```

### 3. Пользователь создаёт пост

```
QuickComposer.tsx → handlePost()
  ↓
Собирает media_ids из загруженных файлов
  ↓
customBackendAPI.createPost({ content, media_ids, metadata, visibility })
  ↓
POST http://localhost:8080/api/posts
```

### 4. Backend создаёт пост

```
custom-backend/cmd/server/main.go (роут)
  ↓
custom-backend/internal/api/posts.go → CreatePost()
  ↓
Создание поста в БД: таблица posts
  ↓
Обновление media записей: установка post_id
  ↓
Preload("Media") - загрузка связанных media
  ↓
Возврат: Post с массивом media
```

### 5. Отображение в ленте

```
client/hooks/useCustomTimeline.ts
  ↓
GET http://localhost:8080/api/timeline/explore
  ↓
Backend: custom-backend/internal/api/timeline.go
  ↓
Preload("User").Preload("Media")
  ↓
Возврат массива постов с media
  ↓
client/pages/FeedTest.tsx → customPostToFeedPost()
  ↓
Преобразование: post.media[] → формат для отображения
  ↓
client/features/feed/components/posts/FeedPost.tsx
  ↓
Отображение: <img src="http://localhost:8080{mediaItem.url}" />
```

---

## 🛠️ Утилиты и вспомогательные файлы

### Скрипты управления

```
📄 START_CUSTOM_BACKEND_STACK.sh - запуск backend
📄 STOP_CUSTOM_BACKEND_STACK.sh - остановка backend
📄 clean-posts.sh - очистка постов
📄 test-media-display.sh - тест отображения media
```

### Документация

```
📄 MEDIA_DISPLAY_FIX_REPORT.md - отчёт об исправлении media
📄 POST_CREATION_FIX_COMPLETE.md - история исправлений создания постов
📄 CUSTOM_BACKEND_COMPLETE.md - документация backend
```

---

## 🔍 Ключевые моменты для отладки

### Если изображения не загружаются:
1. Проверить `custom-backend/storage/media/` - есть ли файлы?
2. Проверить БД: `SELECT * FROM media WHERE post_id IS NOT NULL;`
3. Проверить API response: `curl http://localhost:8080/api/timeline/explore`
4. Проверить static serving: `curl -I http://localhost:8080/storage/media/{filename}`

### Если посты не создаются:
1. Проверить консоль браузера (DevTools)
2. Проверить логи backend в терминале
3. Проверить JWT токен в AuthContext
4. Проверить что backend запущен на порту 8080

### Важные точки в коде:

**Backend:**
- Preload("Media") в timeline.go (строка 27, 56)
- app.Static() в main.go (строка 172)
- UploadMedia() в media.go
- CreatePost() в posts.go

**Frontend:**
- uploadMedia() в custom-backend.ts
- createPost() в custom-backend.ts
- customPostToFeedPost() в FeedTest.tsx (преобразование данных)
- FeedPost component для отображения
