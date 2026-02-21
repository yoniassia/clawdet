# Twitter OAuth Configuration Fix

## Problem
X/Twitter OAuth failing with error:
```
Something went wrong
You weren't able to give access to the App. Go back and try logging in again.
```

## Root Cause
Twitter Developer Portal app configuration issue. The app is either:
1. Missing callback URL whitelist
2. Not configured for OAuth 2.0
3. Missing required permissions
4. App not approved/active

## How to Fix

### Step 1: Access Twitter Developer Portal
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in with the account that owns the app
3. Select your app (the one with Client ID: `M1VrMmZOYUVWS01uYnhFanhfTEE6MTpjaQ`)

### Step 2: Configure OAuth 2.0 Settings
1. Go to **App Settings** → **User authentication settings**
2. Click **Set up** (or **Edit** if already configured)
3. Enable **OAuth 2.0**
4. Set **Type of App**: Web App, Automated App or Bot
5. **App permissions**: 
   - ✅ Read
   - Optional: Write (if you want to post tweets)
6. **Callback URI / Redirect URL**: Add these EXACT URLs:
   ```
   https://clawdet.com/api/auth/x/callback
   https://clawdet.com/api/auth/callback/twitter
   ```
7. **Website URL**: `https://clawdet.com`
8. **Organization name**: Clawdet
9. **Organization website**: `https://clawdet.com`
10. Click **Save**

### Step 3: Verify Client Credentials
After saving, you should see:
- **Client ID**: `M1VrMmZOYUVWS01uYnhFanhfTEE6MTpjaQ`
- **Client Secret**: `N_niOex-8m1fcuLAjffAV9g8TZG3F7P-_SIDqoOn5hC4KVffSj`

If these don't match, you'll need to:
1. Regenerate client secret
2. Update `.env.local` with new credentials
3. Rebuild and redeploy

### Step 4: Check App Status
1. Go to **Overview** tab
2. Verify app status is **Active** (not Suspended or Restricted)
3. Check for any warnings or errors

### Step 5: Test OAuth Flow
After configuration:
1. Wait 2-3 minutes for Twitter to propagate changes
2. Visit https://clawdet.com
3. Click "Sign Up with X"
4. Should redirect to Twitter authorization page
5. After approving, should redirect back to clawdet.com

## Current Configuration in Code

**OAuth Login Endpoint**: `/api/auth/x/login`
```javascript
const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('client_id', process.env.X_CLIENT_ID)
authUrl.searchParams.set('redirect_uri', 'https://clawdet.com/api/auth/x/callback')
authUrl.searchParams.set('scope', 'tweet.read users.read offline.access')
authUrl.searchParams.set('state', randomState)
authUrl.searchParams.set('code_challenge', 'challenge')
authUrl.searchParams.set('code_challenge_method', 'plain')
```

**Callback Endpoint**: `/api/auth/x/callback`
- Receives authorization code from Twitter
- Exchanges code for access token
- Creates user session
- Redirects to dashboard

## Alternative: Use NextAuth Twitter Provider

The app also has NextAuth configured with TwitterProvider:
- File: `/app/api/auth/[...nextauth]/route.ts`
- Callback: `https://clawdet.com/api/auth/callback/twitter`
- This might work better if the custom OAuth continues to fail

To switch to NextAuth Twitter:
1. Update signup button to use: `signIn('twitter', { callbackUrl: '/signup/details' })`
2. Add NextAuth callback to Twitter Developer Portal
3. Remove custom X OAuth endpoints (optional)

## Debug Logs
OAuth login logs show correct URL construction:
```
[X OAuth Login] OAuth URL built: https://twitter.com/i/oauth2/authorize?...
```

The redirect is working, but Twitter is rejecting the app authorization.

## Next Steps
1. **You need to configure the Twitter Developer Portal** (only you have access)
2. Add the callback URL: `https://clawdet.com/api/auth/x/callback`
3. Enable OAuth 2.0
4. Set permissions to Read + Users
5. Test the flow again

## Status
⚠️ Blocked - Requires Twitter Developer Portal access
🔧 Code is correct - Configuration issue on Twitter's side
