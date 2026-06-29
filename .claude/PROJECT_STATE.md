# FocusLab Project State

**Last updated:** 2026-06-29 by Claude via /handover (Session 24)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main == local == `25b2fe0`). The two app-code commits this session (`5779225`, `65877cc`) are pushed AND deployed to prod (alias verified). The final commit `25b2fe0` is a test-only add — no deploy needed.
- **Active work:** Session 24 = two redesigns Mona picked herself + a CSV export feature, all **shipped and live**. Built: Waste Log redesign (W1 tactile cards + W3 budget bar), Action Sequence redesign (A2 board lanes), and a CSV "Export to ClickUp / Monday" button with a functional download test.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution, NO permission/yes-no questions, deploy without asking, reacts to finished artifacts/visuals. Prefers brevity in replies. **Hard rule: only ever write files inside the `Documents` folder — never the Desktop or anywhere else.**

## Branch state (this session's commits, all pushed)
Three new commits this session, in order:
- `5779225` **Waste Log redesign (W1 cards + W3 budget bar); Action Sequence A2 board lanes** — pushed + deployed to prod (`vercel --prod`), alias verified.
- `65877cc` **Add CSV export to Action Sequence (ClickUp / Monday / Asana / Notion / Excel)** — pushed + deployed to prod, alias verified, `/focus` 200.
- `25b2fe0` **Add functional CSV export download test** — pushed. Test-only (no app change), so NOT separately deployed.

Untracked (NOT committed): `GTM Plan/2026-06-27-launch-risk-premortem.html` and `GTM Plan/2026-06-27-launch-upside-preparade.html` (pre-existing from before this session). The `Design Mockups/` folder from Session 23 is **still untracked** (open question carried over).

