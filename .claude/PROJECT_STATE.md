# FocusLab Project State

**Last updated:** 2026-06-27 by Claude via /handover (Session 23)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main == local == `c6547d3`, pushed + deployed to prod, alias verified live)
- **Active work:** Session 23 = (1) a small shipped bug/cleanup batch, and (2) **design exploration only** — redesign mockups for two sections + a card-fan landing concept. The mockups are NOT built into the app; they're awaiting feedback from Oren (the methodology advisor) and from Mona.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution, NO permission/yes-no questions, deploy without asking, reacts to finished artifacts/visuals. Prefers brevity in replies. **NEW hard rule this session: only ever write files inside the `Documents` folder — never the Desktop or anywhere else.** (She does all Claude Code work under Documents.)

## Branch state (this session's commit, pushed + deployed)
One new commit this session:
- `c6547d3` **Fix Start-over crash; remove pink scheduling lines; make restart button visible** — pushed to origin/main AND deployed to prod (`vercel --prod`), alias `focuslab-omega.vercel.app` verified pointing at it, `/analyzer` returns 200.

Untracked (NOT committed): the `Design Mockups/` folder (3 HTML files + 1 PNG). See "Open questions" — Mona was asked whether to commit it.

## What's done in this session (Session 23, 2026-06-27)
1. **[shipped + live] Start-over crash fix.** `src/components/analyzer/ResultsView.tsx` — clicking "Start over with a fresh audit" calls `reset()`, which nulls `paretoResult` while ResultsView is still mounted. A `useMemo` (chartData) sat AFTER the `if (!paretoResult) return …` early return, so React dropped a hook on that render → "Rendered fewer hooks than expected" → Next.js "This page couldn't load" screen. **Fix:** moved `const chartData = useMemo(…)` ABOVE the early return and made it null-safe (`if (!paretoResult) return []`). Reproduced the crash with a throwaway Playwright spec, confirmed `ERRORS_CAPTURED: []` after the fix.
2. **[shipped + live] Removed pink scheduling lines (Mona reversal).** She asked (again) to remove the pink "🗓️ Plan it in · block ~half a day" / "Only if it's quick — low payoff" lines.
   - `SolutionPicker.tsx` — deleted the `START_GUIDANCE` const + the guidance `<div>` under the effort/impact dots; dropped now-unused `quadrant`/`isRated`/`Score`/`QuadrantLabel` imports.
   - `EviMatrix.tsx` — deleted the `SEQUENCE_GUIDANCE` const + the per-task pink `<span>` under each Action Sequence task title.
3. **[shipped + live] Made the "Start over" control visible.** It was a faint gray underlined text link Mona literally couldn't find. Now a pink-outlined button with a ↺ icon (secondary to the "Build my plan" CTA). `ResultsView.tsx` ~L695.
4. **[tests] 333 → 336.** Flipped the two now-stale guidance assertions to negative reversals (`[S23-#1]` SolutionPicker has NO START_GUIDANCE, `[S23-#2]` EviMatrix has NO SEQUENCE_GUIDANCE), and added `[S23-#4]` (chartData useMemo before early return) + `[S23-#5]` (Start-over is a bordered pink button, not a faint underline). All in `src/__tests__/feedback-regression.test.ts` under a new "Session 23" describe block.
5. **[mockups, NOT built] Redesign exploration for two sections** that "still feel like a form." Mona wants mockups before any code change. Files in `Design Mockups/`:
   - `redesign-options.html` — 3 directions each for the **Waste Log** (W1 tactile cards + week tray / W2 guided one-type-at-a-time quiz / W3 week-as-a-budget-bar) and the **Action Sequence** (A1 timeline roadmap / A2 priority lanes / A3 satisfying checklist).
   - `redesign-comparison.html` — **side-by-side** (left = faithful rebuild of the CURRENT live version, right = the 3 options). Built specifically so Mona can **send it to Oren** for his opinion. Current panel is sticky.
