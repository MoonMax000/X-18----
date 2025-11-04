-- ================================================
-- ОЧИСТКА ВСЕХ ПОЛЬЗОВАТЕЛЕЙ КРОМЕ ADMIN
-- ================================================
-- Email: kyvaldov@gmail.com
-- Password: Admin123! (ИЗМЕНИТЕ после первого входа!)
-- ================================================

BEGIN;

-- 1. Удалить все связанные данные
DELETE FROM notifications WHERE user_id != '00000000-0000-0000-0000-000000000001';
DELETE FROM sessions WHERE user_id != '00000000-0000-0000-0000-000000000001';
DELETE FROM login_attempts WHERE user_id != '00000000-0000-0000-0000-000000000001';
DELETE FROM ip_lockouts;
DELETE FROM referral_codes WHERE user_id != '00000000-0000-0000-0000-000000000001';
DELETE FROM follows;
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM media;
DELETE FROM posts;

-- 2. Удалить всех пользователей КРОМЕ admin
DELETE FROM users WHERE id != '00000000-0000-0000-0000-000000000001';

-- 3. Проверить результат
SELECT 
  'users' as table_name, 
  COUNT(*) as remaining_rows,
  'Admin: kyvaldov@gmail.com' as note
FROM users
UNION ALL
SELECT 'posts', COUNT(*), '' FROM posts
UNION ALL
SELECT 'sessions', COUNT(*), '' FROM sessions
UNION ALL
SELECT 'referral_codes', COUNT(*), '' FROM referral_codes;

-- 4. Показать admin пользователя
SELECT 
  username,
  email,
  role,
  'Password: Admin123!' as password_hint
FROM users 
WHERE email = 'kyvaldov@gmail.com';

COMMIT;

-- После выполнения:
-- Email: kyvaldov@gmail.com
-- Password: Admin123!
-- 
-- ⚠️ ОБЯЗАТЕЛЬНО СМЕНИТЕ ПАРОЛЬ после первого входа!
