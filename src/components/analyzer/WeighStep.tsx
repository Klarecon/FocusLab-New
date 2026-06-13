"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import type { WasteEntry } from "@/stores/audit-store";
import { runAudit, type ChainEntry } from "@/lib/engine/audit-logic";
import { benchmarkCategoryFor } from "@/lib/data/waste-sources";
import {
  BENCHMARKS,
  isSurfaceable,
  type RoleSlug,
} from "@/lib/data/benchmarks";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface WeighStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Build a benchmark map: waste-source slug -> typical weekly hours.
 * Only surfaceable benchmarks with week_share or duration basis are usable.
 */
function buildBenchmarkMap(
  roleSlug: RoleSlug,
  workHoursPerWeek: number,
): Map<string, number> {
  const map = new Map<string, number>();
  const surfaceable = BENCHMARKS.filter(
    (b) =>
      isSurfaceable(b) &&
      (b.roleSlug === null || b.roleSlug === roleSlug) &&
      b.valuePoint != null,
  );

  for (const b of surfaceable) {
    let hours: number | null = null;
    if (b.valueBasis === "week_share" && b.unit === "pct_of_week") {
      hours = (b.valuePoint! / 100) * workHoursPerWeek;
    } else if (b.valueBasis === "duration" && b.unit === "hrs_per_week") {
      hours = b.valuePoint!;
    }
    if (hours != null && hours > 0) {
      // Map by category slug; multiple benchmarks can feed same category
      if (!map.has(b.categorySlug) || hours > map.get(b.categorySlug)!) {
        map.set(b.categorySlug, hours);
      }
    }
  }
  return map;
}

