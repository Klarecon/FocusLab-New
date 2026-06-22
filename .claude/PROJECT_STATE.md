# FocusLab Project State

**Last updated:** 2026-06-22 by Claude via /handover (Session 16)

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 16 complete (GTM/research only, NO code) — refined Oren's verbal investor pitch, produced competitor analysis (`GTM Plan/2026-06-22-competitor-analysis.html`), and advised on Hermes Agent vs Claude Code. NOTE: the Session 15 IntakeStep layout-shift fix IS committed (commit a64a45a) — the prior PROJECT_STATE wrongly said it was uncommitted.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Content marketing + ad creative experience. First business plan. Working with Oren Yonash (methodology creator). Wants FAST autonomous execution, NO permission prompts. Values visual quality. Gets frustrated when working features regress. Reports weekly to Oren on a call — needs to speak in data/metrics language. Has 2 content team members available (4 total, 2 on another project). Has basic Facebook ads experience. Starting GTM push June 22, 2026.

## Branch state
- On main, up to date with origin/main
- One uncommitted change: `src/components/analyzer/IntakeStep.tsx` (layout shift bug fix)
- Several untracked GTM Plan files (not committed — marketing docs, not code)
- Latest committed: `4c3e7eb Session 14 feedback log`

## What's done in this session (2026-06-22, Session 16) — GTM/research, NO code

Full detail in `Session Log/Session 16 — Investor Pitch, Competitor Analysis, Hermes Agent.md`.

1. **Refined Oren's investor pitch** — turned a written paragraph into a natural spoken version + a tighter elevator version. Lead with the human sting, stat second, close on "15 minutes, not four weeks."
2. **Competitor analysis** — created `GTM Plan/2026-06-22-competitor-analysis.html` (3 rings: Direct quiz tools / Adjacent trackers + schedulers / Substitutes coaching + DIY). Conclusion: no true twin; edge is the Pareto engine + ranked action plan.
3. **Hermes Agent advice** — explained Nous Research's local open-source agent; gave combined-use strategy (Claude Code = brain for high-stakes work; Hermes = private always-on intern for monitoring/batch/sensitive-data jobs). Recommended NOT switching mid-launch.

**No source code touched. Tests not run (none needed). Working tree is clean — nothing uncommitted.**

**Heads-up:** three untracked `2026-06-22-*` files in `GTM Plan/` (oren-deck, problem-why-now-slide, the-fix-slide) were NOT created in Session 16 — likely a parallel session.

---

## What was done in Session 15 (2026-06-20)

### 1. Layout shift bug fix (Reddit feedback)
- **File:** `src/components/analyzer/IntakeStep.tsx`, lines 182-198
- **Bug:** The sticky floating counter ("X hrs/week of waste flagged") was conditionally rendered with `{totalEstimated > 0 && ...}`. When user clicked the up arrow on the first hours input, the counter popped into the DOM, pushing all cards down ~50px. The spinner arrow moved away from the cursor — user couldn't click it again without re-aiming.
- **Fix:** Counter is now always in the DOM with `opacity: 0` / `pointerEvents: none` when empty, fading to `opacity: 1` when hours are entered. No layout shift.
- **Visual explainer created:** `Feedback Log/Screenshots/layout-shift-bug-demo.html` — side-by-side before/after with toggle buttons
- **Tests:** All 279 tests pass. TypeScript clean (2 pre-existing warnings).

### 2. GTM Strategy — committed to Product-Led Growth
- **File:** `GTM Plan/2026-06-20-gtm-plg-strategy.html`
- Evaluated 3 motions (product-led, content/discovery-led, sales-led) against Mona's reality
- Committed to PLG as primary, content as traffic driver, coach track as side bet
- Added honest "Where You Actually Are" section — distinguishing builder feedback (Reddit vibe coding community) from target-user validation (not done yet)
- Defined paywall gate placement (after Pareto results, before Focus Table)
- 16-week roadmap sequenced around validation before scaling

