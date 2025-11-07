#!/bin/bash

# 🔐 Создать IAM политику для rds-db:connect
# ===========================================

set -e

echo "🔐 Создание IAM политики для подключения к RDS"
echo "==============================================="

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен"
    exit 1
fi

# Параметры
POLICY_NAME="RDSIAMAuthPolicy-db-agent"
AWS_ACCOUNT="506675684508"
DB_RESOURCE_ID="db-4JXFCQG3SJ3ENB3M3S3BA2SLUA"
REGION="us-east-1"

echo ""
echo "📋 Параметры политики:"
echo "   Имя: $POLICY_NAME"
echo "   Account: $AWS_ACCOUNT"
echo "   DB Resource ID: $DB_RESOURCE_ID"
echo "   Пользователь БД: db_agent"
echo ""
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

# Создаем JSON для политики
POLICY_JSON=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "rds-db:connect",
      "Resource": "arn:aws:rds-db:${REGION}:${AWS_ACCOUNT}:dbuser:${DB_RESOURCE_ID}/db_agent"
    }
  ]
}
EOF
)

echo ""
echo "🔄 Создание IAM политики..."

# Создаем политику
POLICY_ARN=$(aws iam create-policy \
  --policy-name "$POLICY_NAME" \
  --policy-document "$POLICY_JSON" \
  --description "Allows IAM authentication to RDS as db_agent user" \
  --query 'Policy.Arn' \
  --output text 2>&1)

if [[ $POLICY_ARN == arn:aws:iam::* ]]; then
    echo "✅ IAM политика создана: $POLICY_ARN"
else
    # Проверяем, может политика уже существует
    EXISTING_POLICY=$(aws iam list-policies \
      --scope Local \
      --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
      --output text)
    
    if [ -n "$EXISTING_POLICY" ]; then
        echo "ℹ️  Политика уже существует: $EXISTING_POLICY"
        POLICY_ARN=$EXISTING_POLICY
    else
        echo "❌ Ошибка создания политики: $POLICY_ARN"
        exit 1
    fi
fi

echo ""
echo "🔗 Присоединение политики к ECS Task Role..."

# Присоединяем политику к ECS Task Role
aws iam attach-role-policy \
  --role-name tyriantrade-ecs-task-role \
  --policy-arn "$POLICY_ARN" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Политика присоединена к tyriantrade-ecs-task-role"
else
    echo "ℹ️  Политика уже присоединена или произошла ошибка"
fi

echo ""
echo "📋 Проверка присоединенных политик:"
aws iam list-attached-role-policies \
  --role-name tyriantrade-ecs-task-role \
  --query 'AttachedPolicies[?PolicyName==`'$POLICY_NAME'`]' \
  --output table

echo ""
echo "✅ IAM политика настроена!"
echo ""
echo "🎯 Следующий шаг: Создать SSM Bastion для подключения"
echo "   Выполните: terraform apply в директории aws-infrastructure/iam-db-auth/"
