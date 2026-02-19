## Context Pack v1.0

**Stage:** Planner → Architect
**Task ID:** websocket-disconnect-fix
**Previous Stage:** User Request (Cron Job)

### Objective (1 sentence)
Fix OpenClaw Gateway crash-loop caused by invalid `providers` key in openclaw.json that prevents WebSocket connections and makes test instances appear "Disconnected".

### Key Decisions
- **Root cause is NOT WebSocket code** - gateway is crash-looping due to invalid config (restart counter: 593)
- **Invalid config key**: `providers` at root level rejected by OpenClaw 2026.2.15
- **Provider config must use different mechanism** - likely auth-profiles.json or environment variables
- **HTML token embedding is correct** - both test1 and test2 have valid gateway tokens in auth object
- **Fresh deploy vs config fix** - fixing config on existing instances is faster than reprovisioning

### Critical Context
- Gateway error: `Unrecognized key: "providers"` in /root/.openclaw/openclaw.json
- Both test instances affected: test1 (65.109.132.127) and test2 (89.167.3.83)
- Gateway has restarted 593 times trying to start with invalid config
- HTML is correct: `auth: { token: 'a96b51062973e9f203f76c5aef9e8856...' }`
- Previous "fix" (WEBSOCKET-FIX-COMPLETE.md) only addressed token embedding, not config validity

### Files Modified/Created
- scripts/provision-openclaw.sh (remove providers from openclaw.json)
- scripts/provision-openclaw.sh (add XAI_API_KEY as environment variable OR auth-profiles)
- /root/.openclaw/openclaw.json on test instances (immediate fix via SSH)

### Next Stage Needs
- **Architect must decide**: How to pass XAI API key to OpenClaw gateway
  - Option A: Environment variable (OPENCLAW_XAI_API_KEY or similar)
  - Option B: auth-profiles.json file (separate from openclaw.json)
  - Option C: Different config structure in openclaw.json
- **Architect must verify**: Check OpenClaw docs/code for correct provider configuration
- **Architect must design**: Migration path for existing instances (SSH fix script)

### Success Criteria
1. Gateway starts successfully without crash-loop (systemctl status shows "active (running)")
2. Browser connects via WebSocket (status indicator shows "Connected" green)
3. Chat messages send/receive successfully through gateway
4. Fresh provisions work without manual intervention

### Rollback Plan
Keep current config structure, remove providers block entirely, rely on environment variables passed to systemd service (already present: Environment="OPENCLAW_GATEWAY_TOKEN=$GATEWAY_TOKEN").

---

## Analysis Details

### Problem Summary
Users reported "Disconnected" status on test1.clawdet.com and test2.clawdet.com despite multiple previous "fixes". Investigation revealed:

1. **Previous diagnosis was incomplete** - focused on WebSocket client code and token embedding
2. **Real issue**: OpenClaw Gateway won't start due to config validation failure
3. **Gateway restart counter**: 593 attempts (indicates been failing for hours/days)
4. **Impact**: Zero users can connect because gateway process keeps crashing

### Discovery Path
1. SSH to test1 (65.109.132.127)
2. Check HTML → Token correctly embedded ✓
3. Check systemctl status → Active but restart counter 593 ⚠️
4. Check journalctl → "Config invalid: Unrecognized key: providers" ⚠️
5. Reproduce locally → `openclaw help config` shows same error

