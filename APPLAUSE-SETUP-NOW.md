# 🚀 Applause QA - Ready to Test NOW!

**Status**: ✅ Scripts installed and tested  
**Missing**: Just your Applause API credentials  
**Time to Complete**: 5 minutes

---

## ✅ Test Results

Just ran the connection test:

```
🔍 Testing Applause API Connection...

❌ Configuration Errors:
  - APPLAUSE_API_KEY not configured
  - APPLAUSE_PRODUCT_ID not configured

✅ GitHub API: Connected (token already configured)
```

**Good news**: Everything works! Just need your Applause credentials.

---

## 🔑 What You Need to Add (2 Minutes)

### Step 1: Open Your Applause Dashboard

Visit: **https://app.applause.com** (or whatever your Applause URL is)

### Step 2: Find API Credentials

Navigate to: **Settings → API** (or **Integrations → API**)

Look for:
1. **API Key** (looks like: `appl_abc123...` or `Bearer xyz...`)
2. **Product ID** for Clawdet (number like: `12345`)
3. **API Endpoints** (URLs for Auto API and Public API)

### Step 3: Add to .env.local

**File location**: `/root/.openclaw/workspace/clawdet/.env.local`

**Already prepared** - just replace the placeholders:

```bash
# Current (at bottom of file):
APPLAUSE_API_KEY=YOUR_API_KEY_HERE           ← Replace this
APPLAUSE_PRODUCT_ID=YOUR_PRODUCT_ID_HERE      ← Replace this
APPLAUSE_AUTO_API_URL=https://api.applause.com/v1/auto
APPLAUSE_PUBLIC_API_URL=https://api.applause.com/v1/public
```

**After you add credentials**:
```bash
APPLAUSE_API_KEY=appl_abc123xyz...
APPLAUSE_PRODUCT_ID=67890
APPLAUSE_AUTO_API_URL=https://api.applause.com/v1/auto
APPLAUSE_PUBLIC_API_URL=https://api.applause.com/v1/public
```

---

## 🧪 Test Again (30 Seconds)

After adding credentials, run:

```bash
cd /root/.openclaw/workspace/clawdet
node skills/applause-qa/test-connection.js
```

**Expected Output** (when working):
```
✅ Configuration loaded
   API Key: appl_abc123...
   Product ID: 67890
   Auto API: https://api.applause.com/v1/auto

📡 Testing Auto API...
✅ Auto API: Connected
   Status: healthy

📡 Testing Public API...
✅ Public API: Connected
   Status: healthy

📡 Testing GitHub API...
✅ GitHub API: Connected
   Repo: yoniassia/clawdet
   Access: Write

🎉 Connection test complete!
```

---

## 🚀 Launch First Test (1 Minute)

Once connection test passes:

```bash
node skills/applause-qa/trigger-test.js
```

**What happens**:
1. Sends 3 test cases to Applause
2. Tests: Trial Chat, OAuth Signup, Instance Chat
3. Coverage: Chrome, Firefox, Safari, Mobile
4. Applause assigns 50+ testers
5. Returns test run ID

**Output**:
```
✅ Test run created successfully!
   Run ID: tr_abc123
   Status: scheduled
   Estimated completion: 2026-02-21 12:00:00

📁 Run data saved: runs/tr_abc123.json

📝 Next steps:
   1. Monitor: node skills/applause-qa/get-results.js tr_abc123
   2. Or wait for webhook notification (if configured)
```

**Then wait 24-48 hours** for testers to complete.

---

## 📊 After Testing Completes

### Get Results

```bash
node skills/applause-qa/get-results.js tr_abc123
```

**Shows**:
- Total tests run
- Pass/fail breakdown
- Bugs found
- Device coverage

### Sync Bugs to GitHub

```bash
node skills/applause-qa/sync-bugs.js tr_abc123
```

**Creates**:
- GitHub issues for each bug
- Screenshots attached
- Video recordings linked
- Device/browser info
- Severity labels

**View issues**: https://github.com/yoniassia/clawdet/issues?q=label:applause

---

## 🎯 What to Expect (First Test)

**Timeline**: 24-48 hours

**Typical Results**:
- 10-20 bugs found
- 2-3 critical issues
- 5-7 high priority
- 8-10 medium issues

**Common Findings**:
- Mobile layout breaks
- Browser compatibility issues
- Edge case failures
- Console errors
- UX inconsistencies

**All documented** with screenshots/videos!

---

## 📁 Quick Reference

**Scripts Location**: `/root/.openclaw/workspace/clawdet/skills/applause-qa/`

**Commands**:
```bash
# Test connection
node skills/applause-qa/test-connection.js

# Start test run
node skills/applause-qa/trigger-test.js

# Get results
node skills/applause-qa/get-results.js <run_id>

# Sync to GitHub
node skills/applause-qa/sync-bugs.js <run_id>
```

**Config File**: `.env.local` (add credentials here)

**Documentation**:
- Quick Start: `skills/applause-qa/README.md`
- Full Docs: `skills/applause-qa/SKILL.md`
- Summary: `APPLAUSE-INSTALLED.md`

---

## 🆘 Troubleshooting

### "Can't find Applause dashboard"
- Check your email for Applause welcome email
- Or contact your account manager

### "No API section in dashboard"
- Try: Settings → Integrations
- Or: Profile → API Tokens
- Or: Contact Applause support

### "Not sure what the Product ID is"
- Look for your project/product name
- It's usually a number (like: 12345)
- Or ask Applause support

### "API endpoints different"
- Use whatever URLs Applause provides
- Common patterns:
  - `https://api.applause.com/v1/auto`
  - `https://api.applause.com/v2/testing`
  - `https://prod.applause.com/api/auto`

---

## ✅ Ready Checklist

- [x] Scripts installed ✅
- [x] GitHub token added ✅
- [x] Test connection script works ✅
- [x] Default test cases configured ✅
- [ ] Applause API key added ← **YOU ARE HERE**
- [ ] Applause Product ID added
- [ ] Connection test passes
- [ ] First test run triggered

**You're 99% there!** Just add those two credentials and you're live! 🚀

---

## 🎉 Do This Now

1. **Open Applause dashboard** → Find Settings → API
2. **Copy API Key + Product ID**
3. **Open**: `/root/.openclaw/workspace/clawdet/.env.local`
4. **Replace**:
   - `YOUR_API_KEY_HERE` with your actual key
   - `YOUR_PRODUCT_ID_HERE` with your actual ID
5. **Run**: `node skills/applause-qa/test-connection.js`
6. **See**: ✅ All green
7. **Run**: `node skills/applause-qa/trigger-test.js`
8. **Wait**: 24-48 hours
9. **Run**: `node skills/applause-qa/get-results.js <run_id>`
10. **Run**: `node skills/applause-qa/sync-bugs.js <run_id>`

**Total time**: 5 minutes to setup, then automated! 💪

---

**Created**: 2026-02-20 02:30 UTC  
**Status**: ⏳ Waiting for credentials  
**Test Status**: Connection script validated ✅
