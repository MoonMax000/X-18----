#!/bin/bash

# Script to test post creation functionality
# This script tests the complete flow: media upload -> post creation -> verification

set -e

echo "🧪 Testing Post Creation Functionality"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${API_URL:-http://localhost:8080/api}"

# Function to login and get token
login_and_get_token() {
    local email=$1
    local password=$2
    
    echo "🔐 Logging in as $email..."
    
    response=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo $response | jq -r '.access_token')
    
    if [ "$token" = "null" ] || [ -z "$token" ]; then
        echo -e "${RED}❌ Login failed${NC}"
        echo "Response: $response"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "$token"
}

# Test 1: Create simple text post
test_simple_post() {
    local token=$1
    
    echo ""
    echo "📝 Test 1: Creating simple text post..."
    
    response=$(curl -s -X POST "$API_URL/posts/" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d '{
            "content": "Test post from automated test script! 🚀",
            "visibility": "public"
        }')
    
    post_id=$(echo $response | jq -r '.id')
    
    if [ "$post_id" = "null" ] || [ -z "$post_id" ]; then
        echo -e "${RED}❌ Failed to create simple post${NC}"
        echo "Response: $response"
        return 1
    fi
    
    echo -e "${GREEN}✅ Simple post created successfully${NC}"
    echo "   Post ID: $post_id"
    return 0
}

# Test 2: Create post with metadata
test_post_with_metadata() {
    local token=$1
    
    echo ""
    echo "📊 Test 2: Creating post with trading metadata..."
    
    response=$(curl -s -X POST "$API_URL/posts/" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d '{
            "content": "BTC looking bullish! Entry at 65k 📈",
            "visibility": "public",
            "metadata": {
                "post_type": "signal",
                "market": "crypto",
                "ticker": "BTCUSDT",
                "sentiment": "bullish",
                "timeframe": "4h",
                "risk": "medium"
            }
        }')
    
    post_id=$(echo $response | jq -r '.id')
    metadata=$(echo $response | jq -r '.metadata')
    
    if [ "$post_id" = "null" ] || [ -z "$post_id" ]; then
        echo -e "${RED}❌ Failed to create post with metadata${NC}"
        echo "Response: $response"
        return 1
    fi
    
    echo -e "${GREEN}✅ Post with metadata created successfully${NC}"
    echo "   Post ID: $post_id"
    echo "   Metadata: $metadata"
    return 0
}

# Test 3: Create post with different visibility levels
test_visibility_levels() {
    local token=$1
    
    echo ""
    echo "🔒 Test 3: Testing visibility levels..."
    
    for visibility in "public" "followers" "private"; do
        echo "   Creating $visibility post..."
        
        response=$(curl -s -X POST "$API_URL/posts/" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "{
                \"content\": \"Test post with $visibility visibility\",
                \"visibility\": \"$visibility\"
            }")
        
        post_id=$(echo $response | jq -r '.id')
        post_visibility=$(echo $response | jq -r '.visibility')
        
        if [ "$post_id" = "null" ] || [ -z "$post_id" ]; then
            echo -e "   ${RED}❌ Failed to create $visibility post${NC}"
            return 1
        fi
        
        if [ "$post_visibility" != "$visibility" ]; then
            echo -e "   ${RED}❌ Visibility mismatch: expected $visibility, got $post_visibility${NC}"
            return 1
        fi
        
        echo -e "   ${GREEN}✅ $visibility post created${NC}"
    done
    
    return 0
}

# Test 4: Get timeline and verify posts appear
test_timeline() {
    local token=$1
    
    echo ""
    echo "📱 Test 4: Verifying posts appear in timeline..."
    
    response=$(curl -s -X GET "$API_URL/timeline/home?limit=5" \
        -H "Authorization: Bearer $token")
    
    posts_count=$(echo $response | jq '. | length')
    
    if [ "$posts_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Timeline retrieved successfully${NC}"
        echo "   Found $posts_count posts"
        
        # Show first post details
        echo "   Latest post:"
        echo $response | jq -r '.[0] | "   - ID: \(.id)\n   - Content: \(.content)\n   - Visibility: \(.visibility)"'
        return 0
    else
        echo -e "${RED}❌ No posts found in timeline${NC}"
        return 1
    fi
}

# Test 5: Test post deletion
test_post_deletion() {
    local token=$1
    
    echo ""
    echo "🗑️  Test 5: Testing post deletion..."
    
    # Create a post to delete
    response=$(curl -s -X POST "$API_URL/posts/" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d '{
            "content": "This post will be deleted",
            "visibility": "public"
        }')
    
    post_id=$(echo $response | jq -r '.id')
    
    if [ "$post_id" = "null" ] || [ -z "$post_id" ]; then
        echo -e "${RED}❌ Failed to create post for deletion test${NC}"
        return 1
    fi
    
    echo "   Created post ID: $post_id"
    
    # Delete the post
    delete_response=$(curl -s -X DELETE "$API_URL/posts/$post_id" \
        -H "Authorization: Bearer $token")
    
    message=$(echo $delete_response | jq -r '.message')
    
    if [ "$message" = "Post deleted successfully" ]; then
        echo -e "${GREEN}✅ Post deleted successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to delete post${NC}"
        echo "Response: $delete_response"
        return 1
    fi
}

# Main test execution
main() {
    echo "Starting tests..."
    echo ""
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        echo "Install it with: brew install jq (macOS) or apt-get install jq (Linux)"
        exit 1
    fi
    
    # Check if backend is running  
    echo "🔍 Checking if backend is running..."
    if ! curl -s -f "http://localhost:8080/health" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Backend not responding at http://localhost:8080${NC}"
        echo "Make sure to start the backend with: ./START_CUSTOM_BACKEND_STACK.sh"
        exit 1
    fi
    echo -e "${GREEN}✅ Backend is running${NC}"
    
    # Login (use email from seed-test-users.sh)
    TOKEN=$(login_and_get_token "crypto_trader_pro@example.com" "password123")
    
    # Run tests
    TESTS_PASSED=0
    TESTS_FAILED=0
    
    if test_simple_post "$TOKEN"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if test_post_with_metadata "$TOKEN"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if test_visibility_levels "$TOKEN"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if test_timeline "$TOKEN"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if test_post_deletion "$TOKEN"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Summary
    echo ""
    echo "========================================"
    echo "📊 Test Summary"
    echo "========================================"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        echo ""
        echo "✨ Post creation functionality is working correctly"
        echo "You can now test it in the UI at http://localhost:5173/feedtest"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        exit 1
    fi
}

# Run main function
main
