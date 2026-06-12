"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/stores/audit-store";
import SolutionPicker from "./SolutionPicker";
import FocusTable from "./FocusTable";
import EviMatrix from "./EviMatrix";
import Payoff from "./Payoff";

const TABS = [
  { id: "assign", label: "Assign Fixes", emoji: "🎯" },
  { id: "plan", label: "Action Plan", emoji: "😤" },
  { id: "matrix", label: "Impact Matrix", emoji: "⚡" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FocusStage() {
  const [activeTab, setActiveTab] = useState<TabId>("assign");
  const paretoResult = useAuditStore((s) => s.paretoResult);

  // Scroll to top on every tab switch
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const { vitalFew, usefulMany } = useMemo(() => {
    if (!paretoResult) return { vitalFew: [], usefulMany: [] };

    return {
      vitalFew: paretoResult.categories
        .filter((c) => c.zone === "A")
        .map((c) => ({
          slug: c.categorySlug,
          label: c.label ?? c.categorySlug,
          hoursPerWeek: c.hoursPerWeek,
          zone: c.zone,
        })),
      usefulMany: paretoResult.categories
        .filter((c) => c.zone === "B")
        .map((c) => ({
          slug: c.categorySlug,
          label: c.label ?? c.categorySlug,
          hoursPerWeek: c.hoursPerWeek,
          zone: c.zone,
        })),
    };
  }, [paretoResult]);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
          }}
        >
          Focus Table & EVI Matrix
        </h1>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Pick research-backed fixes for your biggest drains, score them, and see
          your payoff.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-8"
        style={{ backgroundColor: "var(--color-line)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer"
            style={{
              color:
                activeTab === tab.id
                  ? "#fff"
                  : "var(--color-ink-soft)",
              backgroundColor:
                activeTab === tab.id ? "var(--color-reclaim)" : "transparent",
              boxShadow:
                activeTab === tab.id
                  ? "0 2px 8px rgba(196, 24, 106, 0.25)"
                  : "none",
            }}
          >
            <span aria-hidden="true">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "assign" && (
            <SolutionPicker
              vitalFew={vitalFew}
              usefulMany={usefulMany}
              onGoToPlan={() => setActiveTab("plan")}
            />
          )}
          {activeTab === "plan" && <FocusTable vitalFew={vitalFew} usefulMany={usefulMany} />}
          {activeTab === "matrix" && (
            <div className="space-y-12">
              <EviMatrix vitalFew={vitalFew} usefulMany={usefulMany} />
              <Payoff vitalFew={vitalFew} usefulMany={usefulMany} onGoToAssign={() => setActiveTab("assign")} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
