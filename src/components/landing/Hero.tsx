"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">
      {/* Background decorative emoji */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] select-none overflow-hidden">
        <div className="absolute top-[10%] left-[8%] text-7xl rotate-[-15deg]">😴</div>
        <div className="absolute top-[20%] right-[12%] text-6xl rotate-[10deg]">🫠</div>
        <div className="absolute bottom-[25%] left-[15%] text-5xl rotate-[20deg]">🤦</div>
        <div className="absolute bottom-[15%] right-[8%] text-7xl rotate-[-8deg]">💀</div>
        <div className="absolute top-[50%] left-[50%] text-8xl rotate-[5deg]">😱</div>
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
          Pareto analysis for knowledge workers
        </motion.p>

        {/* Main headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-8"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          How much of your week{" "}
          <span className="gradient-text">
            are you wasting?
          </span>
        </h1>

        {/* Stat callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="inline-flex items-center gap-4 rounded-xl px-8 py-5 mb-10"
          style={{
            backgroundColor: "var(--color-card)",
            borderLeft: "4px solid transparent",
            borderImage: "linear-gradient(180deg, var(--color-waste), var(--color-reclaim)) 1",
            boxShadow: "0 4px 24px rgba(224, 62, 18, 0.08)",
          }}
        >
          <AnimatedEmoji emoji="😱" animation="shake" size="lg" delay={0.8} />
          <div className="text-left">
            <p className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--color-waste)", fontFamily: "var(--font-geist-mono), monospace" }}>
              <CountUp target={58} />% of your week
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-ink-soft)" }}>
              is spent on work that isn&apos;t your actual job
            </p>
          </div>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--color-ink-soft)" }}
        >
          FocusLab finds the <strong style={{ color: "var(--color-ink)" }}>vital few</strong> drains
          eating most of your time — then gives you research-backed fixes
          to <strong style={{ color: "var(--color-reclaim)" }}>reclaim your week</strong>.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center gap-5"
        >
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-lg font-bold no-underline transition-all duration-200 hover:scale-[1.04] hover:shadow-xl"
            style={{
              backgroundColor: "var(--color-reclaim)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(196, 24, 106, 0.3)",
            }}
          >
            <AnimatedEmoji emoji="🔍" animation="pulse" size="sm" />
            Start Your Free Audit
          </Link>
          <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Takes 3 minutes. No signup required.
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
