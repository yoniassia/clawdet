# Clawdet Admin Guide

This guide covers platform administration, monitoring, and maintenance for the Clawdet SaaS platform.

## 🏗️ Architecture Overview

### Components

1. **Next.js Frontend** (Port 3000)
   - Landing page, trial chat, signup flows
   - Payment integration
   - User dashboard

2. **API Routes** (Next.js /api)
   - Trial chat endpoint
   - Authentication (X OAuth)
   - Payment webhooks (Stripe)
   - Provisioning orchestration

3. **Database** (JSON-based, `/data` directory)
   - User records
   - Provisioning status
   - Session management

4. **External Services**
   - **Hetzner Cloud**: VPS provisioning
   - **Cloudflare**: DNS management + SSL
   - **Stripe**: Payment processing
   - **X/Twitter**: OAuth authentication
   - **OpenAI/xAI**: Grok API for trial chat

### File Structure

```
clawdet/
├── app/               # Next.js pages (App Router)
├── components/        # React components
├── lib/              # Business logic
│   ├── auth-middleware.ts    # Authentication
│   ├── cache.ts             # Caching layer
│   ├── cloudflare.ts        # DNS automation
│   ├── db.ts                # Database operations
│   ├── grok.ts              # AI integration
│   ├── hetzner.ts           # VPS provisioning
│   ├── performance.ts       # Monitoring
│   ├── provisioner.ts       # Orchestration
│   └── ssh-installer.ts     # OpenClaw setup
├── data/             # User database (JSON)
├── public/           # Static assets
└── docs/             # Documentation
```

---

## 🔐 Environment Configuration

### Required Environment Variables

Create `.env.local` with:

```bash
# Grok AI API
GROK_API_KEY=your_grok_api_key

# Hetzner Cloud
HETZNER_API_TOKEN=your_hetzner_token

# Cloudflare DNS
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...

# X OAuth (optional, can use mock mode)
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_REDIRECT_URI=https://clawdet.com/api/auth/x/callback

# App Settings
NEXT_PUBLIC_BASE_URL=https://clawdet.com
NODE_ENV=production
```

### Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Rotate API keys** every 90 days
3. **Use test mode** for Stripe in staging
4. **Enable 2FA** on all service accounts (Hetzner, Cloudflare, Stripe)
5. **Monitor webhook secret** usage - regenerate if suspicious activity

---

## 🚀 Deployment

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd clawdet
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with real credentials
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Start Server**
   ```bash
   npm start
   # Or use PM2 for process management:
   pm2 start npm --name "clawdet" -- start
   ```

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "clawdet" -- start

# Save PM2 process list
pm2 save

# Set up auto-start on system reboot
pm2 startup

# Monitor logs
pm2 logs clawdet

