#!/bin/bash

# ================================================
# AWS CloudShell - Точные Команды для Подключения
# ================================================

echo "🔍 Шаг 1: Проверка connectivity к RDS..."
nc -zv tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com 5432

if [ $? -eq 0 ]; then
    echo "✅ Подключение возможно! Пробуем подключиться к БД..."
    
    # Шаг 2: Подключение к БД
    PGPASSWORD=':qA7(lzYV<>:PXT<fW*:><JzEI8u=bpO' psql \
      -h tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
      -U dbadmin \
      -d tyriantrade \
      -p 5432
    
    echo ""
    echo "✅ Подключение установлено!"
    echo ""
    echo "Теперь выполните SQL команды для очистки:"
    echo ""
    echo "BEGIN;"
    echo "DELETE FROM notifications;"
    echo "DELETE FROM sessions;"
    echo "DELETE FROM login_attempts;"
    echo "DELETE FROM ip_lockouts;"
    echo "DELETE FROM referral_codes;"
    echo "DELETE FROM follows;"
    echo "DELETE FROM comments;"
    echo "DELETE FROM likes;"
    echo "DELETE FROM media;"
    echo "DELETE FROM posts;"
    echo "DELETE FROM users;"
    echo "SELECT COUNT(*) FROM users;"
    echo "COMMIT;"
else
    echo "❌ Подключение невозможно - RDS в приватном VPC"
    echo ""
    echo "🎯 САМОЕ ПРОСТОЕ РЕШЕНИЕ:"
    echo ""
    echo "1. Откройте: https://social.tyriantrade.com"
    echo "2. Нажмите 'Sign in with Google'"
    echo "3. В модале введите пароль"
    echo "4. ✅ При следующем входе - АВТОМАТИЧЕСКИЙ вход БЕЗ модала!"
    echo ""
    echo "Это займет 5 секунд и не требует танцев с БД! 🚀"
fi
