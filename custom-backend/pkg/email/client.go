package email

// EmailClient defines the interface for email sending services
type EmailClient interface {
	SendEmail(to, subject, html, text string) error
	SendVerificationEmail(to, code string) error
	SendPasswordResetEmail(to, code string) error
	Send2FAEmail(to, code string) error
}

// Ensure implementations satisfy the interface
var (
	_ EmailClient = (*ResendClient)(nil)
	_ EmailClient = (*SESClient)(nil)
)
