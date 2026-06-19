# FocusLab Project State

**Last updated:** 2026-06-19 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 14 complete — full mobile optimization (375px+) across all routes + past-date validation fix on action plan.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Content marketing + ad creative experience. First business plan. Working with Oren Yonash (methodology creator). Wants FAST autonomous execution, NO permission prompts. Values visual quality. Gets frustrated when working features regress. Prefers HTML mockups for visual design decisions (used in this session for stepper options).

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `c1baaaa Fix: block past dates on action plan due date picker`
- Previous: `9a888db Mobile optimization: full app responsive for 375px+ viewports`
- Vercel deploy triggered manually via `npx vercel --prod` (auto-deploy webhook NOT connected — see gotchas)

## What's done in this session (2026-06-19, Session 14)

### 1. Full mobile optimization — 375px+ viewport support

Made every route (landing, analyzer wizard, focus table) responsive for mobile devices. All changes are additive Tailwind responsive classes that only activate below the `sm:` breakpoint (640px). Desktop experience is completely unchanged.

**New files:**
- `src/hooks/useIsMobile.ts` — React hook using `window.matchMedia` for chart components that need JS-level responsiveness. Guards against missing `matchMedia` in test environments.

**Global changes (`globals.css`):**
- Added `overflow-x: hidden` on `html` to prevent horizontal scroll on mobile
- Added mobile media query (`max-width: 639px`) reducing body font to 16px and h1-h4 sizes

**Stepper (Option C — mini dots):**
- Mona chose mini dots from 3 HTML mockup options (A: compact horizontal, B: progress bar, C: mini dots)
- Mobile: small dots with current step name below. Desktop: full circles with connectors (unchanged)
- Both layouts render in same component, toggled by `sm:hidden` / `hidden sm:flex`

**Landing page:**
- Hero: smaller heading (`text-3xl` base), tighter padding, smaller CTA button
- ToolCards: `p-5 sm:p-10` responsive padding
- BenchmarkProof: `p-4 sm:p-6` on stat cards
- RoleLenses: `p-4 sm:p-7` on role cards

**Analyzer wizard:**
- RoleStep: level buttons stack vertically on mobile (`grid-cols-1 sm:grid-cols-3`), tighter card padding
- ContextStep: day buttons wrap (`flex-wrap`), tighter card padding
- DrilldownStep: wrapping badge layout (`flex-wrap gap-2`), tighter cards
- WeighStep: wrapping source headers, compact sticky panel
- ResultsView: chart height 300px (vs 420px desktop), tighter margins, responsive reveal text sizes, tighter zone cards

**Focus table:**
- FocusStage: compact tabs (`text-xs sm:text-sm`, tighter padding)
- SolutionPicker: tighter drain cards, compact bottom bar
- FocusTable: larger touch targets on dot ratings (w-7 mobile vs w-6 desktop), tighter card padding
- EviMatrix: chart height 280px (vs 400px desktop), quadrant labels hidden on mobile, stacked score editor, tighter PriorityTable padding
- Payoff: removed `min-w-[180px]` overflow on mobile, responsive stat numbers (`text-3xl sm:text-5xl`)

### 2. Fixed past-date bug on action plan

- Mobile Safari ignores the `min` attribute on `<input type="date">`, allowing past dates
- Added JS validation in the `onChange` handler to reject dates before today

### 3. Design artifacts created

- `docs/superpowers/specs/stepper-mobile-options.html` — interactive mockup of 3 stepper options (Mona chose C)
- `docs/superpowers/specs/2026-06-19-mobile-optimization-design.md` — approved design spec
- `docs/superpowers/plans/2026-06-19-mobile-optimization.md` — 16-task implementation plan

## What's next (for the NEXT Claude Code session to pick up)

### Mobile visual verification (Mona has seen on device, said "it looks okay"):
1. Mona confirmed mobile looks acceptable — no specific feedback items raised except the past-date bug (fixed)

### Infrastructure:
2. **Vercel auto-deploy is broken** — GitHub webhook not connected to Klarecon/FocusLab-New repo. Must deploy manually via `npx vercel --prod`.
3. **Playwright chart rendering** — Recharts ResponsiveContainer reports width/height -1 in headless mode. Chart screenshots may be incomplete.

### Remaining work from backlog:
4. Wire Playwright visual checks (`e2e/visual-checks.spec.ts`) into the mandatory verification pipeline
5. Calendar week visualization (not started)
6. Before/after comparison (not started)
7. Lottie animations (not started)
8. Shareable scorecard card (not started)
9. Landing page copy overhaul (not started)
10. Mobile-specific Playwright screenshots (currently only captures at 1280px desktop width)

