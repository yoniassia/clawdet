# Multi-Agent Workflow

## Purpose
Structured approach to complex tasks using specialized agents with context compaction. Prevents context bloat and improves code quality.

---

## When to Use Multi-Agent Workflow

### Use Multi-Stage (5 agents)
- **Task complexity:** >2 hours estimated
- **Multiple files:** >3 files modified
- **High stakes:** User-facing changes, data migrations, security
- **Uncertainty:** Design decisions needed before coding

### Use Single Agent
- **Simple tasks:** <15 minutes
- **Single file:** One-off fix
- **Low stakes:** Documentation, minor bug
- **Clear path:** No design decisions needed

---

## Workflow Stages

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌──────────┐     ┌─────────┐
│ Planner  │────▶│ Architect │────▶│ Implementer  │────▶│ Verifier │────▶│ Release │
└──────────┘     └───────────┘     └──────────────┘     └──────────┘     └─────────┘
    ▲                                      │                   │
    │                                      ▼                   ▼
    │                               Context Pack         Test Results
    │                               (≤2 pages)          (Pass/Fail)
    │                                      │                   │
    └──────────────────────────────────────┴───────────────────┘
                            Feedback Loop
```

### Stage 1: Planner
**Role:** Break down task, assess complexity, identify dependencies
**Time:** 5-15 minutes
**Output:** Context Pack v1.0 with task breakdown

**Responsibilities:**
- Understand user request
- Break into subtasks
- Estimate time per subtask
- Identify files to touch
- Flag potential blockers
- Decide: single agent or multi-stage

**Success Criteria:**
- Clear objective (1 sentence)
- ≤5 subtasks identified
- Each subtask scoped (<30 min)
- Dependencies listed
- Context pack ≤2 pages

**Example Output:**
```markdown
## Context Pack v1.0 - Planner

**Objective:** Add user avatars to dashboard UI

**Subtasks:**
1. Add avatar field to User type (5 min)
2. Update profile API to accept avatar upload (15 min)
3. Add avatar display component (20 min)
4. Update dashboard to show avatars (10 min)
5. Add default avatar placeholder (5 min)

**Files Affected:**
- types/User.ts
- app/api/profile/route.ts
- components/Avatar.tsx
- app/dashboard/page.tsx

**Dependencies:**
- Need image hosting (use Cloudflare R2 or base64 for MVP)
- Consider file size limits (max 2MB)

**Next Stage:** Architect to design avatar storage approach
```

### Stage 2: Architect
**Role:** Make design decisions, choose approach, document trade-offs
**Time:** 10-30 minutes
**Output:** Context Pack v2.0 with architectural decisions

**Responsibilities:**
- Review planner's breakdown
- Make key technical decisions
- Choose between alternatives
- Document trade-offs
- Update DECISIONS.md if architectural
- Create API contracts if needed

**Success Criteria:**
- All "how should we..." questions answered
- Trade-offs documented (pros/cons)
- Breaking changes identified
- Security implications assessed
- Context pack updated, ≤2 pages

**Example Output:**
```markdown
## Context Pack v2.0 - Architect

**Key Decisions:**
1. Avatar Storage: Base64 in database (simpler than R2 for MVP)
   - Pro: No external service, instant deploy
   - Con: Larger database size (acceptable for <100 users)
   
2. File Size: 2MB limit enforced client-side
   - Pro: Prevents abuse
   - Con: Users must compress large images
   
3. Format: Accept JPEG/PNG, convert to WebP on upload
   - Pro: Optimal size/quality
   - Con: Requires image processing library (sharp)

**API Contract:**
POST /api/profile/avatar
- Request: multipart/form-data with 'avatar' field
- Response: { success: true, avatarUrl: string }

**Next Stage:** Implementer to code avatar upload + display
```

### Stage 3: Implementer
**Role:** Write code, execute changes, commit to git
**Time:** 30 minutes - 2 hours
**Output:** Working code + context pack v3.0

**Responsibilities:**
- Write clean, tested code
- Follow architectural decisions
- Add comments for complex logic
- Self-review before handoff
- Commit to git (don't push yet)
- Update context pack with actual changes

**Success Criteria:**
- Code runs without syntax errors
- Happy path works (manual test)
- Follows style guide
- Git commits with clear messages
- Context pack lists actual files changed

**Example Output:**
```markdown
## Context Pack v3.0 - Implementer

**Files Changed:**
1. types/User.ts - Added avatarBase64?: string field
2. app/api/profile/avatar/route.ts - New endpoint (POST)
3. components/Avatar.tsx - New component (50 lines)
4. app/dashboard/page.tsx - Integrated Avatar component
5. lib/imageProcessing.ts - New utility (sharp wrapper)

**Key Implementation Notes:**
- Used sharp library for WebP conversion
- Added file size validation (2MB) client + server
- Avatar displays with fallback to initials if no upload
- Stored as base64 data URI in database

