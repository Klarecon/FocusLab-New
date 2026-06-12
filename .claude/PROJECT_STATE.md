# FocusLab Project State

**Last updated:** 2026-06-13 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EVI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 5 complete — built QA gate infrastructure (automated verification hooks + stop-hook + separate verifier agent pattern). No app code changes this session.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner, wants fast autonomous execution (no permission prompts), values visual quality highly, expects TDD discipline, will call out half-done work. Demands natural English copy, hates corporate/generic aesthetics, wants illustrative visuals not placeholder emoji.

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `829d2f5 Add Session 4 log`
- Working tree has untracked files: `.claude/settings.json`, `.claude/hooks/`, `Components/`, `Oren's stuff/`, `QA Agents.rtf`, `SESSION-1-CRITICAL-ANALYSIS-AND-TOMORROW-PLAN.html`, `Feedback Log/Screenshots/`
- **No new commits this session** — QA gate files are untracked, not yet committed

## What's done in this session (2026-06-13, Session 5)

### QA Gate Infrastructure — Built 3-Layer Verification System

Implemented based on Reddit advice: "use a separate verifier as a gate, not a vibe check."

**Layer 1 — Automated verification script** (`.claude/hooks/verify-done.sh`):
- 8 automated checks: tsc, vitest, banned colors, window.__ globals, Hanken Grotesk, corporate emoji, green success states, SCORE_FROM_LEVEL mapping
- Excludes `*.test.*` files from color/green greps (Session 4 fix carried forward)
- Timestamps successful runs to `/tmp/focuslab-verify-last-run` for stop-hook coordination
- Run standalone: `bash .claude/hooks/verify-done.sh`

**Layer 2 — Pre-commit gate hook** (`.claude/hooks/pre-commit-gate.sh`):
- Wired into `.claude/settings.json` as a `PreToolUse` hook on `Bash`
- Reads stdin JSON, checks if command is `git commit`, exits 0 immediately for anything else
- On git commit: runs verify-done.sh, exit code 2 = hard block (commit denied)

**Layer 3 — Stop hook** (`.claude/hooks/stop-gate.sh`):
- Wired into `.claude/settings.json` as a `Stop` hook
- Fires when Claude finishes a response
- Checks transcript for "done" language, then checks if verify-done.sh ran within last 2 minutes
- If not: injects reminder that Claude must run verification before declaring done

**CLAUDE.md updated:**
- Added Section 12: QA Gate (Separate Verifier Pattern) — documents both automated and QA agent workflows
- Includes copy-paste template for spawning Reality Checker QA agents
- Renumbered: Session End Ritual → §14, Quick Reference Card → §15

**Settings created** (`.claude/settings.json`):
- `PreToolUse` hook on `Bash` → pre-commit-gate.sh (timeout 120s)
- `Stop` hook → stop-gate.sh (timeout 10s)

### Tested
- verify-done.sh ran successfully against current codebase
- Caught 2 real violations (banned color + green success state in non-test files) — proving the gate works
- Those violations exist in the current codebase and will block commits until fixed

## What was done in Session 4 (2026-06-12) — still current

### Magic UI Components (20 integrations)
- **ShimmerButton** — 10 locations (all primary CTAs across Hero, wizard steps, Focus tool)
- **Highlighter** — 8 phrases (hand-drawn annotations via rough-notation)
- **OrbitingCircles** — 2 locations (Hero background, Focus empty state)
- Dependencies: `tailwind-merge`, `rough-notation`
- CSS animations in globals.css (shimmer-slide, spin-around, orbit)

### Vercel Deploy Fixed
- Git author email set to mona@klarecon.com (Hobby plan blocks unknown authors)
- Git integration reconnected in Vercel dashboard

### QA in Session 4
- Layer 1: 8/8 automated checks passed
- Layer 2: 18/18 Reality Checker items verified

## What's next (for the NEXT Claude Code session to pick up)

1. **Commit QA gate files** — `.claude/settings.json`, `.claude/hooks/` (3 scripts), updated `CLAUDE.md` are all uncommitted
2. **Fix 2 existing violations caught by verify-done.sh** — banned color and green success state somewhere in non-test src/ files. Must fix before any commit will succeed.
3. **Focus Table & EVI Matrix user review** — user has NOT reviewed `/focus` yet. Expect detailed feedback. Be ready for a full redesign pass.
4. **Landing page review with Magic UI components** — user confirmed they "work" but hasn't given detailed visual feedback
5. **"Wow" features not yet built:**
   - Shareable Waste Scorecard card (1200x630 OG image)
   - Lottie animations for key reveal moments
6. **Oren's feedback** — user shared Vercel link with Oren Yonash (original Pareto app creator). Feedback may arrive.
7. **Clean up roles.ts corporate emoji** — lines 25 (`📊`) and 42 (`📋`) still have banned emoji in base data
8. **Delete RoleLenses.tsx** — dead code, removed from page.tsx but still on disk

## Decisions made (non-obvious choices)

