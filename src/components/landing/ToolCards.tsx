"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

const tools = [
  {
    title: "Pareto Analyzer",
    emoji: "🔥",
    animation: "flicker" as const,
    description:
      "Find the vital few drains eating most of your week. See exactly where your time goes — and what it costs you.",
    href: "/analyzer",
    cta: "Find your waste",
    color: "var(--color-waste)",
    borderColor: "#e03e12",
    features: ["5-minute audit", "Personalized by role", "Dollar cost per drain"],
  },
  {
    title: "Focus Table & EVI Matrix",
    emoji: "🎯",
    animation: "pulse" as const,
    description:
      "Pick from 134 research-backed fixes, scored by effort and impact. Know exactly what to fix first.",
    href: "/focus",
    cta: "Fix your week",
    color: "var(--color-reclaim)",
    borderColor: "#c4186a",
    features: ["134 research-backed fixes", "Effort × Impact scoring", "Concrete payoff in hours & $"],
  },
];

export default function ToolCards() {
  return (
    <section className="px-5 py-24 max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4"
        style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
      >
        Two tools. One mission.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center text-lg mb-14"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Two ways to reclaim your week.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-8">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <Link
              href={tool.href}
              className="block no-underline group rounded-xl p-10 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-line)",
                borderTop: `4px solid ${tool.borderColor}`,
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <AnimatedEmoji emoji={tool.emoji} animation={tool.animation} size="lg" />
                <h3
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
                >
                  {tool.title}
                </h3>
              </div>

              <p className="mb-6 leading-relaxed text-base" style={{ color: "var(--color-ink-soft)" }}>
                {tool.description}
              </p>

              <ul className="space-y-3 mb-8">
                {tool.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
                    <span className="text-base font-bold" style={{ color: "var(--color-gold)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <span
                className="inline-flex items-center gap-2 font-bold text-base group-hover:gap-3 transition-all duration-200"
                style={{ color: tool.color }}
              >
                {tool.cta} →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
