#!/bin/bash

# Скрипт для автоматического получения DATABASE_URL из Railway

echo "🔑 Получение DATABASE_URL из Railway..."
echo ""

# Проверяем, установлен ли Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo ""
    echo "📥 Установите Railway CLI:"
    echo "npm install -g @railway/cli"
    echo ""
    echo "Или используйте инструкцию в файле КАК_ПОЛУЧИТЬ_РЕАЛЬНЫЙ_DATABASE_URL.md"
    exit 1
fi

echo "✅ Railway CLI установлен"
echo ""

# Проверяем, залогинен ли пользователь
echo "🔐 Проверка авторизации..."
if ! railway whoami &> /dev/null; then
    echo "❌ Вы не авторизованы в Railway"
    echo ""
    echo "Выполните команду:"
    echo "railway login"
    echo ""
    exit 1
fi

echo "✅ Вы авторизованы"
echo ""

# Проверяем, линкнут ли проект
echo "🔗 Проверка связи с проектом..."
if ! railway status &> /dev/null; then
    echo "❌ Проект не связан"
    echo ""
    echo "Выполните команду:"
    echo "railway link"
    echo ""
    echo "И выберите проект X-18----"
    exit 1
fi

echo "✅ Проект связан"
echo ""

# Получаем DATABASE_URL
echo "📡 Получение DATABASE_URL..."
echo ""

# Пытаемся получить через railway variables
DATABASE_URL=$(railway variables --service postgres 2>/dev/null | grep "DATABASE_URL" | cut -d'=' -f2- | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Не удалось получить DATABASE_URL"
    echo ""
    echo "Попробуйте вручную:"
    echo "railway variables --service postgres"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL получен!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Ваш DATABASE_URL:"
echo ""
echo "$DATABASE_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Сохраняем в файл
echo "$DATABASE_URL" > .database-url-temp
echo "✅ Сохранено в .database-url-temp"
echo ""

# Предлагаем выполнить команды
echo "🚀 Теперь вы можете выполнить:"
echo ""
echo "1️⃣ Применить миграцию:"
echo "psql \"\$(cat .database-url-temp)\" -f custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql"
echo ""
echo "2️⃣ Сделать себя админом (замените YOUR_EMAIL):"
echo "psql \"\$(cat .database-url-temp)\" -c \"UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';\""
echo ""
echo "3️⃣ Проверить результат:"
echo "psql \"\$(cat .database-url-temp)\" -c \"SELECT id, email, role FROM users;\""
echo ""

# Спрашиваем, хочет ли пользователь сразу применить миграцию
read -p "❓ Применить миграцию сейчас? (y/n): " apply_migration

if [ "$apply_migration" = "y" ] || [ "$apply_migration" = "Y" ]; then
    echo ""
    echo "📦 Применяю миграцию..."
    psql "$DATABASE_URL" -f custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Миграция успешно применена!"
        echo ""
        
        # Спрашиваем email для админа
        read -p "📧 Введите ваш email для назначения админом: " user_email
        
        if [ ! -z "$user_email" ]; then
            echo ""
            echo "👑 Назначаю вас админом..."
            psql "$DATABASE_URL" -c "UPDATE users SET role = 'admin' WHERE email = '$user_email';"
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Теперь вы админ!"
                echo ""
                echo "🎉 Все готово! Админ-панель доступна по адресу:"
                echo "https://x-18-production.netlify.app/admin"
            fi
        fi
    fi
fi

echo ""
echo "🧹 Очистка временного файла..."
rm -f .database-url-temp
echo ""
echo "✨ Готово!"
