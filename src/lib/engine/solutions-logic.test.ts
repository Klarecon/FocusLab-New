import { describe, it, expect } from "vitest";
import {
  QUICK_WIN_CAP,
  IMPACT_FRACTION,
  SCORE_FROM_LEVEL,
  EFFORT_NAMES,
  IMPACT_NAMES,
  computePayoff,
  quadrant,
  isQuickWinScore,
  reclaimContribution,
  reclaimRationale,
  impactCutPhrase,
  concreteEquivalent,
} from "./solutions-logic";
import type { ChosenSolution, WasteBucket, Score } from "./types";

// ─── score names + level->score defaults ────────────────────────────────────

describe("score names + level->score defaults", () => {
  it("has a short name for all five effort and impact levels", () => {
    for (const s of [1, 2, 3, 4, 5] as Score[]) {
      expect(EFFORT_NAMES[s]).toBeTruthy();
      expect(IMPACT_NAMES[s]).toBeTruthy();
    }
  });
  it("maps the catalog's low/med/high seeds to 2/3/4 defaults", () => {
    expect(SCORE_FROM_LEVEL.low).toBe(2);
    expect(SCORE_FROM_LEVEL.medium).toBe(3);
    expect(SCORE_FROM_LEVEL.high).toBe(4);
  });
});

// ─── quadrant ───────────────────────────────────────────────────────────────

describe("quadrant — thresholds on the 1-5 scale", () => {
  it("quick win = effort <= 2 AND impact >= 4", () => {
    expect(quadrant(1, 5)).toBe("quick-win");
    expect(quadrant(2, 4)).toBe("quick-win");
    expect(quadrant(2, 5)).toBe("quick-win");
    expect(quadrant(3, 5)).toBe("major-project");
    expect(quadrant(2, 3)).toBe("fill-in");
    expect(isQuickWinScore(2, 4)).toBe(true);
    expect(isQuickWinScore(3, 4)).toBe(false);
    expect(isQuickWinScore(2, 3)).toBe(false);
  });

  it("maps the four corners of the 2x2", () => {
    expect(quadrant(1, 5)).toBe("quick-win");
    expect(quadrant(5, 5)).toBe("major-project");
    expect(quadrant(1, 1)).toBe("fill-in");
    expect(quadrant(5, 1)).toBe("thankless");
  });

  it("a moderate-effort (3) fix is NOT a quick win, even at top impact", () => {
    expect(quadrant(3, 5)).toBe("major-project");
    expect(quadrant(2, 4)).toBe("quick-win");
    expect(quadrant(3, 3)).toBe("thankless");
    expect(quadrant(3, 2)).toBe("thankless");
  });
});

// ─── reclaimContribution ────────────────────────────────────────────────────

describe("reclaimContribution — per-fix derivation", () => {
  it("is the impact fraction of the drain's wasted hours", () => {
    expect(reclaimContribution(4, 10)).toBeCloseTo(IMPACT_FRACTION[4] * 10, 6);
    expect(reclaimContribution(2, 8)).toBeCloseTo(IMPACT_FRACTION[2] * 8, 6);
  });
  it("higher impact reclaims a larger fraction (monotonic)", () => {
    let prev = -1;
    for (const s of [1, 2, 3, 4, 5] as Score[]) {
      expect(IMPACT_FRACTION[s]).toBeGreaterThan(prev);
      prev = IMPACT_FRACTION[s];
    }
  });
});

// ─── reclaim explanation copy ───────────────────────────────────────────────

