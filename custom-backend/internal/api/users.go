package api

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/pkg/middleware"
	"gorm.io/gorm"
)

type UsersHandler struct {
	db    *database.Database
	cache *cache.Cache
}

func NewUsersHandler(db *database.Database, cache *cache.Cache) *UsersHandler {
	return &UsersHandler{
		db:    db,
		cache: cache,
	}
}

// GetMe returns current authenticated user
// GET /api/users/me
func (h *UsersHandler) GetMe(c *fiber.Ctx) error {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		return err
	}

	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	return c.JSON(user.ToMe())
}

// GetUser returns user by ID
// GET /api/users/:id
func (h *UsersHandler) GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	return c.JSON(user.ToPublic())
}

// GetUserByUsername returns user by username
// GET /api/users/username/:username
func (h *UsersHandler) GetUserByUsername(c *fiber.Ctx) error {
	username := c.Params("username")

	var user models.User
	if err := h.db.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	return c.JSON(user.ToPublic())
}

// UpdateProfile updates current user's profile
// PATCH /api/users/me
func (h *UsersHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		return err
	}

	type UpdateRequest struct {
		FirstName         *string  `json:"first_name"`
		LastName          *string  `json:"last_name"`
		DisplayName       *string  `json:"display_name"`
		Bio               *string  `json:"bio"`
		Location          *string  `json:"location"`
		Website           *string  `json:"website"`
		Role              *string  `json:"role"`
		Sectors           *string  `json:"sectors"` // JSON array as string
		AvatarURL         *string  `json:"avatar_url"`
		HeaderURL         *string  `json:"header_url"`
		SubscriptionPrice *float64 `json:"subscription_price"`
		PrivateAccount    *bool    `json:"private_account"`
		AllowComments     *bool    `json:"allow_comments"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user
	var user models.User
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Update fields
	updates := make(map[string]interface{})
	if req.FirstName != nil {
		updates["first_name"] = *req.FirstName
	}
	if req.LastName != nil {
		updates["last_name"] = *req.LastName
	}
	if req.DisplayName != nil {
		updates["display_name"] = *req.DisplayName
	}
	if req.Bio != nil {
		updates["bio"] = *req.Bio
	}
	if req.Location != nil {
		updates["location"] = *req.Location
	}
	if req.Website != nil {
		updates["website"] = *req.Website
	}
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.Sectors != nil {
		updates["sectors"] = *req.Sectors
	}
	if req.AvatarURL != nil {
		updates["avatar_url"] = *req.AvatarURL
	}
	if req.HeaderURL != nil {
		updates["header_url"] = *req.HeaderURL
	}
	if req.SubscriptionPrice != nil {
		updates["subscription_price"] = *req.SubscriptionPrice
	}
	if req.PrivateAccount != nil {
		updates["private_account"] = *req.PrivateAccount
	}
	if req.AllowComments != nil {
		updates["allow_comments"] = *req.AllowComments
	}

	if len(updates) > 0 {
		if err := h.db.DB.Model(&user).Updates(updates).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to update profile",
			})
		}
	}

	// Reload user
	h.db.DB.First(&user, "id = ?", userID)

	return c.JSON(user.ToMe())
}

// GetUserPosts returns posts by user
// GET /api/users/:id/posts
func (h *UsersHandler) GetUserPosts(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Pagination
	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	var posts []models.Post
	query := h.db.DB.Where("user_id = ? AND reply_to_id IS NULL", userID).
		Preload("User").
		Preload("Media").
		Order("created_at DESC").
		Limit(limit)

	// Optional: filter by max_id for pagination
	if maxID := c.Query("max_id"); maxID != "" {
		if id, err := uuid.Parse(maxID); err == nil {
			query = query.Where("id < ?", id)
		}
	}

	if err := query.Find(&posts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch posts",
		})
	}

	return c.JSON(posts)
}

// GetFollowers returns user's followers
// GET /api/users/:id/followers
func (h *UsersHandler) GetFollowers(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	var follows []models.Follow
	query := h.db.DB.Where("following_id = ?", userID).
		Preload("Follower").
		Order("created_at DESC").
		Limit(limit)

	if err := query.Find(&follows).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch followers",
		})
	}

	// Extract users
	users := make([]models.PublicUser, len(follows))
	for i, follow := range follows {
		users[i] = follow.Follower.ToPublic()
	}

	return c.JSON(users)
}

// GetFollowing returns users that user follows
// GET /api/users/:id/following
func (h *UsersHandler) GetFollowing(c *fiber.Ctx) error {
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	limit := c.QueryInt("limit", 20)
	if limit > 100 {
		limit = 100
	}

	var follows []models.Follow
	query := h.db.DB.Where("follower_id = ?", userID).
		Preload("Following").
		Order("created_at DESC").
		Limit(limit)

	if err := query.Find(&follows).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch following",
		})
	}

	// Extract users
	users := make([]models.PublicUser, len(follows))
	for i, follow := range follows {
		users[i] = follow.Following.ToPublic()
	}

	return c.JSON(users)
}

// FollowUser creates a follow relationship
// POST /api/users/:id/follow
func (h *UsersHandler) FollowUser(c *fiber.Ctx) error {
	currentUserID, err := middleware.GetUserID(c)
	if err != nil {
		return err
	}

	id := c.Params("id")
	targetUserID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Can't follow yourself
	if currentUserID == targetUserID {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot follow yourself",
		})
	}

	// Check if target user exists
	var targetUser models.User
	if err := h.db.DB.First(&targetUser, "id = ?", targetUserID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Check if already following
	var existingFollow models.Follow
	if err := h.db.DB.Where("follower_id = ? AND following_id = ?", currentUserID, targetUserID).
		First(&existingFollow).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{
			"error": "Already following this user",
		})
	}

	// Create follow
	follow := models.Follow{
		FollowerID:  currentUserID,
		FollowingID: targetUserID,
	}

	if err := h.db.DB.Create(&follow).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to follow user",
		})
	}

	// Update counts
	h.db.DB.Model(&models.User{}).Where("id = ?", currentUserID).
		UpdateColumn("following_count", gorm.Expr("following_count + 1"))

	h.db.DB.Model(&models.User{}).Where("id = ?", targetUserID).
		UpdateColumn("followers_count", gorm.Expr("followers_count + 1"))

	// Create notification
	notification := models.Notification{
		ID:         uuid.New(),
		UserID:     targetUserID,
		Type:       "follow",
		FromUserID: &currentUserID,
		Read:       false,
		CreatedAt:  time.Now(),
	}

	h.db.DB.Create(&notification)

	return c.JSON(fiber.Map{
		"message": "Successfully followed user",
	})
}

// UnfollowUser removes follow relationship
// DELETE /api/users/:id/follow
func (h *UsersHandler) UnfollowUser(c *fiber.Ctx) error {
	currentUserID, err := middleware.GetUserID(c)
	if err != nil {
		return err
	}

	id := c.Params("id")
	targetUserID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Delete follow
	result := h.db.DB.Where("follower_id = ? AND following_id = ?", currentUserID, targetUserID).
		Delete(&models.Follow{})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to unfollow user",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{
			"error": "Not following this user",
		})
	}

	// Update counts
	h.db.DB.Model(&models.User{}).Where("id = ?", currentUserID).
		UpdateColumn("following_count", gorm.Expr("following_count - 1"))

	h.db.DB.Model(&models.User{}).Where("id = ?", targetUserID).
		UpdateColumn("followers_count", gorm.Expr("followers_count - 1"))

	// Create notification for unfollow
	notification := models.Notification{
		ID:         uuid.New(),
		UserID:     targetUserID,
		Type:       "unfollow",
		FromUserID: &currentUserID,
		Read:       false,
		CreatedAt:  time.Now(),
	}

	h.db.DB.Create(&notification)

	return c.JSON(fiber.Map{
		"message": "Successfully unfollowed user",
	})
}
