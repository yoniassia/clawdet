# Clawdet User Guide

Welcome to Clawdet! This guide will help you get started with your personal AI assistant powered by OpenClaw and Grok.

## 🚀 Quick Start

### 1. Try Before You Buy (Free Trial)

Visit [clawdet.com/trial](https://clawdet.com/trial) to test drive the AI with 5 free messages. No account needed!

**What you can do:**
- Ask questions about anything
- Test the AI's capabilities
- See real-time responses powered by Grok 4.1

### 2. Sign Up

After your trial, click **"Get Started"** to create your account:

1. **Authenticate with X (Twitter)**  
   - Click "Continue with X"
   - Authorize Clawdet to access your profile
   - This lets us identify you securely

2. **Enter Your Details**
   - Provide your email address
   - Accept terms of service
   - Click "Complete Signup"

3. **Choose Your Plan**
   - **$20/month** - Full OpenClaw instance with Grok AI
   - Includes dedicated server, subdomain, 24/7 access

### 3. Payment

1. Click **"Subscribe Now"** on the checkout page
2. Enter payment details via Stripe (secure checkout)
3. Subscription starts immediately after payment

### 4. Provisioning (Automatic)

After payment, we automatically:
- Create your dedicated VPS server (Hetzner Cloud)
- Install OpenClaw with all dependencies
- Configure Grok AI integration
- Set up your subdomain: `<username>.clawdet.com`
- Enable SSL/HTTPS automatically

**Time:** Usually 5-10 minutes. Watch the progress bar on your dashboard!

### 5. Access Your Instance

Once provisioning is complete:

1. Visit your unique URL: `https://<username>.clawdet.com`
2. Your OpenClaw gateway will be running on port 18789
3. Connect via Telegram, Discord, or CLI

---

## 📱 Connecting to Your Instance

### Option A: Telegram Bot (Recommended)

1. **Find Your Bot**
   - Check your provisioning email for bot username
   - Or look in your instance dashboard

2. **Start Chatting**
   - Search for your bot on Telegram
   - Send `/start` to begin
   - Chat naturally with your AI assistant

3. **Commands**
   - `/help` - Show available commands
   - `/status` - Check session info
   - `/reasoning` - Toggle extended thinking mode

### Option B: CLI (Advanced)

SSH into your instance:
```bash
ssh root@<your-vps-ip>
cd /root/.openclaw
openclaw chat
```

### Option C: API Access

Your instance exposes a REST API on port 18789:
```bash
curl https://<username>.clawdet.com:18789/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Hello!"}'
```

---

## 🛠️ Customizing Your Instance

### Workspace Files

Your AI's behavior is defined by files in `/root/.openclaw/workspace/`:

1. **USER.md** - Information about you
   - Update with your preferences, context, projects
   - Your AI reads this to personalize responses

2. **AGENTS.md** - System instructions
   - Defines how your AI behaves
   - Edit to change personality, rules, capabilities

3. **MEMORY.md** - Long-term memory
   - Your AI stores important context here
   - Reviewed at the start of each session

4. **TOOLS.md** - Local configuration
   - Camera names, SSH hosts, preferences
   - Customize for your environment

### Editing via SSH

```bash
ssh root@<your-vps-ip>
cd /root/.openclaw/workspace
nano USER.md  # Edit with your favorite editor
```

### Skills & Integrations

Add more capabilities by installing skills:
```bash
openclaw skills install twitter
openclaw skills install calendar
openclaw skills install home-assistant
```

---

## 💡 Best Practices

### Getting the Most from Your AI

1. **Provide Context**  
   Update USER.md with:
   - Your name, role, interests
   - Current projects or goals
   - Preferences (communication style, tools you use)

2. **Use Memory**  
   Ask your AI to remember important things:
   - "Remember that I prefer Python over JavaScript"
   - "Add to memory: I'm working on project X"

3. **Leverage Tools**  
   Your AI can:
   - Search the web
   - Run shell commands
   - Read/write files
   - Control connected services

4. **Set Up Heartbeats**  
   Enable proactive monitoring:
   - Check emails periodically
   - Remind you of calendar events
   - Monitor system health

### Security Tips

1. **Keep API Keys Secret**  
   - Never share your instance URL publicly
   - Rotate tokens if compromised

2. **Review Memory Files**  
   - Regularly check what your AI has stored
   - Remove sensitive data you don't want persisted

3. **Limit Permissions**  
   - Only connect services you trust
   - Review skill permissions before installing

---

## 🔧 Troubleshooting

### Instance Not Responding

1. **Check provisioning status** on your dashboard
2. **Wait for DNS propagation** (can take 5-15 minutes)
3. **Try direct IP access**: `http://<vps-ip>:18789`
4. **Contact support** if issue persists

### Bot Not Responding (Telegram)

1. **Restart the gateway**:
   ```bash
   ssh root@<your-vps-ip>
   openclaw gateway restart
   ```

2. **Check logs**:
   ```bash
   openclaw gateway logs
   ```

3. **Verify bot token** is configured correctly

### Out of Memory / Performance Issues

1. **Check system resources**:
   ```bash
   ssh root@<your-vps-ip>
   htop  # or: free -h, df -h
   ```

2. **Restart services** to clear memory:
   ```bash
   openclaw gateway restart
   ```

3. **Upgrade your VPS** if consistently hitting limits

### Can't Access via Subdomain

1. **DNS propagation delay**: Wait 15-30 minutes
2. **Check DNS records** at [dnschecker.org](https://dnschecker.org)
3. **Try direct IP** as temporary workaround
4. **Verify Cloudflare proxy** is enabled (orange cloud)

---

## 📊 Managing Your Subscription

### Billing

- **Charges**: $20/month, billed automatically
- **Payment Method**: Update via Stripe customer portal
- **Invoices**: Emailed monthly to your registered address

### Cancellation

To cancel your subscription:
1. Contact support at support@clawdet.com
2. Provide your username or email
3. We'll process cancellation within 24 hours

**Note**: You'll retain access until the end of your billing period.

### Upgrades

Need more resources? We offer:
- **Standard**: CX11 (2GB RAM, 20GB SSD) - $20/month
- **Pro**: CPX21 (4GB RAM, 80GB SSD) - $35/month
- **Enterprise**: Custom pricing for teams

Contact sales@clawdet.com to upgrade.

---

## 🆘 Getting Help

### Community

- **Discord**: [discord.gg/clawdet](https://discord.gg/clawdet) (coming soon)
- **GitHub Discussions**: Share tips, ask questions
- **Twitter/X**: [@clawdet](https://x.com/clawdet) for updates

### Support

- **Email**: support@clawdet.com
- **Response Time**: Within 24 hours (usually faster)
- **Emergency**: Mention "urgent" in subject line

### Documentation

- **OpenClaw Docs**: [openclaw.com/docs](https://openclaw.com/docs)
- **API Reference**: [clawdet.com/api-docs](https://clawdet.com/api-docs)
- **Video Tutorials**: [youtube.com/@clawdet](https://youtube.com/@clawdet)

---

## 🎯 Next Steps

Now that you're set up:

1. ✅ **Personalize** your USER.md file
2. ✅ **Connect** services you use daily (email, calendar, etc.)
3. ✅ **Set up** heartbeats for proactive monitoring
4. ✅ **Explore** available skills and integrations
5. ✅ **Join** our community to share your experience

**Happy building with Clawdet! 🚀**

---

*Last Updated: February 2026*
