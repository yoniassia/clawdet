# Docker & Deployment Improvements for Clawdet

**Analysis Date:** 2026-02-21  
**Research:** coollabsio/openclaw, phioranex/openclaw-docker, chrisbattarbee/openclaw-helm

---

## 🎯 Executive Summary

After analyzing three major OpenClaw deployment projects, here are **high-impact, low-effort improvements** we can adopt immediately:

### Quick Wins (1-2 weeks)
1. **Pre-built Docker images** — Use coollabsio/openclaw instead of building from source
2. **One-line provisioning** — Adapt phioranex's install script for customer VPS
3. **Environment-driven config** — Adopt coollabsio's env→JSON configuration pattern
4. **Health checks & monitoring** — Copy their nginx proxy + healthcheck patterns

### Medium-Term (1-2 months)
5. **Docker Compose templates** — Pre-configured stacks per tier (free, pro, enterprise)
6. **Auto-updates** — GitHub Actions workflow for image rebuilds
7. **Browser sidecar option** — CDP + VNC for customers needing browser automation

### Future Consideration (6+ months)
8. **Helm charts for K8s** — When hitting 500+ customers and need orchestration

---

## 📦 What Each Project Does Well

### 1. **coollabsio/openclaw** — Production-Ready Images

**Strengths:**
- ✅ **Pre-built images** (no compile time, 90% faster deploys)
- ✅ **Auto-rebuilds** every 6h for latest OpenClaw version
- ✅ **nginx reverse proxy** with HTTP basic auth
- ✅ **Environment-driven config** (75+ env vars → openclaw.json)
- ✅ **Browser sidecar** (KasmWeb + Chrome CDP for automation)
- ✅ **Hooks support** (webhooks bypass auth, validated by token)
- ✅ **Multi-provider support** (30+ LLM providers auto-detected)
- ✅ **Healthcheck** endpoint (`/healthz`) with startup grace period
- ✅ **Multi-arch** (amd64 + arm64)

**Key Files:**
- `Dockerfile.base` — Builds OpenClaw from source (cached layer)
- `Dockerfile` — Adds nginx + config scripts
- `scripts/entrypoint.sh` — Smart initialization (validates keys, merges config, starts services)
- `scripts/configure.js` — Env vars → openclaw.json (declarative)
- `.github/workflows/auto-update.yml` — Auto-rebuild on new releases

**What We Can Adopt:**
```yaml
# Use their image instead of building:
image: coollabsio/openclaw:latest

# Benefits for clawdet:
# - Deploy in 2-3 min (vs 5-10 min build time)
# - Auto-updates (just pull latest)
# - Battle-tested nginx config
# - Built-in auth layer
```

---

### 2. **phioranex/openclaw-docker** — One-Line Installs

**Strengths:**
- ✅ **One-line installer** (curl | bash)
- ✅ **Cross-platform** (Linux, macOS, Windows PowerShell)
- ✅ **Smart onboarding** (interactive config wizard)
- ✅ **Persistent volumes** pre-configured
- ✅ **Uninstall script** (clean teardown)
- ✅ **Daily rebuilds** + release checks every 6h
- ✅ **Docker Compose** template included

**Key Files:**
- `install.sh` — Checks Docker, pulls image, runs onboarding, starts container
- `install.ps1` — Windows equivalent
- `uninstall.sh` — Clean removal
- `docker-compose.yml` — Production-ready Compose file

**What We Can Adopt:**
```bash
# For customer VPS provisioning:
# 1. SSH into new Hetzner VPS
# 2. Run our version of their install script:

curl -fsSL https://provision.clawdet.com/install.sh | bash -s -- \
  --customer-id user123 \
  --api-key sk-ant-... \
  --subdomain user123.clawdet.com

# Benefits:
# - 80% less provisioning code
# - Standard deployment across all VPS
# - Easy rollback/updates
```

**Installer Flow:**
1. Check prerequisites (Docker installed?)
2. Pull image (`coollabsio/openclaw:latest`)
3. Create directories (`~/.openclaw`, `~/workspace`)
4. Generate `.env` from customer data
5. Run `docker compose up -d`
6. Health check + DNS update
7. Done! (2-3 min total)

---

### 3. **chrisbattarbee/openclaw-helm** — Kubernetes-Ready

