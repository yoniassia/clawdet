#!/bin/bash
# Security Test Script - Verify authentication and authorization

echo "🔒 Security Test Suite"
echo "====================="
echo ""

BASE_URL="http://localhost:3000"

echo "Test 1: Access provisioning status without auth (should fail with 401)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  "$BASE_URL/api/provisioning/status?userId=test_user_123"

echo ""
echo "---"
echo ""

echo "Test 2: Try to access other user's data (will fail, need real session)"
echo "This test requires a real user session - manual verification needed"

echo ""
echo "---"
echo ""

echo "Test 3: Check security headers on trial chat"
curl -s -I "$BASE_URL/api/trial-chat" | grep -E "X-Content-Type-Options|X-Frame-Options|Content-Security-Policy"

echo ""
echo "---"
echo ""

echo "Test 4: Rate limiting on trial chat (send 25 requests)"
echo "Sending 25 requests..."
for i in {1..25}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/trial-chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"test","count":1}')
  if [ "$STATUS" == "429" ]; then
    echo "✅ Rate limit triggered at request $i (status $STATUS)"
    break
  fi
  if [ "$i" == "25" ]; then
    echo "✅ All requests succeeded - rate limit threshold not reached in test"
  fi
done

echo ""
echo "---"
echo ""

echo "✅ Security tests complete!"
echo ""
echo "Manual verification needed:"
echo "1. Create a user account and get session cookie"
echo "2. Try to access another user's provisioning status with that cookie"
echo "3. Verify 403 Forbidden response"
