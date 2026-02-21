# Docker Instance Manager Skill

**Purpose:** Manage customer Docker instances (health checks, restarts, logs, updates)

## Commands

### Check Instance Health
```bash
node skills/docker-manager/check-health.js --customer-id user123
# or check all:
node skills/docker-manager/check-health.js --all
```

### Restart Instance
```bash
node skills/docker-manager/restart.js --customer-id user123
```

### Get Logs
```bash
node skills/docker-manager/logs.js --customer-id user123 --lines 100
```

### Update Instance (pull latest image)
```bash
node skills/docker-manager/update.js --customer-id user123
```

### Test Deployment
```bash
node skills/docker-manager/test-deploy.js --plan pro
```

### Validate Instance Config
```bash
node skills/docker-manager/validate.js --customer-id user123
```

## Daily Health Check

Runs automatically via cron:
```bash
node skills/docker-manager/daily-health.js
```

**What it does:**
1. Check all active instances via /healthz
2. Auto-restart unhealthy ones (max 3 retries)
3. Record health status in database
4. Alert on repeated failures

## Integration with Provisioning

```typescript
import { provisionDockerInstance } from '@/lib/docker-provisioning'
import { validateDeployment } from './validate'

// After provisioning:
const result = await provisionDockerInstance(config)

if (result.success) {
  // Validate deployment
  const validation = await validateDeployment(config.subdomain)
  
  if (!validation.valid) {
    console.error('Deployment validation failed:', validation.errors)
  }
}
```

## State Tracking

```json
{
  "lastHealthCheck": 1771461234,
  "instances": {
    "user123": {
      "lastHealthy": 1771461234,
      "consecutiveFailures": 0,
      "lastRestart": null,
      "version": "2026.2.19"
    }
  }
}
```

Stored in: `~/.openclaw/data/docker-manager-state.json`

## Alerts

- **🔴 Critical:** Instance down for >10 minutes
- **🟡 Warning:** 3+ consecutive health check failures
- **🟢 Info:** Successful restart after failure

## Usage in Cron

Add to OpenClaw config:
```yaml
jobs:
  - name: "Docker Health Check"
    schedule: "*/15 * * * *"  # Every 15 minutes
    command: "node skills/docker-manager/daily-health.js"
```
