# FocusLab Project State

**Last updated:** 2026-06-25 by Claude via /handover (Session 20)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main == local == `5e5679a`, fully pushed)
- **Active work:** Implementing Mona's **v4 mockup review** + a **fresh round of review notes** (2026-06-25). ALL of it is now shipped & live, including the big one — the analyzer two-screen → one-screen logging merge (Oren's biggest rejection).
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution, NO permission/yes-no questions, deploy without asking, reacts to finished artifacts. **This session she said "you're not performing your best today, I expect better"** after I (a) kept deferring the hard analyzer merge as "risky," (b) put the Scene-5 guidance on the wrong screen, (c) left redundant Payoff sections. Lesson saved to memory [[feedback_solve_hard_problems]]: solve the hard thing, don't scope it down; put fixes where she'll look; don't declare done prematurely.

## Branch state (this session's commits, all deployed to prod + pushed to origin)
- `5e5679a` Analyzer merge — two logging screens → one (Option C) **← the big one**
- `ce3ee85` Payoff cleanups + Action-Sequence guidance + hero beam + bigger particles
- `70ca7f6` Batch 7b: inline effort/impact scoring on the Assign step
- `cb34d52` Batch 7a: all 100 solution titles → verb/action form
- `c0fa727` Batch 6: Oren-approved ring-gauge hero (Scene 1)
- `20c3b9d` Batch 5: pull Scene-8 hover, Scene-12 copy, Scene-4 whole-week heads-up
- `d8b834f` Batch 4: four-waste-type framework (hover — later removed in batch 5)
- `29f222c` Batch 3: restore stats section + Payoff math-ⓘ (later removed) + Magic UI
- Deploy = `npx vercel --prod --yes` (auto-aliases to focuslab-omega). Each batch shipped green + live-verified. Tracked tree is clean.

## What's done this session (Session 20, 2026-06-25)
### v4 mockup review (focuslab-v4-review-notes.txt) — all shipped
- **Scene 1 Hero:** swapped in the v4 ring-gauge hero (counts up to ~10), framed as a card, verbatim copy, CTA "Find my hidden hours", sub "⏱ About 3 minutes · nothing to install". Old WeekCalendar hero archived at `Feedback Log/saved-sections/Hero.tsx.saved`.
- **Scene 4 Over-cap:** "nearly your whole week marked as waste — double-check" heads-up at ≥90% of the work week (IntakeStep + DrilldownStep + the new LogStep).
- **Scene 5 verb-form copy:** rewrote ALL ~100 solution titles in `solutions.ts` to lead with an action verb ("Kill agenda-less meetings", not "No agenda, no meeting"). No solution `id`s changed.
- **Scene 5 inline scoring (batch 7b):** effort/impact dot-raters now appear on each chosen fix in the Assign step (`SolutionPicker.tsx` `InlineRating`), CTA → "See your payoff", routes to matrix.
- **Scene 8:** removed the standalone waste-type hover (Mona: redundant). `WASTE_TYPES` taxonomy kept as internal data in `waste-sources.ts`.
- **Scene 12:** ported approved Pareto-density copy, removed "only".

