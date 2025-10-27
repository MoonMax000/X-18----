#!/bin/bash

# Script to clean all posts from the database
# This will delete all posts but keep users intact

set -e

echo "🧹 Database Cleanup Script"
echo "=========================="
echo ""
echo "This script will DELETE ALL POSTS from the database."
echo "Users will NOT be affected."
echo ""

# Database configuration from custom-backend/.env
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="x18_backend"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Confirm deletion
read -p "⚠️  Are you sure you want to delete ALL posts? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🔄 Connecting to database..."

# Count posts before deletion
POSTS_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM posts;" 2>/dev/null | xargs)

if [ -z "$POSTS_COUNT" ]; then
    echo "❌ Error: Could not connect to database or table does not exist"
    exit 1
fi

echo "📊 Found $POSTS_COUNT posts in database"

if [ "$POSTS_COUNT" = "0" ]; then
    echo "✅ Database is already clean, no posts to delete"
    exit 0
fi

echo ""
echo "🗑️  Deleting posts and related data..."

# Delete all posts and related records
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- First, delete all related records that reference posts
DELETE FROM notifications WHERE post_id IS NOT NULL;
DELETE FROM likes;
DELETE FROM retweets;
DELETE FROM bookmarks;
DELETE FROM comments;
DELETE FROM post_media;
DELETE FROM post_hashtags;

-- Now delete all posts
DELETE FROM posts;

-- Show remaining counts
SELECT 
    (SELECT COUNT(*) FROM posts) as remaining_posts,
    (SELECT COUNT(*) FROM notifications) as remaining_notifications,
    (SELECT COUNT(*) FROM users) as total_users;
EOF

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Database status:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    'posts' as table_name, COUNT(*) as count FROM posts
UNION ALL
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
ORDER BY table_name;
"

echo ""
echo "🎉 Done! You can now restart the backend server."
echo "   Run: ./STOP_CUSTOM_BACKEND_STACK.sh && ./START_CUSTOM_BACKEND_STACK.sh"
