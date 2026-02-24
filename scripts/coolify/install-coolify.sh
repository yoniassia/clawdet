#!/bin/bash
# Install Coolify on Hetzner server
# Run as root on the target server (135.181.43.68 or 188.34.197.212)
#
# Prerequisites: Ubuntu 22.04+, root access, ports 8000, 80, 443 available
# Docker will be installed by Coolify if not present
#
# Usage: ssh root@135.181.43.68 'bash -s' < install-coolify.sh

set -euo pipefail

echo "=== Pre-flight checks ==="
echo "Disk: $(df -h / | tail -1 | awk '{print $4}') available"
echo "RAM: $(free -h | awk '/Mem:/{print $7}') available"

# Check if Docker is running, start if not
if ! docker info &>/dev/null; then
    echo "Docker not running, Coolify installer will handle it..."
fi

# Check if Coolify is already installed
if [ -d /data/coolify ]; then
    echo "WARNING: Coolify data directory already exists at /data/coolify"
    echo "This may be an upgrade. Proceeding..."
fi

echo ""
echo "=== Installing Coolify ==="
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

echo ""
echo "=== Coolify installed ==="
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Access dashboard at: http://${SERVER_IP}:8000"
echo ""
echo "Post-install steps:"
echo "1. Open http://${SERVER_IP}:8000 in browser"
echo "2. Create admin account"
echo "3. Go to Settings > API > Generate token (read+write+deploy)"
echo "4. Save token as COOLIFY_API_TOKEN"
echo "5. Configure wildcard domain: *.clawdet.com → ${SERVER_IP}"
echo "6. Set up DNS: A record *.clawdet.com → ${SERVER_IP}"
