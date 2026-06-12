// Pareto engine — pure computation. No I/O, no framework.
//
// The math contract:
//   1. Sort the user's mutually-exclusive waste buckets by hours, descending.
//   2. Cumulative hours + cumulative share of total waste.
//   3. Vital few = cliff-based (top tier capped by comfort size).
//   4. Hours -> $ via one money input, annualized over `weeksPerYear`.
//   5. Per-bucket benchmark delta (user vs typical) — comparison only, never summed.

import type {
  BenchmarkComparison,
  CategoryResult,
  Concentration,
  MoneyInput,
  ParetoChartPoint,
  ParetoInput,
  ParetoResult,
  WasteAllocationInput,
  Zone,
} from "./types";

const DEFAULT_WEEKS_PER_YEAR = 48;
const DEFAULT_MIN_SOURCES = 5;
/**
 * Cliff ratio: an item stays "in the same league" as the one above it while it
 * is at least this fraction of it. The first item below this is the cliff.
 * 2/3 => anything under two-thirds of the item above is a different league.
 */
const DEFAULT_CLIFF_RATIO = 2 / 3;

// Comfort size: the MOST items zone A may ever hold, scaled to how many sources
// the user logged — ~1 focus slot per COMFORT_SOURCES_PER_SLOT sources, never
// below COMFORT_MIN, never above COMFORT_MAX.
const COMFORT_SOURCES_PER_SLOT = 4;
const COMFORT_MIN = 2;
const COMFORT_MAX = 4;

const clampNonNegative = (n: number): number =>
  Number.isFinite(n) && n > 0 ? n : 0;

const clampToRange = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

/**
 * Resolve an hourly rate from the money input. Salary is spread over the user's
 * actual work hours across the working year. Guards divide-by-zero and clamps
 * negatives to 0.
 */
export function resolveHourlyRate(
  money: MoneyInput,
  workHoursPerWeek: number,
  weeksPerYear: number,
): number {
  if (money.mode === "hourly") return clampNonNegative(money.hourlyRate);

  const annualWorkHours =
    clampNonNegative(workHoursPerWeek) * clampNonNegative(weeksPerYear);
  if (annualWorkHours === 0) return 0;
  return clampNonNegative(money.annualSalary) / annualWorkHours;
}

/**
 * Number of buckets in the vital few: the smallest leading set whose cumulative
 * share reaches `cutoff`. Returns 0 when there is no waste.
 */
export function selectVitalFewCount(
  hoursDescending: number[],
  cutoff: number,
): number {
  const total = hoursDescending.reduce((s, h) => s + clampNonNegative(h), 0);
  if (total === 0) return 0;

  let cumulative = 0;
  for (let i = 0; i < hoursDescending.length; i++) {
    cumulative += clampNonNegative(hoursDescending[i]);
    if (cumulative / total >= cutoff) return i + 1;
  }
  return hoursDescending.length;
}

/**
 * The MOST items zone A may hold, scaled to the source count: ~1 slot per
 * COMFORT_SOURCES_PER_SLOT sources, clamped to [COMFORT_MIN, COMFORT_MAX].
 * Returns 0 for an empty list. (5-9 sources -> 2, 10-13 -> 3, 14+ -> 4.)
 */
export function comfortSizeFor(sourceCount: number): number {
  if (sourceCount <= 0) return 0;
  return clampToRange(
    Math.round(sourceCount / COMFORT_SOURCES_PER_SLOT),
    COMFORT_MIN,
    COMFORT_MAX,
  );
}

/**
 * Two bars are in the SAME TIER when the lower is meaningfully ABOVE `cliffRatio`
 * of the higher. Strict: an item exactly at the ratio is a DROP, not a
 * same-leaguer. The epsilon dodges float traps.
 */
const TIER_EPS = 1e-9;
function sameTier(cur: number, prev: number, cliffRatio: number): boolean {
  if (prev <= 0) return false;
  return cur / prev > cliffRatio + TIER_EPS;
}

/**
 * Split the ranked bars into TIERS — runs of near-equal bars, a new tier
 * starting at each real drop. Returns the tier SIZES, e.g.
 * `[7.5,5,5,5,2.5,2.5,2.5]` -> `[1,3,3]`. Empty/all-zero -> `[]`.
 */
export function splitIntoTiers(
  hoursDescending: number[],
  cliffRatio: number,
): number[] {
  const sizes: number[] = [];
  let current = 0;
  for (let i = 0; i < hoursDescending.length; i++) {
    const cur = clampNonNegative(hoursDescending[i]);
    if (cur <= 0) break; // zeros are dropped upstream; guard anyway
    if (i === 0) {
      current = 1;
      continue;
    }
    const prev = clampNonNegative(hoursDescending[i - 1]);
    if (sameTier(cur, prev, cliffRatio)) current += 1;
    else {
      sizes.push(current);
      current = 1;
    }
  }
  if (current > 0) sizes.push(current);
  return sizes;
}

/**
 * The "cliff" count — the size of the TOP tier (the natural vital few BEFORE the
 * comfort-size ceiling). Returns 0 for an empty/all-zero list, else >= 1.
 */
export function cliffCount(
  hoursDescending: number[],
  cliffRatio: number,
): number {
  return splitIntoTiers(hoursDescending, cliffRatio)[0] ?? 0;
}

function benchmarkFor(
  hours: number,
  benchmarkHours: number | null | undefined,
): BenchmarkComparison | null {
  if (benchmarkHours == null) return null;
  const typical = clampNonNegative(benchmarkHours);
  const deltaHours = hours - typical;
  const direction =
    deltaHours > 0 ? "above" : deltaHours < 0 ? "below" : "at";
  const multiple = typical > 0 ? hours / typical : null;
  return { typicalHours: typical, deltaHours, multiple, direction };
}

