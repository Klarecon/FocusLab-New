# Session 19 — Redesign Port to Production

**Date:** 2026-06-24
**Owner:** Mona Mehta
**Theme:** Iterated the Oren-redesign mockup (v2→v4 + merged-logging-step), then **stopped mockups and started porting into the real app**, shipping 3 batches to production.

---

## Arc of the session

1. **Inline-notes review system.** Mona was reviewing the v2 mockup and wanted to leave notes per section without tab-switching. Built a `-REVIEW.html` system: a pink note box per section, per-option notes, "pick one" controls, auto-save to localStorage, and a **Download my notes (.txt)** button. She prefers downloading the `.txt` and handing it back over pasting — Claude reads it from `~/Downloads`.

2. **Mockup iteration v2 → v3 → v4.** Each round Claude read her downloaded `.txt`, applied every note, and produced the next version. Key changes landed across rounds: hero = her exact subcopy + "Find my hidden hours"; collapsed option-picks; multiple fixes per drain; matrix labels restored to the originals (Pearls/Oysters/Low-Hanging Fruit/White Elephants) then emojis made literal (💎🦪🍒🐘); waste-types "add your own" + role-specific; math behind an ⓘ; min-5 drains rule; payoff Magic-UI styling.

3. **Merged logging step.** Mona asked to fold the "four waste types" (Scene 8) into the logging step (Scene 3) without adding much text. Built `Feedback Log/2026-06-24-merged-logging-step.html` — types become slim group headers + a 3-word fix hint, rationale behind one affordance. She then said: remove the colored circles (done), keep the right-side hint, and **make the "why are these grouped?" affordance HOVER, not click**.

4. **"Implement on the tool."** Mona: stop making mockups, build the changes into the real app, **don't ask permissions — not even yes/no questions**, deploy without asking. From here it was real code.

---

## Shipped to production (3 batches, all live + verified)

| Commit | Batch | Summary |
|--------|-------|---------|
| `dbdcb38` | 1 | Landing: hero/FinalCTA copy, new **HowItWorks** section, removed ToolCards + BenchmarkProof; Matrix emojis 💎🦪🍒 + "skip these" label |
| `ee47bc5` | 1b | De-knowledge-work **metadata** sweep (live homepage = 0 "knowledge worker") |
| `7b2f614` | 2 | Pareto **minimum-5-drains** guard in `DrilldownStep` |

- **Tests: 293 → 306** (+13). New under `[S19]` in `feedback-regression.test.ts`.
- Every batch: tsc clean + full vitest + `next build` + greps + Playwright screenshots **read** + pre-commit gate hook + `npx vercel --prod --yes` + live verification.

---

## Key decisions
- **Pearls = 💎** (no literal pearl emoji exists; ⚪/🤍 offered, not objected to).
- **ToolCards/BenchmarkProof files kept in `src/`** (removed only from `page.tsx`) so old `[S7]` tests pass.
- **Min-5 drains is a HARD gate.**
- **Hero kept the WeekCalendar** visual; only copy changed → left a 50–70%-vs-"10 hours" tension to reconcile later.
- **Incremental shipping:** each batch deployed independently once green.

---

## What's NOT done (next session, ordered)
**Safe polish:** (1) Payoff "show the math" behind a HOVER tooltip; (2) remove the blank-state Hours prompt in FocusTable; (3) Payoff Magic-UI styling; (4) over-cap copy.
**Big/architectural:** (5) Analyzer four-waste-types merge + HOVER tooltip — the real wizard groups by 17 activity-areas wired into a 2-pass Pareto funnel; regrouping to 4 muda-types touches IntakeStep + the store + Pareto pass-1; (6) Focus inline-scoring merge (~3 components); (7) Hero 50–70%-vs-10hrs reconcile.

Rough estimate to finish all: **~2–3.5 hours**, dominated by items 5 & 6.

---

## Gotchas surfaced
- Deploy = `npx vercel --prod --yes` (NOT git push). **`git push` to GitHub was NOT done this session.**
- Edit tool can't match an `old_string` containing the em-dash in `solutions-logic.ts` verb lines — edit around them.
- `whileInView` renders blank in full-page screenshots; use `animate` for below-fold content.

---

## Resume Prompt (paste to start next session)

> Read `.claude/PROJECT_STATE.md` (Session 19) top to bottom. We're porting the approved Oren-redesign mockups into the real app and shipping each batch to production. 3 batches are live; `npx vitest --run` should show **306 passed**, tsc clean. The spec is `Feedback Log/2026-06-24-oren-redesign-mockup-v4.html` + `Feedback Log/2026-06-24-merged-logging-step.html` (the "why are these grouped?" tooltip must be HOVER, not click). Start with the **safe-polish** batch (Payoff math-behind-hover, remove the blank-state Hours prompt, Payoff Magic-UI styling), then approach the **analyzer four-waste-types merge** and **focus inline-scoring merge** deliberately — don't break the 17-group / 2-pass Pareto funnel. Build with sensible defaults, ship each batch green (tsc + vitest + build + screenshots + gate hook), deploy with `npx vercel --prod --yes`, verify live. **Do NOT ask Mona yes/no questions or for permission mid-task.** Consider `git push` to sync GitHub.
