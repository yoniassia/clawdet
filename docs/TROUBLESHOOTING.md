# Clawdet Troubleshooting Guide

Quick solutions to common issues with the Clawdet platform.

## 🔍 Table of Contents

- [User Issues](#user-issues)
- [Payment Issues](#payment-issues)
- [Provisioning Issues](#provisioning-issues)
- [Instance Issues](#instance-issues)
- [Platform Issues](#platform-issues)

---

## 👤 User Issues

### Can't Sign In / OAuth Fails

**Symptoms:**
- "Authorization failed" error
- Redirect loop during X OAuth
- Session expires immediately

**Solutions:**

1. **Check X OAuth credentials:**
   ```bash
   # Verify .env.local has correct values
   X_CLIENT_ID=your_client_id
   X_CLIENT_SECRET=your_secret
   X_REDIRECT_URI=https://clawdet.com/api/auth/x/callback
   ```

2. **Clear browser cookies:**
   - Open DevTools (F12)
   - Application → Cookies → Delete all for clawdet.com
   - Try signing in again

3. **Use mock mode for testing:**
   ```bash
   # In .env.local
   USE_MOCK_OAUTH=true
   ```

4. **Check X app settings:**
   - Visit [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
   - Verify callback URL matches exactly
   - Ensure app has OAuth 2.0 enabled

**Still not working?**
- Check browser console for JavaScript errors
- Verify server logs: `pm2 logs clawdet`
- Try incognito/private browsing mode

---

### Trial Chat Not Responding

**Symptoms:**
- Message sends but no response
- "Error loading response" message
- Infinite loading spinner

**Solutions:**

1. **Check Grok API key:**
   ```bash
   curl https://api.x.ai/v1/chat/completions \
     -H "Authorization: Bearer $GROK_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"grok-2-1212","messages":[{"role":"user","content":"hi"}]}'
   ```

2. **Verify API route:**
   ```bash
   curl https://clawdet.com/api/trial-chat \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"message":"test","sessionId":"test123"}'
   ```

3. **Check browser console:**
   - F12 → Console tab
   - Look for CORS or network errors

4. **Clear session storage:**
   - F12 → Application → Session Storage
   - Delete `trialMessageCount` key
   - Refresh page

**API Rate Limits:**
If you see "Too many requests" errors:
- Wait 1 minute and try again
- Check Grok API usage in X developer dashboard
- Consider upgrading API tier

---

### Message Counter Not Working

**Symptoms:**
- Can send more than 5 messages in trial
- Counter resets unexpectedly
- Upgrade prompt doesn't appear

**Solutions:**

1. **Session storage not persisting:**
   - Check browser privacy settings
   - Disable "Clear cookies on exit"
   - Try different browser

2. **Code issue:**
   ```javascript
   // app/trial/page.tsx - verify logic:
   if (messageCount > 5) {  // Should be > not >=
     router.push('/signup');
   }
   ```

3. **Force counter reset:**
   - Open browser console (F12)
   - Run: `sessionStorage.removeItem('trialMessageCount')`
   - Reload page

---

## 💳 Payment Issues

### Payment Not Processing

**Symptoms:**
- "Payment failed" error
- Stuck on checkout page
- No provisioning after payment

**Solutions:**

1. **Check Stripe configuration:**
   ```bash
   # Verify .env.local
   STRIPE_SECRET_KEY=sk_test_... or sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Test Stripe connection:**
   ```bash
   stripe customers list --limit 1
   # Should return customer list
   ```

3. **Verify webhook endpoint:**
   - Visit Stripe Dashboard → Developers → Webhooks
   - Check `https://clawdet.com/api/webhooks/stripe` is active
   - Status should be "Enabled"

4. **Test webhook manually:**
   ```bash
   stripe trigger checkout.session.completed
   ```

5. **Check webhook logs:**
   - Stripe Dashboard → Developers → Webhooks → Your endpoint
   - Click "Events" tab
   - Look for failed deliveries

**Card Declined:**
- Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- For live mode: ask user to contact their bank

---

### Webhook Not Firing

**Symptoms:**
- Payment succeeds but provisioning never starts
- User marked as paid but no VPS created
- Dashboard stuck on "Payment Pending"

**Solutions:**

1. **Verify webhook signature:**
   ```bash
   # Check logs for signature verification errors
   pm2 logs clawdet | grep "webhook"
   ```

2. **Test webhook locally:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # In another terminal:
   stripe trigger checkout.session.completed
   ```

3. **Check webhook endpoint is reachable:**
   ```bash
   curl -X POST https://clawdet.com/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type":"checkout.session.completed"}'
   # Should return 200 OK (even if signature fails)
   ```

4. **Manually trigger provisioning:**
   ```bash
   # SSH into server
   node scripts/manual-provision.js <username>
   ```

5. **Webhook secret mismatch:**
   - Regenerate secret in Stripe dashboard
   - Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
   - Restart application: `pm2 restart clawdet`

---

## 🔨 Provisioning Issues

### VPS Creation Failed

**Symptoms:**
- Provisioning stuck on "Creating VPS"
- Error: "Failed to create server"
- Dashboard shows "provisioning_failed" status

**Solutions:**

1. **Check Hetzner API token:**
   ```bash
   curl https://api.hetzner.cloud/v1/servers \
     -H "Authorization: Bearer $HETZNER_API_TOKEN"
   # Should return server list, not 401
   ```

2. **Verify account credits:**
   - Login to [console.hetzner.cloud](https://console.hetzner.cloud)
   - Check billing section for sufficient balance
   - Add payment method if needed

3. **Server type availability:**
   ```bash
   # Check if CX11 is available in selected location
   curl https://api.hetzner.cloud/v1/server_types/cx11
   ```

4. **Try different datacenter:**
   - Edit `lib/hetzner.ts`
   - Change location from `nbg1` to `fsn1` or `hel1`

5. **Resource limits:**
   - Check Hetzner project for server limits
   - May need to request limit increase

**Manual VPS creation:**
```bash
# Create VPS manually via Hetzner dashboard
# Then update database:
node scripts/link-vps.js <username> <vps_id> <vps_ip>
```

---

### SSH Connection Timeout

**Symptoms:**
- Provisioning stuck on "Installing OpenClaw"
- Error: "SSH connection timed out"
- VPS created but OpenClaw not installed

**Solutions:**

1. **Wait longer:**
   - VPS takes 30-60s to boot
   - SSH daemon needs additional 10-20s
   - Default timeout: 5 minutes

2. **Check VPS is running:**
   ```bash
   # Via Hetzner CLI
   hcloud server describe <server_id>
   # Status should be "running"
   ```

3. **Test SSH manually:**
   ```bash
   ssh -o StrictHostKeyChecking=no root@<vps_ip>
   # If prompted for password, SSH key wasn't added correctly
   ```

4. **Cloud-init still running:**
   ```bash
   ssh root@<vps_ip>
   cloud-init status --long
   # Wait until status is "done"
   ```

5. **Firewall blocking SSH:**
   - Check Hetzner firewall rules
   - Ensure port 22 is open from your server IP
   - Temporarily disable firewall for testing

**Retry SSH installation:**
```bash
node scripts/retry-ssh-install.js <username>
```

---

### DNS Not Resolving

**Symptoms:**
- Subdomain returns "Server not found"
- Can access via IP but not subdomain
- Provisioning completes but URL doesn't work

**Solutions:**

1. **Wait for DNS propagation:**
   - Can take 5-30 minutes
   - Check progress: [dnschecker.org](https://dnschecker.org)
   - Test directly: `dig username.clawdet.com @1.1.1.1`

2. **Verify DNS record created:**
   ```bash
   # List all DNS records
   curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
     -H "Authorization: Bearer $CF_TOKEN"
   ```

3. **Check Cloudflare proxy status:**
   - DNS record should have `"proxied": true`
   - Orange cloud icon in Cloudflare dashboard
   - This enables automatic SSL

4. **Recreate DNS record:**
   ```bash
   node scripts/fix-dns.js <username> <vps_ip>
   ```

5. **Cloudflare API permissions:**
   - Token needs `Zone:DNS:Edit` permission
   - Verify in Cloudflare → My Profile → API Tokens

**Temporary workaround:**
- Use direct IP access: `http://<vps_ip>:18789`
- Add to local `/etc/hosts` for testing:
  ```
  <vps_ip> username.clawdet.com
  ```

---

### OpenClaw Installation Failed

**Symptoms:**
- SSH connects but installation errors out
- Gateway not starting on VPS
- Port 18789 not responding

**Solutions:**

1. **Check installation logs:**
   ```bash
   ssh root@<vps_ip>
   cat /var/log/cloud-init-output.log
   # Look for error messages
   ```

2. **Missing dependencies:**
   ```bash
   ssh root@<vps_ip>
   node --version  # Should be v18+
   npm --version   # Should be 9+
   ```

3. **Manual installation:**
   ```bash
   ssh root@<vps_ip>
   curl -fsSL https://openclaw.com/install.sh | bash
   cd /root/.openclaw
   openclaw gateway start
   ```

4. **Configuration errors:**
   ```bash
   ssh root@<vps_ip>
   cat /root/.openclaw/config.json
   # Verify Grok API key is present
   ```

5. **Gateway not starting:**
   ```bash
   ssh root@<vps_ip>
   systemctl status openclaw-gateway
   journalctl -u openclaw-gateway -n 50
   ```

**Fix and restart:**
```bash
ssh root@<vps_ip>
openclaw gateway config --set grok.apiKey=$GROK_API_KEY
openclaw gateway restart
```

---

## 🖥️ Instance Issues

### Instance Not Responding

**Symptoms:**
- Subdomain times out
- 502 Bad Gateway error
- OpenClaw gateway offline

**Solutions:**

1. **Check gateway status:**
   ```bash
   ssh root@<vps_ip>
   openclaw gateway status
   # Should show "running"
   ```

2. **Restart gateway:**
   ```bash
   ssh root@<vps_ip>
   openclaw gateway restart
   ```

3. **Check port binding:**
   ```bash
   ssh root@<vps_ip>
   netstat -tulpn | grep 18789
   # Should show node process listening
   ```

4. **Verify firewall:**
   ```bash
   ssh root@<vps_ip>
   ufw status
   # Ensure port 18789 is allowed
   ufw allow 18789/tcp
   ```

5. **Check system resources:**
   ```bash
   ssh root@<vps_ip>
   free -h        # Memory usage
   df -h          # Disk space
   top            # CPU usage
   ```

**Out of memory:**
```bash
# Kill memory-hungry processes
pkill -f "node.*openclaw"
# Restart gateway
openclaw gateway start
```

---

### Bot Not Responding (Telegram)

**Symptoms:**
- Messages sent to bot but no reply
- Bot shows offline
- Commands don't work

**Solutions:**

1. **Check bot configuration:**
   ```bash
   ssh root@<vps_ip>
   cd /root/.openclaw
   cat config.json | grep telegram
   # Verify bot token is present
   ```

2. **Restart gateway:**
   ```bash
   ssh root@<vps_ip>
   openclaw gateway restart
   ```

3. **Check Telegram API:**
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getMe
   # Should return bot info
   ```

4. **Verify webhook:**
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   # Check if webhook is set correctly
   ```

5. **Check logs:**
   ```bash
   ssh root@<vps_ip>
   openclaw gateway logs | grep telegram
   ```

**Reconnect bot:**
```bash
ssh root@<vps_ip>
openclaw telegram disconnect
openclaw telegram connect --token $TELEGRAM_BOT_TOKEN
openclaw gateway restart
```

---

### High Memory Usage / Crashes

**Symptoms:**
- Instance becomes slow or unresponsive
- Out of memory errors in logs
- Gateway crashes frequently

**Solutions:**

1. **Check memory usage:**
   ```bash
   ssh root@<vps_ip>
   free -h
   # If "available" is < 100MB, you have a problem
   ```

2. **Clear cache:**
   ```bash
   ssh root@<vps_ip>
   rm -rf /root/.openclaw/cache/*
   sync && echo 3 > /proc/sys/vm/drop_caches
   ```

3. **Restart gateway:**
   ```bash
   ssh root@<vps_ip>
   openclaw gateway restart
   ```

4. **Identify memory hogs:**
   ```bash
   ssh root@<vps_ip>
   ps aux --sort=-%mem | head -10
   ```

5. **Upgrade VPS:**
   - From CX11 (2GB) to CPX21 (4GB)
   - Contact support for upgrade

**Prevent future crashes:**
```bash
# Add swap space
ssh root@<vps_ip>
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 🏢 Platform Issues

### Database Corruption

**Symptoms:**
- "Cannot read users.json" error
- Invalid JSON errors in logs
- User data missing or incorrect

**Solutions:**

1. **Validate JSON:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('data/users.json'))"
   # If error, file is corrupted
   ```

2. **Restore from backup:**
   ```bash
   cp data.backup.$(date +%Y%m%d)/users.json data/users.json
   pm2 restart clawdet
   ```

3. **Manual JSON repair:**
   - Open `data/users.json` in editor
   - Look for syntax errors (missing quotes, commas)
   - Validate at [jsonlint.com](https://jsonlint.com)

4. **Rebuild from logs:**
   ```bash
   node scripts/rebuild-db-from-logs.js
   ```

---

### High CPU Usage

**Symptoms:**
- Server very slow
- API requests timing out
- Load average >4.0

**Solutions:**

1. **Identify CPU hogs:**
   ```bash
   top -bn1 | head -20
   htop  # Interactive viewer
   ```

2. **Check for runaway processes:**
   ```bash
   ps aux --sort=-%cpu | head -10
   # Kill if necessary:
   kill -9 <PID>
   ```

3. **Restart application:**
   ```bash
   pm2 restart clawdet
   ```

4. **Enable caching:**
   - Verify `lib/cache.ts` is being used
   - Check cache hit rate: `curl localhost:3000/api/stats`

5. **Optimize queries:**
   - Add indexes to database
   - Reduce unnecessary API calls
   - Implement rate limiting

---

### Application Won't Start

**Symptoms:**
- `npm start` fails
- PM2 shows "errored" status
- Port already in use

**Solutions:**

1. **Check for port conflicts:**
   ```bash
   lsof -i :3000
   # Kill conflicting process:
   kill -9 <PID>
   ```

2. **Verify dependencies:**
   ```bash
   npm install
   # Check for errors
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   # Should be v18+ for Next.js 14
   ```

4. **Review error logs:**
   ```bash
   pm2 logs clawdet --err
   ```

5. **Rebuild application:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   npm start
   ```

---

### SSL Certificate Issues

**Symptoms:**
- "Not Secure" warning in browser
- Certificate expired
- Mixed content warnings

**Solutions:**

1. **Using Cloudflare proxy (recommended):**
   - Cloudflare handles SSL automatically
   - Verify DNS record has `"proxied": true`
   - Orange cloud should be ON in dashboard

2. **Manual certificate:**
   ```bash
   # If not using Cloudflare proxy
   certbot certonly --standalone -d clawdet.com
   # Renew before expiry:
   certbot renew
   ```

3. **Mixed content (http + https):**
   - Check browser console for warnings
   - Ensure all resources use `https://`
   - Add to CSP headers if needed

---

## 🆘 Getting More Help

If none of these solutions work:

1. **Check status page**: [status.clawdet.com](https://status.clawdet.com)
2. **Search GitHub issues**: [github.com/clawdet/issues](https://github.com/clawdet/issues)
3. **Ask in Discord**: [discord.gg/clawdet](https://discord.gg/clawdet)
4. **Email support**: support@clawdet.com

When reporting issues, include:
- Username or email
- Exact error message
- Steps to reproduce
- Browser console output (F12 → Console)
- Relevant log excerpts

---

*Last Updated: February 2026*
