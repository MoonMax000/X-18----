#!/bin/bash

# Script to apply composer migration (024) to production database
# This adds access_level and reply_policy fields to posts table

set -e

echo "🗄️  Applying Composer Phase 3 Migration..."
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get DB credentials from environment or prompt
if [ -z "$DB_HOST" ]; then
    echo -e "${YELLOW}Enter database host (e.g., x18-db.xxxx.us-east-1.rds.amazonaws.com):${NC}"
    read DB_HOST
fi

if [ -z "$DB_USER" ]; then
    echo -e "${YELLOW}Enter database user (default: postgres):${NC}"
    read DB_USER
    DB_USER=${DB_USER:-postgres}
fi

if [ -z "$DB_NAME" ]; then
    echo -e "${YELLOW}Enter database name (default: x18_production):${NC}"
    read DB_NAME
    DB_NAME=${DB_NAME:-x18_production}
fi

echo ""
echo -e "${GREEN}📊 Database Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Check if migration file exists
MIGRATION_FILE="custom-backend/internal/database/migrations/024_add_access_control_fields.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration file found${NC}"
echo ""

# Confirm before applying
echo -e "${YELLOW}⚠️  This will modify the posts table by adding:${NC}"
echo "  - access_level column (varchar(30), default 'free')"
echo "  - reply_policy column (varchar(30), default 'everyone')"
echo "  - Index on access_level"
echo "  - Constraints for valid values"
echo ""
echo -e "${YELLOW}Do you want to continue? (yes/no):${NC}"
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Applying migration...${NC}"
echo ""

# Apply migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration applied successfully!${NC}"
    echo ""
    echo -e "${GREEN}📋 Summary:${NC}"
    echo "  - Added access_level field to posts table"
    echo "  - Added reply_policy field to posts table"
    echo "  - Created index on access_level"
    echo "  - Added validation constraints"
    echo "  - Existing posts updated with default values"
    echo ""
    echo -e "${GREEN}🎉 Database is ready for Composer Phase 3!${NC}"
else
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    echo "Please check the error messages above."
    exit 1
fi
