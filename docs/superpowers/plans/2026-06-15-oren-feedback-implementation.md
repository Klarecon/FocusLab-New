# Oren Feedback + Visual Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 14 approved feedback items from Oren's review + Mona's visual checks on Session 8 work.

**Architecture:** Changes span 4 layers: (1) WeighStep methodology change (remove avoidable %), (2) Focus tool UX improvements (tooltip, skip button, date min, density, table redesign, above-fold hook, opportunity framing), (3) Analyzer fixes (bar chart labels, duplicate sources, zero prompt removal), (4) Double Pareto two-pass wizard (the biggest change). Tasks 1-12 are independent. Task 13 (opportunity framing) and 14 (double Pareto) are larger and should be done last.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Recharts, Vitest

---

## File Map

| File | Changes |
|------|---------|
| `src/components/analyzer/WeighStep.tsx` | O1: remove avoidable %, O2: remove "Really zero?" |
| `src/components/analyzer/ResultsView.tsx` | O4: bar chart label truncation + hover tooltip |
| `src/components/analyzer/IntakeStep.tsx` | O10: deduplicate waste sources across pain prompts |
| `src/components/focus/SolutionPicker.tsx` | O5: collapse descriptions, show fewer solutions |
| `src/components/focus/EviMatrix.tsx` | O6: simplify tooltip, above-fold hook, #7: label padding, O7: skip button, O8: date min, #10: table redesign |
| `src/components/focus/FocusStage.tsx` | O6a: rename tab to "EvI Matrix" |
| `src/components/focus/FocusTable.tsx` | #6: CTA centering fix |
| `src/lib/engine/audit-logic.ts` | O1: update engine to use raw hours (no avoidable discount) |
| `src/stores/audit-store.ts` | O1: remove avoidablePct; O3: add categoryEstimates + vitalCategories |
| `src/lib/data/opportunity-frames.ts` | O9: NEW — role-specific opportunity frames by time tier |
| `src/components/analyzer/DrilldownStep.tsx` | O3: NEW — Pass 2 drilldown into vital few categories |
| `src/components/analyzer/AuditWizard.tsx` | O3: add DrilldownStep to wizard flow |
| `src/__tests__/feedback-regression.test.ts` | Add regression tests for each fix |

---

### Task 1: O2 — Remove "Really zero?" prompt (Trivial)

**Files:**
- Modify: `src/components/analyzer/WeighStep.tsx:69,140-143,417-439`
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

In `src/__tests__/feedback-regression.test.ts`, add at the end of the "Functional rules" describe block:

```typescript
it("[S9-O2] no 'Really zero?' prompt in WeighStep", () => {
  expect(
    fileContains("components/analyzer/WeighStep.tsx", "Really zero")
  ).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/__tests__/feedback-regression.test.ts`
Expected: FAIL — "Really zero" still exists in WeighStep.tsx

- [ ] **Step 3: Remove the zero confirmation code from WeighStep.tsx**

