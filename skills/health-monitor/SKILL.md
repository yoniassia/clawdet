# Health Monitor Skill

**Philosophy:** Only alert when something needs attention. Silence = everything is fine.

## What It Checks

### Daily (7:30am)
- ✅ Git repo size (alert if >500MB - signals binary accumulation)
- ✅ Database freshness (alert if no writes in 3+ days)
- ✅ Error logs (recurring issues in last 24h)
- ✅ Disk space (alert if <10% free)
- ✅ Cost anomalies (spending 3x daily average)

### Weekly (Monday 8am)
- ✅ Gateway security: localhost binding only (not 0.0.0.0)
- ✅ Gateway auth enabled (not disabled)
- ✅ SSL certificates valid (not expired)
- ✅ Dependency vulnerabilities (npm audit)

### Monthly (1st, 9am)
- ✅ Memory file scan (detect prompt injection patterns)
- ✅ Backup integrity (test restore from latest backup)
- ✅ Cron job success rates (any jobs failing frequently?)
- ✅ Database integrity (PRAGMA integrity_check)

## State Tracking

```json
{
  "lastChecks": {
    "git_size": 1771461234,
    "db_freshness": 1771461234,
    "gateway_security": 1771370000,
    "memory_scan": 1769000000
  },
  "alerts": {
    "git_size_warning": false,
    "gateway_exposed": false
  }
}
```

Stored in: `~/.openclaw/data/health-monitor-state.json`

## Usage

**Run daily checks:**
```bash
node skills/health-monitor/daily-check.js
```

**Run weekly checks:**
```bash
node skills/health-monitor/weekly-check.js
```

**Run monthly checks:**
```bash
node skills/health-monitor/monthly-check.js
```

**Manual full scan:**
```bash
node skills/health-monitor/full-scan.js
```

## Alert Levels

- **🔴 Critical:** Immediate Telegram alert (gateway exposed, security issue)
- **🟡 Warning:** Daily digest (repo growing large, stale data)
- **🟢 Info:** Log only (routine checks passed)

## Integration

Add cron jobs in OpenClaw config:

```yaml
jobs:
  - name: "Daily Health Check"
    schedule: "30 7 * * *"
    command: "node skills/health-monitor/daily-check.js"
    
  - name: "Weekly Security Check"
    schedule: "0 8 * * 1"
    command: "node skills/health-monitor/weekly-check.js"
    
  - name: "Monthly Deep Scan"
    schedule: "0 9 1 * *"
    command: "node skills/health-monitor/monthly-check.js"
```

## Checks Detail

### Git Repo Size
```bash
du -sh .git
# Alert if > 500MB (binary blobs accumulating)
```

### Gateway Binding
```bash
ss -tlnp | grep 18789
# Should show 127.0.0.1:18789, NOT 0.0.0.0:18789
```

### Database Freshness
```sql
SELECT MAX(created_at) FROM api_calls;
-- Alert if > 72 hours old
```

### Memory File Scan
```bash
grep -iE "(system:|ignore previous|disregard)" memory/*.md
# Alert if injection patterns found
```

## Silent Philosophy

❌ **Don't send:** "Everything is fine" messages  
✅ **Do send:** Only alerts when something needs attention  
✅ **Do track:** All check timestamps in state file  
✅ **Do prevent:** Re-alerting same issue multiple times
