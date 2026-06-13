// Waste-source taxonomy — rebuilt against Ohno's Muda.
//
// DEFINITION (locked): waste = an ACTIVITY that consumes time but adds no value
// the business is ultimately paid for, AND whose hours are avoidable.
//
// Every label is written to the locked PHRASING STANDARD:
//   <clockable activity> + <avoidable cut>   — and nothing else.

import type { RoleSlug } from "./benchmarks";

/** Ohno's wastes, in knowledge-work language. */
export type MudaType =
  | "rework" // Defects — redoing / fixing work
  | "overproduction" // making more / finer than asked
  | "waiting" // idle on approvals, handoffs, dependencies
  | "underused-skill" // non-utilized talent — manual / undelegated work
  | "handoffs" // Transport — shuttling work & info between people/systems
  | "pile-ups" // Inventory — unfinished WIP, backlogs, unread queues
  | "switching-searching" // Motion — context/tool switching, hunting, refocus
  | "over-processing"; // more meeting/approval/format than the task needs

export interface WasteSource {
  slug: string;
  /** Neutral activity-area header for the UI (groups + orders the long list). */
  group: string;
  /** Label = clockable activity + avoidable cut. Passes the 5-point test. */
  label: string;
  /** Internal Muda classification + solution-routing tag. */
  muda: MudaType;
  /** One-line "what counts" hover — concrete examples of the slice. */
  whatCounts: string;
  /** Roles this source applies to; "universal" = all. */
  scope: "universal" | RoleSlug[];
  /** Emotional emoji for UI display. */
  emoji: string;
}

/** Display order for the activity groups (unknown groups sort to the end). */
export const GROUP_ORDER = [
  "Meetings",
  "Email & chat",
  "Coordination",
  "Focus",
  "Waiting & blocked",
  "Rework",
  "Doing more than needed",
  "Admin",
  "Reporting",
  "CRM & data",
  "Prospecting",
  "Quotes & proposals",
  "Code",
  "Builds & reviews",
  "Creative",
  "Files & assets",
  "Leading vs doing",
] as const;

/** Map group names to emoji for display. */
const GROUP_EMOJI: Record<string, string> = {
  "Meetings": "\u{1F634}",             // 😴
  "Email & chat": "\u{1FAE0}",         // 🫠
  "Coordination": "\u{1F9DF}",         // 🧟
  "Focus": "\u{1F939}",                // 🤹
  "Waiting & blocked": "\u{1F624}",    // 😤
  "Rework": "\u{1F926}",               // 🤦
  "Doing more than needed": "\u{1F971}", // 🥱
  "Admin": "\u{1F480}",                // 💀
  "Reporting": "\u{1F480}",            // 💀 (Admin/Reporting)
  "CRM & data": "\u{1FAE0}",           // 🫠
  "Prospecting": "\u{1FAE0}",          // 🫠
  "Quotes & proposals": "\u{1FAE0}",   // 🫠
  "Code": "\u{1F926}",                 // 🤦 (Rework)
  "Builds & reviews": "\u{1F624}",     // 😤 (Waiting/Blocked)
  "Creative": "\u{1F926}",             // 🤦 (Rework)
  "Files & assets": "\u{1F480}",       // 💀 (Admin)
  "Leading vs doing": "\u{1F971}",     // 🥱 (Over-Processing)
};

function emojiFor(group: string): string {
  return GROUP_EMOJI[group] ?? "\u{1F914}"; // 🤔 fallback
}

