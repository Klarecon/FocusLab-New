// Barrel export for all static data modules.

export type { RoleSlug, BenchmarkUnit, SourceTier, EvidenceType, Confidence, ValueBasis, Benchmark, SurfaceableBenchmark, WasteCategory } from "./benchmarks";
export { BENCHMARKS, WASTE_CATEGORIES, benchmarksForRole, surfaceableBenchmarks, vitalFewForRole, isSurfaceable } from "./benchmarks";

export type { MudaType, WasteSource, WasteGroup } from "./waste-sources";
export { UNIVERSAL_WASTE, ROLE_WASTE, GROUP_ORDER, wasteSourceBySlug, benchmarkCategoryFor, wasteSourcesForRole, groupWasteSources } from "./waste-sources";

export type { Solution, Level } from "./solutions";
export { SOLUTIONS, LEVEL_SCORE, isQuickWin, solutionsForWaste, solutionById } from "./solutions";

export type { RoleLens } from "./roles";
export { ROLE_LENSES, roleLensBySlug } from "./roles";

export type { SalaryDefault } from "./salary";
export { SALARY_DEFAULTS, salaryDefaultFor, salaryCitation } from "./salary";
