import { describe, expect, it } from "vitest";
import {
  cliffCount,
  comfortSizeFor,
  computePareto,
  resolveHourlyRate,
  selectVitalFewCount,
  splitIntoTiers,
} from "./pareto";
import type { ParetoInput, ParetoOptions, WasteAllocationInput } from "./types";

function input(
  allocations: WasteAllocationInput[],
  overrides: Partial<ParetoInput> = {},
): ParetoInput {
  return {
    allocations,
    totalWorkHoursPerWeek: 40,
    money: { mode: "hourly", hourlyRate: 50 },
    ...overrides,
  };
}

// ─── resolveHourlyRate ───────────────────────────────────────────────────────

describe("resolveHourlyRate", () => {
  it("returns the hourly rate directly in hourly mode", () => {
    expect(resolveHourlyRate({ mode: "hourly", hourlyRate: 75 }, 40, 48)).toBe(
      75,
    );
  });

  it("derives rate from salary, work hours, and weeks", () => {
    // 96,000 / (40 * 48) = 50
    expect(
      resolveHourlyRate({ mode: "salary", annualSalary: 96_000 }, 40, 48),
    ).toBe(50);
  });

  it("guards divide-by-zero work hours", () => {
    expect(
      resolveHourlyRate({ mode: "salary", annualSalary: 96_000 }, 0, 48),
    ).toBe(0);
  });

  it("clamps negative rates to zero", () => {
    expect(
      resolveHourlyRate({ mode: "hourly", hourlyRate: -10 }, 40, 48),
    ).toBe(0);
  });

  it("guards divide-by-zero weeks", () => {
    expect(
      resolveHourlyRate({ mode: "salary", annualSalary: 96_000 }, 40, 0),
    ).toBe(0);
  });

  it("salary annualization: 120k / (50 * 48) = 50", () => {
    expect(
      resolveHourlyRate({ mode: "salary", annualSalary: 120_000 }, 50, 48),
    ).toBe(50);
  });
});

// ─── selectVitalFewCount ─────────────────────────────────────────────────────

describe("selectVitalFewCount", () => {
  it("picks the smallest set whose cumulative share >= cutoff", () => {
    expect(selectVitalFewCount([10, 6, 2, 2], 0.8)).toBe(2);
  });

  it("returns 1 when the top bucket already clears the cutoff", () => {
    expect(selectVitalFewCount([18, 1, 1], 0.8)).toBe(1);
  });

  it("returns all buckets for a uniform distribution", () => {
    expect(selectVitalFewCount([5, 5, 5, 5], 0.8)).toBe(4);
  });

  it("returns 0 when there is no waste", () => {
    expect(selectVitalFewCount([0, 0], 0.8)).toBe(0);
    expect(selectVitalFewCount([], 0.8)).toBe(0);
  });
});

// ─── computePareto — totals & cost ──────────────────────────────────────────

describe("computePareto — totals & cost", () => {
  it("sums weekly waste and converts to annual cost (hourly)", () => {
    const r = computePareto(
      input([
        { categorySlug: "meetings", hoursPerWeek: 6 },
        { categorySlug: "email", hoursPerWeek: 4 },
      ]),
    );
    expect(r.totalWeeklyWasteHours).toBe(10);
    expect(r.hourlyRate).toBe(50);
    expect(r.totalWeeklyWasteCost).toBe(500);
    expect(r.totalAnnualWasteHours).toBe(480);
    expect(r.totalAnnualWasteCost).toBe(24_000);
  });

  it("salary-mode annual cost is weeks-independent (= waste/work * salary)", () => {
    const r = computePareto(
      input(
        [
          { categorySlug: "meetings", hoursPerWeek: 8 },
          { categorySlug: "email", hoursPerWeek: 2 },
        ],
        {
          totalWorkHoursPerWeek: 40,
          money: { mode: "salary", annualSalary: 100_000 },
        },
      ),
    );
    expect(r.totalAnnualWasteCost).toBeCloseTo(25_000, 6);
  });

  it("annualization uses weeksPerYear default of 48", () => {
    const r = computePareto(
      input([{ categorySlug: "a", hoursPerWeek: 10 }]),
    );
    expect(r.weeksPerYear).toBe(48);
    expect(r.totalAnnualWasteHours).toBe(480);
  });

  it("annualization respects custom weeksPerYear", () => {
    const r = computePareto(
      input([{ categorySlug: "a", hoursPerWeek: 10 }], {
        options: { weeksPerYear: 50 },
      }),
    );
    expect(r.weeksPerYear).toBe(50);
    expect(r.totalAnnualWasteHours).toBe(500);
  });
});

