# Clawdet QA Brief

## Product Overview

**Product Name**: Clawdet  
**Type**: AI-as-a-Service Platform (Automated VPS Provisioning + OpenClaw AI Agent)  
**Website**: https://clawdet.com  
**Status**: Alpha v0.1.0 (Free Beta - First 20 Users)

### What It Does
Clawdet automatically provisions dedicated VPS instances running OpenClaw (AI agent) with Grok AI model. Users sign up via X (Twitter) OAuth, and receive a fully configured AI agent on their own subdomain within 7-10 minutes.

**Key Value Proposition**: "Your own AI agent in under 10 minutes"

---

## Access & Test Accounts

### 1. Production Site
- **URL**: https://clawdet.com
- **Trial Chat**: Available on homepage (5 messages, no signup required)
- **Authentication**: X (Twitter) OAuth only

### 2. Test Instances (Live Examples)
Two fully provisioned instances available for testing the **end result**:

- **Test Instance 1**: https://test-fresh-1.clawdet.com
  - Gateway Token: `006f2ac102b1e2999ccaf8c7545b484e97aee29974a126e42ddaafb57f07794a`
  - Model: Claude Sonnet 4.5
  
- **Test Instance 2**: https://test-fresh-2.clawdet.com
  - Gateway Token: `248cb49f60cb3905eb325494b5df596255ed22dc475fb817d5de196efeb522bf`
  - Model: Claude Sonnet 4.5

### 3. Admin Dashboard
- **URL**: https://clawdet.com/admin
- **Token**: `clawdet-admin-2026`

### 4. OAuth Test Account
For full signup flow testing, you'll need:
- A real X (Twitter) account (OAuth is live, no mock available)
- Or we can create test credentials if needed

---

## Core User Flows to Test

### Flow 1: Trial Chat (No Signup)
**Priority**: HIGH  
**Path**: Homepage → "Try It Now" → Trial Chat

**Steps**:
1. Visit https://clawdet.com
2. Click "Try It Now" button in hero section
3. Ask a question in the trial chat (e.g., "What can you do?")
4. Verify you get a response within 5 seconds
5. Send 5 messages total
6. Verify 6th message shows "Trial limit reached" prompt

**Expected Results**:
- ✅ Trial chat loads instantly
- ✅ Messages send/receive successfully
- ✅ Responses are coherent and relevant
- ✅ 5-message limit enforced
- ✅ "Sign up" CTA appears after limit

**Test Data**:
```
Test messages:
1. "Hello, what can you do?"
2. "Tell me about OpenClaw"
3. "What's the weather in New York?"
4. "Write a haiku about AI"
5. "Thank you"
6. "One more message" (should be blocked)
```

---

### Flow 2: OAuth Signup → Free Beta Access
**Priority**: CRITICAL  
**Path**: Homepage → Sign Up → X OAuth → Details → Dashboard

**Prerequisites**:
- X (Twitter) account with valid OAuth credentials

