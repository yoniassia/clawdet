# Comprehensive Test Plan - Clawdet Platform

**Version:** 1.0
**Date:** 2026-02-19
**Author:** Architect (OpenClaw Agent)
**Purpose:** Production readiness validation for WebSocket deployment and future releases

---

## Test Plan Overview

### Objectives

1. **Validate End-to-End Functionality** - Every user path works correctly
2. **Ensure Performance Standards** - Page load, WebSocket latency, API response time
3. **Verify Security Controls** - Auth, input validation, rate limiting
4. **Confirm Cross-Platform Compatibility** - Desktop, mobile, multiple browsers
5. **Test Failure Scenarios** - Reconnection, error handling, graceful degradation

### Scope

**In Scope:**
- Instance provisioning flow (request → deploy → accessible)
- WebSocket connection and chat functionality
- Gateway stability and performance
- Browser compatibility (Chrome, Firefox, Safari)
- Mobile responsiveness
- Security controls (auth, XSS, injection)
- Monitoring and alerting

**Out of Scope:**
- Billing and payment processing (not implemented yet)
- Email notifications (deferred)
- Admin dashboard (not built yet)
- PostgreSQL migration (future)

### Test Environments

| Environment | Domain | Purpose | Status |
|-------------|--------|---------|--------|
| **Local** | localhost:18789 | Development, unit tests | Active |
| **Test1** | test1.clawdet.com | Staging, integration tests | Active |
| **Test2** | test2.clawdet.com | Pre-production, smoke tests | Active |
| **Production** | *.clawdet.com (user instances) | User-facing | Future |

### Pass/Fail Criteria

**Test Suite Pass Criteria:**
- ≥95% automated tests pass
- 100% critical path tests pass (provisioning, WebSocket, chat)
- 0 P0 (blocker) bugs found
- ≤3 P1 (critical) bugs found
- Performance benchmarks met (<2s page load, <500ms WS connect)

**Production Release Criteria:**
- All test suites passed
- Manual browser verification complete
- Security audit passed
- Load testing complete (10+ concurrent users)
- Monitoring and alerting configured
- Rollback plan tested

---

## Test Categories

### 1. Smoke Tests (5 minutes)

**Purpose:** Quick validation that basic functionality works after deployment.

**Run Frequency:** After every deployment, before detailed testing.

#### 1.1 Instance Accessibility

| Test ID | Test Case | Expected Result | Pass/Fail |
|---------|-----------|-----------------|-----------|
| **SMK-001** | Open https://test1.clawdet.com | Page loads in <2s, no errors | ☐ |
| **SMK-002** | Open https://test2.clawdet.com | Page loads in <2s, no errors | ☐ |
| **SMK-003** | Check HTTPS certificate | Valid, not expired, issued by Let's Encrypt | ☐ |

#### 1.2 Gateway Health

| Test ID | Test Case | Expected Result | Pass/Fail |
|---------|-----------|-----------------|-----------|
| **SMK-004** | SSH to test1, check gateway status | `active (running)`, no recent restarts | ☐ |
| **SMK-005** | SSH to test2, check gateway status | `active (running)`, no recent restarts | ☐ |
| **SMK-006** | Check gateway logs for errors | 0 errors in last 5 minutes | ☐ |

**Command Reference:**
```bash
# Accessibility
curl -I https://test1.clawdet.com  # Should return HTTP/2 200

# Gateway health
ssh root@test1.clawdet.com "systemctl status openclaw-gateway | head -10"

# Check errors
ssh root@test1.clawdet.com "journalctl -u openclaw-gateway --since '5 minutes ago' | grep -i error"
```

#### 1.3 WebSocket Connection

| Test ID | Test Case | Expected Result | Pass/Fail |
|---------|-----------|-----------------|-----------|
| **SMK-007** | Open browser DevTools console | No JavaScript errors | ☐ |
| **SMK-008** | Look for WebSocket connection message | "Connecting to: wss://test1.clawdet.com/gateway/" | ☐ |
| **SMK-009** | Check status indicator | Shows "Connected" (green) | ☐ |
| **SMK-010** | Send message "ping" | Response received within 5 seconds | ☐ |

**Manual Test Steps:**
1. Open https://test1.clawdet.com in Chrome
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for connection message (should see "Connecting to...")
5. Check status indicator at top-right (should be green)
6. Type "ping" in chat, press Enter
7. Wait for response (should appear within 5 seconds)

**Smoke Test Pass Criteria:** 10/10 tests pass (100%)

---

### 2. Functional Tests (30 minutes)

**Purpose:** Validate all user-facing features work correctly.

