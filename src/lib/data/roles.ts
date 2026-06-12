import type { RoleSlug } from "./benchmarks";

/**
 * The seven selectable lenses, one shared Pareto engine behind each.
 * `slug` MUST match the engine `RoleSlug` union.
 *
 * `leak` is illustrative landing copy (where this role's week tends to drain),
 * NOT a sourced benchmark claim. Real numbers come from the audit + the
 * verified benchmark library.
 */
export interface RoleLens {
  slug: RoleSlug;
  label: string;
  /** one-line hook: where this role's hours quietly go */
  leak: string;
  /** Emoji for UI display */
  emoji: string;
}

export const ROLE_LENSES: readonly RoleLens[] = [
  {
    slug: "marketing",
    label: "Marketing",
    leak: "Reporting, approvals, and channel busywork.",
    emoji: "\u{1F4CA}", // 📊
  },
  {
    slug: "sales",
    label: "Sales & CS",
    leak: "CRM admin, handoffs, and low-intent calls.",
    emoji: "\u{1F4DE}", // 📞
  },
  {
    slug: "engineering",
    label: "Engineering",
    leak: "Context switching, reviews, and broken builds.",
    emoji: "\u{1F4BB}", // 💻
  },
  {
    slug: "product",
    label: "Product",
    leak: "Status meetings, specs, and stakeholder pings.",
    emoji: "\u{1F4CB}", // 📋
  },
  {
    slug: "design",
    label: "Design",
    leak: "Rounds of revisions, file wrangling, and sync.",
    emoji: "\u{1F3A8}", // 🎨
  },
  {
    slug: "manager",
    label: "Manager",
    leak: "Back-to-back meetings and unblocking others.",
    emoji: "\u{1F465}", // 👥
  },
  {
    slug: "executive",
    label: "Executive",
    leak: "Calendar gravity, escalations, and inbox triage.",
    emoji: "\u{1F451}", // 👑
  },
] as const;

export function roleLensBySlug(slug: RoleSlug): RoleLens | undefined {
  return ROLE_LENSES.find((r) => r.slug === slug);
}
