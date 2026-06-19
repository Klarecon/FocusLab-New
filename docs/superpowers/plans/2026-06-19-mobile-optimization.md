# Mobile Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make FocusLab fully usable on 375px+ mobile viewports without changing the desktop experience.

**Architecture:** All changes are additive Tailwind responsive classes and a single `useIsMobile` hook for chart components. Desktop rendering is untouched — mobile styles only activate below the `sm:` breakpoint (640px). Three phases: Global+Landing, Analyzer, Focus.

**Tech Stack:** Tailwind CSS 4, Next.js 16, React 19, Recharts, Framer Motion

---

### Task 1: Create `useIsMobile` Hook

**Files:**
- Create: `src/hooks/useIsMobile.ts`
- Test: `src/__tests__/useIsMobile.test.ts`

This hook is needed by chart components (ResultsView, EviMatrix) to conditionally set chart heights and margins.

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useIsMobile.ts
"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 640; // matches Tailwind sm:

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = () => setIsMobile(mql.matches);
    handler(); // set initial value
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
```

- [ ] **Step 2: Write the test**

```typescript
// src/__tests__/useIsMobile.test.ts
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("useIsMobile hook", () => {
  it("exists and exports useIsMobile", () => {
    const content = fs.readFileSync(
      path.resolve("src/hooks/useIsMobile.ts"),
      "utf-8"
    );
    expect(content).toContain("export function useIsMobile");
    expect(content).toContain("matchMedia");
    expect(content).toContain("640");
  });
});
```

- [ ] **Step 3: Run test**

Run: `npx vitest --run src/__tests__/useIsMobile.test.ts`
Expected: PASS

- [ ] **Step 4: Run full suite to verify no regressions**

Run: `npx vitest --run`
Expected: 280 tests passing (279 + 1 new)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useIsMobile.ts src/__tests__/useIsMobile.test.ts
git commit -m "feat: add useIsMobile hook for responsive chart rendering"
```

---

### Task 2: Global CSS Mobile Overrides

**Files:**
- Modify: `src/app/globals.css:109-156` (body font-size, heading sizes)

Add mobile media query at the end of globals.css, before the reduced-motion query. This scales base font sizes for mobile.

- [ ] **Step 1: Add mobile media query to globals.css**

Add this block BEFORE the `@media (prefers-reduced-motion: reduce)` block (before line 231):

```css
/* ---- Mobile overrides ---- */
@media (max-width: 639px) {
  body {
    font-size: 16px;
  }

  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.1rem; }
}
```

Also add `overflow-x: hidden` to the `html` rule (line 105-107) to prevent horizontal scroll on mobile:

```css
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add mobile CSS overrides — smaller font sizes, no horizontal scroll"
```

---

### Task 3: Stepper — Mini Dots on Mobile (Option C)

**Files:**
- Modify: `src/components/analyzer/Stepper.tsx`

Replace the single stepper with a responsive layout: mini dots on mobile (`< sm:`), full circles on desktop (`sm:` and up). Both render in the same component, toggled by CSS classes.

- [ ] **Step 1: Rewrite Stepper.tsx with dual layouts**

