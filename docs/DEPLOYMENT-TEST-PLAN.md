# DEPLOYMENT TEST PLAN — Clawdet Platform

**Version:** 1.0  
**Date:** 2026-02-22  
**Status:** Source of Truth

---

## Overview

This document defines pre-deployment checks, post-deployment verification, manual and automated tests, and rollback procedures for the Clawdet platform. The ultimate success test is the Golden Path (Section 5).

---

## 1. Pre-Deployment Checks

### 1.1 Build Verification
```bash
cd /root/.openclaw/workspace/clawdet

# Clean build
rm -rf .next
npm install
npm run build

# Verify build output
ls -la .next/standalone
echo "Build: $([ -d .next ] && echo 'PASS' || echo 'FAIL')"
```

### 1.2 Environment Variables
```bash
# Check all required env vars are set
for var in GROK_API_KEY HETZNER_API_TOKEN CLOUDFLARE_API_TOKEN CLOUDFLARE_ZONE_ID NEXT_PUBLIC_BASE_URL NODE_ENV; do
  if [ -z "${!var}" ]; then
    echo "MISSING: $var"
  else
    echo "OK: $var (${#!var} chars)"
  fi
done
```

### 1.3 Dependency Audit
```bash
npm audit
# Expected: 0 vulnerabilities (or only low-severity)
```

### 1.4 API Key Validation
```bash
# Test Grok API key
curl -s -o /dev/null -w "%{http_code}" \
  https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $GROK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"grok-4-2","messages":[{"role":"user","content":"ping"}]}'
# Expected: 200

# Test Hetzner API key
curl -s -o /dev/null -w "%{http_code}" \
  https://api.hetzner.cloud/v1/servers \
  -H "Authorization: Bearer $HETZNER_API_TOKEN"
# Expected: 200

# Test Cloudflare API key
curl -s -o /dev/null -w "%{http_code}" \
  https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
# Expected: 200
```

### 1.5 Service Dependencies
```bash
# PM2 running
pm2 status
# Expected: clawdet-prod process listed

# Nginx running (if applicable)
systemctl status nginx
# Expected: active (running)

# Disk space
df -h /
# Expected: >20% free
```

---

## 2. Deployment Procedure

### 2.1 Standard Deployment
```bash
cd /root/.openclaw/workspace/clawdet

# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Build
rm -rf .next
npm run build

# 4. Restart service
pm2 restart clawdet-prod --update-env

# 5. Verify
pm2 status
curl -s -o /dev/null -w "%{http_code}" https://clawdet.com
# Expected: 200
```

### 2.2 Zero-Downtime Deployment (Future)
```bash
# Build in background, then swap
npm run build
pm2 reload clawdet-prod
```

---

## 3. Post-Deployment Verification

### 3.1 Health Checks

**Landing Page:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://clawdet.com
# Expected: 200
```

**Trial Chat Page:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://clawdet.com/trial
# Expected: 200
```

**Signup Page:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://clawdet.com/signup
# Expected: 200
```

**Auth Endpoint:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://clawdet.com/api/auth/me
# Expected: 200 (with session) or 401 (no session — both OK, not 500)
```

**Stats Endpoint:**
```bash
curl -s https://clawdet.com/api/stats
# Expected: JSON with performance metrics
```

### 3.2 Trial Chat API
```bash
# Send a trial message
curl -s -X POST https://clawdet.com/api/trial-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Clawdet?","count":1}' | jq .
# Expected: JSON with "response" field containing Grok AI answer
# Expected: response.count == 1
# Expected: response.remaining == 4
```

```bash
# Verify rate limiting (send 25 requests rapidly)
for i in $(seq 1 25); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://clawdet.com/api/trial-chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test","count":1}')
  echo "Request $i: $code"
done
# Expected: First 20 return 200, remaining return 429
```

### 3.3 Security Headers
```bash
curl -sI https://clawdet.com | grep -iE '(content-security|x-frame|x-content-type|strict-transport|x-xss)'
# Expected:
# content-security-policy: ...
# x-frame-options: DENY
# x-content-type-options: nosniff
# strict-transport-security: max-age=...
```

### 3.4 SSL Certificate
```bash
echo | openssl s_client -connect clawdet.com:443 -servername clawdet.com 2>/dev/null | openssl x509 -noout -dates
# Expected: notAfter date in the future
```

---

## 4. Functional Tests

### 4.1 Trial Chat Flow
| # | Test | Command / Action | Expected |
|---|------|-----------------|----------|
| 1 | First message | POST /api/trial-chat `{"message":"hello","count":0}` | 200, Grok response |
| 2 | Second message | POST /api/trial-chat `{"message":"what can you do?","count":1}` | 200, Grok response |
| 3 | Fifth message | POST /api/trial-chat `{"message":"last one","count":4}` | 200, response + upgrade prompt |
| 4 | Sixth message | POST /api/trial-chat `{"message":"over limit","count":5}` | 200 or 403, upgrade message |
| 5 | Empty message | POST /api/trial-chat `{"message":"","count":0}` | 400, validation error |
| 6 | XSS attempt | POST /api/trial-chat `{"message":"<script>alert(1)</script>","count":0}` | 200, sanitized response (no script execution) |

