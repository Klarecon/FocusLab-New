// Per-role default pay: the US median ANNUAL wage from the U.S. Bureau of Labor
// Statistics OEWS (Occupational Employment and Wage Statistics), May 2024
// release. Each role maps to its closest standard SOC occupation. These are
// DEFAULTS -- the wizard shows the citation and lets the user override with
// their own number. US-only; we say so plainly in the UI.
//
// Figures are the OEWS national "Annual median wage" (50th percentile), May 2024.

import type { RoleSlug } from "./benchmarks";

export interface SalaryDefault {
  /** US median annual wage, whole dollars. */
  amount: number;
  /** The BLS OEWS occupation this role maps to. */
  occupationTitle: string;
  /** Standard Occupational Classification code. */
  socCode: string;
  /** OEWS release year. */
  year: number;
  /** Canonical BLS source page (dated May 2024 archive). */
  sourceUrl: string;
  /** Set when the role has no exact SOC match and we used the closest proxy. */
  note?: string;
}

/**
 * One default per RoleSlug. The `Record<RoleSlug, ...>` type guarantees -- at
 * compile time -- that every role has a default; adding a role without a salary
 * breaks the build.
 */
export const SALARY_DEFAULTS: Record<RoleSlug, SalaryDefault> = {
  marketing: {
    amount: 161_030,
    occupationTitle: "Marketing Managers",
    socCode: "11-2021",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes112021.htm",
  },
  sales: {
    amount: 121_520,
    occupationTitle: "Sales Engineers",
    socCode: "41-9031",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes419031.htm",
  },
  engineering: {
    amount: 133_080,
    occupationTitle: "Software Developers",
    socCode: "15-1252",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes151252.htm",
  },
  product: {
    amount: 100_750,
    occupationTitle: "Project Management Specialists",
    socCode: "13-1082",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes131082.htm",
    note: "No dedicated Product Manager SOC exists; mapped to the closest standard occupation. Real product-management pay typically runs higher \u2014 treat as a conservative floor.",
  },
  design: {
    amount: 98_090,
    occupationTitle: "Web and Digital Interface Designers",
    socCode: "15-1255",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes151255.htm",
  },
  "software-dev": {
    amount: 133_080,
    occupationTitle: "Software Developers",
    socCode: "15-1252",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes151252.htm",
    note: "Same SOC as Engineering role \u2014 mapped to Software Developers.",
  },
  operations: {
    amount: 102_950,
    occupationTitle: "General and Operations Managers",
    socCode: "11-1021",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes111021.htm",
  },
  finance: {
    amount: 139_790,
    occupationTitle: "Financial Managers",
    socCode: "11-3031",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes113031.htm",
  },
  "ceo-founder": {
    amount: 206_420,
    occupationTitle: "Chief Executives",
    socCode: "11-1011",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes111011.htm",
    note: "Founder pay varies wildly \u2014 this is the BLS median for Chief Executives.",
  },
  manager: {
    amount: 102_950,
    occupationTitle: "General and Operations Managers",
    socCode: "11-1021",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes111021.htm",
  },
  executive: {
    amount: 206_420,
    occupationTitle: "Chief Executives",
    socCode: "11-1011",
    year: 2024,
    sourceUrl: "https://www.bls.gov/oes/2024/may/oes111011.htm",
  },
};

/** The default salary for a role. */
export function salaryDefaultFor(slug: RoleSlug): SalaryDefault {
  return SALARY_DEFAULTS[slug];
}

/** Short inline citation, e.g. "US median for Software Developers -- BLS, 2024". */
export function salaryCitation(s: SalaryDefault): string {
  return `US median for ${s.occupationTitle} \u2014 BLS OEWS, ${s.year}`;
}