## Decisions made (non-obvious choices)

### New in Session 14
- **Stepper Option C (mini dots) on mobile** — Mona picked this from an HTML mockup with 3 options. Uses CSS-only toggle (`sm:hidden` / `hidden sm:flex`) rather than JS breakpoint detection. Both mobile and desktop layouts render in the DOM; CSS hides the inactive one.
- **`useIsMobile` hook guards `window.matchMedia`** — Vitest/jsdom doesn't have `matchMedia`. The hook returns `false` (desktop) when `matchMedia` is unavailable, which is safe since tests run at desktop dimensions.
- **Charts use JS hook, everything else uses Tailwind** — Recharts needs numeric height/margin values, which can't be set via CSS classes. All other responsive changes are pure Tailwind responsive variants.
- **EVI quadrant labels hidden on mobile** — Too cramped at 280px chart height. The QuadrantSummary component below the chart still shows all quadrant names, so information isn't lost.
- **Date validation via JS, not HTML `min`** — Mobile Safari ignores `min` on date inputs. Added `onChange` guard that silently rejects past dates.
- **Inline execution over subagent-driven** — Chose sequential execution in one session over parallel subagents because of ordering dependencies (useIsMobile hook needed before chart tasks) and shared test suite. Higher reliability.

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
src/hooks/useIsMobile.ts                             — Mobile breakpoint hook (640px, guards matchMedia)
src/components/analyzer/Stepper.tsx                  — Dual layout: mini dots (mobile) + full circles (desktop)
src/components/analyzer/AuditWizard.tsx              — Wizard orchestrator — preserves results on revisit, clean reset
src/components/analyzer/IntakeStep.tsx               — Category estimation (Pass 1) — MIN_CATEGORIES=3, single sticky counter
src/components/analyzer/DrilldownStep.tsx             — Vital few drilldown (Pass 2) — single sticky counter, overflow blocking
src/components/analyzer/ResultsView.tsx              — Pareto chart + results — Zone A/B/C sections, adaptive chart height
src/components/focus/FocusStage.tsx                  — Focus page orchestrator — passes Zone B+C as usefulMany, compact tabs
src/components/focus/SolutionPicker.tsx              — Compact cards, Zone A/B/C sections, inline add-your-own, solution dedup
src/components/focus/FocusTable.tsx                  — Action Plan — larger touch targets on mobile
src/components/focus/EviMatrix.tsx                   — EVI Matrix + PriorityTable — adaptive chart, past-date validation, hidden labels on mobile
src/components/focus/Payoff.tsx                      — Payoff section — no min-width overflow on mobile
src/app/globals.css                                  — Design system + mobile font overrides
src/lib/engine/solutions-logic.ts                    — QUADRANT_META, payoff calculator, quadrant scoring logic
src/stores/audit-store.ts                            — Zustand store (clearFocusState added)
src/__tests__/feedback-regression.test.ts            — 97 cumulative regression tests
.claude/hooks/verify-done.sh                         — Pre-commit verification (11 checks)
e2e/capture-screens.spec.ts                          — Screenshot capture pipeline (24 screenshots)
```

### Design artifacts
```
docs/superpowers/specs/2026-06-19-mobile-optimization-design.md   — Approved mobile design spec
docs/superpowers/plans/2026-06-19-mobile-optimization.md          — 16-task implementation plan
docs/superpowers/specs/stepper-mobile-options.html                — HTML mockup of stepper options
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
- **`window.matchMedia` not available in Vitest/jsdom** — `useIsMobile` hook guards against this. If adding new hooks that use browser APIs, always guard with `typeof window === "undefined" || !window.X`.
- **Mobile Safari ignores `min` on date inputs** — must validate dates in JS `onChange`, not rely on HTML attributes alone.
- **EVI quadrant labels hidden on mobile** — they use `hidden sm:block`. The QuadrantSummary below the chart shows the same info.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Run `npx vitest --run` — expect 279 tests passing
4. Run `npx tsc --noEmit` — expect zero errors (2 pre-existing warnings in test file regex flags)
5. For ANY visual/UI work: run `npx playwright test e2e/capture-screens.spec.ts` then READ screenshots in `e2e/screenshots/`
6. After pushing: run `npx vercel --prod` to deploy (auto-deploy not connected)
7. User wants autonomous execution — NEVER ask permissions, just do the work
8. Do NOT declare "done" without visual screenshot verification
9. TDD discipline: 279 tests must never regress
10. Do NOT make major methodology changes without asking
11. Mobile optimization is done — all responsive classes are additive `sm:` variants. Desktop is untouched.
