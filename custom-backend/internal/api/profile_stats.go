package api

import (
	"custom-backend/internal/database"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProfileStatsHandler struct {
	db *database.Database
}

func NewProfileStatsHandler(db *database.Database) *ProfileStatsHandler {
	return &ProfileStatsHandler{db: db}
}

// GetUserStats returns statistics for the authenticated user
// GET /api/users/me/stats
func (h *ProfileStatsHandler) GetUserStats(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Get current month stats
	var stats struct {
		PostsThisMonth  int     `json:"posts_this_month"`
		PostsChange     float64 `json:"posts_change"`
		TotalLikes      int     `json:"total_likes"`
		LikesChange     float64 `json:"likes_change"`
		TotalComments   int     `json:"total_comments"`
		CommentsChange  float64 `json:"comments_change"`
		TotalFollowers  int     `json:"total_followers"`
		FollowersChange float64 `json:"followers_change"`
	}

	// Posts this month
	h.db.DB.Raw(`
		SELECT COUNT(*) as posts_this_month
		FROM posts
		WHERE user_id = ? AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
	`, userUUID).Scan(&stats)

	// Posts last month for comparison
	var postsLastMonth int
	h.db.DB.Raw(`
		SELECT COUNT(*)
		FROM posts
		WHERE user_id = ? 
		AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
		AND created_at < DATE_TRUNC('month', CURRENT_DATE)
	`, userUUID).Scan(&postsLastMonth)

	if postsLastMonth > 0 {
		stats.PostsChange = float64(stats.PostsThisMonth-postsLastMonth) / float64(postsLastMonth) * 100
	}

	// Total likes
	h.db.DB.Raw(`
		SELECT COUNT(*)
		FROM likes l
		JOIN posts p ON l.post_id = p.id
		WHERE p.user_id = ?
	`, userUUID).Scan(&stats.TotalLikes)

	// Likes last month for comparison
	var likesLastMonth int
	h.db.DB.Raw(`
		SELECT COUNT(*)
		FROM likes l
		JOIN posts p ON l.post_id = p.id
		WHERE p.user_id = ?
		AND l.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
		AND l.created_at < DATE_TRUNC('month', CURRENT_DATE)
	`, userUUID).Scan(&likesLastMonth)

	// Likes this month
	var likesThisMonth int
	h.db.DB.Raw(`
		SELECT COUNT(*)
		FROM likes l
		JOIN posts p ON l.post_id = p.id
		WHERE p.user_id = ?
		AND l.created_at >= DATE_TRUNC('month', CURRENT_DATE)
	`, userUUID).Scan(&likesThisMonth)

	if likesLastMonth > 0 {
		stats.LikesChange = float64(likesThisMonth-likesLastMonth) / float64(likesLastMonth) * 100
	}

	// Total comments
	h.db.DB.Raw(`
		SELECT COUNT(*)
		FROM posts parent
		JOIN posts reply ON reply.reply_to_id = parent.id
		WHERE parent.user_id = ? AND reply.reply_to_id IS NOT NULL
	`, userUUID).Scan(&stats.TotalComments)

	// Get followers count
	h.db.DB.Raw(`
		SELECT COUNT(*) FROM follows WHERE following_id = ?
	`, userUUID).Scan(&stats.TotalFollowers)

	// Followers last month
	var followersLastMonth int
	h.db.DB.Raw(`
		SELECT COUNT(*)
		FROM follows
		WHERE following_id = ?
		AND created_at < DATE_TRUNC('month', CURRENT_DATE)
	`, userUUID).Scan(&followersLastMonth)

	if followersLastMonth > 0 {
		stats.FollowersChange = float64(stats.TotalFollowers-followersLastMonth) / float64(followersLastMonth) * 100
	}

	return c.JSON(stats)
}

// GetUserActivity returns recent activity for the authenticated user
// GET /api/users/me/activity
func (h *ProfileStatsHandler) GetUserActivity(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	limit := c.QueryInt("limit", 10)

	type Activity struct {
		Type      string    `json:"type"`
		User      string    `json:"user"`
		Username  string    `json:"username"`
		Action    string    `json:"action"`
		CreatedAt time.Time `json:"created_at"`
	}

	var activities []Activity

	// Get recent likes
	h.db.DB.Raw(`
		SELECT 
			'like' as type,
			u.display_name as user,
			u.username,
			'лайкнул ваш пост' as action,
			l.created_at
		FROM likes l
		JOIN users u ON l.user_id = u.id
		JOIN posts p ON l.post_id = p.id
		WHERE p.user_id = ? AND l.user_id != ?
		ORDER BY l.created_at DESC
		LIMIT ?
	`, userUUID, userUUID, limit/2).Scan(&activities)

	// Get recent follows
	var follows []Activity
	h.db.DB.Raw(`
		SELECT 
			'follow' as type,
			u.display_name as user,
			u.username,
			'подписался на вас' as action,
			f.created_at
		FROM follows f
		JOIN users u ON f.follower_id = u.id
		WHERE f.following_id = ?
		ORDER BY f.created_at DESC
		LIMIT ?
	`, userUUID, limit/2).Scan(&follows)

	activities = append(activities, follows...)

	// Sort by created_at
	// (In production, you'd want to do this in SQL with UNION)

	return c.JSON(fiber.Map{
		"activities": activities,
		"total":      len(activities),
	})
}

// GetTopPosts returns the user's top performing posts
// GET /api/users/me/top-posts
func (h *ProfileStatsHandler) GetTopPosts(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	limit := c.QueryInt("limit", 10)

	type TopPost struct {
		ID            uuid.UUID `json:"id"`
		Content       string    `json:"content"`
		LikesCount    int       `json:"likes_count"`
		RepliesCount  int       `json:"replies_count"`
		RetweetsCount int       `json:"retweets_count"`
		CreatedAt     time.Time `json:"created_at"`
	}

	var posts []TopPost
	h.db.DB.Raw(`
		SELECT 
			id,
			content,
			likes_count,
			replies_count,
			retweets_count,
			created_at
		FROM posts
		WHERE user_id = ? AND reply_to_id IS NULL
		ORDER BY (likes_count + replies_count * 2 + retweets_count * 3) DESC
		LIMIT ?
	`, userUUID, limit).Scan(&posts)

	return c.JSON(fiber.Map{
		"posts": posts,
		"total": len(posts),
	})
}

// GetFollowerGrowth returns follower growth data
// GET /api/users/me/follower-growth
func (h *ProfileStatsHandler) GetFollowerGrowth(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	period := c.Query("period", "month") // "week" or "month"

	type GrowthData struct {
		Date  string `json:"date"`
		Count int    `json:"count"`
	}

	var growthData []GrowthData

	if period == "week" {
		// Last 7 days
		h.db.DB.Raw(`
			WITH dates AS (
				SELECT generate_series(
					CURRENT_DATE - INTERVAL '6 days',
					CURRENT_DATE,
					'1 day'::interval
				)::date as date
			)
			SELECT 
				TO_CHAR(d.date, 'Dy') as date,
				COUNT(f.id) as count
			FROM dates d
			LEFT JOIN follows f ON DATE(f.created_at) = d.date AND f.following_id = ?
			GROUP BY d.date
			ORDER BY d.date
		`, userUUID).Scan(&growthData)
	} else {
		// Last 30 days
		h.db.DB.Raw(`
			WITH dates AS (
				SELECT generate_series(
					CURRENT_DATE - INTERVAL '29 days',
					CURRENT_DATE,
					'1 day'::interval
				)::date as date
			)
			SELECT 
				EXTRACT(DAY FROM d.date)::text as date,
				COUNT(f.id) as count
			FROM dates d
			LEFT JOIN follows f ON DATE(f.created_at) = d.date AND f.following_id = ?
			GROUP BY d.date
			ORDER BY d.date
		`, userUUID).Scan(&growthData)
	}

	return c.JSON(fiber.Map{
		"period": period,
		"data":   growthData,
	})
}
