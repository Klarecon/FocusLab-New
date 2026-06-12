// Pure logic for the audit chain flow — lifted out of React components so it
// can be unit-tested without a DOM.
//
// The chain model: the user brain-dumps WASTE-FRAMED sources so the time they
// log against a source already IS the waste. Each source is weighed as hours on
// a typical DAY or a typical WEEK; day cadence is multiplied by the working days.

import type { MoneyInput, ParetoInput, WasteAllocationInput } from "./types";
import { computePareto } from "./pareto";
import type { ParetoResult } from "./types";

export type Cadence = "day" | "week";
export type PayMode = "salary" | "hourly";

/** One source the user picked in the brain-dump, with how they weighed it. */
export interface ChainEntry {
  /** Source slug — a benchmark category slug, or "custom-N" for the user's own. */
  slug: string;
  label: string;
  /** Hours logged for this source (interpreted via `cadence`). */
  hours: number;
  cadence: Cadence;
  /** Hover/explainer text from the waste-source taxonomy. */
  whatCounts?: string;
  /** True for a user-typed source (no benchmark). */
  isCustom?: boolean;
}

const clampNonNeg = (n: number): number =>
  Number.isFinite(n) && n > 0 ? n : 0;

/** Default working days per week. */
export const DEFAULT_WORK_DAYS = 5;

/**
 * Weekly WASTE hours for one weighed source. Day cadence x working days; week
 * cadence is already weekly. Negatives / NaN clamp to 0.
 */
export function weeklyFromDaily(hoursPerDay: number, workDays: number): number {
  return clampNonNeg(hoursPerDay) * clampNonNeg(workDays);
}

/**
 * Weekly waste for a chain entry, handling cadence.
 */
export function weeklyWaste(entry: ChainEntry, workDays: number): number {
  const hours = clampNonNeg(entry.hours);
  return entry.cadence === "week" ? hours : hours * clampNonNeg(workDays);
}

/**
 * Bucket waste: given time-in hours and an avoidable percentage, returns the
 * avoidable (waste) hours.
 */
export function bucketWaste(timeInHours: number, avoidablePct: number): number {
  return clampNonNeg(timeInHours) * clampNonNeg(avoidablePct);
}

/** Total weekly waste the user has weighed across all kept sources. */
export function totalWeeklyWaste(
  entries: ReadonlyArray<ChainEntry>,
  workDays: number,
): number {
  return entries.reduce((s, e) => s + weeklyWaste(e, workDays), 0);
}

/**
 * Sources the user KEPT but weighed at zero hours. The wizard must make the
 * user explicitly confirm these before computing.
 */
export function keptButZeroSlugs(
  entries: ReadonlyArray<ChainEntry>,
  workDays: number,
): string[] {
  return entries
    .filter((e) => weeklyWaste(e, workDays) <= 0)
    .map((e) => e.slug);
}

/** Map the pay toggle to the engine's money input. */
export function buildMoneyInput(
  payMode: PayMode,
  salary: number,
  hourly: number,
): MoneyInput {
  return payMode === "salary"
    ? { mode: "salary", annualSalary: salary }
    : { mode: "hourly", hourlyRate: hourly };
}

/** Per-source hour caps in the weigh step. */
export const WEEK_CAP = 40;
export const DAY_CAP = 12;

export interface FillSource {
  slug: string;
  label: string;
  isCustom?: boolean;
}

export interface FillValue {
  hours: number;
  cadence: Cadence;
}

/**
 * Fill a typical week from benchmark data. For each source that has a benchmark,
 * returns the typical weekly hours for that source.
 */
export function fillTypicalWeek(
  sources: ReadonlyArray<FillSource>,
  benchmarkMap: Map<string, number>,
): Record<string, FillValue> {
  const out: Record<string, FillValue> = {};

  // Count how many picked slices share each benchmark category.
  const sliceCount = new Map<string, number>();
  for (const s of sources) {
    if (s.isCustom) continue;
    if (!benchmarkMap.has(s.slug)) continue;
    sliceCount.set(s.slug, (sliceCount.get(s.slug) ?? 0) + 1);
  }

  for (const s of sources) {
    if (s.isCustom) continue;
    const typical = benchmarkMap.get(s.slug);
    if (typical == null || typical <= 0) continue;
    const share = typical / (sliceCount.get(s.slug) ?? 1);
    const hours = Math.min(WEEK_CAP, Math.round(share * 2) / 2);
    if (hours <= 0) continue;
    out[s.slug] = { hours, cadence: "week" };
  }
  return out;
}

export interface AuditInput {
  /** Every source the user kept from the brain-dump, with its weight. */
  entries: ReadonlyArray<ChainEntry>;
  workWeek: number;
  workDays: number;
  payMode: PayMode;
  salary: number;
  hourly: number;
  /** Optional benchmark map: slug -> typical weekly hours. */
  benchmarkMap?: Map<string, number>;
}

/**
 * The full client-side audit computation. For each kept source: weekly waste =
 * weighed hours (day x days, or week as-is). The engine ranks/prices that waste;
 * the per-source benchmark compares the logged hours to the typical hours.
 * Sources kept-but-weighed-at-zero are dropped by the engine.
 *
 * Nothing here touches the network — privacy by construction.
 */
export function runAudit(input: AuditInput): ParetoResult {
  const { entries, workWeek, workDays, payMode, salary, hourly, benchmarkMap } =
    input;

  const allocations: WasteAllocationInput[] = entries.map((e) => {
    const waste = weeklyWaste(e, workDays);
    const benchmarkHours =
      !e.isCustom && benchmarkMap ? (benchmarkMap.get(e.slug) ?? null) : null;
    return {
      categorySlug: e.slug,
      label: e.label,
      hoursPerWeek: waste,
      timeInHours: waste,
      benchmarkHours,
    };
  });

  return computePareto({
    allocations,
    totalWorkHoursPerWeek: workWeek,
    money: buildMoneyInput(payMode, salary, hourly),
  });
}
