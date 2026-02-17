# Clawdet Launch Checklist

Complete this checklist before launching Clawdet to production.

## 🔐 Security

### Environment & Secrets
- [ ] All API keys stored in `.env.local` (not in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] Production API keys (not test keys) configured
- [ ] Stripe webhook secret matches production endpoint
- [ ] X OAuth credentials match production domain
- [ ] Server SSH keys rotated and secured

### Application Security
- [ ] HTTPS enforced (no HTTP access allowed)
- [ ] HttpOnly + Secure cookies enabled
- [ ] Content-Security-Policy headers configured
- [ ] CSRF protection enabled (SameSite=strict)
- [ ] Rate limiting active on API endpoints
- [ ] Input validation on all forms
- [ ] Session tokens use crypto.randomBytes (64 chars)
- [ ] Authentication middleware protects sensitive routes
- [ ] Webhook signature verification working

### Audit
- [ ] Run `npm audit` and fix critical/high issues
- [ ] Review [SECURITY-AUDIT.md](./docs/SECURITY-AUDIT.md)
- [ ] Test unauthorized access (should be blocked)
- [ ] Verify session expiration (7 days max)
- [ ] Check for exposed sensitive data in client code

---

## 🧪 Testing

### Functional Testing
- [ ] Trial chat works (5-message limit enforced)
- [ ] X OAuth flow completes successfully
- [ ] Mock OAuth works for testing
- [ ] Signup form validation working
- [ ] Stripe checkout redirects correctly
- [ ] Stripe test payment processes
- [ ] Webhook triggers provisioning
- [ ] VPS creation succeeds (test with mock mode)
- [ ] SSH installation completes
- [ ] DNS record created correctly
- [ ] Subdomain resolves and has SSL
- [ ] Dashboard shows correct provisioning status
- [ ] End-to-end flow works without errors

### Integration Tests
- [ ] Run `npm run test:integration`
- [ ] All critical tests passing (25/28+ expected)
- [ ] Fix any new test failures
- [ ] Test results documented

### Performance Testing
- [ ] Run `bash test-performance.sh`
- [ ] Cache hit rate >60%
- [ ] API response times <500ms (cached)
- [ ] Trial chat responds in <2s
- [ ] No memory leaks during load test
- [ ] Review [PERFORMANCE.md](./docs/PERFORMANCE.md)

### Manual Testing
- [ ] Test on Chrome desktop
- [ ] Test on Firefox desktop
- [ ] Test on Safari (Mac/iOS)
- [ ] Test on mobile (responsive design)
- [ ] Test with slow network (3G throttling)
- [ ] Test with JavaScript disabled (graceful degradation)

---

## 🌐 Infrastructure

### Domain & DNS
- [ ] Domain registered and active (clawdet.com)
- [ ] DNS pointed to production server IP
- [ ] Cloudflare account configured
- [ ] Cloudflare API token has correct permissions
- [ ] Zone ID and Account ID in `.env.local`
- [ ] Test subdomain creation (username.clawdet.com)
- [ ] Verify DNS propagation (<15 min)
- [ ] SSL working via Cloudflare proxy (orange cloud)

### Server Setup
- [ ] Production VPS provisioned (Hetzner or similar)
- [ ] Server accessible via SSH
- [ ] Firewall configured (allow 80, 443, 22 only)
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] PM2 installed globally
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (via Cloudflare or Certbot)

### Application Deployment
- [ ] Repository cloned to server
- [ ] Dependencies installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] `.env.local` configured with production values
- [ ] PM2 process started (`pm2 start npm --name clawdet -- start`)
- [ ] PM2 auto-start configured (`pm2 save && pm2 startup`)
- [ ] Nginx reverse proxy configured
- [ ] Logs accessible (`pm2 logs clawdet`)

---

## 💳 Payment Setup

### Stripe Configuration
- [ ] Stripe account in production mode (not test)
- [ ] Product created: "OpenClaw Instance - $20/month"
- [ ] Webhook endpoint added: `https://clawdet.com/api/webhooks/stripe`
- [ ] Webhook events subscribed:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- [ ] Webhook signing secret in `.env.local`
- [ ] Test webhook delivery (should return 200 OK)
- [ ] Stripe publishable key in `.env.local`
- [ ] Payment flow tested with real card (then refunded)

### Billing
- [ ] Bank account connected to Stripe
- [ ] Tax settings configured (if applicable)
- [ ] Email templates customized
- [ ] Refund policy documented
- [ ] Cancellation flow documented

---

## 🖥️ VPS Provisioning

### Hetzner Cloud
- [ ] Hetzner account created
- [ ] API token generated and in `.env.local`
- [ ] Billing method added
- [ ] Sufficient credits/budget for launch
- [ ] Server type selected (CX11 recommended)
- [ ] Datacenter location chosen (nbg1, fsn1, or hel1)
- [ ] SSH key added to Hetzner account
- [ ] Test VPS creation (then delete)

### Provisioning Workflow
- [ ] SSH key generated for VPS access
- [ ] cloud-init script validated
- [ ] OpenClaw installation script tested
- [ ] Grok API key configured for instances
- [ ] DNS automation tested
- [ ] Full provisioning tested end-to-end
- [ ] Rollback plan documented for failures

---

