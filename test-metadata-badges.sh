#!/bin/bash

# Test script for metadata badges display
echo "🧪 Testing Metadata Badges Display"
echo "=================================="
echo ""

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"crypto_trader_pro","password":"password123"}' | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token. Make sure crypto_trader_pro exists."
  echo "Run: ./seed-test-users.sh first"
  exit 1
fi

echo "✅ Authenticated as crypto_trader_pro"
echo ""

# Delete all posts by testuser
echo "🗑️  Deleting old posts..."
POSTS=$(curl -s -X GET "http://localhost:8080/timeline/explore?limit=100" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].id')

for POST_ID in $POSTS; do
  curl -s -X DELETE "http://localhost:8080/posts/$POST_ID" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  echo "   Deleted post: $POST_ID"
done

echo ""
echo "✅ Old posts deleted"
echo ""

# Create test post with ALL metadata
echo "📝 Creating test post with metadata..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:8080/posts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post for metadata badges! This should show Bullish, Crypto Market, Macro category, 1d timeframe, and Low risk badges.",
    "metadata": {
      "sentiment": "bullish",
      "market": "Crypto",
      "category": "Macro",
      "timeframe": "1d",
      "risk": "Low",
      "ticker": "BTC"
    },
    "visibility": "public"
  }')

POST_ID=$(echo $RESPONSE | jq -r '.id')

if [ "$POST_ID" = "null" ] || [ -z "$POST_ID" ]; then
  echo "❌ Failed to create post"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Post created successfully!"
echo "   Post ID: $POST_ID"
echo ""

# Fetch and display the post
echo "📖 Fetching post to verify metadata..."
echo ""

POST_DATA=$(curl -s -X GET "http://localhost:8080/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Post content: $(echo $POST_DATA | jq -r '.content')"
echo ""
echo "Metadata:"
echo "  - sentiment: $(echo $POST_DATA | jq -r '.metadata.sentiment')"
echo "  - market: $(echo $POST_DATA | jq -r '.metadata.market')"
echo "  - category: $(echo $POST_DATA | jq -r '.metadata.category')"
echo "  - timeframe: $(echo $POST_DATA | jq -r '.metadata.timeframe')"
echo "  - risk: $(echo $POST_DATA | jq -r '.metadata.risk')"
echo "  - ticker: $(echo $POST_DATA | jq -r '.metadata.ticker')"
echo ""

# Check if all metadata is present
SENTIMENT=$(echo $POST_DATA | jq -r '.metadata.sentiment')
MARKET=$(echo $POST_DATA | jq -r '.metadata.market')
CATEGORY=$(echo $POST_DATA | jq -r '.metadata.category')

if [ "$SENTIMENT" != "null" ] && [ "$SENTIMENT" = "bullish" ]; then
  echo "✅ Sentiment metadata correct: $SENTIMENT"
else
  echo "❌ Sentiment metadata incorrect: $SENTIMENT"
fi

if [ "$MARKET" != "null" ] && [ "$MARKET" = "Crypto" ]; then
  echo "✅ Market metadata correct: $MARKET"
else
  echo "❌ Market metadata incorrect: $MARKET"
fi

if [ "$CATEGORY" != "null" ] && [ "$CATEGORY" = "Macro" ]; then
  echo "✅ Category metadata correct: $CATEGORY"
else
  echo "❌ Category metadata incorrect: $CATEGORY"
fi

echo ""
echo "=================================="
echo "✅ Test complete!"
echo ""
echo "🌐 Now open http://localhost:5173/feed-test in your browser"
echo "   You should see the following badges on the post:"
echo "   • Bullish (green)"
echo "   • Crypto (blue)"
echo "   • Macro (purple)"
echo "   • 1d (cyan)"
echo "   • Risk: Low (green)"
echo "   • BTC ticker"
echo ""
