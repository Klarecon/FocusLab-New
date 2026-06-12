import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { RoleSlug } from "@/lib/data/benchmarks";
import type { WasteSource } from "@/lib/data/waste-sources";
import type { Solution } from "@/lib/data/solutions";
import type { ParetoResult } from "@/lib/engine/types";
import { SCORE_FROM_LEVEL } from "@/lib/engine/solutions-logic";
import type { Level } from "@/lib/engine/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WasteEntry {
  hoursPerDay: number;
  avoidablePct: number;
  cadence: "daily" | "weekly";
}

export interface SolutionScore {
  effort: number; // 1-5
  impact: number; // 1-5
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface AuditState {
  // --- Audit context ---
  roleSlug: RoleSlug | null;
  secondaryRoles: RoleSlug[];
  workHoursPerWeek: number;
  workDaysPerWeek: number;
  payMode: "salary" | "hourly";
  salary: number;
  hourlyRate: number;

  // --- Source selection & entries ---
  activeSources: WasteSource[];
  entries: Record<string, WasteEntry>;

  // --- Results (full engine ParetoResult, persisted) ---
  paretoResult: ParetoResult | null;

  // --- Solutions ---
  chosenSolutions: Solution[];
  solutionScores: Record<string, SolutionScore>;
  ownerOverrides: Record<string, string>;

  // --- UI (transient, NOT persisted) ---
  step: number;

  // --- Actions ---
  setRole: (slug: RoleSlug) => void;
  setSecondaryRoles: (roles: RoleSlug[]) => void;
  setContext: (ctx: {
    workHoursPerWeek?: number;
    workDaysPerWeek?: number;
    payMode?: "salary" | "hourly";
    salary?: number;
    hourlyRate?: number;
  }) => void;
  addSource: (source: WasteSource) => void;
  removeSource: (slug: string) => void;
  setEntry: (slug: string, entry: Partial<WasteEntry>) => void;
  setParetoResult: (result: ParetoResult) => void;
  addSolution: (solution: Solution) => void;
  removeSolution: (id: string) => void;
  setSolutionScore: (id: string, score: Partial<SolutionScore>) => void;
  setOwnerOverride: (solId: string, owner: string) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_STATE = {
  roleSlug: null as RoleSlug | null,
  secondaryRoles: [] as RoleSlug[],
  workHoursPerWeek: 45,
  workDaysPerWeek: 5,
  payMode: "salary" as const,
  salary: 0,
  hourlyRate: 0,
  activeSources: [] as WasteSource[],
  entries: {} as Record<string, WasteEntry>,
  paretoResult: null as ParetoResult | null,
  chosenSolutions: [] as Solution[],
  solutionScores: {} as Record<string, SolutionScore>,
  ownerOverrides: {} as Record<string, string>,
  step: 0,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setRole: (slug) =>
        set({ roleSlug: slug }),

      setSecondaryRoles: (roles) =>
        set({ secondaryRoles: roles }),

      setContext: (ctx) =>
        set((state) => ({
          workHoursPerWeek: ctx.workHoursPerWeek ?? state.workHoursPerWeek,
          workDaysPerWeek: ctx.workDaysPerWeek ?? state.workDaysPerWeek,
          payMode: ctx.payMode ?? state.payMode,
          salary: ctx.salary ?? state.salary,
          hourlyRate: ctx.hourlyRate ?? state.hourlyRate,
        })),

      addSource: (source) =>
        set((state) => {
          if (state.activeSources.some((s) => s.slug === source.slug)) {
            return state; // already added
          }
          return {
            activeSources: [...state.activeSources, source],
            entries: {
              ...state.entries,
              [source.slug]: state.entries[source.slug] ?? {
                hoursPerDay: 0,
                avoidablePct: 50,
                cadence: "daily",
              },
            },
          };
        }),

      removeSource: (slug) =>
        set((state) => {
          const { [slug]: _removed, ...remainingEntries } = state.entries;
          return {
            activeSources: state.activeSources.filter((s) => s.slug !== slug),
            entries: remainingEntries,
          };
        }),

      setEntry: (slug, entry) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [slug]: {
              ...(state.entries[slug] ?? {
                hoursPerDay: 0,
                avoidablePct: 50,
                cadence: "daily",
              }),
              ...entry,
            },
          },
        })),

      setParetoResult: (result) =>
        set({ paretoResult: result }),

      addSolution: (solution) =>
        set((state) => {
          if (state.chosenSolutions.some((s) => s.id === solution.id)) {
            return state;
          }
          return {
            chosenSolutions: [...state.chosenSolutions, solution],
            solutionScores: {
              ...state.solutionScores,
              [solution.id]: state.solutionScores[solution.id] ?? {
                effort: levelToScore(solution.effort),
                impact: levelToScore(solution.impact),
              },
            },
          };
        }),

      removeSolution: (id) =>
        set((state) => {
          const { [id]: _removed, ...remainingScores } = state.solutionScores;
          return {
            chosenSolutions: state.chosenSolutions.filter((s) => s.id !== id),
            solutionScores: remainingScores,
          };
        }),

      setSolutionScore: (id, score) =>
        set((state) => ({
          solutionScores: {
            ...state.solutionScores,
            [id]: {
              ...(state.solutionScores[id] ?? { effort: 2, impact: 2 }),
              ...score,
            },
          },
        })),

      setOwnerOverride: (solId, owner) =>
        set((state) => ({
          ownerOverrides: {
            ...state.ownerOverrides,
            [solId]: owner,
          },
        })),

      setStep: (step) =>
        set({ step }),

      reset: () =>
        set({ ...DEFAULT_STATE }),
    }),
    {
      name: "focuslab-audit",
      // Exclude transient UI state from persistence
      partialize: (state) => {
        const { step, ...persisted } = state;
        return persisted;
      },
    },
  ),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function levelToScore(level: Level): number {
  return SCORE_FROM_LEVEL[level];
}
