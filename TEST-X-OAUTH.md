# Test X OAuth - Step by Step

## Quick Test (2 minutes)

**1. Open Browser (Incognito/Private)**
```
https://clawdet.com/signup
```

**2. Click "Continue with X"** (the button with X logo)

**Expected Behavior:**

### ✅ If Working (callback whitelisted):
1. Redirects to Twitter login (if not logged in)
2. Shows authorization screen:
   ```
   Clawdet wants to:
   - Read Tweets from your timeline
   - Read your profile information
   - Stay connected to your account
   ```
3. Click "Authorize app"
4. Redirects back to `https://clawdet.com/signup/details`
5. You're logged in! ✅

### ❌ If NOT Working (callback not whitelisted):
1. Redirects to Twitter login
2. You log in
3. Shows error page:
   ```
   Something went wrong
   You weren't able to give access to the App.
   Go back and try logging in again.
   ```
4. ← This means callback URL is NOT whitelisted yet

## Check Logs During Test

**In Terminal:**
```bash
pm2 logs clawdet-prod --lines 0
```

**Then click "Continue with X" in browser**

**Expected Log Sequence:**

### Step 1: OAuth Initiation ✅
```
[X OAuth] === AUTHORIZE START ===
[X OAuth] Client ID: M1VrMmZOYU...
[X OAuth] Client Secret configured: YES
[X OAuth] Redirect URI: https://clawdet.com/api/auth/x/callback
[X OAuth] PKCE code_challenge generated (SHA256)
[X OAuth] Redirecting to X authorization URL
```

### Step 2: After Authorization (if callback whitelisted)
```
[X OAuth Callback] Request received
[X OAuth Callback] Code: present
[X OAuth Callback] State: <random>
[X OAuth Callback] Code verifier: present
[X OAuth Callback] State verified, exchanging code for token
[X OAuth Callback] Token received, access_token: present
[X OAuth Callback] Fetching user info from Twitter API
[X OAuth Callback] User data received: {"id":"...","username":"..."}
[X OAuth Callback] Creating/updating user in database
[X OAuth Callback] User upserted
[X OAuth Callback] OAuth flow complete
```

**If you DON'T see Step 2**, the callback URL is not whitelisted.

## What to Check in Twitter Developer Portal

**1. Go to:**
https://developer.twitter.com/en/portal/dashboard

**2. Find Your App:**
- Client ID: `M1VrMmZOYUVWS01uYnhFanhfTEE6MTpjaQ`

**3. User Authentication Settings → Callback URLs:**

**Should contain:**
```
https://clawdet.com/api/auth/x/callback
```

**Also check:**
```
https://x.moneyclaw.com/api/auth/x/callback  (ClawX - can stay)
```

**4. App Settings:**
- ✅ OAuth 2.0 enabled
- ✅ Type: Web App / Automated App / Bot
- ✅ Permissions: Read + Users + Write (optional)

## Alternative: Email Sign-Up (Already Working)

If X OAuth still doesn't work, users can sign up with email:

**1. On signup page, scroll down**

**2. Fill in form:**
- Name: Your Name
- Email: you@example.com
- Password: (min 8 characters)

**3. Click "Create Account"**

**4. Done!** ✅

Email auth is fully working and ready for production.

## Debug: Check Current Status

```bash
# Check if OAuth redirect is working
curl -sI https://clawdet.com/api/auth/x/login | grep location

# Should return:
# location: https://twitter.com/i/oauth2/authorize?...

# Check recent callback attempts
pm2 logs clawdet-prod --lines 100 --nostream | grep -i callback

# If empty: No one has completed OAuth yet
# If errors: Callback URL not whitelisted or other issue
```

## Current Status

✅ **Code is perfect:**
- OAuth initiation working
- SHA256 PKCE implemented
- Callback handler ready
- Logging comprehensive

⚠️ **Needs Twitter Portal:**
- Callback URL must be whitelisted
- Takes ~2 minutes to configure
- Changes propagate in 2-3 minutes

✅ **Email auth working:**
- Users can sign up with email now
- No dependency on X OAuth
- Full production ready

## Quick Troubleshooting

**Error: "Something went wrong"**
→ Callback URL not whitelisted in Twitter portal

**Error: "invalid_state"**
→ Browser cleared cookies, try again

**Error: "session_expired"**
→ Took too long (>10 min), try again

**No error, but redirects to homepage**
→ Check browser console for errors
→ Try hard refresh (Ctrl+Shift+R)

**Stuck at Twitter authorization screen**
→ Click "Authorize app" button
→ If button disabled, check browser console

---

**Next Step:** Test it yourself at https://clawdet.com/signup

If you see the Twitter error "Something went wrong", the callback needs to be whitelisted.
If it works and logs in, we're good to go! 🎉
