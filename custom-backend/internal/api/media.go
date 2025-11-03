package api

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"custom-backend/internal/database"
	"custom-backend/internal/models"
	"custom-backend/pkg/storage"
	"custom-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type MediaHandler struct {
	db           *database.Database
	s3Storage    *storage.S3Storage
	uploadDir    string // Kept for local temp processing
	maxFileSize  int64
	allowedTypes map[string]bool
	useS3        bool // Feature flag for gradual migration
}

func NewMediaHandler(db *database.Database) *MediaHandler {
	// Check if S3 should be used
	useS3 := os.Getenv("USE_S3_STORAGE") != "false" // Default to true

	var s3Storage *storage.S3Storage
	var err error

	if useS3 {
		s3Storage, err = storage.NewS3Storage()
		if err != nil {
			fmt.Printf("⚠️  Failed to initialize S3 storage: %v\n", err)
			fmt.Printf("⚠️  Falling back to local filesystem storage\n")
			useS3 = false
		} else {
			fmt.Printf("✅ Media storage: S3 + CloudFront enabled\n")
		}
	} else {
		fmt.Printf("📁 Media storage: Local filesystem (development mode)\n")
	}

	// Определяем путь хранения для временных файлов (даже при S3)
	uploadDir := os.Getenv("STORAGE_PATH")
	if uploadDir == "" {
		uploadDir = "./storage/media"
	} else {
		uploadDir = filepath.Join(uploadDir, "media")
	}

	// Создаем директорию для temp обработки
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		fmt.Printf("Warning: Failed to create temp directory %s: %v\n", uploadDir, err)
	}

	return &MediaHandler{
		db:          db,
		s3Storage:   s3Storage,
		uploadDir:   uploadDir,
		maxFileSize: 50 * 1024 * 1024, // 50MB (increased for videos)
		allowedTypes: map[string]bool{
			"image/jpeg": true,
			"image/jpg":  true,
			"image/png":  true,
			"image/gif":  true,
			"image/webp": true,
			"video/mp4":  true,
			"video/webm": true,
		},
		useS3: useS3,
	}
}

