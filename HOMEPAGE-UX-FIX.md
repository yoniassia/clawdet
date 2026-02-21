# Homepage UX Fix - 2026-02-21 19:58 UTC

## Issues Reported
1. **No visible sign-up button** - Users couldn't find how to sign up until after using all 5 trial messages
2. **test-fresh chat button broken** - Link pointed to test-fresh which shows setup instructions, not a chat

## Changes Made

### 1. Added Header Sign-Up Button
- Added prominent "Sign Up with X" button in top-right corner
- Visible immediately when landing on homepage
- Uses gradient styling matching the brand

**Files Modified:**
- `/root/.openclaw/workspace/clawdet/app/page.tsx`
  - Added `.header` div with logo and sign-up button
  - Button triggers `handleXOnboarding()` → `/api/auth/x/login`
  
- `/root/.openclaw/workspace/clawdet/app/home.module.css`
  - Added `.header` flexbox layout
  - Added `.headerSignUpButton` with gradient styling and hover effects

### 2. Fixed Upgrade Prompt After 5 Messages
- Changed from "Try Full Demo" (test-fresh) to "Other Options" (signup page)
- Primary button now triggers X OAuth directly
- Secondary button links to `/signup` for email/other auth methods

**Before:**
```
[Sign Up with X] [Try Full Demo →]
```

**After:**
```
[Sign Up with X] [Other Options]
```

## Deployment
```bash
cd /root/.openclaw/workspace/clawdet
rm -rf .next
npm run build
pm2 restart clawdet-prod --update-env
```

## Live URLs
- Homepage: https://clawdet.com (now shows sign-up button)
- Sign-up page: https://clawdet.com/signup
- X OAuth flow: https://clawdet.com/api/auth/x/login

## User Flow (Fixed)
1. Land on clawdet.com
2. **SEE "Sign Up with X" button immediately** ✅ (NEW)
3. Try 5 free messages in trial chat
4. After 5 messages → upgrade prompt with X OAuth
5. Click sign up → X OAuth → Get instance at username.clawdet.com

## Testing
```bash
# Verify sign-up button is visible
curl -s https://clawdet.com | grep -i "sign up"

# Should see: <button class="home_headerSignUpButton__BSblw">...Sign Up with X</button>
```

## Status
✅ Deployed and live
✅ Sign-up button visible on first load
✅ No more confusing test-fresh link
✅ Clear path to X OAuth onboarding
