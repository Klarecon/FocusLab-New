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
import { Highlighter } from "@/components/ui/highlighter";
import { useDrainLookup, type DrainInfo } from "./shared/useDrainLookup";
import { getOpportunityFrame } from "@/lib/data/opportunity-frames";

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

export default function Payoff({ vitalFew, usefulMany, onGoToAssign }: PayoffProps) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const solutionScores = useAuditStore((s) => s.solutionScores);
  const salary = useAuditStore((s) => s.salary);
  const hourlyRate = useAuditStore((s) => s.hourlyRate);
  const payMode = useAuditStore((s) => s.payMode);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);
  const roleSlug = useAuditStore((s) => s.roleSlug);

  const { drainBySlug } = useDrainLookup(vitalFew, usefulMany);

  const effectiveRate = useMemo(() => {
    if (payMode === "hourly" && hourlyRate > 0) return hourlyRate;
    if (salary > 0 && workHoursPerWeek > 0) {
      return salary / (workHoursPerWeek * 48);
    }
    return 0;
  }, [payMode, hourlyRate, salary, workHoursPerWeek]);

  const hasPayInfo = effectiveRate > 0;

  const payoff = useMemo(() => {
    const bucketMap = new Map<string, WasteBucket>();
    for (const [slug, drain] of drainBySlug) {
      bucketMap.set(slug, { slug, wasteHours: drain.hoursPerWeek });
    }
    const buckets = Array.from(bucketMap.values());

    const chosen: ChosenSolution[] = chosenSolutions.map((sol) => {
      const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
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

  const totalWasteHoursWeekly = payoff.totalWasteHours;
  const reclaimableWeekly = payoff.fullPotentialHours;
  const quickWinWeekly = payoff.quickWinHours;
  const afterWasteWeekly = Math.max(0, totalWasteHoursWeekly - reclaimableWeekly);
  const reclaimableYearly = reclaimableWeekly * 48;
  const reclaimableDollarsYearly = payoff.fullPotentialDollarsPerYear;
  const quickWinDollarsYearly = payoff.quickWinDollarsPerYear;
  const doNothingHoursYear = totalWasteHoursWeekly * 48;
  const doNothingWeeks = doNothingHoursYear / 40;
  const doNothingDollars = totalWasteHoursWeekly * 48 * effectiveRate;

  const quickWinCount = payoff.quickWinRowIds.length;

  if (chosenSolutions.length === 0) {
    return null;
  }

  const hasReclaimable = reclaimableWeekly > 0;
  const hasAnyWaste = totalWasteHoursWeekly > 0;
  const hasQuickWins = quickWinCount > 0 && quickWinWeekly > 0;

  return (
    <div>
      {/* Big payoff numbers */}
      <div className="surface-card p-8 mb-6" style={{ borderTop: "4px solid var(--color-reclaim)" }}>
        {hasReclaimable ? (
          <>
            {/* Full potential */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AnimatedEmoji emoji="🎯" animation="pulse" size="lg" />
                <Highlighter action="underline" color="var(--color-reclaim)" isView>
                  <span
                    className="text-sm uppercase tracking-wider font-medium"
                    style={{ color: "var(--color-reclaim)" }}
                  >
                    You could reclaim
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
                  suffix=" hrs/week"
                  className="text-5xl font-bold"
                  style={{ color: "var(--color-reclaim)" }}
                />
              </div>
            </div>

            {/* Yearly summary — compact */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <CountUp
                  to={reclaimableYearly}
                  decimals={0}
                  suffix=" hours/year"
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-reclaim)" }}
                />
                {hasPayInfo && (
                  <span className="text-xl" style={{ color: "var(--color-ink-soft)" }}>
                    (<CountUp to={reclaimableDollarsYearly} decimals={0} prefix="$" className="text-xl font-bold" style={{ color: "var(--color-reclaim)" }} />)
                  </span>
                )}
              </div>
            </div>

            {/* Low-reclaim guidance */}
            {reclaimableWeekly > 0 && reclaimableWeekly < totalWasteHoursWeekly * 0.15 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 rounded-xl text-sm"
                style={{ backgroundColor: "rgba(237, 178, 21, 0.06)", border: "1px solid rgba(237, 178, 21, 0.15)" }}
              >
                <div className="flex items-start gap-2">
                  <span aria-hidden="true">🤔</span>
                  <div>
                    <p className="font-medium mb-1" style={{ color: "var(--color-gold)" }}>
                      Your fixes target only {reclaimableWeekly.toFixed(1)} of {totalWasteHoursWeekly.toFixed(1)} wasted hours
                    </p>
                    <p style={{ color: "var(--color-ink-soft)" }}>
                      Try adding more fixes, targeting your biggest drains, or raising impact scores on the Action Plan tab.
                    </p>
                    {/* Per-fix breakdown */}
                    {chosenSolutions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {chosenSolutions.map((sol) => {
                          const credit = payoff.creditByRow[sol.id] ?? 0;
                          const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
                          return (
                            <div key={sol.id} className="flex items-center gap-2 text-xs">
                              <span className="font-medium truncate flex-1" style={{ color: "var(--color-ink)" }}>
                                {sol.title}
                              </span>
                              <span style={{ color: "var(--color-ink-soft)" }}>
                                impact {scores.impact}/5
                              </span>
                              <span className="font-bold font-figures" style={{ color: credit > 0 ? "var(--color-reclaim)" : "var(--color-ink-soft)" }}>
                                {credit > 0 ? `+${credit.toFixed(1)} hrs` : "0 hrs"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Opportunity reframe — short and punchy */}
            {(() => {
              const { roleSpecific } = getOpportunityFrame(reclaimableWeekly, roleSlug);
              if (!roleSpecific) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-center p-4 rounded-xl"
                  style={{ backgroundColor: "rgba(196, 24, 106, 0.04)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                      color: "var(--color-ink)",
                    }}
                  >
                    {roleSpecific}
                  </p>
                </motion.div>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-4">
            <AnimatedEmoji emoji="🤔" animation="shake" size="lg" />
            <p
              className="text-base font-medium mt-3"
              style={{ color: "var(--color-ink-soft)" }}
            >
              {hasAnyWaste
                ? "The fixes you picked don\u2019t match any of your drains, so there\u2019s nothing to reclaim yet. Go back to Assign Fixes and choose ones that target your biggest time wasters."
                : "No waste hours to reclaim. Run the Analyzer first to identify where your time goes."}
            </p>
          </div>
        )}
        {!hasPayInfo && hasReclaimable && (
          <p
            className="text-xs text-center mt-4 italic"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Want to see this in dollars? Add your pay info in the Analyzer to unlock dollar estimates.
          </p>
        )}
      </div>


      {/* Before / After Emotional Contrast */}
      {hasReclaimable && hasAnyWaste && (
        <div className="surface-card p-6 mb-6 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                wasted every week
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

            {/* After — framed positively */}
            <motion.div
              className="text-center p-4 rounded-xl flex-1 min-w-[180px]"
              style={{ backgroundColor: "rgba(196, 24, 106, 0.06)" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl mb-2" aria-hidden="true">😎</div>
              <div
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                You get back
              </div>
              <CountUp
                to={reclaimableWeekly}
                decimals={1}
                suffix=" hrs"
                className="text-2xl font-bold"
                style={{ color: "var(--color-reclaim)" }}
              />
              <div
                className="text-xs mt-1"
                style={{ color: "var(--color-ink-soft)" }}
              >
                every week
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Cost of Doing Nothing */}
      {hasAnyWaste && (
        <div
          className="rounded-xl p-8 mb-6"
          style={{
            backgroundColor: "rgba(224, 62, 18, 0.04)",
            borderTop: "4px solid var(--color-waste)",
          }}
        >
          <div className="text-center mb-6">
            <AnimatedEmoji emoji="😬" animation="shake" size="md" />
            <h3
              className="text-xl font-bold mt-2"
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                color: "var(--color-waste)",
              }}
            >
              What happens if you don&apos;t fix this
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-ink-soft)" }}>
              In the next 12 months, without any changes:
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto mb-8">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "rgba(224, 62, 18, 0.06)" }}
            >
              <span className="text-2xl flex-shrink-0" aria-hidden="true">💸</span>
              <span className="text-sm">
                <CountUp
                  to={doNothingHoursYear}
                  decimals={0}
                  className="font-bold text-base"
                  style={{ color: "var(--color-waste)" }}
                />{" "}
                hours lost &mdash;{" "}
                <CountUp
                  to={doNothingWeeks}
                  decimals={1}
                  className="font-bold text-base"
                  style={{ color: "var(--color-waste)" }}
                />{" "}
                full work weeks gone
              </span>
            </motion.div>

            {hasPayInfo && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(224, 62, 18, 0.06)" }}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">🔥</span>
                <span className="text-sm">
                  <CountUp
                    to={doNothingDollars}
                    decimals={0}
                    prefix="$"
                    className="font-bold text-base"
                    style={{ color: "var(--color-waste)" }}
                  />{" "}
                  of your time burned
                </span>
              </motion.div>
            )}
          </div>

          {/* Closing statement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center pt-6"
            style={{ borderTop: "1px solid rgba(224, 62, 18, 0.12)" }}
          >
            <h3
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                color: "var(--color-ink)",
              }}
            >
              You&apos;ve got a plan. Now go reclaim your week.
            </h3>
            <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
              Your plan lives here whenever you need it.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
