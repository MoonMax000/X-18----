#!/bin/bash

# Script to apply migration 014 to Railway PostgreSQL database
# This adds session tracking fields to the sessions table

echo "=========================================="
echo "Applying Migration 014: Session Tracking"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set in .env
if [ ! -f "custom-backend/.env" ]; then
    echo "❌ Error: custom-backend/.env file not found"
    echo "Please create it with your Railway DATABASE_URL"
    exit 1
fi

# Load environment variables
source custom-backend/.env

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in custom-backend/.env"
    echo "Please add your Railway database URL to the .env file"
    exit 1
fi

echo "✅ Found DATABASE_URL"
echo ""
echo "📋 This migration will add the following fields to sessions table:"
echo "   - device_type (VARCHAR 20)"
echo "   - browser (VARCHAR 50)"
echo "   - os (VARCHAR 50)"
echo "   - ip_address (VARCHAR 45)"
echo "   - user_agent (VARCHAR 500)"
echo "   - last_active_at (TIMESTAMP)"
echo ""
echo "📊 And create indexes on:"
echo "   - ip_address"
echo "   - device_type"
echo ""

read -p "Do you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Applying migration..."
echo ""

# Apply migration
psql "$DATABASE_URL" -f custom-backend/internal/database/migrations/014_add_session_tracking_fields.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration 014 applied successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Commit and push changes to GitHub"
    echo "2. Railway will auto-deploy the updated backend"
    echo "3. New sessions will now track device information"
    echo "4. Check https://social.tyriantrade.com/profile?tab=profile&profileTab=security"
    echo ""
else
    echo ""
    echo "❌ Migration failed"
    echo "Please check the error message above"
    exit 1
fi