### What Works
- ✅ HTML has correct token in auth object
- ✅ Gateway token exists and is valid (64-char hex)
- ✅ Caddy reverse proxy is running and configured correctly
- ✅ DNS resolves (test1.clawdet.com, test2.clawdet.com)
- ✅ HTTPS/SSL working (via Caddy + Let's Encrypt)

### What's Broken
- ❌ Gateway process won't start (config validation fails)
- ❌ openclaw.json has `providers` key at root level (invalid in 2026.2.15)
- ❌ Provision script generates invalid config structure
- ❌ Users see "Disconnected" because no gateway is listening

### Previous "Fixes" That Didn't Address This
- **Commit f69bace**: Added gateway token to HTML auth object
  - This was correct but insufficient (gateway still won't start)
- **Commit de7346f**: Removed device object for allowInsecureAuth
  - Also correct but insufficient
- **WEBSOCKET-FIX-COMPLETE.md**: Documented token embedding
  - Missed the config validation crash-loop

### Test Instance Status

**test1.clawdet.com (65.109.132.127):**
- Gateway: Crash-looping (restart counter 593)
- Config: Invalid (`providers` key)
- HTML: Correct (token embedded)
- Token: `a96b51062973e9f203f76c5aef9e8856...`

**test2.clawdet.com (89.167.3.83):**
- Gateway: Crash-looping (similar symptoms)
- Config: Invalid (`providers` key)
- HTML: Correct (token embedded)
- Token: `625d9d391df4ba4bb342a733f65cdffb...`

### Estimated Time
- **Config research**: 15 min (check OpenClaw docs/code for correct provider setup)
- **Fix provision script**: 20 min (update openclaw.json generation + test)
- **Deploy to test instances**: 10 min (SSH fix script or re-provision)
- **Verification**: 10 min (test WebSocket connection, send messages)
- **Documentation**: 10 min (update WEBSOCKET-FIX-COMPLETE.md or create new doc)

**Total**: ~65 minutes (multi-stage recommended)

---

## Recommended Workflow

**Stage 1: Planner** (COMPLETE - this document)
- ✅ Identified root cause (config validation failure)
- ✅ Analyzed impact (both test instances down)
- ✅ Documented current state
- ✅ Created context pack

**Stage 2: Architect** (NEXT)
- Research correct OpenClaw provider configuration
- Decide: environment variable vs auth-profiles.json vs other
- Design migration script for existing instances
- Create detailed fix plan with exact commands

**Stage 3: Implementer**
- Update provision script (openclaw.json generation)
- Create SSH fix script for test instances
- Test locally if possible
- Deploy to test1, verify, then test2

**Stage 4: Verifier**
- SSH to test instances, check gateway status
- Open browser, verify "Connected" status
- Send test message, confirm response
- Check gateway logs for clean startup

**Stage 5: Release**
- Update documentation (mark previous "fix" as incomplete)
- Document correct provider configuration
- Create troubleshooting entry: "Gateway crash-loop diagnosis"
- Announce fix to user

---

## Files to Check

### For Architect Research
- OpenClaw CLI help: `openclaw help config`, `openclaw help gateway`
- Gateway config schema: `openclaw doctor --help` (may show valid keys)
- OpenClaw source (if accessible): Look for provider configuration examples
- Environment variables: Check what `OPENCLAW_*` vars are supported

### For Implementation
- `/root/.openclaw/workspace/clawdet/scripts/provision-openclaw.sh` (lines 284-349)
- Test instance configs: `/root/.openclaw/openclaw.json` (on test1 and test2)
- Systemd service: `/etc/systemd/system/openclaw-gateway.service` (check Environment= lines)

### For Verification
- Gateway logs: `journalctl -u openclaw-gateway -f`
- Gateway status: `systemctl status openclaw-gateway`
- HTML inspection: Browser dev tools → Sources → index.html (check auth object)
- WebSocket: Browser dev tools → Network → WS tab (check connection)

---

## Quick Fix (Stop-Gap)

While Architect researches, can immediately stabilize by:

```bash
# Remove providers block from config (break API calls but stop crash-loop)
ssh root@test1.clawdet.com "jq 'del(.providers)' ~/.openclaw/openclaw.json > /tmp/config.json && mv /tmp/config.json ~/.openclaw/openclaw.json && systemctl restart openclaw-gateway"
```

This will:
- ✅ Stop gateway crash-loop
- ✅ Allow WebSocket connections
- ❌ Break Grok API calls (no API key)
- ⚠️ Temporary until proper fix deployed

**Recommendation**: Only use if user needs immediate web chat access for testing. Otherwise, proceed with full fix via Architect → Implementer.

---

## Notes for Architect

### Questions to Answer
1. Where should XAI_API_KEY live? (env var vs file vs config)
2. Is there an `auth-profiles.json` file we should be using?
3. Does OpenClaw 2026.2.15 support `providers` in a different location?
4. Should we downgrade OpenClaw version? (unlikely, but check)

### Success Looks Like
- Provision script generates valid openclaw.json
- Gateway starts cleanly (no restarts)
- API keys accessible to agents
- Test instances connect via WebSocket
- Chat works end-to-end

### Risk Assessment
- **Low risk**: Config-only change, no code modifications
- **High confidence**: Root cause is clear (config validation error in logs)
- **Easy rollback**: Keep backup of current configs
- **Fast deployment**: SSH fix can be applied in <5 minutes

---

## Handoff to Architect

**Priority**: P0 (Blocker) - Both test instances are down

**Context**: Complete context in this document. No need to re-investigate WebSocket code or HTML token embedding—those are correct.

**Focus**: Find the correct way to configure XAI provider in OpenClaw 2026.2.15, then design the fix.

**Expected Output**: Detailed implementation plan with exact config structure and deployment commands.

**Timeline**: Should be quick (config research + design ~15-20 min). Not a complex multi-file refactor.
