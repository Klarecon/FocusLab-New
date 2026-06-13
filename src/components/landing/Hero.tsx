"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Highlighter } from "@/components/ui/highlighter";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";

/** An illustrative calendar week showing how much time goes to waste. */
function WeekCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  // Each day: array of blocks. "waste" = wasted time, "work" = real work.
  // Shows ~58% waste visually.
  const schedule = [
    [
      { type: "waste", label: "Meetings", h: 2 },
      { type: "work", label: "", h: 1 },
      { type: "waste", label: "Email", h: 1.5 },
      { type: "work", label: "", h: 1.5 },
      { type: "waste", label: "Status sync", h: 2 },
    ],
    [
      { type: "work", label: "", h: 1 },
      { type: "waste", label: "Rework", h: 2 },
      { type: "waste", label: "Admin", h: 1 },
      { type: "work", label: "", h: 2 },
      { type: "waste", label: "Slack", h: 2 },
    ],
    [
      { type: "waste", label: "Meetings", h: 3 },
      { type: "work", label: "", h: 1 },
      { type: "waste", label: "Waiting", h: 1.5 },
      { type: "work", label: "", h: 1 },
      { type: "waste", label: "Email", h: 1.5 },
    ],
    [
      { type: "work", label: "", h: 2 },
      { type: "waste", label: "Coordination", h: 2 },
      { type: "waste", label: "Meetings", h: 1.5 },
      { type: "work", label: "", h: 1 },
      { type: "waste", label: "Reports", h: 1.5 },
    ],
    [
      { type: "waste", label: "Email", h: 1 },
      { type: "waste", label: "Meetings", h: 2 },
      { type: "work", label: "", h: 2 },
      { type: "waste", label: "Admin", h: 1 },
      { type: "work", label: "", h: 2 },
    ],
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day, di) => (
          <div key={day} className="text-center">
            <span
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--color-ink-soft)" }}
            >
              {day}
            </span>
            <div className="flex flex-col gap-0.5">
              {schedule[di].map((block, bi) => (
                <motion.div
                  key={bi}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + di * 0.1 + bi * 0.05, duration: 0.3 }}
                  className="rounded-sm flex items-center justify-center overflow-hidden"
                  style={{
                    height: `${block.h * 20}px`,
                    backgroundColor:
                      block.type === "waste"
                        ? "rgba(224, 62, 18, 0.15)"
                        : "rgba(196, 24, 106, 0.08)",
                    borderLeft:
                      block.type === "waste"
                        ? "2px solid var(--color-waste)"
                        : "2px solid var(--color-reclaim)",
                    transformOrigin: "top",
                  }}
                >
                  {block.label && (
                    <span
                      className="text-[9px] sm:text-[10px] font-medium truncate px-0.5"
                      style={{
                        color:
                          block.type === "waste"
                            ? "var(--color-waste)"
                            : "var(--color-reclaim)",
                      }}
                    >
                      {block.label}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "rgba(224, 62, 18, 0.15)", borderLeft: "2px solid var(--color-waste)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>Waste</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "rgba(196, 24, 106, 0.08)", borderLeft: "2px solid var(--color-reclaim)" }}
          />
          <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>Real work</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      {/* Background orbiting emoji */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] select-none flex items-center justify-center">
        <OrbitingCircles radius={140} iconSize={40} speed={0.7} path={false}>
          <span className="text-3xl">😴</span>
          <span className="text-3xl">🫠</span>
          <span className="text-3xl">🤦</span>
          <span className="text-3xl">😤</span>
          <span className="text-3xl">💀</span>
        </OrbitingCircles>
        <OrbitingCircles radius={220} iconSize={36} speed={0.4} reverse path={false}>
          <span className="text-2xl">🤯</span>
          <span className="text-2xl">😬</span>
          <span className="text-2xl">🥲</span>
        </OrbitingCircles>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium tracking-widest uppercase mb-8"
          style={{ color: "var(--color-ink-soft)" }}
        >
          A free tool for knowledge workers
        </motion.p>

        {/* Main headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-6"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Most of your week{" "}
          <Highlighter action="highlight" color="rgba(224, 62, 18, 0.2)" strokeWidth={2} isView>
            <span className="gradient-text">isn&apos;t real work.</span>
          </Highlighter>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Meetings, email, coordination, admin — the average knowledge worker
          spends <Highlighter action="underline" color="var(--color-waste)" isView><strong style={{ color: "var(--color-waste)" }}>58% of their week</strong></Highlighter> on
          tasks that don&apos;t move the needle. FocusLab shows you exactly where
          your time goes, and what to do about it.
        </motion.p>

        {/* Calendar visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-10"
        >
          <WeekCalendar />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center gap-5"
        >
          <Link href="/analyzer" className="no-underline">
            <ShimmerButton
              borderRadius="12px"
              className="px-10 py-5 text-lg font-bold"
            >
              <span className="flex items-center gap-2">
                <AnimatedEmoji emoji="🔍" animation="pulse" size="sm" />
                Find Your Hidden Waste
              </span>
            </ShimmerButton>
          </Link>
          <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            3 minutes. No signup. No judgment.
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>
            Scroll
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 8L10 13L15 8"
              stroke="var(--color-ink-soft)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
