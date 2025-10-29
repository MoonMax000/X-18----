#!/bin/bash

echo "🔧 Настройка CORS для Railway"
echo "================================"
echo ""

# URL фронтенда на Netlify
FRONTEND_URL="https://sunny-froyo-f47377.netlify.app"

echo "📌 Фронтенд URL: $FRONTEND_URL"
echo "📌 Бэкенд URL: https://x-18-production-38ec.up.railway.app"
echo ""

# Проверяем установлен ли Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo ""
    echo "Установите Railway CLI:"
    echo "npm install -g @railway/cli"
    echo ""
    echo "Или настройте CORS вручную через веб-интерфейс Railway:"
    echo "1. Откройте https://railway.app/project/x-18"
    echo "2. Выберите сервис custom-backend"
    echo "3. Перейдите в Variables"
    echo "4. Добавьте новую переменную:"
    echo "   CORS_ORIGIN=$FRONTEND_URL"
    echo "5. Сохраните и подождите пока сервис перезапустится"
    exit 1
fi

echo "✅ Railway CLI установлен"
echo ""

# Проверяем привязан ли проект
if [ ! -f ".railway" ]; then
    echo "⚠️  Проект не привязан к Railway"
    echo "Выполните: railway link"
    echo ""
    read -p "Привязать проект сейчас? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway link
    else
        echo "❌ Отменено"
        exit 1
    fi
fi

echo "📝 Добавляем переменную CORS_ORIGIN..."
railway variables --set CORS_ORIGIN="$FRONTEND_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORS настроен успешно!"
    echo ""
    echo "⏳ Подождите 1-2 минуты пока Railway перезапустит сервис"
    echo ""
    echo "Затем обновите страницу: $FRONTEND_URL"
else
    echo ""
    echo "❌ Ошибка при настройке CORS"
    echo ""
    echo "Настройте вручную через веб-интерфейс Railway:"
    echo "1. Откройте https://railway.app"
    echo "2. Выберите проект X-18"
    echo "3. Выберите сервис custom-backend"
    echo "4. Variables → New Variable"
    echo "5. CORS_ORIGIN = $FRONTEND_URL"
fi
