# Known Bugs & Issues

## Purpose
Track known issues, workarounds, and planned fixes. Updated after each Test Gate that finds issues.

**Status Legend:**
- 🔴 **P0 (Blocker)** - Breaks core functionality, must fix before deploy
- 🟠 **P1 (Critical)** - Major bug but workaround exists
- 🟡 **P2 (Important)** - Quality issue, fix in next sprint
- 🟢 **P3 (Minor)** - Nice-to-have, backlog

---

## Active Issues

### 🔴 P0-004: Provision Script Generates Invalid OpenClaw Config
**Reported:** 2026-02-19 02:00 UTC
**Component:** `provision-openclaw.sh` (line ~220-230)
**Status:** **BLOCKING PRODUCTION DEPLOYMENT**

**Description:**
The provisioning script generates an invalid `openclaw.json` config file that causes the gateway service to crash immediately on startup. The script sets `agents.defaults.model` to a string value (`"xai/grok-beta"`), but OpenClaw's config validation expects this field to either be omitted (for defaults) or to be an object.

**Impact:**
- **100% failure rate** - Every new instance provisioned fails
- Gateway enters infinite crash-loop (40+ restarts before manual fix)
- All `/gateway/` endpoints return 502 Bad Gateway
- Platform appears completely broken to users
- Requires manual SSH intervention to fix each instance

**Error Message:**
```
Invalid config at /root/.openclaw/openclaw.json:
- agents.defaults.model: Invalid input: expected object, received string
```

**Root Cause:**
```bash
# Line ~220 in provision-openclaw.sh
cat > /root/.openclaw/openclaw.json <<EOF
{
  "agents": {
    "defaults": {
      "workspace": "/root/.openclaw/workspace",
      "model": "xai/grok-beta"   # ❌ INVALID: String value
    }
  },
  ...
}
EOF
```

**Workaround (Manual Fix Required):**
```bash
# SSH into affected instance
ssh root@<INSTANCE_IP>

# Remove invalid model key from config
python3 -c "
import json
with open('/root/.openclaw/openclaw.json', 'r') as f:
    config = json.load(f)
if 'agents' in config and 'defaults' in config['agents']:
    if 'model' in config['agents']['defaults']:
        del config['agents']['defaults']['model']
with open('/root/.openclaw/openclaw.json', 'w') as f:
    json.dump(config, f, indent=2)
"

# Restart gateway service
systemctl restart openclaw-gateway

# Verify service is running
systemctl status openclaw-gateway
```

**Fix Plan:**
Update `provision-openclaw.sh` to omit the `model` key entirely:

```bash
# Line ~220 in provision-openclaw.sh
cat > /root/.openclaw/openclaw.json <<EOF
{
  "agents": {
    "defaults": {
      "workspace": "/root/.openclaw/workspace"
      # model key removed - OpenClaw will use default (anthropic/claude-opus-4-6)
    }
  },
  ...
}
EOF
```

**Testing Steps:**
1. Update provision-openclaw.sh with fix
2. Provision fresh test instance (test-fresh-3)
3. Verify gateway starts without errors: `systemctl status openclaw-gateway`
4. Check logs show no config errors: `journalctl -u openclaw-gateway -n 50`
5. Verify `/gateway/` endpoint returns 200: `curl -sI https://test-fresh-3.clawdet.com/gateway/`
6. Test browser WebSocket connection

**Affected Instances (Manual Fix Applied):**
- test-fresh-1.clawdet.com (fixed 2026-02-19 02:01 UTC)
- test-fresh-2.clawdet.com (fixed 2026-02-19 02:02 UTC)

**Verification:**
E2E test report: `/root/.openclaw/workspace/clawdet/docs/E2E-FRESH-PROVISIONING-TEST.md`

**Assigned:** **URGENT - MUST FIX BEFORE NEXT DEPLOYMENT**  
**ETA:** 30 minutes (simple one-line change + test)

**Related Issues:**
- Discovered during Phase 2 of E2E Fresh Provisioning Test
- Blocked browser verification (Phase 5) until fixed and re-tested

