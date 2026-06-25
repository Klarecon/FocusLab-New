"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Highlighter } from "@/components/ui/highlighter";
import { Particles } from "@/components/ui/particles";

/**
 * v4 hero ring gauge (Oren-approved). A pink arc sweeps in and the centre
 * number counts up to ~10 — the typical hours a week a person reclaims. Uses
 * `animate` (not whileInView) so it plays above the fold and renders in
 * screenshots.
 */
function RingGauge() {
  const R = 42;
  const C = 2 * Math.PI * R; // circumference
  const FILL = 0.62; // illustrative sweep
  const [num, setNum] = useState(0);
  const mv = useMotionValue(0);

  useEffect(() => {
    const controls = animate(mv, 10, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setNum(Math.round(v)),
    });
    return () => controls.stop();
  }, [mv]);

  return (
    <div className="relative" style={{ width: 168, height: 168 }}>
      <svg width="168" height="168" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#e8dcc8" strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="var(--color-reclaim)"
          strokeWidth="9"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - FILL) }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-figures font-bold leading-none"
          style={{ fontSize: "2.5rem", color: "var(--color-reclaim)" }}
          aria-live="polite"
        >
          ~{num}
        </span>
        <span
          className="text-[11px] font-semibold mt-1 max-w-[92px] text-center leading-tight"
          style={{ color: "var(--color-ink-soft)" }}
        >
          typical hrs/wk reclaimed
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div
          className="relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-12 sm:py-16 flex flex-col items-center text-center"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            boxShadow: "0 16px 50px rgba(44,36,24,0.10)",
          }}
        >
          {/* Bigger, visible particle field inside the framed hero (note 7) */}
          <Particles
            className="absolute inset-0 pointer-events-none"
            quantity={48}
            ease={60}
            color="#c4186a"
            size={2.2}
            staticity={40}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm font-medium tracking-widest uppercase mb-6"
          style={{ color: "var(--color-ink-soft)" }}
        >
          A waste-reduction tool for any kind of work
        </motion.p>

        {/* Ring gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-6"
        >
          <RingGauge />
        </motion.div>

        {/* Headline */}
        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-4 sm:mb-5"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Get{" "}
          <Highlighter action="highlight" color="rgba(224, 62, 18, 0.2)" strokeWidth={2} isView>
            <span className="gradient-text">real hours</span>
          </Highlighter>{" "}
          of your week back.
        </h1>

        {/* Promise — verbatim subcopy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--color-ink-soft)" }}
        >
          A working person loses about{" "}
          <Highlighter action="underline" color="var(--color-waste)" isView>
            <strong style={{ color: "var(--color-waste)" }}>10 hours a week</strong>
          </Highlighter>{" "}
          to busywork. Find your drains and a plan to free up your hours, in 3 minutes.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <Link href="/analyzer" className="no-underline">
            <ShimmerButton
              borderRadius="12px"
              className="px-6 py-4 text-base sm:px-10 sm:py-5 sm:text-lg font-bold"
            >
              <span className="flex items-center gap-2">
                <AnimatedEmoji emoji="🔍" animation="pulse" size="sm" />
                Find my hidden hours
              </span>
            </ShimmerButton>
          </Link>
          <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            ⏱ About 3 minutes · nothing to install
          </span>
        </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
