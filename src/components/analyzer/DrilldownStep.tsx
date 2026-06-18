"use client";

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import {
  wasteSourcesForRole,
  groupWasteSources,
  benchmarkCategoryFor,
  type WasteSource,
} from "@/lib/data/waste-sources";
import {
  BENCHMARKS,
  isSurfaceable,
  type RoleSlug,
} from "@/lib/data/benchmarks";
import { runAudit, type ChainEntry } from "@/lib/engine/audit-logic";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

/**
 * Build a benchmark map: category slug -> typical weekly hours.
 * Copied from WeighStep to restore benchmark comparisons in ResultsView.
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
      if (!map.has(b.categorySlug) || hours > map.get(b.categorySlug)!) {
        map.set(b.categorySlug, hours);
      }
    }
  }
  return map;
}

interface DrilldownStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function DrilldownStep({ onNext, onBack }: DrilldownStepProps) {
  const vitalCategories = useAuditStore((s) => s.vitalCategories);
  const categoryEstimates = useAuditStore((s) => s.categoryEstimates);
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const secondaryRoles = useAuditStore((s) => s.secondaryRoles);
  const activeSources = useAuditStore((s) => s.activeSources);
  const addSource = useAuditStore((s) => s.addSource);
  const removeSource = useAuditStore((s) => s.removeSource);
  const entries = useAuditStore((s) => s.entries);
  const setEntry = useAuditStore((s) => s.setEntry);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);
  const workDaysPerWeek = useAuditStore((s) => s.workDaysPerWeek);
  const payMode = useAuditStore((s) => s.payMode);
  const salary = useAuditStore((s) => s.salary);
  const hourlyRate = useAuditStore((s) => s.hourlyRate);
  const setParetoResult = useAuditStore((s) => s.setParetoResult);

  const allSources = useMemo(() => {
    if (!roleSlug) return [];
    const primary = wasteSourcesForRole(roleSlug as RoleSlug);
    if (secondaryRoles.length === 0) return primary;
    const seen = new Set(primary.map((s) => s.slug));
    const merged = [...primary];
    for (const sr of secondaryRoles) {
      for (const src of wasteSourcesForRole(sr)) {
        if (!seen.has(src.slug)) {
          seen.add(src.slug);
          merged.push(src);
        }
      }
    }
    return merged;
  }, [roleSlug, secondaryRoles]);

  const vitalGroups = useMemo(() => {
    const grouped = groupWasteSources(allSources);
    return grouped.filter((g) => vitalCategories.includes(g.group));
  }, [allSources, vitalCategories]);

  // Custom source input state per group
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [addedFlash, setAddedFlash] = useState<Record<string, boolean>>({});
  const customInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const activeSet = useMemo(
    () => new Set(activeSources.map((s) => s.slug)),
    [activeSources],
  );

  const toggleSource = (source: WasteSource) => {
    if (activeSet.has(source.slug)) {
      removeSource(source.slug);
    } else {
      addSource(source);
    }
  };

  const handleAddCustom = (groupName: string) => {
    const label = (customInputs[groupName] ?? "").trim();
    if (!label) return;
    const slug = `custom-${Date.now()}-${label.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`;
    const customSource: WasteSource = {
      slug,
      group: groupName,
      label,
      muda: "over-processing",
      whatCounts: "Custom drain added by you",
      scope: "universal",
      emoji: "🔧",
    };
    addSource(customSource);
    // Clear input and show flash
    setCustomInputs((prev) => ({ ...prev, [groupName]: "" }));
    setAddedFlash((prev) => ({ ...prev, [groupName]: true }));
    setTimeout(() => {
      setAddedFlash((prev) => ({ ...prev, [groupName]: false }));
    }, 1500);
    // Re-focus the input for multi-entry
    setTimeout(() => {
      customInputRefs.current[groupName]?.focus();
    }, 50);
  };

  // Running total of detailed hours
  const totalDetailed = useMemo(() => {
    return activeSources.reduce((sum, src) => {
      const e = entries[src.slug];
      return sum + (e?.hoursPerDay ?? 0);
    }, 0);
  }, [activeSources, entries]);

  // Per-category totals for validation against estimates
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const group of vitalGroups) {
      let sum = 0;
      for (const source of group.sources) {
        if (activeSet.has(source.slug)) {
          sum += entries[source.slug]?.hoursPerDay ?? 0;
        }
      }
      // Include custom sources for this group
      for (const src of activeSources) {
        if (src.slug.startsWith("custom-") && src.group === group.group) {
          sum += entries[src.slug]?.hoursPerDay ?? 0;
        }
      }
      totals[group.group] = sum;
    }
    return totals;
  }, [vitalGroups, activeSet, entries, activeSources]);

  const handleCompute = () => {
    const chainEntries: ChainEntry[] = activeSources.reduce<ChainEntry[]>(
      (acc, src) => {
        const e = entries[src.slug];
        if (!e || e.hoursPerDay === 0) return acc;
        acc.push({
          slug: src.slug,
          label: src.label,
          hours: e.hoursPerDay, // Already weekly
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

    setParetoResult(result);
    onNext();
  };

  const hasEntries = activeSources.some((src) => {
    const e = entries[src.slug];
    return e && e.hoursPerDay > 0;
  });

  // Check if any category's detailed hours exceed its estimate
  const hasOverflowCategory = useMemo(() => {
    return vitalGroups.some((group) => {
      const estimate = categoryEstimates[group.group] ?? 0;
      const detailed = categoryTotals[group.group] ?? 0;
      return estimate > 0 && detailed > estimate;
    });
  }, [vitalGroups, categoryEstimates, categoryTotals]);

  if (vitalCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-5xl" aria-hidden="true">🤔</span>
        <p className="text-lg" style={{ color: "var(--color-ink-soft)" }}>
          No categories to drill into. Go back and estimate your time first.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          &larr; Back to estimates
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Let&apos;s zoom into the big ones
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          These are your biggest time sinks. Check the ones that hit hardest and estimate how much they cost you.
        </p>

      </div>

      {/* Sticky floating counter — visible while scrolling, tight to content */}
      {totalDetailed > 0 && (
        <div
          className="sticky top-4 z-40 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full shadow-md mx-auto w-fit mb-4"
          style={{
            backgroundColor: "var(--color-card)",
            border: "2px solid var(--color-waste)",
            boxShadow: "0 4px 16px rgba(224, 62, 18, 0.12)",
          }}
        >
          <span className="font-figures font-bold text-2xl" style={{ color: "var(--color-waste)" }}>
            {totalDetailed.toFixed(1)}
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--color-waste)" }}>
            hrs/week of waste spotted
          </span>
        </div>
      )}

      <div className="space-y-6 mb-8">
        {vitalGroups.map((group, gi) => (
          <motion.div
            key={group.group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
            className="surface-card p-6"
            style={{ borderLeft: "4px solid var(--color-waste)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold text-base"
                style={{
                  fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                  color: "var(--color-ink)",
                }}
              >
                {group.group}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-figures font-bold px-2 py-1 rounded"
                  style={{
                    backgroundColor: "rgba(224, 62, 18, 0.08)",
                    color: "var(--color-waste)",
                  }}
                >
                  ~{(categoryEstimates[group.group] ?? 0).toFixed(0)} hrs/wk estimated
                </span>
                {(categoryTotals[group.group] ?? 0) > 0 && (
                  <span
                    className="text-xs font-figures font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: (categoryTotals[group.group] ?? 0) > (categoryEstimates[group.group] ?? 0) * 1.5
                        ? "rgba(224, 62, 18, 0.12)"
                        : "rgba(196, 24, 106, 0.08)",
                      color: (categoryTotals[group.group] ?? 0) > (categoryEstimates[group.group] ?? 0) * 1.5
                        ? "var(--color-waste)"
                        : "var(--color-reclaim)",
                    }}
                  >
                    {(categoryTotals[group.group] ?? 0).toFixed(1)} hrs detailed
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {group.sources.map((source) => {
                const isActive = activeSet.has(source.slug);
                const entry = entries[source.slug];
                return (
                  <div key={source.slug}>
                    <label className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.03)]">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleSource(source)}
                        className="mt-0.5 w-4.5 h-4.5 rounded accent-[var(--color-waste)] flex-shrink-0"
                      />
                      <span className="flex-shrink-0 text-base" aria-hidden="true">
                        {source.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-sm font-medium leading-tight block"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {source.label}
                        </span>
                        <span
                          className="text-xs leading-snug block mt-0.5"
                          style={{ color: "var(--color-ink-soft)" }}
                        >
                          {source.whatCounts}
                        </span>
                      </div>
                    </label>

                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="ml-12 mt-1 mb-2 flex items-center gap-2"
                      >
                        <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                          hrs/week:
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={workHoursPerWeek}
                          step={0.25}
                          value={entry?.hoursPerDay || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setEntry(source.slug, {
                              hoursPerDay: Math.max(0, Math.min(workHoursPerWeek, val)),
                              avoidablePct: 100,
                              cadence: "weekly",
                            });
                          }}
                          className="w-16 text-right text-sm font-bold font-figures bg-transparent border-b-2 focus:outline-none px-1 py-0.5"
                          style={{
                            borderColor: "var(--color-waste)",
                            color: "var(--color-ink)",
                          }}
                          aria-label={`Hours per week for ${source.label}`}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}

              {/* Custom source: also render any custom sources already added for this group */}
              {activeSources
                .filter((s) => s.slug.startsWith("custom-") && s.group === group.group)
                .map((source) => {
                  const entry = entries[source.slug];
                  return (
                    <div key={source.slug}>
                      <label className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(0,0,0,0.03)]">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleSource(source)}
                          className="mt-0.5 w-4.5 h-4.5 rounded accent-[var(--color-waste)] flex-shrink-0"
                        />
                        <span className="flex-shrink-0 text-base" aria-hidden="true">
                          {source.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-sm font-medium leading-tight block"
                            style={{ color: "var(--color-ink)" }}
                          >
                            {source.label}
                          </span>
                          <span
                            className="text-xs leading-snug block mt-0.5 italic"
                            style={{ color: "var(--color-reclaim)" }}
                          >
                            Your custom drain
                          </span>
                        </div>
                      </label>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="ml-12 mt-1 mb-2 flex items-center gap-2"
                      >
                        <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                          hrs/week:
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={workHoursPerWeek}
                          step={0.25}
                          value={entry?.hoursPerDay || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setEntry(source.slug, {
                              hoursPerDay: Math.max(0, Math.min(workHoursPerWeek, val)),
                              avoidablePct: 100,
                              cadence: "weekly",
                            });
                          }}
                          className="w-16 text-right text-sm font-bold font-figures bg-transparent border-b-2 focus:outline-none px-1 py-0.5"
                          style={{
                            borderColor: "var(--color-waste)",
                            color: "var(--color-ink)",
                          }}
                          aria-label={`Hours per week for ${source.label}`}
                        />
                      </motion.div>
                    </div>
                  );
                })}

              {/* Per-category warning when detailed hours exceed estimate */}
              {(categoryTotals[group.group] ?? 0) > (categoryEstimates[group.group] ?? 0) && (categoryEstimates[group.group] ?? 0) > 0 && (
                <div
                  className="mt-2 p-3 rounded-md flex items-start gap-2 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(224, 62, 18, 0.10)", color: "var(--color-waste)", border: "1px solid var(--color-waste)" }}
                >
                  <span aria-hidden="true">😤</span>
                  <span>
                    Your detailed total ({(categoryTotals[group.group] ?? 0).toFixed(1)} hrs) exceeds your {(categoryEstimates[group.group] ?? 0).toFixed(0)}-hr estimate for {group.group}. Reduce hours here or go back and raise your estimate.
                  </span>
                </div>
              )}

              {/* Add custom drain input */}
              <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px dashed var(--color-line)" }}>
                <span className="text-base flex-shrink-0" aria-hidden="true">🔧</span>
                <input
                  ref={(el) => { customInputRefs.current[group.group] = el; }}
                  type="text"
                  value={customInputs[group.group] ?? ""}
                  placeholder="Add your own drain..."
                  onChange={(e) =>
                    setCustomInputs((prev) => ({ ...prev, [group.group]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustom(group.group);
                    }
                  }}
                  className="flex-1 text-sm bg-transparent border-b-2 focus:outline-none px-1 py-1.5"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink)",
                  }}
                  aria-label={`Add a custom drain to ${group.group}`}
                />
                <button
                  type="button"
                  onClick={() => handleAddCustom(group.group)}
                  disabled={!(customInputs[group.group] ?? "").trim()}
                  className="px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-30"
                  style={{
                    backgroundColor: "var(--color-reclaim)",
                    color: "#fff",
                  }}
                >
                  {addedFlash[group.group] ? "Added!" : "+ Add"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {totalDetailed > workHoursPerWeek && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-4 mb-6 flex items-start gap-3"
          style={{
            borderLeft: "4px solid var(--color-waste)",
            backgroundColor: "rgba(224, 62, 18, 0.06)",
          }}
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">😬</span>
          <p className="text-sm" style={{ color: "var(--color-waste)" }}>
            Your detailed total ({totalDetailed.toFixed(1)} hrs) exceeds your {workHoursPerWeek}-hour week. Double-check the estimates above.
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          &larr; Back
        </button>
        <div className="text-right">
          {activeSources.length > 0 && !hasEntries && (
            <p className="text-xs mb-1" style={{ color: "var(--color-ink-soft)" }}>
              Enter hours for at least one drain to continue
            </p>
          )}
          {hasOverflowCategory && (
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-waste)" }}>
              Detailed hours can&apos;t exceed your category estimate &mdash; reduce them to continue
            </p>
          )}
          <ShimmerButton
            disabled={!hasEntries || hasOverflowCategory}
            onClick={handleCompute}
            borderRadius="12px"
            background={hasEntries && !hasOverflowCategory ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
            className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <AnimatedEmoji emoji="🤯" animation="pop" size="sm" />
              Show me the damage
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
