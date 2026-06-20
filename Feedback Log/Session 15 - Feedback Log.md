# Session 15 — Feedback Log

**Date:** 2026-06-20
**Source:** Reddit vibe coding community + Mona

## Feedback Items

| # | Source | Feedback | Type | Status |
|---|--------|----------|------|--------|
| 1 | Reddit user | Up/down arrows on hours input cause layout shift — can't click arrow twice because it moves | CODE | FIXED — IntakeStep.tsx, counter always in DOM with opacity toggle |
| 2 | Reddit user | "Debugging code you didn't write" recognized as real enterprise waste pattern (validation, not a bug) | N/A | No action needed — positive signal |
| 3 | Mona | Google Sheets tracker format is "very old" — wants modern, user-friendly format | UX | FIXED — built interactive HTML tracker with localStorage |
| 4 | Mona | Struggles with step-by-step execution and reporting — needs exact daily tasks with good/bad definitions | PROCESS | ADDRESSED — daily execution plan with per-day scorecards |
| 5 | Mona | Oren wants data/metrics language in weekly reports — Mona has "always failed at clear reporting" | PROCESS | ADDRESSED — verbal script with 5 key numbers in execution plan |

## Code Changes
- `src/components/analyzer/IntakeStep.tsx` — counter uses opacity instead of conditional rendering (uncommitted)

## Visual Items (need human eye)
- None this session — no UI changes beyond the layout shift fix

## Notes
- All Reddit feedback was solicited (Mona posted in vibe coding community) — not organic discovery
- Target users (managers, team leads) have not tested the product yet
- GTM execution plan starts June 22, 2026