#### 2.1 Landing Page UI

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **FUN-001** | Page layout renders | Load page | Header, chat interface, footer visible | ☐ |
| **FUN-002** | Logo/branding visible | Visual check | Clawdet logo and title present | ☐ |
| **FUN-003** | Input field functional | Click, type text | Cursor appears, text displays | ☐ |
| **FUN-004** | Send button clickable | Click send | Button responds (not disabled) | ☐ |
| **FUN-005** | Status indicator visible | Check top-right | Indicator shows connection state | ☐ |

#### 2.2 Chat Functionality

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **FUN-101** | Send simple message | Type "hello", press Enter | Message appears in chat history | ☐ |
| **FUN-102** | Receive agent response | Wait after sending | Agent response appears within 10s | ☐ |
| **FUN-103** | Message formatting | Check message bubbles | User messages right-aligned, agent left-aligned | ☐ |
| **FUN-104** | Timestamp display | Send message | Timestamp shown on each message | ☐ |
| **FUN-105** | Scroll behavior | Send 10+ messages | Chat auto-scrolls to latest message | ☐ |
| **FUN-106** | Empty message handling | Press Enter with empty input | Nothing sent, no error | ☐ |
| **FUN-107** | Long message handling | Type 500+ character message | Message sent, displayed without truncation | ☐ |
| **FUN-108** | Special characters | Send "Hello <script>alert(1)</script>" | Message sanitized, no XSS execution | ☐ |
| **FUN-109** | Emoji support | Send "Hello 👋 🎉" | Emojis display correctly | ☐ |
| **FUN-110** | Code block | Send "\`\`\`code\`\`\`" | Formatted as code block (if supported) | ☐ |

#### 2.3 Connection Management

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **FUN-201** | Initial connection | Load page fresh | Connects automatically, shows "Connected" | ☐ |
| **FUN-202** | Connection indicator | Check status | Green = connected, red = disconnected | ☐ |
| **FUN-203** | Reconnection after disconnect | Close/reopen tab | Reconnects automatically | ☐ |
| **FUN-204** | Network failure handling | Disable network, re-enable | Shows "Reconnecting...", then "Connected" | ☐ |
| **FUN-205** | Gateway restart handling | SSH: `systemctl restart openclaw-gateway` | Client reconnects within 10 seconds | ☐ |
| **FUN-206** | Multiple tabs | Open same site in 2 tabs | Both connect independently | ☐ |

#### 2.4 Error Handling

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **FUN-301** | Gateway down | Stop gateway, send message | Shows error: "Connection lost" or similar | ☐ |
| **FUN-302** | Invalid auth (simulated) | Modify token in DevTools, reconnect | Connection rejected with auth error | ☐ |
| **FUN-303** | Network timeout | Throttle network to 100ms delay | Shows loading indicator, eventual timeout | ☐ |
| **FUN-304** | API error (simulated) | Agent fails to respond | Shows error message, doesn't crash UI | ☐ |

**Functional Test Pass Criteria:** ≥95% tests pass (≤2 failures allowed if not critical path)

---

### 3. Integration Tests (30 minutes)

**Purpose:** Validate that all components work together correctly.

#### 3.1 End-to-End Flow

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **INT-001** | Full chat session | Load page → send 5 messages → receive responses | All messages delivered, responses received | ☐ |
| **INT-002** | Multi-turn conversation | Ask question → follow-up → clarification | Agent maintains context across turns | ☐ |
| **INT-003** | Session persistence | Send message → close tab → reopen within 5 min | Chat history visible (if implemented) | ☐ |

#### 3.2 Caddy Routing

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **INT-101** | HTTP to HTTPS redirect | Visit http://test1.clawdet.com | Redirects to https:// | ☐ |
| **INT-102** | Root path serves HTML | GET https://test1.clawdet.com/ | Returns 200, HTML content | ☐ |
| **INT-103** | Gateway path proxies | GET https://test1.clawdet.com/gateway/ | Returns 200, gateway response | ☐ |
| **INT-104** | WebSocket upgrade | Connect wss://test1.clawdet.com/gateway/ | HTTP 101 Switching Protocols | ☐ |
| **INT-105** | 404 handling | GET https://test1.clawdet.com/nonexistent | Returns 404 Not Found | ☐ |

**Command Reference:**
```bash
# HTTP to HTTPS
curl -I http://test1.clawdet.com  # Should show 301/302 redirect

# Root path
curl -I https://test1.clawdet.com/  # Should show 200 with text/html

# Gateway path
curl -I https://test1.clawdet.com/gateway/  # Should show 200

# WebSocket upgrade
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  https://test1.clawdet.com/gateway/  # Should show 101 or 426

# 404
curl -I https://test1.clawdet.com/nonexistent  # Should show 404
```