// ─── ranking, shares, vital few ─────────────────────────────────────────────

describe("computePareto — ranking, shares, vital few", () => {
  it("sorts categories by hours descending and ranks them", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 2 },
        { categorySlug: "b", hoursPerWeek: 8 },
        { categorySlug: "c", hoursPerWeek: 5 },
      ]),
    );
    expect(r.categories.map((c) => c.categorySlug)).toEqual(["b", "c", "a"]);
    expect(r.categories.map((c) => c.rank)).toEqual([1, 2, 3]);
  });

  it("computes share and cumulative share correctly", () => {
    const r = computePareto(
      input([
        { categorySlug: "b", hoursPerWeek: 10 },
        { categorySlug: "c", hoursPerWeek: 6 },
        { categorySlug: "a", hoursPerWeek: 4 },
      ]),
    );
    expect(r.categories[0].shareOfWaste).toBeCloseTo(0.5, 6);
    expect(r.categories[0].cumulativeShare).toBeCloseTo(0.5, 6);
    expect(r.categories[1].cumulativeShare).toBeCloseTo(0.8, 6);
    expect(r.categories[2].cumulativeShare).toBeCloseTo(1.0, 6);
  });

  it("flags the vital few by the cliff: 6 is under 2/3 of 10, so only the top", () => {
    const r = computePareto(
      input([
        { categorySlug: "b", hoursPerWeek: 10 },
        { categorySlug: "c", hoursPerWeek: 6 },
        { categorySlug: "a", hoursPerWeek: 4 },
      ]),
    );
    expect(r.vitalFew.map((c) => c.categorySlug)).toEqual(["b"]);
    expect(r.vitalFewCount).toBe(1);
    expect(
      r.categories.find((c) => c.categorySlug === "c")!.isVitalFew,
    ).toBe(false);
  });

  it("respects a custom cliffRatio (looser => more in the same league)", () => {
    const r = computePareto(
      input(
        [
          { categorySlug: "b", hoursPerWeek: 10 },
          { categorySlug: "c", hoursPerWeek: 6 },
          { categorySlug: "a", hoursPerWeek: 4 },
        ],
        { options: { cliffRatio: 0.5 } },
      ),
    );
    expect(r.cliffCount).toBe(3);
    expect(r.vitalFewCount).toBe(2);
    expect(r.shouldRefine).toBe(true);
  });

  it("breaks ties deterministically by slug", () => {
    const r = computePareto(
      input([
        { categorySlug: "z", hoursPerWeek: 5 },
        { categorySlug: "a", hoursPerWeek: 5 },
      ]),
    );
    expect(r.categories.map((c) => c.categorySlug)).toEqual(["a", "z"]);
  });
});

// ─── benchmark deltas ───────────────────────────────────────────────────────

describe("computePareto — benchmark deltas", () => {
  it("computes delta, multiple, and direction above benchmark", () => {
    const r = computePareto(
      input([
        { categorySlug: "meetings", hoursPerWeek: 9, benchmarkHours: 3 },
      ]),
    );
    const b = r.categories[0].benchmark!;
    expect(b.typicalHours).toBe(3);
    expect(b.deltaHours).toBe(6);
    expect(b.multiple).toBeCloseTo(3, 6);
    expect(b.direction).toBe("above");
  });

  it("marks below-benchmark buckets", () => {
    const r = computePareto(
      input([
        { categorySlug: "meetings", hoursPerWeek: 1, benchmarkHours: 3 },
      ]),
    );
    expect(r.categories[0].benchmark!.direction).toBe("below");
  });

  it("returns null multiple when the benchmark is zero", () => {
    const r = computePareto(
      input([{ categorySlug: "x", hoursPerWeek: 4, benchmarkHours: 0 }]),
    );
    const b = r.categories[0].benchmark!;
    expect(b.multiple).toBeNull();
    expect(b.direction).toBe("above");
  });

  it("returns null benchmark when none provided", () => {
    const r = computePareto(
      input([{ categorySlug: "x", hoursPerWeek: 4 }]),
    );
    expect(r.categories[0].benchmark).toBeNull();
  });
});

