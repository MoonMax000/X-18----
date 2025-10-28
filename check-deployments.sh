#!/bin/bash

# Скрипт проверки конфигурации Netlify и Railway
# 
# ВАЖНО: Перед запуском установите CLI инструменты:
# npm install -g netlify-cli
# npm install -g @railway/cli

echo "============================================"
echo "ПРОВЕРКА КОНФИГУРАЦИИ NETLIFY И RAILWAY"
echo "============================================"
echo ""

# Проверка наличия необходимых инструментов
echo "🔍 Проверка установленных CLI инструментов..."
echo ""

if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI не установлен"
    echo "   Установите: npm install -g netlify-cli"
    NETLIFY_AVAILABLE=false
else
    echo "✅ Netlify CLI установлен"
    netlify --version
    NETLIFY_AVAILABLE=true
fi

echo ""

if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo "   Установите: npm install -g @railway/cli"
    RAILWAY_AVAILABLE=false
else
    echo "✅ Railway CLI установлен"
    railway --version
    RAILWAY_AVAILABLE=true
fi

echo ""
echo "============================================"
echo "ПРОВЕРКА NETLIFY"
echo "============================================"
echo ""

if [ "$NETLIFY_AVAILABLE" = true ]; then
    echo "📋 Текущий статус Netlify:"
    echo ""
    
    # Проверка авторизации
    if netlify status 2>&1 | grep -q "Not logged in"; then
        echo "⚠️  Вы не авторизованы в Netlify"
        echo "   Выполните: netlify login"
        echo ""
    else
        echo "✅ Авторизация в Netlify активна"
        echo ""
        
        # Получение информации о сайте
        echo "📊 Информация о сайте:"
        netlify sites:list 2>&1 | head -n 20
        echo ""
        
        # Проверка статуса сайта
        echo "🌐 Статус текущего сайта:"
        netlify status
        echo ""
        
        # Проверка переменных окружения
        echo "🔑 Переменные окружения Netlify:"
        netlify env:list 2>&1 | head -n 30
        echo ""
        
        # Проверка последних деплоев
        echo "🚀 Последние деплои:"
        netlify deploys:list 2>&1 | head -n 10
        echo ""
        
        # Проверка настроек сборки
        echo "⚙️  Проверка netlify.toml:"
        if [ -f "netlify.toml" ]; then
            echo "✅ netlify.toml найден:"
            cat netlify.toml
        else
            echo "❌ netlify.toml не найден"
        fi
        echo ""
        
        # Проверка .env.production
        echo "📝 Проверка client/.env.production:"
        if [ -f "client/.env.production" ]; then
            echo "✅ client/.env.production найден:"
            cat client/.env.production
        else
            echo "❌ client/.env.production не найден"
        fi
        echo ""
    fi
else
    echo "⏭️  Пропуск проверки Netlify (CLI не установлен)"
fi

echo ""
echo "============================================"
echo "ПРОВЕРКА RAILWAY"
echo "============================================"
echo ""

if [ "$RAILWAY_AVAILABLE" = true ]; then
    echo "📋 Текущий статус Railway:"
    echo ""
    
    # Проверка авторизации
    if railway whoami 2>&1 | grep -q "not logged in"; then
        echo "⚠️  Вы не авторизованы в Railway"
        echo "   Выполните: railway login"
        echo ""
    else
        echo "✅ Авторизация в Railway активна"
        railway whoami
        echo ""
        
        # Список проектов
        echo "📊 Список проектов:"
        railway list
        echo ""
        
        # Статус текущего проекта
        echo "🌐 Статус текущего проекта:"
        railway status 2>&1 || echo "⚠️  Убедитесь, что вы находитесь в директории с railway.json"
        echo ""
        
        # Переменные окружения
        echo "🔑 Переменные окружения Railway:"
        railway variables 2>&1 | head -n 50
        echo ""
        
        # Проверка railway.json
        echo "⚙️  Проверка railway.json:"
        if [ -f "railway.json" ]; then
            echo "✅ railway.json найден:"
            cat railway.json
        else
            echo "❌ railway.json не найден"
        fi
        echo ""
        
        # Проверка custom-backend/.env
        echo "📝 Проверка custom-backend/.env:"
        if [ -f "custom-backend/.env" ]; then
            echo "✅ custom-backend/.env найден (не показываем содержимое по соображениям безопасности)"
            echo "   Количество строк: $(wc -l < custom-backend/.env)"
        else
            echo "❌ custom-backend/.env не найден"
        fi
        echo ""
    fi
else
    echo "⏭️  Пропуск проверки Railway (CLI не установлен)"
fi

echo ""
echo "============================================"
echo "ПРОВЕРКА ЛОКАЛЬНЫХ ФАЙЛОВ"
echo "============================================"
echo ""

echo "📁 Структура проекта:"
echo ""
echo "Frontend (client/):"
ls -la client/ 2>&1 | grep -E "^d|package.json|vite.config|\.env" | head -n 20
echo ""

echo "Backend (custom-backend/):"
ls -la custom-backend/ 2>&1 | grep -E "^d|go.mod|\.env|cmd" | head -n 20
echo ""

echo "============================================"
echo "РЕКОМЕНДАЦИИ"
echo "============================================"
echo ""

echo "1. Netlify:"
echo "   - Убедитесь, что Build command: npm run build"
echo "   - Publish directory: dist"
echo "   - Base directory: (пусто)"
echo "   - Environment variables должны включать:"
echo "     * VITE_API_URL=https://x-18-production-38ec.up.railway.app"
echo "     * VITE_APP_ENV=production"
echo ""

echo "2. Railway:"
echo "   - Проверьте, что CORS_ORIGIN включает:"
echo "     https://sunny-froyo-f47377.netlify.app"
echo "   - База данных PostgreSQL подключена"
echo "   - Redis 7.2+ подключен с Username"
echo ""

echo "3. Для детальной проверки запустите:"
echo "   netlify open       # Открыть dashboard Netlify"
echo "   railway open       # Открыть dashboard Railway"
echo ""

echo "============================================"
echo "ПРОВЕРКА ЗАВЕРШЕНА"
echo "============================================"
