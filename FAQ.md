# Clawdet FAQ (Frequently Asked Questions)

Quick answers to common questions about Clawdet.

---

## General Questions

### What is Clawdet?

Clawdet is a SaaS platform that provisions personal AI assistant instances powered by OpenClaw and Grok AI. Each user gets their own dedicated server with a private AI assistant.

### How is Clawdet different from ChatGPT or other AI chatbots?

- **Dedicated resources**: You get your own server, not shared resources
- **Full control**: Customize your AI's personality, memory, and capabilities
- **Task automation**: Your assistant can execute commands, manage files, and run scheduled tasks
- **Privacy**: Your conversations and data stay on your private instance
- **Extensibility**: Add skills, integrations, and custom tools

### Is my data private?

Yes! Your data is stored on your dedicated VPS instance. We do not access, store, or train models on your conversations. Your instance is completely isolated from other users.

### What's included in the $20/month plan?

- Dedicated Hetzner VPS (CX11: 2GB RAM, 1 vCPU, 20GB SSD)
- OpenClaw pre-installed and configured
- Grok 4.2 API integration
- Your own subdomain: `yourusername.clawdet.com`
- SSL certificate (auto-renewing)
- 24/7 uptime
- Email support

---

## Trial & Signup

### Do I need to sign up to try Clawdet?

No! Click "Try Now" on the homepage for a 5-message free trial with real Grok AI. No credit card or registration required.

### Why do I need to sign in with X (Twitter)?

We use X OAuth for secure, passwordless authentication. It's fast, secure, and allows us to:
- Use your X username for your subdomain
- Send you optional notifications via X DM
- Provide easy account recovery

We do NOT post on your behalf or access your DMs without explicit permission.

### Can I sign up without X?

Currently, X OAuth is the primary authentication method. We're considering adding email/password login in the future based on user feedback.

### What if I don't have an X account?

