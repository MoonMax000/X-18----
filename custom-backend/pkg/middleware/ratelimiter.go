package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// AuthRateLimiter создает rate limiter для auth endpoints
func AuthRateLimiter() fiber.Handler {
	// Ограничения: 5 попыток за 1 минуту на IP
	return limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			// Используем IP как ключ
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Too many requests. Please try again later.",
			})
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
	})
}

// GeneralRateLimiter создает общий rate limiter для API
func GeneralRateLimiter() fiber.Handler {
	// Ограничения: 100 запросов за 1 минуту на IP
	return limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Too many requests. Please try again later.",
			})
		},
	})
}

// NotificationRateLimiter создает rate limiter для уведомлений
func NotificationRateLimiter() fiber.Handler {
	// Ограничения: 20 запросов за 10 секунд на user
	return limiter.New(limiter.Config{
		Max:        20,
		Expiration: 10 * time.Second,
		KeyGenerator: func(c *fiber.Ctx) string {
			// Используем userID если есть, иначе IP
			if userID := c.Locals("userID"); userID != nil {
				return userID.(string)
			}
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Too many requests. Please slow down.",
			})
		},
	})
}
