#!/bin/bash

# Apply migration 015 to AWS RDS PostgreSQL database
# This migration adds username change tracking fields

set -e

echo "🔄 Applying migration 015: Username change tracking..."

# Get DATABASE_URL from AWS Secrets Manager
echo "📦 Fetching DATABASE_URL from Secrets Manager..."
DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id tyriantrade-backend-secrets \
  --region us-east-1 \
  --query 'SecretString' \
  --output text | jq -r '.DATABASE_URL')

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Failed to get DATABASE_URL from Secrets Manager"
  exit 1
fi

echo "✅ Got DATABASE_URL"

# Apply migration using psql
echo "🔧 Applying migration..."
psql "$DATABASE_URL" << 'EOF'
-- Migration 015: Add username change tracking fields
-- This enables Twitter-like username change limitation:
-- - 3 free username changes
-- - After that, only once per week

-- Add username_changes_count column (default 0)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username_changes_count INTEGER DEFAULT 0;

-- Add last_username_change_at column (nullable timestamp)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_username_change_at TIMESTAMP;

-- Add comment for documentation
COMMENT ON COLUMN users.username_changes_count IS 'Number of times user has changed their username';
COMMENT ON COLUMN users.last_username_change_at IS 'Timestamp of the last username change';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_username_changes ON users(username_changes_count, last_username_change_at);

-- Verify migration
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('username_changes_count', 'last_username_change_at')
ORDER BY column_name;
EOF

if [ $? -eq 0 ]; then
  echo "✅ Migration 015 applied successfully!"
  echo ""
  echo "📊 Verifying columns were added..."
  psql "$DATABASE_URL" -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('username_changes_count', 'last_username_change_at') ORDER BY column_name;"
else
  echo "❌ Migration failed"
  exit 1
fi
