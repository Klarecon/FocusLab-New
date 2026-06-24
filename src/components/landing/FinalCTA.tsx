"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Highlighter } from "@/components/ui/highlighter";

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
          A working person loses about 10 hours a week to work that
          feels productive but isn&apos;t. That&apos;s{" "}
          <Highlighter action="underline" color="var(--color-waste)" isView><strong style={{ color: "var(--color-ink)" }}>6 full work weeks per year</strong></Highlighter>.{" "}
          <AnimatedEmoji emoji="🤯" animation="pop" size="md" />
        </p>

        <Link href="/analyzer" className="no-underline inline-flex justify-center">
          <ShimmerButton
            borderRadius="12px"
            className="px-12 py-6 text-xl font-bold mx-auto"
          >
            <span className="flex items-center gap-3">
              <AnimatedEmoji emoji="🔥" animation="bounce" size="md" />
              Find my hidden hours
            </span>
          </ShimmerButton>
        </Link>

        <p className="mt-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          3 minutes. No signup needed.
        </p>
      </motion.div>
    </section>
  );
}
