"use client";

import { motion } from "framer-motion";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

const stats = [
  {
    emoji: "😴",
    number: "25%",
    label: "of a manager's week is meetings",
    source: "Fellow, 2024",
  },
  {
    emoji: "🫠",
    number: "28%",
    label: "of the workday is email & chat",
    source: "Microsoft, 2025",
  },
  {
    emoji: "🤦",
    number: "23–42%",
    label: "of dev time is tech debt",
    source: "Stripe, 2022",
  },
  {
    emoji: "🤹",
    number: "23 min",
    label: "to refocus after an interruption",
    source: "Gloria Mark, UCI",
  },
  {
    emoji: "💀",
    number: "58%",
    label: "of the workday is 'work about work'",
    source: "Asana, 2023",
  },
  {
    emoji: "😤",
    number: "3.5 hrs",
    label: "per week waiting on approvals",
    source: "Bain & Co",
  },
];

export default function BenchmarkProof() {
  return (
    <section
      className="px-5 py-24"
      style={{ backgroundColor: "var(--color-ink)", color: "var(--color-paper)" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
            color: "var(--color-waste)",
          }}
        >
          This isn&apos;t guesswork. <AnimatedEmoji emoji="🔬" animation="pop" size="lg" />
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-lg mb-16 opacity-70"
        >
          Our benchmarks come from real research — not folklore.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.source}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-6 relative overflow-hidden"
              style={{
                backgroundColor: "rgba(243, 237, 225, 0.06)",
                border: "1px solid rgba(243, 237, 225, 0.1)",
              }}
            >
              {/* Gradient accent line at top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: "linear-gradient(90deg, var(--color-waste), var(--color-gold))",
                }}
              />
              <AnimatedEmoji emoji={stat.emoji} animation="pulse" size="lg" delay={i * 0.1} />
              <p
                className="text-3xl sm:text-4xl font-bold mt-4 mb-2"
                style={{ color: "var(--color-waste)", fontFamily: "var(--font-geist-mono), monospace" }}
              >
                {stat.number}
              </p>
              <p className="text-sm leading-snug opacity-80 mb-2">{stat.label}</p>
              <p className="text-xs opacity-40">{stat.source}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
