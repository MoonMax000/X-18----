#!/bin/bash

echo "🚂 Настройка Railway Root Directory для Custom Backend"
echo "=================================================="
echo ""

# Проверяем наличие railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo ""
    echo "Установите Railway CLI:"
    echo "npm install -g @railway/cli"
    echo ""
    exit 1
fi

echo "✅ Railway CLI найден"
echo ""

# Проверяем, залогинен ли пользователь
echo "🔐 Проверка авторизации..."
if ! railway whoami &> /dev/null; then
    echo "❌ Вы не авторизованы в Railway"
    echo ""
    echo "Выполните: railway login"
    echo ""
    exit 1
fi

echo "✅ Авторизация пройдена"
echo ""

# Показываем текущий проект
echo "📦 Текущий проект:"
railway status
echo ""

# Устанавливаем Root Directory
echo "📁 Устанавливаем Root Directory: custom-backend"
railway service -s X-18---- || railway service

# Обновляем настройки через railway.json
echo "📝 Обновляем railway.json..."
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd custom-backend && go build -o main cmd/server/main.go && ./main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

echo "✅ railway.json обновлён"
echo ""

# Коммитим изменения
echo "💾 Коммитим railway.json..."
git add railway.json
git commit -m "Fix: Set Railway root directory to custom-backend" || echo "⚠️ Нет изменений для коммита"
git push origin nova-hub

echo ""
echo "=================================================="
echo "✅ ГОТОВО!"
echo ""
echo "НО! Вам ВСЁ РАВНО нужно вручную в Railway Dashboard:"
echo ""
echo "1. Зайдите в Railway Dashboard:"
echo "   https://railway.app/project/your-project-id/service/X-18----"
echo ""
echo "2. Перейдите в Settings"
echo ""
echo "3. В секции 'Build' найдите 'Root Directory'"
echo ""
echo "4. Введите: custom-backend"
echo ""
echo "5. В секции 'Deploy' найдите 'Custom Start Command'"
echo ""
echo "6. Введите: ./main"
echo ""
echo "7. Нажмите 'Redeploy'"
echo ""
echo "=================================================="
