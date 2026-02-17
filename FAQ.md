# Clawdet FAQ

Frequently Asked Questions about Clawdet — your personal AI assistant platform.

---

## General Questions

### What is Clawdet?

Clawdet is a service that gives you your own personal AI assistant running 24/7 in the cloud. For $20/month, you get:
- A dedicated cloud server (Hetzner VPS)
- OpenClaw AI assistant software pre-installed
- Grok AI API access included
- Your own subdomain with SSL
- Full root access to customize

### How is this different from ChatGPT or Claude?

**Clawdet gives you:**
- **Your own server** — Not shared with others
- **24/7 availability** — Always running, not just when you open a tab
- **Full customization** — Edit code, add skills, automate tasks
- **Multi-platform** — Connect via Telegram, Discord, WhatsApp, etc.
- **Privacy** — Your data stays on your server
- **Automation** — Set up cron jobs, webhooks, and background tasks

ChatGPT/Claude are great for chat, but Clawdet is a **personal assistant platform** you fully control.

### Do I need technical skills to use Clawdet?

**No!** The basic setup is automated:
- Sign up with Twitter/X
- Pay via Stripe
- Your instance is provisioned automatically
- Connect via Telegram and start chatting

**Advanced features** (like SSH access, custom skills) are optional and for power users.

---

## Pricing & Billing

### How much does it cost?

**$20/month** for one personal OpenClaw instance.

Includes:
- Dedicated VPS (1 vCPU, 2GB RAM, 20GB SSD)
- Grok AI API access (fair use)
- Subdomain with SSL
- Full support

### Is there a free trial?

Yes! You get **5 free messages** to try Grok AI before signing up. No credit card required.

### What payment methods do you accept?

We accept all major credit/debit cards via **Stripe**:
- Visa, Mastercard, American Express, Discover
- Apple Pay, Google Pay
- International cards supported

### Can I cancel anytime?

Absolutely. Cancel from your dashboard or Stripe portal anytime. Your server will remain active until the end of your billing period.

### What happens if I cancel?

- Your server stays active until the end of your paid period
- After that, it's shut down and data is deleted after 7 days
- You can re-subscribe anytime to get a new instance

### Is there a refund policy?

We offer a **7-day money-back guarantee**. If you're not satisfied within the first week, contact support for a full refund.

---

## Technical Questions

### What server specs do I get?

**Hetzner CX11 or CPX11:**
- 1 vCPU (shared)
- 2GB RAM
- 20GB SSD
- 20TB traffic/month
- Ubuntu 22.04 LTS
- Located in Germany (EU)

Plenty for a personal AI assistant!

### Can I upgrade my server?

Not yet, but it's on our roadmap! For now, you can manually resize your Hetzner VPS:
1. SSH into your server
2. Use Hetzner's console to resize
3. Contact support if you need help

### Where is my data stored?

All your data is on **your VPS** in Hetzner's Germany datacenter (EU). Clawdet doesn't store your conversations or files.

### Can I SSH into my server?

Yes! You have **full root access**. SSH credentials are sent to your email upon provisioning.

```bash
ssh root@yourusername.clawdet.com
```

### Can I install additional software?

Absolutely! It's your server. Install whatever you need:

```bash
apt update
apt install <package-name>
```

### What AI model does it use?

By default, your instance uses **Grok 4.1 Fast** (non-reasoning) from xAI. This is included in your subscription.

You can also configure it to use:
- OpenAI GPT-4o
- Anthropic Claude
- Local models via Ollama
- Any OpenAI-compatible API

Just edit `/root/.openclaw/.env` and add your own API keys.

### How do I backup my data?

**Manual backups:**
```bash
# Copy workspace to local machine
scp -r root@yourusername.clawdet.com:/root/.openclaw/workspace ./backup/
```

**Automated backups:**
Use Hetzner's snapshot feature (small additional cost) or set up automated rsync.

We're working on built-in backup functionality!

---

## Features & Functionality

### Can I connect multiple chat platforms?

Yes! OpenClaw supports:
- Telegram (easiest to set up)
- Discord
- WhatsApp
- Slack
- SMS (via Twilio)

Check the OpenClaw documentation for setup instructions.

### Does it remember past conversations?

Yes! Your assistant has:
- **Short-term memory** — Recent conversation context
- **Long-term memory** — Stored in `MEMORY.md`
- **Daily logs** — Saved in `memory/YYYY-MM-DD.md`

It learns your preferences and remembers important information.

### What can my assistant do?

Out of the box:
- **Chat** — Natural language conversations
- **Web search** — Find information online
- **Code execution** — Run Python, JavaScript, bash
- **File management** — Read/write files
- **Reminders** — Set cron jobs and alarms
- **Web scraping** — Fetch and parse websites

With additional skills:
- Control smart home devices
- Manage GitHub repositories
- Schedule meetings
- Send emails/SMS
- Monitor social media
- Trade stocks (with eToro skill)
- And much more!

### Can I customize my assistant's personality?

Yes! Edit `/root/.openclaw/workspace/AGENTS.md` to change:
- Tone and style (formal, casual, funny)
- Response length preferences
- Domain expertise
- Behavioral rules
- Working hours

