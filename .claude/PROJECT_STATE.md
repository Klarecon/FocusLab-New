# FocusLab Project State

**Last updated:** 2026-06-17 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC — changed from private this session)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 11 complete — 29 feedback fixes across 2 rounds, Vercel reconnected, Playwright installed. 3 items remain broken.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Content marketing + ad creative experience. First business plan. Working with Oren Yonash (methodology creator). Wants FAST autonomous execution, NO permission prompts. Values visual quality. **EXTREMELY frustrated with repeated QA failures and the back-and-forth cycle.** Reviews deployed Vercel app. Prefers HTML pickers for options.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `06daf35 Session 11 round 2: 13 visual fixes from live app testing`
- Vercel now connected to `Klarecon/FocusLab-New` (was broken — connected to old `mona2611-alt` repo)

## What's done in this session (2026-06-17, Session 11)

### 1. Fixed 29 feedback items across 2 rounds
See `Feedback Log/Session 11 - Feedback Log.md` for the complete item-by-item list with status.

Key changes:
- SolutionPicker radically redesigned: compact single-row cards (checkbox + title only, no badges)
- FocusTable: Owner + Reclaim columns removed
- EviMatrix: proper HTML table, editable owner, QuadrantSummary removed, circle jitter + size variation
- Payoff: dramatically shortened, positive "after" framing, center-aligned
- ResultsView: hand-written short labels for chart axis, benchmark line removed
- DrilldownStep + IntakeStep: sticky floating counter (but has duplicate bug)
- Zustand: stale focus selections cleared on new analysis
- 3 new Code waste sources for software-dev + 6 solutions
- Opportunity frames rewritten with emotional copy

### 2. Fixed Vercel deployment pipeline
- Discovered Vercel was connected to old `mona2611-alt/FocusLab-New` (repo had been transferred to Klarecon org)
- Made repo public (Vercel Hobby plan requires public for org repos)
- Removed branch protection on main
- Reconnected Vercel to `Klarecon/FocusLab-New`
- Updated git remote URL

### 3. Installed Playwright
- `@playwright/test` installed as dev dependency
- Chromium browser installed
- `playwright.config.ts` created
- `e2e/visual-checks.spec.ts` with structural checks
- NOT yet running in CI or mandatory pipeline

### 4. Updated enforcement
- `verify-done.sh` Check 9: local HEAD must match origin/main (push verification)
- `verify-done.sh` Check 10: no crying emoji in SolutionPicker
- `verify-done.sh` Check 11: no "pre-built fixes" copy
- `vitest.config.ts` excludes e2e/ directory

### 5. Test count: 268 (was 253, +15 regression tests)

## What's next (for the NEXT Claude Code session to pick up)

### CRITICAL — Fix these 3 items FIRST before anything else:
1. **DUPLICATE STICKY COUNTERS** — both inline counter (in header) and sticky pill showing same number on IntakeStep (`src/components/analyzer/IntakeStep.tsx` ~line 179-197) and DrilldownStep (`src/components/analyzer/DrilldownStep.tsx` ~line 230-244). Remove the inline one, keep only the sticky pill.
2. **DRILLDOWN HOURS CAP** — `src/components/analyzer/DrilldownStep.tsx` — per-category detailed hours can exceed the category estimate. User entered 5hrs against 4hr estimate. Either hard-cap the input or block the "Show me the damage" button when any category exceeds its estimate.
3. **MIN_CATEGORIES too low** — `src/components/analyzer/IntakeStep.tsx` line 40: `const MIN_CATEGORIES = 2;` — change to 3. With only 2 categories the Pareto chart is a useless 2-bar chart.

### Then verify on deployed app:
4. Verify inline "add your own fix" renders under each drain section on the live site
5. Verify EVI quadrant labels don't overlap axis text at typical viewport widths
6. Verify sticky counter is only one instance, centered, readable

### Remaining work:
7. Wire Playwright tests into the mandatory verification pipeline
8. Run Playwright against local dev server before every "done" declaration
9. All visual items from Session 11 feedback log marked "NEEDS VISUAL VERIFICATION"

## Decisions made (non-obvious choices)

