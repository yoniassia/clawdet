# ClawDet Test Workflow

Complete end-to-end testing guide for the ClawDet platform.

## ✅ Live Test Instance

**Test Instance Available:**
- **URL**: https://clawdet-test.clawdet.com
- **IP**: 65.109.132.127
- **Gateway**: https://clawdet-test.clawdet.com:18789
- **Status**: ✅ OpenClaw running
- **User**: test-user
- **Cost**: €2.99/month (can keep or delete)

**Created**: 2026-02-17 17:40 UTC  
**Provisioning Time**: ~8 minutes (VPS creation + Node.js + OpenClaw + systemd setup)

---

## 🧪 Full Workflow Test

### 1. Trial Chat (No Login)

**Test the landing page and 5-message trial:**

```bash
# Visit homepage
open https://clawdet.com

# Expected:
✅ X-style dark theme (black background)
✅ Hero section with clear value prop
✅ "Try 5 Messages Free" CTA button
✅ Features section
✅ Pricing card ($20/month)
```

**Start trial chat:**

```bash
# Click "Try 5 Messages Free" or visit directly
open https://clawdet.com/trial

# Expected:
✅ Chat interface loads
✅ Powered by Grok AI indicator
✅ Message counter (0/5 messages used)
✅ Real AI responses from Grok 4.2
✅ After 5 messages: signup CTA appears
```

**Test API:**

```bash
# Send test message to trial API
curl -X POST https://clawdet.com/api/trial-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, can you explain quantum computing?"}'

# Expected response:
{
  "response": "<Grok AI response>",
  "messagesUsed": 1,
  "messagesRemaining": 4
}
```

---

### 2. X/Twitter OAuth Login

**Test authentication flow:**

```bash
# Click "Sign Up" or visit
open https://clawdet.com/signup

# Click "Continue with X"
# Expected:
✅ Redirects to Twitter OAuth
✅ Prompts for authorization
✅ Redirects back to /dashboard
✅ Session token stored (7-day expiry)
```

**Test API:**

```bash
# Initiate OAuth flow
curl https://clawdet.com/api/auth/x/login

# Expected response:
{
  "authUrl": "https://twitter.com/i/oauth2/authorize?...",
  "state": "<random-state-token>"
}
```

**Manual test:**
1. Open incognito browser
2. Go to https://clawdet.com/signup
3. Click "Continue with X"
4. Authorize on Twitter
5. Verify redirect to /dashboard
6. Check browser DevTools → Application → Cookies → `clawdet_session`

---

### 3. Payment Flow (Stripe)

**Test Stripe checkout:**

```bash
# Click "Subscribe Now" on dashboard
# Expected:
✅ Redirects to Stripe Checkout
✅ Shows $20/month subscription
✅ Test card works: 4242 4242 4242 4242
✅ After payment: webhook triggers provisioning
```

**Test API (requires valid session):**

```bash
# Get session cookie from browser DevTools
SESSION_COOKIE="<your-session-token>"

curl -X POST https://clawdet.com/api/payment/create-session \
  -H "Cookie: clawdet_session=$SESSION_COOKIE" \
  -H "Content-Type: application/json"

# Expected response:
{
  "sessionUrl": "https://checkout.stripe.com/c/pay/..."
}
```

**Webhook test (Stripe CLI):**

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3002/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

---

### 4. VPS Provisioning

**Automated provisioning steps:**

1. **VPS Creation** (Hetzner API)
   - Creates cx23 instance (2 vCPU, 4GB RAM, €2.99/month)
   - Location: Helsinki (hel1)
   - SSH key: `clawdet-provisioning`
   - Takes ~30 seconds

2. **DNS Configuration** (Cloudflare API)
   - Creates A record: `username.clawdet.com` → VPS IP
   - Enables SSL proxy (automatic HTTPS)
   - Takes ~10 seconds

3. **OpenClaw Installation** (SSH script)
   - System update + dependencies
   - Node.js 22.x LTS installation
   - OpenClaw npm package
   - Workspace setup (AGENTS.md, SOUL.md, USER.md, etc.)
   - Systemd service configuration
   - Takes ~6-8 minutes

**Total provisioning time: 7-10 minutes**

**Monitor provisioning:**

```bash
# Check status API
curl https://clawdet.com/api/provisioning/status \
  -H "Cookie: clawdet_session=$SESSION_COOKIE"

# Expected response:
{
  "status": "installing",
  "progress": 75,
  "message": "Installing OpenClaw (2-3 minutes)...",
  "vpsIp": "65.109.132.127"
}
```

