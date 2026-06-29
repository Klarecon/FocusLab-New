# FocusLab Project State

**Last updated:** 2026-06-29 by Claude via /handover (Session 25)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main == local == `f7d3f42`). All three app-code commits this session are pushed AND deployed to prod (alias verified live, `/analyzer` 200).
- **Active work:** Session 25 = two rounds of Mona feedback, all **shipped and live** — (batch A) landing polish + per-section drains + custom-fix rating + sticky budget-bar fix; (batch B) results-message spacing/order, top Back button, custom-drain render fix, and a flat-data nudge on the log screen. (Test blocks are labelled "Session 25" and "Session 26" for traceability — both done this one session.)
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution, NO permission/yes-no questions, deploy without asking, reacts to finished artifacts/visuals. Prefers brevity in replies. **Hard rule: only ever write files inside the `Documents` folder — never the Desktop.**

## Branch state (this session's commits, all pushed + deployed)
- `e8eec4b` **Landing polish + per-section drains + custom-fix rating + sticky bar fix** — pushed + deployed, alias verified.
- `bcc1a2c` **Fix custom-drain disappearing, add top Back, fix evenly-message spacing** — pushed + deployed, alias verified.
- `f7d3f42` **Show flat-data nudge on the Log screen, before computing** — pushed + deployed, alias verified (current live build).

Untracked (NOT committed): `Design Mockups/stats-heading-options.html` (new this session — the heading picker), plus the pre-existing `Design Mockups/` (from S23) and `GTM Plan/2026-06-27-*.html`. See "Open questions".

## What's done in this session (Session 25, 2026-06-29)
**Batch A (commit `e8eec4b`, test block "Session 25"):**
1. **[shipped] Hero eyebrow** — dropped "for any kind of work" → just "A waste-reduction tool". `Hero.tsx`.
2. **[shipped] Stats section heading** — `BenchmarkProof.tsx` had no heading; added "You're not imagining it. The data agrees." + subline "Where everyone's week quietly leaks away." Also built `Design Mockups/stats-heading-options.html` (5 options, rendered on the real dark band) — Mona to pick; Option 1 is live.
3. **[shipped] Landing gap** — big space between HowItWorks' "The same method…" line and FinalCTA's "A working person loses…" line. Trimmed `FinalCTA` top padding (`py-28` → `pt-12 pb-24 sm:pt-16 sm:pb-28`) and `HowItWorks` bottom padding (`py-16 sm:py-24` → `pt-16 sm:pt-24 pb-10 sm:pb-12`).
4. **[shipped] Budget bar sticky fix** — it WAS sticky but stuck at `top-4` (16px) **behind the fixed nav** (~67px tall), so only the scale text peeked out. Now `sticky top-[72px]` → fully visible at any scroll depth. `LogStep.tsx`.
5. **[shipped] Per-section "Add your own drain"** — replaced the single bottom add-box (with a type `<select>`) with a reusable `AddDrainRow` rendered inside EACH waste-type section, pre-targeted to that section's type. `LogStep.tsx` (`AddDrainRow` + `addCustomDrain(label, typeKey)`).
6. **[shipped] Custom FIXES get rating** — in `SolutionPicker.tsx`, user-added fixes were missing the `<InlineRating />`, so they could never be scored or land on the matrix. Added it to the custom-fix block.

