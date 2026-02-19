# Release Skill

## Role
Deploy to production, document changes, create rollback plan, announce to users.

## Responsibilities

1. **Review** - Read Context Pack v4.0 from Verifier
2. **Deploy** - Push code to production
3. **Document** - Update CHANGELOG.md, tag release
4. **Monitor** - Watch for errors in first hour
5. **Announce** - Notify users (if user-facing change)
6. **Archive** - Save context packs for future reference
7. **Handoff** - Update Context Pack to v5.0 (final)

## Process (10-20 min)

### Step 1: Pre-Deploy Checks (5 min)
- [ ] Verifier passed (≥90% tests, no P0 bugs)
- [ ] Context Pack v4.0 reviewed
- [ ] Git commits ready to push
- [ ] Rollback plan understood
- [ ] Timing appropriate (not Friday 5pm)

### Step 2: Deployment (5-10 min)

#### For Simple Deploys
```bash
# Push to main (triggers auto-deploy if CI/CD)
git push origin main

# Or manual deploy
git checkout main
git merge feature-branch
git push origin main
npm run build
pm2 restart app
```

#### For Complex Deploys
- Follow DEPLOYMENT-CHECKLIST.md if exists
- Database migrations first (if any)
- Deploy code second
- Run smoke tests third

### Step 3: Verification (5 min)
- [ ] Production site loads
- [ ] New feature visible/working
- [ ] No errors in logs
- [ ] Monitor dashboard green

### Step 4: Documentation (5 min)

#### Update CHANGELOG.md
```markdown
## [1.2.0] - 2026-02-18

### Added
- Payment processing via Stripe for paid tiers
- User can now upgrade from free to paid plan

### Fixed
- Loading spinner timing issue on dashboard

### Known Issues
- P3-XXX: Special characters in name field (workaround: avoid)
```

#### Tag Release
```bash
git tag v1.2.0
git push origin v1.2.0
```

### Step 5: Announce (optional, 5 min)
If user-facing change:
- Tweet from @clawdet
- Update /changelog page
- Email users (if mailing list)
- Discord/community announcement

### Step 6: Archive Context Packs (2 min)
```bash
mkdir -p docs/context-packs/TASK-ID/
cp /tmp/context-pack-planner.md docs/context-packs/TASK-ID/v1-planner.md
cp /tmp/context-pack-architect.md docs/context-packs/TASK-ID/v2-architect.md
cp /tmp/context-pack-implementer.md docs/context-packs/TASK-ID/v3-implementer.md
cp /tmp/context-pack-verifier.md docs/context-packs/TASK-ID/v4-verifier.md
git add docs/context-packs/
git commit -m "docs: Archive context packs for TASK-ID"
```

### Step 7: Create Context Pack v5.0 (final) (3 min)

## Output Format

