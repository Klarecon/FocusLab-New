# FocusLab Project State

**Last updated:** 2026-07-01 by Claude via /handover (Session 27 — Funnel decision, Q3 OKRs, fast-validation plan, ClickUp board)

## Quick orient
- **Project:** FocusLab — productivity tool suite. `/analyzer` (find waste) and `/focus` (fix waste — Focus Table + EVI Matrix + Payoff). The two routes are **SEPARATE, not a single flow.**
- **Repo:** https://github.com/Klarecon/FocusLab-New (PUBLIC) — CLAUDE.md lists a stale remote (`mona2611-alt`); the live one is Klarecon.
- **Production URL:** https://focuslab-omega.vercel.app
- **Active branch:** main (local == origin == `f7d3f42`). **No app code changed this session** — this was another planning/strategy session, plus new ClickUp tooling under `scripts/`.
- **Active work:** **Going to market (Option B).** Money-path build hasn't started yet. This session nailed down the funnel/paywall strategy, wrote the Q3 OKRs + a fast money-validation plan, and set up a full ClickUp launch board. **Next session still starts by reconciling CLAUDE.md, then building Workstream A1.**
- **Owner:** Mona Mehta (mona@klarecon.com) — non-technical founder. Wants FAST autonomous execution, NO permission/yes-no questions mid-task, deploy without asking, reacts to finished artifacts/visuals. Prefers brevity. Multi-step plans in **HTML, not markdown**. **Needs PLAIN, non-technical language** (she asked this session to rewrite the ClickUp tasks out of engineer-speak). **Hard rule: only ever write files inside the `Documents` folder — never the Desktop.**

## ⚠️ READ FIRST — two things
1. **CLAUDE.md still bans the backend.** Option B introduces Supabase + Lemon Squeezy, which contradicts CLAUDE.md §6/§13 ("No Supabase / no backend for v1"). **Before writing any A1 code:** confirm with Mona, then update §6/§11/§13. Do NOT silently build a backend against rules that ban it. (This is the FIRST ClickUp SAFE task and the first "what's next" item.)
2. **Pricing hypothesis changed — needs Mona+Oren sign-off.** The fast-validation work recommends launching **annual-first at $39/mo · $290/yr** (NOT the old $29/$199), because in a 2-month window annual take-rate is the fastest honest read on recurring value. This is captured as ClickUp decision **D1** and flagged in two HTML docs. The build is price-agnostic, so this doesn't block A1 — but lock it before go-live.

## What's done in this session (Session 27, 2026-07-01) — planning + ClickUp tooling, no app code
1. **Funnel / paywall decision (multi-agent):** Settled the "partial vs full Pareto" question. **Verdict: the mid-funnel gate is always an EMAIL, never a payment; the paywall only ever lands on the Focus Table.** The A/B test is just *where the email step sits* (before vs after the full results) — both variants share identical plumbing via a movable-position config flag, so we build once and don't have to choose A or B before building. Doc: `GTM Plan/2026-07-01-funnel-gate-decision.html`.
2. **Q3 2026 OKRs (Oren-facing):** 3 objectives — July *Ship & Launch* (COMMIT), Aug *First Dollars* (ASPIRE), Sep *Funnel That Scales* (ASPIRE). Every KR has a number + date (yes/no gradable). Includes a 13-week breakdown, a scoring method (COMMIT=1.0 or red; ASPIRE green≥0.7), a reporting cadence/template, and a "confirm-with-Oren numbers" box. Honesty flag baked in: a 30-day funnel test starting Sep 8 can't fully resolve by Sep 30 (verdict ~Oct 15). Doc: `GTM Plan/2026-07-01-q3-okr-launch-plan.html`.
3. **ClickUp task breakdown doc:** the full build (A1–A4) + content (B) + launch, each task with owner/effort/blocks-flag/checklist. Doc: `GTM Plan/2026-07-01-clickup-task-breakdown.html`.
4. **60-day money-making validation plan (multi-agent: pricing + unit-economics + retention):** Answers "can this make money in 2 months?" Core reframe: in ~5–6 weeks you can't measure retention, so **measure conviction.** Moves: launch **annual-first**, consider **higher price ($39/$290)**, run a **$4k / 21-day cold-ad test in August** (quarantine paid traffic from PH/Reddit/friends; kill at day-5/$1k if cold email capture <6%). GO/KILL/keep-testing thresholds in a table. Frame for Oren: "conviction check, not retention proof." Doc: `GTM Plan/2026-07-01-60-day-money-validation.html`.
5. **Set up the ClickUp launch board via the ClickUp REST API** (Mona wanted it done for her, not manually):
   - Workspace **Klarecon** (team `25716451`), new Space **"FocusLab Launch — Q3 2026"** (space id `90167342807`).
   - **32 tasks**, each with a checklist + due date (mapped to the 13-week plan), split into two folders: **🟢 SAFE — Start Now (No-Regrets)** (A1, A2, A3, A4, B, Launch Week) and **🟡 DECISIONS TO LOCK (with Oren)** (D1 price/annual-first · D2 gate position · D3 MRR targets · D4 Sept budget · D5 $4k-test timing · D6 Oren to-dos).
   - **Rewrote all 32 tasks into plain, non-technical language** ("What it is / Why it matters" + plain checklists with the tech term in brackets) at Mona's request.
   - Tooling lives in `scripts/clickup/`: `setup.mjs` (build board), `due-dates.mjs`, `plain-language.mjs`, `done.mjs` (mark tasks complete), and `task-map.json` (taskKey→ClickUp id).
