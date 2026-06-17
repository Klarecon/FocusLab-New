"use client";

import { useState, useMemo, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { solutionsForWaste, isQuickWin, type Solution as SolutionType } from "@/lib/data/solutions";
import { SCORE_FROM_LEVEL } from "@/lib/engine/solutions-logic";
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
  const [isExpanded, setIsExpanded] = useState(false);
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
            <span
              className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: "var(--color-reclaim)" }}
            >
              ✓
            </span>
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
                  Pearl
                </span>
              </span>
            )}
          </div>
          {isExpanded ? (
            <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
              {solution.description}
            </p>
          ) : (
            <span
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
              className="text-xs mb-2 underline cursor-pointer inline-block"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Show details
            </span>
          )}
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
            {isExpanded && (
              <span
                className="text-xs italic"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {solution.reclaimHint}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
});

function InlineFix({ drain, allDrains }: { drain: DrainInfo; allDrains: DrainInfo[] }) {
  const [text, setText] = useState("");
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addSolution = useAuditStore((s) => s.addSolution);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const customSolution: Solution = {
      id: `custom-${Date.now()}`,
      wasteSlugs: [drain.slug],
      title: trimmed,
      description: "Custom fix added by you",
      effort: "medium",
      impact: "medium",
      reclaimHint: `targets ${drain.hoursPerWeek.toFixed(1)} hrs/wk of waste`,
      owner: "self",
      source: { name: "You", url: "" },
    };
    addSolution(customSolution);
    setText("");
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px dashed var(--color-line)" }}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Add your own fix..."
        className="flex-1 text-sm bg-transparent border-b-2 focus:outline-none px-1 py-1.5"
        style={{ borderColor: "var(--color-line)", color: "var(--color-ink)" }}
        aria-label={`Add a custom fix for ${drain.label}`}
      />
      <button
        onClick={handleAdd}
        disabled={!text.trim()}
        className="px-3 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        style={{ backgroundColor: "var(--color-reclaim)", color: "#fff" }}
      >
        {flash ? "Added!" : "+ Add"}
      </button>
    </div>
  );
}

function DrainSection({
  drain,
  index,
  shownSolutionIds,
  allDrains,
}: {
  drain: DrainInfo;
  index: number;
  shownSolutionIds: Set<string>;
  allDrains: DrainInfo[];
}) {
  const INITIAL_VISIBLE = 3;
  const [showAll, setShowAll] = useState(false);
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const addSolution = useAuditStore((s) => s.addSolution);
  const removeSolution = useAuditStore((s) => s.removeSolution);

  const wasteSource = wasteSourceBySlug(drain.slug);
  // Sort solutions: Pearls first, then by impact desc, effort asc
  // Filter out solutions already shown under a previous drain
  const solutions = useMemo(() => {
    const raw = solutionsForWaste(drain.slug);
    const unique = raw.filter((s) => !shownSolutionIds.has(s.id));
    return [...unique].sort((a, b) => {
      const aQW = isQuickWin(a) ? 0 : 1;
      const bQW = isQuickWin(b) ? 0 : 1;
      if (aQW !== bQW) return aQW - bQW;
      const aImp = SCORE_FROM_LEVEL[a.impact] ?? 2;
      const bImp = SCORE_FROM_LEVEL[b.impact] ?? 2;
      if (aImp !== bImp) return bImp - aImp;
      const aEff = SCORE_FROM_LEVEL[a.effort] ?? 2;
      const bEff = SCORE_FROM_LEVEL[b.effort] ?? 2;
      return aEff - bEff;
    });
  }, [drain.slug, shownSolutionIds]);
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
      {solutions.length > 0 && (
        <>
          <p
            className="text-sm font-medium mb-3"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Proven fixes for this:
          </p>
          <div className="space-y-2">
            {(showAll ? solutions : solutions.slice(0, INITIAL_VISIBLE)).map((sol) => (
              <SolutionCard
                key={sol.id}
                solution={sol}
                isChosen={chosenIds.has(sol.id)}
                onToggle={() => handleToggle(sol)}
              />
            ))}
            {solutions.length > INITIAL_VISIBLE && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full text-center py-2 text-xs font-medium rounded-lg transition-colors hover:bg-[rgba(0,0,0,0.03)] cursor-pointer"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Show {solutions.length - INITIAL_VISIBLE} more fixes
              </button>
            )}
          </div>
        </>
      )}

      {/* Custom fixes added by the user for this drain */}
      {chosenSolutions
        .filter((s) => s.id.startsWith("custom-") && s.wasteSlugs.includes(drain.slug))
        .map((sol) => (
          <motion.div
            key={sol.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 p-4 rounded-xl border"
            style={{
              backgroundColor: "rgba(196, 24, 106, 0.06)",
              borderColor: "var(--color-reclaim)",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "var(--color-reclaim)" }}
              >
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm" style={{ color: "var(--color-ink)" }}>{sol.title}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(237, 178, 21, 0.12)", color: "var(--color-gold)" }}
                  >
                    Your fix
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeSolution(sol.id)}
                className="text-xs cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: "var(--color-waste)" }}
                aria-label="Remove fix"
              >
                &times;
              </button>
            </div>
          </motion.div>
        ))}

      {/* Inline add-your-own fix */}
      <InlineFix drain={drain} allDrains={allDrains} />
    </motion.div>
  );
}

export default function SolutionPicker({
  vitalFew,
  usefulMany,
  onGoToPlan,
}: SolutionPickerProps) {
  const [zoneBOpen, setZoneBOpen] = useState(true);
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);

  const allDrains = [...vitalFew, ...usefulMany];

  // Track which solution IDs have been shown to avoid duplicates across drains
  const shownIdsByDrain = useMemo(() => {
    const result = new Map<string, Set<string>>();
    const globalSeen = new Set<string>();
    for (const drain of allDrains) {
      result.set(drain.slug, new Set(globalSeen));
      const solutions = solutionsForWaste(drain.slug);
      for (const sol of solutions) {
        globalSeen.add(sol.id);
      }
    }
    return result;
  }, [allDrains]);

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
            <DrainSection key={drain.slug} drain={drain} index={i} shownSolutionIds={shownIdsByDrain.get(drain.slug) ?? new Set()} allDrains={allDrains} />
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
                    shownSolutionIds={shownIdsByDrain.get(drain.slug) ?? new Set()}
                    allDrains={allDrains}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
