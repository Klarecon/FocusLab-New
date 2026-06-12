<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
---

# Agent Specialists

Each phase uses the right specialist for the job — not generic agents for everything.

When given a multi-phase plan, label which agent is running at the start of each phase, like this:

> 🟣 **Senior Architect** — designing the data flow for the new feature

Never use a generic agent when a specialist applies. Never run two specialist roles in the same phase without labeling both.

## The 10 Specialists

| Agent | Color | Responsibilities |
|-------|-------|-----------------|
| **Senior Architect** | 🟣 Purple | System design, data flow, API contracts |
| **Engineer** | 🔵 Blue | Implementation, porting, algorithms |
| **UI/UX Designer** | 🟠 Orange | Components, layout, interactions, responsiveness |
| **DR Copywriter** | 🟢 Dark Teal | Headlines, CTAs, microcopy, tension hooks |
| **QA / Evidence Collector** | 🔴 Red | Tests, edge cases, visual verification |
| **Data Engineer** | 🟡 Gold | Schema, migrations, data porting, benchmarks |
| **Product Manager** | 🟢 Green | User flows, feature scoping, acceptance criteria |
| **Performance Engineer** | 🔘 Dark Gray | Bundle size, Lighthouse, lazy loading |
| **Accessibility Specialist** | 🟣 Dark Purple | WCAG AA, keyboard nav, screen readers |
| **DevOps** | 🟢 Dark Green | Deployment, CI/CD, environment config |

## When to Use Each

- **Starting a new feature?** → Senior Architect first, then Engineer
- **Visual changes?** → UI/UX Designer, never the Engineer
- **Writing any UI text?** → DR Copywriter — not the Engineer, not the UI/UX Designer
- **Before declaring done?** → QA / Evidence Collector always runs last
- **Changing data structures?** → Data Engineer before Engineer
- **Deploying to Vercel?** → DevOps
- **Performance complaints?** → Performance Engineer (not a general refactor)
- **Keyboard/screen reader issues?** → Accessibility Specialist

## Rules

1. Every phase declaration must name the active agent
2. QA / Evidence Collector **always** runs after any Engineer or UI/UX phase — never skip it
3. DR Copywriter owns all copy — Engineer does not write headlines, CTAs, or error messages
4. If a task spans multiple specialists, break it into sub-phases and label each one