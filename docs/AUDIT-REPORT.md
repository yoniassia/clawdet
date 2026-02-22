# Clawdet.com — Comprehensive Codebase Audit Report

**Date:** 2026-02-22  
**Auditor:** Automated (OpenClaw subagent)  
**Scope:** Full production system audit — clawdet.com & test-new.clawdet.com

---

## 1. System Architecture Overview

```
Internet → Caddy (TLS, :443/:80)
              ├─ clawdet.com       → Next.js 15 (PM2 "clawdet-prod", :3002)
              ├─ test-new.clawdet.com → static HTML (Grok 4.2 test chat)
              ├─ www.clawdet.com   → reverse_proxy :3002
              ├─ qa.clawdet.com    → static files (DNS NOT configured ❌)
              └─ /gateway/*        → OpenClaw Gateway (:18789)

Data:  JSON files on disk (data/users.json, data/feedback.json)
Auth:  NextAuth (X/Twitter OAuth + email/password with bcrypt)
AI:    Grok (xAI) for trial chat, Anthropic key also present
Infra: Hetzner VPS provisioning, Cloudflare DNS
Pay:   Stripe (placeholder keys — not yet live)
```

**Stack:** Next.js 15.1.6 / React 19 / TypeScript / Caddy 2.10.2 / PM2 / Node 22

---

## 2. Component Status

| Component | Status | Details |
|-----------|--------|---------|
| Caddy reverse proxy | ✅ | Running, auto-TLS, 7h uptime |
| PM2 clawdet-prod | ✅ | Online, 9h uptime, 68MB RAM, 22 restarts |
| PM2 clawqa-api | ✅ | Online, 46h uptime, 69MB RAM, port 3100 |
| clawdet.com (HTTPS) | ✅ | HTTP 200, TTFB 59ms |
| test-new.clawdet.com | ✅ | HTTP 200, serves Grok 4.2 test chat |
| www.clawdet.com | ✅ | Proxied to Next.js |
| qa.clawdet.com | ❌ | **DNS NXDOMAIN** — no A/AAAA record, Caddy TLS cert failing repeatedly |
| Docker containers | ❌ | None running (no containers) |
| Database (PostgreSQL/Redis) | ❌ | **Not in use** — flat JSON files on disk |
| Stripe payments | ⚠️ | Placeholder keys only — not functional |
| X/Twitter OAuth | ✅ | Keys configured, flow operational |
| OpenClaw Gateway | ✅ | Listening on :18789 |

---

## 3. API Endpoint Tests

| Endpoint | Method | Result | Notes |
|----------|--------|--------|-------|
| `/` | GET | ✅ 200 | 8KB, cached (x-nextjs-cache: HIT) |
| `/api/trial-chat` | POST `{"message":"hello"}` | ✅ 200 | Working, uses Grok API, ~4s TTFB |
| `/api/auth/me` | GET | ✅ 200 | `{"authenticated":false,"user":null}` — correct for unauthenticated |
| `/api/admin/stats` | GET | ✅ 401 | `{"error":"Unauthorized"}` — properly protected |
| `/api/provisioning/status` | GET | ✅ 401 | `{"error":"Authentication required"}` |
| `/api/showcase/status` | GET | ✅ 200 | Returns uptime, memory stats |
| `/api/feedback` | POST `{"rating":5}` | ✅ 200 | Accepted (no auth required — by design for anonymous feedback) |
| `/api/payment/create-session` | POST | ✅ 401 | `{"error":"Not authenticated"}` |
| `/api/auth/register` | POST `{"email":"x","password":"x"}` | ✅ 400 | Validates required fields |
| `/api/signup/complete` | POST | ✅ 401 | Auth required |
| `/api/provisioning/free-beta` | POST | ✅ 401 | Auth required |
| `/api/provisioning/start` | POST `{}` | ⚠️ 400 | `{"error":"Missing userId"}` — should say "auth required" instead |

### curl Examples
```bash
# Trial chat
curl -X POST https://clawdet.com/api/trial-chat -H 'Content-Type: application/json' -d '{"message":"hello"}'

# Check auth
curl https://clawdet.com/api/auth/me

# System status
curl https://clawdet.com/api/showcase/status

# Submit feedback
curl -X POST https://clawdet.com/api/feedback -H 'Content-Type: application/json' -d '{"rating":5,"comment":"great"}'
```

---

## 4. Issues Found

### 🔴 Critical

