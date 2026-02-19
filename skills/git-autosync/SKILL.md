# Git Auto-Sync Skill

**Purpose:** Hourly git commits + push with pre-commit safety checks.

## What It Does

- **Commits** all workspace changes hourly
- **Pushes** to remote repository
- **Detects** merge conflicts (alerts instead of forcing)
- **Tags** each sync with timestamp
- **Prevents** committing sensitive data

## Pre-Commit Checks

Before each commit, scan for:
- ❌ API keys (`sk-`, `xai-`, etc.)
- ❌ `.env` files
- ❌ Browser cookies/session tokens
- ❌ Private keys (`.pem`, `.key`)
- ❌ Passwords in plaintext
- ❌ Large binary files (>10MB)

If found: **Block commit + alert user**

## Usage

**Run sync:**
```bash
node skills/git-autosync/sync.js
```

**Check status:**
```bash
node skills/git-autosync/status.js
```

**Force push (careful!):**
```bash
node skills/git-autosync/sync.js --force
```

## Commit Messages

Format:
```
Auto-sync: 2026-02-19 04:30 UTC

Changes:
- 5 files modified
- 2 files added
- 1 file deleted

Tag: autosync-2026-02-19-0430
```

## Merge Conflict Handling

If remote has changes:
1. Attempt `git pull --rebase`
2. If conflicts: **Stop and alert**
3. User resolves manually
4. Next sync will push

❌ **Never force push** (data loss risk)  
✅ **Always preserve history**

## Cron Schedule

```yaml
# Hourly git sync
schedule: "15 * * * *"
command: "node skills/git-autosync/sync.js"
```

Run at :15 past each hour (after backups at :00)

## Sensitive Data Patterns

```javascript
const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9]{48}/,           // OpenAI keys
  /xai-[a-zA-Z0-9]{64}/,          // xAI keys  
  /sk-ant-[a-zA-Z0-9-]{95}/,      // Anthropic keys
  /ghp_[a-zA-Z0-9]{36}/,          // GitHub tokens
  /AIza[a-zA-Z0-9_-]{35}/,        // Google API keys
  /password\s*=\s*['""][^'"]+['"]/, // Passwords
  /cookie:\s*[a-zA-Z0-9+/=]{40,}/  // Session cookies
];
```

## Pre-Commit Hook

Install in `.git/hooks/pre-commit`:
```bash
#!/bin/bash
node skills/git-autosync/pre-commit-check.js
exit $?
```

Runs automatically on every commit (manual or auto).

## Monitoring

- Log every sync attempt
- Alert if sync fails 3x in a row
- Alert if repo size grows >50MB in 1 commit
- Track uncommitted changes (alert if >100 files)

## Recovery

**Accidentally committed sensitive data:**
```bash
# Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only time it's acceptable)
git push --force --all
```

## Exclusions

Never commit:
- `node_modules/`
- `.env`, `.env.local`
- `*.log`
- Browser profile directories
- `__pycache__/`
- `.DS_Store`

Already in `.gitignore`, but pre-commit checks anyway.

## State Tracking

```json
{
  "lastSync": "2026-02-19T04:15:00Z",
  "lastPush": "2026-02-19T04:15:00Z",
  "consecutiveFailures": 0,
  "totalSyncs": 1247,
  "blockedCommits": 3
}
```

Stored in: `~/.openclaw/data/git-autosync-state.json`