Remove these pieces:
1. Line 69: `const [confirmedZeros, setConfirmedZeros] = useState<Set<string>>(new Set());`
2. Lines 140-143: The `hasUnconfirmedZeros` variable (it's only used for the zero prompt, not for blocking navigation)
3. Lines 417-439: The entire zero-confirmation block:
```tsx
{/* Zero confirmation */}
{entry.hoursPerDay === 0 && !confirmedZeros.has(src.slug) && (
  <motion.div ... >
    ...Really zero?...Yes, skip it...
  </motion.div>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest --run src/__tests__/feedback-regression.test.ts`
Expected: PASS

- [ ] **Step 5: Run full suite**

Run: `npx vitest --run`
Expected: All tests pass, count >= 238

- [ ] **Step 6: Commit**

```bash
git add src/components/analyzer/WeighStep.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O2: remove redundant 'Really zero?' prompt from WeighStep"
```

---

### Task 2: O8 — Date picker minimum = today (Trivial)

**Files:**
- Modify: `src/components/focus/EviMatrix.tsx:340-351`
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O8] date picker has min attribute for today", () => {
  const content = readSrc("components/focus/EviMatrix.tsx");
  // Should have a min attribute on the date input
  expect(content).toMatch(/min=\{.*toISOString|min=\{.*today/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest --run src/__tests__/feedback-regression.test.ts`
Expected: FAIL

- [ ] **Step 3: Add min attribute to date input in PriorityTable**

In `EviMatrix.tsx`, in the PriorityTable component, find the `<input type="date"` element (around line 340) and add a `min` attribute:

```tsx
<input
  type="date"
  value={dueDates[d.id] ?? ""}
  onChange={(e) => setDueDate(d.id, e.target.value)}
  min={new Date().toISOString().split("T")[0]}
  className="text-xs px-2 py-1 rounded border w-[120px] flex-shrink-0"
  style={{
    borderColor: "var(--color-line)",
    backgroundColor: "var(--color-paper)",
    color: dueDates[d.id] ? "var(--color-ink)" : "var(--color-ink-soft)",
  }}
  aria-label={`Due date for ${d.title}`}
/>
```

- [ ] **Step 4: Run test + full suite**

Run: `npx vitest --run`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/components/focus/EviMatrix.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O8: enforce min date = today on priority table date picker"
```

---

### Task 3: O7 — Skip button for White Elephants (Trivial)

**Files:**
- Modify: `src/components/focus/EviMatrix.tsx` (PriorityTable component, ~line 307-354)
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O7] PriorityTable has skip/remove button for White Elephants", () => {
  expect(
    fileContains("components/focus/EviMatrix.tsx", "removeSolution")
  ).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL — `removeSolution` is not currently used in EviMatrix.tsx

- [ ] **Step 3: Add skip button to PriorityTable rows**

In the PriorityTable component:

1. Add `removeSolution` from the store:
```tsx
const removeSolution = useAuditStore((s) => s.removeSolution);
```

2. Inside each row's `<div>` (after the date input, around line 351), add a skip button — show on all quadrants but style differently for White Elephants:

```tsx
<button
  onClick={() => removeSolution(d.id)}
  className="text-xs cursor-pointer transition-opacity hover:opacity-70 flex-shrink-0 px-2 py-1 rounded"
  style={{ color: "var(--color-ink-soft)" }}
  aria-label={`Remove ${d.title} from plan`}
  title="Remove from plan"
>
  &times;
</button>
```

- [ ] **Step 4: Run full suite**

Run: `npx vitest --run`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/components/focus/EviMatrix.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O7: add skip/remove button to priority table rows"
```

---

### Task 4: O6a — Rename tab to "EvI Matrix" (Trivial)

**Files:**
- Modify: `src/components/focus/FocusStage.tsx:14`
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O6a] tab label says 'EvI Matrix' not 'Impact Matrix'", () => {
  const content = readSrc("components/focus/FocusStage.tsx");
  expect(content).toContain("EvI Matrix");
  expect(content).not.toContain('"Impact Matrix"');
});
```

- [ ] **Step 2: Run to verify fail, then fix**

In `FocusStage.tsx` line 14, change:
```tsx
{ id: "matrix", label: "Impact Matrix", emoji: "⚡" },
```
to:
```tsx
{ id: "matrix", label: "EvI Matrix", emoji: "⚡" },
```

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/focus/FocusStage.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O6a: rename tab from 'Impact Matrix' to 'EvI Matrix'"
```

---

### Task 5: O6b — Simplify dot tooltip (Moderate)

**Files:**
- Modify: `src/components/focus/EviMatrix.tsx:131-178` (CustomTooltipContent)
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O6b] tooltip does not show 'Source:' or reclaimHint", () => {
  const content = readSrc("components/focus/EviMatrix.tsx");
  // Tooltip should NOT show "Source:" label or reclaimHint
  expect(content).not.toMatch(/Source:.*\{data\.sourceName\}/);
});
```

- [ ] **Step 2: Simplify CustomTooltipContent**

Replace the `CustomTooltipContent` function (lines 131-178) with:

```tsx
function CustomTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DotData }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const meta = QUADRANT_META[data.quadrantLabel];

  return (
    <div
      className="rounded-lg p-3 shadow-lg text-sm max-w-xs"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-line)",
        color: "var(--color-ink)",
      }}
    >
      <div className="font-semibold mb-1">
        #{data.idx} {data.title}
      </div>
      <div
        className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1"
        style={{
          color: QUADRANT_LABEL_COLOR[data.quadrantLabel],
          backgroundColor: QUADRANT_BG[data.quadrantLabel],
        }}
      >
        {meta.emoji} {meta.name}
      </div>
      <div className="flex gap-3 mt-1 text-xs">
        <span>
          Effort: <strong>{data.x}</strong>
        </span>
        <span>
          Impact: <strong>{data.y}</strong>
        </span>
      </div>
    </div>
  );
}
```

This keeps: name, quadrant badge, effort score, impact score.
Removes: "Source:" line, reclaimHint italic line.

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/focus/EviMatrix.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O6b: simplify dot tooltip — show only name, quadrant, effort/impact"
```

---

### Task 6: #6 — Center "See your impact" CTA + #7 — Fix quadrant label overlap

**Files:**
- Modify: `src/components/focus/FocusTable.tsx:417` (#6)
- Modify: `src/components/focus/EviMatrix.tsx:467-510` (#7)

- [ ] **Step 1: Fix CTA centering (#6)**

In `FocusTable.tsx`, the CTA is already in a `text-center` div (line 417). The issue is likely the ShimmerButton being `inline-flex` without explicit centering. Wrap it:

```tsx
<div className="mt-8 flex justify-center">
  <ShimmerButton ...>
    ...
  </ShimmerButton>
</div>
```

Change `<div className="mt-8 text-center">` to `<div className="mt-8 flex justify-center">`.

- [ ] **Step 2: Fix quadrant label overlap (#7)**

In `EviMatrix.tsx`, increase the inset values for all 4 labels. Change:
- `top-10 left-16` → `top-6 left-10` (move labels INSIDE the chart area more)
- `top-10 right-10` → `top-6 right-6`
- `bottom-16 left-16` → `bottom-[72px] left-10`
- `bottom-16 right-10` → `bottom-[72px] right-6`

The bottom labels need extra space because the X-axis labels and legend are at the bottom. Using `bottom-[72px]` to clear them.

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/focus/FocusTable.tsx src/components/focus/EviMatrix.tsx
git commit -m "#6: center CTA button, #7: fix quadrant label overlap"
```

---

### Task 7: #10 — Redesign Action Sequence as organized table

**Files:**
- Modify: `src/components/focus/EviMatrix.tsx` (PriorityTable component, lines 250-360)
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-#10] PriorityTable has column headers (Task, Owner, Due)", () => {
  const content = readSrc("components/focus/EviMatrix.tsx");
  expect(content).toContain("Task");
  expect(content).toMatch(/Due|Date/);
});
```

- [ ] **Step 2: Redesign PriorityTable with clear column headers**

Replace the current row layout (flex with truncated items) with a proper table-like structure. Add a header row above the items:

```tsx
{/* Column headers */}
<div
  className="flex items-center gap-3 px-4 pb-2 mb-2 text-[10px] font-medium uppercase tracking-wider"
  style={{ color: "var(--color-ink-soft)", borderBottom: "1px solid var(--color-line)" }}
