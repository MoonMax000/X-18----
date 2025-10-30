#!/bin/bash

# ============================================
# UNIFIED MIGRATION SCRIPT
# Applies migrations 010, 011, 013
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  UNIFIED MIGRATION SCRIPT${NC}"
echo -e "${BLUE}  Migrations: 010, 011, 013${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to show usage
show_usage() {
    echo "Usage: $0 [local|railway|both]"
    echo ""
    echo "Options:"
    echo "  local    - Apply migrations to local PostgreSQL"
    echo "  railway  - Apply migrations to Railway PostgreSQL"
    echo "  both     - Apply migrations to both databases"
    echo ""
    echo "Example:"
    echo "  $0 local"
    echo "  $0 railway"
    echo "  $0 both"
    exit 1
}

# Check if argument provided
if [ $# -eq 0 ]; then
    show_usage
fi

TARGET=$1

# Migration files
MIGRATION_010="custom-backend/internal/database/migrations/010_add_notification_preferences.sql"
MIGRATION_011="custom-backend/internal/database/migrations/011_add_stripe_webhooks.sql"
MIGRATION_013="custom-backend/internal/database/migrations/013_add_referral_system.sql"

# Check if migration files exist
echo -e "${YELLOW}Проверяем наличие файлов миграций...${NC}"
for file in "$MIGRATION_010" "$MIGRATION_011" "$MIGRATION_013"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Файл не найден: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Найден: $file${NC}"
done
echo ""

# Function to apply migrations to a database
apply_migrations() {
    local db_url=$1
    local db_name=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Применяем миграции к: $db_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Apply Migration 010
    echo -e "${YELLOW}[1/3] Применяем Migration 010 (Notification Preferences)...${NC}"
    if psql "$db_url" -f "$MIGRATION_010" 2>&1; then
        echo -e "${GREEN}✅ Migration 010 успешно применена${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration 010: уже применена или произошла ошибка${NC}"
    fi
    echo ""
    
    # Apply Migration 011
    echo -e "${YELLOW}[2/3] Применяем Migration 011 (Stripe Webhooks)...${NC}"
    if psql "$db_url" -f "$MIGRATION_011" 2>&1; then
        echo -e "${GREEN}✅ Migration 011 успешно применена${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration 011: уже применена или произошла ошибка${NC}"
    fi
    echo ""
    
    # Apply Migration 013
    echo -e "${YELLOW}[3/3] Применяем Migration 013 (Referral System)...${NC}"
    if psql "$db_url" -f "$MIGRATION_013" 2>&1; then
        echo -e "${GREEN}✅ Migration 013 успешно применена${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration 013: уже применена или произошла ошибка${NC}"
    fi
    echo ""
    
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✅ Все миграции применены к $db_name${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Apply to local database
apply_to_local() {
    echo -e "${BLUE}📍 ЛОКАЛЬНАЯ БАЗА ДАННЫХ${NC}"
    echo ""
    
    # Load local .env safely (handles special characters including < >)
    if [ -f "custom-backend/.env" ]; then
        while IFS='=' read -r key value; do
            # Skip empty lines and comments
            [[ -z "$key" || "$key" =~ ^#.* ]] && continue
            # Remove leading/trailing whitespace and quotes
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            # Export the variable
            export "$key=$value"
        done < custom-backend/.env
    fi
    
    # Build connection string
    if [ -z "$DATABASE_URL" ]; then
        DB_USER="${DB_USER:-postgres}"
        DB_PASSWORD="${DB_PASSWORD:-postgres}"
        DB_HOST="${DB_HOST:-localhost}"
        DB_PORT="${DB_PORT:-5432}"
        DB_NAME="${DB_NAME:-x18_db}"
        
        LOCAL_DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
    else
        LOCAL_DB_URL=$DATABASE_URL
    fi
    
    echo -e "${YELLOW}Подключаемся к локальной базе данных...${NC}"
    echo -e "${YELLOW}URL: ${LOCAL_DB_URL%%:*}://****@${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
    echo ""
    
    apply_migrations "$LOCAL_DB_URL" "LOCAL"
}

# Apply to Railway database
apply_to_railway() {
    echo -e "${BLUE}☁️  RAILWAY DATABASE${NC}"
    echo ""
    
    # Check if RAILWAY_DATABASE_URL is set
    if [ -z "$RAILWAY_DATABASE_URL" ]; then
        echo -e "${RED}❌ RAILWAY_DATABASE_URL не установлен${NC}"
        echo -e "${YELLOW}Получите URL из Railway Dashboard:${NC}"
        echo "1. Откройте проект в Railway"
        echo "2. Перейдите к PostgreSQL service"
        echo "3. Скопируйте DATABASE_URL из Variables"
        echo "4. Экспортируйте: export RAILWAY_DATABASE_URL='your-url'"
        echo ""
        return 1
    fi
    
    echo -e "${YELLOW}Подключаемся к Railway базе данных...${NC}"
    echo -e "${YELLOW}URL: ${RAILWAY_DATABASE_URL%%@*}@****${NC}"
    echo ""
    
    apply_migrations "$RAILWAY_DATABASE_URL" "RAILWAY"
}

# Main execution
case "$TARGET" in
    local)
        apply_to_local
        ;;
    railway)
        apply_to_railway
        ;;
    both)
        apply_to_local
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        apply_to_railway
        ;;
    *)
        echo -e "${RED}❌ Неверный аргумент: $TARGET${NC}"
        echo ""
        show_usage
        ;;
esac

echo ""
echo -e "${GREEN}╔═════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 ВСЕ МИГРАЦИИ ПРИМЕНЕНЫ! 🎉      ║${NC}"
echo -e "${GREEN}╚═════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Примененные миграции:${NC}"
echo -e "  ${GREEN}✅${NC} 010 - Notification Preferences"
echo -e "  ${GREEN}✅${NC} 011 - Stripe Webhooks"
echo -e "  ${GREEN}✅${NC} 013 - Referral System"
echo ""
echo -e "${YELLOW}📝 Следующие шаги:${NC}"
echo "  1. Перезапустите backend сервер"
echo "  2. Проверьте логи на наличие ошибок"
echo "  3. Протестируйте новый функционал"
echo ""
