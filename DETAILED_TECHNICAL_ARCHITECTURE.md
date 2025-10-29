# Подробная техническая архитектура проекта X-18

## Оглавление
1. [Общая архитектура системы](#общая-архитектура-системы)
2. [Frontend архитектура](#frontend-архитектура)
3. [Backend архитектура](#backend-архитектура)
4. [База данных и модели](#база-данных-и-модели)
5. [Система постов и комментариев](#система-постов-и-комментариев)
6. [Аутентификация и безопасность](#аутентификация-и-безопасность)
7. [Обработка медиафайлов](#обработка-медиафайлов)
8. [Система уведомлений](#система-уведомлений)
9. [Премиум контент и монетизация](#премиум-контент-и-монетизация)
10. [Виджеты и админ панель](#виджеты-и-админ-панель)

---

## 1. Общая архитектура системы

### Компоненты системы

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Go Backend API │────▶│   PostgreSQL    │
│   (Vite+TS)     │     │   (Fiber v2)    │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Netlify CDN    │     │   Redis Cache   │     │   Media Storage │
│  (Production)   │     │  (Sessions)     │     │   (Local/S3)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Поток запросов

1. **Пользователь** → открывает сайт
2. **Netlify CDN** → отдает статичный React build
3. **React App** → загружается в браузере
4. **API запросы** → идут на Backend через CORS
5. **Backend** → проверяет JWT токен
6. **Database** → возвращает данные
7. **Backend** → форматирует и отправляет ответ
8. **React** → обновляет UI

---

## 2. Frontend архитектура

### Структура проекта

```
client/
├── components/          # Переиспользуемые компоненты
│   ├── ui/             # Базовые UI компоненты (shadcn/ui)
│   ├── PostCard/       # Компоненты постов
│   ├── auth/           # Компоненты аутентификации
│   └── socialProfile/  # Компоненты профилей
├── pages/              # Страницы приложения
├── hooks/              # Custom React hooks
├── services/           # API клиенты
├── contexts/           # React контексты
├── lib/                # Утилиты и хелперы
└── features/           # Feature-based модули
```

### Ключевые технологии

- **React 18** с Concurrent Features
- **TypeScript** для типобезопасности
- **React Router v6** для навигации
- **Tailwind CSS** для стилей
- **shadcn/ui** компоненты на базе Radix UI
- **@tanstack/react-query** для кеширования данных

### Управление состоянием

```typescript
// AuthContext - глобальное состояние аутентификации
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

// Использование в компонентах
const { user, login } = useAuth();
```

### API клиент

```typescript
// custom-backend.ts - централизованный API клиент
class CustomBackendAPI {
  private baseUrl = import.meta.env.VITE_API_URL + '/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('custom_token');
    
    // Автоматическое добавление токена
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Автоматический refresh при 401
    if (response.status === 401) {
      await this.refreshToken();
      // Повторяем запрос с новым токеном
    }

    return response.json();
  }
}
```

---

## 3. Backend архитектура

### Структура проекта

```
custom-backend/
├── cmd/
│   └── server/         # Точка входа приложения
├── internal/
│   ├── api/           # HTTP хендлеры
│   ├── auth/          # JWT аутентификация
│   ├── database/      # Подключение к БД и миграции
│   ├── models/        # Модели данных
│   ├── services/      # Бизнес-логика
│   └── cache/         # Redis кеш
├── pkg/
│   ├── middleware/    # HTTP middleware
│   └── utils/         # Утилиты
└── storage/
    └── media/         # Локальное хранилище файлов
```

### Fiber Framework

```go
// main.go - инициализация приложения
app := fiber.New(fiber.Config{
    BodyLimit:    50 * 1024 * 1024, // 50MB
    ReadTimeout:  30 * time.Second,
    WriteTimeout: 30 * time.Second,
})

// CORS настройки
app.Use(cors.New(cors.Config{
    AllowOrigins:     allowedOrigins,
    AllowCredentials: true,
    AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
    AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
}))

// Middleware pipeline
app.Use(logger.New())
app.Use(recover.New())
app.Use(compress.New())
```

### Маршрутизация

```go
// Публичные маршруты
auth := app.Group("/api/auth")
auth.Post("/register", authHandler.Register)
auth.Post("/login", authHandler.Login)
auth.Post("/refresh", authHandler.RefreshToken)

// Защищенные маршруты
api := app.Group("/api", authMiddleware.RequireAuth)
api.Post("/posts/", postsHandler.CreatePost)
api.Get("/timeline/home", timelineHandler.GetHomeTimeline)
api.Post("/users/:id/follow", usersHandler.FollowUser)

// Админ маршруты
admin := api.Group("/admin", adminMiddleware.RequireAdmin)
admin.Get("/stats", adminHandler.GetStats)
```

---

## 4. База данных и модели

### Схема БД (PostgreSQL)

```sql
-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user',
    subscription_price INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Посты (включая комментарии)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_html TEXT,
    reply_to_id UUID REFERENCES posts(id),  -- NULL = пост, NOT NULL = комментарий
    root_post_id UUID REFERENCES posts(id), -- для веток комментариев
    metadata JSONB,                         -- гибкое хранение данных
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    visibility VARCHAR(20) DEFAULT 'public',
    is_premium BOOLEAN DEFAULT FALSE,
    price_cents INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_reply_to_id ON posts(reply_to_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_timeline ON posts(user_id, created_at DESC) 
    WHERE reply_to_id IS NULL;
```

### GORM модели

```go
type Post struct {
    ID           uuid.UUID              `gorm:"type:uuid;default:gen_random_uuid()"`
    UserID       uuid.UUID              `gorm:"type:uuid;not null"`
    User         *User                  `gorm:"foreignKey:UserID"`
    Content      string                 `gorm:"type:text;not null"`
    ContentHTML  string                 `gorm:"type:text"`
    ReplyToID    *uuid.UUID            `gorm:"type:uuid"`
    ReplyTo      *Post                 `gorm:"foreignKey:ReplyToID"`
    RootPostID   *uuid.UUID            `gorm:"type:uuid"`
    Metadata     map[string]interface{} `gorm:"type:jsonb"`
    Media        []Media               `gorm:"foreignKey:PostID"`
    Likes        []Like                `gorm:"foreignKey:PostID"`
    LikesCount   int                   `gorm:"default:0"`
    RepliesCount int                   `gorm:"default:0"`
    Visibility   string                `gorm:"default:'public'"`
    IsPremium    bool                  `gorm:"default:false"`
    PriceCents   int                   `gorm:"default:0"`
    CreatedAt    time.Time
    UpdatedAt    time.Time
    
    // Вычисляемые поля (не в БД)
    IsLiked      bool      `gorm:"-"`
    IsRetweeted  bool      `gorm:"-"`
    IsBookmarked bool      `gorm:"-"`
}
```

---

## 5. Система постов и комментариев

### Создание поста/комментария

```go
func (h *PostsHandler) CreatePost(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    
    var req CreatePostRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }
    
    // Начинаем транзакцию
    tx := h.db.DB.Begin()
    
    post := models.Post{
        UserID:      userID,
        Content:     utils.SanitizeUserInput(req.Content),
        ContentHTML: utils.SanitizeHTML(req.Content),
        Metadata:    req.Metadata,
    }
    
    // Если это комментарий
    if req.ReplyToID != nil {
        replyToID, _ := uuid.Parse(*req.ReplyToID)
        post.ReplyToID = &replyToID
        
        // Увеличиваем счетчик комментариев
        tx.Model(&models.Post{}).
            Where("id = ?", replyToID).
            Update("replies_count", gorm.Expr("replies_count + 1"))
        
        // Создаем уведомление
        var parentPost models.Post
        tx.First(&parentPost, replyToID)
        
        if parentPost.UserID != userID {
            notification := models.Notification{
                UserID:     parentPost.UserID,
                FromUserID: &userID,
                Type:       "reply",
                PostID:     &post.ID,
            }
            tx.Create(&notification)
        }
    }
    
    tx.Create(&post)
    tx.Commit()
    
    return c.JSON(post)
}
```

### Загрузка лент с фильтрацией комментариев

```go
func (h *TimelineHandler) GetHomeTimeline(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    
    // Получаем ID пользователей на которых подписаны
    var followingIDs []uuid.UUID
    h.db.DB.Model(&models.Follow{}).
        Where("follower_id = ?", userID).
        Pluck("following_id", &followingIDs)
    
    followingIDs = append(followingIDs, userID) // + свои посты
    
    var posts []models.Post
    query := h.db.DB.
        Preload("User").
        Preload("Media").
        Where("user_id IN ?", followingIDs).
        Where("reply_to_id IS NULL"). // ВАЖНО: исключаем комментарии
        Order("created_at DESC").
        Limit(20)
    
    query.Find(&posts)
    
    // Добавляем информацию о лайках/закладках
    for i := range posts {
        h.enrichPostWithUserInteractions(&posts[i], userID)
    }
    
    return c.JSON(posts)
}
```

### Загрузка комментариев с иерархией

```go
func (h *PostsHandler) GetPostReplies(c *fiber.Ctx) error {
    postID, _ := uuid.Parse(c.Params("id"))
    
    // Получаем прямые ответы на пост
    var directReplies []models.Post
    h.db.DB.
        Preload("User").
        Where("reply_to_id = ?", postID).
        Order("created_at ASC").
        Find(&directReplies)
    
    // Для каждого ответа получаем вложенные ответы
    var allReplies []models.Post
    allReplies = append(allReplies, directReplies...)
    
    // Рекурсивно собираем всю ветку
    queue := directReplies
    for len(queue) > 0 {
        current := queue[0]
        queue = queue[1:]
        
        var nestedReplies []models.Post
        h.db.DB.
            Preload("User").
            Where("reply_to_id = ?", current.ID).
            Find(&nestedReplies)
        
        allReplies = append(allReplies, nestedReplies...)
        queue = append(queue, nestedReplies...)
    }
    
    return c.JSON(allReplies)
}
```

---

## 6. Аутентификация и безопасность

### JWT токены

```go
// Структура токенов
type TokenPair struct {
    AccessToken  string `json:"access_token"`
    RefreshToken string `json:"refresh_token"`
}

// Генерация токенов
func GenerateTokens(userID uuid.UUID) (TokenPair, error) {
    // Access token - 15 минут
    accessClaims := jwt.MapClaims{
        "user_id": userID.String(),
        "exp":     time.Now().Add(15 * time.Minute).Unix(),
        "iat":     time.Now().Unix(),
    }
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
    accessStr, _ := accessToken.SignedString([]byte(JWT_SECRET))
    
    // Refresh token - 30 дней
    refreshClaims := jwt.MapClaims{
        "user_id": userID.String(),
        "exp":     time.Now().Add(30 * 24 * time.Hour).Unix(),
        "iat":     time.Now().Unix(),
        "type":    "refresh",
    }
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    refreshStr, _ := refreshToken.SignedString([]byte(JWT_SECRET))
    
    // Сохраняем refresh token в Redis
    redisClient.Set(ctx, 
        fmt.Sprintf("refresh:%s", userID),
        refreshStr,
        30*24*time.Hour,
    )
    
    return TokenPair{
        AccessToken:  accessStr,
        RefreshToken: refreshStr,
    }, nil
}
```

### Middleware аутентификации

```go
func RequireAuth(c *fiber.Ctx) error {
    // Извлекаем токен из заголовка
    authHeader := c.Get("Authorization")
    if authHeader == "" {
        return c.Status(401).JSON(fiber.Map{"error": "No token"})
    }
    
    tokenStr := strings.Replace(authHeader, "Bearer ", "", 1)
    
    // Проверяем токен
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return []byte(JWT_SECRET), nil
    })
    
    if err != nil || !token.Valid {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
    }
    
    claims := token.Claims.(jwt.MapClaims)
    userID, _ := uuid.Parse(claims["user_id"].(string))
    
    // Добавляем userID в контекст
    c.Locals("userID", userID)
    
    return c.Next()
}
```

### Хеширование паролей

```go
func HashPassword(password string) (string, error) {
    // Используем bcrypt с cost factor 10
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
    return string(bytes), err
}

func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### Санитизация контента

```go
// Очистка пользовательского ввода
func SanitizeUserInput(input string) string {
    // Удаляем опасные HTML теги
    p := bluemonday.StrictPolicy()
    
    // Разрешаем только базовое форматирование
    p.AllowElements("b", "i", "u", "code", "pre")
    p.AllowAttrs("class").OnElements("code", "pre")
    
    return p.Sanitize(input)
}

// Генерация безопасного HTML
func SanitizeHTML(content string) string {
    // Конвертируем markdown-подобный синтаксис в HTML
    content = convertLinks(content)
    content = convertMentions(content)
    content = convertHashtags(content)
    
    // Финальная санитизация
    return SanitizeUserInput(content)
}
```

---

## 7. Обработка медиафайлов

### Загрузка файлов

```go
func (h *MediaHandler) UploadMedia(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    
    // Получаем файл из multipart/form-data
    file, err := c.FormFile("file")
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "No file"})
    }
    
    // Проверка типа файла
    if !isAllowedMediaType(file.Header.Get("Content-Type")) {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid file type"})
    }
    
    // Проверка размера (max 50MB)
    if file.Size > 50*1024*1024 {
        return c.Status(400).JSON(fiber.Map{"error": "File too large"})
    }
    
    // Генерируем уникальное имя
    ext := filepath.Ext(file.Filename)
    filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
    path := filepath.Join("./storage/media", filename)
    
    // Сохраняем файл
    if err := c.SaveFile(file, path); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to save"})
    }
    
    // Для изображений - обрабатываем
    if strings.HasPrefix(file.Header.Get("Content-Type"), "image/") {
        processImage(path) // resize, optimize
    }
    
    // Создаем запись в БД
    media := models.Media{
        ID:       uuid.New(),
        UserID:   userID,
        Type:     detectMediaType(file),
        URL:      fmt.Sprintf("/storage/media/%s", filename),
        Size:     file.Size,
        Status:   "ready",
    }
    
    h.db.DB.Create(&media)
    
    return c.JSON(media)
}
```

### Обработка изображений с кропом

```go
func (h *PostsHandler) applyCropToMedia(tx *gorm.DB, media *models.Media, crop CropRectReq) error {
    // Открываем оригинальное изображение
    originalPath := filepath.Join("./storage/media", filepath.Base(media.URL))
    img, format, err := image.Decode(openFile(originalPath))
    
    // Создаем новое изображение с размерами кропа
    croppedImg := image.NewRGBA(image.Rect(0, 0, crop.W, crop.H))
    
    // Копируем нужную область
    draw.Draw(
        croppedImg, 
        croppedImg.Bounds(),
        img,
        image.Point{X: crop.X, Y: crop.Y},
        draw.Src,
    )
    
    // Сохраняем результат
    croppedPath := strings.Replace(originalPath, ext, ".crop"+ext, 1)
    saveImage(croppedImg, croppedPath, format)
    
    // Обновляем URL в БД
    tx.Model(media).Updates(map[string]interface{}{
        "url":          fmt.Sprintf("/storage/media/%s", filepath.Base(croppedPath)),
        "original_url": media.URL,
        "width":        crop.W,
        "height":       crop.H,
    })
    
    return nil
}
```

---

## 8. Система уведомлений

### Модель уведомлений

```go
type Notification struct {
    ID         uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid()"`
    UserID     uuid.UUID  `gorm:"type:uuid;not null"`      // кому
    FromUserID *uuid.UUID `gorm:"type:uuid"`               // от кого
    FromUser   *User      `gorm:"foreignKey:FromUserID"`
    Type       string     `gorm:"not null"`                 // like, reply, follow, mention
    PostID     *uuid.UUID `gorm:"type:uuid"`
    Post       *Post      `gorm:"foreignKey:PostID"`
    Read       bool       `gorm:"default:false"`
    CreatedAt  time.Time
}
```

### Создание уведомлений

```go
// При лайке
func createLikeNotification(tx *gorm.DB, post *models.Post, fromUserID uuid.UUID) {
    if post.UserID == fromUserID {
        return // не уведомляем о собственных действиях
    }
    
    notification := models.Notification{
        UserID:     post.UserID,
        FromUserID: &fromUserID,
        Type:       "like",
        PostID:     &post.ID,
    }
    tx.Create(&notification)
}

// При подписке
func createFollowNotification(tx *gorm.DB, targetUserID, followerID uuid.UUID) {
    notification := models.Notification{
        UserID:     targetUserID,
        FromUserID: &followerID,
        Type:       "follow",
    }
    tx.Create(&notification)
}
```

### Получение уведомлений

```go
func (h *NotificationsHandler) GetNotifications(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    
    var notifications []models.Notification
    h.db.DB.
        Preload("FromUser").
        Preload("Post").
        Preload("Post.User").
        Where("user_id = ?", userID).
        Order("created_at DESC").
        Limit(50).
        Find(&notifications)
    
    // Группируем по типу и времени для UI
    grouped := groupNotifications(notifications)
    
    return c.JSON(fiber.Map{
        "notifications": grouped,
        "unread_count":  countUnread(notifications),
    })
}
```

### Real-time обновления (WebSocket)

```go
// Планируется реализация WebSocket для real-time уведомлений
func (h *WSHandler) HandleNotifications(c *websocket.Conn) {
    userID := getUserIDFromWS(c)
    
    // Подписываемся на канал Redis
    pubsub := redisClient.Subscribe(ctx, fmt.Sprintf("notifications:%s", userID))
    
    for msg := range pubsub.Channel() {
        // Отправляем уведомление клиенту
        c.WriteJSON(msg.Payload)
    }
}
```

---

## 9. Премиум контент и монетизация

### Модель подписок

```go
type Subscription struct {
    ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid()"`
    SubscriberID    uuid.UUID `gorm:"type:uuid;not null"`
    CreatorID       uuid.UUID `gorm:"type:uuid;not null"`
    Status          string    `gorm:"default:'active'"`      // active, cancelled, expired
    PriceCents      int       `gorm:"not null"`
    StripeSubID     string    `gorm:"unique"`
    CurrentPeriodEnd time.Time
    CreatedAt       time.Time
    CancelledAt     *time.Time
}
```

### Проверка доступа к контенту

```go
func (h *PostsHandler) checkPremiumAccess(post *models.Post, userID uuid.UUID) bool {
    // Владелец всегда имеет доступ
    if post.UserID == userID {
        return true
    }
    
    // Если не премиум - доступно всем
    if !post.IsPremium {
        return true
    }
    
    // Проверяем подписку
    var subscription models.Subscription
    err := h.db.DB.
        Where("subscriber_id = ? AND creator_id = ? AND status = ?", 
            userID, post.UserID, "active").
        Where("current_period_end > ?", time.Now()).
        First(&subscription).Error
    
    if err == nil {
        return true
    }
    
    // Проверяем единоразовую покупку
    var purchase models.PostPurchase
    err = h.db.DB.
        Where("user_id = ? AND post_id = ?", userID, post.ID).
        First(&purchase).Error
    
    return err == nil
}
```

### Stripe интеграция

```go
// Создание подписки
func (h *PaymentHandler) CreateSubscription(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    creatorID, _ := uuid.Parse(c.Params("creatorId"))
    
    // Получаем Stripe customer ID пользователя
    var user models.User
    h.db.DB.First(&user, userID)
    
    if user.StripeCustomerID == "" {
        // Создаем Stripe customer
        customer, _ := stripeClient.Customers.New(&stripe.CustomerParams{
            Email: stripe.String(user.Email),
        })
        user.StripeCustomerID = customer.ID
        h.db.DB.Save(&user)
    }
    
    // Получаем цену подписки
    var creator models.User
    h.db.DB.First(&creator, creatorID)
    
    // Создаем подписку в Stripe
    subscription, err := stripeClient.Subscriptions.New(&stripe.SubscriptionParams{
        Customer: stripe.String(user.StripeCustomerID),
        Items: []*stripe.SubscriptionItemsParams{{
            Price: stripe.String(creator.StripePriceID),
        }},
        PaymentBehavior: stripe.String("default_incomplete"),
    })
    
    // Сохраняем в БД
    dbSub := models.Subscription{
        SubscriberID:     userID,
        CreatorID:        creatorID,
        PriceCents:       creator.SubscriptionPrice,
        StripeSubID:      subscription.ID,
        CurrentPeriodEnd: time.Unix(subscription.CurrentPeriodEnd, 0),
    }
    h.db.DB.Create(&dbSub)
    
    return c.JSON(fiber.Map{
        "client_secret": subscription.LatestInvoice.PaymentIntent.ClientSecret,
    })
}
```

---

## 10. Виджеты и админ панель

### Система виджетов

```go
// Новости виджет
func (h *WidgetsHandler) GetNews(c *fiber.Ctx) error {
    var news []models.NewsItem
    h.db.DB.
        Where("is_active = ?", true).
        Order("published_at DESC").
        Limit(10).
        Find(&news)
    
    return c.JSON(news)
}

// Трендовые тикеры
func (h *WidgetsHandler) GetTrendingTickers(c *fiber.Ctx) error {
    // Анализируем метаданные постов за последние 24 часа
    rows, _ := h.db.DB.Raw(`
        SELECT 
            metadata->>'ticker' as ticker,
            COUNT(*) as count
        FROM posts
        WHERE created_at > NOW() - INTERVAL '24 hours'
        AND metadata->>'ticker' IS NOT NULL
        GROUP BY ticker
        ORDER BY count DESC
        LIMIT 10
    `).Rows()
    
    var tickers []TrendingTicker
    for rows.Next() {
        var t TrendingTicker
        rows.Scan(&t.Ticker, &t.Count)
        tickers = append(tickers, t)
    }
    
    return c.JSON(tickers)
}
```

### Админ панель

```go
// Middleware проверки админа
func RequireAdmin(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    
    var user models.User
    if err := db.First(&user, userID).Error; err != nil {
        return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
    }
    
    if user.Role != "admin" {
        return c.Status(403).JSON(fiber.Map{"error": "Admin access required"})
    }
    
    return c.Next()
}

// Статистика для админов
func (h *AdminHandler) GetStats(c *fiber.Ctx) error {
    var stats AdminStats
    
    // Общее количество пользователей
    h.db.DB.Model(&models.User{}).Count(&stats.TotalUsers)
    
    // Пользователи за сегодня
    h.db.DB.Model(&models.User{}).
        Where("created_at > ?", time.Now().Truncate(24*time.Hour)).
        Count(&stats.UsersToday)
    
    // Посты
    h.db.DB.Model(&models.Post{}).
        Where("reply_to_id IS NULL").
        Count(&stats.TotalPosts)
    
    // Активные подписки
    h.db.DB.Model(&models.Subscription{}).
        Where("status = ? AND current_period_end > ?", "active", time.Now()).
        Count(&stats.ActiveSubscriptions)
    
    // Доход за месяц
    h.db.DB.Raw(`
        SELECT SUM(price_cents) / 100 as revenue
        FROM subscriptions
        WHERE created_at > NOW() - INTERVAL '30 days'
    `).Scan(&stats.MonthlyRevenue)
    
    return c.JSON(stats)
}
```

---

## 11. Производительность и оптимизация

### Кеширование с Redis

```go
// Кеширование популярных постов
func (h *TimelineHandler) GetTrendingWithCache(c *fiber.Ctx) error {
    cacheKey := "trending:posts:1h"
    
    // Проверяем кеш
    cached, err := redisClient.Get(ctx, cacheKey).Result()
    if err == nil {
        var posts []models.Post
        json.Unmarshal([]byte(cached), &posts)
        return c.JSON(posts)
    }
    
    // Если нет в кеше - загружаем из БД
    var posts []models.Post
    h.db.DB.
        Preload("User").
        Preload("Media").
        Where("created_at > ?", time.Now().Add(-24*time.Hour)).
        Where("reply_to_id IS NULL").
        Order("likes_count DESC").
        Limit(50).
        Find(&posts)
    
    // Сохраняем в кеш на 1 час
    data, _ := json.Marshal(posts)
    redisClient.Set(ctx, cacheKey, data, time.Hour)
    
    return c.JSON(posts)
}
```

### Пагинация с курсорами

```go
// Cursor-based пагинация для лент
func (h *TimelineHandler) GetHomeTimelineCursor(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    
    // Параметры пагинации
    limit := 20
    before := c.Query("before") // ID последнего поста с предыдущей страницы
    after := c.Query("after")   // ID первого поста для новых
    
    query := h.db.DB.
        Preload("User").
        Preload("Media").
        Where("user_id IN (?)", getFollowingIDs(userID)).
        Where("reply_to_id IS NULL")
    
    if before != "" {
        // Загружаем более старые посты
        query = query.Where("created_at < (SELECT created_at FROM posts WHERE id = ?)", before)
    } else if after != "" {
        // Загружаем более новые посты
        query = query.Where("created_at > (SELECT created_at FROM posts WHERE id = ?)", after)
    }
    
    var posts []models.Post
    query.Order("created_at DESC").Limit(limit).Find(&posts)
    
    // Возвращаем с метаинформацией для следующего запроса
    return c.JSON(fiber.Map{
        "posts": posts,
        "has_more": len(posts) == limit,
        "cursor": fiber.Map{
            "before": posts[len(posts)-1].ID,
            "after": posts[0].ID,
        },
    })
}
```

### Оптимизация запросов

```go
// N+1 проблема решение
func (h *PostsHandler) GetPostsOptimized(c *fiber.Ctx) error {
    var posts []models.Post
    
    // Загружаем посты с связями одним запросом
    h.db.DB.
        Preload("User").
        Preload("Media").
        Joins("LEFT JOIN likes ON likes.post_id = posts.id AND likes.user_id = ?", userID).
        Select("posts.*, CASE WHEN likes.id IS NOT NULL THEN true ELSE false END as is_liked").
        Find(&posts)
    
    // Загружаем счетчики батчем
    postIDs := make([]uuid.UUID, len(posts))
    for i, post := range posts {
        postIDs[i] = post.ID
    }
    
    // Один запрос для всех счетчиков
    var counts []struct {
        PostID       uuid.UUID
        LikesCount   int
        RepliesCount int
    }
    h.db.DB.Raw(`
        SELECT 
            p.id as post_id,
            COUNT(DISTINCT l.id) as likes_count,
            COUNT(DISTINCT r.id) as replies_count
        FROM posts p
        LEFT JOIN likes l ON l.post_id = p.id
        LEFT JOIN posts r ON r.reply_to_id = p.id
        WHERE p.id IN ?
        GROUP BY p.id
    `, postIDs).Scan(&counts)
    
    // Мапим счетчики на посты
    countMap := make(map[uuid.UUID]struct{ likes, replies int })
    for _, c := range counts {
        countMap[c.PostID] = struct{ likes, replies int }{c.LikesCount, c.RepliesCount}
    }
    
    for i := range posts {
        if counts, ok := countMap[posts[i].ID]; ok {
            posts[i].LikesCount = counts.likes
            posts[i].RepliesCount = counts.replies
        }
    }
    
    return c.JSON(posts)
}
```

---

## 12. Развертывание и DevOps

### Docker конфигурация

```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server

# Production image
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/.env.production .env

EXPOSE 8080
CMD ["./main"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: x18_db
      POSTGRES_USER: x18_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - x18_network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - x18_network

  backend:
    build: ./custom-backend
    environment:
      DATABASE_URL: postgres://x18_user:${DB_PASSWORD}@postgres:5432/x18_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: ${CORS_ORIGINS}
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./storage:/app/storage
    networks:
      - x18_network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - x18_network

volumes:
  postgres_data:
  redis_data:

networks:
  x18_network:
    driver: bridge
```

### Nginx конфигурация

```nginx
upstream backend {
    server backend:8080;
}

server {
    listen 80;
    server_name api.x18.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.x18.app;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # API endpoints
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Статичные файлы (медиа)
    location /storage/ {
        alias /app/storage/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### CI/CD с GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Run tests
        run: |
          cd custom-backend
          go test ./...

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railwayapp/deploy@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
          project_id: ${{ secrets.RAILWAY_PROJECT_ID }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build frontend
        run: |
          cd client
          npm ci
          npm run build
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './client/dist'
          production-branch: main
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 13. Мониторинг и логирование

### Структурированное логирование

```go
// Используем zerolog для JSON логов
logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

// Middleware для логирования запросов
app.Use(func(c *fiber.Ctx) error {
    start := time.Now()
    
    // Обрабатываем запрос
    err := c.Next()
    
    // Логируем результат
    logger.Info().
        Str("method", c.Method()).
        Str("path", c.Path()).
        Int("status", c.Response().StatusCode()).
        Dur("latency", time.Since(start)).
        Str("ip", c.IP()).
        Str("user_id", c.Locals("userID").(string)).
        Msg("request processed")
    
    return err
})
```

### Метрики с Prometheus

```go
// Метрики для мониторинга
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "path", "status"},
    )
    
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
        },
        []string{"method", "path"},
    )
)

// Экспорт метрик
app.Get("/metrics", adaptor.HTTPHandler(promhttp.Handler()))
```

---

## 14. Тестирование

### Unit тесты

```go
// Тест создания поста
func TestCreatePost(t *testing.T) {
    db := setupTestDB()
    handler := NewPostsHandler(db)
    
    app := fiber.New()
    app.Post("/posts", handler.CreatePost)
    
    // Создаем тестового пользователя
    user := models.User{
        Username: "testuser",
        Email:    "test@example.com",
    }
    db.Create(&user)
    
    // Тест создания поста
    req := httptest.NewRequest("POST", "/posts", strings.NewReader(`{
        "content": "Test post content",
        "metadata": {"category": "test"}
    }`))
    req.Header.Set("Content-Type", "application/json")
    
    // Добавляем userID в контекст
    ctx := context.WithValue(req.Context(), "userID", user.ID)
    req = req.WithContext(ctx)
    
    resp, err := app.Test(req)
    assert.NoError(t, err)
    assert.Equal(t, 201, resp.StatusCode)
    
    // Проверяем что пост создан
    var post models.Post
    db.Where("user_id = ?", user.ID).First(&post)
    assert.Equal(t, "Test post content", post.Content)
}
```

### Integration тесты

```go
// Тест полного флоу: регистрация → логин → создание поста → комментарий
func TestFullUserFlow(t *testing.T) {
    app := setupTestApp()
    
    // 1. Регистрация
    resp, _ := app.Test(httptest.NewRequest("POST", "/api/auth/register", 
        strings.NewReader(`{"username":"testuser","email":"test@example.com","password":"password123"}`)))
    assert.Equal(t, 201, resp.StatusCode)
    
    // 2. Логин
    loginResp, _ := app.Test(httptest.NewRequest("POST", "/api/auth/login",
        strings.NewReader(`{"email":"test@example.com","password":"password123"}`)))
    
    var tokens TokenPair
    json.NewDecoder(loginResp.Body).Decode(&tokens)
    
    // 3. Создание поста
    postReq := httptest.NewRequest("POST", "/api/posts",
        strings.NewReader(`{"content":"My first post!"}`))
    postReq.Header.Set("Authorization", "Bearer "+tokens.AccessToken)
    
    postResp, _ := app.Test(postReq)
    assert.Equal(t, 201, postResp.StatusCode)
    
    var post models.Post
    json.NewDecoder(postResp.Body).Decode(&post)
    
    // 4. Комментарий к посту
    commentReq := httptest.NewRequest("POST", "/api/posts",
        strings.NewReader(`{"content":"Nice post!","reply_to_id":"`+post.ID.String()+`"}`))
    commentReq.Header.Set("Authorization", "Bearer "+tokens.AccessToken)
    
    commentResp, _ := app.Test(commentReq)
    assert.Equal(t, 201, commentResp.StatusCode)
}
```

---

## Заключение

Эта архитектура обеспечивает:

1. **Масштабируемость** - горизонтальное масштабирование через Docker/Kubernetes
2. **Производительность** - кеширование, оптимизированные запросы, CDN
3. **Безопасность** - JWT, санитизация, HTTPS, защита от атак
4. **Надежность** - транзакции, резервное копирование, мониторинг
5. **Гибкость** - JSONB для метаданных, модульная структура

Система готова к production использованию и может обслуживать тысячи пользователей одновременно.
