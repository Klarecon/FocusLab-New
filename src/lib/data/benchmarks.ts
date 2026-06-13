// Domain types and static benchmark data for the waste-reduction tool.
// Ported from the Supabase seed (0002_seed_benchmarks.sql) into a static
// TypeScript array so we can ship without a database dependency.

// --- Literal unions (mirror the original SQL CHECK constraints / seed slugs) --

/** Selectable lenses. `null` role on a benchmark = universal (any role). */
export type RoleSlug =
  | "marketing"
  | "sales"
  | "engineering"
  | "product"
  | "design"
  | "manager"
  | "executive"
  | "software-dev"
  | "operations"
  | "finance"
  | "ceo-founder";

/** Unit of a benchmark value. Drives formatting + how the engine consumes it. */
export type BenchmarkUnit =
  | "pct_of_week"
  | "hrs_per_week"
  | "minutes"
  | "usd"
  | "ratio"
  | "count";

export type SourceTier = "A" | "B" | "C";
export type EvidenceType = "sourced" | "estimated";
export type Confidence = "high" | "medium" | "low";

/**
 * What a benchmark's value is a share/measure OF. Critical: only `week_share`
 * (and absolute `duration` units) convert to a "typical weekly hours" figure.
 * The rest must NEVER be multiplied by the work week.
 */
export type ValueBasis =
  | "week_share"
  | "avoidable_share"
  | "population"
  | "inverse"
  | "subactivity"
  | "duration"
  | "other";

// --- Waste category ---

export interface WasteCategory {
  slug: string;
  name: string;
  description: string;
  isUniversal: boolean;
  sortOrder: number;
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  { slug: "meetings", name: "Unnecessary meetings", description: "Low-value, no-agenda, status, over-invited meetings", isUniversal: true, sortOrder: 1 },
  { slug: "email-messaging", name: "Email & messaging overload", description: "Inbox triage, chat floods, notification reactivity", isUniversal: true, sortOrder: 2 },
  { slug: "work-about-work", name: 'Coordination / "work about work"', description: "Status-chasing, aligning, updating trackers vs. real work", isUniversal: true, sortOrder: 3 },
  { slug: "context-switching", name: "Context / app switching", description: "Tool toggling and the reorientation tax", isUniversal: true, sortOrder: 4 },
  { slug: "info-search", name: "Searching for information", description: "Hunting for docs, data, answers, the right person", isUniversal: true, sortOrder: 5 },
  { slug: "interruptions", name: "Interruptions & refocus", description: "Pings, drop-ins, and the cost of regaining focus", isUniversal: true, sortOrder: 6 },
  { slug: "duplicated-work", name: "Duplicated / redundant work", description: "Same task done twice; rework from no visibility", isUniversal: true, sortOrder: 7 },
  { slug: "admin-low-value", name: "Admin / low-value tasks", description: "Filing, status updates, manual data entry, busywork", isUniversal: true, sortOrder: 8 },
  { slug: "waiting-blocked", name: "Waiting / blocked / approvals", description: "Idle on decisions, sign-offs, handoffs, dependencies", isUniversal: true, sortOrder: 9 },
  // role-specific
  { slug: "reporting-data-pulls", name: "Reporting & manual data pulls", description: "Building reports, dashboards, manual data collection", isUniversal: false, sortOrder: 20 },
  { slug: "approval-feedback", name: "Approval / feedback loops", description: "Chasing reviewers, slow sign-offs, scattered feedback", isUniversal: false, sortOrder: 21 },
  { slug: "content-rework", name: "Rework from unclear briefs", description: "Redoing work from vague briefs / late feedback", isUniversal: false, sortOrder: 22 },
  { slug: "martech-sprawl", name: "Underused / sprawling tool stack", description: "Paid-for tools used at a fraction of capability", isUniversal: false, sortOrder: 23 },
  { slug: "crm-data-entry", name: "CRM data entry & admin", description: "Logging activity, updating records, manual notes", isUniversal: false, sortOrder: 24 },
  { slug: "non-selling-time", name: "Non-selling time", description: "Everything that is not buyer-facing selling", isUniversal: false, sortOrder: 25 },
  { slug: "lead-research", name: "Manual prospect / lead research", description: "Researching prospects, chasing bad-fit / bad-data leads", isUniversal: false, sortOrder: 26 },
  { slug: "quoting-approvals", name: "Manual quoting & deal-desk waits", description: "CPQ, proposal formatting, discount/legal approval delays", isUniversal: false, sortOrder: 27 },
  { slug: "tech-debt", name: "Technical debt / bad code", description: "Working around legacy/brittle code instead of building", isUniversal: false, sortOrder: 28 },
  { slug: "code-review-wait", name: "Waiting on code review", description: "PR review-lag, queues, QA handoffs", isUniversal: false, sortOrder: 29 },
  { slug: "requirements-rework", name: "Rework from unclear requirements", description: "Building the wrong thing; defects traced to requirements", isUniversal: false, sortOrder: 30 },
  { slug: "status-reporting", name: "Status updates & reporting", description: "Compiling status, decks, updates up the chain", isUniversal: false, sortOrder: 31 },
  { slug: "firefighting", name: "Reactive firefighting", description: "Unplanned interrupts displacing planned/strategic work", isUniversal: false, sortOrder: 32 },
  { slug: "ic-work-switching", name: "Non-managerial IC work", description: "Manager still doing IC work instead of leading", isUniversal: false, sortOrder: 33 },
  { slug: "delegation-failure", name: "Failure to delegate", description: "Founder-as-bottleneck; doing work that should be delegated", isUniversal: false, sortOrder: 34 },
  { slug: "strategic-underinvest", name: "Too little strategic time", description: "Underinvesting in long-term / highest-leverage work", isUniversal: false, sortOrder: 35 },
  { slug: "design-handoff", name: "Design-to-dev handoff friction", description: "Misaligned specs; devs redoing designs", isUniversal: false, sortOrder: 36 },
];

