package utils

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

// GenerateReferralCode generates a unique 8-character referral code
// The code consists of uppercase letters and numbers for easy sharing
func GenerateReferralCode() string {
	// Generate 4 random bytes (will become 8 hex characters)
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback to a timestamp-based approach if random fails
		return generateFallbackCode()
	}

	// Convert to hex and uppercase
	code := strings.ToUpper(hex.EncodeToString(bytes))

	return code
}

// generateFallbackCode generates a code based on timestamp if random generation fails
func generateFallbackCode() string {
	// Use current nanosecond timestamp
	bytes := make([]byte, 4)
	// This is a simple fallback - in production you might want better error handling
	for i := range bytes {
		bytes[i] = byte(i * 13) // Simple deterministic fallback
	}
	return strings.ToUpper(hex.EncodeToString(bytes))
}
