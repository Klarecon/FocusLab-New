# Session 12 — Visual Verification Pipeline (2026-06-18)

## Summary
Mona opened the session frustrated with Session 11's QA failures — duplicate counters, no hours cap, useless 2-bar charts. Fixed all 3 broken items, then built a visual verification pipeline so Claude can see what the user sees before declaring "done." This is the key process improvement of this session.

## Timeline

### Phase 1: Session start + understanding the problem
- Read PROJECT_STATE.md, Session 11 feedback log, Session 11 session log
- Verified 268 tests passing, zero TS errors
- Mona asked: "how are you going to solve this and stop doing lousy work?"
- Identified the root cause: declaring "done" based on grep, not actual visual output

### Phase 2: Fixed 3 broken items (Engineer Agent)
1. **Duplicate counters** — removed inline `motion.div` counters from IntakeStep and DrilldownStep, kept only sticky pills
2. **Hours overflow** — added `hasOverflowCategory` check, disabled "Show me the damage" button when any category exceeds estimate, clear error message
3. **MIN_CATEGORIES** — changed from 2 to 3
4. Added 4 regression tests (272 total)
5. All tests passing, build clean

### Phase 3: Built visual verification pipeline
- Mona asked for a method to check what's on screen before making her review
- Built `e2e/capture-screens.spec.ts` — Playwright test navigates full app flow, captures ~24 screenshots
- First attempt failed: didn't understand wizard flow (button was disabled because role selection needs completing)
- Explored wizard step structure, learned RoleStep needs role + level before Continue enables
- Second attempt: fixed selectors, SolutionPicker uses `button[aria-pressed]` not checkboxes
- Successfully captures: landing, all wizard steps (empty + filled states), overflow warning, results, all Focus tabs
- Verified all 3 fixes visually by reading screenshots (multimodal)

### Phase 4: Formalized the process
- Updated CLAUDE.md: TDD Rule 5, Definition of Done step 6, 3 new banned patterns
- Updated .gitignore: e2e/screenshots/, test-results/, playwright-report/
- Saved memory: visual verification pipeline is mandatory for UI changes

### Phase 5: Deploy + verify
- Pushed commit `2e1354d` to origin/main
- Discovered Vercel auto-deploy webhook not connected (no webhooks on Klarecon repo)
- Manually deployed via `vercel --prod`
- Verified live site serving new code at focuslab-omega.vercel.app

## Commits this session
```
2e1354d Session 12: Fix 3 broken items + visual verification pipeline
```

## What was done

### Code changes
1. **IntakeStep.tsx**: Removed inline counter (motion.div with hrs/week counter in header area). Changed MIN_CATEGORIES from 2 to 3.
2. **DrilldownStep.tsx**: Removed inline counter. Added `hasOverflowCategory` check. Disabled "Show me the damage" when any category overflows. Per-category warning now fires at 100% (was 150%) with orange border. Clear error message at bottom.
3. **feedback-regression.test.ts**: 4 new tests — [S12-#1] through [S12-#4]
4. **capture-screens.spec.ts**: New file — full-flow screenshot capture (24 screenshots)
5. **CLAUDE.md**: Rule 5, DoD step 6, 3 banned patterns
6. **.gitignore**: Playwright artifacts

### Process changes
- Visual verification via Playwright screenshots + multimodal review is now mandatory
- CLAUDE.md updated with the new rules
- Memory saved for future sessions

### Test count: 272 (was 268, +4 regression tests)

## Key decisions
- **Screenshots + multimodal > automated pixel testing** — pragmatic approach that works now vs. complex visual regression tooling
- **Hard-block on overflow** — button disabled, not just a warning
- **Manual Vercel deploy** — `vercel --prod` because webhook isn't connected
- **MIN_CATEGORIES = 3** — prevents useless charts

## What's NOT fixed / needs attention next session
1. **Vercel auto-deploy** — webhook not connected, must deploy manually
2. **Recharts in headless** — chart may not render fully in Playwright screenshots (width/height -1)
3. **Visual items from Session 11** — inline add-your-own fix, EVI label overlap, sticky counter appearance all need human eye on deployed app
4. **SolutionPicker format question** — is checkbox + title only enough?

## Resume prompt
```
Read .claude/PROJECT_STATE.md and Feedback Log/Session 12 - Feedback Log.md FIRST.

Session 12 fixed the 3 broken items from Session 11 and built a visual verification
pipeline. 272 tests passing. Deployed via vercel --prod (auto-deploy not connected).

Key new process: after ANY visual change, run:
  npx playwright test e2e/capture-screens.spec.ts
Then READ the screenshots in e2e/screenshots/ before declaring done.

After pushing, always run: vercel --prod (auto-deploy webhook missing).
```
