# Session 12 — Feedback Log (2026-06-18)

## Context
Mona opened frustrated with Session 11 quality. Asked how to prevent bad work from reaching her. Session focused on fixing the 3 remaining broken items and building a visual verification pipeline.

---

## Feedback Items

| # | Feedback | Type | Status | Notes |
|---|----------|------|--------|-------|
| 1 | Duplicate sticky counters on IntakeStep | CODE | FIXED + VISUAL-VERIFIED | Removed inline counter, kept sticky pill. Screenshot 07 confirms single counter. Regression test [S12-#1]. |
| 2 | Duplicate sticky counters on DrilldownStep | CODE | FIXED + VISUAL-VERIFIED | Removed inline counter, kept sticky pill. Screenshot 10 confirms single counter. Regression test [S12-#2]. |
| 3 | DrilldownStep hours can exceed category estimate | CODE | FIXED + VISUAL-VERIFIED | Button disabled when overflow. Screenshot 11-12 show warning + disabled button. Regression test [S12-#3]. |
| 4 | MIN_CATEGORIES too low (2-bar chart) | CODE | FIXED | Changed to 3. Regression test [S12-#4]. |
| 5 | "Stop doing lousy work" — need visual verification method | PROCESS | FIXED | Built Playwright screenshot pipeline + multimodal review. Formalized in CLAUDE.md. |

---

## Carried from Session 11 — Still need verification on deployed app

| # | Item | Status |
|---|------|--------|
| S11-38 | Inline "add your own fix" renders under drain sections | NEEDS VISUAL VERIFICATION on deployed app |
| S11-24 | EVI quadrant labels don't overlap at typical widths | NEEDS VISUAL VERIFICATION on deployed app |

---

## Process Issues Identified

| Issue | Impact | Resolution |
|-------|--------|------------|
| QA agents said "PASS" via grep while UI was broken | User wasted time reviewing broken app | Built Playwright screenshot pipeline — Claude views screenshots before declaring done |
| Vercel auto-deploy not connected | Must manually deploy after push | Running `vercel --prod` after each push. User should reconnect webhook in dashboard. |
| Adding new UI elements without removing old ones | Duplicate counters on screen | Added banned pattern in CLAUDE.md: always remove old element in same change |

---

## User Sentiment

Mona started frustrated but engaged constructively. Asked for a concrete solution rather than promises. The visual verification pipeline was her idea — "I want you to find a method so you can also check what's on the screen." Session ended with a clean deploy and working process.
