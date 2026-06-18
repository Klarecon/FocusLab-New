# FocusLab Project State

**Last updated:** 2026-06-18 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 13 complete — fixed 5 visual/data feedback items + 2 navigation bugs. Restored missing B/C zones, fixed quadrant label overlap, redesigned Payoff section, fixed analyzer navigation.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Content marketing + ad creative experience. First business plan. Working with Oren Yonash (methodology creator). Wants FAST autonomous execution, NO permission prompts. Values visual quality. Gets frustrated when working features regress — especially sensitive to this after Sessions 11-13.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `2ddd7e5 Fix: 'Start over' crash — remove localStorage.removeItem that broke persist middleware`
- Vercel deploy triggered manually via `npx vercel --prod` (auto-deploy webhook NOT connected — see gotchas)

## What's done in this session (2026-06-18, Session 13)

### 1. Fixed 5 feedback items from Mona's live app review

- **#1 ResultsView missing B & C zones** — Zone B ("Also eating your time") existed in code but Zone C was completely absent. Added Zone C section ("The small stuff") with compact list and descriptive subtitle.
- **#2 SolutionPicker missing B & C zones** — `FocusStage.tsx` was only passing `zone === "B"` to `usefulMany`. Fixed to include `zone === "B" || zone === "C"`. Split SolutionPicker into three collapsible sections: Zone A (always open), Zone B ("Also eating your time", open by default), Zone C ("The small stuff", collapsed by default).
- **#3 EVI Matrix quadrant label overlap** — Labels ("Pearls", "Oysters", etc.) were overlapping Y-axis tick labels. Repositioned all 4 labels inward: `left-[72px]` / `right-[40px]` instead of `left-12` / `right-8`.
- **#4 Oysters label incomplete** — Action Sequence said "Oysters — plan these next" but user's approved definition (Session 8) is "plan only after Pearls are done, if you have spare capacity". Fixed in `QUADRANT_SECTION_LABELS`.
- **#5 Payoff "What happens" section ugly** — Removed `Highlighter action="box"` that created an ugly red outline around the heading. Redesigned with clean orange top border, centered layout, stat pills in rounded background cards, and a separator before the closing statement.

### 2. Fixed 2 navigation bugs

- **Analyzer wiping data on revisit** — `AuditWizard.tsx` had a `useEffect` that called `reset()` + `localStorage.removeItem("focuslab-audit")` whenever you navigated to `/analyzer` with existing results. Changed to jump to step 4 (ResultsView) instead, so users can view their Pareto chart without losing everything.
- **"Start over" crash** — After the above fix, clicking "Start over with a fresh audit" crashed the page. Root cause: `localStorage.removeItem("focuslab-audit")` in `handleRestart` was yanking the persist storage from under Zustand's middleware. Removed it — `reset()` already sets defaults and the middleware persists them naturally.
- **Added "Back to Pareto results" link** on the Focus Table page header so users can navigate between tools.

### 3. Added 7 regression tests (279 total, was 272)
- `[S13-#1]` ResultsView has Zone B section
- `[S13-#1b]` ResultsView has Zone C section
- `[S13-#2]` FocusStage passes Zone C items to usefulMany
- `[S13-#2b]` SolutionPicker has Zone C collapsible section
- `[S13-#3]` EviMatrix quadrant labels positioned away from axis ticks
- `[S13-#4]` Oysters Action Sequence label includes spare capacity condition
- `[S13-#5]` Payoff "What happens" section has no Highlighter box

### 4. Provided scoring logic writeup
Mona asked for the quadrant scoring logic in plain language to share in writing. Provided the effort/impact 1–5 scale, the asymmetric split (effort ≤ 2 = low, impact ≥ 4 = strong), the four quadrants, and the SCORE_FROM_LEVEL defaults (low=2, med=3, high=4).

## What's next (for the NEXT Claude Code session to pick up)

### Visual items needing verification on deployed app:
1. **EVI quadrant label overlap** — improved but may still overlap at narrow viewport widths. Mona should check on her actual device.
2. **Payoff section redesign** — code verified, needs human eye confirmation on deployed app.
3. **Zone B/C sections** — verify they render on deployed app with real user data.

### Infrastructure:
4. **Vercel auto-deploy is broken** — GitHub webhook not connected to Klarecon/FocusLab-New repo. Must deploy manually via `npx vercel --prod`.
5. **Playwright chart rendering** — Recharts ResponsiveContainer reports width/height -1 in headless mode. Results chart screenshot may be incomplete.

### Remaining work from backlog:
6. Wire Playwright visual checks (`e2e/visual-checks.spec.ts`) into the mandatory verification pipeline
7. Calendar week visualization (not started)
8. Before/after comparison (not started)
9. Lottie animations (not started)
10. Shareable scorecard card (not started)
11. Landing page copy overhaul (not started)

