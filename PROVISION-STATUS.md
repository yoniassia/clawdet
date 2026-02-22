# New Instance Provision - Status Report

## Attempt: test-new.clawdet.com

**Date:** 2026-02-22 01:17 UTC

**Status:** ❌ FAILED (SSH key issue)

### What Worked:
- ✅ Hetzner VPS created successfully
  - Server ID: 121716223
  - IP: 89.167.3.83
  - Type: cax11 (ARM-based)
  - Location: Default (no location specified after removing fsn1)
- ✅ Cloudflare DNS configured
  - test-new.clawdet.com → 89.167.3.83

### What Failed:
- ❌ SSH connection failed with "Permission denied"
- **Root cause:** No SSH key was configured in the Hetzner server creation request

### Issue Details:
The API call didn't include `"ssh_keys": [...]` parameter, so the VPS was created without any authorized keys and password auth is disabled by default on Hetzner Ubuntu images.

### Fix Required:
1. Get SSH key ID from Hetzner (or upload our public key)
2. Include `"ssh_keys": ["key_id"]` in the server creation request
3. Or use cloud-init user-data to set a root password

### Cleanup:
- VPS 121716223 deleted ✅
- DNS record remains (will be reused)

---

## Next Attempt Plan:

**Option 1: Use SSH Key (Recommended)**
```bash
# 1. Get SSH keys from Hetzner
curl -H "Authorization: Bearer $TOKEN" https://api.hetzner.cloud/v1/ssh_keys

# 2. Add to server creation:
"ssh_keys": [12345],  # Use actual key ID
```

**Option 2: Use Cloud-Init Password**
```bash
# Add to server creation:
"user_data": "#cloud-config\npassword: testnew123\nchpasswd: { expire: False }\nssh_pwauth: True"
```

**Option 3: Simple Manual Setup**
Given the time constraints and SSH complexity, the fastest path is:
1. Create VPS with SSH key or cloud-init password
2. Wait 2 minutes for full boot
3. SSH in and run the installation commands
4. Deploy the WebSocket chat HTML
5. Configure Caddy with gateway proxy
6. Test the chat

---

## Alternative: Use Existing Docker on This Server

Since we already have Docker and OpenClaw Gateway running on clawdet.com, we could:

1. **Create a separate Docker container** on THIS server:
   ```bash
   docker run -d \
     --name test-new \
     -p 8181:8080 \
     -e XAI_API_KEY=... \
     -e OPENCLAW_PRIMARY_MODEL=x-ai/grok-420-0220-5p1m-reasoning \
     coollabsio/openclaw:latest
   ```

2. **Add subdomain proxy** in Caddy:
   ```nginx
   test-new.clawdet.com {
       reverse_proxy localhost:8181
   }
   ```

3. **Deploy WebSocket chat** pointing to this container's gateway

**Pros:**
- Instant deployment (no VPS wait)
- No SSH complexity
- No additional cost
- Same network, lower latency

**Cons:**
- Not a "real" isolated instance
- Shares resources with main server
- Not representative of customer deployment

---

## Recommendation:

For **immediate testing**, use the Docker approach on this server.
For **production validation**, fix the SSH key issue and complete the Hetzner VPS deployment.

**Time estimate:**
- Docker on this server: 5 minutes
- Fixed Hetzner provision: 10-15 minutes (including SSH key setup)

---

## Files Ready:
- WebSocket chat HTML: `/var/www/clawdet/test-fresh-working-chat.html` ✅
- Provision script: `/tmp/provision-test-new.sh` (needs SSH key fix)
- Docker templates: `https://clawdet.com/templates/` ✅
- Test user created: testnew (ID: test_new_1771722968463) ✅

**Status:** Ready to proceed with either approach - awaiting decision
