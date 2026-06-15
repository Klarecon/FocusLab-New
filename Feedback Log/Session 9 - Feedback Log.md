# Session 9 — Feedback Log

**Date:** 2026-06-15

---

## Oren's Feedback (from screenshots, 2026-06-15)

### O1. Remove avoidable % from WeighStep
**Context:** WeighStep had "Of this time, how much could you actually cut?" with All/About half/A little buttons.

> "The week hrs, should be per task. Of this time, how much could you actually cut? -> This is too early to ask, and may change the numbers DOWN"

**Mona's decision:** Yes, do it
**Action taken:** Removed avoidable % UI, Pareto runs on raw hours. `avoidablePct` forced to 100 in store.

### O2. Remove "Really zero?" prompt
**Context:** When user set hours to 0, a prompt appeared asking to confirm.

> "Seems redundant"

**Mona's decision:** Agree
**Action taken:** Removed confirmedZeros state and zero-confirmation UI block.

### O3. Double Pareto — two-pass wizard
**Context:** Single-pass wizard was overwhelming with 10-20+ sources to weigh.

> "I strongly suggest this is upgraded to double Pareto, i.e., meeting that don't contribute. The 2nd round goes to elaboration, that cuts a really time consuming 1st try step"

**Mona's decision:** Yes, do it
**Action taken:** IntakeStep converted to category-level estimation (rough hrs per pain category). New DrilldownStep shows only vital few categories for detailed source-level estimation. WeighStep replaced.

### O4. Bar chart labels unreadable
**Context:** Long labels rotated 45° at font-size 10. Truncate function was a no-op.

> "old recurring issue"

**Mona's decision:** Remove labels or shorten without changing meaning
**Action taken:** Implemented truncation at 25 chars with ellipsis. Full label visible on hover via Recharts tooltip.

### O5. Solution Picker text-heavy
**Context:** Each solution card showed full description paragraph + badges + reclaim hint.

> "A page with tons of text"

**Mona's decision:** Option C (collapse descriptions + show fewer)
**Action taken:** Descriptions collapse behind "Show details" toggle. Max 3 solutions visible per drain with "Show N more fixes" button.

### O6. EvI Matrix issues (3 sub-items)
**Context:** Tab naming, tooltip verbosity, and no above-fold hook.

> "Should be the EvI variant. Easy should be first, Hard should be last visually. User engagement is not existent above the fold in EvI and solution table"

**Mona's decision:** Do all 3. Also: "when i hover over each ball, it gives too many details. Just keep its name, category, and effort impact score."
**Action taken:**
- (a) Renamed tab to "EvI Matrix"
- (b) Simplified tooltip to: name, quadrant badge, effort/impact scores only
- (c) Added above-fold summary pills showing Pearl/Oyster/LHF/WE counts

### O7. No skip button for White Elephants
**Context:** Priority table header said "skip if you can" but no button existed.

> "No option to explicitly skip"

**Mona's decision:** Agree
**Action taken:** Added remove button (×) on all priority table rows. Calls existing `removeSolution` action.

### O8. Date picker allows past dates
**Context:** Plain date input with no min attribute.

> "Allows me to put older date"

**Mona's decision:** Agree
**Action taken:** Added `min={new Date().toISOString().split("T")[0]}` to date input.

### O9. Reframe reclaimed time positively
**Context:** Payoff showed "You could reclaim X hrs" but didn't say what you could DO with that time.

> "Idea - here, not only reclaim, we should tell them what they CAN do"

**Mona's decision:** Love it, do it. Role-specific and generic. Web research for opportunities.
**Mona's note:** "Make it role-specific and generic. Say someone reclaims 5 hours per week, suggest something like - work on the initiative you know could get you a bonus this quarter. I'd suggest doing a web-research to find out what could be the potential opportunities for people in different roles to make use of the freed-up time. Build a strong database around it."
**Action taken:** Created `opportunity-frames.ts` with research-backed copy (Cal Newport, Gloria Mark, McKinsey, DORA, HBR, Microsoft WTI). 4 time tiers × 10 roles. Added "What could you do with that time?" section to Payoff.

### O10. Duplicate waste sources across categories
**Context:** "Chasing people for status updates" appeared under both "Too much coordination" and "Status packaging and firefighting."

**Mona's decision:** Agree
**Action taken:** Added `groupOwnership` deduplication — each source appears under the FIRST pain prompt that includes it.

---

## Mona's Visual Checks (Session 8 verification)

### #6. "See your impact" CTA centering
**Decision:** Needs fix
**Action taken:** Changed `text-center` to `flex justify-center` in FocusTable.tsx

### #7. Quadrant labels overlapping chart
**Decision:** Needs fix
**Action taken:** Bottom labels changed to `bottom-[76px]` to clear X-axis and legend

### #10. Action sequence list alignment
**Decision:** Needs fix
**Notes:** "repeated tags, unclear which column is what. For example, task owner, due date. It should look like an organized table"
**Action taken:** Added column headers (#, Task, Quadrant, Owner, Due) above priority table rows

### #17. Before/After section centering
**Decision:** Looks good (no change needed)

---

## Meta-Feedback (Process/Working Style)

### "The changes are lousy. You are once again making me go round and round."
**Context:** User reviewed deployed app after first commit. Found issues despite QA passing.
**Root cause:** Code-level checks passed but runtime behavior and visual state weren't verified. First commit went out without specialist agents.
**Action taken:** Ran Math Agent, DR Copywriter, and Sense Checker. Fixed 24 additional issues. Saved hard requirement to memory: specialist agents must run before ANY "done" declaration.

### "I did not expect you to copy paste my words"
**Context:** Opportunity framing copy used Mona's exact phrasing instead of researched alternatives.
**Action taken:** Did actual web research (Cal Newport, Gloria Mark, McKinsey, etc.) and rewrote all copy with specific stats and role-relevant framing.

### "I need the expert agents"
**Context:** User demanded Math Agent, DR Copywriter, Sense Checker, and other specialists run before review.
**Saved to memory:** Yes — `feedback_qa_tighter_system.md` updated. This is now a mandatory step.

### "I do not expect you to break the working things"
**Context:** Double Pareto refactor removed custom source input that existed in old IntakeStep.
**Action taken:** Restored custom source input in DrilldownStep.
**Saved to memory:** Implicit — always verify existing features still work after refactors.

---

## Summary

| Source | Items | Status |
|--------|-------|--------|
| Oren's feedback | 10 items | All implemented |
| Mona's visual checks | 4 items | 3 fixed, 1 already good |
| Specialist agent fixes | 24 items | All fixed |
| Process feedback | 4 items | All addressed |
| **Total** | **42 items** | **User still reports misses on deployed app** |
