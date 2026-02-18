# Clawdet Troubleshooting Guide

**Quick solutions to common issues**  
*Last updated: February 18, 2026*

---

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Instance Issues](#instance-issues)
- [Connection Problems](#connection-problems)
- [Payment & Billing](#payment--billing)
- [Provisioning Issues](#provisioning-issues)
- [Performance Problems](#performance-problems)
- [Account & Authentication](#account--authentication)
- [Advanced Troubleshooting](#advanced-troubleshooting)
- [How to Get Support](#how-to-get-support)

---

## Quick Diagnostics

### Is Clawdet.com Down?

**Quick check:**
```bash
# From terminal
curl -I https://clawdet.com

# Expected: HTTP 200 OK
```

**Online status:**
- Check [status.clawdet.com](#) (future)
- Visit [clawdet.com](https://clawdet.com) in browser
- Check Twitter [@clawdet](#) for updates

### Is My Instance Down?

**Quick check:**
```bash
# Replace 'yourusername' with your username
curl -I https://yourusername.clawdet.com:18789

# Expected: HTTP 200 OK or connection
```

**From dashboard:**
- Visit [clawdet.com/dashboard](https://clawdet.com/dashboard)
- Check instance status indicator
- View provisioning logs

---

## Instance Issues

### Instance Not Responding

**Symptom:** Your instance URL returns timeout or connection error.

#### Solution 1: Check DNS Propagation
DNS takes 5-10 minutes to propagate after provisioning.

```bash
# Check if DNS is resolving
nslookup yourusername.clawdet.com

# Should return an IP address
```

**If no IP returned:**
- Wait 5-10 minutes
- Try from different network (mobile data)
- Clear DNS cache:
  - **Windows:** `ipconfig /flushdns`
  - **Mac:** `sudo dscacheutil -flushcache`
  - **Linux:** `sudo systemd-resolve --flush-caches`

#### Solution 2: Restart OpenClaw Service
SSH into your server and restart:

```bash
# SSH into your instance
ssh root@yourusername.clawdet.com

# Check service status
systemctl status openclaw-gateway

# Restart if needed
systemctl restart openclaw-gateway

# Check logs
journalctl -u openclaw-gateway -f
```

#### Solution 3: Check Server Resources
Your server might be out of memory or disk space:

```bash
# Check memory
free -m

# Check disk space
df -h

# Check CPU
top
```

**If out of resources:**
- Restart server: `reboot`
- Contact support if issue persists

### Instance Shows "502 Bad Gateway"

**Cause:** OpenClaw gateway is not running or crashed.

**Solution:**

```bash
# SSH into server
ssh root@yourusername.clawdet.com

# Check status
systemctl status openclaw-gateway

# If inactive/failed, check logs
journalctl -u openclaw-gateway --no-pager | tail -50

# Restart service
systemctl restart openclaw-gateway

# Verify it's running
curl http://localhost:18789
```

### Instance Shows Old/Cached Content

**Cause:** Cloudflare caching or browser cache.

**Solution:**

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Del → Clear cached images and files
   - Firefox: Ctrl+Shift+Del → Cached Web Content
   - Safari: Cmd+Option+E

2. **Force reload:**
   - Chrome/Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

3. **Purge Cloudflare cache:**
   - Visit Cloudflare dashboard
   - Go to Caching → Purge Everything
   - Or contact support

---

## Connection Problems

### Telegram Bot Not Responding

**Symptom:** Your Telegram bot doesn't reply to messages.

#### Solution 1: Verify Bot Configuration

```bash
# SSH into instance
ssh root@yourusername.clawdet.com

# Check environment variables
cat /root/.openclaw/.env | grep TELEGRAM

# Should see:
# TELEGRAM_BOT_TOKEN=your_token_here
```

**If missing:**
1. Get token from [@BotFather](https://t.me/BotFather)
2. Add to `.env`:
   ```bash
   echo "TELEGRAM_BOT_TOKEN=your_token" >> /root/.openclaw/.env
   ```
3. Restart: `systemctl restart openclaw-gateway`

#### Solution 2: Check Bot Status

```bash
# Check if bot is reachable
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# Should return bot info
```

#### Solution 3: Check Logs

```bash
# View Telegram-related logs
journalctl -u openclaw-gateway -f | grep -i telegram
```

### Web Interface Not Loading

**Symptom:** Web interface at `yourusername.clawdet.com` shows blank page or errors.

#### Solution 1: Check HTTPS

```bash
# Try HTTP first
curl http://yourusername.clawdet.com:18789

# Then HTTPS
curl https://yourusername.clawdet.com:18789
```

**If HTTP works but HTTPS doesn't:**
- Cloudflare SSL might be provisioning
- Wait 5-10 minutes
- Check Cloudflare dashboard SSL status

#### Solution 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (CORS, CSP, JavaScript)
4. Share errors with support

#### Solution 3: Disable Browser Extensions

- Try in Incognito/Private mode
- Disable ad blockers, privacy extensions
- Test in different browser

---

## Payment & Billing

### Payment Failed

**Common causes and solutions:**

#### Insufficient Funds
- Check card balance
- Try different card

#### Bank Decline
- Your bank might flag as unusual activity
- Call bank to authorize transaction
- Try again after authorization

#### Expired Card
- Update card in Stripe portal
- Visit [clawdet.com/dashboard](https://clawdet.com/dashboard) → Manage Subscription

#### Wrong CVV/ZIP
- Double-check card details
- Ensure billing address matches

#### Card Not Supported
- We accept: Visa, Mastercard, Amex, Discover
- International cards supported
- Try PayPal (if available)

### Charged But No Instance

**Symptom:** Payment succeeded but provisioning didn't start.

**Check:**
1. Visit [clawdet.com/dashboard](https://clawdet.com/dashboard)
2. Look for provisioning status
3. Check email for confirmation

**If no provisioning:**
1. Check Stripe payment status: [dashboard.stripe.com](https://dashboard.stripe.com)
2. Verify webhook was sent (check spam folder for confirmation)
3. Contact support with:
   - Order ID / Transaction ID
   - Email address used
   - Payment timestamp

### Subscription Not Canceled

**Solution:**

1. **Via Dashboard:**
   - Go to [clawdet.com/dashboard](https://clawdet.com/dashboard)
   - Click "Manage Subscription"
   - Cancel in Stripe portal

2. **Via Email:**
   - Email support@clawdet.com
   - Subject: "Cancel Subscription"
   - Include: Username and email

3. **Via Stripe:**
   - Log into [dashboard.stripe.com](https://dashboard.stripe.com)
   - Find your subscription
   - Cancel directly

### Refund Request

**7-day money-back guarantee:**

1. Email support@clawdet.com
2. Subject: "Refund Request"
3. Include:
   - Username
   - Email address
   - Reason (optional)
4. Receive refund in 3-5 business days

---

## Provisioning Issues

### Provisioning Stuck

**Symptom:** Provisioning has been "In Progress" for >15 minutes.

#### Check Status
```bash
# Via API (replace YOUR_SESSION_TOKEN)
curl https://clawdet.com/api/provisioning/status?userId=YOUR_USER_ID \
  -H "Cookie: user_session=YOUR_SESSION_TOKEN"
```

#### Common Stuck Points

**Stage: Creating VPS**
- Hetzner might be slow or down
- Check [status.hetzner.com](https://status.hetzner.com)
- Wait 5 more minutes
- Contact support if stuck >20 minutes

**Stage: Configuring DNS**
- Cloudflare API might be slow
- Check [status.cloudflare.com](https://status.cloudflare.com)
- DNS creation usually takes <30 seconds
- Contact support if stuck

**Stage: Installing OpenClaw**
- SSH installation in progress (takes 5-8 minutes)
- Package downloads might be slow
- Check dashboard for detailed logs
- Contact support if stuck >15 minutes

#### Manual Check
If you have SSH key, check VPS directly:

```bash
# Get VPS IP from dashboard
ssh root@<vps-ip>

# Check installation progress
tail -f /var/log/cloud-init-output.log

# Check OpenClaw status
systemctl status openclaw-gateway
```

### Provisioning Failed

**Symptom:** Provisioning shows "Failed" status.

**Immediate action:**
1. Check error message in dashboard
2. Contact support@clawdet.com with:
   - Username
   - Error message
   - Timestamp

**Common failures:**

**VPS Creation Failed:**
- Hetzner quota exceeded
- Payment issue with Hetzner
- Region capacity full
- → We'll provision manually

**DNS Creation Failed:**
- Subdomain already taken
- Cloudflare API error
- Invalid domain
- → We'll fix DNS manually

**Installation Failed:**
- Package download timeout
- Disk space issues
- Network connectivity
- → We'll re-run installation

---

## Performance Problems

### Slow Response Times

**Symptom:** Instance responds slowly (>3 seconds).

#### Solution 1: Check Server Load

```bash
ssh root@yourusername.clawdet.com

# Check CPU/Memory
htop

# Check running processes
ps aux | grep node
```

**High CPU/Memory:**
- Restart service: `systemctl restart openclaw-gateway`
- Check for memory leaks: `journalctl -u openclaw-gateway | grep -i "memory"`

#### Solution 2: Check Network

```bash
# Ping test
ping yourusername.clawdet.com

# Trace route
traceroute yourusername.clawdet.com
```

**High latency:**
- Your server is in Germany (Hetzner)
- Expect 100-200ms from US
- Use VPN closer to EU if needed

#### Solution 3: Clear Cache

```bash
# SSH into instance
ssh root@yourusername.clawdet.com

# Restart to clear cache
systemctl restart openclaw-gateway
```

### High Memory Usage

**Symptom:** Instance runs out of memory, becomes unresponsive.

**Check:**
```bash
free -m
```

**If <200MB free:**

```bash
# Restart to free memory
systemctl restart openclaw-gateway

# Check logs for memory issues
journalctl -u openclaw-gateway | grep -i oom
```

**Long-term solution:**
- Upgrade VPS to larger size (Hetzner console)
- Contact support for assistance

### Disk Space Full

**Symptom:** Instance stops working, shows disk errors.

**Check:**
```bash
df -h
```

**If >90% full:**

```bash
# Clean logs
journalctl --vacuum-time=7d

# Clean package cache
apt clean

# Find large files
du -h /root | sort -rh | head -20

# Delete old files
rm -rf /root/.openclaw/workspace/logs/*.old
```

---

## Account & Authentication

### Can't Log In

**Symptom:** X/Twitter OAuth fails or loops back.

#### Solution 1: Clear Cookies
1. Clear browser cookies for `clawdet.com`
2. Try again in Incognito mode
3. Try different browser

#### Solution 2: Check X/Twitter
- Verify your X account is active
- Check you authorized Clawdet app
- Go to [twitter.com/settings/connected_apps](https://twitter.com/settings/connected_apps)
- Remove Clawdet, try again

#### Solution 3: Contact Support
- Email support@clawdet.com
- Include: X username, timestamp of failed login

### Forgot Instance URL

**Solution:**
1. Visit [clawdet.com/dashboard](https://clawdet.com/dashboard)
2. Log in with X
3. Your URL will be displayed

**Or check email:**
- Search inbox for "clawdet"
- Provisioning confirmation email contains URL

### Lost SSH Access

**Solution:**

#### Get SSH Key from Email
- Check original provisioning email
- Subject: "Your Clawdet Instance is Ready"
- Contains SSH key or instructions

#### Reset SSH Key
- Email support@clawdet.com
- Request SSH key reset
- Verify account ownership
- Receive new key

---

## Advanced Troubleshooting

### Check System Status

**Full diagnostic:**

```bash
# SSH into instance
ssh root@yourusername.clawdet.com

# 1. Service status
systemctl status openclaw-gateway

# 2. Recent logs (last 100 lines)
journalctl -u openclaw-gateway --no-pager | tail -100

# 3. Error logs only
journalctl -u openclaw-gateway -p err

# 4. Resource usage
htop

# 5. Disk space
df -h

# 6. Network connectivity
curl https://api.x.ai/health
curl https://api.stripe.com/healthcheck

# 7. OpenClaw version
openclaw --version

# 8. Node.js version
node --version
```

### Reinstall OpenClaw

**If all else fails, reinstall:**

```bash
# SSH into instance
ssh root@yourusername.clawdet.com

# Stop service
systemctl stop openclaw-gateway

# Backup workspace
tar -czf /root/openclaw-backup.tar.gz /root/.openclaw/workspace

# Reinstall OpenClaw
npm uninstall -g openclaw
npm install -g openclaw@latest

# Restore workspace
# (workspace should persist, but backup is safe)

# Restart
systemctl start openclaw-gateway
systemctl status openclaw-gateway
```

### Check Logs for Errors

**Log locations:**

```bash
# Service logs (main source)
journalctl -u openclaw-gateway -f

# Application logs
tail -f /root/.openclaw/workspace/logs/*.log

# System logs
tail -f /var/log/syslog
```

**Common error patterns to search for:**

```bash
# Authentication errors
journalctl -u openclaw-gateway | grep -i "auth"

# API errors
journalctl -u openclaw-gateway | grep -i "api error"

# Memory errors
journalctl -u openclaw-gateway | grep -i "oom\|memory"

# Connection errors
journalctl -u openclaw-gateway | grep -i "econnrefused\|timeout"
```

### Emergency Recovery

**If instance is completely broken:**

#### Option 1: Reboot Server
```bash
ssh root@yourusername.clawdet.com
reboot
```

Wait 2 minutes, test again.

#### Option 2: Restore from Backup
```bash
# List backups
ls -lh /root/*backup*

# Restore
tar -xzf /root/openclaw-backup.tar.gz -C /

# Restart
systemctl restart openclaw-gateway
```

#### Option 3: Request Reprovisioning
- Contact support@clawdet.com
- Request instance reprovisioning
- We'll create a new VPS and migrate data

---

## How to Get Support

### Before Contacting Support

**Collect this information:**

1. **Your details:**
   - Username
   - Email address
   - Instance URL

2. **Issue description:**
   - What were you trying to do?
   - What happened instead?
   - When did it start?

3. **Error messages:**
   - Screenshots
   - Log excerpts
   - Error codes

4. **What you've tried:**
   - Solutions from this guide
   - Results of each attempt

### Contact Methods

**Email:** support@clawdet.com  
**Response time:** Usually 24 hours  
**For:** All issues, questions, feature requests

**Discord:** [discord.gg/openclaw](https://discord.gg/openclaw)  
**Response time:** Community-based  
**For:** Quick questions, community help

**GitHub Issues:** [github.com/openclaw/clawdet/issues](https://github.com/openclaw/clawdet/issues)  
**For:** Bug reports, feature requests (public)

### What to Include

**Email template:**

```
Subject: [ISSUE] Brief description

Account Information:
- Username: yourusername
- Email: your@email.com
- Instance URL: yourusername.clawdet.com

Problem Description:
[Describe what's wrong]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [Error occurs]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Error Messages:
[Copy error messages or attach screenshot]

Already Tried:
- [Solution 1 - Result]
- [Solution 2 - Result]

Additional Information:
- Browser: Chrome 120
- Device: Windows 11
- Timestamp: 2026-02-18 14:30 UTC
```

---

## Quick Reference

### Most Common Issues

| Problem | Quick Fix | Details |
|---------|-----------|---------|
| Instance not responding | Wait 10 min, then restart service | [Link](#instance-not-responding) |
| Telegram bot silent | Check bot token, restart service | [Link](#telegram-bot-not-responding) |
| Payment failed | Check card, try different one | [Link](#payment-failed) |
| Provisioning stuck | Wait 15 min, contact support | [Link](#provisioning-stuck) |
| Slow performance | Restart service | [Link](#slow-response-times) |
| Can't log in | Clear cookies, try incognito | [Link](#cant-log-in) |
| DNS not resolving | Wait 10 min, flush DNS cache | [Link](#solution-1-check-dns-propagation) |

### Emergency Commands

```bash
# Restart OpenClaw
ssh root@yourusername.clawdet.com 'systemctl restart openclaw-gateway'

# Check status
ssh root@yourusername.clawdet.com 'systemctl status openclaw-gateway'

# View recent logs
ssh root@yourusername.clawdet.com 'journalctl -u openclaw-gateway -n 50'

# Reboot server
ssh root@yourusername.clawdet.com 'reboot'
```

---

## Preventing Issues

### Best Practices

1. **Regular maintenance:**
   - Restart instance monthly
   - Check disk space weekly
   - Review logs occasionally

2. **Backups:**
   - Backup workspace monthly
   - Keep SSH key safe
   - Note down credentials

3. **Updates:**
   - Update OpenClaw when notified
   - Keep Node.js current
   - Apply security patches

4. **Monitoring:**
   - Set up uptime monitoring
   - Check dashboard weekly
   - Review performance metrics

### When to Contact Support

**Contact immediately if:**
- Instance down >1 hour
- Payment charged but no provisioning
- Data loss or corruption
- Security concerns

**Contact within 24 hours if:**
- Slow performance (>3 sec response)
- Provisioning stuck >15 minutes
- Telegram bot not working
- Configuration issues

**Self-serve first:**
- General questions (check FAQ)
- How-to guides (check USER-GUIDE)
- Feature requests (check roadmap)

---

**Still stuck?** → Email support@clawdet.com

We're here to help! 🚀

---

*Last updated: February 18, 2026*  
*For urgent issues, contact support@clawdet.com*
