package api

import (
	"time"

	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AdminHandler struct {
	db *database.Database
}

func NewAdminHandler(db *database.Database) *AdminHandler {
	return &AdminHandler{
		db: db,
	}
}

// ==================== NEWS MANAGEMENT ====================

// CreateNews создает новую новость (только админы)
// POST /api/admin/news
func (h *AdminHandler) CreateNews(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		URL         string `json:"url"`
		ImageURL    string `json:"image_url"`
		Category    string `json:"category"`
		Source      string `json:"source"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Валидация
	if req.Title == "" || req.URL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Title and URL are required",
		})
	}

	// Создаем новость
	news := models.News{
		Title:       req.Title,
		Description: req.Description,
		URL:         req.URL,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		Source:      req.Source,
		CreatedBy:   userID,
		IsActive:    true,
		PublishedAt: time.Now(),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.db.DB.Create(&news).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create news",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(news)
}

// GetAllNews получает все новости (для админки)
// GET /api/admin/news?limit=50&offset=0&is_active=all
func (h *AdminHandler) GetAllNews(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	isActive := c.Query("is_active", "all")

	query := h.db.DB.Model(&models.News{}).
		Preload("Creator").
		Order("published_at DESC")

	if isActive == "true" {
		query = query.Where("is_active = ?", true)
	} else if isActive == "false" {
		query = query.Where("is_active = ?", false)
	}

	var total int64
	query.Count(&total)

	var news []models.News
	if err := query.Limit(limit).Offset(offset).Find(&news).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch news",
		})
	}

	return c.JSON(fiber.Map{
		"news":   news,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// UpdateNews обновляет новость
// PUT /api/admin/news/:id
func (h *AdminHandler) UpdateNews(c *fiber.Ctx) error {
	newsID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid news ID",
		})
	}

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		URL         string `json:"url"`
		ImageURL    string `json:"image_url"`
		Category    string `json:"category"`
		Source      string `json:"source"`
		IsActive    *bool  `json:"is_active"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Получаем новость
	var news models.News
	if err := h.db.DB.Where("id = ?", newsID).First(&news).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "News not found",
		})
	}

	// Обновляем поля
	if req.Title != "" {
		news.Title = req.Title
	}
	if req.Description != "" {
		news.Description = req.Description
	}
	if req.URL != "" {
		news.URL = req.URL
	}
	if req.ImageURL != "" {
		news.ImageURL = req.ImageURL
	}
	if req.Category != "" {
		news.Category = req.Category
	}
	if req.Source != "" {
		news.Source = req.Source
	}
	if req.IsActive != nil {
		news.IsActive = *req.IsActive
	}
	news.UpdatedAt = time.Now()

	if err := h.db.DB.Save(&news).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update news",
		})
	}

	return c.JSON(news)
}

// DeleteNews удаляет новость
// DELETE /api/admin/news/:id
func (h *AdminHandler) DeleteNews(c *fiber.Ctx) error {
	newsID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid news ID",
		})
	}

	result := h.db.DB.Where("id = ?", newsID).Delete(&models.News{})
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete news",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "News not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "News deleted successfully",
	})
}

// ==================== USER MANAGEMENT ====================

