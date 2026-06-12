"use client";

import { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import type { Solution } from "@/lib/data/solutions";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

interface DrainInfo {
  slug: string;
  label: string;
  hoursPerWeek: number;
  zone: "A" | "B" | "C";
}

interface FocusTableProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
}

const OWNERS = [
  { key: "self", emoji: "🙋", label: "Self" },
  { key: "manager", emoji: "👔", label: "Manager" },
  { key: "team", emoji: "👥", label: "Team" },
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
}: {
  value: number;
  max?: number;
  activeColor: string;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="w-5 h-5 rounded-full border-2 transition-all duration-150 cursor-pointer hover:scale-110"
            style={{
              backgroundColor: filled ? activeColor : "transparent",
              borderColor: filled ? activeColor : "var(--color-line)",
            }}
            aria-label={`Set to ${n}`}
          />
        );
      })}
    </div>
  );
}

function TableRow({
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

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="border-b"
      style={{ borderColor: "var(--color-line)" }}
    >
      <td className="py-3 px-2">
        <ZoneBadge zone={zone} />
      </td>
      <td
        className="py-3 px-2 text-sm max-w-[140px] truncate"
        style={{ color: "var(--color-ink-soft)" }}
        title={sourceName}
      >
        {sourceName}
      </td>
      <td
        className="py-3 px-2 text-sm font-medium max-w-[180px]"
        style={{ color: "var(--color-ink)" }}
        title={solution.title}
      >
        {solution.title}
      </td>
      <td className="py-3 px-2">
        <button
          onClick={onCycleOwner}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors hover:opacity-80 border"
          style={{
            borderColor: "var(--color-line)",
            backgroundColor: "var(--color-paper)",
            color: "var(--color-ink)",
          }}
        >
          <span>{ow.emoji}</span>
          <span>{ow.label}</span>
        </button>
      </td>
      <td className="py-3 px-2">
        <DotRating
          value={effort}
          activeColor="var(--color-waste)"
          onChange={onSetEffort}
        />
      </td>
      <td className="py-3 px-2">
        <DotRating
          value={impact}
          activeColor="var(--color-reclaim)"
          onChange={onSetImpact}
        />
      </td>
      <td
        className="py-3 px-2 text-xs italic max-w-[140px] truncate"
        style={{ color: "var(--color-ink-soft)" }}
        title={reclaimHint}
      >
        {reclaimHint}
      </td>
      <td className="py-3 px-2">
        <button
          onClick={onRemove}
          className="text-sm cursor-pointer transition-opacity hover:opacity-70"
          aria-label="Remove fix"
        >
          🗑️
        </button>
      </td>
    </motion.tr>
  );
}

