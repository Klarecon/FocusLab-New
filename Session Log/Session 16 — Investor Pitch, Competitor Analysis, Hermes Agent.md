# Session 16 — Investor Pitch, Competitor Analysis, Hermes Agent

**Date:** 2026-06-22
**Type:** GTM / research / strategy (NO code changes)
**Branch:** main
**Owner:** Mona Mehta (mona@klarecon.com)

---

## What this session was about

A non-code session focused on GTM messaging, competitive landscape, and an AI-tooling question. No product code touched, no tests run (none needed). All work product is in `GTM Plan/` or is conversational.

---

## What was done

### 1. Refined the Oren investor pitch (verbal version)
- Mona had sent Oren a written paragraph pitch and asked for a more natural version to say to an investor verbally in a few seconds.
- Delivered a spoken-style rewrite + an even tighter "elevator" version.
- Key edits: lead with the human sting ("firefighting, then told they're not doing enough") before the 2-in-3 stat; cut the wind-up before the dollar figure; close on the differentiator ("15 minutes, not four weeks"); drop em-dash clauses that trip you up out loud.
- Offered (not yet done) a 10-second + 30-second version pair.

### 2. Competitor analysis
- Researched direct/adjacent/substitute competitors via web search.
- **Created `GTM Plan/2026-06-22-competitor-analysis.html`** — styled in FocusLab palette (Fraunces/Plus Jakarta, reclaim pink/waste orange/gold), responsive.
- Structure: three "rings" —
  - **Ring 1 (Direct):** quiz/diagnostic tools — The ONE Thing, Productivity Breakthrough Quiz, BeeProductive "#1 Productivity Killer", ClickUp org quiz, Mindtools. Conclusion: no true twin; all are thin lead-magnet quizzes with no real Pareto engine or ranked plan. That gap is FocusLab's opening.
  - **Ring 2 (Adjacent):** time trackers (RescueTime, Rize, Timely, Toggl, Hubstaff, Time Doctor) + AI schedulers (Reclaim.ai, Motion, Clockwise, Morgen, Akiflow). The "15 min not 4 weeks" line is aimed at these.
  - **Ring 3 (Substitutes):** coaching platforms (BetterUp, Waggle, Cloverleaf) + DIY (spreadsheet audit, Eisenhower, Pareto templates, consultants). The DIY status quo is the real competitor.
- Strategic read: no exact twin (green field but must teach the category); edge is Pareto engine + ranked action plan; pre-empt the "you're just RescueTime/Reclaim" pattern-match; watch incumbents bolting on a 15-min diagnostic.

### 3. Hermes Agent discussion (Mona read about it on Reddit)
- Researched and explained **Hermes Agent by Nous Research** (open-source autonomous agent, released Feb 2026): runs locally on your own machine, persistent memory, self-written "skills," sub-agent orchestration, model-agnostic, no API cost, fully private. Wants a capable machine + local model (Ollama/LM Studio); on Mona's **Mac** it can run via Ollama with no NVIDIA rig needed.
- Mona challenged whether the first review was biased (Claude reviewing a competitor). Acknowledged the real conflict of interest; corrected two places where Hermes was undersold: (a) it's model-agnostic, not locked to weak 30B models; (b) "Claude Code already does this" is the convenient-for-Claude framing — the honest version is they're different philosophies (ownership/privacy vs. frontier quality).
- Gave a combined-use strategy: **Claude Code = the brain** (high-stakes code, GTM, judgment, FocusLab app); **Hermes = the tireless private intern** (always-on monitoring, repetitive/batch chores, processing sensitive user data locally once FocusLab has users). Recommendation: don't switch mid-launch; keep Claude Code as workhorse; experiment with Hermes later on ONE specific background job (e.g., weekly competitor-pricing monitor).

---

## Other untracked files observed (NOT created this session)
These appeared in `git status` but were not authored in this conversation — likely from a parallel session. Flag for Mona, do not assume ownership:
- `GTM Plan/2026-06-22-oren-deck.html`
- `GTM Plan/2026-06-22-problem-why-now-slide.html`
- `GTM Plan/2026-06-22-the-fix-slide.html`

---

## Product feedback log
**None this session.** No product/UI feedback items were raised — this was strategy and research only. Nothing to add to `feedback-regression.test.ts`.

---

## State of code
- **Unchanged.** No source files touched. Test suite not run (no code changes to verify).
- Working tree is clean. (The Session 15 IntakeStep layout-shift fix is committed in `a64a45a` — the prior PROJECT_STATE.md wrongly claimed it was uncommitted; corrected this session.)

---

## What's next / open threads
1. Offered but not delivered: 10-second + 30-second versions of the investor pitch (Mona can ask).
2. Offered but not delivered: pricing + exact feature-gap deep-dive on the Ring 1 quiz competitors for a sharper "why we win" slide.
3. Offered but not delivered: drafting the first Hermes background-task spec (weekly competitor-pricing monitor).
4. Carried from Session 15: connect custom domain; build paywall gate; Stripe; analytics; landing page. (IntakeStep fix is already committed — no action needed.)

---

## Resume prompt for next session

> Read `.claude/PROJECT_STATE.md` top to bottom. This is a FocusLab session. Last session (16, 2026-06-22) was GTM/research only — refined Oren's investor pitch, created `GTM Plan/2026-06-22-competitor-analysis.html`, and discussed Hermes Agent vs Claude Code. No code changed; the Session 15 IntakeStep layout-shift fix is STILL uncommitted. GTM execution is underway (started June 22). Likely next code work: commit the IntakeStep fix, then paywall gate / Stripe / analytics / landing page. Ask Mona what she wants to work on. Autonomous execution, no permission prompts, GTM work goes in `/GTM Plan/`.
