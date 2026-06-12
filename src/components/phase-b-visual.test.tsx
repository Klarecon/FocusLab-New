/**
 * Phase B Visual Redesign Tests
 *
 * Grep-based codebase tests that verify visual design tokens,
 * typography, and color consistency across wizard steps and focus components.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SRC = path.resolve(__dirname, "..");

/** Read a source file relative to src/ */
function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), "utf-8");
}

/** Read all .tsx files from a directory (non-recursive) */
function readAllTsx(dir: string): { file: string; content: string }[] {
  const fullDir = path.join(SRC, dir);
  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => ({
      file: path.join(dir, f),
      content: fs.readFileSync(path.join(fullDir, f), "utf-8"),
    }));
}

// ---------------------------------------------------------------------------
// Source file paths (relative to src/)
// ---------------------------------------------------------------------------

const WIZARD_STEPS = [
  "components/analyzer/RoleStep.tsx",
  "components/analyzer/ContextStep.tsx",
  "components/analyzer/IntakeStep.tsx",
  "components/analyzer/WeighStep.tsx",
];

const EVI_MATRIX = "components/focus/EviMatrix.tsx";
const SOLUTION_PICKER = "components/focus/SolutionPicker.tsx";
const PAYOFF = "components/focus/Payoff.tsx";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Phase B Visual — Typography", () => {
  it("all wizard step headers use font-fraunces", () => {
    for (const file of WIZARD_STEPS) {
      const content = readSrc(file);
      expect(
        content.includes("font-fraunces"),
        `${file} should reference font-fraunces in its header`,
      ).toBe(true);
    }
  });

  it("all wizard step headers use text-3xl or larger", () => {
    for (const file of WIZARD_STEPS) {
      const content = readSrc(file);
      const hasLargeText =
        content.includes("text-3xl") || content.includes("text-4xl");
      expect(
        hasLargeText,
        `${file} header should use text-3xl or text-4xl`,
      ).toBe(true);
    }
  });
});

describe("Phase B Visual — CTA Button Colors", () => {
  it("all wizard step Continue / CTA buttons use color-reclaim", () => {
    for (const file of WIZARD_STEPS) {
      const content = readSrc(file);
      expect(
        content.includes("color-reclaim"),
        `${file} should use var(--color-reclaim) for its primary CTA`,
      ).toBe(true);
    }
  });
});

describe("Phase B Visual — Zone Color Hygiene", () => {
  const OLD_HEX_COLORS = ["#df3c18", "#b9852b", "#5c544a"];

  it("EviMatrix.tsx does not contain old zone hex colors", () => {
    const content = readSrc(EVI_MATRIX);
    for (const hex of OLD_HEX_COLORS) {
      expect(
        content.includes(hex),
        `EviMatrix.tsx should not contain old zone color ${hex}`,
      ).toBe(false);
    }
  });

  it("EviMatrix zone colors match current CSS variables (#e03e12, #edb215, #7a6f5f)", () => {
    const content = readSrc(EVI_MATRIX);
    const expectedColors = ["#e03e12", "#edb215", "#7a6f5f"];
    for (const hex of expectedColors) {
      expect(
        content.includes(hex),
        `EviMatrix.tsx should contain current zone color ${hex}`,
      ).toBe(true);
    }
  });

  it("no rogue green rgba(29, 107, 88) in any component source files", () => {
    const roguePattern = "rgba(29, 107, 88";
    const dirs = ["components/analyzer", "components/focus", "components/ui"];
    const violations: string[] = [];

    for (const dir of dirs) {
      try {
        const files = readAllTsx(dir);
        for (const { file, content } of files) {
          if (content.includes(roguePattern)) {
            violations.push(file);
          }
        }
      } catch {
        // Directory may not exist, skip
      }
    }

    expect(
      violations,
      `These files contain rogue green rgba(29, 107, 88): ${violations.join(", ")}`,
    ).toEqual([]);
  });

  it("no old zone colors in key focus components", () => {
    const filesToCheck = [EVI_MATRIX, SOLUTION_PICKER, PAYOFF];
    for (const file of filesToCheck) {
      const content = readSrc(file);
      for (const hex of OLD_HEX_COLORS) {
        expect(
          content.includes(hex),
          `${file} should not contain old zone color ${hex}`,
        ).toBe(false);
      }
    }
  });
});
