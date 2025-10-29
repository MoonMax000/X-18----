-- Проверяем текущие таблицы
\dt

-- Применяем миграцию 007
\i custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql

-- Показываем всех пользователей
SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC;

-- ВАЖНО: Замените 'your-email@example.com' на ваш реальный email!
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- После замены email, раскомментируйте строку выше (удалите --) и выполните

-- Проверяем результат
SELECT id, email, username, role FROM users WHERE role = 'admin';
