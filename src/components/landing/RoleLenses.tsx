"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ROLE_LENSES } from "@/lib/data/roles";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

export default function RoleLenses() {
  return (
    <section className="px-4 py-12 sm:px-5 sm:py-24 max-w-5xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4"
        style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
      >
        Your role. Your waste.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center text-lg mb-14"
        style={{ color: "var(--color-ink-soft)" }}
      >
        Every function bleeds time differently. Pick yours.
      </motion.p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {ROLE_LENSES.map((role, i) => (
          <motion.div
            key={role.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={`/analyzer?role=${role.slug}`}
              className="block no-underline group rounded-xl p-4 sm:p-7 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.03]"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-line)",
                borderLeft: "3px solid var(--color-gold)",
              }}
            >
              <AnimatedEmoji emoji={role.emoji} animation="float" size="xl" delay={i * 0.1} />
              <h3 className="text-lg font-bold mt-4 mb-2">{role.label}</h3>
              <p className="text-sm leading-snug" style={{ color: "var(--color-ink-soft)" }}>
                {role.leak}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