function MobileCard({
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="surface-card p-4 mb-3"
      style={{
        borderLeft: `4px solid ${
          zone === "A" ? "var(--color-waste)" : zone === "B" ? "var(--color-gold)" : "var(--color-ink-soft)"
        }`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ZoneBadge zone={zone} />
          <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
            {sourceName}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-sm cursor-pointer transition-opacity hover:opacity-70"
          aria-label="Remove fix"
        >
          🗑️
        </button>
      </div>

      <h4
        className="text-sm font-semibold mb-2"
        style={{ color: "var(--color-ink)" }}
      >
        {solution.title}
      </h4>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <span
            className="block text-xs mb-1"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Owner
          </span>
          <button
            onClick={onCycleOwner}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer border"
            style={{
              borderColor: "var(--color-line)",
              backgroundColor: "var(--color-paper)",
              color: "var(--color-ink)",
            }}
          >
            <span>{ow.emoji}</span>
            <span>{ow.label}</span>
          </button>
        </div>
        <div>
          <span
            className="block text-xs mb-1"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Reclaim
          </span>
          <span className="text-xs italic" style={{ color: "var(--color-ink-soft)" }}>
            {reclaimHint}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span
            className="block text-xs mb-1"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Effort
          </span>
          <DotRating
            value={effort}
            activeColor="var(--color-waste)"
            onChange={onSetEffort}
          />
        </div>
        <div>
          <span
            className="block text-xs mb-1"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Impact
          </span>
          <DotRating
            value={impact}
            activeColor="var(--color-reclaim)"
            onChange={onSetImpact}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function FocusTable({ vitalFew, usefulMany }: FocusTableProps) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const solutionScores = useAuditStore((s) => s.solutionScores);
  const removeSolution = useAuditStore((s) => s.removeSolution);
  const setSolutionScore = useAuditStore((s) => s.setSolutionScore);
  const ownerOverrides = useAuditStore((s) => s.ownerOverrides);
  const setOwnerOverride = useAuditStore((s) => s.setOwnerOverride);

  const cycleOwner = useCallback(
    (solId: string, currentDefault: string) => {
      const current = ownerOverrides[solId] ?? currentDefault;
      setOwnerOverride(solId, nextOwner(current));
    },
    [ownerOverrides, setOwnerOverride],
  );

  // Build drain lookup
  const drainBySlug = useMemo(() => {
    const map = new Map<string, DrainInfo>();
    for (const d of [...vitalFew, ...usefulMany]) {
      map.set(d.slug, d);
    }
    return map;
  }, [vitalFew, usefulMany]);

  const getZone = useCallback(
    (sol: Solution): "A" | "B" | "C" => {
      for (const slug of sol.wasteSlugs) {
        const drain = drainBySlug.get(slug);
        if (drain) return drain.zone;
      }
      return "C";
    },
    [drainBySlug],
  );

  const getSourceName = useCallback(
    (sol: Solution): string => {
      for (const slug of sol.wasteSlugs) {
        const drain = drainBySlug.get(slug);
        if (drain) return drain.label;
      }
      return sol.wasteSlugs[0] ?? "General";
    },
    [drainBySlug],
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

  if (chosenSolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AnimatedEmoji emoji="📋" animation="float" size="xl" />
        <p className="text-lg" style={{ color: "var(--color-ink-soft)" }}>
          No fixes selected yet. Go to <strong>Assign Fixes</strong> to pick
          some.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-1"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
          }}
        >
          Your Action Plan
        </h2>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          {sortedSolutions.length}{" "}
          {sortedSolutions.length === 1 ? "fix" : "fixes"} selected. Adjust
          effort, impact, and ownership. Sorted by zone then impact.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr
              className="border-b text-xs uppercase tracking-wider"
              style={{
                borderColor: "var(--color-line)",
                color: "var(--color-ink-soft)",
              }}
            >
              <th className="py-2 px-2 font-medium">Zone</th>
              <th className="py-2 px-2 font-medium">Source</th>
              <th className="py-2 px-2 font-medium">Fix</th>
              <th className="py-2 px-2 font-medium">Owner</th>
              <th className="py-2 px-2 font-medium">Effort</th>
              <th className="py-2 px-2 font-medium">Impact</th>
              <th className="py-2 px-2 font-medium">Reclaim</th>
              <th className="py-2 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {sortedSolutions.map((sol, i) => {
                const zone = getZone(sol);
                const scores = solutionScores[sol.id] ?? {
                  effort: 2,
                  impact: 2,
                };
                const owner = ownerOverrides[sol.id] ?? sol.owner;
                return (
                  <TableRow
                    key={sol.id}
                    solution={sol}
                    zone={zone}
                    sourceName={getSourceName(sol)}
                    effort={scores.effort}
                    impact={scores.impact}
                    owner={owner}
                    reclaimHint={sol.reclaimHint}
                    onRemove={() => removeSolution(sol.id)}
                    onSetEffort={(v) =>
                      setSolutionScore(sol.id, { effort: v })
                    }
                    onSetImpact={(v) =>
                      setSolutionScore(sol.id, { impact: v })
                    }
                    onCycleOwner={() => cycleOwner(sol.id, sol.owner)}
                    index={i}
                  />
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <AnimatePresence mode="popLayout">
          {sortedSolutions.map((sol, i) => {
            const zone = getZone(sol);
            const scores = solutionScores[sol.id] ?? {
              effort: 2,
              impact: 2,
            };
            const owner = ownerOverrides[sol.id] ?? sol.owner;
            return (
              <MobileCard
                key={sol.id}
                solution={sol}
                zone={zone}
                sourceName={getSourceName(sol)}
                effort={scores.effort}
                impact={scores.impact}
                owner={owner}
                reclaimHint={sol.reclaimHint}
                onRemove={() => removeSolution(sol.id)}
                onSetEffort={(v) =>
                  setSolutionScore(sol.id, { effort: v })
                }
                onSetImpact={(v) =>
                  setSolutionScore(sol.id, { impact: v })
                }
                onCycleOwner={() => cycleOwner(sol.id, sol.owner)}
                index={i}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
