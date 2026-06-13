# FocusLab Project State

**Last updated:** 2026-06-13 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 8 complete — Focus Table & EVI Matrix full rebuild + 18 feedback items. Deployed to Vercel. User has opened the deployed app but hasn't given follow-up feedback yet on the 18-item fixes.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution — absolutely NO permission prompts. Values visual quality highly. Expects TDD discipline. Reviews the deployed Vercel app, not localhost. Core methodology is off-limits for changes. Prefers options via interactive HTML pickers.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `caa3b20 Session 8: Focus Table feedback — 18 items across 3 phases`
- Session 8 commits (2 total):
  - `8a3ab0e` Focus Table & EVI Matrix rebuild: quadrant system, card layout, copy overhaul
  - `caa3b20` Session 8: Focus Table feedback — 18 items across 3 phases

## What's done in this session (2026-06-13, Session 8)

### 1. Handover Ritual Fix
- Created custom `/handover` command (`~/.claude/commands/handover.md`) requiring 3 artifacts: Session Log + Feedback Log + PROJECT_STATE.md
- Fixed permissions in `settings.local.json` — broad wildcards replaced 37 specific entries
- Saved to memory (`feedback_handover_ritual.md`)

### 2. Multi-Agent Research & Planning
Launched 7 specialist agents in parallel (PM, UI/UX, Engineer, Copywriter, QA, Research, Feedback Synthesis) to plan the Focus Table rebuild. Key outputs:
- PM: full user journey, acceptance criteria, edge cases for all 3 tabs
- Engineer: component architecture, data flow, file-by-file change list
- UI/UX: visual design plan for EviMatrix, ActionPlan, Payoff
- Copywriter: complete copy plan with actual words for every element
- Research: EVI matrix best practices from Matheson framework, consulting methodologies
- QA: current state audit with severity-ranked issues
- Feedback: comprehensive synthesis of all user preferences

### 3. Complete Focus Table Rebuild (commit 8a3ab0e)
- **QUADRANT_META:** Quick Wins → Pearls, Major Projects → Oysters, Fill-ins → Low-Hanging Fruit, Thankless → White Elephants
- **Shared hook:** `useDrainLookup` extracted from 3x duplicated code
- **EviMatrix:** 4 quadrant backgrounds, midline dividers, full-opacity labels, QuadrantSummary, improved inline editor
- **FocusTable:** HTML table → ActionCard layout, zone headers, summary pills, "See your impact" CTA
- **Payoff:** quick-win vs full-potential split, gradient divider, sonar-ring CTA
- **FocusStage:** tab badges, updated copy
- **SolutionPicker:** 6 copy improvements
- QA Gate: 40/40 items passed

### 4. User Feedback: 18 Items
User reviewed deployed app with screenshots. All 18 items captured as numbered list before implementation.

### 5. Feedback Implementation (commit caa3b20)

**Phase 1:**
- 40 new solutions for 20 uncovered waste slugs (sdev, ops, finance, CEO)
- Zone B visible by default
- "depends on implementation" → dynamic waste hours
- Quadrant label padding increased
- White Elephants: 💀 → 🐘
- "Bigger dot" legend removed
- Quadrant descriptions updated with methodology advice
- Before/After centered

**Phase 2:**
- Dot colors by quadrant (pink/gold/neutral/orange)
- Dot clicking fixed (handler on CustomDot `<g>`, not ScatterChart)
- Custom fixes visible in drain section after adding
- Multi-entry with "Added!" flash + auto-focus
- "Quick Win" → "Pearl" in SolutionPicker badge

**Phase 3:**
- PriorityTable: sequenced by quadrant (Pearls → Oysters → LHF → WE) with due dates
- `dueDates` added to Zustand store
- "Here's what each fix saves you" removed (merged into action table)
- Backwards CTA replaced with closing statement

QA Gate: 21/21 items passed

### Tests
- 182/182 passing throughout all changes

## What's next (for the NEXT Claude Code session to pick up)

1. **User verification of Session 8 feedback fixes** — user opened the deployed app but hasn't given follow-up feedback yet. Expect more notes.
2. **Highlighter fade issue** (from Session 7) — "buried in busywork." highlighter fades. CSS mockups didn't work. Needs real rough-notation demo.
3. **Zone B nudge when Zone A is sparse** — Zone B is now open by default, but there's no explicit nudge card telling users to look at Zone B. Could be added if user requests.
4. **Reclaim column in PriorityTable** — the action table has priority, task, quadrant, owner, due date. Could add reclaim hrs/wk per fix if user wants.
5. **Possible remaining bugs to verify:**
   - Hours input on ContextStep — can user type freely now?
   - CEO/Founder — does level picker actually hide?
   - Session reset — does it work without errors?
6. **"Wow" features not yet built:**
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments
7. **Oren's feedback** — user shared Vercel link with Oren Yonash (original Pareto app creator). Feedback may arrive.
8. **Clean up roles.ts corporate emoji** — base data still has corporate emoji (overridden by ROLE_EMOJI map, not user-facing)

## Decisions made (non-obvious choices)

