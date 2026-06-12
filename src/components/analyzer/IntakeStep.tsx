"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
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
  { prompt: "Can't focus for more than 20 minutes?", emoji: "🤹", groups: ["Focus", "Doing more than needed"] },
  { prompt: "Too much coordination, not enough real work?", emoji: "🧟", groups: ["Coordination", "Leading vs doing"] },
];

/* Role-specific pain prompts */
const ROLE_PAIN_PROMPTS: Partial<Record<RoleSlug, { prompt: string; emoji: string; groups: string[] }[]>> = {
  marketing: [{ prompt: "Reporting and data-wrangling eating your day?", emoji: "📊", groups: ["Reporting", "Creative"] }],
  sales: [{ prompt: "CRM admin stealing your selling time?", emoji: "📞", groups: ["CRM & data", "Prospecting", "Quotes & proposals"] }],
  engineering: [{ prompt: "Tech debt and slow builds grinding you down?", emoji: "💻", groups: ["Code", "Builds & reviews"] }],
  design: [{ prompt: "File wrangling and revision rounds?", emoji: "🎨", groups: ["Files & assets", "Creative"] }],
  manager: [{ prompt: "Still doing the team's work yourself?", emoji: "👥", groups: ["Leading vs doing"] }],
  executive: [{ prompt: "Calendar gravity pulling you everywhere?", emoji: "👑", groups: ["Leading vs doing"] }],
  product: [{ prompt: "Status packaging and firefighting?", emoji: "📋", groups: ["Reporting", "Coordination"] }],
};

const MUDA_EMOJI: Record<MudaType, string> = {
  rework: "🔄",
  overproduction: "📦",
  waiting: "⏳",
  "underused-skill": "🧩",
  handoffs: "📤",
  "pile-ups": "📚",
  "switching-searching": "🔍",
  "over-processing": "⚙️",
};

const MIN_SOURCES = 5;

interface IntakeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function IntakeStep({ onNext, onBack }: IntakeStepProps) {
  const roleSlug = useAuditStore((s) => s.roleSlug);
  const activeSources = useAuditStore((s) => s.activeSources);
  const addSource = useAuditStore((s) => s.addSource);
  const removeSource = useAuditStore((s) => s.removeSource);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [customLabel, setCustomLabel] = useState("");
  const [customMuda, setCustomMuda] = useState<MudaType>("over-processing");
  const [customCounter, setCustomCounter] = useState(0);

  const painCardRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Get all available sources for this role
  const allSources = useMemo(
    () => (roleSlug ? wasteSourcesForRole(roleSlug as RoleSlug) : []),
    [roleSlug],
  );
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

  const addCustom = () => {
    const label = customLabel.trim();
    if (!label) return;
    const slug = `custom-${customCounter}`;
    setCustomCounter((c) => c + 1);
    addSource({
      slug,
      group: "Custom",
      label,
      muda: customMuda,
      whatCounts: "Your own custom waste source",
      scope: "universal",
      emoji: MUDA_EMOJI[customMuda],
    });
    setCustomLabel("");
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

      {/* Add your own — at the top so users see it immediately */}
      <div className="surface-card p-4 mb-8">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-ink)" }}>
          Something missing? Add your own:
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="e.g. Weekly all-hands that could be an email"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-transparent focus:outline-none"
            style={{
              border: "1.5px solid var(--color-line)",
              color: "var(--color-ink)",
            }}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customLabel.trim()}
            className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: "var(--color-waste)" }}
          >
            <Plus size={16} />
          </button>
        </div>
        {/* Muda type picker */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(MUDA_EMOJI) as [MudaType, string][]).map(([muda, emoji]) => (
            <button
              key={muda}
              type="button"
              onClick={() => setCustomMuda(muda)}
              className="px-2 py-1 rounded-md text-xs transition-all duration-100"
              style={{
                border: `1.5px solid ${customMuda === muda ? "var(--color-gold)" : "var(--color-line)"}`,
                backgroundColor: customMuda === muda ? "rgba(237, 178, 21, 0.1)" : "transparent",
              }}
              title={muda}
            >
              {emoji}
            </button>
          ))}
        </div>
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
                            <span className="flex-shrink-0 text-base">{source.emoji}</span>
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
          <motion.button
            type="button"
            disabled={!canContinue}
            onClick={onNext}
            className="px-10 py-4 rounded-xl text-base font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canContinue ? "var(--color-reclaim)" : "var(--color-ink-soft)",
              boxShadow: canContinue ? "0 4px 16px rgba(196, 24, 106, 0.25)" : undefined,
            }}
            whileHover={canContinue ? { scale: 1.03 } : {}}
            whileTap={canContinue ? { scale: 0.97 } : {}}
          >
            Continue →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
