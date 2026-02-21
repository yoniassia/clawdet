# Clawdet Platform Upgrade Guide

## Overview

This guide documents how to upgrade Clawdet from v0.1.0-alpha to production-ready status.

**Current Version:** v0.1.0-alpha (with P0/P1 fixes)  
**Target Version:** v1.0.0-production  
**Estimated Time:** 2-4 hours

---

## Prerequisites

Before upgrading, ensure you have:

- [ ] SSH access to production server
- [ ] Database backup
- [ ] All environment variables documented
- [ ] Twitter OAuth credentials (if using real OAuth)
- [ ] Stripe production keys (if accepting payments)
- [ ] Rollback plan

---

## Upgrade Checklist

### Phase 1: Pre-Upgrade (30 min)

#### 1.1 Backup Current State
```bash
# Backup database
cp /root/.openclaw/workspace/clawdet/users.db /root/backups/users-$(date +%Y%m%d).db

# Backup .env.local
cp /root/.openclaw/workspace/clawdet/.env.local /root/backups/env-$(date +%Y%m%d).local

# Create git backup branch
cd /root/.openclaw/workspace/clawdet
git branch backup-$(date +%Y%m%d-%H%M)
```

#### 1.2 Document Current State
```bash
# Note current version
git log --oneline -1 > /tmp/pre-upgrade-state.txt

# Note PM2 status
pm2 status >> /tmp/pre-upgrade-state.txt

# Note running services
systemctl list-units --type=service --state=running | grep -E "caddy|openclaw" >> /tmp/pre-upgrade-state.txt
```

#### 1.3 Test Current Functionality
```bash
# Run health checks
cd /root/.openclaw/workspace/clawdet
npm run health

# Manual smoke test
curl -I https://clawdet.com
curl -I https://test-demo.clawdet.com
```

---

### Phase 2: Apply P0 Fixes (Already Done) ✅

#### 2.1 Trial Chat API
- ✅ Switched from Grok to Anthropic API
- ✅ Installed @anthropic-ai/sdk
- ✅ Tested and verified working

#### 2.2 SSO OAuth Mock Mode
- ✅ Auto-complete mock user profile
- ✅ Skip /signup/details redirect
- ✅ Direct to /checkout flow

---

### Phase 3: Apply P1 Enhancements (Already Done) ✅

#### 3.1 Test Infrastructure
- ✅ Added Vitest configuration
- ✅ Created unit tests (security, db)
- ✅ Added Playwright E2E tests
- ✅ Installed test dependencies

#### 3.2 Enhanced Health Checks
- ✅ Added advanced health check script
- ✅ Added AI message test
- ✅ Added timing measurements
- ✅ Color-coded output

---

### Phase 4: Production Hardening (2-3 hours)

#### 4.1 Configure Real OAuth (Optional)

**If using real Twitter/X OAuth:**

1. Create OAuth app at https://developer.twitter.com/
2. Get credentials:
   - Client ID
   - Client Secret
   - Callback URL: https://clawdet.com/api/auth/x/callback

3. Update `.env.local`:
```bash
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

4. Test:
```bash
# Restart
pm2 restart clawdet-prod

# Try signup flow
# Should redirect to real Twitter OAuth
```

**If keeping mock mode:**
- Current setup works for testing
- Consider adding rate limiting on mock signups
- Add monitoring for abuse

#### 4.2 Configure Production Stripe

**Update `.env.local`:**
```bash
# Replace test keys with production keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_live_...
```

**Set up webhook:**
```bash
# Configure webhook endpoint at stripe.com:
# Endpoint: https://clawdet.com/api/webhooks/stripe
# Events: checkout.session.completed, payment_intent.succeeded
```

#### 4.3 Set Up Monitoring

**Install monitoring tools:**
```bash
# Install PM2 monitoring (optional)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Set up external monitoring:**
- UptimeRobot or similar for uptime monitoring
- Sentry for error tracking (optional)
- PostHog for analytics (optional)

#### 4.4 Configure CI/CD (Optional)

**GitHub Actions example:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: npm test
      - run: npm run build
```

#### 4.5 Security Hardening

**Update security settings:**
```bash
# Enable rate limiting more strictly
# Edit lib/security.ts if needed

# Review CORS settings
# Edit next.config.js if needed

# Enable HTTPS only
# Ensure Cloudflare SSL is "Full (strict)"
```

**Audit dependencies:**
```bash
npm audit
npm audit fix
```

#### 4.6 Performance Optimization

**Enable caching:**
```bash
# Configure Cloudflare caching rules
# Cache static assets aggressively
# Cache API routes appropriately
```

**Optimize build:**
```bash
# Already using Next.js 15 optimizations
# Consider enabling SWC minification
# Review bundle size: npm run build
```

---

### Phase 5: Deploy & Verify (30 min)

#### 5.1 Deploy Updates
```bash
cd /root/.openclaw/workspace/clawdet

