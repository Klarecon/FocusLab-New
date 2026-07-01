# Session 26 — GTM Option B Launch Plan

**Date:** 2026-06-29
**Type:** GTM / strategy planning — **no app code changed** (tests stay at 353, branch unchanged at `f7d3f42`)

## What happened
Mona decided FocusLab is good enough to take to market and wants to launch. We reviewed all existing GTM material, picked a launch approach, and produced a locked launch plan.

1. **Synthesized the GTM docs.** Approved strategy = the **v3 PLG strategy** (`GTM Plan/2026-06-20-gtm-plg-strategy.html`) + daily execution plan, validated by the Jun 27 pre-mortem/pre-parade. Everything from Jun 16 (v1/v2) is historical. No duplicate/version confusion — all GTM files live in `GTM Plan/`.
2. **Mona chose Option B** — close the money path (accounts + paywall + saved data + return loop + legal) **before** driving traffic, over a free-tier-only soft launch. Grounded in her own pre-mortem: *"close the money path before you open the traffic taps."*
3. **Built the launch plan doc:** `GTM Plan/2026-06-29-option-b-launch-plan.html` (house style). Two parallel workstreams — A = build money path, B = Product Hunt + Reddit prep — a green-light checklist, a timeline table, and a decision log.
4. **Reframed the tone** from the pre-mortem's failure-mode language to the pre-parade's upside framing, at Mona's request ("prepared, not negative").

## Decisions locked (all 6)
- **Approach:** Option B (money path first).
- **Builder:** Mona drives the AI assistant. Optional safety net: one-time dev review of billing/auth before green-light.
- **Stack:** Supabase (auth + persistence, A1) + Lemon Squeezy (merchant-of-record billing, A2).
- **Return loop:** minimal version first (monthly re-assessment + before/after).
- **PH + Reddit:** same launch week.
- **Capacity:** ~5 hrs/day from Mona on the build; content team on Workstream B in parallel.
- **Oren:** sequenced last; the live payment account is **his** → build in sandbox, plug in his live Lemon Squeezy account as the final step.
- **Timeline:** ≈2.5–3 weeks → target **mid-July 2026** green-light.

## ⚠️ Key flag for next session
Option B introduces a backend (Supabase + Lemon Squeezy), which **contradicts CLAUDE.md §6/§13** ("No Supabase / no backend for v1"). Reconcile with Mona and update CLAUDE.md **before** building A1.

## Line up now (parallel, non-blocking)
- Oren: create the Lemon Squeezy account.
- Content team: start PH gallery / aha-moment assets + Reddit drafts (use `reddit-pain-miner` language).

## Resume prompt
> Read `.claude/PROJECT_STATE.md` (Session 26) top to bottom — especially "READ FIRST" and the locked decisions — and skim `GTM Plan/2026-06-29-option-b-launch-plan.html`. Confirm baseline (`npx vitest --run` = 353, `tsc --noEmit` clean). Then ask Mona: OK to update CLAUDE.md to allow the Supabase + Lemon Squeezy backend and start building **Workstream A1 — Supabase auth + move saved plans into accounts**? On her go, build it (TDD, ship green, deploy with `vercel --prod` + verify the alias). Keep replies short. Write only under Documents.
