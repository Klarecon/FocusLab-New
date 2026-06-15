# FocusLab Project State

**Last updated:** 2026-06-15 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EvI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 9 complete — Oren's feedback (14 items), double Pareto wizard, tighter QA system, specialist agent audits. Deployed but user reports visual/behavioral misses not caught by code-level QA. Next session must start with deployed app review.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution — absolutely NO permission prompts. Values visual quality highly. Expects TDD discipline. Reviews the deployed Vercel app, not localhost. Prefers options via interactive HTML pickers. Does NOT want endless review rounds — demands specialist agents (math, copy, sense-check) run BEFORE presenting work. Frustrated when working features break during refactors.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `e02148f Session 9 fixes: specialist agent audit — copy, math, flow, edge cases`
- Session 9 commits (2 total):
  - `f9be8f8` Session 9: Oren feedback — 14 items, double Pareto, tighter QA system
  - `e02148f` Session 9 fixes: specialist agent audit — copy, math, flow, edge cases

## What's done in this session (2026-06-15, Session 9)

### 1. Tighter QA System (3 layers)
- Created `src/__tests__/feedback-regression.test.ts` — 71 cumulative regression tests (was 0)
- Total tests: 253 (was 182)
- Updated CLAUDE.md Section 12: three-layer QA (automated hooks + regression tests + evidence-based agent)
- New feedback intake format: every item typed as CODE or VISUAL before coding
- QA agent must show file:line evidence for PASS, flag VISUAL items as VISUAL-CHECK
- Updated `mona-feedback-agent.md` with evidence-based verification protocol

### 2. Oren's Feedback — 14 Items Implemented
Oren Yonash (original Pareto methodology creator) reviewed the deployed app. His feedback was captured from 10 screenshots with comments.

**Methodology changes (approved by Mona):**
- O1: Removed avoidable % ("how much could you cut?") from WeighStep — Pareto now runs on raw hours
- O3: Double Pareto two-pass wizard — IntakeStep became category-level estimation, new DrilldownStep for vital few drilldown

**UX/UI improvements:**
- O2: Removed "Really zero?" prompt (redundant friction)
- O4: Bar chart label truncation (was no-op, now truncates at 25 chars)
- O5: Solution descriptions collapse by default + max 3 visible per drain
- O6a: Renamed tab to "EvI Matrix"
- O6b: Simplified dot tooltip (name + quadrant + scores only)
- O6c: Added above-fold quadrant summary counts
- O7: Skip/remove button on priority table rows
- O8: Date picker min=today
- O10: Deduplicated waste sources across pain prompt categories

