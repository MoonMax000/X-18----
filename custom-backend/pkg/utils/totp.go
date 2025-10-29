package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"image/png"
	"strings"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/qr"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

// Package utils provides TOTP (Time-based One-Time Password) utilities
//
// Purpose: Helper functions for TOTP 2FA implementation
//
// Features:
// - QR code generation for authenticator apps
// - TOTP secret formatting and validation
// - Backup code generation and verification
// - Compatible with Google Authenticator, Microsoft Authenticator, Authy
//
// Standards:
// - RFC 6238 (TOTP: Time-Based One-Time Password Algorithm)
// - 6-digit codes, 30-second time step

const (
	// TOTPIssuer is the default issuer name shown in authenticator apps
	TOTPIssuer = "TyrianTrade"

	// TOTPDigits is the number of digits in TOTP codes (standard: 6)
	TOTPDigits = otp.DigitsSix

	// TOTPPeriod is the time step in seconds (standard: 30)
	TOTPPeriod = 30

	// TOTPAlgorithm is the hash algorithm used (standard: SHA1)
	TOTPAlgorithm = otp.AlgorithmSHA1

	// BackupCodeLength is the length of each backup code
	BackupCodeLength = 10

	// BackupCodeCount is the number of backup codes to generate
	BackupCodeCount = 8
)

// GenerateTOTPKey generates a new TOTP key for a user
//
// Parameters:
//   - accountName: User's email or username
//   - issuer: Application name (optional, defaults to TOTPIssuer)
//
// Returns:
//   - *otp.Key: Generated TOTP key containing secret and other parameters
//   - Error if generation fails
//
// The key includes:
//   - Secret: Base32-encoded random secret
//   - Issuer: Application name
//   - AccountName: User identifier
//   - Period: 30 seconds
//   - Digits: 6
//   - Algorithm: SHA1
func GenerateTOTPKey(accountName string, issuer ...string) (*otp.Key, error) {
	if accountName == "" {
		return nil, fmt.Errorf("account name cannot be empty")
	}

	// Use default issuer if not provided
	issuerName := TOTPIssuer
	if len(issuer) > 0 && issuer[0] != "" {
		issuerName = issuer[0]
	}

	// Generate TOTP key
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      issuerName,
		AccountName: accountName,
		Period:      TOTPPeriod,
		Digits:      TOTPDigits,
		Algorithm:   TOTPAlgorithm,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to generate TOTP key: %w", err)
	}

	return key, nil
}

// GenerateQRCode generates a QR code image for a TOTP key
//
// Parameters:
//   - key: TOTP key from GenerateTOTPKey
//
// Returns:
//   - Base64-encoded PNG image (data URL format)
//   - Error if generation fails
//
// The QR code can be scanned by authenticator apps like:
//   - Google Authenticator
//   - Microsoft Authenticator
//   - Authy
//   - 1Password
//   - Bitwarden
func GenerateQRCode(key *otp.Key) (string, error) {
	if key == nil {
		return "", fmt.Errorf("TOTP key cannot be nil")
	}

	// Generate QR code from TOTP URL
	// The URL format is: otpauth://totp/Issuer:Account?secret=XXX&issuer=Issuer
	qrCode, err := qr.Encode(key.URL(), qr.M, qr.Auto)
	if err != nil {
		return "", fmt.Errorf("failed to encode QR code: %w", err)
	}

	// Scale QR code to 256x256 pixels
	qrCode, err = barcode.Scale(qrCode, 256, 256)
	if err != nil {
		return "", fmt.Errorf("failed to scale QR code: %w", err)
	}

	// Convert to PNG
	var buf bytes.Buffer
	if err := png.Encode(&buf, qrCode); err != nil {
		return "", fmt.Errorf("failed to encode PNG: %w", err)
	}

	// Encode to base64 data URL
	base64Image := base64.StdEncoding.EncodeToString(buf.Bytes())
	dataURL := fmt.Sprintf("data:image/png;base64,%s", base64Image)

	return dataURL, nil
}

// ValidateTOTPCode validates a TOTP code against a secret
//
// Parameters:
//   - code: 6-digit TOTP code from user
//   - secret: Base32-encoded TOTP secret
//
// Returns:
//   - true if code is valid
//   - false if code is invalid or expired
//
// The validation allows a time skew of ±1 period (30 seconds)
// to account for clock drift and network latency.
func ValidateTOTPCode(code string, secret string) bool {
	if code == "" || secret == "" {
		return false
	}

	// Validate code format (must be 6 digits)
	if len(code) != 6 {
		return false
	}

	for _, c := range code {
		if c < '0' || c > '9' {
			return false
		}
	}

	// Validate TOTP code with time skew
	// This allows codes from the previous and next time windows
	// to account for clock differences
	return totp.Validate(code, secret)
}

