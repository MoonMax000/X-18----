package api

import (
	"encoding/json"
	"fmt"
	"time"

	"custom-backend/internal/database"
	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TimelineHandler struct {
	db *database.Database
}

func NewTimelineHandler(db *database.Database) *TimelineHandler {
	return &TimelineHandler{
		db: db,
	}
}

// GetHomeTimeline возвращает ленту постов для пользователя (посты от подписок + свои)
// GET /api/timeline/home?limit=20&offset=0&category=crypto&market=btc
func (h *TimelineHandler) GetHomeTimeline(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	// Параметры пагинации
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	if limit > 100 {
		limit = 100
	}

	// Параметры фильтрации по metadata
	category := c.Query("category")
	market := c.Query("market")
	symbol := c.Query("symbol")

	// Получаем ID пользователей, на которых подписан
	var follows []models.Follow
	h.db.DB.Where("follower_id = ?", userID).Find(&follows)

	followingIDs := []uuid.UUID{userID} // Включаем свои посты
	for _, follow := range follows {
		followingIDs = append(followingIDs, follow.FollowingID)
	}

	// Базовый запрос
	query := h.db.DB.Model(&models.Post{}).
		Where("user_id IN ?", followingIDs).
		Where("reply_to_id IS NULL"). // Исключаем комментарии из основной ленты
		Preload("User").
		Preload("Media")

	// Фильтрация по metadata
	if category != "" {
		query = query.Where("metadata->>'category' = ?", category)
	}
	if market != "" {
		query = query.Where("metadata->>'market' = ?", market)
	}
	if symbol != "" {
		query = query.Where("metadata->>'symbol' = ?", symbol)
	}

	// Получаем посты
	var posts []models.Post
	var total int64

	query.Count(&total)
	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch timeline",
		})
	}

	// Добавляем информацию о лайках, покупках и подписках текущего пользователя
	for i := range posts {
		var like models.Like
		err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&like).Error
		posts[i].IsLiked = (err == nil)

		var retweet models.Retweet
		err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&retweet).Error
		posts[i].IsRetweeted = (err == nil)

		var bookmark models.Bookmark
		err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&bookmark).Error
		posts[i].IsBookmarked = (err == nil)

		// Проверяем покупку поста
		var purchase models.PostPurchase
		err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&purchase).Error
		posts[i].IsPurchased = (err == nil)

		// Проверяем подписку на автора
		var subscription models.Subscription
		err = h.db.DB.Where("user_id = ? AND creator_id = ? AND status = ?", userID, posts[i].UserID, "active").First(&subscription).Error
		posts[i].IsSubscriber = (err == nil)

		// Проверяем подписку (follow) на автора для followers-only контента
		var follow models.Follow
		err = h.db.DB.Where("follower_id = ? AND following_id = ?", userID, posts[i].UserID).First(&follow).Error
		posts[i].IsFollower = (err == nil)

		// Добавляем цену поста если это платный пост
		if posts[i].PriceCents > 0 {
			posts[i].PostPrice = float64(posts[i].PriceCents) / 100
		}

		// Добавляем цену подписки автора
		if posts[i].User.SubscriptionPrice > 0 {
			posts[i].User.SubscriptionPriceFormatted = posts[i].User.SubscriptionPrice
		}
	}

	// Конвертируем в DTO
	dtos := toPostDTOList(posts)

	return c.JSON(fiber.Map{
		"posts":  dtos,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GetExploreTimeline возвращает публичную ленту (все посты)
// GET /api/timeline/explore?limit=20&after=uuid&before=uuid&category=crypto
func (h *TimelineHandler) GetExploreTimeline(c *fiber.Ctx) error {
	// Параметры пагинации
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	// Cursor-based пагинация (ID постов)
	after := c.Query("after")   // Для получения новых постов (created_at > after_post.created_at)
	before := c.Query("before") // Для получения старых постов (created_at < before_post.created_at)

	// Параметры фильтрации
	category := c.Query("category")
	market := c.Query("market")
	symbol := c.Query("symbol")

	// Базовый запрос
	query := h.db.DB.Model(&models.Post{}).
		Where("reply_to_id IS NULL"). // Исключаем комментарии из основной ленты
		Preload("User").
		Preload("Media")

	// Cursor-based пагинация
	if after != "" {
		// Получаем посты НОВЕЕ чем after (для checkForNew)
		afterID, err := uuid.Parse(after)
		if err == nil {
			var afterPost models.Post
			if err := h.db.DB.First(&afterPost, afterID).Error; err == nil {
				query = query.Where("created_at > ?", afterPost.CreatedAt)
			}
		}
	}
	if before != "" {
		// Получаем посты СТАРШЕ чем before (для loadMore)
		beforeID, err := uuid.Parse(before)
		if err == nil {
			var beforePost models.Post
			if err := h.db.DB.First(&beforePost, beforeID).Error; err == nil {
				query = query.Where("created_at < ?", beforePost.CreatedAt)
			}
		}
	}

	// Фильтрация по metadata
	if category != "" {
		query = query.Where("metadata->>'category' = ?", category)
	}
	if market != "" {
		query = query.Where("metadata->>'market' = ?", market)
	}
	if symbol != "" {
		query = query.Where("metadata->>'symbol' = ?", symbol)
	}

	// Получаем посты
	var posts []models.Post

	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch explore timeline",
		})
	}

	// Добавляем информацию о лайках текущего пользователя (если авторизован)
	if userID, ok := c.Locals("userID").(uuid.UUID); ok {
		fmt.Printf("\n[GetExploreTimeline] Processing %d posts for user %s\n", len(posts), userID)
		for i := range posts {
			var like models.Like
			err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&like).Error
			posts[i].IsLiked = (err == nil)

			var retweet models.Retweet
			err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&retweet).Error
			posts[i].IsRetweeted = (err == nil)

			var bookmark models.Bookmark
			err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&bookmark).Error
			posts[i].IsBookmarked = (err == nil)

			// Проверяем покупку поста
			var purchase models.PostPurchase
			err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, posts[i].ID).First(&purchase).Error
			posts[i].IsPurchased = (err == nil)

			// Проверяем подписку на автора
			var subscription models.Subscription
			err = h.db.DB.Where("user_id = ? AND creator_id = ? AND status = ?", userID, posts[i].UserID, "active").First(&subscription).Error
			posts[i].IsSubscriber = (err == nil)

			// Проверяем подписку (follow) на автора для followers-only контента
			var follow models.Follow
			err = h.db.DB.Where("follower_id = ? AND following_id = ?", userID, posts[i].UserID).First(&follow).Error
			posts[i].IsFollower = (err == nil)

			// Добавляем цену поста если это платный пост
			if posts[i].PriceCents > 0 {
				posts[i].PostPrice = float64(posts[i].PriceCents) / 100
			}

			// Добавляем цену подписки автора
			if posts[i].User.SubscriptionPrice > 0 {
				posts[i].User.SubscriptionPriceFormatted = posts[i].User.SubscriptionPrice
			}
		}
	}

	// Конвертируем в DTO
	dtos := toPostDTOList(posts)

	// DEBUG: Логируем первый пост детально
	if len(dtos) > 0 {
		fmt.Printf("\n========== [GetExploreTimeline] ПЕРВЫЙ ПОСТ (DTO) ==========\n")
		fmt.Printf("Post ID: %s\n", dtos[0].ID)
		fmt.Printf("DTO.AccessLevel: %s\n", dtos[0].AccessLevel)
		fmt.Printf("DTO.PriceCents: %d\n", dtos[0].PriceCents)
		fmt.Printf("DTO.ReplyPolicy: %s\n", dtos[0].ReplyPolicy)
		jsonBytes, _ := json.Marshal(dtos[0])
		fmt.Printf("\nDTO JSON для первого поста:\n%s\n", string(jsonBytes))
		fmt.Printf("=============================================================\n\n")
	}

	return c.JSON(dtos)
}

