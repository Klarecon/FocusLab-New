"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuditStore } from "@/stores/audit-store";
import {
  wasteSourcesForRole,
  groupWasteSources,
  type WasteSource,
  type MudaType,
} from "@/lib/data/waste-sources";
import type { RoleSlug } from "@/lib/data/benchmarks";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

/* Pain prompts that map to waste groups — the progressive-disclosure layer. */
const PAIN_PROMPTS: { prompt: string; emoji: string; groups: string[] }[] = [
  { prompt: "Drowning in meetings?", emoji: "😴", groups: ["Meetings"] },
  { prompt: "Can't escape Slack and email?", emoji: "🫠", groups: ["Email & chat"] },
  { prompt: "Doing the same work twice?", emoji: "🤦", groups: ["Rework", "Creative"] },
  { prompt: "Waiting on other people?", emoji: "😤", groups: ["Waiting & blocked"] },
  { prompt: "Buried in admin busywork?", emoji: "💀", groups: ["Admin", "Reporting"] },
  { prompt: "Can't focus for more than 20 minutes?", emoji: "🤯", groups: ["Focus", "Doing more than needed"] },
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

const MIN_SOURCES = 5;

interface IntakeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function IntakeStep({ onNext, onBack }: IntakeStepProps) {
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const secondaryRoles = useAuditStore((s) => s.secondaryRoles);
  const activeSources = useAuditStore((s) => s.activeSources);
  const addSource = useAuditStore((s) => s.addSource);
  const removeSource = useAuditStore((s) => s.removeSource);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [customLabels, setCustomLabels] = useState<Record<number, string>>({});
  const [customCounter, setCustomCounter] = useState(0);

  const painCardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Get all available sources for this role + secondary roles, deduplicated
  const allSources = useMemo(() => {
    if (!roleSlug) return [];
    const primary = wasteSourcesForRole(roleSlug as RoleSlug);
    if (secondaryRoles.length === 0) return primary;
    // Merge in secondary role sources, deduplicating by slug
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

  // Track which sources are selected by slug
  const activeSet = useMemo(
    () => new Set(activeSources.map((s) => s.slug)),
    [activeSources],
  );

  const count = activeSources.length;
  const remaining = Math.max(0, MIN_SOURCES - count);
  const canContinue = count >= MIN_SOURCES;

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const toggleSource = (source: WasteSource) => {
    if (activeSet.has(source.slug)) {
      removeSource(source.slug);
    } else {
      addSource(source);
    }
  };

  const addCustomForSection = (painIndex: number, groups: string[]) => {
    const label = (customLabels[painIndex] ?? "").trim();
    if (!label) return;
    const slug = `custom-${customCounter}`;
    setCustomCounter((c) => c + 1);
    const primaryGroup = groups[0] ?? "Custom";
    addSource({
      slug,
      group: primaryGroup,
      label,
      muda: "over-processing",
      whatCounts: "Your own custom waste source",
      scope: "universal",
      emoji: "✏️",
    });
    setCustomLabels((prev) => ({ ...prev, [painIndex]: "" }));
  };

  // Find which groups a pain prompt maps to
  const sourcesForPain = (groupNames: string[]): { group: string; sources: WasteSource[] }[] => {
    return grouped.filter((g) => groupNames.includes(g.group));
  };

  const handlePainToggle = useCallback((pain: { groups: string[] }, isExpanded: boolean, index: number) => {
    if (isExpanded) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        pain.groups.forEach((pg) => next.delete(pg));
        return next;
      });
    } else {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        pain.groups.forEach((pg) => next.add(pg));
        return next;
      });
      // Scroll to the top of this pain card after expanding
      requestAnimationFrame(() => {
        const el = painCardRefs.current.get(index);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }, []);

  return (
    <div>
      {/* Header with running count */}
      <div className="text-center mb-8">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
        >
          What drains your week?
        </h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Tap the pains that hit home. Then check the specific drains underneath.
        </p>
        <motion.div
          key={count}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          aria-live="polite"
          aria-atomic="true"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            backgroundColor: canContinue ? "rgba(196, 24, 106, 0.1)" : "rgba(224, 62, 18, 0.08)",
            color: canContinue ? "var(--color-reclaim)" : "var(--color-waste)",
          }}
        >
          <span className="font-figures font-bold text-lg">{count}</span>
          <span className="text-sm font-medium">
            source{count !== 1 ? "s" : ""} selected
          </span>
        </motion.div>
      </div>

      {/* Pain prompt cards */}
      <div className="space-y-3 mb-8">
        {painPrompts.map((pain, pi) => {
          const matchedGroups = sourcesForPain(pain.groups);
          const isExpanded = pain.groups.some((g) => expandedGroups.has(g));
          const selectedInGroup = matchedGroups.reduce(
            (acc, g) => acc + g.sources.filter((s) => activeSet.has(s.slug)).length,
            0,
          );

          return (
            <motion.div
              key={pain.prompt}
              ref={(el) => { painCardRefs.current.set(pi, el); }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.06, duration: 0.3 }}
            >
              {/* Pain card header */}
              <button
                type="button"
                onClick={() => handlePainToggle(pain, isExpanded, pi)}
                aria-expanded={isExpanded}
                className="w-full surface-card p-4 flex items-center gap-3 text-left transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: selectedInGroup > 0 ? "var(--color-waste)" : undefined,
                  borderWidth: selectedInGroup > 0 ? "1.5px" : undefined,
                }}
              >
                <AnimatedEmoji emoji={pain.emoji} animation="pulse" size="lg" />
                <div className="flex-1">
                  <span className="font-semibold text-base" style={{ color: "var(--color-ink)" }}>
                    {pain.prompt}
                  </span>
                  {selectedInGroup > 0 && (
                    <span
                      className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(224, 62, 18, 0.1)",
                        color: "var(--color-waste)",
                      }}
                    >
                      {selectedInGroup} selected
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp size={18} style={{ color: "var(--color-ink-soft)" }} />
                ) : (
                  <ChevronDown size={18} style={{ color: "var(--color-ink-soft)" }} />
                )}
              </button>

              {/* Expanded sources */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 pr-2 py-3 space-y-1">
                      {matchedGroups.map((g) =>
                        g.sources.map((source, si) => (
                          <motion.label
                            key={source.slug}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: si * 0.03 }}
                            className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[rgba(0,0,0,0.03)]"
                            title={source.whatCounts}
                          >
                            <input
                              type="checkbox"
                              checked={activeSet.has(source.slug)}
                              onChange={() => toggleSource(source)}
                              className="mt-0.5 w-4.5 h-4.5 rounded accent-[var(--color-waste)] flex-shrink-0"
                            />
                            <span className="flex-shrink-0 text-base" aria-hidden="true">{source.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <span
                                className="text-sm font-medium leading-tight block"
                                style={{ color: "var(--color-ink)" }}
                              >
                                {source.label}
                              </span>
                              <span
                                className="text-xs leading-snug block mt-0.5"
                                style={{ color: "var(--color-ink-soft)" }}
                              >
                                {source.whatCounts}
                              </span>
                            </div>
                          </motion.label>
                        )),
                      )}

                      {/* Add your own — per section */}
                      <div className="flex items-center gap-2 pt-3 mt-2" style={{ borderTop: "1px solid var(--color-line)" }}>
                        <input
                          type="text"
                          value={customLabels[pi] ?? ""}
                          onChange={(e) => setCustomLabels((prev) => ({ ...prev, [pi]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addCustomForSection(pi, pain.groups)}
                          aria-label="Custom waste source name"
                          placeholder="Add your own..."
                          className="flex-1 px-3 py-2 text-sm rounded-lg bg-transparent focus:outline-none"
                          style={{
                            border: "1.5px solid var(--color-line)",
                            color: "var(--color-ink)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addCustomForSection(pi, pain.groups)}
                          disabled={!(customLabels[pi] ?? "").trim()}
                          aria-label="Add custom waste source"
                          className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-150 disabled:opacity-40"
                          style={{ backgroundColor: "var(--color-waste)" }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-150"
          style={{ color: "var(--color-ink-soft)", border: "1.5px solid var(--color-line)" }}
        >
          ← Back
        </button>
        <div className="text-right">
          {!canContinue && (
            <p className="text-xs mb-1" style={{ color: "var(--color-waste)" }}>
              Add {remaining} more source{remaining !== 1 ? "s" : ""}
            </p>
          )}
          <ShimmerButton
            disabled={!canContinue}
            onClick={onNext}
            borderRadius="12px"
            background={canContinue ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
            className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}
