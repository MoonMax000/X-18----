package configs

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	OAuth    OAuthConfig
	Stripe   StripeConfig
}

type ServerConfig struct {
	Port string
	Host string
	Env  string // development, production
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	DB       int
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessExpiry  int // minutes
	RefreshExpiry int // days
}

type OAuthConfig struct {
	Google GoogleOAuthConfig
	Apple  AppleOAuthConfig
}

type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type AppleOAuthConfig struct {
	ClientID       string
	TeamID         string
	KeyID          string
	PrivateKey     string
	PrivateKeyPath string
	RedirectURL    string
}

type StripeConfig struct {
	SecretKey      string
	PublishableKey string
	WebhookSecret  string
	SuccessURL     string
	CancelURL      string
}

func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "x18_backend"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Username: getEnv("REDIS_USER", ""),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			AccessSecret:  getEnv("JWT_ACCESS_SECRET", "change-this-access-secret"),
			RefreshSecret: getEnv("JWT_REFRESH_SECRET", "change-this-refresh-secret"),
			AccessExpiry:  getEnvInt("JWT_ACCESS_EXPIRY", 15),  // 15 minutes
			RefreshExpiry: getEnvInt("JWT_REFRESH_EXPIRY", 30), // 30 days
		},
		OAuth: OAuthConfig{
			Google: GoogleOAuthConfig{
				ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
				ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
				RedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),
			},
			Apple: AppleOAuthConfig{
				ClientID:       getEnv("APPLE_CLIENT_ID", ""),
				TeamID:         getEnv("APPLE_TEAM_ID", ""),
				KeyID:          getEnv("APPLE_KEY_ID", ""),
				PrivateKey:     getEnv("APPLE_PRIVATE_KEY", ""),
				PrivateKeyPath: getEnv("APPLE_PRIVATE_KEY_PATH", ""),
				RedirectURL:    getEnv("APPLE_REDIRECT_URL", "http://localhost:8080/api/auth/apple/callback"),
			},
		},
		Stripe: StripeConfig{
			SecretKey:      getEnv("STRIPE_SECRET_KEY", ""),
			PublishableKey: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
			WebhookSecret:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
			SuccessURL:     getEnv("STRIPE_SUCCESS_URL", "http://localhost:3000/payment-success"),
			CancelURL:      getEnv("STRIPE_CANCEL_URL", "http://localhost:3000/payment-cancelled"),
		},
	}
}

// ParseApplePrivateKey parses Apple private key from file path or PEM string
// Supports: 1) File path (APPLE_PRIVATE_KEY_PATH), 2) Multi-line PEM, 3) Single-line PEM with \n, 4) Base64 DER
func ParseApplePrivateKey(cfg AppleOAuthConfig) (*ecdsa.PrivateKey, error) {
	var raw []byte

	// Try to load from file path first
	if p := strings.TrimSpace(cfg.PrivateKeyPath); p != "" {
		b, err := os.ReadFile(p)
		if err != nil {
			return nil, fmt.Errorf("read APPLE_PRIVATE_KEY_PATH: %w", err)
		}
		raw = b
	} else {
		// Use inline key from APPLE_PRIVATE_KEY
		s := strings.TrimSpace(cfg.PrivateKey)
		if s == "" {
			return nil, fmt.Errorf("APPLE_PRIVATE_KEY is empty")
		}
		// Support escaped newlines
		s = strings.ReplaceAll(s, `\n`, "\n")
		raw = []byte(s)
	}

	// Try PEM format first
	if block, _ := pem.Decode(raw); block != nil {
		// Apple .p8 uses PKCS8 EC format
		if k, err := x509.ParsePKCS8PrivateKey(block.Bytes); err == nil {
			if ec, ok := k.(*ecdsa.PrivateKey); ok {
				return ec, nil
			}
			return nil, fmt.Errorf("unexpected key type (want EC, got %T)", k)
		}
		// Try EC format directly
		if ec, err := x509.ParseECPrivateKey(block.Bytes); err == nil {
			return ec, nil
		}
		return nil, fmt.Errorf("failed to parse EC key from PEM")
	}

	// Try base64-encoded DER as fallback
	if der, err := base64.StdEncoding.DecodeString(strings.TrimSpace(string(raw))); err == nil {
		if k, err := x509.ParsePKCS8PrivateKey(der); err == nil {
			if ec, ok := k.(*ecdsa.PrivateKey); ok {
				return ec, nil
			}
			return nil, fmt.Errorf("unexpected key type (want EC, got %T)", k)
		}
	}

	return nil, fmt.Errorf("failed to parse PEM block containing the key")
}

func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

func (c *RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%s", c.Host, c.Port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
