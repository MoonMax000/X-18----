package utils

import (
	"regexp"
	"strings"
)

var (
	// Email validation regex (RFC 5322 simplified)
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
)

// ValidateEmail checks if email format is valid
func ValidateEmail(email string) bool {
	if len(email) < 3 || len(email) > 254 {
		return false
	}
	return emailRegex.MatchString(strings.TrimSpace(email))
}

// ValidateUsername checks if username meets requirements
func ValidateUsername(username string) (bool, string) {
	username = strings.TrimSpace(username)

	if len(username) < 3 {
		return false, "Username must be at least 3 characters long"
	}

	if len(username) > 50 {
		return false, "Username must not exceed 50 characters"
	}

	// Username can only contain alphanumeric characters, underscores, and hyphens
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	if !usernameRegex.MatchString(username) {
		return false, "Username can only contain letters, numbers, underscores, and hyphens"
	}

	return true, ""
}