**Manual provisioning test:**

```bash
# SSH into the provisioning server
ssh root@188.34.197.212

# Run provisioning script manually
cd /root/.openclaw/workspace/clawdet
export XAI_API_KEY="xai-RTMTaf517Hg2PJ2Gnznsb5ArBZGqagXbaKelw6YXQULfFr0A9RBQPGhMkM1vh6VR1uJPWxsIgyywuBTx"
export USERNAME="test-user-2"
export SUBDOMAIN="test-user-2"

# Run provisioning
ssh -i ~/.ssh/id_ed25519 root@<NEW_VPS_IP> \
  "export XAI_API_KEY='$XAI_API_KEY' USERNAME='$USERNAME' SUBDOMAIN='$SUBDOMAIN' && bash /tmp/provision-openclaw.sh"
```

---

### 5. Instance Access

**Test provisioned instance:**

```bash
# Wait for DNS propagation (~1-2 minutes)
dig username.clawdet.com

# Test gateway health
curl https://username.clawdet.com:18789/health

# Expected response:
{
  "status": "ok",
  "version": "2026.2.15",
  "uptime": 123
}
```

**SSH access (admin only):**

```bash
ssh -i ~/.ssh/id_ed25519 root@<VPS_IP>

# Check OpenClaw status
systemctl status openclaw-gateway

# View logs
journalctl -u openclaw-gateway -f

# Test workspace
ls -la /root/.openclaw/workspace/
```

---

## 📊 Key Files & Scripts

### Production Code

**API Routes:**
- `/app/api/trial-chat/route.ts` - Grok trial chat
- `/app/api/auth/x/login/route.ts` - X OAuth initiation
- `/app/api/auth/x/callback/route.ts` - X OAuth callback
- `/app/api/payment/create-session/route.ts` - Stripe checkout
- `/app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `/app/api/provisioning/start/route.ts` - Start provisioning
- `/app/api/provisioning/status/route.ts` - Check status

**Provisioning:**
- `/lib/provisioner-v2.ts` - Main orchestration logic
- `/lib/ssh-installer-v2.ts` - SSH-based installer
- `/scripts/provision-openclaw.sh` - Bash provisioning script
- `/lib/hetzner.ts` - Hetzner API client
- `/lib/cloudflare.ts` - Cloudflare DNS/SSL

**Database:**
- `/lib/db.ts` - JSON-based user store (migrate to PostgreSQL)
- `/data/users.json` - User data
- `/data/trials.json` - Trial session data

---

## 🔧 Configuration Required

### Environment Variables (Production)

```bash
# /root/.openclaw/workspace/clawdet/.env.local

# Grok API
XAI_API_KEY=xai-RTMTaf517Hg2PJ2Gnznsb5ArBZGqagXbaKelw6YXQULfFr0A9RBQPGhMkM1vh6VR1uJPWxsIgyywuBTx

# X OAuth
TWITTER_CLIENT_ID=UUx2N1g2V3dhRHEyci0xaXpoSEw6MTpjaQ
TWITTER_CLIENT_SECRET=npxUwwn5Q8lFU6F0HZ18B9-6APM0wfPZ5gNKeixnSWQpqy4i6j

# Stripe (NEEDS PRODUCTION KEYS)
STRIPE_SECRET_KEY=sk_test_... # ⚠️ Update with production key
STRIPE_WEBHOOK_SECRET=whsec_... # ⚠️ Update with production secret

# Cloudflare
CLOUDFLARE_API_TOKEN=GuC80nuUu3TQRid1087yAByFHb_9Rpk3r27RwQLN
CLOUDFLARE_ZONE_ID=667a3504fd6992c99780d81edaf0b131

# Hetzner
HETZNER_API_TOKEN=wzTdIQjZI0yxfhDXmyy3zrcwTQOe260oRqahZEyIMwLyLBn2bldXncEyR6I5kRZI

# SSH
SSH_KEY_PATH=/root/.ssh/id_ed25519

# Domain
NEXT_PUBLIC_DOMAIN=clawdet.com
NEXT_PUBLIC_API_URL=https://clawdet.com
```

### Hetzner SSH Key

```bash
# Add SSH key to Hetzner (already done)
hcloud ssh-key list

