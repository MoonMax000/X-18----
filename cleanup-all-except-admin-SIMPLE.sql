-- ============================================
-- ПРОСТАЯ ОЧИСТКА БЕЗ ТРАНЗАКЦИИ
-- ============================================
-- Выполняйте команды по одной, нажимая Cmd+Enter на каждой
-- ============================================

-- ШАГ 1: Проверка (сколько пользователей)
SELECT COUNT(*) as total_users FROM users;

-- ШАГ 2: Кто админ
SELECT id, username, email, role FROM users WHERE username = 'admin' OR role = 'admin';

-- ШАГ 3: Сколько будет удалено
SELECT COUNT(*) as users_to_delete FROM users WHERE username != 'admin' AND role != 'admin';

-- ============================================
-- УДАЛЕНИЕ (выполняйте по одной команде)
-- ============================================

-- 1. Коды верификации
DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 2. Сессии
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 3. Попытки входа
DELETE FROM login_attempts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 4. Лайки постов
DELETE FROM post_likes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 5. Комментарии
DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 6. Посты
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 7. Подписки
DELETE FROM follows WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 8. Использования реферальных кодов
DELETE FROM referral_uses WHERE referrer_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR referred_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 9. Реферальные коды
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 10. OAuth идентификаторы
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 11. Уведомления
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 12. Настройки уведомлений
DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 13. Подписки
DELETE FROM subscriptions WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');

-- 14. ФИНАЛ: Пользователи (кроме админа)
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

-- ============================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Сколько пользователей осталось (должен быть 1)
SELECT COUNT(*) as remaining_users FROM users;

-- Кто остался
SELECT id, username, email, role FROM users;
