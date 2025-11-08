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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #0a0a0a 0%%, #1a0f2e 100%%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(138, 43, 226, 0.3); border: 1px solid #8a2be2;">
                    
                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; background: linear-gradient(135deg, #8a2be2 0%%, #4b0082 100%%);">
                            <img src="https://tyriantrade.com/logo.png" alt="Tyrian Trade" style="height: 50px; margin-bottom: 15px;"/>
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                                TYRIAN TRADE
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Purple Accent Bar -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #8a2be2, #9370db, #8a2be2);"></td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px; background-color: #0a0a0a;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%%, #4b0082 100%%); border-radius: 50%%; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);">
                                    <span style="font-size: 48px;">🔐</span>
                                </div>
                                <h2 style="margin: 0 0 10px 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">
                                    Verify Your Email
                                </h2>
                                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #8a2be2, #9370db); margin: 0 auto;"></div>
                            </div>
                            
                            <p style="margin: 0 0 25px 0; color: #E0E0E0; font-size: 16px; line-height: 26px; text-align: center;">
                                Welcome to <strong style="color: #9370db;">Tyrian Trade</strong>! Complete your registration by verifying your email address.
                            </p>
                            
                            <p style="margin: 0 0 35px 0; color: #A0A0A0; font-size: 14px; line-height: 22px; text-align: center;">
                                Enter this verification code:
                            </p>
                            
                            <!-- Verification Code Box -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 35px 0;">
                                        <div style="background: linear-gradient(135deg, #1a0f2e 0%%, #0a0a0a 100%%); border: 3px solid #8a2be2; border-radius: 16px; padding: 30px; display: inline-block; box-shadow: 0 10px 40px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.1);">
                                            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; background: linear-gradient(135deg, #9370db 0%%, #8a2be2 100%%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(138, 43, 226, 0.5);">
                                                %s
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="background: linear-gradient(135deg, #1a0f2e 0%%, #0f0520 100%%); border-left: 4px solid #8a2be2; border-radius: 8px; padding: 20px; margin: 0 0 25px 0;">
                                <p style="margin: 0; color: #C0C0C0; font-size: 14px; line-height: 22px;">
                                    ⏱️ <strong style="color: #9370db;">This code expires in 10 minutes</strong>
                                </p>
                            </div>
                            
                            <p style="margin: 0; color: #808080; font-size: 13px; line-height: 20px; text-align: center;">
                                If you didn't request this verification, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a0a0a 0%%, #1a0f2e 100%%); padding: 30px 40px; text-align: center; border-top: 1px solid #8a2be2;">
                            <p style="margin: 0 0 10px 0; color: #606060; font-size: 12px; line-height: 18px;">
                                © 2025 <strong style="color: #9370db;">Tyrian Trade</strong>. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #505050; font-size: 11px; line-height: 16px;">
                                This is an automated message. Please do not reply.
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
TYRIAN TRADE
Verify Your Email

Welcome to Tyrian Trade! Complete your registration by verifying your email address.

Your verification code is: %s

⏱️ This code expires in 10 minutes

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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #0a0a0a 0%%, #2e0f1a 100%%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(220, 20, 60, 0.3); border: 1px solid #dc143c;">
                    
                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; background: linear-gradient(135deg, #dc143c 0%%, #8b0000 100%%);">
                            <img src="https://tyriantrade.com/logo.png" alt="Tyrian Trade" style="height: 50px; margin-bottom: 15px;"/>
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                                TYRIAN TRADE
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Red Accent Bar -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #dc143c, #ff6b6b, #dc143c);"></td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px; background-color: #0a0a0a;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #dc143c 0%%, #8b0000 100%%); border-radius: 50%%; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(220, 20, 60, 0.4);">
                                    <span style="font-size: 48px;">🔑</span>
                                </div>
                                <h2 style="margin: 0 0 10px 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">
                                    Password Reset Request
                                </h2>
                                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #dc143c, #ff6b6b); margin: 0 auto;"></div>
                            </div>
                            
                            <p style="margin: 0 0 25px 0; color: #E0E0E0; font-size: 16px; line-height: 26px; text-align: center;">
                                We received a request to reset your password for your <strong style="color: #ff6b6b;">Tyrian Trade</strong> account.
                            </p>
                            
                            <p style="margin: 0 0 35px 0; color: #A0A0A0; font-size: 14px; line-height: 22px; text-align: center;">
                                Use this code to reset your password:
                            </p>
                            
                            <!-- Reset Code Box -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 35px 0;">
                                        <div style="background: linear-gradient(135deg, #2e0f1a 0%%, #0a0a0a 100%%); border: 3px solid #dc143c; border-radius: 16px; padding: 30px; display: inline-block; box-shadow: 0 10px 40px rgba(220, 20, 60, 0.3), inset 0 0 20px rgba(220, 20, 60, 0.1);">
                                            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; background: linear-gradient(135deg, #ff6b6b 0%%, #dc143c 100%%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Courier New', monospace;">
                                                %s
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="background: linear-gradient(135deg, #2e0f1a 0%%, #1a0510 100%%); border-left: 4px solid #dc143c; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                                <p style="margin: 0; color: #C0C0C0; font-size: 14px; line-height: 22px;">
                                    ⏱️ <strong style="color: #ff6b6b;">This code expires in 10 minutes</strong>
                                </p>
                            </div>
                            
                            <div style="background: linear-gradient(135deg, #3d1a1a 0%%, #1a0510 100%%); border: 2px solid #dc143c; border-radius: 8px; padding: 20px; text-align: center;">
                                <p style="margin: 0; color: #ff6b6b; font-size: 14px; line-height: 22px; font-weight: 700;">
                                    ⚠️ If you didn't request this reset, secure your account immediately
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a0a0a 0%%, #2e0f1a 100%%); padding: 30px 40px; text-align: center; border-top: 1px solid #dc143c;">
                            <p style="margin: 0 0 10px 0; color: #606060; font-size: 12px; line-height: 18px;">
                                © 2025 <strong style="color: #ff6b6b;">Tyrian Trade</strong>. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #505050; font-size: 11px; line-height: 16px;">
                                This is an automated message. Please do not reply.
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
TYRIAN TRADE
Password Reset Request

We received a request to reset your password for your Tyrian Trade account.

Your password reset code is: %s

⏱️ This code expires in 10 minutes

⚠️ If you didn't request this reset, secure your account immediately

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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, #0a0a0a 0%%, #1a1a2e 100%%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(138, 43, 226, 0.3); border: 1px solid #8a2be2;">
                    
                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; background: linear-gradient(135deg, #8a2be2 0%%, #4b0082 100%%);">
                            <img src="https://tyriantrade.com/logo.png" alt="Tyrian Trade" style="height: 50px; margin-bottom: 15px;"/>
                            <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                                TYRIAN TRADE
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Purple Accent Bar -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #8a2be2, #9370db, #8a2be2);"></td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 40px; background-color: #0a0a0a;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #8a2be2 0%%, #4b0082 100%%); border-radius: 50%%; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);">
                                    <span style="font-size: 48px;">🛡️</span>
                                </div>
                                <h2 style="margin: 0 0 10px 0; color: #FFFFFF; font-size: 28px; font-weight: 700;">
                                    Two-Factor Authentication
                                </h2>
                                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #8a2be2, #9370db); margin: 0 auto;"></div>
                            </div>
                            
                            <p style="margin: 0 0 25px 0; color: #E0E0E0; font-size: 16px; line-height: 26px; text-align: center;">
                                Someone is trying to sign in to your <strong style="color: #9370db;">Tyrian Trade</strong> account.
                            </p>
                            
                            <p style="margin: 0 0 35px 0; color: #A0A0A0; font-size: 14px; line-height: 22px; text-align: center;">
                                Enter this code to complete sign-in:
                            </p>
                            
                            <!-- 2FA Code Box -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 35px 0;">
                                        <div style="background: linear-gradient(135deg, #1a0f2e 0%%, #0a0a0a 100%%); border: 3px solid #8a2be2; border-radius: 16px; padding: 30px; display: inline-block; box-shadow: 0 10px 40px rgba(138, 43, 226, 0.3), inset 0 0 20px rgba(138, 43, 226, 0.1);">
                                            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; background: linear-gradient(135deg, #9370db 0%%, #8a2be2 100%%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Courier New', monospace;">
                                                %s
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="background: linear-gradient(135deg, #1a0f2e 0%%, #0f0520 100%%); border-left: 4px solid #8a2be2; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                                <p style="margin: 0; color: #C0C0C0; font-size: 14px; line-height: 22px;">
                                    ⏱️ <strong style="color: #9370db;">This code expires in 5 minutes</strong>
                                </p>
                            </div>
                            
                            <div style="background: linear-gradient(135deg, #3d1a1a 0%%, #1a0510 100%%); border: 2px solid #dc143c; border-radius: 8px; padding: 20px; text-align: center;">
                                <p style="margin: 0; color: #ff6b6b; font-size: 14px; line-height: 22px; font-weight: 700;">
                                    ⚠️ If this wasn't you, your account may be compromised
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a0a0a 0%%, #1a0f2e 100%%); padding: 30px 40px; text-align: center; border-top: 1px solid #8a2be2;">
                            <p style="margin: 0 0 10px 0; color: #606060; font-size: 12px; line-height: 18px;">
                                © 2025 <strong style="color: #9370db;">Tyrian Trade</strong>. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #505050; font-size: 11px; line-height: 16px;">
                                This is an automated message. Please do not reply.
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
TYRIAN TRADE
Two-Factor Authentication

Someone is trying to sign in to your Tyrian Trade account.

Your 2FA code is: %s

⏱️ This code expires in 5 minutes

⚠️ If this wasn't you, your account may be compromised

© 2025 Tyrian Trade. All rights reserved.
`, code)

	return c.SendEmail(to, subject, html, text)
}
