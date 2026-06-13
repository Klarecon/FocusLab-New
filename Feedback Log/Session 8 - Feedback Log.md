# Session 8 — Feedback Log

**Date:** 2026-06-13

---

## User Feedback Received During Session

### 1. Missing solutions in database
**Context:** User selected CEO/Founder role, got "Prep and follow-up for investor updates" as their #1 drain. SolutionPicker showed zero pre-built fixes.

> "It says that we don't have prefilled fixes for this one. I don't want to say like that. I do want to update our database."

**Action taken:** Added 40 new solutions covering all 20 uncovered waste slugs (sdev, ops, finance, CEO). Sourced from DORA, Microsoft WTI, HBR, Forrester, Atlassian, etc.
**Saved to memory:** No — this is a data fix, not a preference.

### 2. Custom fix input should allow multiple entries
**Context:** Custom fix input resets after one add, giving the impression only one custom fix can be added.

> "There is this option to add just one solution that doesn't make any sense they have to be able to write more solutions."

**Action taken:** Added useRef for auto-focus after adding, "Added!" flash on button, input stays ready for next entry.
**Saved to memory:** No.

### 3. Custom fix disappears after adding
**Context:** After clicking "Add", the custom solution vanishes from the visible list.

> "When they write one solution and click on the add button that solution becomes invisible that should stay visible nothing should disappear after input."

**Action taken:** Custom fixes now appear as visible selected cards inside the drain section with a "Your fix" badge and remove button.
**Saved to memory:** No.

### 4. Zone B should be visible by default + nudge
**Context:** User had only 1 Zone A item with few solutions. Zone B was collapsed and hidden.

> "If the A zone has just one item and if that one item has just 2 to 3 solutions then the user should be told to pick some items from zone B also. On the previous screen the user should see their B zone items as well."

**Action taken:** Zone B defaults to open (not collapsed).
**Saved to memory:** No.

### 5. "depends on implementation" is meaningless
**Context:** Custom fixes showed "depends on implementation" in the Reclaim column on the Action Plan tab.

> "There is this copy on the right side that says 'reclaim depends on the implementation' I don't know what does it mean."

**Action taken:** Replaced with dynamic text showing actual waste hours targeted (e.g., "targets 23.8 hrs/wk of waste").
**Saved to memory:** No.

### 6. "See your impact" CTA alignment
**Context:** Noticed from screenshot — CTA appeared left-aligned.

**Action taken:** Verified it was already in `text-center` wrapper. No code change needed.
**Saved to memory:** No.

### 7. Quadrant labels overlapping chart edges
**Context:** User saw Pearls/Oysters/Low-Hanging Fruit/White Elephants labels clipping against chart borders.

> "The quadrant headings on the four corners are overlapping a bit with the quadrant sides. It has to be very neat."

**Action taken:** Increased inset: top-6 → top-10, left-10 → left-16, bottom-14 → bottom-16.
**Saved to memory:** No.

### 8. White Elephants emoji should be elephant, not skull
**Context:** User noticed 💀 emoji for White Elephants.

> "For the white elephants I need the elephant symbol wherever this term white elephants appear."

**Action taken:** Changed QUADRANT_META.thankless.emoji from 💀 to 🐘 everywhere.
**Saved to memory:** No — this is a specific data fix.

### 9. Dot colors should match quadrant, not zone
**Context:** All dots in the scatter chart were the same orange color regardless of quadrant.

> "All of the bubbles are of the same colour no matter which quadrant they are in. Each quadrant should have a different colour."

