# FocusLab Project State

**Last updated:** 2026-06-12 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 4 complete — installed and wired up 3 Magic UI components (ShimmerButton, Highlighter, OrbitingCircles) across the entire app. QA gate passed 18/18 items from Session 3. Vercel deploy pipeline fixed.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner, wants fast autonomous execution (no permission prompts), values visual quality highly, expects TDD discipline, will call out half-done work. Demands natural English copy, hates corporate/generic aesthetics, wants illustrative visuals not placeholder emoji.

## Branch state
- 11 commits on main, all pushed to origin and deployed to Vercel
- Latest: `17ffe88 Fix deploy author email`
- Key Session 4 commits:
  - `5da2fe4` Session 4: Wire up Magic UI components
  - `9a0a24b` Fix Magic UI animations — use plain CSS classes instead of @theme inline
- Working tree clean (only untracked files: Components/, Oren's stuff, Screenshots, QA Agents.rtf)

## What's done in this session (2026-06-12, Session 4)

### QA Gate (Both Layers)
- **Layer 1 (Automated):** 8/8 checks passed via `verify-done.sh`
  - Fixed 2 false positives: test files were triggering banned-color and green-success greps
  - Updated `verify-done.sh` to exclude `*.test.*` files from those checks
- **Layer 2 (Reality Checker Agent):** 18/18 feedback items verified against source files
  - All Session 3 fixes (FB-01 through FB-16 + MW-01/MW-02) confirmed actually implemented
  - Advisory: `roles.ts` lines 25, 42 still have corporate emoji (📊📋) in base data, overridden in RoleStep UI

### Magic UI Components — Installed
- **ShimmerButton** (`src/components/ui/shimmer-button.tsx`) — shimmering CTA button with white light sweep effect. Default background: `var(--color-reclaim)`.
- **Highlighter** (`src/components/ui/highlighter.tsx`) — hand-drawn annotations via `rough-notation`. Supports: highlight, underline, circle, box, strike-through, bracket. Default color: reclaim pink 20% opacity.
- **OrbitingCircles** (`src/components/ui/orbiting-circles.tsx`) — items orbit a center point. Path stroke uses `var(--color-line)`.
- **Dependencies added:** `tailwind-merge`, `rough-notation`
- **Utility added:** `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- **CSS animations added to `globals.css`:** `.animate-shimmer-slide`, `.animate-spin-around`, `.animate-orbit` with corresponding `@keyframes`

### Magic UI Components — Wired Up (20 integrations)

**ShimmerButton (10 locations):**
- Hero.tsx — "Start Your Free Audit"
- FinalCTA.tsx — "Start Your Free Audit Now"
- RoleStep.tsx — "Continue →"
- ContextStep.tsx — "Continue →"
- IntakeStep.tsx — "Continue →"
- WeighStep.tsx — "See your results"
- ResultsView.tsx — "Fix it with Focus Table →"
- SolutionPicker.tsx — "See your action plan →"
- Payoff.tsx — "Start with your quick win"
- focus/page.tsx — "Go to Analyzer →"

**Highlighter (8 phrases):**
- Hero: "isn't real work." (highlight, waste orange 20%)
- Hero: "58% of their week" (underline, waste orange)
- FinalCTA: "6 full work weeks per year" (underline, waste orange)
- ResultsView: `$X/year` cost headline (circle, waste orange)
- ResultsView: "Your Vital Few (Zone A)" (underline, waste orange)
- ResultsView: "The Useful Many (Zone B)" (underline, gold)
- Payoff: "Reclaimable per week" (underline, reclaim pink)
- Payoff: "The cost of doing nothing" (box, waste orange)

**OrbitingCircles (2 locations):**
- Hero background: 2 rings — inner (😴🫠🤦😤💀), outer reverse (🤯😬🥲), opacity 7%
- Focus empty state: 1 ring around 🔍 center (🎯🛠️😤🥲)

### Test Fixes
- Added `useInView` mock to framer-motion mocks in `focus-components.test.tsx` and `phase-d-e2e.test.tsx`
- Added `ResizeObserver` global stub for jsdom in both test files
- Added `rough-notation` mock in both test files
- Fixed visual test: added explicit `background="var(--color-reclaim)"` to ContextStep ShimmerButton

### Vercel Deploy Pipeline Fixed
- **Root cause:** Git author email was `monamehta@MONAs-MacBook-Air.local` (local hostname), which doesn't match the verified GitHub/Vercel account email. Vercel Hobby plan blocks deployments from unverified authors.
- **Fix:** Set `git config --global user.email "mona@klarecon.com"` and `git config --global user.name "Mona Mehta"`
- **Also fixed:** Git integration was disconnected from Vercel project. User reconnected it via Vercel dashboard → Settings → Git.
- **CSS animation fix:** Tailwind CSS 4's `@theme inline` doesn't generate animation utility classes. Moved to plain `.animate-*` CSS classes in globals.css.

### CLAUDE.md Updated
- Added Section 12: QA Gate (Separate Verifier Pattern) — Layer 1 automated + Layer 2 QA agent verification pattern
- Renumbered subsequent sections

## What's next (for the NEXT Claude Code session to pick up)

1. **Focus Table & EVI Matrix user review** — user has NOT reviewed `/focus` yet. Expect detailed feedback similar to Session 3's Pareto feedback. Be ready for a full redesign pass.
2. **Landing page review with new components** — user confirmed Magic UI components work but hasn't given detailed visual feedback yet
3. **"Wow" features not yet built:**
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments
4. **Oren's feedback** — user shared the Vercel link with Oren Yonash (original Pareto app creator). His feedback may come in.
5. **Clean up roles.ts corporate emoji** — lines 25 (`📊`) and 42 (`📋`) still have banned corporate emoji in base ROLE_LENSES data. Currently overridden by ROLE_EMOJI map in RoleStep.tsx but should be fixed at source.
6. **RoleLenses.tsx is dead code** — still exists on disk, can be deleted

## Decisions made (non-obvious choices)

- **Two separate tools, not one flow:** /analyzer finds problems, /focus solves them. Different routes, different mental modes. User was explicit about this.
- **Manager and Executive are now LEVELS, not roles:** RoleStep shows 5 function roles + level picker (IC / Manager / Director+).
- **Static data, no database:** All waste sources, solutions, benchmarks are TypeScript constants. No Supabase.
- **Hot pink reclaim (#c4186a):** All CTA, success, selected states. Green is BANNED.
- **Plus Jakarta Sans body font:** NOT Hanken Grotesk (user rejected as "typical Claude style").
- **SCORE_FROM_LEVEL (low=2, med=3, high=4):** Critical for quick-win detection (needs impact≥4).
- **Over-allocation blocks progression:** WeighStep disables "See results" when waste > work hours.
- **Waste source names describe problems only:** Never embed a solution in the label.
- **Tailwind CSS 4 animations use plain CSS classes:** `@theme inline` does NOT generate animation utility classes. All Magic UI animations (shimmer-slide, spin-around, orbit) must be defined as plain `.animate-*` CSS classes in globals.css, not as `--animate-*` theme variables.
- **ShimmerButton replaces all primary CTAs:** Secondary/back buttons remain plain styled. Disabled ShimmerButtons get `background="var(--color-ink-soft)"` and `disabled:opacity-40`.
- **Highlighter uses `isView` prop:** All Highlighter instances trigger on scroll-into-view, not on mount. This prevents annotations from firing during the ResultsView dramatic reveal overlay.
- **Vercel deploys via git push only:** CLI deploys (`npx vercel --prod`) get blocked on Hobby plan. Always deploy by pushing to GitHub, which triggers the connected Git integration.

## Open questions waiting on user

- **Focus Table / EVI Matrix review** — user hasn't looked at /focus page yet
- **Visual feedback on Magic UI components** — user confirmed they "work" but hasn't given detailed feedback on the styling/animations
- **Oren's feedback** — may arrive between sessions

## Critical file paths

```
src/stores/audit-store.ts        — Zustand store, THE cross-tool bridge
src/lib/engine/pareto.ts         — Core Pareto engine (142 tests)
src/lib/engine/solutions-logic.ts — Payoff calculator + SCORE_FROM_LEVEL
src/lib/engine/types.ts          — ParetoResult, CategoryResult, ChosenSolution
src/lib/data/solutions.ts        — 53 solutions catalog
src/lib/data/waste-sources.ts    — 47 waste sources (cleaned labels)
src/lib/data/roles.ts            — 7 role lenses (emoji defined here — corporate emoji still in base data)
src/lib/utils.ts                 — cn() utility (clsx + tailwind-merge)
src/components/ui/shimmer-button.tsx  — ShimmerButton (Magic UI)
src/components/ui/highlighter.tsx     — Highlighter (Magic UI + rough-notation)
src/components/ui/orbiting-circles.tsx — OrbitingCircles (Magic UI)
src/components/analyzer/AuditWizard.tsx  — Wizard orchestrator
src/components/analyzer/RoleStep.tsx     — Role+level picker
src/components/analyzer/ContextStep.tsx  — Hours/days/pay input
src/components/analyzer/IntakeStep.tsx   — Pain prompts with per-section add-your-own
src/components/analyzer/WeighStep.tsx    — Hours+avoidable sliders, over-allocation guard
src/components/analyzer/ResultsView.tsx  — Pareto chart + results
src/components/landing/Hero.tsx          — Landing hero (ShimmerButton + Highlighter + OrbitingCircles)
src/components/landing/FinalCTA.tsx      — Landing bottom CTA (ShimmerButton + Highlighter)
src/components/focus/FocusStage.tsx      — Focus tool orchestrator
src/components/focus/SolutionPicker.tsx  — Solution picker (ShimmerButton)
src/components/focus/EviMatrix.tsx       — Effort × Impact scatter
src/components/focus/Payoff.tsx          — Cost-of-doing-nothing closer (ShimmerButton + Highlighter)
src/app/globals.css                      — Design system palette + Magic UI animations
.claude/hooks/verify-done.sh             — Automated QA gate (8 checks)
Feedback Log/                            — User feedback logs
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes. All AnimatedEmoji animations use tween with custom easing.
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash text. Always use actual characters in JSX.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email. Otherwise Vercel Hobby plan blocks the deployment. Global git config is set but could be overridden by local config.
- **Vercel Git integration:** Must stay connected to `mona2611-alt/FocusLab-New`. Was disconnected during Session 4 and had to be reconnected. If deploys stop working, check Settings → Git first.
- **Tailwind CSS 4 animations:** Do NOT put animation definitions in `@theme inline`. They won't generate utility classes. Use plain CSS classes (`.animate-*`) in globals.css instead.
- **Old repo still exists:** `/Users/monamehta/Documents/FocusLab/focuslab` is the original. Work in `/Users/monamehta/Documents/FocusLab New/`.
- **RoleLenses.tsx is dead code:** Still exists on disk but removed from page.tsx. Can be deleted.
- **roles.ts emoji are stale:** Lines 25 and 42 still use corporate emoji (📊📋) but are overridden by ROLE_EMOJI map in RoleStep.tsx.
- **Test mocks for Magic UI:** Any test file that renders components using Highlighter needs: `useInView` in framer-motion mock, `rough-notation` mock, and `ResizeObserver` global stub.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read the feedback log at `Feedback Log/Session 3 - User Feedback Log.md` for context on user preferences
4. User wants autonomous execution — don't ask permissions, just do the work
5. Run QA agents BEFORE showing work to user — she will reject half-done fixes
6. TDD discipline: write tests first, implement, verify, then show
7. Never say "done" until tests pass, build succeeds, and QA checklist is green
8. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
9. Ask the user what they want to work on next
