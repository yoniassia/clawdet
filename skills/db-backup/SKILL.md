# Database Backup Skill

**Purpose:** Hourly encrypted backups of all SQLite databases with 7-day retention.

## What It Does

- **Auto-discovers** all `.db` files in `~/.openclaw/data/`
- **Bundles** into encrypted tar archive
- **Stores** in `~/.openclaw/backups/`
- **Keeps** last 7 backups (168 hours)
- **Alerts** if backup fails

## Backup Format

```
backup-2026-02-19-04-00.tar.gz.enc
├── cost-tracker.db
├── health-monitor.db
└── user-data.db
```

Encrypted with openssl AES-256-CBC

## Usage

**Run backup:**
```bash
node skills/db-backup/backup.js
```

**List backups:**
```bash
node skills/db-backup/list.js
```

**Restore from backup:**
```bash
node skills/db-backup/restore.js --date 2026-02-19-04-00
```

**Test restore (dry run):**
```bash
node skills/db-backup/restore.js --date 2026-02-19-04-00 --test
```

## Encryption

Backup password stored in: `~/.openclaw/backup-key`

Generate on first run:
```bash
openssl rand -base64 32 > ~/.openclaw/backup-key
chmod 600 ~/.openclaw/backup-key
```

**⚠️ CRITICAL:** Store `backup-key` somewhere safe (password manager, encrypted USB). If you lose it, backups are unrecoverable.

## Cron Schedule

```yaml
# Hourly backups
schedule: "0 * * * *"
command: "node skills/db-backup/backup.js"
```

## Storage

- **Local:** `~/.openclaw/backups/` (last 7 days)
- **Optional:** Upload to cloud (Google Drive, S3, etc.)

## Retention Policy

- Keep all hourly backups for 7 days
- After 7 days, auto-delete oldest
- Monthly: Keep 1st of month backup indefinitely

## Recovery Scenarios

**1. Accidental deletion:**
```bash
node skills/db-backup/restore.js --date 2026-02-19-03-00
```

**2. Corruption:**
```bash
node skills/db-backup/restore.js --date 2026-02-18-20-00
```

**3. Full system restore:**
```bash
# Copy backup-key to new system
# Run restore for each database
node skills/db-backup/restore.js --latest
```

## Monitoring

- Log every backup attempt
- Alert if backup fails 2x in a row
- Check backup file sizes (alert if 10x growth)
- Monthly backup integrity test

## Database Discovery

Scans these locations:
- `~/.openclaw/data/*.db`
- `~/.openclaw/workspace/**/*.db` (excluding node_modules)

Auto-adds new databases, no config needed.
