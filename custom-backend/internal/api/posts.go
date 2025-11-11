package api

import (
	"encoding/json"
	"fmt"
	"image"
	"image/draw"
	_ "image/gif"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"time"

	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostsHandler struct {
	db *database.Database
}

func NewPostsHandler(db *database.Database) *PostsHandler {
	return &PostsHandler{
		db: db,
	}
}

// CropRectReq represents crop rectangle from frontend
type CropRectReq struct {
	X    int `json:"x"`
	Y    int `json:"y"`
	W    int `json:"w"`
	H    int `json:"h"`
	SrcW int `json:"src_w"`
	SrcH int `json:"src_h"`
}

// CreatePostRequest - запрос на создание поста
type CreatePostRequest struct {
	Content    string                 `json:"content" validate:"required,min=1,max=5000"`
	Metadata   map[string]interface{} `json:"metadata"`
	MediaIDs   []string               `json:"mediaIds"`
	ReplyToID  *string                `json:"replyToId"`  // ID поста, на который отвечаем
	Visibility string                 `json:"visibility"` // public, followers, private

	// Premium Content (Phase 2)
	IsPremium   bool   `json:"isPremium"`   // Is this premium content
	PriceCents  int    `json:"priceCents"`  // Price in cents
	PreviewText string `json:"previewText"` // Preview for non-subscribers
	Category    string `json:"category"`    // Content category
	Tags        string `json:"tags"`        // Comma-separated tags

	// Access Control (Phase 3)
	AccessLevel string `json:"accessLevel"` // free, pay-per-post, subscribers-only, followers-only, premium
	ReplyPolicy string `json:"replyPolicy"` // everyone, following, verified, mentioned

	// Media Transforms (Phase 2: Edit functionality)
	MediaTransforms map[string]CropRectReq `json:"mediaTransforms"` // mediaID -> crop rect
}

// CreatePost создает новый пост с санитизацией контента и транзакциями
func (h *PostsHandler) CreatePost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req CreatePostRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// DEBUG: Логируем входящий запрос
	fmt.Printf("[CreatePost DEBUG] Request received:\n")
	fmt.Printf("  Content: %s\n", req.Content)
	fmt.Printf("  Metadata: %+v\n", req.Metadata)
	if codeBlocks, ok := req.Metadata["code_blocks"]; ok {
		fmt.Printf("  Code blocks found: %+v\n", codeBlocks)
	}

	// Санитизация контента
	sanitizedContent := utils.SanitizeUserInput(req.Content)
	if len(sanitizedContent) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Content is required",
		})
	}

	// Генерируем безопасный HTML из контента
	contentHTML := utils.SanitizeHTML(sanitizedContent)

	// Определяем видимость (по умолчанию public)
	visibility := "public"
	if req.Visibility != "" {
		visibility = req.Visibility
	}

	// Создаем пост с транзакцией
	var fullPost models.Post
	err := h.db.DB.Transaction(func(tx *gorm.DB) error {
		// Определяем access_level (по умолчанию free)
		accessLevel := "free"
		if req.AccessLevel != "" {
			accessLevel = req.AccessLevel
		}

		// Преобразуем "paid" в "pay-per-post" для совместимости с БД
		// ВАЖНО: Делаем это ДО создания структуры post
		if accessLevel == "paid" || accessLevel == "pay-per-view" {
			accessLevel = "pay-per-post"
		}

		// Определяем reply_policy (по умолчанию everyone)
		replyPolicy := "everyone"
		if req.ReplyPolicy != "" {
			replyPolicy = req.ReplyPolicy
		}

		// Создаем пост
		post := models.Post{
			ID:          uuid.New(),
			UserID:      userID,
			Content:     sanitizedContent,
			ContentHTML: contentHTML,
			Metadata:    req.Metadata,
			Visibility:  visibility,
			IsPremium:   req.IsPremium,
			PriceCents:  req.PriceCents,
			PreviewText: req.PreviewText,
			Category:    req.Category,
			Tags:        req.Tags,
			AccessLevel: accessLevel,
			ReplyPolicy: replyPolicy,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// Валидация access_level ПОСЛЕ преобразования
		validAccessLevels := map[string]bool{
			"free":             true,
			"pay-per-post":     true,
			"subscribers-only": true,
			"followers-only":   true,
			"premium":          true,
		}

		if !validAccessLevels[post.AccessLevel] {
			return fmt.Errorf("invalid access_level: %s (original: %s)", post.AccessLevel, accessLevel)
		}

		// Валидация reply_policy
		validReplyPolicies := map[string]bool{
			"everyone":  true,
			"following": true,
			"verified":  true,
			"mentioned": true,
		}
		if !validReplyPolicies[post.ReplyPolicy] {
			return fmt.Errorf("invalid reply_policy: %s", post.ReplyPolicy)
		}

		// Валидация для pay-per-post
		if post.AccessLevel == "pay-per-post" {
			if post.PriceCents <= 0 {
				return fmt.Errorf("pay-per-post requires a price greater than 0")
			}
		}

		// Валидация премиум контента (legacy)
		if post.IsPremium {
			if post.PriceCents <= 0 {
				return fmt.Errorf("premium content requires a price")
			}
			if post.PreviewText == "" {
				// Генерируем preview из первых 100 символов
				post.PreviewText = utils.ExtractPreview(contentHTML, 100)
			}
		}

		// Если это ответ на другой пост
		if req.ReplyToID != nil && *req.ReplyToID != "" {
			fmt.Printf("[CreatePost DEBUG] Processing reply to post: %s\n", *req.ReplyToID)

			replyToID, err := uuid.Parse(*req.ReplyToID)
			if err != nil {
				fmt.Printf("[CreatePost ERROR] Invalid reply_to_id format: %v\n", err)
				return fmt.Errorf("invalid reply_to_id format: %w", err)
			}

			post.ReplyToID = &replyToID

			// Проверяем существование родительского поста
			var parentPost models.Post
			if err := tx.First(&parentPost, replyToID).Error; err != nil {
				fmt.Printf("[CreatePost ERROR] Parent post not found: %v\n", err)
				return fmt.Errorf("parent post not found")
			}

			fmt.Printf("[CreatePost DEBUG] Parent post found: %s (author: %s)\n", parentPost.ID, parentPost.UserID)
			fmt.Printf("[CreatePost DEBUG] Current user: %s\n", userID)

			// Обновляем счетчик ответов у родительского поста
			if err := tx.Model(&models.Post{}).Where("id = ?", replyToID).Update("replies_count", gorm.Expr("replies_count + 1")).Error; err != nil {
				fmt.Printf("[CreatePost ERROR] Failed to update replies_count: %v\n", err)
				return err
			}

			// Создаем уведомление для автора родительского поста (если это не сам автор)
			if parentPost.UserID != userID {
				notification := models.Notification{
					ID:         uuid.New(),
					UserID:     parentPost.UserID,
					FromUserID: &userID,
					Type:       "reply",
					PostID:     &post.ID,
					Read:       false,
					CreatedAt:  time.Now(),
				}
				if err := tx.Create(&notification).Error; err != nil {
					fmt.Printf("[CreatePost ERROR] Failed to create reply notification: %v\n", err)
					return err
				}
				fmt.Printf("[CreatePost DEBUG] Reply notification created for user %s\n", parentPost.UserID)
			}
		}

		// DEBUG: Логируем metadata перед сохранением
		fmt.Printf("[CreatePost DEBUG] Saving post with metadata: %+v\n", post.Metadata)

		// Создаем пост
		if err := tx.Create(&post).Error; err != nil {
			return err
		}

		// DEBUG: Логируем сохраненный пост
		fmt.Printf("[CreatePost DEBUG] Post saved with ID: %s\n", post.ID)
		fmt.Printf("[CreatePost DEBUG] Metadata after save: %+v\n", post.Metadata)

		// Если есть media IDs, связываем их с постом
		if len(req.MediaIDs) > 0 {
			for _, mediaIDStr := range req.MediaIDs {
				mediaID, err := uuid.Parse(mediaIDStr)
				if err != nil {
					continue
				}

				// Проверяем что медиа принадлежит пользователю и имеет статус "ready"
				var media models.Media
				if err := tx.Where("id = ? AND user_id = ? AND status = ?", mediaID, userID, "ready").First(&media).Error; err != nil {
					continue // Пропускаем невалидные медиа
				}

				// Обновляем post_id для медиа
				if err := tx.Model(&models.Media{}).Where("id = ?", mediaID).Update("post_id", post.ID).Error; err != nil {
					return err
				}

				// Применяем crop если передан transform для этого медиа
				if cropRect, hasCrop := req.MediaTransforms[mediaIDStr]; hasCrop && media.Type == "image" {
					if err := h.applyCropToMedia(tx, &media, cropRect); err != nil {
						// Логируем ошибку но не прерываем создание поста
						fmt.Printf("Failed to apply crop to media %s: %v\n", mediaID, err)
					}
				}
			}
		}

		// Загружаем полную информацию о посте с автором и медиа
		if err := tx.Preload("User").Preload("Media").First(&fullPost, post.ID).Error; err != nil {
			return err
		}

		// DEBUG: Логируем финальный пост
		fmt.Printf("[CreatePost DEBUG] Final post metadata: %+v\n", fullPost.Metadata)

		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create post: " + err.Error(),
		})
	}

	// Конвертируем в DTO для чистой JSON сериализации
	dto := toPostDTO(fullPost)

	// 🔍 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ПЕРЕД ОТПРАВКОЙ ОТВЕТА
	fmt.Printf("\n========== [CreatePost] ФИНАЛЬНЫЙ ОТВЕТ (DTO) ==========\n")
	fmt.Printf("Post ID: %s\n", dto.ID)
	fmt.Printf("DTO.AccessLevel: %s\n", dto.AccessLevel)
	fmt.Printf("DTO.PriceCents: %d\n", dto.PriceCents)
	fmt.Printf("DTO.ReplyPolicy: %s\n", dto.ReplyPolicy)

	// Сериализуем DTO в JSON чтобы увидеть что отправится клиенту
	jsonBytes, _ := json.Marshal(dto)
	fmt.Printf("\nDTO JSON который будет отправлен клиенту:\n%s\n", string(jsonBytes))
	fmt.Printf("========================================================\n\n")

	return c.Status(fiber.StatusCreated).JSON(dto)
}

// GetPost получает пост по ID
func (h *PostsHandler) GetPost(c *fiber.Ctx) error {
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	var post models.Post
	if err := h.db.DB.
		Preload("User").
		Preload("Media").
		First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch post",
		})
	}

	// Добавляем информацию о лайках текущего пользователя (если авторизован)
	if userID, ok := c.Locals("userID").(uuid.UUID); ok {
		var like models.Like
		err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, post.ID).First(&like).Error
		post.IsLiked = (err == nil)

		var retweet models.Retweet
		err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, post.ID).First(&retweet).Error
		post.IsRetweeted = (err == nil)

		var bookmark models.Bookmark
		err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, post.ID).First(&bookmark).Error
		post.IsBookmarked = (err == nil)
	}

	// Конвертируем в DTO
	dto := toPostDTO(post)
	return c.JSON(dto)
}

// DeletePost удаляет пост
func (h *PostsHandler) DeletePost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Проверяем, что пост существует
	var post models.Post
	if err := h.db.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch post",
		})
	}

	// Получаем информацию о пользователе для проверки роли
	var user models.User
	if err := h.db.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch user",
		})
	}

	// Разрешаем удаление если пользователь является админом ИЛИ владельцем поста
	if user.Role != "admin" && post.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this post",
		})
	}

	// Удаляем пост (каскадное удаление связей настроено в модели)
	if err := h.db.DB.Delete(&post).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete post",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Post deleted successfully",
	})
}

