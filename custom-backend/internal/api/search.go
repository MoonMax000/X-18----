package api

import (
	"fmt"
	"strings"
	"time"

	"custom-backend/internal/database"
	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SearchHandler struct {
	db *database.Database
}

func NewSearchHandler(db *database.Database) *SearchHandler {
	return &SearchHandler{
		db: db,
	}
}

// SearchPostsRequest represents the search query parameters
type SearchPostsRequest struct {
	Query       string `query:"q"`            // Text search query
	Author      string `query:"author"`       // Author username
	Category    string `query:"category"`     // Post category
	Tags        string `query:"tags"`         // Comma-separated tags
	DateFrom    string `query:"date_from"`    // ISO 8601 date
	DateTo      string `query:"date_to"`      // ISO 8601 date
	AccessLevel string `query:"access_level"` // free, pay-per-post, subscribers-only, etc.
	MinLikes    int    `query:"min_likes"`    // Minimum likes count
	MinViews    int    `query:"min_views"`    // Minimum views count
	HasMedia    string `query:"has_media"`    // true/false/any
	MediaType   string `query:"media_type"`   // image, video, document, any
	SortBy      string `query:"sort_by"`      // relevance, date, likes, views
	SortOrder   string `query:"sort_order"`   // asc, desc
	Page        int    `query:"page"`         // Page number (default: 1)
	Limit       int    `query:"limit"`        // Results per page (default: 20, max: 100)
}

// SearchPostsResponse represents the search results
type SearchPostsResponse struct {
	Posts      []models.PostResponse `json:"posts"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"total_pages"`
}

// SearchPosts handles POST search with filters
func (h *SearchHandler) SearchPosts(c *fiber.Ctx) error {
	var req SearchPostsRequest
	if err := c.QueryParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid query parameters",
		})
	}

	// Set defaults
	if req.Page < 1 {
		req.Page = 1
	}
	if req.Limit < 1 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}
	if req.SortBy == "" {
		req.SortBy = "date"
	}
	if req.SortOrder == "" {
		req.SortOrder = "desc"
	}

	// Get current user if authenticated
	var currentUserID *uuid.UUID
	userID := c.Locals("userID")
	if userID != nil {
		if uid, ok := userID.(uuid.UUID); ok {
			currentUserID = &uid
		}
	}

	// Build query
	query := h.db.DB.Model(&models.Post{}).
		Preload("User").
		Preload("Media")

	// Only show public posts or posts from followed users if not authenticated
	// If authenticated, show public posts + posts from followed users
	if currentUserID == nil {
		query = query.Where("visibility = ?", "public")
	} else {
		// Show public posts or posts from users the current user follows
		query = query.Where(
			h.db.DB.Where("visibility = ?", "public").
				Or(h.db.DB.Where("user_id IN (?)",
					h.db.DB.Model(&models.Follow{}).
						Select("following_id").
						Where("follower_id = ?", currentUserID),
				)),
		)
	}

	// Text search (full-text search on content)
	if req.Query != "" {
		searchTerm := "%" + strings.ToLower(req.Query) + "%"
		query = query.Where("LOWER(content) LIKE ? OR LOWER(content_html) LIKE ?", searchTerm, searchTerm)
	}

	// Author filter
	if req.Author != "" {
		query = query.Joins("JOIN users ON users.id = posts.user_id").
			Where("users.username = ?", req.Author)
	}

	// Category filter
	if req.Category != "" {
		query = query.Where("category = ?", req.Category)
	}

	// Tags filter (search in comma-separated tags string)
	if req.Tags != "" {
		tagsList := strings.Split(req.Tags, ",")
		for _, tag := range tagsList {
			tag = strings.TrimSpace(tag)
			if tag != "" {
				query = query.Where("tags LIKE ?", "%"+tag+"%")
			}
		}
	}

	// Date range filters
	if req.DateFrom != "" {
		dateFrom, err := time.Parse(time.RFC3339, req.DateFrom)
		if err == nil {
			query = query.Where("posts.created_at >= ?", dateFrom)
		}
	}
	if req.DateTo != "" {
		dateTo, err := time.Parse(time.RFC3339, req.DateTo)
		if err == nil {
			query = query.Where("posts.created_at <= ?", dateTo)
		}
	}

	// Access level filter
	if req.AccessLevel != "" {
		query = query.Where("access_level = ?", req.AccessLevel)
	}

	// Minimum likes filter
	if req.MinLikes > 0 {
		query = query.Where("likes_count >= ?", req.MinLikes)
	}

	// Minimum views filter
	if req.MinViews > 0 {
		query = query.Where("views_count >= ?", req.MinViews)
	}

	// Media filter
	if req.HasMedia == "true" {
		query = query.Where("EXISTS (SELECT 1 FROM media WHERE media.post_id = posts.id)")
	} else if req.HasMedia == "false" {
		query = query.Where("NOT EXISTS (SELECT 1 FROM media WHERE media.post_id = posts.id)")
	}

	// Media type filter
	if req.MediaType != "" && req.MediaType != "any" {
		query = query.Where("EXISTS (SELECT 1 FROM media WHERE media.post_id = posts.id AND media.media_type = ?)", req.MediaType)
	}

	// Count total results
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to count posts",
		})
	}

	// Apply sorting
	switch req.SortBy {
	case "likes":
		query = query.Order(fmt.Sprintf("likes_count %s", req.SortOrder))
	case "views":
		query = query.Order(fmt.Sprintf("views_count %s", req.SortOrder))
	case "relevance":
		// For relevance, prioritize posts with more engagement
		if req.SortOrder == "desc" {
			query = query.Order("(likes_count + retweets_count + replies_count) DESC")
		} else {
			query = query.Order("(likes_count + retweets_count + replies_count) ASC")
		}
	case "date":
		fallthrough
	default:
		query = query.Order(fmt.Sprintf("posts.created_at %s", req.SortOrder))
	}

	// Apply pagination
	offset := (req.Page - 1) * req.Limit
	query = query.Offset(offset).Limit(req.Limit)

	// Execute query
	var posts []models.Post
	if err := query.Find(&posts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch posts",
		})
	}

	// Convert to response format and check user interactions
	postResponses := make([]models.PostResponse, 0, len(posts))
	for _, post := range posts {
		postResp := models.PostResponse{
			ID:             post.ID,
			UserID:         post.UserID,
			Content:        post.Content,
			ContentWarning: post.ContentWarning,
			Visibility:     post.Visibility,
			IsPaid:         post.IsPaid,
			Price:          post.Price,
			ReplyToID:      post.ReplyToID,
			RootPostID:     post.RootPostID,
			LikesCount:     post.LikesCount,
			RetweetsCount:  post.RetweetsCount,
			RepliesCount:   post.RepliesCount,
			ViewsCount:     post.ViewsCount,
			Metadata:       post.Metadata,
			CreatedAt:      post.CreatedAt,
			UpdatedAt:      post.UpdatedAt,
			User:           post.User.ToPublic(),
			Media:          post.Media,
			IsLiked:        false,
			IsRetweeted:    false,
			IsBookmarked:   false,
		}

		// Check if current user has interacted with this post
		if currentUserID != nil {
			var likeCount int64
			h.db.DB.Model(&models.Like{}).
				Where("user_id = ? AND post_id = ?", currentUserID, post.ID).
				Count(&likeCount)
			postResp.IsLiked = likeCount > 0

			var retweetCount int64
			h.db.DB.Model(&models.Retweet{}).
				Where("user_id = ? AND post_id = ?", currentUserID, post.ID).
				Count(&retweetCount)
			postResp.IsRetweeted = retweetCount > 0

			var bookmarkCount int64
			h.db.DB.Model(&models.Bookmark{}).
				Where("user_id = ? AND post_id = ?", currentUserID, post.ID).
				Count(&bookmarkCount)
			postResp.IsBookmarked = bookmarkCount > 0
		}

		postResponses = append(postResponses, postResp)
	}

	// Calculate total pages
	totalPages := int(total) / req.Limit
	if int(total)%req.Limit > 0 {
		totalPages++
	}

	return c.JSON(SearchPostsResponse{
		Posts:      postResponses,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
		TotalPages: totalPages,
	})
}
