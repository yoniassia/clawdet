# Clawdet 🤖

**Automated AI Assistant Provisioning Platform**

[![Version](https://img.shields.io/badge/version-0.1.0--alpha-brightgreen.svg)](./VERSION.md)
[![Status](https://img.shields.io/badge/status-working-success.svg)](https://clawdet.com)
[![Node.js](https://img.shields.io/badge/node.js-22.x-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/next.js-15-black.svg)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Documentation](https://img.shields.io/badge/docs-complete-success.svg)](./DOCUMENTATION-INDEX.md)

> **🎉 v0.1.0-alpha "WebSocket Working"** - First functional alpha release! WebSocket chat protocol fully operational, test instances verified working. [Release Notes](./VERSION.md)

Clawdet makes it easy for anyone to get their own personal AI assistant running in the cloud. Sign up, pay $20/month, and get a fully configured OpenClaw instance on your own VPS in minutes.

**🔗 Live:** [clawdet.com](https://clawdet.com)  
**📖 Docs:** [Documentation Index](./DOCUMENTATION-INDEX.md)  
**💬 Support:** support@clawdet.com

---

## ⚡ Quick Start

**For Users:**
1. Visit [clawdet.com](https://clawdet.com)
2. Try 5 free messages with Grok AI
3. Sign up with X/Twitter
4. Pay $20/month via Stripe
5. Get your instance at `yourusername.clawdet.com`

📖 **Full guide:** [QUICK-START.md](./QUICK-START.md)

**For Developers:**
```bash
git clone https://github.com/yoniassia/clawdet.git
cd clawdet
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

📖 **Developer docs:** [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)

---

## 🎯 Alpha Release Status

**v0.1.0-alpha "WebSocket Working"** - Feb 19, 2026

✅ **What's Working:**
- Landing page and authentication (X/Twitter OAuth)
- Free beta system (20 spots available)
- **Fully automated VPS provisioning** (7-10 minutes)
- **WebSocket chat protocol** - Real-time streaming chat ✨
- Test instances verified: [test-fresh-1](https://test-fresh-1.clawdet.com) | [test-fresh-2](https://test-fresh-2.clawdet.com)
- Smoke tests: 4/4 passing
- Production uptime: 28+ hours

🔧 **In Progress:**
- Telegram setup wizard integration
- Email notifications
- PostgreSQL migration

📋 **Full details:** [VERSION.md](./VERSION.md)

---

## 🚀 What is Clawdet?

Clawdet is a **SaaS platform** that:

1. **Lets users try Grok AI** with 5 free messages
2. **Authenticates via X/Twitter OAuth**
3. **Accepts payment via Stripe** ($20/month)
4. **Auto-provisions a Hetzner VPS** with OpenClaw pre-installed
5. **Creates a subdomain** (`username.clawdet.com`) with SSL

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Database:** JSON file storage (SQLite/PostgreSQL ready)
- **AI:** Grok 4.1 Fast (xAI API)
- **Infrastructure:** Hetzner Cloud (VPS), Cloudflare (DNS/SSL)
- **Payment:** Stripe Checkout + Webhooks
- **Provisioning:** SSH-based automation

---

## 📋 Features

### ✅ Phase 1: Trial Experience
- Landing page with hero section and features
- `/trial` route with 5-message free chat
- Real Grok AI integration (grok-4-1-fast-non-reasoning)
- Message counter with upgrade prompt

### ✅ Phase 2: Authentication
- X/Twitter OAuth flow
- Session management (secure tokens + httpOnly cookies)
- Signup flow with email/terms collection
- User database (JSON-based for MVP)

### ✅ Phase 3: Payment
- Stripe Checkout integration
- $20/month subscription
- Payment success/failure handling
- Webhook processing for checkout.session.completed

### ✅ Phase 4: Provisioning
- Hetzner Cloud API integration (VPS creation)
- SSH-based OpenClaw installation
- Cloudflare DNS automation (subdomain + SSL)
- Real-time provisioning status tracking
- Dashboard with progress updates

### ✅ Phase 5: Production Ready
- Security hardening (token auth, CSRF, CSP headers)
- Performance optimization (caching, monitoring)
- Mobile responsive design (all breakpoints tested)
- Comprehensive documentation

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   Next.js Frontend (Port 3000)  │
│  - Landing, Trial, Signup, etc. │
└────────────┬────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Next.js API Routes             │
│  - /api/trial-chat               │
│  - /api/auth/x/*                 │
│  - /api/payment/*                │
│  - /api/webhooks/stripe          │
│  - /api/provisioning/*           │
└────┬───────┬──────────┬──────────┘
     │       │          │
     ▼       ▼          ▼
┌────────┐ ┌──────┐ ┌─────────┐
│  xAI   │ │Stripe│ │ Hetzner │
│  Grok  │ │      │ │  Cloud  │
└────────┘ └──────┘ └─────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Provisioned  │
                   │     VPS      │
                   │  + OpenClaw  │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Cloudflare  │
                   │  DNS + SSL   │
                   └──────────────┘
```

---

## 🛠️ Local Development

### Prerequisites

- Node.js 22+ (LTS)
- npm or yarn
- Git

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/clawdet.git
   cd clawdet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:
   ```env
   # xAI Grok API
   GROK_API_KEY=your_grok_api_key

   # X/Twitter OAuth (optional for testing)
   TWITTER_CLIENT_ID=your_twitter_client_id
   TWITTER_CLIENT_SECRET=your_twitter_client_secret
   TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/x/callback

   # Stripe (test mode)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID=price_...

   # Hetzner Cloud (optional for testing)
   HETZNER_API_TOKEN=your_hetzner_token

   # Cloudflare (optional for testing)
   CLOUDFLARE_API_TOKEN=your_cloudflare_token
   CLOUDFLARE_ZONE_ID=your_zone_id

   # Mock Mode (set to "true" for local dev)
   MOCK_OAUTH=true
   MOCK_STRIPE=true
   MOCK_PROVISIONING=true
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

### Integration Tests

Run the full test suite:

```bash
npm run test:integration
```

This tests:
- Trial chat flow (5-message limit)
- OAuth authentication
- Signup completion
- Payment processing
- Provisioning workflow
- DNS creation

### Performance Tests

Run performance benchmarks:

```bash
bash test-performance.sh
```

Tests caching, response times, and concurrency.

### Manual Testing

Use mock modes for end-to-end testing without real APIs:

```bash
# .env
MOCK_OAUTH=true
MOCK_STRIPE=true
MOCK_PROVISIONING=true
```

Then walk through the flow:
1. Visit `/trial` → send 5 messages
2. Click "Upgrade" → auth with mock OAuth
3. Complete signup details
4. Pay with test card (4242 4242 4242 4242)
5. Watch provisioning complete in dashboard

📖 **Complete testing guide:** [TEST-WORKFLOW.md](./TEST-WORKFLOW.md)

---

## 🚀 Deployment

### Production Server

**Current deployment:**
- Domain: clawdet.com
- Server: Hetzner VPS at 188.34.197.212
- Port: 18789 (proxied via Cloudflare)
- SSL: Cloudflare Universal SSL

### Deploy Updates

1. **SSH into the server:**
   ```bash
   ssh root@clawdet.com
   ```

2. **Navigate to the project:**
   ```bash
   cd /path/to/clawdet
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Install dependencies:**
   ```bash
   npm install --production
   ```

5. **Build the app:**
   ```bash
   npm run build
   ```

6. **Restart the service:**
   ```bash
   pm2 restart clawdet
   # or
   systemctl restart clawdet
   ```

### Environment Variables (Production)

Set these in production `.env`:

```env
NODE_ENV=production
MOCK_OAUTH=false
MOCK_STRIPE=false
MOCK_PROVISIONING=false

# Real API keys
GROK_API_KEY=...
STRIPE_SECRET_KEY=sk_live_...
HETZNER_API_TOKEN=...
CLOUDFLARE_API_TOKEN=...

# Security
SESSION_SECRET=<64-char-random-string>
ALLOWED_ORIGINS=https://clawdet.com
```

---

## 📁 Project Structure

```
clawdet/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── trial/                  # Trial chat page
│   ├── signup/                 # Signup flow
│   ├── checkout/               # Payment pages
│   ├── dashboard/              # User dashboard
│   └── api/                    # API routes
│       ├── trial-chat/         # Trial chat endpoint
│       ├── auth/               # OAuth endpoints
│       ├── payment/            # Stripe integration
│       ├── webhooks/           # Stripe webhooks
│       └── provisioning/       # VPS provisioning
├── lib/                        # Shared utilities
│   ├── db.ts                  # Database (JSON file storage)
│   ├── auth.ts                # Authentication helpers
│   ├── auth-middleware.ts     # Auth/authorization middleware
│   ├── grok.ts                # Grok API client
│   ├── stripe.ts              # Stripe client
│   ├── hetzner.ts             # Hetzner Cloud API
│   ├── cloudflare.ts          # Cloudflare DNS API
│   ├── provisioner-v2.ts      # Orchestrates VPS setup
│   ├── ssh-installer-v2.ts    # SSH-based OpenClaw install
│   ├── cache.ts               # In-memory caching
│   ├── performance.ts         # Performance monitoring
│   └── rate-limit.ts          # Rate limiting
├── components/                 # React components
├── public/                     # Static assets
├── data/                       # JSON database files
│   └── users.json             # User data
├── scripts/                    # Deployment scripts
│   └── provision-openclaw.sh  # VPS provisioning script
│
├── Documentation:
│   ├── DOCUMENTATION-INDEX.md  # 📚 Master documentation index
│   ├── README.md              # This file
│   ├── QUICK-START.md         # ⚡ 5-minute quick start
│   ├── USER-GUIDE.md          # 👤 Complete user guide
│   ├── FAQ.md                 # ❓ Frequently asked questions
│   ├── TROUBLESHOOTING.md     # 🔧 Common issues & solutions
│   ├── DEVELOPER-GUIDE.md     # 💻 Technical documentation
│   ├── ADMIN-GUIDE.md         # 🛠️ Platform operations
│   ├── SECURITY-AUDIT.md      # 🔒 Security documentation
│   ├── PERFORMANCE.md         # ⚡ Performance optimization
│   ├── DEPLOYMENT-SUMMARY.md  # 🚀 Deployment guide
│   ├── TEST-WORKFLOW.md       # 🧪 Testing procedures
│   ├── BUILD-PLAN.md          # 📋 Sprint tracker
│   └── LAUNCH-CHECKLIST.md    # ✅ Launch readiness
│
├── tests/                      # Test files
│   ├── test-integration.ts
│   └── test-performance.sh
├── .env.example                # Environment template
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── package.json
```

---

## 🔐 Security

**Status:** ✅ Security hardened and production-ready

### Authentication ✅
- Secure token-based sessions (64-char random tokens)
- httpOnly, SameSite=Strict cookies
- HTTPS-only in production
- 7-day session expiration

### Authorization ✅
- `requireAuth()` middleware for protected routes
- `requireOwnership()` for user-specific resources
- Token verification on every request

### API Security ✅
- CSRF protection via SameSite cookies
- Content-Security-Policy headers
- Rate limiting (20 req/min trial chat, 5 req/min auth)
- Input validation and sanitization

### Infrastructure ✅
- All data encrypted at rest (Hetzner)
- SSL/TLS for all connections
- Cloudflare DDoS protection
- Regular security audits

📖 **Full security documentation:** [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)

---

## 📊 Monitoring

### Performance Metrics

Access `/api/stats` to see:
- Request count and average response time
- Cache hit/miss rates
- Error counts
- Uptime

### Logs

**Application logs:**
```bash
pm2 logs clawdet
# or
journalctl -u clawdet -f
```

📖 **For troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)  
📖 **For monitoring guide:** [ADMIN-GUIDE.md#monitoring](./ADMIN-GUIDE.md#monitoring)

---

## 🤝 Contributing

We welcome contributions!

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- **TypeScript** for all new code
- **ESLint** for linting
- **Prettier** for formatting
- Write tests for new features

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 📞 Support

- **Email:** support@clawdet.com
- **Discord:** [discord.gg/openclaw](https://discord.gg/openclaw)
- **Docs:** [docs.openclaw.com](https://docs.openclaw.com)
- **GitHub Issues:** [github.com/openclaw/clawdet/issues](https://github.com/openclaw/clawdet/issues)

---

## 🙏 Acknowledgments

- **OpenClaw** — The AI assistant framework
- **xAI** — Grok API provider
- **Hetzner** — Cloud infrastructure
- **Stripe** — Payment processing
- **Cloudflare** — DNS and CDN

---

## 📚 Documentation

Clawdet has comprehensive documentation for users, developers, and administrators.

### For Users
- **[Quick Start Guide](./QUICK-START.md)** — Get started in 5 minutes
- **[User Guide](./USER-GUIDE.md)** — Complete usage instructions
- **[FAQ](./FAQ.md)** — Frequently asked questions
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** — Common issues and solutions

### For Developers
- **[Developer Guide](./DEVELOPER-GUIDE.md)** — Technical documentation
- **[Architecture Overview](./DEVELOPER-GUIDE.md#architecture)** — System design
- **[API Reference](./DEVELOPER-GUIDE.md#api-reference)** — Complete API docs
- **[Deployment Guide](./DEPLOYMENT-SUMMARY.md)** — Production deployment
- **[Testing Guide](./TEST-WORKFLOW.md)** — Testing procedures

### For Administrators
- **[Admin Guide](./ADMIN-GUIDE.md)** — Platform operations
- **[Security Audit](./SECURITY-AUDIT.md)** — Security documentation
- **[Performance Guide](./PERFORMANCE.md)** — Optimization and monitoring

### Project Information
- **[Documentation Index](./DOCUMENTATION-INDEX.md)** — Complete docs overview
- **[Build Plan](./BUILD-PLAN.md)** — Development history
- **[Launch Checklist](./LAUNCH-CHECKLIST.md)** — Production readiness

---

## 🗺️ Roadmap

### Q1 2026
- [x] MVP launch (trial → signup → payment → provision)
- [x] Security hardening
- [x] Performance optimization
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Admin panel

### Q2 2026
- [ ] Multiple pricing tiers
- [ ] Custom domains (bring your own)
- [ ] Team accounts (multiple users per instance)
- [ ] Marketplace for skills/plugins
- [ ] Mobile app (iOS/Android)

### Q3 2026
- [ ] Multi-region deployment
- [ ] Auto-scaling
- [ ] Advanced monitoring and alerting
- [ ] API for third-party integrations
- [ ] White-label solution

---

**Built with ❤️ by the Clawdet team**

*Last updated: February 2026*