// ─── edge cases ─────────────────────────────────────────────────────────────

describe("computePareto — edge cases", () => {
  it("handles zero total input (zero buckets dropped) — empty result, too-few", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 0 },
        { categorySlug: "b", hoursPerWeek: 0 },
      ]),
    );
    expect(r.totalWeeklyWasteHours).toBe(0);
    expect(r.totalWeeklyWasteCost).toBe(0);
    expect(r.vitalFew).toEqual([]);
    expect(r.categories).toEqual([]);
    expect(r.concentration).toBe("too-few");
  });

  it("handles an empty allocation list", () => {
    const r = computePareto(input([]));
    expect(r.categories).toEqual([]);
    expect(r.chart).toEqual([]);
    expect(r.totalWeeklyWasteHours).toBe(0);
  });

  it("clamps negative hours to zero (and drops the now-zero bucket)", () => {
    const r = computePareto(
      input([{ categorySlug: "a", hoursPerWeek: -5 }]),
    );
    expect(r.categories).toEqual([]);
    expect(r.totalWeeklyWasteHours).toBe(0);
  });

  it("warns when allocated waste exceeds the work week", () => {
    const r = computePareto(
      input(
        [
          { categorySlug: "a", hoursPerWeek: 30 },
          { categorySlug: "b", hoursPerWeek: 20 },
        ],
        { totalWorkHoursPerWeek: 40 },
      ),
    );
    expect(r.warnings.some((w) => /exceed/i.test(w))).toBe(true);
  });

  it("handles a single dominant category", () => {
    const r = computePareto(
      input([
        { categorySlug: "big", hoursPerWeek: 19 },
        { categorySlug: "small", hoursPerWeek: 1 },
      ]),
    );
    expect(r.vitalFew.map((c) => c.categorySlug)).toEqual(["big"]);
  });

  it("single source -> too-few concentration", () => {
    const r = computePareto(
      input([{ categorySlug: "only", hoursPerWeek: 10 }]),
    );
    expect(r.concentration).toBe("too-few");
    expect(r.categories).toHaveLength(1);
  });
});

// ─── ABC zones ──────────────────────────────────────────────────────────────

describe("computePareto — ABC zones", () => {
  function concentrated() {
    return computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 10 },
        { categorySlug: "b", hoursPerWeek: 6 },
        { categorySlug: "c", hoursPerWeek: 2 },
        { categorySlug: "d", hoursPerWeek: 1 },
        { categorySlug: "e", hoursPerWeek: 1 },
      ]),
    );
  }

  it("A = top tier, C = bottom tier, B = the middle", () => {
    const r = concentrated();
    expect(r.categories.map((c) => c.zone)).toEqual([
      "A",
      "B",
      "B",
      "C",
      "C",
    ]);
  });

  it("keeps isVitalFew in sync with zone === 'A'", () => {
    const r = concentrated();
    for (const c of r.categories) {
      expect(c.isVitalFew).toBe(c.zone === "A");
    }
    expect(r.vitalFew.map((c) => c.categorySlug)).toEqual(["a"]);
  });

  it("a lone tall bar over a cluster of equals is A=1", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 7.5 },
        { categorySlug: "b", hoursPerWeek: 5 },
        { categorySlug: "c", hoursPerWeek: 5 },
        { categorySlug: "d", hoursPerWeek: 5 },
        { categorySlug: "e", hoursPerWeek: 2.5 },
        { categorySlug: "f", hoursPerWeek: 2.5 },
        { categorySlug: "g", hoursPerWeek: 2.5 },
      ]),
    );
    expect(r.cliffCount).toBe(1);
    expect(r.vitalFewCount).toBe(1);
    expect(r.categories.map((c) => c.zone)).toEqual([
      "A",
      "B",
      "B",
      "B",
      "C",
      "C",
      "C",
    ]);
  });

  it("a single dominant bucket is zone A alone", () => {
    const r = computePareto(
      input([
        { categorySlug: "big", hoursPerWeek: 16 },
        { categorySlug: "w", hoursPerWeek: 1 },
        { categorySlug: "x", hoursPerWeek: 1 },
        { categorySlug: "y", hoursPerWeek: 1 },
        { categorySlug: "z", hoursPerWeek: 1 },
      ]),
    );
    expect(r.categories[0].zone).toBe("A");
    expect(r.categories.filter((c) => c.zone === "A")).toHaveLength(1);
  });
});

