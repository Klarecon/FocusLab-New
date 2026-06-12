"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { ROLE_LENSES, type RoleLens } from "@/lib/data/roles";
import type { RoleSlug } from "@/lib/data/benchmarks";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

interface RoleStepProps {
  onNext: () => void;
}

export default function RoleStep({ onNext }: RoleStepProps) {
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const setRole = useAuditStore((s) => s.setRole);
  const secondaryRoles = useAuditStore((s) => s.secondaryRoles);
  const setSecondaryRoles = useAuditStore((s) => s.setSecondaryRoles);
  const [showSecondary, setShowSecondary] = useState(false);

  const handleSelect = (slug: RoleSlug) => {
    setRole(slug);
    // Clear secondary if it matches new primary
    setSecondaryRoles(secondaryRoles.filter((r) => r !== slug));
  };

  const toggleSecondary = (slug: RoleSlug) => {
    setSecondaryRoles(
      secondaryRoles.includes(slug)
        ? secondaryRoles.filter((r) => r !== slug)
        : [...secondaryRoles, slug],
    );
  };

  const otherRoles = ROLE_LENSES.filter((r) => r.slug !== roleSlug);

  return (
    <div>
      <div className="text-center mb-10">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          What do you do?
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Pick the role that best describes your day-to-day.
        </p>
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {ROLE_LENSES.map((role, i) => (
          <RoleCard
            key={role.slug}
            role={role}
            isSelected={roleSlug === role.slug}
            onSelect={() => handleSelect(role.slug)}
            index={i}
          />
        ))}
      </div>

      {/* Secondary role toggle */}
      {roleSlug && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <button
            type="button"
            onClick={() => setShowSecondary(!showSecondary)}
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {showSecondary ? "▼" : "▶"} I also spend time on...
          </button>

          {showSecondary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {otherRoles.map((role) => (
                <button
                  key={role.slug}
                  type="button"
                  onClick={() => toggleSecondary(role.slug)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150"
                  style={{
                    borderColor: secondaryRoles.includes(role.slug)
                      ? "var(--color-gold)"
                      : "var(--color-line)",
                    backgroundColor: secondaryRoles.includes(role.slug)
                      ? "rgba(237, 178, 21, 0.1)"
                      : "transparent",
                    color: secondaryRoles.includes(role.slug)
                      ? "var(--color-gold)"
                      : "var(--color-ink-soft)",
                  }}
                >
                  {role.emoji} {role.label}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Continue */}
      <div className="flex justify-end">
        <motion.button
          type="button"
          disabled={!roleSlug}
          onClick={onNext}
          className="px-10 py-4 rounded-xl text-base font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: roleSlug ? "var(--color-reclaim)" : "var(--color-ink-soft)",
            boxShadow: roleSlug ? "0 4px 16px rgba(196, 24, 106, 0.25)" : undefined,
          }}
          whileHover={roleSlug ? { scale: 1.03 } : {}}
          whileTap={roleSlug ? { scale: 0.97 } : {}}
        >
          Continue →
        </motion.button>
      </div>
    </div>
  );
}

/* ---------- Role Card ---------- */

function RoleCard({
  role,
  isSelected,
  onSelect,
  index,
}: {
  role: RoleLens;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="surface-card p-6 text-left transition-all duration-200"
      style={{
        borderLeft: isSelected ? "4px solid var(--color-reclaim)" : "4px solid transparent",
        borderColor: isSelected ? undefined : "var(--color-line)",
        borderWidth: isSelected ? undefined : "1px",
        backgroundColor: isSelected ? "rgba(196, 24, 106, 0.04)" : "var(--color-card)",
        boxShadow: isSelected
          ? "0 0 0 1px var(--color-reclaim), 0 4px 16px rgba(196, 24, 106, 0.15)"
          : undefined,
      }}
      whileHover={{
        boxShadow: isSelected
          ? "0 0 0 1px var(--color-reclaim), 0 6px 20px rgba(196, 24, 106, 0.2)"
          : "0 4px 16px rgba(237, 178, 21, 0.15)",
      }}
    >
      <div className="mb-3">
        <AnimatedEmoji
          emoji={role.emoji}
          animation={isSelected ? "bounce" : "pop"}
          size="xl"
          delay={index * 0.05}
        />
      </div>
      <div className="font-bold text-base mb-1" style={{ color: "var(--color-ink)" }}>
        {role.label}
      </div>
      <div className="text-sm leading-snug" style={{ color: "var(--color-ink-soft)" }}>
        {role.leak}
      </div>
    </motion.button>
  );
}
