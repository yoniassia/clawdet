# Test Instances - Provisioning Guide

## Test Users Created ✅

I've created 2 test users in the database, both marked as paid (free beta).

### Test Instance 1
- **Email:** test1@clawdet.com
- **Username:** test1
- **Status:** Paid (Free Beta) ✅
- **Ready to provision:** Yes

### Test Instance 2
- **Email:** test2@clawdet.com  
- **Username:** test2
- **Status:** Paid (Free Beta) ✅
- **Ready to provision:** Yes

---

## Option 1: Web Interface (Recommended)

### For You (Already Logged In)

Since you're already logged in as `yoniassia`, you can provision test instances by:

1. **Using the Provisioning API directly:**
   ```bash
   # Test Instance 1
   curl -X POST https://clawdet.com/api/provisioning/start \
     -H "Cookie: user_session=<test1_session_token>" \
     -H "Content-Type: application/json"
   
   # Test Instance 2
   curl -X POST https://clawdet.com/api/provisioning/start \
     -H "Cookie: user_session=<test2_session_token>" \
     -H "Content-Type: application/json"
   ```

2. **Or log in as test users and use dashboard:**
   - Go to https://clawdet.com/dashboard
   - Set cookie manually in browser DevTools:
     - `user_session` = `<session_token_from_above>`
   - Click "Get My Free Instance"

---

## Option 2: Manual VPS Provision (Fastest for Testing)

If you have a VPS with Docker installed, you can provision manually:

### Quick Provision Script

```bash
# Instance 1 (on any VPS with Docker)
mkdir -p /opt/clawdet-test1 && cd /opt/clawdet-test1

# Download compose file
curl -fsSL https://clawdet.com/templates/docker-compose.pro.yml -o docker-compose.yml

# Create .env with API keys
cat > .env <<EOF
XAI_API_KEY=xai-YOUR_API_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_API_KEY_HERE
OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
AUTH_PASSWORD=test123
AUTH_USERNAME=test1
OPENCLAW_PRIMARY_MODEL=x-ai/grok-420-0220-5p1m-reasoning
EOF

# Edit port mapping (change 80:8080 to 8081:8080)
sed -i 's/80:8080/8081:8080/g' docker-compose.yml

# Start container
docker compose up -d

# Check logs
docker compose logs -f
```

**Access:**
- URL: `http://<vps-ip>:8081`
- Gateway: `ws://<vps-ip>:8081` (port 18789 internally)
- Username: `test1`
- Password: `test123`

**Repeat for Instance 2** (use port 8082, username test2, password test456)

---

## Option 3: Use Existing test-fresh Instance

You already have `test-fresh.clawdet.com` running! You can:

1. SSH into it
2. Test the chat there
3. It's already using Grok 4.2

```bash
ssh root@<test-fresh-ip>
cd /opt/clawdet
docker compose logs -f
```

---

## What Each Instance Will Have

✅ **Grok 4.2 Model** (`grok-420-0220-5p1m-reasoning`)  
✅ **X.AI API Key** (pre-configured)  
✅ **OpenClaw Gateway** (port 18789)  
✅ **Web UI** (port 8080 → exposed)  
✅ **Persistent workspace** (`/data/workspace`)  
✅ **Skills & tools** (pre-installed)

---

## Testing the Chat

Once instances are running:

### Via Web UI
```
http://<instance-url>:8080
```

### Via Gateway (WebSocket)
```javascript
const ws = new WebSocket('ws://<instance-url>:18789')
ws.onmessage = (msg) => console.log(msg.data)
ws.send(JSON.stringify({
  type: 'chat',
  message: 'Hello, Grok!'
}))
```

### Via Telegram (if configured)
```
1. Set TELEGRAM_BOT_TOKEN in .env
2. Restart container
3. Message your bot
```

---

## Quick Test Checklist

Once instances are running:

- [ ] Web UI accessible
- [ ] Gateway responding (WebSocket)
- [ ] Chat sends message
- [ ] Grok 4.2 responds
- [ ] Reasoning mode active (check logs for thinking)
- [ ] Tools/skills available
- [ ] Workspace persists (create file, restart, check if still there)

---

## Recommended Next Steps

### 1. Provision on Hetzner VPS

Use the Hetzner API to create 2 small VPS instances:

```bash
# Via clawdet provisioning system
node -e "
const { provisionUserInstance } = require('./lib/provisioner-v2');
provisionUserInstance('test_user_1_1771717599416');
provisionUserInstance('test_user_2_1771717599416');
"
```

This will:
- Create cx23 VPS (4GB RAM, 2 vCPU)
- Configure DNS: test1.clawdet.com, test2.clawdet.com
- Install Docker
- Deploy OpenClaw with Grok 4.2
- Takes ~10 minutes

### 2. Test Locally with Docker Desktop

If you have Docker Desktop:
```bash
# Clone provision files
git clone https://github.com/yoniassia/clawdet.git
cd clawdet

# Run test1
cd /tmp && mkdir test1 && cd test1
# Follow "Quick Provision Script" above
```

### 3. Use test-fresh.clawdet.com

This instance is already running! Just SSH in and test:
```bash
ssh root@<test-fresh-ip>
# Chat via web UI or gateway
```

---

## Troubleshooting

**Container won't start:**
```bash
docker compose logs
# Check for API key errors or port conflicts
```

**Can't connect to gateway:**
```bash
# Check if port 18789 is exposed
docker compose ps
netstat -tulpn | grep 18789
```

**Grok not responding:**
```bash
# Check API key
grep XAI_API_KEY .env
# Check model config
grep OPENCLAW_PRIMARY_MODEL .env
```

---

## When Ready to Improve

Once you've tested both instances:

1. **Document UX issues** - What's confusing? What's missing?
2. **Test Grok reasoning** - Try complex queries, see how 5p1m mode performs
3. **Check performance** - Response time, memory usage
4. **Try integrations** - Telegram, Discord, API
5. **Stress test** - Multiple concurrent chats

Then we can:
- Fix bugs you found
- Add features you need
- Improve the provisioning flow
- Polish the UI
- Optimize Grok prompts

---

**Status:** Test users created ✅  
**Next:** Choose provisioning method above  
**Goal:** Get 2 instances running, test chat with Grok 4.2, gather feedback