export default function WeighStep({ onNext, onBack }: WeighStepProps) {
  const activeSources = useAuditStore((s) => s.activeSources);
  const entries = useAuditStore((s) => s.entries);
  const setEntry = useAuditStore((s) => s.setEntry);
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);
  const workDaysPerWeek = useAuditStore((s) => s.workDaysPerWeek);
  const payMode = useAuditStore((s) => s.payMode);
  const salary = useAuditStore((s) => s.salary);
  const hourlyRate = useAuditStore((s) => s.hourlyRate);
  const setParetoResult = useAuditStore((s) => s.setParetoResult);
  const weighCadence = useAuditStore((s) => s.weighCadence);
  const setWeighCadence = useAuditStore((s) => s.setWeighCadence);

  const [confirmedZeros, setConfirmedZeros] = useState<Set<string>>(new Set());

  // Running total of waste hours/week
  const totalWaste = useMemo(() => {
    return activeSources.reduce((sum, src) => {
      const e = entries[src.slug];
      if (!e) return sum;
      const effectiveCadence = weighCadence ?? e.cadence;
      const weeklyHrs =
        effectiveCadence === "daily"
          ? e.hoursPerDay * workDaysPerWeek
          : e.hoursPerDay; // hoursPerDay is really "hours per cadence period"
      return sum + weeklyHrs * (e.avoidablePct / 100);
    }, 0);
  }, [activeSources, entries, workDaysPerWeek, weighCadence]);

  const handleCompute = () => {
    // Build chain entries from store
    const chainEntries: ChainEntry[] = activeSources.reduce<ChainEntry[]>(
      (acc, src) => {
        const e = entries[src.slug];
        if (!e) return acc;
        const effectiveCadence = weighCadence ?? e.cadence;
        const weeklyHrs =
          effectiveCadence === "daily"
            ? e.hoursPerDay * workDaysPerWeek
            : e.hoursPerDay;
        const wasteHrs = weeklyHrs * (e.avoidablePct / 100);
        acc.push({
          slug: src.slug,
          label: src.label,
          hours: wasteHrs,
          cadence: "week",
          whatCounts: src.whatCounts,
          isCustom: src.slug.startsWith("custom-"),
        });
        return acc;
      },
      [],
    );

    const benchmarkMap = roleSlug
      ? buildBenchmarkMap(roleSlug as RoleSlug, workHoursPerWeek)
      : new Map<string, number>();

    // Map benchmark categories to source slugs
    const sourceBenchmarkMap = new Map<string, number>();
    for (const src of activeSources) {
      const cat = benchmarkCategoryFor(src.slug);
      if (cat && benchmarkMap.has(cat)) {
        sourceBenchmarkMap.set(src.slug, benchmarkMap.get(cat)!);
      }
    }

    const result = runAudit({
      entries: chainEntries,
      workWeek: workHoursPerWeek,
      workDays: workDaysPerWeek,
      payMode: payMode === "salary" ? "salary" : "hourly",
      salary,
      hourly: hourlyRate,
      benchmarkMap: sourceBenchmarkMap,
    });

    // Store the full engine result directly in Zustand (persisted)
    setParetoResult(result);

    onNext();
  };

  // Check if any sources have zero hours and aren't confirmed
  const hasUnconfirmedZeros = activeSources.some((src) => {
    const e = entries[src.slug];
    return e && e.hoursPerDay === 0 && !confirmedZeros.has(src.slug);
  });

  // Over-allocation: total waste exceeds work week
  const isOverAllocated = totalWaste > workHoursPerWeek;

  return (
    <div>
      {/* Header with running total */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          How much time does each drain take?
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          First, pick your unit. Then estimate hours and how much is avoidable.
        </p>

        {/* Global cadence toggle */}
        <div className="mt-5 inline-flex items-center gap-3">
          <span className="text-xs font-semibold" style={{ color: "var(--color-ink-soft)" }}>
            I'll estimate in:
          </span>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1.5px solid var(--color-line)" }}>
            {(["daily", "weekly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setWeighCadence(c)}
                aria-pressed={weighCadence === c}
                className="px-4 py-2 text-sm font-semibold capitalize transition-all duration-150"
                style={{
                  backgroundColor: weighCadence === c ? "var(--color-ink)" : "transparent",
                  color: weighCadence === c ? "var(--color-paper)" : "var(--color-ink-soft)",
                }}
              >
                hrs/{c === "daily" ? "day" : "week"}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          animate={{ scale: [1.08, 1] }}
          transition={{ duration: 0.15 }}
          aria-live="polite"
          aria-atomic="true"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{
            backgroundColor: "rgba(224, 62, 18, 0.08)",
            color: "var(--color-waste)",
          }}
        >
          <span className="font-figures font-bold text-2xl">{totalWaste.toFixed(1)}</span>
          <span className="text-sm font-semibold">hrs/week waste</span>
        </motion.div>
      </div>

      {/* Live running total — sticky panel, visible as user scrolls through sources */}
      {weighCadence && activeSources.length > 0 && (
        <div className="sticky top-4 z-10 mb-6">
          <motion.div
            animate={{ scale: [1.03, 1] }}
            transition={{ duration: 0.15 }}
            className="surface-card p-4 flex items-center justify-between"
            style={{
              borderLeft: `4px solid ${
                totalWaste / workHoursPerWeek > 0.9
                  ? "var(--color-waste)"
                  : totalWaste / workHoursPerWeek > 0.75
                    ? "var(--color-gold)"
                    : "var(--color-reclaim)"
              }`,
              backgroundColor:
                totalWaste / workHoursPerWeek > 0.9
                  ? "rgba(224, 62, 18, 0.06)"
                  : totalWaste / workHoursPerWeek > 0.75
                    ? "rgba(237, 178, 21, 0.06)"
                    : "var(--color-card)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">
                {totalWaste / workHoursPerWeek > 0.9
                  ? "💀"
                  : totalWaste / workHoursPerWeek > 0.75
                    ? "😬"
                    : totalWaste > 0
                      ? "🤯"
                      : "🤔"}
              </span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-figures font-bold text-xl"
                    style={{
                      color:
                        totalWaste / workHoursPerWeek > 0.75
                          ? "var(--color-waste)"
                          : "var(--color-ink)",
                    }}
                  >
                    {totalWaste.toFixed(1)} hrs
                  </span>
                  <span className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>
                    of {workHoursPerWeek} hr week = {Math.min(100, Math.round((totalWaste / workHoursPerWeek) * 100))}%
                  </span>
                </div>
                {totalWaste / workHoursPerWeek > 0.9 && (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--color-waste)" }}>
                    That's almost your entire week. Double-check the estimates.
                  </p>
                )}
                {totalWaste / workHoursPerWeek > 0.75 && totalWaste / workHoursPerWeek <= 0.9 && (
                  <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-gold)" }}>
                    Over 75% waste is unusual. Are the numbers right?
                  </p>
                )}
              </div>
            </div>
            {/* Visual bar */}
            <div
              className="w-24 h-2 rounded-full overflow-hidden flex-shrink-0"
              style={{ backgroundColor: "var(--color-line)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (totalWaste / workHoursPerWeek) * 100)}%`,
                  backgroundColor:
                    totalWaste / workHoursPerWeek > 0.9
                      ? "var(--color-waste)"
                      : totalWaste / workHoursPerWeek > 0.75
                        ? "var(--color-gold)"
                        : "var(--color-reclaim)",
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Source cards */}
      <div className="space-y-4 mb-8">
        {activeSources.map((src, i) => {
          const entry = entries[src.slug] ?? {
            hoursPerDay: 0,
            avoidablePct: 50,
            cadence: (weighCadence ?? "daily") as "daily" | "weekly",
          };
          const effectiveCardCadence = weighCadence ?? entry.cadence;
          const weeklyHrs =
            effectiveCardCadence === "daily"
              ? entry.hoursPerDay * workDaysPerWeek
              : entry.hoursPerDay;
          const wasteHrs = weeklyHrs * (entry.avoidablePct / 100);

          return (
            <motion.div
              key={src.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="surface-card p-6 sm:p-8"
              style={{ borderLeft: "4px solid var(--color-waste)" }}
            >
              {/* Source header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl" aria-hidden="true">{src.emoji}</span>
                <h4 className="font-semibold text-sm flex-1" style={{ color: "var(--color-ink)" }}>
                  {src.label}
                </h4>
                <span
                  className="font-figures text-sm font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: wasteHrs > 0 ? "rgba(224, 62, 18, 0.08)" : "transparent",
                    color: wasteHrs > 0 ? "var(--color-waste)" : "var(--color-ink-soft)",
                  }}
                >
                  = {wasteHrs.toFixed(1)} hrs/wk waste
                </span>
              </div>

              {/* Hours slider */}
              <div className="mb-4">
                {(() => {
                  const effectiveCadence = weighCadence ?? entry.cadence;
                  const maxDaily = Math.round(workHoursPerWeek / workDaysPerWeek);
                  const maxVal = effectiveCadence === "daily" ? maxDaily : workHoursPerWeek;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>
                          Hours per {effectiveCadence === "daily" ? "day" : "week"}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={maxVal}
                          step={0.25}
                          value={entry.hoursPerDay || ""}
                          placeholder="0"
                          aria-label={`Hours per ${effectiveCadence === "daily" ? "day" : "week"} for ${src.label}`}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setEntry(src.slug, { hoursPerDay: Math.max(0, Math.min(maxVal, val)) });
                          }}
                          className="w-16 text-right text-sm font-bold font-figures bg-transparent border-b-2 focus:outline-none px-1 py-0.5"
                          style={{ borderColor: "var(--color-waste)", color: "var(--color-ink)" }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxVal}
                        step={0.25}
                        value={entry.hoursPerDay}
                        aria-label={`Hours per ${effectiveCadence === "daily" ? "day" : "week"} slider for ${src.label}`}
                        aria-valuemin={0}
                        aria-valuemax={maxVal}
                        aria-valuenow={entry.hoursPerDay}
                        onChange={(e) => setEntry(src.slug, { hoursPerDay: Number(e.target.value) })}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-waste) ${
                            (entry.hoursPerDay / maxVal) * 100
                          }%, var(--color-line) ${
                            (entry.hoursPerDay / maxVal) * 100
                          }%)`,
                        }}
                      />
                    </>
                  );
                })()}
              </div>

              {/* Avoidable buttons */}
              <div className="mb-2">
                <span className="text-xs font-medium block mb-2" style={{ color: "var(--color-ink-soft)" }}>
                  Of this time, how much could you actually cut?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { label: "All of it", emoji: "🟢", pct: 100 },
                    { label: "About half", emoji: "🟡", pct: 50 },
                    { label: "A little", emoji: "🔴", pct: 25 },
                  ] as const).map((opt) => (
                    <button
                      key={opt.pct}
                      type="button"
                      onClick={() => setEntry(src.slug, { avoidablePct: opt.pct })}
                      aria-pressed={entry.avoidablePct === opt.pct}
                      aria-label={`${opt.label} (${opt.pct}% avoidable)`}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all duration-100"
                      style={{
                        border: entry.avoidablePct === opt.pct
                          ? "2px solid var(--color-waste)"
                          : "2px solid var(--color-line)",
                        backgroundColor: entry.avoidablePct === opt.pct
                          ? "rgba(224, 62, 18, 0.06)"
                          : "transparent",
                        color: entry.avoidablePct === opt.pct
                          ? "var(--color-ink)"
                          : "var(--color-ink-soft)",
                      }}
                    >
                      <span className="text-lg" aria-hidden="true">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zero confirmation */}
              {entry.hoursPerDay === 0 && !confirmedZeros.has(src.slug) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <span className="text-sm" aria-hidden="true">{"😬"}</span>
                  <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                    Really zero?
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmedZeros((prev) => new Set([...prev, src.slug]))
                    }
                    className="text-xs font-semibold underline"
                    style={{ color: "var(--color-waste)" }}
                  >
                    Yes, skip it
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Over-allocation warning */}
      {isOverAllocated && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-5 mb-8 flex items-start gap-3"
          style={{
            borderLeft: "4px solid var(--color-waste)",
            backgroundColor: "rgba(224, 62, 18, 0.06)",
          }}
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">😬</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-waste)" }}>
              Your waste hours ({totalWaste.toFixed(1)} hrs) exceed your work week ({workHoursPerWeek} hrs).
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-ink-soft)" }}>
              Go back and adjust your time estimates above before continuing.
            </p>
          </div>
        </motion.div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-150"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          ← Back
        </button>
        <ShimmerButton
          disabled={isOverAllocated || !weighCadence}
          onClick={handleCompute}
          borderRadius="12px"
          background={isOverAllocated || !weighCadence ? "var(--color-ink-soft)" : "var(--color-reclaim)"}
          className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <AnimatedEmoji emoji={"🤯"} animation="pop" size="sm" />
            See your results
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
}
