
---

## 🚀 Multi-Agent Workflow (NEW)

For complex tasks (>2 hours, high stakes, or design decisions needed), use the **structured multi-agent workflow** instead of ad-hoc subagents.

### When to Use
- **Complex:** >2 hours estimated, multiple files
- **High Stakes:** User-facing, security, data migrations
- **Design Decisions:** Multiple approaches exist
- **Quality Critical:** Need thorough testing + review

### Five-Stage Process

```
Planner → Architect → Implementer → Verifier → Release
```

Each stage:
1. Reads compact Context Pack (≤2 pages) from previous stage
2. Executes focused role
3. Updates Context Pack for next stage
4. Passes quality gate before handoff

### Documentation

All workflow docs in `/docs/`:
- **WORKFLOW.md** - Full process overview
- **CONTEXT_PACK.md** - Handoff format (≤10 bullets, ≤2 pages)
- **TEST_GATES.md** - Quality gates for each stage
- **DECISIONS.md** - Architectural decisions log (ADRs)
- **API_CONTRACTS.md** - Interface specifications
- **KNOWN_BUGS.md** - Issue tracking

### Skills

Each role has a skill template in `/skills/`:
- **planner/** - Break down tasks, estimate complexity
- **architect/** - Make design decisions, document trade-offs
- **implementer/** - Write code, self-test, commit
- **verifier/** - Test thoroughly, catch bugs
- **release/** - Deploy, document, monitor

### Example Usage

```bash
# For simple task (<15 min):
# Use single agent, no workflow needed

# For complex task:
# 1. Spawn Planner
sessions_spawn({
  task: "PLAN: Add payment processing to Clawdet",
  label: "planner-payment",
  model: "anthropic/claude-sonnet-4-5"
});

# 2. Planner creates Context Pack v1.0
# 3. Spawn Architect with Context Pack
# 4. Architect creates Context Pack v2.0
# 5. Spawn Implementer with Context Pack
# ... (continues through all stages)
```

### Benefits

- **Context Stays Small:** Each agent sees 2 pages, not 100 messages
- **Better Quality:** Specialized roles + formal gates
- **Audit Trail:** Chain of context packs shows decision history
- **Rollback Ready:** Each stage documents undo path
- **Scalable:** Parallel implementers for large tasks

### See Also

Start with `docs/WORKFLOW.md` for full details.

