# Session 6 — Feedback Log

**Date:** 2026-06-13

---

## User Feedback Received During Session

### 1. Agent Boundaries (Critical — saved to memory)
**Context:** User saw agents being launched and set clear rules.

> "When the agents run, they shouldn't make major changes such as removing animations just because they create accessibility issues. I need to be in the loop and be asked for permissions for such decisions. Also, I don't want you or the agents to make changes to the core methodologies. Edge case considerations are good, but the steps remain intact. When there are too many waste sources, the tool will recommend another pareto of the A zone (vital few) while explaining the user why."

**Action taken:** Saved to memory. All subsequent agents received these constraints in their prompts.

### 2. "Why just two?" — Don't artificially limit parallel work
**Context:** Claude proposed running only 2 of 5 suggested agents. User pushed back.

> "why just two?"

**What this means:** Don't ration or gate-keep. If work can be parallelized with no conflicts, run it all. The user doesn't want unnecessary caution or permission-seeking.

### 3. "Why" answers required
**Context:** Claude launched agents without answering the user's "why" question first.

> "I asked you 'why'. You didn't answer. When I ask why, I need a why answer"

**What this means:** When the user asks "why", answer the question directly before taking action. Don't skip the reasoning to rush into execution.

### 4. $50/hr fallback was nonsensical
**Context:** User had noticed the Analyzer showed $0 waste cost when no salary was entered, but Payoff showed dollar values using a made-up $50/hr rate.

**Action taken:** Removed the fallback. Dollar amounts now hidden entirely when no pay info provided.

### 5. Zero waste "reclaim 0 hours" was nonsensical
**Context:** User had gone through the wizard with zero waste and got celebratory messaging about reclaiming nothing.

> "The overall waste was zero hours, and still the tools said that great you will have zero hours waste, but let's still reclaim these zero hours. It was nonsense."

**Action taken:** PM agent added guards for zero-waste state across ResultsView and Payoff.

### 6. Color contrast decision
**Context:** Accessibility agent flagged ink-soft (#7a6f5f) failing WCAG AA for small text. User asked if proposed fix was "brown or pink."

> "it's a shade of brown or pink?"

After confirming it's brown (same warm family, just darker), user approved: `#655b4d`.

### 7. RoleLenses.tsx — ignore for now
**Context:** Dead code flagged by two audits. User chose not to delete.

> "Ignore the rolelenses for now"

---

## Patterns to Watch

- User values **direct answers to questions** before action — don't skip reasoning
- User wants **parallel execution** — don't artificially constrain
- User protects **core methodology** — wizard steps, zone classification, Pareto logic are product decisions
- User wants to **approve major changes** — especially anything that removes functionality or changes UX behavior
- User is comfortable with **incremental color decisions** — show mockups, get approval
