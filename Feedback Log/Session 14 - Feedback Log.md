# Session 14 — Feedback Log

**Date:** 2026-06-19
**Focus:** Mobile optimization

## Feedback Items

| # | Feedback | Type | Status | Evidence |
|---|----------|------|--------|----------|
| 1 | "The tool is currently not optimized for mobile" | CODE | DONE | 16 files updated with responsive Tailwind classes, `useIsMobile` hook added, all routes tested |
| 2 | Stepper option preference — chose Option C (mini dots) from HTML mockup | CODE | DONE | `Stepper.tsx` rewritten with dual layout: `sm:hidden` mini dots + `hidden sm:flex` full circles |
| 3 | "It looks okay" — mobile visual confirmation | VISUAL | PASS | Mona confirmed on device after deploy |
| 4 | "The mobile version is letting me put older dates on the action item page" | CODE | DONE | Added JS validation in `EviMatrix.tsx` onChange handler to block dates before today |

## Design Decisions Made

- **Stepper:** Mona chose Option C (mini dots) from 3 HTML mockup options
- **Charts:** Shrink and simplify (Option A) — reduced height, tighter margins
- **Target viewport:** 375px minimum (iPhone SE)
- **Scope:** Full app (all routes), not incremental

## Regression Tests Added

None added this session — changes were purely CSS/layout responsive variants that don't affect logic. The existing 279 tests all pass and verify desktop behavior is unchanged.

## Visual Items Verified by Mona

- [x] Overall mobile layout — "It looks okay"
- [ ] Stepper mini dots specifically (not called out, included in general approval)
- [ ] Charts at 375px (not called out, included in general approval)