>
  <span className="w-7 flex-shrink-0">#</span>
  <span className="flex-1 min-w-0">Task</span>
  <span className="w-24 flex-shrink-0 hidden sm:block text-center">Quadrant</span>
  <span className="w-24 flex-shrink-0 text-center">Owner</span>
  <span className="w-[120px] flex-shrink-0 text-center">Due</span>
  <span className="w-6 flex-shrink-0"></span>
</div>
```

Place this before the `{groups.map(...)}` block, inside the main container div.

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/focus/EviMatrix.tsx src/__tests__/feedback-regression.test.ts
git commit -m "#10: add column headers to priority table for clarity"
```

---

### Task 8: O6c — Above-fold engagement hook on EvI Matrix

**Files:**
- Modify: `src/components/focus/EviMatrix.tsx` (main EviMatrix component, before the chart)

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O6c] EviMatrix has above-fold summary with counts", () => {
  const content = readSrc("components/focus/EviMatrix.tsx");
  expect(content).toMatch(/Pearl|Oyster/);
  // Should show count of fixes by quadrant above the chart
  expect(content).toMatch(/pearlCount|quadrantCounts|summaryStats/);
});
```

- [ ] **Step 2: Add summary stats above the chart**

In the main `EviMatrix` component, after the heading "Where Should You Start?" and before the chart card, add a summary bar:

```tsx
{/* Above-fold summary */}
{(() => {
  const counts = {
    pearls: dotData.filter(d => d.quadrantLabel === "quick-win").length,
    oysters: dotData.filter(d => d.quadrantLabel === "major-project").length,
    lhf: dotData.filter(d => d.quadrantLabel === "fill-in").length,
    elephants: dotData.filter(d => d.quadrantLabel === "thankless").length,
  };
  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      {counts.pearls > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "rgba(196, 24, 106, 0.1)", color: "#c4186a" }}>
          🤩 {counts.pearls} {counts.pearls === 1 ? "Pearl" : "Pearls"}
        </span>
      )}
      {counts.oysters > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "rgba(237, 178, 21, 0.1)", color: "#edb215" }}>
          💪 {counts.oysters} {counts.oysters === 1 ? "Oyster" : "Oysters"}
        </span>
      )}
      {counts.lhf > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.04)", color: "#655b4d" }}>
          🫠 {counts.lhf} Low-Hanging {counts.lhf === 1 ? "Fruit" : "Fruits"}
        </span>
      )}
      {counts.elephants > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "rgba(224, 62, 18, 0.06)", color: "#e03e12" }}>
          🐘 {counts.elephants} White {counts.elephants === 1 ? "Elephant" : "Elephants"}
        </span>
      )}
      <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
        {dotData.length} fixes mapped
      </span>
    </div>
  );
})()}
```

Place this inside the `<div className="mb-6">` block, after the `<p>` tag describing the chart.

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/focus/EviMatrix.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O6c: add above-fold quadrant summary counts on EvI Matrix"
```

---

### Task 9: O5 — Reduce Solution Picker text density

**Files:**
- Modify: `src/components/focus/SolutionPicker.tsx` (SolutionCard + DrainSection)
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O5] SolutionCard descriptions are collapsible", () => {
  const content = readSrc("components/focus/SolutionPicker.tsx");
  // Should have a show/hide mechanism for descriptions
  expect(content).toMatch(/showDesc|expandedCard|isExpanded/);
});

it("[S9-O5] DrainSection limits visible solutions", () => {
  const content = readSrc("components/focus/SolutionPicker.tsx");
  // Should have a "show more" mechanism
  expect(content).toMatch(/showAll|visibleCount|INITIAL_VISIBLE/);
});
```

- [ ] **Step 2: Collapse descriptions by default in SolutionCard**

In the `SolutionCard` component, add expand/collapse for description:

1. Add state: `const [showDesc, setShowDesc] = useState(false);`

2. Replace the description `<p>` (line 120-125) with a toggle:
```tsx
{showDesc ? (
  <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
    {solution.description}
  </p>
) : (
  <button
    onClick={(e) => { e.stopPropagation(); setShowDesc(true); }}
    className="text-xs mb-2 underline cursor-pointer"
    style={{ color: "var(--color-ink-soft)" }}
  >
    Show details
  </button>
)}
```

Note: Since SolutionCard is wrapped in `memo`, adding local state is fine — it won't break memoization since state is internal.

- [ ] **Step 3: Limit visible solutions per drain to 3, with "show more"**

In the `DrainSection` component, add:

```tsx
const INITIAL_VISIBLE = 3;
const [showAll, setShowAll] = useState(false);
const visibleSolutions = showAll ? solutions : solutions.slice(0, INITIAL_VISIBLE);
const hasMore = solutions.length > INITIAL_VISIBLE;
```

Replace the solutions map (line 228-235) to use `visibleSolutions` instead of `solutions`:

```tsx
<div className="space-y-2">
  {visibleSolutions.map((sol) => (
    <SolutionCard
      key={sol.id}
      solution={sol}
      isChosen={chosenIds.has(sol.id)}
      onToggle={() => handleToggle(sol)}
    />
  ))}
  {hasMore && !showAll && (
    <button
      onClick={() => setShowAll(true)}
      className="w-full text-center py-2 text-xs font-medium rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.03)] cursor-pointer"
      style={{ color: "var(--color-ink-soft)" }}
    >
      Show {solutions.length - INITIAL_VISIBLE} more fixes
    </button>
  )}
