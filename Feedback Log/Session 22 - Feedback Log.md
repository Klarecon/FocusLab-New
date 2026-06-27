# Session 22 — Feedback Log

**Date:** 2026-06-27
**Branch:** main → `b7314bc`

Concrete feedback Mona gave this session, with how it was actioned. (Code-verifiable items become permanent assertions in `feedback-regression.test.ts`.)

| # | Feedback (verbatim/paraphrased) | Type | Action | Where |
|---|----------------------------------|------|--------|-------|
| 1 | "what am i seeing half blank screen?" (the stop-hook "is a directory" error) | CODE | Quoted `${CLAUDE_PROJECT_DIR}` in both hooks — space in "FocusLab New" was splitting the path. | `.claude/settings.json` (`5c207dd`) |
| 2 | "I don't see the 'start over' button… I opened the app in incognito" / "It's not there in the normal browser as well" | CODE | Diagnosed: returning users with a finished audit auto-jump to Results, never see the Role step. Led to smart-resume redesign. | `AuditWizard.tsx` |
| 3 | "What's the recommended way… the best possible way" (for saved-state on reopen) | DECISION | Recommended + shipped **smart resume**: keep finished audits, discard half-finished drafts on reopen. Removed the redundant Role-step button. | `AuditWizard.tsx`, `RoleStep.tsx` (`b7314bc`) |
| 4 | "Again a lot of blank screen, I can't work like this" | CONFIG | Switched `"tui": "fullscreen"` → `"default"` (fullscreen alt-screen renderer was leaving blank space on short replies). Needs Claude Code restart. | `~/.claude/settings.json` |
| 5 | "I don't want to read all of this, give me a one para summary" / brevity | PREFERENCE | Noted — keep replies short. Reinforces existing copy/workflow prefs. | (behavioral) |

## Regression coverage added/changed
- `[S22]` block in `feedback-regression.test.ts`: AuditWizard resumes finished audits to results; discards half-finished drafts (`s.reset()` + `s.roleSlug || s.activeSources.length`); Role-step "Start fresh" button removed.
- Carried-over from the cleanup commit `f27ef31`: re-pointed `IntakeStep`/`DrilldownStep` requirements onto `LogStep`; fixed the "only" copy regression (`[S20-V4-#12→S20]`).

## Notes for future sessions
- Mona reads finished artifacts and reacts; she does not want long explanations or yes/no questions mid-task. Brevity confirmed again this session.
- The "blank screen" complaints were a display setting, not a product bug — don't chase it as a code issue if it recurs; confirm she restarted Claude Code.