describe("reclaim explanation copy", () => {
  it("impactCutPhrase names the level and the % from IMPACT_FRACTION", () => {
    const p4 = impactCutPhrase(4);
    expect(p4).toContain(IMPACT_NAMES[4]);
    expect(p4).toMatch(/about half/i);
    expect(p4).toMatch(/50%/);
    expect(impactCutPhrase(3)).toMatch(/about a third/i);
    expect(impactCutPhrase(3)).toMatch(/35%/);
  });

  it("reclaimRationale traces the number to its inputs", () => {
    const r = reclaimRationale(4, 10);
    expect(r).toMatch(/10 hrs\/wk lost here/i);
    expect(r).toMatch(/High impact/);
    expect(r).toMatch(/5 hrs\/wk on its own/i);
  });

  it("matches reclaimContribution exactly", () => {
    const solo = Math.round(reclaimContribution(3, 8) * 10) / 10;
    expect(reclaimRationale(3, 8)).toContain(`${solo} hrs/wk on its own`);
  });
});

// ─── concreteEquivalent ─────────────────────────────────────────────────────

describe("concreteEquivalent", () => {
  it("returns empty for zero or negative hours", () => {
    expect(concreteEquivalent(0)).toBe("");
    expect(concreteEquivalent(-1)).toBe("");
  });
  it("returns 'almost a full day' for >= 7 hours", () => {
    expect(concreteEquivalent(7)).toBe("almost a full day back, every week");
    expect(concreteEquivalent(10)).toBe("almost a full day back, every week");
  });
  it("returns 'a free afternoon' for >= 3.5 hours", () => {
    expect(concreteEquivalent(3.5)).toBe("a free afternoon, every week");
    expect(concreteEquivalent(5)).toBe("a free afternoon, every week");
  });
  it("returns annual hours for small amounts", () => {
    expect(concreteEquivalent(2)).toBe("about 96 hours a year");
  });
});

// ─── computePayoff — de-overlap ─────────────────────────────────────────────

const buckets: WasteBucket[] = [
  { slug: "meetings", wasteHours: 10 },
  { slug: "email", wasteHours: 5 },
];

function sol(
  p: Partial<ChosenSolution> & { rowId: string; wasteSlug: string },
): ChosenSolution {
  return { title: "x", effort: 2, impact: 4, owner: "Me", ...p };
}

describe("computePayoff — de-overlap (never double-count a bucket)", () => {
  it("two solutions on one bucket apply to the residual, never sum past the bucket", () => {
    const r = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", impact: 5 }),
        sol({ rowId: "b", wasteSlug: "meetings", impact: 5 }),
      ],
      50,
    );
    const credited = r.creditByRow["a"] + r.creditByRow["b"];
    expect(credited).toBeCloseTo(8.4, 5);
    expect(credited).toBeLessThanOrEqual(10);
  });

  it("caps the quick-win headline at the honesty cap of total waste", () => {
    const many = [
      sol({ rowId: "1", wasteSlug: "meetings", impact: 5 }),
      sol({ rowId: "2", wasteSlug: "meetings", impact: 5 }),
      sol({ rowId: "3", wasteSlug: "email", impact: 5 }),
      sol({ rowId: "4", wasteSlug: "email", impact: 5 }),
    ];
    const r = computePayoff(buckets, many, 50);
    expect(r.quickWinHours).toBeLessThanOrEqual(
      r.totalWasteHours * QUICK_WIN_CAP + 1e-9,
    );
  });

  it("full potential >= quick win, both <= total waste", () => {
    const r = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 5 }),
        sol({
          rowId: "b",
          wasteSlug: "email",
          effort: 5,
          impact: 5,
        }),
      ],
      50,
    );
    expect(r.fullPotentialHours).toBeGreaterThanOrEqual(r.quickWinHours);
    expect(r.fullPotentialHours).toBeLessThanOrEqual(r.totalWasteHours);
    expect(r.quickWinRowIds).toEqual(["a"]);
  });

  it("computes dollars from rate * reclaim * weeks", () => {
    const r = computePayoff(
      [{ slug: "meetings", wasteHours: 10 }],
      [sol({ rowId: "a", wasteSlug: "meetings", impact: 5 })],
      50,
      48,
    );
    expect(r.quickWinDollarsPerYear).toBeCloseTo(6 * 48 * 50, 4);
  });

  it("handles no solutions / no waste without NaN (zero payoff)", () => {
    const empty = computePayoff([], [], 50);
    expect(empty.quickWinHours).toBe(0);
    expect(empty.quickWinPct).toBe(0);
    expect(empty.quickWinDollarsPerYear).toBe(0);
  });
});

