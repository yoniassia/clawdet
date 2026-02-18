# Provisioning Script V3 Update

**Date:** 2026-02-18  
**Status:** ✅ Complete  
**Commit:** 56169f3  

## Summary

The provisioning script (`scripts/provision-openclaw.sh`) has been updated to deploy the **V3 hybrid interface** by default on all newly provisioned Clawdet instances.

## What Changed

### Updated Files

- `scripts/provision-openclaw.sh` - Main provisioning script
- `update-provision-script.sh` - Helper script reference updated from v2 to v3

### Key Changes

1. **Interface Upgrade**: V2 → V3
   - Previous: Basic landing page with single chat option
   - Current: Hybrid interface with tabbed navigation

2. **New Features in V3**:
   - **"Chat Now" Tab**: Instant web-based chat interface
   - **"Setup Telegram" Tab**: Guided Telegram bot setup with QR code
   - Improved visual design with dark theme
   - Better mobile responsiveness
   - Status indicators and connection feedback

3. **Technical Details**:
   - File size: 1032 lines → 2128 lines (~52KB HTML)
   - HTML heredoc section: Lines 394-1947
   - Title: "Clawdet - Your AI Assistant"
   - Syntax validated: ✅ No errors

## Verification Checklist

- [x] V3 interface exists at `public/instance-landing-v3/index.html`
- [x] File size verified (~52KB)
- [x] Contains "Chat Now" and "Setup Telegram" tabs
- [x] Backup created: `scripts/provision-openclaw.sh.backup-v2-20260218-151903`
- [x] Title tag correct: "Clawdet - Your AI Assistant"
- [x] Bash syntax valid: `bash -n scripts/provision-openclaw.sh`
- [x] Git committed and pushed
- [x] GitHub shows latest commit

## Rollback Instructions

If you need to revert to the V2 interface:

```bash
cd /root/.openclaw/workspace/clawdet

# Restore from backup
cp scripts/provision-openclaw.sh.backup-v2-20260218-151903 scripts/provision-openclaw.sh

# Or restore V2 interface manually
# The backup contains the simpler landing page without tabs

# Commit the rollback
git add scripts/provision-openclaw.sh
git commit -m "revert: Rollback to V2 provisioning interface"
git push origin main
```

### Alternative: Manual V2 Restoration

If backups are unavailable, checkout the previous commit:

```bash
git checkout 6d5de00 -- scripts/provision-openclaw.sh
git commit -m "revert: Rollback to V2 provisioning interface"
git push origin main
```

## Testing New Provisions

When provisioning a new Clawdet instance, verify:

1. **Landing page loads** at `http://<instance-ip>/`
2. **Two tabs visible**: "Chat Now" and "Setup Telegram"
3. **Chat Now tab**: Opens web chat interface
4. **Setup Telegram tab**: Shows Telegram setup instructions with QR code
5. **Mobile responsive**: Works on phones/tablets
6. **Connection status**: Shows "Connected" when gateway is running

### Test Provision (Dry Run)

Before provisioning a real instance, validate the script:

```bash
cd /root/.openclaw/workspace/clawdet
bash -n scripts/provision-openclaw.sh  # Syntax check
```

## Breaking Changes

⚠️ **None** - This is a UI-only change. The provisioning process remains identical:

- Same environment variables required
- Same server setup steps
- Same backend configuration
- Only the frontend HTML changes

Existing instances are **not affected** - they keep their current interface until manually updated.

## Affected Files

### Modified
- `scripts/provision-openclaw.sh` (main update)
- `update-provision-script.sh` (helper script reference)

### Created Backups
- `scripts/provision-openclaw.sh.backup-v2-20260218-151903`

### Unchanged
- All other provisioning logic
- Environment variables
- Server configuration
- Gateway setup
- Telegram bot logic

## Future Instances

All instances provisioned after commit `56169f3` (2026-02-18 15:19 UTC) will automatically receive:

- V3 hybrid interface
- Dual-tab navigation (Chat Now + Setup Telegram)
- Improved user experience
- Modern dark theme UI

## Updating Existing Instances

To update an already-provisioned instance to V3:

```bash
# SSH into the instance
ssh root@<instance-ip>

# Download V3 interface
wget -O /var/www/html/index.html https://raw.githubusercontent.com/yoniassia/clawdet/main/public/instance-landing-v3/index.html

# Or copy from local workspace
scp /root/.openclaw/workspace/clawdet/public/instance-landing-v3/index.html root@<instance-ip>:/var/www/html/

# Verify
curl http://<instance-ip>/ | grep "Clawdet - Your AI Assistant"
```

## Notes

- **No re-provisioning required** for this update to take effect - it only affects new provisions
- Test provision recommended before production deployment
- V2 backups preserved for safety
- Git history maintained for easy rollback
- Documentation stored for future reference

## Related Documentation

- `public/instance-landing-v3/README.md` - V3 interface details
- `scripts/provision-openclaw.sh` - Full provisioning script
- Git commit `56169f3` - Full diff of changes

---

**Updated by:** Subagent (update-provisioning-v3)  
**Session:** agent:main:subagent:ff38918a-ecf7-44e4-b00b-380fec64f29b  
**Verification:** All tests passed ✅