export const UNIVERSAL_WASTE: WasteSource[] = [
  // Meetings — only the avoidable slices (the activity itself can add value)
  { slug: "meet-not-needed", group: "Meetings", label: "Meetings you weren\u2019t needed in", muda: "over-processing", whatCounts: "Invited \u201Cjust in case\u201D, sat through it, added nothing.", scope: "universal", emoji: emojiFor("Meetings") },
  { slug: "meet-status", group: "Meetings", label: "Recurring status update meetings", muda: "over-processing", whatCounts: "Round-the-room updates with no decision made.", scope: "universal", emoji: emojiFor("Meetings") },
  { slug: "meet-recurring", group: "Meetings", label: "Standing meetings that outlived their purpose", muda: "over-processing", whatCounts: "Recurring syncs nobody questions or cancels.", scope: "universal", emoji: emojiFor("Meetings") },
  { slug: "meet-overlong", group: "Meetings", label: "Meetings that run longer than needed", muda: "over-processing", whatCounts: "Done in 20, ran 60 because the slot was 60.", scope: "universal", emoji: emojiFor("Meetings") },

  // Email & chat
  { slug: "email-triage", group: "Email & chat", label: "Triaging low-value email & CC chains", muda: "handoffs", whatCounts: "Reading and clearing mail you didn\u2019t need to be on.", scope: "universal", emoji: emojiFor("Email & chat") },
  { slug: "chat-reply-all", group: "Email & chat", label: "Noisy group threads and reply-all chains", muda: "over-processing", whatCounts: "Pile-ons, thanks chains, noise you read anyway.", scope: "universal", emoji: emojiFor("Email & chat") },

  // Coordination (work-about-work)
  { slug: "coord-status-chase", group: "Coordination", label: "Chasing people for status updates", muda: "handoffs", whatCounts: "Pinging for where things stand, nudging for replies.", scope: "universal", emoji: emojiFor("Coordination") },
  { slug: "coord-trackers", group: "Coordination", label: "Updating trackers & docs by hand", muda: "handoffs", whatCounts: "Keeping boards, sheets and status docs in sync manually.", scope: "universal", emoji: emojiFor("Coordination") },

  // Focus (Motion)
  { slug: "focus-tool-switch", group: "Focus", label: "Switching between too many tools", muda: "switching-searching", whatCounts: "Toggling app to app, re-orienting each time.", scope: "universal", emoji: emojiFor("Focus") },
  { slug: "focus-search", group: "Focus", label: "Hunting for info you already have", muda: "switching-searching", whatCounts: "Searching for a doc, a number, the person who knows.", scope: "universal", emoji: emojiFor("Focus") },
  { slug: "focus-refind", group: "Focus", label: "Re-finding your place after interruptions", muda: "switching-searching", whatCounts: "Pings and drop-bys, then clawing focus back.", scope: "universal", emoji: emojiFor("Focus") },

  // Waiting
  { slug: "wait-approval", group: "Waiting & blocked", label: "Waiting on an approval or sign-off", muda: "waiting", whatCounts: "Idle until someone reviews or says yes.", scope: "universal", emoji: emojiFor("Waiting & blocked") },
  { slug: "wait-handoff", group: "Waiting & blocked", label: "Blocked on a handoff from someone else", muda: "waiting", whatCounts: "Your next step lives with another person.", scope: "universal", emoji: emojiFor("Waiting & blocked") },

  // Rework
  { slug: "rework-unclear", group: "Rework", label: "Redoing work from unclear direction", muda: "rework", whatCounts: "Built it, the goal shifted, built it again.", scope: "universal", emoji: emojiFor("Rework") },
  { slug: "rework-duplicate", group: "Rework", label: "Doing work that was already done", muda: "rework", whatCounts: "Rebuilding something a teammate already finished.", scope: "universal", emoji: emojiFor("Rework") },

  // Doing more than needed
  { slug: "overdo-overspec", group: "Doing more than needed", label: "Over-polishing and gold-plating work", muda: "over-processing", whatCounts: "Extra detail, perfecting beyond what was asked.", scope: "universal", emoji: emojiFor("Doing more than needed") },
  { slug: "overdo-multitask", group: "Doing more than needed", label: "Juggling several tasks at once", muda: "switching-searching", whatCounts: "Splitting attention across tasks, finishing none cleanly.", scope: "universal", emoji: emojiFor("Doing more than needed") },
  { slug: "overdo-incomplete-kit", group: "Waiting & blocked", label: "Tasks stalled by missing inputs or access", muda: "waiting", whatCounts: "Started but can\u2019t finish \u2014 missing info, people, or permissions.", scope: "universal", emoji: emojiFor("Waiting & blocked") },
  { slug: "overdo-procrastination", group: "Focus", label: "Low-value busywork while real work waits", muda: "switching-searching", whatCounts: "Easy filler tasks instead of the hard thing.", scope: "universal", emoji: emojiFor("Focus") },

  // Admin
  { slug: "admin-data-entry", group: "Admin", label: "Manual, repetitive data entry", muda: "underused-skill", whatCounts: "Copy-paste between tools, re-keying the same data.", scope: "universal", emoji: emojiFor("Admin") },
  { slug: "admin-forms", group: "Admin", label: "Forms, expenses, and timesheets", muda: "underused-skill", whatCounts: "Routine paperwork and manual compliance tasks.", scope: "universal", emoji: emojiFor("Admin") },
];

