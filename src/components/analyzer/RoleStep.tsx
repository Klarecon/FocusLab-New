"use client";

import { motion } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { ROLE_LENSES, type RoleLens } from "@/lib/data/roles";
import type { RoleSlug } from "@/lib/data/benchmarks";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const LEVELS = [
  { id: "ic", label: "Individual Contributor", description: "Doing the work yourself" },
  { id: "manager", label: "Manager / Team Lead", description: "Leading a team day-to-day" },
  { id: "executive", label: "Director+", description: "Setting strategy, running orgs" },
] as const;

type LevelId = (typeof LEVELS)[number]["id"];

/** Map level selection to secondary roles to pull in */
function secondaryRolesForLevel(level: LevelId, primaryRole: RoleSlug): RoleSlug[] {
  if (level === "manager" && primaryRole !== "manager") return ["manager"];
  if (level === "executive") {
    const extras: RoleSlug[] = ["executive"];
    if (primaryRole !== "manager") extras.push("manager");
    return extras;
  }
  return [];
}

interface RoleStepProps {
  onNext: () => void;
}

export default function RoleStep({ onNext }: RoleStepProps) {
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const setRole = useAuditStore((s) => s.setRole);
  const secondaryRoles = useAuditStore((s) => s.secondaryRoles);
  const setSecondaryRoles = useAuditStore((s) => s.setSecondaryRoles);

  // Derive current level from secondary roles
  const currentLevel: LevelId | null = secondaryRoles.includes("executive" as RoleSlug)
    ? "executive"
    : secondaryRoles.includes("manager" as RoleSlug)
      ? "manager"
      : roleSlug
        ? "ic"
        : null;

  const handleSelectRole = (slug: RoleSlug) => {
    setRole(slug);
    if (slug === "ceo-founder") {
      // CEO/Founder is already at the executive level — auto-set to Director+
      setSecondaryRoles(secondaryRolesForLevel("executive", slug));
    } else {
      // Default to IC, clear secondaries
      setSecondaryRoles([]);
    }
  };

  const handleSelectLevel = (level: LevelId) => {
    if (!roleSlug) return;
    setSecondaryRoles(secondaryRolesForLevel(level, roleSlug as RoleSlug));
  };

  // Filter out manager/executive from the main grid since they're levels now
  const functionRoles = ROLE_LENSES.filter(
    (r) => r.slug !== "manager" && r.slug !== "executive",
  );

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
          Pick your function, then your level.
        </p>
      </div>

      {/* Function grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {functionRoles.map((role, i) => (
          <RoleCard
            key={role.slug}
            role={role}
            isSelected={roleSlug === role.slug}
            onSelect={() => handleSelectRole(role.slug)}
            index={i}
          />
        ))}
      </div>

      {/* Level selector — visible after role pick, hidden for CEO/Founder (already executive) */}
      {roleSlug && roleSlug !== "ceo-founder" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-ink)" }}>
            Your level
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LEVELS.map((level) => {
              const isActive = currentLevel === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleSelectLevel(level.id)}
                  aria-pressed={isActive}
                  className="p-3 sm:p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    border: isActive
                      ? "2px solid var(--color-reclaim)"
                      : "1.5px solid var(--color-line)",
                    backgroundColor: isActive ? "rgba(196, 24, 106, 0.04)" : "var(--color-card)",
                    boxShadow: isActive
                      ? "0 0 0 1px var(--color-reclaim), 0 2px 8px rgba(196, 24, 106, 0.1)"
                      : undefined,
                  }}
                >
                  <span
                    className="block text-sm font-bold mb-1"
                    style={{ color: isActive ? "var(--color-reclaim)" : "var(--color-ink)" }}
                  >
                    {level.label}
                  </span>
                  <span className="block text-xs" style={{ color: "var(--color-ink-soft)" }}>
                    {level.description}
                  </span>
                </button>
              );
            })}
          </div>
          {currentLevel && currentLevel !== "ic" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs mt-3"
              style={{ color: "var(--color-ink-soft)" }}
            >
              We'll include {currentLevel === "executive" ? "leadership & executive" : "management"} waste sources alongside your{" "}
              {ROLE_LENSES.find((r) => r.slug === roleSlug)?.label ?? "role"} ones.
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Continue */}
      <div className="flex justify-end">
        <ShimmerButton
          disabled={!roleSlug}
          onClick={onNext}
          borderRadius="12px"
          background={roleSlug ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
          className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue →
        </ShimmerButton>
      </div>
    </div>
  );
}

/* ---------- Role Card ---------- */

/** Better, more expressive emoji per role */
const ROLE_EMOJI: Partial<Record<string, string>> = {
  marketing: "📣",
  sales: "🤝",
  engineering: "🛠️",
  product: "📦",
  design: "🎨",
  "software-dev": "🧑‍💻",
  operations: "🔧",
  finance: "🧮",
  "ceo-founder": "🫠",
};

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
  const emoji = ROLE_EMOJI[role.slug] ?? role.emoji;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="surface-card p-4 sm:p-6 text-left transition-all duration-200"
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
          emoji={emoji}
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
