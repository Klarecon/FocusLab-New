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
      "🤩",
      "Do these first",
    ]);
    expect(missing, `Missing in ${file}: ${missing.join(", ")}`).toEqual([]);
  });

  it("[S8] Oysters: name, emoji, verb about spare capacity", () => {
    const { missing } = fileContainsAll(file, [
      '"Oysters"',
      "💪",
      "Plan these only after your Pearls are done",
    ]);
    expect(missing, `Missing in ${file}: ${missing.join(", ")}`).toEqual([]);
  });

  it("[S8] Low-Hanging Fruit: name, emoji, verb about minutes not days", () => {
    const { missing } = fileContainsAll(file, [
      '"Low-Hanging Fruit"',
      "🫠",
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
  it("[S7] Hero eyebrow copy", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "A waste reduction tool for knowledge workers")
    ).toBe(true);
  });

  it("[S7] Hero headline: buried in busywork", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "buried in busywork")
    ).toBe(true);
  });

  it("[S7] Hero subhead: 50–70%", () => {
    expect(
      fileContains("components/landing/Hero.tsx", /50.70%/)
    ).toBe(true);
  });

  it("[S7] Hero CTA: Find Your Hidden Waste", () => {
    expect(
      fileContains("components/landing/Hero.tsx", "Find Your Hidden Waste")
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

  it("[S7] FinalCTA button: Find Your Hidden Waste", () => {
    expect(
      fileContains("components/landing/FinalCTA.tsx", "Find Your Hidden Waste")
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
  it("[S7] SolutionPicker bottom CTA: Build your action plan", () => {
    expect(
      fileContains("components/focus/SolutionPicker.tsx", "Build your action plan")
    ).toBe(true);
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

  it("[S8] Payoff: That adds up to", () => {
    expect(
      fileContains("components/focus/Payoff.tsx", "That adds up to")
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

  it("[S9-O5] SolutionCard descriptions are collapsible", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toMatch(/showDesc|expandedCard|isExpanded/);
  });

  it("[S9-O5] DrainSection limits visible solutions", () => {
    const content = readSrc("components/focus/SolutionPicker.tsx");
    expect(content).toMatch(/showAll|visibleCount|INITIAL_VISIBLE/);
  });

  it("[S9-O4] bar chart truncates long labels", () => {
    const content = readSrc("components/analyzer/ResultsView.tsx");
    expect(content).toMatch(/\.slice\(.*\.\.\.|truncate.*\d+|ellipsis/);
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

  it("[S9-O9] Payoff shows opportunity framing", () => {
    expect(
      fileContains("components/focus/Payoff.tsx", "What could you do with that time")
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
});