### 3. Daily Execution Plan
- **File:** `GTM Plan/2026-06-20-daily-execution-plan.html`
- Day-by-day plan for weeks 1-2 with exact tasks, time allocations, who does what (Mona vs content team)
- Good day / bad day definition for each day
- Content team brief (hand to them day 1)
- Weeks 3-4 as repeating rhythm with escalations
- Oren reporting section with verbal script, 5 key numbers, weekly tracker table
- Daily cheat sheet (printable)
- "How does this make money" one-breath answer

### 4. Interactive Weekly Tracker
- **File:** `GTM Plan/tracker.html`
- Browser-based tracker with tabs for Weeks 1-4 + Month View
- Collapsible sections per channel (Website, LinkedIn, Reddit, Outreach, Facebook Ads, Blog)
- Auto-calculated totals, daily scorecard (good/bad + win/miss), Oren call prep with visual funnel
- Month View auto-pulls all 4 weeks into comparison table
- Auto-saves to localStorage, Export CSV button for dashboard creation
- Also created 4 Google Sheets (basic CSV format) but Mona found them too dated — the HTML tracker replaced them

### 5. Reddit feedback interpretation
- A vibe coding community member reported the layout shift bug — Mona had posted there for feedback (this was solicited, not organic discovery)
- Another commenter validated "debugging code you didn't write" as a waste source — agreement, not criticism
- Updated GTM docs to reflect that FocusLab is at pre-flywheel stage: builder feedback exists, target-user validation does not

## What's next (for the NEXT Claude Code session to pick up)

### Offered but not delivered in Session 16 (Mona can request):
- 10-second + 30-second versions of the Oren investor pitch
- Pricing + feature-gap deep-dive on Ring 1 quiz competitors (for a "why we win" slide)
- Draft spec for a first Hermes background task (weekly competitor-pricing monitor)

### Immediate (GTM execution started June 22):
1. **Connect custom domain to Vercel** — Mona has domains but hasn't connected them. Can't run ads to a .vercel.app URL.
2. **Build paywall gate on results page** — CTA after Pareto results, before Focus Table. This is the revenue mechanism.
3. **Set up Stripe checkout** — Payment Links for $29/mo and $199/yr.
4. **Add analytics** — Track landing page visits, analyzer starts, completions, gate views, Stripe clicks. GA4 or Plausible.
5. **Build landing page** — What Facebook ads and LinkedIn will point to. Currently no dedicated landing/marketing page.
6. **Privacy policy + terms** — Required before collecting data or running ads.

### Code fix to commit:
7. **Commit the IntakeStep layout shift fix** — currently modified but not committed.

### Infrastructure:
8. **Vercel auto-deploy is broken** — GitHub webhook not connected. Must deploy manually via `npx vercel --prod`.

### Backlog:
9. Calendar week visualization (not started)
10. Before/after comparison (not started)
11. Lottie animations (not started)
12. Shareable scorecard card (not started)
13. Landing page copy overhaul (not started)

## Decisions made (non-obvious choices)

### New in Session 15
- **Product-led growth is the primary GTM motion** — Not content-led, not sales-led. The free Pareto Analyzer is the salesperson. Content feeds it traffic. Coach tier is Oren's side bet.
- **Reddit feedback was solicited from builders, not organic** — Mona posted in a vibe coding community for feedback. This means target users (managers, team leads) haven't been tested yet. GTM plan reflects this as "pre-flywheel" stage.
- **Paywall gates after results, before Focus Table** — Peak emotional moment (seeing waste in dollars) is when willingness to pay is highest. Gating earlier kills the flywheel; gating later gives away the fix.
- **Layout shift fix uses opacity, not conditional rendering** — Counter stays in the DOM always. `opacity: 0` when empty, `opacity: 1` when filled. Prevents elements jumping when counter appears/disappears.
- **Interactive HTML tracker over Google Sheets** — CSV-to-Sheets has zero formatting. HTML tracker with localStorage persistence is more usable for Mona's daily workflow.
- **$500/mo Facebook ad budget** — Mona has basic FB ads experience. Ads drive to landing page. Don't spend until organic conversion rate is proven.
- **2 content team members allocated** — 4 total but 2 on another project. Person 1: blog writer (2 posts/week). Person 2: outreach support + content assets.
- **Weekly verbal reporting to Oren** — 5 key numbers (visitors, completions, gate views, reply rate, revenue). Oren cares about data/metrics language. Script provided in execution plan.

