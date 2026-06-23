# FocusLab Project State

**Last updated:** 2026-06-23 by Claude via /handover (Session 17)

## Quick orient
- **Project:** FocusLab — productivity tool suite helping people find time waste (Pareto Analyzer at `/analyzer`) and fix it (Focus Table & EVI Matrix at `/focus`). The two routes are SEPARATE, not a single flow.
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Awaiting Mona's morning review of the **Oren redesign plan + mockup** (`Feedback Log/2026-06-24-oren-redesign-*.html`). Nothing from the redesign is built yet. Two UX batches DID ship live this session (see Branch state).
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner, content marketing + ad background, first business plan. Works with **Oren Yonash** (methodology creator / the person being "sold"). Wants FAST autonomous execution, NO permission prompts, deploy without asking. Values visual quality, gets frustrated when working features regress. STRONG preference this session: **show her an HTML mockup and get approval BEFORE touching real code** on anything design-related.

## Branch state
- On `main`, and origin/main is at **`8b188ae`** (pushed + deployed).
- **Two commits shipped + deployed live this session:**
  - `bad029e` — Action Plan + Drilldown: gold effort dots, blank/unrated dots, unique category emojis, unified pink selection, collapsible Drilldown groups
  - `8b188ae` — Surface the payoff: lead the Matrix tab with the reclaim number, Action Plan reclaim strip, hollow-ring dots, "what you'd do with it" spotlight
- **UNCOMMITTED (important — installed but not committed):**
  - `package.json` + `package-lock.json` modified (new deps below)
  - Untracked: `components.json` (new), and 5 new files in `src/components/ui/`: `bento-grid.tsx`, `animated-circular-progress-bar.tsx`, `animated-beam.tsx`, `particles.tsx`, `button.tsx`
  - These are the **4 Magic UI components** Mona asked to install, already palette-adapted, tsc-clean, nothing imports them yet. Commit them when the redesign build starts.
  - New deps: `@radix-ui/react-icons`, `class-variance-authority`, `motion` (framer-motion already present).
- Untracked marketing/mockup files in `Feedback Log/` and `GTM Plan/` (not code — leave them).

