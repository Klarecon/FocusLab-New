# Session 23 — Crash Fix + Redesign Mockups

**Date:** 2026-06-27
**Branch:** main → `c6547d3` (pushed + deployed to prod, alias verified live)
**Tests:** 333 → 336 (S23 block added; two stale guidance assertions flipped to reversals)

## Context
Resume session. Mona gave a batch of notes, then steered into design exploration. Two streams of work: (1) a small **shipped** bug/cleanup batch, and (2) **design mockups only** (no app code) for two "feels-like-a-form" sections + a card-fan landing concept she liked. Mockups are awaiting Oren's and Mona's feedback before any build.

## What happened, in order
| # | Work | Commit | Outcome |
|---|------|--------|---------|
| 1 | **Start-over crash fix** — clicking "Start over with a fresh audit" → `reset()` nulls `paretoResult` while ResultsView is mounted; a `useMemo` sat after the `if (!paretoResult) return` early return → "Rendered fewer hooks than expected" → "This page couldn't load". Moved `chartData` useMemo above the guard, made it null-safe. | `c6547d3` | **Shipped + live.** Reproduced via throwaway Playwright spec; `ERRORS_CAPTURED: []` after fix; lands on clean Role step. |
| 2 | **Removed pink scheduling lines** (Mona reversal of S20-V4-#3/#5) — dropped `START_GUIDANCE` (SolutionPicker) + `SEQUENCE_GUIDANCE` (EviMatrix) and their UI; removed now-unused imports. | `c6547d3` | **Shipped + live.** Verified gone on focus screens 20 + 22. |
| 3 | **Made "Start over" visible** — was a faint gray underline Mona couldn't find; now a pink-outlined ↺ button (secondary to "Build my plan"). | `c6547d3` | **Shipped + live.** |
| 4 | **Redesign mockups (NOT built)** — 3 directions each for Waste Log (W1/W2/W3) and Action Sequence (A1/A2/A3); plus a **current-vs-options side-by-side** built for Oren. | — | `Design Mockups/redesign-options.html`, `redesign-comparison.html` (untracked). |
| 5 | **Card-fan landing concept (NOT built)** — Mona liked the awesome-components "card-fan carousel"; rebuilt as a FocusLab landing "deck of drains" in her palette. | — | `Design Mockups/card-fan-focuslab.html` (+ `.png`). Awaiting her verdict. |
| 6 | **Misc (NOT logged to project)** — scanned `wundercorp/awesome-components`, saved 13 example screenshots to `~/Documents/awesome-components-examples/`. | — | One-off per Mona; outside the repo by design. |

## How the work flowed
- Session-start ritual: PROJECT_STATE + latest log + tsc/vitest baseline (333 green).
- Mona gave notes one at a time (remove pink lines x2; redesign Action Sequence + Waste Log with mockups first). Then reported the Start-over button "couldn't load" crash and couldn't find the button.
- Reproduced the crash with Playwright → diagnosed the hooks-order violation → fixed it, made the button visible, removed the pink lines (her explicit asks), updated tests, shipped + deployed + verified.
- Built the redesign mockups, then — at Mona's request — a side-by-side comparison page so she can send it to Oren.
- Mona picked the card-fan as a component she likes; built a FocusLab-skinned landing mockup.
- Hit (and respected) a new hard rule: **only write inside Documents** — deleted a file I'd put on her Desktop, saved the boundary to memory.

## Decisions made (non-obvious)
- **Pink-line removal was a reversal, not new scope** — flipped S20-V4-#3/#5 regression tests to negative assertions (S23-#1/#2) so the reversal can't silently regress.
- **Crash fix is pure hooks-ordering** — engine untouched per [[feedback_agent_boundaries]].
- **Mockups before code** for the two redesign sections — Mona's standing rule; only the explicitly-requested pink-line removal touched those files.
- **Comparison page is Oren-facing** (left current / right options, sticky current) — judge direction fast; it's a static mockup.
- **Card-fan belongs on the landing page** (recognition hook), not a core tool screen — only the center card is fully readable in a fan.
- **Documents-only file boundary** — never write to Desktop; misc scratch the user opens still goes under Documents.

## State at session end
- `c6547d3` pushed + deployed, alias live, `/analyzer` 200. tsc clean, 336 tests green, build clean, gate checks clean.
- `Design Mockups/` is untracked (asked Mona whether to commit).
- Waiting on Oren (redesign directions) and Mona (card-fan verdict).

## Resume Prompt (for the next session)
Read `.claude/PROJECT_STATE.md` top to bottom, then ask Mona: (1) did Oren weigh in on the Waste Log / Action Sequence redesign directions (W1/W2/W3, A1/A2/A3)? (2) what's her verdict on the card-fan landing mockup (`Design Mockups/card-fan-focuslab.html`) — build it / tweak drains / try a Results-page variant? Build whichever directions they land on; mockups are the spec. Keep replies short. **Write files only under Documents.** Ship green, deploy with `vercel --prod`, verify the live alias. Tests must stay ≥336.
