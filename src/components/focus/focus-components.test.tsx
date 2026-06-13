import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before component imports
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        const React = require("react");
        return React.forwardRef((props: any, ref: any) => {
          const {
            children,
            whileHover,
            whileTap,
            initial,
            animate,
            exit,
            transition,
            layout,
            ...rest
          } = props;
          const Tag = String(prop);
          return React.createElement(Tag, { ...rest, ref }, children);
        });
      },
    },
  ),
  AnimatePresence: ({ children }: any) => children,
  useMotionValue: () => ({ get: () => 0, set: () => {} }),
  useInView: () => true,
  useReducedMotion: () => false,
  animate: () => ({ stop: () => {} }),
}));

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
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  ScatterChart: ({ children }: any) => <div>{children}</div>,
  Scatter: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Cell: () => null,
  ReferenceArea: () => null,
  ReferenceLine: () => null,
}));

vi.mock("@/components/ui/AnimatedEmoji", () => ({
  default: ({ emoji }: { emoji: string }) => <span>{emoji}</span>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import SolutionPicker from "@/components/focus/SolutionPicker";
import FocusTable from "@/components/focus/FocusTable";
import EviMatrix from "@/components/focus/EviMatrix";
import Payoff from "@/components/focus/Payoff";
import { useAuditStore } from "@/stores/audit-store";
import { solutionsForWaste } from "@/lib/data/solutions";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const mockVitalFew = [
  {
    slug: "meet-status",
    label: "Status meetings",
    hoursPerWeek: 4.5,
    zone: "A" as const,
  },
  {
    slug: "email-triage",
    label: "Email triage",
    hoursPerWeek: 3.2,
    zone: "A" as const,
  },
];

const mockUsefulMany = [
  {
    slug: "focus-tool-switch",
    label: "Tool switching",
    hoursPerWeek: 1.8,
    zone: "B" as const,
  },
];

const noop = () => {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// jsdom does not implement window.scrollTo
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });

function resetStore() {
  useAuditStore.setState({
    chosenSolutions: [],
    solutionScores: {},
    ownerOverrides: {},
    salary: 0,
    hourlyRate: 0,
    payMode: "salary",
    workHoursPerWeek: 45,
    workDaysPerWeek: 5,
    paretoResult: null,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

afterEach(cleanup);

describe("SolutionPicker", () => {
  beforeEach(resetStore);

  it("renders all vital-few drains", () => {
    render(
      <SolutionPicker
        vitalFew={mockVitalFew}
        usefulMany={mockUsefulMany}
        onGoToPlan={noop}
      />,
    );

    // Labels appear in both the drain heading and the custom-fix <select>,
    // so use getAllByText and verify at least one match each.
    expect(screen.getAllByText("Status meetings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Email triage").length).toBeGreaterThan(0);
  });

  it("shows drains with no solutions", () => {
    const noMatchDrain = [
      {
        slug: "nonexistent-drain",
        label: "Mystery drain",
        hoursPerWeek: 2.0,
        zone: "A" as const,
      },
    ];

    render(
      <SolutionPicker
        vitalFew={noMatchDrain}
        usefulMany={[]}
        onGoToPlan={noop}
      />,
    );

    expect(screen.getByText(/don't have pre-built fixes/)).toBeInTheDocument();
  });

  it("adding a solution updates store", () => {
    render(
      <SolutionPicker
        vitalFew={mockVitalFew}
        usefulMany={mockUsefulMany}
        onGoToPlan={noop}
      />,
    );

    // Find the first solution card button (SolutionCard is a <button>)
    const meetingSolutions = solutionsForWaste("meet-status");
    expect(meetingSolutions.length).toBeGreaterThan(0);

    const firstSolutionTitle = meetingSolutions[0].title;
    // The same solution may appear under multiple drain sections if slugs overlap
    const matches = screen.getAllByText(firstSolutionTitle);
    const button = matches[0].closest("button");
    expect(button).toBeTruthy();
    fireEvent.click(button!);

    expect(useAuditStore.getState().chosenSolutions.length).toBeGreaterThan(0);
  });
});

describe("FocusTable", () => {
  beforeEach(resetStore);

  it("renders chosen solutions", () => {
    const meetingSolutions = solutionsForWaste("meet-status");
    const sol = meetingSolutions[0];
    useAuditStore.getState().addSolution(sol);

    render(
      <FocusTable vitalFew={mockVitalFew} usefulMany={mockUsefulMany} />,
    );

    // Title appears in both the desktop table row and the mobile card
    expect(screen.getAllByText(sol.title).length).toBeGreaterThan(0);
  });

  it("owner cycling persists in store", () => {
    const meetingSolutions = solutionsForWaste("meet-status");
    const sol = meetingSolutions[0];
    // sol.owner is "team" for the first meeting solution
    useAuditStore.getState().addSolution(sol);

    render(
      <FocusTable vitalFew={mockVitalFew} usefulMany={mockUsefulMany} />,
    );

    // The owner button shows the default owner label (Team for this solution).
    // Both desktop table and mobile card render it, so use getAllByText.
    const ownerButtons = screen.getAllByText("My team");
    expect(ownerButtons.length).toBeGreaterThan(0);
    const ownerButton = ownerButtons[0].closest("button");
    expect(ownerButton).toBeTruthy();
    fireEvent.click(ownerButton!);

    // Cycling from "team" -> next owner in the OWNERS array
    const overrides = useAuditStore.getState().ownerOverrides;
    expect(overrides[sol.id]).toBeDefined();
  });

  it("empty state", () => {
    render(
      <FocusTable vitalFew={mockVitalFew} usefulMany={mockUsefulMany} />,
    );

    // FocusTable renders both a desktop table and mobile cards, so the empty
    // message may appear once (single early-return).
    // Use getAllByText since there could be duplicates in the mock DOM.
    const matches = screen.getAllByText(/No fixes here yet/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe("EviMatrix", () => {
  beforeEach(resetStore);

  it("empty state", () => {
    render(
      <EviMatrix vitalFew={mockVitalFew} usefulMany={mockUsefulMany} />,
    );

    const matches = screen.getAllByText(/Nothing to map yet/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe("Payoff", () => {
  beforeEach(resetStore);

  it("shows reclaimable numbers", () => {
    const meetingSolutions = solutionsForWaste("meet-status");
    useAuditStore.getState().addSolution(meetingSolutions[0]);

    render(
      <Payoff vitalFew={mockVitalFew} usefulMany={mockUsefulMany} />,
    );

    expect(screen.getByText(/You could reclaim/)).toBeInTheDocument();
  });

  it("shows no-pay-info note when no salary set", () => {
    const meetingSolutions = solutionsForWaste("meet-status");
    useAuditStore.getState().addSolution(meetingSolutions[0]);

    render(
      <Payoff vitalFew={mockVitalFew} usefulMany={mockUsefulMany} />,
    );

    const fallbackMatches = screen.getAllByText(/add your pay info/i);
    expect(fallbackMatches.length).toBeGreaterThan(0);
  });

  it('"Start with quick win" calls onGoToAssign', () => {
    const spy = vi.fn();
    const meetingSolutions = solutionsForWaste("meet-status");
    useAuditStore.getState().addSolution(meetingSolutions[0]);

    render(
      <Payoff
        vitalFew={mockVitalFew}
        usefulMany={mockUsefulMany}
        onGoToAssign={spy}
      />,
    );

    // The CTA text is inside a <span> within the <button>
    const ctaSpan = screen.getByText((content, element) => {
      return element?.tagName === "SPAN" && /Start with your/.test(content);
    });
    const ctaButton = ctaSpan.closest("button");
    expect(ctaButton).not.toBeNull();
    fireEvent.click(ctaButton!);

    expect(spy).toHaveBeenCalled();
  });
});
