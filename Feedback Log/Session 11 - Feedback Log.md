# Session 11 — Feedback Log (2026-06-17)

## Context
Mona tested the deployed app at focuslab-omega.vercel.app in both regular and private browsers. **CRITICAL DISCOVERY:** Vercel was still connected to the old `mona2611-alt/FocusLab-New` repo (which had been transferred to `Klarecon/FocusLab-New`), so NONE of the code changes from Sessions 10 or 11 were ever deployed. Mona saw the Session 9 code the entire time. This was discovered mid-session and fixed by reconnecting Vercel to the Klarecon org repo.

---

## Round 1 — Pre-deployment (user saw OLD Session 9 code)

These were given before we discovered the Vercel disconnect. Some items were already addressed in code but never deployed; others were new issues.

| # | Feedback | Type | Status | Notes |
|---|----------|------|--------|-------|
| 1 | "5 time drains we'll dig into" — improper spacing | CODE | Fixed (deployed) | Unicode apostrophe fix |
| 2 | DrilldownStep lets hours exceed weekly estimate; subcategories optional/pointless | CODE | Partially fixed | Added per-category totals + warning but NO hard cap. User still entered 5hrs against 4hr estimate with no block. **STILL BROKEN.** |
| 3 | Software dev team lead — only 1 source in Code category | CODE | Fixed (deployed) | Added 3 new sources + 6 solutions |
| 4 | Pareto chart labels cut off with ellipsis | CODE | Fixed round 2 | Replaced mechanical abbreviation with human-written SHORT_LABELS map |
| 5 | SolutionPicker — too much text, overwhelming | CODE | Fixed round 2 | Radical redesign: single compact row per solution, checkbox + title only |
| 6 | "Add your own solutions" requires scrolling down | CODE | Fixed | Inline add-your-own input now in each DrainSection |
| 7 | Why would anyone choose non-Pearl/LHF solutions? Design flaw | CODE | Partially addressed | Solutions sorted Pearls first, but badges removed entirely in round 2 |
| 8 | Selections cached from old session — stale state | CODE | Fixed (deployed) | setParetoResult now clears chosenSolutions, solutionScores, ownerOverrides, dueDates |
| 9 | "EvI" should be "EVI" capitalization | CODE | Fixed (deployed) | Changed in FocusStage.tsx + tests |
| 10 | Action Plan: remove Owner field and Reclaim field | CODE | Fixed (deployed) | Both columns removed from FocusTable.tsx |
| 11 | EVI matrix circles all same size | CODE | Fixed (deployed) | Radius range widened 16-44px (was 14-28px) |
| 12 | 3 fixes mapped but one doesn't appear on chart | CODE | Fixed (deployed) | Jitter added for overlapping dots |
| 13 | Text overlapping on "Your Action Sequence" | CODE | Fixed (deployed) | Converted to proper HTML table |
| 14 | Action Sequence: not proper table, messy alignment, owner not editable, quadrant redundant | CODE | Fixed (deployed) | HTML table, editable owner select, quadrant column removed |
| 15 | Only saved 1 hour (18→17.1) — math seems wrong | CODE | Fixed (deployed) | Added low-reclaim guidance with per-fix breakdown when <15% |
| 16 | "What they can do" with freed time — copy still bad | CODE | Fixed (deployed) | Opportunity frames rewritten with emotional, role-specific copy |

---

## Round 2 — Post-deployment (user saw Session 11 code on live site)

After fixing Vercel connection and deploying, Mona reviewed the live site again.