**Manual Test:**
- Uploaded avatar via /dashboard/profile ✅
- Avatar displays correctly ✅
- Large file rejected ✅
- Invalid format rejected ✅

**Git Commits:**
- abc1234: feat: Add avatar upload API endpoint
- def5678: feat: Add Avatar display component
- ghi9012: feat: Integrate avatars in dashboard

**Next Stage:** Verifier to run full test suite
```

### Stage 4: Verifier
**Role:** Test thoroughly, catch edge cases, validate quality
**Time:** 15-45 minutes
**Output:** Test results + context pack v4.0

**Responsibilities:**
- Run Test Gates 2-4 (Code Quality, Testing, Performance)
- Test happy path + edge cases
- Check browser console for errors
- Validate API responses match contracts
- Check for regressions
- Update KNOWN_BUGS.md if issues found

**Success Criteria:**
- ≥90% of tests pass
- No P0/P1 bugs found (or documented with workarounds)
- Performance within targets
- Security review passed (if applicable)
- Context pack includes test results

**Example Output:**
```markdown
## Context Pack v4.0 - Verifier

**Test Results:**

Gate 2 (Code Quality): ✅ PASS
- TypeScript types: All typed correctly
- No console.logs left
- Functions well-named
- Comments added for image processing logic

Gate 3 (Testing): ✅ PASS (12/13)
- Avatar upload works ✅
- Avatar displays ✅
- File size limit enforced ✅
- Format validation works ✅
- Fallback to initials works ✅
- Mobile responsive ✅
- Cross-browser (Chrome/Safari) ✅
- Edge case: Special characters in filename ❌ (logged as P3-105)

Gate 4 (Performance): ✅ PASS
- Upload time: 1.2s for 1MB image (acceptable)
- Page load: No change from baseline
- Memory: No leaks detected

**Issues Found:**
🟢 P3-105: Filenames with special chars cause 500 error
- Workaround: Sanitize filename before upload
- Fix: Add to next sprint backlog

**Next Stage:** Release to deploy + document
```

### Stage 5: Release
**Role:** Deploy, document, create rollback plan, announce
**Time:** 10-20 minutes
**Output:** Deployed code + release notes

**Responsibilities:**
- Push code to production
- Update CHANGELOG.md
- Tag release (semantic versioning)
- Update user-facing docs
- Announce to users (if needed)
- Create rollback instructions
- Archive context packs

**Success Criteria:**
- Code deployed successfully
- Monitoring shows no errors
- Users notified (if user-facing)
- Rollback plan documented
- Context packs archived

**Example Output:**
```markdown
## Context Pack v5.0 - Release

**Deployment:**
- Branch: feat/user-avatars
- Commits: abc1234, def5678, ghi9012
- Deployed: 2026-02-18 16:30 UTC
- Tag: v1.2.0

**Rollback Plan:**
If avatars break dashboard:
1. Revert commits: git revert ghi9012 def5678 abc1234
2. Redeploy: git push origin main
3. ETA: 2 minutes

**Monitoring:**
- Dashboard load time: No change (0.4s avg)
- Error rate: 0% (no new errors)
- User feedback: Watching for 24h

**Announcement:**
Tweet: "🎉 New: Custom avatars on your Clawdet dashboard! Upload your profile pic in Settings."

**Context Pack Archive:**
Saved to: docs/context-packs/user-avatars/
- planner.md
- architect.md
- implementer.md
- verifier.md
- release.md
```

---

## Context Pack Handoffs

### Format (Strict)
```markdown
## Context Pack v{N}.0

**Stage:** {Previous Stage} → {Next Stage}
**Task ID:** {brief-identifier}
**Objective:** {1 sentence}

### Key Decisions (Max 5)
- Decision 1
- ...

### Critical Context (Max 5)
- Context 1
- ...

### Files Modified/Created
- file.ts (purpose)
- ...

### Next Stage Needs
- Requirement 1
- ...

### Success Criteria (Max 3)
1. Criteria 1
2. ...

### Rollback Plan (1 sentence)
How to undo this stage.
```

### Rules
1. **≤10 Total Bullets** across all sections
2. **≤2 Pages** when rendered
3. **No Code Snippets** - reference files instead
4. **Forward-Looking** - what next stage needs
5. **Version Incremented** - v1.0, v2.0, v3.0, v4.0, v5.0

---

## Parallel Work

For large tasks, stages can run in parallel:

```
         Planner
            │
         Architect
         /   │   \
        /    │    \
   Impl-A Impl-B Impl-C  (parallel implementers)
        \    │    /
         \   │   /
         Verifier
            │
          Release
