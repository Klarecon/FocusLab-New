# Session 22 — Saved-State Resolution + Cleanup

**Date:** 2026-06-27
**Branch:** main → `b7314bc` (pushed + deployed to prod, alias verified live)
**Tests:** 336 → 333 (net −6 obsolete two-pass tests removed, coverage re-pointed, S22 added)

## Context
Resume session. Picked up the open thread from Session 21 (saved-state-on-reopen) plus carried-over cleanup. Along the way, fixed two broken hooks and a fullscreen-TUI display annoyance that Mona kept reading as a "blank screen." Mona explicitly asked for **brevity** this session.

## What happened, in order
| # | Work | Commit | Outcome |
|---|------|--------|---------|
| 1 | **Hook fix** — both `.claude/settings.json` hooks had unquoted `${CLAUDE_PROJECT_DIR}`; the space in "FocusLab New" split the path → ran old `/Users/monamehta/Documents/FocusLab` dir as a command ("is a directory"). Pre-commit gate had silently NOT been firing. | `5c207dd` | **Shipped.** Quoted both paths; verified stop-gate exit 0. |
| 2 | **Role-step "Start fresh" button** — conditional pink link + window.confirm, wired to `reset()`. | `ff2d4d1` | **Shipped, then superseded** by #4 (see decisions). |
| 3 | **Dead-file cleanup** — deleted `IntakeStep.tsx`, `DrilldownStep.tsx`, `border-beam.tsx` (~1,171 lines). Re-pointed live requirements onto `LogStep`; removed obsolete two-pass tests; fixed `WIZARD_STEPS` in visual test. | `f27ef31` | **Shipped.** Also caught + fixed a copy regression (the word "only" had crept back into LogStep's min-drain message). |
| 4 | **Smart resume** — `AuditWizard` hydration now keeps a finished audit (jump to Results) but discards a half-finished draft (`reset()`) on reopen. Removed the now-redundant Role-step button. | `b7314bc` | **Shipped.** This resolves S21's open saved-state question. |
| 5 | **"Blank screen" fix** — was `~/.claude/settings.json` `"tui": "fullscreen"`. Changed to `"tui": "default"`. | (config, not committed to repo) | **Done.** Needs a Claude Code restart to take effect. |

## How the work flowed
- Opened with the session-start ritual (PROJECT_STATE + latest log + tsc/vitest baseline = 336 green).
- Mona flagged the "is a directory" stop-hook error visible in her terminal → traced to the space-in-path bug, fixed both hooks.
- Discussed the saved-state question. I recommended **smart resume** (keep finished audits, discard drafts). Mona asked for the recommendation in plain English, signed off, said "ship it."
- Before smart resume, I shipped the Role-step button (`ff2d4d1`) and the dead-file cleanup (`f27ef31`). When Mona couldn't find the button (she landed on Results, not Role), I discovered `AuditWizard` auto-jumps finished audits to Results — so the button was invisible to the people who needed it. That informed the smart-resume design, which made the button redundant (removed in `b7314bc`).
- Mona repeatedly saw a "blank screen" → identified it as fullscreen TUI mode, switched to default renderer.
- Each code change ran the full gate: tsc clean, tests green, verify-done 11/11, screenshots captured + reviewed where UI changed, deployed via `vercel --prod`, alias verified by curl/inspect.

## Gotcha logged this session
- **A `vercel --prod` run got truncated and did NOT finish aliasing.** `vercel inspect focuslab-omega.vercel.app` showed the alias still on the *previous* deploy. Re-ran the deploy, captured full output ("▲ Aliased"), confirmed. Lesson: always verify the alias target (inspect `url` line / curl 200), and don't trust `vercel ls` "Age" column — it showed stale times.

## Decisions made (non-obvious)
- **Smart resume** over always-wipe (destroys finished plans) or one-global-reset-button (only an escape hatch, still shows confusing stale data first). Two kinds of saved state deserve opposite treatment: finished = restore, half-finished = discard.
- **Removed the Role-step button** because the auto-jump to Results means returning users with a finished audit never see the Role step; smart resume makes the Role step always-clean on reopen anyway.
- **Re-point, don't delete, regression tests** when their requirements migrated to LogStep. Net −6 is correct (the two-pass funnel genuinely no longer exists).
- **Engine untouched** per [[feedback_agent_boundaries]] — smart resume is wizard-hydration state behavior, not Pareto math.

## State at session end
- All threads resolved. Working tree clean, `b7314bc` pushed + deployed, alias live, 333 tests green, gate 11/11.
- No open questions waiting on Mona.

## Resume Prompt (for the next session)
> Read `.claude/PROJECT_STATE.md` (updated 2026-06-27, Session 22) top to bottom, then the latest `Session Log/` entry. Run `git log --oneline -6` (newest = `b7314bc`), `npx vitest --run` (expect 333 passed), `npx tsc --noEmit` (clean). There are NO half-finished threads — the S21 saved-state question is resolved (smart resume) and the dead-file cleanup is done. Ask Mona what she wants next and keep replies SHORT (she asked for brevity). Deploy = `npx vercel --prod --yes` then verify the alias with `vercel inspect focuslab-omega.vercel.app` / curl `/analyzer` for 200.
