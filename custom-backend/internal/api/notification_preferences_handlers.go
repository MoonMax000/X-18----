package api

import (
	"custom-backend/internal/database"
	"log"

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
	log.Println("[NotifPrefs] GetNotificationPreferences called")

	userIDVal := c.Locals("userID")
	log.Printf("[NotifPrefs] userIDVal from context: %v (type: %T)", userIDVal, userIDVal)

	if userIDVal == nil {
		log.Println("[NotifPrefs] ERROR: userID is nil")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		log.Printf("[NotifPrefs] ERROR: Failed to convert userID to uuid.UUID, got type: %T", userIDVal)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	log.Printf("[NotifPrefs] User ID: %s", userID.String())

	var prefs NotificationPreferences
	var emailNotifications bool

	// Получаем email_notifications_enabled из users через Raw SQL
	log.Println("[NotifPrefs] Fetching email_notifications_enabled from users table...")
	err := h.db.DB.Raw(`
		SELECT COALESCE(email_notifications_enabled, true) 
		FROM users 
		WHERE id = ?
	`, userID).Scan(&emailNotifications).Error

	if err != nil {
		log.Printf("[NotifPrefs] ERROR fetching from users: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get notification preferences",
		})
	}

	log.Printf("[NotifPrefs] email_notifications_enabled: %v", emailNotifications)

	// Получаем остальные настройки из user_notification_preferences
	log.Println("[NotifPrefs] Fetching from user_notification_preferences table...")
	err = h.db.DB.Raw(`
		SELECT 
			user_id, new_followers, mentions, replies, reposts, likes,
			new_posts_from_following, post_recommendations, account_updates,
			security_alerts, product_updates, payment_received, 
			subscription_renewal, payout_completed
		FROM user_notification_preferences
		WHERE user_id = ?
	`, userID).Scan(&prefs).Error

	log.Printf("[NotifPrefs] Query result - err: %v", err)

	if err != nil {
		log.Println("[NotifPrefs] Preferences not found, creating defaults...")
		// Создаем настройки по умолчанию, если их еще нет
		err = h.db.DB.Exec(`
			INSERT INTO user_notification_preferences (user_id)
			VALUES (?)
			ON CONFLICT (user_id) DO NOTHING
		`, userID).Error

		if err != nil {
			log.Printf("[NotifPrefs] ERROR creating preferences: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create notification preferences",
			})
		}

		log.Println("[NotifPrefs] Preferences created, fetching again...")
		// Повторно получаем созданные настройки
		err = h.db.DB.Raw(`
			SELECT 
				user_id, new_followers, mentions, replies, reposts, likes,
				new_posts_from_following, post_recommendations, account_updates,
				security_alerts, product_updates, payment_received, 
				subscription_renewal, payout_completed
			FROM user_notification_preferences
			WHERE user_id = ?
		`, userID).Scan(&prefs).Error

		if err != nil {
			log.Printf("[NotifPrefs] ERROR fetching after create: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to get notification preferences",
			})
		}
		log.Println("[NotifPrefs] Successfully fetched after create")
	}

	prefs.EmailNotificationsEnabled = emailNotifications
	prefs.UserID = userID

	log.Printf("[NotifPrefs] SUCCESS - Returning preferences for user %s", userID.String())
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