// ─── concentration detection ────────────────────────────────────────────────

describe("computePareto — concentration detection", () => {
  it("flags a genuinely concentrated week", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 10 },
        { categorySlug: "b", hoursPerWeek: 6 },
        { categorySlug: "c", hoursPerWeek: 2 },
        { categorySlug: "d", hoursPerWeek: 1 },
        { categorySlug: "e", hoursPerWeek: 1 },
      ]),
    );
    expect(r.concentration).toBe("concentrated");
    expect(r.shouldRefine).toBe(false);
    expect(r.concentrationRatio).toBeCloseTo(0.2, 6);
  });

  it("flags an almost-even week as flat (shouldRefine true)", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 4 },
        { categorySlug: "b", hoursPerWeek: 4 },
        { categorySlug: "c", hoursPerWeek: 4 },
        { categorySlug: "d", hoursPerWeek: 4 },
        { categorySlug: "e", hoursPerWeek: 4 },
      ]),
    );
    expect(r.concentration).toBe("flat");
    expect(r.shouldRefine).toBe(true);
    expect(r.cliffCount).toBe(5);
    expect(r.vitalFewCount).toBe(2);
  });

  it("flags too-few when there are fewer than minSources buckets", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 5 },
        { categorySlug: "b", hoursPerWeek: 3 },
        { categorySlug: "c", hoursPerWeek: 2 },
      ]),
    );
    expect(r.concentration).toBe("too-few");
  });

  it("two sources are too-few", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 5 },
        { categorySlug: "b", hoursPerWeek: 3 },
      ]),
    );
    expect(r.concentration).toBe("too-few");
  });

  it("exactly minSources buckets is not too-few", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 10 },
        { categorySlug: "b", hoursPerWeek: 6 },
        { categorySlug: "c", hoursPerWeek: 2 },
        { categorySlug: "d", hoursPerWeek: 1 },
        { categorySlug: "e", hoursPerWeek: 1 },
      ]),
    );
    expect(r.concentration).not.toBe("too-few");
  });

  it("an all-zero week is too-few", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 0 },
        { categorySlug: "b", hoursPerWeek: 0 },
        { categorySlug: "c", hoursPerWeek: 0 },
        { categorySlug: "d", hoursPerWeek: 0 },
        { categorySlug: "e", hoursPerWeek: 0 },
      ]),
    );
    expect(r.concentration).toBe("too-few");
    expect(r.concentrationRatio).toBe(0);
  });

  it("respects a custom minSources", () => {
    const r = computePareto(
      input(
        [
          { categorySlug: "a", hoursPerWeek: 5 },
          { categorySlug: "b", hoursPerWeek: 3 },
        ],
        { options: { minSources: 2 } },
      ),
    );
    expect(r.concentration).not.toBe("too-few");
  });
});

// ─── zero-waste exclusion ───────────────────────────────────────────────────

