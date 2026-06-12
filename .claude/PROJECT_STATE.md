# FocusLab Project State

**Last updated:** 2026-06-11 by Claude via /handover

## Quick orient
- **Project:** FocusLab — a productivity tool suite that helps knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix). Reverse-engineered from Oren Yonash's Pareto repo and rebuilt with an upgraded stack.
- **Repo:** Local at `/Users/monamehta/Documents/FocusLab/focuslab` (no GitHub remote yet)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Visual design overhaul — user is unhappy with the current visual quality. Needs dramatic, bold redesign matching a vibrant reference image (burnt orange, hot pink, gold on warm parchment).
- **Owner:** Mona Mehta — non-technical product owner, wants fast autonomous execution, no permission prompts, values visual quality highly, previous product was considered a failure (lost weeks on it). Has a hard deadline mentality.

## Branch state
- 1 commit on main: `9e665a9 Initial commit from Create Next App`
- All work is uncommitted (all new files are untracked)
- Deployed to Vercel at https://focuslab-omega.vercel.app

## What's done in this session

### Research & Planning
- Cloned and reverse-engineered Oren's Pareto repo (https://github.com/Drizzt1414/Pareto.git) at `/tmp/pareto-study`
- Analyzed full codebase: 52 waste sources, 53 solutions, 7 roles, 46 benchmarks, Pareto engine with tier-based zones
- Discussed upgraded tech stack (Recharts instead of ECharts, Zustand instead of local state, shadcn/ui, Plus Jakarta Sans font)
- Created comprehensive HTML build plan at `/Users/monamehta/Documents/FocusLab/FOCUSLAB-BUILD-PLAN.html`
- Created color palette explorations at `COLOR-PALETTES.html` and `NEW-PALETTE.html`

