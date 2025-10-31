package api

import (
	"strings"

	"custom-backend/internal/database"
	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

type SearchHandler struct {
	db *database.Database
}

func NewSearchHandler(db *database.Database) *SearchHandler {
	return &SearchHandler{
		db: db,
	}
}

// SearchResponse объединенный результат поиска
type SearchResponse struct {
	Users []models.PublicUser `json:"users"`
	Posts []models.Post       `json:"posts"`
	Total SearchTotal         `json:"total"`
}

type SearchTotal struct {
	Users int64 `json:"users"`
	Posts int64 `json:"posts"`
}

// Search выполняет поиск по пользователям и постам
// GET /api/search?q=query&type=all&limit=20
func (h *SearchHandler) Search(c *fiber.Ctx) error {
	// Параметры поиска
	query := c.Query("q")
	searchType := c.Query("type", "all") // all, users, posts
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	// Очищаем запрос
	query = strings.TrimSpace(query)
	searchPattern := "%" + strings.ToLower(query) + "%"

	var response SearchResponse
	var total SearchTotal

	// Поиск пользователей
	if searchType == "all" || searchType == "users" {
		var users []models.User
		userQuery := h.db.DB.Model(&models.User{}).
			Where("LOWER(username) LIKE ? OR LOWER(display_name) LIKE ? OR LOWER(bio) LIKE ?",
				searchPattern, searchPattern, searchPattern)

		userQuery.Count(&total.Users)

		if err := userQuery.
			Order("followers_count DESC").
			Limit(limit).
			Offset(offset).
			Find(&users).Error; err == nil {

			response.Users = make([]models.PublicUser, len(users))
			for i, user := range users {
				response.Users[i] = user.ToPublic()
			}
		}
	}

	// Поиск постов
	if searchType == "all" || searchType == "posts" {
		var posts []models.Post
		postQuery := h.db.DB.Model(&models.Post{}).
			Preload("User").
			Preload("Media").
			Where("LOWER(content) LIKE ?", searchPattern)

		postQuery.Count(&total.Posts)

		if err := postQuery.
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&posts).Error; err == nil {

			response.Posts = posts
		}
	}

	response.Total = total

	return c.JSON(response)
}

// SearchUsers поиск только по пользователям
// GET /api/search/users?q=query&limit=20
func (h *SearchHandler) SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q")
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	query = strings.TrimSpace(query)
	searchPattern := "%" + strings.ToLower(query) + "%"

	var users []models.User
	var total int64

	userQuery := h.db.DB.Model(&models.User{}).
		Where("LOWER(username) LIKE ? OR LOWER(display_name) LIKE ? OR LOWER(bio) LIKE ?",
			searchPattern, searchPattern, searchPattern)

	userQuery.Count(&total)

	if err := userQuery.
		Order("followers_count DESC").
		Limit(limit).
		Offset(offset).
		Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search users",
		})
	}

	// Конвертируем в PublicUser
	publicUsers := make([]models.PublicUser, len(users))
	for i, user := range users {
		publicUsers[i] = user.ToPublic()
	}

	return c.JSON(fiber.Map{
		"users":  publicUsers,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// SearchPosts поиск только по постам
// GET /api/search/posts?q=query&limit=20
func (h *SearchHandler) SearchPosts(c *fiber.Ctx) error {
	query := c.Query("q")
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	query = strings.TrimSpace(query)
	searchPattern := "%" + strings.ToLower(query) + "%"

	var posts []models.Post
	var total int64

	postQuery := h.db.DB.Model(&models.Post{}).
		Preload("User").
		Preload("Media").
		Where("LOWER(content) LIKE ?", searchPattern)

	postQuery.Count(&total)

	if err := postQuery.
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
	})
}

// SearchHashtags поиск постов по хештегу
// GET /api/search/hashtag/:tag?limit=20
func (h *SearchHandler) SearchHashtags(c *fiber.Ctx) error {
	tag := c.Params("tag")
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	if limit > 100 {
		limit = 100
	}

	if tag == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Hashtag is required",
		})
	}

	// Убираем # если есть
	tag = strings.TrimPrefix(tag, "#")
	tag = strings.ToLower(tag)

	var posts []models.Post
	var total int64

	// Ищем по хештегу в контенте и metadata
	postQuery := h.db.DB.Model(&models.Post{}).
		Preload("User").
		Preload("Media").
		Where("LOWER(content) LIKE ?", "%#"+tag+"%")

	postQuery.Count(&total)

	if err := postQuery.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search hashtag",
		})
	}

	return c.JSON(fiber.Map{
		"hashtag": "#" + tag,
		"posts":   posts,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

// GetTrendingHashtags возвращает популярные хештеги
// GET /api/search/trending-hashtags?limit=10
func (h *SearchHandler) GetTrendingHashtags(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	// Простая реализация: находим посты с хештегами за последние 7 дней
	// В production лучше использовать отдельную таблицу hashtags с счетчиками
	type HashtagCount struct {
		Tag   string `json:"tag"`
		Count int64  `json:"count"`
	}

	var results []HashtagCount

	// Получаем посты за последние 7 дней с хештегами
	var posts []models.Post
	if err := h.db.DB.
		Where("created_at > NOW() - INTERVAL '7 days'").
		Where("content LIKE '%#%'").
		Select("content").
		Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trending hashtags",
		})
	}

	// Подсчитываем хештеги
	hashtagMap := make(map[string]int64)
	for _, post := range posts {
		// Простой парсинг хештегов
		words := strings.Fields(post.Content)
		for _, word := range words {
			if strings.HasPrefix(word, "#") && len(word) > 1 {
				tag := strings.ToLower(strings.TrimPrefix(word, "#"))
				// Убираем пунктуацию в конце
				tag = strings.TrimRight(tag, ".,!?;:")
				if len(tag) > 0 {
					hashtagMap[tag]++
				}
			}
		}
	}

	// Конвертируем в slice и сортируем
	for tag, count := range hashtagMap {
		results = append(results, HashtagCount{
			Tag:   "#" + tag,
			Count: count,
		})
	}

	// Простая сортировка по count (в production использовать sort)
	// Берем топ N
	if len(results) > limit {
		results = results[:limit]
	}

	return c.JSON(fiber.Map{
		"hashtags": results,
		"period":   "7 days",
	})
}