// GetTrendingPosts возвращает трендовые посты (по лайкам и ретвитам за последние 24ч)
// GET /api/timeline/trending?limit=20&timeframe=24h&category=crypto
func (h *TimelineHandler) GetTrendingPosts(c *fiber.Ctx) error {
	// Параметры
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	timeframe := c.Query("timeframe", "24h")
	category := c.Query("category")
	market := c.Query("market")

	// Вычисляем временной промежуток
	var since time.Time
	switch timeframe {
	case "6h":
		since = time.Now().Add(-6 * time.Hour)
	case "12h":
		since = time.Now().Add(-12 * time.Hour)
	case "24h":
		since = time.Now().Add(-24 * time.Hour)
	case "48h":
		since = time.Now().Add(-48 * time.Hour)
	case "7d":
		since = time.Now().Add(-7 * 24 * time.Hour)
	default:
		since = time.Now().Add(-24 * time.Hour)
	}

	// Базовый запрос
	query := h.db.DB.Model(&models.Post{}).
		Where("created_at >= ?", since).
		Where("reply_to_id IS NULL"). // Исключаем комментарии из трендов
		Preload("User").
		Preload("Media")

	// Фильтрация по metadata
	if category != "" {
		query = query.Where("metadata->>'category' = ?", category)
	}
	if market != "" {
		query = query.Where("metadata->>'market' = ?", market)
	}

	// Получаем посты, сортируем по популярности (лайки * 2 + ретвиты * 3)
	var posts []models.Post
	if err := query.
		Order("(likes_count * 2 + retweets_count * 3) DESC, created_at DESC").
		Limit(limit).
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trending posts",
		})
	}

	return c.JSON(fiber.Map{
		"posts":     posts,
		"timeframe": timeframe,
		"limit":     limit,
	})
}

