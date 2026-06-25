# Waste Definition Options — for the Pareto Time-Audit Tool

**Date:** 2026-06-11
**Purpose:** Pick (or adapt) one operational definition of "waste" to use as a *filter* on the suggested-source list, so we stop letting non-waste items in. Each definition below is run against the 6 known contaminated examples, which serve as failing tests: a good definition must EXCLUDE or RE-CLASSIFY each.

## The 6 contaminated examples (our test suite)

| # | Bad source | What it actually is |
|---|---|---|
| 1 | "Founder-as-bottleneck" | A structural STATE, not an activity you spend hours doing |
| 2 | "Living in reactive mode" | A subjective FEELING / complaint, not a measurable activity |
| 3 | "No time left for actual strategy" | A RESULT/consequence of waste (double-counts) |
| 4 | "72% of week in meetings — most failures" | A METRIC with a baked-in number; the % must be the user's input |
| 5 | "Busywork a robot should be doing" | The SOLUTION is baked into the name |
| 6 | "Death by a thousand tabs" | Cute JARGON, idiosyncratic, not a clean category |

The job of a definition: cleanly separate a genuine waste **SOURCE** (an activity where avoidable hours accumulate) from a complaint, a feeling, a symptom/result, a structural state, a solution, and a metric.

---

## Definition 1 — Lean / Ohno's Muda ("non-value-adding activity")

**Crisp definition:** *Waste is any **activity** that consumes time but does not add value the customer would pay for — i.e. work that could be reduced or removed without reducing the output the business is paid for.*