export const ROLE_WASTE: WasteSource[] = [
  // MARKETING
  { slug: "mkt-report-byhand", group: "Reporting", label: "Building the same report by hand", muda: "underused-skill", whatCounts: "Re-pulling weekly numbers, rebuilding the same dashboard.", scope: ["marketing"], emoji: emojiFor("Reporting") },
  { slug: "mkt-data-stitch", group: "Reporting", label: "Stitching campaign data across platforms", muda: "handoffs", whatCounts: "Exporting and merging numbers from each tool by hand.", scope: ["marketing"], emoji: emojiFor("Reporting") },
  { slug: "mkt-revisions", group: "Creative", label: "Endless revision rounds on creative work", muda: "rework", whatCounts: "Redoing work because direction was unclear.", scope: ["marketing"], emoji: emojiFor("Creative") },
  { slug: "mkt-social-reformat", group: "Creative", label: "Reformatting the same post for each platform", muda: "over-processing", whatCounts: "Resizing, rewording and re-cropping per channel.", scope: ["marketing"], emoji: emojiFor("Creative") },
  { slug: "mkt-brand-signoff", group: "Waiting & blocked", label: "Waiting on brand or legal sign-off", muda: "waiting", whatCounts: "Work parked until review comes back.", scope: ["marketing"], emoji: emojiFor("Waiting & blocked") },

  // SALES / CS
  { slug: "sales-crm-entry", group: "CRM & data", label: "Logging calls & emails into the CRM by hand", muda: "underused-skill", whatCounts: "Transcribing notes, updating records after every touch.", scope: ["sales"], emoji: emojiFor("CRM & data") },
  { slug: "sales-double-entry", group: "CRM & data", label: "Re-entering the same data in two systems", muda: "handoffs", whatCounts: "Keying the deal into the CRM and the spreadsheet.", scope: ["sales"], emoji: emojiFor("CRM & data") },
  { slug: "sales-lead-research", group: "Prospecting", label: "Researching prospects one tab at a time", muda: "switching-searching", whatCounts: "Manually piecing together who and where to call.", scope: ["sales"], emoji: emojiFor("Prospecting") },
  { slug: "sales-bad-leads", group: "Prospecting", label: "Chasing bad-fit, bad-data leads", muda: "rework", whatCounts: "Wrong numbers, bounces, leads you re-qualify in vain.", scope: ["sales"], emoji: emojiFor("Prospecting") },
  { slug: "sales-quote-build", group: "Quotes & proposals", label: "Building quotes & proposals by hand", muda: "underused-skill", whatCounts: "Formatting documents the system could assemble.", scope: ["sales"], emoji: emojiFor("Quotes & proposals") },
  { slug: "sales-deal-desk", group: "Waiting & blocked", label: "Waiting on discount or legal sign-off", muda: "waiting", whatCounts: "Deal stalled in deal-desk / contract review.", scope: ["sales"], emoji: emojiFor("Waiting & blocked") },
  { slug: "sales-asset-hunt", group: "Prospecting", label: "Hunting for the deck that already exists", muda: "switching-searching", whatCounts: "Searching for case studies, pricing sheets, decks.", scope: ["sales"], emoji: emojiFor("Prospecting") },

  // ENGINEERING
  { slug: "eng-tech-debt", group: "Code", label: "Working around brittle, undocumented code", muda: "rework", whatCounts: "Untangling spaghetti, fixing the same fragile area.", scope: ["engineering"], emoji: emojiFor("Code") },
  { slug: "eng-req-rework", group: "Code", label: "Rebuilding from specs that changed", muda: "rework", whatCounts: "Coding against a moving target, mid-build clarifications.", scope: ["engineering"], emoji: emojiFor("Code") },
  { slug: "eng-pr-wait", group: "Builds & reviews", label: "Finished code waiting in the review queue", muda: "waiting", whatCounts: "A PR blocked on a busy reviewer or a merge gate.", scope: ["engineering"], emoji: emojiFor("Builds & reviews") },
  { slug: "eng-ci-wait", group: "Builds & reviews", label: "Waiting on slow or flaky builds", muda: "waiting", whatCounts: "Staring at CI, re-running tests that fail randomly.", scope: ["engineering"], emoji: emojiFor("Builds & reviews") },
  { slug: "eng-env-fix", group: "Builds & reviews", label: "Fixing broken environments & setup", muda: "rework", whatCounts: "Local/staging breakage and manual deploy steps.", scope: ["engineering"], emoji: emojiFor("Builds & reviews") },

  // PRODUCT
  { slug: "prod-status-repackage", group: "Reporting", label: "Re-packaging status for each audience", muda: "overproduction", whatCounts: "Same update rebuilt as a deck, a doc, a roadmap view.", scope: ["product"], emoji: emojiFor("Reporting") },
  { slug: "prod-spec-rework", group: "Rework", label: "Reworking features from unclear requirements", muda: "rework", whatCounts: "Built \u201Cnot what they meant\u201D, then rebuilt.", scope: ["product"], emoji: emojiFor("Rework") },
  { slug: "prod-realign", group: "Coordination", label: "Re-aligning the same decision across teams", muda: "over-processing", whatCounts: "Re-explaining and re-securing buy-in repeatedly.", scope: ["product"], emoji: emojiFor("Coordination") },
  { slug: "prod-firefighting", group: "Focus", label: "Unplanned escalations & urgent asks", muda: "switching-searching", whatCounts: "\u201CQuick questions\u201D and triage hijacking planned work.", scope: ["product", "executive"], emoji: emojiFor("Focus") },

  // DESIGN
  { slug: "design-handoff-redo", group: "Rework", label: "Re-explaining designs lost in handoff", muda: "handoffs", whatCounts: "Devs rebuilding from miscommunication; specs that don\u2019t survive.", scope: ["design"], emoji: emojiFor("Rework") },
  { slug: "design-feedback-redo", group: "Creative", label: "Redoing designs from contradictory feedback", muda: "rework", whatCounts: "Decoding \u201Cmake it pop\u201D, reconciling clashing notes.", scope: ["design"], emoji: emojiFor("Creative") },
  { slug: "design-file-admin", group: "Files & assets", label: "Organizing, renaming & versioning files", muda: "underused-skill", whatCounts: "File wrangling instead of designing.", scope: ["design"], emoji: emojiFor("Files & assets") },
  { slug: "design-export", group: "Files & assets", label: "Resizing & exporting assets by hand", muda: "underused-skill", whatCounts: "Manual exports, per-size variants, deck-building.", scope: ["design"], emoji: emojiFor("Files & assets") },

  // SOFTWARE DEV
  { slug: "sdev-context-switch", group: "Focus", label: "Switching between repos, tickets, and Slack", muda: "switching-searching", whatCounts: "Jumping between codebases, tickets, and chat all day.", scope: ["software-dev"], emoji: emojiFor("Focus") },
  { slug: "sdev-deploy-wait", group: "Builds & reviews", label: "Waiting on deploys and CI pipelines", muda: "waiting", whatCounts: "Watching CI run, retrying flaky tests, waiting for green.", scope: ["software-dev"], emoji: emojiFor("Builds & reviews") },
  { slug: "sdev-debug-others", group: "Code", label: "Debugging code you didn\u2019t write", muda: "rework", whatCounts: "Spelunking unfamiliar code to fix someone else\u2019s bug.", scope: ["software-dev"], emoji: emojiFor("Code") },
  { slug: "sdev-pr-review", group: "Builds & reviews", label: "Code reviews piling up in your queue", muda: "pile-ups", whatCounts: "PRs waiting on you or your PRs waiting on others.", scope: ["software-dev"], emoji: emojiFor("Builds & reviews") },
  { slug: "sdev-env-setup", group: "Builds & reviews", label: "Fixing local dev environment issues", muda: "rework", whatCounts: "Broken Docker, missing env vars, version mismatches.", scope: ["software-dev"], emoji: emojiFor("Builds & reviews") },

  // OPERATIONS
  { slug: "ops-manual-process", group: "Admin", label: "Running processes that should be automated", muda: "underused-skill", whatCounts: "Manual steps in workflows that repeat every cycle.", scope: ["operations"], emoji: emojiFor("Admin") },
  { slug: "ops-vendor-chase", group: "Coordination", label: "Chasing vendors and suppliers for updates", muda: "handoffs", whatCounts: "Following up on orders, deliveries, and contracts.", scope: ["operations"], emoji: emojiFor("Coordination") },
  { slug: "ops-exception-handling", group: "Rework", label: "Handling exceptions and edge cases by hand", muda: "rework", whatCounts: "Manual fixes for things the system doesn\u2019t handle.", scope: ["operations"], emoji: emojiFor("Rework") },
  { slug: "ops-report-compile", group: "Reporting", label: "Compiling operational reports from multiple sources", muda: "handoffs", whatCounts: "Pulling data from different systems into one view.", scope: ["operations"], emoji: emojiFor("Reporting") },
  { slug: "ops-firefighting", group: "Focus", label: "Dropping planned work for urgent fires", muda: "switching-searching", whatCounts: "Reactive firefighting instead of planned improvements.", scope: ["operations"], emoji: emojiFor("Focus") },

  // FINANCE
  { slug: "fin-reconcile", group: "Admin", label: "Manual reconciliation across systems", muda: "underused-skill", whatCounts: "Matching entries across spreadsheets and accounting tools.", scope: ["finance"], emoji: emojiFor("Admin") },
  { slug: "fin-receipt-chase", group: "Coordination", label: "Chasing people for receipts and approvals", muda: "handoffs", whatCounts: "Following up on missing docs for expense reports.", scope: ["finance"], emoji: emojiFor("Coordination") },
  { slug: "fin-close-crunch", group: "Rework", label: "Month-end close scramble", muda: "over-processing", whatCounts: "Last-minute corrections and late entries every close cycle.", scope: ["finance"], emoji: emojiFor("Rework") },
  { slug: "fin-report-reformat", group: "Reporting", label: "Reformatting the same report for different audiences", muda: "overproduction", whatCounts: "Board version, team version, investor version of the same data.", scope: ["finance"], emoji: emojiFor("Reporting") },
  { slug: "fin-data-entry", group: "Admin", label: "Keying data between accounting tools", muda: "underused-skill", whatCounts: "Copy-pasting between your GL, payroll, and bank.", scope: ["finance"], emoji: emojiFor("Admin") },

  // CEO / FOUNDER
  { slug: "ceo-context-switch", group: "Focus", label: "Context-switching between every function", muda: "switching-searching", whatCounts: "Product, sales, ops, finance \u2014 all in one morning.", scope: ["ceo-founder"], emoji: emojiFor("Focus") },
  { slug: "ceo-inbox-overload", group: "Email & chat", label: "Inbox overload from every direction", muda: "handoffs", whatCounts: "Everyone CCs you, everyone needs a reply.", scope: ["ceo-founder"], emoji: emojiFor("Email & chat") },
  { slug: "ceo-delegation-redo", group: "Leading vs doing", label: "Redoing work you delegated", muda: "underused-skill", whatCounts: "Fixing output instead of coaching the person.", scope: ["ceo-founder"], emoji: emojiFor("Leading vs doing") },
  { slug: "ceo-investor-prep", group: "Reporting", label: "Prep and follow-up for investor updates", muda: "over-processing", whatCounts: "Decks, metrics, narratives \u2014 recurring and manual.", scope: ["ceo-founder"], emoji: emojiFor("Reporting") },
  { slug: "ceo-decision-bottleneck", group: "Coordination", label: "Being the bottleneck for every decision", muda: "over-processing", whatCounts: "Nothing moves without your sign-off.", scope: ["ceo-founder"], emoji: emojiFor("Coordination") },

  // MANAGER
  { slug: "mgr-1on1-autopilot", group: "Meetings", label: "1:1s & reviews running on autopilot", muda: "over-processing", whatCounts: "Recurring slots kept out of habit, not need.", scope: ["manager"], emoji: emojiFor("Meetings") },
  { slug: "mgr-ic-work", group: "Leading vs doing", label: "Doing IC work instead of managing", muda: "underused-skill", whatCounts: "Handling tasks yourself instead of empowering the team.", scope: ["manager"], emoji: emojiFor("Leading vs doing") },
  { slug: "mgr-approvals", group: "Admin", label: "Low-stakes approvals routed through you", muda: "over-processing", whatCounts: "Expense, PTO, and access sign-offs you never really gate.", scope: ["manager"], emoji: emojiFor("Admin") },
  { slug: "mgr-unblock", group: "Focus", label: "Fielding \u201Cgot a sec?\u201D requests all day", muda: "switching-searching", whatCounts: "Being the unblock-everything hub for the team.", scope: ["manager"], emoji: emojiFor("Focus") },

  // EXECUTIVE
  { slug: "exec-email-delegable", group: "Email & chat", label: "Replying to routine mail personally", muda: "underused-skill", whatCounts: "Handling routine correspondence yourself, touch by touch.", scope: ["executive"], emoji: emojiFor("Email & chat") },
  { slug: "exec-recheck", group: "Leading vs doing", label: "Re-checking your team\u2019s work", muda: "underused-skill", whatCounts: "Re-doing or re-reviewing what you delegated.", scope: ["executive"], emoji: emojiFor("Leading vs doing") },
  { slug: "exec-decide-through-you", group: "Coordination", label: "Decisions routed through you that needn\u2019t be", muda: "over-processing", whatCounts: "Being the single point every call must pass.", scope: ["executive"], emoji: emojiFor("Coordination") },
];

