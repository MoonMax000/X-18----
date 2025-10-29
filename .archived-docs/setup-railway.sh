#!/bin/bash

# Скрипт для настройки Railway проекта
# Выполните: chmod +x setup-railway.sh && ./setup-railway.sh

echo "🚂 Настройка Railway проекта..."
echo ""

# 1. Генерируем JWT секрет
echo "🔐 Генерация JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET создан: $JWT_SECRET"
echo ""

# 2. Открываем проект в браузере для настройки Root Directory
echo "📂 Откроется браузер для настройки Root Directory..."
echo "В браузере:"
echo "  1. Перейдите в Settings → Service Settings"
echo "  2. Установите Root Directory: custom-backend"
echo "  3. Сохраните настройки"
echo ""
read -p "Нажмите Enter когда настроите Root Directory..."
railway open
echo ""

# 3. Устанавливаем переменные окружения
echo "⚙️  Установка переменных окружения..."
echo "Откроется браузер для каждой переменной окружения..."
echo ""

# Новый синтаксис Railway CLI
railway variables --set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables --set PORT=8080
railway variables --set GIN_MODE=release
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set RESEND_API_KEY='re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh'
railway variables --set EMAIL_FROM='noreply@tyriantrade.com'

echo "✅ Переменные окружения установлены"
echo ""

# 4. Деплой на Railway
echo "🚀 Деплой backend на Railway..."
railway up

echo ""
echo "✅ Backend задеплоен!"
echo ""

# 5. Генерация публичного домена
echo "🌐 Генерация публичного домена..."
railway domain

echo ""
echo "🎉 Railway настроен!"
echo ""
echo "📝 ВАЖНО: Сохраните URL вашего backend (показан выше)"
echo "Он понадобится для настройки frontend на Netlify"
echo ""
