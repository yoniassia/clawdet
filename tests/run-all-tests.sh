#!/bin/bash
# Run complete E2E test suite for Clawdet platform

set -e

echo "🧪 Running Clawdet Complete E2E Test Suite"
echo "=========================================="
echo ""

# Check if Playwright is installed
if [ ! -d "node_modules/@playwright" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check if browsers are installed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
  echo "Installing Playwright browsers..."
  npx playwright install chromium
  npx playwright install-deps chromium
fi

# Run smoke tests first (quick validation)
echo "1️⃣  Running smoke tests..."
echo "-------------------------------------------"
node smoke/smoke-test.js https://test-fresh-1.clawdet.com
if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed. Stopping."
  exit 1
fi
echo ""

# Run E2E tests on production
echo "2️⃣  Running E2E tests on clawdet.com..."
echo "-------------------------------------------"
BASE_URL=https://clawdet.com npx playwright test --project=chromium
echo ""

# Run E2E tests on test instance
echo "3️⃣  Running E2E tests on test-fresh-1..."
echo "-------------------------------------------"
INSTANCE_URL=https://test-fresh-1.clawdet.com npx playwright test e2e/04-instance-chat.spec.js --project=chromium
echo ""

# Run smoke test on test-fresh-2
echo "4️⃣  Running smoke test on test-fresh-2..."
echo "-------------------------------------------"
node smoke/smoke-test.js https://test-fresh-2.clawdet.com
echo ""

# Generate report
echo "📊 Generating test report..."
npx playwright show-report

echo ""
echo "============================================"
echo "✅ Complete E2E test suite finished!"
echo "============================================"
