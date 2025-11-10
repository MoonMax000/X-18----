package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// GeoIPData represents geolocation information from IP address
type GeoIPData struct {
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	City        string `json:"city"`
	Region      string `json:"region"`
	Timezone    string `json:"timezone"`
	IP          string `json:"ip"`
}

// ip-api.com response structure
type IPAPIResponse struct {
	Status      string `json:"status"`
	Country     string `json:"country"`
	CountryCode string `json:"countryCode"`
	Region      string `json:"region"`
	RegionName  string `json:"regionName"`
	City        string `json:"city"`
	Timezone    string `json:"timezone"`
	Query       string `json:"query"`
	Message     string `json:"message"`
}

// GetGeoIPData fetches geolocation data from IP address using ip-api.com
// This is a free service with rate limiting (45 requests per minute)
// For production with high traffic, consider using a paid service or self-hosted GeoIP database
func GetGeoIPData(ipAddress string) (*GeoIPData, error) {
	// Skip geolocation for localhost/private IPs
	if ipAddress == "127.0.0.1" || ipAddress == "::1" || ipAddress == "" {
		return &GeoIPData{
			Country:     "Local",
			CountryCode: "LC",
			City:        "Localhost",
			Region:      "Local",
			Timezone:    "UTC",
			IP:          ipAddress,
		}, nil
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	// Use ip-api.com free API (no auth required, 45 req/min limit)
	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,message,country,countryCode,region,regionName,city,timezone,query", ipAddress)

	// Make request
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch GeoIP data: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read GeoIP response: %w", err)
	}

	// Parse JSON response
	var apiResp IPAPIResponse
	if err := json.Unmarshal(body, &apiResp); err != nil {
		return nil, fmt.Errorf("failed to parse GeoIP response: %w", err)
	}

	// Check if request was successful
	if apiResp.Status != "success" {
		return nil, fmt.Errorf("GeoIP API error: %s", apiResp.Message)
	}

	// Convert to our format
	geoData := &GeoIPData{
		Country:     apiResp.Country,
		CountryCode: apiResp.CountryCode,
		City:        apiResp.City,
		Region:      apiResp.RegionName,
		Timezone:    apiResp.Timezone,
		IP:          apiResp.Query,
	}

	return geoData, nil
}

// GetGeoIPDataSafe is a safe version that returns nil on error instead of failing
// This is useful when GeoIP is not critical for the operation
func GetGeoIPDataSafe(ipAddress string) *GeoIPData {
	data, err := GetGeoIPData(ipAddress)
	if err != nil {
		// Log error but don't fail the operation
		// You can add logging here if needed
		return nil
	}
	return data
}

// FormatLocation creates a human-readable location string
func FormatLocation(geoData *GeoIPData) string {
	if geoData == nil {
		return "Unknown Location"
	}

	if geoData.City != "" && geoData.Country != "" {
		return fmt.Sprintf("%s, %s", geoData.City, geoData.Country)
	}

	if geoData.Country != "" {
		return geoData.Country
	}

	return "Unknown Location"
}
