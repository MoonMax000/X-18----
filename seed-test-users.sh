#!/bin/bash

# Seed Test Users Script - Creates 10 users with profiles and financial posts
# Each user has: avatar, header image, and 3 posts with metadata

BASE_URL="http://localhost:8080"
PASSWORD="TestPass123!@#"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "   Seeding Test Users & Financial Posts"
echo "========================================"
echo ""

# Avatar URLs from various stock photo services
AVATARS=(
  "https://i.pravatar.cc/300?img=1"
  "https://i.pravatar.cc/300?img=12"
  "https://i.pravatar.cc/300?img=33"
  "https://i.pravatar.cc/300?img=68"
  "https://i.pravatar.cc/300?img=59"
  "https://i.pravatar.cc/300?img=15"
  "https://i.pravatar.cc/300?img=26"
  "https://i.pravatar.cc/300?img=47"
  "https://i.pravatar.cc/300?img=52"
  "https://i.pravatar.cc/300?img=61"
)

# Header URLs (financial-themed banners)
HEADERS=(
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1642790551116-18e150f248e8?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop"
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=400&fit=crop"
)

# User profiles
USERS=(
  '{"username":"crypto_trader_pro","display_name":"Alex Morgan","bio":"Crypto trader & market analyst. Sharing daily signals 📈 | BTC ETH SOL"}'
  '{"username":"forex_master_fx","display_name":"Sarah Chen","bio":"Forex trading expert 💱 | 10+ years experience | USD/EUR specialist"}'
  '{"username":"stock_analyst_mike","display_name":"Mike Johnson","bio":"Stock market analyst 📊 | Tech stocks | Value investing | CFA"}'
  '{"username":"defi_wizard_eth","display_name":"David Kim","bio":"DeFi protocols & yield farming 🌾 | ETH maximalist | Smart contracts"}'
  '{"username":"day_trader_ninja","display_name":"Emma Rodriguez","bio":"Day trading strategies ⚡ | Scalping expert | Risk management"}'
  '{"username":"btc_hodler_2024","display_name":"James Wilson","bio":"Bitcoin maximalist ₿ | Long-term holder | Lightning network enthusiast"}'
  '{"username":"options_trader_pro","display_name":"Lisa Anderson","bio":"Options trading strategies 📉📈 | Greeks master | Volatility trader"}'
  '{"username":"blockchain_analyst","display_name":"Ryan Park","bio":"Blockchain analyst & researcher 🔗 | On-chain metrics | Market cycles"}'
  '{"username":"technical_trader","display_name":"Sofia Martinez","bio":"Technical analysis expert 📐 | Chart patterns | Support/Resistance"}'
  '{"username":"crypto_whale_og","display_name":"Tom Brown","bio":"Crypto whale watcher 🐋 | Market sentiment | Institutional flows"}'
)

# Post templates for different categories
CRYPTO_POSTS=(
  '{"content":"$BTC breaking above 45K resistance! Strong bullish momentum on 4h chart. Target: 48K. Stop loss: 43.5K #Bitcoin #Crypto","metadata":{"post_type":"signal","market":"crypto","ticker":"BTC","sentiment":"bullish","timeframe":"4h","risk":"medium"}}'
  '{"content":"$ETH forming ascending triangle pattern on daily. Breakout imminent? Watch 3.2K level closely. #Ethereum #Altcoins","metadata":{"post_type":"analytics","market":"crypto","ticker":"ETH","sentiment":"bullish","timeframe":"1d","risk":"low"}}'
  '{"content":"🚨 $SOL short setup: Bearish divergence on 1h RSI. Entry: 105, TP: 98, SL: 108 #Solana #Trading","metadata":{"post_type":"signal","market":"crypto","ticker":"SOL","sentiment":"bearish","timeframe":"1h","risk":"high"}}'
  '{"content":"Bitcoin dominance rising to 52%. Alt season delayed? Time to accumulate quality projects during dips. #Crypto #MarketAnalysis","metadata":{"post_type":"analytics","market":"crypto","ticker":"BTC","sentiment":"neutral","timeframe":"1w","risk":"low"}}'
  '{"content":"$ADA breaking out of 6-month consolidation! Long setup: Entry 0.48, TP1: 0.55, TP2: 0.62 #Cardano #Crypto","metadata":{"post_type":"signal","market":"crypto","ticker":"ADA","sentiment":"bullish","timeframe":"1d","risk":"medium"}}'
)

