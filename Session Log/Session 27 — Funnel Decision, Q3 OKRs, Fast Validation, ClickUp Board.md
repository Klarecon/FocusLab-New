# Session 27 — Funnel Decision, Q3 OKRs, Fast Validation & ClickUp Board

**Date:** 2026-07-01
**Owner:** Mona Mehta
**Type:** Planning / strategy + ClickUp tooling (no app code changed)
**Branch:** main (`f7d3f42`, unchanged — 353 tests green, tsc clean baseline)

---

## What this session was about
Mona is preparing to go to market (Option B — money path first). She needed: (1) clarity on how the paywall/auth works and how an A/B test would run, (2) a quarterly OKR plan for Oren + a weekly breakdown, (3) a fast way to know if the product can make money within ~2 months, and (4) the whole plan set up on ClickUp for tracking — in plain, non-technical language.

## What got done
1. **Funnel / paywall decision** (3 agents: Product Manager, Growth, Value-perception). Verdict: the mid-funnel gate is always an **EMAIL, never a payment**; the **paywall lives only on the Focus Table**. The A/B test is only *where the email step sits* (before vs after the full Pareto) — both variants run from ONE build via a movable-position config flag. → `GTM Plan/2026-07-01-funnel-gate-decision.html`
2. **Q3 2026 OKRs** for Oren — 3 objectives (Ship & Launch / First Dollars / Funnel That Scales), every KR numbered + dated, 13-week breakdown, scoring method, reporting cadence, confirm-with-Oren box, and an honesty flag that the Sept funnel test resolves ~Oct 15. → `GTM Plan/2026-07-01-q3-okr-launch-plan.html`
3. **ClickUp task breakdown doc** — A1–A4 + content + launch, each with owner/effort/flag/checklist. → `GTM Plan/2026-07-01-clickup-task-breakdown.html`
4. **60-day money-making validation plan** (3 agents: pricing, unit-economics, retention). Reframe: measure **conviction, not retention**. Launch **annual-first**, consider **$39/$290**, run a **$4k / 21-day cold-ad test in August** (quarantine traffic; kill day-5/$1k if cold email capture <6%). GO/KILL thresholds table. → `GTM Plan/2026-07-01-60-day-money-validation.html`
5. **ClickUp board built via REST API** — Space "FocusLab Launch — Q3 2026" (id `90167342807`) in workspace Klarecon (`25716451`). **32 tasks** with checklists + due dates, split into 🟢 SAFE (start-now, no-regrets) and 🟡 DECISIONS (D1–D6). Then **rewrote all 32 into plain English** ("What it is / Why it matters" + plain checklists). Tooling in `scripts/clickup/` (`setup.mjs`, `due-dates.mjs`, `plain-language.mjs`, `done.mjs`, `task-map.json`).
6. **Security:** token → `.env.local` (gitignored, chmod 600); deleted plaintext `Clickup API/click up api.rtf`; added `Clickup API/` to `.gitignore`.

## Key decisions
- Email gate never payment for cold traffic; paywall only on the Focus Table; A/B = email-step position from one codebase.
- Launch annual-first; consider $39/$290 (needs Mona+Oren sign-off — ClickUp D1).
- Measure conviction not retention; a 2-month GO = "they believe it recurs," not proof they stay.
- Pull the $4k money-math test into August, separate from the Sept email-gate A/B test.
- ClickUp via API token + local scripts (not an MCP).
- ~90% of the build is decision-independent → A1–A4 can start now.

## Still open (decisions)
CLAUDE.md backend reconciliation · D1 price/annual-first · D3 customer/MRR targets · D4 Sept budget · one-time billing/auth dev review · whether to commit today's artifacts.

## Resume prompt (for next session)
> Read `.claude/PROJECT_STATE.md` top to bottom (Session 27). Baseline: 353 tests green, tsc clean, branch `f7d3f42`. First: reconcile CLAUDE.md §6/§11/§13 to allow the Supabase + Lemon Squeezy backend (confirm with Mona), then start Workstream A1 (ClickUp tasks A1-T1 → A1-T4: Supabase project + schema → magic-link auth → cloud persistence → claim-your-plan migration). Keep replies SHORT and in PLAIN language. Write only under Documents. Mark finished ClickUp tasks done via `node scripts/clickup/done.mjs <TASK-KEY>`. Board = Space `90167342807`, workspace Klarecon.
