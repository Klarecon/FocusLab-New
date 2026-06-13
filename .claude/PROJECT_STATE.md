# FocusLab Project State

**Last updated:** 2026-06-13 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 6 complete — ran 7 specialist agents (math auditor, PM sense-check, copywriter, accessibility, performance, QA evidence collector, dead-path explorer). Major quality sweep across the entire tool. Deployed to Vercel.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner, wants fast autonomous execution (no permission prompts), values visual quality highly, expects TDD discipline, will call out half-done work. Demands natural English copy, hates corporate/generic aesthetics. Agents must NOT make major changes (removing animations, altering methodology) without asking — propose alternatives instead. Core methodology is off-limits.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `44600a0 Session 6: Math audit, sense-check, copy, a11y, and performance sweep`
- Working tree has untracked files: `.claude/projects/`, `Components/`, `Oren's stuff/`, `QA Agents.rtf`, `SESSION-1-CRITICAL-ANALYSIS-AND-TOMORROW-PLAN.html`, `Feedback Log/Screenshots/`, `Oren's Agent MD Files/`

## What's done in this session (2026-06-13, Session 6)

### 1. Math Audit (Math Auditor Agent)
- **Fixed `isQuickWin()` mismatch** in `src/lib/data/solutions.ts:29` — UI badge said "Quick Win" for medium-impact solutions but engine classified them as fill-ins. Now both agree: quick-win = low effort + high impact only
- **Removed dead `LEVEL_SCORE` export** from `src/lib/data/solutions.ts` and `src/lib/data/index.ts` — used old 1/2/3 mapping, never imported anywhere
- **Verified all engine math is correct:** Pareto percentages, hourly rate derivation, zone classification, payoff de-overlap, money calculations

### 2. $50/hr Fallback Fix
- **Payoff.tsx** — removed invented $50/hr fallback that created inconsistent numbers vs. Analyzer (which correctly shows $0)
- Dollar amounts now **hidden entirely** when no pay info provided, with note: "add your pay info in the analyzer for dollar estimates"

### 3. PM Sense-Check (Product Manager Agent) — 21 issues fixed
- **Zero waste:** "reclaim 0 hours!" → "No avoidable waste detected" with honest guidance
- **Zero salary:** $0 shown as meaningful → dollar amounts hidden, hours-only display
- **Single source:** "Your Vital Few" → "Your #1 Drain"
- **No Pareto data on /focus:** empty tabs → full empty state with CTA to analyzer
- **Singular/plural fixes:** "these 1 fixes" → "this fix"
- **Zero reclaim:** before/after and cost-of-nothing sections hidden when meaningless

### 4. DR Copywriter Agent — 32 copy improvements
- Jargon removed: "Pareto Chart" → "Where your time goes", "Vital Few (Zone A)" → "Your Biggest Drains", "EVI Matrix" → "Effort vs. Impact"
- Landing page: "Start Your Free Audit" → "Find Your Hidden Waste", "Pareto analysis for knowledge workers" → "A free tool for knowledge workers"
- Emoji corrected: 📞→😤, 💻→🤦, 🎨→🫠, 👑→🤯, 🤹→🤯 in IntakeStep pain prompts
- FocusStage header: "Focus Table & EVI Matrix" → "Fix What's Draining You"

