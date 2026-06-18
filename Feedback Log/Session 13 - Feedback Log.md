# Session 13 — Feedback Log

**Date:** 2026-06-18

## Feedback Items

| # | Feedback | Type | Status | Commit |
|---|----------|------|--------|--------|
| 1 | ResultsView missing B and C zones — only "Your Biggest Drains" showing | CODE | FIXED | c6d7e1c |
| 2 | SolutionPicker missing B and C zones — only Zone A items | CODE | FIXED | c6d7e1c |
| 3 | EVI Matrix quadrant labels overlapping axis labels | VISUAL | FIXED — needs eye check | c6d7e1c |
| 4 | Oysters label incomplete — missing "spare capacity" condition | CODE | FIXED | c6d7e1c |
| 5 | Payoff "What happens if you don't fix this" ugly red box | VISUAL | FIXED — needs eye check | c6d7e1c |
| 6 | No way to go back to Pareto chart without starting over | CODE | FIXED | bbb49d8 |
| 7 | "Start over with a fresh audit" crashes the page | CODE | FIXED | 2ddd7e5 |

## Regression Tests Added

| Test ID | Assertion | File |
|---------|-----------|------|
| S13-#1 | ResultsView has Zone B section | feedback-regression.test.ts |
| S13-#1b | ResultsView has Zone C section | feedback-regression.test.ts |
| S13-#2 | FocusStage passes Zone C to usefulMany | feedback-regression.test.ts |
| S13-#2b | SolutionPicker has Zone C section | feedback-regression.test.ts |
| S13-#3 | EviMatrix labels positioned away from axis | feedback-regression.test.ts |
| S13-#4 | Oysters label includes "spare capacity" | feedback-regression.test.ts |
| S13-#5 | Payoff has no Highlighter box | feedback-regression.test.ts |

## Visual Items Needing Human Eye
- #3 EVI Matrix label overlap — code verified, check at various viewport widths
- #5 Payoff redesign — code verified, check overall look on deployed app
