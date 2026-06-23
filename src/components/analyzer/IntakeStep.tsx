"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuditStore } from "@/stores/audit-store";
import {
  wasteSourcesForRole,
  groupWasteSources,
} from "@/lib/data/waste-sources";
import type { RoleSlug } from "@/lib/data/benchmarks";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

/* Pain prompts that map to waste groups — the progressive-disclosure layer. */
const PAIN_PROMPTS: { prompt: string; emoji: string; groups: string[] }[] = [
  { prompt: "Drowning in meetings?", emoji: "😴", groups: ["Meetings"] },
  { prompt: "Can\u2019t escape Slack and email?", emoji: "🫠", groups: ["Email & chat"] },
  { prompt: "Doing the same work twice?", emoji: "🤦", groups: ["Rework", "Creative"] },
  { prompt: "Waiting on other people?", emoji: "😤", groups: ["Waiting & blocked"] },
  { prompt: "Buried in admin busywork?", emoji: "💀", groups: ["Admin", "Reporting"] },
  { prompt: "Can\u2019t focus for more than 20 minutes?", emoji: "🤯", groups: ["Focus", "Doing more than needed"] },
  { prompt: "Too much coordination, not enough real work?", emoji: "🧟", groups: ["Coordination", "Leading vs doing"] },
];

/* Role-specific pain prompts */
const ROLE_PAIN_PROMPTS: Partial<Record<RoleSlug, { prompt: string; emoji: string; groups: string[] }[]>> = {
  marketing: [{ prompt: "Reporting and data-wrangling eating your day?", emoji: "😬", groups: ["Reporting", "Creative"] }],
  sales: [{ prompt: "CRM admin stealing your selling time?", emoji: "😤", groups: ["CRM & data", "Prospecting", "Quotes & proposals"] }],
  engineering: [{ prompt: "Tech debt and slow builds grinding you down?", emoji: "🤦", groups: ["Code", "Builds & reviews"] }],
  design: [{ prompt: "File wrangling and revision rounds?", emoji: "🫠", groups: ["Files & assets", "Creative"] }],
  manager: [{ prompt: "Back-to-back meetings draining you?", emoji: "😬", groups: ["Meetings", "Admin"] }],
  executive: [{ prompt: "Calendar gravity pulling you everywhere?", emoji: "🤯", groups: ["Leading vs doing"] }],
  product: [{ prompt: "Status packaging and firefighting?", emoji: "🫠", groups: ["Reporting", "Coordination"] }],
  "software-dev": [{ prompt: "Deploys, debugging, and review queues?", emoji: "🤦", groups: ["Code", "Builds & reviews"] }],
  operations: [{ prompt: "Manual processes and vendor follow-ups?", emoji: "😤", groups: ["Admin", "Coordination", "Reporting"] }],
  finance: [{ prompt: "Reconciliation and close-cycle scrambles?", emoji: "😬", groups: ["Admin", "Reporting", "Coordination"] }],
  "ceo-founder": [{ prompt: "Everything lands on your desk?", emoji: "🫠", groups: ["Leading vs doing", "Reporting", "Coordination"] }],
};

const MIN_CATEGORIES = 3;

interface IntakeStepProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Find vital categories using Pareto rule: top categories covering ~80% of total waste.
 */
function findVitalCategories(
  estimates: Record<string, number>,
  threshold = 0.8,
): string[] {
  const sorted = Object.entries(estimates)
    .filter(([, hrs]) => hrs > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, h]) => s + h, 0);
  if (total === 0) return sorted.map(([g]) => g);
  let running = 0;
  const vital: string[] = [];
  for (const [group, hrs] of sorted) {
    vital.push(group);
    running += hrs;
    if (running / total >= threshold) break;
  }
  // Always include at least 2 if available
  if (vital.length < MIN_CATEGORIES && sorted.length >= MIN_CATEGORIES) {
    for (const [group] of sorted) {
      if (!vital.includes(group)) {
        vital.push(group);
        if (vital.length >= MIN_CATEGORIES) break;
      }
    }
  }
  return vital;
}

