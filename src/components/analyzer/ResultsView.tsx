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
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Highlighter } from "@/components/ui/highlighter";
import { wasteSourceBySlug } from "@/lib/data/waste-sources";
import { useIsMobile } from "@/hooks/useIsMobile";

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

/** Human-readable short labels for chart axis. Hand-written rewrites for known long labels. */
const SHORT_LABELS: Record<string, string> = {
  "Meetings you weren\u2019t needed in": "Unneeded meetings",
  "Recurring status update meetings": "Status meetings",
  "Standing meetings that outlived their purpose": "Stale standups",
  "Meetings that run longer than needed": "Overlong meetings",
  "Triaging low-value email & CC chains": "Email triage",
  "Noisy group threads and reply-all chains": "Noisy threads",
  "Chasing people for status updates": "Status chasing",
  "Updating trackers & docs by hand": "Manual trackers",
  "Switching between too many tools": "Tool switching",
  "Hunting for info you already have": "Info hunting",
  "Re-finding your place after interruptions": "Refinding focus",
  "Waiting on an approval or sign-off": "Waiting on approval",
  "Blocked on a handoff from someone else": "Blocked on handoff",
  "Redoing work from unclear direction": "Unclear direction redo",
  "Doing work that was already done": "Duplicate work",
  "Over-polishing and gold-plating work": "Over-polishing",
  "Juggling several tasks at once": "Multitasking",
  "Tasks stalled by missing inputs or access": "Stalled tasks",
  "Low-value busywork while real work waits": "Low-value busywork",
  "Manual, repetitive data entry": "Manual data entry",
  "Forms, expenses, and timesheets": "Forms & timesheets",
  "1:1s & reviews running on autopilot": "Autopilot 1:1s",
  "Doing IC work instead of managing": "IC work as manager",
  "Low-stakes approvals routed through you": "Low-stakes approvals",
  "Fielding \u201Cgot a sec?\u201D requests all day": "Got-a-sec requests",
  "Replying to routine mail personally": "Routine replies",
  "Re-checking your team\u2019s work": "Rechecking team work",
  "Decisions routed through you that needn\u2019t be": "Unnecessary approvals",
  "Context-switching between every function": "Context switching",
  "Inbox overload from every direction": "Inbox overload",
  "Redoing work you delegated": "Redoing delegated work",
  "Prep and follow-up for investor updates": "Investor prep",
  "Being the bottleneck for every decision": "Decision bottleneck",
  "Unplanned escalations & urgent asks": "Unplanned escalations",
  "Waiting on brand or legal sign-off": "Brand/legal sign-off",
  "Debugging code you didn\u2019t write": "Debugging others' code",
  "Switching between repos, tickets, and Slack": "Repo/ticket switching",
  "Waiting on deploys and CI pipelines": "CI/deploy waiting",
  "Code reviews piling up in your queue": "PR review backlog",
  "Fixing local dev environment issues": "Dev env fixes",
  "Doing code reviews for others": "Reviewing others' code",
  "Refactoring brittle or unclear code": "Refactoring debt",
  "Resolving merge conflicts": "Merge conflicts",
  "Working around brittle, undocumented code": "Tech debt workarounds",
  "Rebuilding from specs that changed": "Spec change rebuilds",
  "Finished code waiting in the review queue": "PR queue waiting",
  "Waiting on slow or flaky builds": "Flaky builds",
  "Fixing broken environments & setup": "Broken env fixes",
  "Running processes that should be automated": "Manual processes",
  "Chasing vendors and suppliers for updates": "Vendor chasing",
  "Handling exceptions and edge cases by hand": "Manual exceptions",
  "Compiling operational reports from multiple sources": "Report compiling",
  "Dropping planned work for urgent fires": "Firefighting",
};

function abbreviate(str: string): string {
  return SHORT_LABELS[str] ?? (str.length > 22 ? str.slice(0, str.lastIndexOf(" ", 22) || 22) : str);
}

/* --- Severity tiers --- */

