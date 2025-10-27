-- Добавление полей безопасности для постов и медиа
-- Migration: 004_add_security_fields
-- Created: 2025-10-27

-- Добавляем content_html для санитизированного HTML контента
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_html TEXT;

-- Добавляем поля безопасности для медиа
ALTER TABLE media ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'processing';
ALTER TABLE media ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;
ALTER TABLE media ADD COLUMN IF NOT EXISTS original_hash VARCHAR(100);

-- Создаём индекс для быстрого поиска по статусу медиа
CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);

-- Обновляем существующие медиа до статуса "ready"
UPDATE media SET status = 'ready', processed_at = created_at WHERE status IS NULL OR status = 'processing';

-- Комментарии для документации
COMMENT ON COLUMN posts.content_html IS 'Sanitized HTML version of the content';
COMMENT ON COLUMN media.status IS 'Processing status: processing, ready, failed';
COMMENT ON COLUMN media.processed_at IS 'When the media processing was completed';
COMMENT ON COLUMN media.original_hash IS 'Perceptual hash for duplicate detection';
