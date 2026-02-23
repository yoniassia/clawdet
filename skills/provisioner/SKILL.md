# Clawdet Instance Provisioner Skill

## Purpose
Provision new OpenClaw instances for Clawdet users on Hetzner VPS with full automation.

## Architecture
- **Server type**: `cax11` (ARM, 2 vCPU, 4GB RAM, 40GB SSD) — `cx22`/`cx23` are DEPRECATED
- **Auth method**: Token auth + HTTP `/v1/chat/completions` endpoint (NOT WebSocket webchat mode)
- **Chat UI**: Static HTML using OpenAI-compatible HTTP API (streaming SSE)

## Critical: WebSocket webchat mode does NOT work for chat.send
OpenClaw's webchat mode strips `operator.write` scopes when no device identity is present.
Even with `dangerouslyDisableDeviceAuth: true`, scopes are cleared BEFORE the bypass check.
**Always use the HTTP `/v1/chat/completions` endpoint for web chat interfaces.**

## Provisioning Steps (8 total)

### 1. Create VPS
```bash
# Hetzner API
curl -X POST https://api.hetzner.cloud/v1/servers \
  -H "Authorization: Bearer $HETZNER_TOKEN" \
  -d '{"name":"clawdet-USERNAME","server_type":"cax11","image":"ubuntu-24.04","location":"hel1","ssh_keys":[SSH_KEY_ID]}'
```

### 2. Configure DNS
```bash
# Cloudflare API - create A record
# USERNAME.clawdet.com → VPS_IP (proxied=true for SSL)
```

### 3. Wait for SSH
```bash
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@VPS_IP 'hostname'
# Retry up to 60s
```

### 4. Install Node.js (CRITICAL - must come before OpenClaw)
```bash
ssh root@VPS_IP 'curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs build-essential python3'
```

### 5. Install OpenClaw
```bash
ssh root@VPS_IP 'npm install -g openclaw'
```

### 6. Configure OpenClaw
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "...",
    "XAI_API_KEY": "..."
  },
  "agents": {
    "defaults": {
      "model": { "primary": "anthropic/claude-sonnet-4-5" }
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "controlUi": {
      "allowInsecureAuth": true,
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": ["https://USERNAME.clawdet.com"]
    },
    "auth": {
      "mode": "token",
      "token": "GENERATED_TOKEN"
    },
    "http": {
      "endpoints": {
        "chatCompletions": { "enabled": true }
      }
    },
    "trustedProxies": [
      "127.0.0.1", "::1",
      "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22",
      "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18",
      "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22",
      "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
      "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22"
    ]
  }
}
```

### 7. Create systemd service + Caddy
```bash
# systemd: openclaw-gateway.service (ExecStart=/usr/bin/openclaw gateway)
# Caddy: reverse_proxy /v1/* and /gateway/* to localhost:18789, serve static /var/www/clawdet/
```

### 8. Deploy chat HTML + verify
- Deploy HTTP-based chat HTML (uses /v1/chat/completions, NOT WebSocket)
- Test: `curl -s https://USERNAME.clawdet.com/v1/chat/completions -H "Authorization: Bearer TOKEN" -d '...'`

## Common Failures

| Issue | Cause | Fix |
|-------|-------|-----|
| `npm: command not found` | Node.js not installed | Install Node.js BEFORE OpenClaw |
| `device identity required` | WebSocket webchat mode | Use HTTP API instead |
| `missing scope: operator.write` | Webchat strips scopes | Use HTTP API instead |
| `origin not allowed` | Missing allowedOrigins | Add domain to controlUi.allowedOrigins |
| `Unknown model: x-ai/...` | Wrong provider prefix | Use `xai/` not `x-ai/` |
| VPS type deprecated | cx22/cx23 removed | Use `cax11` (ARM) |
| DNS not resolving | Cloudflare propagation | Wait 30s, or set proxied=true |

## Key Files
- Provisioner: `/root/.openclaw/workspace/clawdet/lib/provisioner-v2.ts`
- Hetzner lib: `/root/.openclaw/workspace/clawdet/lib/hetzner.ts`
- Cloudflare lib: `/root/.openclaw/workspace/clawdet/lib/cloudflare.ts`
- Chat HTML template: `/tmp/chat-http.html` (HTTP-based, works everywhere)
- User DB: `/root/.openclaw/workspace/clawdet/data/users.json`

## Servers
- Main Clawdet: 188.34.197.212 (clawdet.com, port 3002 via PM2)
- Test-new: 188.34.197.212:18791 (test-new.clawdet.com)
- Testy: 89.167.3.83 (testy.clawdet.com)
- Yoni's instance: 65.109.226.222 (yoniassia.clawdet.com)

## API Keys (env vars on each VPS)
- ANTHROPIC_API_KEY in openclaw.json env
- XAI_API_KEY in openclaw.json env
- Hetzner token in clawdet .env.local
- Cloudflare token in clawdet .env.local
