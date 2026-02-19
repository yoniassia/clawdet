# Clawdet Testing Suite

Complete E2E and smoke testing infrastructure for the Clawdet platform.

## Quick Start

```bash
# Run smoke tests (5 minutes)
node smoke/smoke-test.js https://test-fresh-1.clawdet.com

# Run full E2E suite (30 minutes)
./run-all-tests.sh

# Run specific test file
npx playwright test e2e/01-homepage.spec.js

# Run with UI mode (interactive)
npx playwright test --ui
```

## Test Structure

```
tests/
├── smoke/                   # Quick 5-min validation tests
│   └── smoke-test.js       # Page load, WebSocket, chat, Telegram
├── e2e/                    # Comprehensive end-to-end tests
│   ├── 01-homepage.spec.js         # Homepage and navigation
│   ├── 02-trial-chat.spec.js       # Trial chat with 5-message limit
│   ├── 03-x-oauth.spec.js          # X OAuth signup flow
│   ├── 04-instance-chat.spec.js    # Instance WebSocket chat
│   └── 05-performance.spec.js      # Performance & accessibility
├── playwright.config.js    # Playwright configuration
├── run-all-tests.sh       # Complete test runner
└── package.json           # Dependencies
```

## Smoke Tests

**Purpose:** Quick validation that critical functionality works

**Runtime:** ~5 minutes

**Tests:**
1. ✅ Page loads successfully
2. ✅ WebSocket connects (green "Connected" status)
3. ✅ Can send message and receive response
4. ✅ Telegram setup tab loads

**Usage:**
```bash
cd tests
node smoke/smoke-test.js https://test-fresh-1.clawdet.com
```

**Exit codes:**
- `0` = All tests passed
- `1` = One or more tests failed

**Integration:** Used in deploy.sh for pre-deployment validation

---

## E2E Tests

**Purpose:** Comprehensive testing of all user flows

**Runtime:** ~30 minutes (all browsers)

**Coverage:**

### 01-homepage.spec.js
- Homepage loads successfully
- Navigation works
- Mobile responsive
- Feedback widget present

### 02-trial-chat.spec.js
- Send/receive messages
- 5-message limit enforcement
- Typing indicators
- Network error handling
- Chat history persistence
- Long message handling

### 03-x-oauth.spec.js
- Signup page loads
- X OAuth redirect works
- Free beta messaging shown
- Features listed
- Dashboard requires auth

### 04-instance-chat.spec.js
- Instance landing page loads
- WebSocket connects
- Chat functionality works
- Telegram setup tab
- WebSocket reconnection
- Mobile responsive
- Multiple rapid messages
- Keyboard shortcuts

### 05-performance.spec.js
- Page load times < 3s
- No console errors
- No memory leaks
- Good Core Web Vitals (LCP < 2.5s)
- Proper ARIA labels
- Keyboard navigation
- Color contrast

---

## Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install chromium
npx playwright install-deps chromium

# Run all tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test e2e/02-trial-chat.spec.js

# Interactive UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

### Different Environments

```bash
# Test production
BASE_URL=https://clawdet.com npx playwright test

# Test staging
BASE_URL=https://staging.clawdet.com npx playwright test

# Test instance
INSTANCE_URL=https://test-fresh-1.clawdet.com npx playwright test e2e/04-instance-chat.spec.js
```

### CI/CD

```bash
# Run in headless mode with retries
CI=true npx playwright test --retries=2

# Generate HTML report
npx playwright test --reporter=html

# View report
npx playwright show-report
```

---

## Test Reports

After running tests:

```bash
# View HTML report
npx playwright show-report

# Or open manually
open playwright-report/index.html
```

Reports include:
- Test results (pass/fail)
- Screenshots (on failure)
- Videos (on failure)
- Traces (on retry)
- Performance metrics

---

## Writing New Tests

### Smoke Test Template

```javascript
// tests/smoke/my-smoke-test.js
const { chromium } = require('playwright');

async function smokeTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Your test here
    await page.goto('https://example.com');
    await page.waitForSelector('.my-element');
    console.log('✅ Test passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

smokeTest();
```

### E2E Test Template