**Steps**:
1. Click "Get Started Free" on homepage
2. Click "Continue with X" on `/signup`
3. Complete X OAuth authorization (redirects to twitter.com)
4. After OAuth callback, verify redirect to `/signup/details`
5. Verify page shows: "Welcome, [Your Name]!"
6. Verify page shows: "🎉 FREE BETA ACCESS!" message (if you're in first 20 users)
7. Enter email address (valid format)
8. Check "I agree to Terms of Service and Privacy Policy"
9. Click "🎉 Claim Free Beta Access" button
10. Verify redirect to `/dashboard`
11. Wait 7-10 minutes for provisioning
12. Verify subdomain appears: `[username].clawdet.com`

**Expected Results**:
- ✅ OAuth flow completes without errors
- ✅ User details page loads with correct name/avatar
- ✅ Free beta message shows for eligible users
- ✅ Email validation works (rejects invalid formats)
- ✅ Terms checkbox required
- ✅ Redirect to dashboard after submit
- ✅ Provisioning starts automatically (status: "Creating VPS...")
- ✅ Subdomain becomes accessible within 10 minutes
- ✅ Web chat on subdomain works immediately

**Test Data**:
```
Valid emails:
- test@example.com
- qa+clawdet@yourdomain.com
- real.email@gmail.com

Invalid emails (should reject):
- notanemail
- @example.com
- test@
- test@.com
```

---

### Flow 3: Instance Web Chat (Post-Provisioning)
**Priority**: HIGH  
**Path**: [username].clawdet.com

**Prerequisites**:
- Completed signup with provisioned instance OR use test instances

**Steps**:
1. Visit your instance URL: `https://[username].clawdet.com`
2. Verify page loads with "Chat" tab active
3. Verify connection status shows "Connected" (green dot)
4. Send a test message: "Hello, who are you?"
5. Verify AI responds within 10 seconds
6. Test multi-turn conversation (3-5 exchanges)
7. Test message with code: "Write a Python function to reverse a string"
8. Test long message (500+ characters)
9. Test empty message submission (should be blocked)
10. Refresh page and verify chat history persists

**Expected Results**:
- ✅ Page loads with clean UI (X-style dark theme)
- ✅ WebSocket connects successfully
- ✅ Messages send/receive in real-time
- ✅ Code blocks render with syntax highlighting
- ✅ Long messages display properly
- ✅ Empty messages blocked
- ✅ Chat history persists across page refreshes

**Test Instance URLs**:
- https://test-fresh-1.clawdet.com
- https://test-fresh-2.clawdet.com

---

### Flow 4: Dashboard Monitoring
**Priority**: MEDIUM  
**Path**: /dashboard (authenticated)

**Prerequisites**:
- Completed OAuth signup

**Steps**:
1. Navigate to https://clawdet.com/dashboard
2. Verify provisioning status displays correctly:
   - "pending" → "creating_vps" → "configuring_dns" → "installing" → "complete"
3. Verify instance URL appears when status = "complete"
4. Click instance URL and verify it opens in new tab
5. Test "View Logs" button (if available)
6. Test "Restart Instance" button (if available)

**Expected Results**:
- ✅ Status updates reflect actual provisioning progress
- ✅ Instance URL clickable when ready
- ✅ All buttons functional
- ✅ No JavaScript errors in console

---

### Flow 5: Admin Dashboard
**Priority**: LOW (Internal Tool)  
**Path**: /admin

**Steps**:
1. Visit https://clawdet.com/admin
2. Enter token: `clawdet-admin-2026`
3. Click "Access Admin Dashboard"
4. Verify user list displays
5. Verify VPS list displays
6. Verify stats are accurate (total users, provisioned instances, etc.)

**Expected Results**:
- ✅ Token authentication works
- ✅ User data displays correctly
- ✅ VPS data displays correctly
- ✅ Stats match actual database counts

---

## Sample Test Case (Detailed)

### TC-001: Trial Chat - Happy Path

**Objective**: Verify trial chat works for new visitors without signup

**Preconditions**:
- Clear browser cache/cookies OR use incognito mode
- Visit https://clawdet.com for the first time

**Test Steps**:

| Step | Action | Expected Result | Pass/Fail | Screenshot |
|------|--------|----------------|-----------|------------|
| 1 | Navigate to https://clawdet.com | Homepage loads successfully with hero section | ☐ | |
| 2 | Locate "Try It Now" button in hero section | Button is visible and clickable | ☐ | |
| 3 | Click "Try It Now" | Redirects to /trial page | ☐ | |
| 4 | Wait for trial chat to initialize | Chat interface loads, shows input box + send button | ☐ | |
| 5 | Type "Hello" in chat input | Text appears in input field | ☐ | |
| 6 | Click Send button (or press Enter) | Message sends, appears in chat, AI responds within 5 seconds | ☐ | |
| 7 | Send 4 more messages (any content) | All messages send successfully, AI responds to each | ☐ | |
| 8 | Attempt to send 6th message | System blocks message, shows "Trial limit reached. Sign up to continue" | ☐ | |
| 9 | Verify "Sign Up" button appears | Button is visible and clickable | ☐ | |
| 10 | Click "Sign Up" button | Redirects to /signup page | ☐ | |

**Test Data**:
```
Message 1: "Hello"
Message 2: "What is 2+2?"
Message 3: "Tell me a joke"
Message 4: "What can you help me with?"
Message 5: "Thank you"
Message 6: "One more message" (blocked)
```

**Expected Final State**:
- Trial chat shows 5 user messages + 5 AI responses
- 6th message blocked with clear upgrade prompt
- User redirected to signup on button click

**Actual Results**: _(QA to fill in)_

**Status**: ☐ Pass / ☐ Fail

**Notes**: _(QA to fill in)_

---

## Bug Report Format

When you find bugs, please report them in this format:

### Bug Template

```markdown
## Bug #[ID]: [Short Title]

**Severity**: Critical / High / Medium / Low  
**Priority**: P0 / P1 / P2 / P3  
**Status**: New / In Progress / Fixed / Won't Fix  
**Found In**: [URL or feature area]  
**Tested On**: [Browser/OS/Device]  
**Reported By**: [Your Name]  
**Date**: [YYYY-MM-DD]

### Description
Brief description of the issue.

### Steps to Reproduce
1. Step one
2. Step two
3. Step three

### Expected Result
What should happen.

### Actual Result
What actually happens.

### Screenshots/Video
[Attach screenshots or screen recording]

### Console Errors (if applicable)
```
Paste any JavaScript errors from browser console
```

### Additional Context
- User agent: [Browser version]
- Screen resolution: [e.g., 1920x1080]
- Network conditions: [e.g., WiFi, 4G, slow connection]
- Session ID: [if available in logs]

### Proposed Fix (optional)
Your suggestion for fixing the issue.
```

---

## Example Bug Report

```markdown
## Bug #001: Trial chat fails to send 5th message

**Severity**: High  
**Priority**: P1  
**Status**: New  
**Found In**: https://clawdet.com/trial  
**Tested On**: Chrome 120, macOS Sonoma 14.3  
**Reported By**: QA Team  
**Date**: 2026-02-19

### Description
The trial chat is supposed to allow 5 messages, but it blocks the user after only 4 messages instead of 5.

### Steps to Reproduce
1. Visit https://clawdet.com in incognito mode
2. Click "Try It Now"
3. Send 4 messages successfully
4. Attempt to send 5th message
5. System blocks message and shows "Trial limit reached"

### Expected Result
User should be able to send 5 messages total before hitting the limit.

### Actual Result
User is blocked after only 4 messages. The limit message appears prematurely.

### Screenshots
[Screenshot showing "Trial limit reached" after only 4 messages]

### Console Errors
```
trial-chat.js:142 Trial limit exceeded: 4/5 messages
```

### Additional Context
- User agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
- Screen resolution: 1920x1080
- Network: WiFi, 100 Mbps
- Session started: 2026-02-19 15:30:42 UTC

### Proposed Fix
Check the message counter logic in `/app/api/trial-chat/route.ts` - likely an off-by-one error (using `>=` instead of `>` for comparison).
```

---

## Test Results Submission

### Option 1: GitHub Issues (Preferred)
- Repository: https://github.com/yoniassia/clawdet
- Create issues with label `qa` and `bug`
- Use bug template above
- Attach screenshots as comments

### Option 2: Shared Document
- Google Sheet with test cases and results
- Include screenshots in separate folder (Google Drive or Imgur)
- Share link with edit access

### Option 3: Email
- Send to: yoni@etoro.com (or your preferred email)
- Subject: `[Clawdet QA] Bug Report #[ID] - [Title]`
- Attach screenshots/videos

### Option 4: WhatsApp/Telegram
- Quick bug reports for urgent issues
- Include screenshot + brief description
- We'll file formal bug report later

---

## Testing Framework Requirements

### Browser Coverage
- **Chrome** (latest) - Primary
- **Firefox** (latest)
- **Safari** (latest, macOS/iOS)
- **Edge** (latest)

### Device Coverage
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: iPad, Android tablet
- **Mobile**: iPhone 14, Samsung Galaxy S23

### Network Conditions
- **Fast**: WiFi, 100+ Mbps
- **Slow**: 3G, throttled to 1 Mbps
- **Offline**: Test error handling

### Test Environments
- **Production**: https://clawdet.com
- **Test Instances**: test-fresh-1.clawdet.com, test-fresh-2.clawdet.com

---

## Critical User Journeys (Priority Order)

1. **Trial Chat** (No signup required) - Must work 100%
2. **OAuth Signup → Free Beta** - Critical path, currently has known issues
3. **Instance Web Chat** (Post-provisioning) - Core product feature
4. **Dashboard Monitoring** - User visibility into provisioning
5. **Admin Dashboard** - Internal tool, lower priority

---

## Known Issues (Do Not Report)

1. **OAuth Redirect Loop** - Recently fixed, may still see in old sessions
2. **Stripe Payment Flow** - Disabled for free beta, not in scope
3. **Email Notifications** - Not yet implemented
4. **Telegram Setup** - Coming soon, not in current build

---

## Success Criteria

A test build passes QA if:
- ✅ All P0/P1 bugs fixed
- ✅ All critical user journeys work end-to-end
- ✅ No console errors in happy path
- ✅ Mobile responsive (no layout breaks)
- ✅ Page load time <3 seconds on fast connection
- ✅ WebSocket connects successfully on all test instances

---

## Contact & Support

**Primary Contact**: Yoni Assia  
**Response Time**: Usually within 1-2 hours during work hours (UTC 8am-6pm)  
**Emergency Contact**: WhatsApp/Telegram for P0 issues

**Resources**:
- Documentation: /root/.openclaw/workspace/clawdet/docs/
- GitHub: https://github.com/yoniassia/clawdet
- Live Site: https://clawdet.com
- Admin Dashboard: https://clawdet.com/admin (token: clawdet-admin-2026)

---

**Last Updated**: 2026-02-19  
**Document Version**: 1.0  
**Platform Version**: Alpha v0.1.0
