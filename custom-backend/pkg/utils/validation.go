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

// ValidatePhone checks if phone number meets requirements
func ValidatePhone(phone string) (bool, string) {
	phone = strings.TrimSpace(phone)

	if len(phone) < 10 {
		return false, "Phone number must be at least 10 digits long"
	}

	if len(phone) > 20 {
		return false, "Phone number must not exceed 20 characters"
	}

	// Phone can only contain digits, plus, hyphens, spaces, and parentheses
	// Examples: +1234567890, (123) 456-7890, 123-456-7890
	phoneRegex := regexp.MustCompile(`^[\d\s\-\+\(\)]+$`)
	if !phoneRegex.MatchString(phone) {
		return false, "Phone number can only contain digits, spaces, hyphens, plus, and parentheses"
	}

	// Ensure there are at least 10 digits
	digitsOnly := regexp.MustCompile(`\d`).FindAllString(phone, -1)
	if len(digitsOnly) < 10 {
		return false, "Phone number must contain at least 10 digits"
	}

	return true, ""
}
