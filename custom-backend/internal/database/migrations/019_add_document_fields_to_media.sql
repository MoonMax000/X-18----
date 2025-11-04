-- Add document-specific fields to media table
ALTER TABLE media
ADD COLUMN IF NOT EXISTS file_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_extension VARCHAR(10);

-- Update comment on type column to include document type
COMMENT ON COLUMN media.type IS 'Media type: image, video, gif, document';
