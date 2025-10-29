#!/bin/bash

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:8080/api"

TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Auth Modals Validation Testing${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 1: Email Validation - неверный формат
echo -e "\n${YELLOW}[TEST 1]${NC} Email Validation - Invalid Format"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"invalid","password":"TestPassword123!"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓${NC} Invalid email rejected"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should reject invalid email (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 2: Password - слишком короткий
echo -e "\n${YELLOW}[TEST 2]${NC} Password Validation - Too Short"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"short"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓${NC} Short password rejected"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should reject short password (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 3: Password - нет uppercase
echo -e "\n${YELLOW}[TEST 3]${NC} Password Validation - No Uppercase"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"lowercase123!"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓${NC} Password without uppercase rejected"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should reject password without uppercase (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 4: Password - нет special char
echo -e "\n${YELLOW}[TEST 4]${NC} Password Validation - No Special Char"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"LongPassword123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✓${NC} Password without special char rejected"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should reject password without special char (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 5: Успешная регистрация с правильным паролем
echo -e "\n${YELLOW}[TEST 5]${NC} Valid Registration"
TIMESTAMP=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"validuser${TIMESTAMP}\",\"email\":\"valid${TIMESTAMP}@test.com\",\"password\":\"ValidPassword123!\",\"display_name\":\"Valid User\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓${NC} Valid registration accepted"
  BODY=$(echo "$RESPONSE" | sed '$d')
  ACCESS_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "   ${GREEN}→${NC} Token received: ${ACCESS_TOKEN:0:20}..."
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Valid registration should succeed (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 6: Duplicate email
echo -e "\n${YELLOW}[TEST 6]${NC} Duplicate Email Validation"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"anotheruser${TIMESTAMP}\",\"email\":\"valid${TIMESTAMP}@test.com\",\"password\":\"ValidPassword123!\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "409" ]; then
  echo -e "${GREEN}✓${NC} Duplicate email rejected"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should reject duplicate email (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 7: Login - invalid credentials
echo -e "\n${YELLOW}[TEST 7]${NC} Login - Invalid Credentials"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"WrongPassword123!"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓${NC} Invalid credentials rejected"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should reject invalid credentials (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 8: Login - успешный с правильными credentials
if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "\n${YELLOW}[TEST 8]${NC} Login - Valid Credentials"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"valid${TIMESTAMP}@test.com\",\"password\":\"ValidPassword123!\"}")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Valid login succeeded"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗${NC} Valid login should succeed (got $HTTP_CODE)"
    ((TESTS_FAILED++))
  fi
fi

# Test 9: Get user without auth
echo -e "\n${YELLOW}[TEST 9]${NC} Protected Route - No Auth"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/users/me")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓${NC} Unauthorized access blocked"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Should require authentication (got $HTTP_CODE)"
  ((TESTS_FAILED++))
fi

# Test 10: Get user with auth
if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "\n${YELLOW}[TEST 10]${NC} Protected Route - With Auth"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Authenticated access allowed"
    BODY=$(echo "$RESPONSE" | sed '$d')
    USERNAME=$(echo "$BODY" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "   ${GREEN}→${NC} User: $USERNAME"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗${NC} Should allow authenticated access (got $HTTP_CODE)"
    ((TESTS_FAILED++))
  fi
fi

# Итоги
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}           Test Results${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "${BLUE}Total:${NC}  $TOTAL"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All validation tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed${NC}"
  exit 1
fi