// LikePost добавляет лайк посту
func (h *PostsHandler) LikePost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Проверяем существование поста
	var post models.Post
	if err := h.db.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch post",
		})
	}

	// Проверяем, не лайкнул ли уже
	var existingLike models.Like
	err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&existingLike).Error
	if err == nil {
		// Лайк уже существует, возвращаем успех (идемпотентность)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Post already liked",
			"success": true,
		})
	}

	// Создаем лайк
	like := models.Like{
		ID:        uuid.New(),
		UserID:    userID,
		PostID:    postID,
		CreatedAt: time.Now(),
	}

	if err := h.db.DB.Create(&like).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to like post",
		})
	}

	// Обновляем счетчик лайков
	h.db.DB.Model(&post).Update("likes_count", gorm.Expr("likes_count + 1"))

	// Создаем уведомление для автора поста (если это не сам автор)
	if post.UserID != userID {
		notification := models.Notification{
			ID:         uuid.New(),
			UserID:     post.UserID,
			FromUserID: &userID,
			Type:       "like",
			PostID:     &postID,
			Read:       false,
			CreatedAt:  time.Now(),
		}
		if err := h.db.DB.Create(&notification).Error; err != nil {
			// Логируем ошибку, но не прерываем операцию лайка
			fmt.Printf("Failed to create like notification: %v\n", err)
		} else {
			fmt.Printf("Like notification created successfully for post %s\n", postID)
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Post liked successfully",
	})
}

