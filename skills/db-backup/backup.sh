#!/bin/bash
set -e

HOME="${HOME:-/root}"
DATA_DIR="$HOME/.openclaw/data"
BACKUP_DIR="$HOME/.openclaw/backups"
KEY_FILE="$HOME/.openclaw/backup-key"

# Create directories
mkdir -p "$BACKUP_DIR"

# Generate encryption key if doesn't exist
if [ ! -f "$KEY_FILE" ]; then
  echo "🔑 Generating backup encryption key..."
  openssl rand -base64 32 > "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  echo "✅ Key saved to $KEY_FILE (KEEP THIS SAFE!)"
fi

# Timestamp
TIMESTAMP=$(date +%Y-%m-%d-%H-%M)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.tar.gz.enc"

echo "🗄️  Starting database backup..."

# Find all .db files
DBS=$(find "$DATA_DIR" -name "*.db" 2>/dev/null || echo "")

if [ -z "$DBS" ]; then
  echo "⚠️  No databases found in $DATA_DIR"
  exit 0
fi

# Create temporary tar
TEMP_TAR="/tmp/backup-$TIMESTAMP.tar.gz"
tar czf "$TEMP_TAR" -C "$DATA_DIR" $(cd "$DATA_DIR" && find . -name "*.db")

# Encrypt
openssl enc -aes-256-cbc -salt -in "$TEMP_TAR" -out "$BACKUP_FILE" -pass file:"$KEY_FILE"
rm "$TEMP_TAR"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup created: $BACKUP_FILE ($SIZE)"

# Cleanup old backups (keep last 7 days = 168 hours)
find "$BACKUP_DIR" -name "backup-*.tar.gz.enc" -mtime +7 -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/backup-*.tar.gz.enc | wc -l)
echo "📦 Retention: $REMAINING backups kept (7-day window)"

echo "✅ Backup complete"
