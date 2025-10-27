#!/bin/bash

echo "=== Testing Media Display Issue ==="
echo ""

# Check if backend is running
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "❌ Custom backend is not running at http://localhost:8080"
    echo "Please run: ./START_CUSTOM_BACKEND_STACK.sh"
    exit 1
fi

echo "✓ Custom backend is running"
echo ""

# Get token from .env
if [ ! -f "custom-backend/.env" ]; then
    echo "❌ custom-backend/.env file not found"
    exit 1
fi

# Extract JWT token (should be stored after login)
TOKEN=$(grep "TEST_JWT_TOKEN" custom-backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d ' ')

if [ -z "$TOKEN" ]; then
    echo "⚠️  No TEST_JWT_TOKEN found in .env. Trying to login..."
    
    # Try to login with test user
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{
            "username": "testuser",
            "password": "Test123!@#"
        }')
    
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        echo "❌ Failed to login. Response:"
        echo $LOGIN_RESPONSE
        exit 1
    fi
    
    echo "✓ Logged in successfully"
fi

echo "✓ Using JWT token"
echo ""

# Test 1: Check explore timeline for media
echo "📊 Test 1: Fetching explore timeline..."
TIMELINE_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/timeline/explore?limit=5" \
    -H "Authorization: Bearer $TOKEN")

echo ""
echo "Raw API Response (first 500 chars):"
echo "$TIMELINE_RESPONSE" | head -c 500
echo "..."
echo ""

# Check if media field exists
if echo "$TIMELINE_RESPONSE" | grep -q '"media"'; then
    echo "✅ 'media' field found in response"
    
    # Extract and display media URLs
    echo ""
    echo "Media objects in response:"
    echo "$TIMELINE_RESPONSE" | grep -o '"media":\[.*?\]' | head -1
    echo ""
    
    # Count posts with media
    POSTS_WITH_MEDIA=$(echo "$TIMELINE_RESPONSE" | grep -o '"media":\[[^]]*\]' | grep -v '"media":\[\]' | wc -l | tr -d ' ')
    echo "Posts with media: $POSTS_WITH_MEDIA"
else
    echo "❌ 'media' field NOT found in response"
fi

echo ""
echo "---"
echo ""

# Test 2: Check specific media files
echo "📷 Test 2: Checking media files..."
echo ""

for file in custom-backend/storage/media/*.jpeg custom-backend/storage/media/*.jpg custom-backend/storage/media/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Found: $filename"
        
        # Try to access via static route
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/storage/media/$filename")
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "  ✅ Accessible at: http://localhost:8080/storage/media/$filename"
        else
            echo "  ❌ Not accessible (HTTP $HTTP_CODE)"
        fi
    fi
done

echo ""
echo "---"
echo ""

# Test 3: Check database for media records
echo "🗄️  Test 3: Checking database for media records..."
echo ""

cd custom-backend
MEDIA_COUNT=$(sqlite3 storage/app.db "SELECT COUNT(*) FROM media;" 2>/dev/null || echo "0")
echo "Total media records in database: $MEDIA_COUNT"

if [ "$MEDIA_COUNT" -gt "0" ]; then
    echo ""
    echo "Sample media records:"
    sqlite3 storage/app.db "SELECT id, type, url, post_id FROM media LIMIT 5;" 2>/dev/null || echo "Failed to query"
    
    echo ""
    echo "Posts with media:"
    sqlite3 storage/app.db "SELECT p.id, p.content, COUNT(m.id) as media_count FROM posts p LEFT JOIN media m ON m.post_id = p.id GROUP BY p.id HAVING media_count > 0 LIMIT 5;" 2>/dev/null || echo "Failed to query"
fi

cd ..

echo ""
echo "=== Test Complete ==="
echo ""
echo "📋 Summary:"
echo "1. Check if media field is present in API response"
echo "2. Verify media files are accessible via static route"
echo "3. Confirm media records exist in database and are linked to posts"
echo ""
echo "If media is not displaying:"
echo "- Ensure Preload('Media') is working in timeline.go"
echo "- Check that media URLs are correctly formatted in response"
echo "- Verify static file serving is configured in main.go"
echo "- Confirm FeedTest.tsx is using post.media (not post.media_urls)"
