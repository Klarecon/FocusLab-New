# Session 25 — Feedback Log

**Date:** 2026-06-29
**Branch:** main → `e8eec4b`, `bcc1a2c`, `f7d3f42`

Concrete feedback Mona gave this session (from testing the live app), with how it was actioned. Code-verifiable items become permanent assertions in `feedback-regression.test.ts`.

## Batch A
| # | Feedback (verbatim/paraphrased) | Type | Action | Where |
|---|----------------------------------|------|--------|-------|
| 1 | "A WASTE-REDUCTION TOOL FOR ANY KIND OF WORK — remove 'FOR ANY KIND OF WORK'" | CODE | Eyebrow now "A waste-reduction tool". | `Hero.tsx` (`e8eec4b`) — `[S19→S25]` |
| 2 | "Need some heading options for this" (the stats section, which had none) | COPY | Added a heading live + built a 5-option HTML picker. | `BenchmarkProof.tsx` + `Design Mockups/stats-heading-options.html` (`e8eec4b`) — `[S25-#2]` |
| 3 | "there's a lot of space between these two" (HowItWorks line ↔ FinalCTA) | VISUAL | Trimmed FinalCTA top + HowItWorks bottom paddings. | `FinalCTA.tsx`, `HowItWorks.tsx` (`e8eec4b`) — `[S25-#3]` |
| 4 | "I want the budget bar at the top to stay static / fully visible even when I scroll down" | BUG | It was sticky but hidden behind the nav; moved to `top-[72px]`. | `LogStep.tsx` (`e8eec4b`) — `[S25-#4]` / `[S12-#1→S25]` / `[S24-#2→S25]` |
| 5 | "Add your own drain should be with each section and not just at the end" | CODE | Per-section `AddDrainRow`, pre-targeted to that type; removed bottom box. | `LogStep.tsx` (`e8eec4b`) — `[S25-#5]` |
| 6 | "I had to add my own fix… but the impact and effort scores didn't appear" | BUG | Custom fixes were missing `<InlineRating>`; added it. | `SolutionPicker.tsx` (`e8eec4b`) — `[S25-#6]` |

## Batch B
| # | Feedback (verbatim/paraphrased) | Type | Action | Where |
|---|----------------------------------|------|--------|-------|
| 7 | "the message (Your time's spread evenly…) shouldn't it come before rendering the chart?" → clarified: "I meant in the screen before, where the user logs waste" | CODE | (a) Confirmed it already precedes the results chart. (b) Added the nudge to the LOG screen too (see #11). | `ResultsView.tsx` / `LogStep.tsx` — `[S26-#1]`, `[S26-#1b]` |
| 8 | "there's no space between evenly and across" | BUG | Forced explicit `<strong>evenly</strong>{" "}across`. | `ResultsView.tsx` (`bcc1a2c`) — `[S26-#2]` |
| 9 | "the option to go back at any step should be at the top as well as the bottom" | CODE | Added "← Back" at top of mid steps. | `AuditWizard.tsx` (`bcc1a2c`) — `[S26-#3]` |
| 10 | "when I'm adding my own drain and click the add button, it just disappears" | BUG | Drain was stored but not rendered (role-library only); `allSources` now includes custom drains. | `LogStep.tsx` (`bcc1a2c`) — `[S26-#4]` |
| 11 | (clarification of #7) warning should appear while logging | CODE | `isFlatData` nudge on the log screen, above compute. | `LogStep.tsx` (`f7d3f42`) — `[S26-#1b]` |

## Regression coverage added/changed
- Flipped: `[S19→S25]` Hero eyebrow (no "for any kind of work"); `[S12-#1→S25]` + `[S24-#2→S25]` budget bar `sticky top-[72px]` (was `top-4`).
- New S25 block: `[S25-#2]` stats heading, `[S25-#3]` FinalCTA padding cut, `[S25-#4]` sticky-below-nav, `[S25-#5]` per-section add (no type `<select>`), `[S25-#6]` custom-fix InlineRating.
- New S26 block: `[S26-#1]` message before chart, `[S26-#2]` explicit space, `[S26-#3]` top Back, `[S26-#4]` custom drain renders, `[S26-#1b]` flat-data nudge on log screen.

## Notes for future sessions
- Anywhere users add their own entries (fixes, drains): make sure the UI renders custom items, not just the static library — this bug bit twice (#6, #10).
- "Stay visible on scroll" complaints may be a sticky element hidden behind the nav, not a broken sticky — check at deep scroll.
- Confirm interpretation on ambiguous phrasing: "before the chart" meant the earlier screen, not above-the-chart-on-results.
