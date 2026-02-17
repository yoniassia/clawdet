# Clawdet Production Launch Checklist

**Target Launch Date:** TBD  
**Current Status:** Pre-Production Testing  
**Last Updated:** 2026-02-17

---

## 🔐 Security (CRITICAL)

- [x] Security audit completed (see SECURITY-AUDIT.md)
- [x] Rate limiting implemented on all API endpoints
- [x] Security headers configured (CSP, HSTS, etc.)
- [x] SameSite=Strict cookies for session management
- [x] Input validation on all user inputs
- [x] XSS protection implemented
- [ ] **Database migration from JSON to PostgreSQL/MySQL**
- [ ] **Stripe webhook endpoint registered in Stripe dashboard**
- [ ] **All environment variables set in production**
- [ ] **SSH keys rotated and stored in secrets manager**
- [ ] **SSL/TLS certificates verified (Cloudflare proxy)**

---

## 🌐 Infrastructure

- [x] Domain configured (clawdet.com → 188.34.197.212:18789)
- [x] Server running (Hetzner VPS)
- [x] Next.js app deployed and accessible
- [ ] **Production database setup and tested**
- [ ] **Redis/cache layer configured (optional but recommended)**
- [ ] **CDN enabled for static assets**
- [ ] **Load balancer configured (if scaling needed)**
- [ ] **Backup strategy implemented**
  - [ ] Database backups (daily automated)
  - [ ] User data backups
  - [ ] System configuration backups

---

## 🔌 API Integrations

### Grok AI
- [x] API key configured
- [x] Trial chat tested with real API
- [x] Error handling for API failures
- [ ] **Usage monitoring and alerts**
- [ ] **Rate limits verified with xAI team**

### Stripe
- [ ] **Test mode → Production mode switch**
- [ ] **Webhook endpoint registered**: `https://clawdet.com/api/webhooks/stripe`
- [ ] **Webhook secret configured**
- [ ] **Product created**: "$20/month OpenClaw Instance"
- [ ] **Test payment flow end-to-end**
- [ ] **Refund policy documented**

### X/Twitter OAuth
- [ ] **Production OAuth app created**
- [ ] **Callback URLs updated**:
  - Production: `https://clawdet.com/api/auth/x/callback`
- [ ] **Scopes verified**: tweet.read, users.read, offline.access
- [ ] **OAuth flow tested with real accounts**

### Hetzner Cloud
- [x] API token configured
- [x] VPS provisioning tested (mock mode)
- [ ] **Production API token with appropriate permissions**
- [ ] **Billing limits set** (to prevent runaway costs)
- [ ] **Server types configured**: CX11 or CPX11
- [ ] **Server regions configured** (nearest to users)

### Cloudflare
- [x] DNS API configured
- [x] Subdomain creation tested
- [ ] **All DNS records verified**
- [ ] **Proxy enabled for all customer subdomains**
- [ ] **SSL mode set to Full (Strict)**
- [ ] **Firewall rules configured**
- [ ] **Rate limiting rules at edge (optional)**

---

## 🧪 Testing

### Unit Tests
- [x] Integration test suite created (28 tests)
- [x] 25/28 tests passing
- [ ] **All critical tests passing (100%)**
- [ ] **Edge case tests added**

### End-to-End Tests
- [ ] **Trial chat flow** (5 messages → upgrade prompt)
- [ ] **Full signup flow** (X OAuth → details → payment → dashboard)
- [ ] **Payment flow** (Stripe test mode → webhook → provisioning trigger)
- [ ] **Provisioning flow** (VPS creation → DNS → OpenClaw install → handoff)
- [ ] **Error scenarios** (payment failure, VPS creation failure, DNS failure)

### Load Testing
- [ ] **Trial chat under load** (100 concurrent users)
- [ ] **API endpoints under load**
- [ ] **Database performance verified**
- [ ] **Provisioning queue tested** (multiple simultaneous provisions)

### Security Testing
- [ ] **OWASP Top 10 checklist completed**
- [ ] **SQL injection tests** (N/A for JSON DB, add for SQL DB)
- [ ] **XSS tests on all input fields**
- [ ] **CSRF tests on state-changing operations**
- [ ] **Authentication bypass attempts**
- [ ] **Rate limit verification**
- [ ] **External security scan** (securityheaders.com, etc.)

### Mobile Testing
- [x] Mobile responsive CSS implemented
- [ ] **Test on iOS Safari**
- [ ] **Test on Android Chrome**
- [ ] **Test on various screen sizes** (320px, 768px, 1024px+)

---

## 📱 User Experience

- [x] Landing page complete
- [x] Trial chat functional
- [x] Signup flow complete
- [x] Payment page complete
- [x] Dashboard with provisioning status
- [ ] **Error messages user-friendly**
- [ ] **Loading states on all async operations**
- [ ] **Success confirmations clear**
- [ ] **Help documentation available**
- [ ] **FAQ page created**

---

## 📊 Monitoring & Analytics

