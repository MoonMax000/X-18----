package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// SecretKey должен быть установлен при запуске приложения из переменной окружения
var SecretKey = []byte("your-secret-key-change-in-production")

// SetSecretKey устанавливает секретный ключ для HMAC
func SetSecretKey(key string) {
	SecretKey = []byte(key)
}

// GenerateMediaToken создаёт HMAC-подписанный токен для доступа к медиа
// Токен содержит: mediaID, userID, expiry, signature
func GenerateMediaToken(mediaID, userID uuid.UUID, validFor time.Duration) string {
	// Время истечения токена
	expiry := time.Now().Add(validFor).Unix()

	// Создаём payload: mediaID:userID:expiry
	payload := fmt.Sprintf("%s:%s:%d", mediaID.String(), userID.String(), expiry)

	// Генерируем HMAC подпись
	signature := generateHMAC(payload)

	// Кодируем в base64 для безопасной передачи в URL
	token := base64.URLEncoding.EncodeToString([]byte(payload + ":" + signature))

	return token
}

// ValidateMediaToken проверяет HMAC-подпись токена и возвращает mediaID, userID
func ValidateMediaToken(token string) (mediaID, userID uuid.UUID, valid bool, err error) {
	// Декодируем из base64
	decoded, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("invalid token format")
	}

	// Разбираем payload:signature
	parts := strings.Split(string(decoded), ":")
	if len(parts) != 4 {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("invalid token structure")
	}

	mediaIDStr := parts[0]
	userIDStr := parts[1]
	expiryStr := parts[2]
	receivedSignature := parts[3]

	// Парсим UUID
	mediaID, err = uuid.Parse(mediaIDStr)
	if err != nil {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("invalid media ID")
	}

	userID, err = uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("invalid user ID")
	}

	// Проверяем срок действия
	expiry, err := strconv.ParseInt(expiryStr, 10, 64)
	if err != nil {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("invalid expiry")
	}

	if time.Now().Unix() > expiry {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("token expired")
	}

	// Пересчитываем подпись
	payload := fmt.Sprintf("%s:%s:%d", mediaIDStr, userIDStr, expiry)
	expectedSignature := generateHMAC(payload)

	// Сравниваем подписи (constant-time comparison для защиты от timing attacks)
	if !hmac.Equal([]byte(receivedSignature), []byte(expectedSignature)) {
		return uuid.Nil, uuid.Nil, false, fmt.Errorf("invalid signature")
	}

	return mediaID, userID, true, nil
}

// generateHMAC создаёт HMAC-SHA256 подпись для payload
func generateHMAC(payload string) string {
	h := hmac.New(sha256.New, SecretKey)
	h.Write([]byte(payload))
	return base64.URLEncoding.EncodeToString(h.Sum(nil))
}

// GenerateAccessToken создаёт токен для разового доступа к ресурсу
// Используется для временных ссылок на скачивание
func GenerateAccessToken(resourceID string, validFor time.Duration) string {
	expiry := time.Now().Add(validFor).Unix()
	payload := fmt.Sprintf("%s:%d", resourceID, expiry)
	signature := generateHMAC(payload)
	token := base64.URLEncoding.EncodeToString([]byte(payload + ":" + signature))
	return token
}

// ValidateAccessToken проверяет токен доступа к ресурсу
func ValidateAccessToken(token string) (resourceID string, valid bool, err error) {
	decoded, err := base64.URLEncoding.DecodeString(token)
	if err != nil {
		return "", false, fmt.Errorf("invalid token format")
	}

	parts := strings.Split(string(decoded), ":")
	if len(parts) != 3 {
		return "", false, fmt.Errorf("invalid token structure")
	}

	resourceIDStr := parts[0]
	expiryStr := parts[1]
	receivedSignature := parts[2]

	expiry, err := strconv.ParseInt(expiryStr, 10, 64)
	if err != nil {
		return "", false, fmt.Errorf("invalid expiry")
	}

	if time.Now().Unix() > expiry {
		return "", false, fmt.Errorf("token expired")
	}

	payload := fmt.Sprintf("%s:%d", resourceIDStr, expiry)
	expectedSignature := generateHMAC(payload)

	if !hmac.Equal([]byte(receivedSignature), []byte(expectedSignature)) {
		return "", false, fmt.Errorf("invalid signature")
	}

	return resourceIDStr, true, nil
}

// GenerateDownloadURL создаёт защищённый URL для скачивания медиа
func GenerateDownloadURL(baseURL, mediaID string, userID uuid.UUID, validFor time.Duration) string {
	mediaUUID, _ := uuid.Parse(mediaID)
	token := GenerateMediaToken(mediaUUID, userID, validFor)
	return fmt.Sprintf("%s/api/media/stream/%s?token=%s", baseURL, mediaID, token)
}

// GenerateThumbnailURL создаёт защищённый URL для thumbnail
func GenerateThumbnailURL(baseURL, thumbnailID string, userID uuid.UUID, validFor time.Duration) string {
	return GenerateDownloadURL(baseURL, thumbnailID, userID, validFor)
}
