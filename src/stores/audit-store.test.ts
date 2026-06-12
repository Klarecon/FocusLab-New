import { describe, it, expect, beforeEach } from "vitest";
import { useAuditStore } from "@/stores/audit-store";
import { SCORE_FROM_LEVEL, isQuickWinScore } from "@/lib/engine/solutions-logic";
import type { ParetoResult, CategoryResult } from "@/lib/engine/types";
import type { Solution } from "@/lib/data/solutions";

beforeEach(() => {
  useAuditStore.getState().reset();
});

// ---------------------------------------------------------------------------
// 1. Quick-win seeding
// ---------------------------------------------------------------------------
describe("Quick-win seeding via addSolution", () => {
  it("seeds effort=2, impact=4 for a low-effort high-impact solution", () => {
    const sol: Solution = {
      id: "test-qw",
      wasteSlugs: ["meet-not-needed"],
      title: "Test quick win",
      description: "A test solution",
      effort: "low",
      impact: "high",
      reclaimHint: "~1 hr",
      owner: "self",
      source: { name: "Test", url: "https://example.com" },
    };

    useAuditStore.getState().addSolution(sol);

    const scores = useAuditStore.getState().solutionScores["test-qw"];
    expect(scores.effort).toBe(SCORE_FROM_LEVEL["low"]); // 2
    expect(scores.impact).toBe(SCORE_FROM_LEVEL["high"]); // 4
    expect(scores.effort).toBe(2);
    expect(scores.impact).toBe(4);
    expect(isQuickWinScore(scores.effort as 1 | 2 | 3 | 4 | 5, scores.impact as 1 | 2 | 3 | 4 | 5)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. ParetoResult type unification
// ---------------------------------------------------------------------------
describe("ParetoResult type unification", () => {
  it("stores and retrieves a ParetoResult with categories directly", () => {
    const mockCategory: CategoryResult = {
      categorySlug: "meet-status",
      label: "Status meetings",
      hoursPerWeek: 5,
      timeInHours: 8,
      rank: 1,
      shareOfWaste: 0.5,
      cumulativeHours: 5,
      cumulativeShare: 0.5,
      zone: "A",
      isVitalFew: true,
      weeklyCost: 250,
      annualHours: 240,
      annualCost: 12000,
      benchmark: null,
    };

    const mockResult: ParetoResult = {
      categories: [mockCategory],
      vitalFew: [mockCategory],
      vitalFewCount: 1,
      cliffCount: 1,
      comfortSize: 3,
      shouldRefine: false,
      concentration: "concentrated",
      concentrationRatio: 1,
      totalWeeklyWasteHours: 10,
      totalAnnualWasteHours: 480,
      totalWeeklyWasteCost: 500,
      totalAnnualWasteCost: 24000,
      hourlyRate: 50,
      cutoff: 0.8,
      cutoffPercent: 80,
      bCutoffPercent: 95,
      weeksPerYear: 48,
      chart: [{ categorySlug: "meet-status", label: "Status meetings", hours: 5, cumulativePercent: 50 }],
      warnings: [],
    };

    useAuditStore.getState().setParetoResult(mockResult);

    const stored = useAuditStore.getState().paretoResult;
    expect(stored).not.toBeNull();
    expect(stored!.categories).toHaveLength(1);
    expect(stored!.categories[0].categorySlug).toBe("meet-status");
    expect(stored!.categories[0].zone).toBe("A");
    expect(stored!.categories[0].isVitalFew).toBe(true);
    expect(stored!.vitalFew).toHaveLength(1);
    expect(stored!.chart).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 3. Secondary roles persistence
// ---------------------------------------------------------------------------
describe("Secondary roles persistence", () => {
  it("stores and updates secondary roles", () => {
    useAuditStore.getState().setSecondaryRoles(["engineering", "design"] as any);
    expect(useAuditStore.getState().secondaryRoles).toEqual(["engineering", "design"]);

    useAuditStore.getState().setSecondaryRoles(["engineering"] as any);
    expect(useAuditStore.getState().secondaryRoles).toEqual(["engineering"]);
  });
});

// ---------------------------------------------------------------------------
// 4. Owner overrides persistence
// ---------------------------------------------------------------------------
describe("Owner overrides persistence", () => {
  it("stores and updates owner overrides", () => {
    useAuditStore.getState().setOwnerOverride("sol-1", "manager");
    expect(useAuditStore.getState().ownerOverrides["sol-1"]).toBe("manager");

    useAuditStore.getState().setOwnerOverride("sol-1", "team");
    expect(useAuditStore.getState().ownerOverrides["sol-1"]).toBe("team");
  });
});

// ---------------------------------------------------------------------------
// 5. Store defaults
// ---------------------------------------------------------------------------
describe("Store defaults", () => {
  it("secondaryRoles defaults to empty array", () => {
    expect(useAuditStore.getState().secondaryRoles).toEqual([]);
  });

  it("ownerOverrides defaults to empty object", () => {
    expect(useAuditStore.getState().ownerOverrides).toEqual({});
  });
});
