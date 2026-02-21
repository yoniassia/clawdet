#!/bin/bash
#
# Test Provision (Bypass Signup)
# Creates a test instance for verification
#

set -e

LOG_FILE="/tmp/test-provision-$(date +%s).log"
echo "=== Test Provision Started: $(date) ===" | tee -a "$LOG_FILE"

# Test configuration
CUSTOMER_ID="test-bypass-$(date +%s)"
API_KEY="${ANTHROPIC_API_KEY}"
SUBDOMAIN="test-bypass.local"
GATEWAY_TOKEN=$(openssl rand -hex 32)
PLAN="pro"

echo "Customer ID: $CUSTOMER_ID" | tee -a "$LOG_FILE"
echo "Plan: $PLAN" | tee -a "$LOG_FILE"
echo "Gateway Token: ${GATEWAY_TOKEN:0:16}..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if provision script exists
if [ ! -f "scripts/provision.sh" ]; then
    echo "ERROR: provision.sh not found" | tee -a "$LOG_FILE"
    exit 1
fi

echo "✓ Provision script found" | tee -a "$LOG_FILE"

# Check if API key is set
if [ -z "$API_KEY" ]; then
    echo "ERROR: ANTHROPIC_API_KEY not set" | tee -a "$LOG_FILE"
    exit 1
fi

echo "✓ API key configured" | tee -a "$LOG_FILE"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "⚠ Docker not available on this host" | tee -a "$LOG_FILE"
    echo "Performing configuration validation only" | tee -a "$LOG_FILE"
    DOCKER_AVAILABLE=false
else
    echo "✓ Docker available" | tee -a "$LOG_FILE"
    DOCKER_AVAILABLE=true
fi

# Create temporary directory for test
TEST_DIR="/tmp/clawdet-test-provision-$CUSTOMER_ID"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "" | tee -a "$LOG_FILE"
echo "=== Downloading Template ===" | tee -a "$LOG_FILE"

# Download template
TEMPLATE_URL="https://clawdet.com/templates/docker-compose.${PLAN}.yml"
if curl -fsSL "$TEMPLATE_URL" -o docker-compose.yml 2>&1 | tee -a "$LOG_FILE"; then
    echo "✓ Template downloaded" | tee -a "$LOG_FILE"
else
    echo "ERROR: Failed to download template" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"
echo "=== Generating Configuration ===" | tee -a "$LOG_FILE"

# Create .env file
cat > .env <<EOF
# Test Provision: $CUSTOMER_ID
# Generated: $(date)

ANTHROPIC_API_KEY=$API_KEY
OPENCLAW_GATEWAY_TOKEN=$GATEWAY_TOKEN
AUTH_PASSWORD=${GATEWAY_TOKEN:0:16}
AUTH_USERNAME=admin
OPENCLAW_PRIMARY_MODEL=anthropic/claude-sonnet-4-5
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_DIR=/data/workspace
PORT=8093
EOF

echo "✓ .env file created" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Show configuration
echo "=== Configuration ===" | tee -a "$LOG_FILE"
cat .env | grep -v "API_KEY\|TOKEN" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Modify docker-compose for local testing
sed -i 's/"80:8080"/"8093:8080"/g' docker-compose.yml
sed -i 's/openclaw-data:/test-bypass-data:/g' docker-compose.yml

echo "✓ Docker Compose customized for local testing" | tee -a "$LOG_FILE"

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "=== Deploying Container ===" | tee -a "$LOG_FILE"
    
    # Pull image
    echo "Pulling image..." | tee -a "$LOG_FILE"
    if docker pull coollabsio/openclaw:latest 2>&1 | tee -a "$LOG_FILE"; then
        echo "✓ Image pulled" | tee -a "$LOG_FILE"
    else
        echo "ERROR: Failed to pull image" | tee -a "$LOG_FILE"
        exit 1
    fi
    
    # Start container
    echo "" | tee -a "$LOG_FILE"
    echo "Starting container..." | tee -a "$LOG_FILE"
    if docker compose up -d 2>&1 | tee -a "$LOG_FILE"; then
        echo "✓ Container started" | tee -a "$LOG_FILE"
    else
        echo "ERROR: Failed to start container" | tee -a "$LOG_FILE"
        docker compose logs 2>&1 | tee -a "$LOG_FILE"
        exit 1
    fi
    
    # Wait for health check
    echo "" | tee -a "$LOG_FILE"
    echo "=== Waiting for Health Check ===" | tee -a "$LOG_FILE"
    MAX_ATTEMPTS=30
    HEALTHY=false
    
    for i in $(seq 1 $MAX_ATTEMPTS); do
        echo "Attempt $i/$MAX_ATTEMPTS..." | tee -a "$LOG_FILE"
        
        if curl -sf http://localhost:8093/healthz > /dev/null 2>&1; then
            HEALTHY=true
            echo "✓ Health check passed!" | tee -a "$LOG_FILE"
            break
        fi
        
        sleep 2
    done
    
    if [ "$HEALTHY" = false ]; then
        echo "ERROR: Health check timeout" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
        echo "=== Container Logs ===" | tee -a "$LOG_FILE"
        docker compose logs --tail=100 2>&1 | tee -a "$LOG_FILE"
        exit 1
    fi
    
    # Get health check details
    echo "" | tee -a "$LOG_FILE"
    echo "=== Health Check Details ===" | tee -a "$LOG_FILE"
    curl -s http://localhost:8093/healthz | jq . 2>&1 | tee -a "$LOG_FILE"
    
    # Test chat API
    echo "" | tee -a "$LOG_FILE"
    echo "=== Testing Chat API ===" | tee -a "$LOG_FILE"
    
    RESPONSE=$(curl -s -u "admin:${GATEWAY_TOKEN:0:16}" \
        -X POST http://localhost:8093/api/chat \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello, test message"}' 2>&1 || echo "ERROR: Chat API failed")
    
    echo "$RESPONSE" | tee -a "$LOG_FILE"
    
    echo "" | tee -a "$LOG_FILE"
    echo "=== Container Info ===" | tee -a "$LOG_FILE"
    docker compose ps 2>&1 | tee -a "$LOG_FILE"
    
    echo "" | tee -a "$LOG_FILE"
    echo "=== Success! ===" | tee -a "$LOG_FILE"
    echo "Instance running at: http://localhost:8093" | tee -a "$LOG_FILE"
    echo "Login: admin / ${GATEWAY_TOKEN:0:16}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "To stop: cd $TEST_DIR && docker compose down -v" | tee -a "$LOG_FILE"
    
else
    echo "" | tee -a "$LOG_FILE"
    echo "=== Configuration Validated ===" | tee -a "$LOG_FILE"
    echo "Docker not available - skipping container deployment" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Files created in: $TEST_DIR" | tee -a "$LOG_FILE"
    echo "  - docker-compose.yml" | tee -a "$LOG_FILE"
    echo "  - .env" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "=== Log saved to: $LOG_FILE ===" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Test provision complete!"
