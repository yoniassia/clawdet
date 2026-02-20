# Applause QA Integration - Ready for Credentials

**Status**: ✅ Infrastructure Installed  
**Next Step**: Add API credentials to `.env.local`  
**Installed**: 2026-02-20

---

## 📦 What's Been Installed

### Core Scripts
- ✅ `config.js` - Configuration management
- ✅ `test-connection.js` - Verify API access
- ✅ `trigger-test.js` - Start test cycles
- ✅ `get-results.js` - Fetch test results
- ✅ `sync-bugs.js` - Create GitHub issues
- ✅ `SKILL.md` - Full documentation

### Infrastructure
- ✅ Directory structure created
- ✅ Scripts made executable
- ✅ Default test cases defined
- ✅ GitHub integration ready
- ✅ Error handling and validation

---

## 🔑 What You Need to Add

### Step 1: Get Applause Credentials

Log into your Applause dashboard and find:

1. **API Key** (Settings → API)
2. **Product ID** for Clawdet
3. **Auto API URL** (likely: `https://api.applause.com/v1/auto`)
4. **Public API URL** (likely: `https://api.applause.com/v1/public`)

### Step 2: Add to .env.local

Open `/root/.openclaw/workspace/clawdet/.env.local` and add:

\`\`\`bash
# Applause QA Integration
APPLAUSE_API_KEY=your_api_key_here
APPLAUSE_PRODUCT_ID=12345
APPLAUSE_AUTO_API_URL=https://api.applause.com/v1/auto
APPLAUSE_PUBLIC_API_URL=https://api.applause.com/v1/public
\`\`\`

### Step 3: Test Connection

\`\`\`bash
cd /root/.openclaw/workspace/clawdet
node skills/applause-qa/test-connection.js
\`\`\`

**Expected Output**:
\`\`\`
✅ Configuration loaded
✅ Auto API: Connected
✅ Public API: Connected
✅ GitHub API: Connected
🎉 Connection test complete!
\`\`\`

---

## 🚀 Quick Start (After Credentials Added)

### 1. Trigger First Test Cycle

\`\`\`bash
node skills/applause-qa/trigger-test.js
\`\`\`

**What happens**:
- Creates test run on Applause
- Tests 3 critical flows (Trial Chat, OAuth, Instance Chat)
- Returns test run ID
- Saves run data to `skills/applause-qa/runs/`

**Output**:
\`\`\`
✅ Test run created successfully!
   Run ID: tr_abc123
   Status: scheduled
   Estimated completion: 2026-02-21 12:00:00
\`\`\`

### 2. Check Test Progress

\`\`\`bash
node skills/applause-qa/get-results.js tr_abc123
\`\`\`

**Status checks**:
- `in_progress` - Testers are working
- `completed` - All tests done
- Shows pass/fail stats and bug count

### 3. Sync Bugs to GitHub

\`\`\`bash
node skills/applause-qa/sync-bugs.js tr_abc123
\`\`\`

**What happens**:
- Fetches all bugs from test run
- Creates GitHub issue for each bug
- Includes screenshots, videos, device info
- Labels: `qa`, `applause`, severity
- Prevents duplicates (tracks synced bugs)

**Output**:
\`\`\`
✅ Sync complete!
   Created: 5 issues
   Skipped: 0 (already synced)
   Errors: 0

🔗 View issues: https://github.com/yoniassia/clawdet/issues?q=label:applause
\`\`\`

---

## 📋 Test Cases Included

### 1. Trial Chat - Message Limit
- **URL**: https://clawdet.com/trial
- **Tests**: 5-message limit enforcement
- **Browsers**: Chrome, Firefox, Safari
- **Devices**: Desktop, Mobile

### 2. OAuth Signup Flow
- **URL**: https://clawdet.com/signup
- **Tests**: X OAuth → Details → Dashboard
- **Browsers**: Chrome, Safari
- **Devices**: Desktop, Mobile

### 3. Instance Web Chat
- **URL**: https://test-fresh-1.clawdet.com
- **Tests**: WebSocket connection, messaging
- **Browsers**: Chrome, Firefox
- **Devices**: Desktop

**Customize**: Edit `skills/applause-qa/test-cases.json` (auto-created on first run)

---

## 🤖 Automation Options

### Option 1: Trigger on Deploy

Add to PM2 ecosystem or deploy script:

\`\`\`bash
# After PM2 restart
node skills/applause-qa/trigger-test.js --name "v0.1.2 Deploy"
\`\`\`

### Option 2: GitHub Actions

\`\`\`yaml
- name: Trigger Applause Tests
  run: node skills/applause-qa/trigger-test.js
  env:
    APPLAUSE_API_KEY: \${{ secrets.APPLAUSE_API_KEY }}
\`\`\`

### Option 3: Cron Job

\`\`\`bash
# Daily regression test
0 0 * * * cd /root/.openclaw/workspace/clawdet && node skills/applause-qa/trigger-test.js
\`\`\`

---

## 📊 What Happens Next

### Timeline (After You Add Credentials)

**Immediate** (< 1 min):
- Test connection → Verify API access
- Trigger test run → Get run ID

**0-2 hours**:
- Applause assigns testers
- Tests begin execution

**24-48 hours**:
- Testers complete all test cases
- Results available via API
- Bugs documented with screenshots/videos

**After Results**:
- Run `get-results.js` to fetch
- Run `sync-bugs.js` to create GitHub issues
- Review and fix bugs
- Deploy new version
- Re-test to verify fixes

---

## 🔧 Troubleshooting

### "Configuration Errors"
**Solution**: Add credentials to `.env.local` (see Step 2 above)

### "API returned 401"
**Problem**: Invalid API key  
**Solution**: Check `APPLAUSE_API_KEY` in dashboard

### "API returned 404"
**Problem**: Wrong endpoint URL  
**Solution**: Verify `APPLAUSE_AUTO_API_URL` with Applause support

### "No test-cases.json found"
**Normal**: Uses default test cases  
**Optional**: Create custom test-cases.json

---

## 📁 File Structure

\`\`\`
skills/applause-qa/
├── SKILL.md              # Full documentation
├── README.md             # This file
├── config.js             # Configuration loader
├── test-connection.js    # API connectivity test
├── trigger-test.js       # Start test runs
├── get-results.js        # Fetch results
├── sync-bugs.js          # GitHub issue creation
├── test-cases.json       # (auto-created) Test definitions
└── runs/                 # (auto-created) Test run data
    ├── tr_abc123.json
    └── tr_abc123-results.json
\`\`\`

---

## 🎯 Expected Workflow

### First Test Run (Manual)
1. **You**: Add credentials → Test connection
2. **You**: Run `trigger-test.js`
3. **Applause**: 50+ testers test your app (24h)
4. **You**: Run `get-results.js` → See 10-20 bugs found
5. **You**: Run `sync-bugs.js` → GitHub issues created
6. **You**: Fix bugs → Deploy → Re-test

### Ongoing (Automated)
1. **You**: Deploy new version
2. **Automation**: Trigger test automatically
3. **Applause**: Testers verify changes
4. **Automation**: Bugs synced to GitHub
5. **Automation**: Telegram notification sent

---

## ✅ Checklist

Before first test run:

- [ ] Add `APPLAUSE_API_KEY` to `.env.local`
- [ ] Add `APPLAUSE_PRODUCT_ID` to `.env.local`
- [ ] Add API URLs to `.env.local`
- [ ] Run `test-connection.js` (verify ✅ all green)
- [ ] Review default test cases
- [ ] Run `trigger-test.js`
- [ ] Save test run ID
- [ ] Wait 24-48h
- [ ] Run `get-results.js <run_id>`
- [ ] Run `sync-bugs.js <run_id>`
- [ ] Review GitHub issues

---

## 📞 Support

**Questions?**
- Read `SKILL.md` for detailed docs
- Check Applause dashboard for API docs
- Contact Applause support for API help

**GitHub Issues**:
- Report bugs: https://github.com/yoniassia/clawdet/issues
- Tag with `applause` label

---

## 🎉 You're Ready!

Everything is installed and waiting for credentials.

**Next Steps**:
1. Get Applause API credentials (5 min)
2. Add to `.env.local` (2 min)
3. Run `test-connection.js` (1 min)
4. Run `trigger-test.js` (1 min)
5. Wait for results (24-48h)
6. Run `sync-bugs.js` (1 min)

**Total setup time**: 10 minutes of work, then wait for testers!

---

**Installed**: 2026-02-20  
**Status**: ⏳ Awaiting Credentials  
**Version**: 1.0.0
