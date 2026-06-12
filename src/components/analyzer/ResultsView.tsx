"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuditStore } from "@/stores/audit-store";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { wasteSourceBySlug } from "@/lib/data/waste-sources";

/* --- Formatters --- */

function fmtDollars(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function fmtHours(n: number, decimals = 1): string {
  return n.toFixed(decimals);
}

function truncate(s: string, max = 18): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/* --- Severity tiers --- */

function severityReaction(hoursPerWeek: number) {
  if (hoursPerWeek < 5) {
    return {
      emoji: "😌",
      text: `Not bad — but you can still reclaim ${fmtHours(hoursPerWeek)} hours`,
    };
  }
  if (hoursPerWeek < 15) {
    return {
      emoji: "😳",
      text: `That's a lot — ${fmtHours(hoursPerWeek)} hours every week`,
    };
  }
  if (hoursPerWeek < 25) {
    const weeksPerYear = Math.round((hoursPerWeek * 48) / 40);
    return {
      emoji: "😱",
      text: `That's ${weeksPerYear} full work weeks per year`,
    };
  }
  return {
    emoji: "💀🤯",
    text: "You need to see this",
  };
}

/* --- Zone colors --- */

function zoneColor(zone: string): string {
  switch (zone) {
    case "A":
      return "var(--color-waste)";
    case "B":
      return "var(--color-gold)";
    default:
      return "var(--color-ink-soft)";
  }
}

function zoneBorderColor(zone: string): string {
  switch (zone) {
    case "A":
      return "var(--color-waste)";
    case "B":
      return "var(--color-gold)";
    default:
      return "var(--color-line)";
  }
}

/* --- Component --- */

interface ResultsViewProps {
  onRestart: () => void;
}

export default function ResultsView({ onRestart }: ResultsViewProps) {
  const paretoResult = useAuditStore((s) => s.paretoResult);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);

  // Scroll to top when results first appear
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dramatic reveal state
  const [phase, setPhase] = useState<"dark" | "reveal" | "full">("dark");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 500);
    const t2 = setTimeout(() => setPhase("full"), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!paretoResult) {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--color-ink-soft)" }}>No results yet. Complete the audit first.</p>
      </div>
    );
  }

  const totalCost = paretoResult.totalAnnualWasteCost;
  const totalHours = paretoResult.totalWeeklyWasteHours;
  const severity = severityReaction(totalHours);
  const vitalFew = paretoResult.categories.filter((c) => c.isVitalFew);

  // Chart data from the engine result
  const chartData = useMemo(() => {
    return paretoResult.chart.map((pt) => ({
      name: truncate(pt.label ?? pt.categorySlug),
      hours: pt.hours,
      cumulative: pt.cumulativePercent,
      zone: paretoResult.categories.find((c) => c.categorySlug === pt.categorySlug)?.zone ?? "C",
      slug: pt.categorySlug,
    }));
  }, [paretoResult]);

  return (
    <div className="relative">
      {/* -- DRAMATIC REVEAL OVERLAY -- */}
      <AnimatePresence>
        {phase !== "full" && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "dark" ? 1 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
            style={{ backgroundColor: "var(--color-ink)" }}
          >
            <AnimatePresence mode="wait">
              {phase === "reveal" && (
                <motion.div
                  key="cost-reveal"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <AnimatedEmoji emoji={"💸"} animation="explode" size="xl" />
                  </div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl sm:text-6xl md:text-7xl font-bold font-figures leading-none"
                    style={{
                      color: "var(--color-waste)",
                      textShadow: "0 0 60px rgba(224, 62, 18, 0.3)",
                    }}
                  >
                    {fmtDollars(totalCost)}/year
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-xl"
                    style={{ color: "rgba(243, 237, 225, 0.7)" }}
                  >
                    That&apos;s what your waste costs.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- FULL RESULTS -- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "full" ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Headline */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AnimatedEmoji emoji={severity.emoji} animation="shake" size="xl" />
          </div>
          <h2
            className="font-figures font-bold mb-3 text-4xl sm:text-5xl"
            style={{ color: "var(--color-waste)" }}
          >
            {fmtDollars(totalCost)}/year
          </h2>
          <p className="text-xl font-medium" style={{ color: "var(--color-ink-soft)" }}>
            {severity.text}
          </p>
          <p className="text-base mt-2 font-medium" style={{ color: "var(--color-ink-soft)" }}>
            {fmtHours(totalHours)} hrs/week of avoidable waste &middot;{" "}
            <span style={{ color: "var(--color-waste)", fontWeight: 700 }}>
              {Math.round((totalHours / workHoursPerWeek) * 100)}%
            </span>{" "}
            of your work week
          </p>
        </div>

        {/* -- PARETO CHART -- */}
        <div className="surface-card p-4 sm:p-6 mb-10">
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
            Your Pareto Chart
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--color-ink-soft)" }}>
            Bars = hours/week waste. Line = cumulative %. Red bars are your vital few (Zone A).
          </p>
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                  label={{
                    value: "hrs/wk",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { fontSize: 11, fill: "var(--color-ink-soft)" },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                  label={{
                    value: "cumulative %",
                    angle: 90,
                    position: "insideRight",
                    offset: 10,
                    style: { fontSize: 11, fill: "var(--color-ink-soft)" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-line)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  formatter={(value, name) => {
                    const v = Number(value);
                    if (name === "hours") return [`${v.toFixed(1)} hrs/wk`, "Waste"];
                    return [`${v.toFixed(0)}%`, "Cumulative"];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="hours"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                  animationBegin={200}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.slug}
                      fill={zoneColor(entry.zone)}
                      style={
                        entry.zone === "A"
                          ? { filter: "drop-shadow(0 2px 8px rgba(224, 62, 18, 0.4))" }
                          : undefined
                      }
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--color-ink)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-ink)", r: 3 }}
                  animationDuration={1500}
                  animationBegin={600}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -- SCORECARD: VITAL FEW -- */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-5" style={{ color: "var(--color-ink)" }}>
            Your Vital Few (Zone A)
          </h3>
          <div className="space-y-4">
            {vitalFew.map((item, i) => {
              const source = wasteSourceBySlug(item.categorySlug);
              const annualHrs = item.annualHours;
              const annualCost = item.annualCost;
              const benchmark = item.benchmark;

              return (
                <motion.div
                  key={item.categorySlug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="surface-card p-6"
                  style={{
                    borderLeft: "4px solid var(--color-waste)",
                    boxShadow: "0 2px 12px rgba(224, 62, 18, 0.08)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{source?.emoji ?? "🔥"}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1" style={{ color: "var(--color-ink)" }}>
                        {item.label ?? item.categorySlug}
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
                        You spend{" "}
                        <strong style={{ color: "var(--color-waste)", fontSize: "1.1em" }}>
                          {fmtHours(item.hoursPerWeek)} hrs/week
                        </strong>{" "}
                        on this — that&apos;s{" "}
                        <strong>{Math.round(annualHrs)} hours/year</strong> (
                        <strong style={{ color: "var(--color-waste)" }}>{fmtDollars(annualCost)}</strong>
                        ).
                      </p>
                      {benchmark && benchmark.direction !== "at" && (
                        <p
                          className="text-sm mt-2 font-medium px-3 py-1.5 rounded-md inline-block"
                          style={{
                            color: "var(--color-gold)",
                            backgroundColor: "rgba(237, 178, 21, 0.08)",
                          }}
                        >
                          Benchmark: typical worker spends {fmtHours(benchmark.typicalHours)} hrs — you&apos;re{" "}
                          {benchmark.direction === "above"
                            ? `${fmtHours(Math.abs(benchmark.deltaHours))} hrs above`
                            : `${fmtHours(Math.abs(benchmark.deltaHours))} hrs below`}
                          .
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* -- Useful many (Zone B) summary -- */}
        {paretoResult.categories.filter((c) => c.zone === "B").length > 0 && (
          <div className="surface-card p-6 mb-10" style={{ borderLeft: "4px solid var(--color-gold)" }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: "var(--color-ink)" }}>
              The Useful Many (Zone B)
            </h3>
            <div className="space-y-2">
              {paretoResult.categories
                .filter((c) => c.zone === "B")
                .map((c) => (
                  <div
                    key={c.categorySlug}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: "var(--color-line)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                      {wasteSourceBySlug(c.categorySlug)?.emoji ?? ""}{" "}
                      {c.label ?? c.categorySlug}
                    </span>
                    <span
                      className="font-figures text-sm font-bold"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {fmtHours(c.hoursPerWeek)} hrs/wk
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* -- Warnings -- */}
        {paretoResult.warnings.length > 0 && (
          <div
            className="surface-card p-4 mb-10"
            style={{ borderColor: "var(--color-gold)", borderWidth: "1.5px" }}
          >
            {paretoResult.warnings.map((w) => (
              <p key={w} className="text-sm" style={{ color: "var(--color-gold)" }}>
                {"⚠️"} {w}
              </p>
            ))}
          </div>
        )}

        {/* -- Fix it CTA -- */}
        <div className="text-center py-10">
          <p className="text-base mb-4 font-medium" style={{ color: "var(--color-ink-soft)" }}>
            Want to prioritize what to fix first?
          </p>
          <Link
            href="/focus"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
            style={{
              backgroundColor: "var(--color-reclaim)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(196, 24, 106, 0.25)",
            }}
          >
            Fix it with Focus Table →
          </Link>
        </div>

        {/* -- Restart -- */}
        <div className="text-center pb-10">
          <button
            type="button"
            onClick={onRestart}
            className="text-sm font-medium underline transition-colors duration-150"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Start over with a fresh audit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