### Fresh review notes (2026-06-25) — all shipped
1. **THE MERGE (Oren's big rejection):** two analyzer logging screens → ONE. Built `src/components/analyzer/LogStep.tsx` as **Option C ("guided one-pass")** — drains grouped under the 4 waste-type headers (NAME ONLY, no escape-hatch subcopy per Mona), tapped as chips that reveal an inline hours field, running total, min-5 gate, whole-week heads-up, "+ add your own drain" with type picker. Pareto runs straight off entered hours (reuses `runAudit`). Wizard is now **4 steps** (Role → Context → Log your week → Results); `Stepper.tsx` updated; `AuditWizard.tsx` mounts LogStep at case 2, clamps to 3. Mona picked Option C from a 3-option mockup (`Feedback Log/2026-06-25-logging-merge-3-options.html`).
2. Removed the Payoff "ⓘ How we got this" math disclosure.
3. Moved the Scene-5 "when to start / how long" guidance onto the **Action Sequence** (EviMatrix `SEQUENCE_GUIDANCE` by quadrant), next to owner/due (was wrongly on the Assign cards).
4. Removed the Payoff before/after "your week now → you get back" block.
5. Removed the Payoff "what happens if you don't fix this" 12-month projection (kept the "go reclaim your week" closing line).
6. Added a rotating **BorderBeam** to the hero (`src/components/ui/border-beam.tsx` + `border-beam` keyframe in `globals.css`).
7. Made the hero particles bigger (size 0.7 → 2.2).

- **Tests: 306 → 330** (+24 ratchet). All in `feedback-regression.test.ts` under `[S20-…]` / `[S20-V4-…]`.

## What's next (for the NEXT Claude session) — ordered
1. **Mona's own walkthrough is the real test** — she was asked to hard-refresh `/analyzer` and walk Role → Context → merged Log screen → Results. Watch for her feedback on the merged screen's feel.
2. **Cleanup: delete the now-unused `IntakeStep.tsx` + `DrilldownStep.tsx`** (no longer mounted in `AuditWizard`). They're kept only so their existing grep regression tests pass. To remove: delete the files, then update/remove the `[S19]`/`[S20-V4-#4]`/`[S20-V4-#12]` tests that read them, and the `focus`/phase tests that import them.
3. **Possible: fold "+ New type"** (add your own waste *type*, not just drain) into LogStep — Scene 8 mentioned it; only "add your own drain" is built.
4. Stale capture screenshots `08-drilldown-*`/`09-…`/`11-…`/`12-…` may remain in `e2e/screenshots/` from the old flow — harmless, the spec no longer generates them.

## Decisions made (non-obvious)
- **Option C, headers name-only:** Mona's downloaded pick (`Feedback Log/focuslab-merge-notes.txt`) = "C — Guided one-pass" + "remove the subcopy with the main headings." So LogStep type headers show `group.type.name` only, never the `.hint`.
- **Merge is a SIMPLIFICATION, not a risk:** the engine (`runAudit`) only needs `entries` (drain→hours) + context; it never needed the two-pass `vitalCategories`/`categoryEstimates` artifacts. LogStep computes Pareto directly. ResultsView reads only `paretoResult`.
- **Kept IntakeStep/DrilldownStep files** rather than delete-and-rewire-tests in the same pass (flagged as cleanup #2). Their whole-week heads-up + min-5 copy still live there too.
- **Seed 1 hr on chip select** in LogStep so a picked drain counts toward the min-5 gate; user adjusts inline.
- **Earlier in session I over-removed then corrected:** restored the BenchmarkProof stats section (Mona only wanted its top copy gone); removed the Scene-8 hover and the Payoff math-ⓘ that I'd added earlier once she called them redundant.

## Open questions waiting on user
- None blocking. Mona is reviewing the live merged analyzer. Possible follow-ups: the merged screen's UX feel, whether to add "+ New type", deleting the dead Intake/Drilldown files.

## Critical file paths
- **Merged logging screen:** `src/components/analyzer/LogStep.tsx` (Option C) — the new heart of the analyzer
- **Wizard wiring:** `src/components/analyzer/AuditWizard.tsx`, `src/components/analyzer/Stepper.tsx`
- **Engine (unchanged):** `src/lib/engine/audit-logic.ts` (`runAudit`), `src/lib/engine/solutions-logic.ts`
- **Waste data:** `src/lib/data/waste-sources.ts` (`WASTE_TYPES`, `wasteTypeForMuda`), `src/lib/data/solutions.ts` (verb-form titles)
- **Focus:** `src/components/focus/{SolutionPicker,FocusTable,EviMatrix,Payoff}.tsx`
- **Hero + Magic UI:** `src/components/landing/Hero.tsx`, `src/components/ui/border-beam.tsx`
- **Tests:** `src/__tests__/feedback-regression.test.ts` (330 tests)
- **Mockups/notes:** `Feedback Log/2026-06-25-logging-merge-3-options.html`, `Feedback Log/focuslab-merge-notes.txt`, `Feedback Log/focuslab-v4-review-notes.txt`, `Feedback Log/2026-06-25-v4-implementation-plan.html`

## Known gotchas
- **Deploy = `npx vercel --prod --yes` then verify** — `git push` alone does NOT deploy. (origin IS pushed this session.)
- **Pre-commit hook** `.claude/hooks/verify-done.sh` hard-blocks on tsc/test fails, banned colors, window hacks, Hanken, corporate emoji, green states, SCORE_FROM_LEVEL. 11 checks.
- **Playwright `text=` strict-mode:** "Log your week" now matches the Stepper label twice + the h2 — use `getByRole("heading", …)`.
- **`whileInView` renders blank in full-page screenshots** — use `animate` for above-the-fold/screenshot-verifiable content.
- **`solutions.ts` titles use literal `–`/`“` escapes** — but the Edit tool matched real en-dash/curly-quote chars fine this session.
- Banned: green for success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for CTA/success/selected. SCORE_FROM_LEVEL = 2/3/4.
- 330 tests is the ratchet — never regress.

## How to resume work
1. Read this file top to bottom + the latest `Session Log/` entry + memory [[feedback_solve_hard_problems]].
2. `git status` + `git log --oneline -8` (newest = `5e5679a`).
3. `npx vitest --run` → **330 passed**; `npx tsc --noEmit` clean.
4. Ask Mona how the live merged analyzer feels, then pick up the cleanup (#2) and any new feedback. Build the hard things head-on, ship each batch green, deploy, verify — do NOT ask yes/no questions or defer the difficult items.
