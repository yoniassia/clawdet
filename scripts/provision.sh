#!/bin/bash
#
# Clawdet Customer Provisioning Script
# Deploys OpenClaw using pre-built Docker images
#
# Usage:
#   curl -fsSL https://clawdet.com/provision.sh | bash -s -- \
#     --customer-id user123 \
#     --api-key sk-ant-... \
#     --subdomain user123.clawdet.com \
#     --gateway-token <token> \
#     --plan pro

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
CUSTOMER_ID=""
API_KEY=""
SUBDOMAIN=""
GATEWAY_TOKEN=""
PLAN="pro"
INSTALL_DIR="/opt/clawdet"
IMAGE="coollabsio/openclaw:latest"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --customer-id) CUSTOMER_ID="$2"; shift 2 ;;
    --api-key) API_KEY="$2"; shift 2 ;;
    --subdomain) SUBDOMAIN="$2"; shift 2 ;;
    --gateway-token) GATEWAY_TOKEN="$2"; shift 2 ;;
    --plan) PLAN="$2"; shift 2 ;;
    --install-dir) INSTALL_DIR="$2"; shift 2 ;;
    *) echo -e "${RED}Unknown argument: $1${NC}"; exit 1 ;;
  esac
done

# Validate required args
if [ -z "$CUSTOMER_ID" ] || [ -z "$API_KEY" ] || [ -z "$SUBDOMAIN" ] || [ -z "$GATEWAY_TOKEN" ]; then
  echo -e "${RED}Missing required arguments${NC}"
  echo "Usage: $0 --customer-id <id> --api-key <key> --subdomain <domain> --gateway-token <token> [--plan pro]"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Clawdet Provisioning${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Customer ID:${NC} $CUSTOMER_ID"
echo -e "${GREEN}Subdomain:${NC} $SUBDOMAIN"
echo -e "${GREEN}Plan:${NC} $PLAN"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Installing Docker...${NC}"
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo -e "${GREEN}✓ Docker installed${NC}"
else
  echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Create install directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Generate password (if not provided via gateway token)
PASSWORD="${GATEWAY_TOKEN:0:16}"

# Download template based on plan
echo -e "${YELLOW}Downloading docker-compose template...${NC}"
TEMPLATE_URL="https://clawdet.com/templates/docker-compose.${PLAN}.yml"
if curl -fsSL "$TEMPLATE_URL" -o docker-compose.yml 2>/dev/null; then
  echo -e "${GREEN}✓ Template downloaded${NC}"
else
  echo -e "${YELLOW}⚠ Template not found, using default${NC}"
  # Fallback: create inline template
  cat > docker-compose.yml <<'EOF'
services:
  openclaw:
    image: coollabsio/openclaw:latest
    ports:
      - "80:8080"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
      - AUTH_PASSWORD=${AUTH_PASSWORD}
      - OPENCLAW_PRIMARY_MODEL=${OPENCLAW_PRIMARY_MODEL:-anthropic/claude-sonnet-4-5}
    volumes:
      - openclaw-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s

volumes:
  openclaw-data:
EOF
fi

# Create .env file
cat > .env <<EOF
# Clawdet Customer Environment
# Customer ID: $CUSTOMER_ID
# Plan: $PLAN
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# AI API Keys
XAI_API_KEY=xai-REDACTED
ANTHROPIC_API_KEY=$API_KEY
OPENCLAW_GATEWAY_TOKEN=$GATEWAY_TOKEN
AUTH_PASSWORD=$PASSWORD
AUTH_USERNAME=admin

# Model: Grok 4.2 with reasoning (5p1m)
OPENCLAW_PRIMARY_MODEL=x-ai/grok-420-0220-5p1m-reasoning

# Storage
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_DIR=/data/workspace

# Network
PORT=8080
EOF

# Pull image
echo -e "${YELLOW}Pulling Docker image...${NC}"
docker pull "$IMAGE"
echo -e "${GREEN}✓ Image pulled${NC}"

# Start container
echo -e "${YELLOW}Starting OpenClaw...${NC}"
docker compose up -d

# Wait for health check
echo -e "${YELLOW}Waiting for health check...${NC}"
for i in {1..60}; do
  if curl -sf http://localhost/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OpenClaw is healthy!${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Deployment Successful!${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Access URL:${NC} https://$SUBDOMAIN"
    echo -e "${GREEN}Username:${NC} admin"
    echo -e "${GREEN}Password:${NC} $PASSWORD"
    echo ""
    exit 0
  fi
  sleep 2
done

echo -e "${RED}✗ Health check timeout${NC}"
echo "Checking logs..."
docker compose logs --tail=50
exit 1
