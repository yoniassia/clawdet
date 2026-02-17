# Clawdet

**Simple way to get your own OpenClaw AI assistant with Grok**

Clawdet is a SaaS platform that lets anyone try, signup, and get their own fully-configured OpenClaw instance running on a dedicated VPS with Grok AI integration—all in under 10 minutes.

🌐 **Live at:** [clawdet.com](https://clawdet.com)

---

## 🎯 What is Clawdet?

Clawdet automates the entire setup process for getting your personal AI assistant:

1. **Try it**: 5 free messages with Grok AI (no signup required)
2. **Sign up**: Authenticate with X (Twitter)
3. **Pay**: $20/month via Stripe
4. **Get your instance**: Automatic VPS provisioning with OpenClaw + Grok configured
5. **Start using**: Access via Telegram, CLI, or API at `<username>.clawdet.com`

---

## ✨ Features

### For Users
- **5-message free trial** with real Grok AI (no credit card)
- **X OAuth login** (secure, no passwords)
- **One-click payment** via Stripe
- **Automated provisioning** (VPS creation, DNS, SSL, OpenClaw installation)
- **Dedicated subdomain** (`<username>.clawdet.com`)
- **Pre-configured Grok AI** integration
- **Full OpenClaw capabilities** (skills, memory, tools, agents)

### For Operators
- **Fully automated workflow** (trial → auth → payment → provision → handoff)
- **Real-time provisioning status** with progress tracking
- **Hetzner Cloud integration** for VPS management
- **Cloudflare DNS automation** with SSL
- **Stripe webhooks** for payment processing
- **Mock modes** for testing without real APIs
- **Comprehensive monitoring** (cache, performance, errors)
- **Security hardened** (token-based auth, CSP headers, HTTPS-only)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Journey                         │
├─────────────────────────────────────────────────────────────┤
│  Landing Page → Trial Chat → Signup → Payment → Dashboard  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Clawdet Platform                         │
├─────────────────────────────────────────────────────────────┤
│  • Next.js 14 (App Router)                                  │
│  • React 18 (Server + Client Components)                    │
│  • JSON-based database (MVP, migrate to PostgreSQL later)   │
│  • In-memory caching with TTL                               │
│  • Performance monitoring with metrics                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
├─────────────────────────────────────────────────────────────┤
│  • Grok API (xAI) - AI responses for trial + instances      │
│  • X OAuth - User authentication                            │
│  • Stripe - Payment processing                              │
│  • Hetzner Cloud - VPS provisioning                         │
│  • Cloudflare - DNS + SSL automation                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Provisioned Instance                       │
├─────────────────────────────────────────────────────────────┤
│  • Ubuntu 22.04 VPS (Hetzner CX11)                          │
│  • OpenClaw installed via SSH automation                    │
│  • Grok API pre-configured                                  │
│  • Subdomain: <username>.clawdet.com                        │
│  • SSL via Cloudflare proxy                                 │
│  • User-specific workspace (USER.md, AGENTS.md)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - Grok (xAI) - for AI responses
  - Hetzner Cloud - for VPS provisioning
  - Cloudflare - for DNS management
  - Stripe (test mode) - for payments
  - X OAuth (optional, can use mock mode)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd clawdet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run in development:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Environment Variables

Required in `.env.local`:

```bash
# Grok AI
GROK_API_KEY=your_grok_api_key

# Hetzner Cloud
HETZNER_API_TOKEN=your_hetzner_token

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# X OAuth (optional - use mock mode if not available)
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_REDIRECT_URI=https://clawdet.com/api/auth/x/callback

# App
NEXT_PUBLIC_BASE_URL=https://clawdet.com
NODE_ENV=production
```

---

## 📂 Project Structure

```
clawdet/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── trial/               # Trial chat interface
│   ├── signup/              # Signup flow
│   ├── checkout/            # Payment page
│   ├── dashboard/           # User dashboard
│   └── api/                 # API routes
│       ├── trial-chat/      # Trial chat endpoint
│       ├── auth/            # X OAuth endpoints
│       ├── signup/          # Signup completion
│       ├── payment/         # Stripe checkout
│       ├── webhooks/        # Stripe webhooks
│       ├── provisioning/    # Provision endpoints
│       └── stats/           # Performance metrics
│
├── components/               # React components
│   ├── TrialChat.tsx        # Chat interface
│   ├── SignupForm.tsx       # User details form
│   └── ...
│
├── lib/                      # Business logic
│   ├── auth-middleware.ts   # Authentication & authorization
│   ├── cache.ts             # In-memory caching
│   ├── cloudflare.ts        # DNS automation
│   ├── db.ts                # User database (JSON)
│   ├── grok.ts              # AI integration
│   ├── hetzner.ts           # VPS provisioning
│   ├── performance.ts       # Monitoring
│   ├── provisioner.ts       # Orchestration
│   └── ssh-installer.ts     # OpenClaw setup
│
├── data/                     # Database files
│   └── users.json           # User records
│
├── public/                   # Static assets
│
├── docs/                     # Documentation
│   ├── USER-GUIDE.md        # End-user guide
│   ├── ADMIN-GUIDE.md       # Platform admin guide
│   ├── TROUBLESHOOTING.md   # Common issues & fixes
│   ├── SECURITY-AUDIT.md    # Security review
│   ├── PERFORMANCE.md       # Optimization guide
│   └── MOBILE-TESTING.md    # Responsive design tests
│
├── scripts/                  # Utility scripts
│   ├── manual-provision.js  # Manual provisioning
│   ├── cleanup-unpaid.js    # Remove inactive users
│   └── ...
│
├── BUILD-PLAN.md            # Development roadmap
├── README.md                # This file
└── package.json             # Dependencies
```

---

## 🧪 Testing

### Run Integration Tests

```bash
npm run test:integration
# Or manually:
npx tsx test-integration.ts
```

Tests cover:
- Trial chat flow (5-message limit)
- Signup and OAuth flow
- Payment processing (mock Stripe)
- Provisioning workflow (mock Hetzner)
- End-to-end user journey

### Performance Testing

```bash
bash test-performance.sh
```

Measures:
- Cache hit rates
- API response times
- Concurrent request handling

### Manual Testing

1. **Trial Chat**: Visit `/trial`, send 6 messages (should redirect after 5)
2. **Signup**: Click "Get Started", complete OAuth, enter details
3. **Payment**: Use Stripe test card `4242 4242 4242 4242`
4. **Provisioning**: Watch dashboard progress bar
5. **Access**: Visit `<username>.clawdet.com` once complete

---

## 🔧 Development

### Mock Modes

Test without real API keys:

```bash
# .env.local
USE_MOCK_OAUTH=true        # X OAuth
USE_MOCK_STRIPE=true       # Stripe payments
USE_MOCK_HETZNER=true      # VPS provisioning
USE_MOCK_CLOUDFLARE=true   # DNS management
```

### Database

Current: JSON files in `/data`

```javascript
// Add a user
const { addUser } = require('./lib/db');
addUser({
  username: 'testuser',
  email: 'test@example.com',
  paid: true,
  provisioningStatus: 'pending'
});

// Update user
updateUser('testuser', { 
  provisioningStatus: 'complete',
  subdomain: 'testuser.clawdet.com'
});
```

Future: Migrate to PostgreSQL when >5,000 users

### Adding New Features

1. Create new route in `app/`
2. Add API endpoints in `app/api/`
3. Implement business logic in `lib/`
4. Add tests to `test-integration.ts`
5. Update `BUILD-PLAN.md` with completion status
6. Document in user or admin guide

---

## 📊 Monitoring

### Performance Metrics

```bash
curl https://clawdet.com/api/stats
```

Response:
```json
{
  "cache": {
    "size": 42,
    "hitRate": 0.73,
    "avgResponseTime": 12.4
  },
  "operations": {
    "total": 1240,
    "avgDuration": 145
  }
}
```

### Key Metrics

- **Cache Hit Rate**: >60% (good), >80% (excellent)
- **Trial Chat Response**: <500ms (cached), <2s (uncached)
- **Provisioning Success**: >95%
- **DNS Propagation**: <10 minutes average

### Logs

```bash
# Application logs
pm2 logs clawdet

# Nginx access logs
tail -f /var/log/nginx/access.log

# Provisioning logs
cat data/provisioning-<username>.log
```

---

## 🔐 Security

### Implemented

- ✅ Token-based authentication (64-char secure tokens)
- ✅ HttpOnly + Secure + SameSite cookies
- ✅ Content-Security-Policy headers
- ✅ HTTPS-only in production
- ✅ Stripe webhook signature verification
- ✅ Input validation on all forms
- ✅ Rate limiting on API endpoints
- ✅ Session expiration (7 days)
- ✅ No sensitive data in client-side code
- ✅ Environment variables for secrets

### Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate API keys** every 90 days
3. **Monitor webhook signatures** for tampering
4. **Review user data** regularly for anomalies
5. **Keep dependencies updated**: `npm audit fix`

See [SECURITY-AUDIT.md](./docs/SECURITY-AUDIT.md) for full security review.

---

## 📈 Scaling

### Current Capacity

- **Single server**: ~500 concurrent users
- **Database**: JSON files, suitable for <10,000 users
- **VPS limit**: Based on Hetzner account quota

### When to Scale

Migrate to:
- **PostgreSQL** when >5,000 users
- **Redis** for session storage and caching
- **Load balancer** when >1,000 concurrent requests
- **Kubernetes** for multi-region deployment

### Cost Estimation

Per user per month:
- **Hetzner VPS (CX11)**: €4.15 (~$4.50)
- **Cloudflare**: Free (DNS + SSL)
- **Stripe fees**: $0.60 (3% of $20)
- **Grok API**: ~$0.50 (estimated usage)
- **Total cost**: ~$5.60
- **Profit**: ~$14.40 per user

At 100 users: ~$1,440/month profit
At 1,000 users: ~$14,400/month profit

---

## 🚢 Deployment

### Production Deployment

1. **Set up server:**
   ```bash
   # SSH into Hetzner VPS
   ssh root@clawdet.com
   ```

2. **Install dependencies:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs nginx certbot python3-certbot-nginx
   npm install -g pm2
   ```

3. **Clone and build:**
   ```bash
   git clone <your-repo>
   cd clawdet
   npm install
   npm run build
   ```

4. **Configure environment:**
   ```bash
   nano .env.local
   # Add all production API keys
   ```

5. **Start with PM2:**
   ```bash
   pm2 start npm --name "clawdet" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx:**
   ```nginx
   # /etc/nginx/sites-available/clawdet
   server {
       listen 80;
       server_name clawdet.com;
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
       }
   }
   ```

7. **Enable SSL:**
   ```bash
   certbot --nginx -d clawdet.com
   ```

8. **Configure Stripe webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://clawdet.com/api/webhooks/stripe`
   - Copy webhook secret to `.env.local`

---

## 📚 Documentation

- **[User Guide](./USER-GUIDE.md)** - How to use Clawdet
- **[Admin Guide](./ADMIN-GUIDE.md)** - Platform administration
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues & solutions
- **[Build Plan](./BUILD-PLAN.md)** - Development roadmap
- **[Security Audit](./docs/SECURITY-AUDIT.md)** - Security review
- **[Performance Guide](./docs/PERFORMANCE.md)** - Optimization tips
- **[Mobile Testing](./docs/MOBILE-TESTING.md)** - Responsive design

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

[MIT License](./LICENSE)

---

## 🙏 Acknowledgments

- **OpenClaw** - The personal AI assistant framework
- **xAI** - Grok API for AI responses
- **Hetzner** - Reliable VPS hosting
- **Cloudflare** - DNS and SSL automation
- **Stripe** - Payment processing
- **Next.js** - React framework
- **Vercel** - Next.js creators

---

## 📞 Support

- **Email**: support@clawdet.com
- **Discord**: [discord.gg/clawdet](https://discord.gg/clawdet)
- **Twitter/X**: [@clawdet](https://x.com/clawdet)
- **GitHub Issues**: [github.com/clawdet/issues](https://github.com/clawdet/issues)

---

**Built with ❤️ by the Clawdet Team**

*Making personal AI assistants accessible to everyone*

---

*Last Updated: February 2026*
