package api

import (
	"log"
	"time"

	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/pkg/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

	log.Printf("[GetUserByUsername] Looking up user: %s", username)

	// Get current user ID (if authenticated)
	var currentUserID *uuid.UUID
	if userID, err := middleware.GetUserID(c); err == nil {
		currentUserID = &userID
	}

	var user models.User
	if err := h.db.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("[GetUserByUsername] User not found: %s", username)
			return c.Status(404).JSON(fiber.Map{
				"error": "User not found",
			})
		}
		log.Printf("[GetUserByUsername] Database error for user %s: %v", username, err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	log.Printf("[GetUserByUsername] Found user %s (ID: %s)", username, user.ID)

	// ⭐ Check if current user is subscribed to this profile
	isSubscribed := false
	if currentUserID != nil && *currentUserID != user.ID {
		var count int64
		err := h.db.DB.Model(&models.Subscription{}).
			Where("subscriber_id = ? AND creator_id = ? AND status = ? AND current_period_end > ?",
				currentUserID, user.ID, "active", time.Now()).
			Count(&count).Error

		if err == nil {
			isSubscribed = count > 0
		}
		log.Printf("[GetUserByUsername] Subscription check: is_subscribed=%v", isSubscribed)
	}

	// ⭐ Calculate content stats
	photosCount := h.calculatePhotosCount(user.ID)
	videosCount := h.calculateVideosCount(user.ID)
	premiumPostsCount := h.calculatePremiumPostsCount(user.ID)

	// Build response with paywall fields
	response := fiber.Map{
		"id":                 user.ID,
		"username":           user.Username,
		"display_name":       user.DisplayName,
		"first_name":         user.FirstName,
		"last_name":          user.LastName,
		"bio":                user.Bio,
		"location":           user.Location,
		"website":            user.Website,
		"role":               user.Role,
		"sectors":            user.Sectors,
		"avatar_url":         user.AvatarURL,
		"header_url":         user.HeaderURL,
		"verified":           user.Verified,
		"subscription_price": user.SubscriptionPrice,
		"followers_count":    user.FollowersCount,
		"following_count":    user.FollowingCount,
		"posts_count":        user.PostsCount,
		"private_account":    user.PrivateAccount,
		// ⭐ Paywall fields
		"is_profile_private":               user.IsProfilePrivate,
		"is_subscribed":                    isSubscribed,
		"subscription_discount_price":      user.SubscriptionDiscountPrice,
		"subscription_discount_percentage": user.SubscriptionDiscountPercentage,
		"subscription_discount_days":       user.SubscriptionDiscountDays,
		"photos_count":                     photosCount,
		"videos_count":                     videosCount,
		"premium_posts_count":              premiumPostsCount,
		"created_at":                       user.CreatedAt,
	}

	if user.LastActiveAt != nil {
		response["last_active_at"] = user.LastActiveAt
	}

	return c.JSON(response)
}

// Helper: Calculate photos count
func (h *UsersHandler) calculatePhotosCount(userID uuid.UUID) int {
	var count int64
	h.db.DB.Table("posts").
		Joins("JOIN media ON media.post_id = posts.id").
		Where("posts.user_id = ? AND media.type = ?", userID, "image").
		Count(&count)
	return int(count)
}

// Helper: Calculate videos count
func (h *UsersHandler) calculateVideosCount(userID uuid.UUID) int {
	var count int64
	h.db.DB.Table("posts").
		Joins("JOIN media ON media.post_id = posts.id").
		Where("posts.user_id = ? AND media.type = ?", userID, "video").
		Count(&count)
	return int(count)
}

// Helper: Calculate premium posts count
func (h *UsersHandler) calculatePremiumPostsCount(userID uuid.UUID) int {
	var count int64
	h.db.DB.Model(&models.Post{}).
		Where("user_id = ? AND price_cents > ?", userID, 0).
		Count(&count)
	return int(count)
}