| # | Issue | Details |
|---|-------|---------|
| 1 | **NEXTAUTH_SECRET is a shell command in .env** | Line: `NEXTAUTH_SECRET=$(openssl rand -base64 32)` — this gets evaluated as a literal string `$(openssl rand -base64 32)`, NOT executed. A second line with a static value exists, but the first line may shadow it depending on parser. |
| 2 | **API keys exposed in .env.local** | Real Grok, Anthropic, Hetzner, Cloudflare, Twitter API keys are in plaintext in the repo workspace. `.gitignore` covers `.env.local` but workspace access = key access. |
| 3 | **qa.clawdet.com DNS missing** | Caddy repeatedly fails to get TLS cert — NXDOMAIN. Spamming Let's Encrypt, could hit rate limits. |
| 4 | **JSON file database** | `data/users.json` (41 users) with no locking, no backups, no ACID. Race conditions possible under concurrent writes. |

### 🟡 Medium

| # | Issue | Details |
|---|-------|---------|
| 5 | **Stripe not configured** | All 4 Stripe keys are `*_placeholder`. Payments non-functional. |
| 6 | **22 PM2 restarts** | `clawdet-prod` has restarted 22 times — indicates instability or OOM. |
| 7 | **No swap configured** | 3.8GB RAM, 1.4GB used, 0 swap. Under load, OOM-killer will strike. |
| 8 | **File permissions too open** | `.env.local` is `644` (world-readable). Should be `600`. |
| 9 | **Feedback endpoint has no rate limit** | `/api/feedback` accepts anonymous POST with no authentication or rate limiting — abuse vector. |
| 10 | **Provisioning start leaks implementation** | Returns "Missing userId" instead of "Authentication required" for unauthenticated requests. |

### 🟢 Low

| # | Issue | Details |
|---|-------|---------|
| 11 | **Deprecated metadata warnings** | `viewport` and `themeColor` should use `viewport` export per Next.js 15 |
| 12 | **In-memory rate limiting** | Resets on every PM2 restart (22 so far). Should use persistent store. |
| 13 | **No database backups** | `skills/db-backup/backup.sh` exists but no cron evidence it runs. |

---

## 5. Security Audit Results

### ✅ Good

- **Security headers:** All present and correct
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Content-Security-Policy` — restrictive, frame-ancestors 'none'
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — camera, mic, geo denied
- **Admin endpoint protected** — returns 401 without auth
- **Auth-required endpoints** — properly gated
- **Password hashing** — bcryptjs in use
- **Input sanitization** — `lib/security.ts` has XSS prevention and rate limiting
- **.gitignore** — covers `.env*` and `data/*.json`

### ❌ Needs Fix

- `.env.local` file permissions: `644` → should be `600`
- Real API keys in workspace (Grok, Anthropic, Hetzner, Cloudflare, Twitter)
- No CSRF protection visible beyond NextAuth's built-in
- Feedback endpoint completely open (no rate limit applied)
- NEXTAUTH_SECRET double-defined (shell command + static value)

---

## 6. Performance Metrics

| Metric | Value | Rating |
|--------|-------|--------|
| Homepage TTFB | 59ms | ✅ Excellent |
| Homepage total | 59ms | ✅ Excellent |
| Homepage size | 8KB | ✅ Excellent |
| Auth API TTFB | 84ms | ✅ Good |
| Trial chat TTFB | 4.06s | ⚠️ Expected (AI API call) |
| Memory (PM2 prod) | 68MB | ✅ Good |
| Memory (system) | 1.4GB / 3.8GB (37%) | ✅ OK |
| Disk | 13GB / 38GB (34%) | ✅ OK |
| Next.js cache | HIT (static pages cached) | ✅ Good |

---

## 7. Recommendations

### Immediate (do now)

1. **Fix .env.local permissions:** `chmod 600 .env.local`
2. **Remove qa.clawdet.com from Caddyfile** or create its DNS record — stop spamming Let's Encrypt
3. **Fix NEXTAUTH_SECRET:** Remove the `$(openssl rand ...)` line, keep only the static value
4. **Add rate limiting to /api/feedback**
5. **Fix /api/provisioning/start** to return "Authentication required" for unauthenticated requests

### Short-term (this week)

6. **Configure Stripe** with real keys or remove payment routes
7. **Add swap:** `fallocate -l 2G /swapfile && mkswap /swapfile && swapon /swapfile`
8. **Investigate 22 PM2 restarts** — check `pm2 logs clawdet-prod --err --lines 100`
9. **Set up database backups** — cron job for `data/users.json`
10. **Migrate to PostgreSQL/SQLite** — JSON files won't survive concurrent load

### Medium-term (this month)

11. **Move secrets to environment/vault** — not flat files
12. **Add monitoring/alerting** — PM2 restarts, disk, memory
13. **Fix Next.js viewport deprecation warnings**
14. **Add persistent rate limiting** (Redis or SQLite-backed)
15. **Add automated health checks** — the `skills/health-monitor` exists but isn't scheduled

---

*Report generated 2026-02-22T09:27 UTC. 41 users in database. System operational with noted issues.*
