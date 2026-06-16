# FocusLab Project State

**Last updated:** 2026-06-16 by Claude via /handover

## Quick orient
- **Project:** FocusLab — productivity tool suite helping knowledge workers find time waste (Pareto Analyzer) and fix it (Focus Table & EvI Matrix)
- **Repo:** https://github.com/mona2611-alt/FocusLab-New (PRIVATE)
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main
- **Active work:** Session 10 complete — GTM (Go-to-Market) plan created. No code changes this session. This was a business planning session, not a product/code session.
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical product owner. Has content marketing and ad creative experience but creating first business plan. Working with Oren Yonash (methodology creator). Wants FAST autonomous execution, NO permission prompts. Values visual quality. Expects TDD discipline. Reviews deployed Vercel app. Prefers HTML pickers for options. Runs parallel sessions (GTM planning in one, code in another).

## Branch state
- All commits pushed to origin/main and deployed to Vercel
- Latest: `dafe5d2 Session 9 handover: session log, feedback log, project state`
- **No new commits this session** — this was a business planning session, no code changes

## What's done in this session (2026-06-16, Session 10)

### 1. GTM Plan — Full Go-to-Market Strategy Created
Built a comprehensive go-to-market plan for FocusLab from scratch. Mona has never created a business plan before and needs to defend her logic to Oren.

**Process:**
- Ran web research on SaaS GTM frameworks, B2B marketing plans, pricing models (freemium vs subscription)
- Launched Product Manager agent for competitive landscape analysis (RescueTime, Toggl, Rize, Reclaim.ai, Clockify, Harvest, Hubstaff)
- Asked 9 clarifying questions to understand Mona's situation, constraints, and goals
- Proposed 3 GTM approaches: Coach Multiplier, Content + Freemium Flywheel, B2B Pilot Direct
- Mona chose a hybrid of Coach Multiplier + Content Flywheel
- Built full plan (v1), then ran GTM specialist review which found critical issues
- Revised to v2 incorporating all review feedback

**Key findings from GTM review that changed the plan:**
- CPC was fantasy ($0.20-0.30 → corrected to $2-3.50 for B2B)
- Missing retention strategy (one-session tool charging monthly = churn disaster)
- Missing landing page strategy
- Coach validation bar too low (verbal yes → needs prepay/commitment)
- Referral incentive offered something already free
- "Methodology is the moat" is not actually a moat
- Free channels (Product Hunt, YouTube, Reddit, podcasts) should come before paid ads

### 2. GTM Plan Folder Created
All marketing/sales/GTM work is now stored in `/GTM Plan/` at project root. This keeps it separate from product code so parallel sessions don't interfere.

### 3. Files Created
- `GTM Plan/2026-06-16-gtm-plan.html` — v1 plan (superseded by v2)
- `GTM Plan/2026-06-16-gtm-plan-v2.html` — v2 revised plan (current, 14 sections)
- `docs/superpowers/specs/2026-06-16-gtm-plan-design.md` — markdown spec (moved to GTM Plan in v1 HTML form)

### 4. Memory Files Updated
- Added `project_gtm_plan_folder.md` — all GTM work goes in /GTM Plan/
- Added `user_business_background.md` — Mona's content marketing + ad creative experience, first business plan
- Updated MEMORY.md index

## What's next (for the NEXT Claude Code session to pick up)

### If next session is GTM/business focused:
1. **Mona reviews the v2 GTM plan** and comes back with questions or changes
2. **Oren reviews the plan** — may push back on pricing, segments, or strategy
3. **Implementation planning** — if plan is approved, create detailed implementation tasks
4. **Landing page design** — Part 5 of the plan outlines the strategy but the page needs to be designed and built
5. **Stripe Payment Links setup** — simplest v1 payment system
6. **Retention features** — monthly re-assessment and progress tracking (critical for $29/mo pricing to work)
7. **YouTube demo video script** — 3-minute "watch me find 14 hours of waste"

### If next session is product/code focused:
1. **CRITICAL: User says deployed app still has visual/behavioral misses from Session 9.** Need specific screenshots or descriptions.
2. **Double Pareto wizard flow needs live testing.** User hasn't confirmed it feels right.
3. **Dead code cleanup:** WeighStep.tsx is no longer imported but tests reference it.
4. **Run specialist agents BEFORE presenting work** — Math, Copywriter, Sense Checker, Mona Feedback Agent must ALL pass.
5. **Pending features:** Calendar week visualization, Lottie animations, shareable scorecard, highlighter fade issue.

## Decisions made (non-obvious choices)