// UploadMedia загружает медиа файл с безопасной обработкой
// POST /api/media/upload
func (h *MediaHandler) UploadMedia(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	// Получаем файл из формы
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No file provided",
		})
	}

	// Проверка размера
	if file.Size > h.maxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("File too large. Max size: %dMB", h.maxFileSize/(1024*1024)),
		})
	}

	// Открываем файл для проверки MIME типа
	fileHeader, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to open file",
		})
	}
	defer fileHeader.Close()

	// Определяем реальный MIME тип по содержимому (magic bytes)
	mimeType, err := utils.DetectMIMEType(fileHeader)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to detect file type",
		})
	}

	// Проверяем что MIME тип разрешён
	mediaType, ok := utils.ValidateMIMEType(mimeType)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File type not allowed. Allowed: jpg, png, gif, webp, mp4, webm",
		})
	}

	// Генерируем безопасное имя файла
	ext := filepath.Ext(file.Filename)

	// Fallback: если расширение пустое, определяем по MIME типу
	if ext == "" {
		switch mimeType {
		case "image/jpeg", "image/jpg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/gif":
			ext = ".gif"
		case "image/webp":
			ext = ".webp"
		case "video/mp4":
			ext = ".mp4"
		case "video/webm":
			ext = ".webm"
		default:
			ext = ".jpg" // Default fallback
		}
	}

	safeFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	tempPath := filepath.Join(h.uploadDir, "temp_"+safeFilename)

	// Сохраняем временный файл для обработки
	fmt.Printf("Saving temp file to: %s\n", tempPath)
	if err := c.SaveFile(file, tempPath); err != nil {
		fmt.Printf("Error saving temp file: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save file",
		})
	}
	defer os.Remove(tempPath) // Удалим temp файл в любом случае

	// Обрабатываем медиа в зависимости от типа
	var processedPath string
	var width, height int
	var thumbnailURL string
	var thumbnailKey string

	if mediaType == utils.MediaTypeImage || mediaType == utils.MediaTypeGIF {
		// Re-encode изображения для удаления EXIF и безопасности
		processedPath = filepath.Join(h.uploadDir, safeFilename)
		err = utils.ReencodeImage(tempPath, processedPath, 4096, 4096)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to process image: " + err.Error(),
			})
		}
		// НЕ удаляем processedPath для локального хранилища - он становится finalPath

		// Получаем размеры
		width, height, err = utils.GetImageDimensions(processedPath)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to get image dimensions",
			})
		}

		// Создаём thumbnail
		thumbnailFilename := "thumb_" + safeFilename
		thumbnailPath := filepath.Join(h.uploadDir, thumbnailFilename)
		if err := utils.GenerateThumbnail(processedPath, thumbnailPath, 400, 400); err == nil {
			defer os.Remove(thumbnailPath) // Удалим после загрузки
			thumbnailKey = "media/thumbnails/" + thumbnailFilename
		}
	} else {
		// Для видео используем temp файл напрямую
		processedPath = tempPath
	}

	// Вычисляем хеш для обнаружения дубликатов (только для изображений)
	var imageHash string
	if mediaType == utils.MediaTypeImage || mediaType == utils.MediaTypeGIF {
		imageHash, _ = utils.CalculateImageHash(processedPath)
	}

	// Загружаем в S3 или сохраняем локально
	var fileURL string
	var s3Key string

	if h.useS3 && h.s3Storage != nil {
		// S3 Upload Path
		ctx := context.Background()
		s3Key = fmt.Sprintf("media/%s", safeFilename)

		// Открываем обработанный файл для загрузки в S3
		processedFile, err := os.Open(processedPath)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to read processed file",
			})
		}
		defer processedFile.Close()

		// Загружаем основной файл в S3
		fileURL, err = h.s3Storage.UploadFile(ctx, s3Key, processedFile, mimeType)
		if err != nil {
			fmt.Printf("Error uploading to S3: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to upload to S3",
			})
		}

		// Загружаем thumbnail в S3 (если существует)
		if thumbnailKey != "" {
			thumbnailPath := filepath.Join(h.uploadDir, "thumb_"+safeFilename)
			thumbFile, err := os.Open(thumbnailPath)
			if err == nil {
				defer thumbFile.Close()
				thumbnailURL, err = h.s3Storage.UploadFile(ctx, thumbnailKey, thumbFile, "image/jpeg")
				if err != nil {
					fmt.Printf("Warning: Failed to upload thumbnail: %v\n", err)
					thumbnailURL = "" // Не критично, просто не будет thumbnail
				}
			}
		}

		fmt.Printf("✅ File uploaded to S3: %s\n", fileURL)

		// Удаляем локальный processedPath только для S3
		if processedPath != "" {
			os.Remove(processedPath)
		}
	} else {
		// Local Filesystem Path (fallback)
		// processedPath уже находится в правильном месте с правильным именем
		// НЕ нужно делать rename, файл уже там где нужно

		baseURL := os.Getenv("BASE_URL")
		if baseURL == "" {
			baseURL = "http://localhost:8080"
		}

		fileURL = fmt.Sprintf("%s/storage/media/%s", baseURL, safeFilename)

		if thumbnailKey != "" {
			thumbnailURL = fmt.Sprintf("%s/storage/media/thumb_%s", baseURL, safeFilename)
		}

		fmt.Printf("📁 File saved locally: %s\n", fileURL)
	}

	// Опциональный alt text
	altText := c.FormValue("alt_text", "")

	// Создаем запись в БД со статусом "ready"
	media := models.Media{
		ID:           uuid.New(),
		UserID:       userID,
		Type:         string(mediaType),
		URL:          fileURL,
		ThumbnailURL: thumbnailURL,
		AltText:      altText,
		Width:        width,
		Height:       height,
		SizeBytes:    file.Size,
		Status:       "ready",
		ProcessedAt:  time.Now(),
		OriginalHash: imageHash,
		CreatedAt:    time.Now(),
	}

	if err := h.db.DB.Create(&media).Error; err != nil {
		// Если не удалось сохранить в БД, нужно удалить файл из S3
		if h.useS3 && h.s3Storage != nil && s3Key != "" {
			ctx := context.Background()
			h.s3Storage.DeleteFile(ctx, s3Key)
			if thumbnailKey != "" {
				h.s3Storage.DeleteFile(ctx, thumbnailKey)
			}
		}
		fmt.Printf("Error saving media record: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save media record",
		})
	}

	fmt.Printf("✅ Media saved successfully: ID=%s, URL=%s\n", media.ID, media.URL)

	return c.Status(fiber.StatusCreated).JSON(media)
}

// GetMedia получает информацию о медиа файле
// GET /api/media/:id
func (h *MediaHandler) GetMedia(c *fiber.Ctx) error {
	mediaID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid media ID",
		})
	}

	var media models.Media
	if err := h.db.DB.First(&media, mediaID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Media not found",
		})
	}

	return c.JSON(media)
}

