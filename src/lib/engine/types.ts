// Pareto engine — types.
//
// Input model that AVOIDS double-counting: the user allocates their ACTUAL hours
// into mutually-exclusive time buckets. Benchmarks are carried per bucket only
// for COMPARISON — they are never summed into the total.

/** One mutually-exclusive waste bucket as allocated by the user. */
export interface WasteAllocationInput {
  categorySlug: string;
  /** Display label (optional; engine is slug-driven). */
  label?: string;
  /**
   * The WASTE (avoidable) hours per week in this bucket — what the Pareto ranks,
   * sums, and prices. Clamped to >= 0.
   */
  hoursPerWeek: number;
  /**
   * Total time-IN this activity per week (e.g. all meeting time, not just the
   * avoidable part). Used ONLY for the "you vs typical" benchmark comparison.
   * Defaults to hoursPerWeek when omitted.
   */
  timeInHours?: number;
  /**
   * Typical TIME-IN hours per week for this bucket, for the benchmark delta.
   * Null/omit when no surfaceable benchmark applies.
   */
  benchmarkHours?: number | null;
}

/** How to turn hours into dollars. */
export type MoneyInput =
  | { mode: "hourly"; hourlyRate: number }
  | { mode: "salary"; annualSalary: number };

/** Cumulative-share boundaries that split the ranked buckets into A/B/C zones. */
export interface ZoneCutoffs {
  /** Top of the Vital Few (zone A). Default 0.8. */
  a: number;
  /** Top of the Useful Many (zone B). Default 0.95. */
  b: number;
}

export interface ParetoOptions {
  /**
   * Legacy alias for the old cumulative A-zone boundary. Ignored for A
   * (which is now cliff + comfort-size based). Default 0.8.
   */
  cutoff?: number;
  /** A/B/C zone boundaries. `a` is legacy/ignored; `b` still applies. */
  zoneCutoffs?: Partial<ZoneCutoffs>;
  /**
   * The "cliff" ratio: an item stays in the same league as the one above it
   * while it is at least this fraction of it. The first item that drops below
   * this is the cliff. Default 2/3 (~0.667).
   */
  cliffRatio?: number;
  /**
   * Below this many buckets there is no real "few" to find — the result is
   * flagged `concentration: "too-few"`. Default 5.
   */
  minSources?: number;
  /** Working weeks per year used to annualize. Default 48. */
  weeksPerYear?: number;
}

/** Which Pareto zone a bucket falls in. */
export type Zone = "A" | "B" | "C";

/**
 * Shape of the user's week:
 *  - `too-few`      — fewer than `minSources` buckets; show a plain list.
 *  - `flat`         — the natural few is bigger than the list size justifies;
 *                     show the capped few + a "break a source down" nudge.
 *  - `concentrated` — a genuine, tight vital few exists within the comfort size.
 */
export type Concentration = "concentrated" | "flat" | "too-few";

export interface ParetoInput {
  allocations: WasteAllocationInput[];
  /** The user's total weekly working hours. */
  totalWorkHoursPerWeek: number;
  money: MoneyInput;
  options?: ParetoOptions;
}

export type BenchmarkDirection = "above" | "below" | "at";

export interface BenchmarkComparison {
  typicalHours: number;
  /** user - typical (positive = wasting more than typical). */
  deltaHours: number;
  /** user / typical; null when typical is 0. */
  multiple: number | null;
  direction: BenchmarkDirection;
}

export interface CategoryResult {
  categorySlug: string;
  label?: string;
  /** Waste (avoidable) hours per week. */
  hoursPerWeek: number;
  /** Total time-in this activity per week (for the benchmark comparison). */
  timeInHours: number;
  /** 1-based rank in descending-hours order. */
  rank: number;
  /** This bucket's share of total weekly waste, 0..1. */
  shareOfWaste: number;
  cumulativeHours: number;
  /** Cumulative share through this bucket, 0..1. */
  cumulativeShare: number;
  /** Pareto zone: A = Vital Few, B = Useful Many, C = Chupchiks. */
  zone: Zone;
  /** Convenience flag, kept in sync with `zone === "A"`. */
  isVitalFew: boolean;
  weeklyCost: number;
  annualHours: number;
  annualCost: number;
  /** Null when the bucket carried no benchmark. */
  benchmark: BenchmarkComparison | null;
}

/** One point for the Pareto chart (descending bars + cumulative % line). */
export interface ParetoChartPoint {
  categorySlug: string;
  label?: string;
  hours: number;
  /** Cumulative share as a percentage 0..100. */
  cumulativePercent: number;
}

export interface ParetoResult {
  categories: CategoryResult[];
  vitalFew: CategoryResult[];
  /** Size of zone A: the cliff capped by the comfort size. */
  vitalFewCount: number;
  /** The natural few BEFORE the comfort-size cap — the raw cliff count. */
  cliffCount: number;
  /** The most items zone A may hold for this list size. */
  comfortSize: number;
  /**
   * True when the natural few exceeds the comfort size — nudge the user
   * to break a coarse source into finer pieces.
   */
  shouldRefine: boolean;
  /** Shape of the week. */
  concentration: Concentration;
  /** vitalFewCount / categories.length, 0..1. */
  concentrationRatio: number;

  totalWeeklyWasteHours: number;
  totalAnnualWasteHours: number;
  totalWeeklyWasteCost: number;
  totalAnnualWasteCost: number;

  hourlyRate: number;
  cutoff: number;
  /** A-zone cutoff as a percentage 0..100. */
  cutoffPercent: number;
  /** B-zone cutoff as a percentage 0..100. */
  bCutoffPercent: number;
  weeksPerYear: number;

  chart: ParetoChartPoint[];
  warnings: string[];
}

// ─── Solution-related types ──────────────────────────────────────────────────

/** Effort and Impact on a 1–5 scale. */
export type Score = 1 | 2 | 3 | 4 | 5;

/** Catalog level seeds (low/medium/high). */
export type Level = "low" | "medium" | "high";

export type QuadrantLabel =
  | "quick-win"
  | "major-project"
  | "fill-in"
  | "thankless";

export interface ChosenSolution {
  /** Unique per-row id. */
  rowId: string;
  /** The waste-source slug this solution targets. */
  wasteSlug: string;
  title: string;
  effort: Score;
  impact: Score;
  owner: string;
  due?: string;
  /** Pareto zone of the targeted waste. */
  zone?: Zone;
}

export interface WasteBucket {
  slug: string;
  /** Weekly WASTE hours for this source. */
  wasteHours: number;
}

export interface PayoffResult {
  totalWasteHours: number;
  quickWinHours: number;
  quickWinPct: number;
  fullPotentialHours: number;
  fullPotentialPct: number;
  quickWinDollarsPerYear: number;
  fullPotentialDollarsPerYear: number;
  /** Per-row credited reclaim hours/wk (after de-overlap). */
  creditByRow: Record<string, number>;
  quickWinRowIds: string[];
}
