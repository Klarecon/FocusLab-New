@AGENTS.md


# FocusLab — Claude Code Instructions

# FocusLab — Claude Code Instructions

> Read this file completely before writing a single line of code.
> These are not suggestions. They are the rules of this project.

---

## 1. Session Start Ritual (MANDATORY)

Every session, before anything else, run these in order:

```bash
# 1. Read project state
cat .claude/PROJECT_STATE.md

# 2. Read latest session log (check Session Log/ folder for newest file)
ls "Session Log/" | sort | tail -1

# 3. Verify test baseline
npx vitest --run 2>&1 | tail -5

# 4. Verify build baseline
npx tsc --noEmit 2>&1 | tail -5
```

Do NOT respond to any request until you have done this. If PROJECT_STATE.md does not exist, say so immediately — do not proceed on assumptions.

---

## 2. Project Overview

**FocusLab** is a productivity tool suite that helps users find and fix waste in their work.

- **Local path:** `/Users/monamehta/Documents/FocusLab New/`
- **GitHub:** https://github.com/mona2611-alt/FocusLab-New
- **Live:** https://focuslab-omega.vercel.app
- **Framework:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **State:** Zustand with localStorage persistence
- **Charts:** Recharts
- **UI:** shadcn/ui components
- **Tests:** Vitest (182 tests as of Session 2 — must never regress)
- **Deploy:** Vercel

### The Two Tools (They Are Separate — Not a Flow)

| Tool | Route | Purpose |
|------|-------|---------|
| Pareto Analyzer | `/analyzer` | 5-step wizard that finds the user's top waste sources |
| Focus Table | `/focus` | 3-tab tool (Assign Fixes / Action Plan / Impact Matrix + Payoff) that fixes waste |

**Critical:** These are independent routes. Do NOT merge them into a single flow or treat them as step 1 → step 2.

---

## 3. Key Files Reference

```
src/
├── app/globals.css                        ← Palette and CSS variables (source of truth)
├── components/analyzer/                   ← Wizard: RoleStep, ContextStep, IntakeStep, WeighStep, ResultsView
├── components/focus/                      ← FocusTable, SolutionPicker, EviMatrix, Payoff
├── lib/engine/pareto.ts                   ← Core Pareto engine (do not break)
├── lib/engine/solutions-logic.ts          ← SCORE_FROM_LEVEL mapping
├── stores/audit-store.ts                  ← Zustand store (ParetoResult lives here)
.claude/
└── PROJECT_STATE.md                       ← Current project state (read every session)
Session Log/                               ← Session history (read the latest one)
~/.claude/projects/-Users-monamehta-Documents-FocusLab/memory/   ← Memory files
```

---

## 4. Color Palette (Non-Negotiable)

```css
/* APPROVED PALETTE — use only these */
--waste-orange:   #e03e12    /* rgba(224, 62, 18)  */
--reclaim-pink:   #c4186a    /* ALL positive, success, CTA, quick-win states */
--gold:           #edb215    /* rgba(237, 178, 21) */
--warm-cream:     background color
```

### Banned Colors (will cause test failures — grep is watching)

```
rgba(29,107,88)    ← rogue green — BANNED
#df3c18            ← old waste color — BANNED
#b9852b            ← old gold — BANNED
rgba(185,133,43)   ← old gold rgba — BANNED
#5c544a            ← old neutral — BANNED
```

