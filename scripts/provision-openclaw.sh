#!/bin/bash
# OpenClaw Provisioning Script for ClawDet
# This script installs and configures OpenClaw on a fresh Ubuntu VPS

set -e  # Exit on any error

# Configuration (passed as environment variables)
XAI_API_KEY="${XAI_API_KEY:-}"
USERNAME="${USERNAME:-}"
SUBDOMAIN="${SUBDOMAIN:-}"
FULL_DOMAIN="${SUBDOMAIN}.clawdet.com"
GATEWAY_TOKEN="${GATEWAY_TOKEN:-$(openssl rand -hex 32)}"  # Generate secure token

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Validate inputs
if [ -z "$XAI_API_KEY" ]; then
    error "XAI_API_KEY environment variable is required"
fi

if [ -z "$USERNAME" ]; then
    error "USERNAME environment variable is required"
fi

if [ -z "$SUBDOMAIN" ]; then
    error "SUBDOMAIN environment variable is required"
fi

log "Starting OpenClaw provisioning for user: $USERNAME"
log "Domain: $FULL_DOMAIN"
log "Gateway Token: ${GATEWAY_TOKEN:0:16}..."

# Step 1: System Update
log "Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git build-essential ca-certificates openssl

# Step 2: Install Node.js 22.x (LTS)
log "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
log "Node.js installed: $NODE_VERSION"

# Step 3: Install Caddy (reverse proxy for SSL)
log "Installing Caddy..."
if ! command -v caddy &> /dev/null; then
    apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -qq
    apt-get install -y caddy
fi
log "Caddy installed: $(caddy version)"

# Step 4: Install OpenClaw
log "Installing OpenClaw..."
npm install -g openclaw@latest --silent

OPENCLAW_VERSION=$(openclaw version 2>&1 || echo "unknown")
log "OpenClaw installed: $OPENCLAW_VERSION"

# Step 5: Create workspace directory
log "Setting up workspace..."
mkdir -p /root/.openclaw/workspace/memory
mkdir -p /root/.openclaw/config
mkdir -p /root/.openclaw/logs

# Step 6: Create workspace files
log "Creating workspace files..."

# USER.md
cat > /root/.openclaw/workspace/USER.md <<EOF
# USER.md - About Your Human

**Name:** $USERNAME
**Timezone:** UTC (update as needed)
**Instance:** $FULL_DOMAIN
**Provisioned:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Your OpenClaw Instance (ClawDet Beta)

This is your personal OpenClaw instance with **full advanced features enabled**:

✅ **Grok AI** (xAI) - Extended reasoning mode
✅ **All tool integrations** - Browser, cron, sub-agents, memory
✅ **Advanced mode** - High thinking level, verbose output
✅ **Unlimited sessions** - No message limits
✅ **Full workspace access** - Read, write, execute

## What I Can Do

**Core Capabilities:**
- Research and information lookup
- Task automation (cron jobs, scheduled reminders)
- Code generation and debugging
- Content creation and editing
- File management and organization

**Advanced Features:**
- **Browser automation** - Control websites, fill forms, scrape data
- **Sub-agents** - Spawn isolated AI sessions for complex tasks
- **Memory system** - Remember context across sessions via MEMORY.md
- **Shell execution** - Run commands and scripts
- **Cron jobs** - Schedule recurring tasks
- **RentAHuman** - Human-in-the-loop assistance for complex tasks

## Getting Started

**Web interface:**
- Visit: https://$FULL_DOMAIN

**Connect your Telegram bot:**
1. Create a bot via @BotFather on Telegram
2. Configure the bot token in your OpenClaw config
3. Start chatting!