#### 3.3 Cloudflare Integration

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **INT-201** | DNS resolution | `dig test1.clawdet.com` | Resolves to Cloudflare proxy IP | ☐ |
| **INT-202** | SSL termination | Check certificate | Issued by Cloudflare or Let's Encrypt | ☐ |
| **INT-203** | DDoS protection | Check headers | `cf-ray`, `cf-cache-status` present | ☐ |
| **INT-204** | WebSocket proxy | Connect via WSS | Connection succeeds through Cloudflare | ☐ |

**Command Reference:**
```bash
# DNS
dig test1.clawdet.com  # Should show Cloudflare IP ranges

# SSL
echo | openssl s_client -connect test1.clawdet.com:443 | grep "issuer"

# Headers
curl -I https://test1.clawdet.com | grep -i cf-
```

#### 3.4 Gateway → Agent → API Flow

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **INT-301** | Gateway receives message | Send chat message | Gateway logs show message received | ☐ |
| **INT-302** | Agent processes message | Check logs | Agent invocation logged | ☐ |
| **INT-303** | API call to XAI/Anthropic | Check logs | API request/response logged | ☐ |
| **INT-304** | Response returned to client | Verify in chat | Response appears in UI | ☐ |

**Command Reference:**
```bash
# Follow logs in real-time
ssh root@test1.clawdet.com "journalctl -u openclaw-gateway -f"

# Look for specific log entries
# Gateway receives: "[ws] webchat connected"
# Agent processes: "[diagnostic] lane task"
# API call: check for provider name (xai, anthropic)
# Response: "[ws] webchat disconnected" (after session)
```

**Integration Test Pass Criteria:** ≥90% tests pass (≤3 failures allowed)

---

### 4. Performance Tests (60 minutes)

**Purpose:** Validate system meets performance requirements under various loads.

#### 4.1 Page Load Performance

| Test ID | Metric | Target | Measurement Method | Pass/Fail |
|---------|--------|--------|-------------------|-----------|
| **PERF-001** | First Contentful Paint (FCP) | <1.5s | Chrome DevTools Performance tab | ☐ |
| **PERF-002** | Largest Contentful Paint (LCP) | <2.5s | Chrome DevTools Performance tab | ☐ |
| **PERF-003** | Time to Interactive (TTI) | <3.0s | Chrome DevTools Performance tab | ☐ |
| **PERF-004** | Total Page Size | <500 KB | DevTools Network tab | ☐ |
| **PERF-005** | Number of Requests | <20 | DevTools Network tab | ☐ |

**How to Measure:**
1. Open Chrome DevTools (F12)
2. Go to Network tab, click "Disable cache"
3. Go to Performance tab, click Record
4. Reload page (Cmd/Ctrl+R)
5. Stop recording after page fully loads
6. Check metrics in Performance summary

#### 4.2 WebSocket Performance

| Test ID | Metric | Target | Measurement Method | Pass/Fail |
|---------|--------|--------|-------------------|-----------|
| **PERF-101** | Connection time | <500ms | DevTools Console (log timestamp) | ☐ |
| **PERF-102** | Message send latency | <100ms | Timestamp difference (send → ack) | ☐ |
| **PERF-103** | Message receive latency | <100ms | Timestamp difference (agent send → client receive) | ☐ |
| **PERF-104** | Round-trip time (RTT) | <5s | Send message → receive response | ☐ |
| **PERF-105** | Concurrent connections | ≥10 | Load test script | ☐ |

**How to Measure:**
1. Connection time: Check console for "Connected" log with timestamp
2. Send latency: Compare `Date.now()` before and after `send()`
3. Receive latency: Compare server timestamp (if included) to client receipt time
4. RTT: Measure time from sending "ping" to receiving response
5. Concurrent: Use load test script (see Performance Tests section below)

#### 4.3 Resource Usage

| Test ID | Metric | Target | Measurement Method | Pass/Fail |
|---------|--------|--------|-------------------|-----------|
| **PERF-201** | Gateway memory (idle) | <400 MB | `systemctl status openclaw-gateway` | ☐ |
| **PERF-202** | Gateway memory (10 connections) | <600 MB | Load test + `htop` | ☐ |
| **PERF-203** | Gateway CPU (idle) | <5% | `htop` or `top` | ☐ |
| **PERF-204** | Gateway CPU (10 connections) | <50% | Load test + `htop` | ☐ |
| **PERF-205** | Disk I/O (logs) | <10 MB/hr | Check log file size growth | ☐ |