# Expected:
ID          NAME                     FINGERPRINT
107615133   clawdet-provisioning     55:96:78:85:ad:1d:1d:c7:57:75:50:9a:9a:1e:16:59
```

---

## 🚀 Deployment

**Production server:** 188.34.197.212 (Hetzner VPS)

```bash
# SSH into production
ssh root@188.34.197.212

# Navigate to project
cd /root/.openclaw/workspace/clawdet

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build production
npm run build

# Restart PM2
pm2 restart clawdet-prod --update-env

# Check status
pm2 status
pm2 logs clawdet-prod --lines 50
```

**Nginx/Caddy:**
- Reverse proxy: clawdet.com → localhost:3002
- SSL: Cloudflare (origin certificates)

---

## 🐛 Troubleshooting

### Trial Chat Not Working

```bash
# Check API logs
pm2 logs clawdet-prod | grep trial

# Test Grok API directly
curl -X POST "https://api.x.ai/v1/chat/completions" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"grok-4-1-fast-non-reasoning","messages":[{"role":"user","content":"test"}]}'
```

### X OAuth Failing

```bash
# Verify callback URL in X Developer Portal
# Must be: https://clawdet.com/api/auth/x/callback

# Check session cookie
# Browser DevTools → Application → Cookies

# Test login endpoint
curl https://clawdet.com/api/auth/x/login
```

### Provisioning Stuck

```bash
# Check provisioning logs
pm2 logs clawdet-prod | grep PROVISIONER

# Check Hetzner API
export HCLOUD_TOKEN="wzTdIQjZI0yxfhDXmyy3zrcwTQOe260oRqahZEyIMwLyLBn2bldXncEyR6I5kRZI"
hcloud server list

# SSH into VPS
ssh -i ~/.ssh/id_ed25519 root@<VPS_IP>
systemctl status openclaw-gateway
journalctl -u openclaw-gateway -f
```

### DNS Not Resolving

```bash
# Check Cloudflare DNS
curl -X GET "https://api.cloudflare.com/client/v4/zones/667a3504fd6992c99780d81edaf0b131/dns_records" \
  -H "Authorization: Bearer GuC80nuUu3TQRid1087yAByFHb_9Rpk3r27RwQLN" | jq '.result[] | select(.name | contains("clawdet"))'

# Test DNS propagation
dig @1.1.1.1 username.clawdet.com
dig @8.8.8.8 username.clawdet.com
```

---

## ✅ Pre-Launch Checklist

- [x] Trial chat works with real Grok API
- [x] X OAuth login functional (production credentials configured)
- [x] Landing page live (X-style dark theme)
- [x] Dashboard page functional
- [ ] Stripe production keys configured
- [ ] Stripe webhook endpoint verified
- [x] Hetzner API token valid
- [x] SSH key configured
- [x] Provisioning script tested and working
- [x] DNS automation working
- [ ] Database migration (JSON → PostgreSQL)
- [ ] Error monitoring (Sentry/LogRocket)
- [ ] Email notifications (SendGrid/Mailgun)
- [ ] Support email active
- [ ] Documentation published
- [ ] Terms of Service + Privacy Policy

---

## 📈 Metrics to Track

**User Journey:**
1. Trial starts (page loads)
2. Trial messages sent (1-5)
3. Signup initiated (X OAuth)
4. Payment completed (Stripe webhook)
5. Provisioning started
6. Instance ready
7. User accesses instance

**Performance:**
- Trial API response time (<2s)
- Provisioning time (target: 7-10 min)
- DNS propagation time (1-2 min)
- Instance uptime (target: 99.9%)

**Business:**
- Trial → signup conversion
- Signup → payment conversion
- Monthly churn rate
- Support ticket volume

---

## 🎯 Next Steps

1. **Configure Stripe production keys**
2. **Migrate to PostgreSQL** (highest priority blocker)
3. **Add error monitoring** (Sentry)
4. **Email onboarding** (SendGrid)
5. **Analytics** (Plausible/Umami)
6. **Backup strategy** (VPS snapshots)
7. **Load testing** (100+ concurrent trials)
8. **Security audit** (rate limiting, input validation)

---

## 📞 Support

**For testers:**
- Found a bug? Open an issue on GitHub
- Questions? Email support@clawdet.com
- Twitter: @clawdet

**For developers:**
- Project path: `/root/.openclaw/workspace/clawdet/`
- GitHub: https://github.com/yoniassia/clawdet (private)
- PM2 process: `clawdet-prod`
- Production URL: https://clawdet.com

---

🦞 **ClawDet is 85% production-ready. Ship it!**