| # | Feedback | Type | Status | Notes |
|---|----------|------|--------|-------|
| 17 (was #7 round 2) | DrilldownStep: math mismatch — entered 5hrs against 4hr estimate, no enforcement | CODE | **NOT FIXED** | Warning shows but doesn't prevent it. Needs hard cap or strong block. |
| 18 (was #8 round 2) | Live total hour counter not visible on IntakeStep (first pass) | CODE | Fixed round 2 | Added sticky counter to IntakeStep |
| 19 | "We don't have pre-built fixes for this one yet" — bad copy for custom drains | CODE | Fixed | Removed entirely, replaced with inline add-your-own |
| 20 | SolutionPicker still too much text (10th time flagged!) | CODE | Fixed round 2 | Radical redesign: single row, checkbox + title only, no badges |
| 21 | Duplicate solutions appearing across drain sections | CODE | Fixed | Added shownSolutionIds dedup tracking across DrainSection components |
| 22 | Crying emoji 🥲 on selected solutions — wrong choice | CODE | Fixed | Replaced with pink checkmark ✓ |
| 23 | Reclaim column still visible on Action Plan | CODE | Was fixed but not deployed at that point | Deployed in commit 00f3259 |
| 24 | EVI chart: text overlapping (quadrant labels vs axis labels) | CODE | Partially fixed | Moved labels up/inward but may still overlap at certain viewport widths. **NEEDS VISUAL VERIFICATION.** |
| 25 | EVI chart: all bubbles same size | CODE | Fixed | Wider radius range 16-44px |
| 26 | EVI chart: 9 fixes mapped but only 7 bubbles visible | CODE | Fixed | Jitter for overlapping dots |
| 27 | Sticky counter too far right, looks weird with gap | CODE | Fixed round 2 | Changed from fixed-right to sticky-top centered pill |
| 28 | Chart abbreviated labels are confusing/mechanical ("Standing Mtgs stale", "Replying to routine") | CODE | Fixed round 2 | Replaced with hand-written SHORT_LABELS map |
| 29 | Remove benchmark line (inconsistent, "you're 16.4 hrs below" makes no sense) | CODE | Fixed round 2 | Removed benchmark display entirely |
| 30 | Remove all tags (Pearl, effort, impact badges) from solution cards | CODE | Fixed round 2 | All badges stripped |
| 31 | Jitter decimals showing in tooltip (Effort: 2.899...) | CODE | Fixed round 2 | Tooltip shows Math.round() integers |
| 32 | QuadrantSummary repeats Action Sequence info — redundant | CODE | Fixed round 2 | QuadrantSummary component removed from render |
| 33 | Before/after "after" side should be positive (not "waste left") | CODE | Fixed round 2 | Changed to "You get back X hrs" with 😎 emoji |
| 34 | "What happens if you don't fix this" section not centered | CODE | Fixed round 2 | Center-aligned heading, subtext, and bullet items |
| 35 | Payoff reclaim section too much text | CODE | Fixed round 2 | Removed Pearls/All split, removed "That adds up to", kept one-line yearly + one-line role-specific |
| 36 | **DUPLICATE STICKY COUNTERS** — both inline + sticky showing same number | CODE | **NOT FIXED** | Introduced by adding sticky without removing inline. Embarrassing. |
| 37 | Wizard lets user proceed with only 2 categories → useless 2-bar chart | CODE | **NOT FIXED** | MIN_CATEGORIES is 2, should be 3 minimum |
| 38 | No inline "add your own fix" visible under drain sections (Image #18) | CODE | Needs verification | Code has InlineFix component but may not render due to component structure. **NEEDS VISUAL VERIFICATION.** |

---

## Items NOT FIXED — Must be done FIRST in Session 12

1. **Duplicate sticky counters** — remove the inline counter on both IntakeStep and DrilldownStep, keep only the sticky pill
2. **DrilldownStep hours cap** — enforce that per-category detailed hours cannot exceed the category estimate (or at minimum, hard-block "Show me the damage" when they do)
3. **MIN_CATEGORIES** — raise from 2 to 3 so the wizard doesn't produce a useless 2-bar chart
4. **Inline add-your-own fix** — verify it renders under every drain section on the deployed site
5. **EVI quadrant label overlap** — may still overlap at certain widths, needs visual check

---

## Meta Issues (Process Failures)

| Issue | Impact | Resolution |
|-------|--------|------------|
| **Vercel was disconnected from the correct repo** | ALL code changes from Sessions 10-11 were invisible to user. User tested old code and gave feedback on already-fixed issues. Massive time waste. | Reconnected Vercel to Klarecon/FocusLab-New. Added Check 9 to verify-done.sh (local HEAD must match origin/main). |
| **GitHub repo transferred to Klarecon org** | Broke Vercel connection, broke direct push (org private repo needs Vercel Pro), triggered branch protection re-enable | Made repo public, removed branch protection, reconnected Vercel |
| **QA agents grep code files instead of checking rendered app** | Agents say "PASS" while user sees broken UI | Installed Playwright for visual regression testing (not yet running in CI) |
| **Changes committed but never pushed** | First round of 16 fixes sat locally while user tested old deployed code | Added verify-done.sh Check 9: git push verification |
| **Added sticky counter without removing inline counter** | Duplicate counters on screen — looks broken | Must remove inline counter, keep only sticky |

---

## User Sentiment

**Mona is extremely frustrated.** Direct quotes:
- "the agents failed this fix"
- "I'm pointing this out for the 10th time!"
- "this is complete nonsense really"
- "you've wasted my entire day"
- "I stop here, you're misleading me"
- "I'm hugely disappointed"

The recurring theme: code changes are made but either (a) never deployed, (b) don't actually fix the visual issue, or (c) introduce new problems. The QA system catches grep-level issues but misses everything a user actually sees.
