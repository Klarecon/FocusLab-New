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
      className="px-4 py-12 sm:px-5 sm:py-24"
      style={{ backgroundColor: "var(--color-ink)", color: "var(--color-paper)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.source}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4 sm:p-6 relative overflow-hidden"
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