```tsx
"use client";

import { motion } from "framer-motion";

const STEPS = [
  { label: "Role", emoji: "🎯" },
  { label: "Context", emoji: "⚙️" },
  { label: "Your Time", emoji: "🧠" },
  { label: "Details", emoji: "🔍" },
  { label: "Results", emoji: "🤯" },
];

interface StepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  const currentStepData = STEPS[currentStep];

  return (
    <nav aria-label="Wizard progress" className="mb-12">
      {/* Mobile: Mini dots */}
      <div className="flex sm:hidden flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          {STEPS.map((s, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <button
                key={s.label}
                type="button"
                disabled={i > currentStep}
                onClick={() => isCompleted && onStepClick(i)}
                aria-label={`Step ${i + 1}: ${s.label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "w-3.5 h-3.5"
                    : "w-2.5 h-2.5"
                } ${isCompleted ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  background: isCurrent
                    ? "linear-gradient(135deg, var(--color-waste), var(--color-reclaim))"
                    : isCompleted
                      ? "var(--color-reclaim)"
                      : "var(--color-line)",
                  boxShadow: isCurrent
                    ? "0 2px 8px rgba(224, 62, 18, 0.3)"
                    : undefined,
                }}
              />
            );
          })}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--color-waste)" }}
        >
          <span aria-hidden="true">{currentStepData?.emoji}</span>{" "}
          {currentStepData?.label}
        </span>
      </div>

      {/* Desktop: Full circles (existing layout) */}
      <ol className="hidden sm:flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isFuture = i > currentStep;

          return (
            <li key={s.label} className="flex-1 flex flex-col items-center gap-2">
              {/* Connector line (before the dot, except first) */}
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted || isCurrent
                        ? "var(--color-waste)"
                        : "var(--color-line)",
                    }}
                  />
                )}

                {/* Step dot */}
                <motion.button
                  type="button"
                  disabled={isFuture}
                  onClick={() => isCompleted && onStepClick(i)}
                  aria-label={`Step ${i + 1}: ${s.label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
                  className={`
                    relative flex items-center justify-center w-11 h-11 rounded-full
                    text-base font-bold transition-all duration-300
                    ${isFuture ? "cursor-default" : isCompleted ? "cursor-pointer" : "cursor-default"}
                  `}
                  style={{
                    background: isCurrent
                      ? "linear-gradient(135deg, var(--color-waste), var(--color-reclaim))"
                      : isCompleted
                        ? "var(--color-reclaim)"
                        : "var(--color-line)",
                    color: isCurrent || isCompleted ? "#fff" : "var(--color-ink-soft)",
                    boxShadow: isCurrent
                      ? "0 3px 12px rgba(224, 62, 18, 0.3)"
                      : undefined,
                  }}
                  whileHover={isCompleted ? { scale: 1.1 } : {}}
                  whileTap={isCompleted ? { scale: 0.95 } : {}}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7.5L5.5 11L12 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.button>

                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: isCompleted
                        ? "var(--color-waste)"
                        : "var(--color-line)",
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="text-xs font-semibold whitespace-nowrap"
                style={{
                  color: isCurrent
                    ? "var(--color-waste)"
                    : isCompleted
                      ? "var(--color-ink)"
                      : "var(--color-ink-soft)",
                }}
              >
                <span aria-hidden="true">{s.emoji}</span> {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/analyzer/Stepper.tsx
git commit -m "feat: mini dot stepper on mobile, full circles on desktop"
```

---

### Task 4: Landing Page — Hero

**Files:**
- Modify: `src/components/landing/Hero.tsx`

Changes:
- Line 131: `min-h-[90vh]` → `min-h-[70vh] sm:min-h-[90vh]`
- Line 166: `text-5xl sm:text-6xl md:text-7xl` → `text-3xl sm:text-5xl md:text-6xl lg:text-7xl`
- Line 207: `px-10 py-5 text-lg` → `px-6 py-4 text-base sm:px-10 sm:py-5 sm:text-lg`

- [ ] **Step 1: Apply responsive classes to Hero.tsx**

Line 131 — section container:
```
Old: className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden"
New: className="relative min-h-[70vh] sm:min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-20 overflow-hidden"
```

Line 166 — main headline:
```
Old: className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6"
New: className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-4 sm:mb-6"
```

Line 179 — subheadline:
```
Old: className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
New: className="text-base sm:text-lg md:text-xl mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
```

Line 207 — CTA button:
```
Old: className="px-10 py-5 text-lg font-bold"
New: className="px-6 py-4 text-base sm:px-10 sm:py-5 sm:text-lg font-bold"
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/Hero.tsx
git commit -m "feat: responsive Hero — smaller text, tighter spacing on mobile"
```

---

### Task 5: Landing Page — ToolCards, BenchmarkProof, RoleLenses

**Files:**
- Modify: `src/components/landing/ToolCards.tsx`
- Modify: `src/components/landing/BenchmarkProof.tsx`
- Modify: `src/components/landing/RoleLenses.tsx`

**ToolCards.tsx:**
- Line 35: `px-5 py-24` → `px-4 py-12 sm:px-5 sm:py-24`
- Line 65: `p-10` → `p-5 sm:p-10`

**BenchmarkProof.tsx:**
- Line 46: `px-5 py-24` → `px-4 py-12 sm:px-5 sm:py-24`
- Line 75: `p-6` → `p-4 sm:p-6`
- Line 69: `grid-cols-2 md:grid-cols-3` — already OK, 2-col works at 375px

**RoleLenses.tsx:**
- Line 9: `px-5 py-24` → `px-4 py-12 sm:px-5 sm:py-24`
- Line 27: `grid-cols-2 sm:grid-cols-3` — already OK but tighten padding
- Line 34: `p-7` → `p-4 sm:p-7`

- [ ] **Step 1: Apply responsive classes to all three files**

ToolCards.tsx line 35:
```
Old: className="px-5 py-24 max-w-5xl mx-auto"
New: className="px-4 py-12 sm:px-5 sm:py-24 max-w-5xl mx-auto"
```

ToolCards.tsx line 65:
```
Old: className="block no-underline group rounded-xl p-10 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
New: className="block no-underline group rounded-xl p-5 sm:p-10 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
```

BenchmarkProof.tsx line 46:
```
Old: className="px-5 py-24"
New: className="px-4 py-12 sm:px-5 sm:py-24"
```

BenchmarkProof.tsx line 75:
```
Old: className="rounded-xl p-6 relative overflow-hidden"
New: className="rounded-xl p-4 sm:p-6 relative overflow-hidden"
```

RoleLenses.tsx line 9:
```
Old: className="px-5 py-24 max-w-5xl mx-auto"
New: className="px-4 py-12 sm:px-5 sm:py-24 max-w-5xl mx-auto"
```

RoleLenses.tsx line 34:
```
Old: className="block no-underline group rounded-xl p-7 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.03]"
New: className="block no-underline group rounded-xl p-4 sm:p-7 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.03]"
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/ToolCards.tsx src/components/landing/BenchmarkProof.tsx src/components/landing/RoleLenses.tsx
git commit -m "feat: responsive landing sections — tighter padding and spacing on mobile"
```

---

### Task 6: RoleStep — Responsive Grids

**Files:**
- Modify: `src/components/analyzer/RoleStep.tsx`

Changes:
- Line 107: level grid `grid-cols-3` → `grid-cols-1 sm:grid-cols-3`
- Line 116: level button `p-4` → `p-3 sm:p-4`
- Line 206: role card `p-6` → `p-4 sm:p-6`

- [ ] **Step 1: Apply responsive classes**

Line 107 — level grid:
```
Old: <div className="grid grid-cols-3 gap-3">
New: <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
```

Line 116 — level button padding:
```
Old: className="p-4 rounded-xl text-left transition-all duration-200"
New: className="p-3 sm:p-4 rounded-xl text-left transition-all duration-200"
```

Line 206 — role card padding:
```
Old: className="surface-card p-6 text-left transition-all duration-200"
New: className="surface-card p-4 sm:p-6 text-left transition-all duration-200"
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/analyzer/RoleStep.tsx
git commit -m "feat: responsive RoleStep — stacked level buttons, tighter cards on mobile"
```

---

### Task 7: ContextStep — Day Buttons Wrap

**Files:**
- Modify: `src/components/analyzer/ContextStep.tsx`

Changes:
- Line 77, 89, 115: card padding `p-5` → `p-4 sm:p-5`
- Line 93: day buttons `flex gap-2` → `flex flex-wrap gap-2` (already only 4 items, but wrap prevents squeeze)
- Line 101: day button add min touch target `min-w-[44px]`

- [ ] **Step 1: Apply responsive classes**

Line 77 — hours card:
```
Old: <div className="surface-card p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
New: <div className="surface-card p-4 sm:p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
```

Line 89 — days card (same change):
```
Old: <div className="surface-card p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
New: <div className="surface-card p-4 sm:p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
```

Line 93 — day buttons flex:
```
Old: <div className="flex gap-2">
New: <div className="flex flex-wrap gap-2">
```

Line 115 — pay card (same change):
```
Old: <div className="surface-card p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
New: <div className="surface-card p-4 sm:p-5" style={{ borderLeft: "4px solid var(--color-gold)" }}>
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/analyzer/ContextStep.tsx
git commit -m "feat: responsive ContextStep — wrapping day buttons, tighter padding on mobile"
```

---

### Task 8: DrilldownStep — Padding & Badge Layout

**Files:**
- Modify: `src/components/analyzer/DrilldownStep.tsx`

Changes:
- Line 288: group card `p-6` → `p-4 sm:p-6`
- Line 291: header flex → add `flex-wrap` to prevent badge overflow
- Line 299: source card `p-6 sm:p-8` → `p-4 sm:p-8` (in WeighStep, line 299)

- [ ] **Step 1: Apply responsive classes**

Line 288 — group card:
```
Old: className="surface-card p-6"
New: className="surface-card p-4 sm:p-6"
```

Line 291 — header flex (add flex-wrap):
```
Old: <div className="flex items-center justify-between mb-4">
New: <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/analyzer/DrilldownStep.tsx
git commit -m "feat: responsive DrilldownStep — tighter padding, wrapping badges on mobile"
```

---

### Task 9: WeighStep — Responsive Source Cards

**Files:**
- Modify: `src/components/analyzer/WeighStep.tsx`

Changes:
- Line 299: card padding already has `p-6 sm:p-8` which is good
- Line 303: header flex — add `flex-wrap gap-2` for long labels
- Line 200: sticky panel — add responsive padding

- [ ] **Step 1: Apply responsive classes**

Line 200 — sticky panel:
```
Old: className="surface-card p-4 flex items-center justify-between"
New: className="surface-card p-3 sm:p-4 flex items-center justify-between gap-3"
```

Line 303 — source header (add flex-wrap):
```
Old: <div className="flex items-center gap-2 mb-4">
New: <div className="flex items-center gap-2 mb-4 flex-wrap">
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/analyzer/WeighStep.tsx
git commit -m "feat: responsive WeighStep — wrapping headers, tighter sticky panel on mobile"
```

---

### Task 10: ResultsView — Responsive Chart

**Files:**
- Modify: `src/components/analyzer/ResultsView.tsx`

Changes:
- Import `useIsMobile` hook
- Line 251, 278: reveal text `text-5xl sm:text-6xl md:text-7xl` → `text-3xl sm:text-5xl md:text-6xl lg:text-7xl`
- Line 344: headline `text-4xl sm:text-5xl` → `text-2xl sm:text-4xl md:text-5xl`
- Line 414: chart height `height: 420` → conditional on `isMobile`
- Line 418: chart margin `bottom: 100` → conditional on `isMobile`
- Line 523: vital few card `p-6` → `p-4 sm:p-6`
- Line 563, 596: zone cards `p-6` → `p-4 sm:p-6`

- [ ] **Step 1: Add import and hook call**

At top of file, add import:
```typescript
import { useIsMobile } from "@/hooks/useIsMobile";
```

Inside the component function, after the other hooks:
```typescript
const isMobile = useIsMobile();
```

- [ ] **Step 2: Make reveal text responsive**

Line 251 (cost reveal):
```
Old: className="text-5xl sm:text-6xl md:text-7xl font-bold font-figures leading-none"
New: className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-figures leading-none"
```

Line 278 (hours reveal — same pattern):
```
Old: className="text-5xl sm:text-6xl md:text-7xl font-bold font-figures leading-none"
New: className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-figures leading-none"
```

- [ ] **Step 3: Make headline responsive**

Line 344:
```
Old: className="font-figures font-bold mb-3 text-4xl sm:text-5xl"
New: className="font-figures font-bold mb-3 text-2xl sm:text-4xl md:text-5xl"
```

- [ ] **Step 4: Make chart responsive**

Line 414 — chart container:
```
Old: <div style={{ width: "100%", height: 420 }} aria-hidden="true">
New: <div style={{ width: "100%", height: isMobile ? 300 : 420 }} aria-hidden="true">
```

Line 418 — chart margins:
```
Old: margin={{ top: 10, right: 30, left: 0, bottom: 100 }}
New: margin={{ top: 10, right: isMobile ? 10 : 30, left: 0, bottom: isMobile ? 70 : 100 }}
```

Line 428 — X axis height:
```
Old: height={110}
New: height={isMobile ? 80 : 110}
```

- [ ] **Step 5: Responsive padding on cards**

Line 523 — vital few card:
```
Old: className="surface-card p-6"
New: className="surface-card p-4 sm:p-6"
```

Line 563 — zone B card:
```
Old: <div className="surface-card p-6 mb-10" style={{ borderLeft: "4px solid var(--color-gold)" }}>
New: <div className="surface-card p-4 sm:p-6 mb-10" style={{ borderLeft: "4px solid var(--color-gold)" }}>
```

Line 596 — zone C card:
```
Old: <div className="surface-card p-6 mb-10" style={{ borderLeft: "4px solid var(--color-ink-soft)" }}>
New: <div className="surface-card p-4 sm:p-6 mb-10" style={{ borderLeft: "4px solid var(--color-ink-soft)" }}>
```

- [ ] **Step 6: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 7: Commit**

```bash
git add src/components/analyzer/ResultsView.tsx
git commit -m "feat: responsive ResultsView — adaptive chart height, smaller text on mobile"
```

---

### Task 11: FocusStage — Responsive Tabs

**Files:**
- Modify: `src/components/focus/FocusStage.tsx`

Changes:
- Line 87: heading `text-4xl sm:text-5xl` → `text-2xl sm:text-4xl md:text-5xl`
- Line 121: tab buttons — reduce padding on mobile
- Line 136: tab label text — hide on mobile for narrow tabs, or reduce size

- [ ] **Step 1: Apply responsive classes**

Line 87 — page heading:
```
Old: className="text-4xl sm:text-5xl font-bold mb-2"
New: className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2"
```

Line 121 — tab buttons:
```
Old: className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
New: className="relative flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer"
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/focus/FocusStage.tsx
git commit -m "feat: responsive FocusStage — smaller heading and compact tabs on mobile"
```

---

### Task 12: SolutionPicker — Responsive Cards

**Files:**
- Modify: `src/components/focus/SolutionPicker.tsx`

Changes:
- Line 211: drain section card `p-6` → `p-4 sm:p-6`
- Line 484: bottom bar `p-4` → `p-3 sm:p-4`, make flex-wrap
- Line 503: CTA button `px-10 py-4` → `px-6 py-3 sm:px-10 sm:py-4`

- [ ] **Step 1: Apply responsive classes**

Line 211 — drain section card:
```
Old: className="surface-card p-6 mb-6"
New: className="surface-card p-4 sm:p-6 mb-6"
```

Line 484 — bottom bar:
```
Old: className="mt-8 flex items-center justify-between p-4 rounded-xl border"
New: className="mt-8 flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border"
```

Line 503 — CTA button:
```
Old: className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
New: className="px-6 py-3 sm:px-10 sm:py-4 text-sm sm:text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/focus/SolutionPicker.tsx
git commit -m "feat: responsive SolutionPicker — tighter cards and bottom bar on mobile"
```

---

### Task 13: FocusTable — Responsive Action Cards

**Files:**
- Modify: `src/components/focus/FocusTable.tsx`

Changes:
- Line 106: ActionCard `p-5` → `p-4 sm:p-5`
- Line 149: controls grid `grid-cols-2 gap-3` → add responsive gap
- Line 59: DotRating dots `w-6 h-6` → `w-5 h-5 sm:w-6 sm:h-6` for better touch on mobile

- [ ] **Step 1: Apply responsive classes**

Line 106 — ActionCard padding:
```
Old: className="surface-card p-5 rounded-xl transition-shadow hover:shadow-md"
New: className="surface-card p-4 sm:p-5 rounded-xl transition-shadow hover:shadow-md"
```

Line 149 — controls grid:
```
Old: <div className="grid grid-cols-2 gap-3">
New: <div className="grid grid-cols-2 gap-2 sm:gap-3">
```

Line 59 — DotRating circles (increase touch target):
```
Old: className="w-6 h-6 rounded-full border-2 transition-all duration-150 cursor-pointer hover:scale-110 relative"
New: className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-150 cursor-pointer hover:scale-110 relative"
```

Note: w-7 (28px) on mobile is better for finger tapping than w-6 (24px). On desktop, w-6 is fine because mouse precision is higher.

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/focus/FocusTable.tsx
git commit -m "feat: responsive FocusTable — tighter padding, larger touch targets on mobile"
```

---

### Task 14: EviMatrix — Responsive Chart + Table

**Files:**
- Modify: `src/components/focus/EviMatrix.tsx`

Changes:
- Import `useIsMobile`
- Line 595: chart height `height={400}` → `height={isMobile ? 280 : 400}`
- Line 597: chart margin → conditional
- Line 280: PriorityTable `p-6` → `p-4 sm:p-6`
- Line 545: chart card `p-4` → `p-3 sm:p-4`
- Line 550, 561, 572, 583: quadrant labels — hide on mobile (too tight) or shrink further
- Line 734: editor grid `grid-cols-2 gap-6` → `grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6`
- Line 749: score buttons `w-10 h-10` → `w-9 h-9 sm:w-10 sm:h-10`

- [ ] **Step 1: Add import and hook**

Add import at top:
```typescript
import { useIsMobile } from "@/hooks/useIsMobile";
```

Inside `EviMatrix` function, after existing hooks:
```typescript
const isMobile = useIsMobile();
```

- [ ] **Step 2: Responsive chart**

Line 595 — chart height:
```
Old: <ResponsiveContainer width="100%" height={400}>
New: <ResponsiveContainer width="100%" height={isMobile ? 280 : 400}>
```

Line 597 — chart margins:
```
Old: margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
New: margin={{ top: 20, right: isMobile ? 10 : 30, bottom: 20, left: isMobile ? 0 : 10 }}
```

- [ ] **Step 3: Hide quadrant labels on mobile (too cramped)**

Line 549 — add `hidden sm:block` to all 4 quadrant label containers:
```
Old: className="absolute top-10 left-[72px] sm:left-[80px] z-10 pointer-events-none"
New: className="absolute top-10 left-[72px] sm:left-[80px] z-10 pointer-events-none hidden sm:block"
```

Line 561:
```
Old: className="absolute top-10 right-[40px] sm:right-[48px] z-10 pointer-events-none"
New: className="absolute top-10 right-[40px] sm:right-[48px] z-10 pointer-events-none hidden sm:block"
```

Line 572:
```
Old: className="absolute bottom-[100px] left-[72px] sm:left-[80px] z-10 pointer-events-none"
New: className="absolute bottom-[100px] left-[72px] sm:left-[80px] z-10 pointer-events-none hidden sm:block"
```

Line 583:
```
Old: className="absolute bottom-[100px] right-[40px] sm:right-[48px] z-10 pointer-events-none"
New: className="absolute bottom-[100px] right-[40px] sm:right-[48px] z-10 pointer-events-none hidden sm:block"
```

- [ ] **Step 4: Responsive padding and editor**

Line 545 — chart card:
```
Old: className="surface-card p-4 relative"
New: className="surface-card p-2 sm:p-4 relative"
```

Line 280 — PriorityTable:
```
Old: className="mt-6 surface-card p-6 overflow-x-auto"
New: className="mt-6 surface-card p-3 sm:p-6 overflow-x-auto"
```

Line 734 — editor grid:
```
Old: <div className="grid grid-cols-2 gap-6">
New: <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
```

Line 749 — score buttons (also 785):
```
Old: className="w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer"
New: className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-all cursor-pointer"
```

- [ ] **Step 5: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 6: Commit**

```bash
git add src/components/focus/EviMatrix.tsx
git commit -m "feat: responsive EviMatrix — adaptive chart, hidden labels, tighter layout on mobile"
```

---

### Task 15: Payoff — Responsive Cards and Text

**Files:**
- Modify: `src/components/focus/Payoff.tsx`

Changes:
- Line 150: main card `p-8` → `p-5 sm:p-8`
- Line 167-175: big number `text-5xl` → `text-3xl sm:text-5xl`
- Line 294: before/after card `p-6` → `p-4 sm:p-6`
- Line 298, 339: min-w-[180px] → `min-w-0 sm:min-w-[180px]`
- Line 373: cost of doing nothing `p-8` → `p-5 sm:p-8`

- [ ] **Step 1: Apply responsive classes**

Line 150 — main card:
```
Old: <div className="surface-card p-8 mb-6" style={{ borderTop: "4px solid var(--color-reclaim)" }}>
New: <div className="surface-card p-5 sm:p-8 mb-6" style={{ borderTop: "4px solid var(--color-reclaim)" }}>
```

Line 167 — "You could reclaim" number:
```
Old: className="text-5xl font-bold mb-1"
New: className="text-3xl sm:text-5xl font-bold mb-1"
```

Line 173 — CountUp for reclaim:
```
Old: className="text-5xl font-bold"
New: className="text-3xl sm:text-5xl font-bold"
```

Line 294 — before/after card:
```
Old: <div className="surface-card p-6 mb-6 max-w-2xl mx-auto">
New: <div className="surface-card p-4 sm:p-6 mb-6 max-w-2xl mx-auto">
```

Line 298 — before card min-width:
```
Old: className="text-center p-4 rounded-xl flex-1 min-w-[180px]"
New: className="text-center p-3 sm:p-4 rounded-xl flex-1 min-w-0 sm:min-w-[180px]"
```

Line 339 — after card min-width (same change):
```
Old: className="text-center p-4 rounded-xl flex-1 min-w-[180px]"
New: className="text-center p-3 sm:p-4 rounded-xl flex-1 min-w-0 sm:min-w-[180px]"
```

Line 373 — cost of doing nothing:
```
Old: className="rounded-xl p-8 mb-6"
New: className="rounded-xl p-5 sm:p-8 mb-6"
```

- [ ] **Step 2: Run full suite**

Run: `npx vitest --run`
Expected: All tests passing

- [ ] **Step 3: Commit**

```bash
git add src/components/focus/Payoff.tsx
git commit -m "feat: responsive Payoff — smaller numbers, no min-width overflow on mobile"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest --run`
Expected: All tests passing (280+)

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Only the 2 pre-existing regex flag warnings

- [ ] **Step 3: Run banned color check**

Run: `grep -r "29,107,88\|df3c18\|b9852b\|185,133,43\|5c544a" src/`
Expected: No output

- [ ] **Step 4: Run banned patterns check**

Run: `grep -r "window\.__" src/`
Expected: No output

- [ ] **Step 5: Run Playwright screenshots**

Run: `npx playwright test e2e/capture-screens.spec.ts`
Then READ screenshots in `e2e/screenshots/` to visually verify changes.

- [ ] **Step 6: Production build**

Run: `npx next build`
Expected: Compiled successfully

- [ ] **Step 7: Final commit if any remaining changes**

```bash
git status
# If clean, done. If not, commit remaining files.
```
