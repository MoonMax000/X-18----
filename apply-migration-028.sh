#!/bin/bash

# Script to apply migration 028 - sync access_level values
# This migration updates the access_level constraint and migrates existing data

set -e

echo "=========================================="
echo "Applying Migration 028: Sync AccessLevel"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✓ Loaded .env.production"
else
    echo "❌ Error: .env.production file not found"
    exit 1
fi

# Check if database credentials are set
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
    echo "❌ Error: Database credentials not found in .env.production"
    echo "Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
fi

echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "User: $DB_USER"
echo ""

# Confirm before proceeding
read -p "⚠️  This will modify the posts table. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "📝 Applying migration..."
echo ""

# Apply migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f custom-backend/internal/database/migrations/028_sync_access_level_values.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration 028 applied successfully!"
    echo ""
    echo "Changes made:"
    echo "  1. Updated constraint to support 'public' and 'paid' values"
    echo "  2. Migrated existing 'free' posts to 'public'"
    echo "  3. Updated default value to 'public'"
    echo "  4. Added performance index for non-public posts"
    echo ""
    echo "📊 Checking post distribution..."
    echo ""
    
    # Show statistics
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
    SELECT 
        access_level,
        COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
    FROM posts 
    GROUP BY access_level 
    ORDER BY count DESC;"
    
    echo ""
    echo "✅ All done! You can now restart the backend with the updated code."
    echo ""
    echo "Next steps:"
    echo "  1. Deploy updated backend code (with camelCase JSON tags)"
    echo "  2. Deploy updated frontend code (with camelCase payloads)"
    echo "  3. Test creating a new paid post"
    echo "  4. Verify the post displays as locked for non-purchasers"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error above and try again."
    exit 1
fi
