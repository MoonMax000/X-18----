package api

import (
	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type NotificationsHandler struct {
	db *database.Database
}

func NewNotificationsHandler(db *database.Database) *NotificationsHandler {
	return &NotificationsHandler{
		db: db,
	}
}

// GetNotifications возвращает уведомления пользователя
// GET /api/notifications?limit=20&offset=0&unread_only=false
func (h *NotificationsHandler) GetNotifications(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	// Параметры пагинации
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	if limit > 100 {
		limit = 100
	}

	// Фильтр только непрочитанных
	unreadOnly := c.QueryBool("unread_only", false)

	// Базовый запрос
	query := h.db.DB.Model(&models.Notification{}).
		Where("user_id = ?", userID).
		Preload("FromUser").
		Preload("Post.User")

	// Фильтр по статусу
	if unreadOnly {
		query = query.Where("read = ?", false)
	}

	// Получаем уведомления
	var notifications []models.Notification
	var total int64

	query.Count(&total)

	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&notifications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notifications",
		})
	}

	// Считаем непрочитанные
	var unreadCount int64
	h.db.DB.Model(&models.Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Count(&unreadCount)

	return c.JSON(fiber.Map{
		"notifications": notifications,
		"total":         total,
		"unread_count":  unreadCount,
		"limit":         limit,
		"offset":        offset,
	})
}

// MarkAsRead помечает уведомление как прочитанное
// PATCH /api/notifications/:id/read
func (h *NotificationsHandler) MarkAsRead(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	notificationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid notification ID",
		})
	}

	// Обновляем уведомление
	result := h.db.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("read", true)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to mark notification as read",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Notification not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Notification marked as read",
	})
}

// MarkAllAsRead помечает все уведомления как прочитанные
// PATCH /api/notifications/read-all
func (h *NotificationsHandler) MarkAllAsRead(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	// Обновляем все уведомления пользователя
	result := h.db.DB.Model(&models.Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Update("read", true)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to mark notifications as read",
		})
	}

	return c.JSON(fiber.Map{
		"message":       "All notifications marked as read",
		"updated_count": result.RowsAffected,
	})
}

// DeleteNotification удаляет уведомление
// DELETE /api/notifications/:id
func (h *NotificationsHandler) DeleteNotification(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	notificationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid notification ID",
		})
	}

	// Удаляем уведомление
	result := h.db.DB.
		Where("id = ? AND user_id = ?", notificationID, userID).
		Delete(&models.Notification{})

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete notification",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Notification not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Notification deleted",
	})
}

// GetUnreadCount возвращает количество непрочитанных уведомлений
// GET /api/notifications/unread-count
func (h *NotificationsHandler) GetUnreadCount(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var count int64
	if err := h.db.DB.Model(&models.Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Count(&count).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get unread count",
		})
	}

	return c.JSON(fiber.Map{
		"unread_count": count,
	})
}
