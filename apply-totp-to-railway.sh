#!/bin/bash

# Скрипт для применения TOTP миграции на Railway
# Дата: 31.10.2025

echo "======================================"
echo "ПРИМЕНЕНИЕ TOTP МИГРАЦИИ НА RAILWAY"
echo "======================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI не установлен!${NC}"
    echo "Установите: npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI найден${NC}"
echo ""

# Проверка что пользователь залогинен
echo "Проверка авторизации Railway..."
if ! railway whoami &> /dev/null; then
    echo -e "${RED}❌ Вы не залогинены в Railway!${NC}"
    echo "Выполните: railway login"
    exit 1
fi

echo -e "${GREEN}✅ Авторизация OK${NC}"
echo ""

# Шаг 1: Подключение к БД и применение миграции
echo "======================================"
echo "ШАГ 1: ПРИМЕНЕНИЕ МИГРАЦИИ 009"
echo "======================================"
echo ""
echo -e "${YELLOW}Инструкция:${NC}"
echo "1. Сейчас откроется Railway PostgreSQL shell"
echo "2. Введите команду:"
echo ""
echo -e "${GREEN}\i custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql${NC}"
echo ""
echo "3. Проверьте что миграция применилась успешно:"
echo -e "${GREEN}\d users${NC}"
echo ""
echo "4. Должны появиться новые колонки:"
echo "   - totp_secret"
echo "   - totp_enabled"
echo "   - backup_email"
echo "   - backup_phone"
echo "   - account_status"
echo "   - deactivation_reason"
echo "   - reactivation_token"
echo "   - last_activity"
echo ""
echo "5. Для выхода введите: \q"
echo ""
read -p "Нажмите Enter для подключения к Railway DB..."

# Подключаемся к Railway
railway connect postgres

echo ""
echo -e "${GREEN}✅ Миграция должна быть применена${NC}"
echo ""

# Шаг 2: Генерация ENCRYPTION_KEY
echo "======================================"
echo "ШАГ 2: ГЕНЕРАЦИЯ ENCRYPTION_KEY"
echo "======================================"
echo ""

if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ OpenSSL не найден!${NC}"
    echo "Установите OpenSSL или сгенерируйте ключ вручную"
    exit 1
fi

echo "Генерация ENCRYPTION_KEY..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo ""
echo -e "${GREEN}✅ Ключ сгенерирован:${NC}"
echo ""
echo -e "${YELLOW}$ENCRYPTION_KEY${NC}"
echo ""

# Сохранение ключа в файл (на случай если потеряется)
echo "$ENCRYPTION_KEY" > .railway-encryption-key.txt
echo -e "${GREEN}✅ Ключ сохранен в файл: .railway-encryption-key.txt${NC}"
echo ""

# Шаг 3: Установка переменной в Railway
echo "======================================"
echo "ШАГ 3: УСТАНОВКА ENCRYPTION_KEY"
echo "======================================"
echo ""
echo "Устанавливаем ENCRYPTION_KEY в Railway..."
echo ""

# Устанавливаем переменную
railway variables set ENCRYPTION_KEY="$ENCRYPTION_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ENCRYPTION_KEY установлен в Railway!${NC}"
    echo ""
    echo "Railway автоматически перезапустит backend..."
else
    echo ""
    echo -e "${RED}❌ Ошибка установки ENCRYPTION_KEY${NC}"
    echo "Попробуйте вручную:"
    echo -e "${YELLOW}railway variables set ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"${NC}"
    exit 1
fi

# Шаг 4: Проверка переменных
echo ""
echo "======================================"
echo "ШАГ 4: ПРОВЕРКА ПЕРЕМЕННЫХ"
echo "======================================"
echo ""
echo "Список переменных Railway:"
echo ""
railway variables

echo ""
echo "======================================"
echo "✅ TOTP МИГРАЦИЯ ЗАВЕРШЕНА!"
echo "======================================"
echo ""
echo "Что дальше:"
echo ""
echo "1. ✅ Миграция 009 применена"
echo "2. ✅ ENCRYPTION_KEY установлен"
echo "3. ⏳ Railway перезапустит backend (1-2 минуты)"
echo ""
echo "После перезапуска можно тестировать TOTP:"
echo ""
echo "Локально:"
echo "  ./START_CUSTOM_BACKEND_STACK.sh"
echo "  npm run dev"
echo "  Открыть Profile → Security → Enable 2FA"
echo ""
echo "Production:"
echo "  Открыть https://ваш-сайт.netlify.app"
echo "  Profile → Security → Enable 2FA"
echo ""
echo -e "${GREEN}Готово! 🎉${NC}"
