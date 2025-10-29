#!/bin/bash

echo "=== Checking notifications in database ==="

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Install PostgreSQL client."
    exit 1
fi

# Get database credentials from .env
if [ -f custom-backend/.env ]; then
    export $(cat custom-backend/.env | grep -v '^#' | xargs)
fi

# Default values if not in .env
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-x18_db}"

echo "Connecting to database: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# Check all notifications
echo "--- All Notifications ---"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    n.id,
    n.type,
    n.user_id as \"to_user\",
    n.from_user_id as \"from_user\",
    n.read,
    n.created_at,
    u.username as \"to_username\",
    fu.username as \"from_username\"
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN users fu ON n.from_user_id = fu.id
ORDER BY n.created_at DESC
LIMIT 10;
"

echo ""
echo "--- Follow Notifications Only ---"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    n.id,
    n.type,
    u.username as \"to_user\",
    fu.username as \"from_user\",
    n.read,
    n.created_at
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN users fu ON n.from_user_id = fu.id
WHERE n.type = 'follow'
ORDER BY n.created_at DESC
LIMIT 10;
"

echo ""
echo "--- Notification Count by Type ---"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT type, COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;
"