// DeleteMedia удаляет медиа файл
// DELETE /api/media/:id
func (h *MediaHandler) DeleteMedia(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	mediaID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid media ID",
		})
	}

	// Находим медиа
	var media models.Media
	if err := h.db.DB.First(&media, mediaID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Media not found",
		})
	}

	// Проверяем права доступа
	if media.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to delete this media",
		})
	}

	// Проверяем, не используется ли в посте
	if media.PostID != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot delete media attached to a post",
		})
	}

	// Удаляем файл из S3 или локальной ФС
	if h.useS3 && h.s3Storage != nil {
		// Extract S3 key from CloudFront URL
		// URL format: https://d1xltpuqw8istm.cloudfront.net/media/uuid.jpg
		s3Key := strings.TrimPrefix(media.URL, "https://"+os.Getenv("CLOUDFRONT_DOMAIN")+"/")

		ctx := context.Background()
		if err := h.s3Storage.DeleteFile(ctx, s3Key); err != nil {
			fmt.Printf("Warning: Failed to delete from S3: %v\n", err)
			// Не критично, продолжаем удаление из БД
		}

		// Удаляем thumbnail если есть
		if media.ThumbnailURL != "" {
			thumbKey := strings.TrimPrefix(media.ThumbnailURL, "https://"+os.Getenv("CLOUDFRONT_DOMAIN")+"/")
			h.s3Storage.DeleteFile(ctx, thumbKey)
		}
	} else {
		// Локальное удаление
		filename := filepath.Base(media.URL)
		filePath := filepath.Join(h.uploadDir, filename)
		os.Remove(filePath)

		// Удаляем thumbnail
		if media.ThumbnailURL != "" {
			thumbFilename := filepath.Base(media.ThumbnailURL)
			thumbPath := filepath.Join(h.uploadDir, thumbFilename)
			os.Remove(thumbPath)
		}
	}

	// Удаляем запись из БД
	if err := h.db.DB.Delete(&media).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete media",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Media deleted successfully",
	})
}

// GetUserMedia возвращает медиа файлы пользователя
// GET /api/media/user/:id?limit=20&offset=0
func (h *MediaHandler) GetUserMedia(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Параметры пагинации
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	if limit > 100 {
		limit = 100
	}

	var media []models.Media
	var total int64

	query := h.db.DB.Model(&models.Media{}).Where("user_id = ?", userID)
	query.Count(&total)

	if err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&media).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch media",
		})
	}

	return c.JSON(fiber.Map{
		"media":  media,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// StreamMedia отдаёт защищённое медиа по HMAC-токену
// GET /api/media/stream/:id?token=xxx
func (h *MediaHandler) StreamMedia(c *fiber.Ctx) error {
	mediaID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid media ID",
		})
	}

	// Получаем токен из query параметра
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Access token required",
		})
	}

	// Валидируем токен
	tokenMediaID, tokenUserID, valid, err := utils.ValidateMediaToken(token)
	if !valid || err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Invalid or expired token: " + err.Error(),
		})
	}

	// Проверяем что токен для этого медиа
	if tokenMediaID != mediaID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Token is not valid for this media",
		})
	}

	// Получаем медиа из БД
	var media models.Media
	if err := h.db.DB.First(&media, mediaID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Media not found",
		})
	}

	// Проверяем статус медиа
	if media.Status != "ready" {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Media is not ready",
		})
	}

	// Если медиа принадлежит премиум посту, проверяем права доступа
	if media.PostID != nil {
		var post models.Post
		if err := h.db.DB.First(&post, media.PostID).Error; err == nil {
			if post.IsPremium {
				// Проверяем что пользователь имеет доступ
				hasAccess := h.checkPremiumAccess(tokenUserID, post)
				if !hasAccess {
					return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
						"error": "Premium content access required",
					})
				}
			}
		}
	}

	// Если используется S3, генерируем presigned URL и редиректим
	if h.useS3 && h.s3Storage != nil {
		// Extract S3 key from CloudFront URL
		s3Key := strings.TrimPrefix(media.URL, "https://"+os.Getenv("CLOUDFRONT_DOMAIN")+"/")

		ctx := context.Background()
		// Генерируем presigned URL на 1 час
		presignedURL, err := h.s3Storage.GetPresignedURL(ctx, s3Key, 1*time.Hour)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to generate presigned URL",
			})
		}

		// Редирект на presigned URL
		return c.Redirect(presignedURL, fiber.StatusTemporaryRedirect)
	}

	// Локальная файловая система (fallback)
	filename := filepath.Base(media.URL)
	filePath := filepath.Join(h.uploadDir, filename)

	// Проверяем существование файла
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Media file not found",
		})
	}

	// Определяем Content-Type
	contentType := "application/octet-stream"
	switch media.Type {
	case "image":
		contentType = "image/jpeg"
	case "video":
		contentType = "video/mp4"
	case "gif":
		contentType = "image/gif"
	}

	// Устанавливаем заголовки для безопасности
	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", filename))
	c.Set("X-Content-Type-Options", "nosniff")
	c.Set("Cache-Control", "private, max-age=3600")

	// Отправляем файл
	return c.SendFile(filePath)
}

// checkPremiumAccess проверяет доступ пользователя к премиум контенту
func (h *MediaHandler) checkPremiumAccess(userID uuid.UUID, post models.Post) bool {
	// 1. Если пользователь - автор, доступ разрешён
	if post.UserID == userID {
		return true
	}

	// 2. Проверяем подписку
	var subscription models.Subscription
	err := h.db.DB.Where(
		"subscriber_id = ? AND author_id = ? AND status = 'active'",
		userID, post.UserID,
	).First(&subscription).Error
	if err == nil {
		return true
	}

	// 3. Проверяем разовую покупку
	var purchase models.Purchase
	err = h.db.DB.Where(
		"buyer_id = ? AND post_id = ?",
		userID, post.ID,
	).First(&purchase).Error
	if err == nil {
		return true
	}

	return false
}
