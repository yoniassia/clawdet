#!/bin/bash
# Quick test of security headers via middleware

echo "🔐 Testing Security Headers..."
echo ""

# Start dev server in background
cd /root/.openclaw/workspace/clawdet
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test headers
echo "📡 Fetching headers from http://localhost:3000/"
curl -sI http://localhost:3000/ | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Content-Security-Policy|Strict-Transport-Security|Referrer-Policy|Permissions-Policy)"

echo ""
echo "✅ Security headers test complete"

# Cleanup
kill $DEV_PID 2>/dev/null

exit 0
