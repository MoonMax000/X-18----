# Инструкция по очистке базы данных через TablePlus

## ⚠️ ВАЖНО: Прочитайте перед выполнением

Эта операция **НЕОБРАТИМА**. Будут удалены все пользователи, кроме админа, и все связанные с ними данные.

## Подготовка

### 1. Найдите ID админа
Сначала узнайте ID вашего админа:

```sql
SELECT id, username, email, role 
FROM users 
WHERE username = 'admin' OR role = 'admin';
```

Запишите `id` - он понадобится для следующих команд.

## Вариант 1: Быстрая очистка (РЕКОМЕНДУЕТСЯ)

Если в вашей базе данных настроены `ON DELETE CASCADE` для foreign keys, выполните:

```sql
-- Удалить всех пользователей, кроме админа
DELETE FROM users 
WHERE username != 'admin' AND role != 'admin';
```

Эта команда автоматически удалит все связанные данные благодаря каскадному удалению.

## Вариант 2: Пошаговая очистка (БЕЗОПАСНЕЕ)

Если каскадное удаление не настроено или вы хотите больше контроля, выполните команды по порядку:

### Шаг 1: Удаление данных верификации и сессий

```sql
-- Удалить коды верификации для не-админов
DELETE FROM verification_codes 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить сессии для не-админов
DELETE FROM sessions 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить логи входа для не-админов
DELETE FROM login_attempts 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);
```

### Шаг 2: Удаление социального контента

```sql
-- Удалить лайки от не-админов
DELETE FROM post_likes 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить комментарии от не-админов
DELETE FROM comments 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить посты не-админов
DELETE FROM posts 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить подписки не-админов
DELETE FROM follows 
WHERE follower_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
)
OR following_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);
```

### Шаг 3: Удаление реферальных данных

```sql
-- Удалить использования реферальных кодов
DELETE FROM referral_uses 
WHERE referrer_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
)
OR referred_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить реферальные коды не-админов
DELETE FROM referral_codes 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);
```

### Шаг 4: Удаление OAuth данных

```sql
-- Удалить OAuth идентификаторы не-админов
DELETE FROM user_oauth_identities 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);
```

### Шаг 5: Удаление уведомлений и подписок

```sql
-- Удалить уведомления не-админов
DELETE FROM notifications 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить настройки уведомлений не-админов
DELETE FROM notification_preferences 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);

-- Удалить подписки не-админов
DELETE FROM subscriptions 
WHERE subscriber_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
)
OR subscribed_to_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);
```

### Шаг 6: Удаление пользователей

```sql
-- ФИНАЛЬНЫЙ ШАГ: Удалить всех пользователей, кроме админа
DELETE FROM users 
WHERE username != 'admin' AND role != 'admin';
```

## Вариант 3: Одна большая транзакция (САМЫЙ БЕЗОПАСНЫЙ)

Этот вариант позволяет откатить изменения, если что-то пойдет не так:

```sql
BEGIN;

-- Удаление всех данных
DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM login_attempts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM post_likes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM follows WHERE follower_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR following_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM referral_uses WHERE referrer_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR referred_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM referral_codes WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM user_oauth_identities WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM subscriptions WHERE subscriber_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin') OR subscribed_to_id IN (SELECT id FROM users WHERE username != 'admin' AND role != 'admin');
DELETE FROM users WHERE username != 'admin' AND role != 'admin';

-- Проверьте результаты
SELECT COUNT(*) as remaining_users FROM users;

-- Если все ОК, закоммитьте:
COMMIT;

-- Если что-то не так, откатите:
-- ROLLBACK;
```

## Проверка результата

После выполнения очистки проверьте:

```sql
-- Сколько пользователей осталось (должен быть только 1 - админ)
SELECT COUNT(*) as total_users FROM users;

-- Проверить, что остался только админ
SELECT id, username, email, role, created_at 
FROM users;

-- Проверить количество связанных записей
SELECT 
    (SELECT COUNT(*) FROM sessions) as sessions_count,
    (SELECT COUNT(*) FROM posts) as posts_count,
    (SELECT COUNT(*) FROM comments) as comments_count,
    (SELECT COUNT(*) FROM follows) as follows_count;
```

## Как использовать в TablePlus

### Способ 1: Query Tab
1. Откройте TablePlus и подключитесь к базе данных
2. Нажмите `Cmd+T` (Mac) или `Ctrl+T` (Windows) для создания новой вкладки Query
3. Вставьте нужный SQL код
4. Нажмите `Cmd+Enter` (Mac) или `Ctrl+Enter` (Windows) для выполнения

### Способ 2: SQL Console
1. В TablePlus нажмите на кнопку "SQL" внизу окна
2. Вставьте SQL команды
3. Выделите нужные строки
4. Нажмите `Cmd+Enter` или `Ctrl+Enter`

## Восстановление из бэкапа (если нужно)

Если вы случайно удалили что-то не то:

```sql
-- Если вы использовали BEGIN/COMMIT и еще не закоммитили:
ROLLBACK;

-- Если уже закоммитили, нужно восстанавливать из бэкапа базы данных
-- Создайте бэкап ПЕРЕД выполнением очистки!
```

## Создание бэкапа перед очисткой

**НАСТОЯТЕЛЬНО РЕКОМЕНДУЕТСЯ** сделать бэкап перед очисткой:

```bash
# Через командную строку (если есть доступ)
pg_dump -h your-rds-endpoint.amazonaws.com -U your-username -d your-database > backup_before_cleanup.sql

# Или в TablePlus:
# File → Export → SQL Dump
```

## Альтернатива: Через AWS Console

Можно сделать snapshot RDS перед очисткой:

1. Откройте AWS Console → RDS
2. Выберите вашу базу данных
3. Actions → Take snapshot
4. Дождитесь завершения создания snapshot
5. Теперь можно безопасно выполнять очистку

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Всегда делайте бэкап перед массовым удалением**
2. **Используйте транзакции (BEGIN/COMMIT/ROLLBACK) для безопасности**
3. **Проверьте, что username админа точно 'admin'**
4. **После очистки перезапустите бэкенд, если нужно**
5. **Некоторые таблицы могут отсутствовать в вашей схеме - это нормально**

## Дополнительные таблицы

Если в вашей базе есть дополнительные таблицы, добавьте их в очистку:

```sql
-- Пример для дополнительных таблиц
DELETE FROM table_name 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE username != 'admin' AND role != 'admin'
);
