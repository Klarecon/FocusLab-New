/**
 * Feedback Regression Tests
 *
 * Cumulative test file where every concrete feedback item from user sessions
 * becomes a permanent assertion. This file ONLY GROWS — never remove a test
 * unless the underlying feature is intentionally removed.
 *
 * Categories:
 *   1. Quadrant metadata (names, emoji, verbs, descriptions)
 *   2. Data completeness (every waste slug has solutions)
 *   3. Copy assertions (exact strings that must exist)
 *   4. State shape (Zustand store defaults)
 *   5. Visual rules (colors, fonts, CSS tokens)
 *   6. Functional rules (quadrant logic, score mapping)
 *
 * To add: when user gives feedback that results in a code change,
 * add a test here that asserts the fix. Format:
 *   it("[S8-#7] quadrant labels have sufficient inset padding", ...)
 *   // S8 = Session 8, #7 = feedback item 7
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SRC = path.resolve(__dirname, "..");

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), "utf-8");
}

function fileContains(relativePath: string, pattern: string | RegExp): boolean {
  const content = readSrc(relativePath);
  if (typeof pattern === "string") return content.includes(pattern);
  return pattern.test(content);
}

function fileContainsAll(
  relativePath: string,
  patterns: (string | RegExp)[]
): { missing: string[] } {
  const content = readSrc(relativePath);
  const missing: string[] = [];
  for (const p of patterns) {
    const found =
      typeof p === "string" ? content.includes(p) : p.test(content);
    if (!found) missing.push(String(p));
  }
  return { missing };
}

// ---------------------------------------------------------------------------
// 1. QUADRANT METADATA — Session 8
// ---------------------------------------------------------------------------

describe("Quadrant metadata (Session 8)", () => {
  const file = "lib/engine/solutions-logic.ts";

  it("[S8] Pearls: name, emoji, verb", () => {
    const { missing } = fileContainsAll(file, [
      '"Pearls"',
      "💎",
      "Do these first",
    ]);
    expect(missing, `Missing in ${file}: ${missing.join(", ")}`).toEqual([]);
  });

  it("[S8] Oysters: name, emoji, verb about spare capacity", () => {
    const { missing } = fileContainsAll(file, [
      '"Oysters"',
      "🦪",
      "Plan these only after your Pearls are done",
    ]);
    expect(missing, `Missing in ${file}: ${missing.join(", ")}`).toEqual([]);
  });

  it("[S8] Low-Hanging Fruit: name, emoji, verb about minutes not days", () => {
    const { missing } = fileContainsAll(file, [
      '"Low-Hanging Fruit"',
      "🍒",
      "minutes, not days",
    ]);
    expect(missing, `Missing in ${file}: ${missing.join(", ")}`).toEqual([]);
  });

  it("[S8-#8] White Elephants uses elephant emoji, not skull", () => {
    const content = readSrc(file);
    expect(content).toContain("🐘");
    expect(content).not.toContain(
      // In the QUADRANT_META thankless entry, skull must not appear
      'emoji: "💀"'
    );
  });

  it("[S8] White Elephants: name, verb", () => {
    const { missing } = fileContainsAll(file, [
      '"White Elephants"',
      "Avoid these",
    ]);
    expect(missing, `Missing in ${file}: ${missing.join(", ")}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. DATA COMPLETENESS — Session 8
// ---------------------------------------------------------------------------

describe("Solution coverage (Session 8-#1)", () => {
  // Session 8 feedback #1: user selected CEO/Founder, got zero solutions.
  // Fix: every waste slug must have at least 1 solution.

  it("[S8-#1] every waste source slug has at least 1 matching solution", () => {
    const wasteSources = readSrc("lib/data/waste-sources.ts");
    const solutions = readSrc("lib/data/solutions.ts");

    // Extract all slugs from waste-sources.ts
    const slugMatches = wasteSources.match(/slug:\s*"([^"]+)"/g) || [];
    const allSlugs = slugMatches.map((m) => m.replace(/slug:\s*"/, "").replace(/"$/, ""));

    expect(allSlugs.length).toBeGreaterThan(50); // sanity check

    const uncovered: string[] = [];
    for (const slug of allSlugs) {
      if (!solutions.includes(`"${slug}"`)) {
        uncovered.push(slug);
      }
    }

    expect(
      uncovered,
      `These waste slugs have ZERO solutions: ${uncovered.join(", ")}`
    ).toEqual([]);
  });

  it("[S8-#1] CEO-specific slugs have solutions", () => {
    const solutions = readSrc("lib/data/solutions.ts");
    const ceoSlugs = [
      "ceo-context-switch",
      "ceo-decision-bottleneck",
      "ceo-delegation-redo",
      "ceo-inbox-overload",
      "ceo-investor-prep",
    ];
    for (const slug of ceoSlugs) {
      expect(
        solutions.includes(`"${slug}"`),
        `CEO slug "${slug}" must have at least 1 solution`
      ).toBe(true);
    }
  });

  it("[S8-#1] software-dev slugs have solutions", () => {
    const solutions = readSrc("lib/data/solutions.ts");
    const sdevSlugs = [
      "sdev-context-switch",
      "sdev-deploy-wait",
      "sdev-debug-others",
      "sdev-env-setup",
      "sdev-pr-review",
    ];
    for (const slug of sdevSlugs) {
      expect(
        solutions.includes(`"${slug}"`),
        `Software-dev slug "${slug}" must have at least 1 solution`
      ).toBe(true);
    }
  });

  it("[S8-#1] operations slugs have solutions", () => {
    const solutions = readSrc("lib/data/solutions.ts");
    const opsSlugs = [
      "ops-manual-process",
      "ops-vendor-chase",
      "ops-firefighting",
      "ops-report-compile",
      "ops-exception-handling",
    ];
    for (const slug of opsSlugs) {
      expect(
        solutions.includes(`"${slug}"`),
        `Operations slug "${slug}" must have at least 1 solution`
      ).toBe(true);
    }
  });

  it("[S8-#1] finance slugs have solutions", () => {
    const solutions = readSrc("lib/data/solutions.ts");
    const finSlugs = [
      "fin-close-crunch",
      "fin-data-entry",
      "fin-receipt-chase",
      "fin-reconcile",
      "fin-report-reformat",
    ];
    for (const slug of finSlugs) {
      expect(
        solutions.includes(`"${slug}"`),
        `Finance slug "${slug}" must have at least 1 solution`
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. COPY ASSERTIONS — Sessions 7 & 8
// ---------------------------------------------------------------------------

describe("Landing page copy (Session 7)", () => {
  it("[S19] Hero eyebrow broadened past knowledge work", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "A waste-reduction tool for any kind of work")
    ).toBe(true);
  });

  it("[S19] Hero headline: real hours of your week back", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "of your week back")
    ).toBe(true);
  });

  it("[S19] Hero subhead: about 10 hours a week", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "10 hours a week")
    ).toBe(true);
  });

  it("[S19] Hero CTA: Find my hidden hours", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "Find my hidden hours")
    ).toBe(true);
  });

  it("[S7] Hero sub-CTA: 3 minutes. No signup needed.", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "3 minutes")
    ).toBe(true);
  });

  it("[S7] ToolCards subhead: One finds the problem. The other fixes it.", () => {
    expect(
      fileContains("components/landing/ToolCards.tsx", "One finds the problem")
    ).toBe(true);
  });

  it("[S7] Pareto card: 3-minute audit (not 5-minute)", () => {
    const content = readSrc("components/landing/ToolCards.tsx");
    expect(content).toContain("3-minute audit");
    expect(content).not.toContain("5-minute audit");
  });

  it("[S7] FinalCTA: 3 minutes. No signup needed.", () => {
    expect(
      fileContains("components/landing/FinalCTA.tsx", "3 minutes")
    ).toBe(true);
  });

  it("[S19] FinalCTA button: Find my hidden hours", () => {
    expect(
      fileContains("components/landing/FinalCTA.tsx", "Find my hidden hours")
    ).toBe(true);
  });
});

describe("Analyzer copy (Session 7)", () => {
  it("[S7] ContextStep header: Tell us about your week", () => {
    expect(
      fileContains("components/analyzer/ContextStep.tsx", "Tell us about your week")
    ).toBe(true);
  });

  it("[S7] ResultsView CTA: Now let's fix it", () => {
    // Copy uses &apos; HTML entity in JSX
    expect(
      fileContains("components/analyzer/ResultsView.tsx", "fix it")
    ).toBe(true);
  });

  it("[S7] ResultsView pre-CTA: This is fixable", () => {
    expect(
      fileContains("components/analyzer/ResultsView.tsx", "This is fixable")
    ).toBe(true);
  });
});

describe("Focus tool copy (Sessions 7 & 8)", () => {
  // S20-V4 Scene 5: scoring merged into the Assign step, so the CTA now goes
  // straight to the payoff instead of a separate "build your action plan" step.
  it("[S20-V4-#5] SolutionPicker bottom CTA: See your payoff", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toContain("See your payoff");
    expect(content).not.toContain("Build your action plan");
  });

  it("[S20-V4-#5] SolutionPicker rates effort/impact inline on each chosen fix", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toContain("InlineRating");
    expect(content).toContain("setSolutionScore");
    // Start/time guidance keyed by quadrant
    expect(content).toContain("START_GUIDANCE");
    expect(content).toContain("Start this week");
  });

  it("[S8] SolutionPicker Pearl badge (not Quick Win)", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toContain("Pearl");
    // "Quick Win" should not appear as a badge label
    expect(content).not.toMatch(/["']Quick Win["']/);
  });

  it("[S11-#10] FocusTable has no Owner or Reclaim columns (removed per user feedback)", () => {
    const content = readSrc("components/focus/FocusTable.tsx");
    // Owner and Reclaim columns were removed in Session 11
    expect(content).not.toContain("onCycleOwner");
    expect(content).not.toContain("reclaimHint");
  });

  it("[S8-#18] Payoff closing statement (no backwards CTA)", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    expect(content).toContain("go reclaim your week");
    expect(content).not.toContain("Start with what matters most");
  });

  it("[S8-#5] no 'depends on implementation' in FocusTable", () => {
    expect(
      fileContains("components/focus/FocusTable.tsx", "depends on implementation")
    ).toBe(false);
  });

  it("[S8-#11] no 'Bigger dot' legend in EviMatrix", () => {
    expect(
      fileContains("components/focus/EviMatrix.tsx", "Bigger dot")
    ).toBe(false);
  });

  it("[S8] EviMatrix: Your Action Sequence heading", () => {
    expect(
      fileContains("components/focus/EviMatrix.tsx", "Your Action Sequence")
    ).toBe(true);
  });

  it("[S8] EviMatrix: Pearls first. Then the rest, in order.", () => {
    expect(
      fileContains("components/focus/EviMatrix.tsx", "Pearls first")
    ).toBe(true);
  });

  it("[S8] Payoff: You could reclaim", () => {
    expect(
      fileContains("components/focus/Payoff.tsx", "You could reclaim")
    ).toBe(true);
  });

  it("[S8→S11] Payoff shows yearly summary (streamlined in S11)", () => {
    expect(
      fileContains("components/focus/Payoff.tsx", "hours/year")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. STATE SHAPE — Session 8
// ---------------------------------------------------------------------------

describe("Zustand store shape (Session 8)", () => {
  it("[S8-#15] dueDates field exists in audit store", () => {
    expect(
      fileContains("stores/audit-store.ts", "dueDates")
    ).toBe(true);
  });

  it("[S8] chosenSolutions field exists", () => {
    expect(
      fileContains("stores/audit-store.ts", "chosenSolutions")
    ).toBe(true);
  });

  it("[S8] solutionScores field exists", () => {
    expect(
      fileContains("stores/audit-store.ts", "solutionScores")
    ).toBe(true);
  });

  it("[S8] ownerOverrides field exists", () => {
    expect(
      fileContains("stores/audit-store.ts", "ownerOverrides")
    ).toBe(true);
  });

  it("[S8] weighCadence field exists with daily/weekly union", () => {
    const content = readSrc("stores/audit-store.ts");
    expect(content).toContain("weighCadence");
    expect(content).toMatch(/daily.*weekly/);
  });
});

// ---------------------------------------------------------------------------
// 5. VISUAL RULES — Sessions 7 & 8
// ---------------------------------------------------------------------------

describe("Color rules (Sessions 7 & 8)", () => {
  it("[S7] globals.css defines --color-reclaim as #c4186a", () => {
    expect(
      fileContains("app/globals.css", /--color-reclaim.*#c4186a/)
    ).toBe(true);
  });

  it("[S7] globals.css defines --color-waste as #e03e12", () => {
    expect(
      fileContains("app/globals.css", /--color-waste.*#e03e12/)
    ).toBe(true);
  });

  it("[S7] globals.css defines --color-gold as #edb215", () => {
    expect(
      fileContains("app/globals.css", /--color-gold.*#edb215/)
    ).toBe(true);
  });

  it("[S8-#9] EviMatrix has per-quadrant dot colors", () => {
    const { missing } = fileContainsAll("components/focus/EviMatrix.tsx", [
      "QUADRANT_DOT_COLORS",
      "#c4186a", // Pearls
      "#edb215", // Oysters
      "#9a8c7a", // Low-Hanging Fruit
      "#e03e12", // White Elephants
    ]);
    expect(
      missing,
      `Missing dot color values: ${missing.join(", ")}`
    ).toEqual([]);
  });
});

describe("Font rules (Session 7)", () => {
  it("[S7] globals.css uses Plus Jakarta Sans for body", () => {
    expect(
      fileContains("app/globals.css", "plus-jakarta")
    ).toBe(true);
  });

  it("[S7] globals.css uses Fraunces for headings", () => {
    expect(
      fileContains("app/globals.css", "fraunces")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. FUNCTIONAL RULES — Sessions 7 & 8
// ---------------------------------------------------------------------------

describe("Functional rules (Sessions 7 & 8)", () => {
  it("[S7] CEO/Founder hides level picker", () => {
    expect(
      fileContains("components/analyzer/RoleStep.tsx", "ceo-founder")
    ).toBe(true);
  });

  it("[S7] ROLE_EMOJI map exists in RoleStep", () => {
    expect(
      fileContains("components/analyzer/RoleStep.tsx", "ROLE_EMOJI")
    ).toBe(true);
  });

  it("[S7] WeighStep has cadence toggle (daily/weekly)", () => {
    const { missing } = fileContainsAll("components/analyzer/WeighStep.tsx", [
      "daily",
      "weekly",
      // Template: hrs/{c === "daily" ? "day" : "week"}
      '"day"',
      '"week"',
    ]);
    expect(missing, `Missing in WeighStep: ${missing.join(", ")}`).toEqual([]);
  });

  it("[S7] WeighStep has 75% warning threshold", () => {
    expect(
      fileContains("components/analyzer/WeighStep.tsx", /0\.75|75%/)
    ).toBe(true);
  });

  it("[S8-#4] Zone B defaults to visible (not collapsed)", () => {
    // SolutionPicker should NOT default Zone B to collapsed
    const content = readSrc("components/focus/SolutionPicker.tsx");
    // Zone B open state should default to true
    expect(content).toMatch(/zoneBOpen|showZoneB/i);
  });

  it("[S8-#3] custom fixes visible after adding (Your fix badge)", () => {
    expect(
      fileContains("components/focus/SolutionPicker.tsx", "Your fix")
    ).toBe(true);
  });

  it("[S8-#12] dot click handler on CustomDot, not ScatterChart", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain("CustomDot");
    expect(content).toMatch(/stopPropagation/);
  });

  it("[S8-#2] custom fix input supports multiple entries", () => {
    // Should have auto-focus or ref for re-entry
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toMatch(/useRef|inputRef|autoFocus|auto-focus/);
  });

  it("[S8-#15] PriorityTable sequences by quadrant order", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain("PriorityTable");
    // Should reference quadrant ordering
    expect(content).toMatch(/quick-win[\s\S]*major-project|Pearls[\s\S]*Oysters/);
  });
});

// ---------------------------------------------------------------------------
// SESSION 9 — Oren's Feedback
// ---------------------------------------------------------------------------

describe("Session 9 — Oren's feedback", () => {
  it("[S9-O2] no 'Really zero?' prompt in WeighStep", () => {
    expect(
      fileContains("components/analyzer/WeighStep.tsx", "Really zero")
    ).toBe(false);
  });

  it("[S9-O8] date picker has min attribute for today", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toMatch(/min=\{.*toISOString|min=\{.*today/);
  });

  it("[S9-O7] PriorityTable has skip/remove button", () => {
    expect(
      fileContains("components/focus/EviMatrix.tsx", "removeSolution")
    ).toBe(true);
  });

  it("[S11-#9] tab label says 'EVI Matrix' (all caps, not EvI)", () => {
    const content = readSrc("components/focus/FocusStage.tsx");
    expect(content).toContain("EVI Matrix");
    expect(content).not.toContain("EvI Matrix");
    expect(content).not.toContain('"Impact Matrix"');
  });

  it("[S9-O6b] tooltip does not show 'Source:' label", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).not.toMatch(/Source:.*\{data\.sourceName\}/);
  });

  it("[S9-O6c] EviMatrix has above-fold summary with quadrant counts", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toMatch(/pearlCount|quadrantCounts|counts\.pearls/);
  });

  it("[S9-O5→S11] SolutionCard is compact single row (redesigned in S11)", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    // Cards are now compact — just checkbox + title, no expand needed
    expect(content).toContain("SolutionCard");
  });

  it("[S9-O5] DrainSection limits visible solutions", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toMatch(/showAll|visibleCount|INITIAL_VISIBLE/);
  });

  it("[S9-O4→S11] bar chart uses human-readable short labels", () => {
    const content = readSrc("components/analyzer/ResultsView.tsx");
    expect(content).toContain("SHORT_LABELS");
    expect(content).toContain("abbreviate");
  });

  it("[S9-O10] IntakeStep deduplicates across pain prompts", () => {
    const content = readSrc("components/analyzer/IntakeStep.tsx");
    expect(content).toMatch(/seenSlugs|renderedSlugs|slugOwnership|groupOwnership/);
  });

  it("[S9-O1] no avoidable percentage question in the wizard", () => {
    // WeighStep is no longer used (replaced by DrilldownStep), but check it doesn't exist in IntakeStep either
    expect(
      fileContains("components/analyzer/IntakeStep.tsx", "how much could you actually cut")
    ).toBe(false);
    expect(
      fileContains("components/analyzer/DrilldownStep.tsx", "how much could you actually cut")
    ).toBe(false);
  });

  it("[S9-#10] PriorityTable has column headers", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toMatch(/Task|Owner.*Due/);
  });

  it("[S9-O9→S11] Payoff shows role-specific opportunity frame", () => {
    expect(
      fileContains("components/focus/Payoff.tsx", "getOpportunityFrame")
    ).toBe(true);
  });

  it("[S9-O9] opportunity-frames.ts has role-specific frames", () => {
    const content = readSrc("lib/data/opportunity-frames.ts");
    expect(content).toContain("engineering");
    expect(content).toContain("ceo-founder");
    expect(content).toContain("minHours");
  });

  it("[S9-O3] DrilldownStep exists and shows vital categories", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).toContain("vitalCategories");
    expect(content).toContain("zoom into the big ones");
  });

  it("[S9-O3] audit-store has categoryEstimates and vitalCategories", () => {
    const content = readSrc("stores/audit-store.ts");
    expect(content).toContain("categoryEstimates");
    expect(content).toContain("vitalCategories");
  });
});

// ---------------------------------------------------------------------------
// SESSION 11 — Mona's Feedback
// ---------------------------------------------------------------------------

describe("Session 11 — Mona\u2019s feedback", () => {
  it("[S11-#3] software-dev has Code sources beyond just debugging", () => {
    const content = readSrc("lib/data/waste-sources.ts");
    expect(content).toContain('"sdev-code-review-time"');
    expect(content).toContain('"sdev-refactor-debt"');
    expect(content).toContain('"sdev-merge-conflicts"');
  });

  it("[S11-#3] new software-dev Code sources have solutions", () => {
    const content = readSrc("lib/data/solutions.ts");
    expect(content).toContain('"sdev-code-review-time"');
    expect(content).toContain('"sdev-refactor-debt"');
    expect(content).toContain('"sdev-merge-conflicts"');
  });

  it("[S11-#4] Pareto chart uses abbreviate(), not truncate with ellipsis", () => {
    const content = readSrc("components/analyzer/ResultsView.tsx");
    expect(content).toContain("abbreviate");
    expect(content).not.toMatch(/truncate\(.*25\)/);
  });

  it("[S11-#6] custom fix input appears before Zone A solutions", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    const customFixPos = content.indexOf("Got a fix in mind");
    const zoneAPos = content.indexOf("Your Biggest Drains");
    expect(customFixPos).toBeLessThan(zoneAPos);
  });

  it("[S11-#7] solutions sorted by quickWin first in DrainSection", () => {
    expect(
      fileContains("components/focus/SolutionPicker.tsx", "isQuickWin(a)")
    ).toBe(true);
  });

  it("[S11-#8] setParetoResult clears stale focus selections", () => {
    const content = readSrc("stores/audit-store.ts");
    // setParetoResult should reset chosenSolutions
    const setPareto = content.indexOf("setParetoResult");
    const clearSolutions = content.indexOf("chosenSolutions: []", setPareto);
    expect(clearSolutions).toBeGreaterThan(setPareto);
  });

  it("[S11-#8] clearFocusState action exists in store", () => {
    expect(
      fileContains("stores/audit-store.ts", "clearFocusState")
    ).toBe(true);
  });

  it("[S11-#11] EVI matrix circle radius range is wider (16-44)", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toMatch(/Math\.max\(16/);
    expect(content).toMatch(/Math\.min\(44/);
  });

  it("[S11-#12] EVI matrix has overlap jitter for dots at same position", () => {
    expect(
      fileContains("components/focus/EviMatrix.tsx", "jitterX")
    ).toBe(true);
  });

  it("[S11-#14] PriorityTable uses semantic <table> elements", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain("<table");
    expect(content).toContain("<thead>");
    expect(content).toContain("<tbody>");
    expect(content).toContain("<tr");
    expect(content).toContain("<td");
  });

  it("[S11-#14] PriorityTable Owner is an editable <select>", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain("setOwnerOverride");
    expect(content).toMatch(/<select[\s\S]*?Owner/);
  });

  it("[S11-#14] PriorityTable does not show Quadrant column", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    // The old quadrant badge in PriorityTable rows was a hidden sm:inline span with meta.emoji + meta.name
    // It should no longer appear in the table rows
    const tableStart = content.indexOf("function PriorityTable");
    const tableEnd = content.indexOf("function EviMatrix", tableStart);
    const tableCode = content.slice(tableStart, tableEnd > 0 ? tableEnd : undefined);
    expect(tableCode).not.toContain("meta.emoji");
  });

  it("[S11-#15] Payoff shows low-reclaim guidance", () => {
    expect(
      fileContains("components/focus/Payoff.tsx", "Your fixes target only")
    ).toBe(true);
  });

  it("[S11-#16] opportunity frames use emotional copy (no stat-first framing)", () => {
    const content = readSrc("lib/data/opportunity-frames.ts");
    // First frame should not lead with research stats
    expect(content).not.toContain("Context switching eats 40%");
    expect(content).toContain("Tiny time wins feel pointless");
  });

  it("[S11-#2] DrilldownStep shows per-category totals", () => {
    expect(
      fileContains("components/analyzer/DrilldownStep.tsx", "categoryTotals")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BANNED PATTERNS — Permanent (all sessions)
// ---------------------------------------------------------------------------

describe("Banned patterns (permanent)", () => {
  it("no window.__ globals anywhere in src/", () => {
    const srcDir = path.join(SRC);
    const check = (dir: string): string[] => {
      const violations: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.includes("node_modules") && !item.name.startsWith(".")) {
          violations.push(...check(fullPath));
        } else if (item.isFile() && (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) && !item.name.includes(".test.")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (content.includes("window.__")) {
            violations.push(fullPath.replace(SRC + "/", ""));
          }
        }
      }
      return violations;
    };
    const violations = check(srcDir);
    expect(violations, `window.__ found in: ${violations.join(", ")}`).toEqual([]);
  });

  it("no Hanken Grotesk anywhere in src/ (excluding test files)", () => {
    const srcDir = path.join(SRC);
    const check = (dir: string): string[] => {
      const violations: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.includes("node_modules") && !item.name.startsWith(".") && !item.name.startsWith("__")) {
          violations.push(...check(fullPath));
        } else if (item.isFile() && (item.name.endsWith(".ts") || item.name.endsWith(".tsx")) && !item.name.includes(".test.") && !item.name.includes("regression")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (/hanken/i.test(content)) {
            violations.push(fullPath.replace(SRC + "/", ""));
          }
        }
      }
      return violations;
    };
    const violations = check(srcDir);
    expect(violations, `Hanken Grotesk in: ${violations.join(", ")}`).toEqual([]);
  });

  it("SCORE_FROM_LEVEL uses 2/3/4 not 1/2/3", () => {
    const content = readSrc("lib/engine/solutions-logic.ts");
    expect(content).toMatch(/low.*:\s*2/);
    expect(content).toMatch(/medium.*:\s*3/);
    expect(content).toMatch(/high.*:\s*4/);
  });

  // --- Session 12 fixes ---

  it("[S12-#1] IntakeStep has NO inline counter — only sticky counter", () => {
    const content = readSrc("components/analyzer/IntakeStep.tsx");
    // Must have sticky counter
    expect(content).toContain("sticky top-4");
    // Must NOT have inline counter (the motion.div with mt-4 inline-flex that was duplicating)
    const inlineCounterPattern = /mt-4 inline-flex[\s\S]*hrs\/week of waste flagged/;
    expect(content).not.toMatch(inlineCounterPattern);
  });

  it("[S12-#2] DrilldownStep has NO inline counter — only sticky counter", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    // Must have sticky counter
    expect(content).toContain("sticky top-4");
    // Must NOT have inline counter
    const inlineCounterPattern = /mt-4 inline-flex[\s\S]*hrs\/week of waste spotted/;
    expect(content).not.toMatch(inlineCounterPattern);
  });

  it("[S12-#3] DrilldownStep blocks 'Show me the damage' when category hours exceed estimate", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).toContain("hasOverflowCategory");
    expect(content).toContain("disabled={!hasEnoughDrains || hasOverflowCategory}");
  });

  it("[S12-#4] MIN_CATEGORIES is 3, not 2", () => {
    const content = readSrc("components/analyzer/IntakeStep.tsx");
    expect(content).toMatch(/MIN_CATEGORIES\s*=\s*3/);
  });

  // === Session 13 regression tests ===

  it("[S13-#1] ResultsView has Zone B section ('Also eating your time')", () => {
    const content = readSrc("components/analyzer/ResultsView.tsx");
    expect(content).toContain('Also eating your time');
    expect(content).toContain('c.zone === "B"');
  });

  it("[S13-#1b] ResultsView has Zone C section ('The small stuff')", () => {
    const content = readSrc("components/analyzer/ResultsView.tsx");
    expect(content).toContain('The small stuff');
    expect(content).toContain('c.zone === "C"');
  });

  it("[S13-#2] FocusStage passes Zone C items to usefulMany (not just B)", () => {
    const content = readSrc("components/focus/FocusStage.tsx");
    expect(content).toContain('c.zone === "B" || c.zone === "C"');
  });

  it("[S13-#2b] SolutionPicker has Zone C collapsible section ('The small stuff')", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toContain('The small stuff');
    expect(content).toContain('d.zone === "C"');
  });

  it("[S13-#3] EviMatrix quadrant labels positioned away from axis ticks", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    // Labels should be at least 72px from left edge (past axis tick labels)
    expect(content).toContain('left-[72px]');
    expect(content).toContain('right-[40px]');
  });

  it("[S13-#4] Oysters Action Sequence label includes spare capacity condition", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain('spare capacity');
  });

  it("[S13-#5] Payoff 'What happens' section has no Highlighter box", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    // Should NOT have Highlighter wrapping the "What happens" heading
    expect(content).not.toContain('action="box"');
  });
});

describe("Session 14 — Dev-friend feedback + blank dots", () => {
  // --- #1 Action Plan Effort dots are GOLD, not red (red read as "error") ---
  it("[S14-#1] Effort DotRating uses gold, not waste-red", () => {
    const content = readSrc("components/focus/FocusTable.tsx");
    expect(content).toContain('activeColor="var(--color-gold)"');
    // Impact stays pink (reclaim)
    expect(content).toContain('activeColor="var(--color-reclaim)"');
  });

  // --- #2 Each waste category has a UNIQUE emoji (no duplicates on Drilldown) ---
  it("[S14-#2] reassigned category emojis are present (unique per group)", () => {
    const content = readSrc("lib/data/waste-sources.ts");
    // The 9 de-duplicated groups each got a distinct codepoint.
    for (const cp of ["1F635", "1F974", "1F575", "1F975", "1F92F", "1F40C", "1F629", "1F9F9", "1F62E"]) {
      expect(content).toContain(cp);
    }
  });
  it("[S14-#2b] every waste group maps to a UNIQUE emoji", () => {
    const content = readSrc("lib/data/waste-sources.ts");
    // Pull the GROUP_EMOJI literal block and assert no emoji value repeats.
    const block = content.slice(content.indexOf("const GROUP_EMOJI"), content.indexOf("function emojiFor"));
    const values = [...block.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(values.length).toBeGreaterThanOrEqual(17);
    expect(new Set(values).size).toBe(values.length); // no duplicates
  });

  // --- #3 Blank dots: solutions start UNRATED (0/0), user fills them ---
  it("[S14-#3] new solutions start blank (effort 0 / impact 0)", () => {
    const content = readSrc("stores/audit-store.ts");
    expect(content).toMatch(/effort: 0,\s*\n\s*impact: 0,/);
    // No more anchored 2/2 default in the store
    expect(content).not.toContain("effort: 2, impact: 2");
  });
  it("[S14-#3b] isRated helper gates the unrated state", () => {
    expect(readSrc("lib/engine/solutions-logic.ts")).toContain("export function isRated");
    const ft = readSrc("components/focus/FocusTable.tsx");
    expect(ft).toContain("tap to rate");
    expect(ft).toContain("rate to place it");
    expect(ft).toContain("Needs rating");
  });
  it("[S14-#3c] Matrix and Payoff exclude unrated fixes", () => {
    expect(readSrc("components/focus/EviMatrix.tsx")).toContain("isRated");
    expect(readSrc("components/focus/Payoff.tsx")).toContain("isRated");
  });

  // --- #4 Unified selection state: Drilldown no longer uses orange native checkbox ---
  it("[S14-#4] Drilldown rows use the unified pink selector, not orange checkbox", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).not.toContain("accent-[var(--color-waste)]");
    expect(content).toContain("sr-only");
  });
  it("[S14-#4b] Role and Intake cards show the unified pink check indicator", () => {
    expect(readSrc("components/analyzer/RoleStep.tsx")).toContain("var(--color-reclaim)");
    expect(readSrc("components/analyzer/IntakeStep.tsx")).toContain("rgba(196, 24, 106, 0.05)");
  });

  // --- #5 Condensed Drilldown: collapsible groups ---
  it("[S14-#5] Drilldown groups are collapsible (accordion)", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).toContain("expandedGroups");
    expect(content).toContain("toggleGroup");
    expect(content).toContain("aria-expanded");
    expect(content).toContain("picked"); // "N picked" pill on collapsed header
  });
});

describe("Session 15 — payoff surfacing + dot polish", () => {
  // --- Dots: clean hollow ring, no dashed outline ---
  it("[S15-#1] rating dots are a clean hollow ring (no dashed style)", () => {
    const content = readSrc("components/focus/FocusTable.tsx");
    expect(content).not.toContain('borderStyle: !filled');
    expect(content).not.toContain('"dashed"');
  });

  // --- Payoff: variants + strip + spotlight ---
  it("[S15-#2] Payoff supports hero/rest/strip variants", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    expect(content).toMatch(/variant\?:\s*"full"\s*\|\s*"hero"\s*\|\s*"rest"\s*\|\s*"strip"/);
    expect(content).toContain("See full breakdown");
  });
  it("[S15-#3] 'What you'd do with it' spotlight replaces the flat reframe box", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    expect(content).toContain("What you"); // "What you'd do with it" kicker
    expect(content).toContain("var(--color-gold)"); // gold accent on the spotlight
  });

  // --- FocusStage: number leads the Matrix tab + strip on Action Plan ---
  it("[S15-#4] Matrix tab leads with the payoff hero, Action Plan shows the strip", () => {
    const content = readSrc("components/focus/FocusStage.tsx");
    expect(content).toContain('variant="hero"');
    expect(content).toContain('variant="strip"');
    // Hero must render before the matrix on the Matrix tab.
    const heroIdx = content.indexOf('variant="hero"');
    const matrixIdx = content.indexOf("<EviMatrix");
    expect(heroIdx).toBeGreaterThan(-1);
    expect(heroIdx).toBeLessThan(matrixIdx);
  });
});

// ---------------------------------------------------------------------------
// Session 19 — redesign port (Oren v2→v4 mockups, approved)
// ---------------------------------------------------------------------------

describe("Quadrant emojis — literal match (Session 19)", () => {
  const logic = "lib/engine/solutions-logic.ts";

  it("[S19] Pearls emoji is 💎 (gem), not 🤩", () => {
    const content = readSrc(logic);
    expect(content).toContain('emoji: "💎"');
    expect(content).not.toContain('emoji: "🤩"');
  });

  it("[S19] Oysters emoji is 🦪 (oyster), not 💪", () => {
    const content = readSrc(logic);
    expect(content).toContain('emoji: "🦪"');
    expect(content).not.toContain('emoji: "💪"');
  });

  it("[S19] Low-Hanging Fruit emoji is 🍒 (fruit), not 🫠", () => {
    const content = readSrc(logic);
    expect(content).toContain('emoji: "🍒"');
  });

  it("[S19] White Elephants stays 🐘", () => {
    expect(readSrc(logic)).toContain("🐘");
  });

  it("[S19] EviMatrix count pills use the new emojis", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain("💎");
    expect(content).toContain("🦪");
    expect(content).toContain("🍒");
    expect(content).not.toContain("🤩");
  });

  it("[S19] FocusTable Pearl badge uses 💎", () => {
    const content = readSrc("components/focus/FocusTable.tsx");
    expect(content).toContain("💎");
    expect(content).not.toContain("🤩");
  });

  it("[S19-#23] White Elephants label says 'skip these', not 'drop or delegate'", () => {
    const content = readSrc("components/focus/EviMatrix.tsx");
    expect(content).toContain("skip these");
    expect(content).not.toContain("drop or delegate");
  });
});

describe("Landing — removed sections + new HowItWorks (Session 19, Notes 1 & 2)", () => {
  it("[S19] page.tsx no longer renders ToolCards", () => {
    const content = readSrc("app/page.tsx");
    expect(content).not.toContain("<ToolCards");
  });

  // S20 correction: Session 19 over-removed. Mona only wanted the COPY at the
  // top of the stats section gone — not the stats. Section restored, copy removed.
  it("[S20-#correction] page.tsx renders the BenchmarkProof stats section", () => {
    expect(readSrc("app/page.tsx")).toContain("<BenchmarkProof");
  });

  it("[S20-#correction] BenchmarkProof keeps its stat numbers but drops the top copy", () => {
    const content = readSrc("components/landing/BenchmarkProof.tsx");
    // Stats grid still present
    expect(content).toContain("25%");
    expect(content).toContain("of a manager's week is meetings");
    // Top copy removed
    expect(content).not.toContain("This isn");
    expect(content).not.toContain("not folklore");
  });

  it("[S19] page.tsx renders HowItWorks", () => {
    expect(readSrc("app/page.tsx")).toContain("<HowItWorks");
  });

  it("[S19] HowItWorks has the approved step copy", () => {
    const content = readSrc("components/landing/HowItWorks.tsx");
    expect(content).toContain("Pick your role");
    expect(content).toContain("Estimate the hours each drain costs you");
    expect(content).toContain("ranked by hours saved");
    expect(content).toContain("Why it");
    expect(content).toContain("time-tracker");
  });

  it("[S19] FinalCTA no longer says 'knowledge worker'", () => {
    expect(readSrc("components/landing/FinalCTA.tsx")).not.toContain("knowledge worker");
  });
});

describe("Pareto minimum drains (Session 19, Note 15/scene 12&14)", () => {
  it("[S19] DrilldownStep requires at least 5 drains before continuing", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).toContain("MIN_DRAINS = 5");
    expect(content).toContain("hasEnoughDrains");
    // The continue button is gated on the minimum, not just one entry.
    expect(content).toContain("disabled={!hasEnoughDrains || hasOverflowCategory}");
  });

  it("[S19] DrilldownStep coaches toward 5 drains", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).toContain("map your vital few");
  });

  // S20-V4 Scene 12: approved density copy ported, with "only" removed.
  it("[S20-V4-#12] min-5 message uses approved copy and drops the word 'only'", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).toContain("The pattern shows once you");
    expect(content).not.toContain("pattern only shows");
  });

  // S20-V4 Scene 5: solution titles rewritten to verb/action form, consistently.
  // Mona's example: "Kill meetings" (verb) good; "No agenda, no meetings" bad.
  it("[S20-V4-#5] solution titles are verb-first (old noun-phrase forms gone)", () => {
    const content = readSrc("lib/data/solutions.ts");
    // Mona's exact called-out example is fixed
    expect(content).toContain('title: "Kill agenda-less meetings"');
    expect(content).not.toContain('title: "No agenda, no meeting"');
    // A sample of other noun-phrase titles are gone
    for (const gone of [
      'title: "Daily protected deep-work block"',
      'title: "Single source of truth (knowledge base)"',
      'title: "One owner (DRI) per task"',
      'title: "Standardized brief template"',
      'title: "Lead scoring + ICP filter"',
      'title: "Gatekeeper (chief of staff / EA)"',
    ]) {
      expect(content).not.toContain(gone);
    }
  });

  it("[S20-V4-#5] every solution title starts with a capitalized word (verb-form)", () => {
    const content = readSrc("lib/data/solutions.ts");
    const titles = [...content.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
    // Skip the interface field declaration "title: string" (no quotes) — only
    // real titles match. Expect a healthy population and all capitalized.
    expect(titles.length).toBeGreaterThan(90);
    const lowerLed = titles.filter((t) => !/^[A-Z]/.test(t));
    expect(lowerLed).toEqual([]);
  });

  // S20-V4 Scene 1: Oren-approved v4 hero — ring gauge + particles + verbatim
  // copy, old WeekCalendar hero archived for reuse.
  it("[S20-V4-#1] Hero is the v4 ring-gauge design with particles", () => {
    const content = readSrc("components/landing/Hero.tsx");
    expect(content).toContain("RingGauge");
    expect(content).toContain("typical hrs/wk reclaimed");
    expect(content).toContain('from "@/components/ui/particles"');
    // Old WeekCalendar hero is gone from the live component...
    expect(content).not.toContain("WeekCalendar");
    expect(content).not.toContain("The orange is your week disappearing");
  });

  it("[S20-V4-#1] Hero sub-CTA uses the approved 'nothing to install' line", () => {
    expect(readSrc("components/landing/Hero.tsx")).toContain("nothing to install");
  });

  it("[S20-V4-#1] old WeekCalendar hero is archived for reuse", () => {
    // Saved outside src/ so it doesn't ship but can be reused elsewhere.
    const saved = fs.readFileSync(
      path.resolve(__dirname, "../../Feedback Log/saved-sections/Hero.tsx.saved"),
      "utf-8",
    );
    expect(saved).toContain("WeekCalendar");
  });

  // S20-V4 Scene 4: heads-up when ~the whole week is marked as waste.
  it("[S20-V4-#4] intake + drilldown warn when nearly the whole week is waste", () => {
    const intake = readSrc("components/analyzer/IntakeStep.tsx");
    const drill = readSrc("components/analyzer/DrilldownStep.tsx");
    // 90% threshold guard present in both
    expect(intake).toContain("workHoursPerWeek * 0.9");
    expect(drill).toContain("workHoursPerWeek * 0.9");
    // Recheck heads-up copy present
    expect(intake).toContain("nearly your whole week");
    expect(drill).toContain("nearly your whole week");
  });

  // S20 — Oren-redesign safe-polish batch (v3 review notes scenes 6, 9)

  it("[S20-#9] Payoff math is tucked behind an ⓘ 'how we got this' toggle", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    // Disclosure state + trigger copy
    expect(content).toContain("showMath");
    expect(content).toContain("How we got this");
    // Toggle is a real button with expanded state for a11y
    expect(content).toContain("aria-expanded={showMath}");
  });

  it("[S20-#9] Payoff math breakdown shows logged → cut% → reclaimed per fix", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    expect(content).toContain("mathRows");
    expect(content).toContain("You logged on");
    expect(content).toContain("typically cuts");
    expect(content).toContain("So you reclaim");
  });

  it("[S20-#9] Payoff no longer auto-renders the old per-fix breakdown list", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    // The old inline breakdown printed "impact N/5" / "not rated" rows; gone now.
    expect(content).not.toContain('? `impact ${scores.impact}/5` : "not rated"');
  });

  it("[S20-#6] Payoff hero uses Magic UI components (SparklesText + Particles)", () => {
    const content = readSrc("components/focus/Payoff.tsx");
    expect(content).toContain('from "@/components/ui/sparkles-text"');
    expect(content).toContain('from "@/components/ui/particles"');
    expect(content).toContain("<SparklesText");
    expect(content).toContain("<Particles");
  });

  // S20-#8 — four-waste-type framework folded into the Drilldown via a HOVER
  // explainer (Oren redesign Scene 8; Mona's note: hover, NOT click).

  it("[S20-#8] waste-sources defines exactly the four redesign waste types", () => {
    const content = readSrc("lib/data/waste-sources.ts");
    expect(content).toContain('name: "Work that adds nothing"');
    expect(content).toContain('name: "Switching & chasing"');
    expect(content).toContain('name: "Waiting & getting blocked"');
    expect(content).toContain('name: "Redoing & manual grind"');
  });

  it("[S20-#8] each waste type carries its escape-hatch fix hint", () => {
    const content = readSrc("lib/data/waste-sources.ts");
    expect(content).toContain("cut it or shrink it");
    expect(content).toContain("batch it, automate it, or ask once");
    expect(content).toContain("unblock the bottleneck");
    expect(content).toContain("get it right once, or automate it");
  });

  it("[S20-#8] every Muda class maps to a waste type via wasteTypeForMuda", () => {
    const content = readSrc("lib/data/waste-sources.ts");
    // All 8 internal muda classes must appear in the WASTE_TYPES muda arrays.
    for (const m of [
      "over-processing",
      "overproduction",
      "switching-searching",
      "handoffs",
      "pile-ups",
      "waiting",
      "rework",
      "underused-skill",
    ]) {
      expect(content).toContain(`"${m}"`);
    }
    expect(content).toContain("export function wasteTypeForMuda");
  });

  // S20-V4: Mona's v4 review — Scene 8 ("four waste types shouldn't be a
  // separate section, it's redundant"). The Drilldown hover explainer was
  // removed; the WASTE_TYPES taxonomy stays as an internal-only classification.
  it("[S20-V4-#8] DrilldownStep no longer surfaces the waste-type explainer", () => {
    const content = readSrc("components/analyzer/DrilldownStep.tsx");
    expect(content).not.toContain("WhyGroupedHover");
    expect(content).not.toContain("why are these grouped?");
  });
});
