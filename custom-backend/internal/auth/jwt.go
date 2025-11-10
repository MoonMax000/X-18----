package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTClaims struct {
	UserID   uuid.UUID `json:"user_id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	Role     string    `json:"role"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"` // seconds
}

// GenerateAccessToken creates a new JWT access token with session ID (JTI)
func GenerateAccessToken(userID uuid.UUID, username, email, role, secret string, expiryMinutes int, sessionJTI uuid.UUID) (string, error) {
	expiresAt := time.Now().Add(time.Duration(expiryMinutes) * time.Minute)

	claims := &JWTClaims{
		UserID:   userID,
		Username: username,
		Email:    email,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "x18-backend",
			Subject:   userID.String(),
			ID:        sessionJTI.String(), // Add session JTI to access token
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// GenerateRefreshToken creates a new JWT refresh token with JTI for rotation tracking
func GenerateRefreshToken(userID uuid.UUID, secret string, expiryDays int) (string, uuid.UUID, error) {
	expiresAt := time.Now().Add(time.Duration(expiryDays) * 24 * time.Hour)
	jti := uuid.New() // Generate unique JWT ID for rotation tracking

	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expiresAt),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
		Issuer:    "x18-backend",
		Subject:   userID.String(),
		ID:        jti.String(), // Add JTI to claims
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))
	return signedToken, jti, err
}

// TokenPairWithJTI includes the JTI for refresh token tracking
type TokenPairWithJTI struct {
	*TokenPair
	RefreshJTI uuid.UUID `json:"-"` // Not exposed to client
}

// GenerateTokenPair creates both access and refresh tokens with same JTI
func GenerateTokenPair(userID uuid.UUID, username, email, role, accessSecret, refreshSecret string, accessExpiry, refreshExpiry int) (*TokenPairWithJTI, error) {
	// Generate JTI first
	jti := uuid.New()

	// Create access token with JTI
	accessToken, err := GenerateAccessToken(userID, username, email, role, accessSecret, accessExpiry, jti)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Create refresh token with same JTI (but using existing function that generates its own JTI)
	refreshToken, refreshJTI, err := GenerateRefreshToken(userID, refreshSecret, refreshExpiry)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPairWithJTI{
		TokenPair: &TokenPair{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
			ExpiresIn:    int64(accessExpiry * 60), // convert minutes to seconds
		},
		RefreshJTI: refreshJTI,
	}, nil
}

// ValidateAccessToken validates and parses access token
func ValidateAccessToken(tokenString, secret string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

// RefreshTokenClaims holds validated refresh token data
type RefreshTokenClaims struct {
	UserID uuid.UUID
	JTI    uuid.UUID
}

// ValidateRefreshToken validates refresh token and returns user ID and JTI
func ValidateRefreshToken(tokenString, secret string) (*RefreshTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid {
		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			return nil, fmt.Errorf("invalid user ID in token: %w", err)
		}

		jti, err := uuid.Parse(claims.ID)
		if err != nil {
			return nil, fmt.Errorf("invalid JTI in token: %w", err)
		}

		return &RefreshTokenClaims{
			UserID: userID,
			JTI:    jti,
		}, nil
	}

	return nil, fmt.Errorf("invalid refresh token claims")
}
