#!/bin/bash
# NanoClaw Provisioning Script for Clawdet NanoFleets
# Installs NanoClaw in a Docker container with the same UX as OpenClaw provisioning

set -e

# Configuration (passed as environment variables)
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
XAI_API_KEY="${XAI_API_KEY:-}"
USERNAME="${USERNAME:-}"
SUBDOMAIN="${SUBDOMAIN:-}"
FULL_DOMAIN="${SUBDOMAIN}.clawdet.com"
GATEWAY_TOKEN="${GATEWAY_TOKEN:-$(openssl rand -hex 32)}"
NANOCLAW_PORT="${NANOCLAW_PORT:-18789}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"; }

# Validate
[ -z "$ANTHROPIC_API_KEY" ] && [ -z "$XAI_API_KEY" ] && error "ANTHROPIC_API_KEY or XAI_API_KEY required"
[ -z "$USERNAME" ] && error "USERNAME required"
[ -z "$SUBDOMAIN" ] && error "SUBDOMAIN required"

log "Starting NanoClaw provisioning for user: $USERNAME"
log "Domain: $FULL_DOMAIN"

# ============================================================
# Step 1: System Setup
# ============================================================
log "Step 1: System update and dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git build-essential ca-certificates openssl docker.io docker-compose-v2

# Enable Docker
systemctl enable docker
systemctl start docker

# ============================================================
# Step 2: Install Node.js 22.x
# ============================================================
log "Step 2: Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
log "Node.js: $(node --version)"

# ============================================================
# Step 3: Install Caddy
# ============================================================
log "Step 3: Installing Caddy..."
if ! command -v caddy &> /dev/null; then
    apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -qq
    apt-get install -y caddy
fi
log "Caddy: $(caddy version)"

# ============================================================
# Step 4: Clone and setup NanoClaw
# ============================================================
log "Step 4: Cloning NanoClaw..."
NANOCLAW_DIR="/root/nanoclaw"
WORKSPACE_DIR="/root/nanoclaw-workspace"

if [ -d "$NANOCLAW_DIR" ]; then
    cd "$NANOCLAW_DIR" && git pull
else
    git clone https://github.com/qwibitai/nanoclaw.git "$NANOCLAW_DIR"
fi

cd "$NANOCLAW_DIR"
npm install --production 2>/dev/null || npm install

# Create workspace
mkdir -p "$WORKSPACE_DIR/memory"

# ============================================================
# Step 5: Configure NanoClaw
# ============================================================
log "Step 5: Configuring NanoClaw..."

# Determine which API key to use
if [ -n "$ANTHROPIC_API_KEY" ]; then
    AI_PROVIDER="anthropic"
    AI_KEY="$ANTHROPIC_API_KEY"
    AI_MODEL="claude-sonnet-4-5"
else
    AI_PROVIDER="xai"
    AI_KEY="$XAI_API_KEY"
    AI_MODEL="grok-2"
fi

# Create NanoClaw config
cat > "$NANOCLAW_DIR/.env" <<EOF
# NanoClaw Configuration — Provisioned by Clawdet
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
XAI_API_KEY=${XAI_API_KEY}
AI_PROVIDER=${AI_PROVIDER}
AI_MODEL=${AI_MODEL}
GATEWAY_TOKEN=${GATEWAY_TOKEN}
PORT=${NANOCLAW_PORT}
WORKSPACE_DIR=${WORKSPACE_DIR}
EOF

# Create CLAUDE.md (NanoClaw's equivalent of SOUL.md + AGENTS.md)
cat > "$WORKSPACE_DIR/CLAUDE.md" <<EOF
# Your AI Assistant — Powered by NanoClaw

You are a personal AI assistant for **${USERNAME}**.

## Who You Are
- Helpful, direct, and resourceful
- You have opinions — share them
- Skip performative helpfulness — just help
- Be concise when needed, thorough when it matters

## Your Instance
- **Domain:** https://${FULL_DOMAIN}
- **User:** ${USERNAME}
- **Provisioned:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- **Platform:** Clawdet (NanoFleets)

## Memory
- Write important things to memory/ files
- Read memory/ at start of each session
- Daily logs: memory/YYYY-MM-DD.md
- Long-term: MEMORY.md

## Safety
- Private things stay private
- Don't run destructive commands without asking
- When in doubt, ask
EOF

# Create MEMORY.md
cat > "$WORKSPACE_DIR/MEMORY.md" <<EOF
# Long-Term Memory

**User:** ${USERNAME}
**Instance:** ${FULL_DOMAIN}
**Created:** $(date -u +"%Y-%m-%d")

