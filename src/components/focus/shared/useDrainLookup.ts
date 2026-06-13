import { useMemo, useCallback } from "react";
import type { Solution } from "@/lib/data/solutions";

export interface DrainInfo {
  slug: string;
  label: string;
  hoursPerWeek: number;
  zone: "A" | "B" | "C";
}

/**
 * Shared hook: builds a slug->DrainInfo map and helpers
 * for looking up zone and source name for a given solution.
 * Used by FocusTable, EviMatrix, and Payoff.
 */
export function useDrainLookup(vitalFew: DrainInfo[], usefulMany: DrainInfo[]) {
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

  return { drainBySlug, getZone, getSourceName };
}
