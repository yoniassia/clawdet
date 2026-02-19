# Architectural Decision Log

## Format

Each decision uses this template:
```markdown
## ADR-NNN: [Title]
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Context:** Problem we're solving
**Decision:** What we chose
**Consequences:** Trade-offs and implications
```

---

## ADR-001: Dedicated VPS Per User
**Date:** 2026-02-17
**Status:** Accepted

**Context:** 
Need to isolate user instances for security and prevent one user's issues from affecting others.

**Decision:**
Each Clawdet user gets a dedicated Hetzner VPS (cax11) running their own OpenClaw instance.

**Consequences:**
- ✅ Strong isolation (security + stability)
- ✅ Users can't affect each other
- ✅ Easy to debug (one user = one VPS)
- ❌ Higher cost than shared hosting (~$3/month per user)
- ❌ More VPS instances to manage

---

## ADR-002: Cloudflare SSL Proxy
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Need HTTPS on user subdomains (username.clawdet.com) without manual cert management.

**Decision:**
Use Cloudflare as SSL termination proxy with automatic certificate management.

**Consequences:**
- ✅ Free SSL certificates
- ✅ Automatic renewal
- ✅ DDoS protection included
- ❌ Cloudflare sees all traffic (trust dependency)
- ❌ Adds latency (~50ms)

---

## ADR-003: Grok 4.2 as Default Model
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Need AI model for provisioned instances that's fast, capable, and cost-effective.

**Decision:**
Use xAI's Grok 4.2 API for all user instances.

**Consequences:**
- ✅ Fast responses (competitive with GPT-4)
- ✅ Good coding capability
- ✅ Single API key for all instances
- ❌ Less well-known than OpenAI/Anthropic
- ❌ xAI API uptime dependency

---

## ADR-004: Free Beta (First 20 Users)
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Need early adopters to test platform and provide feedback before charging.

**Decision:**
First 20 signups get free lifetime access (no Stripe payment required).

**Consequences:**
- ✅ Fast user acquisition
- ✅ Real-world testing with committed users
- ✅ Word-of-mouth marketing
- ❌ 20 users at ~$3/month = $60/month ongoing cost
- ❌ Need to implement Stripe later for user 21+

---

## ADR-005: X OAuth for Authentication
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Need simple authentication that doesn't require email verification or password management.

**Decision:**
Use X (Twitter) OAuth as primary authentication method.

**Consequences:**
- ✅ No password management complexity
- ✅ Instant authentication (users already have X accounts)
- ✅ Natural fit for tech-savvy audience
- ❌ Excludes users without X accounts
- ❌ Dependency on X API availability

---

## ADR-006: No Database (Session-Based State)
**Date:** 2026-02-17
**Status:** Accepted (with plan to migrate)

**Context:**
Rapid prototyping phase - need to ship fast without database setup.

**Decision:**
Use session cookies + in-memory state for beta. Plan PostgreSQL migration post-launch.

**Consequences:**
- ✅ Faster development (no schema migrations)
- ✅ No database hosting costs initially
- ❌ State lost on server restart
- ❌ Can't query user data easily
- ⚠️ **Must migrate to PostgreSQL** before scaling beyond beta

---

## ADR-007: Hybrid Interface (Web Chat + Telegram Setup)
**Date:** 2026-02-18
**Status:** Accepted

**Context:**
Users want instant interaction but also need mobile access via Telegram.

**Decision:**
Deploy dual-tab interface: "Chat Now" (web) + "Setup Telegram" (wizard).

**Consequences:**
- ✅ Instant gratification (try immediately in browser)
- ✅ Mobile access option (Telegram bot)
- ✅ User can choose preferred method
- ❌ Maintains two chat interfaces
- ❌ WebSocket complexity for web chat

---

## ADR-008: Gateway Token Authentication
**Date:** 2026-02-18
**Status:** Accepted

**Context:**
WebSocket connections were failing with "invalid connect params" errors.

**Decision:**
Embed gateway token directly in HTML using `allowInsecureAuth` mode.

**Consequences:**
- ✅ Simple authentication (no device crypto)
- ✅ Works immediately on fresh instances
- ✅ Token generated during provisioning
- ❌ Token visible in HTML source (acceptable for user's own instance)
- ❌ No device-level security (mitigated by HTTPS + Cloudflare)

---

## ADR-009: Caddy as Reverse Proxy
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Need reverse proxy to route / → landing page and /gateway/ → OpenClaw.

**Decision:**
Use Caddy on each VPS for routing and local HTTPS termination.

**Consequences:**
- ✅ Automatic HTTPS (though we use Cloudflare instead)
- ✅ Simple configuration (Caddyfile)
- ✅ Lightweight resource usage
- ❌ Another service to manage per VPS

---

## ADR-010: Advanced Mode Enabled by Default
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Users are power users who want full capabilities (browser automation, code execution, etc.)

**Decision:**
Enable all OpenClaw tools (browser, exec, canvas, sub-agents, memory) on provisioned instances.

**Consequences:**
- ✅ Full feature access from day one
- ✅ No "locked down" feeling
- ✅ Demonstrates platform power
- ❌ Higher security risk if users run malicious code
- ⚠️ Mitigated by: isolated VPS per user, Cloudflare protection

---

## ADR-011: RentAHuman Integration
**Date:** 2026-02-17
**Status:** Accepted

**Context:**
Some tasks need human oversight or input (e.g., reviewing code before deploying).

**Decision:**
Include RentAHuman MCP server on all provisioned instances for human-in-the-loop capabilities.

**Consequences:**
- ✅ Unique differentiator vs other AI platforms
- ✅ Safety mechanism for critical actions
- ✅ Hybrid human+AI workflows
- ❌ Dependency on RentAHuman API
- ❌ Additional API key management

---

## ADR-012: Multi-Agent Workflow (This Decision)
**Date:** 2026-02-18
**Status:** Proposed → Accepted

**Context:**
Complex tasks hit context limits and require better organization. Need structured approach to planning, architecting, implementing, verifying, and releasing.

**Decision:**
Implement five-stage workflow with context compaction:
1. **Planner** - Break down tasks, estimate complexity
2. **Architect** - Design solution, make key decisions
3. **Implementer** - Write code, execute changes
4. **Verifier** - Test, validate, catch issues
5. **Release** - Deploy, document, create rollback plan

Each stage produces a Context Pack (≤2 pages) for the next stage.

**Consequences:**
- ✅ Better context management (no 100KB chat histories)
- ✅ Clear handoffs between stages
- ✅ Parallel work possible (multiple implementers)
- ✅ Audit trail of decisions
- ✅ Easier rollbacks (each stage documents undo)
- ❌ Overhead for simple tasks (use single agent for <15 min tasks)
- ❌ More files to manage (context packs, skill templates)
- ❌ Learning curve for new workflow

**Implementation Notes:**
- Created `/docs/` with CONTEXT_PACK.md, TEST_GATES.md, WORKFLOW.md
- Created `/skills/` templates for each stage
- Updated AGENTS.md with routing rules

---

## Decision Template (Copy for New Decisions)

```markdown
## ADR-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** Proposed

**Context:**
What problem are we solving? Why now?

**Decision:**
What did we choose? Be specific.

**Consequences:**
Trade-offs:
- ✅ Benefits
- ❌ Costs
- ⚠️ Risks & mitigations
```

## Decision Status Lifecycle

1. **Proposed** - Under discussion
2. **Accepted** - Decided and implemented
3. **Deprecated** - No longer recommended but not removed
4. **Superseded by ADR-XXX** - Replaced by newer decision