**How to Measure:**
```bash
# Memory
ssh root@test1.clawdet.com "systemctl show openclaw-gateway | grep MemoryCurrent"

# CPU
ssh root@test1.clawdet.com "top -b -n 1 | grep openclaw"

# Disk
ssh root@test1.clawdet.com "du -sh /tmp/openclaw/*.log"
```

#### 4.4 Load Testing

**Test Script:** `tests/load/websocket-load.js`

```javascript
// WebSocket load test
import WebSocket from 'ws';

const GATEWAY_URL = 'wss://test1.clawdet.com/gateway/';
const TOKEN = 'a96b51062973e9f203f76c5aef9e8856ecde6046824cc56a50b350e367cd0ccb';
const NUM_CONNECTIONS = 10;
const MESSAGES_PER_CONNECTION = 5;

async function loadTest() {
  const connections = [];
  const results = { sent: 0, received: 0, errors: 0 };
  
  for (let i = 0; i < NUM_CONNECTIONS; i++) {
    const ws = new WebSocket(GATEWAY_URL, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    ws.on('open', () => {
      console.log(`Connection ${i} established`);
      
      for (let j = 0; j < MESSAGES_PER_CONNECTION; j++) {
        setTimeout(() => {
          const msg = JSON.stringify({
            type: 'chat',
            message: `Load test message ${j} from connection ${i}`,
            timestamp: Date.now()
          });
          ws.send(msg);
          results.sent++;
        }, j * 1000);  // Stagger messages 1 second apart
      }
    });
    
    ws.on('message', (data) => {
      results.received++;
      console.log(`Connection ${i} received response`);
    });
    
    ws.on('error', (error) => {
      results.errors++;
      console.error(`Connection ${i} error:`, error.message);
    });
    
    connections.push(ws);
  }
  
  // Wait for all messages to complete
  await new Promise(resolve => setTimeout(resolve, 60000));  // 60 seconds
  
  // Close all connections
  connections.forEach(ws => ws.close());
  
  // Report results
  console.log('\n--- Load Test Results ---');
  console.log(`Connections: ${NUM_CONNECTIONS}`);
  console.log(`Messages sent: ${results.sent}`);
  console.log(`Messages received: ${results.received}`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Success rate: ${(results.received / results.sent * 100).toFixed(2)}%`);
}

loadTest();
```

**Run Load Test:**
```bash
cd /root/.openclaw/workspace/clawdet
npm install ws
node tests/load/websocket-load.js
```

| Test ID | Load Scenario | Target | Expected Result | Pass/Fail |
|---------|---------------|--------|-----------------|-----------|
| **PERF-301** | Light load (10 connections, 5 msgs each) | 100% success rate | All messages sent/received | ☐ |
| **PERF-302** | Medium load (25 connections, 10 msgs each) | ≥95% success rate | ≤5% message loss | ☐ |
| **PERF-303** | Stress test (50 connections, rapid-fire) | ≥80% success rate | System doesn't crash | ☐ |
| **PERF-304** | Sustained load (10 connections, 60 min) | 100% uptime | No memory leaks or crashes | ☐ |

**Performance Test Pass Criteria:** All targets met or within 10% tolerance

---

### 5. Security Tests (30 minutes)

**Purpose:** Validate security controls are working correctly.

#### 5.1 Authentication & Authorization

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **SEC-001** | Valid token | Connect with correct gateway token | Connection accepted | ☐ |
| **SEC-002** | Invalid token | Connect with wrong token | Connection rejected (401 or 403) | ☐ |
| **SEC-003** | Missing token | Connect without token | Connection rejected | ☐ |
| **SEC-004** | Token in URL | Try connecting with token as URL param | Token not exposed in logs | ☐ |

**Test Commands:**
```bash
# Valid token
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Authorization: Bearer a96b51062973e9f203f76c5aef9e8856ecde6046824cc56a50b350e367cd0ccb" \
  https://test1.clawdet.com/gateway/

# Invalid token
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Authorization: Bearer invalid_token_12345" \
  https://test1.clawdet.com/gateway/

