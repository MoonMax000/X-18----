#!/bin/bash

echo "🔧 Применение миграции для создания постоянного Admin пользователя"
echo "===================================================================="

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}📋 Admin Credentials:${NC}"
echo "  Email: kyvaldov@gmail.com"
echo "  Password: Admin123!"
echo ""
echo -e "${RED}⚠️  ОБЯЗАТЕЛЬНО СМЕНИТЕ ПАРОЛЬ после первого входа!${NC}"
echo ""

# Проверка подключения к БД
echo -e "${YELLOW}🔍 Проверка подключения к продакшен БД...${NC}"

DB_PASSWORD=$(aws ssm get-parameters \
  --names "/tyriantrade/db/password" \
  --with-decryption \
  --region us-east-1 \
  --query 'Parameters[0].Value' \
  --output text 2>/dev/null)

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Не удалось получить пароль БД${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Credentials получены${NC}"
echo ""

# Применить миграцию
echo -e "${YELLOW}📝 Применение миграции...${NC}"

PGPASSWORD="$DB_PASSWORD" psql \
  -h tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
  -U dbadmin \
  -d tyriantrade \
  -p 5432 \
  -f custom-backend/internal/database/migrations/021_create_permanent_admin.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Миграция применена успешно!${NC}"
    echo ""
    echo -e "${YELLOW}📊 Теперь вы можете:${NC}"
    echo "  1. Войти как admin: kyvaldov@gmail.com / Admin123!"
    echo "  2. Удалять всех пользователей через SQL: CLEANUP_ALL_EXCEPT_ADMIN.sql"
    echo "  3. Admin пользователь НИКОГДА не будет удален"
    echo ""
    echo -e "${RED}⚠️  НЕ ЗАБУДЬТЕ СМЕНИТЬ ПАРОЛЬ!${NC}"
else
    echo ""
    echo -e "${RED}❌ Ошибка при применении миграции${NC}"
    echo ""
    echo -e "${YELLOW}💡 Альтернатива:${NC}"
    echo "  Выполните SQL вручную из файла:"
    echo "  custom-backend/internal/database/migrations/021_create_permanent_admin.sql"
fi
