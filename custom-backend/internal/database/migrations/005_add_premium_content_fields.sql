-- Добавление полей для премиум контента (Phase 2)
-- Migration: 005_add_premium_content_fields
-- Created: 2025-10-27

-- Добавляем поля премиум контента в posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS preview_text TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT;

-- Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_posts_is_premium ON posts(is_premium);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Комментарии для документации
COMMENT ON COLUMN posts.is_premium IS 'Is this premium (paid) content';
COMMENT ON COLUMN posts.price_cents IS 'Price in cents (100 = $1.00)';
COMMENT ON COLUMN posts.preview_text IS 'Preview text for non-subscribers';
COMMENT ON COLUMN posts.category IS 'Content category for filtering';
COMMENT ON COLUMN posts.tags IS 'Comma-separated tags';
