#!/bin/bash

echo "======================================"
echo "Testing Notifications with Real Users"
echo "======================================"
echo ""

API_URL="http://localhost:8080/api"
PASSWORD="TestPass123!@#"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Step 1: Login as User 1 (crypto_trader_pro)"
echo "--------------------------------------"
USER1_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"crypto_trader_pro\",
    \"password\": \"$PASSWORD\"
  }")

USER1_TOKEN=$(echo $USER1_LOGIN | jq -r '.token // empty')
USER1_ID=$(echo $USER1_LOGIN | jq -r '.user.id // empty')

echo "✓ User 1 logged in"
echo "User 1 ID: $USER1_ID"
echo ""

echo "Step 2: Login as User 2 (forex_master_fx)"
echo "--------------------------------------"
USER2_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"forex_master_fx\",
    \"password\": \"$PASSWORD\"
  }")

USER2_TOKEN=$(echo $USER2_LOGIN | jq -r '.token // empty')
USER2_ID=$(echo $USER2_LOGIN | jq -r '.user.id // empty')

echo "✓ User 2 logged in"
echo "User 2 ID: $USER2_ID"
echo ""

echo "Step 3: User 2 создает новый пост"
echo "--------------------------------------"
CREATE_POST=$(curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -d '{
    "content": "Test post for notifications - Follow/Like/Reply test"
  }')

POST_ID=$(echo $CREATE_POST | jq -r '.id // empty')
echo "✓ Post created, ID: $POST_ID"
echo ""

sleep 1

echo "Step 4: User 1 подписывается на User 2"
echo "--------------------------------------"
FOLLOW=$(curl -s -X POST "$API_URL/users/$USER2_ID/follow" \
  -H "Authorization: Bearer $USER1_TOKEN")
echo "Follow response: $(echo $FOLLOW | jq -c '.')"
echo ""

sleep 1

echo "Step 5: Проверяем уведомления User 2"
echo "--------------------------------------"
NOTIFICATIONS=$(curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $USER2_TOKEN")

echo "Notifications response:"
echo $NOTIFICATIONS | jq '.'
echo ""

FOLLOW_COUNT=$(echo $NOTIFICATIONS | jq -r '[.[] | select(.type == "follow")] | length')
echo "Follow notifications found: $FOLLOW_COUNT"

if [ "$FOLLOW_COUNT" != "0" ] && [ "$FOLLOW_COUNT" != "null" ]; then
  echo -e "${GREEN}✓ FOLLOW NOTIFICATION WORKING!${NC}"
else
  echo -e "${RED}✗ Follow notification NOT working${NC}"
fi
echo ""

sleep 1

echo "Step 6: User 1 лайкает пост User 2"
echo "--------------------------------------"
LIKE=$(curl -s -X POST "$API_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $USER1_TOKEN")
echo "Like response: $(echo $LIKE | jq -c '.')"
echo ""

sleep 1

echo "Step 7: Проверяем уведомления User 2 снова"
echo "--------------------------------------"
NOTIFICATIONS=$(curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $USER2_TOKEN")

LIKE_COUNT=$(echo $NOTIFICATIONS | jq -r '[.[] | select(.type == "like")] | length')
echo "Like notifications found: $LIKE_COUNT"

if [ "$LIKE_COUNT" != "0" ] && [ "$LIKE_COUNT" != "null" ]; then
  echo -e "${GREEN}✓ LIKE NOTIFICATION WORKING!${NC}"
else
  echo -e "${RED}✗ Like notification NOT working${NC}"
fi
echo ""

sleep 1

echo "Step 8: User 1 создает комментарий к посту User 2"
echo "--------------------------------------"
COMMENT=$(curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d "{
    \"content\": \"Great analysis! Thanks for sharing.\",
    \"reply_to_id\": \"$POST_ID\"
  }")

COMMENT_ID=$(echo $COMMENT | jq -r '.id // empty')
echo "Comment created, ID: $COMMENT_ID"
echo ""

sleep 1

echo "Step 9: Проверяем финальные уведомления User 2"
echo "--------------------------------------"
NOTIFICATIONS=$(curl -s -X GET "$API_URL/notifications" \
  -H "Authorization: Bearer $USER2_TOKEN")

REPLY_COUNT=$(echo $NOTIFICATIONS | jq -r '[.[] | select(.type == "reply")] | length')
echo "Reply notifications found: $REPLY_COUNT"

if [ "$REPLY_COUNT" != "0" ] && [ "$REPLY_COUNT" != "null" ]; then
  echo -e "${GREEN}✓ REPLY NOTIFICATION WORKING!${NC}"
else
  echo -e "${RED}✗ Reply notification NOT working${NC}"
fi
echo ""

echo "======================================"
echo "FINAL SUMMARY"
echo "======================================"
echo "All notifications for User 2:"
echo $NOTIFICATIONS | jq '[.[] | {type, created_at, id}]'
echo ""

FOLLOW_COUNT=$(echo $NOTIFICATIONS | jq -r '[.[] | select(.type == "follow")] | length')
LIKE_COUNT=$(echo $NOTIFICATIONS | jq -r '[.[] | select(.type == "like")] | length')
REPLY_COUNT=$(echo $NOTIFICATIONS | jq -r '[.[] | select(.type == "reply")] | length')

echo "Results:"
if [ "$FOLLOW_COUNT" != "0" ] && [ "$FOLLOW_COUNT" != "null" ]; then
  echo -e "  Follow: ${GREEN}✓ WORKING${NC} ($FOLLOW_COUNT notifications)"
else
  echo -e "  Follow: ${RED}✗ NOT WORKING${NC}"
fi

if [ "$LIKE_COUNT" != "0" ] && [ "$LIKE_COUNT" != "null" ]; then
  echo -e "  Like:   ${GREEN}✓ WORKING${NC} ($LIKE_COUNT notifications)"
else
  echo -e "  Like:   ${RED}✗ NOT WORKING${NC}"
fi

if [ "$REPLY_COUNT" != "0" ] && [ "$REPLY_COUNT" != "null" ]; then
  echo -e "  Reply:  ${GREEN}✓ WORKING${NC} ($REPLY_COUNT notifications)"
else
  echo -e "  Reply:  ${RED}✗ NOT WORKING${NC}"
fi
