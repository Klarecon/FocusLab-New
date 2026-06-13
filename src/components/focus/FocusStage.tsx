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
  const chosenSolutions = useAuditStore((s) => s.chosenSolutions);

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

  if (!paretoResult || paretoResult.categories.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4" aria-hidden="true">🤔</div>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
          }}
        >
          Nothing to fix yet
        </h1>
        <p
          className="text-base mb-6"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Run the audit first so we know what&apos;s eating your week. Then come back here to fix it.
        </p>
        <a
          href="/analyzer"
          className="inline-block px-8 py-3 rounded-xl text-white font-bold text-base no-underline"
          style={{ backgroundColor: "var(--color-reclaim)" }}
        >
          Find your drains first
        </a>
      </div>
    );
  }

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
          Fix What&apos;s Draining You
        </h1>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Pick the fixes that fit your life, see what&apos;s easy vs. hard, and find out how much time you actually get back.
        </p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Focus tool views"
        className="flex gap-1 p-1 rounded-xl mb-8"
        style={{ backgroundColor: "var(--color-line)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
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
            {/* Fix count badge on Action Plan and Impact Matrix tabs */}
            {tab.id !== "assign" && chosenSolutions.length > 0 && activeTab !== tab.id && (
              <span
                className="ml-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(196, 24, 106, 0.15)",
                  color: "var(--color-reclaim)",
                }}
              >
                {chosenSolutions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
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
          {activeTab === "plan" && (
            <FocusTable
              vitalFew={vitalFew}
              usefulMany={usefulMany}
              onGoToMatrix={() => setActiveTab("matrix")}
            />
          )}
          {activeTab === "matrix" && (
            <div className="space-y-12">
              <EviMatrix vitalFew={vitalFew} usefulMany={usefulMany} />
              {/* Gradient divider */}
              <div
                className="h-1 rounded-full mx-auto max-w-xs"
                style={{ background: "linear-gradient(to right, #e03e12, #c4186a, #edb215)" }}
              />
              <Payoff vitalFew={vitalFew} usefulMany={usefulMany} onGoToAssign={() => setActiveTab("assign")} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
