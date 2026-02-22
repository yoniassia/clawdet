# SPECKIT — Clawdet Platform Specification

**Version:** 1.0  
**Date:** 2026-02-22  
**Status:** Source of Truth

---

## 1. Vision

Clawdet is a SaaS platform that gives anyone their own personal AI assistant in under 5 minutes. A visitor arrives, tries a 5-message Grok 4.2 chat, signs up with email, and receives a fully provisioned OpenClaw instance on a dedicated VPS with Telegram connectivity — all automated, zero technical knowledge required.

**One-line:** *"Your own AI, one click away."*

---

## 2. Core User Flow (The Ultimate Success Test)

```
Landing Page → Try 5 Messages → Email Signup → Provisioning → 
Chat Opens (with Telegram Connect button) → Main Page Shows 5 Messages
```

1. User visits `clawdet.com`, sees landing page with "Try Now" CTA
2. Trial chat opens — real Grok 4.2 responses, 5 message limit
3. After limit (or via header button), user signs up with email
4. System provisions a dedicated OpenClaw instance (Hetzner VPS)
5. User's chat interface opens with Telegram connect button visible
6. Main page displays the 5 trial messages carried over
7. User connects Telegram and continues chatting unlimited

---

## 3. Architecture

### 3.1 System Overview

```
┌─────────────────────────────────────────────────┐
│              clawdet.com (Next.js 15)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Landing   │ │ Trial    │ │ Email Signup     │ │
│  │ Page      │ │ Chat     │ │ + Onboarding     │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Dashboard │ │ API      │ │ Provisioner      │ │
│  │           │ │ Routes   │ │ Service          │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│                    │                              │
│              ┌─────┴─────┐                        │
│              │  SQLite    │                        │
│              │  users.db  │                        │
│              └───────────┘                        │
└─────────────────────────────────────────────────┘
         │              │              │
    ┌────┴────┐   ┌─────┴─────┐  ┌────┴─────┐
    │ Hetzner │   │ Cloudflare│  │ xAI API  │
    │ Cloud   │   │ DNS+SSL   │  │ Grok 4.2 │
    └─────────┘   └───────────┘  └──────────┘
                        │
              ┌─────────┴──────────┐
              │  user.clawdet.com  │
              │  (OpenClaw + Grok) │
              │  + Telegram Bot    │
              └────────────────────┘
```

### 3.2 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, CSS Modules |
| Backend | Next.js API Routes (Node.js) |
| Database | SQLite (MVP) → PostgreSQL (production) |
| AI Model | xAI Grok 4.2 (`grok-420-0220-5p1m-reasoning`) |
| VPS | Hetzner Cloud (cx23, Ubuntu 22.04) |
| DNS/SSL | Cloudflare (proxied, auto-SSL) |
| Auth | Email-based signup (session cookies) |
| Payments | Stripe (future — currently free beta) |
| Messaging | Telegram Bot API |
| Process Manager | PM2 |
| Reverse Proxy | Caddy (on provisioned instances) |

### 3.3 Component Breakdown

**Frontend Pages:**
- `/` — Landing page with trial chat embedded, "Sign Up" header button
- `/trial` — Standalone trial chat (5 messages, real Grok API)
- `/signup` — Email signup form
- `/signup/details` — Additional user info collection
- `/dashboard` — Post-signup instance status + provisioning progress
- `/onboarding` — Interactive getting-started checklist

**API Routes:**
- `POST /api/trial-chat` — Grok-powered trial chat (rate limited: 20 req/min/IP)
- `POST /api/auth/email/signup` — Email registration
- `GET /api/auth/me` — Session verification
- `POST /api/provisioning/start` — Trigger VPS creation
- `GET /api/provisioning/status` — Provisioning progress polling
- `POST /api/webhooks/stripe` — Payment webhook (future)
- `GET /api/stats` — Performance metrics

**Services:**
- `lib/provisioner-v2.ts` — Orchestrates: Hetzner VPS → SSH install → Cloudflare DNS
- `lib/hetzner.ts` — Hetzner Cloud API client
- `lib/cloudflare.ts` — Cloudflare DNS management
- `lib/ssh-installer-v2.ts` — Remote OpenClaw installation via SSH
- `lib/db.ts` — User/session database layer
- `lib/security.ts` — Rate limiting, input validation, security headers

---

## 4. Features

### 4.1 Trial Experience
- 5 free messages with real Grok 4.2 AI
- Session-based counter (localStorage)
- Automatic upgrade prompt after limit
- Fallback message if API fails
- Rate limited to prevent abuse

### 4.2 Email Onboarding
- Simple email signup (no OAuth complexity)
- Session management with httpOnly cookies (7-day expiry, SameSite=Strict)
- Terms acceptance
- Redirect to provisioning

