# Clawdet 🤖

**Automated AI Assistant Provisioning Platform**

Clawdet makes it easy for anyone to get their own personal AI assistant running in the cloud. Sign up, pay $20/month, and get a fully configured OpenClaw instance on your own VPS in minutes.

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
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── trial/             # Trial chat page
│   ├── signup/            # Signup flow
│   ├── checkout/          # Payment pages
│   ├── dashboard/         # User dashboard
│   └── api/               # API routes
│       ├── trial-chat/    # Trial chat endpoint
│       ├── auth/          # OAuth endpoints
│       ├── payment/       # Stripe integration
│       ├── webhooks/      # Stripe webhooks
│       └── provisioning/  # VPS provisioning
├── lib/                   # Shared utilities
│   ├── db.ts             # Database (JSON file storage)
│   ├── auth.ts           # Authentication helpers
│   ├── grok.ts           # Grok API client
│   ├── stripe.ts         # Stripe client
│   ├── hetzner.ts        # Hetzner Cloud API
│   ├── cloudflare.ts     # Cloudflare DNS API
│   ├── provisioner.ts    # Orchestrates VPS setup
│   ├── ssh-installer.ts  # SSH-based OpenClaw install
│   ├── cache.ts          # In-memory caching
│   └── performance.ts    # Performance monitoring
├── public/               # Static assets
├── data/                 # JSON database files
│   └── users.json       # User data
├── docs/                # Documentation
│   ├── USER-GUIDE.md    # User-facing guide
│   ├── FAQ.md           # Common questions
│   └── ADMIN-GUIDE.md   # Platform operations
├── tests/               # Test files
│   ├── test-integration.ts
│   └── test-performance.sh
├── BUILD-PLAN.md        # Sprint tracker
├── SECURITY-AUDIT.md    # Security documentation
├── PERFORMANCE.md       # Performance docs
├── MOBILE-TESTING.md    # Mobile responsiveness
└── package.json
```

---

## 🔐 Security

### Authentication
- Secure token-based sessions (64-char random tokens)
- httpOnly, SameSite=Strict cookies
- HTTPS-only in production
- 7-day session expiration

### Authorization
- `requireAuth()` middleware for protected routes
- `requireOwnership()` for user-specific resources
- Token verification on every request

### API Security
- CSRF protection via SameSite cookies
- Content-Security-Policy headers
- Rate limiting (coming soon)
- Input validation and sanitization

### Infrastructure
- All data encrypted at rest (Hetzner)
- SSL/TLS for all connections
- Cloudflare DDoS protection
- Regular security audits

See [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) for details.

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

**Nginx logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

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