# Missing token
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  https://test1.clawdet.com/gateway/
```

#### 5.2 Input Validation & XSS Prevention

| Test ID | Test Case | Input | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **SEC-101** | Basic XSS | `<script>alert(1)</script>` | Sanitized, no script execution | ☐ |
| **SEC-102** | Event handler XSS | `<img src=x onerror=alert(1)>` | Sanitized, no alert | ☐ |
| **SEC-103** | SVG XSS | `<svg onload=alert(1)>` | Sanitized, no alert | ☐ |
| **SEC-104** | JavaScript protocol | `<a href="javascript:alert(1)">click</a>` | Sanitized, link disabled | ☐ |
| **SEC-105** | HTML injection | `<h1>Injected Header</h1>` | Escaped or sanitized | ☐ |
| **SEC-106** | SQL injection (if DB exists) | `' OR '1'='1` | No database error, handled safely | ☐ |

**Manual Test:**
1. Open chat interface
2. Enter each test input above
3. Send message
4. Verify:
   - No alert dialogs appear
   - HTML is escaped (shows as text, not rendered)
   - Message appears safely in chat history
5. Inspect page source to confirm no <script> tags inserted

#### 5.3 Rate Limiting

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **SEC-201** | Message rate limit | Send 100 messages in 10 seconds | After threshold, rate limited (429 or throttled) | ☐ |
| **SEC-202** | Connection rate limit | Open 20 connections from same IP | After threshold, connections rejected | ☐ |
| **SEC-203** | API rate limit | Make 100 API calls in 1 minute | After threshold, rate limited | ☐ |

**Test Script:**
```javascript
// Rate limit test
for (let i = 0; i < 100; i++) {
  fetch('https://test1.clawdet.com/gateway/', {
    method: 'POST',
    body: JSON.stringify({ message: `test ${i}` })
  }).then(r => console.log(i, r.status));
}
```

#### 5.4 TLS/SSL Security

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **SEC-301** | HTTPS enforced | Visit http://test1.clawdet.com | Redirects to https:// | ☐ |
| **SEC-302** | Valid certificate | Check SSL cert | Valid, not expired, trusted CA | ☐ |
| **SEC-303** | TLS version | Check protocol | TLS 1.2 or 1.3 (not 1.0/1.1) | ☐ |
| **SEC-304** | Cipher strength | Check cipher suite | Strong ciphers only (AES-256, etc.) | ☐ |

**Test Commands:**
```bash
# TLS version and cipher
nmap --script ssl-enum-ciphers -p 443 test1.clawdet.com

