#!/bin/bash

# 🔐 Включить IAM DB Authentication на RDS
# ==========================================

set -e

echo "🔐 Включение IAM Database Authentication на tyriantrade-db"
echo "==========================================================="

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен"
    exit 1
fi

echo ""
echo "⚠️  ВНИМАНИЕ:"
echo "   - Это модификация RDS instance"
echo "   - Может потребовать перезагрузку (~5 минут)"
echo "   - Выполняется с флагом --apply-immediately"
echo ""
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

echo ""
echo "🔄 Включение IAM authentication..."

aws rds modify-db-instance \
  --db-instance-identifier tyriantrade-db \
  --enable-iam-database-authentication \
  --apply-immediately \
  --region us-east-1

echo ""
echo "✅ IAM Database Authentication включена!"
echo ""
echo "Проверка статуса:"
aws rds describe-db-instances \
  --db-instance-identifier tyriantrade-db \
  --region us-east-1 \
  --query 'DBInstances[0].[DBInstanceStatus,IAMDatabaseAuthenticationEnabled]' \
  --output table

echo ""
echo "🎯 Следующий шаг: Создать пользователя db_agent в PostgreSQL"
echo "   Выполните: ./02-create-db-agent-user.sh"
