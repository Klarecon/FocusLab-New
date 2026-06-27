# FocusLab Project State

**Last updated:** 2026-06-27 by Claude via /handover (Session 22)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (origin/main == local == `b7314bc`, fully pushed + deployed to prod, alias verified live)
- **Active work:** Session 22 was mostly **infrastructure + the saved-state question from S21**. Resolved the saved-state question (smart resume), fixed two broken hooks, deleted dead files, and fixed a fullscreen-TUI display annoyance. All shipped + live.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Wants FAST autonomous execution, NO permission/yes-no questions, deploy without asking, reacts to finished artifacts. **This session: she wants brevity** ("I don't want to read all of this, give me a one para summary") — keep replies short. She also kept seeing a "blank screen" which was a display setting, not a bug (see gotchas).

## Branch state (this session's commits, all pushed + the last one deployed)
Four new commits this session, oldest→newest:
- `5c207dd` **Fix hook commands broken by space in project path** — both `.claude/settings.json` hooks had unquoted `${CLAUDE_PROJECT_DIR}`; the space in "FocusLab New" split the path and ran the old `/Users/monamehta/Documents/FocusLab` dir as a command ("is a directory"). The pre-commit verification gate had silently NOT been firing. Quoted both paths.
- `ff2d4d1` **Add 'Start fresh' control on Role step** — (later removed by `b7314bc`; see decisions).
- `f27ef31` **Delete dead files from the analyzer merge; re-point coverage to LogStep** — deleted `IntakeStep.tsx`, `DrilldownStep.tsx`, `border-beam.tsx` (~1,171 lines). Re-pointed still-live regression tests onto `LogStep`; removed the genuinely-obsolete two-pass-only tests. Caught + fixed a copy regression (the word "only" had crept back into LogStep's min-drain message).
- `b7314bc` **Smart resume: keep finished audits, discard half-finished drafts on reopen** — the resolution of S21's open saved-state question. Removed the `ff2d4d1` Role-step button as now-redundant.

Deploy = `npx vercel --prod --yes` (auto-aliases to focuslab-omega). Final deploy `nnxhhegdv` is READY, aliased, `/analyzer` returns 200. Tracked tree is clean.

## What's done this session (Session 22, 2026-06-27)
1. **[shipped] Hook fix (`5c207dd`).** Quoted `bash "${CLAUDE_PROJECT_DIR}/.claude/hooks/…"` for both PreToolUse (pre-commit-gate) and Stop (stop-gate). Verified stop-gate runs exit 0. This means the verification gate is actually firing again.
2. **[shipped, then superseded] Role-step "Start fresh" button (`ff2d4d1`)** — added a conditional pink link + window.confirm. Replaced in `b7314bc` by smart-resume (the button never showed for the users who needed it because of the auto-jump — see decisions).
3. **[shipped] Dead-file cleanup (`f27ef31`).** Deleted `src/components/analyzer/IntakeStep.tsx`, `src/components/analyzer/DrilldownStep.tsx`, `src/components/ui/border-beam.tsx`. All were mounted nowhere after the Option C merge. **Re-pointed (not deleted)** the still-live requirements onto `LogStep`: dedup across merged role pools, no "% you could cut" question, single sticky counter (double-counter guard), unified pink selector, 5-drain minimum + coaching copy, whole-week warning, no waste-type explainer. **Removed** the obsolete two-pass-only tests: vital-categories, per-category totals, overflow gating, MIN_CATEGORIES, the drilldown accordion. Updated `phase-b-visual.test.tsx` `WIZARD_STEPS` to the live steps (Role/Context/Log).
   - **Copy regression caught:** the merge had reintroduced "the pattern **only** shows…" into `LogStep.tsx` — exactly the word S20-V4-#12 had removed. Reworded to "the pattern shows once you vary the numbers…" and re-pointed the guard.
4. **[shipped] Smart resume (`b7314bc`).** Rewrote `AuditWizard.tsx` hydration: if `paretoResult` exists → resume to Results (step 3, where "Start over" lives); else if a partial draft exists (`roleSlug || activeSources.length`) → `reset()` for a clean start. Removed the redundant Role-step button. Swapped the S22 tests to assert the new behavior.
5. **[config, not code] Fixed the "blank screen" annoyance.** It was `~/.claude/settings.json` `"tui": "fullscreen"` (alt-screen renderer parks text low, leaves blank space above on short replies). Changed to `"tui": "default"`. **Requires a Claude Code restart to take effect** (exit + relaunch `claude`).

- **Tests: 336 → 333** (net change: removed 6 obsolete two-pass tests, re-pointed the rest, added/changed S22 tests). tsc clean. Verify gate 11/11. Screenshot reviewed (`03-role-selected`): Role step clean, no stray button.

## What's next (for the NEXT Claude session) — ordered
1. **Nothing is half-finished.** The S21 carry-over items are all resolved this session (saved-state question → smart resume; dead-file cleanup → done). Start by asking Mona what she wants next.
2. **Possible polish (only if asked):** fold "+ New type" (add your own waste *type*) into LogStep — currently only "add your own drain" is built.
3. **Stale capture screenshots** `08-drilldown-*`/`09/10/11/12-*` remain in `e2e/screenshots/` from the old flow — harmless, can be deleted for tidiness.
4. **Pending/never-started features** (don't start unless asked): calendar week viz, before/after comparison, Lottie animations, shareable scorecard card, landing-page copy overhaul.

## Decisions made (non-obvious)
- **Smart resume beats the alternatives.** Two kinds of saved state deserve opposite treatment: a *finished* audit/plan is real work → always restore it (resume to Results); a *half-finished* wizard is a 90-second redo and its stale picks are what confused Mona → discard on reopen. "Always wipe" would destroy finished plans; "one global reset button" only adds an escape hatch but still shows the confusing stale data first. Smart resume removes the confusion at the source AND protects work. Mona signed off before I built it.
- **Why the Role-step "Start fresh" button was removed.** `AuditWizard` auto-jumps returning users with a `paretoResult` straight to Results — so a returning user with a finished audit *never lands on the Role step*, meaning the button was invisible to exactly the people who'd use it. Smart resume makes the Role step always-clean on reopen, so the button is pointless. Removed it.
- **Re-point, don't delete, regression tests.** When deleting `IntakeStep`/`DrilldownStep`, their tests covered requirements that *migrated* into `LogStep`. I re-pointed those to LogStep to preserve coverage and only deleted tests for features that genuinely no longer exist (the two-pass funnel). Net −6 tests is correct, not a coverage loss.
- **Engine untouched.** Per [[feedback_agent_boundaries]], no changes to `pareto.ts` / `audit-logic.ts`. Smart resume is purely wizard-hydration state behavior.

## Open questions waiting on user
- **None outstanding.** Mona was deciding how to handle saved-state-on-reopen; that's now resolved and shipped (smart resume). Next session should just ask what's next.

## Critical file paths
- **Wizard + smart-resume hydration:** `src/components/analyzer/AuditWizard.tsx` (resumeOrReset effect, ~L51)
- **Merged logging screen:** `src/components/analyzer/LogStep.tsx` (no auto-seed; min-drain copy "the pattern shows once you vary the numbers")
- **Role step:** `src/components/analyzer/RoleStep.tsx` (button removed)
- **Results + zones + CTA + flat-data net:** `src/components/analyzer/ResultsView.tsx` (has "Start over with a fresh audit" via onRestart → reset)
- **Engine (UNCHANGED):** `src/lib/engine/pareto.ts`, `audit-logic.ts`
- **Store/persistence:** `src/stores/audit-store.ts` (`persist`, key `focuslab-audit`, `reset()`)
- **Tests:** `src/__tests__/feedback-regression.test.ts` (333 tests; `[S22]` block at bottom), `src/components/phase-b-visual.test.tsx` (WIZARD_STEPS = Role/Context/Log)
- **Hooks (fixed):** `.claude/settings.json` (quoted paths), `.claude/hooks/{pre-commit-gate,stop-gate,verify-done}.sh`
- **Display setting (fixed):** `~/.claude/settings.json` (`"tui": "default"`)

## Known gotchas
- **The "blank screen" was NEVER a bug** — it was fullscreen TUI mode. Now set to `"tui": "default"`. If Mona still sees it, she hasn't restarted Claude Code yet (exit + relaunch `claude`; restarting the whole Terminal app also works but isn't required).
- **Deploy = `npx vercel --prod --yes` then verify the alias** — `git push` alone does NOT deploy. **This session a `vercel --prod` run got truncated and did NOT finish aliasing** — always confirm with `vercel inspect focuslab-omega.vercel.app` (check the `url` line) or curl `/analyzer` for 200 before declaring done. Don't trust `vercel ls` "Age" column — it showed stale/inconsistent times.
- **Smart-resume testing for Mona:** she has a *finished* audit saved, so reopening `/analyzer` drops her on Results (not Role). To see the clean-start path: on Results click "Start over with a fresh audit", then reopen `/analyzer` → fresh Role step.
- **Pre-commit hook** `.claude/hooks/verify-done.sh` hard-blocks on tsc/test fails, banned colors, window hacks, Hanken, corporate emoji, green states, SCORE_FROM_LEVEL. It is firing again after `5c207dd`.
- **Dramatic reveal overlay** on Results runs 0.5s→3.5s; screenshot/verify AFTER 3.5s.
- **Playwright `text=` strict mode:** "Log your waste" matches Stepper label + h2 — use `getByRole("heading", …)`.
- Banned: green for success, old palette hexes, Hanken Grotesk, corporate emoji (📊📋✅📈🚀💡). Pink `#c4186a` for CTA/success/selected. SCORE_FROM_LEVEL = 2/3/4.
- **333 tests is the ratchet — never regress.**

## How to resume work
1. Read this file top to bottom + the latest `Session Log/` entry (Session 22) + memory [[feedback_solve_hard_problems]] and [[feedback_vercel_deploy]].
2. `git status` (clean) + `git log --oneline -6` (newest = `b7314bc`).
3. `npx vitest --run` → **333 passed**; `npx tsc --noEmit` clean.
4. Ask Mona what she wants to work on next — there are no half-finished threads. Keep replies SHORT (she asked for brevity this session). Build hard things head-on, ship green, deploy with `vercel --prod`, verify the live alias.