6. **Security housekeeping:** Mona's ClickUp API token moved into `.env.local` (gitignored, chmod 600). Deleted the risky plaintext `Clickup API/click up api.rtf` (it was NOT gitignored, in a PUBLIC repo). Added `Clickup API/` to `.gitignore`.

## The decision-independent insight (important for the build)
Because the funnel was designed "gate-movable, paywall always on the Focus Table," **~90% of the build is decision-independent** — the open decisions (A vs B, exact price, budgets, targets) are config values / campaign wiring, not different builds. So A1–A4 can proceed now without waiting on the decisions.

## What's next (for the NEXT Claude session) — ordered
1. **Reconcile CLAUDE.md with the backend decision** (§6/§11/§13). Confirm with Mona, update, then proceed. (ClickUp SAFE task, first up.)
2. **Build Workstream A1 — accounts + persistence:** Supabase project + schema (profiles / plans / entitlements, RLS) → magic-link auth → move saved plans from Zustand/localStorage to the user's Supabase row → "claim your saved plan on signup" migration. (ClickUp tasks A1-T1 → A1-T4.)
3. **A2 — billing + paywall (sandbox):** Lemon Squeezy sandbox + both plan variants → single-email checkout (prefilled) → signature-verified webhook that unlocks the user → paywall on the Focus Table only → end-to-end sandbox proof (screen-recorded = KR 1.1). (A2-T1 → A2-T5.)
4. **A4 enabling infra (parallel with A2):** email gate with movable-position flag (A4-T3) · privacy/terms/consent (A4-T1) · funnel analytics with quarantined traffic buckets (A4-T4) · custom domain (A4-T5).
5. **A3 — minimal return loop** (non-blocking): snapshots → monthly (or 1-week for cohort #1) re-assessment nudge → before/after view → instrument organic-vs-prompted return.
6. **Green-light checklist** → launch PH + Reddit same week → then run the **$4k money-math test in August**.
7. **As tasks complete, mark them done in ClickUp:** `node scripts/clickup/done.mjs A1-T1` (etc.). No action needed from Mona.

## Decisions made this session (non-obvious)
- **Email gate, never a payment gate, for cold traffic.** A payment wall on a partial diagnosis reads as bait-and-switch, spikes bounce, and raises CAC via ad-quality penalties. All three funnel agents agreed.
- **Paywall lives only on the Focus Table** (the "cure"), never on the Analyzer (the "diagnosis," which stays the free hook).
- **A/B test = email-step position, built from ONE codebase** via a config flag. Don't build two funnels.
- **Launch annual-first** — annual take-rate is the fastest honest proxy for recurring value in a 2-month window (someone paying a year upfront is betting it recurs). Recommend a capped "Founding Member" annual.
- **Consider launching at $39/$290, not $29/$199** — higher prices teach faster (real conviction vs impulse buys), and it's easy to discount down. [Needs Mona+Oren sign-off — ClickUp D1.]
- **Measure conviction, not retention.** True churn/LTV need 3+ months; be explicit with Oren that a 2-month GO is "they believe it recurs," not "we've shown they stay" (Q4 read).
- **Pull the $4k cold-ad money-math test forward into August** (right after launch), separate from the September email-gate A/B test.
- **ClickUp via API token + local scripts, not an MCP** — both need a token anyway; the script keeps the token local (no third-party server) and handles "mark done" fine.

## Open questions waiting on user
- **OK to update CLAUDE.md to allow the Supabase/Lemon Squeezy backend?** (blocks A1 — still open from S26.)
- **Lock the price / annual-first decision** (ClickUp D1): $39/$290 annual-first vs $29/$199?
- **Set the customer + revenue targets with Oren** (ClickUp D3): launch-traffic assumption (~1,500?), customer floor/target/stretch (8/15/25?), MRR target ($375?), MRR-vs-annual-cash reporting, conversion targets.
- **September ad budget** (ClickUp D4): ~$1,500 directional vs $5k+ conclusive; and the $60 CAC bar.
- **One-time developer review** of the billing/auth layer before green-light? (recommended, not yet agreed.)
- **Whether to commit today's artifacts to git** (see below) — asked at end of handover.
- Carried from S25 (low priority): stats-heading pick; card-fan landing verdict; whether to commit `Design Mockups/`.

## Critical file paths
- **This session's docs (all untracked, in `GTM Plan/`):** `2026-07-01-funnel-gate-decision.html`, `2026-07-01-q3-okr-launch-plan.html`, `2026-07-01-clickup-task-breakdown.html`, `2026-07-01-60-day-money-validation.html`.
- **ClickUp tooling (untracked, `scripts/clickup/`):** `setup.mjs`, `due-dates.mjs`, `plain-language.mjs`, `done.mjs`, `task-map.json`. To mark a task done: `node scripts/clickup/done.mjs <TASK-KEY>`.
- **Prior GTM material:** `GTM Plan/2026-06-29-option-b-launch-plan.html` (the locked launch plan); `2026-06-20-gtm-plg-strategy.html` + daily-execution-plan; `2026-06-27-*` pre-mortem/pre-parade.
- **App rules:** `CLAUDE.md` (§6/§13 "no backend" lines need updating first).
- **State that migrates for A1:** `src/stores/audit-store.ts` (Zustand + localStorage persist → Supabase-backed).
- **Paywall gate location:** between `src/components/analyzer/ResultsView.tsx` and the `/focus` route entry.
- **Tests (353, the ratchet):** `src/__tests__/feedback-regression.test.ts`.

## Known gotchas
- **File-writing boundary: Documents only.** Never the Desktop.
- **Use PLAIN language with Mona** — she's non-technical; explain "what & why," keep jargon in brackets if needed.
- **ClickUp:** token in `.env.local` (gitignored). Board = Space `90167342807` in workspace Klarecon (`25716451`). Space's closed status is `complete`. Note: ClickUp doesn't preserve checklist item order on rebuild (wording is right, order may shuffle). There's also a separate pre-existing empty list "FocusLab Launch" in a "Just Capable" space — NOT our board; ours is the "FocusLab Launch — Q3 2026" Space.
- **Deploy = `npx vercel --prod --yes` then verify the alias** — `git push` alone does NOT deploy. Confirm via `npx vercel inspect focuslab-omega.vercel.app` or curl `/analyzer` for 200.
- **353 tests is the ratchet — never regress.** New A1–A4 features each get tests (TDD per CLAUDE.md §9).
- **Pre-commit hook** `.claude/hooks/verify-done.sh` (11 checks) hard-blocks commits: banned green/old palette, Hanken Grotesk, corporate emoji, window globals, SCORE_FROM_LEVEL=2/3/4. Palette: pink `#c4186a` for CTA/success/selected.
- **Backend secrets** (A1/A2): Supabase URL/keys + Lemon Squeezy API key + webhook secret → Vercel env / `.env.local`, never commit. Lemon Squeezy LIVE account belongs to **Oren** (plugged in as the final ~30-min step).
- **Uncommitted right now:** modified `.gitignore` + `.claude/PROJECT_STATE.md`; untracked `scripts/`, all `GTM Plan/2026-07-01-*` + `2026-06-27/29/30-*` docs, `Plans/`, `Design Mockups/`, Session 26 log + feedback log.

## How to resume work
1. Read this file top to bottom, especially "READ FIRST" and the decisions. Skim `GTM Plan/2026-07-01-60-day-money-validation.html` and `2026-07-01-funnel-gate-decision.html`.
2. `git status` + `git log --oneline -10` (newest = `f7d3f42`).
3. `npx vitest --run` → **353 passed**; `npx tsc --noEmit` clean (baseline before touching anything).
4. Confirm with Mona: OK to update CLAUDE.md and start A1 (Supabase auth + persistence)? Then execute. Keep replies SHORT and in PLAIN language, write only under Documents, ship green, deploy with `vercel --prod` + verify the alias, and mark finished ClickUp tasks done via `scripts/clickup/done.mjs`.