describe("computePareto — zero-waste exclusion", () => {
  function mixed(nonzero: number[], zeros: number) {
    const a: WasteAllocationInput[] = nonzero.map((h, i) => ({
      categorySlug: `n${i}`,
      hoursPerWeek: h,
    }));
    for (let i = 0; i < zeros; i++)
      a.push({ categorySlug: `z${i}`, hoursPerWeek: 0 });
    return a;
  }

  it("drops zero-waste buckets from categories, chart, and vitalFew", () => {
    const r = computePareto(input(mixed([6], 4)));
    expect(r.categories).toHaveLength(1);
    expect(r.categories.every((c) => c.hoursPerWeek > 0)).toBe(true);
    expect(r.chart.every((p) => p.hours > 0)).toBe(true);
    expect(r.vitalFew.every((c) => c.hoursPerWeek > 0)).toBe(true);
  });

  it("never emits a benchmark for a zero-time bucket", () => {
    const r = computePareto(
      input([
        {
          categorySlug: "a",
          hoursPerWeek: 5,
          timeInHours: 10,
          benchmarkHours: 8,
        },
        {
          categorySlug: "b",
          hoursPerWeek: 0,
          timeInHours: 0,
          benchmarkHours: 11,
        },
      ]),
    );
    expect(r.categories).toHaveLength(1);
    expect(r.categories[0].categorySlug).toBe("a");
  });

  it.each([
    [1, 0],
    [1, 3],
    [2, 0],
    [2, 3],
    [3, 0],
    [3, 3],
    [4, 0],
    [4, 3],
  ])(
    "%i nonzero sources (+%i zeros) -> too-few",
    (k, pad) => {
      const nz = Array.from({ length: k }, (_, i) => 10 - i);
      const r = computePareto(input(mixed(nz, pad)));
      expect(r.concentration).toBe("too-few");
      expect(r.categories).toHaveLength(k);
    },
  );

  it.each([[0], [3]])(
    "5 concentrated nonzero (+%i zeros) -> concentrated",
    (pad) => {
      const r = computePareto(input(mixed([10, 6, 2, 1, 1], pad)));
      expect(r.concentration).toBe("concentrated");
      expect(r.categories).toHaveLength(5);
    },
  );

  it.each([[0], [3]])(
    "5 even nonzero (+%i zeros) -> flat",
    (pad) => {
      const r = computePareto(input(mixed([4, 4, 4, 4, 4], pad)));
      expect(r.concentration).toBe("flat");
    },
  );

  it("clamps timeInHours to be >= waste hours", () => {
    const r = computePareto(
      input([
        { categorySlug: "a", hoursPerWeek: 9, timeInHours: 3 },
      ]),
    );
    expect(r.categories[0].timeInHours).toBeGreaterThanOrEqual(9);
  });
});

// ─── cliff + comfort-size + refine (the focus mechanism) ────────────────────

const TWO_THIRDS = 2 / 3;

function res(hours: number[], options: ParetoOptions = {}): ParetoInput {
  return input(
    hours.map((h, i) => ({
      categorySlug: `s${i.toString().padStart(2, "0")}`,
      hoursPerWeek: h,
    })),
    { options },
  );
}

describe("comfortSizeFor — the proportional ceiling", () => {
  it.each([
    [0, 0],
    [1, 2],
    [4, 2],
    [5, 2],
    [9, 2],
    [10, 3],
    [13, 3],
    [14, 4],
    [20, 4],
    [100, 4],
  ])("%i sources -> comfort %i", (n, expected) => {
    expect(comfortSizeFor(n)).toBe(expected);
  });
});

describe("cliffCount — the same-league run from the top (ratio 2/3)", () => {
  it("empty / all-zero lists have no cliff", () => {
    expect(cliffCount([], TWO_THIRDS)).toBe(0);
    expect(cliffCount([0, 0], TWO_THIRDS)).toBe(0);
  });
  it("a lone item is its own cliff", () => {
    expect(cliffCount([10], TWO_THIRDS)).toBe(1);
  });
  it("under two-thirds of the item above is a different league", () => {
    expect(cliffCount([10, 6], TWO_THIRDS)).toBe(1);
  });
  it("strictly above two-thirds stays in the same tier", () => {
    expect(cliffCount([10, 7], TWO_THIRDS)).toBe(2);
  });
  it("EXACTLY two-thirds is a drop, not a same-leaguer (critical boundary)", () => {
    expect(cliffCount([9, 6], TWO_THIRDS)).toBe(1); // 6/9 = 2/3 exactly -> drop
    expect(cliffCount([7.5, 5], TWO_THIRDS)).toBe(1); // 5/7.5 = 2/3 exactly -> drop
  });
  it("exact 2/3 boundary: bars [6, 4] — 4/6 = 0.666... is a DROP", () => {
    expect(cliffCount([6, 4], TWO_THIRDS)).toBe(1);
  });
  it("stops at the FIRST drop-off", () => {
    expect(cliffCount([10, 8, 6], TWO_THIRDS)).toBe(3);
    expect(cliffCount([10, 8, 5], TWO_THIRDS)).toBe(2);
  });
  it("a perfectly even list is one big tier", () => {
    expect(cliffCount([4, 4, 4, 4, 4], TWO_THIRDS)).toBe(5);
  });
  it("a lone giant collapses to 1", () => {
    expect(cliffCount([95, 1, 1, 1, 1], TWO_THIRDS)).toBe(1);
  });
});

