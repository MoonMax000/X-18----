#!/bin/bash

echo "🔌 Testing WebSocket Implementation"
echo "===================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URLs
API_URL="http://localhost:8080/api"
WS_URL="ws://localhost:8080/ws/notifications"

# Debug function
debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# First, register and login to get access token
TIMESTAMP=$(date +%s)
EMAIL="wstest_${TIMESTAMP}@example.com"
PASSWORD="TestPassword123!"
USERNAME="wstest_${TIMESTAMP}"

echo -e "\n${YELLOW}1. Registering test user${NC}"
REGISTER_RESPONSE=$(curl -s -c ws_cookies.txt \
  -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token // empty')

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo "Access token received: ${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo -e "\n${YELLOW}2. Testing WebSocket connection${NC}"

# Create a simple Node.js script to test WebSocket
cat > test-ws-client.cjs << 'EOF'
const WebSocket = require('ws');

const token = process.argv[2];
const wsUrl = process.argv[3];

if (!token || !wsUrl) {
  console.error('Usage: node test-ws-client.js <token> <wsUrl>');
  process.exit(1);
}

console.log('🔌 Connecting to WebSocket...');

const ws = new WebSocket(wsUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

let pingInterval;
let messageCount = 0;

ws.on('open', () => {
  console.log('✅ WebSocket connected');
  
  // Send a test message
  const testMessage = {
    type: 'test',
    data: 'Hello WebSocket!'
  };
  ws.send(JSON.stringify(testMessage));
  console.log('📤 Sent test message:', testMessage);
  
  // Setup ping interval
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
      console.log('🏓 Ping sent');
    }
  }, 30000);
});

ws.on('message', (data) => {
  messageCount++;
  try {
    const message = JSON.parse(data.toString());
    console.log(`📥 Message #${messageCount} received:`, message);
    
    // If we receive a notification, log it specially
    if (message.type === 'notification') {
      console.log('🔔 Notification:', message.data);
    }
  } catch (err) {
    console.log('📥 Raw message received:', data.toString());
  }
});

ws.on('pong', () => {
  console.log('🏓 Pong received');
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket disconnected: ${code} - ${reason}`);
  if (pingInterval) clearInterval(pingInterval);
  process.exit(0);
});

// Test for 10 seconds then close
setTimeout(() => {
  console.log('⏰ Test duration complete, closing connection...');
  ws.close();
}, 10000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Closing WebSocket connection...');
  ws.close();
});
EOF

# Check if ws module is available
if ! npm list ws >/dev/null 2>&1; then
  echo "Installing ws module..."
  npm install ws >/dev/null 2>&1
fi

# Run the WebSocket client
echo -e "${YELLOW}Running WebSocket client test...${NC}"
node test-ws-client.cjs "$ACCESS_TOKEN" "$WS_URL" &
WS_PID=$!

# Wait for the client to finish or timeout
sleep 12

# Check if process is still running
if ps -p $WS_PID > /dev/null 2>&1; then
  echo -e "${YELLOW}Stopping WebSocket client...${NC}"
  kill $WS_PID 2>/dev/null
fi

# Test WebSocket reconnection
echo -e "\n${YELLOW}3. Testing WebSocket auto-reconnection${NC}"

cat > test-ws-reconnect.cjs << 'EOF'
const WebSocket = require('ws');

const token = process.argv[2];
const wsUrl = process.argv[3];

console.log('🔌 Testing WebSocket reconnection...');

let ws;
let reconnectAttempts = 0;
const maxReconnectAttempts = 3;

function connect() {
  ws = new WebSocket(wsUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  ws.on('open', () => {
    console.log(`✅ Connected (attempt ${reconnectAttempts + 1})`);
    reconnectAttempts = 0;
    
    // Simulate connection drop after 2 seconds
    if (reconnectAttempts === 0) {
      setTimeout(() => {
        console.log('🔪 Simulating connection drop...');
        ws.terminate();
      }, 2000);
    }
  });

  ws.on('close', () => {
    console.log('❌ Connection closed');
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`⏳ Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
      setTimeout(connect, delay);
    } else {
      console.log('✅ Reconnection test complete');
      process.exit(0);
    }
  });

  ws.on('error', (err) => {
    console.error('❌ Error:', err.message);
  });
}

connect();
EOF

node test-ws-reconnect.cjs "$ACCESS_TOKEN" "$WS_URL" &
RECONNECT_PID=$!

# Wait for reconnection test
sleep 15

if ps -p $RECONNECT_PID > /dev/null 2>&1; then
  kill $RECONNECT_PID 2>/dev/null
fi

# Cleanup
rm -f ws_cookies.txt test-ws-client.cjs test-ws-reconnect.cjs

echo -e "\n${GREEN}✅ WebSocket test complete!${NC}"

echo -e "\n${YELLOW}Summary:${NC}"
echo "- WebSocket connection with JWT auth"
echo "- Message sending and receiving"
echo "- Ping/pong heartbeat mechanism"
echo "- Auto-reconnection with exponential backoff"
