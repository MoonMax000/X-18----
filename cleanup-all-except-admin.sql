-- ============================================
-- Очистка базы данных (все кроме админа)
-- ============================================
-- ВНИМАНИЕ: Эта операция НЕОБРАТИМА!
-- Рекомендуется сделать бэкап перед выполнением
-- ============================================

-- Проверка: сколько пользователей будет удалено
SELECT COUNT(*) as users_to_delete 
FROM users 
WHERE username != 'admin' AND role != 'admin';

-- Проверка: какой пользователь останется
SELECT id, username, email, role 
FROM users 
WHERE username = 'admin' OR role = 'admin';

-- ============================================
-- ВАРИАНТ 1: Быстрая очистка (если настроен CASCADE)
-- ============================================
-- Раскомментируйте следующую строку для выполнения:
-- DELETE FROM users WHERE username != 'admin' AND role != 'admin';

-- ============================================
-- ВАРИАНТ 2: Транзакционная очистка (БЕЗОПАСНО)
-- ============================================
-- Выполните все команды вместе, затем COMMIT или ROLLBACK

BEGIN;

-- 1. Удаление кодов верификации
DELETE FROM verification_codes 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 2. Удаление сессий
DELETE FROM sessions 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 3. Удаление попыток входа
DELETE FROM login_attempts 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 4. Удаление лайков постов
DELETE FROM post_likes 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 5. Удаление комментариев
DELETE FROM comments 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 6. Удаление постов
DELETE FROM posts 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 7. Удаление подписок
DELETE FROM follows 
WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin')
   OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 8. Удаление использований реферальных кодов
DELETE FROM referral_uses 
WHERE referrer_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin')
   OR referred_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 9. Удаление реферальных кодов
DELETE FROM referral_codes 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 10. Удаление OAuth идентификаторов
DELETE FROM user_oauth_identities 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 11. Удаление уведомлений
DELETE FROM notifications 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 12. Удаление настроек уведомлений
DELETE FROM notification_preferences 
WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 13. Удаление подписок
DELETE FROM subscriptions 
WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin')
   OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 14. ФИНАЛ: Удаление пользователей
DELETE FROM users 
WHERE username != 'admin' AND role != 'admin';

-- Проверка результата
SELECT COUNT(*) as remaining_users FROM users;
SELECT username, email, role FROM users;

-- Если все правильно - закоммитить:
COMMIT;

-- Если что-то не так - откатить изменения:
-- ROLLBACK;
