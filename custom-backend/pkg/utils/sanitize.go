package utils

import (
	"strings"

	"github.com/microcosm-cc/bluemonday"
	"github.com/russross/blackfriday/v2"
)

// SanitizeHTML очищает HTML от потенциально опасного контента
func SanitizeHTML(html string) string {
	p := bluemonday.UGCPolicy()

	// Разрешаем базовые теги для форматирования
	p.AllowElements("p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "blockquote", "code", "pre")
	p.AllowAttrs("href").OnElements("a")
	p.AllowAttrs("class").OnElements("code", "pre")
	p.RequireNoFollowOnLinks(true)

	return p.Sanitize(html)
}

// MarkdownToSafeHTML конвертирует Markdown в безопасный HTML
func MarkdownToSafeHTML(markdown string) string {
	// Конвертируем Markdown в HTML
	rawHTML := blackfriday.Run([]byte(markdown))

	// Санитизируем результат
	return SanitizeHTML(string(rawHTML))
}

// SanitizeContent обрабатывает контент поста
// Если контент содержит Markdown, конвертирует его в безопасный HTML
// Иначе просто санитизирует как HTML
func SanitizeContent(content string, isMarkdown bool) string {
	if isMarkdown {
		return MarkdownToSafeHTML(content)
	}
	return SanitizeHTML(content)
}

// StripHTML удаляет все HTML теги из строки
func StripHTML(html string) string {
	p := bluemonday.StrictPolicy()
	return strings.TrimSpace(p.Sanitize(html))
}

// SanitizeUserInput очищает пользовательский ввод от опасных символов
func SanitizeUserInput(input string) string {
	// Удаляем null bytes
	input = strings.ReplaceAll(input, "\x00", "")

	// Удаляем control characters (кроме \n, \r, \t)
	var result strings.Builder
	for _, r := range input {
		if r == '\n' || r == '\r' || r == '\t' || r >= 32 {
			result.WriteRune(r)
		}
	}

	return strings.TrimSpace(result.String())
}

// TruncateText обрезает текст до указанной длины с добавлением многоточия
func TruncateText(text string, maxLength int) string {
	if len(text) <= maxLength {
		return text
	}
	return text[:maxLength-3] + "..."
}

// ExtractPreview извлекает превью из HTML (первые N символов без тегов)
func ExtractPreview(html string, maxLength int) string {
	plainText := StripHTML(html)
	return TruncateText(plainText, maxLength)
}
