# FocusLab Project State

**Last updated:** 2026-06-24 by Claude via /handover (Session 19)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste, a 5-step wizard) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main was `ec4b497`; this session added 3 commits — newest local is `7b2f614`)
- **Active work:** Porting the approved Oren-redesign mockups into the REAL app. Session 18 was mockup-only; **Session 19 started building into `src/` and shipping to production.** 3 batches shipped & live; more remain.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution. **Do NOT ask yes/no questions or for permission mid-task — build with sensible defaults, then report.** Deploy without asking. She reacts to finished artifacts. This session she explicitly said: stop making mockups, implement on the real tool, don't ask permissions "not even yes/no questions."

## Branch state (3 new commits this session, all deployed to prod via Vercel; NOT yet `git push`ed)
- `7b2f614` Redesign port (batch 2): Pareto minimum-5-drains guard
- `ee47bc5` De-knowledge-work sweep: page metadata
- `dbdcb38` Redesign port (batch 1): landing copy + matrix emojis
- NOTE: these are committed locally + DEPLOYED to Vercel production, but **`git push` to GitHub origin has NOT been run** — run `git push` next session if you want GitHub in sync. (Deploy is via `npx vercel --prod --yes`, independent of git push.)
- Working tree clean (tracked). Untracked: the mockup HTMLs in `Feedback Log/`, downloaded review `.txt` files, scratch docs — safe to leave.

## What's done this session (Session 19, 2026-06-24)
### Phase A — mockup iteration (in `Feedback Log/`, no code)
- Built an **inline-notes review system**: each mockup version got a `-REVIEW.html` with a pink note box per section + per-option notes + "pick one" controls + a **Download my notes (.txt)** button (auto-saves to localStorage). Mona prefers downloading the `.txt` over pasting — Claude reads it from `~/Downloads`.
- Iterated mockups **v2 → v3 → v4** applying her downloaded feedback each round. Latest full mockup: **`Feedback Log/2026-06-24-oren-redesign-mockup-v4.html`**.
- Built a focused **`Feedback Log/2026-06-24-merged-logging-step.html`** — folds the "four waste types" into the logging step as slim group headers + a "why are these grouped?" affordance. **Mona's last mockup note: that affordance must be HOVER, not click.**

### Phase B — REAL CODE shipped to production (the important part)
All 3 batches: tsc clean + full vitest + `next build` + banned-color/window/emoji greps + Playwright screenshots read + pre-commit gate hook + deployed + live-verified.
1. **Batch 1 (`dbdcb38`) — landing + matrix emojis:**
   - `Hero.tsx`: eyebrow "knowledge workers" → "any kind of work"; headline → "Get real hours of your week back"; subcopy → Mona's exact "A working person loses about 10 hours a week to busywork…" line; CTA → "Find my hidden hours".
   - `FinalCTA.tsx`: de-knowledge-work + CTA matched to "Find my hidden hours".
   - `page.tsx`: removed `<ToolCards/>` + `<BenchmarkProof/>` (Notes 1 & 2). The `.tsx` files still exist in `src/components/landing/` (unused) so their old regression tests keep passing; archived copies also in `Feedback Log/saved-sections/`.
   - **NEW** `src/components/landing/HowItWorks.tsx` — "How it works" 3 steps + "Why it's not another time-tracker" 4-card bento + proofline (approved scene-2 copy). Uses `animate` (NOT `whileInView`) so it renders even below the fold.
   - **Matrix emojis now literal:** Pearls `💎`, Oysters `🦪`, Low-Hanging Fruit `🍒` (White Elephants `🐘` unchanged) — updated in `solutions-logic.ts` QUADRANT_META, `EviMatrix.tsx` count pills, `FocusTable.tsx` Pearl badge. White Elephants label "drop or delegate" → "skip these — low payoff" (Note 23).
2. **Batch 1b (`ee47bc5`) — metadata:** `layout.tsx` + `analyzer/page.tsx` meta descriptions de-knowledge-work'd + dropped the inaccurate "upload your calendar" claim. Live homepage now has **0** "knowledge worker".
3. **Batch 2 (`7b2f614`) — Pareto min-5 guard:** `DrilldownStep.tsx` now requires **≥5 drains with hours** before "Show me the damage" (was ≥1). Below 5 it coaches: "Log at least 5 drains so we can spot your vital few — you've got N." (Note 15 + mockup scenes 12 & 14; Mona: "needs minimum 5".)
- **Tests: 293 → 306** (+13 ratchet). New tests live in `src/__tests__/feedback-regression.test.ts` under `[S19]`.

## What's next (for the NEXT Claude session) — ordered
**Safe polish (low risk, do first):**
1. **Payoff "show the math"** → put the breakdown behind a HOVER tooltip (currently auto-shows when reclaim < 15%). File: `src/components/focus/Payoff.tsx` ~lines 279-301.
2. **Blank-state Hours prompt:** remove the prompt on the Hours field (effort keeps "tap to rate"). File: `src/components/focus/FocusTable.tsx` (DotRating ~lines 37-78) / wherever the Hours blank prompt lives.
3. **Payoff Magic-UI styling pass:** SparklesText / ShimmerButton / Particles / BorderBeam (components already in `src/components/ui/`). File: `Payoff.tsx`.
4. **Over-cap copy** de-chunk if any chunky bolded messages remain (mostly fine already).

