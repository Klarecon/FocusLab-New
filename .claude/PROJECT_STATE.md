# FocusLab Project State

**Last updated:** 2026-06-25 by Claude via /handover (Session 21)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main == local == `8f33188`, fully pushed + deployed to prod, alias verified live)
- **Active work:** Mona's **walkthrough of the live merged analyzer** (Session 21). All 6 actioned items shipped & live. One item dropped, one open question.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution, NO permission/yes-no questions, deploy without asking, reacts to finished artifacts. **This session's hard lesson:** she gave a screen-recording reference (`Feedback Log/animation.mov`) for the hero beam and I sent a mockup TWICE without rendering it — both were frozen/wrong. She pushed back ("so you think your version matches this?"). Fix: I now **screenshot mockups headlessly and LOOK before sending**, not just the real app. Then she rejected the beam entirely.

## Branch state (this session's commit, deployed + pushed)
- `8f33188` **Session 21: Mona's merged-analyzer walkthrough fixes** ← the only new commit this session
- Deploy = `npx vercel --prod --yes` (auto-aliases to focuslab-omega). Shipped green + live-verified (curled prod: serves "Log your waste", no "Log your week", no beam refs). Tracked tree is clean.

## What's done this session (Session 21, 2026-06-25)
Mona walked the live 4-step merged analyzer and gave 7 notes. Outcome per item:
1. **[shipped] Duplicate approval drains merged.** `mgr-approvals` ("Low-stakes approvals routed through you") now `scope: ["manager","executive"]` with `emoji: "👎"` (was Admin emoji). Deleted `exec-decide-through-you` (the executive-scoped near-duplicate that showed alongside it when both roles were picked). Repointed its solution refs: removed from `ALL_COORD` and `delegate-ic`; in `protect-strategy` replaced with `mgr-approvals`. Removed its `BENCHMARK_CATEGORY_BY_SOURCE` entry. `waste-sources.ts`, `solutions.ts`.
2. **[shipped] "Log your week" → "Log your waste"** in `LogStep.tsx` (h2), `Stepper.tsx` (step label), `landing/HowItWorks.tsx` (step title). No "Log your week" remains in src/.
3. **[shipped] "Where's the C zone?"** Root cause: `LogStep.toggleSource` auto-seeded `hoursPerDay: 1` on every chip pick, so untouched data was flat → Pareto put top-2 in A, rest in C, **B came out empty**. Fix: **removed the auto-seed** (both chip pick + custom-add) so users type real hours → varied hours → A/B/C populate. Gate copy updated to nudge entering hours. Added a **flat-data safety net** in `ResultsView.tsx` (`isEvenlySpread` — when all drains have identical hours, show a "your time's spread evenly, no single vital few" 🫠 banner instead of a misleading 2-zone chart). Verified on screenshots: chart now shows red A + gold B ("Also eating your time") + grey C ("The small stuff").
4. **[shipped] Results→Focus CTA** stronger. "This is fixable." → **"You've seen the bleed. Now stop it."** (bolder, ink color); CTA "Now let's fix it →" → **"Build my plan →"**. `ResultsView.tsx`.
5. **[DROPPED]** Action-Sequence timing guidance ("Start this week · ~30–60 min"). Mona: "don't give any suggestions for now, none are good." `EviMatrix.tsx SEQUENCE_GUIDANCE` left UNCHANGED.
6. **[shipped] Closing space → spread-the-word.** `Payoff.tsx` "rest" variant: kept the "You've got a plan…" h3, replaced the subline with **"If this gave you hours back, pass it on — know anyone drowning in busywork?"** + a new `ShareActions` component: **Copy link** (pink, shows "Copied! ✓"), **Share on LinkedIn**, **Email it**. Share URL = `https://focuslab-omega.vercel.app`.
7. **[REMOVED, not added] Hero border beam.** Mona gave `animation.mov` (Magic-UI traveling-comet border) as the target. I built two mockups (the 2nd, with long offset-path laser streaks, was a faithful match — see `Feedback Log/2026-06-25-item7-beam-mockup.html`), but she said **"Leave it, I don't want it. Don't put it on the real site."** So I **deleted the existing frozen `<BorderBeam>` from `Hero.tsx`** (it never animated in her browser anyway — `offset-path: rect()` isn't supported there) and removed the import.

- **Tests: 330 → 336.** Flipped the old `[S7]` CTA assertions and the `[S20-V4-#6]` "has a BorderBeam" assertion (now asserts NO beam). Added a `[S21]` describe block (items 1,2,3,6). Updated `[S20-V4-merge]` stepper assertion to "Log your waste". QA gate (Mona Feedback Agent) ran: **GATE PASSED**, all 7 items with file:line evidence, 153 feedback-regression tests green.
- **Capture spec updated** (`e2e/capture-screens.spec.ts`): heading "Log your waste"; chips no longer auto-seed so it now types a varied hour spread `[5,3,2,1.5,1,0.5]`; bumped the post-compute wait to 4500ms so the 3.5s dramatic reveal finishes before the results screenshot.

## What's next (for the NEXT Claude session) — ordered
1. **OPEN — saved-state behavior (Mona's last live question).** She asked "When I open the app for review, there's previous selections. why so?" → it's the Zustand `persist` (`localStorage` key `focuslab-audit`, `partialize` saves everything except `step`). I offered 3 options (add a "Start fresh" button on the Role step / always-wipe-on-load / leave as resume) via AskUserQuestion; **she rejected the question and ran /handover, so it's UNRESOLVED.** Pick this up first. NOTE: a returning user's saved state from before this deploy still holds OLD 1.0-hr seeds — she must hit "Start over with a fresh audit" (Results screen → `reset()`) to test item 3 cleanly.
2. **Cleanup (carried over from S20 + new):** delete the now-unused `src/components/analyzer/IntakeStep.tsx` + `DrilldownStep.tsx` (mounted nowhere; kept only so their grep regression tests pass — update/remove `[S19]`/`[S20-V4-#4/#8/#12]` tests that read them). NEW: `src/components/ui/border-beam.tsx` is now unused (beam removed) — safe to delete too.
3. Possible: fold "+ New type" (add your own waste *type*) into LogStep — only "add your own drain" is built.
4. Stale capture screenshots `08-drilldown-*`/`09/10/11/12-*` remain in `e2e/screenshots/` from the old flow — harmless.

## Decisions made (non-obvious)
- **Item 1 merge, not hide:** the two drains only collide when manager+executive are both picked (LogStep merges role pools). Rather than suppress one at render time, merged at the data layer so a pure executive now gets "Low-stakes approvals" too. Safe because no tests referenced the deleted slug/label.
- **Item 3 is a SIMPLIFICATION, not an engine change:** Mona didn't understand my 3 options, so I re-explained plainly and she picked "stop the auto-fill." I did NOT touch the Pareto engine (`pareto.ts` zone math) — per [[feedback_agent_boundaries]], methodology changes need her sign-off. The auto-seed removal alone makes zones populate.
- **Beam: build the mockup, screenshot-verify, THEN show.** I burned two sends by trusting un-rendered CSS (`@property`+mask conic, then a soft conic ring). The faithful version uses `offset-path: path(<rounded-rect>)` with long blurred gradient streaks + `offset-rotate: auto`. Moot now (she killed it) but the technique is in `Feedback Log/2026-06-25-item7-beam-mockup.html` if ever revived.
- **Item 5 left untouched on purpose** — she explicitly said no suggestions were good; don't invent new ones unprompted.

## Open questions waiting on user
- **Saved-state on reopen (item 1 of What's-next).** Resume vs always-fresh vs add a visible "Start fresh" button. Unresolved.

## Critical file paths
- **Merged logging screen:** `src/components/analyzer/LogStep.tsx` (no more auto-seed)
- **Results + zones + CTA + flat-data net:** `src/components/analyzer/ResultsView.tsx`
- **Wizard/stepper:** `src/components/analyzer/AuditWizard.tsx`, `Stepper.tsx`
- **Engine (UNCHANGED):** `src/lib/engine/pareto.ts` (zone math), `audit-logic.ts` (`runAudit`)
- **Waste data:** `src/lib/data/waste-sources.ts` (mgr-approvals merged), `solutions.ts` (refs repointed)
- **Share row + closing:** `src/components/focus/Payoff.tsx` (`ShareActions`)
- **Hero (beam removed):** `src/components/landing/Hero.tsx`
- **Store/persistence:** `src/stores/audit-store.ts` (`persist`, key `focuslab-audit`, `reset()` at ~L273)
- **Tests:** `src/__tests__/feedback-regression.test.ts` (336 tests; `[S21]` block at bottom)
- **Mockups/notes:** `Feedback Log/2026-06-25-session21-options-mockup.html`, `2026-06-25-item7-beam-mockup.html`, `animation.mov` (Mona's beam reference)

## Known gotchas
- **Deploy = `npx vercel --prod --yes` then verify** — `git push` alone does NOT deploy. (origin IS pushed this session; prod alias verified via curl.)
- **Pre-commit hook** `.claude/hooks/verify-done.sh` hard-blocks on tsc/test fails, banned colors, window hacks, Hanken, corporate emoji, green states, SCORE_FROM_LEVEL.
- **Screenshot mockups before sending them to Mona** — not just the real app. Headless Playwright via the project's `node_modules/playwright`, captured cropped/mid-animation. See [[feedback_visual_verification_pipeline]].
- **localStorage persistence** means YOUR review state carries over between loads; old pre-deploy state can mask new behavior — `reset()` / "Start over" to clear.
- **Dramatic reveal overlay** on Results runs 0.5s→3.5s; screenshot/verify AFTER 3.5s or you capture the dark "$X/year" overlay, not the chart.
- **Playwright `text=` strict mode:** "Log your waste" matches the Stepper label + h2 — use `getByRole("heading", …)`.
- Banned: green for success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for CTA/success/selected. SCORE_FROM_LEVEL = 2/3/4.
- **336 tests is the ratchet — never regress.**

## How to resume work
1. Read this file top to bottom + the latest `Session Log/` entry + memory [[feedback_visual_verification_pipeline]] and [[feedback_solve_hard_problems]].
2. `git status` + `git log --oneline -8` (newest = `8f33188`).
3. `npx vitest --run` → **336 passed**; `npx tsc --noEmit` clean.
4. Resolve the saved-state question (What's-next #1), then the dead-file cleanup (#2). Build hard things head-on, ship green, deploy with `vercel --prod`, verify the live alias. No yes/no questions; no deferring.
