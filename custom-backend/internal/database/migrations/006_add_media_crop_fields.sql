-- Migration: Add crop/transform support to media table
-- Date: 2025-10-27
-- Description: Adds transform (crop data) and original_url fields to support image editing

-- Add transform column to store crop coordinates and settings as JSON
ALTER TABLE media ADD COLUMN IF NOT EXISTS transform TEXT;

-- Add original_url column to preserve original image URL before crop
ALTER TABLE media ADD COLUMN IF NOT EXISTS original_url VARCHAR(500);

-- Add comment for documentation
COMMENT ON COLUMN media.transform IS 'JSON string containing crop coordinates and transform settings from MediaEditor';
COMMENT ON COLUMN media.original_url IS 'URL to original uncropped image file';
