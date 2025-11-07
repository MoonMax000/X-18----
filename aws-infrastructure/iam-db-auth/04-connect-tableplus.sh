#!/bin/bash

# 🔐 Подключение к RDS через TablePlus с IAM Auth
# ================================================

set -e

echo "🔐 Подключение к RDS через SSM Port Forwarding"
echo "==============================================="

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен"
    exit 1
fi

# Проверка Session Manager Plugin
if ! command -v session-manager-plugin &> /dev/null; then
    echo "❌ AWS Session Manager Plugin не установлен"
    echo ""
    echo "Установите его:"
    echo "  macOS: brew install --cask session-manager-plugin"
    echo "  или скачайте: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html"
    exit 1
fi

# Найти bastion instance
echo ""
echo "🔍 Поиск bastion instance..."

BASTION_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=tyriantrade-bastion" "Name=instance-state-name,Values=running" \
  --region us-east-1 \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

if [ -z "$BASTION_ID" ] || [ "$BASTION_ID" == "None" ]; then
    echo "❌ Bastion instance не найден"
    echo ""
    echo "Создайте bastion:"
    echo "  cd aws-infrastructure/iam-db-auth"
    echo "  terraform init"
    echo "  terraform apply"
    exit 1
fi

echo "✅ Найден bastion: $BASTION_ID"

# Локальный порт для forwarding
LOCAL_PORT=5433
RDS_HOST="tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com"
RDS_PORT=5432

echo ""
echo "📋 Параметры подключения:"
echo "   Bastion: $BASTION_ID"
echo "   Локальный порт: $LOCAL_PORT"
echo "   RDS Host: $RDS_HOST"
echo "   RDS Port: $RDS_PORT"
echo ""

# Проверяем, не занят ли порт
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Порт $LOCAL_PORT уже занят"
    echo ""
    read -p "Убить процесс на порту $LOCAL_PORT? (yes/no): " kill_confirm
    if [ "$kill_confirm" == "yes" ]; then
        lsof -ti:$LOCAL_PORT | xargs kill -9
        echo "✅ Процесс завершен"
    else
        echo "Отменено"
        exit 1
    fi
fi

echo ""
echo "🔄 Запуск SSM Port Forwarding..."
echo "   (Для остановки нажмите Ctrl+C)"
echo ""

# Генерируем IAM токен для подключения
echo "🔑 Генерация IAM токена..."
IAM_TOKEN=$(aws rds generate-db-auth-token \
  --hostname "$RDS_HOST" \
  --port "$RDS_PORT" \
  --username db_agent \
  --region us-east-1)

echo "✅ IAM токен сгенерирован"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 НАСТРОЙКИ ДЛЯ TABLEPLUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Откройте TablePlus"
echo "2. Создайте новое подключение PostgreSQL"
echo "3. Используйте следующие параметры:"
echo ""
echo "   Name:     TyrianTrade Production (IAM)"
echo "   Host:     127.0.0.1"
echo "   Port:     $LOCAL_PORT"
echo "   User:     db_agent"
echo "   Password: (вставьте токен ниже)"
echo "   Database: tyriantrade"
echo ""
echo "   SSL Mode: require (или verify-full с CA bundle)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 IAM ТОКЕН (скопируйте в поле Password):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$IAM_TOKEN"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  ВАЖНО:"
echo "   - Токен действителен ~15 минут"
echo "   - После истечения запустите скрипт заново"
echo "   - Port forwarding должен оставаться запущенным"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Копируем токен в clipboard если возможно
if command -v pbcopy &> /dev/null; then
    echo "$IAM_TOKEN" | pbcopy
    echo "✅ Токен скопирован в clipboard"
    echo ""
fi

read -p "Нажмите Enter для запуска Port Forwarding..."

# Запускаем port forwarding
aws ssm start-session \
  --target "$BASTION_ID" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"$RDS_HOST\"],\"portNumber\":[\"$RDS_PORT\"],\"localPortNumber\":[\"$LOCAL_PORT\"]}" \
  --region us-east-1
