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
  /** Global cadence for WeighStep: all sources use this unit */
  weighCadence: "daily" | "weekly" | null;

  // --- Results (full engine ParetoResult, persisted) ---
  paretoResult: ParetoResult | null;

  // --- Solutions ---
  chosenSolutions: Solution[];
  solutionScores: Record<string, SolutionScore>;
  ownerOverrides: Record<string, string>;
  dueDates: Record<string, string>;

  // --- Double Pareto (Pass 1 → Pass 2) ---
  categoryEstimates: Record<string, number>; // group name → rough hrs/week
  vitalCategories: string[]; // group names that survived Pass 1

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
  setDueDate: (solId: string, date: string) => void;
  setWeighCadence: (cadence: "daily" | "weekly") => void;
  setCategoryEstimate: (group: string, hours: number) => void;
  setVitalCategories: (groups: string[]) => void;
  clearFocusState: () => void;
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
  weighCadence: null as "daily" | "weekly" | null,
  paretoResult: null as ParetoResult | null,
  chosenSolutions: [] as Solution[],
  solutionScores: {} as Record<string, SolutionScore>,
  ownerOverrides: {} as Record<string, string>,
  dueDates: {} as Record<string, string>,
  categoryEstimates: {} as Record<string, number>,
  vitalCategories: [] as string[],
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
        set({ roleSlug: slug, categoryEstimates: {}, vitalCategories: [] }),

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
                avoidablePct: 100,
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
                avoidablePct: 100,
                cadence: "daily",
              }),
              ...entry,
              avoidablePct: 100, // Always 100 — avoidable % removed from WeighStep (O1)
            },
          },
        })),

      setParetoResult: (result) =>
        set({
          paretoResult: result,
          // Clear stale focus selections when a new analysis completes
          chosenSolutions: [],
          solutionScores: {},
          ownerOverrides: {},
          dueDates: {},
        }),

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

      setDueDate: (solId, date) =>
        set((state) => ({
          dueDates: {
            ...state.dueDates,
            [solId]: date,
          },
        })),

      setCategoryEstimate: (group, hours) =>
        set((state) => ({
          categoryEstimates: { ...state.categoryEstimates, [group]: hours },
        })),

      setVitalCategories: (groups) =>
        set({ vitalCategories: groups }),

      setWeighCadence: (cadence) =>
        set((state) => {
          // Update all existing entries to use the new cadence
          const updatedEntries: Record<string, WasteEntry> = {};
          for (const [slug, entry] of Object.entries(state.entries)) {
            updatedEntries[slug] = { ...entry, cadence };
          }
          return { weighCadence: cadence, entries: updatedEntries };
        }),

      clearFocusState: () =>
        set({
          chosenSolutions: [],
          solutionScores: {},
          ownerOverrides: {},
          dueDates: {},
        }),

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
