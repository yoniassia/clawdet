#!/bin/bash
# Security Testing Script for Clawdet

BASE_URL="http://localhost:3000"
echo "🔒 Testing Clawdet Security Features"
echo "======================================"
echo ""

# Test 1: Security Headers
echo "1️⃣ Testing Security Headers..."
HEADERS=$(curl -s -I "$BASE_URL/api/trial-chat" -X POST -H "Content-Type: application/json" -d '{"message":"test","count":1}' 2>&1 | grep -i "x-\|permissions-policy\|referrer-policy" || echo "No security headers found")
echo "$HEADERS"
echo ""

# Test 2: Rate Limiting
echo "2️⃣ Testing Rate Limiting (will make 22 requests)..."
for i in {1..22}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/trial-chat" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"test $i\",\"count\":1}")
  
  if [ "$STATUS" == "429" ]; then
    echo "✅ Rate limit triggered at request $i (HTTP 429)"
    break
  elif [ $i -eq 22 ]; then
    echo "⚠️  Rate limit NOT triggered after 22 requests"
  fi
done
echo ""

# Test 3: Input Validation
echo "3️⃣ Testing Input Validation..."

# Empty message
RESPONSE=$(curl -s "$BASE_URL/api/trial-chat" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"","count":1}')
if echo "$RESPONSE" | grep -q "error"; then
  echo "✅ Empty message rejected"
else
  echo "⚠️  Empty message NOT rejected"
fi

# XSS attempt
RESPONSE=$(curl -s "$BASE_URL/api/trial-chat" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"<script>alert(1)</script>","count":1}')
if echo "$RESPONSE" | grep -q "response"; then
  echo "✅ XSS attempt handled (sanitized or processed)"
fi
echo ""

# Test 4: Message Limit Enforcement
echo "4️⃣ Testing Message Limit (5 messages)..."
RESPONSE=$(curl -s "$BASE_URL/api/trial-chat" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test","count":6}')
if echo "$RESPONSE" | grep -q "limitReached.*true"; then
  echo "✅ Message limit enforced at count=6"
else
  echo "⚠️  Message limit NOT enforced"
fi
echo ""

# Test 5: Session Cookie Security
echo "5️⃣ Testing Session Cookie Attributes..."
COOKIES=$(curl -s -I "$BASE_URL/signup" | grep -i "set-cookie" || echo "No cookies found")
if echo "$COOKIES" | grep -q "HttpOnly"; then
  echo "✅ HttpOnly flag present"
else
  echo "⚠️  HttpOnly flag missing"
fi
if echo "$COOKIES" | grep -q "Secure"; then
  echo "✅ Secure flag present"
else
  echo "⚠️  Secure flag missing (expected in production)"
fi
echo ""

# Test 6: npm audit
echo "6️⃣ Running npm audit..."
cd /root/.openclaw/workspace/clawdet
npm audit --summary
echo ""

echo "======================================"
echo "✅ Security testing complete!"
echo "Review the results above and address any warnings."
