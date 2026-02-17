# Clawdet User Guide

Welcome to **Clawdet** — your personal AI assistant in the cloud! This guide will walk you through getting started with your own OpenClaw instance.

---

## What is Clawdet?

Clawdet is a service that sets up a **personal AI assistant** for you, running 24/7 in the cloud. Your assistant can:

- Chat with you via Telegram, Discord, or other platforms
- Help you with tasks, research, and automation
- Learn your preferences and remember context
- Access tools like web search, code execution, and more
- Run on your own private server

---

## Getting Started

### Step 1: Try It Free

Visit **[clawdet.com](https://clawdet.com)** and click **"Try Now"**.

You'll get **5 free messages** with Grok AI to see what it's like. No signup required!

**What to try:**
- Ask questions ("What's the weather in Tokyo?")
- Request explanations ("Explain quantum computing simply")
- Get creative ("Write me a haiku about coding")

After 5 messages, you'll be prompted to sign up to continue.

---

### Step 2: Sign Up

When ready, click **"Upgrade to Continue"** or **"Get Started"** on the homepage.

**You'll need:**
- A Twitter/X account (for authentication)
- An email address
- Agreement to Terms of Service

**The signup process:**

1. **Authenticate with X** — Click "Sign in with X" and authorize Clawdet
2. **Enter your details** — Provide your email and accept the terms
3. **Choose your plan** — Currently $20/month for your personal instance

---

### Step 3: Payment

You'll be redirected to a secure Stripe checkout page.

**What you're paying for:**
- Your own dedicated cloud server (Hetzner VPS)
- OpenClaw AI assistant software pre-installed
- Grok AI API access included
- Your personal subdomain: `yourusername.clawdet.com`
- 24/7 uptime and automatic updates

**Accepted payment methods:**
- Credit/Debit cards via Stripe
- Secure and PCI-compliant

After payment, provisioning starts automatically!

---

### Step 4: Provisioning (5-10 minutes)

Once payment is confirmed, Clawdet will:

1. **Create your server** — A new VPS is spun up on Hetzner Cloud
2. **Install OpenClaw** — The AI assistant software is configured
3. **Set up DNS** — Your subdomain is created with SSL enabled
4. **Configure your workspace** — Personalized files are created

**What you'll see:**
- A dashboard showing real-time provisioning progress
- Steps: Creating VPS → Configuring DNS → Installing OpenClaw → Complete
- Progress bar with estimated time remaining

**Don't close your browser!** The page will auto-refresh when complete.

---

### Step 5: Access Your Instance

Once provisioning is complete, you'll see:

**Your Instance URL:** `https://yourusername.clawdet.com`

**What to do next:**

1. **Visit your URL** — Open it in a new tab
2. **Check the welcome message** — You should see an OpenClaw status page
3. **Connect via Telegram** (recommended):
   - Start a chat with your instance's Telegram bot
   - Follow the pairing instructions
   - Send your first message!

---

## Using Your AI Assistant

### Via Telegram (Recommended)

1. **Find your bot** — Check your email or dashboard for the bot username
2. **Start a chat** — Search for `@YourBotName` on Telegram
3. **Send `/start`** to begin
4. **Chat naturally** — Your assistant understands conversational language

**Example commands:**
- "What's on my calendar today?"
- "Remind me to call Mom in 2 hours"
- "Search the web for Python tutorials"
- "What's the latest news in AI?"

### Via Web Interface

Visit `https://yourusername.clawdet.com` in your browser.

You'll see:
- Chat interface
- Status and usage information
- Configuration options

---

## Key Features

### 🧠 Memory & Context

Your assistant remembers:
- Past conversations and decisions
- Your preferences and habits
- Important dates and todos
- Skills you've taught it

**Files you can customize:**
- `USER.md` — Information about you
- `AGENTS.md` — Your assistant's personality and rules
- `MEMORY.md` — Long-term memory storage
- `memory/YYYY-MM-DD.md` — Daily conversation logs

### 🛠️ Tools & Skills

Your assistant can:
- Search the web (Brave Search)
- Execute code (Python, Node.js, bash)
- Read and write files
- Set reminders and cron jobs
- Control web browsers
- And much more!

### 🔒 Privacy & Security

- **Your data stays on your server** — Not shared with others
- **End-to-end encrypted** — Telegram messages use E2EE
- **No tracking** — We don't log your conversations
- **Open source** — OpenClaw code is public and auditable

---

## Customization

### Editing Your Assistant's Personality

SSH into your server:

```bash
ssh root@yourusername.clawdet.com
```

Then edit configuration files:

```bash
cd /root/.openclaw/workspace
nano AGENTS.md  # Define behavior and rules
nano USER.md    # Add info about yourself
```

**Example customizations:**
- Change response style (formal, casual, funny)
- Add domain expertise (medical, legal, tech)
- Set working hours and quiet times
- Configure notification preferences

### Adding Skills

Your assistant comes with many skills pre-installed. To add more:

1. Visit the [OpenClaw Skills Repository](https://github.com/openclaw/skills)
2. Browse available skills
3. Install via SSH:

```bash
openclaw skill install <skill-name>
```

Popular skills:
- `etoro` — Trading automation
- `homeassistant` — Smart home control
- `github` — Repository management
- `calendar` — Google Calendar integration

---

## Troubleshooting

### Assistant Not Responding

1. **Check server status:**
   ```bash
   ssh root@yourusername.clawdet.com
   systemctl status openclaw-gateway
   ```

2. **Restart the service:**
   ```bash
   systemctl restart openclaw-gateway
   ```

3. **Check logs:**
   ```bash
   journalctl -u openclaw-gateway -f
   ```

### Forgot My Instance URL

Check your email or visit [clawdet.com/dashboard](https://clawdet.com/dashboard) and sign in with X.

### Payment Issues

Contact support: support@clawdet.com

### DNS Not Working

DNS propagation can take up to 24 hours, but usually completes in 5-10 minutes. If it's been longer:

1. Try clearing DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
2. Use a different DNS server temporarily (8.8.8.8)
3. Contact support if issue persists

---

## Best Practices

### 🎯 Be Specific

Instead of: "Help me"
Try: "Help me write a Python script to parse JSON files"

### 💬 Conversational

Your assistant understands natural language. Talk to it like a human!

### 📝 Use Memory

Tell your assistant to remember things:
- "Remember that I prefer TypeScript over JavaScript"
- "Note: my birthday is June 15th"
- "Keep in mind I'm in EST timezone"

### ⏰ Automate

Set up recurring tasks:
- "Check my email every morning at 9 AM and summarize"
- "Remind me to exercise every day at 6 PM"
- "Search for AI news weekly and send me highlights"

### 🔐 Security

- **Don't share sensitive credentials** in chat
- Use environment variables for API keys
- Enable 2FA on your X account
- Regularly update your server

---

## Support & Community

### Getting Help

- **Documentation:** [docs.openclaw.com](https://docs.openclaw.com)
- **Email Support:** support@clawdet.com
- **Discord Community:** [discord.gg/openclaw](https://discord.gg/openclaw)
- **GitHub Issues:** [github.com/openclaw/issues](https://github.com/openclaw/issues)

### Feedback

We'd love to hear from you!

- **Feature requests:** Open an issue on GitHub
- **Bug reports:** Email support with details
- **Success stories:** Share on X with #Clawdet

---

## Billing & Account Management

### Viewing Your Subscription

Visit [clawdet.com/dashboard](https://clawdet.com/dashboard) to see:
- Current plan and pricing
- Renewal date
- Server usage stats
- Instance URL

### Canceling Your Subscription

To cancel:

1. Visit your dashboard
2. Click "Manage Subscription"
3. Follow Stripe's cancellation flow

**What happens after cancellation:**
- Your server will remain active until the end of your billing period
- After that, your server will be shut down (data deleted after 7 days)
- You can re-subscribe anytime to get a new instance

### Upgrading/Downgrading

Currently, we offer one plan. More tiers coming soon!

---

## FAQ

**Q: Can I use my own API keys?**
A: Yes! SSH into your server and edit `/root/.openclaw/.env` to add your keys.

**Q: How much does it cost after the first month?**
A: $20/month, billed automatically via Stripe.

**Q: Can I migrate my data to another server?**
A: Yes, all your data is in `/root/.openclaw/workspace/` — just copy it over.

**Q: Is my data backed up?**
A: Not automatically. We recommend setting up backups via Hetzner's snapshot feature or using `rsync`.

**Q: Can I connect multiple chat platforms?**
A: Yes! OpenClaw supports Telegram, Discord, WhatsApp, and more. Check the skills documentation.

**Q: What if I exceed usage limits?**
A: Currently, there are no hard limits. Grok API usage is included. Fair use applies.

**Q: Can I SSH into my server?**
A: Absolutely! You have full root access. The SSH key was sent to your email.

**Q: What's the server location?**
A: Servers are hosted on Hetzner Cloud in Germany (EU datacenter) by default.

---

## Next Steps

Now that you're set up:

1. **Explore the interface** — Try different commands
2. **Customize your assistant** — Edit AGENTS.md and USER.md
3. **Connect platforms** — Set up Telegram, Discord, etc.
4. **Automate tasks** — Create cron jobs for recurring needs
5. **Join the community** — Share tips and learn from others

Welcome to Clawdet! 🚀

---

*Last updated: February 2026*
*Version: 1.0*
