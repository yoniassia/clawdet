# Clawdet User Guide

Welcome to **Clawdet** — Your Personal AI Assistant Platform

This guide will help you get started with Clawdet, from your first trial chat to managing your fully-provisioned OpenClaw instance.

---

## Table of Contents

1. [What is Clawdet?](#what-is-clawdet)
2. [Getting Started](#getting-started)
3. [Trial Chat](#trial-chat)
4. [Signing Up](#signing-up)
5. [Payment](#payment)
6. [Provisioning](#provisioning)
7. [Using Your Instance](#using-your-instance)
8. [Troubleshooting](#troubleshooting)
9. [Support](#support)

---

## What is Clawdet?

Clawdet is a SaaS platform that provides you with your own personal AI assistant powered by OpenClaw and Grok AI. Unlike chatbots that share resources with thousands of users, Clawdet gives you:

- **Your own dedicated server** running on Hetzner Cloud
- **Private AI instance** with Grok 4.2 integration
- **Your own subdomain**: `yourusername.clawdet.com`
- **Full customization** of your AI assistant's personality and capabilities
- **24/7 availability** with secure SSL encryption

**Perfect for:**
- Developers who want AI automation and task execution
- Power users who need a persistent AI assistant
- Anyone who values privacy and dedicated resources

---

## Getting Started

### Step 1: Visit Clawdet.com

Navigate to [https://clawdet.com](https://clawdet.com) in your web browser.

You'll see:
- Hero section introducing Clawdet
- "Try Now" button for a free trial
- "Sign Up" button to create an account
- Key features and pricing information

### Step 2: Try Before You Buy

Click **"Try Now"** to start a free 5-message trial chat with Grok AI. No signup required!

---

## Trial Chat

The trial chat lets you experience Grok AI without any commitment.

### Features:
- **5 free messages** to test the AI
- **Real Grok 4.2 responses** (not a demo!)
- **No registration** required
- **Session-based** - your conversation is stored in your browser

### What to Ask:
Try these prompts to see what Grok can do:
- "Help me write a Python script to analyze CSV data"
- "Explain quantum computing in simple terms"
- "Generate creative ideas for a birthday party"
- "What's the weather forecast and should I bring an umbrella?"

### Message Limit:
After 5 messages, you'll see an **"Upgrade to continue"** prompt. This takes you to the signup flow where you can create your own unlimited instance.

### Privacy:
Trial conversations are temporary and stored only in your browser's session storage. They are not saved on our servers.

---

## Signing Up

Ready to get your own AI assistant? Here's how:

### Step 1: Click "Sign Up" or "Upgrade to continue"

You'll be taken to `/signup` where you can authenticate with X (Twitter).

### Step 2: Authenticate with X (Twitter)

Click **"Sign in with X"** to connect your X account.

**Why X OAuth?**
- Secure authentication without passwords
- We can send you notifications via X DM (optional)
- Easy account recovery

**What we access:**
- Your X username (used for your subdomain)
- Your profile information (name, avatar)
- We do NOT post on your behalf or access your DMs without permission

### Step 3: Enter Your Details

After authentication, you'll be prompted to provide:
- **Email address** (for billing and notifications)
- **Terms acceptance** (please read our [Terms of Service](#))

We use your email for:
- Payment receipts
- Important service updates
- Password reset (if you later add password login)

### Step 4: Review and Continue

Once you've entered your details, click **"Continue to Payment"** to proceed to checkout.

---

## Payment

Clawdet uses Stripe for secure payment processing.

### Pricing:
- **$20/month** for your personal OpenClaw instance
- Includes:
  - Dedicated Hetzner VPS (CX11 instance)
  - Unlimited Grok AI conversations
  - Your own subdomain with SSL
  - 24/7 uptime and support

### Payment Flow:

1. **Review your plan** on the `/checkout` page
2. **Click "Proceed to Payment"** to open Stripe Checkout
3. **Enter payment details** (credit/debit card)
4. **Confirm payment** to complete your purchase

### Payment Methods:
Stripe accepts:
- Credit cards (Visa, Mastercard, American Express, etc.)
- Debit cards
- Apple Pay / Google Pay (if available)

### Security:
- All payment data is handled by Stripe (PCI DSS Level 1 compliant)
- We never see or store your full card details
- Payments are encrypted with HTTPS

### After Payment:
Once payment is confirmed, you'll be redirected to `/checkout/success` and provisioning will begin automatically!

---

## Provisioning

After payment, your personal OpenClaw instance is automatically created. This takes **5-10 minutes**.

### Provisioning Steps:

1. **Creating VPS** (2-3 min)
   - Hetzner Cloud creates your dedicated server
   - Ubuntu 22.04 LTS is installed
   - SSH access is configured

2. **Configuring DNS** (1-2 min)
   - Your subdomain `<username>.clawdet.com` is created
   - DNS records are propagated globally
   - SSL certificate is provisioned via Cloudflare

3. **Installing OpenClaw** (3-5 min)
   - Node.js and dependencies are installed
   - OpenClaw gateway is configured
   - Grok API integration is set up
   - Your workspace is initialized with welcome files

### Tracking Progress:

Visit your **Dashboard** at `/dashboard` to see real-time provisioning status:
- Progress bar showing current step
- Detailed status messages
- Estimated time remaining

The page auto-refreshes every 5 seconds, so you don't need to manually reload.

### What You'll Receive:

Once provisioning is complete, your dashboard will display:
- **Your instance URL**: `https://<username>.clawdet.com`
- **Setup instructions**: How to access and configure your instance
- **Quick start guide**: First steps with your AI assistant

---

## Using Your Instance

Congratulations! Your personal OpenClaw instance is live.

### Accessing Your Instance:

Visit your subdomain: `https://<yourusername>.clawdet.com`

### First Steps:

1. **Explore the workspace**
   - Your instance comes pre-configured with:
     - `USER.md` - Information about you
     - `AGENTS.md` - Agent behavior instructions
     - `MEMORY.md` - Long-term memory storage

2. **Chat with your AI**
   - OpenClaw runs as a Telegram bot by default
   - Connect via the web interface or Telegram

3. **Customize your assistant**
   - Edit `AGENTS.md` to change personality
   - Add skills and integrations
   - Configure memory and context

### What Can Your Instance Do?

Your OpenClaw instance can:
- **Execute commands** on your server
- **Browse the web** and fetch information
- **Manage files** in your workspace
- **Run scheduled tasks** with cron jobs
- **Integrate with APIs** (X, GitHub, Stripe, etc.)
- **Remember conversations** across sessions

### Configuration:

Your instance is pre-configured with:
- **Grok 4.2 API** (shared key, already working)
- **Web interface** at your subdomain
- **Secure HTTPS** with auto-renewing SSL
- **System service** that auto-restarts on crashes

### Customization:

Want to add your own Grok API key or integrate other services?

1. SSH into your VPS (credentials in dashboard)
2. Edit `/root/.openclaw/config.json`
3. Restart the gateway: `openclaw gateway restart`

---

## Troubleshooting

### Common Issues:

#### "Trial chat not responding"
- Check your internet connection
- Refresh the page and try again
- If the issue persists, contact support

#### "OAuth failed"
- Make sure you're logged into X (Twitter)
- Try clearing cookies and starting over
- Check that third-party cookies are enabled

#### "Payment not processing"
- Verify your card details are correct
- Check with your bank for declined transactions
- Try a different payment method

#### "Provisioning stuck"
- Provisioning can take up to 10 minutes
- If stuck for >15 minutes, contact support
- Check your dashboard for error messages

#### "Can't access my instance"
- Wait 2-3 minutes for DNS to propagate
- Try accessing via HTTPS (not HTTP)
- Clear your browser cache

### Getting Help:

If you encounter issues not listed here:
1. Check your dashboard for status updates
2. Review error messages carefully
3. Contact support via [email] or X DM

---

## Support

We're here to help!

### Contact Methods:

- **Email**: support@clawdet.com
- **X (Twitter)**: [@clawdet](https://x.com/clawdet)
- **GitHub Issues**: [github.com/clawdet/issues](https://github.com)

### Support Hours:

- Response time: Within 24 hours
- Emergency support: Available for critical issues

### Documentation:

- **Main docs**: [clawdet.com/docs](https://clawdet.com/docs)
- **OpenClaw docs**: [openclaw.org/docs](https://openclaw.org/docs)
- **FAQ**: See [FAQ.md](./FAQ.md)

### Community:

Join other Clawdet users:
- Discord server (coming soon)
- X community discussions
- GitHub discussions

---

## Legal & Privacy

- **Terms of Service**: [clawdet.com/terms](https://clawdet.com/terms)
- **Privacy Policy**: [clawdet.com/privacy](https://clawdet.com/privacy)
- **Refund Policy**: 7-day money-back guarantee

---

**Need more help?** Check out our [FAQ](./FAQ.md) or reach out to support!

*Last updated: February 17, 2026*
