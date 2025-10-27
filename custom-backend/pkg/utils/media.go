package utils

import (
	"bytes"
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/image/draw"
)

// MediaType определяет тип медиа файла
type MediaType string

const (
	MediaTypeImage MediaType = "image"
	MediaTypeVideo MediaType = "video"
	MediaTypeGIF   MediaType = "gif"
)

// AllowedMIMETypes содержит разрешённые MIME типы
var AllowedMIMETypes = map[string]MediaType{
	"image/jpeg": MediaTypeImage,
	"image/jpg":  MediaTypeImage,
	"image/png":  MediaTypeImage,
	"image/gif":  MediaTypeGIF,
	"image/webp": MediaTypeImage,
	"video/mp4":  MediaTypeVideo,
	"video/webm": MediaTypeVideo,
}

// DetectMIMEType определяет MIME тип файла по содержимому (magic bytes)
func DetectMIMEType(file io.ReadSeeker) (string, error) {
	// Читаем первые 512 байт для определения типа
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Возвращаем указатель в начало файла
	_, err = file.Seek(0, 0)
	if err != nil {
		return "", fmt.Errorf("failed to seek file: %w", err)
	}

	// Определяем MIME тип
	mimeType := http.DetectContentType(buffer)
	return mimeType, nil
}

// ValidateMIMEType проверяет, разрешён ли данный MIME тип
func ValidateMIMEType(mimeType string) (MediaType, bool) {
	mediaType, ok := AllowedMIMETypes[mimeType]
	return mediaType, ok
}

// ReencodeImage пере-кодирует изображение, удаляя EXIF и другие метаданные
func ReencodeImage(inputPath string, outputPath string, maxWidth, maxHeight int) error {
	// Открываем исходное изображение
	file, err := os.Open(inputPath)
	if err != nil {
		return fmt.Errorf("failed to open image: %w", err)
	}
	defer file.Close()

	// Декодируем изображение
	img, format, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	// Получаем размеры
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// Изменяем размер если необходимо
	if width > maxWidth || height > maxHeight {
		img = resizeImage(img, maxWidth, maxHeight)
	}

	// Создаём выходной файл
	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	// Кодируем изображение в новый файл (без метаданных)
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(outFile, img, &jpeg.Options{Quality: 90})
	case "png":
		err = png.Encode(outFile, img)
	case "gif":
		err = gif.Encode(outFile, img, nil)
	default:
		// По умолчанию сохраняем как JPEG
		err = jpeg.Encode(outFile, img, &jpeg.Options{Quality: 90})
	}

	if err != nil {
		return fmt.Errorf("failed to encode image: %w", err)
	}

	return nil
}

// resizeImage изменяет размер изображения с сохранением пропорций
func resizeImage(img image.Image, maxWidth, maxHeight int) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// Вычисляем новые размеры с сохранением пропорций
	ratio := float64(width) / float64(height)
	var newWidth, newHeight int

	if width > height {
		newWidth = maxWidth
		newHeight = int(float64(maxWidth) / ratio)
	} else {
		newHeight = maxHeight
		newWidth = int(float64(maxHeight) * ratio)
	}

	// Создаём новое изображение
	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, bounds, draw.Over, nil)

	return dst
}

// GenerateThumbnail создаёт миниатюру изображения
func GenerateThumbnail(inputPath string, outputPath string, width, height int) error {
	file, err := os.Open(inputPath)
	if err != nil {
		return fmt.Errorf("failed to open image: %w", err)
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	// Изменяем размер
	thumbnail := resizeImage(img, width, height)

	// Сохраняем миниатюру
	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create thumbnail: %w", err)
	}
	defer outFile.Close()

	err = jpeg.Encode(outFile, thumbnail, &jpeg.Options{Quality: 85})
	if err != nil {
		return fmt.Errorf("failed to encode thumbnail: %w", err)
	}

	return nil
}

// GetImageDimensions возвращает размеры изображения
func GetImageDimensions(path string) (width, height int, err error) {
	file, err := os.Open(path)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to open image: %w", err)
	}
	defer file.Close()

	img, _, err := image.DecodeConfig(file)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to decode image config: %w", err)
	}

	return img.Width, img.Height, nil
}

// SafeFilename создаёт безопасное имя файла
func SafeFilename(filename string) string {
	// Получаем расширение
	ext := filepath.Ext(filename)

	// Удаляем опасные символы из имени
	name := strings.TrimSuffix(filename, ext)
	name = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			return r
		}
		return '_'
	}, name)

	// Ограничиваем длину
	if len(name) > 100 {
		name = name[:100]
	}

	return name + ext
}

// IsImageCorrupted проверяет, не повреждено ли изображение
func IsImageCorrupted(path string) bool {
	file, err := os.Open(path)
	if err != nil {
		return true
	}
	defer file.Close()

	_, _, err = image.Decode(file)
	return err != nil
}

// CompareImages сравнивает два изображения по содержимому
func CompareImages(path1, path2 string) (bool, error) {
	file1, err := os.Open(path1)
	if err != nil {
		return false, err
	}
	defer file1.Close()

	file2, err := os.Open(path2)
	if err != nil {
		return false, err
	}
	defer file2.Close()

	img1, _, err := image.Decode(file1)
	if err != nil {
		return false, err
	}

	img2, _, err := image.Decode(file2)
	if err != nil {
		return false, err
	}

	bounds1 := img1.Bounds()
	bounds2 := img2.Bounds()

	// Проверяем размеры
	if bounds1 != bounds2 {
		return false, nil
	}

	// Сравниваем пиксели
	for y := bounds1.Min.Y; y < bounds1.Max.Y; y++ {
		for x := bounds1.Min.X; x < bounds1.Max.X; x++ {
			r1, g1, b1, a1 := img1.At(x, y).RGBA()
			r2, g2, b2, a2 := img2.At(x, y).RGBA()
			if r1 != r2 || g1 != g2 || b1 != b2 || a1 != a2 {
				return false, nil
			}
		}
	}

	return true, nil
}

// CalculateImageHash вычисляет хеш изображения для обнаружения дубликатов
func CalculateImageHash(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return "", err
	}

	// Упрощённый perceptual hash
	// Уменьшаем до 8x8 и преобразуем в grayscale
	small := resizeImage(img, 8, 8)

	var hash bytes.Buffer
	bounds := small.Bounds()
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := small.At(x, y).RGBA()
			gray := (r + g + b) / 3
			if gray > 32768 {
				hash.WriteString("1")
			} else {
				hash.WriteString("0")
			}
		}
	}

	return hash.String(), nil
}
