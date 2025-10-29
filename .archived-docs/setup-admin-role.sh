#!/bin/bash

# Скрипт для назначения роли admin пользователю в production БД на Railway

echo "👤 Назначение роли администратора..."
echo ""

# Проверяем наличие Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo ""
    echo "📦 Установка Railway CLI:"
    echo "  macOS: brew install railway"
    echo "  Windows: npm install -g @railway/cli"
    echo "  Linux: npm install -g @railway/cli"
    echo ""
    exit 1
fi

echo "✅ Railway CLI обнаружен"
echo ""

# Проверяем что мы залогинены
echo "🔐 Проверка авторизации Railway..."
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Вы не авторизованы в Railway"
    echo ""
    echo "Выполните: railway login"
    echo ""
    exit 1
fi

echo "✅ Авторизация подтверждена"
echo ""

# Проверяем что проект связан
echo "🔗 Проверка связи с проектом..."
railway status &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Проект не связан с Railway"
    echo ""
    echo "Выполните: railway link"
    echo ""
    exit 1
fi

echo "✅ Проект связан"
echo ""

# Запрашиваем email пользователя
echo "📧 Введите email пользователя, которому нужно назначить роль admin:"
read -p "Email: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Email не может быть пустым"
    exit 1
fi

echo ""
echo "🔍 Поиск пользователя с email: $USER_EMAIL"
echo ""

# Назначаем роль admin
railway run psql \$DATABASE_URL << EOF

-- Проверяем существует ли пользователь
SELECT id, username, email, role 
FROM users 
WHERE email = '$USER_EMAIL';

-- Назначаем роль admin
UPDATE users 
SET role = 'admin' 
WHERE email = '$USER_EMAIL';

-- Показываем результат
SELECT id, username, email, role 
FROM users 
WHERE email = '$USER_EMAIL';

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Роль admin успешно назначена пользователю: $USER_EMAIL"
    echo ""
    echo "📝 Важно:"
    echo "  1. Пользователь должен перезайти в приложение (выйти и войти снова)"
    echo "  2. После входа JWT токен обновится с новой ролью"
    echo "  3. Теперь пользователь может удалять любые посты через меню поста"
    echo ""
echo "🧪 Для тестирования:"
echo "  1. Откройте https://social.tyriantrade.com"
    echo "  2. Войдите под этим аккаунтом"
    echo "  3. Откройте чужой пост"
    echo "  4. Нажмите на три точки (⋮)"
    echo "  5. Должна появиться кнопка 'Удалить (admin)'"
    echo ""
else
    echo ""
    echo "❌ Ошибка при назначении роли admin"
    echo ""
    echo "Возможные причины:"
    echo "  - Пользователь с таким email не найден"
    echo "  - Проблема с подключением к БД"
    echo ""
    exit 1
fi
