"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

export default function FinalCTA() {
  return (
    <section
      className="px-5 py-28 text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--color-paper) 0%, var(--color-card) 40%, rgba(237, 178, 21, 0.06) 100%)",
      }}
    >
      {/* Subtle gradient orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196, 24, 106, 0.04) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto relative z-10"
      >
        <p
          className="text-lg sm:text-xl mb-8 leading-relaxed"
          style={{ color: "var(--color-ink-soft)" }}
        >
          The average knowledge worker wastes 10+ hours a week on things that
          don&apos;t matter. That&apos;s{" "}
          <strong style={{ color: "var(--color-ink)" }}>6 full work weeks per year</strong>.{" "}
          <AnimatedEmoji emoji="🤯" animation="pop" size="md" />
        </p>

        <Link
          href="/analyzer"
          className="inline-flex items-center gap-3 px-12 py-6 rounded-xl text-xl font-bold no-underline transition-all duration-200 hover:scale-[1.04] hover:shadow-2xl"
          style={{
            backgroundColor: "var(--color-reclaim)",
            color: "#fff",
            boxShadow: "0 6px 30px rgba(196, 24, 106, 0.3)",
          }}
        >
          <AnimatedEmoji emoji="🔥" animation="bounce" size="md" />
          Start Your Free Audit Now
        </Link>

        <p className="mt-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          3 minutes. No signup.
        </p>
      </motion.div>
    </section>
  );
}
