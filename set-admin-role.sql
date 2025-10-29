-- Скрипт для установки роли администратора пользователю admin

-- Показать всех пользователей и их роли
SELECT id, username, email, role FROM users;

-- Установить роль admin для пользователя с username 'admin'
UPDATE users 
SET role = 'admin' 
WHERE username = 'admin';

-- Проверить результат
SELECT id, username, email, role FROM users WHERE username = 'admin';
