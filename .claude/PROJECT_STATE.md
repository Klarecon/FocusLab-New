# FocusLab Project State

**Last updated:** 2026-06-18 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 12 complete — fixed 3 broken items from Session 11, built visual verification pipeline using Playwright screenshots + multimodal review.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Content marketing + ad creative experience. First business plan. Working with Oren Yonash (methodology creator). Wants FAST autonomous execution, NO permission prompts. Values visual quality. Was extremely frustrated with Session 11 QA failures — demanded a method to visually verify changes before asking her to review.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `2e1354d Session 12: Fix 3 broken items + visual verification pipeline`
- Vercel deploy triggered manually via `vercel --prod` (auto-deploy webhook NOT connected — see gotchas)

## What's done in this session (2026-06-18, Session 12)

### 1. Fixed all 3 broken items from Session 11
- **Duplicate sticky counters** — removed inline `motion.div` counter from both IntakeStep (was lines 179-197) and DrilldownStep (was lines 252-266). Only the sticky pill counter remains.
- **DrilldownStep hours cap** — "Show me the damage" button is now **disabled** when any category's detailed hours exceed its estimate. Clear error message shown: "Detailed hours can't exceed your category estimate — reduce them to continue." Per-category warning now triggers at 100% (not 150%) with strong visual treatment (orange border + bold text).
- **MIN_CATEGORIES raised to 3** — was 2, which produced useless 2-bar Pareto charts.

### 2. Built visual verification pipeline
The core innovation of this session. Solves the recurring problem of code-level "PASS" while the user sees broken UI.

**How it works:**
1. `e2e/capture-screens.spec.ts` — Playwright test that navigates the entire app flow and captures ~24 screenshots
2. Screenshots saved to `e2e/screenshots/` (gitignored)
3. Claude reads the screenshots using multimodal Read tool and visually verifies changes
4. Only then declares "done"

**Screenshots captured across the full flow:**
- Landing page, role selection, context step
- IntakeStep: empty, filled, sticky counter while scrolling
- DrilldownStep: empty, filled, sticky counter, overflow warning with disabled button
- Results: chart + cost breakdown
- SolutionPicker: drains with fixes, selected state, add-your-own input
- Action Plan: fix cards with effort/impact
- EVI Matrix: scatter chart, Action Sequence table, reclaim section, before/after cards

**Verified all 3 fixes visually** by reviewing screenshots before declaring done.

### 3. Added 4 regression tests (272 total, was 268)
- `[S12-#1]` IntakeStep has no inline counter — only sticky
- `[S12-#2]` DrilldownStep has no inline counter — only sticky
- `[S12-#3]` DrilldownStep blocks button when category hours overflow
- `[S12-#4]` MIN_CATEGORIES is 3

### 4. Updated CLAUDE.md
- TDD Rule 5: Screenshot verification before done
- Definition of Done step 6: Playwright screenshot visual verification
- 3 new banned patterns: grep-only PASS, no-push declares, adding without removing

### 5. Updated .gitignore
- Added `e2e/screenshots/`, `test-results/`, `playwright-report/`

## What's next (for the NEXT Claude Code session to pick up)

### Visual items needing verification on deployed app:
1. **Inline "add your own fix"** — verify it renders under each drain section on the live site (code has InlineFix, needs human eye on deployed app)
2. **EVI quadrant label overlap** — may still overlap at certain viewport widths
3. **Sticky counter** — verify it's only one instance, centered, readable on the live site

### Infrastructure:
4. **Vercel auto-deploy is broken** — GitHub webhook not connected to Klarecon/FocusLab-New repo. Currently must deploy manually via `vercel --prod`. User should reconnect in Vercel dashboard, or Claude should always run `vercel --prod` after pushing.
5. **Playwright chart rendering** — Recharts ResponsiveContainer reports width/height -1 in headless mode. Results chart screenshot may be incomplete. Consider setting explicit pixel dimensions on the chart wrapper.

### Remaining work from backlog:
6. Wire Playwright visual checks (`e2e/visual-checks.spec.ts`) into the mandatory verification pipeline
7. All visual items from Session 11 feedback log marked "NEEDS VISUAL VERIFICATION" — use screenshot pipeline to verify
8. Calendar week visualization (not started)
9. Before/after comparison (not started)
10. Lottie animations (not started)
11. Shareable scorecard card (not started)
12. Landing page copy overhaul (not started)

## Decisions made (non-obvious choices)

### New in Session 12
- **Visual verification via Playwright + multimodal** — instead of trying to automate pixel-level checks, take screenshots and have Claude look at them. Pragmatic, works now, catches what grep never could.
- **Hard-block on overflow, not soft warning** — DrilldownStep disables the button entirely when hours exceed estimate. Previous approach (warning only) let users proceed with bad data.
- **MIN_CATEGORIES = 3** — enforced minimum so Pareto chart is meaningful. Was 2 before.
- **Manual Vercel deploy** — `vercel --prod` used because auto-deploy webhook isn't connected. Not ideal but works.

