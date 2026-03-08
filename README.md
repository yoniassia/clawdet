# Clawdet 🐾

**AI Agent Platform — Deploy your own NanoClaw agent in seconds**

Each user gets an isolated AI agent with real tool use: bash, web search, file I/O, Python, and more. Connect via web chat or Telegram.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Powered-blue)](https://docker.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🎯 What is Clawdet?

Clawdet provisions **dedicated AI agents** as Docker containers. In ~2 seconds, users get:

- ✅ Isolated Docker container with NanoClaw agent
- ✅ Real tools: bash, Python, curl, git, file I/O, web search
- ✅ Custom subdomain (username.clawdet.com) with SSL
- ✅ Auth-gated web chat UI (only the owner can access)
- ✅ Optional Telegram bot connection
- ✅ Persistent workspace & memory
- ✅ Claude-powered (Anthropic API) with tool use

**No manual setup required.** Sign up → auto-deploy → chat.

---

## 🚀 Features

### For Users
- **Instant provisioning** — Agent ready in ~2 seconds
- **Tool-enabled AI** — Your agent can run code, search the web, read/write files
- **Web + Telegram** — Chat via browser or connect a Telegram bot
- **Isolated workspace** — Persistent files, CLAUDE.md personality, MEMORY.md
- **Auth-gated** — Only you can access your agent's web chat

### For Fleets (NanoFleets)
- **Fleet dashboard** — Manage all agents from one place
- **Per-agent isolation** — Separate containers, tokens, workspaces
- **Docker-based** — 256MB RAM, 0.5 CPU per agent, ~90 agents per server
- **Auto-provisioning** — Caddy SSL, DNS, health checks — all automated
- **BYOK** — Bring your own AI API keys, no markup

---

## 🏗️ Architecture

```
clawdet.com (Next.js)
├── Auth (Auth.js v5 + JWT)
├── SQLite (user DB)
├── Docker Provisioner
│   ├── nanoclaw-agent (HTTP only)
│   └── nanoclaw-telegram (HTTP + Telegram bot)
└── Caddy (reverse proxy + SSL)

Per Agent:
┌─────────────────────────────┐
│ Docker Container (256MB)    │
│ ├── http-gateway.js         │
│ │   ├── Claude API + Tools  │
│ │   ├── bash / read / write │
│ │   └── web_search          │
│ ├── /workspace/             │
│ │   ├── CLAUDE.md           │
│ │   └── MEMORY.md           │
│ └── Optional: Telegram bot  │
└─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15 (App Router) |
| Auth | Auth.js v5 (JWT/JWE) |
| Database | SQLite (better-sqlite3) |
| Containers | Docker |
| Proxy | Caddy (auto-SSL) |
| AI | Anthropic Claude API with tool_use |
| Hosting | Hetzner ARM (cax11) |
| Process | PM2 |

---

## 📦 Agent Tools

Each agent has access to:

| Tool | Description |
|------|-------------|
| `bash` | Execute any shell command (curl, python3, git, jq, etc.) |
| `read_file` | Read files from workspace |
| `write_file` | Create/update files in workspace |
| `list_files` | List workspace contents |
| `web_search` | Fetch URLs or search DuckDuckGo |

Agents come with `bash`, `curl`, `wget`, `git`, `jq`, `python3` pre-installed.

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/yoniassia/clawdet.git
cd clawdet

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your keys

# Run
npm run dev
```

### Environment Variables

```env
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://clawdet.com
ANTHROPIC_API_KEY=sk-ant-...
HETZNER_API_TOKEN=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ZONE_ID=...
```

---

## 📁 Project Structure

```
clawdet/
├── app/
│   ├── page.tsx              # Landing page (signup form)
│   ├── dashboard/page.tsx    # User dashboard (auto-provision)
│   ├── nanofleets/page.tsx   # NanoFleets B2B page
│   ├── api/
│   │   ├── auth/             # Auth.js routes
│   │   ├── agents/           # Agent API (token, telegram)
│   │   ├── provisioning/     # Provisioning status + trigger
│   │   └── fleet/            # Fleet management API
│   ├── admin/                # Admin dashboard
│   └── login/, signup/, profile/
├── lib/
│   ├── auth.ts               # Auth.js v5 config
│   ├── db.ts                 # SQLite operations
│   ├── provisioner-docker.ts # Docker provisioning logic
│   ├── docker-fleet.ts       # Fleet CRUD operations
│   └── auth-middleware.ts    # requireAuth, requireAdmin, requireOwnership
└── data/
    └── clawdet.db            # SQLite database
```

---

## 🔒 Security

- **Auth-gated chat**: Only the agent owner can access web chat (via `/api/agents/token`)
- **Container isolation**: Each agent in its own Docker container with resource limits
- **Encrypted sessions**: Auth.js JWE-encrypted JWT cookies
- **No shared state**: Agents have separate filesystems, tokens, and workspaces
- **BYOK model**: API keys stay with the user, never stored in agent containers

---

## 📄 License

MIT

---

## 🐾 Credits

Built by [Yoni Assia](https://x.com/yoniassia). Powered by [NanoClaw](https://github.com/qwibitai/nanoclaw) and Claude (Anthropic).
