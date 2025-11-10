package middleware

import (
	"strings"

	"custom-backend/configs"
	"custom-backend/internal/auth"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// JWTMiddleware validates JWT token and injects user info into context
func JWTMiddleware(config *configs.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var token string

		// Try to get token from Authorization header first
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			// Check Bearer scheme
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				c.Set("WWW-Authenticate", `Bearer realm="api", error="invalid_request"`)
				return c.Status(401).JSON(fiber.Map{
					"error": "Invalid authorization format. Use: Bearer <token>",
				})
			}
			token = parts[1]
		} else {
			// If no Authorization header, try to get token from cookie
			token = c.Cookies("access_token")
			if token == "" {
				c.Set("WWW-Authenticate", `Bearer realm="api", error="missing_token"`)
				return c.Status(401).JSON(fiber.Map{
					"error": "Missing authorization token",
				})
			}
		}

		// Validate token
		claims, err := auth.ValidateAccessToken(token, config.JWT.AccessSecret)
		if err != nil {
			c.Set("WWW-Authenticate", `Bearer realm="api", error="invalid_token"`)
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Inject user info into context
		c.Locals("userID", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("email", claims.Email)
		c.Locals("sessionID", claims.ID) // Add session ID from JWT ID (JTI)

		return c.Next()
	}
}

// OptionalJWTMiddleware validates token if present, but doesn't require it
func OptionalJWTMiddleware(config *configs.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var token string

		// Try Authorization header first
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return c.Next()
			}
			token = parts[1]
		} else {
			// Try cookie
			token = c.Cookies("access_token")
			if token == "" {
				return c.Next()
			}
		}

		claims, err := auth.ValidateAccessToken(token, config.JWT.AccessSecret)
		if err != nil {
			return c.Next()
		}

		c.Locals("userID", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("email", claims.Email)
		c.Locals("sessionID", claims.ID) // Add session ID from JWT ID (JTI)

		return c.Next()
	}
}

// GetUserID extracts user ID from context
func GetUserID(c *fiber.Ctx) (uuid.UUID, error) {
	userID := c.Locals("userID")
	if userID == nil {
		return uuid.Nil, fiber.NewError(401, "Unauthorized")
	}

	id, ok := userID.(uuid.UUID)
	if !ok {
		return uuid.Nil, fiber.NewError(401, "Invalid user ID")
	}

	return id, nil
}

// GetUsername extracts username from context
func GetUsername(c *fiber.Ctx) string {
	username := c.Locals("username")
	if username == nil {
		return ""
	}

	name, ok := username.(string)
	if !ok {
		return ""
	}

	return name
}
