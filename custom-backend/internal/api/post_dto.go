package api

import (
	"custom-backend/internal/models"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// PostDTO - Data Transfer Object для чистой JSON сериализации постов
// Использует только camelCase JSON теги без GORM тегов
type PostDTO struct {
	ID     uuid.UUID `json:"id"`
	UserID uuid.UUID `json:"userId"`

	// Content
	Content        string `json:"content"`
	ContentHTML    string `json:"contentHTML,omitempty"`
	ContentWarning string `json:"contentWarning,omitempty"`

	// Visibility & Type
	Visibility string  `json:"visibility"`
	IsPaid     bool    `json:"isPaid"`
	Price      float64 `json:"price,omitempty"`

	// Premium Content (Phase 2)
	IsPremium   bool   `json:"isPremium"`
	PriceCents  int    `json:"priceCents"`
	PreviewText string `json:"previewText,omitempty"`
	Category    string `json:"category,omitempty"`
	Tags        string `json:"tags,omitempty"`

	// Access Control (Phase 3)
	AccessLevel string `json:"accessLevel"`
	ReplyPolicy string `json:"replyPolicy"`

	// Thread/Reply
	ReplyToID  *uuid.UUID `json:"replyToId,omitempty"`
	RootPostID *uuid.UUID `json:"rootPostId,omitempty"`

	// Stats
	LikesCount    int `json:"likesCount"`
	RetweetsCount int `json:"retweetsCount"`
	RepliesCount  int `json:"repliesCount"`
	ViewsCount    int `json:"viewsCount"`

	// Metadata
	Metadata models.Metadata `json:"metadata,omitempty"`

	// Extracted metadata fields (для удобства frontend)
	Market    string `json:"market,omitempty"`
	Symbol    string `json:"symbol,omitempty"`
	Ticker    string `json:"ticker,omitempty"` // Alias for symbol
	Timeframe string `json:"timeframe,omitempty"`
	Risk      string `json:"risk,omitempty"`

	// Timestamps
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Relationships
	User  models.PublicUser `json:"user"`
	Media []MediaDTO        `json:"media,omitempty"`

	// Transient fields (computed per-request)
	IsLiked      bool    `json:"isLiked,omitempty"`
	IsRetweeted  bool    `json:"isRetweeted,omitempty"`
	IsBookmarked bool    `json:"isBookmarked,omitempty"`
	IsPurchased  bool    `json:"isPurchased,omitempty"`
	IsSubscriber bool    `json:"isSubscriber,omitempty"`
	IsFollower   bool    `json:"isFollower,omitempty"`
	PostPrice    float64 `json:"postPrice,omitempty"`
}

// MediaDTO - DTO для медиафайлов
type MediaDTO struct {
	ID            uuid.UUID  `json:"id"`
	UserID        uuid.UUID  `json:"userId"`
	PostID        *uuid.UUID `json:"postId,omitempty"`
	Type          string     `json:"type"`
	URL           string     `json:"url"`
	ThumbnailURL  string     `json:"thumbnailUrl,omitempty"`
	AltText       string     `json:"altText,omitempty"`
	Width         int        `json:"width,omitempty"`
	Height        int        `json:"height,omitempty"`
	SizeBytes     int64      `json:"sizeBytes,omitempty"`
	FileName      string     `json:"fileName,omitempty"`
	FileExtension string     `json:"fileExtension,omitempty"`
	Transform     string     `json:"transform,omitempty"`
	OriginalURL   string     `json:"originalUrl,omitempty"`
	Status        string     `json:"status"`
	CreatedAt     time.Time  `json:"createdAt"`
}

// toPostDTO конвертирует models.Post в PostDTO
func toPostDTO(post models.Post) PostDTO {
	// Определяем, имеет ли пользователь доступ к платному контенту
	hasAccess := post.IsPurchased || post.IsSubscriber || post.AccessLevel == "public" || post.AccessLevel == ""

	// Для безопасности: если нет доступа И есть PreviewText - отдаем только preview
	content := post.Content
	contentHTML := post.ContentHTML

	if !hasAccess && post.PreviewText != "" && post.AccessLevel != "" && post.AccessLevel != "public" {
		// Пользователь НЕ имеет доступа к платному посту
		// Отдаем пустой контент - только PreviewText будет виден
		content = ""
		contentHTML = ""
	}

	dto := PostDTO{
		ID:             post.ID,
		UserID:         post.UserID,
		Content:        content,
		ContentHTML:    contentHTML,
		ContentWarning: post.ContentWarning,
		Visibility:     post.Visibility,
		IsPaid:         post.IsPaid,
		Price:          post.Price,
		IsPremium:      post.IsPremium,
		PriceCents:     post.PriceCents,
		PreviewText:    post.PreviewText,
		Category:       post.Category,
		Tags:           post.Tags,
		AccessLevel:    post.AccessLevel,
		ReplyPolicy:    post.ReplyPolicy,
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
		IsLiked:        post.IsLiked,
		IsRetweeted:    post.IsRetweeted,
		IsBookmarked:   post.IsBookmarked,
		IsPurchased:    post.IsPurchased,
		IsSubscriber:   post.IsSubscriber,
		IsFollower:     post.IsFollower,
		PostPrice:      post.PostPrice,
	}

	// Извлекаем поля из metadata для удобства frontend
	if post.Metadata != nil {
		// DEBUG: Log metadata extraction
		fmt.Printf("\n[toPostDTO] Post ID: %s\n", post.ID)
		fmt.Printf("[toPostDTO] Metadata: %+v\n", post.Metadata)

		if market, ok := post.Metadata["market"].(string); ok {
			dto.Market = market
			fmt.Printf("[toPostDTO] Extracted market: %s\n", market)
		}
		if symbol, ok := post.Metadata["symbol"].(string); ok {
			dto.Symbol = symbol
			dto.Ticker = symbol // Также заполняем ticker как alias
			fmt.Printf("[toPostDTO] Extracted symbol/ticker: %s\n", symbol)
		}
		if timeframe, ok := post.Metadata["timeframe"].(string); ok {
			dto.Timeframe = timeframe
			fmt.Printf("[toPostDTO] Extracted timeframe: %s\n", timeframe)
		}
		if risk, ok := post.Metadata["risk"].(string); ok {
			dto.Risk = risk
			fmt.Printf("[toPostDTO] Extracted risk: %s\n", risk)
		}

		fmt.Printf("[toPostDTO] Result DTO - Market: %s, Symbol: %s, Ticker: %s\n\n", dto.Market, dto.Symbol, dto.Ticker)
	}

	// Конвертируем медиа
	if len(post.Media) > 0 {
		dto.Media = make([]MediaDTO, len(post.Media))
		for i, m := range post.Media {
			dto.Media[i] = MediaDTO{
				ID:            m.ID,
				UserID:        m.UserID,
				PostID:        m.PostID,
				Type:          m.Type,
				URL:           m.URL,
				ThumbnailURL:  m.ThumbnailURL,
				AltText:       m.AltText,
				Width:         m.Width,
				Height:        m.Height,
				SizeBytes:     m.SizeBytes,
				FileName:      m.FileName,
				FileExtension: m.FileExtension,
				Transform:     m.Transform,
				OriginalURL:   m.OriginalURL,
				Status:        m.Status,
				CreatedAt:     m.CreatedAt,
			}
		}
	}

	return dto
}

// toPostDTOList конвертирует []models.Post в []PostDTO
func toPostDTOList(posts []models.Post) []PostDTO {
	dtos := make([]PostDTO, len(posts))
	for i, post := range posts {
		dtos[i] = toPostDTO(post)
	}
	return dtos
}
