"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import {
  wasteSourcesForRole,
  groupWasteSources,
  type WasteSource,
} from "@/lib/data/waste-sources";
import type { RoleSlug } from "@/lib/data/benchmarks";
import { runAudit, type ChainEntry } from "@/lib/engine/audit-logic";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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

  // Running total of detailed hours
  const totalDetailed = useMemo(() => {
    return activeSources.reduce((sum, src) => {
      const e = entries[src.slug];
      return sum + (e?.hoursPerDay ?? 0);
    }, 0);
  }, [activeSources, entries]);

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

    const result = runAudit({
      entries: chainEntries,
      workWeek: workHoursPerWeek,
      workDays: workDaysPerWeek,
      payMode: payMode === "salary" ? "salary" : "hourly",
      salary,
      hourly: hourlyRate,
      benchmarkMap: new Map(),
    });

    setParetoResult(result);
    onNext();
  };

  const hasEntries = activeSources.some((src) => {
    const e = entries[src.slug];
    return e && e.hoursPerDay > 0;
  });

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
          These categories eat most of your week. Check the specific drains and estimate hours for each.
        </p>

        {totalDetailed > 0 && (
          <motion.div
            animate={{ scale: [1.08, 1] }}
            transition={{ duration: 0.15 }}
            aria-live="polite"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
            style={{
              backgroundColor: "rgba(224, 62, 18, 0.08)",
              color: "var(--color-waste)",
            }}
          >
            <span className="font-figures font-bold text-2xl">{totalDetailed.toFixed(1)}</span>
            <span className="text-sm font-semibold">hrs/week detailed</span>
          </motion.div>
        )}
      </div>

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
              <span
                className="text-xs font-figures font-bold px-2 py-1 rounded"
                style={{
                  backgroundColor: "rgba(224, 62, 18, 0.08)",
                  color: "var(--color-waste)",
                }}
              >
                ~{(categoryEstimates[group.group] ?? 0).toFixed(0)} hrs/wk estimated
              </span>
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
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          &larr; Back
        </button>
        <ShimmerButton
          disabled={!hasEntries}
          onClick={handleCompute}
          borderRadius="12px"
          background={hasEntries ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
          className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <AnimatedEmoji emoji="🤯" animation="pop" size="sm" />
            See your results
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
}