### 5. Accessibility Agent — 43 fixes
- `aria-pressed`, `aria-expanded`, `aria-label` on all interactive elements (role cards, level buttons, sliders, toggles, solution cards)
- `aria-hidden="true"` on all decorative emoji
- `prefers-reduced-motion` media query in globals.css (disables all CSS animations)
- `useReducedMotion()` hook in AnimatedEmoji (skips framer-motion variants)
- sr-only HTML data tables for both Pareto chart and EVI scatter chart
- `aria-live` regions for dynamic values (count-ups, running totals, source counts)
- Proper ARIA tab pattern on FocusStage tabs (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`)

### 6. Performance Agent — 6 fixes
- WeighStep: stable element for waste badge instead of key-based DOM remount on every slider tick
- Highlighter: removed redundant ResizeObservers on document.body (8+ per page)
- SolutionPicker: `memo()` + `useCallback` on SolutionCard, removed unnecessary `layout` prop
- ResultsView: O(1) Map lookup replacing O(n*m) find per chart point
- Payoff: `memo()` on CountUp to prevent animation restarts on parent re-renders
- **Noted but not fixed:** DrainSection selector granularity, Recharts bundle (~200KB), framer-motion bundle (~140KB)

### 7. QA Verification (Evidence Collector + Dead Path Explorer)
- **8/8 edge cases PASS:** zero waste, zero salary, single source, equal items, small values, direct /focus nav, unmapped solutions, 20+ sources
- **All routes safe:** `/`, `/analyzer`, `/focus` all properly guarded with fallback UIs
- **RoleLenses.tsx confirmed orphan** — exists on disk, imported nowhere, links don't work (analyzer doesn't read query params)

### 8. Color Contrast Fix
- `--color-ink-soft` updated from `#7a6f5f` (3.4:1) to `#655b4d` (4.7:1) — WCAG AA compliant for all text sizes

### Tests
- 182/182 passing throughout — fixed test mocks for `useReducedMotion`, updated test assertions for new copy

## What's next (for the NEXT Claude Code session to pick up)

1. **User feedback session** — Mona will review the deployed app and give detailed feedback. Expect visual/copy/flow critique. Be ready for a full pass.
2. **Focus Table & EVI Matrix review** — user has NOT reviewed `/focus` yet in detail. This session's changes improved copy and edge cases but visual design hasn't been user-reviewed.
3. **Landing page review** — copy was rewritten this session, Magic UI components added in Session 4. User hasn't given detailed visual feedback.
4. **"Wow" features not yet built:**
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments
5. **Oren's feedback** — user shared Vercel link with Oren Yonash (original Pareto app creator). Feedback may arrive.
6. **Clean up roles.ts corporate emoji** — lines 25 (`📊`) and 42 (`📋`) still have banned emoji in base data (overridden by ROLE_EMOJI in RoleStep.tsx, so they don't display)
7. **RoleLenses.tsx** — dead code, user said "ignore for now" on 2026-06-13

## Decisions made (non-obvious choices)

- **Two separate tools, not one flow:** /analyzer finds problems, /focus solves them. Different routes, different mental modes.
- **Manager and Executive are now LEVELS, not roles:** RoleStep shows 5 function roles + level picker (IC / Manager / Director+).
- **Static data, no database:** All waste sources, solutions, benchmarks are TypeScript constants. No Supabase.
- **Hot pink reclaim (#c4186a):** All CTA, success, selected states. Green is BANNED.
- **Plus Jakarta Sans body font:** NOT Hanken Grotesk.
- **SCORE_FROM_LEVEL (low=2, med=3, high=4):** Critical for quick-win detection.
- **Over-allocation blocks progression:** WeighStep disables "See results" when waste > work hours.
- **Waste source names describe problems only:** Never embed a solution in the label.
- **Tailwind CSS 4 animations use plain CSS classes:** `@theme inline` doesn't generate animation utility classes.
- **ShimmerButton replaces all primary CTAs:** Secondary/back buttons remain plain.
- **Highlighter uses `isView` prop:** Triggers on scroll-into-view, not on mount.
- **Vercel deploys via git push only:** CLI deploys blocked on Hobby plan.
- **QA gate hooks filter in the script, not in settings.json matcher.**
- **Stop hook is a soft gate:** Injects a reminder, doesn't hard-block.
- **No $50/hr fallback:** When user provides no pay info, dollar amounts are hidden entirely (not estimated). This matches the engine which returns $0.
- **isQuickWin = low effort + high impact ONLY:** Medium impact does not qualify. Matches engine's `quadrant()` threshold (impact >= 4).
- **ink-soft color is #655b4d:** Changed from #7a6f5f for WCAG AA compliance (4.7:1 contrast ratio on cream). User approved after seeing mockup.
- **Agents must not make major changes autonomously:** No removing animations, no altering core methodology, no changing wizard steps. Propose alternatives and ask.
- **When too many waste sources in Zone A:** Tool recommends another Pareto of the vital few — this is intentional methodology, not a bug to fix.

## Open questions waiting on user

- **Full app review** — user will review the deployed version and give feedback next session
- **Visual feedback on all Session 6 copy changes** — 32 copy rewrites were made, user hasn't seen them yet
- **Oren's feedback** — may arrive between sessions

## Critical file paths

```
src/stores/audit-store.ts        — Zustand store, THE cross-tool bridge
src/lib/engine/pareto.ts         — Core Pareto engine (142 tests)
src/lib/engine/solutions-logic.ts — Payoff calculator + SCORE_FROM_LEVEL
src/lib/engine/types.ts          — ParetoResult, CategoryResult, ChosenSolution
src/lib/data/solutions.ts        — 53 solutions catalog (LEVEL_SCORE removed)
src/lib/data/waste-sources.ts    — 47 waste sources (cleaned labels)
src/lib/data/roles.ts            — 7 role lenses (corporate emoji still in base data)
src/lib/utils.ts                 — cn() utility (clsx + tailwind-merge)
src/components/ui/shimmer-button.tsx  — ShimmerButton (Magic UI)
src/components/ui/highlighter.tsx     — Highlighter (Magic UI + rough-notation)
src/components/ui/orbiting-circles.tsx — OrbitingCircles (Magic UI)
src/components/ui/AnimatedEmoji.tsx   — Animated emoji (prefers-reduced-motion aware)
src/components/analyzer/AuditWizard.tsx  — Wizard orchestrator
src/components/analyzer/RoleStep.tsx     — Role+level picker
src/components/analyzer/ContextStep.tsx  — Hours/days/pay input
src/components/analyzer/IntakeStep.tsx   — Pain prompts with per-section add-your-own
src/components/analyzer/WeighStep.tsx    — Hours+avoidable sliders, over-allocation guard
src/components/analyzer/ResultsView.tsx  — Pareto chart + results (zero-waste guards added)
src/components/landing/Hero.tsx          — Landing hero (copy rewritten)
src/components/landing/FinalCTA.tsx      — Landing bottom CTA (copy rewritten)
src/components/focus/FocusStage.tsx      — Focus tool orchestrator (empty state added)
src/components/focus/SolutionPicker.tsx  — Solution picker (a11y + copy + perf fixes)
src/components/focus/EviMatrix.tsx       — Effort vs. Impact scatter (sr-only table added)
src/components/focus/Payoff.tsx          — Reclaim projections (zero guards, no $50 fallback)
src/app/globals.css                      — Design system palette + prefers-reduced-motion
.claude/settings.json                    — Hook configuration (PreToolUse + Stop)
.claude/hooks/verify-done.sh             — Automated QA gate (8 checks)
Feedback Log/                            — User feedback logs
Session Log/                             — Session history
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes. All AnimatedEmoji animations use tween with custom easing.
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash text. Always use actual characters in JSX.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email.
- **Vercel Git integration:** Must stay connected to `mona2611-alt/FocusLab-New`.
- **Tailwind CSS 4 animations:** Do NOT put animation definitions in `@theme inline`.
- **Old repo still exists:** `/Users/monamehta/Documents/FocusLab/focuslab` is the original. Work in `/Users/monamehta/Documents/FocusLab New/`.
- **RoleLenses.tsx is dead code:** Still exists on disk but imported nowhere. User said "ignore for now" on 2026-06-13.
- **roles.ts emoji are stale:** Lines 25 and 42 still use corporate emoji but are overridden by ROLE_EMOJI map in RoleStep.tsx.
- **Test mocks for Magic UI:** Any test file rendering components with framer-motion needs: `useInView`, `useReducedMotion`, `animate` in the mock, plus `rough-notation` mock and `ResizeObserver` global stub.
- **Pre-commit gate fires on ALL Bash calls:** Script exits 0 instantly for non-commit commands. Requires `jq`.
- **Recharts + framer-motion bundle size:** ~340KB combined min+gzip. Noted but no fix without library swap. Not blocking.
- **ink-soft contrast:** Now #655b4d (4.7:1). Original #7a6f5f is banned for small text on cream.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read the feedback log at `Feedback Log/Session 3 - User Feedback Log.md` for context on user preferences
4. User wants autonomous execution — don't ask permissions, just do the work
5. **Next session is a feedback session** — user will review the deployed app at https://focuslab-omega.vercel.app and give detailed feedback
6. Be ready for visual/copy/flow critique — 32 copy changes and 43 a11y changes were made this session that the user hasn't reviewed yet
7. Run QA agents BEFORE showing work to user — she will reject half-done fixes
8. TDD discipline: write tests first, implement, verify, then show
9. Never say "done" until tests pass, build succeeds, and QA checklist is green
10. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
11. **Important boundary:** Do NOT make major changes (removing animations, altering methodology, changing wizard steps) without asking. Propose alternatives instead.
