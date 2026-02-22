# USER STORIES — Clawdet Platform

**Version:** 1.0  
**Date:** 2026-02-22  
**Status:** Source of Truth

---

## Personas

| Persona | Description |
|---------|------------|
| **Visitor** | Anonymous user browsing clawdet.com for the first time |
| **Email Onboarder** | Visitor who signs up with email to get their own instance |
| **Customer** | Signed-up user with a provisioned OpenClaw instance |
| **Telegram User** | Customer who connected their instance to Telegram |
| **Admin** | Platform operator managing instances and infrastructure |

---

## 1. Visitor Stories

### V-1: View Landing Page
**As a** visitor  
**I want to** see a clear, compelling landing page  
**So that** I understand what Clawdet offers and want to try it

**Acceptance Criteria:**
- [ ] Page loads at `clawdet.com` in <3 seconds
- [ ] Hero section explains value proposition ("Your own AI assistant")
- [ ] "Try Now" CTA button is prominent and above the fold
- [ ] "Sign Up" button visible in header at all times
- [ ] Feature highlights (3 cards) visible without scrolling on desktop
- [ ] Pricing mentioned ($20/month or "Free Beta")
- [ ] Page is fully responsive (320px–1440px)
- [ ] Dark theme with gradient accents (brand consistent)

### V-2: Try Trial Chat
**As a** visitor  
**I want to** chat with the AI for free  
**So that** I can experience the quality before committing

**Acceptance Criteria:**
- [ ] Trial chat accessible via "Try Now" button or `/trial`
- [ ] First message gets a real Grok 4.2 response (not mocked)
- [ ] Response appears within 5 seconds
- [ ] Message counter visible showing X/5 messages used
- [ ] All 5 messages produce real AI responses
- [ ] Chat UI is clean, X-style dark theme
- [ ] Messages persist within the session (page refresh OK via localStorage)
- [ ] Loading indicator shown while AI responds

### V-3: Hit Trial Limit
**As a** visitor who used all 5 messages  
**I want to** see a clear upgrade path  
**So that** I know how to continue chatting

**Acceptance Criteria:**
- [ ] After 5th message, upgrade prompt appears immediately
- [ ] Primary CTA: "Sign Up" (email signup)
- [ ] Secondary option: "Other Options" → `/signup`
- [ ] Chat input is disabled after limit
- [ ] Previous messages remain visible
- [ ] No way to bypass the 5-message limit (new tab/incognito resets OK)

### V-4: Mobile Experience
**As a** mobile visitor  
**I want to** use the site on my phone  
**So that** I can try and sign up from anywhere

**Acceptance Criteria:**
- [ ] All pages render correctly at 320px width
- [ ] Touch targets ≥44×44px
- [ ] No horizontal scrolling
- [ ] Chat input keyboard doesn't obscure messages
- [ ] Text readable without zooming (min 14px)

---

## 2. Email Onboarder Stories

### E-1: Sign Up with Email
**As a** visitor ready to sign up  
**I want to** create an account with my email  
**So that** I can get my own AI instance

**Acceptance Criteria:**
- [ ] Sign-up form accessible from header button or post-trial prompt
- [ ] Email field with validation (format check)
- [ ] Name field (optional)
- [ ] Terms acceptance checkbox (required)
- [ ] Submit creates account and logs user in
- [ ] Session cookie set (httpOnly, Secure, SameSite=Strict)
- [ ] Redirect to dashboard/provisioning status
- [ ] Duplicate email shows clear error message
- [ ] Rate limited: 5 signup attempts/min/IP

### E-2: Post-Signup Provisioning
**As a** newly signed-up user  
**I want to** see my instance being created  
**So that** I know it's working and can anticipate when it'll be ready

**Acceptance Criteria:**
- [ ] Dashboard shows provisioning progress in real-time
- [ ] Progress stages visible: Creating VPS → Installing → Configuring DNS → Ready
- [ ] Estimated time shown (~6-8 minutes)
- [ ] Progress bar or step indicator updates automatically (polling)
- [ ] No user action required during provisioning
- [ ] Error state shows clear message if provisioning fails + retry option

### E-3: Trial Messages Carry Over
**As a** new user  
**I want to** see my trial messages in my new instance  
**So that** I don't lose the conversation I already started

**Acceptance Criteria:**
- [ ] Trial messages stored during signup flow
- [ ] After provisioning, main page shows all 5 trial messages
- [ ] Messages appear in correct order with both user and AI messages
- [ ] User can continue the conversation seamlessly
- [ ] Message count on main page shows 5 (the trial messages)

---

## 3. Customer Stories

### C-1: Access My Instance
**As a** customer with a provisioned instance  
**I want to** access my AI at my personal URL  
**So that** I can start chatting with unlimited messages

**Acceptance Criteria:**
- [ ] Instance accessible at `username.clawdet.com`
- [ ] Web chat interface loads with "Connected" status (green indicator)
- [ ] SSL certificate valid (no browser warnings)
- [ ] WebSocket connection established automatically
- [ ] Can send first message and get Grok 4.2 response
- [ ] No message limit — unlimited conversations
- [ ] Welcome screen with 4 AI suggestion cards

### C-2: See Telegram Connect Button
**As a** customer in my chat interface  
**I want to** see a Telegram connect option  
**So that** I can chat from Telegram too

**Acceptance Criteria:**
- [ ] Telegram connect button/link visible in chat UI
- [ ] Button clearly labeled ("Connect Telegram" or similar)
- [ ] Clicking shows step-by-step Telegram setup instructions
- [ ] Instructions include @BotFather flow
- [ ] Token input field for Telegram bot token
- [ ] Validation confirms token works before saving