**Check service status:**
\`\`\`bash
systemctl status openclaw-gateway
journalctl -u openclaw-gateway -f
\`\`\`

## Customization

Edit these files to personalize your AI assistant:

- **SOUL.md** - My personality and behavior
- **AGENTS.md** - Workspace conventions and rules
- **MEMORY.md** - Long-term memory (automatically searched)
- **TOOLS.md** - Your local configurations (SSH hosts, API keys)
- **HEARTBEAT.md** - Periodic tasks (email checks, reminders, etc.)

## Notes

_Add your personal context, preferences, and notes below:_

EOF

# AGENTS.md
cat > /root/.openclaw/workspace/AGENTS.md <<'EOF'
# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## Every Session

Before doing anything else:

1. Read `USER.md` — this is who you're helping
2. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
3. Read `MEMORY.md` for long-term memory

Don't ask permission. Just do it.

## Memory

You wake up fresh each session. These files are your continuity:

- **Daily notes:** `memory/YYYY-MM-DD.md` — raw logs of what happened
- **Long-term:** `MEMORY.md` — your curated memories

Capture what matters. Decisions, context, things to remember.

## Tools

Skills provide your tools. When you need one, check its `SKILL.md`.

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- When in doubt, ask.

## Make It Yours

This is a starting point. Add your own conventions, style, and rules as you figure out what works.
EOF

# SOUL.md
cat > /root/.openclaw/workspace/SOUL.md <<'EOF'
# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" — just help.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- You're not the user's voice — be careful in public contexts.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.

## Continuity

Each session, you wake up fresh. These files _are_ your memory. Read them. Update them. They're how you persist.
EOF

# IDENTITY.md
cat > /root/.openclaw/workspace/IDENTITY.md <<EOF
# IDENTITY.md - Who Am I?

- **Name:** Claude
- **Emoji:** 🦞
- **Instance:** $FULL_DOMAIN
- **User:** $USERNAME

---

This is your personal OpenClaw instance.
EOF

# Create MEMORY.md
cat > /root/.openclaw/workspace/MEMORY.md <<'EOF'
# MEMORY.md - Long-Term Memory

This is your long-term memory. Use this for important context, decisions, and learnings that should persist across all sessions.

## How to Use

**This file is automatically searched** when you ask questions about past work, decisions, or preferences.

**Add entries like:**
- Important project context
- User preferences
- Key decisions and rationale
- Lessons learned
- Contact information
- Passwords/credentials (encrypted)

---

_Start adding your context below:_

EOF

# Create HEARTBEAT.md
cat > /root/.openclaw/workspace/HEARTBEAT.md <<'EOF'
# HEARTBEAT.md - Periodic Tasks

This file defines tasks that run periodically when the heartbeat polls.

**Leave this empty** if you don't want any periodic checks.

---

_Add your periodic tasks below:_

EOF

# Create TOOLS.md
cat > /root/.openclaw/workspace/TOOLS.md <<'EOF'
# TOOLS.md - Local Configuration

This file stores environment-specific configurations for your tools and integrations.

## Available Skills

Your ClawDet instance comes with these pre-installed skills:

### Core Tools
- **File operations**: read, write, edit files
- **Shell execution**: Run commands with `exec`
- **Web search**: Search the web via Brave API
- **Web fetch**: Extract content from URLs
- **Memory**: Semantic search across your notes

### Advanced Tools
- **Browser control**: Automate web browsing
- **Cron jobs**: Schedule recurring tasks
- **Sub-agents**: Spawn isolated AI sessions
- **Canvas**: Visual UI rendering
- **Nodes**: Control paired devices

---

_Add your tool configurations below:_

EOF

# Step 7: Create openclaw.json (gateway config)
log "Creating OpenClaw configuration..."

cat > /root/.openclaw/openclaw.json <<EOF
{
  "agents": {
    "defaults": {
      "workspace": "/root/.openclaw/workspace"
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "lan",
    "controlUi": {
      "allowInsecureAuth": true
    },
    "auth": {
      "token": "$GATEWAY_TOKEN",
      "allowTailscale": false
    },
    "trustedProxies": [
      "127.0.0.1",
      "173.245.48.0/20",
      "103.21.244.0/22",
      "103.22.200.0/22",
      "103.31.4.0/22",
      "141.101.64.0/18",
      "108.162.192.0/18",
      "190.93.240.0/20",
      "188.114.96.0/20",
      "197.234.240.0/22",
      "198.41.128.0/17",
      "162.158.0.0/15",
      "104.16.0.0/13",
      "104.24.0.0/14",
      "172.64.0.0/13",
      "131.0.72.0/22"
    ]
  },
  "providers": {
    "xai": {
      "apiKey": "$XAI_API_KEY"
    }
  },
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  },
  "meta": {
    "lastTouchedVersion": "2026.2.15",
    "lastTouchedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
  }
}
EOF

# Also create config.yaml for backward compatibility
cat > /root/.openclaw/config.yaml <<EOF
# Minimal OpenClaw config
gateway:
  mode: local
  port: 18789
  bind: lan

workspace: /root/.openclaw/workspace

providers:
  xai:
    apiKey: $XAI_API_KEY
EOF

# Copy to gateway.yaml as well
cp /root/.openclaw/config.yaml /root/.openclaw/gateway.yaml

# Step 7.5: Create simplified landing page
log "Creating Clawdet-branded landing page..."

mkdir -p /var/www/html

cat > /var/www/html/index.html <<'EOLANDING'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Clawdet Instance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #000000;
            color: #e7e9ea;
            min-height: 100vh;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 60px 24px;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 60px;
        }

        .logo {
            font-size: 80px;
            margin-bottom: 24px;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #1d9bf0 0%, #00ba7c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            font-size: 20px;
            color: #71767b;
            line-height: 1.6;
        }

        /* Status Banner */
        .status-banner {
            background: linear-gradient(135deg, #00ba7c 0%, #008f5d 100%);
            border-radius: 20px;
            padding: 24px 32px;
            margin-bottom: 48px;
            display: flex;
            align-items: center;
            gap: 20px;
            box-shadow: 0 4px 24px rgba(0, 186, 124, 0.3);
        }

        .status-icon {
            font-size: 40px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .status-text h2 {
            font-size: 24px;
            margin-bottom: 6px;
            color: #ffffff;
        }

        .status-text p {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
        }

        /* Main Options */
        .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 48px;
        }

        .option-card {
            background: #16181c;
            border: 2px solid #2f3336;
            border-radius: 20px;
            padding: 32px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .option-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #1d9bf0 0%, #00ba7c 100%);
            transform: scaleX(0);
            transition: transform 0.3s;
        }

        .option-card:hover {
            border-color: #1d9bf0;
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(29, 155, 240, 0.2);
        }

        .option-card:hover::before {
            transform: scaleX(1);
        }

        .option-card.primary {
            border-color: #1d9bf0;
            background: linear-gradient(135deg, #16181c 0%, #1a1f2e 100%);
        }

        .option-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .option-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #00ba7c;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            border-radius: 12px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .option-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #e7e9ea;
        }

        .option-description {
            font-size: 15px;
            color: #71767b;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .option-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #1d9bf0;
            font-weight: 600;
            font-size: 15px;
            text-decoration: none;
            transition: gap 0.2s;
        }

        .option-link:hover {
            gap: 12px;
        }

        /* Quick Start Guide */
        .guide-section {
            background: #16181c;
            border: 1px solid #2f3336;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 48px;
        }

        .guide-section h3 {
            font-size: 28px;
            margin-bottom: 24px;
            color: #1d9bf0;
        }

        .steps {
            list-style: none;
            counter-reset: step-counter;
        }

        .steps li {
            counter-increment: step-counter;
            padding: 24px 0;
            border-bottom: 1px solid #2f3336;
            position: relative;
            padding-left: 70px;
        }

        .steps li:last-child {
            border-bottom: none;
        }

        .steps li:before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 18px;
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #1d9bf0 0%, #0084c7 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
            color: #ffffff;
        }

        .steps h4 {
            font-size: 19px;
            margin-bottom: 8px;
            color: #e7e9ea;
        }

        .steps p {
            color: #71767b;
            font-size: 15px;
            line-height: 1.7;
        }

        .steps code {
            background: #000000;
            padding: 4px 12px;
            border-radius: 8px;
            color: #00ba7c;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            border: 1px solid #2f3336;
        }

        .steps a {
            color: #1d9bf0;
            text-decoration: none;
        }

        .steps a:hover {
            text-decoration: underline;
        }

        /* Info Grid */
        .info-section {
            background: #16181c;
            border: 1px solid #2f3336;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 48px;
        }

        .info-section h3 {
            font-size: 28px;
            margin-bottom: 28px;
            color: #1d9bf0;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .info-item {
            background: #000000;
            border: 1px solid #2f3336;
            border-radius: 16px;
            padding: 20px;
            transition: all 0.2s;
        }

        .info-item:hover {
            border-color: #1d9bf0;
        }

        .info-label {
            font-size: 13px;
            color: #71767b;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-value {
            font-size: 18px;
            color: #e7e9ea;
            font-weight: 600;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding-top: 40px;
            border-top: 1px solid #2f3336;
            color: #71767b;
            font-size: 14px;
        }

        .footer a {
            color: #1d9bf0;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 40px 20px;
            }

            h1 {
                font-size: 36px;
            }

            .options-grid {
                grid-template-columns: 1fr;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🐾</div>
            <h1>Your Clawdet Instance</h1>
            <p class="subtitle">Your personal AI assistant is ready • Powered by OpenClaw + Grok AI</p>
        </div>

        <!-- Status Banner -->
        <div class="status-banner">
            <div class="status-icon">✨</div>
            <div class="status-text">
                <h2>Instance Online & Ready</h2>
                <p>Advanced mode enabled • All tools available • Telegram integration ready</p>
            </div>
        </div>

        <!-- Main Options -->
        <div class="options-grid">
            <div class="option-card primary" onclick="window.location.href='/gateway/'">
                <div class="option-icon">⚙️</div>
                <div class="option-badge">Control Panel</div>
                <div class="option-title">Configure Your Instance</div>
                <div class="option-description">
                    Access the OpenClaw Control Panel to configure your Telegram bot, manage settings, and view system status.
                </div>
                <span class="option-link">Open Control Panel →</span>
            </div>

            <div class="option-card" onclick="window.open('https://docs.openclaw.ai', '_blank')">
                <div class="option-icon">📚</div>
                <div class="option-title">Documentation</div>
                <div class="option-description">
                    Learn about all available features, tools, and capabilities. Discover what your AI assistant can do.
                </div>
                <span class="option-link">Read Docs →</span>
            </div>

            <div class="option-card" onclick="window.open('https://clawdet.com', '_blank')">
                <div class="option-icon">🏠</div>
                <div class="option-title">Clawdet Platform</div>
                <div class="option-description">
                    Visit the main Clawdet site for guides, support, and community resources.
                </div>
                <span class="option-link">Visit Site →</span>
            </div>
        </div>

        <!-- Quick Start Guide -->
        <div class="guide-section">
            <h3>🚀 Quick Start - Connect via Telegram</h3>
            <ol class="steps">
                <li>
                    <h4>Create Your Bot</h4>
                    <p>Open Telegram and search for <code>@BotFather</code>. Send <code>/newbot</code> and follow the prompts to create your bot. You'll receive a bot token.</p>
                </li>
                <li>
                    <h4>Configure Your Instance</h4>
                    <p>Click "Open Control Panel" above, navigate to the Telegram channel settings, and paste your bot token from BotFather.</p>
                </li>
                <li>
                    <h4>Start Chatting!</h4>
                    <p>Find your bot on Telegram and send it a message. Your Clawdet AI will respond with full access to all tools: web browsing, code execution, reminders, and more!</p>
                </li>
            </ol>
        </div>

        <!-- Instance Info -->
        <div class="info-section">
            <h3>📋 Instance Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">AI Model</div>
                    <div class="info-value">Grok 4.2</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Mode</div>
                    <div class="info-value">Advanced</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Server</div>
                    <div class="info-value">Hetzner CX23</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Location</div>
                    <div class="info-value">Helsinki, Finland</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tools</div>
                    <div class="info-value">Browser, Cron, Canvas, Exec, Memory</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: #00ba7c;">Online</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Powered by <a href="https://openclaw.ai" target="_blank">OpenClaw</a> • Deployed by <a href="https://clawdet.com" target="_blank">Clawdet</a></p>
            <p style="margin-top: 12px; font-size: 13px;">Need help? Visit <a href="https://clawdet.com" target="_blank">clawdet.com</a> for support</p>
        </div>
    </div>
</body>
</html>
EOLANDING

log "Landing page created at /var/www/html/index.html"

# Step 8: Configure Caddy
log "Configuring Caddy reverse proxy..."

cat > /etc/caddy/Caddyfile <<EOF
# Clawdet Instance - Simplified Landing + Gateway

$FULL_DOMAIN {
    # Root serves Clawdet-branded landing page
    handle / {
        root * /var/www/html
        file_server
    }
    
    # Gateway at /gateway/* with all assets
    handle_path /gateway* {
        reverse_proxy localhost:18789
    }
    
    # Cloudflare SSL (internal TLS)
    tls internal
    
    log {
        output file /var/log/caddy/clawdet.log
        format json
    }
}

# HTTP also works
$FULL_DOMAIN:80 {
    handle / {
        root * /var/www/html
        file_server
    }
    
    handle_path /gateway* {
        reverse_proxy localhost:18789
    }
}
EOF

# Restart Caddy
systemctl restart caddy
systemctl enable caddy

log "Caddy configured and running"

# Step 9: Create systemd service
log "Setting up OpenClaw systemd service..."

cat > /etc/systemd/system/openclaw-gateway.service <<EOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw
Environment="NODE_ENV=production"
Environment="XAI_API_KEY=$XAI_API_KEY"
Environment="OPENCLAW_STATE_DIR=/root/.openclaw"
Environment="OPENCLAW_GATEWAY_TOKEN=$GATEWAY_TOKEN"
Environment="RENTAHUMAN_API_KEY=rah_6d79a2f5e0c41cdde9ee210db41e933d"
ExecStart=/usr/bin/openclaw gateway run
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
systemctl daemon-reload
systemctl enable openclaw-gateway
systemctl start openclaw-gateway

# Wait for service to start
log "Waiting for services to start..."
sleep 5

# Step 10: Verify services
log "Verifying services..."

# Check OpenClaw
if systemctl is-active --quiet openclaw-gateway; then
    log "✅ OpenClaw gateway is running!"
else
    warn "OpenClaw gateway may not have started correctly"
    systemctl status openclaw-gateway --no-pager || true
fi

# Check Caddy
if systemctl is-active --quiet caddy; then
    log "✅ Caddy reverse proxy is running!"
else
    warn "Caddy may not have started correctly"
    systemctl status caddy --no-pager || true
fi

# Check if OpenClaw is listening
if ss -tlnp | grep -q ":18789"; then
    log "✅ OpenClaw gateway is listening on port 18789"
else
    warn "OpenClaw gateway may not be listening yet"
fi

# Check if Caddy is listening
if ss -tlnp | grep -q ":80"; then
    log "✅ Caddy is listening on port 80"
fi

if ss -tlnp | grep -q ":443"; then
    log "✅ Caddy is listening on port 443"
fi

# Step 11: Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    log "Configuring firewall..."
    ufw --force enable
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP (Caddy)
    ufw allow 443/tcp  # HTTPS (Caddy)
    log "Firewall configured (OpenClaw port 18789 is internal only)"
else
    warn "UFW not found, skipping firewall configuration"
fi

# Step 12: Final health check
log "Running final health checks..."
sleep 2

HTTP_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 || echo "000")
if [ "$HTTP_CHECK" = "200" ]; then
    log "✅ HTTP endpoint responding (Caddy → OpenClaw)"
else
    warn "HTTP endpoint returned: $HTTP_CHECK"
fi

# Display summary
log ""
log "========================================"
log "✅ OpenClaw Provisioning Complete!"
log "========================================"
log ""
log "Instance Details:"
log "  Domain:    https://$FULL_DOMAIN"
log "  User:      $USERNAME"
log "  Workspace: /root/.openclaw/workspace"
log "  Token:     ${GATEWAY_TOKEN:0:16}...${GATEWAY_TOKEN: -4}"
log ""
log "Service Management:"
log "  OpenClaw:"
log "    Status:  systemctl status openclaw-gateway"
log "    Logs:    journalctl -u openclaw-gateway -f"
log "    Restart: systemctl restart openclaw-gateway"
log ""
log "  Caddy (Reverse Proxy):"
log "    Status:  systemctl status caddy"
log "    Logs:    journalctl -u caddy -f"
log "    Restart: systemctl restart caddy"
log ""
log "Architecture:"
log "  Internet → Cloudflare (SSL) → Caddy (80/443) → OpenClaw (18789)"
log ""
log "Next Steps:"
log "  1. DNS should be configured: $SUBDOMAIN.clawdet.com"
log "  2. Cloudflare SSL proxy should be enabled"
log "  3. Test gateway: curl https://$FULL_DOMAIN"
log ""
log "🦞 Welcome to OpenClaw!"
log "========================================"

# Save token for later reference
echo "$GATEWAY_TOKEN" > /root/.openclaw/gateway-token.txt
chmod 600 /root/.openclaw/gateway-token.txt
log "Gateway token saved to: /root/.openclaw/gateway-token.txt"
