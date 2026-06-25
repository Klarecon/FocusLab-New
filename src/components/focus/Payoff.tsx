"use client";

import { useMemo, useEffect, useState, memo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { computePayoff, isRated } from "@/lib/engine/solutions-logic";
import type {
  ChosenSolution,
  WasteBucket,
  Score,
} from "@/lib/engine/types";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { Highlighter } from "@/components/ui/highlighter";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Particles } from "@/components/ui/particles";
import { useDrainLookup, type DrainInfo } from "./shared/useDrainLookup";
import { getOpportunityFrame } from "@/lib/data/opportunity-frames";

interface PayoffProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
  onGoToAssign?: () => void;
  /**
   * Which slice to render so the payoff can lead the Matrix tab instead of
   * hiding at the bottom:
   *  - "full"  (default) — the whole thing, unchanged
   *  - "hero"  — just the "You could reclaim" number + spotlight (above matrix)
   *  - "rest"  — the closing "go reclaim your week" statement (below matrix)
   *  - "strip" — a slim reclaim banner for the Action Plan tab
   */
  variant?: "full" | "hero" | "rest" | "strip";
  /** For the strip: jump to the Matrix tab for the full breakdown. */
  onSeeBreakdown?: () => void;
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

/** Spread-the-word actions on the closing card (S21 #6). */
const SHARE_URL = "https://focuslab-omega.vercel.app";
const SHARE_TEXT =
  "I just found hours of hidden busywork with FocusLab — it takes about 3 minutes:";

function ShareActions() {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Found my hidden hours with FocusLab")}&body=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;

  const base =
    "no-underline text-sm font-bold px-5 py-2.5 rounded-full transition-colors duration-150 cursor-pointer";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
      <button
        type="button"
        onClick={copyLink}
        className={base}
        style={{ backgroundColor: "var(--color-reclaim)", color: "#fff" }}
      >
        {copied ? "Copied! ✓" : "Copy link"}
      </button>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        style={{ border: "1.5px solid var(--color-reclaim)", color: "var(--color-reclaim)" }}
      >
        Share on LinkedIn
      </a>
      <a
        href={emailUrl}
        className={base}
        style={{ border: "1.5px solid var(--color-reclaim)", color: "var(--color-reclaim)" }}
      >
        Email it
      </a>
    </div>
  );
}

export default function Payoff({ vitalFew, usefulMany, onGoToAssign, variant = "full", onSeeBreakdown }: PayoffProps) {
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

    const chosen: ChosenSolution[] = chosenSolutions
      .filter((sol) => {
        // Unrated (blank-dot) fixes aren't decided yet — keep them out of the
        // payoff totals until the user rates effort + impact.
        const sc = solutionScores[sol.id] ?? { effort: 0, impact: 0 };
        return isRated(sc.effort, sc.impact);
      })
      .map((sol) => {
      const scores = solutionScores[sol.id] ?? { effort: 0, impact: 0 };
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
  const reclaimableYearly = reclaimableWeekly * 48;
  const reclaimableDollarsYearly = payoff.fullPotentialDollarsPerYear;
  const quickWinDollarsYearly = payoff.quickWinDollarsPerYear;

  const quickWinCount = payoff.quickWinRowIds.length;

  if (chosenSolutions.length === 0) {
    return null;
  }

  const hasReclaimable = reclaimableWeekly > 0;
  const hasAnyWaste = totalWasteHoursWeekly > 0;
  const hasQuickWins = quickWinCount > 0 && quickWinWeekly > 0;

  const showHero = variant === "full" || variant === "hero";
  const showRest = variant === "full" || variant === "rest";

  // Slim reclaim banner for the Action Plan tab — surfaces the payoff where
  // people actually work, so the number isn't buried on the Matrix tab.
  if (variant === "strip") {
    if (!hasReclaimable) return null;
    return (
      <div
        className="flex items-center justify-between gap-3 flex-wrap rounded-xl px-4 sm:px-5 py-3 mb-6"
        style={{
          background: "linear-gradient(90deg, rgba(196,24,106,0.08), rgba(237,178,21,0.05))",
          border: "1.5px solid var(--color-reclaim)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <AnimatedEmoji emoji="🎯" animation="pulse" size="md" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--color-ink-soft)" }}>
              You could reclaim
            </div>
            <div className="text-lg sm:text-xl font-bold font-figures leading-tight" style={{ color: "var(--color-reclaim)" }}>
              {reclaimableWeekly.toFixed(1)} hrs/wk
              {hasPayInfo && (
                <span className="font-medium" style={{ color: "var(--color-ink-soft)" }}>
                  {" "}· ${Math.round(reclaimableDollarsYearly).toLocaleString()}/yr
                </span>
              )}
            </div>
          </div>
        </div>
        {onSeeBreakdown && (
          <button
            onClick={onSeeBreakdown}
            className="text-sm font-bold cursor-pointer transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: "var(--color-reclaim)" }}
          >
            See full breakdown &rarr;
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Big payoff numbers */}
      {showHero && (
      <div className="surface-card p-5 sm:p-8 mb-6 relative overflow-hidden" style={{ borderTop: "4px solid var(--color-reclaim)" }}>
        {hasReclaimable && (
          <Particles
            className="absolute inset-0 pointer-events-none"
            quantity={40}
            ease={70}
            color="#c4186a"
            size={0.6}
            staticity={60}
            aria-hidden="true"
          />
        )}
        {hasReclaimable ? (
          <div className="relative z-10">
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
              <SparklesText
                className="text-3xl sm:text-5xl font-bold mb-1 leading-none"
                sparklesCount={7}
              >
                <CountUp
                  to={reclaimableWeekly}
                  decimals={1}
                  suffix=" hrs/week"
                  className="text-3xl sm:text-5xl font-bold"
                  style={{ color: "var(--color-reclaim)" }}
                />
              </SparklesText>
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
                  </div>
                </div>
              </motion.div>
            )}

            {/* What you'd do with it — aspirational spotlight */}
            {(() => {
              const { roleSpecific } = getOpportunityFrame(reclaimableWeekly, roleSlug);
              if (!roleSpecific) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 flex items-start gap-3 text-left p-4 sm:p-5 rounded-r-xl bg-white"
                  style={{
                    borderLeft: "5px solid var(--color-gold)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="text-2xl sm:text-3xl flex-shrink-0" aria-hidden="true">🌤️</span>
                  <div>
                    <div
                      className="text-[11px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: "var(--color-gold)" }}
                    >
                      What you&apos;d do with it
                    </div>
                    <p
                      className="text-base sm:text-lg leading-snug"
                      style={{
                        fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                        color: "var(--color-ink)",
                      }}
                    >
                      {roleSpecific}
                    </p>
                  </div>
                </motion.div>
              );
            })()}
          </div>
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
      )}

      {/* Closing statement */}
      {showRest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8"
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
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-ink-soft)" }}>
            If this gave you hours back, pass it on — know anyone drowning in busywork?
          </p>
          <ShareActions />
        </motion.div>
      )}
    </div>
  );
}