describe("splitIntoTiers — runs of near-equal bars", () => {
  it("empty / all-zero -> no tiers", () => {
    expect(splitIntoTiers([], TWO_THIRDS)).toEqual([]);
    expect(splitIntoTiers([0, 0], TWO_THIRDS)).toEqual([]);
  });
  it("a lone tall bar over a cluster: [7.5,5,5,5,2.5,2.5,2.5] -> [1,3,3]", () => {
    expect(
      splitIntoTiers([7.5, 5, 5, 5, 2.5, 2.5, 2.5], TWO_THIRDS),
    ).toEqual([1, 3, 3]);
  });
  it("a clean top trio: [17.5,14,12.5,7.5,5,2.5] -> [3,1,1,1]", () => {
    expect(
      splitIntoTiers([17.5, 14, 12.5, 7.5, 5, 2.5], TWO_THIRDS),
    ).toEqual([3, 1, 1, 1]);
  });
  it("perfectly even is a single tier", () => {
    expect(splitIntoTiers([4, 4, 4, 4, 4], TWO_THIRDS)).toEqual([5]);
  });
  it("a lone giant: [95,1,1,1,1] -> [1,4]", () => {
    expect(splitIntoTiers([95, 1, 1, 1, 1], TWO_THIRDS)).toEqual([1, 4]);
  });
});

// ─── the focus matrix ───────────────────────────────────────────────────────

interface ZoneCase {
  name: string;
  hours: number[];
  cliff: number;
  comfort: number;
  a: number;
  refine: boolean;
  concentration: "concentrated" | "flat" | "too-few";
}

const ones = (n: number) => Array.from({ length: n }, () => 1);

describe("computePareto — the focus matrix (every shape)", () => {
  const cases: ZoneCase[] = [
    {
      name: "Oren's real week — clear top 3, then a cliff (6 sources)",
      hours: [17.5, 14, 12.5, 7.5, 5, 2.5],
      cliff: 3,
      comfort: 2,
      a: 2,
      refine: true,
      concentration: "flat",
    },
    {
      name: "Lone giant 5/95 — one thing towers (5 sources)",
      hours: [95, 1, 1, 1, 1],
      cliff: 1,
      comfort: 2,
      a: 1,
      refine: false,
      concentration: "concentrated",
    },
    {
      name: "Two clear co-leaders, then a cliff (5 sources)",
      hours: [10, 9, 3, 2, 1],
      cliff: 2,
      comfort: 2,
      a: 2,
      refine: false,
      concentration: "concentrated",
    },
    {
      name: "Perfectly even week — no cliff (5 sources)",
      hours: [4, 4, 4, 4, 4],
      cliff: 5,
      comfort: 2,
      a: 2,
      refine: true,
      concentration: "flat",
    },
    {
      name: "Gentle slope, never drops a league (5 sources)",
      hours: [10, 9, 8, 7, 6],
      cliff: 5,
      comfort: 2,
      a: 2,
      refine: true,
      concentration: "flat",
    },
    {
      name: "Big list, genuinely 3 priorities (10 sources)",
      hours: [10, 8, 7, 2, 2, 2, 2, 2, 2, 2],
      cliff: 3,
      comfort: 3,
      a: 3,
      refine: false,
      concentration: "concentrated",
    },
    {
      name: "Big list, genuinely 4 priorities (16 sources)",
      hours: [20, 18, 16, 14, ...ones(12)],
      cliff: 4,
      comfort: 4,
      a: 4,
      refine: false,
      concentration: "concentrated",
    },
    {
      name: "Many similar drains but a short list -> refine (8 sources)",
      hours: [10, 9, 8, 7, 6, 1, 1, 1],
      cliff: 5,
      comfort: 2,
      a: 2,
      refine: true,
      concentration: "flat",
    },
  ];

  it.each(cases)(
    "$name",
    ({ hours, cliff, comfort, a, refine, concentration }) => {
      const r = computePareto(res(hours));
      expect(r.cliffCount).toBe(cliff);
      expect(r.comfortSize).toBe(comfort);
      expect(r.vitalFewCount).toBe(a);
      expect(r.vitalFew).toHaveLength(a);
      expect(r.shouldRefine).toBe(refine);
      expect(r.concentration).toBe(concentration);
      expect(r.vitalFewCount).toBeLessThanOrEqual(r.comfortSize);
      expect(r.categories.filter((c) => c.zone === "A")).toHaveLength(a);
      for (const c of r.categories) {
        expect(c.isVitalFew).toBe(c.zone === "A");
      }
    },
  );

  it("a single dominant bucket below minSources is A-alone but still too-few", () => {
    const r = computePareto(res([19, 1]));
    expect(r.vitalFewCount).toBe(1);
    expect(r.concentration).toBe("too-few");
  });

  it("an all-zero week has no cliff, no comfort, no focus", () => {
    const r = computePareto(res([0, 0, 0, 0, 0]));
    expect(r.cliffCount).toBe(0);
    expect(r.comfortSize).toBe(0);
    expect(r.vitalFewCount).toBe(0);
    expect(r.shouldRefine).toBe(false);
    expect(r.concentration).toBe("too-few");
  });

  it("the cutoff marker tracks the real A-zone edge", () => {
    const r = computePareto(res([17.5, 14, 12.5, 7.5, 5, 2.5]));
    expect(r.cutoffPercent).toBeCloseTo(53.39, 1);
  });
});

