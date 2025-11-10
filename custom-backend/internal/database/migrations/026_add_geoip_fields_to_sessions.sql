-- Migration: Add GeoIP location fields to sessions table
-- Description: Adds country, city, region and timezone fields for session tracking

-- Add GeoIP location fields to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- Add index on country_code for potential analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_country ON sessions(country_code);

-- Add comments for documentation
COMMENT ON COLUMN sessions.country IS 'Country name detected from IP address using GeoIP';
COMMENT ON COLUMN sessions.country_code IS 'ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN sessions.city IS 'City name detected from IP address';
COMMENT ON COLUMN sessions.region IS 'Region/State detected from IP address';
COMMENT ON COLUMN sessions.timezone IS 'Timezone detected from IP address';
