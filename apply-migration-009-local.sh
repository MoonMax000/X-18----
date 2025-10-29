#!/bin/bash

# Script to apply migration 009 to local PostgreSQL database
# This adds TOTP and account deactivation fields

echo "🔄 Applying Migration 009 - TOTP and Account Deactivation"
echo "================================================"

# Check if migration file exists
MIGRATION_FILE="custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-x18_backend}"

echo "📊 Database: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"
echo ""

# Apply migration
echo "🔧 Applying migration..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration 009 applied successfully!"
    echo ""
    echo "Verify the changes:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo "  \d users"
else
    echo ""
    echo "❌ Migration failed!"
    exit 1
fi