// ─── reclaim breakdown ──────────────────────────────────────────────────────

describe("reclaim breakdown — per-fix contributions sum to the total", () => {
  it("exposes the same per-row credit used in the capped total", () => {
    const r = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 5 }),
        sol({ rowId: "b", wasteSlug: "email", effort: 2, impact: 5 }),
      ],
      50,
    );
    const sum = Object.values(r.creditByRow).reduce((s, n) => s + n, 0);
    expect(sum).toBeCloseTo(r.fullPotentialHours, 6);
    expect(r.creditByRow["a"]).toBeCloseTo(6, 5);
    expect(r.creditByRow["b"]).toBeCloseTo(3, 5);
  });

  it("the credited total never exceeds the drain's wasted hours", () => {
    const r = computePayoff(
      [{ slug: "meetings", wasteHours: 4 }],
      [
        sol({ rowId: "a", wasteSlug: "meetings", impact: 5 }),
        sol({ rowId: "b", wasteSlug: "meetings", impact: 5 }),
        sol({ rowId: "c", wasteSlug: "meetings", impact: 5 }),
      ],
      50,
    );
    const credited =
      r.creditByRow["a"] + r.creditByRow["b"] + r.creditByRow["c"];
    expect(credited).toBeLessThanOrEqual(4 + 1e-9);
  });
});

// ─── reclaim tally: add/remove ──────────────────────────────────────────────

describe("reclaim tally: add/remove", () => {
  it("adding a custom fix never drops the running reclaim total", () => {
    const before = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 4 }),
        sol({ rowId: "b", wasteSlug: "email", effort: 2, impact: 4 }),
      ],
      50,
    );
    const after = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 4 }),
        sol({ rowId: "b", wasteSlug: "email", effort: 2, impact: 4 }),
        sol({
          rowId: "custom-1",
          wasteSlug: "meetings",
          title: "Clickup automations",
          effort: 3,
          impact: 3,
        }),
      ],
      50,
    );
    expect(after.creditByRow["custom-1"]).toBeGreaterThanOrEqual(0);
    expect(after.creditByRow["a"]).toBeGreaterThan(0);
    expect(after.creditByRow["b"]).toBeGreaterThan(0);
    expect(after.fullPotentialHours).toBeGreaterThanOrEqual(
      before.fullPotentialHours - 1e-9,
    );
  });

  it("a custom fix on a fresh bucket only ADDS to the tally", () => {
    const r = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 5 }),
        sol({
          rowId: "custom-1",
          wasteSlug: "email",
          title: "My own email fix",
          effort: 3,
          impact: 3,
        }),
      ],
      50,
    );
    expect(r.creditByRow["a"]).toBeCloseTo(6, 5);
    expect(r.creditByRow["custom-1"]).toBeCloseTo(IMPACT_FRACTION[3] * 5, 5);
    expect(r.fullPotentialHours).toBeCloseTo(6 + IMPACT_FRACTION[3] * 5, 5);
  });

  it("removing a fix drops the tally back to exactly the remaining fixes", () => {
    const full = computePayoff(
      buckets,
      [
        sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 5 }),
        sol({ rowId: "b", wasteSlug: "email", effort: 2, impact: 5 }),
      ],
      50,
    );
    const removed = computePayoff(
      buckets,
      [sol({ rowId: "a", wasteSlug: "meetings", effort: 2, impact: 5 })],
      50,
    );
    expect(full.fullPotentialHours).toBeCloseTo(6 + 3, 5);
    expect(removed.fullPotentialHours).toBeCloseTo(6, 5);
    expect(removed.creditByRow["b"]).toBeUndefined();
  });
});