### 4.3 Automated Provisioning
- Hetzner VPS creation (cx23, Helsinki)
- SSH-based OpenClaw installation (~6-8 minutes)
- Caddy reverse proxy configuration
- Cloudflare DNS subdomain (`username.clawdet.com`)
- Auto-SSL via Cloudflare proxy
- Gateway token generation and configuration
- Workspace files pre-created (AGENTS.md, SOUL.md, USER.md)
- Grok API key pre-configured
- Real-time progress tracking on dashboard

### 4.4 User Instance
- Dedicated VPS with OpenClaw + Grok 4.2
- Web chat interface at `username.clawdet.com`
- WebSocket real-time messaging
- Telegram bot connectivity
- Telegram connect button in chat UI
- Trial messages carried over to full instance
- Unlimited conversations

### 4.5 Telegram Integration
- Connect via Telegram setup wizard
- @BotFather integration instructions
- Token validation
- Chat from Telegram or web interchangeably

---

## 5. Security

### 5.1 Authentication & Sessions
- 64-character cryptographic random session tokens
- httpOnly, Secure, SameSite=Strict cookies
- 7-day session expiry
- Ownership verification middleware (`requireAuth`, `requireOwnership`)

### 5.2 API Protection
- Rate limiting: 20 req/min/IP on trial chat, 5 req/min/IP on auth
- Input sanitization on all endpoints
- Stripe webhook signature verification
- No SQL injection (parameterized queries / JSON DB for MVP)
- Error messages don't leak internals

### 5.3 HTTP Security Headers
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- XSS protection headers
- Applied via Next.js middleware globally

### 5.4 Infrastructure Security
- SSH key-only access to provisioned VPS
- Grok API key stored in environment variables only
- No hardcoded credentials in codebase
- Cloudflare proxy hides origin IPs
- Gateway tokens unique per instance

### 5.5 Known Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| API key leak | Environment-only storage, key rotation procedure |
| VPS abuse | Resource limits per instance, monitoring |
| Trial abuse | Rate limiting, session tracking |
| DDoS | Cloudflare proxy, rate limiting |

---

## 6. Scalability

### 6.1 Current Capacity (MVP)
- Single management server (clawdet.com on Hetzner)
- SQLite database (sufficient for <1000 users)
- One VPS per customer
- Shared Grok API key across instances

### 6.2 Scaling Path

**Phase 1 (0-100 users):**
- Current architecture sufficient
- Monitor API rate limits
- Manual oversight

**Phase 2 (100-1000 users):**
- Migrate SQLite → PostgreSQL
- Add provisioning queue (Redis/Bull)
- Per-customer Grok API keys
- Automated health monitoring for instances
- Database connection pooling

**Phase 3 (1000+ users):**
- Containerized provisioning (Docker Swarm / K8s)
- Multi-region Hetzner deployment
- CDN for static assets
- Horizontal scaling of management server
- Admin dashboard for fleet management
- Automated instance lifecycle (suspend/resume/delete)

### 6.3 Cost Model
| Component | Cost/User/Month |
|-----------|----------------|
| Hetzner cx23 VPS | ~€4.25 |
| Cloudflare DNS | Free |
| Grok API (estimated) | ~$2-10 (usage dependent) |
| Bandwidth | ~€0.50 |
| **Total** | **~€7-15/user/month** |

---

## 7. Data Model

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  paid BOOLEAN DEFAULT FALSE,
  provisioning_status TEXT DEFAULT 'pending', -- pending|in_progress|complete|failed
  vps_id TEXT,
  vps_ip TEXT,
  subdomain TEXT UNIQUE,
  gateway_token TEXT,
  telegram_connected BOOLEAN DEFAULT FALSE,
  trial_messages TEXT -- JSON array of trial messages to carry over
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

---

## 8. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GROK_API_KEY` / `XAI_API_KEY` | xAI Grok API access | Yes |
| `HETZNER_API_TOKEN` | VPS provisioning | Yes |
| `CLOUDFLARE_API_TOKEN` | DNS management | Yes |
| `CLOUDFLARE_ZONE_ID` | clawdet.com zone | Yes |
| `STRIPE_SECRET_KEY` | Payment processing | Future |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Future |
| `NEXT_PUBLIC_BASE_URL` | Base URL for callbacks | Yes |
| `NODE_ENV` | Environment mode | Yes |

---

## 9. Success Criteria

The platform is successful when:
1. ✅ User visits clawdet.com and chats with Grok within 3 seconds
2. ✅ Email signup completes in <30 seconds
3. ✅ VPS provisioning completes in <10 minutes
4. ✅ User's instance is accessible at `username.clawdet.com`
5. ✅ Telegram connect button visible in chat UI
6. ✅ Trial messages appear on user's main page
7. ✅ 95%+ provisioning success rate
8. ✅ <100ms API response time for cached operations

---

*This document is the source of truth for the Clawdet platform specification.*
