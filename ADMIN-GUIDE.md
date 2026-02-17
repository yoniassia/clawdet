# Clawdet Admin Guide

Operations manual for platform administrators managing the Clawdet SaaS infrastructure.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Server Management](#server-management)
3. [User Management](#user-management)
4. [Provisioning](#provisioning)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Billing & Payments](#billing--payments)
8. [Security](#security)
9. [Maintenance](#maintenance)
10. [Emergency Procedures](#emergency-procedures)

---

## System Overview

### Architecture

**Main Server:**
- Domain: clawdet.com
- IP: 188.34.197.212
- Port: 18789 (internal), 443 (external via Cloudflare)
- OS: Ubuntu 22.04 LTS
- Stack: Next.js 15, Node.js 22, TypeScript

**External Services:**
- **Hetzner Cloud:** VPS provisioning
- **Cloudflare:** DNS management and SSL
- **Stripe:** Payment processing
- **xAI:** Grok API for trial chat
- **X/Twitter:** OAuth authentication

**Database:**
- Type: JSON file storage (data/users.json)
- Location: `/root/.openclaw/workspace/clawdet/data/`
- Backup: Manual (should be automated)

### Key Directories

```
/root/.openclaw/workspace/clawdet/
├── app/                  # Next.js pages and API routes
├── lib/                  # Core services
├── data/                 # User database
├── logs/                 # Application logs
└── .env                  # Environment configuration
```

---

## Server Management

### SSH Access

```bash
ssh root@clawdet.com
# or
ssh root@188.34.197.212
```

### Service Management

**Check status:**
```bash
pm2 status clawdet
# or
systemctl status clawdet
```

**Restart service:**
```bash
pm2 restart clawdet
# or
systemctl restart clawdet
```

**View logs:**
```bash
pm2 logs clawdet --lines 100
# or
journalctl -u clawdet -f
```

**Stop service:**
```bash
pm2 stop clawdet
systemctl stop clawdet
```

**Start service:**
```bash
pm2 start clawdet
systemctl start clawdet
```

### Deploying Updates

1. **SSH into server:**
   ```bash
   ssh root@clawdet.com
   cd /root/.openclaw/workspace/clawdet
   ```

2. **Pull latest code:**
   ```bash
   git pull origin main
   ```

3. **Install dependencies:**
   ```bash
   npm install --production
   ```

4. **Build application:**
   ```bash
   npm run build
   ```

5. **Restart service:**
   ```bash
   pm2 restart clawdet
   ```

6. **Verify:**
   ```bash
   curl https://clawdet.com/api/health
   pm2 logs clawdet --lines 20
   ```

### Environment Configuration

Edit production environment:

```bash
nano /root/.openclaw/workspace/clawdet/.env
```

**Critical variables:**
```env
NODE_ENV=production
PORT=18789

# APIs
GROK_API_KEY=<xai-key>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
HETZNER_API_TOKEN=<hetzner-token>
CLOUDFLARE_API_TOKEN=<cf-token>
CLOUDFLARE_ZONE_ID=<zone-id>

# OAuth
TWITTER_CLIENT_ID=<client-id>
TWITTER_CLIENT_SECRET=<client-secret>
TWITTER_CALLBACK_URL=https://clawdet.com/api/auth/x/callback

# Security
SESSION_SECRET=<64-char-random-string>
ALLOWED_ORIGINS=https://clawdet.com

# Mock modes (should be false in production)
MOCK_OAUTH=false
MOCK_STRIPE=false
MOCK_PROVISIONING=false
```

**After changing .env:**
```bash
pm2 restart clawdet
```

---

## User Management

### Viewing Users

**List all users:**
```bash
cd /root/.openclaw/workspace/clawdet
node -e "console.log(JSON.parse(require('fs').readFileSync('data/users.json')).users)"
```

**Check specific user:**
```bash
grep "username" data/users.json | head -5
```

**Count users:**
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('data/users.json')).users.length)"
```

### Manual User Operations

**Find user by username:**
```typescript
import { findUserById, findUserByTwitterId, getAllUsers } from './lib/db';

const user = getAllUsers().find(u => u.username === 'target_username');
console.log(user);
```

**Update user manually:**
```bash
# Edit data/users.json carefully
nano data/users.json

# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('data/users.json'))"

# Restart to apply changes (if cached)
pm2 restart clawdet
```

**Mark user as paid:**
```json
{
  "paid": true,
  "subscriptionId": "sub_xxxxx",
  "provisioningStatus": "pending"
}
```

**Reset user session:**
Remove `sessionToken` and `sessionCreatedAt` fields from the user object.

### Deactivating a User

1. **Cancel subscription in Stripe dashboard**
2. **Update user record:**
   ```json
   {
     "paid": false,
     "provisioningStatus": "cancelled"
   }
   ```
3. **Optionally delete their VPS:**
   ```bash
   # Use Hetzner console or API
   curl -X DELETE https://api.hetzner.cloud/v1/servers/<server-id> \
     -H "Authorization: Bearer $HETZNER_API_TOKEN"
   ```

---

## Provisioning

### Manual Provisioning Trigger

If automatic provisioning fails, trigger manually:

```bash
curl -X POST https://clawdet.com/api/provisioning/start \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id_here"}'
```

### Checking Provisioning Status

**Via API:**
```bash
curl https://clawdet.com/api/provisioning/status?userId=<user-id>
```

**Via logs:**
```bash
pm2 logs clawdet | grep "Provisioning"
```

### Provisioning Stages

1. **pending** — Waiting to start
2. **creating_vps** — Creating Hetzner VPS
3. **configuring_dns** — Setting up DNS + SSL
4. **installing** — SSH into VPS and install OpenClaw
5. **complete** — Ready to use
6. **failed** — Error occurred (check logs)

### Troubleshooting Provisioning

**VPS creation failed:**
- Check Hetzner API token validity
- Verify account has quota/balance
- Check Hetzner status page: [status.hetzner.com](https://status.hetzner.com)

**DNS creation failed:**
- Check Cloudflare API token permissions
- Verify zone ID is correct
- Check for subdomain conflicts (already exists)

**SSH installation failed:**
- Verify VPS is reachable (ping IP)
- Check SSH key is valid
- Review cloud-init logs on VPS:
  ```bash
  ssh root@<vps-ip>
  cat /var/log/cloud-init-output.log
  ```

**Manual provisioning steps:**

1. **Create VPS manually via Hetzner console**
2. **Get IP address**
3. **Create DNS record in Cloudflare:**
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"A","name":"username","content":"<vps-ip>","ttl":1,"proxied":true}'
   ```
4. **SSH into VPS and install OpenClaw:**
   ```bash
   ssh root@<vps-ip>
   
   # Install Node.js 22
   curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
   apt-get install -y nodejs
   
   # Install OpenClaw
   npm install -g openclaw
   
   # Configure
   mkdir -p /root/.openclaw
   echo "GROK_API_KEY=<key>" > /root/.openclaw/.env
   
   # Start service
   openclaw gateway start
   ```

---

## Monitoring

### Health Check

```bash
curl https://clawdet.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "uptime": 86400
}
```

### Performance Metrics

```bash
curl https://clawdet.com/api/stats
```

Returns:
- Request count
- Average response time
- Cache hit/miss rates
- Error counts

### System Resources

**Check CPU/RAM:**
```bash
htop
# or
top
```

**Check disk space:**
```bash
df -h
```

**Check network:**
```bash
netstat -tulpn | grep 18789
```

### Log Monitoring

**Application logs:**
```bash
pm2 logs clawdet --lines 100
tail -f /root/.openclaw/workspace/clawdet/logs/app.log
```

**System logs:**
```bash
journalctl -xe
```

**Nginx logs (if using):**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Alerts

**Set up monitoring (recommended):**
- **Uptime Robot** — Ping clawdet.com/api/health every 5 minutes
- **New Relic / Datadog** — Application performance monitoring
- **Sentry** — Error tracking and reporting
- **PagerDuty** — On-call alerts

---

## Troubleshooting

### Common Issues

#### Service Won't Start

1. **Check port conflicts:**
   ```bash
   lsof -i :18789
   ```

2. **Check environment variables:**
   ```bash
   cat .env | grep API_KEY
   ```

3. **Check logs for errors:**
   ```bash
   pm2 logs clawdet --err
   ```

#### High Memory Usage

1. **Check process:**
   ```bash
   ps aux | grep node
   ```

2. **Restart service:**
   ```bash
   pm2 restart clawdet
   ```

3. **Increase memory limit (if needed):**
   ```bash
   pm2 delete clawdet
   pm2 start npm --name clawdet --max-memory-restart 2G -- start
   ```

#### Database Corruption

If `data/users.json` is corrupted:

1. **Restore from backup:**
   ```bash
   cp data/users.json.backup data/users.json
   ```

2. **Validate JSON:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('data/users.json'))"
   ```

3. **If no backup, recreate:**
   ```bash
   echo '{"users":[]}' > data/users.json
   ```

#### SSL Certificate Issues

Cloudflare handles SSL automatically. If issues arise:

1. **Check Cloudflare proxy status** (should be orange cloud, not grey)
2. **Verify DNS records point to correct IP**
3. **Check SSL/TLS mode in Cloudflare** (should be "Full" or "Full (strict)")

---

## Billing & Payments

### Stripe Dashboard

Access: [dashboard.stripe.com](https://dashboard.stripe.com)

**Key sections:**
- **Payments** — View successful/failed transactions
- **Customers** — Manage subscriptions
- **Webhooks** — Check webhook delivery status
- **Logs** — Debug payment issues

### Testing Webhooks

**Test webhook locally:**
```bash
stripe listen --forward-to localhost:18789/api/webhooks/stripe
```

**Trigger test event:**
```bash
stripe trigger checkout.session.completed
```

### Handling Payment Failures

1. **Check Stripe dashboard** for failure reason
2. **Contact customer** via email
3. **Update subscription** or cancel if needed
4. **Mark user as unpaid** in database:
   ```json
   {"paid": false, "provisioningStatus": "payment_failed"}
   ```

### Refunds

Process refunds via Stripe dashboard:

1. Go to **Payments**
2. Find the transaction
3. Click **Refund**
4. Update user record:
   ```json
   {"paid": false, "provisioningStatus": "refunded"}
   ```

---

## Security

### Access Control

**Who has access:**
- Root SSH: Admin only
- Stripe dashboard: Billing team
- Cloudflare: DevOps team
- Hetzner: Infrastructure team

**Rotate credentials regularly:**
- SSH keys: Every 6 months
- API tokens: Every 3 months
- Session secrets: Annually

### Audit Logs

**Review access logs:**
```bash
tail -f /var/log/auth.log  # SSH logins
pm2 logs clawdet | grep "auth"  # App authentication
```

**Check for suspicious activity:**
- Multiple failed login attempts
- Unusual API usage patterns
- Unauthorized provisioning requests

### Security Updates

**System updates:**
```bash
apt update
apt upgrade -y
apt autoremove -y
```

**Node.js updates:**
```bash
npm update -g
npm audit fix
```

**Dependency updates:**
```bash
cd /root/.openclaw/workspace/clawdet
npm audit
npm update
```

### Incident Response

If security breach suspected:

1. **Isolate system** — Block traffic if needed
2. **Review logs** — Identify attack vector
3. **Rotate all credentials** — API keys, tokens, passwords
4. **Notify affected users** — If data compromised
5. **Patch vulnerability** — Update code/dependencies
6. **Document incident** — Post-mortem analysis

---

## Maintenance

### Scheduled Maintenance

**Monthly tasks:**
- Review system updates
- Check disk space
- Audit user database
- Review error logs
- Test backup restoration

**Quarterly tasks:**
- Security audit
- Performance optimization
- Dependency updates
- Review provisioned VPS instances

**Annually:**
- Rotate credentials
- Review infrastructure costs
- Plan capacity upgrades

### Backup Procedures

**Database backup:**
```bash
cp data/users.json data/users.json.backup.$(date +%Y%m%d)
```

**Full backup:**
```bash
tar -czf clawdet-backup-$(date +%Y%m%d).tar.gz \
  /root/.openclaw/workspace/clawdet
```

**Automated backups:**
Add to crontab:
```bash
crontab -e

# Daily backup at 3 AM
0 3 * * * cd /root/.openclaw/workspace/clawdet && cp data/users.json data/users.json.backup.$(date +\%Y\%m\%d)
```

### Capacity Planning

**Monitor growth:**
- User signups per week
- VPS provisioning rate
- Hetzner account quota
- Bandwidth usage

**Scaling indicators:**
- Consistent 80%+ CPU usage
- Memory usage above 85%
- Disk space below 20% free
- Response times > 2 seconds

---

## Emergency Procedures

### Service Down

1. **Check service status:**
   ```bash
   pm2 status clawdet
   systemctl status clawdet
   ```

2. **Check logs for errors:**
   ```bash
   pm2 logs clawdet --err --lines 50
   ```

3. **Restart service:**
   ```bash
   pm2 restart clawdet
   ```

4. **If persists, check system resources:**
   ```bash
   df -h
   free -m
   top
   ```

5. **Notify users** if extended downtime expected

### Database Corrupted

1. **Stop service:**
   ```bash
   pm2 stop clawdet
   ```

2. **Restore from latest backup:**
   ```bash
   cp data/users.json.backup.YYYYMMDD data/users.json
   ```

3. **Validate JSON:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('data/users.json'))"
   ```

4. **Restart service:**
   ```bash
   pm2 start clawdet
   ```

### Hetzner API Down

1. **Check Hetzner status:** [status.hetzner.com](https://status.hetzner.com)
2. **Enable mock mode temporarily:**
   ```bash
   nano .env
   # Set MOCK_PROVISIONING=true
   pm2 restart clawdet
   ```
3. **Notify users** of provisioning delays
4. **Process stuck provisions manually** when API returns

### Payment System Failure

1. **Check Stripe status:** [status.stripe.com](https://status.stripe.com)
2. **Review webhook logs** in Stripe dashboard
3. **If critical, enable mock mode:**
   ```env
   MOCK_STRIPE=true
   ```
4. **Contact Stripe support** if issue persists
5. **Manually process payments** if needed (via dashboard)

---

## Contact Information

**Platform Owner:**
- Name: [Your Name]
- Email: admin@clawdet.com
- Phone: +X-XXX-XXX-XXXX

**On-Call Rotation:**
- Week 1: [Name] — [Contact]
- Week 2: [Name] — [Contact]
- Week 3: [Name] — [Contact]

**Service Providers:**
- Hetzner Support: [support.hetzner.com](https://support.hetzner.com)
- Cloudflare Support: [cloudflare.com/support](https://cloudflare.com/support)
- Stripe Support: [support.stripe.com](https://support.stripe.com)

---

## Useful Commands Cheat Sheet

```bash
# Service management
pm2 status
pm2 restart clawdet
pm2 logs clawdet
pm2 monit

# System checks
df -h                    # Disk space
free -m                  # Memory
top / htop              # CPU usage
netstat -tulpn          # Network ports

# Logs
tail -f logs/app.log
journalctl -u clawdet -f
pm2 logs --lines 100

# Database
cat data/users.json | jq '.users | length'    # User count
cat data/users.json | jq '.users[] | select(.paid == true)' # Paid users

# Deployment
git pull origin main
npm install --production
npm run build
pm2 restart clawdet

# Backup
cp data/users.json data/users.json.backup.$(date +%Y%m%d)
tar -czf backup.tar.gz /root/.openclaw/workspace/clawdet

# Health check
curl https://clawdet.com/api/health
curl https://clawdet.com/api/stats
```

---

**Last updated: February 2026**
**Version: 1.0**

**Remember:** Always test changes in a staging environment before deploying to production!
