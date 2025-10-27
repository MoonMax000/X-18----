#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API URL
API_URL="http://localhost:8080/api"

# Счетчики
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Custom Backend API Testing Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Функция для проверки успешности запроса
check_response() {
    local test_name=$1
    local response=$2
    local expected_code=$3
    
    # Извлекаем HTTP код
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $test_name - PASSED (HTTP $http_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $test_name - FAILED (Expected $expected_code, got $http_code)"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Функция для извлечения JSON тела (без HTTP кода)
get_json_body() {
    local response=$1
    echo "$response" | sed '$d'
}

# Тест 1: Health Check
echo -e "\n${YELLOW}[TEST 1]${NC} Health Check"
response=$(curl -s -w "\n%{http_code}" "$API_URL/../health")
check_response "Health endpoint" "$response" "200"

# Тест 2: API Info
echo -e "\n${YELLOW}[TEST 2]${NC} API Info"
response=$(curl -s -w "\n%{http_code}" "$API_URL/")
check_response "API info endpoint" "$response" "200"

# Тест 3: Регистрация пользователя
echo -e "\n${YELLOW}[TEST 3]${NC} User Registration"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"
TEST_PASSWORD="TestPass123!"

registration_response=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"display_name\": \"Test User\"
    }")

if check_response "User registration" "$registration_response" "201"; then
    # Извлекаем access_token из ответа
    json_body=$(get_json_body "$registration_response")
    ACCESS_TOKEN=$(echo "$json_body" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo -e "   ${GREEN}→${NC} Access Token: ${ACCESS_TOKEN:0:20}..."
fi

# Тест 4: Логин
echo -e "\n${YELLOW}[TEST 4]${NC} User Login"
login_response=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

if check_response "User login" "$login_response" "200"; then
    # Обновляем токен
    json_body=$(get_json_body "$login_response")
    ACCESS_TOKEN=$(echo "$json_body" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo -e "   ${GREEN}→${NC} Login successful, token refreshed"
fi

# Тест 5: Получение текущего пользователя
echo -e "\n${YELLOW}[TEST 5]${NC} Get Current User"
if [ -n "$ACCESS_TOKEN" ]; then
    user_response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/users/me" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if check_response "Get current user" "$user_response" "200"; then
        json_body=$(get_json_body "$user_response")
        username=$(echo "$json_body" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        echo -e "   ${GREEN}→${NC} Username: $username"
    fi
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Тест 6: Создание поста
echo -e "\n${YELLOW}[TEST 6]${NC} Create Post"
if [ -n "$ACCESS_TOKEN" ]; then
    post_response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/posts/" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"content\": \"Test post from automated script \$BTC bullish 1h\",
            \"visibility\": \"public\",
            \"metadata\": {
                \"ticker\": \"BTC\",
                \"sentiment\": \"bullish\",
                \"timeframe\": \"1h\",
                \"market\": \"crypto\"
            }
        }")
    
    if check_response "Create post" "$post_response" "201"; then
        json_body=$(get_json_body "$post_response")
        POST_ID=$(echo "$json_body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "   ${GREEN}→${NC} Post ID: $POST_ID"
    fi
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Тест 7: Получение поста
echo -e "\n${YELLOW}[TEST 7]${NC} Get Post"
if [ -n "$POST_ID" ]; then
    get_post_response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/posts/$POST_ID")
    check_response "Get post by ID" "$get_post_response" "200"
else
    echo -e "${RED}✗${NC} Skipped - No post ID"
    ((TESTS_FAILED++))
fi

# Тест 8: Лайк поста
echo -e "\n${YELLOW}[TEST 8]${NC} Like Post"
if [ -n "$POST_ID" ] && [ -n "$ACCESS_TOKEN" ]; then
    like_response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/posts/$POST_ID/like" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    check_response "Like post" "$like_response" "201"
else
    echo -e "${RED}✗${NC} Skipped - No post ID or token"
    ((TESTS_FAILED++))
fi

# Тест 9: Timeline (Explore)
echo -e "\n${YELLOW}[TEST 9]${NC} Get Timeline (Explore)"
if [ -n "$ACCESS_TOKEN" ]; then
    timeline_response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/timeline/explore?limit=10")
    
    if check_response "Get explore timeline" "$timeline_response" "200"; then
        # Подсчет постов
        json_body=$(get_json_body "$timeline_response")
        post_count=$(echo "$json_body" | grep -o '"id":' | wc -l)
        echo -e "   ${GREEN}→${NC} Posts loaded: $post_count"
    fi
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Тест 10: Home Timeline (требует auth)
echo -e "\n${YELLOW}[TEST 10]${NC} Get Home Timeline"
if [ -n "$ACCESS_TOKEN" ]; then
    home_timeline_response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/timeline/home?limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    check_response "Get home timeline" "$home_timeline_response" "200"
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Тест 11: Trending Posts
echo -e "\n${YELLOW}[TEST 11]${NC} Get Trending Posts"
trending_response=$(curl -s -w "\n%{http_code}" \
    -X GET "$API_URL/timeline/trending?limit=5")
check_response "Get trending posts" "$trending_response" "200"

# Тест 12: Search Users
echo -e "\n${YELLOW}[TEST 12]${NC} Search Users"
search_response=$(curl -s -w "\n%{http_code}" \
    -X GET "$API_URL/search/users?q=test&limit=10")
check_response "Search users" "$search_response" "200"

# Тест 13: Notifications
echo -e "\n${YELLOW}[TEST 13]${NC} Get Notifications"
if [ -n "$ACCESS_TOKEN" ]; then
    notif_response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/notifications/?limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    check_response "Get notifications" "$notif_response" "200"
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Тест 14: Unread Count
echo -e "\n${YELLOW}[TEST 14]${NC} Get Unread Notifications Count"
if [ -n "$ACCESS_TOKEN" ]; then
    unread_response=$(curl -s -w "\n%{http_code}" \
        -X GET "$API_URL/notifications/unread-count" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if check_response "Get unread count" "$unread_response" "200"; then
        json_body=$(get_json_body "$unread_response")
        count=$(echo "$json_body" | grep -o '"count":[0-9]*' | cut -d':' -f2)
        echo -e "   ${GREEN}→${NC} Unread notifications: $count"
    fi
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Тест 15: Logout
echo -e "\n${YELLOW}[TEST 15]${NC} User Logout"
if [ -n "$ACCESS_TOKEN" ]; then
    logout_response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/auth/logout" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    check_response "User logout" "$logout_response" "200"
else
    echo -e "${RED}✗${NC} Skipped - No access token"
    ((TESTS_FAILED++))
fi

# Итоговая статистика
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}           Test Results${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "${BLUE}Total:${NC}  $TOTAL"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi
