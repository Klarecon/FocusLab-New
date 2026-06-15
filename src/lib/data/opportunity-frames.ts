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
      "Context switching eats 40% of your productive output. Even one 90-minute deep-work block per week lets you do the thinking your busiest days never allow.",
    byRole: {
      engineering:
        "The average engineer codes only 52 minutes per day. One unbroken 2-hour block a week is enough to close that stuck PR or pay down the tech debt the team keeps deferring.",
      "software-dev":
        "Context switching costs dev teams $21,000 per developer annually. One focused coding session a week compounds into features shipped, not just tickets touched.",
      marketing:
        "62% of top B2B marketers say the key to outperforming is connecting content to business goals. 2 hours of strategy time lets you do that instead of just reacting to requests.",
      sales:
        "Consistent prospecting blocks are the #1 predictor of quota attainment. Even 2 hours a week gives you the pipeline work that fills next quarter.",
      product:
        "PMs spend only 27% of time on strategy but report they should spend 51%. Two hours of protected thinking closes that gap and sharpens every roadmap decision.",
      design:
        "Continuous, focused user testing cuts revision cycles dramatically. Two hours of weekly testing time compounds design quality in ways quarterly reviews never do.",
      "ceo-founder":
        "90% of high-performing CEOs attribute their productivity to protecting uninterrupted thinking blocks. Even 2 hours a week clarifies the direction everything else follows.",
      manager:
        "Employees who feel satisfied with their manager conversations are 81% more productive. One deep coaching session per week is the highest-leverage work you can do.",
      finance:
        "Organizations with optimized reporting spend 60% more time on strategic analysis. 2 hours a week moves you from reconciling numbers to interpreting what they mean.",
      operations:
        "Streamlined workflows reduce completion time by up to 50% \u2014 but finding the bottleneck requires unbroken focus. Two hours a week to analyze, not just firefight.",
      executive:
        "McKinsey research shows CEOs spend just 15% of time on deep thinking. Protecting even 2 hours weekly gives you the strategic clarity that cascades across the org.",
    },
  },
  {
    minHours: 3,
    maxHours: 6,
    generic:
      "That\u2019s a half-day back. USC research found that intentional time-blocking increases productivity by 50%. This is enough to finally start the thing that keeps getting pushed to \u2018next quarter.\u2019",
    byRole: {
      engineering:
        "DORA metrics show that deployment frequency and change failure rate \u2014 the things that actually drive business value \u2014 improve when engineers have time for architectural thinking, not just feature sprints.",
      "software-dev":
        "Engineering teams with protected focus time delivered 47% more features with higher code quality. A half-day a week of unbroken coding is the difference between reactive and strategic engineering.",
      marketing:
        "Organizations that invested in strategic content planning saw 80% higher marketing productivity. A half-day a week lets you design campaigns that flow instead of posting reactively.",
      sales:
        "80% of deals require 5+ follow-ups, but 44% of reps quit after one. A half-day for strategic prospecting and account research is where quota-crushing comes from.",
      product:
        "The best PMs focus on outcomes, not outputs. 5 hours a week lets you define success metrics, validate assumptions, and measure actual impact instead of just shipping.",
      design:
        "Well-maintained design systems reduce rework across entire teams. A half-day a week is enough to build the component library, do deep user research, or run real discovery.",
      "ceo-founder":
        "CEOs who dedicate structured time to strategic planning lead larger, faster-growing firms. A half-day a week for market analysis, vision, and the conversations that matter.",
      manager:
        "Management coaching shows 29% ROI in 3 months and 415% annualized ROI. A half-day a week for real development conversations with your team pays for itself many times over.",
      finance:
        "Proactive risk analysis and scenario modeling \u2014 the work that prevents financial surprises \u2014 only happens with protected focus time. A half-day weekly transforms you from reporter to strategic advisor.",
      operations:
        "Process optimization requires sustained analysis, not 15-minute check-ins. A half-day a week to map, measure, and redesign workflows delivers compounding efficiency gains.",
      executive:
        "65% of executives say meetings prevent them from completing their own work. A half-day a week reclaimed means you\u2019re steering, not just attending.",
    },
  },
  {
    minHours: 6,
    maxHours: 10,
    generic:
      "That\u2019s nearly a full day back every week. Gloria Mark\u2019s research at UC Irvine shows it takes 23 minutes to recover focus after each interruption \u2014 a full day of unbroken work lets you reach the deep flow state that fragmented days make impossible.",
    byRole: {
      engineering:
        "A full day a week for architecture, refactoring, and system design. This is 10x-impact work that only happens with sustained focus \u2014 the kind DORA metrics directly correlate with business value.",
      "software-dev":
        "Enough time to build internal tools, contribute to open source, or mentor junior devs. This is the expertise-compounding work that leads to senior and staff-level roles.",
      marketing:
        "A full content creation and strategy day. Deep market research, competitive positioning, integrated campaign design \u2014 the work that makes marketing a revenue driver, not a cost center.",
      sales:
        "A full day of selling instead of admin. Strategic account planning, territory analysis, custom pitch development for your top accounts \u2014 the work that separates quota-crushers from order-takers.",
      product:
        "A full discovery day: customer calls, data analysis, competitive research, roadmap thinking. The work that separates PMs who ship right from PMs who just ship fast.",
      design:
        "A full creative day \u2014 the kind where you do the work you actually got into design to do. User research, prototyping, design exploration, mentoring. This is career-building work.",
      "ceo-founder":
        "McKinsey found that high-performing CEOs treat deep thinking time as non-negotiable. A full day for vision, relationships, and the decisions only you can make.",
      manager:
        "Enough time to actually lead: development plans, capability gap analysis, succession planning, culture-building. This is the work that turns good managers into leaders people follow.",
      finance:
        "A full day to move from reactive reporting to proactive financial planning. Build scenario models, strategic forecasts, capital allocation recommendations. Become the CFO\u2019s strategic partner.",
      operations:
        "A full process improvement day every week. Lean methodology, bottleneck analysis, automation strategy \u2014 the ROI of this work compounds quarter over quarter.",
      executive:
        "High-performing executives balance short-term credibility with long-term vision. A full day weekly for the strategic work that creates next year\u2019s outcomes, not just this quarter\u2019s reports.",
    },
  },
  {
    minHours: 10,
    maxHours: Infinity,
    generic:
      "That\u2019s more than a full work day every week. Cal Newport\u2019s research shows expert performers max out at 3\u20134 hours of truly deep work per day \u2014 with this much freed time, you can consistently hit that ceiling and produce work that compounds.",
    byRole: {
      engineering:
        "Two full days of deep engineering a week. System redesigns, performance breakthroughs, innovation prototypes. This capacity level is what separates principal engineers from the rest.",
      "software-dev":
        "Enough to learn an entirely new stack, build and ship internal tools, or lead a technical initiative end-to-end. This is the time investment that accelerates careers.",
      marketing:
        "Enough to launch the new channel, run the experiment, build the brand strategy. This level of protected time turns a marketing team from reactive to market-leading.",
      sales:
        "10+ more hours of selling per week. At an average close rate, that\u2019s multiple additional deals per quarter \u2014 run the math on your average deal size.",
      product:
        "Enough for real strategic work: customer research programs, competitive analysis, long-term product vision. The difference between PMs who shape markets and PMs who follow backlogs.",
      design:
        "Two design sprints worth of focus time every week. This is how design-driven companies are built \u2014 with designers who have space to think, not just execute.",
      "ceo-founder":
        "Two full days a week for the work that builds enterprise value: vision-setting, key relationships, strategic bets, organizational design. Stop doing everyone else\u2019s job and start doing yours.",
      manager:
        "Enough to transform your team: coaching programs, culture rituals, strategic hiring, capability building. This is how high-performance teams are created, not just managed.",
      finance:
        "Enough for real financial modeling, scenario planning, strategic advisory, investor relations. This is the difference between a finance function and a finance partner.",
      operations:
        "Transformation-level capacity. Rebuild systems end-to-end, implement continuous improvement methodologies, design the operational infrastructure that lets the company scale.",
      executive:
        "Two full days a week for innovation, market exploration, talent strategy, and legacy thinking. This is leadership at its highest leverage.",
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
