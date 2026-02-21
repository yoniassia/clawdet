# Clawdet 🐾

**SaaS platform for provisioning dedicated OpenClaw AI instances**

Transform your AI workflows with your own personal OpenClaw assistant, deployed in minutes.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 What is Clawdet?

Clawdet automates the deployment of **dedicated OpenClaw instances** for users. In ~10 minutes, users get:

- ✅ Private VPS server (Hetzner Cloud)
- ✅ OpenClaw pre-installed and configured
- ✅ Grok 4.2 AI with reasoning (5p1m mode)
- ✅ Custom subdomain (username.clawdet.com)
- ✅ SSL certificate (Cloudflare)
- ✅ Docker deployment
- ✅ Gateway access (port 18789)

**No manual setup required.** Just sign up → deploy → use.

---

## 🚀 Features

### For Users

- **Free Beta Access** - First users get free instances
- **Two Signup Methods**
  - Email + Password (with bcrypt hashing)
  - X/Twitter OAuth (SHA256 PKCE)
- **Instant Provisioning** - VPS ready in 8-12 minutes
- **Powerful AI** - Grok 4.2 with extended reasoning mode
- **Personal Domain** - `yourname.clawdet.com`
- **Full Control** - SSH access, Docker management

### For Developers

- **Modern Stack** - Next.js 15, React 19, TypeScript
- **Automated Deployment** - One-click VPS provisioning
- **Battle-Tested Images** - `coollabsio/openclaw:latest`
- **Infrastructure as Code** - Docker Compose templates
- **API-First** - RESTful endpoints for all operations

---

## 📊 Architecture

```
User Sign-Up → VPS Creation → DNS Config → Docker Deploy → Instance Ready!
    ↓              ↓              ↓             ↓              ↓
  Auth API    Hetzner API   Cloudflare API  SSH Install   OpenClaw
```

**Tech Stack:**
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Auth:** NextAuth.js + bcrypt + X OAuth
- **Infrastructure:** Hetzner Cloud + Cloudflare + Docker
- **AI:** X.AI Grok 4.2 (primary) + Anthropic Claude (fallback)

**See detailed diagrams:** [ARCHITECTURE-VISUAL.md](ARCHITECTURE-VISUAL.md)

---

## 🛠️ Quick Start

### Prerequisites

- Node.js 22+
- npm or yarn
- Hetzner Cloud API token
- Cloudflare API token
- X.AI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clawdet.git
cd clawdet

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables

```bash
# AI API Keys
XAI_API_KEY=xai-...
ANTHROPIC_API_KEY=sk-ant-...

# Infrastructure
HETZNER_API_TOKEN=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ZONE_ID=...

# Authentication
NEXTAUTH_SECRET=...
X_CLIENT_ID=...
X_CLIENT_SECRET=...

# Database (temporary - migrate to PostgreSQL!)
# Currently uses data/users.json
```

---

## 📖 Documentation

- **[GROK-DEEP-ANALYSIS.md](GROK-DEEP-ANALYSIS.md)** - Comprehensive analysis by Grok 4.2 reasoning
- **[ARCHITECTURE-VISUAL.md](ARCHITECTURE-VISUAL.md)** - Visual diagrams and flows
- **[FREE-BETA-FLOW.md](FREE-BETA-FLOW.md)** - Free beta signup implementation
- **[GROK-MODEL-SETUP.md](GROK-MODEL-SETUP.md)** - Grok 4.2 configuration
- **[ONBOARDING-FIX.md](ONBOARDING-FIX.md)** - Onboarding flow fixes

### API Documentation

**Authentication:**
- `POST /api/auth/register` - Email signup
- `GET /api/auth/x/login` - X OAuth initiation
- `GET /api/auth/x/callback` - X OAuth callback
- `GET /api/auth/me` - Current user session

**Provisioning:**
- `POST /api/provisioning/start` - Start VPS provisioning
- `GET /api/provisioning/status` - Check provision status

