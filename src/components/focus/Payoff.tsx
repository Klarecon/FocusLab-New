"use client";

import { useMemo, useEffect, useState, memo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { computePayoff } from "@/lib/engine/solutions-logic";
import type {
  ChosenSolution,
  WasteBucket,
  Score,
} from "@/lib/engine/types";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Highlighter } from "@/components/ui/highlighter";

interface DrainInfo {
  slug: string;
  label: string;
  hoursPerWeek: number;
  zone: "A" | "B" | "C";
}

interface PayoffProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
  onGoToAssign?: () => void;
}

/** Animated count-up number. */
const CountUp = memo(function CountUp({
  to,
  decimals = 1,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className = "",
  style,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState("0");
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionVal, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        if (decimals === 0) {
          setDisplay(Math.round(v).toLocaleString());
        } else {
          setDisplay(v.toFixed(decimals));
        }
      },
    });
    return () => controls.stop();
  }, [to, duration, decimals, motionVal]);

  return (
    <span className={`font-figures ${className}`} style={style} aria-live="polite" aria-atomic="true">
      {prefix}
      {display}
      {suffix}
    </span>
  );
});

function formatDollars(n: number): string {
  return "$" + Math.round(n).toLocaleString();
}

export default function Payoff({ vitalFew, usefulMany, onGoToAssign }: PayoffProps) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const solutionScores = useAuditStore((s) => s.solutionScores);
  const paretoResult = useAuditStore((s) => s.paretoResult);
  const salary = useAuditStore((s) => s.salary);
  const hourlyRate = useAuditStore((s) => s.hourlyRate);
  const payMode = useAuditStore((s) => s.payMode);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);

  const drainBySlug = useMemo(() => {
    const map = new Map<string, DrainInfo>();
    for (const d of [...vitalFew, ...usefulMany]) {
      map.set(d.slug, d);
    }
    return map;
  }, [vitalFew, usefulMany]);

  // Compute effective hourly rate — use 0 when no pay info provided,
  // matching the Analyzer engine (no invented $50 fallback)
  const effectiveRate = useMemo(() => {
    if (payMode === "hourly" && hourlyRate > 0) return hourlyRate;
    if (salary > 0 && workHoursPerWeek > 0) {
      return salary / (workHoursPerWeek * 48);
    }
    return 0;
  }, [payMode, hourlyRate, salary, workHoursPerWeek]);

  const hasPayInfo = effectiveRate > 0;

  // Build the inputs for computePayoff
  const payoff = useMemo(() => {
    // Build waste buckets from the drains we have
    const bucketMap = new Map<string, WasteBucket>();
    for (const [slug, drain] of drainBySlug) {
      bucketMap.set(slug, { slug, wasteHours: drain.hoursPerWeek });
    }
    const buckets = Array.from(bucketMap.values());

    // Build ChosenSolution array for the engine
    const chosen: ChosenSolution[] = chosenSolutions.map((sol) => {
      const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
      // Find primary waste slug from our known drains
      let primarySlug = sol.wasteSlugs[0] ?? "";
      for (const slug of sol.wasteSlugs) {
        if (drainBySlug.has(slug)) {
          primarySlug = slug;
          break;
        }
      }

      return {
        rowId: sol.id,
        wasteSlug: primarySlug,
        title: sol.title,
        effort: Math.max(1, Math.min(5, scores.effort)) as Score,
        impact: Math.max(1, Math.min(5, scores.impact)) as Score,
        owner: sol.owner,
        zone: (() => {
          for (const slug of sol.wasteSlugs) {
            const drain = drainBySlug.get(slug);
            if (drain) return drain.zone;
          }
          return "C" as const;
        })(),
      };
    });

    return computePayoff(buckets, chosen, effectiveRate, 48);
  }, [chosenSolutions, solutionScores, drainBySlug, effectiveRate]);

  // Build "if-then" statements
  const ifThenItems = useMemo(() => {
    return chosenSolutions.map((sol) => {
      const credited = payoff.creditByRow[sol.id] ?? 0;
      return {
        title: sol.title,
        reclaim: credited,
        reclaimHint: sol.reclaimHint,
      };
    }).filter((item) => item.reclaim > 0);
  }, [chosenSolutions, payoff]);

  const totalWasteHoursWeekly = payoff.totalWasteHours;
  const reclaimableWeekly = payoff.fullPotentialHours;
  const afterWasteWeekly = Math.max(0, totalWasteHoursWeekly - reclaimableWeekly);
  const reclaimableYearly = reclaimableWeekly * 48;
  const reclaimableDollarsYearly = payoff.fullPotentialDollarsPerYear;
  const doNothingHoursYear = totalWasteHoursWeekly * 48;
  const doNothingWeeks = doNothingHoursYear / 40;
  const doNothingDollars = totalWasteHoursWeekly * 48 * effectiveRate;

  const quickWinCount = payoff.quickWinRowIds.length;

  if (chosenSolutions.length === 0) {
    return null;
  }

  const hasReclaimable = reclaimableWeekly > 0;
  const hasAnyWaste = totalWasteHoursWeekly > 0;

  return (
    <div>
      {/* Big payoff numbers */}
      <div className="surface-card p-8 mb-6" style={{ borderTop: "4px solid var(--color-reclaim)" }}>
        {hasReclaimable ? (
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AnimatedEmoji emoji="🎯" animation="pulse" size="lg" />
                <Highlighter action="underline" color="var(--color-reclaim)" isView>
                  <span
                    className="text-sm uppercase tracking-wider font-medium"
                    style={{ color: "var(--color-reclaim)" }}
                  >
                    Reclaimable per week
                  </span>
                </Highlighter>
              </div>
              <div
                className="text-5xl font-bold mb-1"
                style={{ color: "var(--color-reclaim)" }}
              >
                <CountUp
                  to={reclaimableWeekly}
                  decimals={1}
                  suffix=" hrs"
                  className="text-5xl font-bold"
                  style={{ color: "var(--color-reclaim)" }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {hasPayInfo && <AnimatedEmoji emoji="💰" animation="pop" size="lg" />}
                <span
                  className="text-sm uppercase tracking-wider font-medium"
                  style={{ color: "var(--color-reclaim)" }}
                >
                  That&apos;s this much per year
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <CountUp
                  to={reclaimableYearly}
                  decimals={0}
                  suffix=" hours"
                  className="text-3xl font-bold"
                  style={{ color: "var(--color-reclaim)" }}
                />
                {hasPayInfo && (
                  <span
                    className="text-2xl"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    (
                    <CountUp
                      to={reclaimableDollarsYearly}
                      decimals={0}
                      prefix="$"
                      className="text-2xl font-bold"
                      style={{ color: "var(--color-reclaim)" }}
                    />
                    )
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <AnimatedEmoji emoji="🤔" animation="shake" size="lg" />
            <p
              className="text-base font-medium mt-3"
              style={{ color: "var(--color-ink-soft)" }}
            >
              {hasAnyWaste
                ? "The selected fixes don't map to any of your current waste sources, so there's nothing to reclaim yet. Try picking fixes that target your actual drains."
                : "No waste hours to reclaim. Run the Pareto Analyzer first to identify where your time goes."}
            </p>
          </div>
        )}
        {!hasPayInfo && hasReclaimable && (
          <p
            className="text-xs text-center mt-4 italic"
            style={{ color: "var(--color-ink-soft)" }}
          >
            No salary or hourly rate provided — add your pay info in the analyzer for dollar estimates.
          </p>
        )}
      </div>

      {/* If-Then Statements */}
      {ifThenItems.length > 0 && (
        <div className="surface-card p-6 mb-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
            }}
          >
            If you {chosenSolutions.length === 1 ? "do this fix" : `do these ${chosenSolutions.length} fixes`}:
          </h3>
          <ul className="space-y-2">
            {ifThenItems.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="flex-shrink-0 mt-0.5" aria-hidden="true">🥲</span>
                <span>
                  <strong>{item.title}</strong>
                  <span style={{ color: "var(--color-ink-soft)" }}>
                    {" "}
                    &rarr; save{" "}
                    <span
                      className="font-figures font-semibold"
                      style={{ color: "var(--color-reclaim)" }}
                    >
                      {item.reclaim.toFixed(1)} hrs/week
                    </span>
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Before / After Emotional Contrast */}
      {hasReclaimable && hasAnyWaste && (
        <div className="surface-card p-6 mb-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Before */}
            <motion.div
              className="text-center p-4 rounded-xl flex-1 min-w-[180px]"
              style={{ backgroundColor: "rgba(224, 62, 18, 0.06)" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl mb-2" aria-hidden="true">😩</div>
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Your week now
              </div>
              <CountUp
                to={totalWasteHoursWeekly}
                decimals={1}
                suffix=" hrs"
                className="text-2xl font-bold"
                style={{ color: "var(--color-waste)" }}
              />
              <div
                className="text-xs mt-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                of waste
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              className="text-2xl"
              style={{ color: "var(--color-reclaim)" }}
            >
              &rarr;
            </motion.div>

            {/* After */}
            <motion.div
              className="text-center p-4 rounded-xl flex-1 min-w-[180px]"
              style={{ backgroundColor: "rgba(196, 24, 106, 0.06)" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl mb-2" aria-hidden="true">😮‍💨</div>
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Your week after
              </div>
              <CountUp
                to={afterWasteWeekly}
                decimals={1}
                suffix=" hrs"
                className="text-2xl font-bold"
                style={{ color: "var(--color-reclaim)" }}
              />
              <div
                className="text-xs mt-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                of waste
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Cost of Doing Nothing — only meaningful when there's actual waste */}
      {hasAnyWaste && (
        <div
          className="rounded-xl p-8 mb-6"
          style={{
            backgroundColor: "rgba(224, 62, 18, 0.04)",
            border: "1px solid rgba(224, 62, 18, 0.15)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AnimatedEmoji emoji="😬" animation="shake" size="md" />
            <Highlighter action="box" color="var(--color-waste)" strokeWidth={2} isView>
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                  color: "var(--color-waste)",
                }}
              >
                The cost of doing nothing
              </h3>
            </Highlighter>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--color-ink-soft)" }}>
            If you change nothing in the next 12 months:
          </p>

          <div className="space-y-3 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-2 text-sm"
            >
              <span className="flex-shrink-0" aria-hidden="true">💸</span>
              <span>
                You&rsquo;ll waste{" "}
                <CountUp
                  to={doNothingHoursYear}
                  decimals={0}
                  className="font-bold"
                  style={{ color: "var(--color-waste)" }}
                />{" "}
                hours &mdash; that&rsquo;s{" "}
                <CountUp
                  to={doNothingWeeks}
                  decimals={1}
                  className="font-bold"
                  style={{ color: "var(--color-waste)" }}
                />{" "}
                full work weeks
              </span>
            </motion.div>

            {hasPayInfo && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="flex-shrink-0" aria-hidden="true">💸</span>
                <span>
                  That costs{" "}
                  <CountUp
                    to={doNothingDollars}
                    decimals={0}
                    prefix="$"
                    className="font-bold"
                    style={{ color: "var(--color-waste)" }}
                  />
                </span>
              </motion.div>
            )}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <ShimmerButton
              borderRadius="12px"
              className="px-10 py-4 text-base font-bold"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                onGoToAssign?.();
              }}
            >
              <span className="flex items-center gap-2">
                <AnimatedEmoji emoji="🔥" animation="bounce" size="sm" />
                Start with your{" "}
                {quickWinCount > 0 ? "first quick win" : "top fix"}
              </span>
            </ShimmerButton>
          </motion.div>
        </div>
      )}
    </div>
  );
}
