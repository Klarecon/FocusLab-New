"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import {
  wasteSourcesForRole,
  benchmarkCategoryFor,
  wasteTypeForMuda,
  WASTE_TYPES,
  type WasteSource,
} from "@/lib/data/waste-sources";
import { BENCHMARKS, isSurfaceable, type RoleSlug } from "@/lib/data/benchmarks";
import { runAudit, type ChainEntry } from "@/lib/engine/audit-logic";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

/**
 * Merged "Log your waste" step (Oren-redesign — Option C, "guided one-pass").
 * Collapses the old rough-estimate (IntakeStep) + drill-down (DrilldownStep)
 * into ONE screen: drains are grouped under the four waste types, you tap the
 * ones that hit you, and rough in the hours inline. Pareto runs straight off
 * the entered hours — no two-pass funnel.
 */

// Replicated from WeighStep/DrilldownStep so the merged screen feeds the same
// benchmark comparisons into ResultsView.
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

interface LogStepProps {
  onNext: () => void;
  onBack: () => void;
}

const MIN_DRAINS = 5;

export default function LogStep({ onNext, onBack }: LogStepProps) {
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

  // All drains for the role(s), de-duped by slug.
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

  // Group drains under the four user-facing waste types.
  const byType = useMemo(
    () =>
      WASTE_TYPES.map((t) => ({
        type: t,
        sources: allSources.filter((s) => wasteTypeForMuda(s.muda).key === t.key),
      })).filter((g) => g.sources.length > 0),
    [allSources],
  );

  const activeSet = useMemo(
    () => new Set(activeSources.map((s) => s.slug)),
    [activeSources],
  );

  const toggleSource = (source: WasteSource) => {
    if (activeSet.has(source.slug)) {
      removeSource(source.slug);
    } else {
      // No seed hours (S21 #3): an auto-1.0 on every pick made everyone's data
      // flat, so Pareto collapsed to 2 zones (no "middle"). Leave it blank — the
      // user types the real number, real numbers vary, A/B/C populate naturally.
      addSource(source);
    }
  };

  const total = useMemo(
    () =>
      activeSources.reduce((sum, src) => sum + (entries[src.slug]?.hoursPerDay ?? 0), 0),
    [activeSources, entries],
  );
  const drainsWithHours = activeSources.filter(
    (src) => (entries[src.slug]?.hoursPerDay ?? 0) > 0,
  ).length;
  const hasEnoughDrains = drainsWithHours >= MIN_DRAINS;

  // Add-your-own drain (Scene 8 ask). Lands under a chosen type.
  const [customText, setCustomText] = useState("");
  const [customTypeKey, setCustomTypeKey] = useState(WASTE_TYPES[0].key);
  const customRef = useRef<HTMLInputElement>(null);
  const addCustom = () => {
    const label = customText.trim();
    if (!label) return;
    const typeMeta = WASTE_TYPES.find((t) => t.key === customTypeKey) ?? WASTE_TYPES[0];
    const slug = `custom-${Date.now()}-${label.toLowerCase().replace(/\s+/g, "-").slice(0, 24)}`;
    const src: WasteSource = {
      slug,
      group: typeMeta.name,
      label,
      muda: typeMeta.muda[0],
      whatCounts: "Custom drain added by you",
      scope: "universal",
      emoji: "🔧",
    };
    addSource(src);
    // No seed hours (S21 #3) — user types the real number on the chip.
    setCustomText("");
    setTimeout(() => customRef.current?.focus(), 50);
  };

  const handleCompute = () => {
    const chainEntries: ChainEntry[] = activeSources.reduce<ChainEntry[]>((acc, src) => {
      const e = entries[src.slug];
      if (!e || e.hoursPerDay === 0) return acc;
      acc.push({
        slug: src.slug,
        label: src.label,
        hours: e.hoursPerDay, // weekly
        cadence: "week",
        whatCounts: src.whatCounts,
        isCustom: src.slug.startsWith("custom-"),
      });
      return acc;
    }, []);

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

  const nearWholeWeek = total >= workHoursPerWeek * 0.9 && total <= workHoursPerWeek;

  return (
    <div>
      <div className="text-center mb-6">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Log your waste
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Tap what drains you, then rough in the hours. Takes about 90 seconds.
        </p>
      </div>

      {/* Sticky running total */}
      {total > 0 && (
        <div
          className="sticky top-4 z-40 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full shadow-md mx-auto w-fit mb-6"
          style={{
            backgroundColor: "var(--color-card)",
            border: "2px solid var(--color-waste)",
            boxShadow: "0 4px 16px rgba(224, 62, 18, 0.12)",
          }}
        >
          <span className="font-figures font-bold text-2xl" style={{ color: "var(--color-waste)" }}>
            {total.toFixed(1)}
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--color-waste)" }}>
            hrs/week flagged
          </span>
        </div>
      )}

      <div className="space-y-7 mb-6">
        {byType.map((group, gi) => (
          <motion.div
            key={group.type.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.06 }}
          >
            {/* Type header — name only (no escape-hatch subcopy, per Mona). */}
            <h3
              className="text-sm font-extrabold uppercase tracking-wider pb-2 mb-3"
              style={{ color: "var(--color-ink)", borderBottom: "1.5px solid var(--color-line)" }}
            >
              {group.type.name}
            </h3>

            <div className="flex flex-wrap gap-2">
              {group.sources.map((src) => {
                const isOn = activeSet.has(src.slug);
                return (
                  <div
                    key={src.slug}
                    data-testid="drain-chip"
                    onClick={() => toggleSource(src)}
                    className="inline-flex items-center gap-2 rounded-xl border transition-all duration-150 cursor-pointer px-3 py-2"
                    style={{
                      borderColor: isOn ? "var(--color-reclaim)" : "var(--color-line)",
                      backgroundColor: isOn ? "rgba(196, 24, 106, 0.06)" : "var(--color-card)",
                      borderWidth: isOn ? "2px" : "1.5px",
                    }}
                  >
                    <span
                      className="w-5 h-5 rounded-full inline-flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: isOn ? "var(--color-reclaim)" : "transparent",
                        border: isOn ? "none" : "2px solid var(--color-line)",
                        color: "#fff",
                      }}
                      aria-hidden="true"
                    >
                      {isOn ? "✓" : "+"}
                    </span>
                    <span aria-hidden="true">{src.emoji}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                      {src.label}
                    </span>
                    {isOn && (
                      <span
                        className="inline-flex items-center gap-1 ml-1 pl-2"
                        style={{ borderLeft: "1px solid var(--color-line)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          min={0}
                          max={workHoursPerWeek}
                          step={0.5}
                          value={entries[src.slug]?.hoursPerDay || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const v = e.target.value === "" ? 0 : Number(e.target.value);
                            setEntry(src.slug, {
                              hoursPerDay: Math.max(0, Math.min(workHoursPerWeek, v)),
                              avoidablePct: 100,
                              cadence: "weekly",
                            });
                          }}
                          className="w-12 text-right text-sm font-bold font-figures bg-transparent border-b-2 focus:outline-none"
                          style={{ borderColor: "var(--color-waste)", color: "var(--color-ink)" }}
                          aria-label={`Hours per week for ${src.label}`}
                        />
                        <span className="text-[11px]" style={{ color: "var(--color-ink-soft)" }}>
                          hrs/wk
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add your own drain */}
      <div
        className="flex flex-wrap items-center gap-2 p-3 rounded-xl mb-6"
        style={{ border: "1.5px dashed var(--color-reclaim)", backgroundColor: "rgba(196, 24, 106, 0.03)" }}
      >
        <input
          ref={customRef}
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Add your own drain…"
          className="flex-1 min-w-[160px] text-sm bg-transparent border-b-2 focus:outline-none px-1 py-1"
          style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
          aria-label="Add your own drain"
        />
        <select
          value={customTypeKey}
          onChange={(e) => setCustomTypeKey(e.target.value as typeof customTypeKey)}
          className="text-xs px-2 py-1.5 rounded border"
          style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-paper)", color: "var(--color-ink)" }}
          aria-label="Waste type for your custom drain"
        >
          {WASTE_TYPES.map((t) => (
            <option key={t.key} value={t.key}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={addCustom}
          disabled={!customText.trim()}
          className="px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-reclaim)", color: "#fff" }}
        >
          + Add
        </button>
      </div>

      {/* Whole-week heads-up */}
      {nearWholeWeek && (
        <div
          role="alert"
          className="surface-card p-4 mb-6 flex items-start gap-3"
          style={{ borderLeft: "4px solid var(--color-gold)", backgroundColor: "rgba(237, 178, 21, 0.07)" }}
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">🤔</span>
          <p className="text-sm" style={{ color: "var(--color-ink)" }}>
            That&apos;s nearly your whole week ({total.toFixed(1)} of {workHoursPerWeek} hrs) marked as waste. Most weeks aren&apos;t all drain &mdash; worth a quick double-check before we dig in.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          &larr; Back
        </button>
        <div className="text-right">
          {!hasEnoughDrains && (
            <p className="text-xs mb-1" style={{ color: "var(--color-ink-soft)" }}>
              You&apos;ve put hours on {drainsWithHours} {drainsWithHours === 1 ? "drain" : "drains"}. Add real hours to at least {MIN_DRAINS} &mdash; the pattern only shows when the numbers vary, so we can map your vital few.
            </p>
          )}
          <ShimmerButton
            disabled={!hasEnoughDrains}
            onClick={handleCompute}
            borderRadius="12px"
            background={hasEnoughDrains ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
            className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <AnimatedEmoji emoji="🤯" animation="pop" size="sm" />
              See what&apos;s eating my week
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
