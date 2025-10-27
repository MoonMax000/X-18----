#!/bin/bash

echo "🗑️  Cleaning all posts from database..."
echo ""

# Connect to PostgreSQL and delete all posts
PGPASSWORD=postgres psql -h localhost -U postgres -d custom_backend -c "
DELETE FROM post_likes;
DELETE FROM post_media;
DELETE FROM notifications WHERE type IN ('like', 'retweet', 'mention', 'reply');
DELETE FROM posts;
" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ All posts deleted successfully!"
  echo ""
  echo "Database is now clean. You can create new posts with correct metadata."
else
  echo "❌ Failed to delete posts"
  echo "Make sure PostgreSQL is running and credentials are correct"
fi
