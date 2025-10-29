package api

import (
	"time"

	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type PostMenuHandler struct {
	db *database.Database
}

func NewPostMenuHandler(db *database.Database) *PostMenuHandler {
	return &PostMenuHandler{
		db: db,
	}
}

// PinPost закрепляет пост (только свой пост)
// POST /api/posts/:postId/pin
func (h *PostMenuHandler) PinPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("postId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Проверяем что пост принадлежит пользователю
	var post models.Post
	if err := h.db.DB.Where("id = ? AND user_id = ?", postID, userID).First(&post).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found or you don't have permission",
		})
	}

	// Проверяем, есть ли уже закрепленный пост
	var existingPin models.PinnedPost
	if err := h.db.DB.Where("user_id = ?", userID).First(&existingPin).Error; err == nil {
		// Если есть - удаляем старый
		h.db.DB.Delete(&existingPin)
	}

	// Создаем новый закрепленный пост
	pinnedPost := models.PinnedPost{
		UserID:    userID,
		PostID:    postID,
		CreatedAt: time.Now(),
	}

	if err := h.db.DB.Create(&pinnedPost).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to pin post",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Post pinned successfully",
		"pinned":  true,
	})
}

// UnpinPost открепляет пост
// DELETE /api/posts/:postId/pin
func (h *PostMenuHandler) UnpinPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("postId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Удаляем закрепленный пост
	result := h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&models.PinnedPost{})
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to unpin post",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Pinned post not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Post unpinned successfully",
		"pinned":  false,
	})
}

// DeletePost удаляет пост (свой или любой для администратора)
// DELETE /api/posts/:postId
func (h *PostMenuHandler) DeletePost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("postId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Получаем роль пользователя
	var user models.User
	if err := h.db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get user info",
		})
	}

	// Проверяем что пост существует
	var post models.Post
	if err := h.db.DB.Where("id = ?", postID).First(&post).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	// Проверяем права на удаление (владелец поста или администратор)
	if post.UserID != userID && user.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this post",
		})
	}

	// Удаляем связанные данные
	// 1. Удаляем закрепление если есть
	h.db.DB.Where("post_id = ?", postID).Delete(&models.PinnedPost{})

	// 2. Удаляем лайки
	h.db.DB.Where("post_id = ?", postID).Delete(&models.Like{})

	// 3. Удаляем медиа файлы
	var media []models.Media
	h.db.DB.Where("post_id = ?", postID).Find(&media)
	for _, m := range media {
		// TODO: удалить файлы из хранилища
		h.db.DB.Delete(&m)
	}

	// 4. Удаляем комментарии (reply_to_id)
	h.db.DB.Where("reply_to_id = ?", postID).Delete(&models.Post{})

	// 5. Удаляем сам пост
	if err := h.db.DB.Delete(&post).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete post",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Post deleted successfully",
	})
}

// ReportPost создает жалобу на пост
// POST /api/posts/:postId/report
func (h *PostMenuHandler) ReportPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("postId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Парсим тело запроса
	var req struct {
		Reason      string `json:"reason"`
		Description string `json:"description"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Валидация
	if req.Reason == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Reason is required",
		})
	}

	// Проверяем что пост существует
	var post models.Post
	if err := h.db.DB.Where("id = ?", postID).First(&post).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	// Проверяем что пользователь не отправлял жалобу на этот пост ранее
	var existingReport models.PostReport
	if err := h.db.DB.Where("post_id = ? AND reporter_id = ?", postID, userID).First(&existingReport).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "You have already reported this post",
		})
	}

	// Создаем жалобу
	report := models.PostReport{
		PostID:     postID,
		ReporterID: userID,
		Reason:     req.Reason,
		Details:    req.Description,
		Status:     "pending",
		CreatedAt:  time.Now(),
	}

	if err := h.db.DB.Create(&report).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to submit report",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Report submitted successfully",
		"report":  report,
	})
}

// BlockUser блокирует пользователя
// POST /api/users/:userId/block
func (h *PostMenuHandler) BlockUser(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	targetUserID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Нельзя заблокировать самого себя
	if userID == targetUserID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "You cannot block yourself",
		})
	}

	// Проверяем что пользователь существует
	var targetUser models.User
	if err := h.db.DB.Where("id = ?", targetUserID).First(&targetUser).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Проверяем что блокировка не существует
	var existingBlock models.UserBlock
	if err := h.db.DB.Where("blocker_id = ? AND blocked_id = ?", userID, targetUserID).First(&existingBlock).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "User is already blocked",
		})
	}

	// Создаем блокировку
	block := models.UserBlock{
		BlockerID: userID,
		BlockedID: targetUserID,
		CreatedAt: time.Now(),
	}

	if err := h.db.DB.Create(&block).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to block user",
		})
	}

	// Удаляем взаимные подписки если они есть
	h.db.DB.Where("(follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)",
		userID, targetUserID, targetUserID, userID).Delete(&models.Follow{})

	return c.JSON(fiber.Map{
		"message": "User blocked successfully",
		"blocked": true,
	})
}

// UnblockUser разблокирует пользователя
// DELETE /api/users/:userId/block
func (h *PostMenuHandler) UnblockUser(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	targetUserID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Удаляем блокировку
	result := h.db.DB.Where("blocker_id = ? AND blocked_id = ?", userID, targetUserID).Delete(&models.UserBlock{})
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to unblock user",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Block not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "User unblocked successfully",
		"blocked": false,
	})
}

// GetBlockedUsers возвращает список заблокированных пользователей
// GET /api/users/blocked
func (h *PostMenuHandler) GetBlockedUsers(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var blocks []models.UserBlock
	if err := h.db.DB.Where("blocker_id = ?", userID).
		Preload("Blocked").
		Find(&blocks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch blocked users",
		})
	}

	// Формируем ответ
	blockedUsers := make([]fiber.Map, len(blocks))
	for i, block := range blocks {
		blockedUsers[i] = fiber.Map{
			"id":           block.Blocked.ID,
			"username":     block.Blocked.Username,
			"display_name": block.Blocked.DisplayName,
			"avatar_url":   block.Blocked.AvatarURL,
			"blocked_at":   block.CreatedAt,
		}
	}

	return c.JSON(blockedUsers)
}

// CopyPostLink возвращает ссылку на пост
// GET /api/posts/:postId/link
func (h *PostMenuHandler) CopyPostLink(c *fiber.Ctx) error {
	postID := c.Params("postId")

	// Проверяем что пост существует
	var post models.Post
	if err := h.db.DB.Where("id = ?", postID).First(&post).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Post not found",
		})
	}

	// Формируем ссылку (здесь нужен актуальный домен из конфига)
	// TODO: получить домен из конфига
	link := "https://yourdomain.com/posts/" + postID

	return c.JSON(fiber.Map{
		"link": link,
	})
}

// GetPinnedPost возвращает закрепленный пост пользователя
// GET /api/users/:userId/pinned-post
func (h *PostMenuHandler) GetPinnedPost(c *fiber.Ctx) error {
	targetUserID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var pinnedPost models.PinnedPost
	if err := h.db.DB.Where("user_id = ?", targetUserID).
		Preload("Post").
		Preload("Post.User").
		Preload("Post.Media").
		First(&pinnedPost).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No pinned post found",
		})
	}

	return c.JSON(pinnedPost.Post)
}
