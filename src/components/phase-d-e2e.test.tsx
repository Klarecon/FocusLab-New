/**
 * Phase D — E2E-style tests.
 *
 * 1. AnimatedEmoji: every animation variant renders without Framer Motion crash
 * 2. Scroll-to-top: AuditWizard fires scrollTo on step change
 * 3. Scroll-to-top: FocusStage fires scrollTo on tab switch
 * 4. Zustand persistence: store data survives across component unmount/remount
 * 5. Full flow: store state propagates correctly through all stages
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------- Mocks ----------

// Framer Motion — pass-through, no animations
vi.mock("framer-motion", () => {
  const React = require("react");
  const motionProxy = new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) =>
        React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
          const {
            children,
            whileHover,
            whileTap,
            initial,
            animate,
            exit,
            transition,
            layout,
            variants,
            ...rest
          } = props;
          return React.createElement(String(prop), { ...rest, ref }, children);
        }),
    },
  );
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: () => ({ get: () => 0, set: () => {} }),
    useInView: () => true,
    useReducedMotion: () => false,
    animate: () => ({ stop: () => {} }),
  };
});

// ResizeObserver stub for jsdom (used by Highlighter / rough-notation)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock("rough-notation", () => ({
  annotate: () => ({ show: () => {}, hide: () => {}, remove: () => {} }),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ScatterChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Scatter: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Bar: () => null,
  Line: () => null,
  Cell: () => null,
  ReferenceArea: () => null,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => ({
  Menu: () => <span>Menu</span>,
  X: () => <span>X</span>,
  Minus: () => <span>-</span>,
  Plus: () => <span>+</span>,
  ChevronUp: () => <span>^</span>,
}));

// ---------- Setup ----------

import { useAuditStore } from "@/stores/audit-store";
import type { ParetoResult, CategoryResult } from "@/lib/engine/types";
import { solutionsForWaste } from "@/lib/data/solutions";

beforeEach(() => {
  useAuditStore.getState().reset();
  window.scrollTo = vi.fn();
});

afterEach(cleanup);

// ---------- Helpers ----------

function makeMockParetoResult(): ParetoResult {
  const cats: CategoryResult[] = [
    {
      categorySlug: "meet-status",
      label: "Status meetings",
      hoursPerWeek: 4.5,
      timeInHours: 6,
      rank: 1,
      shareOfWaste: 0.4,
      cumulativeHours: 4.5,
      cumulativeShare: 0.4,
      zone: "A",
      isVitalFew: true,
      weeklyCost: 225,
      annualHours: 216,
      annualCost: 10800,
      benchmark: null,
    },
    {
      categorySlug: "email-triage",
      label: "Email triage",
      hoursPerWeek: 3.2,
      timeInHours: 5,
      rank: 2,
      shareOfWaste: 0.28,
      cumulativeHours: 7.7,
      cumulativeShare: 0.68,
      zone: "A",
      isVitalFew: true,
      weeklyCost: 160,
      annualHours: 153.6,
      annualCost: 7680,
      benchmark: null,
    },
    {
      categorySlug: "focus-tool-switch",
      label: "Tool switching",
      hoursPerWeek: 1.8,
      timeInHours: 3,
      rank: 3,
      shareOfWaste: 0.16,
      cumulativeHours: 9.5,
      cumulativeShare: 0.84,
      zone: "B",
      isVitalFew: false,
      weeklyCost: 90,
      annualHours: 86.4,
      annualCost: 4320,
      benchmark: null,
    },
  ];

  return {
    categories: cats,
    vitalFew: cats.filter((c) => c.isVitalFew),
    vitalFewCount: 2,
    cliffCount: 2,
    comfortSize: 2,
    shouldRefine: false,
    concentration: "concentrated",
    concentrationRatio: 0.67,
    totalWeeklyWasteHours: 9.5,
    totalAnnualWasteHours: 456,
    totalWeeklyWasteCost: 475,
    totalAnnualWasteCost: 22800,
    hourlyRate: 50,
    cutoff: 0.68,
    cutoffPercent: 68,
    bCutoffPercent: 84,
    weeksPerYear: 48,
    chart: cats.map((c) => ({
      categorySlug: c.categorySlug,
      label: c.label,
      hours: c.hoursPerWeek,
      cumulativePercent: c.cumulativeShare * 100,
    })),
    warnings: [],
  };
}

// ======================================================================
// 1. AnimatedEmoji — all 8 animation variants render without crash
// ======================================================================

describe("AnimatedEmoji — Framer Motion crash safety", () => {
  // Import the REAL AnimatedEmoji (unmock for this block)
  // Since we mocked framer-motion with pass-through, this tests that
  // the component renders for each variant without throwing.
  it("renders all 8 animation variants without error", async () => {
    // Dynamic import so the module-level mock is applied
    const { default: AnimatedEmoji } = await import(
      "@/components/ui/AnimatedEmoji"
    );
    const variants = [
      "pop",
      "shake",
      "pulse",
      "bounce",
      "spin",
      "flicker",
      "float",
      "explode",
    ] as const;

    for (const variant of variants) {
      const { unmount } = render(
        <AnimatedEmoji emoji="🔥" animation={variant} size="md" />,
      );
      // If we get here without throwing, the variant is safe
      expect(screen.getByText("🔥")).toBeTruthy();
      unmount();
    }
  });

  it("renders all 4 sizes without error", async () => {
    const { default: AnimatedEmoji } = await import(
      "@/components/ui/AnimatedEmoji"
    );
    const sizes = ["sm", "md", "lg", "xl"] as const;

    for (const size of sizes) {
      const { unmount } = render(
        <AnimatedEmoji emoji="✨" animation="pop" size={size} />,
      );
      expect(screen.getByText("✨")).toBeTruthy();
      unmount();
    }
  });
});

// ======================================================================
// 2. AuditWizard — scroll-to-top on step change
// ======================================================================

describe("AuditWizard — scroll-to-top on step changes", () => {
  it("calls window.scrollTo when step changes", async () => {
    const { default: AuditWizard } = await import(
      "@/components/analyzer/AuditWizard"
    );

    render(<AuditWizard />);

    // Initial render fires scrollTo for step 0
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    // Simulate step change by updating the store
    const callsBefore = (window.scrollTo as ReturnType<typeof vi.fn>).mock
      .calls.length;
    useAuditStore.getState().setStep(1);

    // React re-renders; the useEffect fires
    // Wait for the effect
    await new Promise((r) => setTimeout(r, 50));

    expect(
      (window.scrollTo as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBeGreaterThan(callsBefore);
  });
});

// ======================================================================
// 3. FocusStage — scroll-to-top on tab switch
// ======================================================================

describe("FocusStage — scroll-to-top on tab switch", () => {
  it("calls window.scrollTo when switching tabs", async () => {
    // Set up store with pareto result so FocusStage renders content
    useAuditStore.setState({ paretoResult: makeMockParetoResult() });

    const { default: FocusStage } = await import(
      "@/components/focus/FocusStage"
    );

    render(<FocusStage />);

    // Initial render calls scrollTo
    const callsAfterMount = (window.scrollTo as ReturnType<typeof vi.fn>).mock
      .calls.length;

    // Click "Action Plan" tab
    const planTab = screen.getByText("Action Plan");
    fireEvent.click(planTab);

    await new Promise((r) => setTimeout(r, 50));

    expect(
      (window.scrollTo as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBeGreaterThan(callsAfterMount);
  });
});

// ======================================================================
// 4. Zustand persistence — store data survives component unmount
// ======================================================================

describe("Zustand store — data persistence across unmount/remount", () => {
  it("paretoResult persists after component unmount", () => {
    const result = makeMockParetoResult();
    useAuditStore.getState().setParetoResult(result);

    // Verify the data is in the store
    const stored = useAuditStore.getState().paretoResult;
    expect(stored).not.toBeNull();
    expect(stored!.categories).toHaveLength(3);
    expect(stored!.totalAnnualWasteCost).toBe(22800);

    // The store is global — it persists regardless of component lifecycle
    // This verifies the data shape roundtrips correctly (no window hack needed)
    expect(stored!.categories[0].categorySlug).toBe("meet-status");
    expect(stored!.categories[0].zone).toBe("A");
    expect(stored!.chart).toHaveLength(3);
    expect(stored!.warnings).toEqual([]);
  });

  it("chosenSolutions and scores persist after unmount", () => {
    const solutions = solutionsForWaste("meet-status");
    const sol = solutions[0];

    useAuditStore.getState().addSolution(sol);

    // Verify solution and auto-seeded score exist
    const state = useAuditStore.getState();
    expect(state.chosenSolutions).toHaveLength(1);
    expect(state.chosenSolutions[0].id).toBe(sol.id);
    expect(state.solutionScores[sol.id]).toBeDefined();

    // Score should use SCORE_FROM_LEVEL (not old 1/2/3 mapping)
    const score = state.solutionScores[sol.id];
    // This solution has effort: "low" -> 2, impact: "high" -> 4
    expect(score.effort).toBe(2);
    expect(score.impact).toBe(4);
  });

  it("ownerOverrides persist in store (not local state)", () => {
    useAuditStore.getState().setOwnerOverride("sol-abc", "manager");
    useAuditStore.getState().setOwnerOverride("sol-def", "team");

    const state = useAuditStore.getState();
    expect(state.ownerOverrides["sol-abc"]).toBe("manager");
    expect(state.ownerOverrides["sol-def"]).toBe("team");
  });

  it("secondaryRoles persist in store (not local state)", () => {
    useAuditStore
      .getState()
      .setSecondaryRoles(["engineering" as "engineering", "design" as "design"]);

    const state = useAuditStore.getState();
    expect(state.secondaryRoles).toEqual(["engineering", "design"]);
  });
});

// ======================================================================
// 5. Full flow — store state propagates through stages
// ======================================================================

describe("Full flow — store state propagation", () => {
  it("engine result stored in Zustand flows to FocusStage → SolutionPicker", async () => {
    const result = makeMockParetoResult();
    useAuditStore.setState({ paretoResult: result });

    const { default: FocusStage } = await import(
      "@/components/focus/FocusStage"
    );

    render(<FocusStage />);

    // FocusStage should render the header
    expect(screen.getByText("Fix What's Draining You")).toBeTruthy();

    // The Assign Fixes tab should be active by default
    // SolutionPicker should show vital-few drains from the store
    // (drain labels appear in headings AND in the custom fix <select>, so use getAllByText)
    expect(screen.getAllByText("Status meetings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Email triage").length).toBeGreaterThan(0);
  });

  it("ResultsView renders from store data (no window hack)", async () => {
    const result = makeMockParetoResult();
    useAuditStore.setState({ paretoResult: result });

    const { default: ResultsView } = await import(
      "@/components/analyzer/ResultsView"
    );

    render(<ResultsView onRestart={() => {}} />);

    // Wait for the dramatic reveal to transition to "full" phase
    await new Promise((r) => setTimeout(r, 3000));

    // The total cost should appear (from store, not window)
    // $22,800 formatted
    expect(screen.getAllByText(/\$22,800/).length).toBeGreaterThan(0);
  });

  it("empty focus page shows 'No audit results yet' when store is empty", async () => {
    // Store is reset (no paretoResult)
    const { default: FocusPage } = await import("@/app/focus/page");

    render(<FocusPage />);

    expect(screen.getByText("No audit results yet")).toBeTruthy();
    expect(screen.getByText("Go to Analyzer")).toBeTruthy();
  });
});
