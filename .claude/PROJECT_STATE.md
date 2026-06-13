# FocusLab Project State

**Last updated:** 2026-06-13 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 7 complete — user feedback session. 37 feedback items captured and implemented across copy, visual, and functional changes. Deployed to Vercel. Two bugs (hours input typing, session reset persistence) fixed in final commit but **user has not yet verified the fixes on the deployed version**.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution — absolutely NO permission prompts (she called this out multiple times in Session 7). Values visual quality highly. Expects TDD discipline. Will call out half-done work aggressively. Demands natural English copy. Hates corporate/generic aesthetics. Prefers options via interactive HTML pickers (not markdown). Reviews the deployed Vercel app, not localhost. Core methodology is off-limits for changes.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `fec34d6 Fix hours input typing and session reset persistence bugs`
- Session 7 commits (3 total):
  - `d7e46df` Session 7: User feedback — copy, visual, and functional overhaul
  - `c7bf413` Session 7 fixes: reset, dedup, CEO level, editable inputs, live total alerts
  - `fec34d6` Fix hours input typing and session reset persistence bugs
- Untracked files: `.claude/projects/`, `Components/`, `Oren's stuff/`, `QA Agents.rtf`, `SESSION-1-CRITICAL-ANALYSIS-AND-TOMORROW-PLAN.html`, `Feedback Log/Screenshots/`, `Oren's Agent MD Files/`, `Feedback Log/Focus Table & EVI Methodology.html`

## What's done in this session (2026-06-13, Session 7)

### 1. User Feedback Collection (37 items)
Mona reviewed the deployed app screen by screen and gave stream-of-consciousness feedback with screenshots. All notes captured as numbered items before any implementation began.

### 2. Copy Changes (DR Copywriter Agent) — 15 copy updates
All presented via interactive HTML picker (`Feedback Log/Session 7 - Options Picker.html`). User picked from 3 options per item:
- Hero eyebrow: "A free tool..." → "A waste reduction tool for knowledge workers"
- Hero headline: "Most of your week isn't real work." → "Most of your week is buried in busywork."
- Subhead stat: "58%" → "50–70% (sometimes even more)", fixed missing space
- Hero sub-CTA: "3 minutes. No signup. No judgment." → "3 minutes. No signup needed."
- ToolCards subhead: "Two ways to reclaim your week" → "One finds the problem. The other fixes it."
- ToolCards feature: "5-minute audit" → "3-minute audit"
- Focus card CTA: "Fix your week →" → "Fix what's draining you →"
- Bottom CTA stat: "stuff that doesn't move the needle" → "work that feels productive but isn't"
- Bottom CTA button: "See Where Your Time Really Goes" → "Find Your Hidden Waste"
- Bottom CTA tagline: "Completely free" → "No signup needed."
- Results pre-CTA: "Ready to do something about it?" → "This is fixable."
- Results CTA: "Pick your fixes →" → "Now let's fix it →"
- SolutionPicker bottom: "See your action plan →" → "Build your action plan →"
- Payoff non-quick-win CTA: "top fix" → "biggest win"
- ContextStep header: "We need a few numbers..." → "Tell us about your week."

### 3. Visual Changes (UI/UX Designer Agent)
Presented via visual HTML mockups (`Feedback Log/Session 7 - Visual Mockups.html`):
- **Calendar: Heat Map style** — saturated orange waste blocks (0.85 opacity), white text labels, pink stamp badge "50–70% waste" with spring animation, Fraunces italic footer
- **Shimmer button: Pulse + wider sweep** — shimmerSize 0.12em, shimmerDuration 2s, spread 120deg, cta-pulse sonar ring animation
- **Scroll indicator removed** from Hero, min-height reduced to 90vh for natural content peek
- **CTA buttons centered** across Hero, FinalCTA, ResultsView
- Item 8 (highlighter fade) was SKIPPED — user said CSS mockups all looked identical. Needs real rough-notation demo in the app next time.