**Action taken:** Added QUADRANT_DOT_COLORS: Pearls = reclaim pink, Oysters = gold, Low-Hanging Fruit = warm neutral (#9a8c7a), White Elephants = waste orange. Updated dots, legend, and summary cards.
**Saved to memory:** No.

### 10. "Your Fixes" list misaligned
**Context:** User saw the 2-column grid with emoji floating awkwardly.

> "This is very misaligned. Look at it."

**Action taken:** Changed to single-column layout with properly aligned number + title + quadrant badge in each row.
**Saved to memory:** No.

### 11. Remove "Bigger dot = more time you reclaim"
**Context:** User wanted this legend text removed.

> "Remove this line."

**Action taken:** Removed.
**Saved to memory:** No.

### 12. Dot clicking broken — inline editor doesn't open
**Context:** User clicked dots on the scatter chart, saw tooltip but not the score editor.

> "When I click on a dot I do see the description but I am unable to adjust any scores."

**Action taken:** Root cause was Recharts ScatterChart onClick not firing reliably. Moved click handler directly to CustomDot's `<g>` SVG element with `e.stopPropagation()`.
**Saved to memory:** No.

### 13. Quadrant descriptions need methodology-accurate advice
**Context:** User gave specific methodology guidance for each quadrant's advice text.

> "For the oysters they should be planned only after the pearls have been done and if there is spare capacity. For the low hanging fruits you can choose one to do if I have multiple assuming that these can be done within the next few minutes or hours."

**Action taken:** Updated QUADRANT_META verbs:
- Oysters: "Plan these only after your Pearls are done, and only if you have spare capacity"
- Low-Hanging Fruit: "Pick one or two to knock out quickly — these take minutes, not days"
**Saved to memory:** No — encoded directly in QUADRANT_META.

### 14. White Elephants emoji in summary cards (same as #8)
**Context:** Confirmed 💀 appeared in QuadrantSummary cards too.

**Action taken:** Fixed via QUADRANT_META change (same fix as #8, propagates automatically).
**Saved to memory:** No.

### 15. Replace "Your Fixes" with prioritized action item table
**Context:** User wanted a sequenced priority list, not a flat fix list.

> "Once the matrix has been created, there should be an action item table that specifies the sequence of priority... first the pearls will be listed and if they are multiple pearls then the priority of each will be listed. There will be a due date."

**Action taken:** Created PriorityTable component: Pearls first (impact-ordered), then Oysters, Low-Hanging Fruit, White Elephants. Each row: priority #, task name, quadrant badge, owner, due date input. Added dueDates to Zustand store.
**Saved to memory:** No.

### 16. "Here's what each fix saves you" section needs rework
**Context:** User flagged this section alongside other payoff improvements.

> "Adjust this section based on my latest comments."

**Action taken:** Removed entirely — per-fix reclaim info is now in the priority table on the matrix tab, eliminating duplication.
**Saved to memory:** No.

### 17. Before/After section not centered
**Context:** User saw the before/after cards not properly centered.

> "Align this section in the center."

**Action taken:** Added `max-w-2xl mx-auto` to the container, changed to `flex-col sm:flex-row` for proper mobile stacking.
**Saved to memory:** No.

### 18. "Start with what matters most" CTA is confusing
**Context:** Bottom CTA took user back to Assign Fixes tab — backwards navigation.

> "There is this CTA called start with matters most. And it's taking me back to the start of the focus table. Don't understand the purpose of it."

**Action taken:** Replaced with closing statement: "You've got a plan. Now go reclaim your week." + "Come back anytime to update your plan." No navigation action — the action table IS the final output.
**Saved to memory:** No.

---

## Meta-Feedback (Process/Working Style)

### "Don't ask for permissions"
**Context:** Early in the session, user flagged too many permission prompts.

> "You're still asking for a lot of permissions."

**Action taken:** Broadened permission wildcards in settings.local.json. User stopped seeing prompts.
**Saved to memory:** Already in memory from prior sessions.

### "Don't start working yet, first answer me"
**Context:** User wanted to confirm understanding before any agents launched.

**Action taken:** Confirmed understanding, corrected the Low-Hanging Fruit definition error, then launched agents only after user said go.
**Saved to memory:** No — standard interaction.

### Handover ritual was missed in Session 7
**Context:** User discovered Session 7 had no session log or feedback log.

> "Update the handover ritual so you never miss to create session and feedback logs. You missed it for the last session and I found out only after closing it. It was all precious."

**Action taken:** Created custom `/handover` command mandating 3 artifacts. Saved to memory.
**Saved to memory:** Yes — `feedback_handover_ritual.md`
