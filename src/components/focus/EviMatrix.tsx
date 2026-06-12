"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Cell,
} from "recharts";
import { useAuditStore } from "@/stores/audit-store";
import type { Solution } from "@/lib/data/solutions";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";

interface DrainInfo {
  slug: string;
  label: string;
  hoursPerWeek: number;
  zone: "A" | "B" | "C";
}

interface EviMatrixProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
}

interface DotData {
  x: number; // effort 1-5
  y: number; // impact 1-5
  z: number; // size (reclaim hours approximation)
  id: string;
  idx: number; // display number
  title: string;
  zone: "A" | "B" | "C";
  sourceName: string;
  reclaimHint: string;
}

const ZONE_COLORS: Record<string, string> = {
  A: "#e03e12", // waste vermilion
  B: "#edb215", // gold
  C: "#7a6f5f", // ink-soft/gray
};

const EFFORT_TICKS = [1, 2, 3, 4, 5];
const IMPACT_TICKS = [1, 2, 3, 4, 5];
const EFFORT_LABELS: Record<number, string> = {
  1: "Easy",
  2: "Quick",
  3: "Moderate",
  4: "Heavy",
  5: "Hard",
};
const IMPACT_LABELS: Record<number, string> = {
  1: "Low",
  2: "Minor",
  3: "Moderate",
  4: "High",
  5: "Huge",
};

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: DotData;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;

  const radius = Math.max(12, Math.min(28, 10 + payload.z * 3));
  const color = ZONE_COLORS[payload.zone] ?? ZONE_COLORS.C;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        fillOpacity={0.85}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={11}
        fontWeight={700}
        style={{ pointerEvents: "none" }}
      >
        {payload.idx}
      </text>
    </g>
  );
}

function CustomTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DotData }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  return (
    <div
      className="rounded-lg p-3 shadow-lg text-sm max-w-xs"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-line)",
        color: "var(--color-ink)",
      }}
    >
      <div className="font-semibold mb-1">
        #{data.idx} {data.title}
      </div>
      <div className="text-xs mb-1" style={{ color: "var(--color-ink-soft)" }}>
        Source: {data.sourceName}
      </div>
      <div className="text-xs italic" style={{ color: "var(--color-ink-soft)" }}>
        {data.reclaimHint}
      </div>
      <div className="flex gap-3 mt-2 text-xs">
        <span>
          Effort: <strong>{data.x}</strong>
        </span>
        <span>
          Impact: <strong>{data.y}</strong>
        </span>
      </div>
    </div>
  );
}

