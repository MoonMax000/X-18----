package oauth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"custom-backend/configs"

	"github.com/Timothylock/go-signin-with-apple/apple"
)

type AppleService struct {
	cfg    configs.AppleOAuthConfig
	secret string // client_secret (ES256 JWT)
}

// NewAppleService creates a new Apple OAuth service with proper client_secret generation
func NewAppleService(cfg configs.AppleOAuthConfig) (*AppleService, error) {
	// Read private key as string (PEM format)
	var pkPEM string
	if p := strings.TrimSpace(cfg.PrivateKeyPath); p != "" {
		b, err := os.ReadFile(p)
		if err != nil {
			return nil, fmt.Errorf("read APPLE_PRIVATE_KEY_PATH: %w", err)
		}
		pkPEM = string(b)
	} else {
		s := strings.TrimSpace(cfg.PrivateKey)
		if s == "" {
			return nil, errors.New("APPLE_PRIVATE_KEY(_PATH) not set")
		}
		// Support escaped newlines
		s = strings.ReplaceAll(s, `\n`, "\n")
		pkPEM = s
	}

	// Generate client_secret using battle-tested library
	// Apple client_secret is an ES256 JWT with team_id, key_id, client_id
	// Valid for up to 6 months
	cs, err := apple.GenerateClientSecret(
		pkPEM,
		cfg.TeamID,
		cfg.ClientID,
		cfg.KeyID,
	)
	if err != nil {
		return nil, fmt.Errorf("generate apple client_secret: %w", err)
	}

	log.Printf("✅ Apple client_secret generated (valid for 6 months)")
	return &AppleService{cfg: cfg, secret: cs}, nil
}

// AuthorizationURL generates the URL for redirecting to Apple's authorization page
// Uses response_mode=form_post as required by Apple for web flow with name/email scope
func (s *AppleService) AuthorizationURL(state string, nonce string) string {
	v := url.Values{}
	v.Set("client_id", s.cfg.ClientID)
	v.Set("redirect_uri", s.cfg.RedirectURL)
	v.Set("response_type", "code id_token")
	v.Set("response_mode", "form_post") // Required for scope=name email in web flow
	v.Set("scope", "name email")
	if state != "" {
		v.Set("state", state)
	}
	if nonce != "" {
		v.Set("nonce", nonce)
	}
	return "https://appleid.apple.com/auth/authorize?" + v.Encode()
}

