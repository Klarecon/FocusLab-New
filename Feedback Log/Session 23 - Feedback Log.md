# Session 23 — Feedback Log

**Date:** 2026-06-27
**Branch:** main → `c6547d3`

Concrete feedback Mona gave this session, with how it was actioned. (Code-verifiable items become permanent assertions in `feedback-regression.test.ts`.)

| # | Feedback (verbatim/paraphrased) | Type | Action | Where |
|---|----------------------------------|------|--------|-------|
| 1 | "see the pink sentences below the effort? I don't want them. i had asked to remove them before as well." | CODE | Removed `START_GUIDANCE` line under the effort/impact dots. | `SolutionPicker.tsx` (`c6547d3`) — test `[S23-#1]` |
| 2 | "remove the pink lines underneath from this section too" (Action Sequence) | CODE | Removed per-task `SEQUENCE_GUIDANCE` line under each task title. | `EviMatrix.tsx` (`c6547d3`) — test `[S23-#2]` |
| 3 | "when i click the fresh audit button, i get [This page couldn't load]" | CODE | Fixed hooks-order crash: moved `chartData` useMemo above the `!paretoResult` early return, made null-safe. | `ResultsView.tsx` (`c6547d3`) — test `[S23-#4]` |
| 4 | "i didnt find the new start over button you added, give me a screenshot of where to find it" | CODE | It was a faint gray underline; made it a visible pink-outlined ↺ button + sent annotated screenshot. | `ResultsView.tsx` (`c6547d3`) — test `[S23-#5]` |
| 5 | "make a senior ui ux designer think how to make the action sequence and the waste log better… still feel like a form. don't change anything without showing me options on mockup" | DESIGN | Built 3 mockup directions each (W1/W2/W3, A1/A2/A3); no app code touched on those sections. | `Design Mockups/redesign-options.html` |
| 6 | "I want to send this to Oren… make it easier by showing the existing version side by side. left = current, right = options" | DESIGN | Built a current-vs-options comparison page, current panel sticky. | `Design Mockups/redesign-comparison.html` |
| 7 | "How did you get access to my desktop?" → "Don't touch anything except the Documents Folder." | PREFERENCE | Deleted the Desktop file; committed to Documents-only writes; saved to memory. | [[feedback_documents_only_writes]] |
| 8 | "I needed some visual examples of those components… I don't need a dashboard" / "show me these as png, the most likely ones" | MISC | Pulled real component screenshots to `~/Documents/awesome-components-examples/`; ranked picks to Mona's taste. | (not logged to project) |
| 9 | "I like the card-fan-carousel. Want a mockup of how it'll be implemented on FocusLab" | DESIGN | Built a FocusLab-skinned card-fan landing section ("deck of drains"). | `Design Mockups/card-fan-focuslab.html` |

## Regression coverage added/changed
- `[S23-#1]` SolutionPicker has NO `START_GUIDANCE` / "Plan it in" / "Only if it" line.
- `[S23-#2]` EviMatrix Action Sequence has NO `SEQUENCE_GUIDANCE` / "Plan it in" line.
- `[S23-#4]` ResultsView declares `chartData` useMemo BEFORE the `!paretoResult` early return (+ null-safe).
- `[S23-#5]` Start-over is a bordered pink button (reclaim), not a faint underline.
- Flipped S20-V4-#3/#5 to drop the now-removed guidance assertions (kept InlineRating/setSolutionScore coverage).

## Notes for future sessions
- **Documents-only writes** is now a hard rule — never the Desktop. See [[feedback_documents_only_writes]].
- Mona is sending the redesign comparison to **Oren** before any build — wait for his picks (W1/W2/W3, A1/A2/A3).
- She likes the **card-fan**; verdict pending on the FocusLab mockup (and a possible Results-page variant using her own vital-few).
- Reversals happen: when Mona un-asks for something earlier paid for, flip the regression test to a negative assertion rather than deleting it.