**Strengths:**
- ✅ **Production Helm chart** (follows best practices)
- ✅ **Security hardening** (non-root, seccomp, read-only FS)
- ✅ **PVC persistence** (5Gi+ for state/workspace)
- ✅ **Chromium sidecar** integration
- ✅ **Ingress support** (subdomain routing)
- ✅ **Resource limits** (CPU/memory requests/limits)
- ✅ **ConfigMap + Secrets** pattern
- ✅ **Multi-agent configuration** via values.yaml

**Key Files:**
- `charts/openclaw/values.yaml` — All configuration options
- `charts/openclaw/templates/deployment.yaml` — Pod spec
- `charts/openclaw/templates/pvc.yaml` — Persistent storage
- `charts/openclaw/templates/ingress.yaml` — Subdomain routing

**What We Can Adopt (Future):**
```yaml
# When we hit 500+ customers and need K8s:
helm install clawdet-user123 openclaw/openclaw \
  --set credentials.anthropicApiKey=sk-ant-... \
  --set credentials.gatewayToken=token123 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=user123.clawdet.com

# Benefits:
# - Auto-scaling (HPA)
# - HA + multi-AZ
# - Centralized monitoring
# - GitOps with ArgoCD
```

**Not Needed Yet:** 
- Only consider K8s after 500+ customers
- Current VPS approach works until then

---

## 🚀 Immediate Action Plan

### Phase 1: Switch to Pre-Built Images (1 week)

**Goal:** Deploy 90% faster using `coollabsio/openclaw`

**Implementation:**

#### 1.1 Update Provisioning Code

```typescript
// OLD: /root/.openclaw/workspace/clawdet/lib/provision.ts
async function provisionInstance(userId: string, apiKey: string) {
  const vps = await createHetznerServer({ ... })
  await sshExec(vps.ip, `
    git clone https://github.com/openclaw/openclaw
    cd openclaw && npm install && npm run build
    openclaw gateway --port 18789
  `) // ❌ 5-10 min build time
}

// NEW: Use Docker + coollabsio image
async function provisionInstance(userId: string, apiKey: string) {
  const vps = await createHetznerServer({ ... })
  
  // Install Docker (if needed)
  await sshExec(vps.ip, `
    command -v docker || curl -fsSL https://get.docker.com | sh
  `)
  
  // Deploy with our script
  await sshExec(vps.ip, `
    curl -fsSL https://clawdet.com/provision.sh | bash -s -- \\
      --customer-id ${userId} \\
      --api-key ${apiKey} \\
      --subdomain ${userId}.clawdet.com \\
      --gateway-token ${generateToken()}
  `)
  // ✅ 2-3 min deploy time
}
```

#### 1.2 Create provision.sh Script

```bash
# /root/.openclaw/workspace/clawdet/scripts/provision.sh

#!/bin/bash
set -e

CUSTOMER_ID=""
API_KEY=""
SUBDOMAIN=""
GATEWAY_TOKEN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --customer-id) CUSTOMER_ID="$2"; shift 2 ;;
    --api-key) API_KEY="$2"; shift 2 ;;
    --subdomain) SUBDOMAIN="$2"; shift 2 ;;
    --gateway-token) GATEWAY_TOKEN="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

# Create config directory
mkdir -p /opt/clawdet && cd /opt/clawdet

# Write docker-compose.yml
cat > docker-compose.yml <<EOF
services:
  openclaw:
    image: coollabsio/openclaw:latest
    ports:
      - "80:8080"
    environment:
      - ANTHROPIC_API_KEY=${API_KEY}
      - AUTH_PASSWORD=${GATEWAY_TOKEN}
      - OPENCLAW_GATEWAY_TOKEN=${GATEWAY_TOKEN}
      - OPENCLAW_PRIMARY_MODEL=anthropic/claude-sonnet-4-5
    volumes:
      - openclaw-data:/data
    restart: unless-stopped
    
volumes:
  openclaw-data:
EOF

# Start container
docker compose up -d

# Wait for health check
echo "Waiting for OpenClaw to start..."
for i in {1..60}; do
  if curl -sf http://localhost/healthz > /dev/null; then
    echo "✅ OpenClaw ready!"
    echo "🌐 Access at: https://${SUBDOMAIN}"
    exit 0
  fi
  sleep 2
done

echo "❌ Health check timeout"
exit 1
```

**Deploy Script:**
```bash
# Upload to clawdet.com
scp scripts/provision.sh root@188.34.197.212:/var/www/clawdet/provision.sh

# Update nginx to serve it
location /provision.sh {
  alias /var/www/clawdet/provision.sh;
  default_type text/plain;
}
```