// UpdateProfile updates current user's profile
// PATCH /api/users/me
func (h *UsersHandler) UpdateProfile(c *fiber.Ctx) error {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		return err
	}

	type UpdateRequest struct {
		Username          *string  `json:"username"`
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
		IsProfilePrivate  *bool    `json:"is_profile_private"` // ⭐ Paywall field
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

	// Check username change restrictions (Twitter-like: 3 free changes, then once per week)
	if req.Username != nil && *req.Username != user.Username {
		// Check if username is already taken
		var existingUser models.User
		if err := h.db.DB.Where("username = ? AND id != ?", *req.Username, userID).First(&existingUser).Error; err == nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Username already taken",
			})
		}

		// Check change limits
		if user.UsernameChangesCount >= 3 {
			// After 3 changes, only allow once per week
			if user.LastUsernameChangeAt != nil {
				weekAgo := time.Now().Add(-7 * 24 * time.Hour)
				if user.LastUsernameChangeAt.After(weekAgo) {
					// Calculate hours until next change allowed
					nextChangeTime := user.LastUsernameChangeAt.Add(7 * 24 * time.Hour)
					hoursLeft := int(time.Until(nextChangeTime).Hours())
					daysLeft := hoursLeft / 24
					hoursLeft = hoursLeft % 24

					return c.Status(400).JSON(fiber.Map{
						"error": fiber.Map{
							"message":        "Username can only be changed once per week after 3 changes",
							"days_left":      daysLeft,
							"hours_left":     hoursLeft,
							"next_change_at": nextChangeTime.Format(time.RFC3339),
						},
					})
				}
			}
		}
	}

	// Update fields
	updates := make(map[string]interface{})
	if req.Username != nil && *req.Username != user.Username {
		updates["username"] = *req.Username
		updates["username_changes_count"] = user.UsernameChangesCount + 1
		now := time.Now()
		updates["last_username_change_at"] = &now
	}
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
		log.Printf("[UpdateProfile] Updating avatar_url for user %s: %s", userID, *req.AvatarURL)
		updates["avatar_url"] = *req.AvatarURL
	}
	if req.HeaderURL != nil {
		log.Printf("[UpdateProfile] Updating header_url for user %s: %s", userID, *req.HeaderURL)
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
	// ⭐ Handle private profile toggle
	if req.IsProfilePrivate != nil {
		log.Printf("[UpdateProfile] Updating is_profile_private for user %s: %v", userID, *req.IsProfilePrivate)
		updates["is_profile_private"] = *req.IsProfilePrivate
	}

	if len(updates) > 0 {
		log.Printf("[UpdateProfile] Applying updates for user %s: %+v", userID, updates)
		if err := h.db.DB.Model(&user).Updates(updates).Error; err != nil {
			log.Printf("[UpdateProfile] ERROR updating profile for user %s: %v", userID, err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to update profile",
			})
		}
		log.Printf("[UpdateProfile] Profile updated successfully for user %s", userID)
	}

	// Reload user from database
	if err := h.db.DB.First(&user, "id = ?", userID).Error; err != nil {
		log.Printf("[UpdateProfile] ERROR reloading user %s: %v", userID, err)
	} else {
		log.Printf("[UpdateProfile] After reload - user %s: avatar_url=%s, header_url=%s",
			userID, user.AvatarURL, user.HeaderURL)
	}

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

	// DEBUG: Log what we got from DB
	for i := range posts {
		log.Printf("[GetUserPosts] Post %s: AccessLevel=%s, PriceCents=%d",
			posts[i].ID, posts[i].AccessLevel, posts[i].PriceCents)
	}

	// Добавляем информацию о лайках, покупках и подписках текущего пользователя (если авторизован)
	if currentUserID, ok := c.Locals("userID").(uuid.UUID); ok {
		for i := range posts {
			var like models.Like
			err := h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&like).Error
			posts[i].IsLiked = (err == nil)

			var retweet models.Retweet
			err = h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&retweet).Error
			posts[i].IsRetweeted = (err == nil)

			var bookmark models.Bookmark
			err = h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&bookmark).Error
			posts[i].IsBookmarked = (err == nil)

			// Проверяем покупку поста
			var purchase models.PostPurchase
			err = h.db.DB.Where("user_id = ? AND post_id = ?", currentUserID, posts[i].ID).First(&purchase).Error
			posts[i].IsPurchased = (err == nil)

			// Проверяем подписку на автора
			var subscription models.Subscription
			err = h.db.DB.Where("user_id = ? AND creator_id = ? AND status = ?", currentUserID, posts[i].UserID, "active").First(&subscription).Error
			posts[i].IsSubscriber = (err == nil)

			// Проверяем подписку (follow) на автора для followers-only контента
			var follow models.Follow
			err = h.db.DB.Where("follower_id = ? AND following_id = ?", currentUserID, posts[i].UserID).First(&follow).Error
			posts[i].IsFollower = (err == nil)

			// Добавляем цену поста если это платный пост
			if posts[i].PriceCents > 0 {
				posts[i].PostPrice = float64(posts[i].PriceCents) / 100
			}

			// Добавляем цену подписки автора
			if posts[i].User.SubscriptionPrice > 0 {
				posts[i].User.SubscriptionPriceFormatted = posts[i].User.SubscriptionPrice
			}
		}
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

// SearchUsers searches for users by username or display name
// GET /api/search/users?q=query&limit=10
func (h *UsersHandler) SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q", "")
	if query == "" {
		return c.JSON([]models.PublicUser{})
	}

	limit := c.QueryInt("limit", 10)
	if limit > 50 {
		limit = 50
	}

	var users []models.User
	searchPattern := "%" + query + "%"

	if err := h.db.DB.Where("LOWER(username) LIKE LOWER(?) OR LOWER(display_name) LIKE LOWER(?)",
		searchPattern, searchPattern).
		Limit(limit).
		Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to search users",
		})
	}

	// Convert to public users
	publicUsers := make([]models.PublicUser, len(users))
	for i, user := range users {
		publicUsers[i] = user.ToPublic()
	}

	return c.JSON(publicUsers)
}