// UnlikePost убирает лайк с поста
func (h *PostsHandler) UnlikePost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Находим лайк
	var like models.Like
	if err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&like).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Like not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find like",
		})
	}

	// Удаляем лайк
	if err := h.db.DB.Delete(&like).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to unlike post",
		})
	}

	// Обновляем счетчик лайков
	h.db.DB.Model(&models.Post{}).Where("id = ?", postID).Update("likes_count", gorm.Expr("likes_count - 1"))

	// Удаляем уведомление о лайке (если оно существует)
	h.db.DB.Where("from_user_id = ? AND post_id = ? AND type = ?", userID, postID, "like").Delete(&models.Notification{})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Post unliked successfully",
	})
}

// RetweetPost создает ретвит поста
func (h *PostsHandler) RetweetPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Проверяем существование поста
	var post models.Post
	if err := h.db.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch post",
		})
	}

	// Проверяем, не ретвитнул ли уже
	var existingRetweet models.Retweet
	err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&existingRetweet).Error
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Post already retweeted",
		})
	}

	// Создаем ретвит
	retweet := models.Retweet{
		ID:        uuid.New(),
		UserID:    userID,
		PostID:    postID,
		CreatedAt: time.Now(),
	}

	if err := h.db.DB.Create(&retweet).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retweet post",
		})
	}

	// Обновляем счетчик ретвитов
	h.db.DB.Model(&post).Update("retweets_count", gorm.Expr("retweets_count + 1"))

	// Создаем уведомление для автора поста (если это не сам автор)
	if post.UserID != userID {
		notification := models.Notification{
			ID:         uuid.New(),
			UserID:     post.UserID,
			FromUserID: &userID,
			Type:       "retweet",
			PostID:     &postID,
			Read:       false,
			CreatedAt:  time.Now(),
		}
		h.db.DB.Create(&notification)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Post retweeted successfully",
	})
}