**Rule:** Green is NEVER used for success, positive states, selected states, or CTA buttons. Reclaim pink (#c4186a) is always used instead. If you find green anywhere, replace it.

---

## 5. Typography

```
Display / Headers:   Fraunces (serif)        ← All wizard step headers, section headers
Body:                Plus Jakarta Sans        ← All body text, labels, UI copy
```

**Banned font:** Hanken Grotesk — do not use, do not suggest. It looks "typical Claude" and was explicitly rejected.

### Header Size Conventions
- Wizard step headers: `text-3xl sm:text-4xl font-bold` + Fraunces
- Focus stage header: `text-4xl sm:text-5xl`
- SolutionPicker "Your Vital Few": `text-3xl sm:text-4xl`

---

## 6. Data & State Architecture

### State Management Rules
- `ParetoResult` from the engine is stored **directly in Zustand** — no adapter layer
- Zustand store has localStorage persistence — state survives page refresh
- **BANNED:** `window.__paretoFullResult` or any `window.*` global for passing state
- **BANNED:** Local `useState` for anything that needs to survive a tab switch or page refresh

### SCORE_FROM_LEVEL Mapping (Critical)
```typescript
// CORRECT (from solutions-logic.ts)
low  = 2
med  = 3
high = 4

// WRONG (old mapping — caused quick-win detection to never fire)
low  = 1
med  = 2
high = 3
```
Quick-win detection requires impact >= 4. Always use the solutions-logic.ts mapping.

### Data Layer
- All benchmarks, waste sources, and solutions are **static TypeScript** — no database
- No Supabase. No API calls for data. No external data dependencies for v1.

---

## 7. Emoji Style

```
✅ Use:   😴 🫠 🤦 😤 💀 🤯 😬 🥲 — emotional, human, expressive
❌ Never: 📊 📋 ✅ 📈 🚀 💡 — corporate, generic, "AI assistant" energy
```

---

## 8. Execution Style (How You Must Work)

### Autonomous by Default
- Do NOT ask for permission mid-task ("Should I proceed?", "Is it okay if I...?")
- Do NOT ask clarifying questions when the task is clear
- Execute the plan, then report what was done
- If genuinely blocked by ambiguity, state it clearly and ask ONE specific question

### When Given a Plan
- Execute every item in the plan — do not silently skip steps
- If a step proves impossible or contradicts something, say so explicitly — do not quietly move on
- Complete 100% of the plan before declaring done

### Visual Changes
- Make **dramatic changes**, not incremental CSS tweaks
- If asked to improve visual quality, treat it as a full redesign of that section
- "Bold, vibrant, warm" is the quality bar — reference the palette and typography rules above
- Do not produce "typical AI tool" aesthetics

### Agent Specialization
- When executing multi-phase work, operate as specialized agents:
  - **Engineer Agent** — code, logic, architecture
  - **UI/UX Agent** — visual design, layout, component styling
  - **Copywriter Agent** — landing page, labels, error states, UI copy
  - **QA Agent** — testing, verification, bug catching
- Label which agent is running for each phase

### Output Format
- Multi-step plans go in **HTML format** (not markdown) for readability
- Session summaries go in HTML or a new session log file

---

## 9. TDD Rules (Test-Driven Development)

This project uses TDD. These rules are enforced:

### Rule 1: Write Tests Before Marking Done
Never say a feature or fix is "done" without running the test suite.

### Rule 2: Never Regress
The test count is a ratchet — it only goes up. 237 tests as of Session 9 (182 original + 55 feedback regression).
```bash
npx vitest --run
```
All tests must pass before any commit or "done" declaration.

### Rule 3: New Features Get New Tests
Every new feature or significant fix gets a test. Add to the appropriate test file:
- Logic/engine changes → `phase-a-checks.test.ts`
- Visual/style changes → `phase-b-visual.test.tsx`  
- Store changes → `audit-store.test.ts`
- Component behavior → `focus-components.test.tsx`
- Full flow → `phase-d-e2e.test.tsx`

### Rule 4: Visual Tests Use Grep
Visual regression is caught by grep-based tests that scan for banned colors and required classes. After any visual change, run `phase-b-visual.test.tsx` specifically.

---

## 10. Definition of Done

A task is NOT done until ALL of these pass:

```bash
# 1. Zero TypeScript errors
npx tsc --noEmit
# Expected: no output

# 2. All tests pass
npx vitest --run
# Expected: X passed (X >= 182, 0 failed)

# 3. Clean production build
npx next build
# Expected: ✓ Compiled successfully

# 4. Zero banned colors (run this grep)
grep -r "29,107,88\|df3c18\|b9852b\|185,133,43\|5c544a" src/
# Expected: no output

# 5. Zero window hacks
grep -r "window\.__" src/
# Expected: no output
```

Report the output of each check when declaring done.

---

## 11. Banned Patterns (Recurring Mistakes to Never Repeat)

| Pattern | Why it's banned | What to do instead |
|---------|----------------|-------------------|
| `window.__paretoFullResult` | Fragile, doesn't survive refresh | Store in Zustand |
| Local `useState` for cross-tab state | Lost on tab switch | Store in Zustand |
| Old SCORE_FROM_LEVEL (1/2/3) | Breaks quick-win detection | Use solutions-logic.ts (2/3/4) |
| Green for success states | Wrong visual identity | Use reclaim pink #c4186a |
| Old palette color values | Causes test failures | Use approved palette only |
| Hanken Grotesk | Looks generic | Plus Jakarta Sans for body |
| Corporate emoji | Wrong brand voice | Emotional emoji only |
| AnimatePresence wrapping `<tbody>` | Invalid HTML | Put AnimatePresence inside tbody |
| Asking permission mid-task | Slows execution | Execute, then report |
| Marking done without running tests | Hides broken code | Always run full suite first |
| Silently skipping plan steps | Creates review debt | Complete every step or flag it |

---

## 12. QA Gate (Three-Layer Verification)

Work is verified in three layers. None can be skipped.

### Layer 1: Automated Gate (Hook)

A pre-commit hook runs `.claude/hooks/verify-done.sh` before every `git commit`. If any check fails, the commit is **hard-blocked** (exit code 2). The checks:

| # | Check | What it catches |
|---|-------|----------------|
| 1 | `tsc --noEmit` | Type errors |
| 2 | `vitest --run` | Test failures / regressions |
| 3 | Banned color grep | Rogue green, old palette values |
| 4 | `window.__` grep | Global state hacks |
| 5 | Hanken Grotesk grep | Wrong font |
| 6 | Corporate emoji grep | 📊📋✅📈🚀💡 in components |
| 7 | Green success states | `text-green-`, `bg-green-`, rgba green |
| 8 | SCORE_FROM_LEVEL | Mapping regression (must be 2/3/4) |

**To add a new check:** Edit `.claude/hooks/verify-done.sh` and add a new block. Every repeated miss should become a permanent automated check.

```bash
bash .claude/hooks/verify-done.sh
```

### Layer 2: Feedback Regression Tests (Cumulative)

**File:** `src/__tests__/feedback-regression.test.ts`

This is a cumulative test file where every concrete feedback item from every session becomes a permanent assertion. It catches regressions on things the user has already paid for — copy text, data completeness, state shape, color rules, quadrant metadata, functional behavior.

**Rule: every code-verifiable feedback item gets a test here.** When the user gives feedback and you fix it, add a test in this format:

```typescript
it("[S9-#3] description of what must be true", () => {
  // S9 = Session 9, #3 = feedback item 3
  expect(fileContains("path/to/file.tsx", "exact string")).toBe(true);
});
```

**What goes here vs. what doesn't:**
- Copy text ("change CTA to X") → YES, assert exact string
- Data coverage ("CEO role has no solutions") → YES, assert slug exists
- State fields ("add dueDates to store") → YES, assert field name
- CSS values ("dots should be pink for Pearls") → YES, assert hex value
- Visual layout ("this looks misaligned") → NO, flag as VISUAL in Layer 3

**The test count is a ratchet — it only goes up.** Current: 237 tests (182 original + 55 feedback regression).

### Layer 3: QA Agent Gate (Evidence-Based)

After completing work and before declaring "done", spawn a **separate QA agent**. The key change from the old system: **every checklist item must specify its verification method**.

**Feedback Intake Format — use this BEFORE starting work:**

When user gives feedback, convert each item into this format before writing any code:

```
## Feedback Intake: Session N

| # | Feedback | Type | Assertion | File |
|---|----------|------|-----------|------|
| 1 | "Change CTA to X" | CODE | grep for "X" in File.tsx | File.tsx |
| 2 | "This is misaligned" | VISUAL | VISUAL — human eye needed | File.tsx |
| 3 | "Add field to store" | CODE | grep for fieldName in store | audit-store.ts |
```

- **CODE** items get verified by grep/read. QA agent must provide the grep output.
- **VISUAL** items get flagged as "VISUAL — code change verified, needs human eye on deployed app." QA agent does NOT say PASS on visual items — it says VISUAL-CHECK.

**Pattern — copy this when spawning the QA agent:**

```
Agent({
  subagent_type: "Reality Checker",
  prompt: "You are the QA gate for FocusLab. Verify each item below by reading actual source files.

  RULES:
  1. For CODE items: run the grep/read specified. Show the matching line. PASS only if the exact assertion matches.
  2. For VISUAL items: verify the code change was made, then mark as VISUAL-CHECK (not PASS). These need human eyes on the deployed app.
  3. Never say PASS without showing the evidence (file:line + matching text).
  4. After checking individual items, run: npx vitest --run src/__tests__/feedback-regression.test.ts
     If any feedback regression test fails, the gate FAILS regardless of individual items.

  CHECKLIST:
  | # | Feedback | Type | Assertion | File |
  |---|----------|------|-----------|------|
  | 1 | ... | CODE | grep for '...' | ... |
  | 2 | ... | VISUAL | code change at file:line | ... |

  Report format per item:
  - PASS (with evidence: file:line + matching text)
  - FAIL (what's wrong, where)
  - VISUAL-CHECK (code verified at file:line, needs human eye)

  Final verdict: GATE PASSED, GATE FAILED (N items), or GATE PASSED WITH N VISUAL-CHECKS."
})
```

**Rules:**
1. The main session does the work. The QA agent only verifies — it never fixes.
2. If the QA agent reports failures, the main session fixes them and spawns a **new** QA agent (don't reuse — fresh eyes every time).
3. Never declare "done" until all three layers pass.
4. After QA passes, tell the user how many VISUAL-CHECK items need their eyes on the deployed app. List them.
5. **After the user confirms visual items are good**, promote each confirmed code-verifiable fix into `feedback-regression.test.ts` so it can never regress.

---

## 13. Pending Features (Not Started)

These are committed but not yet built. Do not accidentally start them unless explicitly asked:

- Calendar week visualization
- Before/after comparison
- Lottie animations
- Shareable scorecard card
- Landing page copy overhaul (flagged as generic in Session 1)

---

## 14. Session End Ritual

At the end of every session, before stopping:

1. Run the full Definition of Done checklist (Section 10)
2. Update `.claude/PROJECT_STATE.md` with current state
3. Create a new session log in `Session Log/` following the format of Sessions 1 and 2
4. Include a **Resume Prompt** at the bottom of the session log so the next session can pick up cleanly
5. Commit and push to GitHub

---

## 15. Quick Reference Card

```
Project:     FocusLab
Stack:       Next.js 16 / React 19 / TypeScript / Tailwind 4 / Zustand / Recharts / Vitest
Routes:      /analyzer (find waste)   /focus (fix waste)   — SEPARATE, NOT a flow
Tests:       237 passing (never regress) — 182 original + 55 feedback regression
Font:        Fraunces (headers) + Plus Jakarta Sans (body)   NO Hanken Grotesk
Pink:        #c4186a — all CTA, success, selected states
Orange:      #e03e12 — waste
Gold:        #edb215
Green:       BANNED
State:       Zustand only — no window globals
Score:       low=2 med=3 high=4 (from solutions-logic.ts)
Emojis:      😴🫠🤦😤💀🤯 (human) NOT 📊📋 (corporate)
Execution:   Autonomous — no permission-asking, no partial fixes, always run tests
```