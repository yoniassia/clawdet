#!/bin/bash
# Fix for duplicate OpenClaw Gateway processes
# Ensures only one gateway process runs

set -e

log() {
    echo -e "\033[0;32m[$(date +'%Y-%m-%d %H:%M:%S')]\033[0m $1"
}

error() {
    echo -e "\033[0;31m[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:\033[0m $1"
    exit 1
}

log "Checking for duplicate OpenClaw Gateway processes..."

# Find all openclaw-gateway processes
PROCESSES=$(ps aux | grep "openclaw.*gateway\|openclaw-gateway" | grep -v grep | awk '{print $2}')

if [ -z "$PROCESSES" ]; then
    log "No OpenClaw Gateway processes found"
else
    log "Found processes: $PROCESSES"
    log "Killing all gateway processes..."
    echo "$PROCESSES" | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Check if systemd user service exists and stop it
if systemctl --user list-units --full --all | grep -q openclaw-gateway; then
    log "Stopping user-level systemd service..."
    systemctl --user stop openclaw-gateway 2>/dev/null || true
    systemctl --user disable openclaw-gateway 2>/dev/null || true
fi

# Check if systemd system service exists
if systemctl list-units --full --all | grep -q openclaw-gateway; then
    log "Found system-level service, restarting cleanly..."
    systemctl restart openclaw-gateway
    sleep 3
else
    error "No systemd service found. Please install OpenClaw Gateway service first."
fi

# Verify only one process is running
RUNNING=$(ps aux | grep "openclaw.*gateway\|openclaw-gateway" | grep -v grep | wc -l)

if [ "$RUNNING" -eq 1 ]; then
    log "✅ Fixed! Only one OpenClaw Gateway process running"
    systemctl status openclaw-gateway | head -10
elif [ "$RUNNING" -eq 0 ]; then
    error "No gateway process running after restart"
else
    error "Still have $RUNNING processes running - manual intervention needed"
fi