### Carried from previous sessions
- Two separate tools, not one flow: /analyzer finds problems, /focus solves them
- Static data, no database
- Hot pink reclaim (#c4186a) for all CTA, success, selected states. Green is BANNED.
- Plus Jakarta Sans body font. Hanken Grotesk BANNED.
- SCORE_FROM_LEVEL (low=2, med=3, high=4)
- Three-layer QA system: hooks + regression tests + evidence-based agent
- GitHub repo is PUBLIC at Klarecon/FocusLab-New
- Branch protection removed from main

## Open questions waiting on user
- **Domain connection** — Which domain is Mona connecting? She said "I have domains" but didn't specify.
- **Vercel auto-deploy** — Does Mona want to reconnect the GitHub integration?
- **Extend GTM plan to 3 months?** — Current plan covers 4 weeks (month 1). Mona was asked if she wants months 2-3 mapped out.
- **Commit the layout shift fix?** — Modified but not committed this session.

## Critical file paths

### Product/code files
```
src/components/analyzer/IntakeStep.tsx               — Layout shift fix (uncommitted)
src/components/analyzer/Stepper.tsx                  — Dual layout: mini dots (mobile) + full circles (desktop)
src/components/analyzer/AuditWizard.tsx              — Wizard orchestrator
src/components/analyzer/ResultsView.tsx              — Pareto chart + results — where paywall gate will go
src/components/focus/FocusStage.tsx                  — Focus page orchestrator
src/components/focus/EviMatrix.tsx                   — EVI Matrix + PriorityTable
src/stores/audit-store.ts                            — Zustand store
src/app/globals.css                                  — Design system
src/lib/engine/solutions-logic.ts                    — Core scoring logic
src/__tests__/feedback-regression.test.ts            — 97 cumulative regression tests
.claude/hooks/verify-done.sh                         — Pre-commit verification (11 checks)
```

### GTM files
```
GTM Plan/2026-06-20-gtm-plg-strategy.html           — PLG strategy doc (v3)
GTM Plan/2026-06-20-daily-execution-plan.html        — Day-by-day execution plan for month 1
GTM Plan/tracker.html                                — Interactive weekly tracker (localStorage + CSV export)
GTM Plan/2026-06-22-competitor-analysis.html         — Competitor map: 3 rings (direct/adjacent/substitute) [Session 16]
GTM Plan/2026-06-16-gtm-brief.html                   — Original GTM brief (presentation format)
Feedback Log/Screenshots/layout-shift-bug-demo.html  — Visual explainer of the layout shift bug
```

## Known gotchas

- **Vercel auto-deploy NOT connected** — must run `npx vercel --prod` manually after pushing.
- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email
- **`hoursPerDay` field is misnamed:** Stores weekly hours in DrilldownStep
- **GitHub repo is PUBLIC** — no secrets in code
- **Branch protection removed from main** — can push directly
- **Git remote is Klarecon org:** `https://github.com/Klarecon/FocusLab-New.git`
- **Recharts in headless Playwright** — ResponsiveContainer reports -1 width/height
- **Do NOT use localStorage.removeItem on Zustand persist keys** — crashes middleware
- **Analyzer reset must NOT wipe on page load** — only "Start over" triggers reset
- **`window.matchMedia` not available in Vitest/jsdom** — guard with typeof check
- **Mobile Safari ignores `min` on date inputs** — validate in JS onChange
- **GTM work goes in `/GTM Plan/`** — not in code folders. Mona runs GTM and code sessions in parallel.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Run `npx vitest --run` — expect 279 tests passing
4. Run `npx tsc --noEmit` — expect zero errors (2 pre-existing warnings in test file regex flags)
5. For ANY visual/UI work: run `npx playwright test e2e/capture-screens.spec.ts` then READ screenshots
6. After pushing: run `npx vercel --prod` to deploy (auto-deploy not connected)
7. User wants autonomous execution — NEVER ask permissions, just do the work
8. Do NOT declare "done" without visual screenshot verification
9. TDD discipline: 279 tests must never regress
10. Do NOT make major methodology changes without asking
11. GTM execution starts June 22 — next code session may need paywall gate, Stripe, analytics, landing page
