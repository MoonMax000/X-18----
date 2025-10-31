-- Миграция: добавление полей content и status в таблицу news
-- Дата: 31.10.2025

-- Добавляем поле content для полного текста новости
ALTER TABLE news ADD COLUMN IF NOT EXISTS content TEXT;

-- Добавляем поле status для статуса публикации (draft/published)
ALTER TABLE news ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Создаем индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);

-- Обновляем существующие записи: если is_active = true, то status = 'published', иначе 'draft'
UPDATE news 
SET status = CASE 
    WHEN is_active = true THEN 'published' 
    ELSE 'draft' 
END
WHERE status IS NULL OR status = '';

-- Делаем поле URL опциональным (убираем NOT NULL если есть)
ALTER TABLE news ALTER COLUMN url DROP NOT NULL;

-- Комментарии к полям
COMMENT ON COLUMN news.content IS 'Полный текст новости для отображения на странице /news/:id';
COMMENT ON COLUMN news.status IS 'Статус публикации: draft (черновик) или published (опубликована)';
COMMENT ON COLUMN news.url IS 'Внешняя ссылка на источник (опционально)';
