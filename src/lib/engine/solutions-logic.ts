// Pure logic for the solutions layer: Effort x Impact quadrants + the payoff
// computation. No React. Encodes the researched de-overlap rule (never sum
// overlapping reclaim) and the conservative Quick-Win / aspirational
// Full-Potential split (capped, honest).

import type {
  ChosenSolution,
  Level,
  PayoffResult,
  QuadrantLabel,
  Score,
  WasteBucket,
} from "./types";

/** Catalog seeds are low/med/high; map them to sensible 1-5 defaults. */
export const SCORE_FROM_LEVEL: Record<Level, Score> = {
  low: 2,
  medium: 3,
  high: 4,
};

/** Short, plain names for each 1-5 level. */
export const EFFORT_NAMES: Record<Score, string> = {
  1: "Trivial",
  2: "Quick",
  3: "Moderate",
  4: "Heavy",
  5: "Major",
};
export const IMPACT_NAMES: Record<Score, string> = {
  1: "Slight",
  2: "Minor",
  3: "Moderate",
  4: "High",
  5: "Huge",
};

export const QUADRANT_META: Record<
  QuadrantLabel,
  { name: string; verb: string; emoji: string; description: string }
> = {
  "quick-win": {
    name: "Pearls",
    verb: "Do these first",
    emoji: "🤩",
    description: "Easy to grab, wildly valuable.",
  },
  "major-project": {
    name: "Oysters",
    verb: "Plan these only after your Pearls are done, and only if you have spare capacity",
    emoji: "💪",
    description: "High effort, high reward.",
  },
  "fill-in": {
    name: "Low-Hanging Fruit",
    verb: "Pick one or two to knock out quickly \u2014 these take minutes, not days",
    emoji: "🫠",
    description: "Quick to knock out, small payoff.",
  },
  thankless: {
    name: "White Elephants",
    verb: "Avoid these",
    emoji: "🐘",
    description: "Hard work, almost no payoff.",
  },
};

/**
 * Quick Win = effort <= 2 AND impact >= 4.
 * The 2x2 midlines: left half = effort <=2, top half = strong impact >=4.
 */
export function quadrant(effort: Score, impact: Score): QuadrantLabel {
  const lowEffort = effort <= 2;
  const strongImpact = impact >= 4;
  if (lowEffort && strongImpact) return "quick-win";
  if (strongImpact) return "major-project";
  if (lowEffort) return "fill-in";
  return "thankless";
}

/** Same test as `quadrant(...) === "quick-win"`. */
export function isQuickWinScore(effort: Score, impact: Score): boolean {
  return quadrant(effort, impact) === "quick-win";
}

/**
 * A fix is "rated" once the user has set BOTH effort and impact to a real
 * 1-5 value. Blank dots start at 0 (unrated) — an unrated fix has no quadrant,
 * is excluded from the Quick-Win count, the Impact Matrix plot, and the payoff
 * totals until the user fills it in.
 */
export function isRated(effort: number, impact: number): boolean {
  return effort >= 1 && impact >= 1;
}

/**
 * Fraction of a waste bucket's remaining hours a solution can plausibly reclaim,
 * by impact level. A 5-point curve.
 */
export const IMPACT_FRACTION: Record<Score, number> = {
  1: 0.1,
  2: 0.2,
  3: 0.35,
  4: 0.5,
  5: 0.6,
};

/** Honesty cap: a few quick wins can't credibly erase the whole wasted week. */
export const QUICK_WIN_CAP = 0.6;

/**
 * Per-fix reclaim BEFORE de-overlap: the headline a single fix targets on its
 * own drain.
 */
export function reclaimContribution(impact: Score, wasteHours: number): number {
  const w = Number.isFinite(wasteHours) && wasteHours > 0 ? wasteHours : 0;
  return IMPACT_FRACTION[impact] * w;
}

/**
 * Credit reclaim per solution WITHOUT double-counting: within each waste bucket,
 * apply solutions in impact order to the residual avoidable time. Quick-Win
 * total is the conservative "in days" number (capped); Full Potential is the
 * aspirational ceiling across all chosen solutions.
 */
