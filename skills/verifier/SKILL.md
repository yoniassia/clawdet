# Verifier Skill

## Role
Test thoroughly, catch bugs before production, validate quality gates.

## Responsibilities

1. **Review** - Read Context Pack v3.0 from Implementer
2. **Test** - Run comprehensive tests (Gates 2-4)
3. **Document** - Log all issues found
4. **Triage** - Classify bugs (P0/P1/P2/P3)
5. **Update** - Add bugs to KNOWN_BUGS.md
6. **Decide** - Pass (≥90%) or Fail (block deployment)
7. **Handoff** - Update Context Pack to v4.0

## Process (15-45 min)

### Step 1: Setup (5 min)
- Read Context Pack v3.0
- Checkout the branch/commits
- Build/compile code
- Understand success criteria

### Step 2: Run Test Gates (20-30 min)

#### Gate 2: Code Quality Review
From TEST_GATES.md, check:
- [ ] TypeScript types correct
- [ ] Naming clear
- [ ] No debug code
- [ ] Security: input validated, no secrets

#### Gate 3: Testing
- [ ] **Happy Path:** Primary use case works
- [ ] **Edge Cases:** Null, empty, max values
- [ ] **Integration:** External APIs work
- [ ] **UI/UX:** Loads correctly, responsive
- [ ] **Regression:** Old features still work

#### Gate 4: Performance
- [ ] **Load Time:** <2s initial page load
- [ ] **API Response:** <500ms for most calls
- [ ] **Memory:** No leaks in 5-10 min test
- [ ] **Resources:** CPU/memory reasonable

### Step 3: Document Issues (5-10 min)
For each bug found:
```markdown
### 🔴 P0-XXX: [Title]
**Component:** [Where]
**Reproduce:** Steps
**Expected:** What should happen
**Actual:** What happens
**Impact:** Who's affected
**Workaround:** (if any)
```

Severity:
- **P0:** Blocks deployment (core broken)
- **P1:** Major but has workaround
- **P2:** Quality issue
- **P3:** Nice-to-have

### Step 4: Update KNOWN_BUGS.md (5 min)
Add all P0/P1 issues to KNOWN_BUGS.md

### Step 5: Decision (2 min)
- **Pass:** ≥90% tests pass, no P0 bugs
- **Fail:** <90% pass or P0 bugs exist

If FAIL:
- Send back to Implementer with bug list
- Implementer fixes → Re-run verification

### Step 6: Create Context Pack v4.0 (5 min)

## Output Format

### Context Pack v4.0 (if PASS)
```markdown
## Context Pack v4.0

**Stage:** Implementer → Verifier → Release
**Task ID:** [same]
**Previous Stage:** Implementer

### Objective (unchanged)

### Test Results Summary
- **Gate 2 (Code Quality):** ✅ PASS (8/8 checks)
- **Gate 3 (Testing):** ✅ PASS (15/16 tests)
- **Gate 4 (Performance):** ✅ PASS (all metrics green)
- **Overall:** ✅ PASS (94% pass rate)

### Tests Run
**Happy Path (5/5):**
✅ Payment form renders
✅ Test card completes payment
✅ Success redirects to dashboard
✅ Receipt email sent (mocked)
✅ Payment status updated

**Edge Cases (8/9):**
✅ Declined card shows error
✅ Invalid card number rejected
✅ Expired card rejected
✅ Empty form validates
✅ Network timeout handled
✅ Duplicate payment prevented
✅ Back button during payment works
✅ Refresh during payment safe
❌ Special chars in name field (BUG-XXX)

**Integration (2/2):**
✅ Stripe API called correctly
✅ Webhook receives event (mocked)

### Issues Found
🟢 **P3-XXX:** Special characters in name cause 500 error
- Workaround: Sanitize input client-side
- Fix: Add server-side validation
- Added to KNOWN_BUGS.md
- Not blocking (rare edge case)

### Performance Results
- Page load: 0.8s (target <2s) ✅
- API response: 320ms avg (target <500ms) ✅
- Memory: Stable over 10 min ✅

### Next Stage Needs
- Release: Deploy with known P3 bug
- Release: Monitor Stripe webhooks in production
- Release: Document rollback (revert 3 commits)

### Success Criteria (validated)
1. ✅ Payment succeeds with test card
2. ✅ Failed payment shows friendly error
3. ⚠️ Payment status stored (deferred to DB migration)

### Rollback Plan (unchanged from v3.0)
```

### Context Pack v4.0 (if FAIL)
```markdown
## Context Pack v4.0

**Stage:** Implementer → Verifier → BACK TO IMPLEMENTER
**Task ID:** [same]
**Previous Stage:** Implementer

### VERIFICATION FAILED

**Test Results:** ❌ FAIL (58% pass rate)

### Blocking Issues

🔴 **P0-XXX:** Payment succeeds but user not redirected
- **Reproduce:** Complete payment with 4242 card
- **Expected:** Redirect to /dashboard
- **Actual:** Stuck on payment page
- **Impact:** 100% of users can't proceed
- **Workaround:** None

🔴 **P0-YYY:** Stripe API key missing in production
- **Reproduce:** Deploy to prod, attempt payment
- **Expected:** Payment processes
- **Actual:** 500 error, "STRIPE_SECRET_KEY undefined"
- **Impact:** All payments fail

### Fix Required
Implementer must fix P0 bugs before re-verification.

### Tests Run (for reference)
[Detailed test log...]

**Next Action:** Implementer to fix P0 bugs, then re-run verification.
```

## Test Strategies

### For Backend APIs
```bash
# Happy path
curl -X POST /api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"valid": "data"}'

# Edge cases
curl -X POST /api/endpoint -d '{}'  # Empty
curl -X POST /api/endpoint -d '{"invalid": null}'  # Null
curl -X POST /api/endpoint -d '{"huge": "...'  # Large payload
```

### For Frontend
1. **Manual Testing:**
   - Open in browser
   - Try happy path
   - Try edge cases (empty form, spam click, etc.)
   - Check browser console for errors
   - Test mobile (DevTools responsive mode)

2. **Automated (if suite exists):**
   ```bash
   npm test
   npm run test:e2e
   ```

### For Performance
```bash
# Page load time
curl -w "@curl-format.txt" -o /dev/null -s https://site.com/

# Memory leak detection
# Open DevTools → Memory → Take snapshot
# Use feature for 5 min
# Take another snapshot → Compare
```

## Anti-Patterns

❌ **Only Testing Happy Path**
"It works when I do it right"
→ Test edge cases, users won't always do it right

❌ **Ignoring Minor Bugs**
"That's just a small visual glitch"
→ Document all bugs, let Release decide priority

❌ **No Performance Testing**
"Seems fast enough"
→ Measure, don't guess

❌ **Passing with P0 Bugs**
"We'll fix it later"
→ P0 = blocker, must fix before deploy

✅ **Thorough Testing**
- Happy + edge cases tested
- All bugs documented with severity
- Performance measured
- Clear pass/fail decision

## Related Docs

- [WORKFLOW.md](../../docs/WORKFLOW.md)
- [TEST_GATES.md](../../docs/TEST_GATES.md) - Gates 2, 3, 4
- [KNOWN_BUGS.md](../../docs/KNOWN_BUGS.md) - Add bugs here
