# FocusLab Project State

**Last updated:** 2026-06-12 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 3 complete — all Pareto Analyzer user feedback (18 items) fixed and deployed. Focus Table / EVI Matrix not yet reviewed by user.
- **Owner:** Mona Mehta — non-technical product owner, wants fast autonomous execution (no permission prompts), values visual quality highly, expects TDD discipline, will call out half-done work. Demands natural English copy, hates corporate/generic aesthetics, wants illustrative visuals not placeholder emoji.

## Branch state
- 5 commits on main, all pushed to origin and deployed to Vercel
- Latest: `d77c11d Session 3: Fix all user feedback — hero redesign, role+level, copy, validation`
- Working tree has uncommitted changes: moved feedback log to new `Feedback Log/` folder, AGENTS.md/CLAUDE.md minor modifications

## What's done in this session (2026-06-12, Session 3)

### QA Audit (pre-work)
- Ran 4 parallel QA agents against all Session 2 claims — confirmed all 12 bug fixes actually landed
- Found 10 corporate emoji violations (📊📋✅🚀) that Session 2 missed — fixed all
- Found 3 button sizing inconsistencies — fixed all
- Found landing page copy still implying sequential tool flow — fixed

### User Feedback Fixes (18 items from Pareto Analyzer review)
All logged in `Feedback Log/Session 3 - User Feedback Log.md` with item IDs FB-01 through FB-16 + MW-01/MW-02.

**Landing page:**
- FB-01: Added scroll indicator (animated chevron) at bottom of hero
- FB-02: Rewrote hero copy — "Most of your week isn't real work." replaces broken English
- FB-03: Built illustrative calendar week visual (Mon-Fri grid with waste/work blocks)
- FB-04: Removed "Your role. Your waste." (RoleLenses) section entirely
- FB-05: Cleaned FinalCTA — removed "$500+" headline, "Let that sink in", "No data leaves your browser"; kept 🤯 with "6 full work weeks per year"

**Step 1 (Role):**
- FB-06: Replaced boring role emoji with expressive ones (🎯🤝🛠️🧭🎨)
- FB-07: Redesigned to role+level picker in one view — function grid (5 roles) + level selector (IC / Manager / Director+). Manager and Executive are now levels, not standalone roles. Hidden "I also spend time on" pattern removed entirely.

**Step 2 (Context):**
- FB-08: Hours input changed to text field + stepper buttons only — no native number spinners
- FB-09: "Salary" toggle label → "Fixed"

**Step 3 (Intake):**
- FB-10: "Add your own" moved from isolated top into each expanded pain prompt section
- FB-11: Audited all waste source names — removed embedded solutions (e.g. "Status meetings that could've been a message" → "Recurring status update meetings")
- FB-12: Removed redundant "Still doing the team's work yourself?" manager pain prompt

**Step 5 (Results):**
- FB-13: Capped waste % display at 100% maximum
- FB-14: Removed chart label truncation — full labels with 45° rotation
- FB-15: Over-allocation warning now appears in WeighStep and BLOCKS "See results" button until user corrects
- FB-16: Warning colors changed from gold (invisible on beige) to waste orange

**App-wide:**
- MW-01: Copy quality pass — natural English throughout
- MW-02: No solutions embedded in waste source names

### Organization
- Created `Feedback Log/` folder (separate from `Session Log/`) per user request

## What's next (for the NEXT Claude Code session to pick up)

1. **Focus Table & EVI Matrix user review** — user has NOT reviewed /focus yet. Expect detailed feedback similar to this session's Pareto feedback. Be ready for a full redesign pass.
2. **"Wow" features not yet built:**
   - Before/After week comparison in Payoff
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments
3. **Landing page may need more work** — the calendar visual and copy changes are deployed but user hasn't reviewed them yet
4. **Oren's feedback** — user shared the Vercel link with Oren Yonash (original Pareto app creator). His feedback may come in.
5. **Commit the Feedback Log folder move** — the move from Session Log/ to Feedback Log/ is uncommitted

## Decisions made (non-obvious choices)

