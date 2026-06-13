"use client";

import { useState, useMemo } from "react";
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
  ReferenceLine,
  Cell,
} from "recharts";
import { useAuditStore } from "@/stores/audit-store";
import { quadrant, QUADRANT_META } from "@/lib/engine/solutions-logic";
import type { Score, QuadrantLabel } from "@/lib/engine/types";
import AnimatedEmoji from "@/components/ui/AnimatedEmoji";
import { useDrainLookup, type DrainInfo } from "./shared/useDrainLookup";

interface EviMatrixProps {
  vitalFew: DrainInfo[];
  usefulMany: DrainInfo[];
}

interface DotData {
  x: number;
  y: number;
  z: number;
  id: string;
  idx: number;
  title: string;
  zone: "A" | "B" | "C";
  sourceName: string;
  reclaimHint: string;
  quadrantLabel: QuadrantLabel;
}

const ZONE_COLORS: Record<string, string> = {
  A: "#e03e12",
  B: "#edb215",
  C: "#7a6f5f",
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

const QUADRANT_BG: Record<QuadrantLabel, string> = {
  "quick-win": "rgba(196, 24, 106, 0.06)",
  "major-project": "rgba(237, 178, 21, 0.06)",
  "fill-in": "rgba(0, 0, 0, 0.02)",
  thankless: "rgba(224, 62, 18, 0.06)",
};

const QUADRANT_LABEL_COLOR: Record<QuadrantLabel, string> = {
  "quick-win": "#c4186a",
  "major-project": "#edb215",
  "fill-in": "#655b4d",
  thankless: "#e03e12",
};

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: DotData;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;

  const radius = Math.max(14, Math.min(28, 10 + payload.z * 3));
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
        style={{ cursor: "pointer", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
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
  const meta = QUADRANT_META[data.quadrantLabel];

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
      <div
        className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1"
        style={{
          color: QUADRANT_LABEL_COLOR[data.quadrantLabel],
          backgroundColor: QUADRANT_BG[data.quadrantLabel],
        }}
      >
        {meta.emoji} {meta.name}
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

function QuadrantSummary({ dotData }: { dotData: DotData[] }) {
  const groups = useMemo(() => {
    const order: QuadrantLabel[] = ["quick-win", "major-project", "fill-in", "thankless"];
    return order
      .map((q) => ({
        quadrant: q,
        meta: QUADRANT_META[q],
        dots: dotData.filter((d) => d.quadrantLabel === q),
      }))
      .filter((g) => g.dots.length > 0);
  }, [dotData]);

  if (groups.length === 0) return null;

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {groups.map((g) => (
        <div
          key={g.quadrant}
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: QUADRANT_BG[g.quadrant],
            borderColor: "var(--color-line)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" aria-hidden="true">{g.meta.emoji}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: QUADRANT_LABEL_COLOR[g.quadrant] }}
            >
              {g.meta.name}
            </span>
          </div>
          <p
            className="text-xs mb-3 italic"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {g.meta.description} <strong>{g.meta.verb}.</strong>
          </p>
          <ul className="space-y-1">
            {g.dots.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: ZONE_COLORS[d.zone] }}
                >
                  {d.idx}
                </span>
                <span className="truncate" style={{ color: "var(--color-ink)" }}>
                  {d.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function EviMatrix({ vitalFew, usefulMany }: EviMatrixProps) {
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);
  const solutionScores = useAuditStore((s) => s.solutionScores);
  const setSolutionScore = useAuditStore((s) => s.setSolutionScore);

  const [editingId, setEditingId] = useState<string | null>(null);
  const { drainBySlug, getZone, getSourceName } = useDrainLookup(vitalFew, usefulMany);

  const dotData: DotData[] = useMemo(() => {
    return chosenSolutions.map((sol, i) => {
      const scores = solutionScores[sol.id] ?? { effort: 2, impact: 2 };
      const zone = getZone(sol);
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
        quadrantLabel: quadrant(scores.effort as Score, scores.impact as Score),
      };
    });
  }, [chosenSolutions, solutionScores, drainBySlug, getZone, getSourceName]);

  const editingSolution = useMemo(() => {
    if (!editingId) return null;
    const sol = chosenSolutions.find((s) => s.id === editingId);
    if (!sol) return null;
    const scores = solutionScores[editingId] ?? { effort: 2, impact: 2 };
    const q = quadrant(scores.effort as Score, scores.impact as Score);
    return { sol, scores, quadrant: q };
  }, [editingId, chosenSolutions, solutionScores]);

  if (chosenSolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AnimatedEmoji emoji="🤔" animation="float" size="xl" />
        <p className="text-lg" style={{ color: "var(--color-ink-soft)" }}>
          Nothing to map yet. Pick your fixes in the{" "}
          <strong style={{ color: "var(--color-reclaim)" }}>Assign Fixes</strong>{" "}
          tab, then come back to see where they land.
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
          Where Should You Start?
        </h2>
        <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Each dot is one of your fixes. The best ones live in the top left — easy to do, big payoff. Click any dot to adjust its scores.
        </p>
      </div>

      {/* Screen reader accessible data table for chart */}
      <div className="sr-only" role="table" aria-label="Effort vs Impact scores for selected fixes">
        <div role="rowgroup">
          <div role="row">
            <span role="columnheader">Fix</span>
            <span role="columnheader">Source</span>
            <span role="columnheader">Effort</span>
            <span role="columnheader">Impact</span>
            <span role="columnheader">Zone</span>
            <span role="columnheader">Quadrant</span>
          </div>
        </div>
        <div role="rowgroup">
          {dotData.map((d) => (
            <div role="row" key={d.id}>
              <span role="cell">{d.title}</span>
              <span role="cell">{d.sourceName}</span>
              <span role="cell">{EFFORT_LABELS[d.x] ?? d.x}</span>
              <span role="cell">{IMPACT_LABELS[d.y] ?? d.y}</span>
              <span role="cell">Zone {d.zone}</span>
              <span role="cell">{QUADRANT_META[d.quadrantLabel].name}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="surface-card p-4 relative"
        aria-hidden="true"
        style={{ borderTop: "4px solid", borderImage: "linear-gradient(to right, #e03e12, #edb215) 1" }}
      >
        {/* Quadrant labels — visible on all screen sizes */}
        <div className="absolute top-6 left-10 z-10 pointer-events-none" aria-hidden="true">
          <span
            className="text-xs sm:text-sm font-semibold px-2 py-1 rounded-full"
            style={{
              color: QUADRANT_LABEL_COLOR["quick-win"],
              backgroundColor: QUADRANT_BG["quick-win"],
            }}
          >
            {QUADRANT_META["quick-win"].emoji} {QUADRANT_META["quick-win"].name}
          </span>
        </div>
        <div className="absolute top-6 right-6 z-10 pointer-events-none" aria-hidden="true">
          <span
            className="text-xs sm:text-sm font-semibold px-2 py-1 rounded-full"
            style={{
              color: QUADRANT_LABEL_COLOR["major-project"],
              backgroundColor: QUADRANT_BG["major-project"],
            }}
          >
            {QUADRANT_META["major-project"].emoji} {QUADRANT_META["major-project"].name}
          </span>
        </div>
        <div className="absolute bottom-14 left-10 z-10 pointer-events-none" aria-hidden="true">
          <span
            className="text-xs sm:text-sm font-semibold px-2 py-1 rounded-full"
            style={{
              color: QUADRANT_LABEL_COLOR["fill-in"],
              backgroundColor: QUADRANT_BG["fill-in"],
            }}
          >
            {QUADRANT_META["fill-in"].emoji} {QUADRANT_META["fill-in"].name}
          </span>
        </div>
        <div className="absolute bottom-14 right-6 z-10 pointer-events-none" aria-hidden="true">
          <span
            className="text-xs sm:text-sm font-semibold px-2 py-1 rounded-full"
            style={{
              color: QUADRANT_LABEL_COLOR["thankless"],
              backgroundColor: QUADRANT_BG["thankless"],
            }}
          >
            {QUADRANT_META["thankless"].emoji} {QUADRANT_META["thankless"].name}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
            onClick={(e) => {
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
            {/* All 4 quadrant backgrounds */}
            <ReferenceArea x1={0.5} x2={2.5} y1={3.5} y2={5.5} fill={QUADRANT_BG["quick-win"]} strokeOpacity={0} />
            <ReferenceArea x1={2.5} x2={5.5} y1={3.5} y2={5.5} fill={QUADRANT_BG["major-project"]} strokeOpacity={0} />
            <ReferenceArea x1={0.5} x2={2.5} y1={0.5} y2={3.5} fill={QUADRANT_BG["fill-in"]} strokeOpacity={0} />
            <ReferenceArea x1={2.5} x2={5.5} y1={0.5} y2={3.5} fill={QUADRANT_BG["thankless"]} strokeOpacity={0} />

            {/* Quadrant divider lines */}
            <ReferenceLine x={2.5} strokeDasharray="6 4" stroke="var(--color-line)" strokeOpacity={0.6} />
            <ReferenceLine y={3.5} strokeDasharray="6 4" stroke="var(--color-line)" strokeOpacity={0.6} />

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
                value: "Effort \u2192",
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
                value: "\u2190 Impact",
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
        <div className="flex items-center justify-center gap-6 mt-2 pb-2 flex-wrap">
          {(["A", "B"] as const).map((z) => (
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
              Bigger dot = more time you reclaim
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
                <div className="flex items-center gap-2">
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Adjust: {editingSolution.sol.title}
                  </h4>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: QUADRANT_LABEL_COLOR[editingSolution.quadrant],
                      backgroundColor: QUADRANT_BG[editingSolution.quadrant],
                    }}
                  >
                    {QUADRANT_META[editingSolution.quadrant].emoji}{" "}
                    {QUADRANT_META[editingSolution.quadrant].name}
                  </span>
                </div>
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
                    How hard is this? (1 = easy, 5 = hard)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setSolutionScore(editingId!, { effort: v })
                        }
                        className="w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer"
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
                    How much does it help? (1 = a little, 5 = a lot)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() =>
                          setSolutionScore(editingId!, { impact: v })
                        }
                        className="w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer"
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

      {/* Quadrant summary — grouped by quadrant with action verbs */}
      <QuadrantSummary dotData={dotData} />

      {/* Solution key */}
      <div className="mt-4 surface-card p-4">
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Your Fixes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {dotData.map((d) => {
            const meta = QUADRANT_META[d.quadrantLabel];
            return (
              <button
                key={d.id}
                onClick={() => setEditingId(editingId === d.id ? null : d.id)}
                className="flex items-center gap-2 text-xs text-left py-1.5 px-2 rounded transition-colors cursor-pointer"
                style={{
                  color: "var(--color-ink)",
                  backgroundColor: editingId === d.id ? "rgba(196, 24, 106, 0.06)" : "transparent",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: ZONE_COLORS[d.zone] }}
                >
                  {d.idx}
                </span>
                <span className="truncate flex-1">{d.title}</span>
                <span
                  className="text-[10px] flex-shrink-0"
                  style={{ color: QUADRANT_LABEL_COLOR[d.quadrantLabel] }}
                >
                  {meta.emoji}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