// GetAllUsers получает всех пользователей
// GET /api/admin/users?limit=50&offset=0&search=username
func (h *AdminHandler) GetAllUsers(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	search := c.Query("search", "")

	query := h.db.DB.Model(&models.User{}).
		Order("created_at DESC")

	if search != "" {
		query = query.Where("username ILIKE ? OR email ILIKE ? OR display_name ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var users []models.User
	if err := query.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch users",
		})
	}

	// Убираем чувствительные данные
	for i := range users {
		users[i].Password = ""
	}

	return c.JSON(fiber.Map{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GetUserDetails получает детальную информацию о пользователе
// GET /api/admin/users/:id
func (h *AdminHandler) GetUserDetails(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Получаем статистику пользователя
	var postsCount int64
	var followersCount int64
	var followingCount int64

	h.db.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&postsCount)
	h.db.DB.Model(&models.Follow{}).Where("following_id = ?", userID).Count(&followersCount)
	h.db.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Count(&followingCount)

	// Убираем чувствительные данные
	user.Password = ""

	return c.JSON(fiber.Map{
		"user":            user,
		"posts_count":     postsCount,
		"followers_count": followersCount,
		"following_count": followingCount,
	})
}

// UpdateUserRole обновляет роль пользователя
// PATCH /api/admin/users/:id/role
func (h *AdminHandler) UpdateUserRole(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var req struct {
		Role string `json:"role"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Валидация роли
	if req.Role != "user" && req.Role != "admin" && req.Role != "moderator" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid role. Must be 'user', 'admin', or 'moderator'",
		})
	}

	// Обновляем роль
	result := h.db.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("role", req.Role)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user role",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "User role updated successfully",
		"role":    req.Role,
	})
}

// ==================== REPORTS MANAGEMENT ====================

// GetReports получает все жалобы
// GET /api/admin/reports?limit=50&offset=0&status=pending
func (h *AdminHandler) GetReports(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	status := c.Query("status", "all")

	query := h.db.DB.Model(&models.PostReport{}).
		Preload("Post").
		Preload("Post.User").
		Preload("Reporter").
		Preload("Reviewer").
		Order("created_at DESC")

	if status != "all" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var reports []models.PostReport
	if err := query.Limit(limit).Offset(offset).Find(&reports).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch reports",
		})
	}

	return c.JSON(fiber.Map{
		"reports": reports,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

// ReviewReport обрабатывает жалобу
// PATCH /api/admin/reports/:id
func (h *AdminHandler) ReviewReport(c *fiber.Ctx) error {
	adminID := c.Locals("userID").(uuid.UUID)
	reportID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid report ID",
		})
	}

	var req struct {
		Status     string `json:"status"` // reviewed, resolved, dismissed
		ReviewNote string `json:"review_note"`
		Action     string `json:"action"` // none, delete_post, ban_user
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Валидация статуса
	if req.Status != "reviewed" && req.Status != "resolved" && req.Status != "dismissed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status",
		})
	}

	// Получаем жалобу
	var report models.PostReport
	if err := h.db.DB.Where("id = ?", reportID).First(&report).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Report not found",
		})
	}

	// Обновляем статус жалобы
	report.Status = req.Status
	report.ReviewedBy = &adminID
	report.ReviewNote = req.ReviewNote
	report.UpdatedAt = time.Now()

	if err := h.db.DB.Save(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update report",
		})
	}

	// Выполняем действие если требуется
	if req.Action == "delete_post" {
		// Удаляем пост
		h.db.DB.Where("id = ?", report.PostID).Delete(&models.Post{})
	}

	return c.JSON(fiber.Map{
		"message": "Report reviewed successfully",
		"report":  report,
	})
}

// GetAdminStats получает статистику для админ панели
// GET /api/admin/stats
func (h *AdminHandler) GetAdminStats(c *fiber.Ctx) error {
	var stats struct {
		TotalUsers     int64 `json:"total_users"`
		TotalPosts     int64 `json:"total_posts"`
		TotalReports   int64 `json:"total_reports"`
		PendingReports int64 `json:"pending_reports"`
		ActiveNews     int64 `json:"active_news"`
		UsersToday     int64 `json:"users_today"`
		PostsToday     int64 `json:"posts_today"`
	}

	today := time.Now().Truncate(24 * time.Hour)

	h.db.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	h.db.DB.Model(&models.Post{}).Count(&stats.TotalPosts)
	h.db.DB.Model(&models.PostReport{}).Count(&stats.TotalReports)
	h.db.DB.Model(&models.PostReport{}).Where("status = ?", "pending").Count(&stats.PendingReports)
	h.db.DB.Model(&models.News{}).Where("is_active = ?", true).Count(&stats.ActiveNews)
	h.db.DB.Model(&models.User{}).Where("created_at >= ?", today).Count(&stats.UsersToday)
	h.db.DB.Model(&models.Post{}).Where("created_at >= ?", today).Count(&stats.PostsToday)

	return c.JSON(stats)
}