# Pull latest (if using git)
git pull

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Restart
pm2 restart clawdet-prod

# Verify restart
pm2 status
pm2 logs clawdet-prod --lines 20
```

#### 5.2 Run Full Health Check
```bash
npm run health

# Should see all checks pass:
# ✅ HTTP endpoints
# ✅ Gateway connectivity
# ✅ PM2 status
# ✅ Database
# ✅ AI integration test
```

#### 5.3 Manual Smoke Tests

**Trial chat:**
```bash
curl -X POST https://clawdet.com/api/trial-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","count":1}'
# Should get AI response
```

**Signup flow:**
1. Visit https://clawdet.com/signup
2. Click "Continue with X"
3. Should redirect to /checkout (mock) or Twitter (real)
4. Complete flow

**Provisioning (if testing):**
```bash
# Test with free beta check
curl https://clawdet.com/api/provisioning/free-beta
```

#### 5.4 Monitor for Issues
```bash
# Watch logs for errors
pm2 logs clawdet-prod --lines 100

# Monitor CPU/memory
pm2 monit

# Check error rate
tail -f /root/.pm2/logs/clawdet-prod-error.log
```

---

### Phase 6: Post-Upgrade (Ongoing)

#### 6.1 Update Documentation
- [ ] Update README.md with new version
- [ ] Update CHANGELOG.md
- [ ] Document any new environment variables
- [ ] Update API documentation if changed

#### 6.2 User Communication
- [ ] Announce new features (if any)
- [ ] Update pricing page (if changed)
- [ ] Send email to beta users (if applicable)

#### 6.3 Monitoring Setup
- [ ] Set up alerts for:
  - High error rate
  - Service downtime
  - High API costs
  - Database issues
- [ ] Configure weekly health reports
- [ ] Set up cost tracking

---

## Rollback Plan

If issues occur during upgrade:

### Quick Rollback (5 min)
```bash
# Restore previous version
cd /root/.openclaw/workspace/clawdet
git checkout backup-$(date +%Y%m%d)-* # Use your backup branch

# Restore .env.local
cp /root/backups/env-$(date +%Y%m%d).local .env.local

# Restore database
cp /root/backups/users-$(date +%Y%m%d).db users.db

# Rebuild and restart
npm install
npm run build
pm2 restart clawdet-prod
```

### Full Rollback (15 min)
```bash
# If quick rollback fails, restore from backup completely
# Stop service
pm2 stop clawdet-prod

# Remove current code
rm -rf /root/.openclaw/workspace/clawdet

# Restore from backup
tar -xzf /root/backups/clawdet-full-backup.tar.gz

# Restart
cd /root/.openclaw/workspace/clawdet
pm2 start clawdet-prod
```

---

## Testing Checklist

After upgrade, verify:

- [ ] Homepage loads (https://clawdet.com)
- [ ] Trial chat works (send 1-2 messages)
- [ ] Signup flow works (complete or reaches checkout)
- [ ] Health checks pass (`npm run health`)
- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] No errors in PM2 logs
- [ ] Gateway responds (test-demo instance)
- [ ] Database can read/write
- [ ] API endpoints return correct status codes

---

## Known Issues & Solutions

### Issue: Tests fail with import errors
**Solution:**
```bash
# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

### Issue: PM2 not restarting properly
**Solution:**
```bash
pm2 delete clawdet-prod
pm2 start npm --name clawdet-prod -- start
pm2 save
```

### Issue: Caddy not serving correctly
**Solution:**
```bash
# Check Caddy config
cat /etc/caddy/Caddyfile

# Reload Caddy
systemctl reload caddy
systemctl status caddy
```

### Issue: Database locked
**Solution:**
```bash
# Check for stale locks
lsof /root/.openclaw/workspace/clawdet/users.db

# Kill if needed
kill -9 <pid>
```

---

## Maintenance Schedule

**Daily:**
- Monitor error logs
- Check health status
- Review API costs

**Weekly:**
- Run full test suite
- Review analytics
- Check for dependency updates

**Monthly:**
- Update dependencies (`npm update`)
- Security audit (`npm audit`)
- Backup review & cleanup
- Performance review

---

## Support

**Issues?**
- Check logs: `pm2 logs clawdet-prod`
- Run health check: `npm run health`
- Review docs: `/root/.openclaw/workspace/clawdet/docs/`

**Emergency Contacts:**
- Platform maintainer: [Your contact]
- Hetzner support: https://console.hetzner.cloud/
- Cloudflare support: https://dash.cloudflare.com/

---

**Last Updated:** 2026-02-20  
**Version:** v0.1.0-alpha → v1.0.0-production  
**Status:** Ready for production deployment
