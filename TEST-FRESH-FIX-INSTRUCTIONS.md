# Fix test-fresh.clawdet.com WebSocket Chat

## Current Situation

**test-fresh.clawdet.com** is a **separate VPS instance** (not Docker on this server).

- Behind Cloudflare
- SSH from main server (clawdet.com) times out
- Likely needs SSH key or firewall adjustment
- Has HTML served but needs WebSocket gateway proxy

---

## Architecture Summary

### Current Setup:

```
Main Server (188.34.197.212):
├── clawdet.com - Next.js app + Gateway ✅
├── WebSocket chat working ✅
└── OpenClaw Gateway on :18789 ✅

Separate VPS:
├── test-fresh.clawdet.com - Standalone instance
├── HTML served ✅
├── Gateway proxy: MISSING ❌
└── WebSocket chat: OLD VERSION ❌
```

---

## Manual Fix (5 minutes)

Since SSH from this server times out, you'll need to:

### Step 1: SSH Directly

```bash
# From your local machine or with proper SSH key:
ssh root@test-fresh.clawdet.com
```

### Step 2: Upload WebSocket Chat

```bash
# Option A: SCP from local (after downloading)
curl https://clawdet.com/test-fresh-working-chat.html > chat.html
scp chat.html root@test-fresh.clawdet.com:/var/www/html/index.html

# Option B: Direct download on server
ssh root@test-fresh.clawdet.com
curl https://clawdet.com/test-fresh-working-chat.html > /var/www/html/index.html
```

### Step 3: Add Gateway Proxy to Caddy

```bash
ssh root@test-fresh.clawdet.com

# Edit Caddyfile
nano /etc/caddy/Caddyfile

# Add this inside the test-fresh.clawdet.com block:
handle /gateway/* {
    reverse_proxy localhost:18789
}

# Reload Caddy
caddy reload --config /etc/caddy/Caddyfile
```

### Step 4: Verify Gateway Running

```bash
ps aux | grep openclaw-gateway
netstat -tulpn | grep 18789
```

Should show OpenClaw Gateway listening on port 18789.

### Step 5: Test

```
https://test-fresh.clawdet.com
```

Should show WebSocket chat and connect to "Connected - Grok 4.2"

---

## Alternative: If Gateway Not Running

If OpenClaw Gateway isn't running on test-fresh:

```bash
# Check if it's Docker-based
docker ps

# If Docker:
docker compose logs -f

# If systemd:
systemctl status openclaw-gateway
systemctl start openclaw-gateway

# If neither:
# May need to install OpenClaw first
```

---

## Quick Test Without SSH

**1. Check if it's accessible:**
```bash
curl -I https://test-fresh.clawdet.com/gateway/
```

**2. If you get 200 OK:** Gateway proxy already configured!  
**3. If you get 404:** Gateway proxy missing (needs Step 3 above)  
**4. If you get 502:** Gateway not running (needs Step 4 above)

---

## Complete Configuration File

**For test-fresh Caddyfile:**

```nginx
test-fresh.clawdet.com {
    # WebSocket Gateway
    handle /gateway/* {
        reverse_proxy localhost:18789
    }
    
    # Static files
    handle {
        root * /var/www/html
        file_server
    }
}
```

---

## Testing from Another Instance

Once test-fresh is fixed, you can test cross-instance communication:

### From clawdet.com chat → test-fresh gateway:

Edit the WebSocket URL in the chat:
```javascript
// Change from:
const wsUrl = `wss://${window.location.host}/gateway/`

// To:
const wsUrl = `wss://test-fresh.clawdet.com/gateway/`
```

### From test-fresh chat → clawdet.com gateway:

```javascript
const wsUrl = `wss://clawdet.com/gateway/`
```

---

## Status Check Commands

```bash
# From your machine with SSH access:

# 1. Gateway running?
ssh root@test-fresh.clawdet.com "ps aux | grep openclaw-gateway"

# 2. Port listening?
ssh root@test-fresh.clawdet.com "netstat -tulpn | grep 18789"

# 3. Caddy config?
ssh root@test-fresh.clawdet.com "cat /etc/caddy/Caddyfile"

# 4. Test gateway proxy:
curl -I https://test-fresh.clawdet.com/gateway/
```

---

## Summary

**Current State:**
- ✅ clawdet.com - WebSocket chat working
- ❌ test-fresh.clawdet.com - Needs gateway proxy + updated chat

**Fix Required:**
1. Upload new chat HTML
2. Add `/gateway/*` proxy to Caddy
3. Reload Caddy
4. Test connection

**ETA:** 5 minutes with SSH access

**Blocker:** SSH timeout from main server (likely firewall/key issue)