export default function EviMatrix({ vitalFew, usefulMany }: EviMatrixProps) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const solutionScores = useAuditStore((s) => s.solutionScores);
  const setSolutionScore = useAuditStore((s) => s.setSolutionScore);

  const [editingId, setEditingId] = useState<string | null>(null);

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

  const dotData: DotData[] = useMemo(() => {
    return chosenSolutions.map((sol, i) => {
      const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
      const zone = getZone(sol);
      // Approximate reclaim for dot size
      let reclaimApprox = 1;
      for (const slug of sol.wasteSlugs) {
        const drain = drainBySlug.get(slug);
        if (drain) {
          reclaimApprox = drain.hoursPerWeek * (scores.impact / 5);
          break;
        }
      }
      return {
        x: scores.effort,
        y: scores.impact,
        z: Math.max(0.5, reclaimApprox),
        id: sol.id,
        idx: i + 1,
        title: sol.title,
        zone,
        sourceName: getSourceName(sol),
        reclaimHint: sol.reclaimHint,
      };
    });
  }, [chosenSolutions, solutionScores, drainBySlug, getZone, getSourceName]);

  const editingSolution = useMemo(() => {
    if (!editingId) return null;
    const sol = chosenSolutions.find((s) => s.id === editingId);
    if (!sol) return null;
    const scores = solutionScores[editingId] ?? { effort: 2, impact: 2 };
    return { sol, scores };
  }, [editingId, chosenSolutions, solutionScores]);

  if (chosenSolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AnimatedEmoji emoji="⚡" animation="float" size="xl" />
        <p className="text-lg" style={{ color: "var(--color-ink-soft)" }}>
          No fixes to plot yet. Go to <strong>Assign Fixes</strong> to pick
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
          Effort x Impact Matrix
        </h2>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Click a dot to adjust its effort and impact scores.
        </p>
      </div>

      <div
        className="surface-card p-4 relative"
        style={{ borderTop: "4px solid", borderImage: "linear-gradient(to right, #e03e12, #edb215) 1" }}
      >
        {/* Quadrant labels */}
        <div className="hidden sm:block absolute top-6 left-10 z-10 text-xs font-medium opacity-60 pointer-events-none">
          🤩 Quick Wins
        </div>
        <div className="hidden sm:block absolute top-6 right-10 z-10 text-xs font-medium opacity-60 pointer-events-none">
          💪 Major Projects
        </div>
        <div className="hidden sm:block absolute bottom-14 left-10 z-10 text-xs font-medium opacity-60 pointer-events-none">
          🤷 Fill-ins
        </div>
        <div className="hidden sm:block absolute bottom-14 right-10 z-10 text-xs font-medium opacity-60 pointer-events-none">
          😬 Thankless
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
            onClick={(e) => {
              // Handle click on data point
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const ev = e as any;
              if (ev?.activePayload && ev.activePayload.length > 0) {
                const clicked = ev.activePayload[0].payload as DotData;
                setEditingId(
                  editingId === clicked.id ? null : clicked.id,
                );
              }
            }}
          >
            {/* Quick Wins quadrant background (top-left) */}
            <ReferenceArea
              x1={0.5}
              x2={2.5}
              y1={3.5}
              y2={5.5}
              fill="rgba(196, 24, 106, 0.06)"
              strokeOpacity={0}
            />
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-line)"
            />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0.5, 5.5]}
              ticks={EFFORT_TICKS}
              tickFormatter={(v: number) => EFFORT_LABELS[v] ?? String(v)}
              name="Effort"
              label={{
                value: "Effort →",
                position: "insideBottom",
                offset: -5,
                style: {
                  fontSize: 12,
                  fill: "var(--color-ink-soft)",
                },
              }}
              tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
              stroke="var(--color-line)"
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0.5, 5.5]}
              ticks={IMPACT_TICKS}
              tickFormatter={(v: number) => IMPACT_LABELS[v] ?? String(v)}
              name="Impact"
              label={{
                value: "← Impact",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: {
                  fontSize: 12,
                  fill: "var(--color-ink-soft)",
                },
              }}
              tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
              stroke="var(--color-line)"
            />
            <Tooltip
              content={<CustomTooltipContent />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter
              data={dotData}
              shape={<CustomDot />}
              isAnimationActive={true}
            >
              {dotData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={ZONE_COLORS[entry.zone] ?? ZONE_COLORS.C}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-2 pb-2">
          {(["A", "B", "C"] as const).map((z) => (
            <div key={z} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: ZONE_COLORS[z] }}
              />
              <span style={{ color: "var(--color-ink-soft)" }}>
                Zone {z}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs">
            <span style={{ color: "var(--color-ink-soft)" }}>
              Dot size = reclaim potential
            </span>
          </div>
        </div>
      </div>

      {/* Inline editor */}
      <AnimatePresence>
        {editingSolution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 p-4 rounded-xl border"
              style={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-reclaim)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-ink)" }}
                >
                  Editing: {editingSolution.sol.title}
                </h4>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs cursor-pointer px-2 py-1 rounded border"
                  style={{
                    borderColor: "var(--color-line)",
                    color: "var(--color-ink-soft)",
                  }}
                >
                  Done
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-xs mb-2 font-medium"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    Effort (1 = easy, 5 = hard)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setSolutionScore(editingId!, { effort: v })
                        }
                        className="w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer"
                        style={{
                          backgroundColor:
                            editingSolution.scores.effort === v
                              ? "var(--color-waste)"
                              : "var(--color-paper)",
                          color:
                            editingSolution.scores.effort === v
                              ? "white"
                              : "var(--color-ink)",
                          border: `1px solid ${
                            editingSolution.scores.effort === v
                              ? "var(--color-waste)"
                              : "var(--color-line)"
                          }`,
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    className="block text-xs mb-2 font-medium"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    Impact (1 = low, 5 = huge)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setSolutionScore(editingId!, { impact: v })
                        }
                        className="w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer"
                        style={{
                          backgroundColor:
                            editingSolution.scores.impact === v
                              ? "var(--color-reclaim)"
                              : "var(--color-paper)",
                          color:
                            editingSolution.scores.impact === v
                              ? "white"
                              : "var(--color-ink)",
                          border: `1px solid ${
                            editingSolution.scores.impact === v
                              ? "var(--color-reclaim)"
                              : "var(--color-line)"
                          }`,
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution key */}
      <div className="mt-4 surface-card p-4">
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Solution Key
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {dotData.map((d) => (
            <button
              key={d.id}
              onClick={() => setEditingId(editingId === d.id ? null : d.id)}
              className="flex items-center gap-2 text-xs text-left py-1 px-2 rounded hover:opacity-80 cursor-pointer transition-opacity"
              style={{ color: "var(--color-ink)" }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: ZONE_COLORS[d.zone] }}
              >
                {d.idx}
              </span>
              <span className="truncate">{d.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
