# Clawdet Developer Guide

**Complete technical documentation for developers**  
*Last updated: February 18, 2026*

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Component Overview](#component-overview)
- [API Reference](#api-reference)
- [Database](#database)
- [External Integrations](#external-integrations)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Monitoring & Debugging](#monitoring--debugging)
- [Contributing](#contributing)

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLAWDET.COM                          │
│                    (Next.js 15 Frontend)                    │
│                                                             │
│  ┌───────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐ │
│  │  Landing  │  │  Trial   │  │ Signup │  │ Dashboard  │ │
│  │   Page    │  │   Chat   │  │  Flow  │  │  (Status)  │ │
│  └───────────┘  └──────────┘  └────────┘  └────────────┘ │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                        │
│                                                             │
│  /api/trial-chat      - Grok AI integration (5 msg limit) │
│  /api/auth/x/*        - X/Twitter OAuth flow              │
│  /api/payment/*       - Stripe checkout + portal          │
│  /api/webhooks/stripe - Payment confirmations             │
│  /api/provisioning/*  - VPS provisioning orchestration    │
│  /api/stats           - Performance metrics               │
└────┬────────┬───────────┬────────────┬──────────┬─────────┘
     │        │           │            │          │
     ▼        ▼           ▼            ▼          ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│  xAI   │ │X API │ │ Stripe  │ │ Hetzner  │ │Cloudflare│
│  Grok  │ │OAuth │ │ Payment │ │ VPS API  │ │ DNS API  │
└────────┘ └──────┘ └─────────┘ └─────┬────┘ └────┬─────┘
                                       │           │
                                       ▼           ▼
                              ┌──────────────────────────┐
                              │   Provisioned VPS        │
                              │   • Ubuntu 22.04         │
                              │   • Node.js 22.x         │
                              │   • OpenClaw installed   │
                              │   • Port 18789           │
                              │   username.clawdet.com   │
                              └──────────────────────────┘
```

### Request Flow

#### 1. Trial Chat
```
User → Landing Page → /trial
         ↓
    POST /api/trial-chat
         ↓
    Rate Limit Check (20/min per IP)
         ↓
    Message Count Check (<5)
         ↓
    Call Grok API (grok-4-1-fast)
         ↓
    Return Response + Updated Count
```

#### 2. Authentication & Signup
```
User → Sign Up Button → /signup
         ↓
    GET /api/auth/x/login
         ↓
    Redirect to X OAuth
         ↓
    User authorizes
         ↓
    GET /api/auth/x/callback?code=xxx
         ↓
    Exchange code for tokens
         ↓
    Fetch X user profile
         ↓
    Create user record (DB)
         ↓
    Set session cookie
         ↓
    Redirect to /onboarding
```

#### 3. Payment
```
User → /checkout
         ↓
    POST /api/payment/create-checkout-session
         ↓
    Create Stripe Checkout Session ($20/month)
         ↓
    Redirect to Stripe
         ↓
    User pays
         ↓
    Stripe webhook: checkout.session.completed
         ↓
    POST /api/webhooks/stripe
         ↓
    Verify signature
         ↓
    Update user: paid=true, subscriptionId
         ↓
    Trigger provisioning
```

#### 4. Provisioning
```
Payment confirmed → Start provisioning
         ↓
    POST /api/provisioning/start
         ↓
    Status: pending → creating_vps
         ↓
    Hetzner API: Create VPS (cx23, €2.99/mo)
         ↓
    Wait for VPS ready (~30 sec)
         ↓
    Status: configuring_dns
         ↓
    Cloudflare API: Create A record
         → username.clawdet.com → VPS IP
         ↓
    Enable SSL proxy (automatic HTTPS)
         ↓
    Status: installing
         ↓
    SSH into VPS → Run provision-openclaw.sh
         • Update system
         • Install Node.js 22
         • Install OpenClaw (npm global)
         • Configure workspace
         • Start systemd service
         ↓
    Status: complete
         ↓
    Email user (future)
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **UI Components:** React 18
- **Forms:** Native forms + client-side validation

### Backend
- **Runtime:** Node.js 22 LTS
- **Framework:** Next.js API Routes
- **Language:** TypeScript
- **Session:** Cookie-based (httpOnly, secure)

### Database
- **MVP:** JSON file storage (`data/users.json`)
- **Future:** PostgreSQL (Supabase/Neon recommended)

### External Services
- **AI:** xAI Grok API (grok-4-1-fast-non-reasoning)
- **Auth:** X/Twitter OAuth 2.0
- **Payment:** Stripe Checkout + Subscriptions
- **Infrastructure:** Hetzner Cloud (VPS)
- **DNS/SSL:** Cloudflare
- **CDN:** Cloudflare (proxy enabled)

### Infrastructure
- **Hosting:** Hetzner VPS (clawdet.com)
- **Server:** Ubuntu 22.04 LTS
- **Process Manager:** PM2
- **Reverse Proxy:** Cloudflare (no local nginx)
- **Port:** 18789 (internal), 443 (external via CF)

---

## Local Development

### Prerequisites

- **Node.js** 22.x LTS ([nodejs.org](https://nodejs.org))
- **npm** or **yarn**
- **Git**
- **Code editor** (VS Code recommended)
- **Terminal** (bash/zsh/PowerShell)

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yoniassia/clawdet.git
cd clawdet

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your keys
nano .env
```

### Environment Variables

Create `.env` in project root:

```env
# === REQUIRED FOR TRIAL CHAT ===
GROK_API_KEY=xai-xxxxxxxxxxxx

# === OPTIONAL FOR TESTING ===

# X/Twitter OAuth (get from developer.twitter.com)
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/x/callback

# Stripe (test mode keys from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID=price_xxxxx

# Hetzner Cloud (for provisioning tests)
HETZNER_API_TOKEN=xxxxx

# Cloudflare (for DNS tests)
CLOUDFLARE_API_TOKEN=xxxxx
CLOUDFLARE_ZONE_ID=xxxxx

# === MOCK MODES (for local dev without real APIs) ===
MOCK_OAUTH=true           # Skip real X OAuth
MOCK_STRIPE=true          # Skip real Stripe payments
MOCK_PROVISIONING=true    # Skip real VPS creation

# === SECURITY ===
SESSION_SECRET=generate_64_char_random_string_here
ALLOWED_ORIGINS=http://localhost:3000

# === OPTIONAL ===
NODE_ENV=development
PORT=3000
```

### Running the Dev Server

```bash
# Start development server
npm run dev

# Server starts on http://localhost:3000
# Hot reload enabled
```

**Available pages:**
- `/` — Landing page
- `/trial` — Trial chat (5 messages)
- `/signup` — Signup flow (requires OAuth or MOCK_OAUTH=true)
- `/checkout` — Payment (requires Stripe or MOCK_STRIPE=true)
- `/dashboard` — User dashboard (requires login)
- `/onboarding` — Post-signup details collection

### Project Structure

```
clawdet/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                 # Landing page (/)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── trial/                   # Trial chat (/trial)
│   │   └── page.tsx
│   │
│   ├── signup/                  # Signup flow (/signup)
│   │   └── page.tsx
│   │
│   ├── onboarding/              # Post-signup (/onboarding)
│   │   └── page.tsx
│   │
│   ├── checkout/                # Payment (/checkout)
│   │   ├── page.tsx
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   │
│   ├── dashboard/               # User dashboard (/dashboard)
│   │   └── page.tsx
│   │
│   └── api/                     # API routes
│       ├── trial-chat/
│       │   └── route.ts        # POST /api/trial-chat
│       │
│       ├── auth/x/
│       │   ├── login/route.ts  # GET /api/auth/x/login
│       │   └── callback/route.ts # GET /api/auth/x/callback
│       │
│       ├── payment/
│       │   ├── create-checkout-session/route.ts
│       │   └── portal/route.ts
│       │
│       ├── webhooks/
│       │   └── stripe/route.ts # POST /api/webhooks/stripe
│       │
│       ├── provisioning/
│       │   ├── start/route.ts  # POST /api/provisioning/start
│       │   └── status/route.ts # GET /api/provisioning/status
│       │
│       └── stats/route.ts      # GET /api/stats
│
├── lib/                         # Shared utilities
│   ├── db.ts                   # Database functions (JSON file)
│   ├── auth.ts                 # Session management
│   ├── auth-middleware.ts      # Auth/authorization middleware
│   ├── grok.ts                 # Grok AI client
│   ├── stripe.ts               # Stripe client
│   ├── hetzner.ts              # Hetzner Cloud API
│   ├── cloudflare.ts           # Cloudflare DNS API
│   ├── provisioner-v2.ts       # Provisioning orchestrator
│   ├── ssh-installer-v2.ts     # SSH-based OpenClaw install
│   ├── cache.ts                # In-memory cache
│   ├── performance.ts          # Performance monitoring
│   └── rate-limit.ts           # Rate limiting
│
├── components/                  # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ChatInterface.tsx
│
├── public/                      # Static assets
│   ├── favicon.ico
│   └── images/
│
├── data/                        # JSON database
│   └── users.json              # User records
│
├── scripts/                     # Deployment scripts
│   └── provision-openclaw.sh   # VPS provisioning script
│
├── docs/                        # Documentation (legacy)
│
├── tests/                       # Test files
│   ├── test-integration.ts     # Integration tests
│   └── test-performance.sh     # Performance tests
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json
└── README.md
```

---

## Component Overview

### Frontend Components

#### Landing Page (`app/page.tsx`)
- Hero section with CTA
- Features grid
- Pricing
- CTA footer
- Responsive design (mobile-first)

#### Trial Chat (`app/trial/page.tsx`)
- Chat interface
- Message counter (5 max)
- Real Grok AI integration
- Upgrade prompt after 5 messages
- Rate limited (20 req/min per IP)

#### Dashboard (`app/dashboard/page.tsx`)
- Instance URL display
- Provisioning status tracker
- Subscription management link
- SSH credentials (future)

### Backend Services

#### Database (`lib/db.ts`)
**Current:** JSON file storage  
**Future:** PostgreSQL migration planned

```typescript
export interface User {
  id: string;                    // UUID v4
  twitterId: string;             // X user ID
  username: string;              // X username
  email: string;                 // User email
  createdAt: number;             // Unix timestamp
  sessionToken?: string;         // 64-char hex session token
  sessionCreatedAt?: number;     // Session timestamp
  paid: boolean;                 // Payment status
  subscriptionId?: string;       // Stripe subscription ID
  provisioningStatus: string;    // pending|creating_vps|configuring_dns|installing|complete|failed
  provisioningError?: string;    // Error message if failed
  serverId?: string;             // Hetzner server ID
  serverIp?: string;             // VPS IP address
  subdomain?: string;            // username.clawdet.com
}

// Key functions
export function createUser(userData: Partial<User>): User
export function getUser(userId: string): User | null
export function updateUser(userId: string, updates: Partial<User>): User
export function findUserByTwitterId(twitterId: string): User | null
export function findUserByEmail(email: string): User | null
export function getAllUsers(): User[]
```

**Cache:** 30-second TTL on reads

#### Authentication (`lib/auth.ts`, `lib/auth-middleware.ts`)

**Session Management:**
```typescript
// Generate secure session token
export function generateSessionToken(): string
  // Returns 64-char hex string (crypto.randomBytes(32))

// Create session
export function createSession(user: User): string
  // Returns session token, stores in user record

// Validate session
export function validateSession(token: string): User | null
  // Checks token + expiration (7 days)
```

**Middleware:**
```typescript
// Require authentication
export function requireAuth(request: Request): User
  // Throws 401 if not authenticated

// Require resource ownership
export function requireOwnership(authenticatedUserId: string, resourceUserId: string): null
  // Throws 403 if user doesn't own resource
```

**Session Cookie:**
- Name: `user_session`
- Value: Session token (64 chars)
- Flags: `httpOnly`, `secure` (prod), `sameSite=strict`
- Expiration: 7 days

#### Grok AI Client (`lib/grok.ts`)

```typescript
export async function callGrokAPI(
  messages: Array<{role: string; content: string}>,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string>
```

**Features:**
- Uses `grok-4-1-fast-non-reasoning` by default
- Error handling with retries
- Streaming support (future)
- Cost tracking (future)

**Rate limits:**
- External: xAI API limits (varies by plan)
- Internal: 20 requests/min per IP (trial chat)

#### Provisioning (`lib/provisioner-v2.ts`, `lib/ssh-installer-v2.ts`)

**Orchestrator** (`provisioner-v2.ts`):
```typescript
export async function provisionInstance(userId: string): Promise<void>
```

**Stages:**
1. **Create VPS** (Hetzner API)
   - Server type: cx23 (2 vCPU, 4GB RAM, 40GB SSD)
   - Location: hel1 (Helsinki)
   - OS: ubuntu-24.04
   - SSH key: Pre-loaded `clawdet-provisioning`
   - Time: ~30 seconds

2. **Configure DNS** (Cloudflare API)
   - Create A record: `username.clawdet.com` → VPS IP
   - Enable proxy (orange cloud) for SSL
   - Time: ~10 seconds

3. **Install OpenClaw** (SSH)
   - Copy `scripts/provision-openclaw.sh` to VPS
   - Execute via SSH
   - Configure workspace, start systemd service
   - Time: ~5-8 minutes

**Error Handling:**
- Automatic retries (3 attempts)
- Detailed error logging
- Cleanup on failure (delete VPS if created)
- User notification (dashboard status)

#### Rate Limiting (`lib/rate-limit.ts`)

```typescript
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean
```

**Implementation:**
- In-memory Map storage
- Automatic cleanup of expired entries
- Per-IP and per-user tracking
- Returns true if rate limit exceeded

**Limits:**
- Trial chat: 20 req/min per IP
- Auth login: 5 req/min per IP
- Dashboard: 60 req/min per user

#### Performance Monitoring (`lib/performance.ts`, `lib/cache.ts`)

**Cache** (`cache.ts`):
```typescript
export const cache = {
  set(key: string, value: any, ttlSeconds: number): void
  get<T>(key: string): T | null
  getOrSet<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T>
  delete(key: string): void
  cleanup(): void
  getStats(): { size, hits, misses, hitRate }
}
```

**Performance Tracking** (`performance.ts`):
```typescript
export function trackPerformance(operationName: string): () => void
export function measureAsync<T>(operationName: string, fn: () => Promise<T>): Promise<T>
export function getPerformanceStats(): PerformanceStats
```

**Metrics Tracked:**
- Request count per endpoint
- Average/min/max response times
- Cache hit/miss rates
- Memory usage
- Uptime

---

## API Reference

### Trial Chat

**POST** `/api/trial-chat`

Try Grok AI with 5 free messages.

**Request:**
```json
{
  "message": "What can you do?",
  "messageCount": 0
}
```

**Response:**
```json
{
  "reply": "I'm Grok, an AI assistant...",
  "messageCount": 1,
  "remainingMessages": 4
}
```

**Rate Limit:** 20 requests/min per IP

**Errors:**
- `429` — Rate limit exceeded
- `400` — Invalid message or count exceeded
- `500` — Grok API error

---

### Authentication

#### Start OAuth Flow

**GET** `/api/auth/x/login`

Redirects to X/Twitter OAuth.

**Query Parameters:**
- None

**Response:**
- `302` Redirect to `https://x.com/i/oauth2/authorize?...`

---

#### OAuth Callback

**GET** `/api/auth/x/callback?code=xxx&state=xxx`

Handles OAuth callback from X.

**Query Parameters:**
- `code` — OAuth authorization code
- `state` — CSRF protection token

**Response:**
- `302` Redirect to `/onboarding` (new user) or `/dashboard` (existing)
- Sets `user_session` cookie

**Errors:**
- `400` — Missing code/state
- `401` — Invalid code or state
- `500` — X API error

---

### Payment

#### Create Checkout Session

**POST** `/api/payment/create-checkout-session`

Creates Stripe Checkout session for $20/month subscription.

**Authentication:** Required (session cookie)

**Request:**
```json
{
  "userId": "user_abc123"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx"
}
```

**Frontend:**
```typescript
const response = await fetch('/api/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
});
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe
```

---

#### Stripe Webhook

**POST** `/api/webhooks/stripe`

Receives payment confirmations from Stripe.

**Headers:**
- `stripe-signature` — Webhook signature (verified)

**Events Handled:**
- `checkout.session.completed` — Payment successful, trigger provisioning
- `customer.subscription.deleted` — Subscription canceled (future)

**Response:**
```json
{ "received": true }
```

**Errors:**
- `400` — Invalid signature
- `500` — Processing error

---

### Provisioning

#### Start Provisioning

**POST** `/api/provisioning/start`

Manually trigger provisioning (normally automatic after payment).

**Authentication:** Required + Ownership check

**Request:**
```json
{
  "userId": "user_abc123"
}
```

**Response:**
```json
{
  "status": "started",
  "userId": "user_abc123"
}
```

---

#### Check Provisioning Status

**GET** `/api/provisioning/status?userId=user_abc123`

Get current provisioning status.

**Authentication:** Required + Ownership check

**Response:**
```json
{
  "status": "installing",
  "progress": 75,
  "message": "Installing OpenClaw...",
  "subdomain": "username.clawdet.com",
  "serverIp": "65.109.132.127"
}
```

**Status Values:**
- `pending` — Waiting to start
- `creating_vps` — Creating Hetzner VPS
- `configuring_dns` — Setting up DNS + SSL
- `installing` — Installing OpenClaw via SSH
- `complete` — Ready to use
- `failed` — Error occurred (check `provisioningError`)

---

### Stats & Monitoring

#### Get Performance Stats

**GET** `/api/stats`

Returns performance metrics.

**Authentication:** None (public)

**Response:**
```json
{
  "cache": {
    "size": 42,
    "hits": 1240,
    "misses": 180,
    "hitRate": "87.32%"
  },
  "performance": {
    "totalRequests": 3420,
    "uniqueEndpoints": 12,
    "metrics": {
      "trial-chat": {
        "count": 850,
        "avg": 45,
        "min": 12,
        "max": 230
      }
    }
  },
  "system": {
    "uptime": "2d 14h",
    "memory": {
      "heapUsed": "128 MB",
      "heapTotal": "256 MB"
    }
  }
}
```

---

## Database

### Current: JSON File Storage

**File:** `data/users.json`

**Structure:**
```json
{
  "users": [
    {
      "id": "user_abc123",
      "twitterId": "123456789",
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": 1708300000000,
      "sessionToken": "64-char-hex-string",
      "sessionCreatedAt": 1708300000000,
      "paid": true,
      "subscriptionId": "sub_xxxxx",
      "provisioningStatus": "complete",
      "serverId": "12345678",
      "serverIp": "65.109.132.127",
      "subdomain": "johndoe.clawdet.com"
    }
  ]
}
```

**Limitations:**
- No indexing (linear search)
- File locking issues with concurrent writes
- No transactions
- Not suitable for >100 users

**Mitigations:**
- In-memory caching (30s TTL)
- Single-process deployment (no horizontal scaling)
- Regular backups

### Future: PostgreSQL Migration

**Recommended:** Supabase or Neon (managed PostgreSQL)

**Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  session_token VARCHAR(64),
  session_created_at TIMESTAMP,
  paid BOOLEAN DEFAULT FALSE,
  subscription_id VARCHAR(255),
  provisioning_status VARCHAR(50) DEFAULT 'pending',
  provisioning_error TEXT,
  server_id VARCHAR(255),
  server_ip INET,
  subdomain VARCHAR(255)
);

CREATE INDEX idx_twitter_id ON users(twitter_id);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_session_token ON users(session_token);
```

**Migration Guide:**
1. Set up PostgreSQL (Supabase/Neon)
2. Run schema creation
3. Export data from `users.json`
4. Import to PostgreSQL
5. Update `lib/db.ts` to use `pg` or Prisma
6. Test thoroughly
7. Deploy

---

## External Integrations

### xAI Grok API

**Base URL:** `https://api.x.ai/v1`  
**Authentication:** Bearer token

**Models:**
- `grok-4-1-fast-non-reasoning` (default) — Fast responses
- `grok-4-1-fast` — With reasoning
- `grok-4` — Full model

**Endpoints:**
```typescript
POST https://api.x.ai/v1/chat/completions
Authorization: Bearer xai-xxxxx

{
  "model": "grok-4-1-fast-non-reasoning",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Error Handling:**
- Retry on 5xx errors (3 attempts)
- Exponential backoff
- Fallback error message for users

### X/Twitter OAuth

**Flow:** OAuth 2.0 with PKCE

**Endpoints:**
- Authorization: `https://x.com/i/oauth2/authorize`
- Token: `https://api.x.com/2/oauth2/token`
- User profile: `https://api.x.com/2/users/me`

**Scopes:**
- `tweet.read` — Read profile
- `users.read` — Get username/email

**Implementation:** `lib/auth.ts`

### Stripe

**Mode:** Test (for MVP) → Live (production)

**Products:**
- $20/month subscription
- Recurring billing
- Customer portal enabled

**Webhooks:**
- Endpoint: `https://clawdet.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.deleted`
- Signature verification: Required

**Testing:**
```bash
# Use Stripe CLI to test webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### Hetzner Cloud

**API Base:** `https://api.hetzner.cloud/v1`  
**Authentication:** Bearer token

**Server Creation:**
```bash
curl -X POST https://api.hetzner.cloud/v1/servers \
  -H "Authorization: Bearer $HETZNER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "username-clawdet",
    "server_type": "cx23",
    "image": "ubuntu-24.04",
    "location": "hel1",
    "ssh_keys": ["clawdet-provisioning"]
  }'
```

**Pricing:**
- cx23: €5.83/month (2 vCPU, 4GB RAM, 40GB SSD)

### Cloudflare

**API Base:** `https://api.cloudflare.com/client/v4`  
**Authentication:** Bearer token

**DNS Record Creation:**
```bash
curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "A",
    "name": "username",
    "content": "65.109.132.127",
    "ttl": 1,
    "proxied": true
  }'
```

**SSL:**
- Mode: Full (encrypts to origin)
- Certificate: Universal SSL (automatic)

---

## Testing

### Integration Tests

**File:** `tests/test-integration.ts`

**Run:**
```bash
npx ts-node tests/test-integration.ts
```

**Tests:**
1. Trial chat (5 messages + limit)
2. OAuth flow (mock mode)
3. Signup completion
4. Payment (mock mode)
5. Provisioning (mock mode)
6. Dashboard access

### Performance Tests

**File:** `tests/test-performance.sh`

**Run:**
```bash
bash tests/test-performance.sh
```

**Tests:**
- Landing page load (100 requests)
- Trial chat response time
- Cache hit rate
- Concurrent users

### Manual Testing

**Quick Test:**
```bash
# 1. Start dev server
npm run dev

# 2. Visit http://localhost:3000
# 3. Click "Try Now" → Trial chat
# 4. Send 5 messages
# 5. Click "Sign Up" (enable MOCK_OAUTH=true)
# 6. Complete signup
# 7. Click "Subscribe" (enable MOCK_STRIPE=true)
# 8. Check dashboard for provisioning status
```

---

## Deployment

### Production Server

**Host:** Hetzner VPS (clawdet.com)  
**IP:** 188.34.197.212  
**Port:** 18789 (internal), 443 (external via Cloudflare)  
**OS:** Ubuntu 22.04 LTS

### Deployment Steps

```bash
# 1. SSH into server
ssh root@clawdet.com

# 2. Navigate to project
cd /root/.openclaw/workspace/clawdet

# 3. Pull latest changes
git pull origin main

# 4. Install dependencies
npm install --production

# 5. Build Next.js app
npm run build

# 6. Restart service
pm2 restart clawdet

# 7. Verify
pm2 logs clawdet --lines 20
curl http://localhost:18789
```

### Environment (Production)

```env
NODE_ENV=production
PORT=18789

GROK_API_KEY=<production-key>
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
HETZNER_API_TOKEN=<production-token>
CLOUDFLARE_API_TOKEN=<production-token>
CLOUDFLARE_ZONE_ID=<zone-id>

TWITTER_CLIENT_ID=<production-client-id>
TWITTER_CLIENT_SECRET=<production-client-secret>
TWITTER_CALLBACK_URL=https://clawdet.com/api/auth/x/callback

SESSION_SECRET=<64-char-random-string>
ALLOWED_ORIGINS=https://clawdet.com

MOCK_OAUTH=false
MOCK_STRIPE=false
MOCK_PROVISIONING=false
```

### Process Management (PM2)

```bash
# Start
pm2 start npm --name clawdet -- start

# Restart
pm2 restart clawdet

# Stop
pm2 stop clawdet

# Logs
pm2 logs clawdet

# Monitor
pm2 monit

# Startup script (auto-start on reboot)
pm2 startup
pm2 save
```

---

## Configuration

### Next.js Config (`next.config.js`)

```javascript
module.exports = {
  reactStrictMode: true,
  
  // Custom server port
  port: process.env.PORT || 3000,
  
  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  
  // Image optimization
  images: {
    domains: ['clawdet.com'],
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};
```

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Monitoring & Debugging

### Health Checks

```bash
# Application health
curl https://clawdet.com/api/stats

# Service status
ssh root@clawdet.com 'pm2 status'

# System resources
ssh root@clawdet.com 'free -m && df -h'
```

### Logs

```bash
# Application logs
ssh root@clawdet.com
pm2 logs clawdet

# System logs
journalctl -xe

# Nginx logs (if using)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Debugging

**Enable verbose logging:**
```env
DEBUG=*
LOG_LEVEL=debug
```

**Performance profiling:**
```bash
# Check stats endpoint
curl https://clawdet.com/api/stats | jq

# Monitor in real-time
watch -n 5 'curl -s https://clawdet.com/api/stats | jq .performance'
```

---

## Contributing

### Getting Started

1. Fork repository
2. Clone your fork
3. Create feature branch: `git checkout -b feature/amazing-feature`
4. Make changes
5. Test locally: `npm run test`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open Pull Request

### Code Style

- **TypeScript** for all code
- **ESLint** for linting: `npm run lint`
- **Prettier** for formatting
- Follow existing patterns

### Commit Messages

```
feat: Add email notifications
fix: Resolve provisioning timeout
docs: Update API documentation
refactor: Simplify rate limiting logic
test: Add integration tests for payment
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

---

## Additional Resources

- **README:** [README.md](./README.md)
- **User Guide:** [USER-GUIDE.md](./USER-GUIDE.md)
- **Admin Guide:** [ADMIN-GUIDE.md](./ADMIN-GUIDE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Security:** [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)
- **Performance:** [PERFORMANCE.md](./PERFORMANCE.md)

---

**Questions?** Open an issue or contact support@clawdet.com

---

*Last updated: February 18, 2026*  
*For contributing guidelines, see [README.md#contributing](./README.md#contributing)*