- **Two separate tools, not one flow:** /analyzer finds problems, /focus solves them. Different routes, different mental modes. User was explicit about this. Landing page copy was rewritten to NOT imply sequential flow.
- **Manager and Executive are now LEVELS, not roles:** RoleStep shows 5 function roles (Marketing, Sales, Engineering, Product, Design) + a level picker (IC / Manager / Director+). Selecting Manager level adds manager waste sources as secondaryRoles in Zustand. This was a significant redesign from Session 2.
- **Static data, no database:** All waste sources, solutions, benchmarks are TypeScript constants. No Supabase.
- **Hot pink reclaim (#c4186a):** All CTA, success, selected states. Green is BANNED.
- **Plus Jakarta Sans body font:** NOT Hanken Grotesk (user rejected as "typical Claude style").
- **SCORE_FROM_LEVEL (low=2, med=3, high=4):** Critical for quick-win detection (needs impact≥4).
- **Over-allocation blocks progression:** If waste hours > work week hours in WeighStep, the "See results" button is disabled. User explicitly asked for this to prevent absurd 250% results.
- **Feedback logs live in `Feedback Log/`, session logs in `Session Log/`** — user requested separation.
- **Waste source names describe problems only:** Never embed a solution in the label (e.g. "that could've been a message" is banned). This is a content standard going forward.
- **"Add your own" is per-section in IntakeStep:** Not a single isolated input at the top. Each pain prompt section has its own add-your-own field when expanded.

## Open questions waiting on user

- **Focus Table / EVI Matrix review** — user hasn't looked at /focus page yet
- **Landing page visual review** — calendar visual and copy changes deployed but not yet reviewed
- **Oren's feedback** — may arrive between sessions
- **Role+level design validation** — the IC/Manager/Director+ picker is new and hasn't been user-tested

## Critical file paths

```
src/stores/audit-store.ts        — Zustand store, THE cross-tool bridge
src/lib/engine/pareto.ts         — Core Pareto engine (142 tests)
src/lib/engine/solutions-logic.ts — Payoff calculator + SCORE_FROM_LEVEL
src/lib/engine/types.ts          — ParetoResult, CategoryResult, ChosenSolution
src/lib/data/solutions.ts        — 53 solutions catalog
src/lib/data/waste-sources.ts    — 47 waste sources (cleaned labels)
src/lib/data/roles.ts            — 7 role lenses (emoji defined here)
src/components/analyzer/AuditWizard.tsx  — Wizard orchestrator (scroll-to-top here)
src/components/analyzer/RoleStep.tsx     — Role+level picker (redesigned Session 3)
src/components/analyzer/ContextStep.tsx  — Hours/days/pay input (fixed Session 3)
src/components/analyzer/IntakeStep.tsx   — Pain prompts with per-section add-your-own
src/components/analyzer/WeighStep.tsx    — Hours+avoidable sliders, over-allocation guard
src/components/analyzer/ResultsView.tsx  — Pareto chart + results (capped %, full labels)
src/components/focus/FocusStage.tsx      — Focus tool orchestrator
src/components/focus/EviMatrix.tsx       — Effort × Impact scatter
src/components/focus/Payoff.tsx          — Cost-of-doing-nothing closer
src/components/ui/AnimatedEmoji.tsx      — 8 animation variants (no spring+multi-keyframe)
src/app/globals.css                      — Design system palette + utilities
Feedback Log/                            — User feedback logs (separate from session logs)
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes. All AnimatedEmoji animations use tween with custom easing. Don't introduce spring + multi-keyframe.
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash text. Always use actual characters in JSX.
- **Vercel project:** Linked to `mona-3035s-projects/focuslab`. Deploy with `npx vercel --prod`.
- **Old repo still exists:** `/Users/monamehta/Documents/FocusLab/focuslab` is the original. Work in `/Users/monamehta/Documents/FocusLab New/`.
- **RoleLenses.tsx is dead code:** Still exists on disk but removed from page.tsx. Can be deleted.
- **roles.ts emoji are stale:** The emoji in `src/lib/data/roles.ts` still use corporate emoji (📊📋 etc.) but RoleStep.tsx overrides them with ROLE_EMOJI map. If roles.ts emoji are used elsewhere, they need updating.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read the feedback log at `Feedback Log/Session 3 - User Feedback Log.md` for context on user preferences
4. User wants autonomous execution — don't ask permissions, just do the work
5. Run QA agents BEFORE showing work to user — she will reject half-done fixes
6. TDD discipline: write tests first, implement, verify, then show
7. Never say "done" until tests pass, build succeeds, and QA checklist is green
8. Ask the user what they want to work on next
