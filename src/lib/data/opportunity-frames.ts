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
    generic: "That\u2019s enough for a weekly deep-work block \u2014 the kind where real progress happens.",
    byRole: {
      engineering: "That\u2019s one focused coding session a week without interruptions \u2014 enough to ship a feature.",
      "software-dev": "That\u2019s one unbroken coding block \u2014 enough to close the PR that\u2019s been stuck.",
      marketing: "That\u2019s one creative session a week to work on the campaign idea you\u2019ve been sitting on.",
      sales: "That\u2019s 2\u20133 more quality prospect conversations every week.",
      product: "That\u2019s one protected strategy session to think about what\u2019s next, not what\u2019s broken.",
      design: "That\u2019s one exploration session where you sketch without a brief breathing down your neck.",
      "ceo-founder": "That\u2019s one weekly block to think about where the company is going, not just what\u2019s on fire.",
      manager: "That\u2019s one coaching session you keep cancelling because \u2018something came up.\u2019",
      finance: "That\u2019s time to build the dashboard your CFO keeps asking about.",
      operations: "That\u2019s time to document the process that only lives in your head.",
    },
  },
  {
    minHours: 3,
    maxHours: 6,
    generic: "That\u2019s a half-day back every week. Enough to start the initiative you know could get you a bonus this quarter.",
    byRole: {
      engineering: "That\u2019s enough to tackle tech debt that\u2019s been slowing the whole team for months.",
      "software-dev": "That\u2019s a full afternoon to refactor, learn a new tool, or mentor a junior dev.",
      marketing: "That\u2019s enough to run the A/B test you\u2019ve been \u2018meaning to get to\u2019 for weeks.",
      sales: "That\u2019s a full pipeline-building session \u2014 the kind that fills next quarter.",
      product: "That\u2019s enough to do real user research instead of guessing what customers want.",
      design: "That\u2019s enough to build the component library the team has been begging for.",
      "ceo-founder": "That\u2019s time to have the strategic conversations that actually move the needle on your next milestone.",
      manager: "That\u2019s a full afternoon for the strategic work that got you promoted \u2014 not the admin that followed.",
      finance: "That\u2019s enough to automate one report that currently takes a whole day every month.",
      operations: "That\u2019s time to build the SOPs that would let you actually take a vacation.",
    },
  },
  {
    minHours: 6,
    maxHours: 10,
    generic: "That\u2019s almost a full day back every week \u2014 like going from a 5-day grind to a 4-day week of real work.",
    byRole: {
      engineering: "That\u2019s a full day for architecture work, learning, or the side project that could become a product feature.",
      "software-dev": "That\u2019s enough to contribute to open source, prep for a conference talk, or build internal tooling.",
      marketing: "That\u2019s a content creation day \u2014 the one you need to stop being reactive and start being strategic.",
      sales: "That\u2019s an entire day of selling instead of admin. At your close rate, that\u2019s real revenue.",
      product: "That\u2019s a full discovery day \u2014 customer calls, data analysis, and roadmap thinking without Slack interrupting.",
      design: "That\u2019s a full creative day. The kind where you do the work you actually got into design to do.",
      "ceo-founder": "That\u2019s a full day for the work only you can do \u2014 vision, relationships, the decisions no one else will make.",
      manager: "That\u2019s enough to be a real leader instead of a human router for other people\u2019s problems.",
      finance: "That\u2019s enough time to move from reactive reporting to proactive financial planning.",
      operations: "That\u2019s a full process improvement day every week \u2014 the ROI compounds fast.",
    },
  },
  {
    minHours: 10,
    maxHours: Infinity,
    generic: "That\u2019s more than a full work day every week \u2014 you\u2019re essentially getting a sixth day of productive time.",
    byRole: {
      engineering: "That\u2019s two full days of focused engineering. Most teams would kill for that kind of capacity.",
      "software-dev": "That\u2019s enough to learn an entirely new stack, or ship the internal tool everyone wishes existed.",
      marketing: "That\u2019s enough to launch the channel or campaign you keep putting off because \u2018there\u2019s no bandwidth.\u2019",
      sales: "That\u2019s 10+ more hours of selling per week. Do the math on your average deal size.",
      product: "That\u2019s enough to actually be strategic. Customer research, competitor analysis, long-term planning \u2014 all the stuff that gets squeezed out.",
      design: "That\u2019s two design sprints worth of focus time every single week.",
      "ceo-founder": "That\u2019s two full days a week for the work that actually builds enterprise value. Stop doing everyone else\u2019s job.",
      manager: "That\u2019s enough to transform your team\u2019s culture \u2014 coaching, 1:1s, strategy \u2014 the stuff that gets results.",
      finance: "That\u2019s enough to build real financial models and scenario plans, not just reconcile last month.",
      operations: "That\u2019s a transformation-level capacity unlock. Use it to rebuild the system, not just patch it.",
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
