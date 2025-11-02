#!/bin/bash

# Apply migration 015 to AWS RDS PostgreSQL database (using individual DB env vars)
# This migration adds username change tracking fields

set -e

echo "🔄 Applying migration 015: Username change tracking..."

# Get DB credentials from ECS task definition
echo "📦 Fetching DB credentials from ECS task definition..."

DB_HOST=$(aws ecs describe-task-definition --task-definition tyriantrade-backend --region us-east-1 --query 'taskDefinition.containerDefinitions[0].environment[?name==`DB_HOST`].value' --output text)
DB_PORT=$(aws ecs describe-task-definition --task-definition tyriantrade-backend --region us-east-1 --query 'taskDefinition.containerDefinitions[0].environment[?name==`DB_PORT`].value' --output text)
DB_USER=$(aws ecs describe-task-definition --task-definition tyriantrade-backend --region us-east-1 --query 'taskDefinition.containerDefinitions[0].environment[?name==`DB_USER`].value' --output text)
DB_NAME=$(aws ecs describe-task-definition --task-definition tyriantrade-backend --region us-east-1 --query 'taskDefinition.containerDefinitions[0].environment[?name==`DB_NAME`].value' --output text)
DB_PASSWORD=$(aws ecs describe-task-definition --task-definition tyriantrade-backend --region us-east-1 --query 'taskDefinition.containerDefinitions[0].environment[?name==`DB_PASSWORD`].value' --output text)

if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  echo "❌ Failed to get DB credentials from ECS task definition"
  echo "DB_HOST: $DB_HOST"
  echo "DB_USER: $DB_USER"  
  echo "DB_NAME: $DB_NAME"
  exit 1
fi

echo "✅ Got DB credentials"
echo "   Host: $DB_HOST"
echo "   Port: ${DB_PORT:-5432}"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Build DATABASE_URL
export PGPASSWORD="$DB_PASSWORD"
DB_PORT=${DB_PORT:-5432}

# Apply migration using psql
echo "🔧 Applying migration..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
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
EOF

if [ $? -eq 0 ]; then
  echo "✅ Migration 015 applied successfully!"
  echo ""
  echo "📊 Verifying columns were added..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('username_changes_count', 'last_username_change_at') ORDER BY column_name;"
else
  echo "❌ Migration failed"
  exit 1
fi

# Clear password
unset PGPASSWORD
