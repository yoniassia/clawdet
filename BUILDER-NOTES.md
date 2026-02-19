# Builder Notes - Real-time Updates

## 🎯 SIMPLIFIED SCOPE - NO ETORO!

**What we're building:**
- Simple trial chat (5 messages) with Grok
- X OAuth login
- Stripe payment
- Hetzner VPS auto-provisioning with OpenClaw + Grok configured
- Customer gets subdomain: `username.clawdet.com`

**What we're NOT building:**
- eToro integration (skip all eToro code from ClawX)
- Complex features
- Just the essentials

## APIs & Credentials Available

### ✅ Grok 4.2 API (xAI)
- **Key:** `<from .env.local>`
- **Endpoint:** https://api.x.ai/v1
- **Model:** `grok-4-2` (main) or `grok-4-1-fast-non-reasoning` (faster)
- **Use for:** 
  1. Trial chat interface
  2. Pre-configured in every provisioned instance
- **Documentation:** https://docs.x.ai/api

**Integration Priority:** HIGH - Use REAL Grok API, not mocks!

### ✅ Hetzner Cloud API
- **Use Yoni's account** - API token in env (to be provided)
- **Instance Size:** CX11 (smallest/cheapest) or CPX11
- **Image:** Ubuntu 22.04 LTS
- **Use for:** Creating customer VPS instances

### ✅ Cloudflare DNS API
- **Token:** `GuC80nuUu3TQRid1087yAByFHb_9Rpk3r27RwQLN`
- **Zone:** clawdet.com
- **Use for:** Creating subdomains `<username>.clawdet.com`

### ✅ Cloudflare API
- **Token:** `GuC80nuUu3TQRid1087yAByFHb_9Rpk3r27RwQLN`
- **Zone ID:** `667a3504fd6992c99780d81edaf0b131`
- **Use for:** DNS automation during provisioning

### ⏳ Pending APIs
- **X OAuth:** Need client ID & secret (or mock for now)
- **Stripe:** Can use test mode keys (get from Stripe dashboard)
- **Hetzner:** Need API token for VPS provisioning (or mock)

---

## Sprint 1 Update: Grok API Available

**Change from original plan:** Don't mock the chat AI - use real Grok 4.2 API!

**Implementation:**
```typescript
// Trial chat should call:
fetch('https://api.x.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'grok-4-2',
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant for Clawdet, a platform that provides personal AI instances.' },
      { role: 'user', content: userMessage }
    ]
  })
})
```

**System prompt suggestion:**
```
You are Clawdet, an AI assistant helping users understand our platform. 

We offer:
- Personal AI instances powered by OpenClaw
- Your own subdomain and dedicated environment
- Full control over your AI assistant

In this trial, users get 5 free messages to experience the AI before signing up.
Be helpful, concise, and encourage them to sign up if they find value.
```

---

## Testing Checklist

After building trial chat with Grok integration:
- [ ] Test API call succeeds
- [ ] Response displays correctly
- [ ] Message counter works (5 max)
- [ ] Upgrade prompt appears after message 5
- [ ] Error handling for API failures
- [ ] Loading states during API call

---

---

## 🚀 Provisioning Flow (Critical)

When user pays, trigger this workflow:

1. **Create Hetzner VPS**
   - API call to create CX11/CPX11 Ubuntu 22.04
   - Wait for ready status
   - Get IP address

2. **Install OpenClaw**
   - SSH into VPS
   - Run official OpenClaw install: `curl -fsSL https://get.openclaw.ai | bash` (or equivalent)
   - Configure gateway config with Grok API key
   - Set model in config: `"default_model": "xai/grok-4-2"`

3. **Configure Workspace**
   - Create initial workspace files:
     - `IDENTITY.md` (customer's name)
     - `USER.md` (customer info)
     - `SOUL.md` (default personality)
   - If customer connected X, add X credentials

4. **DNS & SSL**
   - Cloudflare: Create A record `<username>.clawdet.com` → VPS_IP
   - Wait 30-60s for propagation
   - Enable Cloudflare proxy (automatic SSL)

5. **Verify & Handoff**
   - Check OpenClaw is responding at subdomain
   - Send customer their URL
   - Mark provisioning complete

---

## X OAuth Testing

**Purpose:** Authentication for signup
**Test with:** Yoni's X account
**Flow:** OAuth → Callback → Create user → Redirect to payment

**After provisioning (optional feature):**
Customer can connect their X account to their instance for X integrations.

---

**Updated:** 2026-02-17 07:32 UTC
**Next Update:** After Sprint 1 completion