// --- Benchmark ---

export interface Benchmark {
  roleSlug: RoleSlug | null;
  categorySlug: string;
  metricLabel: string;
  valueLow: number | null;
  valueHigh: number | null;
  valuePoint: number | null;
  unit: BenchmarkUnit;
  populationNote: string;
  sourceName: string;
  sourceUrl: string;
  sourceTier: SourceTier;
  publicationYear: number;
  methodologyNote: string;
  evidenceType: EvidenceType;
  confidence: Confidence;
  isVitalFew: boolean;
  displayBlurb: string | null;
  valueBasis: ValueBasis;
}

/**
 * A benchmark cleared to be shown to users as fact: Tier A/B AND sourced.
 * Per the source-verification policy, estimated/Tier-C rows must never surface
 * as a user-facing claim.
 */
export type SurfaceableBenchmark = Benchmark & {
  sourceTier: "A" | "B";
  evidenceType: "sourced";
};

export function isSurfaceable(b: Benchmark): b is SurfaceableBenchmark {
  return (b.sourceTier === "A" || b.sourceTier === "B") && b.evidenceType === "sourced";
}

// ---------------------------------------------------------------------------
// Static benchmark data (ported from 0002_seed_benchmarks.sql)
// ---------------------------------------------------------------------------

export const BENCHMARKS: Benchmark[] = [
  // ---- UNIVERSAL (roleSlug = null) ----
  {
    roleSlug: null, categorySlug: "work-about-work",
    metricLabel: '"Work about work" share of the day',
    valueLow: 58, valueHigh: 60, valuePoint: 58, unit: "pct_of_week",
    populationNote: "Knowledge workers",
    sourceName: "Asana \u2014 Anatomy of Work Global Index 2023",
    sourceUrl: "https://asana.com/resources/anatomy-of-work",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "n=9,615 global knowledge workers",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: 'The average knowledge worker spends 58\u201360% of the day on "work about work" \u2014 coordination, status-chasing, and chasing approvals \u2014 not the skilled work they were hired for.',
    valueBasis: "week_share",
  },
  {
    roleSlug: null, categorySlug: "email-messaging",
    metricLabel: "Time spent managing email",
    valueLow: null, valueHigh: null, valuePoint: 28, unit: "pct_of_week",
    populationNote: "Knowledge workers (~11.2 hrs/wk)",
    sourceName: "McKinsey Global Institute \u2014 The Social Economy",
    sourceUrl: "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy",
    sourceTier: "A", publicationYear: 2012,
    methodologyNote: "Landmark workweek benchmark; still the most-cited though aging",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Knowledge workers spend about 28% of the workweek \u2014 roughly 11 hours \u2014 just managing email.",
    valueBasis: "week_share",
  },
  {
    roleSlug: null, categorySlug: "email-messaging",
    metricLabel: "Daily message volume",
    valueLow: null, valueHigh: null, valuePoint: null, unit: "count",
    populationNote: "Microsoft 365 users",
    sourceName: "Microsoft \u2014 Work Trend Index: Breaking Down the Infinite Workday 2025",
    sourceUrl: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday",
    sourceTier: "A", publicationYear: 2025,
    methodologyNote: "117 emails + 153 Teams messages/day; interrupted ~every 2 min",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: "The typical worker now gets 117 emails and 153 chat messages a day \u2014 an interruption roughly every two minutes.",
    valueBasis: "other",
  },
  {
    roleSlug: null, categorySlug: "interruptions",
    metricLabel: "Time to refocus after an interruption",
    valueLow: null, valueHigh: null, valuePoint: 23.25, unit: "minutes",
    populationNote: "Knowledge workers",
    sourceName: "Gloria Mark / UC Irvine",
    sourceUrl: "https://www.informatics.uci.edu/forbes-brain-based-tips-for-sharpening-your-focus-gloria-mark-cited/",
    sourceTier: "A", publicationYear: 2008,
    methodologyNote: "Signature finding of the attention-research field (23 min 15 sec)",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "It takes 23 minutes and 15 seconds to fully refocus after a single interruption.",
    valueBasis: "duration",
  },
  {
    roleSlug: null, categorySlug: "info-search",
    metricLabel: "Time searching for internal information",
    valueLow: null, valueHigh: null, valuePoint: 19, unit: "pct_of_week",
    populationNote: "Knowledge workers",
    sourceName: "McKinsey Global Institute \u2014 The Social Economy",
    sourceUrl: "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy",
    sourceTier: "A", publicationYear: 2012,
    methodologyNote: "McKinsey 19% of workweek; corroborated by IDC ~2.5 hrs/day",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Workers spend about 19% of the week \u2014 nearly a full day \u2014 just searching for information they already have somewhere.",
    valueBasis: "week_share",
  },
  {
    roleSlug: null, categorySlug: "meetings",
    metricLabel: "Meetings that could be cut with no downside",
    valueLow: null, valueHigh: null, valuePoint: 43, unit: "pct_of_week",
    populationNote: "Knowledge workers",
    sourceName: "Slack \u2014 State of Work 2023",
    sourceUrl: "https://slack.com/blog/news/state-of-work-2023",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "Self-reported share of meetings eliminable",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "About 43% of meetings could be eliminated with no negative consequence.",
    valueBasis: "avoidable_share",
  },
  {
    roleSlug: null, categorySlug: "meetings",
    metricLabel: "Time lost to unnecessary meetings",
    valueLow: 2.8, valueHigh: 3.6, valuePoint: 2.8, unit: "hrs_per_week",
    populationNote: "Knowledge workers 2.8 hrs; leaders 3.6 hrs",
    sourceName: "Asana \u2014 Anatomy of Work Global Index 2023",
    sourceUrl: "https://asana.com/resources/anatomy-of-work",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "~103 hrs/year per worker",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: "The average worker loses 2.8 hours a week to meetings they did not need to be in \u2014 about 103 hours a year.",
    valueBasis: "duration",
  },
  {
    roleSlug: null, categorySlug: "context-switching",
    metricLabel: "App switches per day and reorientation cost",
    valueLow: null, valueHigh: null, valuePoint: 1200, unit: "count",
    populationNote: "Digital workers",
    sourceName: "Harvard Business Review (Microsoft dataset) 2022",
    sourceUrl: "https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications",
    sourceTier: "A", publicationYear: 2022,
    methodologyNote: "~1,200 toggles/day; ~4 hrs/wk (~9% of the work year) reorienting",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "People toggle between apps about 1,200 times a day \u2014 roughly 4 hours a week, or 9% of the work year, just reorienting.",
    valueBasis: "other",
  },
  {
    roleSlug: null, categorySlug: "duplicated-work",
    metricLabel: "Workers doing duplicative work",
    valueLow: null, valueHigh: null, valuePoint: 50, unit: "pct_of_week",
    populationNote: "Knowledge workers",
    sourceName: "Atlassian \u2014 State of Teams 2024",
    sourceUrl: "https://www.atlassian.com/blog/state-of-teams-2024",
    sourceTier: "B", publicationYear: 2024,
    methodologyNote: "209 hrs/year/worker on duplicative work (Asana)",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: "Half of all workers report doing duplicate work \u2014 the same task another team already did \u2014 costing about 209 hours a year.",
    valueBasis: "population",
  },
  {
    roleSlug: null, categorySlug: "admin-low-value",
    metricLabel: "Time on low-value, repetitive tasks",
    valueLow: null, valueHigh: null, valuePoint: 41, unit: "pct_of_week",
    populationNote: "Knowledge workers",
    sourceName: "Slack \u2014 State of Work 2023",
    sourceUrl: "https://slack.com/blog/news/state-of-work-2023",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "Self-reported low-value/repetitive share",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: "Workers say 41% of their time goes to low-value, repetitive tasks that could be automated or dropped.",
    valueBasis: "week_share",
  },
  {
    roleSlug: null, categorySlug: "waiting-blocked",
    metricLabel: "Focus-time gap (needed vs. actual)",
    valueLow: null, valueHigh: null, valuePoint: -46, unit: "pct_of_week",
    populationNote: "Outlook users (10,000+)",
    sourceName: "Reclaim.ai \u2014 Focus Time report",
    sourceUrl: "https://reclaim.ai/blog/what-is-focus-time",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "Need ~19.6 hrs/wk focus, get ~10.6 hrs (-46%); proxy for waits/handoffs",
    evidenceType: "estimated", confidence: "medium", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "other",
  },

  // ---- MARKETING ----
  {
    roleSlug: "marketing", categorySlug: "reporting-data-pulls",
    metricLabel: "Marketers who say reporting dominates their time",
    valueLow: null, valueHigh: null, valuePoint: 88, unit: "pct_of_week",
    populationNote: "Marketers",
    sourceName: "MarketingProfs / Adverity 2023",
    sourceUrl: "https://www.marketingprofs.com/charts/2023/50495/data-related-activities-marketers-spend-the-most-time-on",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "n=713; reporting time grew +57% over 10 yrs",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "88% of marketers say reporting and manual data pulls eat most of their time \u2014 and 63% of that work is automatable.",
    valueBasis: "population",
  },
  {
    roleSlug: "marketing", categorySlug: "reporting-data-pulls",
    metricLabel: "Data-related time spent on automatable tasks",
    valueLow: null, valueHigh: null, valuePoint: 63, unit: "pct_of_week",
    populationNote: "Marketers",
    sourceName: "MarketingProfs / Adverity 2023",
    sourceUrl: "https://www.marketingprofs.com/charts/2023/50495/data-related-activities-marketers-spend-the-most-time-on",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "n=713",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "avoidable_share",
  },
  {
    roleSlug: "marketing", categorySlug: "approval-feedback",
    metricLabel: "Marketers losing >1 day/week chasing feedback",
    valueLow: null, valueHigh: null, valuePoint: 65, unit: "pct_of_week",
    populationNote: "Marketers",
    sourceName: "Ziflow \u2014 Review & Approval research",
    sourceUrl: "https://www.ziflow.com/blog/review-and-approval-process",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "65% lose >1 full day/week; 80% hit late-feedback issues",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "65% of marketers lose more than a full day every week just chasing approvals and feedback.",
    valueBasis: "population",
  },
  {
    roleSlug: "marketing", categorySlug: "content-rework",
    metricLabel: "Assets revised 3\u20135\u00D7 before final",
    valueLow: null, valueHigh: null, valuePoint: 52, unit: "pct_of_week",
    populationNote: "Marketing teams",
    sourceName: "CoSchedule \u2014 Marketing/Design Collaboration",
    sourceUrl: "https://coschedule.com/blog/marketing-design-collaboration-templates",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "52% revise 3\u20135\u00D7; 20% revise 5\u201310\u00D7",
    evidenceType: "sourced", confidence: "medium", isVitalFew: true,
    displayBlurb: "52% of marketing teams revise an asset three to five times before it ships \u2014 usually because the brief was unclear.",
    valueBasis: "population",
  },
  {
    roleSlug: "marketing", categorySlug: "martech-sprawl",
    metricLabel: "Share of martech stack actually used",
    valueLow: 33, valueHigh: 49, valuePoint: 33, unit: "pct_of_week",
    populationNote: "Marketers",
    sourceName: "Gartner \u2014 Martech Survey 2023",
    sourceUrl: "https://martech.org/marketers-are-only-using-one-third-of-their-stacks-capability/",
    sourceTier: "A", publicationYear: 2023,
    methodologyNote: "n=405; 33% (2023) rising to 49% (2025)",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Marketers use only about a third of their martech stack \u2014 most of the tools they pay for sit idle.",
    valueBasis: "inverse",
  },
  {
    roleSlug: "marketing", categorySlug: "reporting-data-pulls",
    metricLabel: "Social media manager time on reporting",
    valueLow: null, valueHigh: null, valuePoint: 3.8, unit: "hrs_per_week",
    populationNote: "Social media managers",
    sourceName: "Sprout Social via MarketingProfs 2023",
    sourceUrl: "https://www.marketingprofs.com/charts/2024/51018/what-social-media-marketers-spend-their-time-doing",
    sourceTier: "A", publicationYear: 2023,
    methodologyNote: "n=500+; ~5 hrs/wk content+approvals, ~3.8 hrs/wk reporting",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "duration",
  },

  // ---- SALES & CS ----
  {
    roleSlug: "sales", categorySlug: "non-selling-time",
    metricLabel: "Share of week NOT spent selling",
    valueLow: 70, valueHigh: 72, valuePoint: 70, unit: "pct_of_week",
    populationNote: "Sales reps (AE/SDR)",
    sourceName: "Salesforce \u2014 State of Sales 2023",
    sourceUrl: "https://www.salesforce.com/news/stories/sales-research-2023/",
    sourceTier: "A", publicationYear: 2023,
    methodologyNote: "Reps sell only ~28\u201330% of the week; stable for a decade",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Sales reps spend only about 28% of the week actually selling \u2014 the other 70% goes to admin, search, and tool-switching.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "sales", categorySlug: "crm-data-entry",
    metricLabel: "Time on CRM data entry",
    valueLow: null, valueHigh: null, valuePoint: 17, unit: "pct_of_week",
    populationNote: "Sales reps",
    sourceName: "Salesforce \u2014 State of Sales",
    sourceUrl: "https://www.salesforce.com/sales/state-of-sales/sales-statistics/",
    sourceTier: "A", publicationYear: 2024,
    methodologyNote: "CRM 17% / email-admin 14% breakdown",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Reps spend about 17% of the week just entering data into the CRM \u2014 the single most automatable sink in the sales day.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "sales", categorySlug: "info-search",
    metricLabel: "Time hunting for content / collateral",
    valueLow: null, valueHigh: null, valuePoint: 10, unit: "hrs_per_week",
    populationNote: "Sellers",
    sourceName: "G2 \u2014 Sales Enablement Statistics",
    sourceUrl: "https://learn.g2.com/sales-enablement-statistics",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "~10 hrs/wk without enablement tooling; 65% of content unused",
    evidenceType: "sourced", confidence: "medium", isVitalFew: true,
    displayBlurb: "Without good enablement tooling, sellers spend around 10 hours a week just hunting for the right content.",
    valueBasis: "duration",
  },
  {
    roleSlug: "sales", categorySlug: "lead-research",
    metricLabel: "Time on manual prospect research / bad-fit leads",
    valueLow: 15, valueHigh: 25, valuePoint: 20, unit: "pct_of_week",
    populationNote: "SDR/BDR",
    sourceName: "HubSpot \u2014 2025 Sales Trends",
    sourceUrl: "https://blog.hubspot.com/sales/sales-statistics",
    sourceTier: "A", publicationYear: 2025,
    methodologyNote: "43% say data quality is their #1 prospecting challenge",
    evidenceType: "sourced", confidence: "medium", isVitalFew: true,
    displayBlurb: "SDRs lose 15\u201325% of the week to manual prospect research \u2014 and 43% say bad data is their single biggest prospecting problem.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "sales", categorySlug: "quoting-approvals",
    metricLabel: "AE time on quoting / deal-desk admin",
    valueLow: null, valueHigh: null, valuePoint: 35, unit: "pct_of_week",
    populationNote: "Account Executives",
    sourceName: "DealHub \u2014 CPQ benchmarks",
    sourceUrl: "https://dealhub.io/blog/cpq/cpq-strategies-to-supercharge-your-sales-cycle/",
    sourceTier: "C", publicationYear: 2024,
    methodologyNote: "Vendor-sourced; directionally consistent (>35% on quoting admin)",
    evidenceType: "estimated", confidence: "medium", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "week_share",
  },

  // ---- ENGINEERING ----
  {
    roleSlug: "engineering", categorySlug: "tech-debt",
    metricLabel: "Dev time lost to technical debt / bad code",
    valueLow: 23, valueHigh: 42, valuePoint: 33, unit: "pct_of_week",
    populationNote: "Software developers",
    sourceName: "Stripe \u2014 The Developer Coefficient 2018",
    sourceUrl: "https://stripe.com/files/reports/the-developer-coefficient.pdf",
    sourceTier: "A", publicationYear: 2018,
    methodologyNote: "Stripe 33% (~17.3 hrs/wk); academic replication 23%",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Developers lose roughly a third of their time \u2014 up to 17 hours a week \u2014 working around technical debt instead of building.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "engineering", categorySlug: "info-search",
    metricLabel: "Time searching for info / bad docs",
    valueLow: 20, valueHigh: 30, valuePoint: 20, unit: "pct_of_week",
    populationNote: "Software developers",
    sourceName: "McKinsey \u2014 The Social Economy",
    sourceUrl: "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy",
    sourceTier: "A", publicationYear: 2012,
    methodologyNote: "Atlassian DevEx 2025 ranks info-search #1 friction point",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Searching for information and fighting bad documentation is now the #1 friction point developers report.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "engineering", categorySlug: "code-review-wait",
    metricLabel: "Cycle time spent waiting (review/queues)",
    valueLow: null, valueHigh: null, valuePoint: 30, unit: "pct_of_week",
    populationNote: "Software teams",
    sourceName: "DORA \u2014 2023 State of DevOps",
    sourceUrl: "https://dora.dev/research/",
    sourceTier: "A", publicationYear: 2023,
    methodologyNote: "~30% of lead time is wait/queues, not coding",
    evidenceType: "sourced", confidence: "medium", isVitalFew: true,
    displayBlurb: "About 30% of software cycle time is spent waiting \u2014 on code review and queues \u2014 not writing code.",
    valueBasis: "subactivity",
  },
  {
    roleSlug: "engineering", categorySlug: "requirements-rework",
    metricLabel: "Rework traced to unclear requirements",
    valueLow: null, valueHigh: null, valuePoint: 50, unit: "pct_of_week",
    populationNote: "Software teams",
    sourceName: "Jama Software \u2014 Requirements research",
    sourceUrl: "https://www.jamasoftware.com/requirements-management-guide/requirements-management/guide-to-poor-requirements-identify-causes-repercussions-and-how-to-fix-them/",
    sourceTier: "C", publicationYear: 2023,
    methodologyNote: "~56% of defects originate in requirements; rework up to ~50% of project work",
    evidenceType: "estimated", confidence: "medium", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "subactivity",
  },
  {
    roleSlug: "engineering", categorySlug: "context-switching",
    metricLabel: "Context rebuilding from interruptions",
    valueLow: 5, valueHigh: 15, valuePoint: 10, unit: "hrs_per_week",
    populationNote: "Software developers",
    sourceName: "Asana \u2014 Anatomy of Work / Gloria Mark",
    sourceUrl: "https://asana.com/resources/anatomy-of-work",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "5\u201315 hrs/wk; ~23 min recovery per interruption",
    evidenceType: "sourced", confidence: "medium", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "duration",
  },

  // ---- PRODUCT ----
  {
    roleSlug: "product", categorySlug: "status-reporting",
    metricLabel: "PMs spending >1 day/week on status updates",
    valueLow: null, valueHigh: null, valuePoint: 45, unit: "pct_of_week",
    populationNote: "Product managers",
    sourceName: "ProductPlan \u2014 Status Updates",
    sourceUrl: "https://www.productplan.com/learn/the-product-managers-guide-to-status-updates",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "45% of PMs spend >1 day/week compiling status",
    evidenceType: "sourced", confidence: "medium", isVitalFew: true,
    displayBlurb: "45% of product managers spend more than a day a week just compiling status updates.",
    valueBasis: "population",
  },
  {
    roleSlug: "product", categorySlug: "firefighting",
    metricLabel: "PM time on reactive firefighting",
    valueLow: null, valueHigh: null, valuePoint: 52, unit: "pct_of_week",
    populationNote: "Product managers",
    sourceName: "UXcam \u2014 Product Management Statistics",
    sourceUrl: "https://uxcam.com/blog/product-management-statistics/",
    sourceTier: "C", publicationYear: 2024,
    methodologyNote: "Vendor blog; ~52% on unplanned firefighting",
    evidenceType: "estimated", confidence: "low", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "week_share",
  },
  {
    roleSlug: "product", categorySlug: "strategic-underinvest",
    metricLabel: "PMs hitting their strategic-time goal",
    valueLow: null, valueHigh: null, valuePoint: 8, unit: "pct_of_week",
    populationNote: "Product managers",
    sourceName: "Pragmatic Institute (via UXcam)",
    sourceUrl: "https://uxcam.com/blog/product-management-statistics/",
    sourceTier: "C", publicationYear: 2024,
    methodologyNote: "Only 8% hit strategic-time goals; 72% mostly on tactics",
    evidenceType: "estimated", confidence: "low", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "population",
  },
  {
    roleSlug: "product", categorySlug: "info-search",
    metricLabel: "PM time searching for information",
    valueLow: null, valueHigh: null, valuePoint: 20, unit: "pct_of_week",
    populationNote: "Knowledge workers",
    sourceName: "McKinsey \u2014 The Social Economy",
    sourceUrl: "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy",
    sourceTier: "A", publicationYear: 2012,
    methodologyNote: "Knowledge-worker baseline applied to PMs",
    evidenceType: "sourced", confidence: "medium", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "week_share",
  },

  // ---- DESIGN ----
  {
    roleSlug: "design", categorySlug: "design-handoff",
    metricLabel: "Developers who redo designs from miscommunication",
    valueLow: null, valueHigh: null, valuePoint: 62, unit: "pct_of_week",
    populationNote: "Designers / developers",
    sourceName: "UXPin \u2014 Design-to-Dev Handoff",
    sourceUrl: "https://www.uxpin.com/studio/blog/10-ways-to-improve-design-to-development-handoff/",
    sourceTier: "C", publicationYear: 2023,
    methodologyNote: "62% of devs redo designs due to communication breakdowns",
    evidenceType: "estimated", confidence: "low", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "population",
  },
  {
    roleSlug: "design", categorySlug: "content-rework",
    metricLabel: "Design iteration time recoverable with consistent insight",
    valueLow: null, valueHigh: null, valuePoint: 25, unit: "pct_of_week",
    populationNote: "Design teams",
    sourceName: "UserTesting / Forrester TEI",
    sourceUrl: "https://www.usertesting.com/blog/ux-design-metrics-performance-efficiency",
    sourceTier: "B", publicationYear: 2023,
    methodologyNote: "Consistent insight could cut design iteration time ~25%",
    evidenceType: "sourced", confidence: "medium", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "avoidable_share",
  },
  {
    roleSlug: "design", categorySlug: "admin-low-value",
    metricLabel: "Creative time spent on actual creative work",
    valueLow: null, valueHigh: null, valuePoint: 40, unit: "pct_of_week",
    populationNote: "Creative teams",
    sourceName: "Creative-team analysis (secondary)",
    sourceUrl: "https://medium.com/@fluidfitai/why-your-creative-team-is-drowning-in-repetitive-work-and-what-ai-automation-can-do-about-it-6807b5d504eb",
    sourceTier: "C", publicationYear: 2023,
    methodologyNote: "Creative teams spend <40% on actual creative work",
    evidenceType: "estimated", confidence: "low", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "inverse",
  },

  // ---- MANAGER ----
  {
    roleSlug: "manager", categorySlug: "meetings",
    metricLabel: "Manager week spent in meetings",
    valueLow: 25, valueHigh: 50, valuePoint: 25, unit: "pct_of_week",
    populationNote: "Middle managers",
    sourceName: "Atlassian \u2014 State of Teams 2024",
    sourceUrl: "https://www.atlassian.com/blog/state-of-teams-2024",
    sourceTier: "B", publicationYear: 2024,
    methodologyNote: "Peaked >50% (2023); ~25% (9\u201313 hrs/wk) by 2025-26; 80% want less",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Managers spend about a quarter of the week in meetings \u2014 and 80% say they would be more productive with fewer.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "manager", categorySlug: "ic-work-switching",
    metricLabel: "Manager time on non-managerial IC + admin work",
    valueLow: null, valueHigh: null, valuePoint: 49, unit: "pct_of_week",
    populationNote: "Middle managers",
    sourceName: "McKinsey \u2014 Stop Wasting Your Most Precious Resource: Middle Managers 2023",
    sourceUrl: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/stop-wasting-your-most-precious-resource-middle-managers",
    sourceTier: "A", publicationYear: 2023,
    methodologyNote: "Time split: 28% managing / 23% strategy / 31% IC / 18% admin",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Managers spend about 49% of their time on non-managerial work \u2014 31% still doing IC tasks, 18% on admin \u2014 crowding out actual leading.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "manager", categorySlug: "email-messaging",
    metricLabel: "Manager time on email & messaging",
    valueLow: 25, valueHigh: 30, valuePoint: 28, unit: "pct_of_week",
    populationNote: "Middle managers",
    sourceName: "Microsoft \u2014 Work Trend Index 2025",
    sourceUrl: "https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday",
    sourceTier: "A", publicationYear: 2025,
    methodologyNote: "~2 hrs/day; 270+ daily messages; interruption every ~2 min",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Managers spend roughly 2 hours a day \u2014 about 28% of the week \u2014 on email and messaging.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "manager", categorySlug: "admin-low-value",
    metricLabel: "Manager time on low-value admin / approvals",
    valueLow: null, valueHigh: null, valuePoint: 18, unit: "pct_of_week",
    populationNote: "Middle managers",
    sourceName: "McKinsey \u2014 Middle Managers 2023",
    sourceUrl: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/stop-wasting-your-most-precious-resource-middle-managers",
    sourceTier: "A", publicationYear: 2023,
    methodologyNote: "~18% (~1 full day/week) on low-value admin",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: "Middle managers burn about a full day a week \u2014 18% of their time \u2014 on administrative tasks they rate as low-value.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "manager", categorySlug: "duplicated-work",
    metricLabel: "Reports doing duplicate work under managers",
    valueLow: null, valueHigh: null, valuePoint: 50, unit: "pct_of_week",
    populationNote: "Teams",
    sourceName: "Atlassian \u2014 State of Teams 2024",
    sourceUrl: "https://www.atlassian.com/blog/state-of-teams-2024",
    sourceTier: "B", publicationYear: 2024,
    methodologyNote: "50% do duplicate work; 54% lack goal clarity",
    evidenceType: "sourced", confidence: "high", isVitalFew: false,
    displayBlurb: null,
    valueBasis: "population",
  },

  // ---- EXECUTIVE ----
  {
    roleSlug: "executive", categorySlug: "meetings",
    metricLabel: "CEO work time spent in meetings",
    valueLow: null, valueHigh: null, valuePoint: 72, unit: "pct_of_week",
    populationNote: "CEOs",
    sourceName: "HBR \u2014 How CEOs Manage Time (Porter & Nohria 2018)",
    sourceUrl: "https://hbr.org/2018/07/how-ceos-manage-time",
    sourceTier: "A", publicationYear: 2018,
    methodologyNote: "27 CEOs, 60,000 hrs tracked; ~37 meetings/week; ~67% judged failures",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "CEOs spend 72% of their working time in meetings \u2014 and executives judge about two-thirds of them failures.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "executive", categorySlug: "firefighting",
    metricLabel: "CEO time in reactive firefighting mode",
    valueLow: null, valueHigh: null, valuePoint: 36, unit: "pct_of_week",
    populationNote: "CEOs",
    sourceName: "HBR \u2014 Porter & Nohria 2018",
    sourceUrl: "https://hbr.org/2018/07/how-ceos-manage-time",
    sourceTier: "A", publicationYear: 2018,
    methodologyNote: "36% reactive; ~half of execs admit under-focusing on strategy",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "CEOs spend 36% of their time in reactive \"firefighting\" mode \u2014 and nearly half admit they do not focus enough on strategy.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "executive", categorySlug: "strategic-underinvest",
    metricLabel: "Execs very satisfied with their time allocation",
    valueLow: null, valueHigh: null, valuePoint: 9, unit: "pct_of_week",
    populationNote: "Executives (1,374)",
    sourceName: "McKinsey \u2014 Making Time Management the Organization's Priority",
    sourceUrl: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/making-time-management-the-organizations-priority",
    sourceTier: "A", publicationYear: 2011,
    methodologyNote: "Only 9% very satisfied; only 52% aligned to priorities; ~22% on long-term",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Only 9% of executives are very satisfied with how they spend their time, and just 22% goes to long-term strategy.",
    valueBasis: "population",
  },
  {
    roleSlug: "executive", categorySlug: "email-messaging",
    metricLabel: "CEO time on electronic communication",
    valueLow: null, valueHigh: null, valuePoint: 24, unit: "pct_of_week",
    populationNote: "CEOs",
    sourceName: "HBR \u2014 Porter & Nohria 2018",
    sourceUrl: "https://hbr.org/2018/07/how-ceos-manage-time",
    sourceTier: "A", publicationYear: 2018,
    methodologyNote: "24% of time; 150\u2013300 emails/day",
    evidenceType: "sourced", confidence: "high", isVitalFew: true,
    displayBlurb: "Email and electronic communication eat 24% of a CEO's time \u2014 much of it reactive, low-value triage.",
    valueBasis: "week_share",
  },
  {
    roleSlug: "executive", categorySlug: "delegation-failure",
    metricLabel: "Recommended share of work to delegate",
    valueLow: null, valueHigh: null, valuePoint: 80, unit: "pct_of_week",
    populationNote: "CEOs / founders",
    sourceName: "Vistage \u2014 Top CEO Time-Wasters",
    sourceUrl: "https://www.vistage.com/research-center/personal-development/20210914-top-4-ceo-time-waster-habits/",
    sourceTier: "C", publicationYear: 2021,
    methodologyNote: "Advisory consensus, not a measured study; founder-as-bottleneck",
    evidenceType: "estimated", confidence: "medium", isVitalFew: true,
    displayBlurb: null,
    valueBasis: "other",
  },
];

/** Get benchmarks for a specific role (includes universal). */
export function benchmarksForRole(roleSlug: RoleSlug): Benchmark[] {
  return BENCHMARKS.filter((b) => b.roleSlug === null || b.roleSlug === roleSlug);
}

/** Get only surfaceable (Tier A/B + sourced) benchmarks. */
export function surfaceableBenchmarks(): SurfaceableBenchmark[] {
  return BENCHMARKS.filter(isSurfaceable);
}

/** Get vital-few benchmarks for a role. */
export function vitalFewForRole(roleSlug: RoleSlug): Benchmark[] {
  return benchmarksForRole(roleSlug).filter((b) => b.isVitalFew);
}