**Batch B (commits `bcc1a2c` + `f7d3f42`, test block "Session 26"):**
7. **[confirmed, no change] "Evenly spread" message order** — already renders BEFORE the Pareto chart on results. Confirmed in code + screenshot.
8. **[shipped] Missing space** — results flat-data message rendered "evenly**across**" joined; forced an explicit `<strong>evenly</strong>{" "}across`. `ResultsView.tsx`.
9. **[shipped] Top Back button** — wizard had Back only at the bottom of each step. Added a matching "← Back" at the TOP of mid steps (`step > 0 && step < 3`) in `AuditWizard.tsx`, after the Stepper.
10. **[shipped] Custom DRAIN disappearing** — adding your own drain stored it in `activeSources` but `byType` only rendered drains from the role library (`allSources`), so it never showed. Fixed `allSources` to also include active `custom-*` drains (and added `activeSources` to the memo deps). `LogStep.tsx`. (Same class of bug as the custom-fix one in #6.)
11. **[shipped] Flat-data nudge on the LOG screen** — Mona clarified the "spread evenly" warning should appear WHILE logging (so you fix flat hours in place), not only on results. `LogStep.tsx` now computes `isFlatData` (mirrors `ResultsView.isEvenlySpread`: ≥5 sized drains, distinct rounded hours === 1) and shows a 🫠 gold heads-up above the compute button. The results-screen message stays as a fallback.

- **Verify:** tsc clean, `npx vitest --run` = **353 passed**, `npx next build` clean, gate 11/11, banned-color/window greps clean. Screenshots reviewed for every visual item (eyebrow, stats heading, tightened gap, deep-scroll sticky bar, per-section add rows, custom-fix rating dots, top Back, custom-drain card, "evenly across" spacing, flat-data nudge). Custom-drain + flat-data + CSV behaviors confirmed with throwaway Playwright specs (deleted after).

## What's next (for the NEXT Claude session) — ordered
1. **Mona is reviewing the live changes.** Next session: ask how batches A + B feel.
2. **Stats heading pick (item 2).** Option 1 is live; she has `Design Mockups/stats-heading-options.html` with 5 options. If she names one (or a tweak), swap the `<h2>` in `BenchmarkProof.tsx`.
3. **Carried-over opens:** card-fan landing verdict (`Design Mockups/card-fan-focuslab.html`); whether to commit the `Design Mockups/` folder (now also includes `stats-heading-options.html`); optional CSV/integration follow-ups (per-tool headers, email-to-board, OAuth — needs a backend FocusLab lacks).
4. **Pending/never-started** (don't start unless asked): calendar week viz, before/after comparison, Lottie animations, shareable scorecard card, landing-page copy overhaul.

## Decisions made (non-obvious)
- **Two recurring bugs were the same shape:** a user-added item (custom fix in #6, custom drain in #10) gets saved to the store but the UI only renders items from the static library, so it "disappears." Fix pattern: merge active custom-* items into the rendered list. Watch for this anywhere users can add their own entries.
- **Sticky ≠ visible.** The budget bar was sticky the whole time; the real bug was it sat behind the fixed nav. Always verify sticky elements at DEEP scroll against the nav height (nav = 3px gradient line + `h-16` = ~67px; clear it with `top-[72px]`).
- **Flat-data nudge lives in BOTH places now** — on the log screen (catch early, per Mona) and on results (fallback if they proceed). Detection logic is duplicated but intentionally identical (rounded-to-0.1h, distinct === 1).
- **Heading shipped as a default + a picker.** Item 2 asked for "options"; shipped the recommended one live so the section isn't headingless, plus an HTML picker so Mona can swap without a round-trip.
- **JSX space stripping** — to guarantee a space next to an inline tag, use `{" "}` rather than a literal space (the literal one rendered joined in the wild).

## Open questions waiting on user
- Stats-section heading: keep Option 1 or pick another from `Design Mockups/stats-heading-options.html`?
- Card-fan landing verdict (carried from S23).
- Commit the `Design Mockups/` folder (incl. the new heading picker)?
- More CSV/integration (per-tool headers, email-to-board, OAuth)?

## Critical file paths
- **Landing:** `src/components/landing/Hero.tsx` (eyebrow), `BenchmarkProof.tsx` (stats heading), `HowItWorks.tsx` + `FinalCTA.tsx` (gap paddings). Assembled in `src/app/page.tsx`.
- **Nav (height drives sticky offsets):** `src/components/layout/Nav.tsx` (`sticky top-[3px]` + `h-16`).
- **Waste Log:** `src/components/analyzer/LogStep.tsx` — budget bar (`sticky top-[72px]`, `meterSegments`), `stepHours`, `AddDrainRow` + `addCustomDrain`, `allSources` (now includes custom drains), `isFlatData` nudge.
- **Wizard / top Back:** `src/components/analyzer/AuditWizard.tsx` (`step > 0 && step < 3` Back after Stepper; `goBack`).
- **Results:** `src/components/analyzer/ResultsView.tsx` (`isEvenlySpread`, flat-data message before chart, `chartData` useMemo above the `!paretoResult` guard).
- **Focus / custom-fix rating + CSV export:** `src/components/focus/SolutionPicker.tsx` (`InlineRating` now in custom-fix block), `src/components/focus/EviMatrix.tsx` (`exportCSV`, A2 board lanes).
- **Tests (353):** `src/__tests__/feedback-regression.test.ts` ("Session 25" + "Session 26" blocks at bottom). Functional download test: `e2e/csv-export.spec.ts`. Screenshot pipeline: `e2e/capture-screens.spec.ts` (drives the stepper).
- **Engine (UNCHANGED):** `src/lib/engine/pareto.ts`, `audit-logic.ts`, `solutions-logic.ts`.
- **Mockups/pickers:** `Design Mockups/stats-heading-options.html` (new), `redesign-options.html`, `card-fan-focuslab.html`.

## Known gotchas
- **File-writing boundary: Documents only.** Never the Desktop.
- **Deploy = `npx vercel --prod --yes` then verify the alias** — `git push` alone does NOT deploy. Confirm via `npx vercel inspect focuslab-omega.vercel.app` (the `url` line should point at the new dpl) or curl `/analyzer` for 200. Test-only commits don't need a deploy.
- **Sticky elements:** verify at DEEP scroll against the nav (use `top-[72px]` to clear it), not just near the top — a half-clipped sticky bar reads as "not sticky."
- **Stale-screenshot trap:** a flow that stalls (e.g., compute button disabled because <5 drains have hours) leaves OLD screenshots and still "passes." Check screenshot mtimes (`stat`) after a capture run; the compute gate needs ≥5 drains WITH hours.
- **Capture/verify specs drive the stepper** via `button[aria-label^="More time on"]` (each click = +0.5h). If hours entry changes, update those specs.
- **whileInView components** (e.g. FinalCTA) render at opacity:0 in a static full-page screenshot until scrolled into view — scroll them into view before judging.
- **Hooks-order trap (S23):** every hook must sit ABOVE early returns.
- **Pre-commit hook** `.claude/hooks/verify-done.sh` — 11 checks, all green. Banned: green success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for CTA/success/selected. SCORE_FROM_LEVEL = 2/3/4. Budget-bar segment colors (waste/orange/gold) are allowed.
- **353 tests is the ratchet — never regress.**

## How to resume work
1. Read this file top to bottom + memory [[feedback_solve_hard_problems]], [[feedback_vercel_deploy]], [[feedback_never_break_working_features]], [[feedback_documents_only_writes]].
2. `git status` (Design Mockups + GTM Plan untracked) + `git log --oneline -6` (newest = `f7d3f42`).
3. `npx vitest --run` → **353 passed**; `npx tsc --noEmit` clean.
4. Ask Mona how the live changes feel + whether she's picking a different stats heading. Act on her feedback. Keep replies SHORT. Write files only under Documents. Ship green, deploy with `vercel --prod`, verify the live alias.
