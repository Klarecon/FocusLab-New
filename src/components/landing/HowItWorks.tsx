"use client";

import { motion } from "framer-motion";

/** Replaces the removed ToolCards + BenchmarkProof sections (Notes 1 & 2).
 *  "How it works" steps + "why it's not another time-tracker" — approved copy. */

const STEPS = [
  {
    no: 1,
    emoji: "🧑‍🔧",
    title: "Pick your role",
    body: "We pull the time-drains most common to your kind of work.",
  },
  {
    no: 2,
    emoji: "😴",
    title: "Log your week",
    body: "Estimate the hours each drain costs you. It takes about 90 seconds.",
  },
  {
    no: 3,
    emoji: "🎯",
    title: "Get your plan",
    body: "An action plan ranked by hours saved — each with a suggested owner and start date.",
  },
];

const DIFFS = [
  { emoji: "🚫", title: "No clocks", body: "Nothing to install or run" },
  { emoji: "🧠", title: "Your knowledge", body: "You already know your waste" },
  { emoji: "⚙️", title: "Proven method", body: "Used on thousands of teams" },
  { emoji: "⚡", title: "3 minutes", body: "Done before your coffee's cold" },
];

const serif = { fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" };

export default function HowItWorks() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto">
      {/* How it works */}
      <h2
        className="text-center text-2xl sm:text-3xl font-bold mb-10"
        style={serif}
      >
        How it works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.no}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="surface-card text-center p-6"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-2 text-white"
              style={{ backgroundColor: "var(--color-reclaim)" }}
            >
              {s.no}
            </div>
            <div className="text-3xl mb-1">{s.emoji}</div>
            <h3 className="text-lg font-bold mb-1" style={serif}>
              {s.title}
            </h3>
            <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
              {s.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Why it's not another time-tracker */}
      <h2
        className="text-center text-xl sm:text-2xl font-bold mt-16 mb-8"
        style={serif}
      >
        Why it&apos;s not another time-tracker
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {DIFFS.map((d, i) => (
          <motion.div
            key={d.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-xl border text-center p-4"
            style={{
              backgroundColor: "var(--color-cream, #fdf6ec)",
              borderColor: "var(--color-line)",
            }}
          >
            <div className="text-2xl">{d.emoji}</div>
            <div className="font-bold text-sm mt-1">{d.title}</div>
            <div className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
              {d.body}
            </div>
          </motion.div>
        ))}
      </div>

      <p
        className="text-center mt-10 text-base sm:text-lg"
        style={serif}
      >
        The same method that&apos;s freed time for{" "}
        <strong style={{ color: "var(--color-reclaim)" }}>thousands</strong> — now in 3 minutes.
      </p>
    </section>
  );
}
