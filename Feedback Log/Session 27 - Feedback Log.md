# Session 27 — Feedback Log

**Date:** 2026-07-01

Concrete feedback / preferences Mona gave this session, for future reference and (where code-verifiable) the regression suite.

| # | Feedback | Type | How it was handled |
|---|----------|------|--------------------|
| S27-1 | Wants to understand how payment/auth works before committing to a route | PROCESS | Explained auth=identity, billing=entitlement, paywall=checkpoint; movable-gate model |
| S27-2 | Wants recommendations via "a mixture of agents" | PROCESS | Fanned out specialist agents (PM/Growth/Value; then Pricing/Unit-econ/Retention) and synthesized |
| S27-3 | A/B test worry: "don't two campaigns need two landing pages / two auths?" | PROCESS | Clarified: one build, two links (?v=a/?v=b), same auth, only email-step position differs |
| S27-4 | Needs quarterly plan in OKR style (yes/no measurable) for Oren | ARTIFACT | Built Q3 OKR HTML doc with numbered+dated KRs + scoring |
| S27-5 | Needs everything on ClickUp with checklists, and tasks auto-marked done as we finish | PROCESS/TOOL | Built ClickUp board via API (32 tasks + checklists); `done.mjs` marks tasks complete |
| S27-6 | "Some of the language is not plain enough for me to understand" | COPY | Rewrote all 32 ClickUp tasks into plain English ("What it is / Why it matters" + plain checklists) |
| S27-7 | Safe vs decision-dependent tasks must be clearly separated | STRUCTURE | Two ClickUp folders: 🟢 SAFE — Start Now and 🟡 DECISIONS TO LOCK |
| S27-8 | Confirmed the caveat that "mark done" happens in-session, not autonomously | PROCESS | Acknowledged; done.mjs run as we complete tasks |
| S27-9 | Approved deleting the risky plaintext token file | SECURITY | Deleted the RTF, token safe in gitignored `.env.local`, folder gitignored |

**Recurring preference reinforced:** PLAIN, non-technical language for anything Mona reads or reports from. Keep jargon in brackets if unavoidable. (Also see memory: warm/direct copy, no "free", HTML artifacts, no permission-asking mid-task.)

**Note:** These are process/artifact/copy items, not app-code changes, so nothing new goes into `feedback-regression.test.ts` this session.