function severityReaction(hoursPerWeek: number) {
  if (hoursPerWeek <= 0) {
    return {
      emoji: "🤔",
      text: "Your inputs didn't surface any avoidable waste",
    };
  }
  if (hoursPerWeek < 1) {
    return {
      emoji: "😌",
      text: `Only ${fmtHours(hoursPerWeek)} hours/week — you're in pretty good shape`,
    };
  }
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
  const isMobile = useIsMobile();

  // Scroll to top when results first appear
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dramatic reveal state
  const [phase, setPhase] = useState<"dark" | "reveal" | "full">("dark");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 500);
    const t2 = setTimeout(() => setPhase("full"), 3500);
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
  const hasWaste = totalHours > 0;
  const hasCost = totalCost > 0;
  const severity = severityReaction(totalHours);
  const vitalFew = paretoResult.categories.filter((c) => c.isVitalFew);
  const safeWorkHours = workHoursPerWeek > 0 ? workHoursPerWeek : 1; // guard division by zero

  // Chart data from the engine result
  const chartData = useMemo(() => {
    const zoneBySlug = new Map(paretoResult.categories.map((c) => [c.categorySlug, c.zone]));
    return paretoResult.chart.map((pt) => ({
      name: abbreviate(pt.label ?? pt.categorySlug),
      hours: pt.hours,
      cumulative: pt.cumulativePercent,
      zone: zoneBySlug.get(pt.categorySlug) ?? "C",
      slug: pt.categorySlug,
    }));
  }, [paretoResult]);

  return (
    <div className="relative">
      {/* -- DRAMATIC REVEAL OVERLAY -- */}
      <AnimatePresence>
        {phase !== "full" && (
          <motion.div
            aria-live="assertive"
            aria-atomic="true"
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
                  {hasWaste && hasCost ? (
                    <>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <AnimatedEmoji emoji={"💸"} animation="explode" size="xl" />
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-figures leading-none"
                        style={{
                          color: "#c4186a",
                          textShadow: "0 0 60px rgba(196, 24, 106, 0.3)",
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
                    </>
                  ) : hasWaste ? (
                    <>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <AnimatedEmoji emoji={"😬"} animation="shake" size="xl" />
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-figures leading-none"
                        style={{
                          color: "#c4186a",
                          textShadow: "0 0 60px rgba(196, 24, 106, 0.3)",
                        }}
                      >
                        {fmtHours(totalHours)} hrs/week
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-xl"
                        style={{ color: "rgba(243, 237, 225, 0.7)" }}
                      >
                        of avoidable waste every week.
                      </motion.p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <AnimatedEmoji emoji={"🤔"} animation="shake" size="xl" />
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl font-bold leading-tight"
                        style={{
                          color: "rgba(243, 237, 225, 0.9)",
                        }}
                      >
                        No avoidable waste found
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-xl"
                        style={{ color: "rgba(243, 237, 225, 0.7)" }}
                      >
                        Either you&apos;re incredibly efficient, or the estimates were too conservative.
                      </motion.p>
                    </>
                  )}
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
          {hasWaste ? (
            <>
              <h2
                className="font-figures font-bold mb-3 text-2xl sm:text-4xl md:text-5xl"
                style={{ color: "var(--color-waste)" }}
              >
                {hasCost ? (
                  <Highlighter action="circle" color="var(--color-waste)" strokeWidth={2} padding={12} isView>
                    {fmtDollars(totalCost)}/year
                  </Highlighter>
                ) : (
                  <Highlighter action="circle" color="var(--color-waste)" strokeWidth={2} padding={12} isView>
                    {fmtHours(totalHours)} hrs/week
                  </Highlighter>
                )}
              </h2>
              <p className="text-xl font-medium" style={{ color: "var(--color-ink-soft)" }}>
                {severity.text}
              </p>
              <p className="text-base mt-2 font-medium" style={{ color: "var(--color-ink-soft)" }}>
                {fmtHours(totalHours)} hrs/week of avoidable waste &middot;{" "}
                <span style={{ color: "var(--color-waste)", fontWeight: 700 }}>
                  {Math.min(100, Math.round((totalHours / safeWorkHours) * 100))}%
                </span>{" "}
                of your work week
              </p>
            </>
          ) : (
            <>
              <h2
                className="font-bold mb-3 text-3xl sm:text-4xl"
                style={{
                  fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                  color: "var(--color-ink)",
                }}
              >
                No avoidable waste detected
              </h2>
              <p className="text-base font-medium" style={{ color: "var(--color-ink-soft)" }}>
                All your time entries came out at zero avoidable hours. That&apos;s either great news
                or a sign the estimates were too conservative. Try adjusting the avoidable
                percentages and re-running.
              </p>
            </>
          )}
        </div>

        {/* -- PARETO CHART -- */}
        {hasWaste && (
        <div className="surface-card p-4 sm:p-6 mb-10">
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
            Where your time goes
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--color-ink-soft)" }}>
            Bars = hours/week wasted on each drain. Line = running total. The red bars are your biggest offenders.
          </p>
          {/* Screen reader accessible data */}
          <table className="sr-only">
            <caption>Waste hours per week by source</caption>
            <thead>
              <tr><th>Source</th><th>Hours/week</th><th>Cumulative %</th><th>Zone</th></tr>
            </thead>
            <tbody>
              {chartData.map((pt) => (
                <tr key={pt.slug}>
                  <td>{pt.name}</td>
                  <td>{pt.hours.toFixed(1)}</td>
                  <td>{pt.cumulative.toFixed(0)}%</td>
                  <td>Zone {pt.zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ width: "100%", height: isMobile ? 300 : 420 }} aria-hidden="true">
            <ResponsiveContainer>
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: isMobile ? 10 : 30, left: 0, bottom: isMobile ? 70 : 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--color-ink-soft)" }}
                  tickFormatter={(name: string) => abbreviate(name)}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={isMobile ? 80 : 110}
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
        )}

        {/* -- SCORECARD: VITAL FEW -- */}
        {vitalFew.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-5" style={{ color: "var(--color-ink)" }}>
            <Highlighter action="underline" color="var(--color-waste)" isView>
              {vitalFew.length === 1 ? "Your #1 Drain" : "Your Biggest Drains"}
            </Highlighter>
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
                  className="surface-card p-4 sm:p-6"
                  style={{
                    borderLeft: "4px solid var(--color-waste)",
                    boxShadow: "0 2px 12px rgba(224, 62, 18, 0.08)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0" aria-hidden="true">{source?.emoji ?? "🔥"}</span>
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
                        <strong>{Math.round(annualHrs)} hours/year</strong>
                        {annualCost > 0 && (
                          <>
                            {" "}(
                            <strong style={{ color: "var(--color-waste)" }}>{fmtDollars(annualCost)}</strong>
                            )
                          </>
                        )}
                        .
                      </p>
                      {/* Benchmark line removed — inconsistent across drains and confusing */}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        )}

        {/* -- Useful many (Zone B) summary -- */}
        {paretoResult.categories.filter((c) => c.zone === "B").length > 0 && (
          <div className="surface-card p-4 sm:p-6 mb-10" style={{ borderLeft: "4px solid var(--color-gold)" }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: "var(--color-ink)" }}>
              <Highlighter action="underline" color="var(--color-gold)" isView>
                Also eating your time
              </Highlighter>
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

        {/* -- Trivial many (Zone C) summary -- */}
        {paretoResult.categories.filter((c) => c.zone === "C").length > 0 && (
          <div className="surface-card p-4 sm:p-6 mb-10" style={{ borderLeft: "4px solid var(--color-ink-soft)" }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: "var(--color-ink)" }}>
              <Highlighter action="underline" color="var(--color-ink-soft)" isView>
                The small stuff
              </Highlighter>
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--color-ink-soft)" }}>
              Not worth chasing individually — but they add up if you ignore them forever.
            </p>
            <div className="space-y-2">
              {paretoResult.categories
                .filter((c) => c.zone === "C")
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
                      style={{ color: "var(--color-ink-soft)" }}
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
            style={{
              borderColor: "var(--color-waste)",
              borderWidth: "1.5px",
              backgroundColor: "rgba(224, 62, 18, 0.05)",
            }}
          >
            {paretoResult.warnings.map((w) => (
              <p key={w} className="text-sm font-medium" style={{ color: "var(--color-waste)" }}>
                {"⚠️"} {w}
              </p>
            ))}
          </div>
        )}

        {/* -- Fix it CTA -- */}
        {hasWaste ? (
          <div className="text-center py-10">
            <p className="text-base mb-4 font-medium" style={{ color: "var(--color-ink-soft)" }}>
              This is fixable.
            </p>
            <Link href="/focus" className="no-underline inline-flex justify-center">
              <ShimmerButton
                borderRadius="12px"
                className="px-10 py-4 text-base font-bold mx-auto"
              >
                Now let&apos;s fix it &rarr;
              </ShimmerButton>
            </Link>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-base mb-2 font-medium" style={{ color: "var(--color-ink-soft)" }}>
              Try re-running the audit with adjusted estimates to surface waste worth fixing.
            </p>
          </div>
        )}

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
