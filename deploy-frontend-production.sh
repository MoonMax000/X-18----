#!/bin/bash

# 🚀 Скрипт для деплоя фронтенда на Netlify
# Применяет исправления production URL и деплоит

set -e

echo "🚀 Деплой фронтенда на Netlify с исправлениями"
echo "================================================"
echo ""

# 1. Проверка, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден"
    echo "Запустите скрипт из корня проекта"
    exit 1
fi

# 2. Сборка фронтенда
echo "📦 Сборка production версии..."
npm run build

# 3. Проверка сборки
if [ ! -d "dist" ]; then
    echo "❌ Ошибка сборки - директория dist не создана"
    exit 1
fi

echo ""
echo "✅ Сборка завершена"
echo ""

# 4. Деплой на Netlify
echo "🌐 Деплой на Netlify..."
echo ""

# Проверка Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI не установлен"
    echo "Установите: npm install -g netlify-cli"
    exit 1
fi

# Деплой
netlify deploy --prod --dir=dist

echo ""
echo "✨ Деплой завершен!"
echo ""
echo "📋 Что было сделано:"
echo "  ✅ Исправлен API URL на: https://x-18-production-38ec.up.railway.app"
echo "  ✅ Собрана production версия"
echo "  ✅ Задеплоено на Netlify"
echo ""
echo "🌐 Ваш сайт доступен по адресу: https://social.tyriantrade.com"
echo ""
echo "⚠️  Примечание: изменения могут занять 1-2 минуты для применения"