### Context Pack v5.0 (Final)
```markdown
## Context Pack v5.0 (FINAL)

**Stage:** Verifier → Release → COMPLETE
**Task ID:** payment-integration
**Previous Stage:** Verifier

### Objective (achieved)
✅ Integrate Stripe for paid tiers after free beta.

### Deployment Summary
- **Date:** 2026-02-18 16:45 UTC
- **Branch:** feature/stripe-payment
- **Commits:** abc1234, def5678, ghi9012
- **Tag:** v1.2.0
- **Duration:** 8 minutes (deploy + verify)

### What Shipped
1. Stripe payment processing
2. Payment form UI component
3. Signup flow updated with payment step
4. Error handling for declined cards

### Files Deployed
- app/api/payment/route.ts (new, 120 lines)
- lib/stripe.ts (new, 50 lines)
- components/PaymentForm.tsx (new, 80 lines)
- app/signup/page.tsx (modified, +40 lines)
- package.json (+1 dependency: @stripe/stripe-js)

### Verification Results
- ✅ Production loads (1.2s)
- ✅ Payment form renders
- ✅ Test payment succeeds
- ✅ No errors in logs (first 5 minutes)

### Known Issues (Shipped With)
🟢 **P3-XXX:** Special chars in name field (rare, workaround exists)
- Added to KNOWN_BUGS.md
- Scheduled for next sprint

### Monitoring
- **Dashboard:** https://status.clawdet.com (green)
- **Logs:** pm2 logs clawdet-prod (no errors)
- **Metrics:** 0 payment failures in first hour

### Rollback Plan
**If payment breaks:**
1. `git revert ghi9012 def5678 abc1234`
2. `git push origin main`
3. `pm2 restart clawdet-prod`
4. ETA: 3 minutes to revert

**Rollback Tested:** ✅ Yes (dry run)

### User Communication
- Tweet: "🎉 Clawdet now supports paid plans! Upgrade at clawdet.com/upgrade"
- Email: Sent to beta waitlist (50 users)
- Discord: Announced in #announcements

### Context Pack Archive
Saved to: `docs/context-packs/payment-integration/`
- v1-planner.md (initial breakdown)
- v2-architect.md (Stripe decision rationale)
- v3-implementer.md (implementation details)
- v4-verifier.md (test results)
- v5-release.md (this file)

### Retrospective Notes
**What Went Well:**
- Clear context packs made handoffs smooth
- Verifier caught P3 bug before production
- Rollback plan gave confidence to deploy

**What Could Improve:**
- Forgot to test special chars (add to checklist)
- Architect could have considered more payment providers

**Action Items:**
- [ ] Add "test special chars" to verification checklist
- [ ] Document more payment providers in DECISIONS.md for reference

### Task Complete ✅
Payment integration deployed successfully. Monitoring for 24h.
```

## Rollback Execution

### When to Rollback
- P0 bug discovered in production
- Error rate >5%
- User-facing feature completely broken
- Security vulnerability

### How to Rollback
```bash
# Quick revert (if recent)
git revert <commit-hashes>
git push origin main
pm2 restart app

# Or rollback to tag
git checkout v1.1.0
git push origin main --force  # ⚠️ Use with caution
pm2 restart app

# Database migrations
# Run rollback SQL if schema changed
psql -d clawdet -f migrations/rollback-XXX.sql
```

### After Rollback
1. Announce: "Temporarily reverted feature X due to issue Y"
2. Document: Add to KNOWN_BUGS.md
3. Fix: Implementer fixes in new branch
4. Re-test: Verifier runs full suite
5. Re-deploy: Release tries again

## Monitoring Checklist

First hour after deploy:
- [ ] Check logs every 15 minutes
- [ ] Monitor error rates (should be <1%)
- [ ] Watch user feedback (support, Twitter, Discord)
- [ ] Test feature yourself periodically

First 24 hours:
- [ ] Check logs 3-4 times
- [ ] Review user reports
- [ ] Validate metrics (usage, performance)

After 24 hours:
- [ ] Write retrospective in Context Pack v5.0
- [ ] Update documentation if learned something
- [ ] Archive context packs
- [ ] Mark task as complete

## Anti-Patterns

❌ **Deploy and Disappear**
Push to production, close laptop, go to bed
→ Monitor for at least 1 hour after deploy

❌ **No Rollback Plan**
"We'll figure it out if it breaks"
→ Always have revert instructions ready

❌ **Silent Deploy**
User-facing feature ships, no announcement
→ Users don't know it exists, adoption = 0

❌ **No Tagging**
Just push to main, no version tag
→ Hard to rollback, unclear what version is live

✅ **Professional Release**
- Deployed with monitoring
- Users notified
- Rollback plan ready
- Context packs archived
- Lessons documented

## Related Docs

- [WORKFLOW.md](../../docs/WORKFLOW.md)
- [TEST_GATES.md](../../docs/TEST_GATES.md) - Gate 5: Release Approval
- [KNOWN_BUGS.md](../../docs/KNOWN_BUGS.md) - Document shipped issues