**Big / architectural (do deliberately — these diverge from the real app; don't break the working Pareto funnel):**
5. **Analyzer "four waste types" merge + HOVER tooltip** (the thing Mona spent the most energy on). REALITY: the real wizard groups drains by **17 activity-areas** (`group` field), and the store keys `categoryEstimates` + `vitalCategories` by `group` across a **two-pass Pareto funnel** (IntakeStep estimates by category → DrilldownStep details → ResultsView). The mockup wants grouping by **4 muda-types**. Merging means reconciling 17 groups → 4 types and reworking IntakeStep + the store + Pareto pass-1. Spec: `Feedback Log/2026-06-24-merged-logging-step.html` (tooltip = HOVER). Files: `src/components/analyzer/{IntakeStep,DrilldownStep}.tsx`, `src/stores/audit-store.ts`, `src/lib/data/waste-sources.ts` (has `muda` field for the mapping).
6. **Focus inline-scoring merge:** mockup wants effort/impact rated inline on the plan (no separate screen). Multiple-fixes-per-drain already exists in `SolutionPicker.tsx`; rating currently lives in `FocusTable.tsx`/`EviMatrix.tsx`. Restructures ~3 components.
7. **Hero visual reconcile:** the `Hero.tsx` `WeekCalendar` still shows a "50–70% waste" stamp, which sits oddly next to the new "about 10 hours" subcopy. Flagged to Mona, not yet resolved.

## Decisions made (non-obvious)
- **Pearls emoji = 💎** — there is no literal "pearl" emoji in Unicode; 💎 (gem) is the stand-in. Claude offered ⚪ / 🤍 as alternatives in the v4 mockup; Mona did not object, so 💎 shipped. Easy to swap if she changes her mind.
- **ToolCards/BenchmarkProof `.tsx` left in `src/`** (just removed from `page.tsx`) so their existing `[S7]` regression tests still pass. Don't delete them without updating those tests.
- **Min-5 drains is a HARD gate**, not a soft nudge (Mona: "needs minimum 5").
- **Hero kept the WeekCalendar visual** rather than swapping in the mockup's ring-gauge — the calendar is a strong working asset; only the copy changed. (Visual reconcile is item 7.)
- **Incremental shipping:** each batch deployed to prod independently once green. The live site only moves forward.
- **Stale `[S7]` tests were rewritten to `[S19]`** when copy changed (eyebrow, headline, subhead, CTAs) — the ratchet tracks current truth, not old copy.

## Open questions waiting on user
- None blocking. Mona said "continue tomorrow morning." Possible future calls: Pearls 💎 vs ⚪/🤍; how aggressive the analyzer type-regroup should be vs. keeping the 17-group structure; the hero 50–70%-vs-10hrs reconcile.

## Critical file paths
- **Mockup spec:** `Feedback Log/2026-06-24-oren-redesign-mockup-v4.html` (full), `Feedback Log/2026-06-24-merged-logging-step.html` (logging merge, hover tooltip)
- **Downloaded feedback:** `Feedback Log/focuslab-v3-review-notes.txt` and any `focuslab-v*-review-notes.txt`
- **Shipped code:** `src/components/landing/{Hero,FinalCTA,HowItWorks}.tsx`, `src/app/{page,layout}.tsx`, `src/app/analyzer/page.tsx`, `src/components/focus/{EviMatrix,FocusTable}.tsx`, `src/lib/engine/solutions-logic.ts`, `src/components/analyzer/DrilldownStep.tsx`
- **Next-up code:** `src/components/focus/{Payoff,SolutionPicker}.tsx`, `src/components/analyzer/{IntakeStep,DrilldownStep}.tsx`, `src/stores/audit-store.ts`
- **Tests:** `src/__tests__/feedback-regression.test.ts` (306 tests; add `[S19]`/`[S20]` items here)

## Known gotchas
- **Deploy = `npx vercel --prod --yes`, then verify** (it auto-aliases to focuslab-omega.vercel.app). `git push` alone does NOT deploy. `git push` to GitHub has NOT been done this session — run it if you want origin in sync.
- **Edit tool + em-dash:** `solutions-logic.ts` verb lines contain an em-dash that the Edit tool couldn't match in a literal `old_string` — edit AROUND those lines or target single unique lines.
- **`whileInView` renders blank in full-page Playwright screenshots** (below-fold elements never trigger). Use `animate` for content that must be screenshot-verifiable (fixed in HowItWorks).
- **Pre-commit hook** `.claude/hooks/verify-done.sh` hard-blocks on tsc/test failures, banned colors, window hacks, Hanken, corporate emoji, green states, SCORE_FROM_LEVEL.
- **Visual verify:** `npx playwright test e2e/capture-screens.spec.ts` → READ screenshots in `e2e/screenshots/` before declaring visual work done. The capture drives the full wizard, so it also proves the min-5 gate doesn't break the flow (it fills ≥5 drains).
- 306 tests is the ratchet — never regress.
- Banned: green for success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for all CTA/success/selected. Effort dots gold, impact pink. SCORE_FROM_LEVEL = 2/3/4.

## How to resume work
1. Read this file top to bottom.
2. `git status` + `git log --oneline -8` (newest local = `7b2f614`; consider `git push`).
3. `npx vitest --run` should show **306 passed**; `npx tsc --noEmit` clean.
4. Open `Feedback Log/2026-06-24-oren-redesign-mockup-v4.html` + `2026-06-24-merged-logging-step.html` as the spec.
5. Continue the port — start with the **safe polish** items (Payoff math-hover, blank-state prompt, Payoff styling), then approach the **analyzer 4-type merge** and **focus scoring merge** deliberately. Build with defaults, ship each batch green, deploy, verify — do NOT ask Mona yes/no questions.