## Decisions made (non-obvious choices)

### New in Session 13
- **Analyzer preserves results on revisit** — instead of wiping state when user navigates to /analyzer, we now jump to ResultsView. The "Start over" button is the only way to reset. This prevents accidental data loss.
- **No localStorage.removeItem in reset** — Zustand persist middleware handles storage writes automatically. Manually removing the key crashes the middleware. Let `reset()` do its job.
- **Zone C collapsed by default in SolutionPicker** — Zone A always open, Zone B open by default, Zone C collapsed. Keeps focus on what matters while still making all data accessible.
- **Oysters label uses shortened version** — QUADRANT_META verb is "Plan these only after your Pearls are done, and only if you have spare capacity" but the Action Sequence section header uses "plan only after Pearls are done, if you have spare capacity" (slightly shorter for a header context).

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
- **GTM plan status** — Mona and Oren haven't confirmed feedback on the v2 GTM plan from Session 10
- **Vercel auto-deploy** — Does Mona want to reconnect the GitHub integration in the Vercel dashboard? Otherwise Claude must manually deploy each push.

## Critical file paths

### Product/code files
```
src/components/analyzer/AuditWizard.tsx            — Wizard orchestrator — preserves results on revisit, clean reset
src/components/analyzer/IntakeStep.tsx              — Category estimation (Pass 1) — MIN_CATEGORIES=3, single sticky counter
src/components/analyzer/DrilldownStep.tsx           — Vital few drilldown (Pass 2) — single sticky counter, overflow blocking
src/components/analyzer/ResultsView.tsx             — Pareto chart + results — Zone A/B/C sections
src/components/focus/FocusStage.tsx                 — Focus page orchestrator — passes Zone B+C as usefulMany, "Back to results" link
src/components/focus/SolutionPicker.tsx             — Compact cards, Zone A/B/C sections, inline add-your-own, solution dedup
src/components/focus/FocusTable.tsx                 — Action Plan (Owner/Reclaim removed)
src/components/focus/EviMatrix.tsx                  — EVI Matrix + PriorityTable — quadrant labels repositioned, Oysters label fixed
src/components/focus/Payoff.tsx                     — Payoff section — redesigned "What happens" with clean layout
src/lib/data/waste-sources.ts                       — Waste source data (3 Code sources for software-dev)
src/lib/data/solutions.ts                           — Solution data (6 solutions for new sources)
src/lib/data/opportunity-frames.ts                  — Emotional opportunity copy
src/lib/engine/solutions-logic.ts                   — QUADRANT_META, payoff calculator, quadrant scoring logic
src/stores/audit-store.ts                           — Zustand store (clearFocusState added)
src/__tests__/feedback-regression.test.ts           — 97 cumulative regression tests (7 new in S13)
.claude/hooks/verify-done.sh                        — Pre-commit verification (11 checks)
e2e/capture-screens.spec.ts                         — Screenshot capture pipeline (24 screenshots)
e2e/visual-checks.spec.ts                           — Playwright structural checks
playwright.config.ts                                — Playwright configuration
vitest.config.ts                                    — Vitest config (excludes e2e/)
```

### Logs
```
Session Log/Session 13 — B+C Zones, Navigation, Payoff Redesign.md
Feedback Log/Session 13 - Feedback Log.md
```

### Memory files
```
~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/
```

## Known gotchas

- **Vercel auto-deploy NOT connected** — must run `npx vercel --prod` manually after pushing to GitHub. The Vercel-GitHub webhook is missing on the Klarecon repo.
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
- **Do NOT use localStorage.removeItem on Zustand persist keys** — crashes the middleware. Use `reset()` and let persist write defaults naturally.
- **Analyzer reset must NOT wipe on page load** — user expects to revisit /analyzer and see results. Only "Start over" button triggers reset.

## How to resume work
1. Read this file top to bottom
2. Read `Feedback Log/Session 13 - Feedback Log.md` for item status
3. Run `git status` and `git log --oneline -10` to confirm state
4. Run `npx vitest --run` — expect 279 tests passing
5. Run `npx tsc --noEmit` — expect zero errors (2 pre-existing warnings in test file regex flags)
6. For ANY visual/UI work: run `npx playwright test e2e/capture-screens.spec.ts` then READ screenshots in `e2e/screenshots/`
7. After pushing: run `npx vercel --prod` to deploy (auto-deploy not connected)
8. User wants autonomous execution — NEVER ask permissions, just do the work
9. Do NOT declare "done" without visual screenshot verification
10. TDD discipline: 279 tests must never regress
11. Do NOT make major methodology changes without asking