### C-3: View Dashboard
**As a** customer  
**I want to** see my instance status and details  
**So that** I know my AI is running and healthy

**Acceptance Criteria:**
- [ ] Dashboard shows instance status (Online/Offline)
- [ ] Instance URL displayed and clickable
- [ ] AI model shown (Grok 4.2)
- [ ] Server location shown (Helsinki)
- [ ] Uptime or last-active indicator
- [ ] Link to open chat interface

### C-4: Chat with AI
**As a** customer  
**I want to** have natural conversations with my AI  
**So that** I get help, answers, and companionship

**Acceptance Criteria:**
- [ ] Messages sent and received in real-time (WebSocket)
- [ ] AI responses use Grok 4.2 model
- [ ] Conversation history persists across sessions
- [ ] Markdown rendering in AI responses
- [ ] Code blocks with syntax highlighting
- [ ] Typing indicator while AI is responding
- [ ] Can scroll through message history

---

## 4. Telegram User Stories

### T-1: Connect Telegram Bot
**As a** customer  
**I want to** connect my Telegram account  
**So that** I can chat with my AI from Telegram

**Acceptance Criteria:**
- [ ] Setup wizard guides through @BotFather bot creation
- [ ] User pastes bot token into clawdet interface
- [ ] System validates token (API call to Telegram)
- [ ] Success confirmation with green indicator
- [ ] Bot starts responding to messages in Telegram
- [ ] Error message if token is invalid

### T-2: Chat via Telegram
**As a** Telegram-connected user  
**I want to** message my AI from Telegram  
**So that** I can chat without opening a browser

**Acceptance Criteria:**
- [ ] Send message in Telegram → get Grok 4.2 response
- [ ] Response time <10 seconds
- [ ] Markdown formatting renders in Telegram
- [ ] Conversation context maintained across messages
- [ ] Can send messages from both web and Telegram interchangeably
- [ ] Bot handles errors gracefully (friendly error messages)

### T-3: Cross-Platform Continuity
**As a** user on both web and Telegram  
**I want to** see the same conversation  
**So that** I can switch between platforms seamlessly

**Acceptance Criteria:**
- [ ] Messages sent via Telegram appear in web chat
- [ ] Messages sent via web chat are part of AI context for Telegram
- [ ] No duplicate messages
- [ ] Conversation order is consistent

---

## 5. Admin Stories

### A-1: Monitor Platform Health
**As an** admin  
**I want to** see overall platform status  
**So that** I can detect and fix issues quickly

**Acceptance Criteria:**
- [ ] `/api/stats` returns performance metrics
- [ ] Response times tracked (X-Response-Time header)
- [ ] Error rates visible
- [ ] Active user count available
- [ ] Provisioning success/failure rates trackable
- [ ] Hetzner API status checkable

### A-2: Manage User Instances
**As an** admin  
**I want to** view and manage all provisioned instances  
**So that** I can troubleshoot issues and manage resources

**Acceptance Criteria:**
- [ ] List all users and their instance status
- [ ] SSH access to any instance via stored keys
- [ ] Can restart OpenClaw gateway on user instance
- [ ] Can check instance logs (`journalctl -u openclaw-gateway`)
- [ ] Can deprovision/delete instances
- [ ] Instance health check (is gateway responding?)

### A-3: Handle Provisioning Failures
**As an** admin  
**I want to** see and retry failed provisioning  
**So that** no user is left without their instance

**Acceptance Criteria:**
- [ ] Failed provisioning jobs listed with error details
- [ ] One-click retry for failed jobs
- [ ] Manual provisioning option (SSH + script)
- [ ] User notified of failure and ETA for resolution
- [ ] Failure doesn't charge user (if paid)

### A-4: Rotate API Keys
**As an** admin  
**I want to** rotate API keys without downtime  
**So that** security is maintained

**Acceptance Criteria:**
- [ ] Can update Grok API key in environment
- [ ] PM2 restart picks up new key
- [ ] Provisioned instances updated via SSH (batch script)
- [ ] No service interruption during rotation
- [ ] Old key invalidated after confirmation

### A-5: View Costs and Usage
**As an** admin  
**I want to** track infrastructure costs  
**So that** pricing remains sustainable

**Acceptance Criteria:**
- [ ] Hetzner VPS count and monthly cost visible
- [ ] Grok API usage trackable (per-instance if possible)
- [ ] Cloudflare DNS record count
- [ ] Cost-per-user calculation available
- [ ] Alert if costs exceed threshold

---

## The Golden Path (End-to-End Success Scenario)

This is the single most important test:

```
1. User opens clawdet.com                    → Landing page loads
2. User clicks "Try Now"                     → Trial chat opens
3. User sends 5 messages                     → All get real Grok responses
4. Upgrade prompt appears                    → User clicks "Sign Up"
5. User enters email + accepts terms         → Account created
6. Dashboard shows provisioning progress     → VPS creating...
7. ~6-8 minutes later: "Ready!"             → Instance URL shown
8. User clicks instance URL                  → Chat interface opens
9. Chat shows "Connected" + Telegram button  → WebSocket working
10. Main page displays 5 trial messages      → Conversation carried over
11. User sends message #6                    → Unlimited, instant response
12. User clicks "Connect Telegram"           → Setup wizard opens
13. User completes Telegram setup            → Bot responds in Telegram
```

**If all 13 steps pass, the platform works.**

---

*This document is the source of truth for all user stories and acceptance criteria.*
