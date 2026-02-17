# CLAWDET BUILD PLAN - 12 Hour Sprint

**Goal:** Simple way for users to setup their own OpenClaw instance with Hetzner + Grok

**Core Flow:**
1. Try 5-message chat with Grok 4.2 (real API)
2. Sign up with X OAuth (test with Yoni's account)
3. Pay $20 via Stripe
4. Auto-provision Hetzner VPS with OpenClaw + Grok configured
5. Hand user their subdomain URL

**What We're NOT Building:**
- eToro integration (removed)
- Complex features
- Just the essentials: trial → auth → pay → provision

**Strategy:** 30-minute iterations, build incrementally, ship working code fast

---

## Phase 1: Core Trial Experience (Iterations 1-6, 3 hours)

### ✅ Completed
- [ ] Domain/DNS setup (already done: clawdet.com → 188.34.197.212)
- [ ] OpenClaw backend configured (already done: port 18789)

### Sprint 1-2: Trial Chat Interface
- [✅] Create `/trial` route with X-style UI
- [✅] 5-message counter with session storage
- [✅] Simple chat interface (text input, message display)
- [✅] **REAL Grok API integration** (grok-4-1-fast-non-reasoning)
- [✅] "Upgrade to continue" after 5 messages
- **Status:** COMPLETE - Using real Grok API instead of mocks!

### Sprint 3-4: Chat Backend
- [✅] API route `/api/trial-chat` for message handling
- [✅] Session tracking with sessionStorage on client
- [✅] Message counter enforcement (5 messages max)
- [✅] Real Grok API integration (working)
- [✅] Upgrade redirect to `/signup`
- **Status:** COMPLETE - API tested and working with real responses!

### Sprint 5-6: Landing Page
- [✅] Root `/` landing page with hero section
- [✅] "Try Now" CTA → `/trial`
- [✅] Feature highlights (3 key features)
- [✅] Pricing mentioned in copy
- [✅] X-style design (black theme, gradient, clean)
- **Status:** COMPLETE - Responsive design with hover effects!

---

## Phase 2: Authentication (Iterations 7-10, 2 hours)

### Sprint 7-8: X OAuth Flow
- [✅] `/api/auth/x/login` - OAuth initiation (with mock mode)
- [✅] `/api/auth/x/callback` - Handle OAuth callback
- [✅] Session management (httpOnly cookies)
- [✅] `/api/auth/me` - Session verification endpoint
- [✅] `/dashboard` - Post-auth landing page
- **Status:** COMPLETE - Mock OAuth working, ready for real credentials!

### Sprint 9-10: Signup Flow
- [ ] `/signup` page with X OAuth button
- [ ] Post-auth: collect email, terms acceptance
- [ ] Create user record in database
- [ ] Redirect to payment

---

## Phase 3: Payment (Iterations 11-14, 2 hours)

### Sprint 11-12: Stripe Integration
- [ ] Stripe account setup (or mock if needed)
- [ ] `/api/payment/create-session` - Create Stripe Checkout
- [ ] `/checkout` page with Stripe Checkout embed
- [ ] Single product: $20/month OpenClaw instance
- [ ] Test mode payment flow

### Sprint 13-14: Payment Webhooks
- [ ] `/api/webhooks/stripe` - Handle payment success
- [ ] Mark user as paid in database
- [ ] Trigger provisioning workflow
- [ ] Send confirmation via X DM (or email fallback)

---

## Phase 4: Provisioning (Iterations 15-20, 3 hours)

### Sprint 15-16: Hetzner VPS Creation
- [ ] Use Hetzner API to create VPS (smallest instance: CX11 or CPX11)
- [ ] Ubuntu 22.04 LTS image
- [ ] SSH key setup for access
- [ ] Wait for VPS to be ready
- [ ] Store VPS details in database (IP, ID, user)

### Sprint 17-18: OpenClaw Installation
- [ ] SSH into VPS
- [ ] Install OpenClaw via official method (curl/dpkg)
- [ ] Configure gateway with Grok API key (Yoni's key from env)
- [ ] Set up initial workspace (AGENTS.md, USER.md with customer name)
- [ ] Configure X integration if customer connected X

### Sprint 19-20: DNS, SSL & Handoff
- [ ] Create DNS A record via Cloudflare: `<username>.clawdet.com → VPS_IP`
- [ ] Wait for DNS propagation
- [ ] Configure SSL (Cloudflare proxy or Let's Encrypt)
- [ ] Verify OpenClaw is accessible at subdomain
- [ ] Send customer their URL + setup instructions
- [ ] Mark provisioning complete

---

## Phase 5: Polish & Testing (Iterations 21-24, 2 hours)

### Sprint 21-22: Integration Testing
- [ ] End-to-end flow: trial → signup → payment → provision
- [ ] Error handling at each step
- [ ] Rollback/cleanup on failure
- [ ] Logging and monitoring

### Sprint 23-24: Production Ready
- [ ] Security audit (auth, encryption, SQL injection)
- [ ] Performance optimization (caching, CDN)
- [ ] Mobile responsiveness
- [ ] Analytics tracking (optional)
- [ ] Documentation (user onboarding)
- [ ] Launch checklist verification

---

## APIs Available & Mocks

✅ **Grok 4.2 API:** REAL - Yoni's key (use for trial chat + provisioned instances)
✅ **Hetzner Cloud:** REAL - Use Yoni's account to create VPS instances
✅ **Cloudflare:** REAL - For DNS automation (subdomains)

**For MVP:**
- **X OAuth:** Test feature - use for authentication (Yoni's account)
- **Stripe:** Test mode keys (get from dashboard, or mock for now)
- **X DM notifications:** Optional/skip for MVP
- **Email:** Console log or skip for MVP

**Key Decision:** Every provisioned instance gets configured with Yoni's Grok API key automatically.
Customer gets their own VPS but shared Grok API access (for now).

---

## Success Criteria (12 Hour Mark)

✅ **User can:**
1. Visit clawdet.com and see landing page
2. Try 5-message chat with real Grok 4.2 AI
3. Sign up with X OAuth (test with Yoni's account)
4. Pay $20 via Stripe test mode
5. Wait while Hetzner VPS is provisioned automatically
6. Receive subdomain URL: `<username>.clawdet.com`
7. Access their personal OpenClaw instance with Grok configured

✅ **Technical:**
- Trial chat works with real Grok API
- X OAuth flow completes successfully
- Stripe payment webhook triggers provisioning
- Hetzner API creates VPS and installs OpenClaw
- Cloudflare DNS creates subdomain automatically
- Customer instance is pre-configured with Grok API
- Status page shows provisioning progress

✅ **Nice-to-Have (if time):**
- Email notifications
- Admin dashboard to view all instances
- User can connect their X account to their instance
- Better error handling and rollback

---

## Current State (Iteration 0)

**What we have:**
- Domain: clawdet.com (live with SSL)
- Server: Hetzner VPS at 188.34.197.212
- OpenClaw running on port 18789
- Skills: X/Twitter, Cloudflare, Hetzner, Telegram
- ClawX codebase as reference
- GitHub access for deployment

**What we need to build:**
- Everything else

**First task (Sprint 1):** Build trial chat interface at `/trial` with 5-message limit

---

## Progress Tracking

Update this section after each sprint:

**Sprint 1:** ✅ COMPLETE - Trial chat with real Grok API integration
  - Integrated Grok 4.1 Fast (non-reasoning) API 
  - Tested with real AI responses
  - 5-message limit enforcement working
  - Trial UI functional with session storage
  - Commit: 0419bb5
**Sprint 2:** ✅ COMPLETE - Continued trial chat polish (included in Sprint 1)
**Sprint 3:** ✅ COMPLETE - Chat backend API verified working
  - Tested /api/trial-chat endpoint with real Grok API
  - Confirmed message counter and limit enforcement
  - Upgrade flow to /signup working
**Sprint 4:** ✅ COMPLETE - Landing page already built
  - Root page with hero, CTA buttons, feature grid
  - X-style dark theme with gradient effects
  - Responsive design implemented
**Sprint 5:** ✅ COMPLETE - X OAuth Flow implementation
  - Created /api/auth/x/login and /api/auth/x/callback
  - Mock OAuth mode for testing (easily swappable with real OAuth)
  - Session management with httpOnly cookies (7-day expiry)
  - /dashboard page for post-authentication
  - /api/auth/me endpoint for session verification
  - Tested full flow: signup → OAuth → dashboard
  - Commit: 0418b7c
**Sprint 6:** Next - Continue with signup flow and payment integration
...
**Sprint 24:** [Status] - [Final state]

---

## Notes for Builder Agent

- **Work in workspace:** `/root/.openclaw/workspace/clawdet/`
- **Commit changes:** After each sprint, commit with clear message
- **Test everything:** curl, manual browser check, console logs
- **Mock aggressively:** Don't block on missing APIs - fake it first, wire real later
- **Document as you go:** Update this file with progress
- **Ask only if blocked >15min:** Otherwise, decide and move forward
- **Ship > Perfect:** Working beats polished. Iterate.

---

**START TIME:** 2026-02-17 07:25 AM UTC
**DEADLINE:** 2026-02-17 07:25 PM UTC (12 hours)
**CURRENT ITERATION:** 5 of 24
**NEXT TASK:** Sprint 9-10 - Signup Flow & Payment Integration