### How do I add skills?

Skills extend your assistant's capabilities. To add one:

```bash
ssh root@yourusername.clawdet.com
openclaw skill install <skill-name>
```

Browse available skills at [github.com/openclaw/skills](https://github.com/openclaw/skills)

---

## Security & Privacy

### Is my data private?

**Yes!** Your data is stored only on your VPS, not on Clawdet servers. We don't have access to your conversations or files.

### Is it encrypted?

- **In transit:** Yes, all connections use SSL/TLS (HTTPS)
- **At rest:** Your VPS uses encrypted storage (Hetzner default)
- **Telegram:** Supports end-to-end encryption

### Who can access my server?

Only **you** have SSH access. Clawdet doesn't retain access after provisioning is complete.

### What data does Clawdet collect?

We collect minimal data:
- Email address (for billing and support)
- X/Twitter username (for authentication)
- Payment information (via Stripe, not stored by us)
- Server metadata (IP, subdomain, creation date)

We **do not** collect or log:
- Your conversations
- Files on your server
- API usage patterns

### Is it GDPR compliant?

Yes. Your data is processed in the EU (Germany), and you have full control over your data. Contact support to exercise your GDPR rights.

---

## Troubleshooting

### My instance isn't responding

1. **Check server status:**
   ```bash
   ssh root@yourusername.clawdet.com
   systemctl status openclaw-gateway
   ```

2. **Restart the service:**
   ```bash
   systemctl restart openclaw-gateway
   ```

3. **Check logs for errors:**
   ```bash
   journalctl -u openclaw-gateway -f
   ```

If issues persist, contact support.

### I forgot my instance URL

Visit [clawdet.com/dashboard](https://clawdet.com/dashboard) and sign in with X. Your URL will be displayed.

### Telegram bot isn't working

1. **Check bot token:** Ensure it's configured in `/root/.openclaw/.env`
2. **Restart gateway:** `systemctl restart openclaw-gateway`
3. **Check Telegram logs:** Look for errors in the service logs

### DNS not resolving

DNS propagation takes 5-10 minutes. If it's been longer:

1. **Clear DNS cache:**
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
   - Linux: `sudo systemd-resolve --flush-caches`

2. **Try Google DNS:** Temporarily use 8.8.8.8 as your DNS server

3. **Check from another network:** Mobile data, different WiFi, etc.

### Payment failed

Common reasons:
- **Insufficient funds** — Check your card balance
- **Expired card** — Update payment method
- **Bank decline** — Contact your bank; they may flag it as unusual activity
- **Wrong CVV/ZIP** — Double-check details

Try again or contact support if the issue persists.

### Provisioning stuck

If provisioning is taking longer than 15 minutes:

1. **Refresh your dashboard** — Sometimes the status lags
2. **Check Hetzner status** — [status.hetzner.com](https://status.hetzner.com)
3. **Contact support** — We'll investigate and provision manually if needed

---

## Account Management

### How do I change my email?

Currently, email changes require contacting support. We're building self-service account management.

### Can I transfer my instance to another account?

Not directly, but you can:
1. Backup your data (via SSH/rsync)
2. Sign up with a new account
3. Restore your data to the new instance

### Can I have multiple instances?

Yes! Each Clawdet account can have one instance, but you can create multiple accounts with different X/Twitter profiles.

Multi-instance support per account is on our roadmap.

### How do I delete my account?

1. Cancel your subscription (dashboard or Stripe)
2. Email support@clawdet.com with "Delete Account" in subject
3. We'll delete your account data within 7 days

Your VPS and data will be wiped as part of the process.

---

## Support

### How do I contact support?

- **Email:** support@clawdet.com
- **Response time:** Usually within 24 hours
- **Discord:** [discord.gg/openclaw](https://discord.gg/openclaw) (community support)

### What if I find a bug?

Please report it!

- **Email:** support@clawdet.com with details
- **GitHub:** [github.com/openclaw/clawdet/issues](https://github.com/openclaw/clawdet/issues)

Include:
- What you were trying to do
- What happened instead
- Screenshots or error messages (if applicable)

### Where can I learn more about OpenClaw?

- **Official docs:** [docs.openclaw.com](https://docs.openclaw.com)
- **GitHub:** [github.com/openclaw](https://github.com/openclaw)
- **Discord:** [discord.gg/openclaw](https://discord.gg/openclaw)

---

## Roadmap & Future Features

### When will you add [feature]?

Check our [public roadmap](#) to see what's planned. Upcoming features:
- Multiple pricing tiers (Q2 2026)
- Custom domains (Q2 2026)
- Team accounts (Q2 2026)
- Mobile app (Q2 2026)
- Email notifications (Q1 2026)
- Admin panel (Q1 2026)

### Can I request a feature?

Absolutely! Email support@clawdet.com or open a GitHub issue with your idea.

### Is Clawdet open source?

The **OpenClaw assistant** is open source. The **Clawdet platform** (provisioning, billing, etc.) is proprietary, but we plan to open-source parts of it in the future.

---

## Still have questions?

**Email us:** support@clawdet.com

We're here to help! 🚀

---

*Last updated: February 2026*
*Version: 1.0*