### New in Session 10
- **GTM Plan lives in `/GTM Plan/` folder** — separate from code to support parallel sessions
- **Three-track GTM strategy:** Free channels first (zero cost), then paid ads (with realistic CPC), then coach outreach (Oren's network)
- **Pricing model:** Free Pareto Analyzer (lead gen) → $29/mo or $199/year Pro (Focus Table access) → $149/mo Coach (if validated)
- **Annual pricing added** to combat churn risk — one-session tool needs upfront commitment option
- **Coach validation bar raised:** 3 prepay/signed commitments (not 6 verbal yes) before building coach tier
- **$1K MRR timeline is honest:** 4-6 months from zero awareness, not 90 days. Plan says this explicitly.
- **Retention features are essential, not optional:** Monthly re-assessment + progress tracking must be built alongside or before the payment system
- **Free channels before paid:** Product Hunt, YouTube demo, Reddit, podcast appearances — exhaust these before spending $2-3/click on ads
- **Real B2B CPC:** $1.50-3.50 per click, not the $0.20-0.30 that v1 assumed
- **Moat is not "Oren's methodology"** — real moats are accumulated user data, coach network effects, and switching costs from saved plans/progress history

### Carried from previous sessions
- Two separate tools, not one flow: /analyzer finds problems, /focus solves them
- Static data, no database
- Hot pink reclaim (#c4186a) for all CTA, success, selected states. Green is BANNED.
- Plus Jakarta Sans body font. Hanken Grotesk BANNED.
- SCORE_FROM_LEVEL (low=2, med=3, high=4)
- No $50/hr fallback
- Agents must not make major methodology changes without asking
- Three-layer QA system: hooks + regression tests + evidence-based agent
- Specialist agents mandatory before "done": Math, Copywriter, Sense Checker, Mona Feedback

## Open questions waiting on user

- **Has Mona read the v2 GTM plan?** She asked for the revision and said she'd read it before this handover was triggered
- **Does Oren agree with the pricing model?** ($29/mo, $199/year, $149/mo coach)
- **Does Oren agree with the free Pareto Analyzer strategy?** He might push back on giving away the best feature
- **Will Oren do coach validation outreach?** Plan depends on him talking to 10-15 coaches
- **What specifically is still wrong on the deployed app?** (Carried from Session 9 — code passes all checks but user sees issues)
- **Does the new double Pareto wizard flow feel right?** (Carried from Session 9)

## Critical file paths

### GTM Plan files
```
GTM Plan/2026-06-16-gtm-plan-v2.html     — CURRENT: Revised GTM plan (14 sections)
GTM Plan/2026-06-16-gtm-plan.html         — SUPERSEDED: v1 plan (before GTM review)
```

### Product/code files (unchanged this session)
```
src/components/analyzer/IntakeStep.tsx           — Category-level estimation (Pass 1)
src/components/analyzer/DrilldownStep.tsx         — Vital few drilldown (Pass 2)
src/components/analyzer/AuditWizard.tsx           — Wizard orchestrator
src/components/focus/EviMatrix.tsx                — EvI Matrix + PriorityTable
src/components/focus/SolutionPicker.tsx           — Collapsible descriptions
src/components/focus/FocusTable.tsx               — Action Plan
src/components/focus/Payoff.tsx                   — Opportunity framing
src/lib/data/opportunity-frames.ts                — Research-backed opportunity copy
src/lib/engine/solutions-logic.ts                 — QUADRANT_META, payoff calculator
src/stores/audit-store.ts                         — Zustand store
src/__tests__/feedback-regression.test.ts         — 71 cumulative regression tests
.claude/hooks/verify-done.sh                      — Pre-commit verification (8 checks)
```

### Memory files
```
~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/
├── MEMORY.md                              — Memory index
├── project_gtm_plan_folder.md             — NEW: GTM folder convention
├── user_business_background.md            — NEW: Mona's business/marketing experience
├── feedback_agent_boundaries.md
├── feedback_copy_preferences.md
├── feedback_visual_preferences.md
├── feedback_workflow_preferences.md
├── feedback_handover_ritual.md
├── feedback_qa_tighter_system.md
├── feedback_specialist_agents_mandatory.md
└── feedback_never_break_working_features.md
```

## Known gotchas

- **visx React 19 peer deps:** `.npmrc` has `legacy-peer-deps=true`
- **Framer Motion keyframes:** Spring transitions only support 2 keyframes
- **Unicode escapes:** `\uXXXX` in JSX renders as raw backslash. Use actual characters.
- **Vercel deploy author:** Git commits MUST use `mona@klarecon.com` as author email
- **WeighStep.tsx is dead code:** Not imported but tests reference it
- **`hoursPerDay` field is misnamed:** Stores weekly hours in DrilldownStep
- **Browser cache:** User may see stale deploys. Suggest Cmd+Shift+R or incognito.
- **User frustrated with QA quality:** Session 9 QA agents passed but user found issues. Code checks are necessary but not sufficient.
- **Parallel sessions:** Mona runs GTM planning and code sessions in parallel. GTM work goes in `/GTM Plan/`, code work stays in `src/`. Don't let them cross.
- **GTM plan has two versions:** v2 is current. v1 is superseded. Don't reference v1 numbers.

## How to resume work
1. Read this file top to bottom
2. Run `git status` and `git log --oneline -10` to confirm state
3. Read memory files at `~/.claude/projects/-Users-monamehta-Documents-FocusLab-New/memory/`
4. **Determine session type:** Is user working on GTM/business or product/code?
5. **If GTM:** Read `GTM Plan/2026-06-16-gtm-plan-v2.html` for full context. Ask what Mona/Oren thought of the plan.
6. **If code:** First priority is getting specific bug reports from the deployed app (Session 9 issues). Run all specialist agents before declaring done.
7. User wants autonomous execution — NEVER ask permissions, just do the work
8. Present options via interactive HTML pickers, not markdown
9. Deploy by pushing to GitHub — NOT via `npx vercel --prod`
10. TDD discipline: 253 tests must never regress
11. Never say "done" until all specialist agents pass
12. Do NOT make major methodology changes without asking
