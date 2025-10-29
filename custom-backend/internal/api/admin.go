package api

import (
	"fmt"
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
	fmt.Printf("[Admin] CreateNews called by admin %s\n", userID)

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		URL         string `json:"url"`
		ImageURL    string `json:"image_url"`
		Category    string `json:"category"`
		Source      string `json:"source"`
	}

	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("[Admin] CreateNews: Failed to parse body: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	fmt.Printf("[Admin] CreateNews: Request data - Title: %s, URL: %s, Category: %s\n", req.Title, req.URL, req.Category)

	// Валидация
	if req.Title == "" || req.URL == "" {
		fmt.Printf("[Admin] CreateNews: Validation failed - empty title or URL\n")
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
		fmt.Printf("[Admin] CreateNews: Database error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create news",
		})
	}

	fmt.Printf("[Admin] CreateNews: Successfully created news with ID %s\n", news.ID)
	return c.Status(fiber.StatusCreated).JSON(news)
}

// GetAllNews получает все новости (для админки)
// GET /api/admin/news?limit=50&offset=0&is_active=all
func (h *AdminHandler) GetAllNews(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	isActive := c.Query("is_active", "all")

	fmt.Printf("[Admin] GetAllNews called - limit: %d, offset: %d, is_active: %s\n", limit, offset, isActive)

	query := h.db.DB.Model(&models.News{}).
		Preload("Creator").
		Order("published_at DESC")

	if isActive == "true" {
		query = query.Where("is_active = ?", true)
	} else if isActive == "false" {
		query = query.Where("is_active = ?", false)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		fmt.Printf("[Admin] GetAllNews: Error counting news: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count news",
		})
	}

	var news []models.News
	if err := query.Limit(limit).Offset(offset).Find(&news).Error; err != nil {
		fmt.Printf("[Admin] GetAllNews: Database error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch news",
		})
	}

	fmt.Printf("[Admin] GetAllNews: Successfully fetched %d news items out of %d total\n", len(news), total)
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
		fmt.Printf("[Admin] UpdateNews: Invalid news ID: %s\n", c.Params("id"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid news ID",
		})
	}

	fmt.Printf("[Admin] UpdateNews called for news ID: %s\n", newsID)

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
		fmt.Printf("[Admin] UpdateNews: Failed to parse body: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	fmt.Printf("[Admin] UpdateNews: Update request - Title: %s, IsActive: %v\n", req.Title, req.IsActive)

	// Получаем новость
	var news models.News
	if err := h.db.DB.Where("id = ?", newsID).First(&news).Error; err != nil {
		fmt.Printf("[Admin] UpdateNews: News not found: %v\n", err)
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
		fmt.Printf("[Admin] UpdateNews: Database error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update news",
		})
	}

	fmt.Printf("[Admin] UpdateNews: Successfully updated news %s\n", newsID)
	return c.JSON(news)
}

