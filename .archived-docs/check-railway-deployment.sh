#!/bin/bash

echo "🔍 Диагностика Railway Deployment"
echo "=================================================="
echo ""

echo "1. Проверяем что API жив:"
curl -s https://api.tyriantrade.com/health | jq . || echo "❌ Health check failed"
echo ""

echo "2. Проверяем конкретные API роуты:"
echo ""
echo "   /api/notifications:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://api.tyriantrade.com/api/notifications
echo ""
echo "   /api/timeline/explore:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://api.tyriantrade.com/api/timeline/explore
echo ""
echo "   /api/posts:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://api.tyriantrade.com/api/posts
echo ""
echo "   /api/auth/signup:"
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://api.tyriantrade.com/api/auth/signup
echo ""

echo "=================================================="
echo ""
echo "🔎 ДИАГНОЗ:"
echo ""
echo "Если все роуты возвращают 404, то:"
echo "1. Railway деплоит СТАРУЮ версию gotosocial (без custom-backend роутов)"
echo "2. Нужно FORCE REDEPLOY после удаления gotosocial/"
echo ""
echo "Решение:"
echo "1. В Railway Dashboard → Deployments"
echo "2. Найдите последний деплой (4 minutes ago)"
echo "3. Нажмите '...' (три точки) → 'Restart'"
echo "   ИЛИ"
echo "4. Нажмите 'Deploy' в правом верхнем углу"
echo ""
echo "=================================================="