FOREX_POSTS=(
  '{"content":"EUR/USD showing strong support at 1.0850. Expecting bounce to 1.0950. ECB rate decision ahead. #Forex #EURUSD","metadata":{"post_type":"analytics","market":"forex","ticker":"EURUSD","sentiment":"bullish","timeframe":"4h","risk":"low"}}'
  '{"content":"🔴 GBP/USD short signal: Break below 1.2650. Target: 1.2550. Stop: 1.2720 | UK inflation data weak #Forex","metadata":{"post_type":"signal","market":"forex","ticker":"GBPUSD","sentiment":"bearish","timeframe":"1h","risk":"medium"}}'
  '{"content":"USD/JPY approaching major resistance at 150.00. BoJ intervention risk high. Consider taking profits. #Forex #Yen","metadata":{"post_type":"analytics","market":"forex","ticker":"USDJPY","sentiment":"neutral","timeframe":"1d","risk":"high"}}'
  '{"content":"AUD/USD long setup on weekly support: Entry 0.6450, TP 0.6620, SL 0.6380. RBA hawkish stance #Forex","metadata":{"post_type":"signal","market":"forex","ticker":"AUDUSD","sentiment":"bullish","timeframe":"1w","risk":"medium"}}'
)

STOCKS_POSTS=(
  '{"content":"$AAPL breaking all-time highs! iPhone 16 sales exceeding expectations. Long-term bullish. PT: $200 #Stocks #Tech","metadata":{"post_type":"analytics","market":"stocks","ticker":"AAPL","sentiment":"bullish","timeframe":"1d","risk":"low"}}'
  '{"content":"$NVDA pullback to $480 support - excellent buy opportunity! AI boom continuing. Long position here. #Stocks #AI","metadata":{"post_type":"signal","market":"stocks","ticker":"NVDA","sentiment":"bullish","timeframe":"4h","risk":"medium"}}'
  '{"content":"$TSLA bearish pattern forming. Resistance at $260. Short setup: Entry 258, TP 240, SL 268 #Tesla #Stocks","metadata":{"post_type":"signal","market":"stocks","ticker":"TSLA","sentiment":"bearish","timeframe":"1h","risk":"high"}}'
  '{"content":"Tech sector showing weakness. $MSFT and $GOOGL underperforming. Rotation into value stocks? #MarketAnalysis","metadata":{"post_type":"analytics","market":"stocks","ticker":"MSFT","sentiment":"neutral","timeframe":"1w","risk":"low"}}'
  '{"content":"$META breaking consolidation! Social media stocks rallying. Long position: Entry 350, TP 380, SL 340 #Stocks","metadata":{"post_type":"signal","market":"stocks","ticker":"META","sentiment":"bullish","timeframe":"1d","risk":"medium"}}'
)

DEFI_POSTS=(
  '{"content":"$UNI governance token showing strength. DEX volume increasing 40% this week. Bullish on DeFi summer return! #DeFi","metadata":{"post_type":"analytics","market":"crypto","ticker":"UNI","sentiment":"bullish","timeframe":"1w","risk":"medium"}}'
  '{"content":"$AAVE lending protocol TVL growing. Institutional adoption increasing. Long-term hold. #DeFi #Lending","metadata":{"post_type":"analytics","market":"crypto","ticker":"AAVE","sentiment":"bullish","timeframe":"1d","risk":"low"}}'
  '{"content":"Yield farming opportunity: 45% APY on ETH-USDC pair on Curve. Risk: impermanent loss. #DeFi #YieldFarming","metadata":{"post_type":"education","market":"crypto","ticker":"ETH","sentiment":"neutral","timeframe":"1w","risk":"high"}}'
)

