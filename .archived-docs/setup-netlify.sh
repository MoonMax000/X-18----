#!/bin/bash

# Скрипт для настройки Netlify проекта
# Выполните: chmod +x setup-netlify.sh && ./setup-netlify.sh

echo "🎨 Настройка Netlify проекта..."
echo ""

# Проверяем что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден"
    echo "Убедитесь что вы в корневой папке проекта"
    exit 1
fi

# 1. Запрашиваем URL backend от пользователя
echo "📝 Введите URL вашего Railway backend"
echo "Пример: https://tt-prod1-production.up.railway.app"
read -p "Backend URL: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL не может быть пустым"
    exit 1
fi

echo ""
echo "🚀 Создание Netlify сайта..."
echo ""

# 2. Инициализация Netlify (интерактивно)
netlify init

echo ""
echo "✅ Netlify сайт создан!"
echo ""

# 3. Установка переменных окружения
echo "⚙️  Установка переменных окружения..."

netlify env:set VITE_CUSTOM_BACKEND_URL "$BACKEND_URL"
netlify env:set VITE_STRIPE_PUBLISHABLE_KEY 'pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE'

echo "✅ Переменные окружения установлены"
echo ""

# 4. Деплой на Netlify
echo "🚀 Деплой frontend на Netlify..."
netlify deploy --prod

echo ""
echo "🎉 Frontend задеплоен!"
echo ""

# 5. Показать URL сайта
echo "🌐 URL вашего сайта:"
netlify sites:list

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📝 ВАЖНО: Теперь нужно обновить CORS на backend"
echo "Получите URL Netlify сайта (показан выше) и выполните:"
echo ""
echo "railway variables set FRONTEND_URL='https://your-site.netlify.app'"
echo "railway variables set ALLOWED_ORIGINS='https://your-site.netlify.app'"
echo ""
echo "Railway автоматически пересоздаст backend с новыми настройками."
echo ""