```javascript
// tests/e2e/my-feature.spec.js
const { test, expect } = require('@playwright/test');

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    
    const element = page.locator('.my-element');
    await expect(element).toBeVisible();
    
    await element.click();
    await expect(page).toHaveURL(/success/);
  });
});
```

---

## Best Practices

### 1. Wait for Visibility
```javascript
// ✅ Good
await expect(page.locator('.message')).toBeVisible({ timeout: 30000 });

// ❌ Bad
await page.waitForTimeout(5000); // Arbitrary wait
```

### 2. Use Specific Selectors
```javascript
// ✅ Good
await page.locator('#messageInput').fill('test');

// ❌ Bad
await page.locator('input').first().fill('test');
```

### 3. Handle Async Operations
```javascript
// ✅ Good - Wait for response
await page.click('#sendBtn');
await page.waitForSelector('.message.assistant', { timeout: 30000 });

// ❌ Bad - Race condition
await page.click('#sendBtn');
const messages = await page.locator('.message').count();
```

### 4. Clean Up
```javascript
test.afterEach(async ({ page }) => {
  // Clear state
  await page.evaluate(() => localStorage.clear());
});
```

### 5. Use Page Object Pattern
```javascript
class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageInput = page.locator('#messageInput');
    this.sendBtn = page.locator('#sendBtn');
  }
  
  async sendMessage(text) {
    await this.messageInput.fill(text);
    await this.sendBtn.click();
  }
}
```

---

## Debugging Failed Tests

### View Screenshot
```bash
# Screenshots saved to test-results/
ls test-results/**/*.png
```

### View Video
```bash
# Videos saved to test-results/
ls test-results/**/*.webm
```

### View Trace
```bash
# Open trace viewer
npx playwright show-trace test-results/.../trace.zip
```

### Run in Headed Mode
```bash
# See what's happening
npx playwright test --headed
```

### Slow Down Execution
```bash
# Slow down by 1000ms per action
npx playwright test --slow-mo=1000
```

---

## Integration with Deploy Script

The smoke tests are integrated into `scripts/deploy.sh`:

```bash
./scripts/deploy.sh test-fresh-1.clawdet.com
# Runs smoke test before accepting deployment
# Auto-rollback if tests fail
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: cd tests && npm ci
      
      - name: Install Playwright browsers
        run: cd tests && npx playwright install --with-deps chromium
      
      - name: Run smoke tests
        run: cd tests && node smoke/smoke-test.js https://clawdet.com
      
      - name: Run E2E tests
        run: cd tests && npx playwright test --project=chromium
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/playwright-report/
```

---

## Troubleshooting

### Playwright not installed
```bash
cd tests && npm install
npx playwright install chromium
npx playwright install-deps chromium
```

### Tests timing out
```bash
# Increase timeout in test
await expect(element).toBeVisible({ timeout: 60000 });
```

### WebSocket tests failing
```bash
# Check gateway status
ssh root@test-fresh-1.clawdet.com 'systemctl status openclaw-gateway'

# Check gateway logs
ssh root@test-fresh-1.clawdet.com 'journalctl -u openclaw-gateway -f'
```

### Instance tests failing
```bash
# Verify instance is accessible
curl -I https://test-fresh-1.clawdet.com

# Run smoke test first
node smoke/smoke-test.js https://test-fresh-1.clawdet.com
```

---

## Performance Benchmarks

Target metrics:
- Homepage load: < 2s
- Trial page load: < 2s
- WebSocket connect: < 5s
- Message response: < 10s
- LCP (Largest Contentful Paint): < 2.5s
- Memory growth: < 50MB per 10 messages

---

## Test Coverage

Current coverage:
- ✅ Homepage and navigation
- ✅ Trial chat (5-message limit)
- ✅ X OAuth flow
- ✅ Instance WebSocket chat
- ✅ Performance metrics
- ✅ Accessibility basics

TODO:
- ⏳ Full provisioning flow (requires auth)
- ⏳ Dashboard functionality
- ⏳ Telegram setup completion
- ⏳ Payment flow (when Stripe enabled)
- ⏳ Admin dashboard

---

## Questions?

- Check Playwright docs: https://playwright.dev/
- See TESTING-INFRASTRUCTURE.md for architecture
- See main README.md for project overview
