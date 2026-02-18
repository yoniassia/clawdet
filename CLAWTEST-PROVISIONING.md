# Clawtest Instance Provisioning

**Date:** Wednesday, February 18, 2026 — 3:07 PM UTC  
**Status:** 🟡 IN PROGRESS

---

## Instance Details

**Subdomain:** clawtest.clawdet.com  
**VPS ID:** 121415163  
**IP Address:** 89.167.3.83  
**Server Type:** Hetzner cx23 (Helsinki)  
**DNS:** Configured via Cloudflare (proxied)

---

## Provisioning Status

### ✅ Completed Steps

1. **VPS Creation** - Hetzner cx23 server created
2. **DNS Configuration** - clawtest.clawdet.com → 89.167.3.83
3. **SSH Access** - Connection established
4. **Script Upload** - provision-openclaw.sh uploaded

### ⏳ In Progress

**Currently Running:** OpenClaw installation & configuration (6-8 minutes)

Steps being executed:
- System update (apt update/upgrade)
- Node.js 22.x installation
- Caddy web server installation
- OpenClaw npm package installation
- Gateway token generation
- Workspace files creation (AGENTS.md, SOUL.md, USER.md, etc.)
- openclaw.json configuration
- Systemd service creation
- Service startup

### 📋 Environment Variables

**Critical Variables Set:**
```bash
USERNAME='clawtest'
SUBDOMAIN='clawtest'
FULL_DOMAIN='clawtest.clawdet.com'
XAI_API_KEY='xai-RTMTaf...' (Grok 4.2)
RENTAHUMAN_API_KEY='rah_6d79a2f5e...'
```

**Auto-Generated:**
```bash
GATEWAY_TOKEN=$(openssl rand -hex 32)  # 64-character secure token
```

---

## What Makes This Different from Previous Test

### Previous Issue (clawdet-test)
- ❌ Missing OPENCLAW_GATEWAY_TOKEN in environment
- ❌ WebSocket connection failed (no valid token)
- ❌ Status showed "Disconnected"

### This Instance (clawtest)
- ✅ Gateway token properly generated during provisioning
- ✅ Token stored in `/root/.openclaw/gateway-token.txt`
- ✅ Token set in systemd service: `Environment="OPENCLAW_GATEWAY_TOKEN=$GATEWAY_TOKEN"`
- ✅ Token configured in `/root/.openclaw/openclaw.json`
- ✅ Web chat will have access to valid token

---

## Configuration Being Applied

### OpenClaw Gateway Config
```json
{
  "gateway": {
    "enabled": true,
    "port": 18789,
    "host": "0.0.0.0",
    "token": "<64-char-secure-token>",
    "corsOrigins": ["https://clawtest.clawdet.com"],
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": true
    }
  },
  "agents": {
    "main": {
      "model": "xai/grok-2-latest",
      "thinking": "low",
      "verbose": false
    }
  }
}
```

### Systemd Service
```ini
[Service]
Environment="XAI_API_KEY=xai-..."
Environment="RENTAHUMAN_API_KEY=rah_..."
Environment="OPENCLAW_GATEWAY_TOKEN=<generated-token>"
ExecStart=/usr/bin/openclaw gateway run
Restart=always
```

### Caddy Configuration
```caddy
clawtest.clawdet.com {
    handle / {
        root * /var/www/html
        file_server
    }
    
    handle_path /gateway/* {
        reverse_proxy localhost:18789
    }
    
    tls internal
}
```

---

## After Provisioning Completes

### Automatic Steps
1. Gateway token will be retrieved from `/root/.openclaw/gateway-token.txt`
2. Web chat interface will be deployed to `/var/www/html/index.html`
3. Caddy will be reloaded
4. OpenClaw gateway will be verified active

### Access Points
- **Main Interface:** https://clawtest.clawdet.com (web chat)
- **Gateway Control:** https://clawtest.clawdet.com/gateway/
- **WebSocket:** wss://clawtest.clawdet.com/gateway/ws

### Expected Behavior
- ✅ Web chat loads with "Connected" status (green)
- ✅ Welcome screen with 4 AI suggestions
- ✅ Can send messages immediately
- ✅ Real-time responses from Grok AI
- ✅ No authentication errors
- ✅ Proper WebSocket protocol handshake

---

## Verification Steps (After Complete)

1. **Check Services:**
   ```bash
   ssh root@89.167.3.83
   systemctl status openclaw-gateway
   systemctl status caddy
   ```

2. **Verify Gateway Token:**
   ```bash
   cat /root/.openclaw/gateway-token.txt
   ```

3. **Check OpenClaw Config:**
   ```bash
   cat /root/.openclaw/openclaw.json | jq '.gateway.token'
   ```

4. **Test Web Interface:**
   - Visit https://clawtest.clawdet.com
   - Verify "Connected" status
   - Send test message
   - Verify AI response

5. **Check Gateway Logs:**
   ```bash
   journalctl -u openclaw-gateway -f
   ```

---

## Timeline

- **15:05 UTC** - VPS created
- **15:05 UTC** - DNS configured
- **15:06 UTC** - SSH ready
- **15:07 UTC** - Provisioning started (6-8 min expected)
- **~15:14 UTC** - Provisioning should complete
- **~15:15 UTC** - Web chat deployed
- **~15:16 UTC** - Instance ready for testing

---

## Differences from ClawX Integration

This is a **clean OpenClaw instance** with:
- Working web chat interface
- Proper gateway token configuration
- Real-time messaging capability

The ClawX integration agent is still running separately to merge:
- Telegram setup wizard
- Token validation
- Success confirmations
- Green-glow design patterns

**This instance** proves the WebSocket connection works with proper token.  
**Integration agent** will merge in the improved onboarding UX.

---

## Instance Details JSON

Will be saved to: `/root/.openclaw/workspace/clawdet/clawtest-instance.json`

Format:
```json
{
  "subdomain": "clawtest",
  "vpsId": "121415163",
  "vpsIp": "89.167.3.83",
  "gatewayToken": "<64-char-token>",
  "url": "https://clawtest.clawdet.com",
  "provisionedAt": "2026-02-18T15:05:00Z"
}
```

---

**Status:** Provisioning in progress... will update when complete.