You can create a free X account at [x.com/signup](https://x.com/i/flow/signup) in just a few minutes. No phone number required for basic accounts.

---

## Payment & Billing

### What payment methods do you accept?

We use Stripe, which accepts:
- Credit cards (Visa, Mastercard, Amex, Discover, etc.)
- Debit cards
- Apple Pay / Google Pay (where available)

### Is my payment information secure?

Absolutely! All payment processing is handled by Stripe, a PCI DSS Level 1 compliant payment processor. We never see or store your full card details.

### How does billing work?

- **First month**: Charged immediately upon signup ($20)
- **Recurring**: Auto-renewed monthly on your signup date
- **Cancellation**: Cancel anytime from your dashboard
- **Refunds**: 7-day money-back guarantee, no questions asked

### Can I get a refund?

Yes! If you're not satisfied within the first 7 days, contact support for a full refund. After 7 days, we prorate refunds based on unused days.

### What happens if my payment fails?

- You'll receive an email notification
- Your instance remains active for 3 days (grace period)
- After 3 days, your instance is suspended
- After 7 days, your instance is deleted (data backed up for 30 days)

### Can I upgrade or downgrade my plan?

Currently, we offer one plan tier. As we grow, we'll add options for more powerful instances (more CPU, RAM, storage). Existing customers will be grandfathered into current pricing.

---

## Provisioning & Setup

### How long does provisioning take?

Typically 5-10 minutes:
- VPS creation: 2-3 minutes
- DNS setup: 1-2 minutes
- OpenClaw installation: 3-5 minutes

If it takes longer than 15 minutes, something may be wrong. Contact support.

### What if provisioning fails?

If provisioning fails, you'll see an error message on your dashboard. Common causes:
- Hetzner Cloud API temporarily unavailable
- DNS propagation delays
- Network issues

We'll automatically retry, and you won't be charged if provisioning fails. Contact support if the issue persists.

### Can I choose my server location?

Currently, all instances are provisioned in Hetzner's Falkenstein (Germany) datacenter. We plan to add location options (US, Asia) in the future.

### Can I access my VPS directly?

Yes! Your dashboard includes SSH credentials. You have full root access to customize your instance as you see fit.

### What if I break something on my instance?

You have full control, which means you can accidentally break things. If you need help recovering:
1. Contact support with details of what happened
2. We can help restore from backups (if configured)
3. Worst case: we can re-provision your instance

**Pro tip**: Set up automated backups via Hetzner or your own backup solution!

---

## Using Your Instance

### How do I access my AI assistant?

Your OpenClaw instance can be accessed via:
- Web interface: `https://yourusername.clawdet.com`
- Telegram bot (if configured)
- API endpoints (for developers)

### Can I use my own Grok API key?

Yes! By default, your instance uses our shared Grok API key. To use your own:
1. SSH into your VPS
2. Edit `/root/.openclaw/config.json`
3. Add your Grok API key under `providers`
4. Restart: `openclaw gateway restart`

### Can I connect other AI models?

Yes! OpenClaw supports multiple AI providers:
- Grok (xAI)
- Claude (Anthropic)
- GPT-4 (OpenAI)
- Gemini (Google)
- Local models (Ollama)

Edit your config to add API keys for other providers.

### What skills/integrations are available?

Your OpenClaw instance comes with:
- File management
- Web browsing
- Code execution
- Memory/recall
- Cron jobs

You can add skills for:
- X/Twitter automation
- Email
- GitHub
- Slack/Discord
- And more!

See OpenClaw documentation for full list.

### Is my assistant always running?

Yes! Your instance runs 24/7 as a systemd service. If it crashes, it auto-restarts within seconds.

### Can I customize my AI's personality?

Absolutely! Edit these files on your instance:
- `AGENTS.md` - Define your AI's behavior and style
- `USER.md` - Tell your AI about you
- `MEMORY.md` - Store long-term context

Your AI reads these files on every session to maintain consistency.

---

## Technical Questions

### What are the server specs?

Default plan includes:
- **CPU**: 1 vCPU (AMD or Intel)
- **RAM**: 2GB
- **Storage**: 20GB SSD
- **Network**: 20TB monthly bandwidth
- **OS**: Ubuntu 22.04 LTS
- **Location**: Hetzner Falkenstein, Germany

### Can I upgrade my server specs?

Not yet, but we're working on it! Future plans include:
- Medium tier: 4GB RAM, 2 vCPUs
- Pro tier: 8GB RAM, 4 vCPUs
- Custom tiers: Bring your own requirements

### What ports are open on my instance?

By default:
- **Port 80**: HTTP (redirects to HTTPS)
- **Port 443**: HTTPS (OpenClaw web interface)
- **Port 22**: SSH (secured with key authentication)

Your instance is behind Cloudflare's proxy for DDoS protection.

### Can I install other software on my VPS?

Yes! You have full root access. Install whatever you need:
```bash
apt install postgresql redis-server docker.io
```

Just be aware that additional software may consume resources.

### How do backups work?

Currently, backups are NOT automatic. We recommend:
1. **Hetzner Snapshots**: €0.01/GB/month, taken manually or via API
2. **Custom backups**: Set up your own backup solution (rsync, Borg, etc.)
3. **OpenClaw memory exports**: Your conversations can be exported as files

We're working on automated daily backups as an add-on feature.

### What happens if my server goes down?

- **Hardware failure**: Hetzner will automatically migrate your instance to working hardware
- **Software crash**: OpenClaw auto-restarts via systemd
- **Network issues**: Cloudflare provides DDoS protection and redundancy

Uptime guarantee: 99.5% (excludes planned maintenance)

### Can I migrate my instance later?

Yes, you can:
1. Export your workspace files (via SSH or rsync)
2. Download your OpenClaw config
3. Set up a new instance elsewhere
4. Import your data

OpenClaw is open source, so you're never locked in!

---

## Account Management

### How do I cancel my subscription?

1. Log in to your dashboard
2. Go to Account Settings
3. Click "Cancel Subscription"
4. Confirm cancellation

Your instance will remain active until the end of your billing period.

### What happens to my data after cancellation?

- **Immediate**: Your instance becomes read-only
- **7 days**: Billing stops, no further charges
- **30 days**: Your VPS is deleted, but we keep a backup
- **60 days**: All backups are permanently deleted

You can export your data anytime before deletion.

### Can I reactivate after canceling?

Yes! Within 30 days, we can restore your instance from backup. After 30 days, you'll need to provision a new instance (but you can still use the same subdomain if available).

### How do I change my email or X account?

Contact support to update your email. Changing your X account requires re-authentication (which may change your subdomain).

---

## Troubleshooting

### My trial chat isn't working

**Possible causes:**
- Browser issues: Try clearing cache or using incognito mode
- Ad blockers: Disable for clawdet.com
- Network: Check your internet connection

**Solutions:**
1. Refresh the page (Ctrl+F5)
2. Try a different browser
3. Check browser console for errors (F12 → Console)

### I can't log in with X

**Possible causes:**
- Cookies disabled
- X account suspended
- OAuth permissions denied

**Solutions:**
1. Enable cookies (especially third-party cookies)
2. Verify your X account is active
3. Re-authorize the OAuth connection

### My payment failed

**Common reasons:**
- Insufficient funds
- Card declined by bank
- Incorrect billing address

**Solutions:**
1. Check with your bank
2. Try a different card
3. Use PayPal (if available)
4. Contact Stripe support

### My instance isn't loading

**Checks:**
1. Wait 2-3 minutes for DNS to propagate
2. Make sure you're using HTTPS, not HTTP
3. Clear browser cache
4. Try accessing from a different network

If still not working after 15 minutes, contact support.

### I forgot my SSH password

Your instance uses SSH key authentication, not passwords. If you lost your SSH key:
1. Contact support
2. We can add a new SSH key to your instance
3. Or we can reset your instance (data will be lost unless backed up)

---

## Policies & Legal

### What's your refund policy?

7-day money-back guarantee. No questions asked. After 7 days, prorated refunds based on unused time.

### What's your data retention policy?

- **Active instances**: Data retained indefinitely
- **Canceled instances**: 30-day backup retention
- **Deleted instances**: Immediate deletion, no recovery

We do not access, analyze, or train models on your instance data.

### Do you collect usage analytics?

We collect minimal analytics:
- Page views (anonymized)
- API response times (for performance monitoring)
- Error logs (for debugging)

We do NOT collect or analyze your conversations with your AI.

### Can I run Clawdet for commercial use?

Yes! Your Clawdet instance can be used for:
- Business automation
- Client services
- Research and development
- Commercial products

Just follow our Terms of Service (no illegal activity, spam, etc.).

---

## Future Features

### What's on the roadmap?

Coming soon:
- **Email/password authentication** (alternative to X OAuth)
- **Multiple AI models** (Claude, GPT-4, Gemini)
- **Larger instance tiers** (more CPU, RAM, storage)
- **Automated backups** (daily snapshots)
- **Team accounts** (multiple users per instance)
- **API access** (programmatic instance management)
- **Mobile app** (iOS/Android)

Want something else? Let us know!

### Can I request features?

Absolutely! We'd love your feedback:
- Email: support@clawdet.com
- X: @clawdet
- GitHub Issues: Submit feature requests

We prioritize features based on user demand.

---

## Still Have Questions?

Contact us:
- **Email**: support@clawdet.com
- **X**: [@clawdet](https://x.com/clawdet)
- **Documentation**: [clawdet.com/docs](https://clawdet.com/docs)

We typically respond within 24 hours (usually much faster!).

---

*Last updated: February 17, 2026*