// DeleteNews удаляет новость
// DELETE /api/admin/news/:id
func (h *AdminHandler) DeleteNews(c *fiber.Ctx) error {
	newsID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		fmt.Printf("[Admin] DeleteNews: Invalid news ID: %s\n", c.Params("id"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid news ID",
		})
	}

	fmt.Printf("[Admin] DeleteNews called for news ID: %s\n", newsID)

	result := h.db.DB.Where("id = ?", newsID).Delete(&models.News{})
	if result.Error != nil {
		fmt.Printf("[Admin] DeleteNews: Database error: %v\n", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete news",
		})
	}

	if result.RowsAffected == 0 {
		fmt.Printf("[Admin] DeleteNews: News not found: %s\n", newsID)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "News not found",
		})
	}

	fmt.Printf("[Admin] DeleteNews: Successfully deleted news %s\n", newsID)
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

	fmt.Printf("[Admin] GetAllUsers called - limit: %d, offset: %d, search: %s\n", limit, offset, search)

	query := h.db.DB.Model(&models.User{}).
		Order("created_at DESC")

	if search != "" {
		query = query.Where("username ILIKE ? OR email ILIKE ? OR display_name ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		fmt.Printf("[Admin] GetAllUsers: Error counting users: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count users",
		})
	}

	var users []models.User
	if err := query.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		fmt.Printf("[Admin] GetAllUsers: Database error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch users",
		})
	}

	// Убираем чувствительные данные
	for i := range users {
		users[i].Password = ""
	}

	fmt.Printf("[Admin] GetAllUsers: Successfully fetched %d users out of %d total\n", len(users), total)
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
		fmt.Printf("[Admin] GetUserDetails: Invalid user ID: %s\n", c.Params("id"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	fmt.Printf("[Admin] GetUserDetails called for user ID: %s\n", userID)

	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		fmt.Printf("[Admin] GetUserDetails: User not found: %v\n", err)
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

	fmt.Printf("[Admin] GetUserDetails: User %s - posts: %d, followers: %d, following: %d\n",
		user.Username, postsCount, followersCount, followingCount)

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
		fmt.Printf("[Admin] UpdateUserRole: Invalid user ID: %s\n", c.Params("id"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	fmt.Printf("[Admin] UpdateUserRole called for user ID: %s\n", userID)

	var req struct {
		Role string `json:"role"`
	}

	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("[Admin] UpdateUserRole: Failed to parse body: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	fmt.Printf("[Admin] UpdateUserRole: Attempting to set role to: %s\n", req.Role)

	// Валидация роли
	if req.Role != "user" && req.Role != "admin" && req.Role != "moderator" {
		fmt.Printf("[Admin] UpdateUserRole: Invalid role specified: %s\n", req.Role)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid role. Must be 'user', 'admin', or 'moderator'",
		})
	}

	// Обновляем роль
	result := h.db.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("role", req.Role)

	if result.Error != nil {
		fmt.Printf("[Admin] UpdateUserRole: Database error: %v\n", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user role",
		})
	}

	if result.RowsAffected == 0 {
		fmt.Printf("[Admin] UpdateUserRole: User not found: %s\n", userID)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	fmt.Printf("[Admin] UpdateUserRole: Successfully updated role to %s for user %s\n", req.Role, userID)
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

	fmt.Printf("[Admin] GetReports called - limit: %d, offset: %d, status: %s\n", limit, offset, status)

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
	if err := query.Count(&total).Error; err != nil {
		fmt.Printf("[Admin] GetReports: Error counting reports: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count reports",
		})
	}

	var reports []models.PostReport
	if err := query.Limit(limit).Offset(offset).Find(&reports).Error; err != nil {
		fmt.Printf("[Admin] GetReports: Database error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch reports",
		})
	}

	fmt.Printf("[Admin] GetReports: Successfully fetched %d reports out of %d total\n", len(reports), total)
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
		fmt.Printf("[Admin] ReviewReport: Invalid report ID: %s\n", c.Params("id"))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid report ID",
		})
	}

	fmt.Printf("[Admin] ReviewReport called by admin %s for report ID: %s\n", adminID, reportID)

	var req struct {
		Status     string `json:"status"` // reviewed, resolved, dismissed
		ReviewNote string `json:"review_note"`
		Action     string `json:"action"` // none, delete_post, ban_user
	}

	if err := c.BodyParser(&req); err != nil {
		fmt.Printf("[Admin] ReviewReport: Failed to parse body: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	fmt.Printf("[Admin] ReviewReport: Status: %s, Action: %s, Note: %s\n", req.Status, req.Action, req.ReviewNote)

	// Валидация статуса
	if req.Status != "reviewed" && req.Status != "resolved" && req.Status != "dismissed" {
		fmt.Printf("[Admin] ReviewReport: Invalid status: %s\n", req.Status)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status",
		})
	}

	// Получаем жалобу
	var report models.PostReport
	if err := h.db.DB.Where("id = ?", reportID).First(&report).Error; err != nil {
		fmt.Printf("[Admin] ReviewReport: Report not found: %v\n", err)
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
		fmt.Printf("[Admin] ReviewReport: Database error saving report: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update report",
		})
	}

	// Выполняем действие если требуется
	if req.Action == "delete_post" {
		fmt.Printf("[Admin] ReviewReport: Deleting post %s as requested\n", report.PostID)
		// Удаляем пост
		h.db.DB.Where("id = ?", report.PostID).Delete(&models.Post{})
	}

	fmt.Printf("[Admin] ReviewReport: Successfully reviewed report %s\n", reportID)
	return c.JSON(fiber.Map{
		"message": "Report reviewed successfully",
		"report":  report,
	})
}

// GetAdminStats получает статистику для админ панели
// GET /api/admin/stats
func (h *AdminHandler) GetAdminStats(c *fiber.Ctx) error {
	fmt.Printf("[Admin] GetAdminStats called\n")

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

	fmt.Printf("[Admin] GetAdminStats: Total users: %d, Total posts: %d, Pending reports: %d\n",
		stats.TotalUsers, stats.TotalPosts, stats.PendingReports)
	fmt.Printf("[Admin] GetAdminStats: Active news: %d, Users today: %d, Posts today: %d\n",
		stats.ActiveNews, stats.UsersToday, stats.PostsToday)

	return c.JSON(stats)
}