**Grounding.** Taiichi Ohno's Toyota Production System defines *muda* (waste) as the seven categories — Transport, Inventory, Motion, Waiting, Overproduction, Over-processing, Defects — later extended with an 8th, **non-utilized talent / skills** (people doing work beneath their capability). Lean's core test is value-add vs. non-value-add: a value-added step "directly contributes... in a way the customer is willing to pay for"; non-value-add "simply adds cost or time without increasing market value." ([The Lean Way — 8 Wastes](https://theleanway.net/The-8-Wastes-of-Lean); [DuraLabel — Value-Added vs Non-Value-Added](https://resources.duralabel.com/articles/value-added-vs-non-value-added-activities); [TXM — 7 Wastes](https://txm.com/lean-manufacturing-tip-7-wastes/))

**INCLUDE / EXCLUDE rule.** Include only if it is an *activity* (something you DO, measurable in hours/day) AND a customer/the business would not knowingly pay for that time. Exclude states, feelings, results, metrics, and solutions by construction — none of them are activities.

**Run the 6 tests:**
1. Founder-as-bottleneck — **KILLS.** Not an activity. Re-word to the activity it produces, e.g. "Re-doing/approving work others could finish."
2. Reactive mode — **KILLS.** A feeling, not an activity. Re-word to "Unplanned interruptions / firefighting requests."
3. No time for strategy — **KILLS.** A result, not an activity. Drop it; it is the *outcome* the tool computes.
4. 72% in meetings — **PARTLY.** Lean accepts "meetings" as an activity but the baked-in % violates Lean's rule that the *user* logs the hours. Re-word to "Low-value / status meetings" with hours as input.
5. Busywork a robot should do — **PARTLY.** "Manual repetitive data entry" is a valid activity (over-processing); but the "robot should" half is the solution and must be stripped from the name.
6. Death by a thousand tabs — **KILLS as named.** Idiosyncratic. Maps to the real Lean category "task-switching / context-switching."

**Trade-offs.** *Strength:* battle-tested, activity-anchored, gives ready category names (waiting, rework, over-processing, motion, task-switching). *Too strict risk:* the "customer would pay" test is awkward for internal knowledge work — some genuinely valuable internal work (1:1s, planning) fails a naive customer test, so you need the NNVA carve-out (see Def 2). *Measurability:* high — every category is a clock-able activity.

---

## Definition 2 — Value-Stream "Three Buckets" (VA / NNVA / NVA)

**Crisp definition:** *Waste is the **Non-Value-Added (NVA) activity** bucket only — time that adds neither customer value nor is required by the current system — explicitly separated from Necessary-but-Non-Value-Add (NNVA) work that we keep.*

**Grounding.** Value-stream mapping classifies every step into three buckets: **VA** (customer pays for it), **NVA** (pure waste — eliminate), and **NNVA** (no customer value but currently required, e.g. compliance, approvals, certain reviews — minimize, don't delete). The discipline's own guidance: "eliminate pure waste while... managing necessary non-value-added activities more efficiently." ([BusinessMap — VA vs NVA](https://businessmap.io/blog/value-adding-vs-non-value-adding-activities); [SixSigma.us — VA vs NVA](https://www.6sigma.us/process-improvement/value-added-vs-non-value-added-activities/); [Six Sigma DSI — NVA](https://sixsigmadsi.com/glossary/non-value-added-nva/))

**INCLUDE / EXCLUDE rule.** Same activity test as Def 1, PLUS a forced three-way tag: VA (not a source), NNVA (a source the user can *reduce* but the tool should flag as "necessary — optimize, don't kill"), NVA (a true waste source). Only NVA + reducible-NNVA become sources.

**Run the 6 tests:** Identical kills to Def 1 for items 1, 2, 3, 6 (none are activities). For 4, "meetings" gets split — a weekly planning meeting is NNVA (keep, shorten), a redundant status meeting is NVA (cut); the user logs hours either way, the baked % is removed. For 5, "manual data entry" tags NVA; solution stripped.

**Trade-offs.** *Strength:* directly fixes the "is this even waste?" gray zone that loosened the original list — NNVA is the honest home for "necessary but heavy" work (admin, compliance) that would otherwise be wrongly called pure waste OR wrongly excluded. Maps cleanly to the tool's solution-routing (NVA → eliminate, NNVA → streamline/delegate). *Too loose risk:* the NNVA bucket can become a dumping ground if not capped. *Measurability:* high, but adds one classification step per source — slightly more cognitive load on the user.

---

## Definition 3 — "Work About Work" / Shallow Work (knowledge-work native)

**Crisp definition:** *Waste is **low-cognitive coordination and overhead activity** — the logistical "work about work" (chasing updates, status, tool-switching, duplicative and unnecessary-meeting time) that displaces the skilled, value-creating work you were hired to do.*

**Grounding.** Asana's *Anatomy of Work* defines "work about work" as "the activities that take time away from the meaningful, skilled work you were hired to do" — and measures it: ~60% of the day, 209 hrs/yr on duplicative work, 103 hrs/yr in unnecessary meetings, 352 hrs/yr talking about work. Cal Newport's complementary split: **deep work** (distraction-free, value-creating, hard to replicate) vs. **shallow work** ("noncognitively demanding, logistical-style tasks... that tend not to create much value and are easy to replicate" — email, paperwork, unproductive meetings). ([Asana — Work About Work](https://asana.com/resources/why-work-about-work-is-bad); [Asana — Anatomy of Work Index 2021](https://www.businesswire.com/news/home/20210114005374/en/Asana-Anatomy-of-Work-Index-2021-Work-About-Work-Is-Dominating-in-a-Distributed-World); [Thinkers50 — Deep vs Shallow Work](https://thinkers50.com/blog/work-and-life/deep-vs-shallow-work-cal-newport/))

**INCLUDE / EXCLUDE rule.** Include if it is a recurring *low-value logistical/coordination activity* that crowds out high-value work. Exclude high-value deep work, and (because the definition is activity-framed) exclude states, feelings, results, metrics, solutions.

**Run the 6 tests:** 1, 2, 3, 6 — **KILL** (not activities; "thousand tabs" re-words to "tool/context switching," a named work-about-work category). 4 — meetings are squarely in-scope, but only as user-logged hours; baked % removed. 5 — "manual repetitive tasks" qualifies as shallow work; the robot-solution half is stripped.

**Trade-offs.** *Strength:* speaks the user's actual language (meetings, email, status updates, tool-switching) and comes with credible benchmark hours for the $ math. *Too loose risk:* "shallow" is somewhat subjective — one person's shallow email is another's core job; without an "avoidable / could be reduced" qualifier it can over-include legitimate work. *Too strict risk:* misses non-coordination waste (e.g. rework, waiting on approvals) that Lean catches. *Measurability:* high and intuitive.

---

## Definition 4 — Interruption / Attention-Fragmentation (the cost-of-switching lens)

**Crisp definition:** *Waste is the **time lost to interruption and context-switching** — fragmented attention, recovery time, and self-interruption that prevent sustained focus.*

**Grounding.** Gloria Mark's research: workers now hold focus on one screen ~47 seconds (down from 2.5 min in 2004); each interruption costs ~23 minutes to fully refocus; ~44% of interruptions are self-generated; unread-message awareness creates "attention residue" that degrades focus. ([Gloria Mark — Attention Span](https://gloriamark.com/attention-span/); [Microsoft Research — Mark et al.](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/10/p903-mark.pdf))

**INCLUDE / EXCLUDE rule.** Include activities/events that fragment focus or impose recovery cost (interruptions, notifications, switching, multitasking). Exclude everything else.

**Run the 6 tests:** 1, 2, 3 — KILL. 6 "thousand tabs" is *exactly* this lens's home (re-word to "context-switching / tab-thrashing"). 4 partially (meetings as interruptions) but the metric framing still fails. 5 partially.

**Trade-offs.** *Strength:* rigorous science; the right model for *one* important waste category and great for the $ math (recovery-time multiplier). *Fatal weakness as the master definition:* far too narrow — it would exclude rework, waiting, over-processing, unnecessary-meeting *duration*, admin overhead. Best used as a **sub-category** under a broader definition, not the top-level filter. *Measurability:* the underlying activity (interruptions/switches) is hard for a user to self-quantify in hours/day without help.

---

## Comparison table

Legend: ✅ = definition KILLS/re-classifies the bad item (good); ⚠️ = keeps it only after stripping the metric/solution; ❌ = lets it through.

| Definition | 1 State | 2 Feeling | 3 Result | 4 Metric | 5 Solution | 6 Jargon | Too strict? | Too loose? |
|---|---|---|---|---|---|---|---|---|
| **1. Lean / Muda** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | Mild (customer test awkward) | Low |
| **2. VA/NNVA/NVA** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | Low | Low–Med (NNVA bucket) |
| **3. Work-About-Work / Shallow** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | Med (misses rework/waiting) | Med ("shallow" subjective) |
| **4. Interruption/Attention** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | High (too narrow) | Low |

Note: the ⚠️ on items 4 and 5 is not a definition weakness — *no* definition can stop a metric or solution being typed into a label. That is handled by **naming rules** (below), which every definition above implies.

---

## Recommendation — Hybrid: Lean three-bucket spine + knowledge-work vocabulary

**Use Definition 2 (VA / NNVA / NVA) as the structural filter, expressed in Definition 3's knowledge-work language, with Definition 4 as one sub-category.**

> **Waste = a recurring work *activity* (something you spend clock-able hours doing) that adds no value the business is ultimately paid for, and whose hours are *avoidable* — reducible by deleting, automating, delegating, batching, or streamlining it. We separately tag activities that are necessary-but-low-value (NNVA: optimize, don't kill) from pure waste (NVA).**

**Rationale (2–3 sentences):** The original list got contaminated because the loose definition had no *activity test* and no *avoidability/necessity test* — so states, feelings, results, and metrics leaked in. The Lean three-bucket spine kills all four non-activity contaminant types by construction and the NNVA bucket gives "necessary but heavy" work an honest home so it isn't mislabeled, while Asana/Newport vocabulary keeps the source names in language a knowledge worker recognizes and supplies benchmark hours for the dollar math.

---

## Naming rules the definition implies (enforce these on the source list)

1. **Name the activity, not the feeling, result, state, or solution.** A valid source is a verb-phrase you could put hours against ("Re-doing work after unclear briefs"), never "reactive mode," "no time for strategy," "founder bottleneck," or "robot should do this."
2. **No quantities in labels.** Never bake a number or % into a source name; the hours/% are always the *user's* input. ("Status meetings," not "72% of week in failed meetings.")
3. **No solutions in labels.** Strip "should be automated / delegated / a robot should do it" — solutions live in the routing layer, not the source name.
4. **No idiosyncratic jargon.** Use the clean parent category ("context-switching"), not the meme ("death by a thousand tabs").
5. **Every source carries a VA/NNVA/NVA tag.** Only NVA and reducible-NNVA appear as suggested sources; pure VA never does. This drives solution routing (NVA → eliminate; NNVA → streamline/delegate/automate).
6. **Categories must support sub-groups.** Top categories (e.g. Coordination overhead, Rework/defects, Waiting/approvals, Context-switching, Manual/repetitive, Unnecessary meetings) each hold specific clock-able sub-sources — so the Pareto can roll up to the "vital few" categories.
7. **Avoidability gate:** if no realistic reduction lever exists (delete/automate/delegate/batch/streamline), it isn't a waste source — it's just work.

---

### Sources
- The Lean Way — The 8 Wastes of Lean: https://theleanway.net/The-8-Wastes-of-Lean
- TXM — 7 Wastes of Lean Manufacturing: https://txm.com/lean-manufacturing-tip-7-wastes/
- DuraLabel — Value-Added vs Non-Value-Added Activities: https://resources.duralabel.com/articles/value-added-vs-non-value-added-activities
- BusinessMap — Value-Adding vs Non-Value-Adding Activities: https://businessmap.io/blog/value-adding-vs-non-value-adding-activities
- SixSigma.us — Value Added vs Non Value Added Activities: https://www.6sigma.us/process-improvement/value-added-vs-non-value-added-activities/
- Six Sigma DSI — Non-Value-Added (NVA): https://sixsigmadsi.com/glossary/non-value-added-nva/
- Asana — Why Work About Work Is Bad: https://asana.com/resources/why-work-about-work-is-bad
- Asana — Anatomy of Work Index 2021 (BusinessWire): https://www.businesswire.com/news/home/20210114005374/en/Asana-Anatomy-of-Work-Index-2021-Work-About-Work-Is-Dominating-in-a-Distributed-World
- Thinkers50 — Deep vs Shallow Work, Cal Newport: https://thinkers50.com/blog/work-and-life/deep-vs-shallow-work-cal-newport/
- Gloria Mark — Attention Span: https://gloriamark.com/attention-span/
- Microsoft Research — Mark et al., focus & interruption study: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/10/p903-mark.pdf
- Science (Kahneman et al.) — Day Reconstruction Method: https://www.science.org/doi/10.1126/science.1103572
- Activity-Based Costing (Wikipedia): https://en.wikipedia.org/wiki/Activity-based_costing
