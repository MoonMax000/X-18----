package api

import (
	"custom-backend/internal/database"
	"custom-backend/internal/models"

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
	// TODO: Implement when PinnedPost model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Pin functionality not implemented yet",
	})
}

// UnpinPost открепляет пост
// DELETE /api/posts/:postId/pin
func (h *PostMenuHandler) UnpinPost(c *fiber.Ctx) error {
	// TODO: Implement when PinnedPost model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Unpin functionality not implemented yet",
	})
}

// DeletePost удаляет пост (свой или любой для администратора)
// DELETE /api/posts/:postId
func (h *PostMenuHandler) DeletePost(c *fiber.Ctx) error {
	userIDInterface := c.Locals("userID")
	userID, ok := userIDInterface.(uuid.UUID)
	if !ok {
		// Пытаемся преобразовать из строки
		userIDStr, strOk := userIDInterface.(string)
		if !strOk {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid user ID format",
			})
		}
		var err error
		userID, err = uuid.Parse(userIDStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid user ID",
			})
		}
	}

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
	// 1. Удаляем лайки
	h.db.DB.Where("post_id = ?", postID).Delete(&models.Like{})

	// 2. Удаляем медиа файлы
	var media []models.Media
	h.db.DB.Where("post_id = ?", postID).Find(&media)
	for _, m := range media {
		// TODO: удалить файлы из хранилища
		h.db.DB.Delete(&m)
	}

	// 3. Удаляем комментарии (reply_to_id)
	h.db.DB.Where("reply_to_id = ?", postID).Delete(&models.Post{})

	// 4. Удаляем сам пост
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
	// TODO: Implement when PostReport model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Report functionality not implemented yet",
	})
}

// BlockUser блокирует пользователя
// POST /api/users/:userId/block
func (h *PostMenuHandler) BlockUser(c *fiber.Ctx) error {
	// TODO: Implement when UserBlock model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Block functionality not implemented yet",
	})
}

// UnblockUser разблокирует пользователя
// DELETE /api/users/:userId/block
func (h *PostMenuHandler) UnblockUser(c *fiber.Ctx) error {
	// TODO: Implement when UserBlock model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Unblock functionality not implemented yet",
	})
}

// GetBlockedUsers возвращает список заблокированных пользователей
// GET /api/users/blocked
func (h *PostMenuHandler) GetBlockedUsers(c *fiber.Ctx) error {
	// TODO: Implement when UserBlock model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Get blocked users functionality not implemented yet",
	})
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
	// TODO: Implement when PinnedPost model is created
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Get pinned post functionality not implemented yet",
	})
}
