# Onboarding Monitoring System

**Status:** ✅ ACTIVE - Real-time logging of all signup attempts

## What's Being Tracked

Every step of the user onboarding journey is logged with full details:

### Tracked Events

1. **oauth_start** - User clicks "Continue with X"
   - Timestamp
   - Success/failure

2. **oauth_callback** - X OAuth returns with user data
   - User ID
   - Username
   - Success/failure
   - Error details (if failed)

3. **details_submit** - User submits email and accepts terms
   - User ID
   - Email address
   - Success/failure
   - Error details (if failed)

4. **payment_init** - User initiates payment (future)
   - User ID
   - Email
   - Success/failure

5. **payment_complete** - Payment processed (future)
   - User ID
   - Email
   - Success/failure

6. **provisioning_start** - VPS provisioning begins (future)
   - User ID
   - Username
   - Success/failure

7. **provisioning_complete** - Instance ready (future)
   - User ID
   - Username
   - Subdomain
   - Success/failure

## Log Files

### Main Log
**Location:** `/root/.openclaw/workspace/clawdet/logs/onboarding.log`

**Format:** JSON Lines (one event per line)
```json
{"timestamp":"2026-02-19T14:30:00.000Z","step":"oauth_start","success":true}
{"timestamp":"2026-02-19T14:30:05.123Z","step":"oauth_callback","userId":"usr_123","username":"testuser","success":true}
{"timestamp":"2026-02-19T14:30:15.456Z","step":"details_submit","userId":"usr_123","email":"test@example.com","success":true}
```

### State File
**Location:** `/root/.openclaw/workspace/clawdet/logs/onboarding-last-check.txt`

Stores timestamp of last check (for incremental reporting)

## Monitoring Script

**Location:** `/root/.openclaw/workspace/clawdet/scripts/check-onboarding.js`

**Usage:**
```bash
# Manual check
node /root/.openclaw/workspace/clawdet/scripts/check-onboarding.js

# Or from workspace
cd /root/.openclaw/workspace/clawdet
node scripts/check-onboarding.js
```

**Output Example:**
```
================================================================================
📊 ONBOARDING ACTIVITY REPORT
   Period: 2/19/2026, 2:00:00 PM → 2/19/2026, 2:30:00 PM
================================================================================

Found 5 new event(s):

  ✅ oauth_start                testuser             14:25
  ✅ oauth_callback             testuser             14:25
  ✅ details_submit             test@example.com     14:26
  ❌ oauth_callback             unknown              14:27
      Error: Failed to fetch user info
  ✅ oauth_start                anotheruser          14:28

--------------------------------------------------------------------------------
SUMMARY:
--------------------------------------------------------------------------------
  OAuth Started:           2
  OAuth Callback Success:  1
  OAuth Callback Failed:   1
  Details Submit Success:  1
  Details Submit Failed:   0
  Payments Completed:      0
  Provisioning Completed:  0

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
⚠️  ERRORS ENCOUNTERED:
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  1. oauth_callback (unknown)
     Failed to fetch user info

================================================================================
```

## Real-Time Monitoring

The system logs to console AND file, so you can watch in real-time:

```bash
# Watch PM2 logs for onboarding events
pm2 logs clawdet-prod | grep ONBOARDING

# Watch log file
tail -f /root/.openclaw/workspace/clawdet/logs/onboarding.log
```

## Setup Automated Reporting

### Option 1: OpenClaw Cron (Recommended)

Create a cron job that runs the check script and reports results:

```typescript
// Run every 30 minutes
{
  "name": "Onboarding Activity Report",
  "schedule": { 
    "kind": "every", 
    "everyMs": 1800000  // 30 minutes
  },
  "payload": {
    "kind": "systemEvent",
    "text": "Check onboarding activity: cd /root/.openclaw/workspace/clawdet && node scripts/check-onboarding.js"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

### Option 2: Manual Checks

Just ask me:
- "Check onboarding activity"
- "Any new signups?"
- "Show signup logs"

## What Gets Logged to Console

Every onboarding event prints to PM2 logs in format:
```
[ONBOARDING] oauth_start ✅ testuser
[ONBOARDING] oauth_callback ✅ testuser
[ONBOARDING] details_submit ✅ test@example.com
[ONBOARDING] oauth_callback ❌ unknown
```

You'll see these in real-time when running `pm2 logs clawdet-prod`

## Troubleshooting Common Issues

### OAuth Callback Failures
**Symptoms:** `oauth_callback ❌` with "Failed to fetch user info"
**Likely Causes:**
- X API rate limiting
- Invalid X OAuth credentials
- Network issues

### Details Submit Failures
**Symptoms:** `details_submit ❌` with "JSON.parse" errors (FIXED)
**Likely Causes:**
- Session cookie issues
- Database write failures
- Invalid email format

### Missing Logs
**If no logs appear:**
1. Check file exists: `ls -la /root/.openclaw/workspace/clawdet/logs/`
2. Check permissions: `ls -la /root/.openclaw/workspace/clawdet/logs/onboarding.log`
3. Check PM2 logs: `pm2 logs clawdet-prod | grep ONBOARDING`

## Integration with Provisioning

When adding provisioning logging, update these files:

1. `/app/api/provisioning/start/route.ts` - Add `logProvisioningStart()`
2. `/app/api/provisioning/status/route.ts` - Add `logProvisioningComplete()` when status = 'ready'

Example:
```typescript
import { logProvisioningStart, logProvisioningComplete } from '@/lib/onboarding-logger'

// At provisioning start
logProvisioningStart(true, user.id, user.xUsername)

// When provisioning completes
logProvisioningComplete(true, user.id, user.xUsername, subdomain)
```

## Future Enhancements

- [ ] Add dashboard UI showing signup funnel
- [ ] Email notifications on signup failures
- [ ] Slack/Discord integration for real-time alerts
- [ ] Analytics: conversion rates, drop-off points
- [ ] Integration with error tracking service (Sentry)

## Current Status

**Logged Steps:** ✅
- oauth_start
- oauth_callback
- details_submit

**Not Yet Logged:** ⏳
- payment_init
- payment_complete
- provisioning_start
- provisioning_complete

**Next:** Add provisioning logging when that flow is activated.

---

*Last updated: 2026-02-19*
