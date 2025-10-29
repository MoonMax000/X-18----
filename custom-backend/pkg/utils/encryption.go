package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"os"
)

// Package utils provides cryptographic utilities for secure data encryption
//
// Purpose: AES-256-GCM encryption for sensitive data like TOTP secrets
//
// Security Features:
// - Uses AES-256-GCM for authenticated encryption
// - Random nonce generation for each encryption operation
// - Automatic integrity verification during decryption
// - Key management via environment variables
//
// Usage Example:
//   // Encrypt sensitive data
//   encrypted, err := EncryptString("my-secret-data")
//   if err != nil {
//       log.Fatal(err)
//   }
//
//   // Decrypt when needed
//   decrypted, err := DecryptString(encrypted)
//   if err != nil {
//       log.Fatal(err)
//   }

// getEncryptionKey retrieves the encryption key from environment
// The key MUST be exactly 32 bytes for AES-256
func getEncryptionKey() ([]byte, error) {
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		return nil, fmt.Errorf("ENCRYPTION_KEY environment variable not set")
	}

	// Ensure key is exactly 32 bytes for AES-256
	keyBytes := []byte(key)
	if len(keyBytes) != 32 {
		return nil, fmt.Errorf("ENCRYPTION_KEY must be exactly 32 bytes, got %d bytes", len(keyBytes))
	}

	return keyBytes, nil
}

// EncryptString encrypts a plaintext string using AES-256-GCM
//
// Parameters:
//   - plaintext: The string to encrypt
//
// Returns:
//   - Base64-encoded ciphertext (includes nonce + encrypted data + auth tag)
//   - Error if encryption fails
//
// The output format is: base64(nonce + ciphertext + tag)
// where:
//   - nonce: 12 bytes (GCM standard)
//   - ciphertext: variable length
//   - tag: 16 bytes (authentication tag)
func EncryptString(plaintext string) (string, error) {
	if plaintext == "" {
		return "", fmt.Errorf("plaintext cannot be empty")
	}

	// Get encryption key from environment
	key, err := getEncryptionKey()
	if err != nil {
		return "", fmt.Errorf("failed to get encryption key: %w", err)
	}

	// Create AES cipher block
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM mode cipher
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Generate random nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	// Encrypt the plaintext
	// GCM's Seal method appends the ciphertext and authentication tag to nonce
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// Encode to base64 for safe storage
	encoded := base64.StdEncoding.EncodeToString(ciphertext)

	return encoded, nil
}

// DecryptString decrypts a base64-encoded ciphertext using AES-256-GCM
//
// Parameters:
//   - ciphertext: Base64-encoded encrypted data (from EncryptString)
//
// Returns:
//   - Decrypted plaintext string
//   - Error if decryption fails or authentication tag doesn't match
//
// Note: GCM automatically verifies the authentication tag during decryption.
// If the data has been tampered with, decryption will fail.
func DecryptString(ciphertext string) (string, error) {
	if ciphertext == "" {
		return "", fmt.Errorf("ciphertext cannot be empty")
	}

	// Get encryption key from environment
	key, err := getEncryptionKey()
	if err != nil {
		return "", fmt.Errorf("failed to get encryption key: %w", err)
	}

	// Decode from base64
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	// Create AES cipher block
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	// Create GCM mode cipher
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// Get nonce size
	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	// Extract nonce and encrypted data
	nonce, encryptedData := data[:nonceSize], data[nonceSize:]

	// Decrypt and verify authentication tag
	plaintext, err := gcm.Open(nil, nonce, encryptedData, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt (possibly tampered data): %w", err)
	}

	return string(plaintext), nil
}

// GenerateEncryptionKey generates a random 32-byte key suitable for AES-256
// This is a utility function for generating new encryption keys
//
// Returns:
//   - Base64-encoded 32-byte random key
//   - Error if random generation fails
//
// Usage:
//
//	key, err := GenerateEncryptionKey()
//	// Save this key securely in your environment variables as ENCRYPTION_KEY
func GenerateEncryptionKey() (string, error) {
	key := make([]byte, 32) // 32 bytes = 256 bits
	if _, err := io.ReadFull(rand.Reader, key); err != nil {
		return "", fmt.Errorf("failed to generate random key: %w", err)
	}

	// Encode to base64 for easy storage in environment variables
	encoded := base64.StdEncoding.EncodeToString(key)

	return encoded, nil
}

// IsEncryptionConfigured checks if the encryption key is properly configured
//
// Returns:
//   - true if ENCRYPTION_KEY environment variable is set and valid
//   - false otherwise
//
// This can be used during application startup to verify configuration
func IsEncryptionConfigured() bool {
	_, err := getEncryptionKey()
	return err == nil
}
