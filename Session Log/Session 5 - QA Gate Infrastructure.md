# Session 5 — QA Gate Infrastructure
**Date:** 2026-06-13
**Duration:** Short session (infrastructure only, no app code changes)

## What triggered this session

User found Reddit advice on QA in Claude Code: "use a separate verifier, but make it a gate not a vibe check. Main Claude does the change, then a second QA/reviewer agent gets the original feedback points as a checklist and is only allowed to answer pass/fail with exact misses. Turn repeated misses into a tiny verify command or stop-hook so Claude has to account for each item before saying done."

User wanted to implement this pattern.

## What was built

### 1. Automated Verification Script (`.claude/hooks/verify-done.sh`)
8 mechanical checks that catch rule violations automatically:

| # | Check | What it catches |
|---|-------|----------------|
| 1 | `tsc --noEmit` | Type errors |
| 2 | `vitest --run` | Test failures / regressions |
| 3 | Banned color grep | Rogue green, old palette values |
| 4 | `window.__` grep | Global state hacks |
| 5 | Hanken Grotesk grep | Wrong font |
| 6 | Corporate emoji grep | Banned emoji in components |
| 7 | Green success states | `text-green-`, `bg-green-`, rgba green |
| 8 | SCORE_FROM_LEVEL | Mapping regression (must be 2/3/4) |

Excludes `*.test.*` files from color/green checks. Timestamps successful runs for stop-hook coordination.

### 2. Pre-Commit Gate Hook (`.claude/hooks/pre-commit-gate.sh`)
- Reads stdin JSON from Claude Code hook system
- Filters: only acts on `git commit` commands, exits 0 for everything else
- Runs verify-done.sh on commit attempts
- **Exit code 2 = hard block** — commit is denied, Claude sees the failure details

### 3. Stop Hook (`.claude/hooks/stop-gate.sh`)
- Fires when Claude finishes a response
- Checks transcript for "done" language
- If verify-done.sh hasn't run in the last 2 minutes, injects a reminder
- Soft gate (reminder, not a block)

### 4. Hook Configuration (`.claude/settings.json`)
- `PreToolUse` on `Bash` → pre-commit-gate.sh
- `Stop` → stop-gate.sh

### 5. CLAUDE.md Section 12: QA Gate
- Documents the 2-layer pattern (automated + QA agent)
- Includes copy-paste template for spawning Reality Checker agents
- Documents how to add new checks when misses repeat

## Test results

Ran verify-done.sh against current codebase:
- **6 passed, 2 failed**
- Failures: 1 banned color occurrence, 1 green success state (both in non-test src/ files)
- These are real violations that prove the gate works — they'll block the next commit until fixed

## Files created/modified

| File | Action |
|------|--------|
| `.claude/hooks/verify-done.sh` | Created |
| `.claude/hooks/pre-commit-gate.sh` | Created |
| `.claude/hooks/stop-gate.sh` | Created |
| `.claude/settings.json` | Created |
| `CLAUDE.md` | Updated (added §12, renumbered §13→14, §14→15) |
| `.claude/PROJECT_STATE.md` | Updated via /handover |

## No commits this session
All QA gate files are untracked. Next session should fix the 2 violations, then commit everything together.

## Resume prompt

```
Read .claude/PROJECT_STATE.md. This is Session 6.

Session 5 built a QA gate system (hooks in .claude/hooks/, settings in .claude/settings.json).
The pre-commit gate catches 2 existing violations (banned color + green success state).

First: fix those 2 violations so verify-done.sh passes clean.
Then: commit all QA gate files + the fixes together.
After that: ask the user what to work on.
```