// GetUserTimeline возвращает посты конкретного пользователя
// GET /api/timeline/user/:id?limit=20&offset=0&category=crypto
func (h *TimelineHandler) GetUserTimeline(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Параметры пагинации
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	if limit > 100 {
		limit = 100
	}

	// Параметры фильтрации
	category := c.Query("category")
	market := c.Query("market")

	// Проверяем существование пользователя
	var user models.User
	if err := h.db.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	// Базовый запрос
	query := h.db.DB.Model(&models.Post{}).
		Where("user_id = ?", userID).
		Where("reply_to_id IS NULL"). // Исключаем комментарии из профиля пользователя
		Preload("User").
		Preload("Media")

	// Фильтрация по metadata
	if category != "" {
		query = query.Where("metadata->>'category' = ?", category)
	}
	if market != "" {
		query = query.Where("metadata->>'market' = ?", market)
	}

	// Получаем посты
	var posts []models.Post
	var total int64

	query.Count(&total)
	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch user timeline",
		})
	}

	// Добавляем информацию о лайках, покупках и подписках текущего пользователя (если авторизован)
	if currentUserID, ok := c.Locals("userID").(uuid.UUID); ok {
		for i := range posts {
			var like models.Like
			err := h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&like).Error
			posts[i].IsLiked = (err == nil)

			var retweet models.Retweet
			err = h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&retweet).Error
			posts[i].IsRetweeted = (err == nil)

			var bookmark models.Bookmark
			err = h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&bookmark).Error
			posts[i].IsBookmarked = (err == nil)

			// Проверяем покупку поста
			var purchase models.PostPurchase
			err = h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&purchase).Error
			posts[i].IsPurchased = (err == nil)

			// Проверяем подписку на автора
			var subscription models.Subscription
			err = h.db.DB.Where("user_id = ? AND creator_id = ? AND status = ?", currentUserID, posts[i].UserID, "active").First(&subscription).Error
			posts[i].IsSubscriber = (err == nil)

			// Проверяем подписку (follow) на автора для followers-only контента
			var follow models.Follow
			err = h.db.DB.Where("follower_id = ? AND following_id = ?", currentUserID, posts[i].UserID).First(&follow).Error
			posts[i].IsFollower = (err == nil)

			// Добавляем цену поста если это платный пост
			if posts[i].PriceCents > 0 {
				posts[i].PostPrice = float64(posts[i].PriceCents) / 100
			}

			// Добавляем цену подписки автора
			if posts[i].User.SubscriptionPrice > 0 {
				posts[i].User.SubscriptionPriceFormatted = posts[i].User.SubscriptionPrice
			}
		}
	}

	// Конвертируем в DTO
	dtos := toPostDTOList(posts)

	return c.JSON(fiber.Map{
		"user":   user.ToPublic(),
		"posts":  dtos,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GetPostsByMetadata возвращает посты по конкретным metadata параметрам
// GET /api/timeline/search?category=crypto&market=btc&symbol=BTC-USD&limit=20
func (h *TimelineHandler) GetPostsByMetadata(c *fiber.Ctx) error {
	// Параметры пагинации
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	if limit > 100 {
		limit = 100
	}

	// Параметры фильтрации (все опциональные)
	category := c.Query("category")
	market := c.Query("market")
	symbol := c.Query("symbol")
	tag := c.Query("tag")

	// Проверяем, что хотя бы один параметр указан
	if category == "" && market == "" && symbol == "" && tag == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "At least one filter parameter is required",
		})
	}

	// Базовый запрос
	query := h.db.DB.Model(&models.Post{}).
		Where("reply_to_id IS NULL"). // Исключаем комментарии из поиска по metadata
		Preload("User").
		Preload("Media")

	// Применяем фильтры
	if category != "" {
		query = query.Where("metadata->>'category' = ?", category)
	}
	if market != "" {
		query = query.Where("metadata->>'market' = ?", market)
	}
	if symbol != "" {
		query = query.Where("metadata->>'symbol' = ?", symbol)
	}
	if tag != "" {
		// Поиск по тегам в metadata (предполагается массив tags)
		query = query.Where("metadata->'tags' @> ?", `["`+tag+`"]`)
	}

	// Получаем посты
	var posts []models.Post
	var total int64

	query.Count(&total)
	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search posts",
		})
	}

	return c.JSON(fiber.Map{
		"posts":  posts,
		"total":  total,
		"limit":  limit,
		"offset": offset,
		"filters": fiber.Map{
			"category": category,
			"market":   market,
			"symbol":   symbol,
			"tag":      tag,
		},
	})
}