**Trial:**
- `POST /api/trial-chat` - Free trial chat (5 messages)

---

## 🔒 Security

### Implemented

✅ **Password Security**
- bcrypt hashing (12 rounds)
- Minimum 8 characters
- No plaintext storage

✅ **OAuth Security**
- SHA256 PKCE (not plain!)
- State verification (CSRF protection)
- Secure cookie storage

✅ **Session Security**
- HttpOnly cookies
- Secure flag (HTTPS only)
- SameSite: strict
- 256-bit random tokens

✅ **API Security**
- Rate limiting (IP-based)
- Input validation
- Input sanitization
- Security headers (CSP, X-Frame-Options, etc.)

### ⚠️ Security Warnings

**CRITICAL:** 
- **Database:** Currently using JSON file - **migrate to PostgreSQL before launch!**
- **API Keys:** Shared across all instances - **implement per-user keys or API proxy**
- **Session Tokens:** Using `Math.random()` - **switch to `crypto.randomBytes()`**

**See full security audit:** [GROK-DEEP-ANALYSIS.md#security-audit](GROK-DEEP-ANALYSIS.md#security-audit)

---

## 🧪 Testing

### Manual Testing

```bash
# Test email signup
curl -X POST https://clawdet.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Test trial chat
curl -X POST https://clawdet.com/api/trial-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Automated Testing (TODO)

```bash
# Unit tests (not yet implemented)
npm run test

# E2E tests (not yet implemented)
npm run test:e2e
```

**Recommendation:** Add testing before production launch!

---

## 📈 Roadmap

### Phase 1: Pre-Launch (✅ Complete)
- ✅ Email + X OAuth signup
- ✅ VPS provisioning automation
- ✅ Grok 4.2 integration
- ✅ Free beta flow
- ✅ Dashboard UI

### Phase 2: Production Ready (In Progress)
- 🔴 **CRITICAL:** Migrate to PostgreSQL
- 🔴 **CRITICAL:** Secure API keys (proxy or per-user)
- 🟡 Add health monitoring
- 🟡 Error recovery + retries
- 🟡 Email notifications

### Phase 3: Scale & Polish
- Observability (Sentry, LogTail)
- Admin dashboard enhancements
- Usage analytics
- Automated backups
- CI/CD pipeline

### Phase 4: Advanced Features
- Multi-region support
- Team accounts
- Custom domains
- Instance snapshots
- Usage billing

---

## 💡 Key Insights from Grok 4.2 Analysis

**Strengths:**
- End-to-end automation is impressive
- Security best practices implemented
- Free beta strategy lowers barrier to entry
- Grok 4.2 reasoning mode is cutting-edge

**Critical Issues:**
1. **JSON database will fail at scale** → Migrate to PostgreSQL NOW
2. **Shared API keys create billing nightmare** → Implement API proxy
3. **No health monitoring** → Won't know when instances fail
4. **Missing error recovery** → Provisions fail permanently

**Estimated time to production-ready:** 1-2 weeks

**Full analysis:** [GROK-DEEP-ANALYSIS.md](GROK-DEEP-ANALYSIS.md)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- TypeScript strict mode
- ESLint for code quality
- Prettier for formatting
- Meaningful commit messages
- Update documentation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **OpenClaw** - The AI assistant platform
- **X.AI** - Grok 4.2 reasoning model
- **Anthropic** - Claude fallback
- **Hetzner** - VPS infrastructure
- **Cloudflare** - DNS + SSL
- **coollabsio** - Pre-built Docker images

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/clawdet/issues)
- **Email:** support@clawdet.com
- **Twitter:** [@clawdet](https://twitter.com/clawdet)

---

## 🎉 Status

**Current Version:** 0.1.0-alpha  
**Status:** ✅ Free Beta Ready  
**Last Updated:** 2026-02-21  
**Deployed:** https://clawdet.com

**Ready for first 20-50 beta users!** 🚀

---

Made with 🐾 by the Clawdet team
