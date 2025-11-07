-- 🔐 Создание пользователя db_agent с IAM аутентификацией
-- =========================================================
-- Этот скрипт должен быть выполнен от имени postgres (master user)
-- через psql или TablePlus

-- 1. Создать пользователя db_agent с правами IAM
CREATE USER db_agent WITH LOGIN;

-- 2. Выдать роль rds_iam (требуется для IAM аутентификации)
GRANT rds_iam TO db_agent;

-- 3. Выдать роль rds_superuser (полный административный доступ)
GRANT rds_superuser TO db_agent;

-- 4. Выдать все привилегии на базу данных
GRANT ALL PRIVILEGES ON DATABASE tyriantrade TO db_agent;

-- 5. Переключиться в базу tyriantrade
\c tyriantrade

-- 6. Выдать права на все существующие таблицы
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_agent;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO db_agent;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO db_agent;

-- 7. Выдать права на будущие объекты
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON TABLES TO db_agent;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON SEQUENCES TO db_agent;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL PRIVILEGES ON FUNCTIONS TO db_agent;

-- 8. Проверить созданного пользователя
SELECT 
    usename AS username,
    usesuper AS is_superuser,
    usecreatedb AS can_create_db,
    usecreaterole AS can_create_role
FROM pg_user 
WHERE usename = 'db_agent';

-- 9. Проверить роли пользователя
SELECT 
    r.rolname as role_name
FROM pg_roles r
JOIN pg_auth_members m ON r.oid = m.roleid
JOIN pg_roles u ON u.oid = m.member
WHERE u.rolname = 'db_agent';

-- ✅ После выполнения этого скрипта пользователь db_agent:
--    - Готов к IAM аутентификации (роль rds_iam)
--    - Имеет полный административный доступ (роль rds_superuser)
--    - Может выполнять любые операции в базе данных