# SSL Labs test (online)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=test1.clawdet.com
```

#### 5.5 Secrets Management

| Test ID | Test Case | Steps | Expected Result | Pass/Fail |
|---------|-----------|-------|-----------------|-----------|
| **SEC-401** | API keys not in HTML | View page source | No API keys visible | ☐ |
| **SEC-402** | API keys not in logs | Check gateway logs | No API keys logged (or redacted) | ☐ |
| **SEC-403** | Gateway token rotation | Change token, restart | Old token rejected, new accepted | ☐ |

**Security Test Pass Criteria:** 100% of tests pass (no security issues)

---

### 6. Cross-Browser & Device Tests (30 minutes)

**Purpose:** Ensure compatibility across browsers and devices.

#### 6.1 Desktop Browsers

| Test ID | Browser | Version | Test | Expected Result | Pass/Fail |
|---------|---------|---------|------|-----------------|-----------|
| **CROSS-001** | Chrome | Latest | Load page, send message | Works correctly | ☐ |
| **CROSS-002** | Firefox | Latest | Load page, send message | Works correctly | ☐ |
| **CROSS-003** | Safari | Latest (macOS) | Load page, send message | Works correctly | ☐ |
| **CROSS-004** | Edge | Latest | Load page, send message | Works correctly | ☐ |
| **CROSS-005** | Brave | Latest | Load page, send message | Works correctly | ☐ |

**Test Steps (for each browser):**
1. Open browser
2. Clear cache and cookies
3. Navigate to https://test1.clawdet.com
4. Wait for "Connected" status
5. Send test message: "browser test"
6. Verify response received
7. Check console for errors (F12)
8. Take screenshot if issue found

#### 6.2 Mobile Browsers

| Test ID | Device | Browser | Test | Expected Result | Pass/Fail |
|---------|--------|---------|------|-----------------|-----------|
| **CROSS-101** | iPhone | Safari | Load page, send message | Works correctly | ☐ |
| **CROSS-102** | Android | Chrome | Load page, send message | Works correctly | ☐ |
| **CROSS-103** | iPad | Safari | Load page, send message | Works correctly | ☐ |

**Responsive Design Test (Chrome DevTools):**
1. Open Chrome DevTools (F12)
2. Click device toolbar (Cmd/Ctrl+Shift+M)
3. Test each preset:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad Air (820x1180)
   - Samsung Galaxy S20 (360x800)
4. Verify:
   - Layout adapts (no horizontal scroll)
   - Input field visible and usable
   - Send button accessible
   - Messages readable

#### 6.3 Accessibility (a11y)

| Test ID | Test Case | Tool | Expected Result | Pass/Fail |
|---------|-----------|------|-----------------|-----------|
| **A11Y-001** | Keyboard navigation | Manual | Can navigate with Tab, Enter, Esc | ☐ |
| **A11Y-002** | Screen reader support | VoiceOver/NVDA | Announces elements correctly | ☐ |
| **A11Y-003** | Color contrast | Lighthouse | WCAG AA compliance | ☐ |
| **A11Y-004** | ARIA labels | axe DevTools | All interactive elements labeled | ☐ |

**Lighthouse Audit:**
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select: Accessibility, Best Practices
4. Click "Analyze page load"
5. Target score: ≥90 for Accessibility

**Cross-Browser Test Pass Criteria:** Works correctly in ≥4 out of 5 desktop browsers, ≥2 mobile browsers

---

### 7. Regression Tests (15 minutes)

**Purpose:** Ensure previous functionality still works after changes.

#### 7.1 Existing Features

| Test ID | Feature | Test | Expected Result | Pass/Fail |
|---------|---------|------|-----------------|-----------|
| **REG-001** | Gateway startup | Restart gateway | Starts without errors, <10s startup | ☐ |
| **REG-002** | Config loading | Check gateway config | Loads from openclaw.json correctly | ☐ |
| **REG-003** | Logging | Check logs | Logs written to /tmp/openclaw/*.log | ☐ |
| **REG-004** | Canvas service | Check status | Canvas mounted at /__openclaw__/canvas/ | ☐ |
| **REG-005** | Browser control | Check status | Browser control service ready | ☐ |
| **REG-006** | Heartbeat | Check logs | Heartbeat started (every 30 min) | ☐ |
| **REG-007** | Health monitor | Check logs | Health monitor started | ☐ |

#### 7.2 Previous Bug Fixes

| Test ID | Bug | Fix | Verification | Pass/Fail |
|---------|-----|-----|--------------|-----------|
| **REG-101** | BUG-001 (invalid connect params) | Device object removed | WebSocket connects without error | ☐ |
| **REG-102** | BUG-002 (mock chat misleading) | Real chat deployed | No hardcoded "I received your message!" | ☐ |
| **REG-103** | Config crash-loop | `providers` key removed | Gateway starts, 0 restarts in 10 min | ☐ |
| **REG-104** | WebSocket URL wrong | Fixed to `/gateway/` | Connects to correct path | ☐ |

**Regression Test Pass Criteria:** 100% of tests pass (no regressions introduced)

---

## Automated Test Execution

### Test Automation Tools

**Recommended Stack:**
- **Playwright** - Browser automation (cross-browser, headless)
- **Jest** - Unit testing framework
- **k6** - Load testing
- **axe-core** - Accessibility testing
- **OWASP ZAP** - Security scanning

### Playwright Test Suite

**Setup:**
```bash
cd /root/.openclaw/workspace/clawdet
npm install --save-dev @playwright/test
npx playwright install  # Install browser binaries
```

**Test File:** `tests/e2e/websocket.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const TEST_URLS = [
  'https://test1.clawdet.com',
  'https://test2.clawdet.com'
];

test.describe('WebSocket Chat', () => {
  for (const url of TEST_URLS) {
    test(`should connect and chat on ${url}`, async ({ page }) => {
      // Load page
      await page.goto(url);
      
      // Wait for connection
      await expect(page.locator('.status-indicator')).toHaveClass(/connected/, { timeout: 10000 });
      
      // Send message
      const input = page.locator('input[type="text"]');
      await input.fill('Hello, are you there?');
      await input.press('Enter');
      
      // Verify message sent
      await expect(page.locator('.message.user').last()).toContainText('Hello, are you there?');
      
      // Verify response received (within 30 seconds)
      await expect(page.locator('.message.agent').last()).toBeVisible({ timeout: 30000 });
      
      // No console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.waitForTimeout(1000);
      expect(errors.length).toBe(0);
    });
  }
});

test.describe('Performance', () => {
  test('page load should be fast', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://test1.clawdet.com');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000);  // <2 seconds
  });
});

test.describe('Security', () => {
  test('should sanitize XSS input', async ({ page }) => {
    await page.goto('https://test1.clawdet.com');
    await expect(page.locator('.status-indicator')).toHaveClass(/connected/, { timeout: 10000 });
    
    const input = page.locator('input[type="text"]');
    await input.fill('<script>alert(1)</script>');
    await input.press('Enter');
    
    // Verify no alert dialog
    page.on('dialog', dialog => {
      throw new Error('XSS alert executed!');
    });
    
    await page.waitForTimeout(2000);
    // If we get here, no XSS alert = pass
  });
});
```

**Run Tests:**
```bash
# All tests
npx playwright test

