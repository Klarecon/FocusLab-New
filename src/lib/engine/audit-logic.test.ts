import { describe, it, expect } from "vitest";
import {
  buildMoneyInput,
  bucketWaste,
  fillTypicalWeek,
  keptButZeroSlugs,
  runAudit,
  totalWeeklyWaste,
  weeklyFromDaily,
  weeklyWaste,
  WEEK_CAP,
  type ChainEntry,
} from "./audit-logic";

function entry(p: Partial<ChainEntry> & Pick<ChainEntry, "slug">): ChainEntry {
  return { label: p.slug, hours: 0, cadence: "day", ...p };
}

// ─── weeklyFromDaily ────────────────────────────────────────────────────────

describe("weeklyFromDaily", () => {
  it("multiplies daily hours by working days", () => {
    expect(weeklyFromDaily(1.5, 5)).toBe(7.5);
  });
  it("clamps negatives to zero", () => {
    expect(weeklyFromDaily(-3, 5)).toBe(0);
    expect(weeklyFromDaily(3, -2)).toBe(0);
  });
  it("handles NaN", () => {
    expect(weeklyFromDaily(NaN, 5)).toBe(0);
  });
});

// ─── weeklyWaste ────────────────────────────────────────────────────────────

describe("weeklyWaste", () => {
  it("multiplies a day-cadence entry by the working days", () => {
    expect(
      weeklyWaste(entry({ slug: "x", hours: 1.5, cadence: "day" }), 5),
    ).toBe(7.5);
  });
  it("treats a week-cadence entry as already weekly", () => {
    expect(
      weeklyWaste(entry({ slug: "x", hours: 8, cadence: "week" }), 5),
    ).toBe(8);
  });
  it("clamps negatives / NaN to zero", () => {
    expect(
      weeklyWaste(entry({ slug: "x", hours: -3, cadence: "day" }), 5),
    ).toBe(0);
    expect(
      weeklyWaste(entry({ slug: "x", hours: Number.NaN, cadence: "week" }), 5),
    ).toBe(0);
  });
});

// ─── bucketWaste ────────────────────────────────────────────────────────────

describe("bucketWaste", () => {
  it("returns time * avoidable percentage", () => {
    expect(bucketWaste(10, 0.5)).toBe(5);
  });
  it("clamps negatives", () => {
    expect(bucketWaste(-5, 0.5)).toBe(0);
    expect(bucketWaste(10, -0.3)).toBe(0);
  });
});

// ─── totalWeeklyWaste ───────────────────────────────────────────────────────

describe("totalWeeklyWaste", () => {
  it("sums weekly waste across mixed cadences", () => {
    const e = [
      entry({ slug: "a", hours: 2, cadence: "day" }), // 10
      entry({ slug: "b", hours: 4, cadence: "week" }), // 4
    ];
    expect(totalWeeklyWaste(e, 5)).toBe(14);
  });
});

// ─── keptButZeroSlugs ───────────────────────────────────────────────────────

describe("keptButZeroSlugs (the picked-but-zero guard)", () => {
  it("flags only the sources the user kept but left at zero", () => {
    const e = [
      entry({ slug: "meetings", hours: 2, cadence: "day" }),
      entry({ slug: "email-messaging", hours: 0, cadence: "day" }),
      entry({ slug: "interruptions", hours: 0, cadence: "week" }),
    ];
    expect(keptButZeroSlugs(e, 5)).toEqual([
      "email-messaging",
      "interruptions",
    ]);
  });
  it("returns nothing when every kept source has time", () => {
    const e = [
      entry({ slug: "meetings", hours: 1, cadence: "day" }),
      entry({ slug: "email-messaging", hours: 2, cadence: "week" }),
    ];
    expect(keptButZeroSlugs(e, 5)).toEqual([]);
  });
});

// ─── fillTypicalWeek ────────────────────────────────────────────────────────

describe("fillTypicalWeek", () => {
  it("returns typical hours for sources with benchmarks", () => {
    const benchmarkMap = new Map([
      ["meetings", 5],
      ["email", 3],
    ]);
    const sources = [
      { slug: "meetings", label: "Meetings" },
      { slug: "email", label: "Email" },
    ];
    const fill = fillTypicalWeek(sources, benchmarkMap);
    expect(fill["meetings"]).toEqual({ hours: 5, cadence: "week" });
    expect(fill["email"]).toEqual({ hours: 3, cadence: "week" });
  });

  it("omits custom sources", () => {
    const benchmarkMap = new Map([["meetings", 5]]);
    const sources = [
      { slug: "meetings", label: "Meetings" },
      { slug: "custom-1", label: "Custom", isCustom: true },
    ];
    const fill = fillTypicalWeek(sources, benchmarkMap);
    expect(fill["meetings"]).toBeDefined();
    expect(fill["custom-1"]).toBeUndefined();
  });

  it("omits sources with no benchmark", () => {
    const benchmarkMap = new Map([["meetings", 5]]);
    const sources = [
      { slug: "meetings", label: "Meetings" },
      { slug: "unknown", label: "Unknown" },
    ];
    const fill = fillTypicalWeek(sources, benchmarkMap);
    expect(fill["meetings"]).toBeDefined();
    expect(fill["unknown"]).toBeUndefined();
  });

  it("respects the weekly cap", () => {
    const benchmarkMap = new Map([["meetings", 200]]);
    const sources = [{ slug: "meetings", label: "Meetings" }];
    const fill = fillTypicalWeek(sources, benchmarkMap);
    expect(fill["meetings"].hours).toBe(WEEK_CAP);
  });

  it("returns an empty map when no source is fillable", () => {
    const benchmarkMap = new Map<string, number>();
    const sources = [{ slug: "custom-1", label: "Custom", isCustom: true }];
    const fill = fillTypicalWeek(sources, benchmarkMap);
    expect(fill).toEqual({});
  });
});