// UnretweetPost убирает ретвит поста
func (h *PostsHandler) UnretweetPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Находим ретвит
	var retweet models.Retweet
	if err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&retweet).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Retweet not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find retweet",
		})
	}

	// Удаляем ретвит
	if err := h.db.DB.Delete(&retweet).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to unretweet post",
		})
	}

	// Обновляем счетчик ретвитов
	h.db.DB.Model(&models.Post{}).Where("id = ?", postID).Update("retweets_count", gorm.Expr("retweets_count - 1"))

	// Удаляем уведомление о ретвите (если оно существует)
	h.db.DB.Where("from_user_id = ? AND post_id = ? AND type = ?", userID, postID, "retweet").Delete(&models.Notification{})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Post unretweeted successfully",
	})
}

// BookmarkPost добавляет пост в закладки
func (h *PostsHandler) BookmarkPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Проверяем существование поста
	var post models.Post
	if err := h.db.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch post",
		})
	}

	// Проверяем, не добавлен ли уже в закладки
	var existingBookmark models.Bookmark
	err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&existingBookmark).Error
	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Post already bookmarked",
		})
	}

	// Создаем закладку
	bookmark := models.Bookmark{
		ID:        uuid.New(),
		UserID:    userID,
		PostID:    postID,
		CreatedAt: time.Now(),
	}

	if err := h.db.DB.Create(&bookmark).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to bookmark post",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Post bookmarked successfully",
	})
}

// UnbookmarkPost убирает пост из закладок
func (h *PostsHandler) UnbookmarkPost(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Находим закладку
	var bookmark models.Bookmark
	if err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Bookmark not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find bookmark",
		})
	}

	// Удаляем закладку
	if err := h.db.DB.Delete(&bookmark).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to unbookmark post",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Post unbookmarked successfully",
	})
}

// GetUserBookmarks возвращает закладки пользователя
func (h *PostsHandler) GetUserBookmarks(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var bookmarks []models.Bookmark
	if err := h.db.DB.
		Preload("Post.User").
		Preload("Post.Media").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&bookmarks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch bookmarks",
		})
	}

	// Извлекаем посты из закладок
	posts := make([]models.Post, len(bookmarks))
	for i, bookmark := range bookmarks {
		posts[i] = bookmark.Post
	}

	return c.JSON(fiber.Map{
		"posts": posts,
		"total": len(posts),
	})
}

// GetPostReplies возвращает комментарии (replies) к посту, включая вложенные ответы
func (h *PostsHandler) GetPostReplies(c *fiber.Ctx) error {
	postID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid post ID",
		})
	}

	// Проверяем существование поста
	var post models.Post
	if err := h.db.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Post not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch post",
		})
	}

	// Получаем ВСЕ посты которые являются частью этой ветки
	// (прямые ответы на пост + ответы на комментарии)
	var allReplies []models.Post

	// Сначала получаем ID всех прямых ответов на пост
	var directReplyIDs []uuid.UUID
	h.db.DB.Model(&models.Post{}).
		Where("reply_to_id = ?", postID).
		Pluck("id", &directReplyIDs)

	// Затем получаем ID всех вложенных ответов (ответы на ответы)
	var allReplyIDs []uuid.UUID
	allReplyIDs = append(allReplyIDs, directReplyIDs...)

	// Рекурсивно находим все вложенные ответы
	for len(directReplyIDs) > 0 {
		var nestedIDs []uuid.UUID
		h.db.DB.Model(&models.Post{}).
			Where("reply_to_id IN ?", directReplyIDs).
			Pluck("id", &nestedIDs)

		if len(nestedIDs) == 0 {
			break
		}

		allReplyIDs = append(allReplyIDs, nestedIDs...)
		directReplyIDs = nestedIDs
	}

	// Теперь получаем все эти посты с полной информацией
	if len(allReplyIDs) > 0 {
		if err := h.db.DB.
			Preload("User").
			Preload("Media").
			Where("id IN ?", allReplyIDs).
			Order("created_at ASC").
			Find(&allReplies).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to fetch replies",
			})
		}
	}

	// Добавляем информацию о том, лайкнул ли текущий пользователь каждый ответ
	userID, ok := c.Locals("userID").(uuid.UUID)
	if ok {
		for i := range allReplies {
			var like models.Like
			err := h.db.DB.Where("user_id = ? AND post_id = ?", userID, allReplies[i].ID).First(&like).Error
			allReplies[i].IsLiked = (err == nil)

			var retweet models.Retweet
			err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, allReplies[i].ID).First(&retweet).Error
			allReplies[i].IsRetweeted = (err == nil)

			var bookmark models.Bookmark
			err = h.db.DB.Where("user_id = ? AND post_id = ?", userID, allReplies[i].ID).First(&bookmark).Error
			allReplies[i].IsBookmarked = (err == nil)
		}
	}

	// Конвертируем в DTO
	dtos := toPostDTOList(allReplies)
	return c.JSON(dtos)
}