// FormatTOTPSecret formats a TOTP secret for display
//
// Parameters:
//   - secret: Base32-encoded TOTP secret
//
// Returns:
//   - Formatted secret (groups of 4 characters separated by spaces)
//
// Example: "JBSWY3DPEHPK3PXP" becomes "JBSW Y3DP EHPK 3PXP"
// This makes it easier for users to manually enter the secret.
func FormatTOTPSecret(secret string) string {
	if secret == "" {
		return ""
	}

	// Remove any existing spaces
	secret = strings.ReplaceAll(secret, " ", "")

	// Split into groups of 4 characters
	var formatted strings.Builder
	for i, char := range secret {
		if i > 0 && i%4 == 0 {
			formatted.WriteString(" ")
		}
		formatted.WriteRune(char)
	}

	return formatted.String()
}

// GenerateBackupCodes generates a set of backup recovery codes
//
// Parameters:
//   - count: Number of backup codes to generate (default: BackupCodeCount)
//
// Returns:
//   - Slice of backup codes
//   - Error if generation fails
//
// Backup codes are used when the user loses access to their authenticator app.
// Each code should be used only once and stored securely (hashed in database).
func GenerateBackupCodes(count ...int) ([]string, error) {
	// Use default count if not provided
	codeCount := BackupCodeCount
	if len(count) > 0 && count[0] > 0 {
		codeCount = count[0]
	}

	codes := make([]string, codeCount)

	for i := 0; i < codeCount; i++ {
		code, err := generateBackupCode()
		if err != nil {
			return nil, fmt.Errorf("failed to generate backup code: %w", err)
		}
		codes[i] = code
	}

	return codes, nil
}

// generateBackupCode generates a single backup code
//
// Returns:
//   - 10-character alphanumeric code (format: XXXX-XXXX-XX)
//   - Error if generation fails
func generateBackupCode() (string, error) {
	// Character set: uppercase letters and numbers (excluding ambiguous chars)
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // No O, I, 0, 1
	const codeLength = 10

	bytes := make([]byte, codeLength)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	var code strings.Builder
	for i, b := range bytes {
		// Add hyphen every 4 characters for readability
		if i > 0 && i%4 == 0 {
			code.WriteString("-")
		}
		code.WriteByte(charset[b%byte(len(charset))])
	}

	return code.String(), nil
}

// ValidateBackupCode validates a backup code format
//
// Parameters:
//   - code: Backup code from user
//
// Returns:
//   - Normalized code (uppercase, no hyphens)
//   - Error if format is invalid
//
// This function normalizes the code by:
//   - Converting to uppercase
//   - Removing hyphens and spaces
//   - Validating length and characters
func ValidateBackupCode(code string) (string, error) {
	if code == "" {
		return "", fmt.Errorf("backup code cannot be empty")
	}

	// Normalize: uppercase and remove hyphens/spaces
	normalized := strings.ToUpper(code)
	normalized = strings.ReplaceAll(normalized, "-", "")
	normalized = strings.ReplaceAll(normalized, " ", "")

	// Validate length
	if len(normalized) != BackupCodeLength {
		return "", fmt.Errorf("backup code must be %d characters", BackupCodeLength)
	}

	// Validate characters (alphanumeric only)
	for _, c := range normalized {
		if !((c >= 'A' && c <= 'Z') || (c >= '2' && c <= '9')) {
			return "", fmt.Errorf("backup code contains invalid characters")
		}
	}

	return normalized, nil
}

// GetTOTPURL returns the otpauth:// URL for a TOTP key
//
// Parameters:
//   - accountName: User's email or username
//   - secret: Base32-encoded TOTP secret
//   - issuer: Application name (optional)
//
// Returns:
//   - otpauth:// URL string
//
// Example: otpauth://totp/TyrianTrade:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TyrianTrade
//
// This URL can be:
//   - Encoded as a QR code for scanning
//   - Opened directly on mobile devices with authenticator apps
func GetTOTPURL(accountName, secret string, issuer ...string) string {
	issuerName := TOTPIssuer
	if len(issuer) > 0 && issuer[0] != "" {
		issuerName = issuer[0]
	}

	// Format: otpauth://totp/Issuer:AccountName?secret=SECRET&issuer=Issuer
	return fmt.Sprintf(
		"otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
		issuerName,
		accountName,
		secret,
		issuerName,
	)
}