const ALL_WASTE = [...UNIVERSAL_WASTE, ...ROLE_WASTE];

export function wasteSourceBySlug(slug: string): WasteSource | undefined {
  return ALL_WASTE.find((s) => s.slug === slug);
}

/**
 * Which benchmark CATEGORY a source compares against, for the "you vs
 * typical" delta. Only categories that convert to a real typical-hours figure
 * are mapped; sources whose activity has no convertible benchmark are absent.
 */
const BENCHMARK_CATEGORY_BY_SOURCE: Record<string, string> = {
  // universal
  "meet-not-needed": "meetings",
  "meet-status": "meetings",
  "meet-recurring": "meetings",
  "meet-overlong": "meetings",
  "email-triage": "email-messaging",
  "chat-reply-all": "email-messaging",
  "coord-status-chase": "work-about-work",
  "coord-trackers": "work-about-work",
  "focus-tool-switch": "context-switching",
  "overdo-multitask": "context-switching",
  "focus-search": "info-search",
  "admin-data-entry": "admin-low-value",
  "admin-forms": "admin-low-value",
  // marketing
  "mkt-report-byhand": "reporting-data-pulls",
  "mkt-data-stitch": "reporting-data-pulls",
  // sales
  "sales-crm-entry": "crm-data-entry",
  "sales-double-entry": "crm-data-entry",
  "sales-lead-research": "lead-research",
  "sales-bad-leads": "lead-research",
  "sales-quote-build": "quoting-approvals",
  "sales-deal-desk": "quoting-approvals",
  "sales-asset-hunt": "info-search",
  // engineering
  "eng-tech-debt": "tech-debt",
  // software-dev
  "sdev-context-switch": "context-switching",
  "sdev-deploy-wait": "tech-debt",
  "sdev-env-setup": "tech-debt",
  // operations
  "ops-manual-process": "admin-low-value",
  "ops-report-compile": "reporting-data-pulls",
  "ops-firefighting": "firefighting",
  "ops-vendor-chase": "work-about-work",
  // finance
  "fin-reconcile": "admin-low-value",
  "fin-data-entry": "admin-low-value",
  "fin-report-reformat": "reporting-data-pulls",
  "fin-receipt-chase": "work-about-work",
  // ceo/founder
  "ceo-context-switch": "context-switching",
  "ceo-inbox-overload": "email-messaging",
  "ceo-decision-bottleneck": "work-about-work",
  // product
  "prod-firefighting": "firefighting",
  "prod-realign": "work-about-work",
  // manager
  "mgr-1on1-autopilot": "meetings",
  "mgr-ic-work": "ic-work-switching",
  "mgr-approvals": "admin-low-value",
  // design
  "design-file-admin": "admin-low-value",
  "design-export": "admin-low-value",
  // executive
  "exec-email-delegable": "email-messaging",
  "exec-decide-through-you": "work-about-work",
};