# Restart after changes
pm2 restart clawdet
```

### Nginx Reverse Proxy

Recommended setup for production:

```nginx
server {
    listen 80;
    server_name clawdet.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clawdet.com;

    ssl_certificate /etc/letsencrypt/live/clawdet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clawdet.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 Monitoring

### Performance Metrics

Access real-time stats:
```bash
curl https://clawdet.com/api/stats
```

Returns:
```json
{
  "cache": {
    "size": 42,
    "hitRate": 0.73,
    "avgResponseTime": 12.4
  },
  "operations": {
    "total": 1240,
    "avgDuration": 145
  }
}
```

### Key Metrics to Watch

1. **Cache Hit Rate**: Should be >60%
   - Low rate = check cache TTLs
   - Invalidate stale entries if needed

2. **API Response Times**:
   - Trial chat: <500ms (cached), <2s (uncached)
   - Provisioning status: <100ms
   - Auth endpoints: <200ms

3. **Provisioning Success Rate**: Should be >95%
   - Check Hetzner API status
   - Review SSH connection errors
   - Verify DNS propagation times

### Logs

View application logs:
```bash
# PM2 logs
pm2 logs clawdet

# System logs
journalctl -u clawdet -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks

Monitor these endpoints:
- `GET /api/health` - Basic health check
- `GET /api/stats` - Performance metrics
- `GET /` - Landing page (200 OK)

Set up alerts for:
- 5xx errors (server issues)
- Response times >3s
- Provisioning failures
- Stripe webhook failures

---

## 🗄️ Database Management

### Structure

Users stored in `/data/users.json`:
```json
{
  "username123": {
    "id": "user_abc123",
    "username": "username123",
    "email": "user@example.com",
    "paid": true,
    "provisioningStatus": "complete",
    "hetznerVpsId": "12345678",
    "hetznerVpsIp": "1.2.3.4",
    "subdomain": "username123.clawdet.com",
    "sessionToken": "...",
    "sessionCreatedAt": 1708200000000,
    "createdAt": "2026-02-17T12:00:00Z",
    "stripeCustomerId": "cus_...",
    "stripeSubscriptionId": "sub_..."
  }
}
```

### Backup Strategy

1. **Daily Automated Backups**
   ```bash
   # Add to crontab
   0 2 * * * /root/backup-clawdet.sh
   ```

   Backup script:
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d)
   tar -czf /backups/clawdet-$DATE.tar.gz /root/.openclaw/workspace/clawdet/data
   # Upload to S3 or similar
   aws s3 cp /backups/clawdet-$DATE.tar.gz s3://clawdet-backups/
   # Keep only last 30 days
   find /backups -name "clawdet-*.tar.gz" -mtime +30 -delete
   ```

2. **Manual Backup Before Maintenance**
   ```bash
   cp -r data data.backup.$(date +%Y%m%d-%H%M)
   ```

### Database Migrations

When schema changes:
```bash
node scripts/migrate-db.js
```

Example migration script:
```javascript
// scripts/migrate-db.js
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));

Object.keys(users).forEach(username => {
  // Add new field with default value
  if (!users[username].newField) {
    users[username].newField = 'default';
  }
});

fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
console.log('Migration complete');
```

---

## 💳 Payment Management

### Stripe Dashboard

Access at: [dashboard.stripe.com](https://dashboard.stripe.com)

**Key Actions:**
- View all subscriptions
- Issue refunds
- Update payment methods
- Download invoices
- Manage webhooks

### Webhook Configuration

1. Navigate to **Developers → Webhooks**
2. Add endpoint: `https://clawdet.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy signing secret to `.env.local`

### Testing Webhooks Locally

Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### Handling Payment Issues

**Failed Payments:**
1. Check Stripe dashboard for failure reason
2. Email customer with payment link
3. Suspend instance after 7 days grace period

**Refunds:**
```bash
# Via Stripe CLI
stripe refunds create --charge ch_xxxxx --amount 2000

# Or via dashboard: Payments → Select charge → Refund
```

**Chargebacks:**
1. Respond via Stripe dashboard within 7 days
2. Provide provisioning logs, usage data
3. If lost, suspend instance immediately

---

## 🖥️ VPS Management

### Hetzner Cloud Dashboard

Access at: [console.hetzner.cloud](https://console.hetzner.cloud)

**Monitor:**
- Active servers
- Monthly costs
- Network traffic
- Snapshots

### Manual VPS Provisioning

If automated provisioning fails:

1. **Create VPS**
   ```bash
   curl -X POST https://api.hetzner.cloud/v1/servers \
     -H "Authorization: Bearer $HETZNER_API_TOKEN" \
     -d '{
       "name": "clawdet-username",
       "server_type": "cx11",
       "image": "ubuntu-22.04",
       "location": "nbg1",
       "user_data": "#!/bin/bash\napt-get update\n..."
     }'
   ```

2. **SSH and Install OpenClaw**
   ```bash
   ssh root@<vps-ip>
   curl -fsSL https://openclaw.com/install.sh | bash
   ```

3. **Configure Gateway**
   ```bash
   cd /root/.openclaw
   openclaw gateway config --set grok.apiKey=$GROK_API_KEY
   openclaw gateway start
   ```

4. **Update DNS**
   ```bash
   curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
     -H "Authorization: Bearer $CF_TOKEN" \
     -d '{"type":"A","name":"username","content":"<vps-ip>","proxied":true}'
   ```

### Cleaning Up Abandoned Instances

Find unpaid users:
```bash
node scripts/cleanup-unpaid.js
```

Script:
```javascript
const { getAllUsers } = require('./lib/db');
const { deleteServer } = require('./lib/hetzner');

const users = getAllUsers();
const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

for (const user of users) {
  if (!user.paid && new Date(user.createdAt).getTime() < cutoff) {
    console.log(`Deleting VPS for inactive user: ${user.username}`);
    if (user.hetznerVpsId) {
      await deleteServer(user.hetznerVpsId);
    }
    // Mark user as deleted in DB
  }
}
```

---

## 🔧 Troubleshooting

### Provisioning Failures

**VPS Creation Fails:**
1. Check Hetzner API token is valid
2. Verify account has sufficient credits
3. Try different datacenter location
4. Check server type availability

**SSH Connection Fails:**
1. Wait 60s for SSH daemon to start
2. Verify SSH key is correctly configured
3. Check cloud-init logs: `cloud-init status --long`
4. Try manual SSH connection

**DNS Not Resolving:**
1. Check Cloudflare API token permissions
2. Verify Zone ID is correct
3. Wait up to 30 minutes for propagation
4. Test with `dig username.clawdet.com @1.1.1.1`

### High Memory Usage

```bash
# Check memory usage
free -h

# Restart Next.js to clear memory
pm2 restart clawdet

# Check for memory leaks
node --inspect app.js
```

### Database Corruption

```bash
# Restore from backup
cp data.backup.20260217/users.json data/users.json

# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('data/users.json'))"
```

---

## 📈 Scaling

### Current Limits

- **Single server**: Handles ~500 concurrent users
- **Database**: JSON files, suitable for <10,000 users
- **VPS limit**: Based on Hetzner account quota

### When to Scale

Migrate to:
- **PostgreSQL** when >5,000 users
- **Redis** for session storage and caching
- **Load balancer** when >1,000 concurrent requests
- **Kubernetes** for multi-region deployment

### Cost Optimization

1. **Use spot instances** for dev/staging (not production)
2. **Enable auto-snapshots** ($0.01/GB/month on Hetzner)
3. **Set up billing alerts** in Stripe and Hetzner
4. **Monitor unused VPS** and delete after 30 days of inactivity

---

## 🛡️ Security Checklist

- [ ] All API keys in `.env.local`, not in code
- [ ] HTTPS enforced (no HTTP access)
- [ ] Stripe webhook signatures verified
- [ ] Authentication tokens use secure random generation
- [ ] Session cookies are HttpOnly and Secure
- [ ] Content-Security-Policy headers set
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using parameterized queries)
- [ ] Regular dependency updates (`npm audit`)
- [ ] SSH keys rotated every 6 months
- [ ] Firewall configured (only ports 80, 443, 22 open)

---

## 📚 Additional Resources

- **OpenClaw Docs**: [openclaw.com/docs](https://openclaw.com/docs)
- **Hetzner API**: [docs.hetzner.cloud](https://docs.hetzner.cloud)
- **Cloudflare API**: [api.cloudflare.com](https://api.cloudflare.com)
- **Stripe API**: [stripe.com/docs/api](https://stripe.com/docs/api)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

*Last Updated: February 2026*
