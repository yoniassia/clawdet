# UX & Frontend Testing Report

**Date:** 2026-02-22  
**Tester:** Automated (subagent)  
**Sites:** clawdet.com, test-new.clawdet.com

---

## 1. Test Matrix

| # | Test Scenario | clawdet.com | test-new.clawdet.com | Status |
|---|--------------|-------------|---------------------|--------|
| 1 | HTTPS GET (200) | ✅ 200 | ✅ 200 | PASS |
| 2 | www subdomain | ✅ 200 (same content) | N/A | PASS |
| 3 | HTTP→HTTPS redirect | ✅ 308 redirect | Not tested | PASS |
| 4 | 404 handling | ✅ Returns 404 | N/A | PASS |
| 5 | Viewport meta tag | ✅ Present | ✅ Present | PASS |
| 6 | Page title | ✅ "Clawdet - Your AI Companion" | ✅ "Grok 4.2 Test" | PASS |
| 7 | Chat input present | ✅ textarea + send button | ✅ input + send button | PASS |
| 8 | Send button disabled initially | ✅ `disabled` attr | ✅ `disabled` attr | PASS |
| 9 | Trial counter displayed | ✅ "0/5 free messages" | N/A (no trial) | PASS |
| 10 | Feature cards | ✅ 3 cards rendered | N/A | PASS |
| 11 | Sign Up with X button | ✅ Present with SVG icon | N/A | PASS |
| 12 | Feedback button | ✅ Fixed position 💬 | N/A | PASS |
| 13 | CSP header | ✅ Comprehensive | ❌ Missing | MIXED |
| 14 | Security headers | ✅ Full suite | ⚠️ Minimal | MIXED |
| 15 | OPTIONS/POST blocked | ✅ 405 | Not tested | PASS |

## 2. Performance Benchmarks

### clawdet.com (Next.js SSR, cached)
| Metric | Run 1 | Run 2 | Run 3 | Avg |
|--------|-------|-------|-------|-----|
| TTFB | 56ms | 49ms | 52ms | **52ms** |
| Total | 56ms | 50ms | 52ms | **53ms** |
| Size | 8,020 bytes | — | — | — |

### test-new.clawdet.com (static HTML)
| Metric | Run 1 | Run 2 | Run 3 | Avg |
|--------|-------|-------|-------|-----|
| TTFB | 61ms | 42ms | 41ms | **48ms** |
| Total | 61ms | 42ms | 41ms | **48ms** |
| Size | 10,635 bytes | — | — | — |

**Verdict:** Both sites are extremely fast (<100ms TTFB). clawdet.com benefits from Next.js caching (`x-nextjs-cache: HIT`).

## 3. Mobile/Responsive Testing

### Viewport Configuration
- **clawdet.com:** `<meta name="viewport" content="width=device-width, initial-scale=1"/>` ✅
- **test-new.clawdet.com:** `<meta name="viewport" content="width=device-width, initial-scale=1.0">` ✅

### CSS Analysis
- **clawdet.com:** Uses CSS modules (`home_container__eduTK`, etc.) via Next.js. Layout uses flexbox. Chat container and features section should stack on mobile.
- **test-new.clawdet.com:** Uses `min-height: 100vh`, `flex-direction: column`, `padding: 20px`. Message bubbles use `max-width: 85%`. Input area uses `flex` with `gap: 12px`. Should be mobile-friendly by default.

### Observations
- Both sites use system font stacks (`-apple-system, BlinkMacSystemFont, ...`) — good for mobile performance
- No horizontal scroll issues detected in markup
- test-new.clawdet.com uses fixed px values (e.g., `font-size: 24px`, `padding: 20px`) — consider using responsive units for very small screens

## 4. WebSocket Connection Tests

### clawdet.com
- **Endpoint:** `/api/chat` → 404 (no WebSocket endpoint found at this path)
- **Architecture:** Appears to use Next.js API routes. Chat likely uses REST/SSE rather than raw WebSocket, or the WS endpoint path differs.
- **CSP `connect-src`:** `'self' https://api.x.ai https://api.stripe.com https://api.cloudflare.com https://api.hetzner.cloud`

### test-new.clawdet.com
- **Endpoint:** `wss://{host}/gateway/` → **200** (WebSocket upgrade available)
- **Protocol:** Custom JSON-RPC style with `connect` method, protocol version 3
- **Features:** Session management, streaming responses, auto-reconnect (3s delay)
- **Client identifies as:** `clawdet-web/0.1`

## 5. SSL/TLS Verification

| Property | clawdet.com | test-new.clawdet.com |
|----------|-------------|---------------------|
| SSL Verify | ✅ 0 (valid) | ✅ 0 (valid) |
| Issuer | Let's Encrypt E8 | Let's Encrypt E8 |
| Not Before | 2026-02-17 | 2026-02-22 |
| Not After | 2026-05-18 | 2026-05-23 |
| SAN | DNS:clawdet.com | DNS:test-new.clawdet.com |
| HSTS | ✅ `max-age=31536000; includeSubDomains` | ❌ Missing |
| HTTP/2 | ✅ | ✅ |
| HTTP/3 | ✅ (`alt-svc: h3=":443"`) | ✅ (`alt-svc: h3=":443"`) |
| Server | Caddy (via header) | Caddy |

**⚠️ Note:** clawdet.com cert SAN only covers `clawdet.com` — does NOT cover `www.clawdet.com`. The www subdomain currently works (likely Caddy auto-cert) but should be verified.

## 6. Issues Found & Recommendations

### 🔴 Critical
None found.

### 🟡 Medium
1. **test-new.clawdet.com missing security headers** — No CSP, no HSTS, no X-Frame-Options, no X-Content-Type-Options. Should match clawdet.com's security posture.
2. **test-new.clawdet.com cache headers say no-cache** — `Cache-Control: no-cache, no-store, must-revalidate`. Fine for a test instance, but be aware for production.

### 🟢 Low / Recommendations
3. **clawdet.com CSP allows `unsafe-inline` and `unsafe-eval`** for scripts — Consider tightening with nonces/hashes when feasible.
4. **No `lang` attribute on test-new.clawdet.com** — `<html>` lacks `lang="en"`. Add for accessibility.
5. **test-new.clawdet.com uses fixed pixel sizes** — Consider responsive units for sub-360px screens.
6. **clawdet.com feedback button** uses inline styles — Low priority but could be moved to CSS module.
7. **www.clawdet.com SSL SAN coverage** — Verify the cert covers `www` subdomain explicitly.
8. **No favicon detected** on either site (not checked explicitly, but no `<link rel="icon">` in clawdet.com HTML).

## 7. Accessibility Notes

### clawdet.com
- ✅ `<html lang="en">` present
- ✅ Semantic HTML: `<h1>`, `<h3>`, `<p>`, `<textarea>`, `<button>`
- ✅ Feedback button has `aria-label="Send feedback"`
- ⚠️ Send button (`→`) — no `aria-label`; screen readers will just read "→"
- ⚠️ Sign Up button uses inline SVG (X logo) — has no `aria-label` on the SVG itself, though button text "Sign Up with X" is sufficient
- ⚠️ Feature icons (🔍, 💬, 🚀) are decorative emoji in divs — should have `aria-hidden="true"` or `role="img"` with labels

### test-new.clawdet.com
- ❌ Missing `<html lang="en">`
- ⚠️ Uses `<div>` for message containers — consider `role="log"` on messages container and `role="status"` on connection status
- ⚠️ No ARIA attributes on any elements
- ✅ Input has `placeholder` text
- ✅ Button text is descriptive ("Send")

---

*Report generated 2026-02-22T09:27 UTC*