</div>
```

- [ ] **Step 4: Run full suite, commit**

```bash
git add src/components/focus/SolutionPicker.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O5: collapse solution descriptions + limit to 3 visible per drain"
```

---

### Task 10: O4 — Bar chart label readability

**Files:**
- Modify: `src/components/analyzer/ResultsView.tsx:360-370` (XAxis config)
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O4] bar chart truncates long labels", () => {
  const content = readSrc("components/analyzer/ResultsView.tsx");
  // Should have a real truncate function or tickFormatter
  expect(content).toMatch(/truncate|ellipsis|slice.*\.\.\./);
});
```

- [ ] **Step 2: Implement label truncation**

Find the `truncate` function (around line 37-39 of ResultsView.tsx — currently a no-op) and make it work:

```typescript
function truncate(str: string, max = 25): string {
  return str.length > max ? str.slice(0, max - 1) + "\u2026" : str;
}
```

This will show truncated labels on the axis. The full label is already visible in the Recharts Tooltip on hover.

Also update the XAxis `tickFormatter` to use truncate explicitly:
```tsx
<XAxis
  dataKey="name"
  tick={{ fontSize: 10, fill: "var(--color-ink-soft)" }}
  tickFormatter={(name: string) => truncate(name, 25)}
  angle={-45}
  textAnchor="end"
  interval={0}
  height={110}
/>
```

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/analyzer/ResultsView.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O4: truncate long bar chart labels to 25 chars with tooltip on hover"
```

---

### Task 11: O10 — Deduplicate waste sources across pain prompts

**Files:**
- Modify: `src/components/analyzer/IntakeStep.tsx:257-291` (source rendering)
- Test: `src/__tests__/feedback-regression.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("[S9-O10] IntakeStep deduplicates sources across pain prompts", () => {
  const content = readSrc("components/analyzer/IntakeStep.tsx");
  // Should track seen slugs to prevent duplicates
  expect(content).toMatch(/seenSlugs|renderedSlugs|alreadyShown/);
});
```

- [ ] **Step 2: Add deduplication tracking**

In the `IntakeStep` component, add a `useMemo` that tracks which slugs have been rendered by previous pain prompts:

Inside the `return` block, before the pain prompts map (line 196), compute a map of which slugs belong to which pain prompt (first appearance wins):

```tsx
// Deduplicate: each source appears under the FIRST pain prompt that includes it
const slugOwnership = useMemo(() => {
  const ownership = new Map<string, number>(); // slug -> pain prompt index
  painPrompts.forEach((pain, pi) => {
    const matchedGroups = grouped.filter((g) => pain.groups.includes(g.group));
    for (const g of matchedGroups) {
      for (const src of g.sources) {
        if (!ownership.has(src.slug)) {
          ownership.set(src.slug, pi);
        }
      }
    }
  });
  return ownership;
}, [painPrompts, grouped]);
```

Then, in the source rendering (line 258-290), filter out sources that don't belong to this pain prompt:

```tsx
{matchedGroups.map((g) =>
  g.sources
    .filter((source) => slugOwnership.get(source.slug) === pi)
    .map((source, si) => (
      // ... existing label/checkbox JSX
    )),
)}
```

- [ ] **Step 3: Run full suite, commit**

```bash
git add src/components/analyzer/IntakeStep.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O10: deduplicate waste sources across pain prompt categories"
```

---

### Task 12: O1 — Remove avoidable % from WeighStep (Significant)

**Files:**
- Modify: `src/components/analyzer/WeighStep.tsx` (remove avoidable UI + update computation)
- Modify: `src/stores/audit-store.ts` (update WasteEntry type)
- Test: `src/__tests__/feedback-regression.test.ts`

**Important context:** This changes what the Pareto chart shows. Currently, waste hours are discounted by avoidable % before the engine runs. After this change, the engine gets raw hours. The avoidable % concept may be reintroduced later in the Focus Table (per Oren's suggestion), but for now it's removed entirely.

- [ ] **Step 1: Write the failing tests**

```typescript
it("[S9-O1] WeighStep has no 'how much could you actually cut' question", () => {
  expect(
    fileContains("components/analyzer/WeighStep.tsx", "how much could you actually cut")
  ).toBe(false);
});