6. **[mockup, NOT built] Card-fan landing concept.** Mona liked the "card-fan carousel" component from the wundercorp/awesome-components repo. Built a FocusLab version: `Design Mockups/card-fan-focuslab.html` (+ `.png`) — a landing section, "deck of drains" fanned in her palette (orange/gold side cards, pink centered/featured card), Fraunces headline with gold highlight, real CTA + microcopy. Static (fan rotation not wired). Awaiting her verdict.
7. **[misc, NOT logged to project] awesome-components scan.** Read `github.com/wundercorp/awesome-components`, downloaded 13 example component screenshots to `~/Documents/awesome-components-examples/` (outside the repo, by design — Mona said this was a one-off, don't log it to FocusLab). It's a dark/cool Aceternity-style UI kit; the takeaway was that Mona will like the *concepts* (animated text, tactile cards) but everything needs re-skinning to her warm palette (and several default to banned green).

- **Verify:** tsc clean, `npx vitest --run` = **336 passed**, `npx next build` clean, banned-color/window-hack greps clean (only test-file matches). Screenshots reviewed for the live changes (Start-over button, both pink-line removals on focus screens 20 + 22, fresh Role step after restart).

## What's next (for the NEXT Claude session) — ordered
1. **Waiting on Oren** for the two-section redesign. When Mona relays his picks: build the chosen **Waste Log** direction (W1/W2/W3) and **Action Sequence** direction (A1/A2/A3). Mockups are the spec; see `Design Mockups/redesign-options.html` and the per-direction screenshots `e2e/screenshots/mk-W1…W3`, `mk-A1…A3`. The Waste Log lives in `LogStep.tsx`; the Action Sequence is the `PriorityTable` inside `EviMatrix.tsx`.
2. **Waiting on Mona** for the card-fan verdict. If approved: build it as a real landing section and wire the rotation/feature animation; she may also want a **Results-page variant** using her own vital-few drains instead of generic ones. Mockup: `Design Mockups/card-fan-focuslab.html`.
3. **Decide whether to commit `Design Mockups/`** (currently untracked — Mona was asked at handover).
4. **Pending/never-started features** (don't start unless asked): calendar week viz, before/after comparison, Lottie animations, shareable scorecard card, landing-page copy overhaul.

## Decisions made (non-obvious)
- **Removing the scheduling lines was a Mona reversal, not new scope.** Those lines were earlier paid-for feedback (S20-V4-#3/#5). When she reverses, the rule is to FLIP the regression test to assert the new truth (negative assertion) rather than delete it — done as S23-#1/#2 so the reversal itself can't silently regress.
- **Crash fix is pure hook-ordering, engine untouched.** Per [[feedback_agent_boundaries]] no changes to `pareto.ts`/`audit-logic.ts`. The bug was a Rules-of-Hooks violation, not logic.
- **Mockups before code for the redesign.** Mona's standing rule: don't change the look without showing options on a mockup first. So the two "feels-like-a-form" sections got HTML mockups + a side-by-side comparison for Oren — zero code touched on those sections beyond the pink-line removal she explicitly asked for.
- **Comparison page is for Oren specifically.** Left = current, right = options, current sticky — so a third party can judge direction quickly. Worth telling Oren it's a static mockup (buttons/sliders show the look, not interactivity).
- **The card-fan's natural home is the landing page** (a recognition hook — "see your week before you start"), not a core tool screen, because only the center card is fully readable in a fan.
- **Documents-only file boundary.** Mona objected to a file written to her Desktop. Going forward: write only inside `Documents`. Misc/non-project scratch that must live somewhere user-facing still goes under `Documents` (e.g. `~/Documents/awesome-components-examples/`), never Desktop. (Saved to memory.)

## Open questions waiting on user
- **Oren's opinion** on the Waste Log + Action Sequence redesign directions (which of W1/W2/W3 and A1/A2/A3, or a mix).
- **Mona's verdict** on the card-fan landing mockup — does she like it; build it / tweak drains / try a Results-page variant?
- **Commit the `Design Mockups/` folder?** (untracked)

## Critical file paths
- **Crash fix + Results + Start-over button:** `src/components/analyzer/ResultsView.tsx` (chartData useMemo now above the `!paretoResult` guard; restart button ~L695)
- **Restart wiring:** `src/components/analyzer/AuditWizard.tsx` (`handleRestart` → `reset()`; smart-resume effect ~L51)
- **Waste Log (redesign target):** `src/components/analyzer/LogStep.tsx`
- **Action Sequence (redesign target) + pink-line removal:** `src/components/focus/EviMatrix.tsx` (`PriorityTable`)
- **Proven fixes + inline rating + pink-line removal:** `src/components/focus/SolutionPicker.tsx` (`InlineRating`)
- **Tests:** `src/__tests__/feedback-regression.test.ts` (336; "Session 23" block at bottom)
- **Mockups:** `Design Mockups/redesign-options.html`, `redesign-comparison.html`, `card-fan-focuslab.html` (+ `.png`)
- **Engine (UNCHANGED):** `src/lib/engine/pareto.ts`, `audit-logic.ts`
- **Store/persistence:** `src/stores/audit-store.ts` (`persist`, key `focuslab-audit`, `reset()` sets `...DEFAULT_STATE` incl. `step:0`; `step` is excluded from persistence via `partialize`)

## Known gotchas
- **File-writing boundary: Documents only.** Never write to the Desktop or elsewhere. (Mona flagged this hard this session.)
- **Deploy = `npx vercel --prod --yes` then verify the alias** — `git push` alone does NOT deploy. Confirm with `vercel inspect focuslab-omega.vercel.app` (check the `url` line points to the new dpl) or curl `/analyzer` for 200 before declaring done.
- **Hooks-order trap (just fixed once):** any hook (`useMemo`/`useEffect`/`useState`) must sit ABOVE every early `return`. ResultsView had this bug; watch for it if adding early returns to components that also memoize.
- **Pre-commit hook** `.claude/hooks/verify-done.sh` hard-blocks on tsc/test fails, banned colors, window hacks, Hanken, corporate emoji, green states, SCORE_FROM_LEVEL. Firing correctly (paths were quoted in S22).
- **Dramatic reveal overlay** on Results runs 0.5s→3.5s; screenshot/verify AFTER 3.5s.
- **Playwright file-mockup screenshots:** for the `Design Mockups/*.html` files use `npx playwright screenshot --viewport-size=W,H "file://<abs path>" out.png` (CLI), or element/clip screenshots — full-page clips can exceed the viewport image and error.
- Banned: green for success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for CTA/success/selected. SCORE_FROM_LEVEL = 2/3/4.
- **336 tests is the ratchet — never regress.**

## How to resume work
1. Read this file top to bottom + memory [[feedback_solve_hard_problems]], [[feedback_vercel_deploy]], and the new Documents-only boundary note.
2. `git status` (Design Mockups/ untracked) + `git log --oneline -6` (newest = `c6547d3`).
3. `npx vitest --run` → **336 passed**; `npx tsc --noEmit` clean.
4. Ask Mona: did Oren weigh in on the redesign, and what's her verdict on the card-fan? Build whichever directions they land on. Keep replies SHORT. Write files only under Documents. Ship green, deploy with `vercel --prod`, verify the live alias.