### Carried from previous sessions
- **Two separate tools, not one flow:** /analyzer finds problems, /focus solves them. Different routes, different mental modes.
- **Static data, no database:** All waste sources, solutions, benchmarks are TypeScript constants.
- **Hot pink reclaim (#c4186a):** All CTA, success, selected states. Green is BANNED.
- **Plus Jakarta Sans body font:** NOT Hanken Grotesk.
- **SCORE_FROM_LEVEL (low=2, med=3, high=4):** Critical for quick-win detection.
- **No $50/hr fallback:** Dollar amounts hidden when no pay info provided.
- **Vercel deploys via git push only.**
- **Agents must not make major methodology changes autonomously.**

### New in Session 8
- **"Low-Hanging Fruit" = Easy + Low Impact** — standard usage is Easy+High (Pearls), but user explicitly chose their definition. This deviates from the Matheson framework.
- **Dot colors by quadrant, not zone** — Pearls=#c4186a, Oysters=#edb215, Low-Hanging Fruit=#9a8c7a, White Elephants=#e03e12.
- **White Elephants emoji is 🐘** — user-requested override of the project's usual emoji palette.
- **Priority table replaces "Your Fixes"** — sequenced by quadrant order with due dates, not a flat list.
- **No backwards CTA at end of Payoff** — closing statement instead ("You've got a plan. Now go reclaim your week.")
- **Custom fixes visible inline** — after adding a custom fix, it appears as a selected card in the drain section with a "Your fix" badge.
- **40 new solutions added** — every waste source now has at least 2 pre-built solutions. Sourced from DORA, Microsoft WTI, HBR, Forrester, Atlassian, etc.
- **Handover ritual mandates 3 artifacts** — Session Log + Feedback Log + PROJECT_STATE.md. Custom command created at `~/.claude/commands/handover.md`.

## Open questions waiting on user

- **Verify Session 8 feedback fixes** — user opened deployed app but hasn't given detailed follow-up yet
- **Highlighter fade** — needs a fix approach user can actually see/compare
- **Oren's feedback** — may arrive between sessions

## Critical file paths

```
src/stores/audit-store.ts                    — Zustand store (dueDates added this session)
src/lib/engine/pareto.ts                     — Core Pareto engine
src/lib/engine/solutions-logic.ts            — QUADRANT_META, payoff calculator, SCORE_FROM_LEVEL
src/lib/engine/types.ts                      — ParetoResult, CategoryResult, ChosenSolution
src/lib/data/solutions.ts                    — ~130 solutions catalog (40 new this session)
src/lib/data/waste-sources.ts                — 67+ waste sources
src/lib/data/roles.ts                        — 9 role lenses
src/components/focus/FocusStage.tsx           — Focus tool orchestrator (tab badges added)
src/components/focus/SolutionPicker.tsx       — Tab 1: Assign Fixes (custom fix visibility added)
src/components/focus/FocusTable.tsx           — Tab 2: Action Plan (card layout)
src/components/focus/EviMatrix.tsx            — Tab 3: EVI Matrix + PriorityTable + QuadrantSummary
src/components/focus/Payoff.tsx               — Payoff projections (closing statement replaces CTA)
src/components/focus/shared/useDrainLookup.ts — Shared drain lookup hook
src/components/focus/focus-components.test.tsx — 10 focus component tests
src/app/globals.css                           — Palette + animations
.claude/agents/mona-feedback-agent.md         — QA verification agent (37-item checklist from Session 7)
~/.claude/commands/handover.md                — Custom handover command (3 mandatory artifacts)
Feedback Log/                                 — User feedback logs (Session 3, 6, 7, 8)
Session Log/                                  — Session history (Sessions 1, 2, 4, 5, 6, 8)
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes.
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash. Always use actual characters.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email.
- **Vercel Git integration:** Must stay connected to `mona2611-alt/FocusLab-New`.
- **Tailwind CSS 4 animations:** Do NOT put animation definitions in `@theme inline`.
- **Old repo still exists:** `/Users/monamehta/Documents/FocusLab/focuslab` is the original. Work in `FocusLab New/`.
- **Recharts dot clicking:** ScatterChart.onClick doesn't fire reliably. Click handlers go on CustomDot's `<g>` SVG element directly.
- **QUADRANT_DOT_COLORS vs ZONE_COLORS:** Both exist in EviMatrix.tsx. Dots use quadrant colors. ZONE_COLORS is only a fallback.
- **dueDates in Zustand store:** New field added this session. Will auto-persist via localStorage. No migration needed — defaults to empty `{}`.
- **Sessions 3 and 7 have no session log files** — they were created before the handover ritual was enforced.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read memory files at `~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/` for user preferences
4. **First priority:** Check if Mona has feedback on the deployed Session 8 fixes
5. User wants autonomous execution — NEVER ask permissions, just do the work
6. Present copy/visual options via interactive HTML pickers, not markdown
7. Run the Mona Feedback Agent (`.claude/agents/mona-feedback-agent.md`) before every deploy
8. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
9. TDD discipline: 182 tests must never regress
10. Never say "done" until tests pass, build succeeds, and QA agent passes
11. **Important boundary:** Do NOT make major methodology changes without asking