/** Sort a copy by hours desc, breaking ties by slug for determinism. */
function sortDescending(
  allocations: WasteAllocationInput[],
): WasteAllocationInput[] {
  return [...allocations].sort((a, b) => {
    const diff =
      clampNonNegative(b.hoursPerWeek) - clampNonNegative(a.hoursPerWeek);
    return diff !== 0 ? diff : a.categorySlug.localeCompare(b.categorySlug);
  });
}

export function computePareto(inputData: ParetoInput): ParetoResult {
  const opts = inputData.options;
  const cliffRatio = opts?.cliffRatio ?? DEFAULT_CLIFF_RATIO;
  const minSources = opts?.minSources ?? DEFAULT_MIN_SOURCES;
  const weeksPerYear = opts?.weeksPerYear ?? DEFAULT_WEEKS_PER_YEAR;
  const hourlyRate = resolveHourlyRate(
    inputData.money,
    inputData.totalWorkHoursPerWeek,
    weeksPerYear,
  );

  // Only buckets with actual WASTE (hoursPerWeek > 0) are real sources.
  const sorted = sortDescending(inputData.allocations).filter(
    (a) => clampNonNegative(a.hoursPerWeek) > 0,
  );
  const hoursDescending = sorted.map((a) => clampNonNegative(a.hoursPerWeek));
  const totalWeeklyWasteHours = hoursDescending.reduce((s, h) => s + h, 0);

  // Split the ranked bars into tiers (runs of near-equal bars).
  //   A (vital few)   = the TOP tier, capped by the comfort size,
  //   C (trivial)     = the BOTTOM tier,
  //   B (useful many) = everything in between.
  const tiers = splitIntoTiers(hoursDescending, cliffRatio);
  const naturalFewCount = tiers[0] ?? 0;
  const comfortSize = comfortSizeFor(hoursDescending.length);
  const aCount = Math.min(naturalFewCount, comfortSize);
  const shouldRefine = naturalFewCount > comfortSize;
  const vitalFewCount = aCount;

  // C starts where the bottom tier begins — but only when there's more than one
  // tier (a real bottom cluster).
  const bottomTierSize = tiers.length >= 2 ? tiers[tiers.length - 1] : 0;
  const bCount = Math.max(hoursDescending.length - bottomTierSize, aCount);

  const zoneFor = (i: number): Zone =>
    i < aCount ? "A" : i < bCount ? "B" : "C";

  let cumulativeHours = 0;
  const categories: CategoryResult[] = sorted.map((a, i) => {
    const hoursPerWeek = hoursDescending[i];
    // Time-in defaults to the waste hours; never less than the waste itself.
    const timeInHours = Math.max(
      clampNonNegative(a.timeInHours ?? hoursPerWeek),
      hoursPerWeek,
    );
    cumulativeHours += hoursPerWeek;
    const shareOfWaste =
      totalWeeklyWasteHours > 0
        ? hoursPerWeek / totalWeeklyWasteHours
        : 0;
    const cumulativeShare =
      totalWeeklyWasteHours > 0
        ? cumulativeHours / totalWeeklyWasteHours
        : 0;
    const zone = zoneFor(i);

    return {
      categorySlug: a.categorySlug,
      label: a.label,
      hoursPerWeek,
      timeInHours,
      rank: i + 1,
      shareOfWaste,
      cumulativeHours,
      cumulativeShare,
      zone,
      isVitalFew: zone === "A",
      weeklyCost: hoursPerWeek * hourlyRate,
      annualHours: hoursPerWeek * weeksPerYear,
      annualCost: hoursPerWeek * weeksPerYear * hourlyRate,
      benchmark: benchmarkFor(timeInHours, a.benchmarkHours),
    };
  });

  // Concentration detection.
  const concentrationRatio =
    categories.length > 0 ? vitalFewCount / categories.length : 0;
  let concentration: Concentration;
  if (categories.length < minSources || totalWeeklyWasteHours === 0) {
    concentration = "too-few";
  } else if (shouldRefine) {
    concentration = "flat";
  } else {
    concentration = "concentrated";
  }

  // The chart's marker lines track the ACTUAL zone edges.
  const aEndShare =
    aCount > 0 ? categories[aCount - 1].cumulativeShare : 0;
  const bEndShare =
    bCount > 0 ? categories[bCount - 1].cumulativeShare : 0;

  const chart: ParetoChartPoint[] = categories.map((c) => ({
    categorySlug: c.categorySlug,
    label: c.label,
    hours: c.hoursPerWeek,
    cumulativePercent: c.cumulativeShare * 100,
  }));

  const warnings: string[] = [];
  const workWeek = clampNonNegative(inputData.totalWorkHoursPerWeek);
  if (workWeek > 0 && totalWeeklyWasteHours > workWeek) {
    warnings.push(
      `Allocated waste (${totalWeeklyWasteHours} hrs) exceeds the work week (${workWeek} hrs).`,
    );
  }

  return {
    categories,
    vitalFew: categories.slice(0, vitalFewCount),
    vitalFewCount,
    cliffCount: naturalFewCount,
    comfortSize,
    shouldRefine,
    concentration,
    concentrationRatio,
    totalWeeklyWasteHours,
    totalAnnualWasteHours: totalWeeklyWasteHours * weeksPerYear,
    totalWeeklyWasteCost: totalWeeklyWasteHours * hourlyRate,
    totalAnnualWasteCost: totalWeeklyWasteHours * weeksPerYear * hourlyRate,
    hourlyRate,
    cutoff: aEndShare,
    cutoffPercent: aEndShare * 100,
    bCutoffPercent: bEndShare * 100,
    weeksPerYear,
    chart,
    warnings,
  };
}

export default computePareto;
