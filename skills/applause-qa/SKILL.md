# Applause QA Integration Skill

**Purpose**: Automated integration with Applause crowdtesting platform  
**Version**: 1.0.0  
**Status**: Ready for credentials  
**Last Updated**: 2026-02-20

---

## Overview

This skill integrates Clawdet with Applause's crowdtesting API to:
- Trigger test cycles on deploy
- Fetch test results and bug reports
- Create GitHub issues from bugs
- Send Telegram notifications
- Track QA metrics over time

---

## Setup

### 1. Install Dependencies

#### Option A: Using Applause Python SDK (Recommended)
```bash
# Clone official SDK
cd /tmp
git clone https://github.com/ApplauseOSS/common-python-reporter.git
cd common-python-reporter

# Install with poetry (if available)
poetry install

# Or install dependencies manually
pip3 install -r requirements.txt
```

#### Option B: Direct API Integration
No external dependencies needed - uses Node.js fetch API.

### 2. Configure Environment Variables

Add to `/root/.openclaw/workspace/clawdet/.env.local`:

```bash
# Applause API Configuration
APPLAUSE_API_KEY=your_api_key_here
APPLAUSE_PRODUCT_ID=12345
APPLAUSE_AUTO_API_URL=https://api.applause.com/v1/auto
APPLAUSE_PUBLIC_API_URL=https://api.applause.com/v1/public

# Optional: Test Cycle Configuration
APPLAUSE_TEST_CYCLE_ID=tc_abc123
APPLAUSE_WEBHOOK_SECRET=webhook_secret_for_verification

# GitHub Integration (for issue creation)
GITHUB_TOKEN=<already configured>
GITHUB_REPO=yoniassia/clawdet

# Telegram Notifications (optional)
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_CHAT_ID=<your_chat_id>
```

### 3. Test Connection
```bash
node skills/applause-qa/test-connection.js
```

---

## Usage

### Trigger Test Cycle
```bash
# After deployment
node skills/applause-qa/trigger-test.js
```

### Fetch Results
```bash
# Check test run status
node skills/applause-qa/get-results.js <test_run_id>
```

### Sync Bugs to GitHub
```bash
# Create issues from failed tests
node skills/applause-qa/sync-bugs.js <test_run_id>
```

### View Metrics
```bash
# Show QA stats
node skills/applause-qa/metrics.js
```

---

## Automated Workflows

### On Deploy (Automatic)
1. PM2 restart detected
2. `trigger-test.js` called automatically
3. Test run started on Applause
4. Testers execute tests (24-48h)
5. Results fetched via webhook or polling
6. Bugs synced to GitHub
7. Telegram notification sent

### Manual Testing
```bash
# Trigger ad-hoc test run
node skills/applause-qa/trigger-test.js --tests "Trial Chat,OAuth Flow"
```

---

## API Methods

### Test Run Management
| Method | Description | Script |
|--------|-------------|--------|
| `startTestRun()` | Create new test cycle | `trigger-test.js` |
| `getTestRunStatus()` | Check run progress | `get-results.js` |
| `getTestRunResults()` | Fetch all results | `get-results.js` |
| `endTestRun()` | Complete cycle | `end-test.js` |

### Bug Management
| Method | Description | Script |
|--------|-------------|--------|
| `getBugs()` | Fetch bug reports | `sync-bugs.js` |
| `createGitHubIssue()` | Create issue | `sync-bugs.js` |
| `updateBugStatus()` | Mark as synced | `sync-bugs.js` |

### Webhooks
| Event | Handler | Action |
|-------|---------|--------|
| `test_run.completed` | `webhook-handler.js` | Sync bugs, notify |
| `bug.created` | `webhook-handler.js` | Create GitHub issue |
| `bug.updated` | `webhook-handler.js` | Update issue |

---

## Test Case Definitions

Tests are defined in `test-cases.json`:

```json
{
  "tests": [
    {
      "name": "Trial Chat - Message Limit",
      "url": "https://clawdet.com/trial",
      "instructions": "...",
      "expected": "5 messages work, 6th blocked",
      "browsers": ["chrome", "firefox", "safari"],
      "devices": ["desktop", "mobile"]
    }
  ]
}
```

Import from `QA-TEST-CASES.csv`:
```bash
node skills/applause-qa/import-test-cases.js
```

---

## Metrics

Tracked in `metrics/qa-stats.json`:
- Total test runs
- Bugs found per version
- Pass/fail rates
- Average fix time
- Test coverage by feature

View dashboard:
```bash
node skills/applause-qa/metrics.js --dashboard
```

---

## Troubleshooting

### Connection Issues
```bash
# Test API connectivity
curl -H "Authorization: Bearer $APPLAUSE_API_KEY" \
  https://api.applause.com/v1/auto/health
```

### Webhook Not Receiving Events
1. Check webhook URL is publicly accessible
2. Verify HTTPS with valid SSL
3. Check webhook secret matches
4. View webhook logs: `tail -f logs/applause-webhook.log`

### Rate Limits
Default: 100 requests/hour. If exceeded:
- Use webhooks instead of polling
- Increase polling interval
- Contact Applause for limit increase

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | This documentation |
| `trigger-test.js` | Start test cycles |
| `get-results.js` | Fetch test results |
| `sync-bugs.js` | Create GitHub issues |
| `webhook-handler.js` | Process webhooks |
| `metrics.js` | QA analytics |
| `test-connection.js` | Verify API access |
| `config.js` | Shared configuration |
| `test-cases.json` | Test definitions |
| `import-test-cases.js` | CSV → JSON converter |

---

## Integration Points

### GitHub Actions
Add to `.github/workflows/deploy.yml`:
```yaml
- name: Trigger Applause Tests
  run: node skills/applause-qa/trigger-test.js
  env:
    APPLAUSE_API_KEY: ${{ secrets.APPLAUSE_API_KEY }}
```

### PM2 Ecosystem
Add to `ecosystem.config.js`:
```javascript
{
  name: 'applause-qa-monitor',
  script: 'skills/applause-qa/monitor.js',
  cron_restart: '0 */6 * * *' // Every 6 hours
}
```

---

## Security

- API keys stored in `.env.local` (not committed)
- Webhook signatures verified
- Rate limiting enforced
- Secrets rotation supported

---

## Support

**Issues**: https://github.com/yoniassia/clawdet/issues  
**Applause Docs**: https://github.com/ApplauseOSS  
**Contact**: Yoni Assia

---

**Status**: ⏳ Awaiting API credentials  
**Next**: Configure `.env.local` with Applause credentials  
**Then**: Run `test-connection.js` to verify
