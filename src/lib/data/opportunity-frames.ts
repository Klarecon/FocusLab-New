// Research-backed opportunity frames: what knowledge workers can DO with reclaimed time.
//
// Sources: Cal Newport (Deep Work), Gloria Mark (UC Irvine attention research),
// Microsoft Work Trend Index 2025, McKinsey CEO research, HBR high-performer studies,
// DORA engineering metrics, Pendo PM time allocation, HubSpot sales benchmarks,
// ATD management coaching ROI, UserTesting design iteration research.
//
// Key finding: context switching costs 40% productivity (APA). Engineers code only
// 52 min/day on average (Read.ai). 90-120 min unbroken blocks are neurologically
// optimal for deep work (Cal Newport + USC study).

export interface OpportunityFrame {
  minHours: number;
  maxHours: number;
  generic: string;
  byRole: Partial<Record<string, string>>;
}

export const OPPORTUNITY_FRAMES: OpportunityFrame[] = [
  {
    minHours: 1,
    maxHours: 3,
    generic:
      "Tiny time wins feel pointless until you protect them. One unbroken block a week is enough to actually finish what keeps getting interrupted.",
    byRole: {
      engineering:
        "That\u2019s your code review backlog, finally cleared. The kind of morning where PRs actually ship instead of pile up.",
      "software-dev":
        "That\u2019s one real coding session where you actually finish something instead of just starting it between meetings.",
      marketing:
        "That\u2019s the campaign brief you keep rewriting in 10-minute bursts. One protected block and it\u2019s done \u2014 properly.",
      sales:
        "That\u2019s your prospecting block back. The one that fills next quarter\u2019s pipeline instead of just this week\u2019s call log.",
      product:
        "That\u2019s your weekly customer call you keep canceling. Actually talk to users instead of reading Slack recaps about them.",
      design:
        "That\u2019s one real design exploration instead of another rushed iteration. The kind of thinking that stops the revision cycle.",
      "ceo-founder":
        "That\u2019s your thinking time back \u2014 the kind where you actually set direction instead of just reacting to whatever\u2019s loudest.",
      manager:
        "That\u2019s one real coaching conversation per week that isn\u2019t a status check. The kind where your team actually tells you what they need.",
      finance:
        "That\u2019s two hours of reading the numbers instead of just assembling them. The shift from reporter to advisor starts here.",
      operations:
        "That\u2019s the process review you keep deferring. Two hours to find the bottleneck instead of just working around it again.",
      executive:
        "That\u2019s the strategic block your calendar keeps eating. Protect it and you\u2019re steering, not just attending.",
    },
  },
  {
    minHours: 3,
    maxHours: 6,
    generic:
      "That\u2019s a half-day back. Enough to finally start the thing that keeps getting pushed to \u2018next quarter.\u2019",
    byRole: {
      engineering:
        "A half-day a week for the architecture work that never happens between sprints. The kind that makes next quarter\u2019s features possible.",
      "software-dev":
        "A half-day of unbroken coding. Not \u201C30 minutes between meetings\u201D \u2014 actual flow state where features get shipped, not just touched.",
      marketing:
        "A half-day to design campaigns that flow instead of firefighting the next post. Strategy time is how marketing becomes a revenue driver.",
      sales:
        "A half-day of real selling instead of CRM admin. Account research, custom pitches, the follow-ups that actually close deals.",
      product:
        "A half-day for discovery: customer calls, data analysis, competitive research. The work that separates shipping right from just shipping fast.",
      design:
        "A half-day for the work you got into design to do. User research, prototyping, exploration \u2014 not just executing tickets.",
      "ceo-founder":
        "A half-day for market analysis, vision, and the conversations that actually matter. The kind of time that makes the rest of your week sharper.",
      manager:
        "A half-day for real development conversations with your team. Not status checks \u2014 the coaching that changes how people work.",
      finance:
        "A half-day for scenario modeling and risk analysis \u2014 the work that prevents financial surprises instead of explaining them after.",
      operations:
        "A half-day to map, measure, and redesign workflows. Process optimization only happens with sustained focus, not 15-minute check-ins.",
      executive:
        "A half-day reclaimed means you\u2019re steering, not just attending. The strategic work that creates next year\u2019s outcomes.",
    },
  },
  {
    minHours: 6,
    maxHours: 10,
    generic:
      "That\u2019s nearly a full day back every week. A full day of unbroken work lets you reach the deep flow state that fragmented days make impossible.",
    byRole: {
      engineering:
        "A full day for architecture, refactoring, and system design. The 10x-impact work that only happens with sustained focus.",
      "software-dev":
        "A full day to build the internal tools, mentor the junior dev, or tackle that refactor everyone\u2019s been avoiding. Career-building work.",
      marketing:
        "A full content creation and strategy day. The kind where you build integrated campaigns, not just react to requests.",
      sales:
        "A full day of selling. Strategic account planning, territory analysis, custom pitches \u2014 the work that separates quota-crushers from order-takers.",
      product:
        "A full discovery day: customer calls, data deep-dives, roadmap thinking. The work that makes your next quarter\u2019s bets actually informed.",
      design:
        "A full creative day \u2014 user research, prototyping, mentoring. This is career-building work, not just ticket-clearing.",
      "ceo-founder":
        "A full day for vision, relationships, and the decisions only you can make. The non-negotiable block that high-performing founders protect.",
      manager:
        "Enough time to actually lead: development plans, capability gaps, succession planning. The work that turns managers into leaders people follow.",
      finance:
        "A full day for proactive financial planning. Scenario models, strategic forecasts \u2014 the work that makes you the CFO\u2019s partner, not their assistant.",
      operations:
        "A full process improvement day. Lean methodology, bottleneck analysis, automation strategy \u2014 compounding ROI every quarter.",
      executive:
        "A full day for the strategic work that builds next year. Vision, key relationships, organizational design \u2014 not just this quarter\u2019s reports.",
    },
  },
  {
    minHours: 10,
    maxHours: Infinity,
    generic:
      "That\u2019s more than a full work day every week. This much protected time lets you consistently do the deep work that compounds \u2014 the kind that changes trajectories, not just to-do lists.",
    byRole: {
      engineering:
        "Two full days of deep engineering. System redesigns, performance breakthroughs, innovation prototypes. This is what separates principal engineers from the rest.",
      "software-dev":
        "Enough to learn a new stack, build and ship internal tools, or lead a technical initiative end-to-end. The time investment that accelerates careers.",
      marketing:
        "Enough to launch the new channel, run the experiment, build the brand strategy. This is how reactive teams become market-leading ones.",
      sales:
        "10+ more hours of selling per week. At your close rate, that\u2019s multiple additional deals per quarter. Run the math.",
      product:
        "Enough for real strategic work: customer research programs, competitive analysis, long-term vision. The difference between shaping markets and following backlogs.",
      design:
        "Two design sprints of focus time every week. This is how design-driven companies are built \u2014 with designers who have space to think.",
      "ceo-founder":
        "Two full days for the work that builds enterprise value: vision, key relationships, strategic bets. Stop doing everyone else\u2019s job and start doing yours.",
      manager:
        "Enough to transform your team: coaching programs, culture rituals, strategic hiring. How high-performance teams are created, not just managed.",
      finance:
        "Enough for real financial modeling, scenario planning, and strategic advisory. The difference between a finance function and a finance partner.",
      operations:
        "Transformation-level capacity. Rebuild systems end-to-end, implement continuous improvement, design the infrastructure that lets the company scale.",
      executive:
        "Two full days a week for innovation, talent strategy, and legacy thinking. Leadership at its highest leverage.",
    },
  },
];

export function getOpportunityFrame(
  reclaimedHoursPerWeek: number,
  roleSlug?: string | null,
): { generic: string; roleSpecific: string | null } {
  const frame = OPPORTUNITY_FRAMES.find(
    (f) => reclaimedHoursPerWeek >= f.minHours && reclaimedHoursPerWeek < f.maxHours,
  );
  if (!frame) return { generic: "", roleSpecific: null };
  return {
    generic: frame.generic,
    roleSpecific: roleSlug ? (frame.byRole[roleSlug] ?? null) : null,
  };
}
