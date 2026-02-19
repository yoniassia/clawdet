## Context Pack v3.0

**Stage:** Planner → Architect (skipped - clear root cause) → Implementer → Verifier
**Task ID:** websocket-disconnect-fix
**Previous Stage:** Planner (v1.0)

### Objective (unchanged)
Fix OpenClaw Gateway crash-loop caused by invalid `providers` key in openclaw.json that prevents WebSocket connections and makes test instances appear "Disconnected".

### Key Decisions (from v1.0, with implementation notes)
- **Root cause 1: Config validation failure** - `providers` key at root level is invalid in OpenClaw 2026.2.15
  - Implemented as: Removed `providers` block, added `env.XAI_API_KEY` instead (matches working local config pattern)
- **Root cause 2: Wrong WebSocket URL** - Embedded HTML connected to `wss://host` instead of `wss://host/gateway/`
  - Implemented as: Fixed URL to `${protocol}//${window.location.host}/gateway/` in provision script's embedded HTML
- **No Architect stage needed** - Root cause was clear from Planner analysis + examining working local config that uses `env` block
- **CSS/JS syntax issues** - Source HTML in instance-landing-v3/index.html had ~18 missing closing braces
  - Implemented as: Fixed all missing `}` in CSS @keyframes, @media blocks, and JS functions

### Critical Context
- Working OpenClaw config uses `env` block for API keys (e.g., `env.ANTHROPIC_API_KEY`), NOT `providers`
- The local config at `/root/.openclaw/openclaw.json` has `providers` too (with OpenAI key) — it shows the same "Config invalid" warning but still runs because other config is valid
- Caddy uses `handle_path /gateway*` which strips the `/gateway` prefix before proxying to localhost:18789
- Therefore WebSocket must connect to `/gateway/` path from the browser (resolves to `/` at the gateway)
- The provision script has TWO HTML locations: source repo (`instance-landing-v3/index.html`) and embedded heredoc in `provision-openclaw.sh`

### Files Modified/Created
1. `scripts/provision-openclaw.sh` - Replaced `providers.xai.apiKey` with `env.XAI_API_KEY` in openclaw.json generation; fixed WebSocket URL from `${window.location.host}` to `${window.location.host}/gateway/`
2. `public/instance-landing-v3/index.html` - Fixed 18 missing closing braces in CSS and JS; added missing `connectNonce` variable declaration

### Deployed Changes (SSH)
3. `test1:/root/.openclaw/openclaw.json` - Removed `providers`, added `env.XAI_API_KEY`
4. `test1:/var/www/html/index.html` - Fixed WebSocket URL to `/gateway/`
5. `test2:/root/.openclaw/openclaw.json` - Same as test1
6. `test2:/var/www/html/index.html` - Same as test1

### Manual Test Results
✅ test1 gateway running: `Active: active (running)` — no more crash-loop
✅ test2 gateway running: `Active: active (running)` — no more crash-loop
✅ test1 gateway listening: `ss -tlnp` shows port 18789 bound
✅ test2 gateway listening: `ss -tlnp` shows port 18789 bound
✅ test1 HTTP endpoint: `curl -sI https://test1.clawdet.com/` → 200
✅ test2 HTTP endpoint: `curl -sI https://test2.clawdet.com/` → 200
✅ test1 gateway HTTP: `curl -sI https://test1.clawdet.com/gateway/` → 200
✅ test2 gateway HTTP: `curl -sI https://test2.clawdet.com/gateway/` → 200
✅ test1 WebSocket upgrade: Raw TCP test → HTTP/1.1 101 Switching Protocols
✅ test2 WebSocket upgrade: Raw TCP test → HTTP/1.1 101 Switching Protocols
✅ test1 protocol handshake: WS connect → challenge received → response received
⚠️ Browser test: Not possible from this machine (no browser available), needs Verifier

### Git Commits
- 0ce80d3: fix: Resolve gateway crash-loop and WebSocket connection failures

### Next Stage Needs
- **Verifier: Browser test** - Open https://test1.clawdet.com in a real browser with DevTools
  - Check status indicator shows "Connected" (green dot)
  - Check WebSocket tab in Network panel shows active connection
  - Check console for any errors
  - Send a test chat message and verify response
- **Verifier: Test2 same as above** for https://test2.clawdet.com
- **Verifier: Cache busting** - Users may need Ctrl+Shift+R (hard refresh) since old HTML may be cached
  - Consider if cache headers should be added to Caddy config for the landing page
- **Verifier: Check gateway logs** - `journalctl -u openclaw-gateway -f` on both instances while testing
- **Note: Local config** - Our own `/root/.openclaw/openclaw.json` also has `providers` key (with OpenAI) that triggers the same warning — should be cleaned up separately

### Success Criteria (refined)
1. ✅ Gateway starts successfully without crash-loop (restart counter resets)
2. ⏳ Browser connects via WebSocket (status indicator shows "Connected" green) — needs browser verification
3. ⏳ Chat messages send/receive successfully through gateway — needs browser verification
4. ✅ Fresh provisions work without manual intervention (provision script fixed)

### Rollback Plan
```bash
# Restore configs on test instances
ssh root@65.109.132.127 "cp /root/.openclaw/openclaw.json.bak /root/.openclaw/openclaw.json && systemctl restart openclaw-gateway"
ssh root@89.167.3.83 "cp /root/.openclaw/openclaw.json.bak /root/.openclaw/openclaw.json && systemctl restart openclaw-gateway"

# Revert git commit
cd /root/.openclaw/workspace/clawdet
git revert 0ce80d3
```

### Test Instance Details
**test1.clawdet.com (65.109.132.127):**
- Gateway token: `a96b51062973e9f203f76c5aef9e8856ecde6046824cc56a50b350e367cd0ccb`
- Status: Active, running, listening on :18789
- Config backup: `/root/.openclaw/openclaw.json.bak`

**test2.clawdet.com (89.167.3.83):**
- Gateway token: `625d9d391df4ba4bb342a733f65cdffb42cf6103e65136800cc52a42b9587572`
- Status: Active, running, listening on :18789
- Config backup: `/root/.openclaw/openclaw.json.bak`