# Specific test file
npx playwright test tests/e2e/websocket.spec.ts

# With UI (debug mode)
npx playwright test --ui

# Generate report
npx playwright test --reporter=html
```

### CI/CD Integration

**GitHub Actions:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run unit tests
        run: npm test
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
      
      - name: Run security scan
        run: |
          docker run -t owasp/zap2docker-stable zap-baseline.py \
            -t https://test1.clawdet.com \
            -r zap-report.html
      
      - name: Upload security report
        uses: actions/upload-artifact@v3
        with:
          name: zap-report
          path: zap-report.html
```

---

## Test Execution Schedule

### Pre-Deployment

**Before Every Deployment:**
1. ✅ Smoke tests (5 min) - Must pass 100%
2. ✅ Config validation (2 min) - `openclaw doctor`
3. ✅ Unit tests (if exist) (5 min) - Must pass 100%

**Before Major Releases:**
1. ✅ Full functional test suite (30 min)
2. ✅ Integration tests (30 min)
3. ✅ Performance tests (60 min)
4. ✅ Security tests (30 min)
5. ✅ Cross-browser tests (30 min)
6. ✅ Manual browser verification (15 min)

### Post-Deployment

**Immediately After Deployment:**
1. ✅ Smoke tests (5 min)
2. ✅ Manual browser test (10 min)
3. ✅ Check logs for errors (5 min)

**Within 1 Hour:**
1. Monitor gateway status (check every 10 min)
2. Watch for error rate increases
3. Verify user reports (if any)

**Within 24 Hours:**
1. ✅ Full regression suite (30 min)
2. Check performance metrics vs baseline
3. Review monitoring dashboards

### Recurring Tests

**Daily:**
- Smoke tests (automated via cron or CI)
- Health check (gateway uptime, error rate)

**Weekly:**
- Full functional test suite
- Security scan (OWASP ZAP)

**Monthly:**
- Load testing (validate scale)
- Accessibility audit
- Dependency updates and re-test

---

## Test Data & Fixtures

### Test Instances

| Instance | Domain | Purpose | Gateway Token (first 16 chars) |
|----------|--------|---------|--------------------------------|
| **test1** | test1.clawdet.com | Primary staging | a96b51062973e9f2... |
| **test2** | test2.clawdet.com | Secondary staging | 625d9d391df4ba4b... |

**Full tokens stored in:** `/root/.openclaw/workspace/clawdet/.env.test` (create this file, add to .gitignore)

### Test Messages

**Standard Test Messages:**
- Simple: `"hello"`
- Question: `"what is 2+2?"`
- Long: `"This is a very long message... [500 chars]"`
- Special: `"Hello <script>alert(1)</script>"`
- Emoji: `"Hello 👋 🎉 🚀"`
- Code: `"Here is code: \`\`\`javascript\nconst x = 1;\n\`\`\`"`

### Expected Responses

**Agent should respond with:**
- Greeting for "hello"
- Mathematical answer for "2+2"
- Acknowledgment of long message
- Sanitized output (no XSS execution)
- Emoji support working
- Code formatting (if supported)

**Agent should NOT:**
- Execute scripts
- Crash or hang
- Return empty responses
- Leak API keys or tokens

---

## Bug Reporting Template

**When Test Fails:**

```markdown
### Bug Report: [Test ID] [Brief Description]

**Test ID:** FUN-108
**Test Name:** Special characters / XSS prevention
**Date:** 2026-02-19
**Tester:** [Your name]

**Environment:**
- Instance: test1.clawdet.com
- Browser: Chrome 122.0.0.0
- OS: macOS 14.3

**Steps to Reproduce:**
1. Open https://test1.clawdet.com
2. Wait for "Connected" status
3. Type: `<script>alert(1)</script>`
4. Press Enter

**Expected Result:**
Message sanitized, no XSS execution, shows as text

**Actual Result:**
Alert dialog appeared with "1" - XSS vulnerability!

**Screenshots:**
[Attach screenshot]

**Console Errors:**
[Paste console output]

**Severity:** P0 (BLOCKER) - Security vulnerability

**Suggested Fix:**
Add DOMPurify library to sanitize user input before rendering

**Related Tests:**
- SEC-101 (Basic XSS)
- SEC-102 (Event handler XSS)
```

---

## Acceptance Criteria for Production

### Must Have (Blockers)

