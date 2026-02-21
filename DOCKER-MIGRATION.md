# Docker-Based Provisioning Migration Guide

**Date:** 2026-02-21  
**Status:** Ready for Testing

---

## 🎯 What Changed

### Before: Build from Source
```bash
# Old provisioning (5-10 minutes):
ssh root@vps "
  git clone https://github.com/openclaw/openclaw
  cd openclaw
  npm install    # 3-5 min
  npm run build  # 2-4 min
  openclaw gateway --port 18789
"
```

### After: Pre-Built Docker Images
```bash
# New provisioning (2-3 minutes):
curl -fsSL https://clawdet.com/provision.sh | bash -s -- \
  --customer-id user123 \
  --api-key sk-ant-... \
  --subdomain user123.clawdet.com \
  --gateway-token <token> \
  --plan pro

# Docker pulls image + starts in 90 seconds
```

**Time Saved:** 50-70% faster deploys

---

## 📦 New Components

### 1. Provision Script
**Location:** `/root/.openclaw/workspace/clawdet/scripts/provision.sh`

**Features:**
- Auto-installs Docker if needed
- Pulls pre-built image (coollabsio/openclaw)
- Creates docker-compose.yml from template
- Generates .env file
- Starts container
- Waits for health check
- Returns access credentials

### 2. Docker Provisioning Library
**Location:** `/root/.openclaw/workspace/clawdet/lib/docker-provisioning.ts`

**Functions:**
- `provisionDockerInstance()` — Main provisioning function
- `checkInstanceHealth()` — Health check via /healthz
- `restartInstance()` — Restart via docker compose
- `getInstanceLogs()` — Fetch container logs

### 3. Environment Config System
**Location:** `/root/.openclaw/workspace/clawdet/lib/instance-env.ts`

**Functions:**
- `generateCustomerEnv()` — Customer data → env vars
- `formatEnvFile()` — Env vars → .env file
- `getResourceLimits()` — CPU/memory limits per tier
- `validateCustomerConfig()` — Config validation

### 4. Tiered Templates
**Location:** `/root/.openclaw/workspace/clawdet/templates/`

Files:
- `docker-compose.free.yml` — Multi-tenant (0.5 CPU, 512MB)
- `docker-compose.pro.yml` — Dedicated (2 CPU, 2GB)
- `docker-compose.enterprise.yml` — Full featured (4 CPU, 4GB + browser)

### 5. Health Monitoring
**Location:** `/root/.openclaw/workspace/clawdet/lib/health.ts`

**Functions:**
- `checkInstanceHealth()` — Single instance check
- `checkMultipleInstances()` — Batch checks
- `monitorAndRestart()` — Auto-restart on failure
- `healthCheckCron()` — Cron job handler
- `recordHealthStatus()` — Track in database

---

## 🚀 Migration Steps

### Phase 1: Testing (Week 1)
1. **Test provision script locally:**
   ```bash
   cd /root/.openclaw/workspace/clawdet/scripts
   ./provision.sh --customer-id test1 \
     --api-key sk-ant-... \
     --subdomain test1.local \
     --gateway-token $(openssl rand -hex 32) \
     --plan pro
   ```

2. **Test on staging VPS:**
   - Provision test instance
   - Verify health check works
   - Test restart functionality
   - Check logs

3. **Deploy to 5-10 new customers:**
   - Monitor closely
   - Collect feedback
   - Fix issues quickly

### Phase 2: Production Rollout (Week 2)
1. **Update provisioning API:**
   ```typescript
   // /root/.openclaw/workspace/clawdet/app/api/provisioning/start/route.ts
   
   import { provisionDockerInstance } from '@/lib/docker-provisioning'
   import { generateCustomerEnv } from '@/lib/instance-env'
   
   // Replace old provisioning:
   const result = await provisionDockerInstance({
     customerId: user.id,
     apiKey: user.apiKey,
     subdomain: `${user.username}.clawdet.com`,
     gatewayToken: generateToken(),
     plan: user.plan,
     vpsIp: vps.ip,
   })
   ```

2. **Switch all new signups to Docker**

3. **Update health check cron:**
   ```typescript
   // Use new health.ts functions
   import { healthCheckCron } from '@/lib/health'
   
   const instances = await getActiveInstances() // from database
   await healthCheckCron(instances)
   ```

### Phase 3: Optional Migration (Existing Customers)
**Only if needed** — existing customers work fine as-is

If migrating:
1. Schedule maintenance window
2. Backup customer data
3. Re-provision using Docker
4. Restore data
5. Update DNS (zero downtime)

---

## 🎨 Tier Comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Deployment** | Multi-tenant VPS | Dedicated VPS | Dedicated VPS |
| **CPU** | 0.5 cores | 2 cores | 4 cores |
| **Memory** | 512MB | 2GB | 4GB |
| **Model** | Claude Sonnet 4-5 | Claude Opus 4-5 | Claude Opus 4-5 |
| **Sessions** | Max 5 | Unlimited | Unlimited |
| **Workspace** | 100MB | Unlimited | Unlimited |
| **Browser Automation** | ❌ | ❌ | ✅ |
| **Telegram** | ❌ | ✅ | ✅ |
| **Cost (Infrastructure)** | $0.50/mo | $7/mo | $15/mo |

---

## 🔧 Troubleshooting

### Provision Script Fails
```bash
# Check logs:
ssh root@vps "cd /opt/clawdet && docker compose logs"

# Manual restart:
ssh root@vps "cd /opt/clawdet && docker compose restart"

# Check health:
curl https://username.clawdet.com/healthz
```

### Health Check Fails
```bash
# Check if container is running:
ssh root@vps "docker ps"

# Check container logs:
ssh root@vps "docker logs clawdet-openclaw-1"

# Restart:
ssh root@vps "cd /opt/clawdet && docker compose restart"
```

### Image Pull Fails
```bash
# Retry with force pull:
ssh root@vps "docker pull coollabsio/openclaw:latest --platform linux/amd64"
```

---

## 📊 Monitoring

### Health Check Dashboard
Track in database:
```sql
CREATE TABLE instance_health (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  healthy BOOLEAN NOT NULL,
  response_time INTEGER, -- milliseconds
  error TEXT,
  checked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instance_health_customer ON instance_health(customer_id);
CREATE INDEX idx_instance_health_time ON instance_health(checked_at DESC);
```

### Metrics to Track
- Deploy time (should be 2-3 min)
- Health check pass rate (should be >99%)
- Auto-restart success rate
- Average response time

---

## 🎬 Next Steps

1. ✅ Test provision script
2. ⏳ Deploy to 5-10 customers
3. ⏳ Monitor for 1 week
4. ⏳ Full production rollout
5. ⏳ (Optional) Migrate existing customers
6. ⏳ Launch free tier (multi-tenant)

---

**Questions or Issues?**
Check logs, test locally, reach out for support.
