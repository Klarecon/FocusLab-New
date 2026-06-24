# FocusLab Project State

**Last updated:** 2026-06-24 by Claude via /handover (Session 18)

## Quick orient
- **Project:** FocusLab — productivity tool suite helping people find time waste (Pareto Analyzer at `/analyzer`) and fix it (Focus Table & EVI Matrix at `/focus`). The two routes are SEPARATE, not a single flow.
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Awaiting Mona's **option picks** on the new redesign v2 mockup (`Feedback Log/2026-06-24-oren-redesign-mockup-v2.html`). All 24 of her feedback notes are applied there. **Nothing from the redesign is built into `src/` yet** — strict mockup-first.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner, content marketing + ad background, first business plan. Works with **Oren Yonash** (methodology creator). Wants FAST autonomous execution. **NEW THIS SESSION (important): do NOT ask her yes/no decision questions — when the substantive choices are made, build the WHOLE thing with sensible defaults and report. She reacts to finished artifacts, not questions.** Show HTML mockups and get approval BEFORE touching real code on anything design-related. Routine tool calls reading like "permission asks" annoy her.

## Branch state
- On `main`, origin/main at **`d3af783`** (Session 17 handover). **No new commits this session** — nothing was committed.
- **UNCOMMITTED carryover from Session 17 (still not committed):**
  - `package.json` + `package-lock.json` modified; `components.json` (new); 5 new files in `src/components/ui/`: `bento-grid.tsx`, `animated-circular-progress-bar.tsx`, `animated-beam.tsx`, `particles.tsx`, `button.tsx` — the 4 Magic UI components, palette-adapted, tsc-clean, nothing imports them yet. Commit when the redesign build starts.
  - New deps: `@radix-ui/react-icons`, `class-variance-authority`, `motion`.
- **New untracked files this session (docs/mockups, not code — safe to leave or commit as marketing):**
  - `Feedback Log/2026-06-24-oren-redesign-mockup-v2.html` — the v2 mockup (15 scenes, all 24 notes)
  - `Feedback Log/2026-06-24-oren-redesign-plan.html` — rewritten plan (was modified)
  - `Feedback Log/2026-06-24-session-18-feedback-log.html` — the 24-note feedback log
  - `Feedback Log/saved-sections/` — archived ToolCards + BenchmarkProof + restore README
  - `Feedback Log/v2-screens/` — QA screenshots
  - `Session Log/Session 18 — Oren Redesign v2 Mockup.md`
  - `Content/how-i-changed-working-with-claude-code.md` — workflow explainer for her writing

## What's done in this session (2026-06-24, Session 18)
Full narrative in `Session Log/Session 18 — Oren Redesign v2 Mockup.md`.
1. Mona reviewed the S17 mockup + live homepage and gave **24 feedback notes** one at a time. Collected silently, then planned, then built.
2. **Built a brand-new v2 mockup** (`2026-06-24-oren-redesign-mockup-v2.html`, 15 scenes) applying all 24 notes. "Give me options" items show 2–3 side-by-side visual options. Real CSS animations (ring draw, particles, beam, CTA pulse).
3. **Archived the two removed homepage sections** to `Feedback Log/saved-sections/` (ToolCards = "Two tools. One mission."; BenchmarkProof = "This isn't guesswork.") with a restore README — Notes 1 & 2.
4. **Resolved 3 direction questions** with Mona: hero = bold + animated; blank-states = make clearer (keep idea); intake = one screen.
5. **QA:** banned-color grep clean, div balance 296/296, Playwright-rendered + visually read 3 screenshots (hero/matrix/payoff) — matrix overlap fixed, gauge overflow fixed.
6. Wrote `Content/how-i-changed-working-with-claude-code.md` (explainer about her QA/agents/E2E workflow change).
7. Updated memory `feedback_workflow_preferences` with the "no yes/no questions, finish then inform" rule.

