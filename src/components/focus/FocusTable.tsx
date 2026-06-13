"use client";

import { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import { quadrant, QUADRANT_META } from "@/lib/engine/solutions-logic";
import type { Solution } from "@/lib/data/solutions";
import type { Score } from "@/lib/engine/types";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useDrainLookup, type DrainInfo } from "./shared/useDrainLookup";

interface FocusTableProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
  onGoToMatrix?: () => void;
}

const OWNERS = [
  { key: "self", emoji: "🙋", label: "Me" },
  { key: "manager", emoji: "👔", label: "My manager" },
  { key: "team", emoji: "👥", label: "My team" },
] as const;

type OwnerKey = (typeof OWNERS)[number]["key"];

function nextOwner(current: string): OwnerKey {
  const idx = OWNERS.findIndex((o) => o.key === current);
  return OWNERS[((idx >= 0 ? idx : 0) + 1) % OWNERS.length].key;
}

function ownerDisplay(owner: string) {
  return OWNERS.find((o) => o.key === owner) ?? OWNERS[0];
}

function ZoneBadge({ zone }: { zone: "A" | "B" | "C" }) {
  const bg =
    zone === "A"
      ? "var(--color-waste)"
      : zone === "B"
      ? "var(--color-gold)"
      : "var(--color-ink-soft)";

  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold text-white"
      style={{ backgroundColor: bg }}
    >
      {zone}
    </span>
  );
}

function DotRating({
  value,
  max = 5,
  activeColor,
  onChange,
  label,
}: {
  value: number;
  max?: number;
  activeColor: string;
  onChange: (val: number) => void;
  label?: string;
}) {
  return (
    <div className="flex gap-1 items-center" role="group" aria-label={label ?? "Rating"}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="w-6 h-6 rounded-full border-2 transition-all duration-150 cursor-pointer hover:scale-110 relative"
            style={{
              backgroundColor: filled ? activeColor : "transparent",
              borderColor: filled ? activeColor : "var(--color-line)",
            }}
            aria-label={`Set to ${n}`}
          />
        );
      })}
      <span className="text-[10px] ml-1 font-figures" style={{ color: "var(--color-ink-soft)" }}>
        {value}/5
      </span>
    </div>
  );
}

