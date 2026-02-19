# Context Pack Format

## Purpose
Compact handoff format for passing context between workflow stages. Keeps context under 2 pages (~500 words) while preserving critical information.

## Format Template

```markdown
## Context Pack v1.0

**Stage:** [Planner/Architect/Implementer/Verifier/Release]
**Task ID:** [Brief identifier]
**Previous Stage:** [What came before]

### Objective (1 sentence)
Clear, measurable goal for this stage.

### Key Decisions (Max 5 bullets)
- Decision 1: Rationale
- Decision 2: Rationale
- ...

### Critical Context (Max 5 bullets)
- Context 1
- Context 2
- ...

### Files Modified/Created
- file1.ts (purpose)
- file2.md (purpose)

### Next Stage Needs
- Requirement 1
- Requirement 2

### Success Criteria (Max 3)
1. Criteria 1
2. Criteria 2
3. Criteria 3

### Rollback Plan (1 sentence)
How to undo this stage if needed.
```

## Usage Rules

1. **≤10 Total Bullets** across all sections
2. **No Code Snippets** - reference files instead
3. **Decisions Over Details** - what we chose, not how we implemented
4. **Forward-Looking** - what the next stage needs to succeed

## Example

```markdown
## Context Pack v1.0

**Stage:** Architect → Implementer
**Task ID:** websocket-auth-fix
**Previous Stage:** Planner

### Objective
Add gateway token authentication to WebSocket connect requests.

### Key Decisions
- Use embedded token in HTML (simpler than dynamic fetch)
- Token goes in auth.token field per OpenClaw protocol
- Remove device object (conflicts with allowInsecureAuth)

### Critical Context
- Gateway token stored in ~/.openclaw/gateway-token.txt on instances
- Provisioning script generates token during setup
- Current code sends empty auth: {} object

### Files Modified/Created
- public/instance-landing-v3/index.html (embed token)
- scripts/provision-openclaw.sh (inject token into HTML)

### Next Stage Needs
- Test on fresh instance to verify token embedded correctly
- Check gateway logs for successful authentication
- Verify browser console shows no auth errors

### Success Criteria
1. WebSocket connects without "invalid connect params" error
2. Browser shows "Connected" (green) status
3. Can send/receive messages through gateway

### Rollback Plan
Revert HTML to auth: {} and deploy previous version.
```

## Anti-Patterns

❌ **Too Verbose**
```markdown
### Context
The WebSocket connection was failing because the authentication 
object was empty. We investigated the OpenClaw Gateway protocol 
documentation and found that when allowInsecureAuth is true, 
you can use token-only authentication instead of device identity 
with public/private keys. The token is generated during provisioning 
using openssl rand -hex 32...
```

✅ **Compact**
```markdown
### Key Decisions
- Use token auth (allowInsecureAuth mode) vs device identity
- Token embedded in HTML vs fetched dynamically (simpler)
```

## Benefits

1. **Prevents Context Bloat** - Subagents don't inherit 100KB of chat history
2. **Faster Handoffs** - Next stage reads 1 page, not 50 messages
3. **Better Focus** - Forces distillation of what matters
4. **Audit Trail** - Chain of context packs shows decision flow
5. **Rollback Ready** - Each stage documents undo path

## Storage

Context packs should be:
- Created in `/tmp/context-pack-{stage}.md` during execution
- Committed to `docs/context-packs/{task-id}/` for completed tasks
- Referenced in DECISIONS.md for architectural choices