**Visual fixes (from Mona's Session 8 review):**
- #6: Centered "See your impact" CTA
- #7: Fixed quadrant label overlap (bottom-[76px])
- #10: Added column headers to priority table

### 3. Opportunity Framing (O9)
- Created `src/lib/data/opportunity-frames.ts` — research-backed copy across 4 time tiers (1-3h, 3-6h, 6-10h, 10+h) with role-specific frames for 10 roles
- Sources: Cal Newport, Gloria Mark, Microsoft WTI 2025, McKinsey, DORA, HBR, HubSpot, ATD
- Added to Payoff.tsx: "What could you do with that time?" section

### 4. Specialist Agent Audits
Ran 3 specialist agents after user flagged quality issues:
- **Math Agent:** All calculations sound end-to-end. No contradictions. Found: DrilldownStep missing over-allocation warning, benchmarkMap silently broken (both fixed)
- **DR Copywriter:** 19 copy issues found and fixed. Key: "Drilldown"→"Details", "Quick tasks"→"Low-Hanging Fruit" consistency, removed jargon
- **Sense Checker:** 2 flow bugs fixed (empty state fallbacks), role change now clears stale category estimates, benchmarkMap restored

### 5. Custom Sources Restored
DrilldownStep now has "Add your own drain..." input per category with multi-entry support, "Your custom drain" label, and auto-focus.

## What's next (for the NEXT Claude Code session to pick up)

1. **CRITICAL: User says deployed app still has misses.** Session 9 code passes all 67 QA checks and 253 tests, but user reports "half the things are still the same" on the deployed app. Next session MUST start by having user identify specific issues (screenshots or descriptions). Could be: browser cache, runtime behavior not caught by code checks, or genuine misses.

2. **Oren's feedback item O3 (Double Pareto) needs live testing.** The wizard flow changed significantly — old: Role→Context→Intake→Weigh→Results, new: Role→Context→YourTime→Details→Results. The old WeighStep is now dead code. User hasn't confirmed the new flow feels right.

3. **Dead code cleanup:** WeighStep.tsx is no longer imported but still exists. Tests reference it. `weighCadence` field in store is dead. Should be cleaned up but carefully (localStorage backward compat).

4. **Run specialist agents BEFORE presenting work.** User explicitly demanded: Math Agent, DR Copywriter, Sense Checker, and Mona Feedback Agent must ALL pass before declaring done. This is now a hard requirement — save to memory.

5. **Pending features (not started):**
   - Calendar week visualization
   - Lottie animations
   - Shareable scorecard card
   - Highlighter fade issue (from Session 7)

## Decisions made (non-obvious choices)

### Carried from previous sessions
- Two separate tools, not one flow: /analyzer finds problems, /focus solves them
- Static data, no database
- Hot pink reclaim (#c4186a) for all CTA, success, selected states. Green is BANNED.
- Plus Jakarta Sans body font. Hanken Grotesk BANNED.
- SCORE_FROM_LEVEL (low=2, med=3, high=4)
- No $50/hr fallback
- Agents must not make major methodology changes without asking

### New in Session 9
- **Double Pareto (Oren's methodology):** IntakeStep is now category-level estimation (rough hrs/week per pain category). Engine runs mini-Pareto to find vital few categories (80% threshold). DrilldownStep shows only vital categories for detailed source-level estimation.
- **Avoidable % removed:** Pareto runs on raw hours. `avoidablePct` forced to 100 in store for backward compat.
- **Three-layer QA system:** (1) pre-commit hooks, (2) cumulative feedback regression tests, (3) evidence-based QA agent with CODE/VISUAL split.
- **Specialist agents mandatory before "done":** Math, Copywriter, Sense Checker, and Mona Feedback Agent must all pass.
- **Opportunity framing is research-backed:** Real stats from Cal Newport, Gloria Mark, McKinsey, etc. — not placeholder copy.
- **Role change clears category estimates:** Prevents stale data from wrong role carrying over.
- **Custom sources live in DrilldownStep:** Not IntakeStep (which is now category-level only).
- **Stepper labels:** "Your Time" (step 2) and "Details" (step 3) — not "Estimate"/"Drilldown" (jargon).
- **"Low-Hanging Fruit" is always singular** — the expression is collective, never "Fruits".
- **White Elephants action verb:** "drop or delegate these" — not "skip if you can" (too passive).

## Open questions waiting on user

- **What specifically is still wrong on the deployed app?** Code passes all checks but user sees issues. Need screenshots or descriptions.
- **Does the new double Pareto wizard flow feel right?** (Category estimate → Drilldown vital few → Results)
- **Oren's follow-up:** May have more feedback after seeing the changes.

## Critical file paths

```
src/components/analyzer/IntakeStep.tsx           — NOW: category-level estimation (Pass 1)
src/components/analyzer/DrilldownStep.tsx         — NEW: vital few drilldown (Pass 2)
src/components/analyzer/AuditWizard.tsx           — Wizard orchestrator (5 steps, DrilldownStep at step 3)
src/components/analyzer/WeighStep.tsx             — DEAD CODE: no longer imported
src/components/analyzer/Stepper.tsx               — Step labels: Role/Context/Your Time/Details/Results
src/components/analyzer/ResultsView.tsx           — Bar chart with truncated labels
src/components/focus/EviMatrix.tsx                — EvI Matrix + PriorityTable (skip button, date min, column headers, above-fold summary)
src/components/focus/SolutionPicker.tsx           — Collapsible descriptions, 3-max visible, custom fixes
src/components/focus/FocusTable.tsx               — Action Plan (centered CTA)
src/components/focus/FocusStage.tsx               — Tab: "EvI Matrix" (renamed)
src/components/focus/Payoff.tsx                   — Opportunity framing + "Analyzer" naming
src/lib/data/opportunity-frames.ts                — NEW: research-backed role-specific opportunity copy
src/lib/engine/solutions-logic.ts                 — QUADRANT_META, payoff calculator
src/stores/audit-store.ts                         — categoryEstimates, vitalCategories, avoidablePct=100
src/__tests__/feedback-regression.test.ts         — 71 cumulative regression tests
.claude/agents/mona-feedback-agent.md             — Evidence-based QA agent
.claude/hooks/verify-done.sh                      — Pre-commit verification (8 checks)
Feedback Log/Session 9 - Oren Feedback Review.html — Interactive feedback picker
Feedback Log/Session 9 - Mona Responses.txt       — Mona's decisions on all items
docs/superpowers/plans/2026-06-15-oren-feedback-implementation.md — Full implementation plan
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash. Always use actual characters.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email
- **Recharts dot clicking:** Click handlers go on CustomDot's `<g>` SVG element directly
- **WeighStep.tsx is dead code:** Not imported anywhere but tests reference it. Don't delete without updating tests.
- **`hoursPerDay` field is misnamed:** In DrilldownStep it stores weekly hours. Renaming is risky (localStorage).
- **`weighCadence` is dead:** Only used by dead WeighStep. Persisted but never read by live code.
- **Browser cache:** User may see stale deploys. Always suggest Cmd+Shift+R or incognito.
- **User frustrated with QA quality:** Session 9 QA agents passed everything but user found issues. Code-level checks are necessary but not sufficient — need runtime/visual verification.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read memory files at `~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/`
4. **First priority:** Ask user what specifically is wrong on the deployed app — get screenshots
5. Run the full wizard flow yourself to understand the double Pareto experience
6. Run ALL specialist agents (Math, Copywriter, Sense Checker, Mona Feedback) BEFORE declaring done
7. User wants autonomous execution — NEVER ask permissions, just do the work
8. Present copy/visual options via interactive HTML pickers, not markdown
9. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
10. TDD discipline: 253 tests must never regress
11. Never say "done" until all specialist agents pass
12. **Important boundary:** Do NOT make major methodology changes without asking
