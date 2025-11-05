#!/bin/bash

# Скрипт для создания пользователя db_agent через ECS задачу
# Пользователь db_agent будет использоваться для IAM аутентификации

set -e

echo "🔧 Создание пользователя db_agent для IAM аутентификации..."
echo "=============================================="

# Получаем ID задачи
TASK_ARN=$(aws ecs list-tasks \
    --cluster tyriantrade-cluster \
    --service-name tyriantrade-backend-service \
    --region us-east-1 \
    --query 'taskArns[0]' \
    --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo "❌ Нет запущенных задач"
    exit 1
fi

echo "✅ Задача найдена: $TASK_ARN"

# SQL команды для создания пользователя
SQL_COMMANDS="
DO \$\$
BEGIN
    -- Проверяем, существует ли пользователь
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'db_agent') THEN
        -- Создаём пользователя
        CREATE ROLE db_agent WITH LOGIN;
        RAISE NOTICE 'Пользователь db_agent создан';
    ELSE
        RAISE NOTICE 'Пользователь db_agent уже существует';
    END IF;

    -- Даём права для IAM авторизации
    GRANT rds_iam TO db_agent;
    
    -- Даём права на базу данных
    GRANT CONNECT ON DATABASE tyriantrade TO db_agent;
    
    -- Даём права на схему public
    GRANT USAGE ON SCHEMA public TO db_agent;
    
    -- Даём права на все таблицы в public
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO db_agent;
    
    -- Даём права на все последовательности
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO db_agent;
    
    -- Автоматически давать права на новые таблицы
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO db_agent;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO db_agent;
    
    RAISE NOTICE 'Права назначены успешно';
END
\$\$;

-- Проверка
SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname = 'db_agent';
"

echo ""
echo "📝 Выполнение SQL команд..."
echo ""

# Выполняем SQL через ECS Exec
aws ecs execute-command \
    --cluster tyriantrade-cluster \
    --task "$TASK_ARN" \
    --container tyriantrade-backend \
    --region us-east-1 \
    --interactive \
    --command "psql \$DATABASE_URL -c \"$SQL_COMMANDS\""

echo ""
echo "✅ Готово!"
echo ""
echo "Теперь можно подключиться используя IAM токен:"
echo ""
echo "export PGPASSWORD=\"\$(aws rds generate-db-auth-token \\"
echo "  --hostname tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \\"
echo "  --port 5432 --region us-east-1 --username db_agent)\""
echo ""
echo "psql \"host=tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \\"
echo "      port=5432 dbname=tyriantrade user=db_agent \\"
echo "      sslmode=require\""