it("[S9-O1] WeighStep has no avoidable percentage buttons", () => {
  expect(
    fileContains("components/analyzer/WeighStep.tsx", "avoidablePct")
  ).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Expected: FAIL — avoidablePct and the question text still exist

- [ ] **Step 3: Update WasteEntry in audit-store.ts**

In `src/stores/audit-store.ts`, the `WasteEntry` interface (line 15-19) currently has:
```typescript
export interface WasteEntry {
  hoursPerDay: number;
  avoidablePct: number;
  cadence: "daily" | "weekly";
}
```

Keep `avoidablePct` in the type for backward compatibility with persisted localStorage data, but always treat it as 100. In `setEntry`, force it:

```typescript
// In the setEntry action, always set avoidablePct to 100
setEntry: (slug, partial) =>
  set((state) => ({
    entries: {
      ...state.entries,
      [slug]: {
        ...(state.entries[slug] ?? { hoursPerDay: 0, avoidablePct: 100, cadence: (state.weighCadence ?? "daily") as "daily" | "weekly" }),
        ...partial,
        avoidablePct: 100, // Always 100 — avoidable % removed per Oren
      },
    },
  })),
```

- [ ] **Step 4: Remove avoidable UI from WeighStep.tsx**

1. **Remove the avoidable buttons block** (lines 380-415): The entire `<div className="mb-2">` containing "Of this time, how much could you actually cut?" and the 3 buttons.

2. **Update the waste hours computation in the running total** (lines 72-83): Change `weeklyHrs * (e.avoidablePct / 100)` to just `weeklyHrs`:

```tsx
const totalWaste = useMemo(() => {
  return activeSources.reduce((sum, src) => {
    const e = entries[src.slug];
    if (!e) return sum;
    const effectiveCadence = weighCadence ?? e.cadence;
    const weeklyHrs =
      effectiveCadence === "daily"
        ? e.hoursPerDay * workDaysPerWeek
        : e.hoursPerDay;
    return sum + weeklyHrs;
  }, 0);
}, [activeSources, entries, workDaysPerWeek, weighCadence]);
```

3. **Update handleCompute** (lines 85-137): Same change — remove the `* (e.avoidablePct / 100)` from line 96:

```tsx
const wasteHrs = weeklyHrs; // Raw hours — avoidable % removed
```

4. **Update the card's waste display** (line 299): Change `weeklyHrs * (entry.avoidablePct / 100)` to `weeklyHrs`:

```tsx
const wasteHrs = weeklyHrs;
```

5. **Remove the "First, pick your unit. Then estimate hours and how much is avoidable." subtitle** — update to just:
```tsx
<p style={{ color: "var(--color-ink-soft)" }}>
  Pick your unit, then estimate how many hours each drain takes.
</p>
```

- [ ] **Step 5: Run all tests**

Run: `npx vitest --run`
Expected: All pass. The existing tests for SCORE_FROM_LEVEL and engine logic should still pass because the engine doesn't care about avoidablePct — it receives hours directly.

- [ ] **Step 6: Commit**

```bash
git add src/components/analyzer/WeighStep.tsx src/stores/audit-store.ts src/__tests__/feedback-regression.test.ts
git commit -m "O1: remove avoidable % from WeighStep — Pareto runs on raw hours"
```

---

### Task 13: O9 — Reframe reclaimed time as opportunity

**Files:**
- Create: `src/lib/data/opportunity-frames.ts`
- Modify: `src/components/focus/Payoff.tsx` (add opportunity section after "You could reclaim")
- Test: `src/__tests__/feedback-regression.test.ts`

**Context:** Mona's note: "Make it role-specific and generic. Say someone reclaims 5 hours per week, suggest something like — work on the initiative you know could get you a bonus this quarter. Do web research for potential opportunities by role."

- [ ] **Step 1: Web research — opportunities by role and time tier**

Research what knowledge workers in each role could do with freed-up time. Build a data file with role-specific and generic frames across time tiers.

- [ ] **Step 2: Create `src/lib/data/opportunity-frames.ts`**

```typescript
/**
 * Opportunity frames: what people CAN do with reclaimed time.
 * Role-specific + generic. Sourced from HBR, Cal Newport, Atlassian research.
 */

export interface OpportunityFrame {
  /** Minimum reclaimed hrs/week for this frame to apply */
  minHours: number;
  /** Maximum reclaimed hrs/week (exclusive) */
  maxHours: number;
  /** Generic frame (shown for all roles) */
  generic: string;
  /** Role-specific overrides */
  byRole: Partial<Record<string, string>>;
}

export const OPPORTUNITY_FRAMES: OpportunityFrame[] = [
  {
    minHours: 1,
    maxHours: 3,
    generic: "That's enough for a weekly deep-work block — the kind where real progress happens.",
    byRole: {
      engineering: "That's one focused coding session a week without interruptions — enough to ship a feature.",
      "software-dev": "That's one unbroken coding block — enough to close the PR that's been stuck.",
      marketing: "That's one creative session a week to work on the campaign idea you've been sitting on.",
      sales: "That's 2-3 more quality prospect conversations every week.",
      product: "That's one protected strategy session to think about what's next, not what's broken.",
      design: "That's one exploration session where you sketch without a brief breathing down your neck.",
      "ceo-founder": "That's one weekly block to think about where the company is going, not just what's on fire.",
      manager: "That's one coaching session you keep cancelling because 'something came up.'",
      finance: "That's time to build the dashboard your CFO keeps asking about.",
      operations: "That's time to document the process that only lives in your head.",
    },
  },
  {
    minHours: 3,
    maxHours: 6,
    generic: "That's a half-day back every week. Enough to start the initiative you know could get you a bonus this quarter.",
    byRole: {
      engineering: "That's enough to tackle tech debt that's been slowing the whole team for months.",
      "software-dev": "That's a full afternoon to refactor, learn a new tool, or mentor a junior dev.",
      marketing: "That's enough to run the A/B test you've been 'meaning to get to' for weeks.",
      sales: "That's a full pipeline-building session — the kind that fills next quarter.",
      product: "That's enough to do real user research instead of guessing what customers want.",
      design: "That's enough to build the component library the team has been begging for.",
      "ceo-founder": "That's time to have the strategic conversations that actually move the needle on your next milestone.",
      manager: "That's a full afternoon for the strategic work that got you promoted — not the admin that followed.",
      finance: "That's enough to automate one report that currently takes a whole day every month.",
      operations: "That's time to build the SOPs that would let you actually take a vacation.",
    },
  },
  {
    minHours: 6,
    maxHours: 10,
    generic: "That's almost a full day back every week — like going from a 5-day grind to a 4-day week of real work.",
    byRole: {
      engineering: "That's a full day for architecture work, learning, or the side project that could become a product feature.",
      "software-dev": "That's enough to contribute to open source, prep for a conference talk, or build internal tooling.",
      marketing: "That's a content creation day — the one you need to stop being reactive and start being strategic.",
      sales: "That's an entire day of selling instead of admin. At your close rate, that's real revenue.",
      product: "That's a full discovery day — customer calls, data analysis, and roadmap thinking without Slack interrupting.",
      design: "That's a full creative day. The kind where you do the work you actually got into design to do.",
      "ceo-founder": "That's a full day for the work only you can do — vision, relationships, the decisions no one else will make.",
      manager: "That's enough to be a real leader instead of a human router for other people's problems.",
      finance: "That's enough time to move from reactive reporting to proactive financial planning.",
      operations: "That's a full process improvement day every week — the ROI compounds fast.",
    },
  },
  {
    minHours: 10,
    maxHours: Infinity,
    generic: "That's more than a full work day every week — you're essentially getting a sixth day of productive time.",
    byRole: {
      engineering: "That's two full days of focused engineering. Most teams would kill for that kind of capacity.",
      "software-dev": "That's enough to learn an entirely new stack, or ship the internal tool everyone wishes existed.",
      marketing: "That's enough to launch the channel or campaign you keep putting off because 'there's no bandwidth.'",
      sales: "That's 10+ more hours of selling per week. Do the math on your average deal size.",
      product: "That's enough to actually be strategic. Customer research, competitor analysis, long-term planning — all the stuff that gets squeezed out.",
      design: "That's two design sprints worth of focus time every single week.",
      "ceo-founder": "That's two full days a week for the work that actually builds enterprise value. Stop doing everyone else's job.",
      manager: "That's enough to transform your team's culture — coaching, 1:1s, strategy — the stuff that gets results.",
      finance: "That's enough to build real financial models and scenario plans, not just reconcile last month.",
      operations: "That's a transformation-level capacity unlock. Use it to rebuild the system, not just patch it.",
    },
  },
];

/**
 * Get the best opportunity frame for a given number of reclaimed hours and optional role.
 */
export function getOpportunityFrame(
  reclaimedHoursPerWeek: number,
  roleSlug?: string | null,
): { generic: string; roleSpecific: string | null } {
  const frame = OPPORTUNITY_FRAMES.find(
    (f) => reclaimedHoursPerWeek >= f.minHours && reclaimedHoursPerWeek < f.maxHours,
  );
  if (!frame) {
    return { generic: "", roleSpecific: null };
  }
  return {
    generic: frame.generic,
    roleSpecific: roleSlug ? (frame.byRole[roleSlug] ?? null) : null,
  };
}
```

- [ ] **Step 3: Add opportunity section to Payoff.tsx**

In `Payoff.tsx`, after the "That adds up to" section (around line 263, before the `</>` closing tag of the `hasReclaimable` block), add:

```tsx
{/* Opportunity reframe — what you CAN do */}
{(() => {
  const { generic, roleSpecific } = getOpportunityFrame(reclaimableWeekly, roleSlug);
  if (!generic) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-8 text-center p-6 rounded-xl"
      style={{ backgroundColor: "rgba(196, 24, 106, 0.04)" }}
    >
      <div className="text-sm font-medium mb-2" style={{ color: "var(--color-reclaim)" }}>
        What could you do with that time?
      </div>
      {roleSpecific && (
        <p
          className="text-base font-semibold mb-3"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
            color: "var(--color-ink)",
          }}
        >
          {roleSpecific}
        </p>
      )}
      <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {generic}
      </p>
    </motion.div>
  );
})()}
```

Also add the import at the top of Payoff.tsx:
```typescript
import { getOpportunityFrame } from "@/lib/data/opportunity-frames";
```

And get `roleSlug` from the store:
```typescript
const roleSlug = useAuditStore((s) => s.roleSlug);
```

- [ ] **Step 4: Write regression test**

```typescript
it("[S9-O9] Payoff shows opportunity framing", () => {
  expect(
    fileContains("components/focus/Payoff.tsx", "What could you do with that time")
  ).toBe(true);
  expect(
    fileContains("components/focus/Payoff.tsx", "getOpportunityFrame")
  ).toBe(true);
});

it("[S9-O9] opportunity-frames.ts has role-specific frames", () => {
  const content = readSrc("lib/data/opportunity-frames.ts");
  expect(content).toContain("engineering");
  expect(content).toContain("ceo-founder");
  expect(content).toContain("marketing");
  expect(content).toContain("minHours");
});
```

- [ ] **Step 5: Run full suite, commit**

```bash
git add src/lib/data/opportunity-frames.ts src/components/focus/Payoff.tsx src/__tests__/feedback-regression.test.ts
git commit -m "O9: reframe reclaimed time as opportunity — role-specific + generic tiers"
```

---

### Task 14: O3 — Double Pareto (Two-Pass Wizard)

**Files:**
- Modify: `src/components/analyzer/IntakeStep.tsx` (becomes Pass 1: broad categories)
- Create: `src/components/analyzer/DrilldownStep.tsx` (Pass 2: detail within vital few)
- Modify: `src/components/analyzer/AuditWizard.tsx` (add new step in flow)
- Modify: `src/stores/audit-store.ts` (add `categoryEstimates` and `vitalCategories` state)
- Test: `src/__tests__/feedback-regression.test.ts`

**Architecture:**
The current 5-step flow is: Role → Context → Intake (select sources) → Weigh (estimate all) → Results.

The new flow is: Role → Context → **CategoryWeigh** (broad categories + rough hours) → **Drilldown** (detail the vital few) → Results.

- **Pass 1 (CategoryWeigh):** User sees the pain prompt cards from IntakeStep, but instead of checking individual sources, they give a rough hour estimate per category. The engine runs a mini-Pareto on these categories to find the vital few (top ~3 that account for 80% of waste).
- **Pass 2 (Drilldown):** Only the vital few categories are shown. User checks specific sources within those and gives detailed hours per source. This feeds the full Pareto engine.

This dramatically reduces cognitive load — instead of weighing 15+ sources, the user weighs 5-7 categories, then drills into 2-3 of them.

- [ ] **Step 1: Add category estimation state to audit-store.ts**

Add new fields to the store:

```typescript
// In AuditState interface:
categoryEstimates: Record<string, number>; // group name -> rough hrs/week
vitalCategories: string[]; // group names that survived Pass 1

// Actions:
setCategoryEstimate: (group: string, hours: number) => void;
setVitalCategories: (groups: string[]) => void;
```

Default values:
```typescript
categoryEstimates: {},
vitalCategories: [],
```

Implementations:
```typescript
setCategoryEstimate: (group, hours) =>
  set((state) => ({
    categoryEstimates: { ...state.categoryEstimates, [group]: hours },
  })),
setVitalCategories: (groups) =>
  set({ vitalCategories: groups }),
```

Add both to the `resetSession` action and the `partialize` persist config.

- [ ] **Step 2: Convert IntakeStep into CategoryWeigh (Pass 1)**

The current IntakeStep shows pain prompts with expandable source checkboxes. Transform it:

1. **Remove individual source checkboxes.** Each pain card now has a simple hour slider instead.
2. **Header changes:** "What drains your week?" → "Where does your time go?" with subtext "Give a rough estimate for each category. Don't overthink it — we'll zoom into the big ones next."
3. **Each pain card shows:** emoji + prompt text + a small hour input (hrs/week).
4. **Running total** at top (same as current WeighStep).
5. **On "Continue":** Run a mini-Pareto on the category estimates. The top categories that cover ~80% of total waste become `vitalCategories`. Store them and advance.

The mini-Pareto logic:
```typescript
function findVitalCategories(
  estimates: Record<string, number>,
  threshold = 0.8
): string[] {
  const sorted = Object.entries(estimates)
    .filter(([, hrs]) => hrs > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, h]) => s + h, 0);
  if (total === 0) return sorted.map(([g]) => g);
  let running = 0;
  const vital: string[] = [];
  for (const [group, hrs] of sorted) {
    vital.push(group);
    running += hrs;
    if (running / total >= threshold) break;
  }
  return vital;
}
```

- [ ] **Step 3: Create DrilldownStep.tsx (Pass 2)**

This step shows **only** the vital categories from Pass 1. For each vital category:
- Show the category name + the rough hours estimate from Pass 1
- Expand the specific waste sources within that category (using `groupWasteSources`)
- User checks specific sources and gives detailed hours per source (like the current WeighStep cards, but only for these categories)

The user-facing copy: "These are your biggest time drains. Now let's get specific — which exact tasks within these are eating your week?"

The "Continue" button runs the full Pareto engine on the detailed entries (same as current `handleCompute` in WeighStep).

```tsx
// src/components/analyzer/DrilldownStep.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import {
  wasteSourcesForRole,
  groupWasteSources,
  type WasteSource,
} from "@/lib/data/waste-sources";
import type { RoleSlug } from "@/lib/data/benchmarks";
import { runAudit, type ChainEntry } from "@/lib/engine/audit-logic";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface DrilldownStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function DrilldownStep({ onNext, onBack }: DrilldownStepProps) {
  const vitalCategories = useAuditStore((s) => s.vitalCategories);
  const categoryEstimates = useAuditStore((s) => s.categoryEstimates);
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const secondaryRoles = useAuditStore((s) => s.secondaryRoles);
  const activeSources = useAuditStore((s) => s.activeSources);
  const addSource = useAuditStore((s) => s.addSource);
  const removeSource = useAuditStore((s) => s.removeSource);
  const entries = useAuditStore((s) => s.entries);
  const setEntry = useAuditStore((s) => s.setEntry);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);
  const workDaysPerWeek = useAuditStore((s) => s.workDaysPerWeek);
  const payMode = useAuditStore((s) => s.payMode);
  const salary = useAuditStore((s) => s.salary);
  const hourlyRate = useAuditStore((s) => s.hourlyRate);
  const setParetoResult = useAuditStore((s) => s.setParetoResult);

  // Get sources grouped, filtered to vital categories only
  const allSources = useMemo(() => {
    if (!roleSlug) return [];
    const primary = wasteSourcesForRole(roleSlug as RoleSlug);
    if (secondaryRoles.length === 0) return primary;
    const seen = new Set(primary.map((s) => s.slug));
    const merged = [...primary];
    for (const sr of secondaryRoles) {
      for (const src of wasteSourcesForRole(sr)) {
        if (!seen.has(src.slug)) {
          seen.add(src.slug);
          merged.push(src);
        }
      }
    }
    return merged;
  }, [roleSlug, secondaryRoles]);

  const vitalGroups = useMemo(() => {
    const grouped = groupWasteSources(allSources);
    return grouped.filter((g) => vitalCategories.includes(g.group));
  }, [allSources, vitalCategories]);

  const activeSet = useMemo(
    () => new Set(activeSources.map((s) => s.slug)),
    [activeSources],
  );

  const toggleSource = (source: WasteSource) => {
    if (activeSet.has(source.slug)) {
      removeSource(source.slug);
    } else {
      addSource(source);
    }
  };

  const handleCompute = () => {
    const chainEntries: ChainEntry[] = activeSources.reduce<ChainEntry[]>(
      (acc, src) => {
        const e = entries[src.slug];
        if (!e) return acc;
        const weeklyHrs = e.hoursPerDay; // Already weekly (cadence handled upstream)
        acc.push({
          slug: src.slug,
          label: src.label,
          hours: weeklyHrs,
          cadence: "week",
          whatCounts: src.whatCounts,
          isCustom: src.slug.startsWith("custom-"),
        });
        return acc;
      },
      [],
    );

    const result = runAudit({
      entries: chainEntries,
      workWeek: workHoursPerWeek,
      workDays: workDaysPerWeek,
      payMode: payMode === "salary" ? "salary" : "hourly",
      salary,
      hourly: hourlyRate,
      benchmarkMap: new Map(),
    });

    setParetoResult(result);
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Let's zoom into the big ones
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          These categories eat most of your week. Check the specific drains and estimate hours for each.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {vitalGroups.map((group) => (
          <div key={group.group} className="surface-card p-6" style={{ borderLeft: "4px solid var(--color-waste)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base" style={{ color: "var(--color-ink)" }}>
                {group.group}
              </h3>
              <span className="text-xs font-figures font-bold px-2 py-1 rounded"
                style={{ backgroundColor: "rgba(224, 62, 18, 0.08)", color: "var(--color-waste)" }}>
                ~{(categoryEstimates[group.group] ?? 0).toFixed(0)} hrs/wk
              </span>
            </div>

            <div className="space-y-2">
              {group.sources.map((source) => {
                const isActive = activeSet.has(source.slug);
                const entry = entries[source.slug];
                return (
                  <div key={source.slug}>
                    <label className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.03)]">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleSource(source)}
                        className="mt-0.5 w-4.5 h-4.5 rounded accent-[var(--color-waste)] flex-shrink-0"
                      />
                      <span className="flex-shrink-0 text-base" aria-hidden="true">{source.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                          {source.label}
                        </span>
                        <span className="text-xs block mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
                          {source.whatCounts}
                        </span>
                      </div>
                    </label>

                    {/* Hours input — only for checked sources */}
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="ml-12 mt-1 mb-2 flex items-center gap-2"
                      >
                        <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>hrs/week:</span>
                        <input
                          type="number"
                          min={0}
                          max={workHoursPerWeek}
                          step={0.25}
                          value={entry?.hoursPerDay || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setEntry(source.slug, { hoursPerDay: Math.max(0, val), avoidablePct: 100, cadence: "weekly" });
                          }}
                          className="w-16 text-right text-sm font-bold font-figures bg-transparent border-b-2 focus:outline-none px-1 py-0.5"
                          style={{ borderColor: "var(--color-waste)", color: "var(--color-ink)" }}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}>
          ← Back
        </button>
        <ShimmerButton
          disabled={activeSources.length === 0}
          onClick={handleCompute}
          borderRadius="12px"
          className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <AnimatedEmoji emoji="🤯" animation="pop" size="sm" />
            See your results
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update AuditWizard step flow**

Read `src/components/analyzer/AuditWizard.tsx` and update the step sequence:
- Step 0: RoleStep
- Step 1: ContextStep
- Step 2: IntakeStep (now CategoryWeigh — rough hours per category)
- Step 3: DrilldownStep (NEW — specific sources for vital few only)
- Step 4: ResultsView

The `step` number in the store increments through these. Add DrilldownStep import and render it at the appropriate step.

- [ ] **Step 5: Convert IntakeStep to category-level estimation**

In IntakeStep.tsx:
1. Remove individual source checkboxes and replace with a per-card hour input
2. Each pain prompt card now has a small "hrs/week" number input
3. The "Continue" button calculates vital categories (80% threshold) and stores them
4. Header: "Where does your time go?" / "Give a rough estimate per category. We'll zoom into the big ones next."
5. Running total at top

Key changes:
- Remove `toggleSource`, `activeSet`, source checkboxes
- Add `setCategoryEstimate` from store
- Add `setVitalCategories` from store
- On continue: compute vital categories, call `setVitalCategories`, call `onNext`

- [ ] **Step 6: Write regression tests**

```typescript
it("[S9-O3] IntakeStep has category-level hour estimation", () => {
  const content = readSrc("components/analyzer/IntakeStep.tsx");
  expect(content).toContain("setCategoryEstimate");
  expect(content).toContain("Where does your time go");
});

it("[S9-O3] DrilldownStep exists and shows vital categories", () => {
  const content = readSrc("components/analyzer/DrilldownStep.tsx");
  expect(content).toContain("vitalCategories");
  expect(content).toContain("zoom into the big ones");
});

it("[S9-O3] audit-store has categoryEstimates and vitalCategories", () => {
  const content = readSrc("stores/audit-store.ts");
  expect(content).toContain("categoryEstimates");
  expect(content).toContain("vitalCategories");
});
```

- [ ] **Step 7: Run full suite, commit**

```bash
git add src/components/analyzer/IntakeStep.tsx src/components/analyzer/DrilldownStep.tsx src/components/analyzer/AuditWizard.tsx src/stores/audit-store.ts src/__tests__/feedback-regression.test.ts
git commit -m "O3: double Pareto — two-pass wizard (category estimate → drilldown vital few)"
```

---

## Post-Implementation

After all 14 tasks are done:

1. Run `npx tsc --noEmit` — zero errors
2. Run `npx vitest --run` — all tests pass (should be ~260+)
3. Run `bash .claude/hooks/verify-done.sh` — all checks pass
4. Run `npx next build` — clean build
5. Spawn QA agent with the full checklist (CODE + VISUAL items)
6. Commit and push to deploy
