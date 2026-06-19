---
title: Mobile Optimization — Full App
date: 2026-06-19
status: approved
---

# Mobile Optimization Design — FocusLab

## Summary

Make FocusLab fully usable on mobile devices (375px+ viewport). All changes are additive responsive variants — desktop experience is untouched. All 279 tests must continue to pass.

## Target

- Minimum viewport: 375px (iPhone SE)
- Breakpoint strategy: mobile-first Tailwind classes, `sm:` (640px) restores desktop behavior
- No functionality removed — layout adapts, features preserved

## Decisions

- **Stepper:** Mini dots (Option C) on mobile, full circles on desktop
- **Charts:** Reduced height (280px) + tighter margins on mobile via `useIsMobile` hook
- **Grids:** Stack to fewer columns on mobile (e.g. 3-col → 1-col)
- **Text:** Responsive heading sizes (e.g. `text-2xl sm:text-4xl`)
- **Spacing:** Tighter padding on mobile (e.g. `p-3 sm:p-5`)

## Scope — Three Phases

### Phase 1: Global Foundations + Landing Page

**Global:**
- Verify viewport meta tag in layout.tsx
- globals.css: mobile font size (16px), heading size overrides via media query
- Create `useIsMobile` hook (matchMedia 639px) for chart components
- Horizontal overflow prevention (`overflow-x-hidden` on body)

**Landing page components:**
- Hero.tsx: heading sizes, calendar grid cols (5 → 3 on mobile)
- ToolCards.tsx: padding reduction
- BenchmarkProof.tsx: grid responsive adjustment
- RoleLenses.tsx: padding + text scaling

### Phase 2: Analyzer Wizard

- Stepper.tsx: mini dots on mobile (Option C), full circles on desktop
- RoleStep.tsx: function grid 2-col → 1-col on xs, level grid 3-col → responsive
- ContextStep.tsx: day buttons flex-wrap, padding reduction
- IntakeStep.tsx: minor padding tweaks
- DrilldownStep.tsx: padding reduction, badge layout stacking
- WeighStep.tsx: padding + text scaling
- ResultsView.tsx: chart height 400→280 on mobile, margins reduced, heading sizes

### Phase 3: Focus Table

- FocusStage.tsx: tab layout responsive, heading sizes
- SolutionPicker.tsx: padding reduction, scroll container
- FocusTable.tsx: card padding, flex-wrap headers
- EviMatrix.tsx: chart height 400→280, padding, quadrant label positioning
- Payoff.tsx: remove min-w-[180px] on mobile, heading sizes, stat card layout

## Safety

- All changes are Tailwind responsive class additions — only activate below `sm:` breakpoint
- Desktop rendering path unchanged
- Test suite run between each phase
- Screenshot verification at end
- No engine/state/data changes