function ActionCard({
  solution,
  zone,
  sourceName,
  effort,
  impact,
  owner,
  reclaimHint,
  onRemove,
  onSetEffort,
  onSetImpact,
  onCycleOwner,
  index,
}: {
  solution: Solution;
  zone: "A" | "B" | "C";
  sourceName: string;
  effort: number;
  impact: number;
  owner: string;
  reclaimHint: string;
  onRemove: () => void;
  onSetEffort: (v: number) => void;
  onSetImpact: (v: number) => void;
  onCycleOwner: () => void;
  index: number;
}) {
  const ow = ownerDisplay(owner);
  const q = quadrant(effort as Score, impact as Score);
  const meta = QUADRANT_META[q];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="surface-card p-5 rounded-xl transition-shadow hover:shadow-md"
      style={{
        borderLeft: `4px solid ${
          zone === "A" ? "var(--color-waste)" : zone === "B" ? "var(--color-gold)" : "var(--color-ink-soft)"
        }`,
      }}
    >
      {/* Top row: zone + source + quadrant + remove */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <ZoneBadge zone={zone} />
          <span className="text-xs truncate" style={{ color: "var(--color-ink-soft)" }}>
            {sourceName}
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:inline"
            style={{
              color: q === "quick-win" ? "#c4186a" : q === "major-project" ? "#edb215" : q === "thankless" ? "#e03e12" : "#655b4d",
              backgroundColor: q === "quick-win" ? "rgba(196,24,106,0.08)" : q === "major-project" ? "rgba(237,178,21,0.08)" : q === "thankless" ? "rgba(224,62,18,0.08)" : "rgba(0,0,0,0.04)",
            }}
          >
            {meta.emoji} {meta.name}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-xs cursor-pointer transition-opacity hover:opacity-70 flex-shrink-0 px-2 py-1 rounded"
          style={{ color: "var(--color-waste)" }}
          aria-label="Remove fix"
        >
          Remove
        </button>
      </div>

      {/* Fix title */}
      <h4
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        {solution.title}
      </h4>

      {/* Controls grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <span
            className="block text-xs mb-1 font-medium"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Owner
          </span>
          <button
            onClick={onCycleOwner}
            aria-label={`Owner: ${ow.label}. Click to change.`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors hover:opacity-80 border"
            style={{
              borderColor: "var(--color-line)",
              backgroundColor: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          >
            <span aria-hidden="true">{ow.emoji}</span>
            <span>{ow.label}</span>
          </button>
        </div>
        <div>
          <span
            className="block text-xs mb-1 font-medium"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Effort <span className="font-normal">(easy → hard)</span>
          </span>
          <DotRating
            value={effort}
            activeColor="var(--color-waste)"
            onChange={onSetEffort}
            label={`Effort rating for ${solution.title}`}
          />
        </div>
        <div>
          <span
            className="block text-xs mb-1 font-medium"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Impact <span className="font-normal">(low → huge)</span>
          </span>
          <DotRating
            value={impact}
            activeColor="var(--color-reclaim)"
            onChange={onSetImpact}
            label={`Impact rating for ${solution.title}`}
          />
        </div>
        <div>
          <span
            className="block text-xs mb-1 font-medium"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Reclaim
          </span>
          <span className="text-xs italic" style={{ color: "var(--color-ink-soft)" }}>
            {reclaimHint}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function FocusTable({ vitalFew, usefulMany, onGoToMatrix }: FocusTableProps) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const solutionScores = useAuditStore((s) => s.solutionScores);
  const removeSolution = useAuditStore((s) => s.removeSolution);
  const setSolutionScore = useAuditStore((s) => s.setSolutionScore);
  const ownerOverrides = useAuditStore((s) => s.ownerOverrides);
  const setOwnerOverride = useAuditStore((s) => s.setOwnerOverride);

  const { getZone, getSourceName } = useDrainLookup(vitalFew, usefulMany);

  const cycleOwner = useCallback(
    (solId: string, currentDefault: string) => {
      const current = ownerOverrides[solId] ?? currentDefault;
      setOwnerOverride(solId, nextOwner(current));
    },
    [ownerOverrides, setOwnerOverride],
  );

  // Sort: Zone A first, then by impact descending
  const sortedSolutions = useMemo(() => {
    const zoneRank = { A: 0, B: 1, C: 2 };
    return [...chosenSolutions].sort((a, b) => {
      const zA = zoneRank[getZone(a)];
      const zB = zoneRank[getZone(b)];
      if (zA !== zB) return zA - zB;
      const impA = solutionScores[a.id]?.impact ?? 2;
      const impB = solutionScores[b.id]?.impact ?? 2;
      return impB - impA;
    });
  }, [chosenSolutions, solutionScores, getZone]);

  // Summary stats
  const stats = useMemo(() => {
    let quickWins = 0;
    for (const sol of chosenSolutions) {
      const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
      const q = quadrant(scores.effort as Score, scores.impact as Score);
      if (q === "quick-win") quickWins++;
    }
    return { total: chosenSolutions.length, quickWins };
  }, [chosenSolutions, solutionScores]);

  // Group by zone for section headers
  const zoneASolutions = sortedSolutions.filter((s) => getZone(s) === "A");
  const zoneBSolutions = sortedSolutions.filter((s) => getZone(s) !== "A");

  if (chosenSolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AnimatedEmoji emoji="😤" animation="float" size="xl" />
        <p className="text-lg" style={{ color: "var(--color-ink-soft)" }}>
          No fixes here yet. Head to{" "}
          <strong style={{ color: "var(--color-reclaim)" }}>Assign Fixes</strong>{" "}
          to pick the ones that fit your week.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with summary stats */}
      <div className="mb-6">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
          }}
        >
          Your Action Plan
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--color-ink-soft)" }}>
          {stats.total} {stats.total === 1 ? "fix" : "fixes"}, sorted by what matters most. Adjust the effort, impact, and owner to match your situation.
        </p>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "rgba(196, 24, 106, 0.1)", color: "var(--color-reclaim)" }}
          >
            {stats.total} {stats.total === 1 ? "fix" : "fixes"}
          </span>
          {stats.quickWins > 0 && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "rgba(237, 178, 21, 0.1)", color: "var(--color-gold)" }}
            >
              🤩 {stats.quickWins} {stats.quickWins === 1 ? "Pearl" : "Pearls"}
            </span>
          )}
        </div>
      </div>

      {/* Zone A section */}
      {zoneASolutions.length > 0 && (
        <div className="mb-4">
          {sortedSolutions.length > zoneASolutions.length && (
            <div
              className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
              style={{ color: "var(--color-waste)" }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-waste)" }} />
              Your biggest drains
            </div>
          )}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {zoneASolutions.map((sol, i) => {
                const zone = getZone(sol);
                const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
                const owner = ownerOverrides[sol.id] ?? sol.owner;
                return (
                  <ActionCard
                    key={sol.id}
                    solution={sol}
                    zone={zone}
                    sourceName={getSourceName(sol)}
                    effort={scores.effort}
                    impact={scores.impact}
                    owner={owner}
                    reclaimHint={sol.reclaimHint}
                    onRemove={() => removeSolution(sol.id)}
                    onSetEffort={(v) => setSolutionScore(sol.id, { effort: v })}
                    onSetImpact={(v) => setSolutionScore(sol.id, { impact: v })}
                    onCycleOwner={() => cycleOwner(sol.id, sol.owner)}
                    index={i}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Zone B section */}
      {zoneBSolutions.length > 0 && (
        <div className="mb-4">
          {zoneASolutions.length > 0 && (
            <div
              className="text-xs font-medium uppercase tracking-wider mb-3 mt-6 flex items-center gap-2"
              style={{ color: "var(--color-gold)" }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-gold)" }} />
              Also worth fixing
            </div>
          )}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {zoneBSolutions.map((sol, i) => {
                const zone = getZone(sol);
                const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
                const owner = ownerOverrides[sol.id] ?? sol.owner;
                return (
                  <ActionCard
                    key={sol.id}
                    solution={sol}
                    zone={zone}
                    sourceName={getSourceName(sol)}
                    effort={scores.effort}
                    impact={scores.impact}
                    owner={owner}
                    reclaimHint={sol.reclaimHint}
                    onRemove={() => removeSolution(sol.id)}
                    onSetEffort={(v) => setSolutionScore(sol.id, { effort: v })}
                    onSetImpact={(v) => setSolutionScore(sol.id, { impact: v })}
                    onCycleOwner={() => cycleOwner(sol.id, sol.owner)}
                    index={i}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Bottom CTA to Impact Matrix */}
      {onGoToMatrix && (
        <div className="mt-8 text-center">
          <ShimmerButton
            borderRadius="12px"
            className="px-10 py-4 text-base font-bold"
            onClick={onGoToMatrix}
          >
            <span className="flex items-center gap-2">
              See your impact
              <span aria-hidden="true">&rarr;</span>
            </span>
          </ShimmerButton>
        </div>
      )}
    </div>
  );
}
