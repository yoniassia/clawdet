# Coolify Architecture — Clawdet Integration

## Overview

Coolify replaces manual Docker/nginx/SSL provisioning with an API-driven PaaS layer.
Each Clawdet tenant becomes a Coolify "application" (Docker image), managed via REST API.

## Topology

```
┌─────────────────────────────────────────────────┐
│                   Clawdet API                    │
│         (tenant signup / management)             │
└─────────────────┬───────────────────────────────┘
                  │ REST API (Bearer token)
                  ▼
┌─────────────────────────────────────────────────┐
│              Coolify (135.181.43.68:8000)        │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Dashboard  │  │ API v1   │  │ Traefik      │  │
│  │ (Web UI)   │  │ /api/v1  │  │ (auto SSL)   │  │
│  └───────────┘  └──────────┘  └──────────────┘  │
│                                                   │
│  Managed Servers:                                 │
│  ┌─────────────────┐  ┌─────────────────────┐    │
│  │ 135.181.43.68   │  │ 188.34.197.212      │    │
│  │ (Primary)       │  │ (Clawdet/Overflow)  │    │
│  │ - tenant-a      │  │ - tenant-x          │    │
│  │ - tenant-b      │  │ - tenant-y          │    │
│  └─────────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## What Replaces What

| Before (Manual)         | After (Coolify)                    |
|------------------------|------------------------------------|
| nginx reverse proxy    | Traefik (built into Coolify)       |
| Manual SSL (certbot)   | Auto Let's Encrypt via Traefik     |
| `docker run` scripts   | Coolify API: POST /applications    |
| Manual DNS + config    | Coolify domains + wildcard DNS     |
| SSH to check logs      | Coolify API: GET /applications/{uuid}/logs |
| No health monitoring   | Built-in + custom health-check.ts  |
| No migration path      | migrate-tenant.ts (zero-downtime)  |

## Tenant Lifecycle

```
Signup → provisionTenant() → Coolify creates container + SSL + domain
Usage  → health-check.ts polls every 30s
Scale  → migrateTenant() moves to bigger server
Cancel → deprovisionTenant() clean teardown
```

## API Endpoints Used

| Endpoint                              | Purpose                    |
|---------------------------------------|----------------------------|
| POST /applications/dockerimage        | Create tenant app          |
| PATCH /applications/{uuid}            | Update config/domains      |
| PATCH /applications/{uuid}/envs/bulk  | Set env vars               |
| POST /applications/{uuid}/start       | Deploy/start               |
| POST /applications/{uuid}/stop        | Stop                       |
| POST /applications/{uuid}/restart     | Restart                    |
| GET /applications/{uuid}/logs         | Fetch logs                 |
| DELETE /applications/{uuid}           | Remove tenant              |
| GET /applications                     | List all (for health check)|
| GET /servers                          | List managed servers       |

## Migration Path

### Phase 1: Install Coolify (Day 1)
1. Run `install-coolify.sh` on 135.181.43.68
2. Set up admin account, get API token
3. Add 188.34.197.212 as secondary server
4. Set DNS: `*.clawdet.com → 135.181.43.68`

### Phase 2: New Tenants via Coolify (Week 1)
- All new signups go through `provisionTenant()`
- Existing tenants stay on manual Docker setup

### Phase 3: Migrate Existing Tenants (Week 2-3)
- For each existing tenant:
  1. Create matching Coolify app
  2. Test with temporary subdomain
  3. Switch DNS
  4. Remove old container

### Phase 4: Decommission Manual Setup (Week 4)
- Remove nginx configs
- Remove manual Docker scripts
- Coolify is sole orchestrator

## Environment Variables

```bash
# Coolify connection
COOLIFY_BASE_URL=http://135.181.43.68:8000
COOLIFY_API_TOKEN=<from Settings > API>
COOLIFY_SERVER_UUID=<from GET /servers>
COOLIFY_PROJECT_UUID=<from GET /projects>

# Domain
CLAWDET_DOMAIN=clawdet.com

# Monitoring (optional)
HEALTH_WEBHOOK_URL=https://hooks.slack.com/... or Discord webhook
```

## Considerations

- **Caddy conflict**: 135.181.43.68 currently runs Caddy. Coolify uses Traefik on ports 80/443. Either:
  - Stop Caddy and let Traefik handle everything
  - Install Coolify on 188.34.197.212 instead (cleaner)
  - Configure Coolify to use non-standard proxy ports
- **Resource limits**: Set per-tenant memory limits (default 512MB) to prevent noisy neighbors
- **Backup**: Coolify supports S3 backup for databases; tenant app state is stateless (config in env vars)
- **Multi-server**: Coolify can manage multiple servers from one dashboard — add servers as needed