// ─── buildMoneyInput ────────────────────────────────────────────────────────

describe("buildMoneyInput", () => {
  it("maps the pay toggle to the engine money input", () => {
    expect(buildMoneyInput("salary", 120_000, 60)).toEqual({
      mode: "salary",
      annualSalary: 120_000,
    });
    expect(buildMoneyInput("hourly", 120_000, 60)).toEqual({
      mode: "hourly",
      hourlyRate: 60,
    });
  });
});

// ─── runAudit ───────────────────────────────────────────────────────────────

describe("runAudit", () => {
  it("ranks the weighed waste and computes costs", () => {
    const result = runAudit({
      entries: [
        entry({ slug: "meetings", label: "Meetings", hours: 2, cadence: "day" }), // 10h
        entry({ slug: "email", label: "Email", hours: 4, cadence: "week" }), // 4h
      ],
      workWeek: 40,
      workDays: 5,
      payMode: "hourly",
      salary: 0,
      hourly: 50,
    });

    expect(result.totalWeeklyWasteHours).toBe(14);
    expect(result.totalWeeklyWasteCost).toBe(700);

    const meetings = result.categories.find(
      (c) => c.categorySlug === "meetings",
    )!;
    expect(meetings.hoursPerWeek).toBe(10);
  });

  it("attaches benchmarks from the benchmark map", () => {
    const benchmarkMap = new Map([["meetings", 5]]);
    const result = runAudit({
      entries: [
        entry({ slug: "meetings", label: "Meetings", hours: 2, cadence: "day" }), // 10h
      ],
      workWeek: 40,
      workDays: 5,
      payMode: "hourly",
      salary: 0,
      hourly: 50,
      benchmarkMap,
    });

    const meetings = result.categories.find(
      (c) => c.categorySlug === "meetings",
    )!;
    expect(meetings.benchmark?.typicalHours).toBe(5);
    expect(meetings.benchmark?.deltaHours).toBe(5);
    expect(meetings.benchmark?.direction).toBe("above");
  });

  it("drops a KEPT-BUT-ZERO source from the results", () => {
    const result = runAudit({
      entries: [
        entry({ slug: "meetings", label: "Meetings", hours: 2, cadence: "day" }),
        entry({ slug: "email", label: "Email", hours: 0, cadence: "day" }),
      ],
      workWeek: 40,
      workDays: 5,
      payMode: "hourly",
      salary: 0,
      hourly: 50,
    });

    expect(result.totalWeeklyWasteHours).toBe(10);
    expect(result.categories).toHaveLength(1);
    expect(
      result.categories.find((c) => c.categorySlug === "email"),
    ).toBeUndefined();
  });

  it("an all-zero brain-dump yields zero waste and no categories", () => {
    const result = runAudit({
      entries: [
        entry({ slug: "meetings", hours: 0, cadence: "day" }),
        entry({ slug: "email", hours: 0, cadence: "week" }),
      ],
      workWeek: 40,
      workDays: 5,
      payMode: "hourly",
      salary: 0,
      hourly: 50,
    });
    expect(result.totalWeeklyWasteHours).toBe(0);
    expect(result.categories).toHaveLength(0);
    expect(result.concentration).toBe("too-few");
  });

  it("a custom source carries no benchmark but still counts as waste", () => {
    const benchmarkMap = new Map([["meetings", 5]]);
    const result = runAudit({
      entries: [
        entry({
          slug: "custom-1",
          label: "Slack pings",
          hours: 1,
          cadence: "day",
          isCustom: true,
        }),
        entry({ slug: "meetings", label: "Meetings", hours: 1, cadence: "day" }),
      ],
      workWeek: 40,
      workDays: 5,
      payMode: "hourly",
      salary: 0,
      hourly: 50,
      benchmarkMap,
    });
    const custom = result.categories.find(
      (c) => c.categorySlug === "custom-1",
    )!;
    expect(custom.hoursPerWeek).toBe(5);
    expect(custom.benchmark).toBeNull();
  });

  it("salary pay mode spreads the salary over the work year for the rate", () => {
    const result = runAudit({
      entries: [
        entry({ slug: "meetings", hours: 2, cadence: "day" }),
      ],
      workWeek: 40,
      workDays: 5,
      payMode: "salary",
      salary: 96_000,
      hourly: 0,
    });
    expect(result.hourlyRate).toBe(50);
    expect(result.totalWeeklyWasteCost).toBe(500);
  });
});
