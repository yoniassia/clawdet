#!/bin/bash
# Launch Readiness Verification Script
# Tests all critical paths and reports readiness status

echo "🚀 CLAWDET LAUNCH READINESS VERIFICATION"
echo "========================================="
echo ""

BASE_URL="http://localhost:18789"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (expected $expected_code, got $response)"
        ((FAILED++))
    fi
}

echo "1. Core Pages"
echo "-------------"
test_endpoint "Landing page" "$BASE_URL/" "200"
test_endpoint "Trial chat" "$BASE_URL/trial" "200"
test_endpoint "Signup page" "$BASE_URL/signup" "200"
test_endpoint "Checkout page" "$BASE_URL/checkout" "200"
echo ""

echo "2. API Endpoints"
echo "----------------"
# Auth endpoint returns 200 with {user: null} when not authenticated
test_endpoint "Auth status" "$BASE_URL/api/auth/me" "200"
test_endpoint "Performance stats" "$BASE_URL/api/stats" "200"
echo ""

echo "3. Static Assets"
echo "----------------"
test_endpoint "Favicon" "$BASE_URL/favicon.ico" "200"
echo ""

echo "4. Build Verification"
echo "---------------------"
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} Next.js build directory exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Next.js build directory missing"
    ((FAILED++))
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} package.json missing"
    ((FAILED++))
fi

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} .env.example missing"
    ((FAILED++))
fi
echo ""

echo "5. Documentation"
echo "----------------"
docs=("README.md" "USER-GUIDE.md" "FAQ.md" "ADMIN-GUIDE.md" "QUICK-START.md" "LAUNCH-CHECKLIST.md" "SECURITY-AUDIT.md" "PERFORMANCE.md" "MOBILE-TESTING.md")
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $doc missing"
        ((FAILED++))
    fi
done
echo ""

echo "6. Critical Files"
echo "-----------------"
critical_files=(
    "lib/db.ts"
    "lib/auth-middleware.ts"
    "lib/hetzner.ts"
    "lib/cloudflare.ts"
    "lib/provisioner.ts"
    "lib/ssh-installer.ts"
    "lib/cache.ts"
    "lib/performance.ts"
)
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $file missing"
        ((FAILED++))
    fi
done
echo ""

echo "7. Environment Variables"
echo "------------------------"
required_vars=(
    "GROK_API_KEY"
    "HETZNER_API_TOKEN"
    "CLOUDFLARE_API_TOKEN"
    "CLOUDFLARE_ZONE_ID"
    "NEXT_PUBLIC_BASE_URL"
)
for var in "${required_vars[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✓${NC} $var is set"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} $var not set (expected for production)"
        # Don't count as failure - these are production-only
    fi
done
echo ""

echo "========================================="
echo "RESULTS"
echo "========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ LAUNCH READY${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure production environment variables"
    echo "2. Set up Stripe production account"
    echo "3. Configure X OAuth production app"
    echo "4. Deploy to production server"
    echo "5. Set up monitoring"
    exit 0
else
    echo -e "${RED}❌ NOT READY${NC}"
    echo ""
    echo "Fix the failed tests above before launching."
    exit 1
fi
