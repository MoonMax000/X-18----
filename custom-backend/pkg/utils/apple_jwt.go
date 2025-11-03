package utils

import (
	"crypto/ecdsa"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateAppleClientSecret creates a JWT token for Apple OAuth
// according to Apple's specifications
// privateKey should be parsed using configs.ParseApplePrivateKey
func GenerateAppleClientSecret(teamID, keyID, clientID string, privateKey *ecdsa.PrivateKey) (string, error) {
	// Create token claims
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Issuer:    teamID,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(180 * 24 * time.Hour)), // 6 months
		Audience:  jwt.ClaimStrings{"https://appleid.apple.com"},
		Subject:   clientID,
	}

	// Create token with ES256 algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodES256, claims)
	token.Header["kid"] = keyID

	// Sign token
	signedToken, err := token.SignedString(privateKey)
	if err != nil {
		return "", err
	}

	return signedToken, nil
}