- [ ] ✅ All smoke tests pass (10/10)
- [ ] ✅ All functional tests pass (≥95%)
- [ ] ✅ All security tests pass (100%)
- [ ] ✅ Manual browser verification complete (test1 + test2)
- [ ] ✅ Cross-browser testing (≥4 browsers)
- [ ] ✅ Performance targets met (<2s load, <500ms WS connect)
- [ ] ✅ Load testing complete (10+ concurrent users)
- [ ] ✅ 0 P0 (blocker) bugs
- [ ] ✅ ≤3 P1 (critical) bugs with workarounds documented
- [ ] ✅ Monitoring and alerting configured
- [ ] ✅ Rollback plan tested and documented

### Should Have (Important but not blocking)

- [ ] 🔄 Automated test suite in CI/CD
- [ ] 🔄 Accessibility audit passed (Lighthouse score ≥90)
- [ ] 🔄 Security scan clean (OWASP ZAP)
- [ ] 🔄 Documentation complete (runbooks, troubleshooting)
- [ ] 🔄 Mobile testing complete (iOS + Android)

### Nice to Have (Quality improvements)

- [ ] 📋 Advanced monitoring dashboard (Grafana)
- [ ] 📋 Distributed tracing (Jaeger)
- [ ] 📋 Automated alerting (PagerDuty)
- [ ] 📋 Multi-region deployment tested
- [ ] 📋 Chaos engineering (failure injection tests)

---

## Test Metrics & KPIs

### Test Coverage

**Target:** ≥85% code coverage (unit tests)
**Measurement:** `npm run test:coverage`

### Test Execution Time

**Target:** <5 minutes for smoke tests, <30 minutes for full suite
**Measurement:** CI/CD pipeline duration

### Defect Detection Rate

**Target:** ≥90% of bugs found before production
**Measurement:** (Bugs found in test) / (Total bugs) * 100

### Test Stability

**Target:** <5% flaky tests (tests that fail intermittently)
**Measurement:** (Flaky tests) / (Total tests) * 100

### Mean Time to Detect (MTTD)

**Target:** <5 minutes for critical issues
**Measurement:** Time from bug introduction to detection

### Mean Time to Repair (MTTR)

**Target:** <30 minutes for critical issues
**Measurement:** Time from detection to fix deployed

---

## Continuous Improvement

### After Each Test Cycle

1. **Review failed tests** - Why did they fail? Flaky or real bug?
2. **Update test plan** - Add new test cases for bugs found
3. **Optimize slow tests** - Keep test execution time under target
4. **Refactor duplicated tests** - DRY principle applies to tests too
5. **Document lessons learned** - Update troubleshooting guide

### Quarterly Test Plan Review

1. Assess test coverage gaps
2. Update test data and fixtures
3. Review test automation ROI
4. Retire obsolete tests
5. Add tests for new features

---

## Appendix

### Useful Commands

**Gateway Management:**
```bash
# Status
systemctl status openclaw-gateway

# Restart
systemctl restart openclaw-gateway

# Logs
journalctl -u openclaw-gateway -f

# Memory/CPU
systemctl show openclaw-gateway | grep -E "MemoryCurrent|CPUUsage"
```

**Network Testing:**
```bash
# HTTP
curl -I https://test1.clawdet.com

# WebSocket (basic)
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  https://test1.clawdet.com/gateway/

# DNS
dig test1.clawdet.com

# SSL
openssl s_client -connect test1.clawdet.com:443
```

**Performance Testing:**
```bash
# Page load time
curl -w "@curl-format.txt" -o /dev/null -s https://test1.clawdet.com

# Where curl-format.txt contains:
# time_namelookup:  %{time_namelookup}\n
# time_connect:  %{time_connect}\n
# time_starttransfer:  %{time_starttransfer}\n
# time_total:  %{time_total}\n
```

### Test Environment Setup

**Browser Automation (Playwright):**
```bash
npm install -D @playwright/test
npx playwright install chromium firefox webkit
```

**Load Testing (k6):**
```bash
# Download for ARM64
curl -LO https://github.com/grafana/k6/releases/download/v0.48.0/k6-v0.48.0-linux-arm64.tar.gz
tar -xzf k6-v0.48.0-linux-arm64.tar.gz
sudo mv k6-v0.48.0-linux-arm64/k6 /usr/local/bin/
```

**Security Scanning (OWASP ZAP):**
```bash
docker pull owasp/zap2docker-stable
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://test1.clawdet.com
```

### Resources

- **Playwright Docs:** https://playwright.dev/
- **k6 Docs:** https://k6.io/docs/
- **OWASP Testing Guide:** https://owasp.org/www-project-web-security-testing-guide/
- **WebSocket Protocol:** https://tools.ietf.org/html/rfc6455
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse

---

**Document Version:** 1.0
**Last Updated:** 2026-02-19
**Author:** Architect (OpenClaw Agent)
**Status:** Active
