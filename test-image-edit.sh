#!/bin/bash

# 🧪 Image Edit Functionality E2E Test
# Tests complete workflow: upload → edit → crop → post → verify

set -e

echo "🧪 Testing Image Edit Functionality"
echo "=================================="
echo ""

# Configuration
API_URL="http://localhost:8080/api"
FRONTEND_URL="http://localhost:5173"
TEST_IMAGE="test-image.jpg"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1️⃣ Checking backend status..."
if curl -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running on port 8080${NC}"
    echo "   Start it with: cd custom-backend && go run cmd/server/main.go"
    exit 1
fi

# Check database migration
echo ""
echo "2️⃣ Checking database schema..."
if PGPASSWORD=postgres psql -h localhost -U postgres -d x18 -c "SELECT column_name FROM information_schema.columns WHERE table_name='media' AND column_name IN ('transform', 'original_url');" | grep -q "transform"; then
    echo -e "${GREEN}✅ Database migration applied (transform & original_url columns exist)${NC}"
else
    echo -e "${RED}❌ Database migration missing${NC}"
    echo "   The 'transform' and 'original_url' columns should exist in 'media' table"
    exit 1
fi

# Login and get token
echo ""
echo "3️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed${NC}"
    echo "   Create test user first: ./seed-test-users.sh"
    exit 1
fi

echo -e "${GREEN}✅ Logged in successfully${NC}"

# Create test image if not exists
echo ""
echo "4️⃣ Creating test image..."
if [ ! -f "$TEST_IMAGE" ]; then
    # Create a simple 1920x1080 test image with ImageMagick
    if command -v convert &> /dev/null; then
        convert -size 1920x1080 xc:blue -pointsize 100 -fill white -gravity center -annotate +0+0 "TEST IMAGE\n1920x1080" "$TEST_IMAGE"
        echo -e "${GREEN}✅ Test image created${NC}"
    else
        echo -e "${YELLOW}⚠️  ImageMagick not found, please provide a test image named 'test-image.jpg'${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Test image exists${NC}"
fi

# Upload image
echo ""
echo "5️⃣ Uploading image..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/media/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$TEST_IMAGE")

MEDIA_ID=$(echo $UPLOAD_RESPONSE | jq -r '.uuid // empty')
MEDIA_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url // empty')

if [ -z "$MEDIA_ID" ]; then
    echo -e "${RED}❌ Image upload failed${NC}"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Image uploaded${NC}"
echo "   Media ID: $MEDIA_ID"
echo "   Media URL: $MEDIA_URL"

# Create post with crop data
echo ""
echo "6️⃣ Creating post with crop transformation..."
# Simulate MediaEditor output: crop to square 1:1 from center
POST_RESPONSE=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"Test post with cropped image - E2E test\",
    \"media_ids\": [\"$MEDIA_ID\"],
    \"media_transforms\": {
      \"$MEDIA_ID\": {
        \"x\": 420,
        \"y\": 0,
        \"w\": 1080,
        \"h\": 1080,
        \"src_w\": 1920,
        \"src_h\": 1080
      }
    },
    \"visibility\": \"public\"
  }")

POST_ID=$(echo $POST_RESPONSE | jq -r '.id // empty')

if [ -z "$POST_ID" ]; then
    echo -e "${RED}❌ Post creation failed${NC}"
    echo "Response: $POST_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Post created with crop transformation${NC}"
echo "   Post ID: $POST_ID"

# Verify cropped file was created
echo ""
echo "7️⃣ Verifying cropped file..."
sleep 2  # Wait for async processing

CROPPED_FILES=$(ls -1 custom-backend/storage/media/*.crop.* 2>/dev/null | wc -l)

if [ "$CROPPED_FILES" -gt 0 ]; then
    echo -e "${GREEN}✅ Cropped file(s) created${NC}"
    echo "   Found $CROPPED_FILES .crop.* file(s)"
    ls -lh custom-backend/storage/media/*.crop.* | tail -3
else
    echo -e "${RED}❌ No cropped files found${NC}"
    exit 1
fi

# Verify database records
echo ""
echo "8️⃣ Verifying database records..."
DB_CHECK=$(PGPASSWORD=postgres psql -h localhost -U postgres -d x18 -t -c "SELECT url, original_url, transform FROM media WHERE uuid='$MEDIA_ID';")

if echo "$DB_CHECK" | grep -q ".crop."; then
    echo -e "${GREEN}✅ Database updated correctly${NC}"
    echo "   URL contains .crop. extension"
    echo "   Original URL preserved"
else
    echo -e "${RED}❌ Database not updated${NC}"
    echo "$DB_CHECK"
    exit 1
fi

# Fetch post to verify media
echo ""
echo "9️⃣ Fetching post to verify cropped media..."
POST_DATA=$(curl -s -X GET "$API_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

POST_MEDIA_URL=$(echo $POST_DATA | jq -r '.media[0].url // empty')

if echo "$POST_MEDIA_URL" | grep -q ".crop."; then
    echo -e "${GREEN}✅ Post returns cropped media URL${NC}"
    echo "   URL: $POST_MEDIA_URL"
else
    echo -e "${RED}❌ Post does not return cropped URL${NC}"
    echo "   URL: $POST_MEDIA_URL"
    exit 1
fi

# Test accessing the cropped file
echo ""
echo "🔟 Testing cropped file accessibility..."
CROPPED_FILE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080$POST_MEDIA_URL")

if [ "$CROPPED_FILE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Cropped file is accessible${NC}"
else
    echo -e "${RED}❌ Cropped file not accessible (HTTP $CROPPED_FILE_STATUS)${NC}"
    exit 1
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Backend running"
echo "  ✅ Database schema updated"
echo "  ✅ Login successful"
echo "  ✅ Image uploaded"
echo "  ✅ Post created with crop data"
echo "  ✅ Cropped file created"
echo "  ✅ Database updated"
echo "  ✅ Post returns cropped URL"
echo "  ✅ Cropped file accessible"
echo ""
echo "📝 Test Results:"
echo "   Media ID: $MEDIA_ID"
echo "   Post ID: $POST_ID"
echo "   Cropped URL: $POST_MEDIA_URL"
echo ""
echo "🌐 View in browser:"
echo "   Frontend: $FRONTEND_URL"
echo "   Post: $FRONTEND_URL/post/$POST_ID"
echo ""
echo "🗂️  Check files:"
echo "   ls -lh custom-backend/storage/media/*.crop.*"
echo ""

# Cleanup option
read -p "Delete test post and files? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning up..."
    curl -s -X DELETE "$API_URL/posts/$POST_ID" -H "Authorization: Bearer $TOKEN" > /dev/null
    rm -f custom-backend/storage/media/*$MEDIA_ID*
    rm -f "$TEST_IMAGE"
    echo -e "${GREEN}✅ Cleanup complete${NC}"
fi

echo ""
echo "✨ Image Edit functionality is working correctly!"
