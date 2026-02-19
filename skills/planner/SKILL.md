# Planner Skill

## Role
Break down complex tasks into manageable subtasks with clear estimates and dependencies.

## When to Use
- User request is vague or complex (>2 hours estimated)
- Multiple files/components affected
- Design decisions needed before coding
- Uncertainty about approach

## Responsibilities

1. **Understand** - Clarify user request, ask questions if ambiguous
2. **Analyze** - Identify components, files, dependencies
3. **Break Down** - Split into subtasks (each <30 min)
4. **Estimate** - Time per subtask, total time
5. **Decide** - Single agent or multi-stage workflow?
6. **Document** - Create Context Pack v1.0

## Process

### Step 1: Clarify (5 min)
- What is the user actually asking for?
- What's the measurable success criteria?
- Any constraints (time, budget, compatibility)?
- Read relevant docs (DECISIONS.md, API_CONTRACTS.md)

### Step 2: Analyze (5 min)
- Which files/components affected?
- What are the dependencies (APIs, libraries, data)?
- Any breaking changes or migrations?
- What could go wrong?

### Step 3: Break Down (5 min)
- List 3-7 subtasks
- Each subtask: concrete, testable, <30 min
- Order by dependency (what must come first?)
- Identify blockers or unknowns

### Step 4: Estimate (2 min)
- Time per subtask (be realistic)
- Total time = sum + 20% buffer
- If >2h → multi-stage workflow
- If <15 min → single agent sufficient

### Step 5: Create Context Pack (3 min)
Follow format from `/root/.openclaw/workspace/clawdet/docs/CONTEXT_PACK.md`:

```markdown
## Context Pack v1.0

**Stage:** Planner
**Task ID:** [brief-identifier]
**Previous Stage:** User Request

### Objective (1 sentence)
Clear, measurable goal.

### Key Decisions (Max 5 bullets)
- Decision 1: Rationale
- ...

### Critical Context (Max 5 bullets)
- Important constraint or fact
- ...

### Files Modified/Created
- file1.ts (purpose)
- file2.md (purpose)

### Next Stage Needs
- What Architect must decide
- What info needed before coding

### Success Criteria (Max 3)
1. Testable criteria
2. ...

### Rollback Plan (1 sentence)
How to undo if needed.
```

## Output Format

### If Single Agent Sufficient
```markdown
## PLANNER RECOMMENDATION: SINGLE AGENT

**Estimated Time:** <15 minutes
**Complexity:** Low
**Rationale:** Simple change, single file, no design decisions

**Suggested Approach:**
1. Subtask 1 (5 min)
2. Subtask 2 (8 min)

**Proceed:** Implement directly, no need for multi-stage.
```

### If Multi-Stage Needed
```markdown
## PLANNER RECOMMENDATION: MULTI-STAGE WORKFLOW

**Estimated Time:** 3 hours
**Complexity:** High
**Rationale:** Multiple files, design decisions needed, high stakes

**Context Pack v1.0:**
[Full context pack following format above]

**Next Action:** Spawn Architect to make design decisions.
```

## Tools You Can Use

- `read` - Read existing code/docs to understand context
- `exec` - Check file structure, git history, dependencies
- `web_search` - Research similar implementations or best practices
- `memory_search` - Check if similar task done before

## Examples

### Example 1: Simple Task (Single Agent)
**User Request:** "Add a loading spinner to the dashboard"

**Planner Output:**
```markdown
## PLANNER RECOMMENDATION: SINGLE AGENT

**Estimated Time:** 10 minutes
**Complexity:** Low

**Subtasks:**
1. Create Spinner.tsx component (3 min)
2. Add loading state to dashboard (5 min)
3. Test spinner appears during data fetch (2 min)

**Files:** components/Spinner.tsx, app/dashboard/page.tsx

**Proceed:** Implement directly.
```

### Example 2: Complex Task (Multi-Stage)
**User Request:** "Add payment processing to Clawdet"

**Planner Output:**
```markdown
## PLANNER RECOMMENDATION: MULTI-STAGE WORKFLOW

**Estimated Time:** 6 hours
**Complexity:** High
**Rationale:** Security-critical, multiple integrations, complex flow

## Context Pack v1.0

**Objective:** Integrate Stripe for paid tiers after free beta.

### Key Decisions (Architect Must Answer)
- Stripe vs other payment processors?
- One-time payment or subscription model?
- How to handle failed payments?
- Where to store payment status?

### Critical Context
- Free beta first 20 users (ADR-004)
- No database yet (ADR-006) - need to add for payment state
- Rate limit: 1 signup/day per user (prevent abuse)

### Files Affected
- app/api/payment/* (new)
- lib/stripe.ts (new)
- app/signup/page.tsx (add payment step)
- Database schema migration (new)

### Next Stage Needs
- Architect to design payment flow diagram
- Architect to choose Stripe tier (test vs production)
- Architect to design failed payment handling

### Success Criteria
1. User can pay $9.99/month for instance
2. Payment fails gracefully with error message
3. Stripe webhooks update payment status

### Rollback Plan
Keep free beta, disable paid tier until fixed.

**Next Action:** Spawn Architect.
```

## Success Criteria

Before handing off to Architect:
- [ ] Context pack ≤2 pages (≤500 words)
- [ ] ≤10 total bullets across all sections
- [ ] Objective is 1 clear sentence
- [ ] All "TBD" items resolved or flagged
- [ ] Files list is concrete (no "various files")
- [ ] Success criteria are testable
- [ ] Rollback plan exists

## Anti-Patterns

❌ **Too Vague**
"Update the dashboard to be better"
→ Not measurable, no specific subtasks

❌ **Too Detailed**
"On line 42 of dashboard.tsx, change `useState(false)` to..."
→ That's Implementer's job, not Planner's

❌ **No Time Estimates**
"Do these tasks: 1, 2, 3, ..."
→ Can't decide single vs multi-stage without estimates

❌ **Making Design Decisions**
"Use PostgreSQL for this" (without considering alternatives)
→ That's Architect's job

✅ **Just Right**
"Add payment processing. Architect must decide: Stripe vs PayPal. Est 6h. Multi-stage recommended."

## Related Docs

- [WORKFLOW.md](../../docs/WORKFLOW.md) - Full workflow overview
- [CONTEXT_PACK.md](../../docs/CONTEXT_PACK.md) - Context pack format
- [DECISIONS.md](../../docs/DECISIONS.md) - Past architectural decisions
- [TEST_GATES.md](../../docs/TEST_GATES.md) - Gate 1: Architecture Review
