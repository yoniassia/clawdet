#!/bin/bash
# OpenClaw Provisioning Script for ClawDet
# This script installs and configures OpenClaw on a fresh Ubuntu VPS

set -e  # Exit on any error

# Configuration (passed as environment variables)
XAI_API_KEY="${XAI_API_KEY:-}"
USERNAME="${USERNAME:-}"
SUBDOMAIN="${SUBDOMAIN:-}"
FULL_DOMAIN="${SUBDOMAIN}.clawdet.com"

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

# Step 1: System Update
log "Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git build-essential ca-certificates

# Step 2: Install Node.js 22.x (LTS)
log "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
log "Node.js installed: $NODE_VERSION"

# Step 3: Install OpenClaw
log "Installing OpenClaw..."
npm install -g openclaw@latest --silent

OPENCLAW_VERSION=$(openclaw version 2>&1 || echo "unknown")
log "OpenClaw installed: $OPENCLAW_VERSION"

# Step 4: Create workspace directory
log "Setting up workspace..."
mkdir -p /root/.openclaw/workspace/memory
mkdir -p /root/.openclaw/config

# Step 5: Create workspace files
log "Creating workspace files..."

# USER.md
cat > /root/.openclaw/workspace/USER.md <<EOF
# USER.md - About Your Human

**Name:** $USERNAME
**Timezone:** UTC
**Instance:** $FULL_DOMAIN
**Provisioned:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Context

This is your personal OpenClaw instance, provisioned via ClawDet.

You have access to Grok AI (xAI) for conversations and tasks.
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

# Create empty MEMORY.md
touch /root/.openclaw/workspace/MEMORY.md
touch /root/.openclaw/workspace/HEARTBEAT.md
touch /root/.openclaw/workspace/TOOLS.md

# Step 6: Create OpenClaw configuration
log "Configuring OpenClaw gateway..."

cat > /root/.openclaw/config/gateway.yaml <<EOF
# OpenClaw Gateway Configuration
# Provisioned by ClawDet

# Domain configuration
domain: $FULL_DOMAIN
port: 18789

# AI Model Configuration
model:
  default: "anthropic/claude-sonnet-4-5"
  
providers:
  xai:
    apiKey: "$XAI_API_KEY"
  anthropic:
    apiKey: "$XAI_API_KEY"  # Using xAI key for now

# Workspace
workspace: /root/.openclaw/workspace

# Session settings
session:
  type: main
  history:
    maxMessages: 100
    
# Logging
logging:
  level: info
  file: /root/.openclaw/logs/gateway.log

# Security
security:
  allowedOrigins:
    - "https://$FULL_DOMAIN"
    - "http://localhost:*"
EOF

# Step 7: Create systemd service
log "Setting up systemd service..."

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
ExecStart=/usr/bin/openclaw gateway start --config /root/.openclaw/config/gateway.yaml
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
sleep 3

# Check service status
if systemctl is-active --quiet openclaw-gateway; then
    log "✅ OpenClaw gateway is running!"
else
    warn "OpenClaw gateway may not have started correctly"
    systemctl status openclaw-gateway --no-pager || true
fi

# Step 8: Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    log "Configuring firewall..."
    ufw --force enable
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw allow 18789/tcp # OpenClaw Gateway
    log "Firewall configured"
else
    warn "UFW not found, skipping firewall configuration"
fi

# Step 9: Final checks
log "Running final checks..."

# Check if OpenClaw is listening
if netstat -tuln 2>/dev/null | grep -q ":18789"; then
    log "✅ OpenClaw gateway is listening on port 18789"
else
    warn "OpenClaw gateway may not be listening yet (this is normal if starting)"
fi

# Display summary
log ""
log "========================================"
log "✅ OpenClaw Provisioning Complete!"
log "========================================"
log ""
log "Instance Details:"
log "  Domain: https://$FULL_DOMAIN"
log "  Gateway: https://$FULL_DOMAIN:18789"
log "  User: $USERNAME"
log "  Workspace: /root/.openclaw/workspace"
log ""
log "Service Management:"
log "  Status:  systemctl status openclaw-gateway"
log "  Logs:    journalctl -u openclaw-gateway -f"
log "  Restart: systemctl restart openclaw-gateway"
log ""
log "Next Steps:"
log "  1. Verify DNS: $SUBDOMAIN.clawdet.com → $(curl -s ifconfig.me)"
log "  2. Configure Cloudflare SSL proxy"
log "  3. Test gateway: curl https://$FULL_DOMAIN:18789/health"
log ""
log "🦞 Welcome to OpenClaw!"
log "========================================"
