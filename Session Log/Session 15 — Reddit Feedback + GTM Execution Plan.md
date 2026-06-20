# Session 15 — Reddit Feedback + GTM Execution Plan

**Date:** 2026-06-20
**Duration:** ~1 session
**Branch:** main

## What happened

### 1. Reddit feedback triage
- Mona shared comments from a vibe coding community on Reddit where she'd posted for feedback
- **Bug report:** "The up/down arrows on the hours input change the layout of the page, meaning once you click the first time, the arrow is then somewhere else and you can't click it again"
  - Diagnosed as layout shift in IntakeStep.tsx — sticky counter conditionally rendered, pops into DOM on first input, shifts all cards down
  - Created visual explainer HTML (`Feedback Log/Screenshots/layout-shift-bug-demo.html`) showing before/after
  - Fixed: counter always in DOM, uses opacity instead of conditional rendering
  - All 279 tests pass
- **Validation comment:** Someone recognized "debugging code you didn't write" as a real enterprise waste pattern — agreement with FocusLab's waste categories, not a criticism

### 2. Key realization: feedback was solicited, not organic
- Mona clarified she posted in a vibe coding community asking for feedback — these weren't people who found FocusLab organically
- This means target users (managers, team leads) haven't tested it yet
- Updated all GTM docs to reflect "pre-flywheel" stage

### 3. GTM strategy reset — committed to Product-Led Growth
- Built `GTM Plan/2026-06-20-gtm-plg-strategy.html`
- Evaluated PLG vs content-led vs sales-led against Mona's reality (solo founder, $0 revenue, $29 price point)
- Decision: PLG primary, content feeds traffic, coach track is Oren's side bet
- Added "Where You Actually Are" honest assessment
- Defined paywall gate placement

### 4. Daily execution plan
- Built `GTM Plan/2026-06-20-daily-execution-plan.html`
- Day-by-day for weeks 1-2, pattern for weeks 3-4
- Mona said she struggles with step-by-step execution and reporting — plan includes good/bad day definitions, daily cheat sheet, Oren verbal report script
- Content team brief included (2 people: 1 blog writer, 1 outreach support)
- 6 hrs/day, 5 days/week starting June 22

### 5. Interactive weekly tracker
- First attempt: Google Sheets via CSV upload — Mona rejected as "very old format" (correct — CSV has zero formatting)
- Built HTML tracker instead: `GTM Plan/tracker.html`
- Tabs for weeks 1-4 + month view, collapsible channel sections, auto-totals, daily scorecard, Oren call prep, localStorage persistence, CSV export

## Files changed
- `src/components/analyzer/IntakeStep.tsx` — layout shift fix (uncommitted)
- `Feedback Log/Screenshots/layout-shift-bug-demo.html` — visual explainer (new)
- `GTM Plan/2026-06-20-gtm-plg-strategy.html` — PLG strategy (new)
- `GTM Plan/2026-06-20-daily-execution-plan.html` — daily execution plan (new)
- `GTM Plan/tracker.html` — interactive weekly tracker (new)

## Decisions
- PLG is the primary GTM motion
- Paywall gates after results, before Focus Table
- $500/mo Facebook ads (after organic proves conversion)
- 2 content team members allocated
- Interactive HTML tracker over Google Sheets
- Weekly verbal reports to Oren with 5 key metrics

## Tests
- 279 passing, 0 failing
- TypeScript clean (2 pre-existing warnings)

## Resume prompt
Read `.claude/PROJECT_STATE.md`. GTM execution starts June 22. Next code work likely: paywall gate on results page, Stripe checkout, analytics setup, landing page, domain connection. The IntakeStep layout shift fix is uncommitted.
