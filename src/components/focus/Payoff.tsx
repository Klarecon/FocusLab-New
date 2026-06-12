"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { computePayoff } from "@/lib/engine/solutions-logic";
import type {
  ChosenSolution,
  WasteBucket,
  Score,
} from "@/lib/engine/types";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

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
function CountUp({
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
    <span className={`font-figures ${className}`} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

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

  // Compute effective hourly rate
  const effectiveRate = useMemo(() => {
    if (payMode === "hourly" && hourlyRate > 0) return hourlyRate;
    if (salary > 0 && workHoursPerWeek > 0) {
      return salary / (workHoursPerWeek * 48);
    }
    return 50; // fallback
  }, [payMode, hourlyRate, salary, workHoursPerWeek]);

  const usingFallbackRate =
    !(payMode === "hourly" && hourlyRate > 0) &&
    !(salary > 0 && workHoursPerWeek > 0);

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

  return (
    <div>
      {/* Big payoff numbers */}
      <div className="surface-card p-8 mb-6" style={{ borderTop: "4px solid var(--color-reclaim)" }}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AnimatedEmoji emoji="🎯" animation="pulse" size="lg" />
            <span
              className="text-sm uppercase tracking-wider font-medium"
              style={{ color: "var(--color-reclaim)" }}
            >
              Reclaimable per week
            </span>
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
            <AnimatedEmoji emoji="💰" animation="pop" size="lg" />
            <span
              className="text-sm uppercase tracking-wider font-medium"
              style={{ color: "var(--color-reclaim)" }}
            >
              Reclaimable per year
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
          </div>
        </div>
        {usingFallbackRate && (
          <p
            className="text-xs text-center mt-4 italic"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Dollar estimates use $50/hr default — add your salary in the analyzer for a personalized figure.
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
            If you do these {chosenSolutions.length} fixes:
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
                <span className="flex-shrink-0 mt-0.5">✅</span>
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
            <div className="text-3xl mb-2">😩</div>
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
            <div className="text-3xl mb-2">😮‍💨</div>
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

      {/* Cost of Doing Nothing */}
      <div
        className="rounded-xl p-8 mb-6"
        style={{
          backgroundColor: "rgba(224, 62, 18, 0.04)",
          border: "1px solid rgba(224, 62, 18, 0.15)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AnimatedEmoji emoji="😬" animation="shake" size="md" />
          <h3
            className="text-lg font-semibold"
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              color: "var(--color-waste)",
            }}
          >
            The cost of doing nothing
          </h3>
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
            <span className="flex-shrink-0">💸</span>
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

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-2 text-sm"
          >
            <span className="flex-shrink-0">💸</span>
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
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <button
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-base transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--color-reclaim)",
              boxShadow: "0 4px 16px rgba(196, 24, 106, 0.25)",
            }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              onGoToAssign?.();
            }}
          >
            <AnimatedEmoji emoji="🚀" animation="bounce" size="sm" />
            <span>
              Start with your{" "}
              {quickWinCount > 0 ? "first quick win" : "top fix"}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
