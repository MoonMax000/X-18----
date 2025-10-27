package api

import (
	"time"

	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type WidgetsHandler struct {
	db *database.Database
}

func NewWidgetsHandler(db *database.Database) *WidgetsHandler {
	return &WidgetsHandler{
		db: db,
	}
}

// GetNews возвращает активные новости
// GET /api/widgets/news?limit=10&category=crypto
func (h *WidgetsHandler) GetNews(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	category := c.Query("category")

	query := h.db.DB.Model(&models.News{}).
		Where("is_active = ?", true).
		Order("published_at DESC").
		Limit(limit)

	if category != "" {
		query = query.Where("category = ?", category)
	}

	var news []models.News
	if err := query.Find(&news).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch news",
		})
	}

	// Если новостей нет, возвращаем пустой массив (не ошибку)
	if len(news) == 0 {
		return c.JSON([]models.News{})
	}

	return c.JSON(news)
}

// GetTrendingTickers возвращает трендовые тикеры (топ по упоминаниям)
// GET /api/widgets/trending-tickers?limit=5&timeframe=24h
func (h *WidgetsHandler) GetTrendingTickers(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 5)
	if limit > 20 {
		limit = 20
	}

	timeframe := c.Query("timeframe", "24h")

	// Вычисляем временной промежуток
	var since time.Time
	switch timeframe {
	case "6h":
		since = time.Now().Add(-6 * time.Hour)
	case "12h":
		since = time.Now().Add(-12 * time.Hour)
	case "24h":
		since = time.Now().Add(-24 * time.Hour)
	case "7d":
		since = time.Now().Add(-7 * 24 * time.Hour)
	default:
		since = time.Now().Add(-24 * time.Hour)
	}

	// Агрегируем тикеры из metadata постов
	type TickerCount struct {
		Ticker string `json:"ticker"`
		Count  int64  `json:"count"`
	}

	var results []TickerCount

	// SQL запрос для подсчета упоминаний тикеров
	h.db.DB.Raw(`
		SELECT 
			metadata->>'ticker' as ticker,
			COUNT(*) as count
		FROM posts
		WHERE 
			created_at >= ?
			AND metadata->>'ticker' IS NOT NULL
			AND metadata->>'ticker' != ''
		GROUP BY metadata->>'ticker'
		ORDER BY count DESC
		LIMIT ?
	`, since, limit).Scan(&results)

	// Если тикеров нет, возвращаем пустой массив (не ошибку)
	if len(results) == 0 {
		return c.JSON([]TickerCount{})
	}

	return c.JSON(results)
}

// GetTopAuthors возвращает топ авторов (по активности)
// GET /api/widgets/top-authors?limit=5&timeframe=7d
func (h *WidgetsHandler) GetTopAuthors(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 5)
	if limit > 20 {
		limit = 20
	}

	timeframe := c.Query("timeframe", "7d")

	var since time.Time
	switch timeframe {
	case "24h":
		since = time.Now().Add(-24 * time.Hour)
	case "7d":
		since = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		since = time.Now().Add(-30 * 24 * time.Hour)
	default:
		since = time.Now().Add(-7 * 24 * time.Hour)
	}

	type AuthorStats struct {
		UserID          uuid.UUID `json:"user_id"`
		Username        string    `json:"username"`
		DisplayName     string    `json:"display_name"`
		AvatarURL       string    `json:"avatar_url"`
		PostsCount      int64     `json:"posts_count"`
		LikesCount      int64     `json:"likes_count"`
		TotalEngagement int64     `json:"total_engagement"`
	}

	var authors []AuthorStats

	// SQL запрос для получения топ авторов
	h.db.DB.Raw(`
		SELECT 
			u.id as user_id,
			u.username,
			u.display_name,
			u.avatar_url,
			COUNT(DISTINCT p.id) as posts_count,
			COALESCE(SUM(p.likes_count), 0) as likes_count,
			(COUNT(DISTINCT p.id) * 10 + COALESCE(SUM(p.likes_count), 0)) as total_engagement
		FROM users u
		INNER JOIN posts p ON p.user_id = u.id
		WHERE p.created_at >= ?
		GROUP BY u.id, u.username, u.display_name, u.avatar_url
		ORDER BY total_engagement DESC
		LIMIT ?
	`, since, limit).Scan(&authors)

	// Если авторов нет, возвращаем пустой массив (не ошибку)
	if len(authors) == 0 {
		return c.JSON([]AuthorStats{})
	}

	return c.JSON(authors)
}

// GetMyEarnings возвращает доходы текущего пользователя
// GET /api/widgets/my-earnings?period=30d
func (h *WidgetsHandler) GetMyEarnings(c *fiber.Ctx) error {
	// userID := c.Locals("userID").(uuid.UUID)
	// period := c.Query("period", "30d")

	// Здесь должна быть логика подсчета доходов
	// Пока возвращаем mock данные
	return c.JSON(fiber.Map{
		"mrr":                  500.00,
		"total_revenue":        1500.00,
		"subscribers_count":    25,
		"posts_sold":           15,
		"avg_post_price":       10.00,
		"top_posts_by_revenue": []fiber.Map{},
	})
}

// GetMySubscriptions возвращает подписки текущего пользователя
// GET /api/widgets/my-subscriptions
func (h *WidgetsHandler) GetMySubscriptions(c *fiber.Ctx) error {
	// Получаем список подписок (здесь должна быть таблица subscriptions)
	// Пока возвращаем пустой массив
	return c.JSON([]fiber.Map{})
}

// GetMyActivity возвращает активность текущего пользователя
// GET /api/widgets/my-activity?period=7d
func (h *WidgetsHandler) GetMyActivity(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	period := c.Query("period", "7d")

	var since time.Time
	switch period {
	case "7d":
		since = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		since = time.Now().Add(-30 * 24 * time.Hour)
	default:
		since = time.Now().Add(-7 * 24 * time.Hour)
	}

	// Подсчитываем статистику
	var posts int64
	var likes int64
	var comments int64

	h.db.DB.Model(&models.Post{}).
		Where("user_id = ? AND created_at >= ?", userID, since).
		Count(&posts)

	h.db.DB.Model(&models.Like{}).
		Where("user_id = ? AND created_at >= ?", userID, since).
		Count(&likes)

	h.db.DB.Model(&models.Post{}).
		Where("user_id = ? AND reply_to_id IS NOT NULL AND created_at >= ?", userID, since).
		Count(&comments)

	return c.JSON(fiber.Map{
		"posts":    posts,
		"likes":    likes,
		"comments": comments,
		"period":   period,
	})
}