### Built (all in focuslab/)
- **Scaffold:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 app
- **Design system:** globals.css with Bold Warm palette (paper #f4edde, waste #e03e12, reclaim #c4186a, gold #edb215), Plus Jakarta Sans body font, Fraunces serif headlines, paper grain overlay
- **AnimatedEmoji component:** 8 animation types (pop, shake, pulse, bounce, spin, flicker, float, explode) — fixed spring/keyframe crash
- **Data layer:** Ported all static data from Oren's repo — waste-sources.ts (52 sources with emojis), solutions.ts (53 solutions), roles.ts (7 roles), salary.ts (BLS data), benchmarks.ts (46 benchmarks embedded as static TS)
- **Zustand store:** audit-store.ts with persist middleware (localStorage), holds audit state + solutions state, bridges Tool 1 → Tool 2
- **Pareto engine:** pareto.ts (tier-based zone assignment), solutions-logic.ts (payoff with de-overlap), audit-logic.ts — 142 unit tests all passing
- **Landing page:** Hero with animated 58% counter, ToolCards, BenchmarkProof (dark section with sourced stats), RoleLenses (7 role cards), FinalCTA
- **Pareto Analyzer (/analyzer):** 5-step wizard — RoleStep (primary + secondary role), ContextStep (hours/pay), IntakeStep (progressive disclosure by pain prompts), WeighStep (dynamic hour cap, 3-button avoidable picker), ResultsView (dramatic reveal, Recharts Pareto chart, scorecard)
- **Focus Table (/focus):** FocusStage (3-tab orchestrator), SolutionPicker (per-drain solutions with quick-win badges), FocusTable (editable action plan), EviMatrix (Recharts scatter), Payoff (cost-of-doing-nothing closer)
- **Nav:** Sticky with gradient accent bar (waste→reclaim→gold)

### Bug Fixes Applied
- Fixed Framer Motion spring + multi-keyframe crash (switched to tween with custom easing)
- Fixed all Unicode escape sequences rendering as raw text (\u2014, \u2190, \u2192) across all analyzer components
- Fixed "Rendered fewer hooks than expected" crash in AuditWizard (rewrote to use switch statement)
- Added scroll-to-top on every step change
- Moved "Add your own" to top of intake section
- Fixed Muda type picker icons (broken Unicode → real emojis)
- Made hour slider max dynamic (based on work hours/days from context step)
- Replaced avoidable % slider with 3-tap buttons (All/Half/A little)
- Toned down Focus Table link in results (subtle suggestion, not continuation)
- Changed body font from Hanken Grotesk to Plus Jakarta Sans
- Increased base font size to 18.5px

## What's next (for the NEXT Claude Code session to pick up)

1. **CRITICAL — Visual redesign is the top priority.** The user showed a bold, vibrant reference image (bright orange headlines, hot pink CTAs, yellow accents on warm cream). The current implementation looks too similar to the old version despite palette changes. The user called the work "lousy" twice. Next session must:
   - Take screenshots from the user of EACH section they're unhappy with
   - Get specific direction on what each section should look like
   - Make dramatic visual changes, not incremental CSS tweaks
   - Verify by asking user to review in browser before deploying

2. **The Focus Table and EVI Matrix have NOT been reviewed by the user yet.** She explicitly said "I am not checking the focus table and focus matrix right now." These may have bugs or visual issues similar to the analyzer.

3. **Commit all work to git.** Everything is currently uncommitted — 40+ new files.

4. **Consider the "wow" moments discussed but not fully implemented:**
   - "Your Week" calendar visualization (showing waste as colored blocks on a Mon-Fri strip)
   - Before/After week comparison in the Payoff section
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments

5. **The landing page copy could be stronger.** A direct response copywriter approach was discussed but the current copy is generic.

## Decisions made (non-obvious choices)

- **Two separate tools, not one flow:** Pareto Analyzer finds problems, Focus Table solves them. Different mental modes, separate routes (/analyzer and /focus). User was very clear these should NOT be connected as a continuation.
- **Static data, no database:** All 52 waste sources, 53 solutions, and 46 benchmarks are embedded as TypeScript constants. Supabase/Drizzle deferred to post-launch. This removes a deploy dependency.
- **Recharts for Pareto chart, visx planned for EVI scatter (but Recharts used instead):** visx has React 19 peer dep issues. Both charts currently use Recharts. The EVI scatter uses a click-to-edit pattern instead of drag-to-rescore.
- **3-button avoidable picker:** Replaced the confusing 0-100% slider with "All of it" (100%) / "About half" (50%) / "A little" (25%). User approved this approach.
- **Progressive disclosure intake:** Waste sources shown behind emotional pain prompts ("😴 Drowning in meetings?") instead of flat checkbox list. User approved.
- **Hot pink reclaim color (#c4186a):** User chose Option A (hot pink) over Option B (teal) for the action/reclaim color. This was a deliberate choice.
- **Plus Jakarta Sans:** Replaced Hanken Grotesk because user said the font looked like "typical Claude style."

## Open questions waiting on user

- **Visual quality:** User is frustrated with the current look. Needs specific section-by-section direction on what "bold enough" means.
- **Focus Table / EVI Matrix review:** Not yet reviewed. May need significant work.
- **Oren's feedback:** User shared the Vercel link with Oren Yonash (the original Pareto app creator). His feedback hasn't come in yet.
- **Color palette finalization:** User liked the palette preview images but the implementation didn't match expectations.

## Critical file paths

```
focuslab/
├── src/app/globals.css              # Design system — palette, fonts, utilities
├── src/app/layout.tsx               # Root layout — font imports
├── src/app/page.tsx                 # Landing page
├── src/app/analyzer/page.tsx        # Pareto Analyzer entry
├── src/app/focus/page.tsx           # Focus Table entry
├── src/stores/audit-store.ts        # Zustand store — THE cross-tool bridge
├── src/lib/engine/pareto.ts         # Core Pareto engine (142 tests)
├── src/lib/engine/solutions-logic.ts # Payoff calculator
├── src/lib/data/waste-sources.ts    # 52 waste sources
├── src/lib/data/solutions.ts        # 53 solutions
├── src/lib/data/benchmarks.ts       # 46 benchmarks (static)
├── src/components/ui/AnimatedEmoji.tsx        # Reusable animated emoji
├── src/components/analyzer/AuditWizard.tsx    # Wizard orchestrator
├── src/components/analyzer/IntakeStep.tsx     # Progressive disclosure intake
├── src/components/analyzer/WeighStep.tsx      # Hour + avoidable weighting
├── src/components/analyzer/ResultsView.tsx    # Dramatic reveal + Pareto chart
├── src/components/focus/FocusStage.tsx        # Focus tool orchestrator
├── src/components/focus/EviMatrix.tsx         # Effort × Impact scatter
├── src/components/focus/Payoff.tsx            # Cost-of-doing-nothing closer
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true` to work around this. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes. All multi-keyframe animations must use tween with custom easing curves. The AnimatedEmoji component was fixed but other components might introduce the same bug.
- **Unicode escapes:** Any `\u{XXXX}` emoji escapes in JSX render correctly at runtime, but `\uXXXX` for text characters (em dashes, arrows) render as raw backslash text. Always use actual characters in JSX strings.
- **The original Pareto repo** is cloned at `/tmp/pareto-study` — this is a temp directory and may be cleaned up by the OS. Re-clone from https://github.com/Drizzt1414/Pareto.git if needed.
- **Vercel project:** Linked to `mona-3035s-projects/focuslab`. Deploy with `npx vercel --prod` from the focuslab directory.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read the memory files at `~/.claude/projects/-Users-monamehta-Documents-FocusLab/memory/` for user preferences
4. **Priority 1:** Ask the user for specific visual feedback — screenshots of what's wrong and what it should look like
5. Do NOT make incremental CSS tweaks — the user wants dramatic, visible changes
6. Do NOT ask for permissions — user wants autonomous execution (see memory/feedback_autonomous_workflow.md)