- [ ] **Error tracking configured** (Sentry, Rollbar, etc.)
- [ ] **Application monitoring** (uptime checks)
- [ ] **Performance monitoring** (response times, API latency)
- [ ] **Business metrics tracking**:
  - [ ] Trial chat usage
  - [ ] Signup conversions
  - [ ] Payment success rate
  - [ ] Provisioning success rate
  - [ ] Provisioning time (target: <10 minutes)
- [ ] **Alerts configured**:
  - [ ] Service downtime
  - [ ] High error rates
  - [ ] Failed provisioning
  - [ ] Payment failures
  - [ ] API rate limit hits

---

## 📧 Communications

- [ ] **Transactional emails configured**:
  - [ ] Welcome email after signup
  - [ ] Payment confirmation
  - [ ] Instance ready notification
  - [ ] Setup instructions
- [ ] **X DM notifications** (optional):
  - [ ] Instance ready DM
- [ ] **Support email setup**: support@clawdet.com
- [ ] **Refund policy documented**
- [ ] **Terms of Service finalized**
- [ ] **Privacy Policy finalized**

---

## 💰 Business Operations

- [ ] **Pricing confirmed**: $20/month
- [ ] **Billing tested**: First charge + recurring
- [ ] **Refund process documented**
- [ ] **Cancellation flow implemented**
- [ ] **Usage limits defined**:
  - [ ] Max instances per user
  - [ ] API usage limits per instance
- [ ] **Cost analysis**:
  - [ ] Hetzner VPS cost: ~€4/month per instance
  - [ ] Grok API cost: TBD (shared key for now)
  - [ ] Stripe fees: 2.9% + $0.30 per transaction
  - [ ] Profit margin verified

---

## 🚨 Incident Response

- [ ] **Incident response plan documented**
- [ ] **On-call rotation defined** (if team)
- [ ] **Escalation procedures clear**
- [ ] **Rollback procedures tested**
- [ ] **Emergency contacts list**:
  - [ ] Hetzner support
  - [ ] Cloudflare support
  - [ ] Stripe support
  - [ ] xAI support

---

## 📚 Documentation

- [ ] **User onboarding guide**
- [ ] **Setup instructions for provisioned instances**
- [ ] **Troubleshooting guide**
- [ ] **Developer documentation** (for future maintenance)
- [ ] **API documentation** (if exposing APIs)
- [ ] **README.md updated**

---

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Trial chat response time | <2s | ✅ |
| Signup flow completion | <3 minutes | ✅ |
| Payment processing | <30s | ⏳ |
| VPS provisioning | <10 minutes | ⏳ |
| Homepage load time | <1s | ✅ |
| Mobile Lighthouse score | >90 | ⏳ |
| API uptime | 99.9% | ⏳ |

---

## 🎬 Launch Day Checklist

**24 Hours Before:**
- [ ] Run full test suite
- [ ] Verify all integrations
- [ ] Backup everything
- [ ] Notify stakeholders

**Launch Time:**
- [ ] Switch Stripe to production mode
- [ ] Update all production env vars
- [ ] Restart services
- [ ] Monitor logs closely
- [ ] Test one end-to-end flow manually

**First Hour:**
- [ ] Monitor error logs
- [ ] Watch provisioning queue
- [ ] Check payment webhooks
- [ ] Verify DNS resolution

**First Day:**
- [ ] Monitor all metrics
- [ ] Respond to any user issues immediately
- [ ] Check all integrations still working
- [ ] Review cost dashboard

**First Week:**
- [ ] Gather user feedback
- [ ] Fix any critical bugs
- [ ] Optimize performance bottlenecks
- [ ] Review financial metrics

---

## 🐛 Known Issues to Fix Before Launch

From integration testing:

1. **Trial message limit edge case** - FIXED ✅
2. **OAuth API endpoint** - FIXED ✅
3. **Payment userId handling** - FIXED ✅
4. **JSON database limitations** - TO FIX ⚠️
   - Need to migrate to PostgreSQL before launch
   - Race conditions possible with concurrent writes
   - No encryption at rest

---

## ✅ Sprint 12 Completed Items

- [x] Next.js middleware for security headers
- [x] CSP (Content Security Policy) configured
- [x] Rate limiting added to auth endpoints
- [x] SameSite=Strict cookies implemented
- [x] Viewport meta tag added
- [x] Mobile responsiveness verified
- [x] Security audit document created
- [x] Launch checklist created

---

## 📝 Post-Launch TODO

- [ ] Implement admin dashboard to view all instances
- [ ] Add user dashboard features:
  - [ ] View instance status
  - [ ] Restart instance
  - [ ] View logs
  - [ ] Update billing info
- [ ] Add email notifications
- [ ] Implement analytics dashboard
- [ ] Add referral program
- [ ] Create affiliate system
- [ ] Add team/organization accounts
- [ ] Multi-instance support per user

---

**Sign-off Required:**
- [ ] Technical Lead (Security & Infrastructure)
- [ ] Business Owner (Pricing & Terms)
- [ ] Legal (Terms of Service, Privacy Policy)

**Ready for Launch:** ⏳ NOT YET

**Critical Blockers:**
1. Database migration from JSON to PostgreSQL
2. Stripe production setup
3. All environment variables in production
4. End-to-end production test

---

**Questions? Contact:** support@clawdet.com (to be set up)
