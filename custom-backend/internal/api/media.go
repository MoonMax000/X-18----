package api

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/internal/models"
	"github.com/yourusername/x18-backend/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type MediaHandler struct {
	db           *database.Database
	uploadDir    string
	maxFileSize  int64
	allowedTypes map[string]bool
}

func NewMediaHandler(db *database.Database) *MediaHandler {
	// Создаем директорию для загрузок если не существует
	uploadDir := "./storage/media"
	os.MkdirAll(uploadDir, 0755)

	return &MediaHandler{
		db:          db,
		uploadDir:   uploadDir,
		maxFileSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: map[string]bool{
			"image/jpeg": true,
			"image/jpg":  true,
			"image/png":  true,
			"image/gif":  true,
			"image/webp": true,
			"video/mp4":  true,
			"video/webm": true,
		},
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
	safeFilename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	tempPath := filepath.Join(h.uploadDir, "temp_"+safeFilename)
	finalPath := filepath.Join(h.uploadDir, safeFilename)

	// Сохраняем временный файл
	if err := c.SaveFile(file, tempPath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save file",
		})
	}

	// Обрабатываем медиа в зависимости от типа
	var processedPath string
	var width, height int
	var thumbnailURL string

	if mediaType == utils.MediaTypeImage || mediaType == utils.MediaTypeGIF {
		// Re-encode изображения для удаления EXIF и безопасности
		processedPath = finalPath
		err = utils.ReencodeImage(tempPath, processedPath, 4096, 4096)
		if err != nil {
			os.Remove(tempPath)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to process image: " + err.Error(),
			})
		}

		// Получаем размеры
		width, height, err = utils.GetImageDimensions(processedPath)
		if err != nil {
			os.Remove(tempPath)
			os.Remove(processedPath)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to get image dimensions",
			})
		}

		// Создаём thumbnail
		thumbnailFilename := "thumb_" + safeFilename
		thumbnailPath := filepath.Join(h.uploadDir, thumbnailFilename)
		if err := utils.GenerateThumbnail(processedPath, thumbnailPath, 400, 400); err == nil {
			thumbnailURL = fmt.Sprintf("/storage/media/%s", thumbnailFilename)
		}

		// Удаляем временный файл
		os.Remove(tempPath)
	} else {
		// Для видео просто перемещаем файл
		processedPath = finalPath
		if err := os.Rename(tempPath, processedPath); err != nil {
			os.Remove(tempPath)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process video",
			})
		}
	}

	// Вычисляем хеш для обнаружения дубликатов (только для изображений)
	var imageHash string
	if mediaType == utils.MediaTypeImage || mediaType == utils.MediaTypeGIF {
		imageHash, _ = utils.CalculateImageHash(processedPath)
	}

	// URL для доступа к файлу
	fileURL := fmt.Sprintf("/storage/media/%s", safeFilename)

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
		// Удаляем файлы если не удалось сохранить в БД
		os.Remove(processedPath)
		if thumbnailURL != "" {
			os.Remove(filepath.Join(h.uploadDir, "thumb_"+safeFilename))
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save media record",
		})
	}

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

	// Удаляем файл
	filename := filepath.Base(media.URL)
	filepath := filepath.Join(h.uploadDir, filename)
	os.Remove(filepath)

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

	// Получаем путь к файлу
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