```

**Example:** Adding 3 independent features
- Planner: Breaks into Feature A, B, C
- Architect: Designs all 3 interfaces
- Implementer-A: Codes Feature A
- Implementer-B: Codes Feature B (simultaneously)
- Implementer-C: Codes Feature C (simultaneously)
- Verifier: Tests all 3 together
- Release: Deploys bundle

**Benefits:**
- 3x faster than sequential
- Each implementer has focused context
- Verifier ensures integration works

---

## Agent Spawn Commands

### Spawn Planner
```javascript
sessions_spawn({
  task: `PLAN: ${userRequest}
  
Break into subtasks, estimate time, identify files.
Create Context Pack v1.0 following CONTEXT_PACK.md format.
Decide: single agent or multi-stage?`,
  label: "planner-{task-id}",
  model: "anthropic/claude-sonnet-4-5",
  runTimeoutSeconds: 900
});
```

### Spawn Architect
```javascript
sessions_spawn({
  task: `ARCHITECT: ${contextPackV1}
  
Make design decisions, document trade-offs.
Update Context Pack to v2.0.
Reference DECISIONS.md and API_CONTRACTS.md.`,
  label: "architect-{task-id}",
  model: "anthropic/claude-opus-4",  // Use Opus for design
  runTimeoutSeconds: 1800
});
```

### Spawn Implementer
```javascript
sessions_spawn({
  task: `IMPLEMENT: ${contextPackV2}
  
Write code following architectural decisions.
Self-review with TEST_GATES.md checklist.
Update Context Pack to v3.0.`,
  label: "implementer-{task-id}",
  model: "openai/gpt-4o",  // Good for coding
  runTimeoutSeconds: 7200
});
```

### Spawn Verifier
```javascript
sessions_spawn({
  task: `VERIFY: ${contextPackV3}
  
Run Test Gates 2-4 from TEST_GATES.md.
Test happy path + edge cases.
Update KNOWN_BUGS.md if issues found.
Update Context Pack to v4.0.`,
  label: "verifier-{task-id}",
  model: "anthropic/claude-sonnet-4-5",
  runTimeoutSeconds: 2700
});
```

### Spawn Release
```javascript
sessions_spawn({
  task: `RELEASE: ${contextPackV4}
  
Deploy code, update CHANGELOG.md, create rollback plan.
Archive context packs to docs/context-packs/{task-id}/.
Update Context Pack to v5.0 (final).`,
  label: "release-{task-id}",
  model: "anthropic/claude-sonnet-4-5",
  runTimeoutSeconds: 1200
});
```

---

## Benefits of This Workflow

1. **Context Stays Small**
   - Each agent sees 2 pages, not 100 messages
   - Faster processing, better focus

2. **Better Quality**
   - Specialized agents (design vs code vs test)
   - Formal gates catch issues early

3. **Audit Trail**
   - Chain of context packs shows decisions
   - Easy to review "why did we choose X?"

4. **Rollback Ready**
   - Each stage documents undo path
   - Can roll back to any stage

5. **Scalable**
   - Parallel implementers for large tasks
   - Add more stages as needed

6. **Training Material**
   - Context packs become examples
   - New contributors learn from archive

---

## Anti-Patterns to Avoid

❌ **Skipping Stages**
"This is simple, we don't need Planner"
→ Result: Scope creep, missed dependencies

❌ **Verbose Context Packs**
50 bullet points, 10 pages of context
→ Result: Next agent overwhelmed, misses key points

❌ **No Rollback Plan**
"We'll figure it out if it breaks"
→ Result: Panic when production fails

❌ **Implementer Makes Design Decisions**
"I'll just implement it my way"
→ Result: Technical debt, inconsistent patterns

❌ **Verifier Doesn't Test Edge Cases**
"Happy path works, ship it"
→ Result: Bugs in production, P0 incidents

---

## Success Metrics

Track these to validate workflow effectiveness:

- **Context Size:** Avg context pack size (target: <500 words)
- **Bug Rate:** Bugs per release (target: <0.5)
- **Cycle Time:** Planning → Release (target: <4h for medium tasks)
- **Rework Rate:** % of tasks requiring fixes post-release (target: <10%)
- **Agent Hand off Success:** % of clean handoffs (target: >95%)

---

## Future Enhancements

- **Automated Gate Execution:** CI/CD runs tests automatically
- **Context Pack Templates:** Pre-filled forms for common tasks
- **Agent Specialization:** Different models per stage (Opus for design, GPT-4o for code)
- **Parallel Verification:** Multiple verifiers test different aspects
- **Human-in-Loop:** RentAHuman for critical design decisions

---

## Related Docs

- [CONTEXT_PACK.md](./CONTEXT_PACK.md) - Context pack format spec
- [TEST_GATES.md](./TEST_GATES.md) - Quality gates checklist
- [DECISIONS.md](./DECISIONS.md) - Architectural decisions log
- [API_CONTRACTS.md](./API_CONTRACTS.md) - API interface specs
- [KNOWN_BUGS.md](./KNOWN_BUGS.md) - Issue tracking
