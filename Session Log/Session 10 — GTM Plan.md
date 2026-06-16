# Session 10 — GTM Go-to-Market Plan

**Date:** 2026-06-16
**Duration:** ~1 session
**Focus:** Business planning — creating a go-to-market strategy for FocusLab
**Code changes:** None — this was a pure business/strategy session

---

## Context

Oren asked Mona to create a plan for how she will market and sell the tools she's building. Mona has content marketing and ad creative experience but has never created a business plan before. She needs to learn the fundamentals first so she can defend her logic at each stage.

## What Happened

### 1. Research Phase
- Searched the web for SaaS GTM frameworks, B2B marketing plans, and pricing models
- Fetched deep-dive articles on B2B SaaS marketing plans and 7-phase GTM frameworks
- Launched Product Manager agent for competitive landscape analysis
- Identified 6 direct competitors: RescueTime, Toggl Track, Rize, Reclaim.ai, Clockify/Harvest, generic coaches

### 2. Discovery Phase (9 Questions)
Asked Mona one question at a time to understand her situation:
1. What Oren expects → **Go-to-market plan** (execution-focused)
2. Current monetization → **Nothing** (free, no payments)
3. Timeline pressure → **Urgent** (weeks/months)
4. Budget → **Small** (~few hundred/mo, expandable if justified)
5. Target segments → **Ops/team leads, coaches, new managers, L&D teams** (not solo founders)
6. Oren's role → **Mona is the face, Oren behind scenes** (not decided fully)
7. Mona's skills → **Content writing, ad creative design, basic FB ads**
8. Current traction → **Zero** (starting from scratch)
9. Success definition → **$1K MRR + validation + 1-2 pilot companies/coaches**

### 3. Three Approaches Proposed
- **A: Coach Multiplier** — sell to coaches who use FocusLab with their clients (recommended)
- **B: Content + Freemium Flywheel** — free analyzer as lead gen, paid fixes
- **C: B2B Pilot Direct** — go straight to companies

Mona chose a **hybrid of A and B**.

### 4. Plan Built (v1)
Created a 10-section GTM plan with:
- Revenue model (Free / $29 Pro / $149 Coach)
- 12-week timeline in 3 phases
- Content strategy (3 pillars)
- Channel strategy + budget
- Competitive positioning
- Risks and mitigations
- "What you need to learn" section (5 concepts)
- Q&A defense guide (10 questions Oren might ask)
- Success criteria

### 5. GTM Specialist Review
Ran Product Manager agent as GTM reviewer. Found critical issues:
- **CPC was fantasy:** $0.20-0.30 assumed, real B2B is $1.50-3.50
- **No retention strategy:** One-session tool charging monthly = 30-40% churn
- **Coach validation bar too low:** Verbal yes ≠ demand
- **Missing sections:** Landing page, onboarding, legal/privacy, free channels
- **Referral incentive broken:** Offered something already free
- **"Methodology is the moat" is not a moat**

### 6. Plan Revised (v2)
Incorporated all review feedback into a 14-section revised plan:
- Fixed all CPC/funnel math with real benchmarks
- Added Retention Strategy (Part 3) — monthly re-assessment, progress tracking, before/after dashboard
- Added Landing Page Strategy (Part 5)
- Added Free Channels (Part 8) — Product Hunt, YouTube, Reddit, podcasts
- Added Legal & Privacy (Part 11)
- Raised coach validation bar (3 prepay, not 6 verbal)
- Added annual pricing ($199/year) alongside monthly ($29/mo)
- Honest $1K MRR timeline: 4-6 months, not 90 days
- Strengthened moat: accumulated data + network effects + switching costs
- Fixed referral: "both get 1 month free Pro"
- Added 2 new learning concepts (retention, unit economics)
- Added 2 new Q&A items (retention, moat)

### 7. Infrastructure
- Created `/GTM Plan/` folder for all marketing/sales work
- Saved memory files for folder convention and Mona's business background

## Files Created

| File | Purpose |
|------|---------|
| `GTM Plan/2026-06-16-gtm-plan-v2.html` | Current GTM plan (14 sections, reviewed and revised) |
| `GTM Plan/2026-06-16-gtm-plan.html` | v1 plan (superseded) |
| `docs/superpowers/specs/2026-06-16-gtm-plan-design.md` | Markdown spec (early draft) |

## Key Decisions

1. **Free Pareto Analyzer = marketing, not charity.** Zero marginal cost, creates the emotional hook for conversion.
2. **Coach track is validated, not assumed.** 3 prepay/commit before building.
3. **Annual pricing alongside monthly.** Combats churn risk for a one-session tool.
4. **Free channels before paid ads.** Product Hunt, YouTube, Reddit cost $0 and reach high-intent users.
5. **Honest timeline.** $1K MRR in 4-6 months from zero awareness is realistic. 90 days was aspirational.
6. **Retention is essential, not optional.** Monthly re-assessment + progress tracking must ship with the payment system.

## What's Next

1. Mona reads the v2 plan and comes back with questions
2. Oren reviews and may push back
3. If approved → implementation planning (landing page, Stripe, retention features, YouTube demo)
4. Coach validation outreach (Oren's responsibility)

## Resume Prompt

> "I'm Mona. Last session (Session 10, 2026-06-16) was a GTM business planning session — no code changes. We created a full go-to-market plan for FocusLab in `/GTM Plan/2026-06-16-gtm-plan-v2.html`. The plan has been reviewed by a GTM specialist and revised. I need to [review the plan with Oren / start implementing / work on product code instead]. Read PROJECT_STATE.md and the v2 plan to get up to speed."