---

_Start adding your context below:_
EOF

# ============================================================
# Step 6: Create HTTP Chat API wrapper
# ============================================================
log "Step 6: Creating HTTP chat API..."

# Create a lightweight HTTP wrapper that provides the same 
# /v1/chat/completions endpoint as OpenClaw
cat > "$NANOCLAW_DIR/http-gateway.js" <<'HTTPEOF'
const http = require('http');
const { spawn } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.PORT || 18789;
const TOKEN = process.env.GATEWAY_TOKEN || '';
const WORKSPACE = process.env.WORKSPACE_DIR || '/root/nanoclaw-workspace';

// In-memory session store
const sessions = new Map();

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' || req.url === '/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', engine: 'nanoclaw', uptime: process.uptime() }));
    return;
  }

  // Auth check
  const auth = req.headers.authorization;
  if (TOKEN && (!auth || auth !== `Bearer ${TOKEN}`)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  // Chat completions endpoint (OpenAI-compatible)
  if (req.url === '/v1/chat/completions' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages, model, stream } = JSON.parse(body);
        const lastMessage = messages[messages.length - 1]?.content || '';
        
        // Forward to NanoClaw's process
        const response = await handleChat(lastMessage, messages);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: 'chatcmpl-' + crypto.randomUUID(),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model || process.env.AI_MODEL || 'claude-sonnet-4-5',
          choices: [{
            index: 0,
            message: { role: 'assistant', content: response },
            finish_reason: 'stop'
          }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Landing page redirect
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>NanoClaw Gateway</h1><p>Use /v1/chat/completions</p></body></html>');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

async function handleChat(message, history) {
  // Use Anthropic API directly for chat (same as NanoClaw does internally)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return 'Error: No API key configured';
  }

  const systemPrompt = require('fs').existsSync(WORKSPACE + '/CLAUDE.md') 
    ? require('fs').readFileSync(WORKSPACE + '/CLAUDE.md', 'utf8')
    : 'You are a helpful AI assistant.';

  const fetch = globalThis.fetch || require('node:fetch');
  
  const apiMessages = history.filter(m => m.role !== 'system').map(m => ({
    role: m.role,
    content: m.content
  }));

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: apiMessages
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Anthropic API error: ${resp.status} ${err}`);
  }

  const data = await resp.json();
  return data.content?.[0]?.text || 'No response';
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`NanoClaw HTTP Gateway listening on port ${PORT}`);
});
HTTPEOF

# ============================================================
# Step 7: Create landing page (same UX as OpenClaw version)
# ============================================================
log "Step 7: Creating landing page..."

mkdir -p /var/www/html

cat > /var/www/html/index.html <<LANDING
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clawdet - Your AI Assistant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #e7e9ea;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .header {
            background: #16181c;
            border-bottom: 1px solid #2f3336;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo { font-size: 28px; }
        .title {
            font-size: 20px; font-weight: 700;
            background: linear-gradient(135deg, #2EE68A 0%, #1d9bf0 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .badge {
            padding: 4px 12px;
            background: rgba(46, 230, 138, 0.1);
            border: 1px solid rgba(46, 230, 138, 0.2);
            border-radius: 100px;
            font-size: 11px;
            color: #2EE68A;
            font-weight: 600;
        }
        .status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #8899a6; }
        .status-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #2EE68A; animation: pulse 2s infinite;
        }
        .status-dot.off { background: #f91880; animation: none; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .chat-area {
            flex: 1; overflow-y: auto; padding: 24px;
            display: flex; flex-direction: column; gap: 12px;
        }
        .welcome {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; flex: 1; text-align: center; gap: 16px;
        }
        .welcome-icon { font-size: 64px; }
        .welcome h2 {
            font-size: 28px; font-weight: 700;
            background: linear-gradient(135deg, #2EE68A 0%, #1d9bf0 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .welcome p { color: #8899a6; font-size: 16px; max-width: 500px; }
        .suggestions {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px; width: 100%; max-width: 700px; margin-top: 16px;
        }
        .suggestion {
            background: rgba(255,255,255,0.03); border: 1px solid #2f3336;
            border-radius: 12px; padding: 16px; cursor: pointer;
            text-align: left; transition: all 0.2s;
        }
        .suggestion:hover { border-color: #2EE68A; background: rgba(46,230,138,0.03); }
        .suggestion-icon { font-size: 20px; margin-bottom: 8px; }
        .suggestion-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .suggestion-text { font-size: 12px; color: #8899a6; }
        .msg {
            max-width: 75%; padding: 14px 18px; border-radius: 18px;
            line-height: 1.6; word-wrap: break-word; white-space: pre-wrap; font-size: 15px;
        }
        .msg.user {
            align-self: flex-end; background: #2EE68A; color: #0a0a0a;
            border-bottom-right-radius: 4px;
        }
        .msg.assistant {
            align-self: flex-start; background: #16181c; border: 1px solid #2f3336;
            border-bottom-left-radius: 4px;
        }
        .msg.system { align-self: center; color: #8899a6; font-size: 13px; }
        .typing { align-self: flex-start; display: flex; gap: 5px; padding: 14px 18px;
            background: #16181c; border: 1px solid #2f3336; border-radius: 18px; }
        .typing span {
            width: 7px; height: 7px; border-radius: 50%; background: #8899a6;
            animation: bounce 1.4s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-8px); } }
        .input-area {
            background: #16181c; border-top: 1px solid #2f3336;
            padding: 16px 24px; flex-shrink: 0;
        }
        .input-wrap {
            display: flex; gap: 10px; align-items: center;
            background: #0a0a0a; border: 2px solid #2f3336;
            border-radius: 24px; padding: 4px 4px 4px 18px;
            transition: border-color 0.2s;
        }
        .input-wrap:focus-within { border-color: #2EE68A; }
        #input {
            flex: 1; background: transparent; border: none; color: #e7e9ea;
            font-size: 15px; padding: 10px 0; outline: none;
        }
        #input::placeholder { color: #71767b; }
        #send {
            width: 40px; height: 40px; border-radius: 50%;
            background: #2EE68A; border: none; color: #0a0a0a;
            font-size: 18px; cursor: pointer; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s;
        }
        #send:hover:not(:disabled) { transform: scale(1.05); }
        #send:disabled { opacity: 0.4; cursor: not-allowed; }
        @media (max-width: 768px) {
            .msg { max-width: 88%; }
            .suggestions { grid-template-columns: 1fr 1fr; }
            .header { padding: 12px 16px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            <span class="logo">🐾</span>
            <span class="title">Clawdet</span>
            <span class="badge">NanoClaw</span>
        </div>
        <div class="status">
            <div class="status-dot" id="dot"></div>
            <span id="statusTxt">Connecting...</span>
        </div>
    </div>
    <div class="chat-area" id="chat">
        <div class="welcome" id="welcome">
            <div class="welcome-icon">🐾</div>
            <h2>Welcome to Your Clawdet</h2>
            <p>Your personal AI assistant powered by NanoClaw. Ask me anything!</p>
            <div class="suggestions">
                <div class="suggestion" onclick="ask('Search the web for the latest AI news')">
                    <div class="suggestion-icon">🌐</div>
                    <div class="suggestion-title">Browse the Web</div>
                    <div class="suggestion-text">Search for info and updates</div>
                </div>
                <div class="suggestion" onclick="ask('Help me write a Python script')">
                    <div class="suggestion-icon">💻</div>
                    <div class="suggestion-title">Code Assistant</div>
                    <div class="suggestion-text">Write, debug, explain code</div>
                </div>
                <div class="suggestion" onclick="ask('What can you help me with?')">
                    <div class="suggestion-icon">✨</div>
                    <div class="suggestion-title">Explore Features</div>
                    <div class="suggestion-text">See what I can do</div>
                </div>
                <div class="suggestion" onclick="ask('Tell me a fun fact')">
                    <div class="suggestion-icon">🎲</div>
                    <div class="suggestion-title">Fun Fact</div>
                    <div class="suggestion-text">Learn something new</div>
                </div>
            </div>
        </div>
    </div>
    <div class="input-area">
        <div class="input-wrap">
            <input type="text" id="input" placeholder="Message your AI assistant..." disabled>
            <button id="send" disabled>▶</button>
        </div>
    </div>
    <script>
        const TOKEN = '${GATEWAY_TOKEN}';
        const chat = document.getElementById('chat');
        const input = document.getElementById('input');
        const send = document.getElementById('send');
        const dot = document.getElementById('dot');
        const statusTxt = document.getElementById('statusTxt');
        const welcome = document.getElementById('welcome');
        let history = [];

        // Check health
        fetch('/v1/health', { headers: { 'Authorization': 'Bearer ' + TOKEN } })
            .then(r => r.json())
            .then(() => {
                dot.classList.remove('off');
                statusTxt.textContent = 'Connected';
                input.disabled = false;
                send.disabled = false;
                input.focus();
            })
            .catch(() => {
                dot.classList.add('off');
                statusTxt.textContent = 'Offline';
            });

        function addMsg(text, role) {
            if (welcome.style.display !== 'none') welcome.style.display = 'none';
            const d = document.createElement('div');
            d.className = 'msg ' + role;
            d.textContent = text;
            chat.appendChild(d);
            chat.scrollTop = chat.scrollHeight;
        }

        function addTyping() {
            const d = document.createElement('div');
            d.className = 'typing'; d.id = 'typing';
            d.innerHTML = '<span></span><span></span><span></span>';
            chat.appendChild(d);
            chat.scrollTop = chat.scrollHeight;
        }

        function removeTyping() {
            const t = document.getElementById('typing');
            if (t) t.remove();
        }

        async function sendMsg() {
            const msg = input.value.trim();
            if (!msg) return;
            input.value = '';
            addMsg(msg, 'user');
            history.push({ role: 'user', content: msg });
            addTyping();
            try {
                const res = await fetch('/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + TOKEN
                    },
                    body: JSON.stringify({ messages: history, model: 'claude-sonnet-4-5' })
                });
                const data = await res.json();
                removeTyping();
                const reply = data.choices?.[0]?.message?.content || data.error || 'No response';
                addMsg(reply, 'assistant');
                history.push({ role: 'assistant', content: reply });
            } catch(e) {
                removeTyping();
                addMsg('Error: ' + e.message, 'system');
            }
        }

        function ask(text) { input.value = text; sendMsg(); }
        send.addEventListener('click', sendMsg);
        input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
    </script>
</body>
</html>
LANDING

log "Landing page created"

# ============================================================
# Step 8: Configure Caddy
# ============================================================
log "Step 8: Configuring Caddy..."

cat > /etc/caddy/Caddyfile <<EOF
${FULL_DOMAIN} {
    handle /v1/* {
        reverse_proxy localhost:${NANOCLAW_PORT}
    }
    handle {
        root * /var/www/html
        try_files {path} /index.html
        file_server
    }
    tls internal
}

${FULL_DOMAIN}:80 {
    handle /v1/* {
        reverse_proxy localhost:${NANOCLAW_PORT}
    }
    handle {
        root * /var/www/html
        try_files {path} /index.html
        file_server
    }
}
EOF

systemctl restart caddy
systemctl enable caddy
log "Caddy configured"

# ============================================================
# Step 9: Create systemd service
# ============================================================
log "Step 9: Creating systemd service..."

cat > /etc/systemd/system/nanoclaw-gateway.service <<EOF
[Unit]
Description=NanoClaw HTTP Gateway
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${NANOCLAW_DIR}
EnvironmentFile=${NANOCLAW_DIR}/.env
ExecStart=/usr/bin/node ${NANOCLAW_DIR}/http-gateway.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nanoclaw-gateway
systemctl start nanoclaw-gateway

sleep 3

# ============================================================
# Step 10: Verify
# ============================================================
log "Step 10: Verifying services..."

if systemctl is-active --quiet nanoclaw-gateway; then
    log "✅ NanoClaw gateway is running!"
else
    warn "NanoClaw gateway may not have started"
    systemctl status nanoclaw-gateway --no-pager || true
fi

if systemctl is-active --quiet caddy; then
    log "✅ Caddy is running!"
fi

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${GATEWAY_TOKEN}" http://localhost:${NANOCLAW_PORT}/health)
if [ "$HEALTH" = "200" ]; then
    log "✅ Health endpoint responding!"
else
    warn "Health check returned: $HEALTH"
fi

# ============================================================
# Summary
# ============================================================
log ""
log "========================================"
log "✅ NanoClaw Provisioning Complete!"
log "========================================"
log ""
log "Instance Details:"
log "  Domain:    https://${FULL_DOMAIN}"
log "  User:      ${USERNAME}"
log "  Engine:    NanoClaw"
log "  Workspace: ${WORKSPACE_DIR}"
log "  Token:     ${GATEWAY_TOKEN:0:16}...${GATEWAY_TOKEN: -4}"
log ""
log "Services:"
log "  NanoClaw:  systemctl status nanoclaw-gateway"
log "  Caddy:     systemctl status caddy"
log "  Logs:      journalctl -u nanoclaw-gateway -f"
log ""
log "API:"
log "  Chat:      POST /v1/chat/completions"
log "  Health:    GET /v1/health"
log "  Auth:      Bearer ${GATEWAY_TOKEN:0:8}..."
log ""
log "🐾 Welcome to NanoClaw on Clawdet!"
log "========================================"

echo "$GATEWAY_TOKEN" > /root/nanoclaw-gateway-token.txt
chmod 600 /root/nanoclaw-gateway-token.txt
