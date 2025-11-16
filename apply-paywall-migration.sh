#!/bin/bash

# Apply Paywall Migration
# Adds fields for private profiles and subscription management

set -e

echo "🚀 Applying Paywall Migration..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    echo ""
    echo "Please run:"
    echo "  export DATABASE_URL='your_database_url'"
    exit 1
fi

echo "📊 Database: $DATABASE_URL"
echo ""

# Apply migration
echo "📝 Applying migration 032_add_paywall_fields.sql..."
psql "$DATABASE_URL" < custom-backend/internal/database/migrations/032_add_paywall_fields.sql

echo ""
echo "✅ Migration applied successfully!"
echo ""

# Verify changes
echo "🔍 Verifying new columns..."
psql "$DATABASE_URL" -c "\d users" | grep -E "is_profile_private|subscription_discount"

echo ""
echo "🎉 Paywall migration complete!"
echo ""
echo "Next steps:"
echo "1. Restart backend: ./force-restart-backend.sh"
echo "2. Test toggle: http://localhost:5173/settings?tab=profile"
echo "3. Check profile: http://localhost:5173/@yourusername"