export default function IntakeStep({ onNext, onBack }: IntakeStepProps) {
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const secondaryRoles = useAuditStore((s) => s.secondaryRoles);
  const categoryEstimates = useAuditStore((s) => s.categoryEstimates);
  const setCategoryEstimate = useAuditStore((s) => s.setCategoryEstimate);
  const setVitalCategories = useAuditStore((s) => s.setVitalCategories);
  const workHoursPerWeek = useAuditStore((s) => s.workHoursPerWeek);

  // Get all available sources for this role + secondary roles
  const allSources = useMemo(() => {
    if (!roleSlug) return [];
    const primary = wasteSourcesForRole(roleSlug as RoleSlug);
    if (secondaryRoles.length === 0) return primary;
    const seen = new Set(primary.map((s) => s.slug));
    const merged = [...primary];
    for (const sr of secondaryRoles) {
      for (const src of wasteSourcesForRole(sr)) {
        if (!seen.has(src.slug)) {
          seen.add(src.slug);
          merged.push(src);
        }
      }
    }
    return merged;
  }, [roleSlug, secondaryRoles]);

  const grouped = useMemo(() => groupWasteSources(allSources), [allSources]);

  // Build pain prompts (universal + role-specific)
  const painPrompts = useMemo(() => {
    const rolePains = roleSlug ? ROLE_PAIN_PROMPTS[roleSlug as RoleSlug] ?? [] : [];
    return [...PAIN_PROMPTS, ...rolePains];
  }, [roleSlug]);

  // Deduplicate: each group appears under the FIRST pain prompt that includes it
  const groupOwnership = useMemo(() => {
    const ownership = new Map<string, number>(); // group name -> pain prompt index
    painPrompts.forEach((pain, pi) => {
      for (const g of pain.groups) {
        if (!ownership.has(g)) {
          ownership.set(g, pi);
        }
      }
    });
    return ownership;
  }, [painPrompts]);

  // Running total of estimated waste
  const totalEstimated = useMemo(() => {
    return Object.values(categoryEstimates).reduce((s, h) => s + h, 0);
  }, [categoryEstimates]);

  const categoriesWithHours = useMemo(() => {
    return Object.entries(categoryEstimates).filter(([, h]) => h > 0).length;
  }, [categoryEstimates]);

  const canContinue = categoriesWithHours >= MIN_CATEGORIES;

  // Get unique group keys owned by a specific pain prompt
  const groupsForPain = (painIndex: number): string[] => {
    const pain = painPrompts[painIndex];
    return pain.groups.filter((g) => groupOwnership.get(g) === painIndex);
  };

  // Get or compute estimate for a pain prompt (sum of its owned groups)
  const estimateForPain = (painIndex: number): number => {
    const groups = groupsForPain(painIndex);
    return groups.reduce((sum, g) => sum + (categoryEstimates[g] ?? 0), 0);
  };

  // Set estimate for a pain prompt (distribute to its primary group)
  const setEstimateForPain = (painIndex: number, hours: number) => {
    const groups = groupsForPain(painIndex);
    if (groups.length === 0) return;
    // Set the primary group to the new value, zero out others
    setCategoryEstimate(groups[0], hours);
    for (let i = 1; i < groups.length; i++) {
      setCategoryEstimate(groups[i], 0);
    }
  };

  const handleContinue = () => {
    const vital = findVitalCategories(categoryEstimates);
    setVitalCategories(vital);
    onNext();
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          Where does your time go?
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Give a rough estimate for each category. Don&apos;t overthink it &mdash; we&apos;ll zoom into the big ones next.
        </p>

      </div>

      {/* Sticky floating counter — always in DOM to prevent layout shift */}
      <div
        className="sticky top-4 z-40 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full shadow-md mx-auto w-fit mb-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "2px solid var(--color-waste)",
          boxShadow: "0 4px 16px rgba(224, 62, 18, 0.12)",
          opacity: totalEstimated > 0 ? 1 : 0,
          pointerEvents: totalEstimated > 0 ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      >
        <span className="font-figures font-bold text-2xl" style={{ color: "var(--color-waste)" }}>
          {totalEstimated.toFixed(1)}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--color-waste)" }}>
          hrs/week of waste flagged
        </span>
      </div>

      {/* Pain prompt cards with hour inputs */}
      <div className="space-y-3 mb-8">
        {painPrompts.map((pain, pi) => {
          const ownedGroups = groupsForPain(pi);
          if (ownedGroups.length === 0) return null; // All groups already owned by earlier prompts

          const sourceCount = ownedGroups.reduce((sum, g) => {
            const match = grouped.find((gg) => gg.group === g);
            return sum + (match?.sources.length ?? 0);
          }, 0);

          if (sourceCount === 0) return null;

          const estimate = estimateForPain(pi);

          return (
            <motion.div
              key={pain.prompt}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.06, duration: 0.3 }}
              className="surface-card p-4 flex items-center gap-3 relative transition-all duration-200"
              style={{
                // Active (hours entered) = unified pink selected state. Orange is
                // reserved for the waste-hours input itself, below.
                borderColor: estimate > 0 ? "var(--color-reclaim)" : undefined,
                borderWidth: estimate > 0 ? "2px" : undefined,
                backgroundColor: estimate > 0 ? "rgba(196, 24, 106, 0.05)" : undefined,
                boxShadow: estimate > 0
                  ? "0 0 0 1px var(--color-reclaim), 0 2px 8px rgba(196, 24, 106, 0.1)"
                  : undefined,
              }}
            >
              {estimate > 0 && (
                <span
                  className="absolute top-2 right-2 w-4 h-4 rounded-full inline-flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: "var(--color-reclaim)" }}
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
              <AnimatedEmoji emoji={pain.emoji} animation="pulse" size="lg" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-base block" style={{ color: "var(--color-ink)" }}>
                  {pain.prompt}
                </span>
                <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
                  {sourceCount} time {sourceCount === 1 ? "drain" : "drains"} we{"\u2019"}ll dig into
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="number"
                  min={0}
                  max={workHoursPerWeek}
                  step={0.5}
                  value={estimate || ""}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    setEstimateForPain(pi, Math.max(0, Math.min(workHoursPerWeek, val)));
                  }}
                  className="w-16 text-right text-sm font-bold font-figures bg-transparent border-b-2 focus:outline-none px-1 py-1"
                  style={{ borderColor: estimate > 0 ? "var(--color-waste)" : "var(--color-line)", color: "var(--color-ink)" }}
                  aria-label={`Hours per week for ${pain.prompt}`}
                />
                <span className="text-xs font-medium" style={{ color: "var(--color-ink-soft)" }}>
                  hrs/wk
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Over-allocation warning */}
      {totalEstimated > workHoursPerWeek && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-4 mb-6 flex items-start gap-3"
          style={{
            borderLeft: "4px solid var(--color-waste)",
            backgroundColor: "rgba(224, 62, 18, 0.06)",
          }}
        >
          <span className="text-xl flex-shrink-0" aria-hidden="true">😬</span>
          <p className="text-sm" style={{ color: "var(--color-waste)" }}>
            Your total ({totalEstimated.toFixed(1)} hrs) exceeds your {workHoursPerWeek}-hour week. These are rough estimates &mdash; we&apos;ll refine in the next step.
          </p>
        </motion.div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-150"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          &larr; Back
        </button>
        <div className="text-right">
          {!canContinue && categoriesWithHours > 0 && (
            <p className="text-xs mb-1" style={{ color: "var(--color-ink-soft)" }}>
              Give at least {MIN_CATEGORIES} a number to continue
            </p>
          )}
          <ShimmerButton
            disabled={!canContinue}
            onClick={handleContinue}
            borderRadius="12px"
            background={canContinue ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
            className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              See what&apos;s eating your week &rarr;
            </span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
