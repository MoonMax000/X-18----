package middleware

import (
	"custom-backend/internal/database"
	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// AdminOnly проверяет что пользователь является админом
func AdminOnly(db *database.Database) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userIDInterface := c.Locals("userID")
		if userIDInterface == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		// Преобразуем userID к uuid.UUID
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

		// Получаем пользователя из БД
		var user models.User
		if err := db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		// Проверяем роль
		if user.Role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Admin access required",
			})
		}

		return c.Next()
	}
}

// AdminOrModerator проверяет что пользователь является админом или модератором
func AdminOrModerator(db *database.Database) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userIDInterface := c.Locals("userID")
		if userIDInterface == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		// Преобразуем userID к uuid.UUID
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

		// Получаем пользователя из БД
		var user models.User
		if err := db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		// Проверяем роль
		if user.Role != "admin" && user.Role != "moderator" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Admin or moderator access required",
			})
		}

		return c.Next()
	}
}