// ExchangeCode exchanges authorization code for tokens at Apple's token endpoint
func (s *AppleService) ExchangeCode(ctx context.Context, code string) (*AppleTokenResponse, error) {
	log.Printf("🍎 ExchangeCode: Starting token exchange with Apple")
	log.Printf("🍎 ClientID: %s", s.cfg.ClientID)
	log.Printf("🍎 TeamID: %s", s.cfg.TeamID)
	log.Printf("🍎 KeyID: %s", s.cfg.KeyID)
	log.Printf("🍎 RedirectURL: %s", s.cfg.RedirectURL)
	log.Printf("🍎 Code length: %d", len(code))
	log.Printf("🍎 Code first 20 chars: %s...", code[:min(20, len(code))])
	log.Printf("🍎 ClientSecret length: %d", len(s.secret))
	if len(s.secret) > 50 {
		log.Printf("🍎 ClientSecret first 50 chars: %s...", s.secret[:50])
	}

	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("client_id", s.cfg.ClientID)
	form.Set("client_secret", s.secret)
	form.Set("redirect_uri", s.cfg.RedirectURL)

	log.Printf("🍎 Form data being sent to Apple:")
	log.Printf("🍎   grant_type: %s", form.Get("grant_type"))
	log.Printf("🍎   client_id: %s", form.Get("client_id"))
	log.Printf("🍎   redirect_uri: %s", form.Get("redirect_uri"))
	log.Printf("🍎   code length: %d", len(form.Get("code")))
	log.Printf("🍎   client_secret length: %d", len(form.Get("client_secret")))

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		"https://appleid.apple.com/auth/token",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		log.Printf("🍎 ERROR: Failed to create request: %v", err)
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	log.Printf("🍎 Sending token request to Apple...")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("🍎 ERROR: Token request failed: %v", err)
		return nil, fmt.Errorf("token request failed: %w", err)
	}
	defer resp.Body.Close()

	log.Printf("🍎 Received response from Apple: Status=%d", resp.StatusCode)

	if resp.StatusCode != 200 {
		// Read error body for debugging
		var errResp struct {
			Error            string `json:"error"`
			ErrorDescription string `json:"error_description"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		log.Printf("🍎 ERROR: Apple token endpoint error: %d - %s: %s", resp.StatusCode, errResp.Error, errResp.ErrorDescription)
		return nil, fmt.Errorf("apple token endpoint status %d: %s - %s", resp.StatusCode, errResp.Error, errResp.ErrorDescription)
	}

	var tr AppleTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tr); err != nil {
		log.Printf("🍎 ERROR: Failed to decode token response: %v", err)
		return nil, fmt.Errorf("decode token response: %w", err)
	}

	if tr.IDToken == "" {
		log.Printf("🍎 ERROR: Received empty id_token from Apple")
		return nil, errors.New("empty id_token from apple")
	}

	log.Printf("🍎 ✅ Token exchange successful, IDToken received")
	return &tr, nil
}

// AppleTokenResponse represents Apple's token endpoint response
type AppleTokenResponse struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
}

// ParseClaims parses and validates the ID token from Apple
// Returns: sub (user ID), email, nonce, emailVerified, error
func (s *AppleService) ParseClaims(idToken string) (sub, email, nonce string, emailVerified bool, err error) {
	log.Printf("🍎 ParseClaims: Starting to parse ID token (length: %d)", len(idToken))

	// Use library's GetClaims for proper validation
	claim, err := apple.GetClaims(idToken)
	if err != nil {
		log.Printf("🍎 ERROR: Failed to get claims: %v", err)
		return "", "", "", false, fmt.Errorf("get claims: %w", err)
	}

	log.Printf("🍎 Claims received, parsing...")

	// Helper to safely extract string values
	get := func(k string) string {
		if v, ok := (*claim)[k]; ok && v != nil {
			return fmt.Sprint(v)
		}
		return ""
	}

	sub = get("sub")
	email = get("email")
	nonce = get("nonce")
	emailVerifiedStr := get("email_verified")
	emailVerified = strings.EqualFold(emailVerifiedStr, "true")

	// Safely log nonce (truncated for security)
	nonceLog := "none"
	if len(nonce) > 8 {
		nonceLog = nonce[:8] + "..."
	} else if nonce != "" {
		nonceLog = nonce
	}
	log.Printf("🍎 Parsed claims: sub=%s, email=%s, nonce=%s, emailVerified=%v", sub, email, nonceLog, emailVerified)

	if sub == "" {
		log.Printf("🍎 ERROR: Missing sub claim in id_token")
		return "", "", "", false, errors.New("missing sub claim in id_token")
	}

	log.Printf("🍎 ✅ Claims parsed successfully")
	return sub, email, nonce, emailVerified, nil
}

// RefreshClientSecret regenerates the client_secret (call periodically, e.g., every 5 months)
func (s *AppleService) RefreshClientSecret() error {
	// Read private key as string
	var pkPEM string
	if p := strings.TrimSpace(s.cfg.PrivateKeyPath); p != "" {
		b, err := os.ReadFile(p)
		if err != nil {
			return fmt.Errorf("read private key: %w", err)
		}
		pkPEM = string(b)
	} else {
		s := strings.TrimSpace(s.cfg.PrivateKey)
		if s == "" {
			return errors.New("private key not set")
		}
		s = strings.ReplaceAll(s, `\n`, "\n")
		pkPEM = s
	}

	cs, err := apple.GenerateClientSecret(
		pkPEM,
		s.cfg.TeamID,
		s.cfg.ClientID,
		s.cfg.KeyID,
	)
	if err != nil {
		return fmt.Errorf("generate client_secret: %w", err)
	}

	s.secret = cs
	log.Printf("✅ Apple client_secret refreshed")
	return nil
}
