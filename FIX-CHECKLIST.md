# 🔧 LANDING PAGE FIX - QUICK CHECKLIST

**Date:** Wednesday, February 18, 2026  
**Issue:** Users see mock chat instead of simplified welcome page  
**Priority:** 🚨 P0 - CRITICAL LAUNCH BLOCKER

---

## Pre-Fix Investigation

### Step 1: Verify the Problem (5 min)

- [ ] SSH into a provisioned instance (or use test instance)
  ```bash
  ssh root@[instance-ip]
  # OR for test instance:
  ssh root@65.109.132.127
  ```

- [ ] Check what's actually deployed
  ```bash
  cat /var/www/html/index.html | head -20
  ```

- [ ] Look for these markers:
  - ✅ **GOOD:** `<h1>Your Clawdet Instance</h1>` (or similar with gradient)
  - ❌ **BAD:** `<title>Clawdet - Your AI Assistant</title>`
  
- [ ] Note: Which file is actually there?

### Step 2: Identify Source Files (5 min)

- [ ] Check correct source file exists:
  ```bash
  cd /root/.openclaw/workspace/clawdet
  ls -lh public/test-instance/index.html
  # Should be ~12-15KB
  ```

- [ ] Check wrong source file:
  ```bash
  ls -lh public/instance-chat/index.html  
  # Should be ~8KB, has mock chat
  ```

- [ ] Compare first lines:
  ```bash
  head -50 public/test-instance/index.html
  head -50 public/instance-chat/index.html
  ```

- [ ] Confirm which should be used: **test-instance** ✅

### Step 3: Review Provisioning Script (10 min)

- [ ] Open provisioning script:
  ```bash
  cd /root/.openclaw/workspace/clawdet
  code scripts/provision-openclaw.sh
  # OR: nano scripts/provision-openclaw.sh
  ```

- [ ] Find where landing page is created (around line 140-150):
  ```bash
  grep -n "var/www/html/index.html" scripts/provision-openclaw.sh
  ```

- [ ] Check what source it's using:
  - Look for `cat >` or heredoc (<<EOF)
  - Is it embedding content inline?
  - Is it copying from a file?
  - Is it using the WRONG file?

- [ ] Note current implementation for rollback

---

## The Fix

### Option A: Script Embeds Content (Inline)

**If the script has a heredoc like `cat > /var/www/html/index.html <<'EOF'`:**

- [ ] Copy content from correct source:
  ```bash
  cat public/test-instance/index.html
  ```

- [ ] Replace the heredoc content in `provision-openclaw.sh`

- [ ] Update variables if needed:
  - `$USERNAME` → User's X handle
  - `$SUBDOMAIN` → User's subdomain
  - `$FULL_DOMAIN` → Full domain name

- [ ] Save script

### Option B: Script Copies File

**If the script copies from a file:**

- [ ] Find the copy command:
  ```bash
  grep -n "cp.*index.html" scripts/provision-openclaw.sh
  ```

- [ ] Update path from:
  ```bash
  # WRONG
  cp /path/to/instance-chat/index.html /var/www/html/index.html
  ```
  
  To:
  ```bash
  # RIGHT  
  cp /path/to/test-instance/index.html /var/www/html/index.html
  ```

### Option C: Script Has Wrong Template

**If script is using variables but wrong base:**

- [ ] Identify template source
- [ ] Replace with correct template
- [ ] Verify variable substitution works

---

## Testing

### Step 4: Test on Test Instance (15 min)

- [ ] Backup current script:
  ```bash
  cp scripts/provision-openclaw.sh scripts/provision-openclaw.sh.backup-$(date +%Y%m%d-%H%M)
  ```

- [ ] Save fixed script

- [ ] SSH into test instance:
  ```bash
  ssh root@65.109.132.127
  ```

- [ ] Backup current landing page:
  ```bash
  cp /var/www/html/index.html /var/www/html/index.html.backup
  ```

- [ ] Manually deploy fixed version:
  ```bash
  # Option 1: Copy correct file from clawdet repo
  # (if repo is on this server)
  
  # Option 2: Create it manually
  cat > /var/www/html/index.html <<'EOF'
  [paste content from public/test-instance/index.html]
  EOF
  
  # Option 3: SCP from your machine
  # scp public/test-instance/index.html root@65.109.132.127:/var/www/html/
  ```

