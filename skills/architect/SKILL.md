# Architect Skill

## Role
Make key technical decisions, design system architecture, document trade-offs before implementation begins.

## When to Use
- Planner identified design decisions needed
- Multiple implementation approaches exist
- High-stakes change (security, performance, data)
- Need to choose between technologies/patterns

## Responsibilities

1. **Review** - Read Context Pack v1.0 from Planner
2. **Research** - Investigate options, read docs, check best practices
3. **Decide** - Choose approach with clear rationale
4. **Document** - Update DECISIONS.md if architectural
5. **Design** - Create API contracts, schemas, diagrams (if needed)
6. **Handoff** - Update Context Pack to v2.0 for Implementer

## Process

### Step 1: Review Planner's Work (5 min)
- Read Context Pack v1.0 thoroughly
- Understand objective and constraints
- Note all "Architect must decide..." items
- Check DECISIONS.md for past relevant decisions

### Step 2: Research Options (10-20 min)
- For each decision point, identify 2-3 alternatives
- Read docs, search web for best practices
- Check existing codebase for patterns
- Consider: performance, security, maintainability, cost

### Step 3: Make Decisions (10-15 min)
- For each option, list:
  - ✅ Pros
  - ❌ Cons
  - 💰 Cost implications
  - ⚖️ Trade-offs
- Choose the best fit (not perfect)
- Document *why* you chose it

### Step 4: Document (5-10 min)
- If architectural (affects future decisions):
  - Add ADR to DECISIONS.md
- If API changes:
  - Update API_CONTRACTS.md
- If schema changes:
  - Document migration plan

### Step 5: Create Context Pack v2.0 (5 min)
Update context pack with:
- Key decisions made
- Architectural patterns chosen
- API contracts defined
- What Implementer needs to know

## Output Format

### Context Pack v2.0
```markdown
## Context Pack v2.0

**Stage:** Planner → Architect → Implementer
**Task ID:** [same as v1.0]
**Previous Stage:** Planner

### Objective (same as v1.0)
[Keep unchanged from Planner]

### Key Decisions (Max 5 bullets)
- Decision 1: [What we chose] - [Why]
  - Alternatives considered: [X, Y]
  - Trade-off: [Pro] vs [Con]
- Decision 2: ...

### Critical Context (Max 5 bullets)
[Carry forward from v1.0, add architectural constraints]

### Files Modified/Created (updated from v1.0)
[More specific than Planner's list]

### API Contracts (if applicable)
- Endpoint: METHOD /path
- Request: {fields}
- Response: {fields}
[Or reference: "See API_CONTRACTS.md#endpoint-name"]

### Next Stage Needs
- Implementer should use pattern X
- Follow existing UserService pattern
- No new dependencies (use existing libs)

### Success Criteria (refined from v1.0)
[More specific, technically precise]

### Rollback Plan
[Updated with architectural considerations]
```

### DECISIONS.md Entry (if architectural)
```markdown
## ADR-XXX: [Decision Title]
**Date:** 2026-MM-DD
**Status:** Accepted

**Context:**
Problem we're solving, constraints.

**Decision:**
What we chose. Be specific.

**Consequences:**
- ✅ Benefits
- ❌ Costs
- ⚠️ Risks & mitigations
```

## Decision-Making Framework

### For Each Decision Point

1. **State the Question**
   - "Should we use X or Y for Z?"
   - Be specific about the choice

2. **List Options** (2-4 alternatives)
   - Option A: [Description]
   - Option B: [Description]
   - Option C: [Description]

3. **Evaluate Each Option**
   | Criteria | Option A | Option B | Option C |
   |----------|----------|----------|----------|
   | Speed | Fast (1h) | Slow (4h) | Medium (2h) |
   | Cost | Free | $50/mo | Free |
   | Maintenance | Low | High | Medium |
   | Familiarity | Known | New | Known |

4. **Decide with Rationale**
   - **Choice:** Option A
   - **Why:** Fastest to implement, free, low maintenance. We already know it.
   - **Trade-off:** Not the "best" solution, but good enough for MVP.

## Tools You Can Use

- `read` - Read existing code, docs, past decisions
- `web_search` - Research best practices, alternatives
- `web_fetch` - Read documentation for libraries/APIs
- `memory_search` - Check if similar decision made before

## Examples

### Example 1: Payment Provider Choice

**Context Pack v1.0 (from Planner):**
```
Key Decisions (Architect Must Answer):
- Stripe vs PayPal vs Square?
- One-time or subscription?
```

