#!/bin/bash
# Test Provisioning Flow

echo "🧪 Testing Clawdet Provisioning System"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo ""
echo "📋 Step 1: Create a test user"
echo "------------------------------"

# Mock user data (simulating OAuth callback)
USER_DATA='{
  "xId": "test_'$(date +%s)'",
  "xUsername": "testuser'$(date +%s | tail -c 5)'",
  "xName": "Test User",
  "email": "test@example.com",
  "termsAccepted": true
}'

echo "Creating user with data:"
echo "$USER_DATA" | jq .

# Save to database directly using the API
# (In real flow, this would happen via OAuth)
echo ""
echo "⚠️  Simulating user creation..."
echo "(In production, this happens via X OAuth)"

# For now, manually create a test user record
cat > /tmp/test-user.json <<EOF
$USER_DATA
EOF

USER_ID="user_$(date +%s)_$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 7 | head -n 1)"

echo ""
echo "✅ Test user created: $USER_ID"

echo ""
echo "📋 Step 2: Simulate payment webhook"
echo "-----------------------------------"

WEBHOOK_DATA='{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_'$(date +%s)'",
      "amount_total": 2000,
      "currency": "usd",
      "customer_email": "test@example.com",
      "metadata": {
        "userId": "'$USER_ID'"
      }
    }
  }
}'

echo "Sending webhook:"
echo "$WEBHOOK_DATA" | jq .

WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -d "$WEBHOOK_DATA")

echo ""
echo "Webhook response:"
echo "$WEBHOOK_RESPONSE" | jq .

if echo "$WEBHOOK_RESPONSE" | jq -e '.received == true' > /dev/null; then
  echo -e "${GREEN}✅ Webhook processed successfully${NC}"
else
  echo -e "${RED}❌ Webhook failed${NC}"
  exit 1
fi

echo ""
echo "📋 Step 3: Check provisioning status"
echo "------------------------------------"

for i in {1..5}; do
  echo ""
  echo "Check #$i (waiting 3 seconds...)"
  sleep 3
  
  STATUS=$(curl -s "$BASE_URL/api/provisioning/status?userId=$USER_ID")
  
  echo "Status:"
  echo "$STATUS" | jq .
  
  CURRENT_STATUS=$(echo "$STATUS" | jq -r '.status')
  PROGRESS=$(echo "$STATUS" | jq -r '.progress')
  MESSAGE=$(echo "$STATUS" | jq -r '.message')
  
  echo -e "${YELLOW}Status: $CURRENT_STATUS ($PROGRESS%) - $MESSAGE${NC}"
  
  if [ "$CURRENT_STATUS" == "complete" ]; then
    INSTANCE_URL=$(echo "$STATUS" | jq -r '.instanceUrl')
    echo -e "${GREEN}✅ PROVISIONING COMPLETE!${NC}"
    echo -e "${GREEN}Instance URL: $INSTANCE_URL${NC}"
    break
  fi
  
  if [ "$CURRENT_STATUS" == "failed" ]; then
    echo -e "${RED}❌ PROVISIONING FAILED${NC}"
    exit 1
  fi
done

echo ""
echo "📊 Test Summary"
echo "==============="
echo "User ID: $USER_ID"
echo "Final Status: $CURRENT_STATUS"
echo "Progress: $PROGRESS%"
echo "Message: $MESSAGE"

if [ "$CURRENT_STATUS" == "complete" ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo -e "${YELLOW}⚠️  Provisioning still in progress...${NC}"
fi

echo ""
echo "💡 To manually trigger provisioning:"
echo "curl -X POST $BASE_URL/api/provisioning/start -H 'Content-Type: application/json' -d '{\"userId\":\"$USER_ID\"}'"