// applyCropToMedia применяет crop к изображению на сервере
func (h *PostsHandler) applyCropToMedia(tx *gorm.DB, media *models.Media, cropRect CropRectReq) error {
	// Получаем путь к оригинальному файлу
	uploadDir := "./storage/media"
	filename := filepath.Base(media.URL)
	originalPath := filepath.Join(uploadDir, filename)

	// Открываем оригинальное изображение
	file, err := os.Open(originalPath)
	if err != nil {
		return fmt.Errorf("failed to open original image: %w", err)
	}
	defer file.Close()

	// Декодируем изображение
	img, format, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	// Получаем размеры оригинального изображения
	bounds := img.Bounds()
	srcW := bounds.Dx()
	srcH := bounds.Dy()

	// Валидируем и обрезаем координаты crop по границам изображения
	x := cropRect.X
	y := cropRect.Y
	w := cropRect.W
	cropH := cropRect.H

	if x < 0 {
		x = 0
	}
	if y < 0 {
		y = 0
	}
	if x+w > srcW {
		w = srcW - x
	}
	if y+cropH > srcH {
		cropH = srcH - y
	}

	if w <= 0 || cropH <= 0 {
		return fmt.Errorf("invalid crop dimensions")
	}

	// Создаем новое изображение с размерами crop
	croppedImg := image.NewRGBA(image.Rect(0, 0, w, cropH))

	// Копируем crop область в новое изображение
	draw.Draw(croppedImg, croppedImg.Bounds(), img, image.Point{X: x, Y: y}, draw.Src)

	// Генерируем имя для cropped файла
	ext := filepath.Ext(filename)
	nameWithoutExt := strings.TrimSuffix(filename, ext)
	croppedFilename := nameWithoutExt + ".crop" + ext
	croppedPath := filepath.Join(uploadDir, croppedFilename)

	// Создаем cropped файл
	outFile, err := os.Create(croppedPath)
	if err != nil {
		return fmt.Errorf("failed to create cropped file: %w", err)
	}
	defer outFile.Close()

	// Кодируем cropped изображение в зависимости от формата
	switch strings.ToLower(format) {
	case "jpeg", "jpg":
		err = jpeg.Encode(outFile, croppedImg, &jpeg.Options{Quality: 90})
	case "png":
		err = png.Encode(outFile, croppedImg)
	default:
		return fmt.Errorf("unsupported image format: %s", format)
	}

	if err != nil {
		os.Remove(croppedPath)
		return fmt.Errorf("failed to encode cropped image: %w", err)
	}

	// Получаем размер cropped файла
	fileInfo, err := os.Stat(croppedPath)
	if err != nil {
		return fmt.Errorf("failed to stat cropped file: %w", err)
	}

	// Обновляем запись в БД
	croppedURL := fmt.Sprintf("/storage/media/%s", croppedFilename)
	updates := map[string]interface{}{
		"url":          croppedURL,
		"original_url": media.URL,
		"width":        w,
		"height":       cropH,
		"size_bytes":   fileInfo.Size(),
	}

	if err := tx.Model(media).Updates(updates).Error; err != nil {
		os.Remove(croppedPath)
		return fmt.Errorf("failed to update media record: %w", err)
	}

	return nil
}