## What's next (for the NEXT Claude session)
1. **Get Mona's option picks** on the v2 mockup's 7 PICK items: hero A/B/C (Notes 4/5/12), plan headline + subtext (8/9), payoff A/B (16), over-cap A/B (19), show-the-math A/B (21). Do NOT ask yes/no — if she's vague, pick the strongest default and build.
2. **Port the approved mockup into the live app (Phase 3).** Order: remove ToolCards + BenchmarkProof from `page.tsx`; rebuild Hero (`src/components/landing/Hero.tsx`) using the chosen option + the Magic UI components; analyzer one-screen intake + "Add your own"; blank-rating hard-block validation; EVI matrix overlap fix (keep labels); de-knowledge-work copy sweep; payoff rework; four-waste-types "how it helps"; show-the-math; over-cap clarity.
3. **Commit the Magic UI install** (`components.json` + 5 ui files + package.json) as part of the first redesign commit.
4. **Heavier follow-ups, scoped separately:** (a) Note 3 — expand the database/copy past knowledge work to any worker; (b) Note 15 — enforce a Pareto minimum-sources rule in the engine (coach to add more below the threshold).
5. **Each ported item gets a feedback-regression test** (esp. Note 22 blank-rating block). Keep the 293-test ratchet. Deploy via `npx vercel --prod --yes`, then verify — NOT git push.

## Decisions made (non-obvious)
- **Mockup-first is absolute this session.** Every one of the 24 notes was applied to a mockup only; `src/` untouched. Mona will pick options on the mockup before any code changes.
- **3 direction calls:** hero kept bold + animated (ring/particles/beam, not a calm version); blank-states section kept (just rebuilt for clarity); two intake screens collapsed to one.
- **Notes 1 & 2 sections were archived, not deleted** — restorable from `Feedback Log/saved-sections/`.
- **CTA / hero "10 hours" reframed:** the number now reads as a stat ("the average person loses ~10 hrs/wk"), not a personal guarantee, because Mona said the reclaim isn't a fixed 10 for everyone (Note 12).
- **"White Elephants" label kept**, only its descriptor changed from "drop or delegate" → "skip these — low payoff" (Note 23 + the keep-labels rule of Note 14).
- **Hours over %** is the final call (Note 18) — no percentage mode to build.
- Carryover from S17 still true: deploy is `npx vercel --prod --yes` (NOT git push); blank dots = unrated (0/0) excluded from matrix/payoff; effort dots gold, impact pink; SCORE_FROM_LEVEL = 2/3/4.

## Open questions waiting on user
- Mona's **option picks** on the 7 PICK items in v2 mockup.
- (Possibly for Oren later) the data-expansion scope for non-knowledge-work roles.

## Critical file paths
- `Feedback Log/2026-06-24-oren-redesign-mockup-v2.html` — **the spec to build from** (15 scenes, options inline)
- `Feedback Log/2026-06-24-oren-redesign-plan.html` — grouped change plan + build sequence
- `Feedback Log/2026-06-24-session-18-feedback-log.html` — all 24 notes + dispositions
- `Feedback Log/saved-sections/` — archived removed homepage sections + restore README
- `src/app/page.tsx` — renders Hero, ToolCards, BenchmarkProof, FinalCTA (ToolCards + BenchmarkProof to be removed)
- `src/components/landing/Hero.tsx` — current hero to combine with the chosen mockup option
- `src/components/landing/{ToolCards,BenchmarkProof}.tsx` — to remove (already archived)
- `src/components/ui/{bento-grid,animated-circular-progress-bar,animated-beam,particles,button}.tsx` — Magic UI, palette-adapted, uncommitted
- `src/lib/engine/{pareto,solutions-logic}.ts` — Pareto engine (Note 15 minimum-sources) + isRated/quadrant/SCORE_FROM_LEVEL (Note 22 validation)
- `src/components/focus/{FocusTable,EviMatrix,Payoff}.tsx` — matrix overlap, payoff rework, rating validation

## Known gotchas
- **Deploy with `npx vercel --prod --yes`, then verify with `npx vercel ls focuslab --prod` (newest = ● Ready). git push alone does NOT deploy.**
- **pnpm is NOT installed** — use `npx shadcn@latest ...` for component installs.
- Playwright IS available locally; run render scripts from the project root (not `$TMPDIR`) so `require('playwright')` resolves.
- Pre-commit hook (`.claude/hooks/verify-done.sh`) hard-blocks on tsc errors / test failures / banned colors — clean tsc + vitest before committing.
- 293 tests is the ratchet — never regress. No app tests ran this session (no app code changed).
- **Do NOT ask Mona yes/no questions** — build with defaults, then report.

## How to resume work
1. Read this file top to bottom.
2. `git status` and `git log --oneline -5` (origin/main = `d3af783`; Magic UI install still uncommitted; v2 mockup + logs untracked).
3. Open `Feedback Log/2026-06-24-oren-redesign-mockup-v2.html`, get Mona's option picks, then port into the app per the plan — without asking yes/no questions.