// ─── salary vs hourly rate resolution ───────────────────────────────────────

describe("computePareto — salary vs hourly rate resolution", () => {
  it("salary mode derives hourly rate from annual salary / (hours * weeks)", () => {
    const r = computePareto(
      input(
        [{ categorySlug: "a", hoursPerWeek: 5 }],
        {
          totalWorkHoursPerWeek: 40,
          money: { mode: "salary", annualSalary: 96_000 },
        },
      ),
    );
    // 96,000 / (40 * 48) = 50
    expect(r.hourlyRate).toBe(50);
    expect(r.totalWeeklyWasteCost).toBe(250);
  });

  it("hourly mode uses the rate directly", () => {
    const r = computePareto(
      input(
        [{ categorySlug: "a", hoursPerWeek: 5 }],
        { money: { mode: "hourly", hourlyRate: 75 } },
      ),
    );
    expect(r.hourlyRate).toBe(75);
    expect(r.totalWeeklyWasteCost).toBe(375);
  });
});

// ─── over-week warning ──────────────────────────────────────────────────────

describe("computePareto — over-week warning", () => {
  it("emits a warning when waste exceeds the work week", () => {
    const r = computePareto(
      input(
        [
          { categorySlug: "a", hoursPerWeek: 25 },
          { categorySlug: "b", hoursPerWeek: 20 },
        ],
        { totalWorkHoursPerWeek: 40 },
      ),
    );
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]).toMatch(/exceed/i);
  });

  it("no warning when waste is within the work week", () => {
    const r = computePareto(
      input(
        [
          { categorySlug: "a", hoursPerWeek: 10 },
          { categorySlug: "b", hoursPerWeek: 5 },
        ],
        { totalWorkHoursPerWeek: 40 },
      ),
    );
    expect(r.warnings).toHaveLength(0);
  });
});

// ─── chart data ─────────────────────────────────────────────────────────────

describe("computePareto — chart data", () => {
  it("emits descending points with cumulative percent ending at 100", () => {
    const r = computePareto(
      input([
        { categorySlug: "b", hoursPerWeek: 10 },
        { categorySlug: "c", hoursPerWeek: 6 },
        { categorySlug: "a", hoursPerWeek: 4 },
      ]),
    );
    expect(r.chart.map((p) => p.hours)).toEqual([10, 6, 4]);
    expect(r.chart[0].cumulativePercent).toBeCloseTo(50, 6);
    expect(r.chart.at(-1)!.cumulativePercent).toBeCloseTo(100, 6);
    expect(r.cutoffPercent).toBeCloseTo(50, 6);
  });
});
