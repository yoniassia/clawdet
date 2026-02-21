# QA Quick Start Guide - Clawdet

**Last Updated**: 2026-02-19  
**Platform Version**: Alpha v0.1.0

---

## 🚀 Start Testing in 5 Minutes

### 1. Production Access
**URL**: https://clawdet.com  
**Status**: ✅ Live (Alpha)

### 2. Test Credentials

#### Admin Dashboard
- **URL**: https://clawdet.com/admin
- **Token**: `clawdet-admin-2026`

#### Test Instances (Live AI Chat)
- **Instance 1**: https://test-fresh-1.clawdet.com
  - Token: `006f2ac102b1e2999ccaf8c7545b484e97aee29974a126e42ddaafb57f07794a`
  - Model: Claude Sonnet 4.5
  
- **Instance 2**: https://test-fresh-2.clawdet.com
  - Token: `248cb49f60cb3905eb325494b5df596255ed22dc475fb817d5de196efeb522bf`
  - Model: Claude Sonnet 4.5

### 3. Quick Test Flow

**Test #1: Trial Chat (2 minutes)**
```
1. Visit https://clawdet.com
2. Click "Try It Now"
3. Send 5 messages
4. Verify 6th is blocked
```

**Test #2: Provisioned Instance (2 minutes)**
```
1. Visit https://test-fresh-1.clawdet.com
2. Wait for "Connected" status
3. Send "Hello, who are you?"
4. Verify AI responds
```

**Test #3: OAuth Signup (Requires X account)**
```
1. Visit https://clawdet.com/signup
2. Click "Continue with X"
3. Complete OAuth
4. Enter email + accept terms
5. Click "Claim Free Beta Access"
```

---

## 📋 What to Test

### Priority 0 (Must Work)
- ✅ Trial chat (no signup)
- ✅ OAuth signup flow
- ✅ Instance web chat (test-fresh-1.clawdet.com)

### Priority 1 (Important)
- ✅ Free beta eligibility check
- ✅ Dashboard provisioning status
- ✅ Mobile responsive design

### Priority 2 (Nice to Have)
- ✅ Admin dashboard
- ✅ Error handling
- ✅ Cross-browser compatibility

---

## 🐛 How to Report Bugs

### Quick Report (Urgent Issues)
WhatsApp/Telegram: "Bug on /trial - chat won't load. Chrome 120, Windows 11. Screenshot attached."

### Full Report (Use Template)
See: `EXAMPLE-BUG-REPORT.md`

**Include**:
1. URL where bug occurs
2. Steps to reproduce
3. Expected vs actual result
4. Screenshot
5. Browser/OS/Device

### Where to Submit
- **GitHub**: https://github.com/yoniassia/clawdet/issues (preferred)
- **Email**: yoni@etoro.com
- **WhatsApp**: (for urgent P0 bugs)

---

## 🔧 Testing Tools

### Browser DevTools
Open with `F12` or `Cmd+Option+I`

**Check**:
- Console for errors (red text = bad)
- Network tab for failed requests (red status = bad)
- Application > Local Storage for session data

### Useful Browser Extensions
- **React DevTools**: Inspect component state
- **Redux DevTools**: (not used yet)
- **Lighthouse**: Performance/accessibility testing

### Screen Recording
- **macOS**: Cmd+Shift+5
- **Windows**: Win+G (Xbox Game Bar)
- **Chrome**: Extensions like "Loom" or "Screencastify"

---

## 📊 Test Data

### Valid Emails
```
test@example.com
qa+clawdet@yourdomain.com
real.email@gmail.com
```

### Invalid Emails (Should Reject)
```
notanemail
@example.com
test@
test@.com
```

### Test Messages (Trial Chat)
```
1. "Hello, what can you do?"
2. "What is 2+2?"
3. "Tell me a joke"
4. "Write a haiku about AI"
5. "Thank you"
6. "One more message" (should block)
```

### Test Messages (Instance Chat)
```
- "Hello, who are you?"
- "What can you help me with?"
- "Write Python code to reverse a string"
- [500 character long message]
- "" (empty - should block)
```

---

## ✅ Success Criteria

A test build **passes** if:
- ✅ Trial chat: 5 messages work, 6th blocked
- ✅ OAuth signup: Completes without errors
- ✅ Instance chat: AI responds within 10 seconds
- ✅ Dashboard: Shows correct status
- ✅ Mobile: All pages usable on iPhone/Android
- ✅ No console errors on happy path

A test build **fails** if:
- ❌ Any P0 bug found
- ❌ Trial chat doesn't load
- ❌ OAuth fails to redirect
- ❌ Instance chat won't connect
- ❌ Major layout break on mobile

---

## 🆘 Need Help?

**Primary Contact**: Yoni Assia  
**Response Time**: 1-2 hours (UTC 8am-6pm)

**Questions?**
- "How do I test X?" → Ask first, don't guess
- "Is this a bug?" → If unsure, report it anyway
- "Test blocked?" → Let us know immediately

**Resources**:
- Full QA Brief: `QA-BRIEF.md`
- Test Cases: `QA-TEST-CASES.csv`
- Bug Example: `EXAMPLE-BUG-REPORT.md`

---

## 🎯 First Test Assignment

**Goal**: Validate our test framework setup

**Steps**:
1. Read this guide (5 min)
2. Test trial chat (2 min)
3. Test instance chat on test-fresh-1 (2 min)
4. Create one bug report using our template (real or fake) (10 min)
5. Submit bug report via GitHub or email (1 min)

**Expected Time**: 20 minutes total

**Deliverable**: One bug report in our format

---

**Ready?** Start with `QA-BRIEF.md` for full details, then run your first test!

**Questions?** Contact us before you start - better to ask than assume.

**Good luck!** 🚀