---

### 🟢 P3-001: Health Monitor Path Issues
**Reported:** 2026-02-18
**Component:** Cron health monitor
**Description:** Health monitor looks for audit files in `/root/.openclaw/workspace/clawdet/` but they're in workspace root.

**Impact:**
- Cron job reports errors every 30 minutes
- No functional impact (platform works fine)
- Generates noise in monitoring

**Workaround:**
Audit files exist at correct path (`/root/.openclaw/workspace/`), just not where cron expects.

**Fix Plan:**
Update cron job message to check `/root/.openclaw/workspace/*.md` instead of nested path.

**Assigned:** Deferred to next sprint
**ETA:** N/A (low priority)

---

### 🟡 P2-002: Browser Cache Defeats WebSocket Fixes
**Reported:** 2026-02-18
**Component:** Instance web interface
**Description:** Users see old cached HTML even after fixes deployed. Hard refresh required.

**Impact:**
- Users continue seeing "Disconnected" after fix deployed
- Confusing UX (looks like fix didn't work)
- Requires user education (hard refresh instructions)

**Workaround:**
Instruct users to:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (PC)
2. Or: Open in Private/Incognito mode
3. Or: Clear browser cache for site

**Fix Plan:**
Add cache-busting:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

**Or:** Version HTML files: `index.html?v=20260218`

**Assigned:** Next deployment
**ETA:** When next instance HTML update deployed

---

### 🟡 P2-003: OpenAI Provider Not in Agent Auth Profiles
**Reported:** 2026-02-18
**Component:** OpenClaw agent auth
**Description:** OpenAI API key in `openclaw.json` but not in `auth-profiles.json`, so subagents can't use OpenAI models.

**Impact:**
- Subagents fail when trying to use `openai/gpt-4o`
- Error: "No API key found for provider 'openai'"
- Direct API calls work (curl tests pass)

**Workaround:**
- Use Anthropic/Claude for subagents (works)
- Or: Use OpenAI via direct API calls (bypass OpenClaw routing)

**Fix Plan:**
```bash
openclaw agents configure main --add-provider openai --api-key "sk-proj-..."
```

**Assigned:** Next configuration update
**ETA:** When user requests OpenAI subagent usage

---

## Resolved Issues

### ✅ BUG-001: WebSocket Connection Fails (invalid connect params)
**Reported:** 2026-02-18 14:00 UTC
**Resolved:** 2026-02-18 20:16 UTC
**Component:** Instance WebSocket client

**Description:**
WebSocket connections failed with "must have required property 'publicKey'" error. Client sent incomplete device object.

**Root Cause:**
1. Connect request included device object with only `id` and `nonce`
2. Gateway schema requires `publicKey` and `si` fields for device auth
3. Intended to use `allowInsecureAuth` mode (token-only) but still sent partial device

**Fix Applied:**
- Removed device object entirely from connect request
- Added gateway token to `auth.token` field
- Updated provision script to embed token in HTML

**Commits:**
- f69bace - Add gateway token to auth object
- de7346f - Remove device object for allowInsecureAuth

**Verification:**
Direct curl test to instances shows token embedded correctly. Fresh deploys (test1, test2) have fix applied.

---

### ✅ BUG-002: Mock Chat Misleading Users
**Reported:** 2026-02-18 09:00 UTC
**Resolved:** 2026-02-18 09:10 UTC
**Component:** Instance landing page

**Description:**
Mock chat interface showed hardcoded "I received your message!" response, making users think AI worked when it didn't.

**Root Cause:**
`/public/instance-chat/index.html` contained fake JavaScript timer that simulated AI responses.

**Fix Applied:**
- Archived mock chat to `/public/dev-archive/`
- Added to `.gitignore` so it can't be deployed
- Deployed proper landing page with real WebSocket chat

**Commits:**
Multiple commits during audit phase 4

**Verification:**
Test instances show real landing page, not mock chat.

---

### ✅ BUG-003: Old VPS SSH Keys Conflict
**Reported:** 2026-02-18 22:08 UTC
**Resolved:** 2026-02-18 22:08 UTC (automated)
**Component:** Fresh VPS deployment

**Description:**
When reusing same IP (65.109.132.127) for new VPS, SSH warned about host key mismatch.

**Root Cause:**
Old VPS deleted but IP reused. New VPS has different SSH host key, triggering security warning.

**Fix:**
Deployment script uses `StrictHostKeyChecking=no` which accepts new keys automatically. Not a bug, expected behavior.

**Verification:**
Deployment script worked despite warning. Connection succeeded.

---

## Deferred Issues (Backlog)

### 🟢 P3-101: No Email Notifications
**Component:** Provisioning flow
**Description:** Users don't get email when provisioning completes. Have to poll status endpoint or wait for redirect.

**Impact:** Minor UX issue. Users stay on provisioning page anyway.

**Fix Plan:** Add email notification option (requires email provider like SendGrid).

**Priority:** Post-launch feature

---

### 🟢 P3-102: No PostgreSQL Database
**Component:** State management
**Description:** Using in-memory session state. Data lost on server restart.

**Impact:** Beta users lose session on restart (rare event).

**Fix Plan:** Migrate to PostgreSQL for persistent state. See ADR-006.

**Priority:** Before scaling beyond beta (20 users)

---

### 🟢 P3-103: No Monitoring Dashboard
**Component:** Operations
**Description:** No centralized dashboard to view all instances, health, usage stats.

**Impact:** Manual SSH to check individual instances.

**Fix Plan:** Build admin dashboard with:
- List all instances (IP, status, uptime)
- Aggregate metrics (total users, API usage)
- Health checks (red/yellow/green per instance)

**Priority:** After 10+ users provisioned

---

### 🟢 P3-104: Single Grok API Key (No Rotation)
**Component:** API management
**Description:** All instances share one Grok API key. If it's rate-limited or revoked, all instances fail.

**Impact:** Single point of failure for AI functionality.

**Fix Plan:**
- Support multiple API keys per provider
- Rotate keys per instance or per day
- Failover to backup keys

**Priority:** After beta (when scaling)

---

## Bug Report Template

**Copy this for new bugs:**

```markdown
### 🔴 P0-XXX: [Title]
**Reported:** YYYY-MM-DD HH:MM UTC
**Component:** [Component name]
**Description:** What's broken?

**Impact:**
- How does it affect users?
- What breaks?
- How many users affected?

**Workaround:**
Steps to avoid the issue (if any).

**Fix Plan:**
- Technical solution
- Files to change
- Testing approach

**Assigned:** [Person or "Backlog"]
**ETA:** [Date or "N/A"]
```

---

## Triage Process

### When New Bug Found
1. **Document** - Add to this file immediately
2. **Assess Severity** - Assign P0/P1/P2/P3
3. **Decide** - Fix now vs workaround vs defer
4. **If P0/P1** - Create context pack, assign to Implementer
5. **If P2/P3** - Add to backlog, tag with sprint

### Severity Guidelines

**P0 (Blocker):**
- Site down
- Can't sign up
- Can't provision instances
- Data loss
- Security vulnerability

**P1 (Critical):**
- Feature broken but workaround exists
- Performance degraded (>5s load times)
- High error rate (>10%)
- Affects majority of users

**P2 (Important):**
- Feature broken for edge case
- UX issue (confusing but usable)
- Performance issue (2-5s vs <2s target)
- Affects minority of users

**P3 (Minor):**
- Nice-to-have missing
- Visual glitch
- Enhancement request
- Documentation gap

---

## Resolution Checklist

Before moving bug from "Active" to "Resolved":
- [ ] Fix implemented and tested
- [ ] Deployed to production (or scheduled)
- [ ] Verification steps passed
- [ ] Git commit linked
- [ ] Announced to affected users (if user-facing)
- [ ] Moved to "Resolved Issues" section with dates