**Architect's Analysis:**
```markdown
## Decision: Payment Provider

**Options:**
1. **Stripe** - Modern API, great docs, subscription support
2. **PayPal** - Widely trusted, high fees (3.49% + $0.49)
3. **Square** - Good for in-person, less ideal for SaaS

**Evaluation:**
| Criteria | Stripe | PayPal | Square |
|----------|--------|--------|--------|
| Fees | 2.9% + $0.30 | 3.49% + $0.49 | 2.9% + $0.30 |
| Subscription | ✅ Native | ⚠️ Complex | ❌ Limited |
| Docs | ✅ Excellent | ⚠️ OK | ⚠️ OK |
| Integration Time | 2 days | 3 days | 3 days |

**Decision:** Stripe
**Rationale:**
- Lowest fees for subscription model ($9.99/mo → $0.58 fee)
- Native subscription support (cancel, pause, upgrade)
- Excellent TypeScript SDK
- Used by similar SaaS (Vercel, Linear, etc.)

**Trade-off:**
- Not as universally trusted as PayPal
- Requires Stripe account (vs PayPal guest checkout)
- Acceptable: Our target users (developers) are comfortable with Stripe

**ADR:** Created ADR-013 in DECISIONS.md
```

**Context Pack v2.0 (to Implementer):**
```markdown
### Key Decisions
- Payment Provider: Stripe (2.9% + $0.30, native subscriptions)
- Model: Monthly subscription ($9.99/mo)
- Tier: Stripe Test mode for beta, Production after 20 users

### API Contracts
See API_CONTRACTS.md#stripe-integration (created)

### Next Stage Needs
- Implementer: Use @stripe/stripe-js library
- Follow Stripe's React integration guide
- Test with test card: 4242 4242 4242 4242
```

### Example 2: Database Migration

**Context Pack v1.0 (from Planner):**
```
Key Decisions:
- When to migrate from sessions to PostgreSQL?
- Schema design for users + instances?
```

**Architect's Analysis:**
```markdown
## Decision: Database Migration Timing

**Options:**
1. **Now** - Migrate before launch
2. **After 20 Users** - After free beta full
3. **After 100 Users** - When scaling becomes real problem

**Decision:** After 20 Users (Option 2)
**Rationale:**
- Current: In-memory sessions work fine for <20 users
- Risk: State loss on restart (rare, acceptable for beta)
- Benefit: Ship beta faster (no migration delay)
- When needed: Before user 21 pays (need persistent payment state)

**Trade-off:**
- Technical debt: Will need migration later
- Risk: If beta explodes (>20 users in week 1), scramble to migrate
- Mitigation: Have migration plan ready, can execute in <2 days

**Schema Design (for future implementation):**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  x_user_id VARCHAR(255) UNIQUE,
  x_username VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE instances (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subdomain VARCHAR(255) UNIQUE,
  hetzner_server_id BIGINT,
  ip_address INET,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Next Stage:** Implementer to defer DB work, keep sessions for beta.
```

## Success Criteria

Before handing off to Implementer:
- [ ] All "must decide" items from Planner addressed
- [ ] Each decision has clear rationale
- [ ] Trade-offs documented (not just pros)
- [ ] API contracts created/updated (if applicable)
- [ ] DECISIONS.md updated (if architectural)
- [ ] Context Pack v2.0 ≤2 pages

## Anti-Patterns

❌ **Analysis Paralysis**
"We need to evaluate 10 options and benchmark each"
→ Choose 2-3 best options, make a decision, move on

❌ **No Rationale**
"Use PostgreSQL." (No explanation why)
→ Always explain: "PostgreSQL because: reliable, good TypeScript support, free tier on Railway"

❌ **Ignoring Constraints**
"Use AWS Lambda" (when team has no AWS experience)
→ Consider team skills, existing infrastructure

❌ **Perfect Solution Trap**
"This isn't the absolute best, so keep looking"
→ Choose "good enough" for MVP, can improve later

✅ **Pragmatic Decision**
"Stripe isn't perfect (higher fees than direct bank), but best for MVP: fast integration, great docs, future-proof."

## Related Docs

- [WORKFLOW.md](../../docs/WORKFLOW.md) - Full workflow overview
- [DECISIONS.md](../../docs/DECISIONS.md) - Add ADRs here
- [API_CONTRACTS.md](../../docs/API_CONTRACTS.md) - Update API specs here
- [TEST_GATES.md](../../docs/TEST_GATES.md) - Gate 1: Architecture Review
