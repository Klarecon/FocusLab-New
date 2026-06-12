import { describe, it, expect } from "vitest";
import { SCORE_FROM_LEVEL, isQuickWinScore } from "@/lib/engine/solutions-logic";

// ---------------------------------------------------------------------------
// 6. SCORE_FROM_LEVEL values
// ---------------------------------------------------------------------------
describe("SCORE_FROM_LEVEL values", () => {
  it("maps low -> 2, medium -> 3, high -> 4", () => {
    expect(SCORE_FROM_LEVEL["low"]).toBe(2);
    expect(SCORE_FROM_LEVEL["medium"]).toBe(3);
    expect(SCORE_FROM_LEVEL["high"]).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// 7. Quick-win detection with SCORE_FROM_LEVEL
// ---------------------------------------------------------------------------
describe("Quick-win detection with SCORE_FROM_LEVEL", () => {
  it("low effort + high impact is a quick win (effort<=2, impact>=4)", () => {
    const effort = SCORE_FROM_LEVEL["low"]; // 2
    const impact = SCORE_FROM_LEVEL["high"]; // 4
    expect(isQuickWinScore(effort, impact)).toBe(true);
  });

  it("medium effort + high impact is NOT a quick win (effort=3 > 2)", () => {
    expect(isQuickWinScore(SCORE_FROM_LEVEL["medium"], SCORE_FROM_LEVEL["high"])).toBe(false);
  });

  it("low effort + medium impact is NOT a quick win (impact=3 < 4)", () => {
    expect(isQuickWinScore(SCORE_FROM_LEVEL["low"], SCORE_FROM_LEVEL["medium"])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. Old levelToScore would have failed
// ---------------------------------------------------------------------------
describe("Old LEVEL_SCORE mapping would NOT produce quick wins", () => {
  it("old mapping (low=1, med=2, high=3) fails quick-win because impact=3 < 4", () => {
    // The old LEVEL_SCORE from solutions.ts: { low: 1, medium: 2, high: 3 }
    const oldEffort = 1 as const; // low in old mapping
    const oldImpact = 3 as const; // high in old mapping

    // With old values, a "high impact" solution scores 3, which is below
    // the quick-win threshold of impact >= 4
    expect(isQuickWinScore(oldEffort, oldImpact)).toBe(false);
  });

  it("confirms the bug: no catalog solution could ever be a quick win with old scores", () => {
    // Old mapping maxes out at 3, but quick-win requires impact >= 4
    const oldScores = { low: 1, medium: 2, high: 3 } as const;
    const allOldCombinations = [
      { effort: oldScores.low, impact: oldScores.high },
      { effort: oldScores.low, impact: oldScores.medium },
      { effort: oldScores.low, impact: oldScores.low },
    ] as const;

    for (const combo of allOldCombinations) {
      expect(isQuickWinScore(combo.effort, combo.impact)).toBe(false);
    }
  });
});