---

### Phase 2: Environment-Driven Configuration (1 week)

**Goal:** Simplify config management, use env vars instead of JSON files

**What to Adopt from coollabsio:**

```typescript
// Instead of manually editing openclaw.json:
const config = {
  agents: { defaults: { model: 'anthropic/claude-sonnet-4-5' } },
  gateway: { token: gatewayToken },
  // ... 200 more lines
}
await writeFile('openclaw.json', JSON.stringify(config))

// Use their pattern: env vars → config
const env = {
  ANTHROPIC_API_KEY: customerKey,
  OPENCLAW_PRIMARY_MODEL: 'anthropic/claude-sonnet-4-5',
  OPENCLAW_GATEWAY_TOKEN: gatewayToken,
  AUTH_PASSWORD: customerPassword,
  // Simple, declarative, portable
}
```

**Benefits:**
- ✅ Customer configs are portable (just env vars)
- ✅ Easy to migrate (no JSON parsing)
- ✅ Standard across Docker/VPS/K8s
- ✅ Secret management easier (env = secrets)

**Implementation:**
```typescript
// /root/.openclaw/workspace/clawdet/lib/instance-config.ts

export function generateCustomerEnv(customer: Customer): Record<string, string> {
  return {
    // Required
    ANTHROPIC_API_KEY: customer.apiKey,
    OPENCLAW_GATEWAY_TOKEN: customer.gatewayToken,
    AUTH_PASSWORD: customer.password,
    
    // Model
    OPENCLAW_PRIMARY_MODEL: customer.plan === 'pro' 
      ? 'anthropic/claude-opus-4-5' 
      : 'anthropic/claude-sonnet-4-5',
    
    // Channels (if enabled)
    ...(customer.telegram && {
      TELEGRAM_BOT_TOKEN: customer.telegram.token,
      TELEGRAM_DM_POLICY: 'pairing',
    }),
    
    // Storage
    OPENCLAW_STATE_DIR: '/data/.openclaw',
    OPENCLAW_WORKSPACE_DIR: '/data/workspace',
  }
}

// Write to .env file on VPS:
const envContent = Object.entries(env)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n')

await sshExec(vpsIp, `cat > /opt/clawdet/.env <<'EOF'\n${envContent}\nEOF`)
```

---

### Phase 3: Health Monitoring & Auto-Recovery (1 week)

**Goal:** Detect issues faster, auto-restart failed instances

**What to Adopt:**

#### 3.1 Standardized Health Endpoint

