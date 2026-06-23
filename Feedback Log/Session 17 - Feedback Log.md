# Session 17 — Feedback Log (2026-06-23)

Sources this session: a developer friend's review, Mona's design decisions, and **Oren's 54-min meeting on 23 June** (the big one).

---

## A. Dev-friend feedback → BUILT & SHIPPED (commit `bad029e` / `8b188ae`)
| # | Feedback | Outcome |
|---|----------|---------|
| 1 | Effort red "looks like a mistake" | ✅ Effort dots now gold |
| 2 | Same emoji on different categories (confusing) | ✅ Unique emoji per group |
| 3 | "Better UI when selecting options" | ✅ Unified pink selection token |
| 4 | Subcategories take too much space | ✅ Collapsible Drilldown accordion |
| 5 | Add Google Analytics | ⏸️ Deferred until a real domain is connected |
| 6 | Hosting checklist (SSD/SSL/uptime/backup) | ℹ️ All covered by Vercel — no action |

## B. Mona's design decisions this session
- Effort dots = **gold** (saw mockup first).
- Emojis = the unique set (saw Drilldown before/after mockup).
- Dots **start blank** (unrated), user fills them — approved after seeing the blank-vs-prefilled mockup; later refined to **clean hollow rings** (Option B).
- Payoff: **lead the Matrix tab with the number** + **"what you'd do with it" spotlight** + **reclaim strip on Action Plan** (her A+C combo; hooks dropped).
- Process: wants an **HTML mockup approved BEFORE any real-code change** on design work. Deploy without asking.

## C. Oren's 23 June feedback (drives the next-version redesign)
Full transcript: `test-results/Oren's feedback 23 June.md`. Plan + mockup: `Feedback Log/2026-06-24-oren-redesign-*.html`.

**Core verdict:** the tool *"makes me work"* → it doesn't sell yet. Make it deliver "free up 10 hours in 3 minutes" — fast, plain, effortless. *"Until you sell me the tool, everything else is a waste."*

### Tool / UX
1. Don't limit to "knowledge workers" — remove the qualifier (discuss scope).
2. Plain English + **hover/tap explainers with a real example** on every term/fix ("Admin busy work", "No agenda no meeting").
3. **Don't make people go back** — fix the over-estimate mismatch in place.
4. **Score on the same page** — stop adding screens, use the empty space, add a **Back button**, don't make him remember choices.
5. **Suggest due dates & owners** (pick-from defaults) — don't make the user invent them.
6. **De-table** the Action Plan — "too tabular, something is lost."
7. **EVI matrix dots overlap** — "not selling," "you lose the audience."
8. **Blank fields confused him** — "irrelevant blank" until told it fills.
9. **Selected state goes dark** — should read as chosen, not disabled.
10. **Let users add their own top-level category** (not just a sub-item).
11. Kill the **Google-Form** feel.
12. **White Elephant says "drop or delegate" — remove "delegate"** (Drop/Eliminate).
13. **CEO salary default makes no sense** — fix benchmark.
14. **BUG: over-cap lets you proceed** — logging 46 hrs on a 45-hr week must BLOCK, not just warn ("I had fixed this").
15. **The four waste types are unexplained** — "what is five-time/four-time brains?"
16. **Reclaim math not transparent** — "how did you get this two hours?"
17. Vague: "shouldn't have rendered a graph with three reasons" — **needs clarification from Oren**.

### Landing / value prop
18. Value prop **still too long** (even 3 lines). Don't dramatize "no boss support" as copy.
19. Hero he sketched: **"Free up 10 hours" (3–4 words) + "in the next 3 minutes."**
20. Differentiator: **no clocks, no tracking, your knowledge, proven methodology (thousands, 15–20 yrs).**
21. **Think marketing, not methodology** — aspirational (beach / Stranger Things / "boss doesn't care as long as results come").
22. Remove the **stray smiley** background effect.
23. **"134 research-backed fixes" section** — disliked, broken link; reframe or remove.
24. **Emojis render badly in Chrome** ("snot") — cross-browser audit.

### Methodology — DO NOT change unilaterally (Section C of the plan)
25. **Hours vs %** — he questioned it; wants 2 options on his methodology. (Mockup Scene 9.)
26. **Merge the two intake steps into one**, focus A-level — confirm exact flow.

### Process (working style)
27. **Finish the product before marketing** — pause the marketing plan.
28. **Don't drift to "waste" when stuck** (Reddit, planning).
29. **Don't change methodology unilaterally** — discuss or bring 2 options.
30. **Nothing should appear he didn't ask for** (the rogue "delegate"). Higher bar — he's showing investors.
31. "What did you do in this time?" — he wants **impact, not an activity list.**

**Status:** all product points are in the plan and/or mocked, except #17 (flagged for Oren) and the two non-visual items (#13 CEO salary, #24 emoji). NOTHING from this redesign is built yet — awaiting Mona's review.