### 4.2 Signup Flow
| # | Test | Expected |
|---|------|----------|
| 1 | Valid email signup | 200, session cookie set, user created |
| 2 | Duplicate email | 400/409, clear error message |
| 3 | Invalid email format | 400, validation error |
| 4 | Missing terms acceptance | 400, terms required error |
| 5 | SQL injection in email | 400, sanitized (no DB error) |

### 4.3 Provisioning Flow
| # | Test | Expected |
|---|------|----------|
| 1 | Start provisioning (authenticated) | 200, job created |
| 2 | Start provisioning (unauthenticated) | 401, unauthorized |
| 3 | Check status (valid job) | 200, progress percentage + stage |
| 4 | Check status (invalid job) | 404 |
| 5 | Double-start provisioning | 409, already in progress |

---

## 5. The Golden Path Test (End-to-End)

**This is THE test. If this passes, deployment is successful.**

### Prerequisites
- Fresh browser (incognito/private mode)
- No existing clawdet.com cookies
- Test email not previously registered

### Steps

```
STEP 1: Landing Page
━━━━━━━━━━━━━━━━━━
Action: Open https://clawdet.com
Verify:
  ✓ Page loads in <3 seconds
  ✓ "Try Now" button visible
  ✓ "Sign Up" button in header
  ✓ Dark theme, gradient styling
  ✓ Mobile responsive (test at 375px width)

STEP 2: Trial Chat
━━━━━━━━━━━━━━━━━━
Action: Click "Try Now"
Verify:
  ✓ Chat interface opens
  ✓ Input field focused and ready

STEP 3: Send 5 Messages
━━━━━━━━━━━━━━━━━━━━━━━
Action: Send "Hello, what is Clawdet?"
Verify: ✓ Real Grok 4.2 response (not fallback text)
Verify: ✓ Counter shows 1/5

Action: Send "What features do you offer?"
Verify: ✓ Response received, counter 2/5

Action: Send "How does provisioning work?"
Verify: ✓ Response received, counter 3/5

Action: Send "Tell me about Telegram integration"
Verify: ✓ Response received, counter 4/5

Action: Send "How do I get started?"
Verify: ✓ Response received, counter 5/5
Verify: ✓ Upgrade prompt appears
Verify: ✓ Chat input disabled

STEP 4: Sign Up
━━━━━━━━━━━━━━━
Action: Click "Sign Up" from upgrade prompt
Verify: ✓ Signup page loads
Action: Enter email, name, accept terms, submit
Verify:
  ✓ Account created (no errors)
  ✓ Redirected to dashboard
  ✓ Session cookie set

STEP 5: Provisioning Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verify:
  ✓ Dashboard shows "Creating your instance..."
  ✓ Progress updates in real-time
  ✓ Stages visible: VPS → Install → DNS → Ready
  ✓ Completes within 10 minutes

STEP 6: Instance Ready
━━━━━━━━━━━━━━━━━━━━━
Verify:
  ✓ Dashboard shows "Ready!" with instance URL
  ✓ URL format: username.clawdet.com
Action: Click instance URL

STEP 7: Chat Interface
━━━━━━━━━━━━━━━━━━━━━
Verify:
  ✓ Chat loads at username.clawdet.com
  ✓ "Connected" status (green)
  ✓ WebSocket connection established
  ✓ Telegram connect button visible

STEP 8: Trial Messages Displayed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verify:
  ✓ Main page shows 5 trial messages
  ✓ Both user messages and AI responses visible
  ✓ Messages in correct chronological order

STEP 9: Unlimited Chat
━━━━━━━━━━━━━━━━━━━━━
Action: Send message #6
Verify:
  ✓ Grok 4.2 response received
  ✓ No message limit
  ✓ Response within 10 seconds

STEP 10: Telegram Connect
━━━━━━━━━━━━━━━━━━━━━━━━
Action: Click "Connect Telegram" button
Verify:
  ✓ Setup wizard/instructions appear
  ✓ @BotFather steps shown
  ✓ Token input field available
```

### Golden Path Result
```
□ ALL 10 STEPS PASS → Deployment APPROVED
□ Steps 1-8 pass, 9-10 fail → Deployment APPROVED (minor issues)
□ Any of steps 1-7 fail → Deployment BLOCKED, rollback
□ Step 8 fails (trial messages) → Deployment CONDITIONAL (known limitation)
```

---

## 6. Performance Tests

