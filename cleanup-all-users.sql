-- Cleanup all users except admin
-- Keeps: kyvaldov@gmail.com (admin)

BEGIN;

-- Delete all OAuth identities
DELETE FROM user_oauth_identities 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all sessions
DELETE FROM sessions 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all verification codes
DELETE FROM verification_codes 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all referral invitations
DELETE FROM referral_invitations 
WHERE referrer_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all referral rewards
DELETE FROM referral_rewards 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all referral codes
DELETE FROM referral_codes 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all media
DELETE FROM media 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all bookmarks
DELETE FROM bookmarks 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all retweets
DELETE FROM retweets 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all likes
DELETE FROM likes 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all follows (both follower and following)
DELETE FROM follows 
WHERE follower_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
)
OR following_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all posts
DELETE FROM posts 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Delete all notifications (both to and from deleted users)
DELETE FROM notifications 
WHERE user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
)
OR from_user_id IN (
    SELECT id FROM users WHERE email != 'kyvaldov@gmail.com'
);

-- Finally, delete all users except admin
DELETE FROM users WHERE email != 'kyvaldov@gmail.com';

COMMIT;

-- Show remaining users
SELECT id, username, email, role, is_email_verified, created_at 
FROM users 
ORDER BY created_at;
