# Quick Test Guide - Use test-fresh.clawdet.com

## ✅ You Already Have a Working Instance!

**test-fresh.clawdet.com** is already running with Grok 4.2!

---

## 🚀 Test It Right Now

### Option 1: Web Browser

**URL:** https://test-fresh.clawdet.com

**What to test:**
1. Open in browser
2. Try the chat interface
3. Send: "Hello, explain your reasoning capabilities"
4. Watch for Grok 4.2 response with thinking

---

### Option 2: SSH Access

```bash
# Connect to the instance
ssh root@<test-fresh-ip>

# Check if it's running
docker compose ps

# View logs
docker compose logs -f

# Check model configuration
cat .env | grep MODEL
# Should show: x-ai/grok-420-0220-5p1m-reasoning
```

---

### Option 3: Test via API

```bash
# Health check
curl https://test-fresh.clawdet.com/healthz

# Or try the gateway
curl https://test-fresh.clawdet.com/api/status
```

---

## 🎯 What to Test

### 1. Basic Chat
- Send simple questions
- Check response quality
- Verify it's using Grok (not Claude)

### 2. Reasoning Mode
- Ask complex questions like:
  - "Plan a trip to Japan for 10 days with $3000 budget"
  - "Debug this code: [paste code]"
  - "Analyze the pros and cons of moving to Mars"
- Look for `[thinking]` or reasoning steps in responses

### 3. Tools & Skills
- Ask it to search the web
- Ask about the weather
- Try file operations
- Test code execution

### 4. Performance
- Response time
- Memory usage (check `docker stats`)
- Token usage

---

## 📝 Document Issues

As you test, note:
- **Bugs:** What doesn't work?
- **UX issues:** What's confusing?
- **Missing features:** What would you want?
- **Performance:** Too slow? Too fast?
- **Grok quality:** How's the reasoning?

---

## 🔧 If You Want NEW Test Instances

Since this server doesn't have Docker, you have 2 options:

### Option A: Use Hetzner API (via clawdet.com)

1. Go to: https://clawdet.com/dashboard
2. Open DevTools (F12)
3. Run in console:
   ```javascript
   document.cookie = "user_session=2794e1d34ff7e0e4b1af73106ee19c45e2778f6a0d5c8bf6c100e7eacb7c104b; path=/; secure"
   ```
4. Refresh page
5. Click "Get My Free Instance"

This will create a REAL VPS on Hetzner (~10 minutes)

### Option B: Manual Docker Deployment

If you have another server with Docker:

```bash
# Create directory
mkdir -p /opt/clawdet-test1 && cd /opt/clawdet-test1

# Download compose file
curl -fsSL https://clawdet.com/templates/docker-compose.pro.yml -o docker-compose.yml

# Create .env
cat > .env <<EOF
XAI_API_KEY=xai-YOUR_API_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_API_KEY_HERE
OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)
AUTH_PASSWORD=test123
AUTH_USERNAME=test1
OPENCLAW_PRIMARY_MODEL=x-ai/grok-420-0220-5p1m-reasoning
EOF

# Start
docker compose up -d

# Access at http://<server-ip>:80
```

---

## 🎉 Recommendation

**Start with test-fresh.clawdet.com** - it's already running and ready to test!

Once you've tested it and have feedback, we can:
1. Fix bugs
2. Add features
3. Improve UX
4. Provision more instances

---

**Status:** test-fresh.clawdet.com is ready ✅  
**Next:** Test the chat and give feedback!  
**Then:** We'll improve based on what you find

