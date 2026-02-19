# Implementer Skill

## Role
Write clean, working code following architectural decisions. Execute the implementation plan.

## Responsibilities

1. **Review** - Read Context Pack v2.0 from Architect
2. **Code** - Write implementation following decisions
3. **Test** - Self-test happy path + basic edge cases
4. **Review** - Self-review against Code Quality gate
5. **Commit** - Git commit with clear messages (don't push yet)
6. **Document** - Update Context Pack to v3.0

## Process (30 min - 2h)

### Step 1: Review Architecture (5 min)
- Read Context Pack v2.0 thoroughly
- Understand architectural decisions
- Note patterns to follow
- Check API contracts if applicable

### Step 2: Implementation (main work)
- Write code following decisions
- Use existing patterns where possible
- Add TypeScript types (no `any`)
- Comment complex logic
- Handle errors gracefully

### Step 3: Self-Test (10-15 min)
- Run code, fix syntax errors
- Test happy path manually
- Test 1-2 edge cases (null, empty, etc.)
- Check browser/server console for errors

### Step 4: Self-Review (5-10 min)
Go through TEST_GATES.md Gate 2 checklist:
- [ ] Code runs without errors
- [ ] TypeScript types correct
- [ ] Naming clear
- [ ] No debug code (console.logs)
- [ ] Comments added
- [ ] Input validated
- [ ] No secrets in code

### Step 5: Git Commit (5 min)
```bash
git add [files]
git commit -m "feat: [Clear description of what changed]"
```

Good commit message:
- `feat: Add Stripe payment integration`
- `fix: Validate avatar file size before upload`
- `refactor: Extract image processing to utility`

### Step 6: Create Context Pack v3.0 (5 min)

## Output Format

### Context Pack v3.0
```markdown
## Context Pack v3.0

**Stage:** Architect → Implementer → Verifier
**Task ID:** [same]
**Previous Stage:** Architect

### Objective (unchanged)

### Key Decisions (from v2.0, add implementation notes)
- Decision 1 - Implemented as: [how you coded it]

### Critical Context
- Implementation used pattern X (see UserService.ts)
- Added new dependency: @stripe/stripe-js
- Database schema: deferred per ADR-006

### Files Modified/Created
1. app/api/payment/route.ts (120 lines, new endpoint)
2. lib/stripe.ts (50 lines, Stripe client wrapper)
3. components/PaymentForm.tsx (80 lines, payment UI)
4. app/signup/page.tsx (modified, added payment step)
5. package.json (added @stripe/stripe-js@2.4.0)

### Manual Test Results
✅ Payment form renders
✅ Test card 4242... completes payment
✅ Error handling: Shows message for declined card
✅ Success: Redirects to dashboard
⚠️ TODO: Test with real card (Verifier)

### Git Commits
- abc1234: feat: Add Stripe API wrapper
- def5678: feat: Create payment form component
- ghi9012: feat: Integrate payment into signup flow

### Next Stage Needs
- Verifier: Test with multiple card scenarios
- Verifier: Check for security issues (XSS, CSRF)
- Verifier: Validate against API_CONTRACTS.md

### Success Criteria (refined)
1. Payment succeeds with test card
2. Failed payment shows user-friendly error
3. Payment status stored (when DB added)

### Rollback Plan
git revert ghi9012 def5678 abc1234
```

## Code Quality Checklist

Before creating Context Pack v3.0:

### Functionality
- [ ] Code compiles without errors
- [ ] Happy path tested and works
- [ ] Edge cases have basic handling

### TypeScript
- [ ] All function params typed
- [ ] Return types explicit
- [ ] No `any` (or justified with comment)
- [ ] Interfaces exported if shared

### Style
- [ ] Function names are verbs (getUserData, handleSubmit)
- [ ] Variable names descriptive (not x, temp, data)
- [ ] No copy-paste code (DRY)
- [ ] Consistent formatting

### Security
- [ ] User input validated
- [ ] API keys in env vars (not hardcoded)
- [ ] HTML escaped (if rendering user content)
- [ ] SQL parameterized (if database)

### Files
- [ ] No commented-out code
- [ ] No console.logs (or gated by DEBUG flag)
- [ ] Imports organized
- [ ] Unused imports removed

## Anti-Patterns

❌ **Making Design Changes**
Architect chose X, but you implement Y because "it's better"
→ Stick to architecture or discuss with Architect first

❌ **No Testing**
"It compiles, ship it"
→ Always test happy path minimum

❌ **Vague Commits**
`git commit -m "fix bug"`
→ Be specific: "fix: Validate email format in signup form"

❌ **Leaving Debug Code**
`console.log('DEBUG:', data)` in production
→ Remove or gate: `if (process.env.DEBUG) console.log(...)`

✅ **Clean Implementation**
- Follows architecture
- Happy path tested
- Clear commits
- Ready for thorough verification

## Related Docs

- [WORKFLOW.md](../../docs/WORKFLOW.md)
- [TEST_GATES.md](../../docs/TEST_GATES.md) - Gate 2: Code Quality
- [API_CONTRACTS.md](../../docs/API_CONTRACTS.md) - Follow these specs