## 📱 OAuth & Integrations

### X (Twitter) OAuth
- [ ] X Developer account active
- [ ] App created at [developer.twitter.com](https://developer.twitter.com)
- [ ] OAuth 2.0 enabled
- [ ] Callback URL: `https://clawdet.com/api/auth/x/callback`
- [ ] Client ID and Secret in `.env.local`
- [ ] App permissions: Read user profile
- [ ] Test OAuth flow from production domain
- [ ] Mock mode works for testing without real OAuth

### Grok API (xAI)
- [ ] Grok API key obtained from xAI
- [ ] API key in `.env.local`
- [ ] Quota sufficient for expected usage
- [ ] Test API call: `grok-2-1212` model
- [ ] Billing alerts set up
- [ ] Rate limits understood

---

## 📊 Monitoring & Logs

### Application Monitoring
- [ ] PM2 monitoring active (`pm2 monit`)
- [ ] Performance metrics endpoint working (`/api/stats`)
- [ ] Cache statistics tracked
- [ ] Response times logged
- [ ] Error tracking configured
- [ ] Uptime monitoring set up (e.g., UptimeRobot)
- [ ] Alerts configured for downtime

### Log Management
- [ ] PM2 logs accessible (`pm2 logs clawdet`)
- [ ] Nginx access logs rotation configured
- [ ] Nginx error logs monitored
- [ ] Provisioning logs stored per-user
- [ ] Log retention policy defined (30 days recommended)
- [ ] Sensitive data not logged (API keys, passwords)

### Metrics to Track
- [ ] Trial chat usage (messages per day)
- [ ] Signup conversion rate
- [ ] Payment success rate
- [ ] Provisioning success rate
- [ ] Average provisioning time
- [ ] DNS propagation time
- [ ] Active subscriptions
- [ ] Churn rate

---

## 📄 Documentation

### User-Facing
- [ ] Landing page clear and compelling
- [ ] "How it works" section accurate
- [ ] Pricing clearly displayed
- [ ] FAQ page created (optional but recommended)
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Contact information visible
- [ ] User guide linked from dashboard

### Internal Documentation
- [ ] README.md complete and accurate
- [ ] ADMIN-GUIDE.md up to date
- [ ] TROUBLESHOOTING.md covers common issues
- [ ] BUILD-PLAN.md reflects current state
- [ ] Architecture diagram included
- [ ] Runbook for common operations
- [ ] Disaster recovery plan documented

---

## 🚀 Launch Day

### Pre-Launch (T-24 hours)
- [ ] All checklist items above completed
- [ ] Backup of database created
- [ ] Rollback plan prepared
- [ ] Team notified of launch time
- [ ] Support email monitored
- [ ] Status page prepared (optional)

### Launch (T-0)
- [ ] Final smoke test (trial → signup → payment → provision)
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Watch PM2 logs for errors
- [ ] Monitor Stripe webhook deliveries
- [ ] Check first real signup completes successfully
- [ ] Verify DNS propagation for first user

### Post-Launch (T+24 hours)
- [ ] Review error logs
- [ ] Check provisioning success rate
- [ ] Verify all webhooks processing
- [ ] Monitor server load
- [ ] Respond to any support requests
- [ ] Track key metrics (signups, payments, provisions)

---

## 🎯 Success Metrics

After 24 hours, evaluate:

**Technical Health:**
- [ ] Uptime >99.5%
- [ ] Provisioning success rate >95%
- [ ] No critical errors in logs
- [ ] Average provisioning time <10 minutes
- [ ] DNS propagation <15 minutes

**Business Metrics:**
- [ ] X signups completed
- [ ] Y payments processed
- [ ] Z instances provisioned
- [ ] Support requests handled within 24h
- [ ] No refund requests

**User Feedback:**
- [ ] Collect feedback from first users
- [ ] Review any support tickets
- [ ] Monitor social media mentions
- [ ] Check for bugs reported

---

## 🐛 Common Issues & Fixes

If something goes wrong during launch:

### Application Won't Start
```bash
pm2 delete clawdet
pm2 start npm --name "clawdet" -- start
pm2 logs clawdet
```

### Stripe Webhooks Not Working
1. Check webhook URL is accessible from internet
2. Verify signing secret matches
3. Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Provisioning Failing
1. Check Hetzner API token is valid
2. Verify account has sufficient credits
3. Test SSH connection to newly created VPS
4. Review provisioning logs: `cat data/provisioning-<username>.log`

### High Memory Usage
```bash
pm2 restart clawdet
# Add swap if needed:
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## 📞 Emergency Contacts

Keep these handy during launch:

- **Hetzner Support**: [support.hetzner.com](https://support.hetzner.com)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Cloudflare Support**: [support.cloudflare.com](https://support.cloudflare.com)
- **X/Twitter API Support**: [developer.twitter.com/support](https://developer.twitter.com/support)

---

## ✅ Final Approval

Before going live:

- [ ] Technical lead reviewed checklist
- [ ] All critical items completed
- [ ] Rollback plan tested
- [ ] Support team briefed
- [ ] **GO / NO-GO decision made**

---

**Signature:** ________________________  
**Date:** ___________________________  
**Launch Time:** ____________________

---

*Good luck with the launch! 🚀*

*Last Updated: February 2026*
