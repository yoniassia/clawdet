# ClawX Architecture — Multi-Node Fleet Management

## Overview
ClawX (MoneyClaw) runs 58+ tenant agents across 3 servers connected via WireGuard VPN.

## Architecture
```
Nginx (LB) → *.moneyclaw.com
├── ClawX (Next.js :3000)
├── Provisioner (Fastify :4002) 
├── LiteLLM Proxy (:4000) — routes to Grok 4 / Claude / GPT
├── Main Server (76.13.254.162) — ~22 tenants
├── Worker 1 (10.10.0.2 via WireGuard) — ~18 tenants  
└── Worker 2 (10.10.0.3 via WireGuard) — ~18 tenants
```

## Load Balancing Strategy
- `getLeastLoadedNode()` — queries each node's container count via HTTP API
- Workers expose `/api/health` with container count
- New tenants placed on node with fewest containers
- Pinning support (e.g., tenant-9d229018 pinned to main)

## Multi-Node Scripts
1. **rebalance-cluster.sh** — Redistributes containers evenly across nodes
   - Counts containers per node
   - Calculates target = total/3
   - Migrates excess from main → workers
   - Supports --dry-run and --batch=N
   
2. **migrate-container.sh** — Single container migration (8 steps)
   - Inspect → Export data → Tarball → Transfer (SCP) → Create on target → Verify → Stop old → DNS+Nginx+SSL
   - Handles gateway bind config (loopback → lan)
   - Cloudflare DNS update
   - Certbot SSL on target

3. **batch-migrate.sh** — Sequential multi-container migration
   - Same as migrate but loops through list
   - Error tracking per container

4. **parallel-migrate.sh** — 7-phase parallel migration
   - Phase 1: Create all containers on worker
   - Phase 2: Wait 2.5 min for cold starts
   - Phase 3: Health check + restart if needed
   - Phase 4: Stop old containers on main
   - Phase 5: Bulk DNS updates
   - Phase 6: Bulk nginx configs + reload
   - Phase 7: SSL certificates

5. **dns-reconcile.sh** — Audit DNS vs Redis
   - Finds stale DNS (record exists, no tenant)
   - Finds missing DNS (tenant exists, no record)

## Provisioner (Fastify)
- PostgreSQL for agent metadata
- Redis for tenant state
- Docker API (dockerode) for container management
- JWT auth per tenant
- Automatic load balancing on create
- Cloudflare DNS API integration

## Key Design Patterns
- **WireGuard VPN** for inter-node communication
- **LiteLLM** as unified LLM proxy (all containers route API calls through main:4000)
- **Nginx per worker** with UI routes proxied back to main ClawX instance
- **Certbot** for per-subdomain SSL on workers
- **Docker labels** for tenant metadata (`moneyclaw.tenant`, `moneyclaw.subdomain`)
- **Data portability**: container data exported as tarball, transferred via SCP
- **Graceful migration**: old container stopped (not removed) as backup
- **Resource limits**: 1GB RAM, 0.5 CPU per tenant container
