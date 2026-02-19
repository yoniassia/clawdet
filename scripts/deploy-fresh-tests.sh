#!/bin/bash
set -e

# Fresh Test Instance Deployment Script
# Deploys test1.clawdet.com and test2.clawdet.com from scratch

WORKSPACE="/root/.openclaw/workspace/clawdet"
HETZNER_TOKEN="wzTdIQjZI0yxfhDXmyy3zrcwTQOe260oRqahZEyIMwLyLBn2bldXncEyR6I5kRZI"
CLOUDFLARE_TOKEN="GuC80nuUu3TQRid1087yAByFHb_9Rpk3r27RwQLN"
CLOUDFLARE_ZONE="667a3504fd6992c99780d81edaf0b131"
SSH_KEY_ID="107615133"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     FRESH CLAWDET TEST INSTANCE DEPLOYMENT                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Function to create VPS
create_vps() {
    local NAME=$1
    local HOSTNAME="${NAME}.clawdet.com"
    
    echo "📦 Creating VPS: $NAME"
    
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $HETZNER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "'$NAME'",
            "server_type": "cax11",
            "location": "hel1",
            "image": "ubuntu-24.04",
            "ssh_keys": ['$SSH_KEY_ID'],
            "labels": {"project": "clawdet", "type": "test"}
        }' \
        https://api.hetzner.cloud/v1/servers)
    
    SERVER_ID=$(echo "$RESPONSE" | jq -r '.server.id')
    IP=$(echo "$RESPONSE" | jq -r '.server.public_net.ipv4.ip')
    
    if [ "$SERVER_ID" == "null" ] || [ -z "$SERVER_ID" ]; then
        echo "❌ Failed to create VPS: $NAME"
        echo "$RESPONSE" | jq .
        return 1
    fi
    
    echo "  ✅ VPS Created"
    echo "     ID: $SERVER_ID"
    echo "     IP: $IP"
    
    # Wait for server to be ready
    echo "  ⏳ Waiting for server to boot..."
    sleep 30
    
    # Wait for SSH
    echo "  ⏳ Waiting for SSH..."
    for i in {1..30}; do
        if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$IP "echo ready" &>/dev/null; then
            echo "  ✅ SSH Ready"
            break
        fi
        sleep 2
    done
    
    # Create DNS record
    echo "  🌐 Creating DNS: $HOSTNAME → $IP"
    
    # Check if DNS record exists
    EXISTING=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE/dns_records?name=$HOSTNAME" \
        -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
        -H "Content-Type: application/json" | jq -r '.result[0].id // empty')
    
    if [ -n "$EXISTING" ]; then
        # Update existing record
        curl -s -X PUT \
            "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE/dns_records/$EXISTING" \
            -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "type": "A",
                "name": "'$HOSTNAME'",
                "content": "'$IP'",
                "ttl": 120,
                "proxied": true
            }' > /dev/null
    else
        # Create new record
        curl -s -X POST \
            "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE/dns_records" \
            -H "Authorization: Bearer $CLOUDFLARE_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "type": "A",
                "name": "'$HOSTNAME'",
                "content": "'$IP'",
                "ttl": 120,
                "proxied": true
            }' > /dev/null
    fi
    
    echo "  ✅ DNS Configured"
    
    # Run provisioning
    echo "  🚀 Running OpenClaw provisioning..."
    
    # Set environment variables for provision script
    export XAI_API_KEY="<from .env.local>"
    export USERNAME="test-user"
    export SUBDOMAIN="$NAME"
    
    ssh -o StrictHostKeyChecking=no root@$IP "XAI_API_KEY='$XAI_API_KEY' USERNAME='$USERNAME' SUBDOMAIN='$NAME' bash -s" < "$WORKSPACE/scripts/provision-openclaw.sh"
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Provisioning Complete"
    else
        echo "  ❌ Provisioning Failed"
        return 1
    fi
    
    # Wait for Cloudflare SSL propagation
    echo "  ⏳ Waiting for SSL (30s)..."
    sleep 30
    
    # Verify HTTPS
    echo "  🧪 Testing HTTPS..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$HOSTNAME/")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo "  ✅ HTTPS Working (200 OK)"
    else
        echo "  ⚠️ HTTPS returned: $HTTP_CODE"
    fi
    
    # Verify WebSocket
    echo "  🧪 Testing Gateway..."
    GATEWAY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$HOSTNAME/gateway/")
    
    if [ "$GATEWAY_CODE" == "200" ]; then
        echo "  ✅ Gateway Working (200 OK)"
    else
        echo "  ⚠️ Gateway returned: $GATEWAY_CODE"
    fi
    
    # Check for token in HTML
    echo "  🔍 Verifying token embedded..."
    if curl -s "https://$HOSTNAME/" | grep -q 'auth: { token:'; then
        echo "  ✅ Gateway token embedded in HTML"
    else
        echo "  ⚠️ Gateway token NOT found in HTML"
    fi
    
    echo ""
    echo "✅ $NAME DEPLOYED SUCCESSFULLY"
    echo "   URL: https://$HOSTNAME"
    echo "   IP: $IP"
    echo "   ID: $SERVER_ID"
    echo ""
    
    # Save details
    echo "$NAME|$SERVER_ID|$IP|$HOSTNAME" >> /tmp/deployed-instances.txt
}

# Clear previous deployment log
rm -f /tmp/deployed-instances.txt

echo "Starting deployment at $(date)"
echo ""

# Deploy test1
create_vps "test1"

echo "⏸️  Waiting 10 seconds before deploying test2..."
sleep 10

# Deploy test2
create_vps "test2"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  DEPLOYMENT COMPLETE                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Both test instances deployed!"
echo ""
echo "📋 Instance Details:"
cat /tmp/deployed-instances.txt | while IFS='|' read name id ip hostname; do
    echo "  • $name: https://$hostname ($ip)"
done
echo ""
echo "🧪 Test URLs:"
echo "  • https://test1.clawdet.com"
echo "  • https://test2.clawdet.com"
echo ""
echo "🔧 Next Steps:"
echo "  1. Open both URLs in browser (hard refresh)"
echo "  2. Check for 'Connected' (green) status"
echo "  3. Try sending a message"
echo ""
