#!/bin/bash
# Clawdet Deployment Script
# Usage: ./deploy.sh <instance-domain> [--skip-tests]

set -e

INSTANCE=$1
SKIP_TESTS=$2

if [ -z "$INSTANCE" ]; then
  echo "Usage: ./deploy.sh <instance-domain> [--skip-tests]"
  echo "Example: ./deploy.sh test1.clawdet.com"
  exit 1
fi

echo "🚀 Deploying to $INSTANCE..."

# Step 1: Backup current state
echo "📦 Creating backup..."
ssh root@$INSTANCE 'tar czf /root/backup-$(date +%Y%m%d-%H%M%S).tar.gz /var/www/html /root/.openclaw/openclaw.json'

# Step 2: Pull latest code (or upload if no git)
echo "📥 Updating code..."
cd $(dirname $0)/..
LATEST_HASH=$(git rev-parse HEAD)

# Upload HTML
scp public/instance-landing-v3/index.html root@$INSTANCE:/var/www/html/index.html

# Get gateway token
GATEWAY_TOKEN=$(ssh root@$INSTANCE 'grep "\"token\"" /root/.openclaw/openclaw.json | cut -d "\"" -f4')

# Inject token
ssh root@$INSTANCE "sed -i 's/{{ GATEWAY_TOKEN }}/$GATEWAY_TOKEN/g; s/PLACEHOLDER_GATEWAY_TOKEN/$GATEWAY_TOKEN/g' /var/www/html/index.html"

echo "   ✅ Code updated to commit $LATEST_HASH"

# Step 3: Run smoke tests (unless skipped)
if [ "$SKIP_TESTS" != "--skip-tests" ]; then
  echo "🧪 Running smoke tests..."
  
  node tests/smoke/smoke-test.js https://$INSTANCE
  
  if [ $? -ne 0 ]; then
    echo "❌ Smoke tests failed! Rolling back..."
    ssh root@$INSTANCE 'LATEST=$(ls -t /root/backup-*.tar.gz | head -1) && tar xzf $LATEST -C /'
    echo "   ✅ Rollback complete"
    exit 1
  fi
  
  echo "   ✅ Smoke tests passed"
else
  echo "⚠️  Skipping tests (--skip-tests flag)"
fi

# Step 4: Verify health
echo "🏥 Checking instance health..."
ssh root@$INSTANCE 'systemctl is-active openclaw-gateway' > /dev/null && echo "   ✅ Gateway running" || echo "   ❌ Gateway down"
ssh root@$INSTANCE 'systemctl is-active caddy' > /dev/null && echo "   ✅ Caddy running" || echo "   ❌ Caddy down"

# Step 5: Check gateway logs for errors
ERROR_COUNT=$(ssh root@$INSTANCE 'journalctl -u openclaw-gateway --since "5 minutes ago" | grep -ci error || echo 0')
if [ $ERROR_COUNT -gt 0 ]; then
  echo "   ⚠️  $ERROR_COUNT errors in last 5 minutes"
else
  echo "   ✅ No errors in logs"
fi

echo ""
echo "✅ Deployment complete!"
echo "   Instance: https://$INSTANCE"
echo "   Commit:   $LATEST_HASH"
echo ""