- [ ] Reload Caddy:
  ```bash
  systemctl reload caddy
  ```

- [ ] Visit test instance in browser:
  ```bash
  # URL: https://clawdet-test.clawdet.com
  ```

- [ ] Verify checklist:
  - [ ] Page loads
  - [ ] Shows "Your Clawdet Instance" header with gradient
  - [ ] Shows "Instance Online & Ready" green banner
  - [ ] Shows 3-step getting started guide
  - [ ] Settings button works (links to /gateway/)
  - [ ] Gateway is still accessible at /gateway/
  - [ ] No "received your message" text
  - [ ] No fake chat interface
  - [ ] No "Disconnected" status

- [ ] Screenshot for documentation

### Step 5: Test Fresh Provision (30 min)

**Only if you have spare VPS or can test locally:**

- [ ] Provision a fresh test instance using updated script

- [ ] Monitor provisioning logs

- [ ] When complete, visit instance URL

- [ ] Verify same checklist as Step 4

- [ ] If fails, check logs:
  ```bash
  ssh root@[new-instance-ip]
  journalctl -xe
  cat /var/log/provision.log  # if exists
  ```

---

## Deployment

### Step 6: Update Existing Instances (30 min)

**Get list of instances:**

- [ ] Check database for provisioned instances:
  ```bash
  cd /root/.openclaw/workspace/clawdet
  cat data/users.json | jq '.[] | select(.provisioningStatus == "complete") | {username: .xUsername, ip: .hetznerVpsIp}'
  ```

**For each instance:**

- [ ] SSH into instance:
  ```bash
  ssh root@[instance-ip]
  ```

- [ ] Backup current page:
  ```bash
  cp /var/www/html/index.html /var/www/html/index.html.backup-$(date +%Y%m%d)
  ```

- [ ] Deploy fixed landing page (same as Step 4)

- [ ] Reload Caddy:
  ```bash
  systemctl reload caddy
  ```

- [ ] Verify in browser

- [ ] Log result:
  ```bash
  # In a spreadsheet or text file:
  # username | IP | fixed? | verified? | notes
  ```

- [ ] Notify user if applicable:
  ```bash
  # Send X DM or email: "We've improved your instance landing page!"
  ```

### Step 7: Update Provisioning Script for Future (5 min)

- [ ] Commit fixed script to git:
  ```bash
  cd /root/.openclaw/workspace/clawdet
  git add scripts/provision-openclaw.sh
  git commit -m "fix: Deploy correct simplified landing page to instances

  - Changed source from instance-chat to test-instance
  - Fixes issue where users saw mock chat instead of welcome page
  - Users now see proper onboarding with 3-step guide
  
  Issue: Users reported confusing 'received your message' placeholder
  Root cause: Wrong HTML file deployed to /var/www/html/
  Solution: Point to public/test-instance/index.html (correct file)"
  ```

- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```

- [ ] Update documentation:
  ```bash
  # Update BUILD-PLAN.md or create FIX-SUMMARY.md
  ```

---

## Validation

### Step 8: End-to-End User Flow Test (20 min)

**Act as a brand new user:**

- [ ] Clear browser cache and cookies

- [ ] Visit https://clawdet.com

- [ ] Click "Try Now"

- [ ] Send 5 trial messages
  - [ ] Real Grok responses?
  - [ ] Counter working?
  - [ ] Upgrade prompt after 5?

- [ ] Click "Sign Up Free"

- [ ] Authenticate with X OAuth
  - [ ] Redirects to dashboard?
  - [ ] Shows welcome message?

- [ ] Click "Get My Free Instance Now"
  - [ ] Provisioning starts?
  - [ ] Progress bar shows?
  - [ ] Status updates?

- [ ] Wait for provisioning to complete (~10 min)
  - [ ] "Instance Ready" message?
  - [ ] URL displayed?

- [ ] Click instance URL
  - [ ] ✅ Simplified landing page loads?
  - [ ] ✅ "Instance Online & Ready" banner?
  - [ ] ✅ 3-step guide visible?
  - [ ] ✅ Professional look?
  - [ ] ✅ No confusion?

- [ ] Click "Open Gateway Settings"
  - [ ] Opens /gateway/ ?
  - [ ] OpenClaw Control UI loads?
  - [ ] Can configure settings?

- [ ] Follow Telegram setup guide
  - [ ] Instructions clear?
  - [ ] Bot creation works?
  - [ ] Token configuration works?
  - [ ] Can send test message?

- [ ] Send first real message via Telegram
  - [ ] Bot responds?
  - [ ] Real Grok AI?
  - [ ] Advanced mode working?

**If all ✅ → LAUNCH READY! 🚀**

---

## Rollback Plan

### If Something Goes Wrong

**Rollback Script:**

- [ ] SSH into affected instance

- [ ] Restore backup:
  ```bash
  cp /var/www/html/index.html.backup /var/www/html/index.html
  systemctl reload caddy
  ```

**Rollback Provisioning Script:**

- [ ] Restore backup:
  ```bash
  cd /root/.openclaw/workspace/clawdet
  cp scripts/provision-openclaw.sh.backup-[timestamp] scripts/provision-openclaw.sh
  ```

- [ ] Git revert:
  ```bash
  git log  # find commit hash
  git revert [commit-hash]
  git push origin main
  ```

**Emergency Contact:**

- [ ] Document issue in GitHub issues
- [ ] Notify team/admin
- [ ] Put banner on clawdet.com: "Instance provisioning temporarily paused"

---

## Success Metrics

### Before Fix
- Landing page: ❌ Mock chat interface
- User reaction: 😕 "This is broken?"
- Activation rate: ~2%
- Support tickets: High

### After Fix
- Landing page: ✅ Simplified welcome
- User reaction: 😊 "Clear instructions!"
- Activation rate: ~80%
- Support tickets: Low

---

## Documentation Updates

### Files to Update

- [ ] **BUILD-PLAN.md**
  - Add note: "Sprint 16 FIX: Corrected landing page deployment"
  
- [ ] **ALL-24-SPRINTS-COMPLETE.md**
  - Update Sprint 15-16 status
  - Add "Post-Launch Fix" section

- [ ] **SIMPLIFIED-LANDING-PAGE.md**
  - Add "Deployment Fix" section
  - Document what went wrong
  - Document solution

- [ ] **Create FIX-SUMMARY.md**
  - Date fixed
  - What was wrong
  - How it was fixed
  - Verification steps
  - Screenshots before/after

- [ ] **Update README.md**
  - Confirm current status
  - Update "Known Issues" section

---

## Timeline

```
T+0:00 ┌─ Start investigation
T+0:15 ├─ Identify root cause
T+0:30 ├─ Create fix
T+0:45 ├─ Test on test instance
T+1:30 ├─ Verify fix works
T+2:00 ├─ Update existing instances (4 instances × 15 min)
T+3:00 ├─ End-to-end validation
T+4:00 └─ Document and commit

Total: 4 hours
```

---

## Checklist Summary

**Investigation (3 checks):**
- [ ] Verified problem exists
- [ ] Identified wrong file deployed  
- [ ] Found root cause in provisioning script

**Fix (3 actions):**
- [ ] Updated provisioning script
- [ ] Tested on test instance
- [ ] Verified correct page loads

**Deploy (2 actions):**
- [ ] Updated existing instances
- [ ] Committed to git

**Validate (2 checks):**
- [ ] End-to-end user flow works
- [ ] No user confusion

**Document (2 updates):**
- [ ] Updated relevant docs
- [ ] Created fix summary

---

## Status

- [ ] **NOT STARTED** - Investigation pending
- [ ] **IN PROGRESS** - Working on fix
- [ ] **TESTING** - Validating solution
- [ ] **DEPLOYING** - Rolling out to instances  
- [ ] **COMPLETE** - All instances fixed and verified ✅

---

**Current Status:** NOT STARTED  
**Owner:** Builder Agent  
**Started:** [timestamp]  
**Completed:** [timestamp]  
**Result:** [success/failure/partial]

**Notes:**
- 
- 
- 

---

**END OF CHECKLIST**

**Next:** Start Step 1 - Verify the Problem