### New in Session 11
- **GitHub repo is now PUBLIC** at Klarecon/FocusLab-New — required for Vercel Hobby plan with org repos. No secrets in code.
- **Branch protection removed from main** — was blocking deploys and adding friction for a single-developer project
- **Git remote changed** from `mona2611-alt/FocusLab-New` to `Klarecon/FocusLab-New`
- **SolutionPicker is now ultra-compact** — single row per solution: checkbox + title. ALL badges removed (Pearl, effort, impact). User demanded this after 10 rounds of "too much text."
- **QuadrantSummary section removed** — duplicated the Action Sequence table info
- **Benchmark line removed from results** — inconsistent across drains and produced confusing comparisons ("you're 16.4 hrs below")
- **Opportunity frame shortened** — only role-specific one-liner shown, no generic paragraph
- **Before/after card flipped to positive** — "after" now shows hours reclaimed + 😎, not "waste left" + sad emoji

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

## Open questions waiting on user
- **Has Mona verified ANY of the round 2 fixes on the live site?** She stopped reviewing after finding the duplicate counter and 2-bar chart issues.
- **Is the ultra-compact SolutionPicker (checkbox + title only) enough?** Or does she want SOME info like effort level back?
- **GTM plan status** — Mona and Oren haven't confirmed feedback on the v2 GTM plan from Session 10

## Critical file paths

### Product/code files
```
src/components/analyzer/IntakeStep.tsx           — Category-level estimation (Pass 1) — HAS DUPLICATE COUNTER BUG
src/components/analyzer/DrilldownStep.tsx         — Vital few drilldown (Pass 2) — HAS DUPLICATE COUNTER BUG + NO HOURS CAP
src/components/analyzer/ResultsView.tsx           — Pareto chart + results — SHORT_LABELS map
src/components/focus/SolutionPicker.tsx           — Compact cards, inline add-your-own, solution dedup
src/components/focus/FocusTable.tsx               — Action Plan (Owner/Reclaim removed)
src/components/focus/EviMatrix.tsx                — EVI Matrix + PriorityTable (proper table, no QuadrantSummary)
src/components/focus/Payoff.tsx                   — Shortened payoff, positive framing
src/lib/data/waste-sources.ts                     — Waste source data (3 new Code sources)
src/lib/data/solutions.ts                         — Solution data (6 new solutions)
src/lib/data/opportunity-frames.ts                — Emotional opportunity copy
src/lib/engine/solutions-logic.ts                 — QUADRANT_META, payoff calculator
src/stores/audit-store.ts                         — Zustand store (clearFocusState added)
src/__tests__/feedback-regression.test.ts         — 86 cumulative regression tests
.claude/hooks/verify-done.sh                      — Pre-commit verification (11 checks)
e2e/visual-checks.spec.ts                         — Playwright visual tests (not yet in CI)
playwright.config.ts                              — Playwright configuration
vitest.config.ts                                  — Vitest config (excludes e2e/)
```

### Logs
```
Session Log/Session 11 — Mona Feedback + Deploy Fix.md
Feedback Log/Session 11 - Feedback Log.md
```

### Memory files
```
~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/
```

## Known gotchas

- **DUPLICATE COUNTERS:** IntakeStep and DrilldownStep both show inline counter AND sticky counter. Remove the inline ones.
- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes
- **Unicode escapes:** `\uXXXX` in JSX renders as raw backslash. Use actual characters.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email
- **`hoursPerDay` field is misnamed:** Stores weekly hours in DrilldownStep
- **GitHub repo is PUBLIC** — no secrets in code, but be aware
- **Branch protection removed from main** — can push directly
- **Git remote is Klarecon org:** `https://github.com/Klarecon/FocusLab-New.git`
- **Playwright installed but NOT mandatory** — tests exist in e2e/ but aren't in the commit gate
- **User is extremely frustrated** — do NOT promise things without verifying on deployed app first. Do NOT say "PASS" based on grep. Actually look at what renders.
- **Parallel sessions:** Mona runs GTM planning and code sessions in parallel. GTM work goes in `/GTM Plan/`, code work stays in `src/`.

## How to resume work
1. Read this file top to bottom
2. Read `Feedback Log/Session 11 - Feedback Log.md` for complete item-by-item status
3. Run `git status` and `git log --oneline -10` to confirm state
4. **FIX THE 3 BROKEN ITEMS FIRST** (duplicate counters, hours cap, MIN_CATEGORIES)
5. Push and verify on deployed Vercel app before telling user anything
6. User wants autonomous execution — NEVER ask permissions, just do the work
7. Do NOT declare "done" until you've verified on the live app, not just grepped code
8. TDD discipline: 268 tests must never regress
9. Do NOT make major methodology changes without asking
