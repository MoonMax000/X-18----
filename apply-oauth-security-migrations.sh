#!/bin/bash

# OAuth Security Upgrade Migration Script
# This script applies the new OAuth security migrations to the database

set -e  # Exit on any error

echo "================================================"
echo "🔒 OAuth Security Upgrade Migration"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running locally or need to specify connection
if [ -z "$DB_HOST" ]; then
    echo -e "${YELLOW}⚠️  No DB_HOST environment variable found${NC}"
    echo "Using local database connection..."
    echo ""
    
    # Load local environment
    if [ -f ".env.local" ]; then
        source .env.local
        echo -e "${GREEN}✅ Loaded .env.local${NC}"
    else
        echo -e "${RED}❌ .env.local not found${NC}"
        echo "Please create .env.local with database credentials"
        exit 1
    fi
fi

# Database connection details
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME:-x18_dev}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo ""
echo "Database connection:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Confirm before proceeding
read -p "Continue with migration? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "================================================"
echo "📊 Step 1: Check current database state"
echo "================================================"
echo ""

# Check if user_oauth_identities table already exists
TABLE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_oauth_identities');")

if [ "$TABLE_EXISTS" = "t" ]; then
    echo -e "${YELLOW}⚠️  Table 'user_oauth_identities' already exists${NC}"
    echo "Checking if migration is needed..."
    
    COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
        "SELECT COUNT(*) FROM user_oauth_identities;")
    echo "  Current records in user_oauth_identities: $COUNT"
else
    echo -e "${GREEN}✅ Table 'user_oauth_identities' does not exist yet${NC}"
fi

# Check OAuth users in users table
OAUTH_USERS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT COUNT(*) FROM users WHERE oauth_provider IS NOT NULL AND oauth_provider != '';")
echo "  OAuth users in users table: $OAUTH_USERS"

echo ""
echo "================================================"
echo "📝 Step 2: Apply Migration 022 (Create Table)"
echo "================================================"
echo ""

# Apply migration 022
echo "Creating user_oauth_identities table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -f custom-backend/internal/database/migrations/022_create_user_oauth_identities.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration 022 applied successfully${NC}"
else
    echo -e "${RED}❌ Migration 022 failed${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo "📝 Step 3: Apply Migration 023 (Migrate Data)"
echo "================================================"
echo ""

# Apply migration 023
echo "Migrating existing OAuth data..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    -f custom-backend/internal/database/migrations/023_migrate_oauth_data.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration 023 applied successfully${NC}"
else
    echo -e "${RED}❌ Migration 023 failed${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo "🔍 Step 4: Verify Migration Results"
echo "================================================"
echo ""

# Count records in new table
NEW_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT COUNT(*) FROM user_oauth_identities;")
echo "  Records migrated to user_oauth_identities: $NEW_COUNT"

# Show provider breakdown
echo ""
echo "  OAuth providers breakdown:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \
    "SELECT provider, COUNT(*) as count FROM user_oauth_identities GROUP BY provider;"

echo ""
echo "================================================"
echo "✅ Migration Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Deploy the updated backend code"
echo "2. Test OAuth login with Google and Apple"
echo "3. Check that tokens are in httpOnly cookies (DevTools → Application → Cookies)"
echo "4. Monitor logs: ./monitor-oauth-local.sh"
echo ""
echo "For production deployment, see: OAUTH_SECURITY_UPGRADE.md"
echo ""