export function computePayoff(
  buckets: WasteBucket[],
  chosen: ChosenSolution[],
  hourlyRate: number,
  weeksPerYear = 48,
): PayoffResult {
  const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  const totalWaste = buckets.reduce((s, b) => s + safe(b.wasteHours), 0);
  const wasteBySlug = new Map(buckets.map((b) => [b.slug, safe(b.wasteHours)]));
  const creditByRow: Record<string, number> = {};

  // Group chosen solutions by the bucket they target.
  const byBucket = new Map<string, ChosenSolution[]>();
  for (const c of chosen) {
    if (!byBucket.has(c.wasteSlug)) byBucket.set(c.wasteSlug, []);
    byBucket.get(c.wasteSlug)!.push(c);
  }

  for (const [slug, sols] of byBucket) {
    let residual = wasteBySlug.get(slug) ?? 0;
    // Highest-impact first so the best solution gets the freshest residual.
    const ordered = [...sols].sort(
      (a, b) => IMPACT_FRACTION[b.impact] - IMPACT_FRACTION[a.impact],
    );
    for (const s of ordered) {
      const take = Math.min(IMPACT_FRACTION[s.impact] * residual, residual);
      creditByRow[s.rowId] = take;
      residual -= take;
    }
  }

  const quickWinRowIds = chosen
    .filter((c) => quadrant(c.effort, c.impact) === "quick-win")
    .map((c) => c.rowId);

  let quickWinHours = quickWinRowIds.reduce(
    (s, id) => s + (creditByRow[id] ?? 0),
    0,
  );
  quickWinHours = Math.min(quickWinHours, totalWaste * QUICK_WIN_CAP);

  const fullPotentialHours = Math.min(
    chosen.reduce((s, c) => s + (creditByRow[c.rowId] ?? 0), 0),
    totalWaste,
  );

  return {
    totalWasteHours: totalWaste,
    quickWinHours,
    quickWinPct: totalWaste > 0 ? quickWinHours / totalWaste : 0,
    fullPotentialHours,
    fullPotentialPct: totalWaste > 0 ? fullPotentialHours / totalWaste : 0,
    quickWinDollarsPerYear:
      quickWinHours * weeksPerYear * Math.max(0, hourlyRate),
    fullPotentialDollarsPerYear:
      fullPotentialHours * weeksPerYear * Math.max(0, hourlyRate),
    creditByRow,
    quickWinRowIds,
  };
}

/**
 * Plain-words rule of thumb for how much a fix at a given impact level typically
 * cuts of a drain.
 */
export function impactCutPhrase(impact: Score): string {
  const pct = Math.round(IMPACT_FRACTION[impact] * 100);
  const name = IMPACT_NAMES[impact];
  if (impact >= 4)
    return `${name} impact → typically cuts about half (~${pct}%)`;
  if (impact === 3)
    return `${name} impact → typically cuts about a third (~${pct}%)`;
  return `${name} impact → typically cuts a slice (~${pct}%)`;
}

/**
 * One honest sentence deriving a fix's reclaim from its inputs.
 */
export function reclaimRationale(impact: Score, wasteHours: number): string {
  const w =
    Math.round(
      (Number.isFinite(wasteHours) && wasteHours > 0 ? wasteHours : 0) * 10,
    ) / 10;
  const solo = Math.round(reclaimContribution(impact, w) * 10) / 10;
  return `~${w} hrs/wk lost here × ${impactCutPhrase(impact)} ≈ ${solo} hrs/wk on its own`;
}

/** A wasted-hours figure made concrete. */
export function concreteEquivalent(hoursPerWeek: number): string {
  if (hoursPerWeek <= 0) return "";
  if (hoursPerWeek >= 7) return "almost a full day back, every week";
  if (hoursPerWeek >= 3.5) return "a free afternoon, every week";
  return `about ${Math.round(hoursPerWeek * 48)} hours a year`;
}