/** The benchmark category a source compares against, or undefined if none. */
export function benchmarkCategoryFor(slug: string): string | undefined {
  return BENCHMARK_CATEGORY_BY_SOURCE[slug];
}

/** Universal sources + the role's own — the pool the user picks from, deduplicated by slug. */
export function wasteSourcesForRole(role: RoleSlug): WasteSource[] {
  const roleOwned = ROLE_WASTE.filter(
    (s) => s.scope !== "universal" && (s.scope as RoleSlug[]).includes(role),
  );
  // Deduplicate by slug (safety net for any universal + role overlap)
  const seen = new Set<string>();
  const result: WasteSource[] = [];
  for (const s of [...UNIVERSAL_WASTE, ...roleOwned]) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug);
      result.push(s);
    }
  }
  return result;
}

/** A group of sources sharing one activity-area header, for the grouped intake. */
export interface WasteGroup {
  group: string;
  sources: WasteSource[];
}

/**
 * Group a flat source list by activity area and order both the groups (by
 * GROUP_ORDER) and the sources within each (input order).
 */
export function groupWasteSources(sources: WasteSource[]): WasteGroup[] {
  const byGroup = new Map<string, WasteSource[]>();
  for (const s of sources) {
    const list = byGroup.get(s.group) ?? [];
    list.push(s);
    byGroup.set(s.group, list);
  }
  const rank = (g: string) => {
    const i = (GROUP_ORDER as readonly string[]).indexOf(g);
    return i === -1 ? GROUP_ORDER.length : i;
  };
  return [...byGroup.entries()]
    .map(([group, srcs]) => ({ group, sources: srcs }))
    .sort((a, b) => rank(a.group) - rank(b.group));
}