### Carried from previous sessions
- Two separate tools, not one flow: /analyzer finds problems, /focus solves them
- Static data, no database
- Hot pink reclaim (#c4186a) for all CTA, success, selected states. Green is BANNED.
- Plus Jakarta Sans body font. Hanken Grotesk BANNED.
- SCORE_FROM_LEVEL (low=2, med=3, high=4)
- No $50/hr fallback
- Agents must not make major methodology changes without asking
- Three-layer QA system: hooks + regression tests + evidence-based agent
- Specialist agents mandatory before "done"
- GitHub repo is PUBLIC at Klarecon/FocusLab-New
- Branch protection removed from main

## Open questions waiting on user
- **SolutionPicker format** — Is the ultra-compact layout (checkbox + title only) enough? Or does she want SOME info like effort level back?
- **GTM plan status** — Mona and Oren haven't confirmed feedback on the v2 GTM plan from Session 10
- **Vercel auto-deploy** — Does Mona want to reconnect the GitHub integration in the Vercel dashboard? Otherwise Claude must manually deploy each push.

## Critical file paths

### Product/code files
```
src/components/analyzer/IntakeStep.tsx           — Category estimation (Pass 1) — MIN_CATEGORIES=3, single sticky counter
src/components/analyzer/DrilldownStep.tsx         — Vital few drilldown (Pass 2) — single sticky counter, overflow blocking
src/components/analyzer/ResultsView.tsx           — Pareto chart + results — SHORT_LABELS map
src/components/focus/SolutionPicker.tsx           — Compact cards, inline add-your-own, solution dedup
src/components/focus/FocusTable.tsx               — Action Plan (Owner/Reclaim removed)
src/components/focus/EviMatrix.tsx                — EVI Matrix + PriorityTable (proper table, no QuadrantSummary)
src/components/focus/Payoff.tsx                   — Shortened payoff, positive framing
src/lib/data/waste-sources.ts                     — Waste source data (3 Code sources for software-dev)
src/lib/data/solutions.ts                         — Solution data (6 solutions for new sources)
src/lib/data/opportunity-frames.ts                — Emotional opportunity copy
src/lib/engine/solutions-logic.ts                 — QUADRANT_META, payoff calculator
src/stores/audit-store.ts                         — Zustand store (clearFocusState added)
src/__tests__/feedback-regression.test.ts         — 90 cumulative regression tests
.claude/hooks/verify-done.sh                      — Pre-commit verification (11 checks)
e2e/capture-screens.spec.ts                       — Screenshot capture pipeline (24 screenshots)
e2e/visual-checks.spec.ts                         — Playwright structural checks
playwright.config.ts                              — Playwright configuration
vitest.config.ts                                  — Vitest config (excludes e2e/)
```

### Logs
```
Session Log/Session 12 — Visual Verification Pipeline.md
Feedback Log/Session 12 - Feedback Log.md
Feedback Log/Session 11 - Feedback Log.md
```

### Memory files
```
~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/
```

## Known gotchas

- **Vercel auto-deploy NOT connected** — must run `vercel --prod` manually after pushing to GitHub. The Vercel-GitHub webhook is missing on the Klarecon repo.
- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes
- **Unicode escapes:** `\uXXXX` in JSX renders as raw backslash. Use actual characters.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email
- **`hoursPerDay` field is misnamed:** Stores weekly hours in DrilldownStep
- **GitHub repo is PUBLIC** — no secrets in code, but be aware
- **Branch protection removed from main** — can push directly
- **Git remote is Klarecon org:** `https://github.com/Klarecon/FocusLab-New.git`
- **Recharts in headless Playwright** — ResponsiveContainer reports -1 width/height. Chart screenshots may be incomplete. Set viewport to 1280x900 minimum.
- **SolutionPicker uses `button[aria-pressed]`** not checkboxes — Playwright tests must use `button[aria-pressed="false"]` to select solutions.
- **Parallel sessions:** Mona runs GTM planning and code sessions in parallel. GTM work goes in `/GTM Plan/`, code work stays in `src/`.

## How to resume work
1. Read this file top to bottom
2. Read `Feedback Log/Session 12 - Feedback Log.md` for item status
3. Run `git status` and `git log --oneline -10` to confirm state
4. Run `npx vitest --run` — expect 272 tests passing
5. Run `npx tsc --noEmit` — expect zero errors
6. For ANY visual/UI work: run `npx playwright test e2e/capture-screens.spec.ts` then READ screenshots in `e2e/screenshots/`
7. After pushing: run `vercel --prod` to deploy (auto-deploy not connected)
8. User wants autonomous execution — NEVER ask permissions, just do the work
9. Do NOT declare "done" without visual screenshot verification
10. TDD discipline: 272 tests must never regress
11. Do NOT make major methodology changes without asking
