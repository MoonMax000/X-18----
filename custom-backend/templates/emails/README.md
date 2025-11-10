# Email Templates для recent

Профессиональные HTML-шаблоны писем в минималистичном стиле Twitter/X для сервиса recent от Tyrian Trade.

## 📧 Доступные шаблоны

### 1. password-reset.html
Шаблон для восстановления пароля.

**Тема письма:** `Tyrian Trade · Восстановление пароля для recent`

**Preheader:** `Вы запросили сброс пароля. Ссылка активна {{token_ttl_minutes}} минут.`

### 2. email-verification.html
Шаблон для подтверждения email при регистрации.

**Тема письма:** `Tyrian Trade · Подтвердите email для recent`

**Preheader:** `Добро пожаловать! Осталось подтвердить адрес и завершить настройку аккаунта.`

## 🔧 Плейсхолдеры для замены

Все шаблоны используют следующие плейсхолдеры, которые нужно заменить на реальные значения:

- `{{user_name_comma}}` — добавляет ", Имя" или оставляет пустым
- `{{reset_url}}` — ссылка для сброса пароля (password-reset.html)
- `{{verify_url}}` — ссылка для подтверждения email (email-verification.html)
- `{{token_ttl_minutes}}` — срок действия ссылки в минутах (например, 60)
- `{{support_email}}` — адрес email поддержки
- `{{current_year}}` — текущий год (например, 2025)

## 🎨 Дизайн и стиль

### Цветовая палитра (Twitter/X inspired)
- **Основной текст:** `#0f1419`
- **Вторичный текст:** `#536471` / `#868b92`
- **Границы:** `#e6e6e6`
- **Фон:** `#f4f6f8`
- **Кнопки:** `#0f1419` (фон), `#ffffff` (текст)

### Особенности
- Системные шрифты: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Адаптивный дизайн (макс. ширина 600px)
- Поддержка темной темы через `@media (prefers-color-scheme: dark)`
- Bulletproof кнопки с поддержкой Outlook (VML)
- Скругления: 14px (карточки), 6px (кнопки)

## 💡 Пример использования в Go

```go
package email

import (
	"bytes"
	"fmt"
	"os"
	"strings"
	"time"
)

// LoadTemplate загружает и подготавливает email шаблон
func LoadTemplate(templateName string) (string, error) {
	data, err := os.ReadFile(fmt.Sprintf("templates/emails/%s.html", templateName))
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// SendPasswordResetEmail отправляет письмо для сброса пароля
func SendPasswordResetEmail(email, userName, resetToken string) error {
	template, err := LoadTemplate("password-reset")
	if err != nil {
		return err
	}

	// Формирование URL сброса пароля
	resetURL := fmt.Sprintf("https://yourdomain.com/reset-password?token=%s", resetToken)
	
	// Подготовка имени пользователя
	userNameComma := ""
	if userName != "" {
		userNameComma = fmt.Sprintf(", %s", userName)
	}

	// Замена плейсхолдеров
	content := strings.ReplaceAll(template, "{{user_name_comma}}", userNameComma)
	content = strings.ReplaceAll(content, "{{reset_url}}", resetURL)
	content = strings.ReplaceAll(content, "{{token_ttl_minutes}}", "60")
	content = strings.ReplaceAll(content, "{{support_email}}", "support@tyriantrade.com")
	content = strings.ReplaceAll(content, "{{current_year}}", fmt.Sprintf("%d", time.Now().Year()))

	// Отправка письма через ваш email-сервис
	return SendEmail(email, "Tyrian Trade · Восстановление пароля для recent", content)
}

// SendVerificationEmail отправляет письмо для подтверждения email
func SendVerificationEmail(email, userName, verificationToken string) error {
	template, err := LoadTemplate("email-verification")
	if err != nil {
		return err
	}

	// Формирование URL подтверждения
	verifyURL := fmt.Sprintf("https://yourdomain.com/verify-email?token=%s", verificationToken)
	
	// Подготовка имени пользователя
	userNameComma := ""
	if userName != "" {
		userNameComma = fmt.Sprintf(", %s", userName)
	}

	// Замена плейсхолдеров
	content := strings.ReplaceAll(template, "{{user_name_comma}}", userNameComma)
	content = strings.ReplaceAll(content, "{{verify_url}}", verifyURL)
	content = strings.ReplaceAll(content, "{{support_email}}", "support@tyriantrade.com")
	content = strings.ReplaceAll(content, "{{current_year}}", fmt.Sprintf("%d", time.Now().Year()))

	// Отправка письма
	return SendEmail(email, "Tyrian Trade · Подтвердите email для recent", content)
}
```

## ✅ Совместимость

Шаблоны протестированы и совместимы с:

- Gmail (Desktop & Mobile)
- Outlook (2007-2021, Office 365)
- Apple Mail (macOS & iOS)
- Yahoo! Mail
- Thunderbird
- Android Mail
- Samsung Mail

### Поддержка темной темы
Шаблоны автоматически адаптируются к темной теме в клиентах:
- Apple Mail (macOS/iOS)
- Outlook (iOS/Android)
- Gmail (Android)

## 🔐 Безопасность

- Все ссылки используют HTTPS
- Токены передаются в URL параметрах
- Добавлены предупреждения о безопасности
- Альтернативные ссылки для копирования

## 📝 Рекомендации

1. **Срок действия токенов:** Рекомендуется 60 минут для password reset, 24 часа для email verification
2. **Email поддержки:** Используйте реальный адрес, на который приходят письма
3. **Тестирование:** Обязательно протестируйте шаблоны в основных почтовых клиентах перед production
4. **Локализация:** Для англоязычных пользователей создайте копии шаблонов с переводом

## 📮 Интеграция с Resend

```go
import "github.com/resendlabs/resend-go"

func SendEmailViaResend(to, subject, htmlContent string) error {
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
	
	params := &resend.SendEmailRequest{
		From:    "Tyrian Trade <noreply@tyriantrade.com>",
		To:      []string{to},
		Subject: subject,
		Html:    htmlContent,
	}
	
	_, err := client.Emails.Send(params)
	return err
}
```

## 🆘 Поддержка

Если у вас возникли вопросы по использованию шаблонов, свяжитесь с командой разработки.
