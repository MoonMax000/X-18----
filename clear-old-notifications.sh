#!/bin/bash

echo "🗑️  Удаление старых уведомлений из базы данных..."

# Connect to PostgreSQL and delete all notifications
psql -d custom_backend_db -c "DELETE FROM notifications;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Старые уведомления удалены"
    echo ""
    echo "📝 Теперь создайте новые уведомления:"
    echo "   1. Откройте http://localhost:5173"
    echo "   2. Войдите под одним пользователем"
    echo "   3. Лайкните пост другого пользователя"
    echo "   4. Подпишитесь на другого пользователя"
    echo "   5. Напишите комментарий"
    echo ""
    echo "Новые уведомления будут созданы с правильной структурой!"
else
    echo "❌ Ошибка при удалении. Попробуйте вручную:"
    echo "   psql -d custom_backend_db -c \"DELETE FROM notifications;\""
fi
