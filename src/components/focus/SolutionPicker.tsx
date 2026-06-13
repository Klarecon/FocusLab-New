"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { solutionsForWaste, isQuickWin } from "@/lib/data/solutions";
import type { Solution } from "@/lib/data/solutions";
import { wasteSourceBySlug } from "@/lib/data/waste-sources";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface DrainInfo {
  slug: string;
  label: string;
  hoursPerWeek: number;
  zone: "A" | "B" | "C";
}

interface SolutionPickerProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
  onGoToPlan: () => void;
}

const EFFORT_COLOR: Record<string, string> = {
  low: "var(--color-reclaim)",
  medium: "var(--color-gold)",
  high: "var(--color-waste)",
};

const EFFORT_LABEL: Record<string, string> = {
  low: "Low effort",
  medium: "Med effort",
  high: "High effort",
};

const IMPACT_LABEL: Record<string, string> = {
  low: "Low impact",
  medium: "Med impact",
  high: "High impact",
};

function Badge({
  label,
  color,
  filled,
}: {
  label: string;
  color: string;
  filled?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        color: filled ? "white" : color,
        backgroundColor: filled ? color : "transparent",
        border: `1px solid ${color}`,
      }}
    >
      {label}
    </span>
  );
}

const SolutionCard = memo(function SolutionCard({
  solution,
  isChosen,
  onToggle,
}: {
  solution: Solution;
  isChosen: boolean;
  onToggle: () => void;
}) {
  const quickWin = isQuickWin(solution);

  return (
    <motion.button
      onClick={onToggle}
      aria-pressed={isChosen}
      className="w-full text-left p-4 rounded-xl transition-all duration-200 cursor-pointer border"
      style={{
        backgroundColor: isChosen ? "rgba(196, 24, 106, 0.06)" : "var(--color-card)",
        borderColor: isChosen ? "var(--color-reclaim)" : "var(--color-line)",
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isChosen ? (
            <AnimatedEmoji emoji="🥲" animation="pop" size="sm" />
          ) : (
            <span
              className="w-5 h-5 rounded-full border-2 inline-flex"
              style={{ borderColor: "var(--color-line)" }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm" style={{ color: "var(--color-ink)" }}>
              {solution.title}
            </span>
            {quickWin && (
              <span className="inline-flex items-center gap-1">
                <AnimatedEmoji emoji="🤩" animation="pop" size="sm" />
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(196, 24, 106, 0.12)",
                    color: "var(--color-reclaim)",
                  }}
                >
                  Quick Win
                </span>
              </span>
            )}
          </div>
          <p
            className="text-xs mb-2 leading-relaxed"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {solution.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              label={EFFORT_LABEL[solution.effort]}
              color={EFFORT_COLOR[solution.effort]}
            />
            <Badge
              label={IMPACT_LABEL[solution.impact]}
              color={
                solution.impact === "high"
                  ? "var(--color-reclaim)"
                  : solution.impact === "medium"
                  ? "var(--color-gold)"
                  : "var(--color-ink-soft)"
              }
            />
            <span
              className="text-xs italic"
              style={{ color: "var(--color-ink-soft)" }}
            >
              {solution.reclaimHint}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
});

function DrainSection({
  drain,
  index,
}: {
  drain: DrainInfo;
  index: number;
}) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const addSolution = useAuditStore((s) => s.addSolution);
  const removeSolution = useAuditStore((s) => s.removeSolution);

  const wasteSource = wasteSourceBySlug(drain.slug);
  const solutions = useMemo(() => solutionsForWaste(drain.slug), [drain.slug]);
  const chosenIds = useMemo(
    () => new Set(chosenSolutions.map((s) => s.id)),
    [chosenSolutions],
  );

  const handleToggle = useCallback((solution: Solution) => {
    if (chosenIds.has(solution.id)) {
      removeSolution(solution.id);
    } else {
      addSolution(solution);
    }
  }, [chosenIds, addSolution, removeSolution]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="surface-card p-6 mb-6"
    >
      {/* Drain header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" aria-hidden="true">{wasteSource?.emoji ?? "🔴"}</span>
        <div className="flex-1">
          <h3
            className="text-lg font-semibold"
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              color: "var(--color-ink)",
            }}
          >
            {drain.label}
          </h3>
          <span
            className="text-sm font-figures font-semibold"
            style={{ color: "var(--color-waste)" }}
          >
            {drain.hoursPerWeek.toFixed(1)} hrs/week wasted
          </span>
        </div>
        <span
          className="px-2 py-0.5 rounded-md text-xs font-bold text-white"
          style={{
            backgroundColor:
              drain.zone === "A" ? "var(--color-waste)" : "var(--color-gold)",
          }}
        >
          Zone {drain.zone}
        </span>
      </div>

      {/* Solutions */}
      {solutions.length > 0 ? (
        <>
          <p
            className="text-sm font-medium mb-3"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Proven fixes for this:
          </p>
          <div className="space-y-2">
            {solutions.map((sol) => (
              <SolutionCard
                key={sol.id}
                solution={sol}
                isChosen={chosenIds.has(sol.id)}
                onToggle={() => handleToggle(sol)}
              />
            ))}
          </div>
        </>
      ) : (
        <p
          className="text-sm italic py-3"
          style={{ color: "var(--color-ink-soft)" }}
        >
          We don&apos;t have pre-built fixes for this one yet. Add your own below — you probably know what would help.
        </p>
      )}
    </motion.div>
  );
}

export default function SolutionPicker({
  vitalFew,
  usefulMany,
  onGoToPlan,
}: SolutionPickerProps) {
  const [zoneBOpen, setZoneBOpen] = useState(false);
  const [customFix, setCustomFix] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const addSolution = useAuditStore((s) => s.addSolution);

  const allDrains = [...vitalFew, ...usefulMany];

  const handleAddCustom = () => {
    const trimmed = customFix.trim();
    if (!trimmed) return;
    const targetSlug = customTarget || (allDrains[0]?.slug ?? "");
    const customSolution: Solution = {
      id: `custom-${Date.now()}`,
      wasteSlugs: targetSlug ? [targetSlug] : [],
      title: trimmed,
      description: "Custom fix added by you",
      effort: "medium",
      impact: "medium",
      reclaimHint: "depends on implementation",
      owner: "self",
      source: { name: "You", url: "" },
    };
    addSolution(customSolution);
    setCustomFix("");
  };

  return (
    <div>
      {/* Zone A — Vital Few */}
      {vitalFew.length > 0 ? (
        <>
          <div className="mb-2">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-1 flex items-center gap-2"
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              }}
            >
              <AnimatedEmoji emoji="🎯" animation="pulse" size="sm" />
              {vitalFew.length === 1 ? "Your #1 Drain" : "Your Biggest Drains"}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
              {vitalFew.length === 1
                ? "This one thing is doing the most damage. Fix it first."
                : "These are the ones doing the most damage. Fix these first and you\u2019ll feel the difference."}
            </p>
          </div>

          {vitalFew.map((drain, i) => (
            <DrainSection key={drain.slug} drain={drain} index={i} />
          ))}
        </>
      ) : (
        <div className="surface-card p-8 text-center mb-6">
          <AnimatedEmoji emoji="🤔" animation="float" size="xl" />
          <p
            className="text-base font-medium mt-4"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Nothing to fix yet. Find your drains with the{" "}
            <a href="/analyzer" style={{ color: "var(--color-reclaim)", fontWeight: 600 }}>
              Analyzer
            </a>{" "}
            first, then come back here.
          </p>
        </div>
      )}

      {/* Zone B — Useful Many (collapsible) */}
      {usefulMany.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setZoneBOpen(!zoneBOpen)}
            aria-expanded={zoneBOpen}
            className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors hover:opacity-80 mb-4"
            style={{ color: "var(--color-gold)" }}
          >
            <motion.span
              animate={{ rotate: zoneBOpen ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
              aria-hidden="true"
            >
              &#9654;
            </motion.span>
            Also eating your time &mdash; {usefulMany.length} more{" "}
            {usefulMany.length === 1 ? "drain" : "drains"}
          </button>

          <AnimatePresence>
            {zoneBOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {usefulMany.map((drain, i) => (
                  <DrainSection
                    key={drain.slug}
                    drain={drain}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Custom fix input — only when there are drains to target */}
      {allDrains.length > 0 && (
      <div className="surface-card p-5 mt-6" style={{ borderLeft: "4px solid var(--color-gold)" }}>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-ink)" }}
        >
          Got a fix in mind?
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={customTarget}
            onChange={(e) => setCustomTarget(e.target.value)}
            aria-label="Target drain for custom fix"
            className="px-3 py-2 rounded-lg text-sm border focus:outline-none sm:w-48"
            style={{
              backgroundColor: "var(--color-paper)",
              borderColor: "var(--color-line)",
              color: "var(--color-ink)",
            }}
          >
            {allDrains.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={customFix}
            onChange={(e) => setCustomFix(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            aria-label="Custom fix description"
            placeholder="e.g., Cancel the Monday status call..."
            className="flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none"
            style={{
              backgroundColor: "var(--color-paper)",
              borderColor: "var(--color-line)",
              color: "var(--color-ink)",
            }}
          />
          <button
            onClick={handleAddCustom}
            disabled={!customFix.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--color-reclaim)" }}
          >
            Add
          </button>
        </div>
      </div>
      )}

      {/* Bottom bar */}
      <div
        className="mt-8 flex items-center justify-between p-4 rounded-xl border"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-line)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-figures text-lg font-bold" style={{ color: "var(--color-reclaim)" }}>
            {chosenSolutions.length}
          </span>
          <span className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            {chosenSolutions.length === 1 ? "fix" : "fixes"} selected
          </span>
        </div>
        <ShimmerButton
          onClick={onGoToPlan}
          disabled={chosenSolutions.length === 0}
          borderRadius="12px"
          background={chosenSolutions.length > 0 ? "var(--color-reclaim)" : "var(--color-ink-soft)"}
          className="px-10 py-4 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            Build your action plan
            <span aria-hidden="true">&rarr;</span>
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
}