```bash
# Response time check
time curl -s -o /dev/null https://clawdet.com
# Expected: <1 second

# Trial chat response time
time curl -s -X POST https://clawdet.com/api/trial-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","count":0}' -o /dev/null
# Expected: <5 seconds (includes Grok API call)

# Concurrent connections (basic load test)
for i in $(seq 1 10); do
  curl -s -o /dev/null -w "req $i: %{time_total}s\n" https://clawdet.com &
done
wait
# Expected: All <2 seconds
```

---

## 7. Provisioned Instance Tests

After a user instance is provisioned at `username.clawdet.com`:

```bash
INSTANCE="https://username.clawdet.com"

# 1. Instance reachable
curl -s -o /dev/null -w "%{http_code}" $INSTANCE
# Expected: 200

# 2. SSL valid
echo | openssl s_client -connect username.clawdet.com:443 2>/dev/null | grep "Verify return code"
# Expected: Verify return code: 0 (ok)

# 3. Gateway responding
curl -s -o /dev/null -w "%{http_code}" $INSTANCE/gateway/
# Expected: 200 or 301

# 4. OpenClaw service running (via SSH)
ssh root@<VPS_IP> "systemctl is-active openclaw-gateway"
# Expected: active

# 5. Caddy service running
ssh root@<VPS_IP> "systemctl is-active caddy"
# Expected: active

# 6. Gateway token configured
ssh root@<VPS_IP> "cat /root/.openclaw/gateway-token.txt | wc -c"
# Expected: 64 or 65 (64 chars + newline)

# 7. Grok API key set
ssh root@<VPS_IP> "systemctl show openclaw-gateway -p Environment | grep -c XAI_API_KEY"
# Expected: 1
```

---

## 8. Rollback Procedures

### 8.1 Application Rollback
```bash
cd /root/.openclaw/workspace/clawdet

# Option A: Git rollback
git log --oneline -5  # Find last good commit
git checkout <commit-hash>
npm install
npm run build
pm2 restart clawdet-prod --update-env

# Option B: PM2 rollback (if using ecosystem file)
pm2 deploy production revert 1
```

### 8.2 Environment Rollback
```bash
# Restore previous .env.local
cp .env.local.backup .env.local
pm2 restart clawdet-prod --update-env
```

### 8.3 Database Rollback
```bash
# SQLite backup restore
cp data/users.db.backup data/users.db
pm2 restart clawdet-prod
```

### 8.4 Provisioned Instance Rollback
```bash
# If a user instance is broken, reprovision:
# 1. Delete Hetzner VPS
curl -X DELETE https://api.hetzner.cloud/v1/servers/<VPS_ID> \
  -H "Authorization: Bearer $HETZNER_API_TOKEN"

# 2. Delete DNS record
curl -X DELETE https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/<RECORD_ID> \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# 3. Reset user provisioning status in DB
# Then re-trigger provisioning
```

### 8.5 Full Platform Rollback
If everything is broken:
```bash
# 1. Stop service
pm2 stop clawdet-prod

# 2. Restore from last known good state
git stash
git checkout <last-known-good-tag>
npm install
npm run build

# 3. Restore database
cp data/users.db.backup data/users.db

# 4. Restart
pm2 start clawdet-prod --update-env

# 5. Verify
curl -s -o /dev/null -w "%{http_code}" https://clawdet.com
```

---

## 9. Monitoring During Deployment

```bash
# Watch logs in real-time during deployment
pm2 logs clawdet-prod --lines 50

# Monitor in separate terminal
watch -n 5 'curl -s -o /dev/null -w "%{http_code}" https://clawdet.com'

# Check error rate
pm2 logs clawdet-prod --err --lines 20
```

---

## 10. Test Schedule

| When | What | Who |
|------|------|-----|
| Pre-deploy | Section 1 (all pre-checks) | Deploy engineer |
| Deploy | Section 2 (deployment procedure) | Deploy engineer |
| Post-deploy (immediate) | Section 3 (health checks) | Automated / engineer |
| Post-deploy (+5 min) | Section 4 (functional tests) | QA / engineer |
| Post-deploy (+15 min) | Section 5 (Golden Path) | Manual QA |
| Post-deploy (+30 min) | Section 6 (performance) | Automated |
| Post-provision | Section 7 (instance tests) | Per new instance |

---

## 11. Sign-Off

```
Deployment Date: _______________
Deployer: _______________

Pre-Deployment Checks:  □ PASS  □ FAIL
Post-Deployment Health:  □ PASS  □ FAIL
Functional Tests:        □ PASS  □ FAIL
Golden Path (E2E):       □ PASS  □ FAIL
Performance Tests:       □ PASS  □ FAIL

Overall:  □ APPROVED  □ ROLLBACK REQUIRED

Notes:
_________________________________________________
_________________________________________________
```

---

*This document is the source of truth for all deployment testing and verification.*