### 4. Functional Changes (Engineer Agent)
- **4 new roles added:** Software Development, Operations, Finance, CEO/Founder — each with 5 role-specific waste sources, benchmarks, salary defaults, pain prompts
- **Marketing emoji** changed to 📣, **Product emoji** to 📦
- **WeighStep manual hour input** — text input alongside sliders, synced bidirectionally
- **Salary default text** now reflects actual role + level (e.g., "Marketing Directors" not "Marketing Managers")
- **Session auto-reset** on mount when returning to /analyzer with stale results — clears localStorage directly
- **Weekly/Daily toggle** at top of WeighStep, required before proceeding
- **Transition animation** extended from 2.5s to 3.5s, amount colored pink (#c4186a)
- **Live running total** on WeighStep with threshold alerts at 75% and 90%
- **Circle annotation padding** increased from 2 to 12 to prevent clipping "$" and "r"
- **CEO/Founder** auto-sets Director+ level and hides level picker
- **wasteSourcesForRole()** deduplicates by slug to prevent double-listing
- **Restart handler** rewritten to clear localStorage directly (fixes race with Zustand persist)

### 5. Bug Fixes (Final Commit)
- **Hours input couldn't be typed into:** `if (val === "") return;` in onChange prevented clearing the field. Fixed with local draft state pattern that allows empty intermediate values.
- **Sources persisted after reset:** `setTimeout(() => reset(), 0)` raced with Zustand persist rehydration. Fixed by calling `localStorage.removeItem("focuslab-audit")` directly on both restart and mount-check.

### 6. New Components Installed
- **SparklesText** (`src/components/ui/sparkles-text.tsx`) — Magic UI, colors adapted to #c4186a + #edb215
- **VideoText** (`src/components/ui/video-text.tsx`) — Magic UI, default font set to Fraunces

### 7. Mona Feedback Agent Created
- Saved at `.claude/agents/mona-feedback-agent.md`
- 37-item checklist covering copy, visual, functional, component, and banned pattern checks
- Should be run before every deploy

### 8. Memory System Updated
- 3 new memories saved: copy preferences, visual preferences, workflow preferences
- Key insight: present options via HTML pickers, never ask permissions, deploy without asking

### 9. Methodology Documentation
- Created `Feedback Log/Focus Table & EVI Methodology.html` — comprehensive reference doc covering the de-overlap algorithm, quadrant system, scoring, payoff calculation, and edge cases

### Tests
- 182/182 passing throughout all changes

## What's next (for the NEXT Claude Code session to pick up)

1. **User verification of Session 7 fixes** — Mona said "I will check later." She has NOT verified that the hours input typing and session reset bugs are actually fixed on the deployed version. Expect follow-up feedback.
2. **Item 8 (highlighter fade) still unfixed** — "buried in busywork." highlighter fades toward the end. User skipped because CSS mockups all looked the same. Next time, show the fix in the actual running app or use rough-notation directly in the mockup.
3. **Focus Table & EVI Matrix visual review** — user has NOT reviewed `/focus` in detail yet. She asked about the methodology (got the HTML doc) but hasn't given visual/UX feedback on the fix-picking flow.
4. **Possible remaining bugs to verify on deployed version:**
   - Hours input on ContextStep — can user type freely now?
   - IntakeStep sources — do they reset to 0 on fresh start?
   - CEO/Founder — does level picker actually hide?
   - Live running total on WeighStep — is it visible?
   - Restart "Start over" — does it work without errors?
5. **"Wow" features not yet built:**
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments
6. **Oren's feedback** — user shared Vercel link with Oren Yonash (original Pareto app creator). Feedback may arrive.
7. **Clean up roles.ts corporate emoji** — base data still has 📊 and 📋 (overridden by ROLE_EMOJI map, so not user-facing)
8. **RoleLenses.tsx** — dead code, user said "ignore for now" on 2026-06-13

## Decisions made (non-obvious choices)

### Carried from previous sessions
- **Two separate tools, not one flow:** /analyzer finds problems, /focus solves them. Different routes, different mental modes.
- **Manager and Executive are now LEVELS, not roles:** RoleStep shows function roles + level picker (IC / Manager / Director+).
- **Static data, no database:** All waste sources, solutions, benchmarks are TypeScript constants. No Supabase.
- **Hot pink reclaim (#c4186a):** All CTA, success, selected states. Green is BANNED.
- **Plus Jakarta Sans body font:** NOT Hanken Grotesk.
- **SCORE_FROM_LEVEL (low=2, med=3, high=4):** Critical for quick-win detection.
- **No $50/hr fallback:** Dollar amounts hidden when no pay info provided.
- **Vercel deploys via git push only:** CLI deploys blocked on Hobby plan.
- **Agents must not make major changes autonomously:** Propose alternatives and ask.

### New in Session 7
- **"Free" is banned from marketing copy:** User explicitly changed "A free tool" → "A waste reduction tool." Positioning is about value, not price.
- **"No judgment" dropped from tagline:** Simplified to "3 minutes. No signup needed." across entire app.
- **CEO/Founder has no level picker:** They're already at the top — IC/Manager/Director doesn't apply. Auto-sets to Director+.
- **Calendar visual is "Heat Map" style:** Saturated orange blocks, not subtle/faded. Stamp badge in pink (different color from blocks).
- **Shimmer effect is "Pulse + Sweep":** Sonar-ring pulse + wider shimmer band. Previous shimmer was "not visible enough."
- **Options must be presented via interactive HTML:** Not markdown tables. Include radio buttons, live summary, "Copy my picks" button.
- **Visual mockups must show real animations:** CSS approximations of rough-notation effects all look the same. Use the actual library or show in the running app.
- **Hours input uses local draft state:** Direct onChange with `if (val === "") return;` prevents typing. Must allow empty intermediate state.
- **Session reset clears localStorage directly:** `setTimeout(() => reset(), 0)` races with Zustand persist rehydration. Use `localStorage.removeItem("focuslab-audit")` instead.
- **wasteSourcesForRole() deduplicates by slug:** Uses a Set to prevent sources appearing twice when mapped to multiple scopes.

## Open questions waiting on user

- **Verify Session 7 fixes** — user said "I will check later" for hours input, session reset, and other functional fixes
- **Focus Table visual feedback** — user reviewed methodology but hasn't given UX feedback on /focus yet
- **Highlighter fade** — needs a fix approach user can actually see/compare (not CSS mockups)
- **Oren's feedback** — may arrive between sessions

## Critical file paths

```
src/stores/audit-store.ts           — Zustand store, THE cross-tool bridge (reset, weighCadence added)
src/lib/engine/pareto.ts            — Core Pareto engine (142 tests)
src/lib/engine/solutions-logic.ts   — Payoff calculator + SCORE_FROM_LEVEL + de-overlap algorithm
src/lib/engine/types.ts             — ParetoResult, CategoryResult, ChosenSolution
src/lib/data/solutions.ts           — ~90 solutions catalog
src/lib/data/waste-sources.ts       — 67+ waste sources (dedup added, 20 new role-specific)
src/lib/data/roles.ts               — 9 role lenses (4 new: software-dev, operations, finance, ceo-founder)
src/lib/data/salary.ts              — BLS salary defaults (4 new roles added)
src/lib/data/benchmarks.ts          — RoleSlug type (4 new slugs added)
src/lib/utils.ts                    — cn() utility (clsx + tailwind-merge)
src/components/ui/shimmer-button.tsx — ShimmerButton (pulse + wider sweep)
src/components/ui/highlighter.tsx    — Highlighter (rough-notation, fade issue pending)
src/components/ui/sparkles-text.tsx  — SparklesText (NEW, Magic UI, palette-adapted)
src/components/ui/video-text.tsx     — VideoText (NEW, Magic UI, Fraunces default)
src/components/ui/orbiting-circles.tsx — OrbitingCircles (Magic UI)
src/components/ui/AnimatedEmoji.tsx  — Animated emoji (prefers-reduced-motion aware)
src/components/analyzer/AuditWizard.tsx  — Wizard orchestrator (reset + restart fixed)
src/components/analyzer/RoleStep.tsx     — Role+level picker (CEO hides level, new emoji)
src/components/analyzer/ContextStep.tsx  — Hours/days/pay input (draft state for typing)
src/components/analyzer/IntakeStep.tsx   — Pain prompts (4 new roles added)
src/components/analyzer/WeighStep.tsx    — Sliders + text input, weekly/daily toggle, live total
src/components/analyzer/ResultsView.tsx  — Pareto chart + results (circle padding, centered CTA)
src/components/landing/Hero.tsx          — Heat Map calendar, new copy, no scroll indicator
src/components/landing/FinalCTA.tsx      — Updated copy, centered button
src/components/landing/ToolCards.tsx      — Updated copy and features
src/components/focus/FocusStage.tsx      — Focus tool orchestrator
src/components/focus/SolutionPicker.tsx  — Solution picker (updated CTA copy)
src/components/focus/EviMatrix.tsx       — Effort vs. Impact scatter
src/components/focus/Payoff.tsx          — Reclaim projections (updated CTA copy)
src/app/globals.css                      — Palette + cta-pulse animation added
.claude/agents/mona-feedback-agent.md    — QA verification agent (37-item checklist)
.claude/settings.json                    — Hook configuration (PreToolUse + Stop)
.claude/hooks/verify-done.sh             — Automated QA gate (8 checks)
Feedback Log/                            — User feedback logs + HTML pickers + methodology doc
Session Log/                             — Session history
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes. All AnimatedEmoji animations use tween with custom easing.
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash text. Always use actual characters in JSX.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email.
- **Vercel Git integration:** Must stay connected to `mona2611-alt/FocusLab-New`.
- **Tailwind CSS 4 animations:** Do NOT put animation definitions in `@theme inline`. Use plain CSS classes.
- **Old repo still exists:** `/Users/monamehta/Documents/FocusLab/focuslab` is the original. Work in `/Users/monamehta/Documents/FocusLab New/`.
- **RoleLenses.tsx is dead code:** Still exists on disk but imported nowhere. User said "ignore for now."
- **roles.ts emoji are stale:** Base data still has corporate emoji but overridden by ROLE_EMOJI map in RoleStep.tsx.
- **Test mocks for Magic UI:** Any test file rendering framer-motion components needs: `useInView`, `useReducedMotion`, `animate` in the mock, plus `rough-notation` mock and `ResizeObserver` global stub.
- **Pre-commit gate fires on ALL Bash calls:** Script exits 0 instantly for non-commit commands. Requires `jq`.
- **Recharts + framer-motion bundle size:** ~340KB combined min+gzip. No fix without library swap. Not blocking.
- **ink-soft contrast:** Now #655b4d (4.7:1). Original #7a6f5f is banned for small text on cream.
- **Hours input must use draft state:** Direct onChange with `if (val === "") return;` prevents typing. Always use a local state pattern that allows empty intermediate values.
- **Session reset must clear localStorage:** `setTimeout(() => reset(), 0)` races with Zustand persist. Always call `localStorage.removeItem("focuslab-audit")` directly.
- **CSS mockups don't work for rough-notation effects:** All options look identical. Must demo in the actual running app.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read memory files at `~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/` for user preferences
4. **First priority:** Ask if Mona has verified the Session 7 fixes on the deployed app
5. User wants autonomous execution — NEVER ask permissions, just do the work
6. Present copy/visual options via interactive HTML pickers, not markdown
7. Run the Mona Feedback Agent (`.claude/agents/mona-feedback-agent.md`) before every deploy
8. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
9. TDD discipline: 182 tests must never regress
10. Never say "done" until tests pass, build succeeds, and QA agent passes
11. **Important boundary:** Do NOT make major changes (removing animations, altering methodology, changing wizard steps) without asking. Propose alternatives instead.