```typescript
// Current: Manual PM2 checks
pm2 list | grep online

// New: Use /healthz endpoint (coollabsio provides this)
async function checkInstanceHealth(subdomain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${subdomain}/healthz`, {
      timeout: 5000
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

// Run hourly (already have cron)
// Add to existing health-check.sh:
for customer in $(psql -t -c "SELECT subdomain FROM instances"); do
  if ! curl -sf https://${customer}/healthz > /dev/null; then
    echo "❌ ${customer} unhealthy, restarting..."
    ssh root@${customer_ip} "cd /opt/clawdet && docker compose restart"
  fi
done
```

#### 3.2 Docker Auto-Restart

```yaml
# In docker-compose.yml:
services:
  openclaw:
    restart: unless-stopped  # ✅ Auto-restart on crash
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s
```

**Benefits:**
- ✅ Containers auto-restart on crash
- ✅ Health checks catch hung processes
- ✅ Less manual intervention

---

### Phase 4: Tiered Deployment Templates (2 weeks)

**Goal:** Different configs for free/pro/enterprise tiers

**Create Docker Compose Templates:**

```bash
# /root/.openclaw/workspace/clawdet/templates/

templates/
├── docker-compose.free.yml     # Shared VPS (resource limits)
├── docker-compose.pro.yml      # Dedicated VPS
└── docker-compose.enterprise.yml  # + Browser sidecar + extras
```

#### Free Tier (Multi-Tenant)
```yaml
# docker-compose.free.yml
services:
  openclaw-user1:
    image: coollabsio/openclaw:latest
    ports:
      - "18790:8080"  # Unique port per user
    environment:
      - ANTHROPIC_API_KEY=${USER1_KEY}
      - OPENCLAW_GATEWAY_TOKEN=${USER1_TOKEN}
      - AUTH_PASSWORD=${USER1_PASSWORD}
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    volumes:
      - user1-data:/data
    restart: unless-stopped
    
  openclaw-user2:
    image: coollabsio/openclaw:latest
    ports:
      - "18791:8080"
    # ... same pattern
    
volumes:
  user1-data:
  user2-data:
```

#### Pro Tier (Dedicated)
```yaml
# docker-compose.pro.yml
services:
  openclaw:
    image: coollabsio/openclaw:latest
    ports:
      - "80:8080"
    environment:
      - ANTHROPIC_API_KEY=${CUSTOMER_KEY}
      - OPENCLAW_PRIMARY_MODEL=anthropic/claude-opus-4-5  # Better model
      - OPENCLAW_GATEWAY_TOKEN=${GATEWAY_TOKEN}
      - AUTH_PASSWORD=${PASSWORD}
    volumes:
      - openclaw-data:/data
    restart: unless-stopped
    
volumes:
  openclaw-data:
```

#### Enterprise Tier (+ Browser)
```yaml
# docker-compose.enterprise.yml
services:
  openclaw:
    image: coollabsio/openclaw:latest
    ports:
      - "80:8080"
    environment:
      - ANTHROPIC_API_KEY=${CUSTOMER_KEY}
      - OPENCLAW_PRIMARY_MODEL=anthropic/claude-opus-4-5
      - OPENCLAW_GATEWAY_TOKEN=${GATEWAY_TOKEN}
      - BROWSER_CDP_URL=http://browser:9223  # Enable browser automation
    depends_on:
      - browser
    volumes:
      - openclaw-data:/data
    restart: unless-stopped
    
  browser:
    image: coollabsio/openclaw-browser:latest
    environment:
      - CHROME_CLI=--remote-debugging-port=9222
    volumes:
      - browser-data:/config
    shm_size: 2g
    restart: unless-stopped
    
volumes:
  openclaw-data:
  browser-data:
```

**Provisioning Logic:**
```typescript
function getDockerComposeTemplate(plan: string): string {
  switch (plan) {
    case 'free': return 'docker-compose.free.yml'
    case 'pro': return 'docker-compose.pro.yml'
    case 'enterprise': return 'docker-compose.enterprise.yml'
    default: return 'docker-compose.pro.yml'
  }
}

await sshExec(vpsIp, `
  curl -o docker-compose.yml https://clawdet.com/templates/${getTemplate(plan)}
`)
```

---

## 📊 Impact Summary

| Change | Effort | Impact | Time Saved | Cost Saved |
|--------|--------|--------|------------|------------|
| **Pre-built images** | Low | High | 50-70% deploy time | - |
| **Env-driven config** | Low | Medium | Easier management | - |
| **Health monitoring** | Low | High | Fewer outages | - |
| **Tiered templates** | Medium | High | Enable free tier | $6k/month at scale |
| **One-line provisioning** | Medium | High | 80% less code | Dev time |

---

## 🎬 Implementation Roadmap

### Week 1-2: Foundation
- [x] Research complete (this doc)
- [ ] Test `coollabsio/openclaw` locally
- [ ] Create `provision.sh` script
- [ ] Update provisioning code to use Docker
- [ ] Deploy to 1 test customer

### Week 3-4: Templates & Health
- [ ] Create tier templates (free/pro/enterprise)
- [ ] Implement health checks
- [ ] Add auto-restart logic
- [ ] Test multi-tenant on one VPS

### Week 5-6: Production Rollout
- [ ] Migrate existing customers to Docker (optional)
- [ ] Switch new signups to Docker provisioning
- [ ] Monitor for issues
- [ ] Document new deployment process

### Month 2-3: Free Tier
- [ ] Setup shared VPS for free tier
- [ ] Implement multi-tenant routing (Traefik/Caddy)
- [ ] Launch forever-free tier
- [ ] Monitor resource usage

---

## 🔧 Next Steps

**Decision Point:**
1. **Start with coollabsio images?** (Recommended: Yes)
2. **Deploy shared VPS for free tier?** (Recommended: Later, after 100+ paid)
3. **Switch all new customers to Docker?** (Recommended: Yes, test with 10 first)

**What to Build First:**
1. `provision.sh` script
2. Update clawdet provisioning API
3. Test with 5-10 new signups
4. Monitor for 1 week
5. Full rollout if stable

---

**Research Sources:**
- https://github.com/coollabsio/openclaw
- https://github.com/phioranex/openclaw-docker
- https://github.com/chrisbattarbee/openclaw-helm