## What's done in this session (Session 24, 2026-06-29)
1. **[shipped + live] Waste Log redesign — W1 + W3.** Mona picked option W1 ("tactile cards") **with the W3 budget bar on top**. `src/components/analyzer/LogStep.tsx`:
   - Replaced the typed `<input type="number">` per chip with a **−/+ stepper** (0.5h steps, clamped to the user's work week). New helper `stepHours(src, delta)`. No-seed-on-toggle rule preserved (S21 #3) — toggling a card on starts it at 0.0h.
   - Chips became bigger **tactile cards** in a `grid-cols-1 sm:grid-cols-2` grid (kept `data-testid="drain-chip"` and the pink check circle).
   - Replaced the round "X hrs/week flagged" pill with a **W3 budget meter** (sticky `top-4`): a striped "your week" bar that fills with a colored block per sized drain (`meterSegments`, colors cycle waste→gold), with a `0h / {total}h flagged of {workWeek}h / {workWeek}h` scale.
2. **[shipped + live] Action Sequence redesign — A2.** Mona picked option A2 ("priority lanes / board cards"). `src/components/focus/EviMatrix.tsx` `PriorityTable`:
   - Replaced the `<table>` with a `grid-cols-1 sm:grid-cols-2` of **tinted quadrant lanes** (`QUADRANT_BG[g.quadrant]`), each holding **board cards** (`data-testid="action-card"`): numbered badge + bold title + × remove, with owner and due riding as quiet chips below.
   - **Owner is still a `<select>`** and **due is still `<input type="date">`** — just styled as chips. (Kept so the S11-#14 "Owner is editable select" test still passes and functionality is identical.)
3. **[shipped + live] CSV export.** New **"⬇ Export to ClickUp / Monday"** pink-outlined button in the Action Sequence header. `exportCSV()` in `EviMatrix.tsx`:
   - Builds one row per action item in priority order. Columns: `Priority, Task Name, Owner, Due Date, Status, Notes`. Owner key→label via `ownerLabel()`; Status = `QUADRANT_META[q].name`; Notes = `reclaimHint || sourceName`.
   - Pure client-side **Blob download** (`focuslab-action-plan.csv`), **no backend**. UTF-8 BOM prefix (Excel-clean), quotes-escaped fields (commas in titles/notes don't break columns).
4. **[tests] 336 → 343.** In `src/__tests__/feedback-regression.test.ts`:
   - **Flipped reversals:** `[S9-#10]`→`[S9-#10→S24]` (cards carry owner+due, not column headers) and `[S11-#14]`→`[S11-#14→S24]` (board cards, no `<table>`). Per the reversal rule — assert the new truth, don't just delete.
   - **Added Session 24 block:** budget bar (`S24-#1`), stepper not typed field (`S24-#2`), single sticky bar (`S24-#2`), board-card lanes (`S24-#3`), owner select + date kept (`S24-#3`), CSV export button + columns (`S24-#4` x2).
5. **[tests] Functional CSV download test.** New `e2e/csv-export.spec.ts` — drives the full wizard to the EVI tab, sets a due date, clicks Export, **captures the real browser download** and asserts: filename, BOM, exact header, one row per card, due-date passthrough, owner-label mapping, status, and comma quote-escaping. **Passed.** Also updated `e2e/capture-screens.spec.ts` (drive the stepper instead of the old number field) and `e2e/visual-checks.spec.ts` (assert `action-card`, not `<table>`).
6. **[answered, no code] ClickUp/Monday integration question.** Explained 3 routes: (1) CSV export ~½–1 day no backend [BUILT], (2) email-to-board deep link ~1 day, (3) full OAuth API ~1–2 wks each (needs a backend FocusLab doesn't have). Recommended starting with CSV — which Mona then asked for and got.

- **Verify:** tsc clean, `npx vitest --run` = **343 passed**, `npx next build` clean, pre-commit gate = 11/11 pass, banned-color/window greps clean (only test-file matches). Screenshots reviewed: budget bar filled (13.0h of 45h), stepper cards, A2 lane with board cards, the export button top-right. CSV download verified by the Playwright test (real file contents printed + asserted).

## What's next (for the NEXT Claude session) — ordered
1. **Mona is testing the live changes herself.** She asked whether to test in regular vs private browser (told her: **regular**, because her audit/plan persist in localStorage; private = clean slate, no data to export). Next session: ask how the live test went and whether the two redesigns + CSV export feel right.
2. **Possible CSV follow-ups if she wants more:** (a) per-tool tuned headers (ClickUp wants "Task Name"/"Assignee"; Monday wants "Name"/"Person"/"Date"), (b) the email-to-board deep link, (c) eventually OAuth — but that needs a backend FocusLab doesn't currently have.
3. **Still open from Session 23:** the **card-fan landing mockup** verdict (`Design Mockups/card-fan-focuslab.html`) and whether to **commit the `Design Mockups/` folder** (untracked). Mona chose redesign directions herself this session rather than waiting on Oren, so Oren's input is no longer a blocker.
4. **Pending/never-started features** (don't start unless asked): calendar week viz, before/after comparison, Lottie animations, shareable scorecard card, landing-page copy overhaul.

## Decisions made (non-obvious)
- **Mona picked the redesign directions herself** — did NOT wait for Oren. W1 Waste Log **with the W3 budget bar grafted on top** (her explicit tweak — "use the budget bar on top from option 3 for option 1"). A2 for the Action Sequence.
- **Reversal rule applied again.** A2 board cards kill the `<table>` that S11-#14 (and an e2e test) asserted. Flipped those tests to assert the new card structure rather than deleting them, so the design choice can't silently revert. Kept the Owner-is-a-`<select>` assertion green by keeping a styled select.
- **Owner/Due stay real form controls inside the chips.** A2's mockup showed them as static chips, but functionality must be preserved ([[feedback_never_break_working_features]]) — so they're a `<select>` + `type="date"` styled to look like quiet chips.
- **CSV columns are import-generic, not tool-specific.** `Priority/Task Name/Owner/Due Date/Status/Notes` maps cleanly across ClickUp, Monday, Asana, Notion, Excel — the user maps columns on import anyway. Avoided picking one tool's exact schema.
- **No backend = client-side Blob.** FocusLab has no DB/API; CSV download is the right first step. OAuth "Send to ClickUp" was explicitly deferred as needing infrastructure that doesn't exist.
- **Capture spec had to learn the new input.** The old screenshot pipeline filled `input[aria-label*="Hours per week"]`; the stepper has no such input, so hours stayed 0 and the flow stalled before the focus tabs (screens 20–22 went stale). Fixed the spec to click the `+` button value/0.5 times.

## Open questions waiting on user
- **How did Mona's live test go?** (regular browser, her persisted plan) — do the Waste Log redesign, Action Sequence A2, and CSV export all feel right?
- **Card-fan landing verdict** (carried from S23): build it / tweak drains / Results-page variant?
- **Commit the `Design Mockups/` folder?** (still untracked, carried from S23)
- **Want more CSV/integration?** per-tool headers, email-to-board, or eventually OAuth (needs backend)?

## Critical file paths
- **Waste Log (W1+W3 redesign):** `src/components/analyzer/LogStep.tsx` — `stepHours()`, `meterSegments`, `SEG_COLORS`, budget-bar JSX (sticky top-4), tactile cards grid.
- **Action Sequence (A2) + CSV export:** `src/components/focus/EviMatrix.tsx` `PriorityTable` — `exportCSV()`, `ownerLabel()`, board-card lanes (`data-testid="action-card"`), the Export button in the header.
- **Tests (343):** `src/__tests__/feedback-regression.test.ts` ("Session 24" block at bottom; flipped S9-#10/S11-#14 mid-file).
- **CSV download test:** `e2e/csv-export.spec.ts` (functional). Screenshot pipeline: `e2e/capture-screens.spec.ts` (now drives the stepper). Visual asserts: `e2e/visual-checks.spec.ts`.
- **Engine (UNCHANGED):** `src/lib/engine/pareto.ts`, `audit-logic.ts`, `solutions-logic.ts` (`QUADRANT_META`, `quadrant`).
- **Store/persistence:** `src/stores/audit-store.ts` (`persist`, key `focuslab-audit`; `ownerOverrides`, `dueDates`, `chosenSolutions`).
- **Mockups (from S23, untracked):** `Design Mockups/redesign-options.html` (W1/W2/W3, A1/A2/A3 — the spec for what was built), `redesign-comparison.html`, `card-fan-focuslab.html`.

## Known gotchas
- **File-writing boundary: Documents only.** Never write to the Desktop or elsewhere.
- **Deploy = `npx vercel --prod --yes` then verify the alias** — `git push` alone does NOT deploy. Confirm with `npx vercel inspect focuslab-omega.vercel.app` (the `url` line should point at the new dpl) or curl `/focus`/`/analyzer` for 200. Test-only commits don't need a deploy.
- **Screenshot pipeline depends on the stepper now.** If you change how Waste Log hours are entered, update `e2e/capture-screens.spec.ts` AND `e2e/csv-export.spec.ts` (both click `button[aria-label^="More time on"]`) or the focus screens go stale silently.
- **Stale-screenshot trap (hit this session):** Playwright with `reuseExistingServer:true` + a flow that stalls leaves OLD screenshots in place and still reports "passed." Always check screenshot mtimes (`stat`) after a capture run before trusting them.
- **Hooks-order trap (S23):** any hook (`useMemo`/`useEffect`/`useState`) must sit ABOVE every early `return`.
- **Pre-commit hook** `.claude/hooks/verify-done.sh` hard-blocks on tsc/test fails, banned colors, window hacks, Hanken, corporate emoji, green states, SCORE_FROM_LEVEL. 11 checks, all green.
- **Dramatic reveal overlay** on Results runs 0.5s→3.5s; screenshot/verify AFTER 3.5s.
- Banned: green for success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for CTA/success/selected. SCORE_FROM_LEVEL = 2/3/4. Budget-bar segment colors (waste/orange/gold) are allowed — they represent waste, not success.
- **343 tests is the ratchet — never regress.**

## How to resume work
1. Read this file top to bottom + memory [[feedback_solve_hard_problems]], [[feedback_vercel_deploy]], [[feedback_never_break_working_features]], [[feedback_documents_only_writes]].
2. `git status` (GTM Plan + Design Mockups untracked) + `git log --oneline -6` (newest = `25b2fe0`).
3. `npx vitest --run` → **343 passed**; `npx tsc --noEmit` clean.
4. Ask Mona how the live test of the two redesigns + CSV export went; act on her feedback. Then revisit the carried-over opens (card-fan verdict, commit Design Mockups, more CSV/integration). Keep replies SHORT. Write files only under Documents. Ship green, deploy with `vercel --prod`, verify the live alias.