- **Two separate tools, not one flow:** /analyzer finds problems, /focus solves them. Different routes, different mental modes.
- **Manager and Executive are now LEVELS, not roles:** RoleStep shows 5 function roles + level picker (IC / Manager / Director+).
- **Static data, no database:** All waste sources, solutions, benchmarks are TypeScript constants. No Supabase.
- **Hot pink reclaim (#c4186a):** All CTA, success, selected states. Green is BANNED.
- **Plus Jakarta Sans body font:** NOT Hanken Grotesk.
- **SCORE_FROM_LEVEL (low=2, med=3, high=4):** Critical for quick-win detection.
- **Over-allocation blocks progression:** WeighStep disables "See results" when waste > work hours.
- **Waste source names describe problems only:** Never embed a solution in the label.
- **Tailwind CSS 4 animations use plain CSS classes:** `@theme inline` doesn't generate animation utility classes.
- **ShimmerButton replaces all primary CTAs:** Secondary/back buttons remain plain. Disabled gets `background="var(--color-ink-soft)"`.
- **Highlighter uses `isView` prop:** Triggers on scroll-into-view, not on mount.
- **Vercel deploys via git push only:** CLI deploys blocked on Hobby plan.
- **QA gate: pre-commit hook filters in the script, not in settings.json matcher:** The `PreToolUse` matcher is broad (`"Bash"`), but `pre-commit-gate.sh` reads stdin JSON and exits 0 immediately for non-commit commands. This is more reliable than depending on `if` field syntax.
- **Stop hook is a soft gate:** It injects a reminder (exit 0 + stderr message), not a hard block. Claude sees the message and must address it, but it doesn't prevent the response from completing.

## Open questions waiting on user

- **Focus Table / EVI Matrix review** — user hasn't looked at /focus page yet
- **Visual feedback on Magic UI components** — confirmed "working" but no detailed feedback
- **Oren's feedback** — may arrive between sessions

## Critical file paths

```
src/stores/audit-store.ts        — Zustand store, THE cross-tool bridge
src/lib/engine/pareto.ts         — Core Pareto engine (142 tests)
src/lib/engine/solutions-logic.ts — Payoff calculator + SCORE_FROM_LEVEL
src/lib/engine/types.ts          — ParetoResult, CategoryResult, ChosenSolution
src/lib/data/solutions.ts        — 53 solutions catalog
src/lib/data/waste-sources.ts    — 47 waste sources (cleaned labels)
src/lib/data/roles.ts            — 7 role lenses (corporate emoji still in base data)
src/lib/utils.ts                 — cn() utility (clsx + tailwind-merge)
src/components/ui/shimmer-button.tsx  — ShimmerButton (Magic UI)
src/components/ui/highlighter.tsx     — Highlighter (Magic UI + rough-notation)
src/components/ui/orbiting-circles.tsx — OrbitingCircles (Magic UI)
src/components/analyzer/AuditWizard.tsx  — Wizard orchestrator
src/components/analyzer/RoleStep.tsx     — Role+level picker
src/components/analyzer/ContextStep.tsx  — Hours/days/pay input
src/components/analyzer/IntakeStep.tsx   — Pain prompts with per-section add-your-own
src/components/analyzer/WeighStep.tsx    — Hours+avoidable sliders, over-allocation guard
src/components/analyzer/ResultsView.tsx  — Pareto chart + results
src/components/landing/Hero.tsx          — Landing hero
src/components/landing/FinalCTA.tsx      — Landing bottom CTA
src/components/focus/FocusStage.tsx      — Focus tool orchestrator
src/components/focus/SolutionPicker.tsx  — Solution picker
src/components/focus/EviMatrix.tsx       — Effort x Impact scatter
src/components/focus/Payoff.tsx          — Cost-of-doing-nothing closer
src/app/globals.css                      — Design system palette + Magic UI animations
.claude/settings.json                    — Hook configuration (PreToolUse + Stop)
.claude/hooks/verify-done.sh             — Automated QA gate (8 checks)
.claude/hooks/pre-commit-gate.sh         — Pre-commit gate (blocks on failure)
.claude/hooks/stop-gate.sh               — Stop gate (reminds to verify before "done")
Feedback Log/                            — User feedback logs
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`. Required for Vercel deploys.
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes. All AnimatedEmoji animations use tween with custom easing.
- **Unicode escapes:** `\uXXXX` in JSX text renders as raw backslash text. Always use actual characters in JSX.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email. Otherwise Vercel Hobby plan blocks the deployment.
- **Vercel Git integration:** Must stay connected to `mona2611-alt/FocusLab-New`. If deploys stop, check Settings → Git first.
- **Tailwind CSS 4 animations:** Do NOT put animation definitions in `@theme inline`. Use plain CSS classes (`.animate-*`) in globals.css.
- **Old repo still exists:** `/Users/monamehta/Documents/FocusLab/focuslab` is the original. Work in `/Users/monamehta/Documents/FocusLab New/`.
- **RoleLenses.tsx is dead code:** Still exists on disk but removed from page.tsx. Can be deleted.
- **roles.ts emoji are stale:** Lines 25 and 42 still use corporate emoji but are overridden by ROLE_EMOJI map in RoleStep.tsx.
- **Test mocks for Magic UI:** Any test file rendering Highlighter needs: `useInView` in framer-motion mock, `rough-notation` mock, and `ResizeObserver` global stub.
- **verify-done.sh catches 2 existing violations:** Banned color and green success state exist in current src/ (non-test). Must be fixed before the pre-commit gate will allow any commit.
- **Pre-commit gate fires on ALL Bash calls:** The script exits 0 instantly for non-commit commands, but if `jq` is missing, it could break. Ensure `jq` is installed.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read the feedback log at `Feedback Log/Session 3 - User Feedback Log.md` for context on user preferences
4. User wants autonomous execution — don't ask permissions, just do the work
5. **First task:** Fix the 2 violations caught by verify-done.sh, then commit the QA gate files
6. Run QA agents BEFORE showing work to user — she will reject half-done fixes
7. TDD discipline: write tests first, implement, verify, then show
8. Never say "done" until tests pass, build succeeds, and QA checklist is green
9. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
10. Ask the user what they want to work on next
