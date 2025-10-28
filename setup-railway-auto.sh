#!/bin/bash

echo "🚀 Автоматическая настройка Railway для X-18 Backend"
echo ""

# Генерация JWT секрета
echo "📝 Генерация JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 32)

echo "✅ JWT_SECRET сгенерирован"
echo ""

# Проверка подключения к Railway
echo "🔗 Проверка подключения к Railway..."
railway whoami

echo ""
echo "📋 Добавление переменных окружения..."
echo ""

# Установка переменных
railway variables --set "DATABASE_URL=\${{Postgres.DATABASE_URL}}"
railway variables --set PORT=8080
railway variables --set GIN_MODE=release
railway variables --set JWT_SECRET="$JWT_SECRET"
railway variables --set RESEND_API_KEY=re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh
railway variables --set EMAIL_FROM=noreply@tyriantrade.com

echo ""
echo "✅ Все переменные добавлены!"
echo ""
echo "🔄 Railway автоматически перезапустит сервис..."
echo ""
echo "📊 Проверка статуса деплоя..."
sleep 5
railway status

echo ""
echo "✅ Готово! Backend должен запуститься через несколько секунд"
echo ""
echo "🌐 Создание публичного домена..."
railway domain

echo ""
echo "🎉 Настройка завершена!"