## What's done in this session (2026-06-23, Session 17)
Full narrative in `Session Log/Session 17 — UX Ship + Oren Redesign Plan.md`.
1. **Helped reframe Oren's value prop** (his "what's the value?" question) — shorter, less pitchy.
2. **Dev-friend feedback → action plan + mockups**, then SHIPPED 5 changes (`bad029e`): gold Effort dots, blank-start dots (unrated state + "Needs rating" group + excluded from matrix/payoff), unique emoji per waste group, unified pink selection across Role/Intake/Drilldown/Solution pickers, collapsible Drilldown accordion.
3. **SHIPPED payoff surfacing** (`8b188ae`): Payoff gained `variant` prop (hero/rest/strip/full); Matrix tab now leads with the reclaim number; Action Plan tab shows a slim reclaim strip; suggestion became a gold "What you'd do with it" spotlight; rating dots are clean hollow rings.
4. **Tests:** now **293 passing** (added S14 + S15 regression blocks). Fixed 2 pre-existing tsc errors (dotAll regex flag) so the tree is fully tsc-clean.
5. **Installed 4 Magic UI components** via `npx shadcn@latest add @magicui/...` (pnpm wasn't available), palette-adapted each (see Decisions).
6. **Read Oren's 23 June meeting transcript** (`test-results/Oren's feedback 23 June.md`) and built a **redesign plan + 12-scene mockup** in `Feedback Log/` (NOT built into code).

## What's next (for the NEXT Claude session)
1. **Get Mona's review** of `Feedback Log/2026-06-24-oren-redesign-plan.html` and `...-mockup.html`. She'll give feedback in the morning. Do NOT build until she approves.
2. **Before building Section C items, get Oren's call** on: hours-vs-% (Scene 9), merging the two intake steps (Scene 5), knowledge-worker scope, and clarify the vague "graph with three reasons" comment. (Optional offered: a hours-vs-% one-pager for Oren.)
3. **When approved, build in the plan's sequence:** landing hero (value prop + particles + circular gauge) → analyzer plain-language + fix-in-place + same-page scoring + add-category + Back buttons → de-tabled Action Plan (bento + gauge + suggested owners/dates) → matrix overlap fix → P2 polish (White Elephant verb, CEO salary, stray emoji, "134 fixes", cross-browser emoji). Then the 3 added gaps: over-cap hard-stop (P0 bug), explain the 4 waste types, transparent reclaim math.
4. **Commit the Magic UI install** (`components.json` + 5 ui files + package.json) as part of the first redesign commit.
5. **Deploy = `npx vercel --prod --yes`** then verify — NOT git push (see Known gotchas).

## Decisions made (non-obvious)
- **Deploy is CLI, not git push.** FocusLab's Vercel project deploys via `npx vercel --prod --yes`; git push to main does NOT trigger a deploy (production deployments have no git commit metadata). Saved to memory `project_vercel_deploy_mechanism`.
- **Blank dots = 0/0 (unrated).** `isRated(effort,impact)` in `solutions-logic.ts` gates an "unrated" state; unrated fixes are excluded from the Quick-Win count, the EVI Matrix plot, and the Payoff totals, and drop to a "Needs rating" group in FocusTable. SCORE_FROM_LEVEL (2/3/4) unchanged.
- **Effort dots are GOLD** (`--color-gold`), Impact stays pink — red read as "error".
- **Magic UI palette adaptation:** bento-grid → warm cream cards / ink text / pink CTAs (dark mode stripped); animated-beam default gradient → gold→pink (`#edb215`→`#c4186a`); particles default color → pink (`#c4186a`); circular-progress takes colors as props (feed pink gauge + `--color-line` track at usage). `components.json` was created fresh (none existed) with the magicui registry, configured for Tailwind 4 + `@/`→`src`.
- **Oren's core verdict (drives the redesign):** the tool "makes me work" → doesn't sell yet. Goal = deliver "free up 10 hours in 3 minutes" as fast, plain-English, effortless. Lead marketing-wise, not methodology-wise.

## Open questions waiting on user
- Mona's morning feedback on the redesign plan + mockup.
- Oren's decisions: hours-vs-%, merge intake steps, scope, "graph with three reasons" clarification.
- Whether to prep the hours-vs-% one-pager for Oren.

## Critical file paths
- `src/components/focus/Payoff.tsx` — now has `variant` prop (hero/rest/strip/full); ROI computation lives here
- `src/components/focus/FocusStage.tsx` — tab wiring (Payoff hero leads Matrix tab; strip on Action Plan)
- `src/components/focus/FocusTable.tsx` — DotRating (hollow rings), unrated state, "Needs rating" group
- `src/lib/engine/solutions-logic.ts` — `isRated`, `quadrant`, `SCORE_FROM_LEVEL`, `computePayoff`
- `src/components/analyzer/DrilldownStep.tsx` — collapsible accordion, unified pink selection
- `src/lib/data/waste-sources.ts` — `GROUP_EMOJI` (now all unique)
- `src/components/ui/{bento-grid,animated-circular-progress-bar,animated-beam,particles}.tsx` — new, palette-adapted
- `Feedback Log/2026-06-24-oren-redesign-plan.html` + `...-mockup.html` — the redesign spec (12 scenes)
- `test-results/Oren's feedback 23 June.md` — source transcript

## Known gotchas
- **Deploy with `npx vercel --prod --yes`, then verify with `npx vercel ls focuslab --prod` (newest = ● Ready). git push alone does NOT deploy.** Raw `*-mona-3035s-projects.vercel.app` URLs return 401 (deployment protection) — expected; the public domain serves fine.
- **pnpm is NOT installed** — use `npx shadcn@latest ...` for component installs.
- 2 tsc errors in `feedback-regression.test.ts` were fixed this session (dotAll `/s` → `[\s\S]`); keep it clean.
- Pre-commit hook (`.claude/hooks/verify-done.sh`) hard-blocks on tsc errors / test failures / banned colors — run a clean tsc + vitest before committing.
- 293 tests is the ratchet — never regress.

## How to resume work
1. Read this file top to bottom.
2. `git status` and `git log --oneline -5` to confirm state (origin/main = `8b188ae`; Magic UI install uncommitted).
3. Ask Mona for her review of the redesign plan + mockup before building anything.
