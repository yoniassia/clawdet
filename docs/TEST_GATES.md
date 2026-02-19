# Test Gates & Quality Checklist

## Purpose
Mandatory quality gates that must pass before proceeding to the next workflow stage or deploying to production.

---

## Gate 1: Architecture Review

**When:** After Planner → Before Architect starts implementation design
**Owner:** Architect role
**Time:** 5-10 minutes

### Checklist

- [ ] **Scope Clear** - Objective is measurable and specific
- [ ] **Complexity Assessed** - Est. time reasonable (<2h single agent, >2h multi-stage)
- [ ] **Dependencies Identified** - All external services/APIs/files known
- [ ] **Breaking Changes Flagged** - API changes, schema migrations noted
- [ ] **Rollback Considered** - How to undo if it goes wrong

### Exit Criteria
- Context pack created with ≤10 bullets
- No "TBD" or "figure out later" items
- Architect accepts scope and estimates

---

## Gate 2: Code Quality Review

**When:** After Implementer → Before Verifier
**Owner:** Implementer (self-review) + Verifier (peer review)
**Time:** 10-15 minutes

### Checklist

#### Functionality
- [ ] **Code Runs** - No syntax errors, imports resolve
- [ ] **Happy Path Works** - Primary use case succeeds
- [ ] **Edge Cases Handled** - Null checks, error handling present
- [ ] **No Obvious Bugs** - Logic errors caught in review

#### Style & Maintainability
- [ ] **TypeScript Types** - No `any` without justification
- [ ] **Naming Clear** - Functions/variables explain purpose
- [ ] **DRY Principle** - No copy-paste code blocks
- [ ] **Comments Where Needed** - Complex logic explained
- [ ] **No Debug Code** - console.logs removed (or in if(DEBUG))

#### Security
- [ ] **Input Validated** - User input sanitized
- [ ] **No Secrets in Code** - API keys in env vars
- [ ] **XSS Prevention** - HTML escaped where needed
- [ ] **SQL Injection Safe** - Parameterized queries (if DB)

#### Files
- [ ] **Tests Updated** - If test suite exists
- [ ] **Docs Updated** - README/API docs reflect changes
- [ ] **Types Exported** - If library/shared code

### Exit Criteria
- All ✅ checked or justification for skip
- Code committed to git (not pushed yet)
- Verifier can reproduce build/run

---

## Gate 3: Test Review

**When:** After Verifier tests → Before Release
**Owner:** Verifier role
**Time:** 15-30 minutes

### Test Levels

#### Unit Tests (if applicable)
- [ ] **New Code Covered** - ≥80% line coverage for new functions
- [ ] **Edge Cases Tested** - Null, empty, max values
- [ ] **Mocks Used** - External services mocked

#### Integration Tests
- [ ] **API Endpoints Work** - Curl tests pass
- [ ] **Database Ops Work** - CRUD operations succeed (if DB)
- [ ] **Third-Party APIs** - Real calls work (not mocked)

#### End-to-End Tests
- [ ] **User Flow Works** - Signup → provision → chat
- [ ] **UI Loads Correctly** - No console errors
- [ ] **Mobile Responsive** - Test on phone or DevTools
- [ ] **Cross-Browser** - Chrome + Safari/Firefox (if web)

#### Performance Tests
- [ ] **Page Load <2s** - Initial render fast
- [ ] **API Response <500ms** - Most endpoints quick
- [ ] **Memory Stable** - No leaks in 5min test
- [ ] **No N+1 Queries** - Database efficient (if DB)

### Regression Tests
- [ ] **Old Features Still Work** - Smoke test core flows
- [ ] **No New Console Errors** - Browser/server logs clean
- [ ] **Existing Tests Pass** - CI green (if set up)

### Exit Criteria
- ≥90% of applicable tests pass
- Any failures documented in KNOWN_BUGS.md with workarounds
- Test results saved (screenshots, logs, curl outputs)

---

## Gate 4: Performance Review

**When:** After Verifier → Before Release (parallel with Test Gate 3)
**Owner:** Verifier + Architect
**Time:** 10-15 minutes

### Checklist

#### Response Time
- [ ] **Initial Load** - First page <2s
- [ ] **Subsequent Loads** - Cached assets used
- [ ] **API Calls** - 95th percentile <500ms
- [ ] **Database Queries** - No queries >100ms (if DB)

#### Resource Usage
- [ ] **Memory** - No leaks in 10min test
- [ ] **CPU** - Stays <50% under normal load
- [ ] **Disk** - No unbounded log growth
- [ ] **Network** - No chatty APIs (batching used)

#### Scalability
- [ ] **Concurrent Users** - Handles 10 simultaneous users (if web)
- [ ] **Rate Limiting** - Implemented where needed
- [ ] **Graceful Degradation** - Works with slow network

#### Cost
- [ ] **API Calls Reasonable** - Not burning $$ on test
- [ ] **Token Usage** - LLM calls efficient (prompt caching used)
- [ ] **VPS Resources** - Fits in allocated instance size

### Exit Criteria
- No performance regressions vs previous version
- Meets targets: <2s load, <500ms API, <50% CPU
- Any degradations documented with justification

---

## Gate 5: Release Approval

