package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// ResendClient handles email sending via Resend API
type ResendClient struct {
	APIKey    string
	FromEmail string
	FromName  string
}

// NewResendClient creates a new Resend email client
func NewResendClient(apiKey, fromEmail, fromName string) *ResendClient {
	if fromName == "" {
		fromName = "Tyrian Trade"
	}
	return &ResendClient{
		APIKey:    apiKey,
		FromEmail: fromEmail,
		FromName:  fromName,
	}
}

// EmailRequest represents the Resend API request
type EmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
	Text    string   `json:"text,omitempty"`
}

// EmailResponse represents the Resend API response
type EmailResponse struct {
	ID string `json:"id"`
}

// SendEmail sends an email via Resend API
func (c *ResendClient) SendEmail(to, subject, html, text string) error {
	url := "https://api.resend.com/emails"

	emailReq := EmailRequest{
		From:    fmt.Sprintf("%s <%s>", c.FromName, c.FromEmail),
		To:      []string{to},
		Subject: subject,
		HTML:    html,
		Text:    text,
	}

	jsonData, err := json.Marshal(emailReq)
	if err != nil {
		return fmt.Errorf("failed to marshal email request: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&errResp)
		return fmt.Errorf("resend API error (status %d): %v", resp.StatusCode, errResp)
	}

	return nil
}

// SendVerificationEmail sends email verification code
func (c *ResendClient) SendVerificationEmail(to, code string) error {
	subject := "Verify Your Email - Tyrian Trade"

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0C1014; color: #E5E7EB;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #0C1014; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #181B22; border-radius: 16px; overflow: hidden; border: 1px solid #2F3336;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #A06AFF 0%%, #482090 100%%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold;">
                                🔐 Verify Your Email
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #E5E7EB; font-size: 16px; line-height: 24px;">
                                Welcome to <strong>Tyrian Trade</strong>! To complete your registration, please verify your email address.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                Enter this verification code in the app:
                            </p>
                            
                            <!-- Verification Code -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #0C1014; border: 2px solid #A06AFF; border-radius: 12px; padding: 20px; display: inline-block;">
                                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #A06AFF; font-family: 'Courier New', monospace;">
                                                %s
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                This code will expire in <strong style="color: #E5E7EB;">10 minutes</strong>.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                If you didn't request this verification, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0C1014; padding: 30px; text-align: center; border-top: 1px solid #2F3336;">
                            <p style="margin: 0; color: #6C7280; font-size: 12px; line-height: 18px;">
                                © 2025 Tyrian Trade. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #6C7280; font-size: 12px; line-height: 18px;">
                                This is an automated message, please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, code)

	text := fmt.Sprintf(`
Verify Your Email - Tyrian Trade

Welcome to Tyrian Trade! To complete your registration, please verify your email address.

Your verification code is: %s

This code will expire in 10 minutes.

If you didn't request this verification, please ignore this email.

© 2025 Tyrian Trade. All rights reserved.
`, code)

	return c.SendEmail(to, subject, html, text)
}

// SendPasswordResetEmail sends password reset code
func (c *ResendClient) SendPasswordResetEmail(to, code string) error {
	subject := "Reset Your Password - Tyrian Trade"

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0C1014; color: #E5E7EB;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #0C1014; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #181B22; border-radius: 16px; overflow: hidden; border: 1px solid #2F3336;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #EF454A 0%%, #C13545 100%%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold;">
                                🔑 Password Reset Request
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #E5E7EB; font-size: 16px; line-height: 24px;">
                                We received a request to reset your password for your <strong>Tyrian Trade</strong> account.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                Use this code to reset your password:
                            </p>
                            
                            <!-- Reset Code -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #0C1014; border: 2px solid #EF454A; border-radius: 12px; padding: 20px; display: inline-block;">
                                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #EF454A; font-family: 'Courier New', monospace;">
                                                %s
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                This code will expire in <strong style="color: #E5E7EB;">10 minutes</strong>.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #EF454A; font-size: 14px; line-height: 20px; font-weight: bold;">
                                ⚠️ If you didn't request this reset, please secure your account immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0C1014; padding: 30px; text-align: center; border-top: 1px solid #2F3336;">
                            <p style="margin: 0; color: #6C7280; font-size: 12px; line-height: 18px;">
                                © 2025 Tyrian Trade. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #6C7280; font-size: 12px; line-height: 18px;">
                                This is an automated message, please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, code)

	text := fmt.Sprintf(`
Reset Your Password - Tyrian Trade

We received a request to reset your password for your Tyrian Trade account.

Your password reset code is: %s

This code will expire in 10 minutes.

⚠️ If you didn't request this reset, please secure your account immediately.

© 2025 Tyrian Trade. All rights reserved.
`, code)

	return c.SendEmail(to, subject, html, text)
}

// Send2FAEmail sends 2FA verification code
func (c *ResendClient) Send2FAEmail(to, code string) error {
	subject := "Your 2FA Code - Tyrian Trade"

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0C1014; color: #E5E7EB;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #0C1014; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #181B22; border-radius: 16px; overflow: hidden; border: 1px solid #2F3336;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #2EBD85 0%%, #1E8A5F 100%%); padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: bold;">
                                🔐 Two-Factor Authentication
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #E5E7EB; font-size: 16px; line-height: 24px;">
                                Someone is trying to sign in to your <strong>Tyrian Trade</strong> account.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                Enter this code to complete your sign-in:
                            </p>
                            
                            <!-- 2FA Code -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="background-color: #0C1014; border: 2px solid #2EBD85; border-radius: 12px; padding: 20px; display: inline-block;">
                                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2EBD85; font-family: 'Courier New', monospace;">
                                                %s
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #B0B0B0; font-size: 14px; line-height: 20px;">
                                This code will expire in <strong style="color: #E5E7EB;">5 minutes</strong>.
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #EF454A; font-size: 14px; line-height: 20px; font-weight: bold;">
                                ⚠️ If this wasn't you, your account may be compromised. Change your password immediately.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0C1014; padding: 30px; text-align: center; border-top: 1px solid #2F3336;">
                            <p style="margin: 0; color: #6C7280; font-size: 12px; line-height: 18px;">
                                © 2025 Tyrian Trade. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #6C7280; font-size: 12px; line-height: 18px;">
                                This is an automated message, please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, code)

	text := fmt.Sprintf(`
Two-Factor Authentication - Tyrian Trade

Someone is trying to sign in to your Tyrian Trade account.

Your 2FA code is: %s

This code will expire in 5 minutes.

⚠️ If this wasn't you, your account may be compromised. Change your password immediately.

© 2025 Tyrian Trade. All rights reserved.
`, code)

	return c.SendEmail(to, subject, html, text)
}