COMMODITIES_POSTS=(
  '{"content":"Gold breaking above $2050! Safe haven demand rising. Long setup: Entry 2055, TP 2100, SL 2035 #Gold #Commodities","metadata":{"post_type":"signal","market":"commodities","ticker":"XAUUSD","sentiment":"bullish","timeframe":"4h","risk":"low"}}'
  '{"content":"Crude oil testing major support at $75. OPEC+ meeting next week. Watching for production cut signals. #Oil","metadata":{"post_type":"analytics","market":"commodities","ticker":"CL","sentiment":"neutral","timeframe":"1d","risk":"medium"}}'
  '{"content":"Silver showing strong momentum! Industrial demand + inflation hedge. Long position here. #Silver #Commodities","metadata":{"post_type":"analytics","market":"commodities","ticker":"XAGUSD","sentiment":"bullish","timeframe":"1w","risk":"medium"}}'
)

# Function to create user and posts
create_user_with_posts() {
  local index=$1
  local user_data=${USERS[$index]}
  local username=$(echo $user_data | jq -r '.username')
  local display_name=$(echo $user_data | jq -r '.display_name')
  local bio=$(echo $user_data | jq -r '.bio')
  local avatar=${AVATARS[$index]}
  local header=${HEADERS[$index]}
  
  echo -e "${BLUE}Creating user $((index+1))/10: $username${NC}"
  
  # Register user
  local register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$username\",
      \"email\": \"${username}@example.com\",
      \"password\": \"$PASSWORD\"
    }")
  
  local token=$(echo $register_response | jq -r '.access_token')
  
  if [ "$token" == "null" ] || [ -z "$token" ]; then
    echo -e "  ${YELLOW}⚠ User might exist, trying login...${NC}"
    local login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"${username}@example.com\",
        \"password\": \"$PASSWORD\"
      }")
    token=$(echo $login_response | jq -r '.access_token')
  fi
  
  if [ "$token" == "null" ] || [ -z "$token" ]; then
    echo -e "  ${YELLOW}✗ Failed to authenticate user${NC}"
    return
  fi
  
  echo -e "  ${GREEN}✓ User authenticated${NC}"
  
  # Update profile with avatar, header, and bio
  curl -s -X PATCH "$BASE_URL/api/users/me" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "{
      \"display_name\": \"$display_name\",
      \"bio\": \"$bio\",
      \"avatar_url\": \"$avatar\",
      \"header_url\": \"$header\"
    }" > /dev/null
  
  echo -e "  ${GREEN}✓ Profile updated (avatar + header)${NC}"
  
  # Create 3 posts with different categories
  local post_count=0
  local all_posts=("${CRYPTO_POSTS[@]}" "${FOREX_POSTS[@]}" "${STOCKS_POSTS[@]}" "${DEFI_POSTS[@]}" "${COMMODITIES_POSTS[@]}")
  
  # Select 3 random posts for this user
  local selected_indices=($(shuf -i 0-$((${#all_posts[@]}-1)) -n 3))
  
  for post_index in "${selected_indices[@]}"; do
    local post_data=${all_posts[$post_index]}
    
    curl -s -X POST "$BASE_URL/api/posts" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$post_data" > /dev/null
    
    ((post_count++))
    echo -e "  ${GREEN}✓ Post $post_count created${NC}"
    sleep 0.2
  done
  
  echo -e "  ${GREEN}✓ User $username completed (3 posts)${NC}"
  echo ""
}

# Create all users
for i in {0..9}; do
  create_user_with_posts $i
  sleep 0.5
done

echo "========================================"
echo -e "${GREEN}✓ Seed completed!${NC}"
echo "Created: 10 users with profiles and 30 posts"
echo "Check Market Stream to see the posts!"
echo "========================================"