**When:** After all Gates 1-4 pass → Before deploy to production
**Owner:** Release role (or human approval)
**Time:** 5 minutes

### Checklist

#### Documentation
- [ ] **CHANGELOG.md Updated** - User-facing changes noted
- [ ] **Context Pack Committed** - docs/context-packs/{task-id}/
- [ ] **DECISIONS.md Updated** - If architectural choice made
- [ ] **KNOWN_BUGS.md Updated** - Any new issues logged

#### Git
- [ ] **Code Committed** - All changes in git
- [ ] **Commit Message Clear** - Explains "why"
- [ ] **Branch Clean** - No uncommitted files
- [ ] **Tag Created** - Semantic version tag (if release)

#### Deployment
- [ ] **Rollback Plan Documented** - How to undo
- [ ] **Deployment Checklist** - Steps to deploy written
- [ ] **Monitoring Set Up** - Know how to check if live
- [ ] **Stakeholder Notified** - If user-facing change

#### Risk Assessment
- [ ] **Impact Assessed** - Low/Medium/High risk rating
- [ ] **Mitigation in Place** - For medium/high risk items
- [ ] **Backup Taken** - If database/config changes
- [ ] **Timing Appropriate** - Not Friday 5pm deploy

### Exit Criteria
- All gates 1-4 passed
- Human approval given (if required)
- Deploy timing acceptable
- Rollback plan ready

---

## Special Gates

### Security Gate (Trigger: Auth, Payments, User Data)

**When:** Any change touching authentication, payment processing, or user PII
**Owner:** Security-focused reviewer (or external audit)
**Time:** 30-60 minutes

#### Checklist
- [ ] **OWASP Top 10** - No SQL injection, XSS, CSRF, etc.
- [ ] **Secrets Management** - No keys in code or logs
- [ ] **Encryption** - Sensitive data encrypted at rest
- [ ] **Access Control** - Authorization checks present
- [ ] **Audit Trail** - Security events logged
- [ ] **Rate Limiting** - Brute force protection
- [ ] **Session Management** - Secure cookies, timeout set
- [ ] **Third-Party Review** - If high risk, external audit

### Data Migration Gate (Trigger: Schema Changes)

**When:** Any database schema change or data migration
**Owner:** Implementer + Verifier
**Time:** 30-60 minutes

#### Checklist
- [ ] **Migration Script Tested** - Dry run on staging data
- [ ] **Rollback Script Ready** - Can undo migration
- [ ] **Data Backup Taken** - Before migration runs
- [ ] **Downtime Estimated** - Users notified if needed
- [ ] **Validation Queries** - Check data integrity after
- [ ] **Old Code Compatible** - Works during migration window
- [ ] **Migration Idempotent** - Can run multiple times safely

---

## Gate Failure Handling

### If Gate Fails
1. **Document Issue** - Add to KNOWN_BUGS.md with severity
2. **Decide**: Fix now (blocker) or defer (workaround exists)
3. **If Blocker**: Implementer fixes → Re-run failed gate
4. **If Deferred**: Add TODO comment + GitHub issue
5. **Update Context Pack** - Note known issues for next stage

### Severity Levels
- **P0 (Blocker)** - Breaks core functionality, must fix before merge
- **P1 (Critical)** - Major bug but workaround exists, fix before deploy
- **P2 (Important)** - Quality issue, fix in next sprint
- **P3 (Nice-to-Have)** - Backlog item

---

## Automation Opportunities

Future improvements to reduce manual gates:
- CI/CD pipeline runs tests automatically on PR
- ESLint/Prettier enforces code style
- TypeScript strict mode catches type errors
- GitHub Actions runs security scans
- Lighthouse CI checks performance
- Automated deployment on merge to main

For now: **Manual checklist execution** with human verification.

---

## Example: Gate Execution Log

```markdown
## Test Gates Log: websocket-auth-fix

### Gate 1: Architecture Review ✅
- Reviewed 2026-02-18 14:50 UTC
- Scope: Add gateway token to WebSocket auth
- Complexity: Medium (1-2h)
- Breaking: No
- Rollback: Revert HTML to auth: {}
- Approved by: Architect

### Gate 2: Code Quality ✅
- Reviewed 2026-02-18 15:20 UTC
- Files: public/instance-landing-v3/index.html, scripts/provision-openclaw.sh
- TypeScript: N/A (HTML/bash)
- Security: Token in HTML acceptable (user's own instance)
- Approved by: Implementer + Verifier

### Gate 3: Test Review ✅
- Tested 2026-02-18 15:35 UTC
- Manual tests: WebSocket connection, browser console, gateway logs
- Result: Connection successful, no errors
- Coverage: 100% (only 1 code path)
- Approved by: Verifier

### Gate 4: Performance ✅
- Tested 2026-02-18 15:40 UTC
- Page load: 0.22s (target <2s) ✅
- Memory: No change from baseline
- CPU: No change from baseline
- Approved by: Verifier

### Gate 5: Release Approval ✅
- Approved 2026-02-18 15:45 UTC
- CHANGELOG: Updated
- Git commit: de7346f
- Rollback: Documented in WEBSOCKET-FIX-COMPLETE.md
- Risk: Low
- Deployed by: Release
```
