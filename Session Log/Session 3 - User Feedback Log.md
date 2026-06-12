# Session 3 — User Feedback Log (Pareto Analyzer)
**Date:** 2026-06-12
**Status:** Logged, fixes in progress

---

## Landing Page

### FB-01: No scroll affordance on hero
- **Screenshot:** #1
- **Issue:** User lands on the hero and thinks that's the entire page. No visual cue to scroll down.
- **Fix:** Add a scroll indicator or ensure content peeks above the fold.

### FB-02: Hero copy is broken English + bad design
- **Screenshot:** #2
- **Issue:** "FocusLab finds the vital few drains eating most of your time — then gives you research-backed fixes to reclaim your week." is broken English. "Reclaim your week" is unclear.
- **Fix:** Rewrite all copy to be clear, natural English. This applies app-wide — not just the hero. Fix copy everywhere it repeats or has the same problems.

### FB-03: Want illustrative calendar visual on hero
- **Screenshot:** #2
- **Issue:** User wants an illustrative visual depicting a full work week calendar where waste blocks are visually shown — making the concept immediately tangible.
- **Fix:** Create an SVG/CSS calendar week visualization showing waste vs. real work.

### FB-04: Remove "Your role. Your waste." section from landing page
- **Screenshot:** #3
- **Issue:** The role cards section on the landing page is unnecessary.
- **Fix:** Remove the entire RoleLenses component from the landing page.

### FB-05: Fix Final CTA section copy
- **Screenshot:** #4
- **Issues (4 sub-items):**
  1. "Every week you wait costs you $500+" — "wait for what?" Remove this headline entirely.
  2. Remove "Let that sink in." line.
  3. Keep the mind-blown emoji with the "6 full work weeks per year" sentence instead.
  4. Remove "No data leaves your browser." subcopy.
- **Fix:** Rewrite the FinalCTA component with cleaner, non-manipulative copy.

---

## Step 1: Role Selection

### FB-06: Role icons are boring
- **Screenshot:** #6
- **Issue:** Current emoji icons for roles look generic and boring. User wants illustrative, modern icons.
- **Fix:** Replace role emoji with more expressive, illustrative emoji or icons.

### FB-07: "I also spend time on" is easily missable + needs role+level in one view
- **Screenshot:** #6
- **Issue:** The secondary roles section is hidden behind a disclosure. User wants to pick role AND level (e.g., "Sales Manager" vs "Sales Rep") in a single view — not a hidden secondary section.
- **Fix:** Redesign RoleStep so each role has sub-levels (IC/Manager/Executive) visible in one screen. Remove the hidden "I also spend time on" pattern.

---

## Step 2: Context

### FB-08: Hours input — redundant controls + no manual typing
- **Screenshot:** #7
- **Issue:** There are two ways to increase/decrease hours (spinner arrows AND +/- buttons). User wants: (1) manual text input where they can type exact hours, and (2) one set of +/- controls. Remove the spinner arrows.
- **Fix:** Make hours input a plain text field with +/- buttons only. Remove native number spinner.

### FB-09: "Your pay" labels should be "Fixed" and "Hourly"
- **Screenshot:** #7
- **Issue:** Toggle says "Salary" and "Hourly". User wants "Fixed" and "Hourly".
- **Fix:** Change the label from "Salary" to "Fixed".

---

## Step 3: Intake

### FB-10: "Add your own" should be per-section, not isolated at top
- **Screenshot:** #8
- **Issue:** The custom source input is at the top of the page, isolated. User wants each pain prompt section to have its own "add your own" option at the bottom of that section.
- **Fix:** Move the "add your own" input into each expanded pain prompt section. Remove from top.

### FB-11: Waste source names contain solutions — fix language
- **Screenshot:** #8
- **Issue:** "Status meetings that could've been a message" bakes a solution into the waste source name. Waste sources should describe the problem, not prescribe a fix.
- **Fix:** Audit ALL waste source names in src/lib/data/waste-sources.ts and rewrite any that contain solutions. E.g., "Status meetings that could've been a message" → "Recurring status meetings". Apply this standard across the entire app.

### FB-12: Duplicate/redundant pain prompt — remove "Still doing the team's work yourself?"
- **Screenshot:** #9
- **Issue:** The manager role has "Still doing the team's work yourself?" as a standalone pain prompt, but the source "Doing the team's work yourself" already appears under "Too much coordination, not enough real work?" — it's redundant.
- **Fix:** Remove the "Still doing the team's work yourself?" pain prompt from ROLE_PAIN_PROMPTS for manager.

---

## Step 4: Weigh

### (No direct Weigh step feedback yet — but see FB-10/FB-12 re: validation)

---

## Step 5: Results

### FB-13: 250% waste is nonsensical — cap the percentage
- **Screenshot:** #10
- **Issue:** The results page shows "250% of your work week" — impossible. Even 100% doesn't make sense. If waste exceeds work hours, something is wrong with the input.
- **Fix:** Cap the displayed percentage at a sensible maximum (e.g., 95-100%). If total waste exceeds work hours, show a warning/correction flow instead of displaying an absurd number.

### FB-14: Pareto chart bar labels are cut off
- **Screenshot:** #11
- **Issue:** X-axis labels on the Pareto chart are truncated with "..." — user can't read what each bar represents.
- **Fix:** Show full labels — either rotate them, wrap them, or use a horizontal bar chart. Labels must be fully readable.

### FB-15: Over-allocation warning must appear BEFORE chart generation
- **Screenshot:** #12
- **Issue:** The "Allocated waste exceeds work week" warning appears on the results page AFTER the chart is generated. It should appear in the Weigh step and block progression until the user corrects their inputs.
- **Fix:** Move the validation to WeighStep. If total allocated waste > work hours, show a prominent warning and prevent the user from continuing until they adjust.

### FB-16: Yellow warning text doesn't stand out on beige background
- **Screenshot:** #12
- **Issue:** The gold/yellow warning text and border blend into the warm cream background. Not visible enough.
- **Fix:** Use waste orange or a high-contrast color for warnings instead of gold.

---

## Meta / App-Wide

### FB-MW-01: Copy quality standard
- All copy throughout the app must be natural, clear English — not marketing jargon or broken phrasing. If a sentence sounds awkward when read aloud, rewrite it. This applies everywhere, not just where specifically called out.

### FB-MW-02: No solutions in waste source names
- Waste sources describe problems. Solutions describe fixes. Never mix them. Audit all 52 waste sources.
