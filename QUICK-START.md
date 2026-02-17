# Clawdet Quick Start

Get your personal AI assistant up and running in 5 minutes! ⚡

---

## Step 1: Try It Free (30 seconds)

Visit **[clawdet.com](https://clawdet.com)** → Click **"Try Now"**

Send 5 free messages to Grok AI:
- "What's the weather in Tokyo?"
- "Explain quantum computing simply"
- "Write a haiku about coding"

---

## Step 2: Sign Up (2 minutes)

Click **"Upgrade to Continue"** when prompted.

1. **Sign in with X/Twitter** (authorize the app)
2. **Enter your email** and accept Terms
3. **Pay $20/month** via Stripe checkout

✅ Payment complete!

---

## Step 3: Wait for Provisioning (5-10 minutes)

Your personal server is being set up:

- ⚙️ Creating VPS on Hetzner Cloud
- 🌐 Configuring DNS + SSL
- 🤖 Installing OpenClaw AI assistant

**Don't close the page!** It'll refresh when done.

---

## Step 4: Access Your Instance (1 minute)

Once complete, you'll see:

**Your URL:** `https://yourusername.clawdet.com`

**Next steps:**
1. Visit your URL in a new tab
2. Connect via Telegram (easiest way to chat)
3. Start chatting with your AI assistant!

---

## Quick Tips

### 💬 Using Your Assistant

**Via Telegram (recommended):**
- Search for your bot: `@YourBotName`
- Send `/start`
- Chat naturally!

**Via web:**
- Visit `yourusername.clawdet.com`
- Use the chat interface

### 🛠️ Customization

**SSH into your server:**
```bash
ssh root@yourusername.clawdet.com
```

**Edit personality:**
```bash
cd /root/.openclaw/workspace
nano AGENTS.md  # Change behavior
nano USER.md    # Add info about you
```

**Add skills:**
```bash
openclaw skill install <skill-name>
```

### 🔒 Security

- You have full root access
- Your data stays on your server
- SSH credentials sent to your email

---

## Common Commands

**Ask your assistant:**
- "Remind me to call Mom in 2 hours"
- "Search the web for Python tutorials"
- "What's on my calendar today?"
- "Write me a Python script to parse JSON"

**Teach it preferences:**
- "Remember that I prefer TypeScript"
- "Note: my birthday is June 15th"
- "I'm in EST timezone"

---

## Need Help?

- 📖 **Full guide:** [USER-GUIDE.md](./USER-GUIDE.md)
- ❓ **FAQ:** [FAQ.md](./FAQ.md)
- 📧 **Support:** support@clawdet.com
- 💬 **Discord:** [discord.gg/openclaw](https://discord.gg/openclaw)

---

**That's it! Enjoy your personal AI assistant! 🚀**

*For detailed instructions, see [USER-GUIDE.md](./USER-GUIDE.md)*
