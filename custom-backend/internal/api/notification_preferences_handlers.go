package api

import (
	"custom-backend/internal/database"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type NotificationPreferencesHandler struct {
	db *database.Database
}

func NewNotificationPreferencesHandler(db *database.Database) *NotificationPreferencesHandler {
	return &NotificationPreferencesHandler{
		db: db,
	}
}

// NotificationPreferences представляет настройки уведомлений пользователя
type NotificationPreferences struct {
	ID                        uint      `json:"id"`
	UserID                    uuid.UUID `json:"user_id"`
	NewFollowers              bool      `json:"new_followers"`
	Mentions                  bool      `json:"mentions"`
	Replies                   bool      `json:"replies"`
	Reposts                   bool      `json:"reposts"`
	Likes                     bool      `json:"likes"`
	NewPostsFromFollowing     bool      `json:"new_posts_from_following"`
	PostRecommendations       bool      `json:"post_recommendations"`
	AccountUpdates            bool      `json:"account_updates"`
	SecurityAlerts            bool      `json:"security_alerts"`
	ProductUpdates            bool      `json:"product_updates"`
	PaymentReceived           bool      `json:"payment_received"`
	SubscriptionRenewal       bool      `json:"subscription_renewal"`
	PayoutCompleted           bool      `json:"payout_completed"`
	EmailNotificationsEnabled bool      `json:"email_notifications_enabled"`
}

// GetNotificationPreferences возвращает настройки уведомлений текущего пользователя
// GET /api/notification-preferences
func (h *NotificationPreferencesHandler) GetNotificationPreferences(c *fiber.Ctx) error {
	userIDVal := c.Locals("userID")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var prefs NotificationPreferences
	var emailNotifications bool

	// Получаем email_notifications_enabled из users через Raw SQL
	err := h.db.DB.Raw(`
		SELECT COALESCE(email_notifications_enabled, true) 
		FROM users 
		WHERE id = ?
	`, userID).Scan(&emailNotifications).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get notification preferences",
		})
	}

	// Получаем остальные настройки из user_notification_preferences
	err = h.db.DB.Raw(`
		SELECT 
			id, user_id, new_followers, mentions, replies, reposts, likes,
			new_posts_from_following, post_recommendations, account_updates,
			security_alerts, product_updates, payment_received, 
			subscription_renewal, payout_completed
		FROM user_notification_preferences
		WHERE user_id = ?
	`, userID).Scan(&prefs).Error

	if err != nil || prefs.ID == 0 {
		// Создаем настройки по умолчанию, если их еще нет
		err = h.db.DB.Exec(`
			INSERT INTO user_notification_preferences (user_id)
			VALUES (?)
			ON CONFLICT (user_id) DO NOTHING
		`, userID).Error

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create notification preferences",
			})
		}

		// Повторно получаем созданные настройки
		err = h.db.DB.Raw(`
			SELECT 
				id, user_id, new_followers, mentions, replies, reposts, likes,
				new_posts_from_following, post_recommendations, account_updates,
				security_alerts, product_updates, payment_received, 
				subscription_renewal, payout_completed
			FROM user_notification_preferences
			WHERE user_id = ?
		`, userID).Scan(&prefs).Error

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to get notification preferences",
			})
		}
	}

	prefs.EmailNotificationsEnabled = emailNotifications
	prefs.UserID = userID

	return c.JSON(prefs)
}

// UpdateNotificationPreferences обновляет настройки уведомлений
// PUT /api/notification-preferences
func (h *NotificationPreferencesHandler) UpdateNotificationPreferences(c *fiber.Ctx) error {
	userIDVal := c.Locals("userID")
	if userIDVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var req NotificationPreferences
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Начинаем транзакцию
	tx := h.db.DB.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to start transaction",
		})
	}
	defer tx.Rollback()

	// Обновляем email_notifications_enabled в таблице users
	err := tx.Exec(`
		UPDATE users 
		SET email_notifications_enabled = ?
		WHERE id = ?
	`, req.EmailNotificationsEnabled, userID).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update email notifications",
		})
	}

	// Обновляем остальные настройки в user_notification_preferences
	err = tx.Exec(`
		UPDATE user_notification_preferences
		SET 
			new_followers = ?,
			mentions = ?,
			replies = ?,
			reposts = ?,
			likes = ?,
			new_posts_from_following = ?,
			post_recommendations = ?,
			account_updates = ?,
			security_alerts = ?,
			product_updates = ?,
			payment_received = ?,
			subscription_renewal = ?,
			payout_completed = ?
		WHERE user_id = ?
	`,
		req.NewFollowers,
		req.Mentions,
		req.Replies,
		req.Reposts,
		req.Likes,
		req.NewPostsFromFollowing,
		req.PostRecommendations,
		req.AccountUpdates,
		req.SecurityAlerts,
		req.ProductUpdates,
		req.PaymentReceived,
		req.SubscriptionRenewal,
		req.PayoutCompleted,
		userID,
	).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update notification preferences",
		})
	}

	// Коммитим транзакцию
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to commit transaction",
		})
	}

	// Возвращаем обновленные настройки
	return h.GetNotificationPreferences(c)
}
