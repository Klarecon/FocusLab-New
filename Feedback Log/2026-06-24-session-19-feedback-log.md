# Session 19 — Feedback Log (2026-06-24)

Mona's feedback this session and how each item was handled. CODE items were
shipped + tested; the big restructures are flagged as pending.

## Mockup-review workflow
| # | Feedback | Disposition |
|---|----------|-------------|
| F1 | "Make it easier to give notes per section without switching tabs; multiple note boxes within sections that have several options." | Built the inline `-REVIEW.html` note system (per-section + per-option boxes, pick-one controls, auto-save). |
| F2 | "I prefer downloading the notes as a .txt instead of copying/pasting." | Made **Download my notes (.txt)** the primary action; Claude reads the file from `~/Downloads`. |

## Merged logging step (Scene 3 + Scene 8)
| # | Feedback | Disposition |
|---|----------|-------------|
| F3 | "Why did you introduce Scene 8 (four waste types)?" | Explained: not introduced this session — inherited from Note 20; it surfaces the real `muda` taxonomy in `waste-sources.ts`. |
| F4 | "Merge Scene 8 into the logging step without making it too much text." | Built `merged-logging-step.html`: types → slim group headers + 3-word fix hint; rationale behind one affordance; "+ add your own type"; role-specific drain inline. |
| F5 | "No colored circles before each category label; keep the right-side subcopy (→ cut it or shrink it)." | Removed the dots, kept the hint. (Mockup updated.) |
| F6 | "The 'why are these grouped?' shouldn't be click-to-expand — it should be HOVER." | **Pending in real code** — to implement as a hover tooltip when the analyzer type-merge ships. Noted in PROJECT_STATE. |

## Directive: implement on the real tool
| # | Feedback | Disposition |
|---|----------|-------------|
| F7 | "Stop giving me mockups. Implement the changes on the tool. Don't ask for permissions — not even yes/no questions." | Switched to building in `src/`; shipped 3 batches to production autonomously, no permission-asking. |

## Shipped this session (CODE — live + tested)
| Item | Source note | Files | Commit |
|------|-------------|-------|--------|
| Hero eyebrow/headline/subcopy/CTA broadened past "knowledge workers" | Notes 3/4/12 + v4 | `Hero.tsx` | `dbdcb38` |
| FinalCTA de-knowledge-work + CTA matched | v4 | `FinalCTA.tsx` | `dbdcb38` |
| Remove ToolCards + BenchmarkProof from homepage | Notes 1 & 2 | `page.tsx` (+ new `HowItWorks.tsx`) | `dbdcb38` |
| Matrix emojis → 💎🦪🍒 (🐘 kept) | v4 emoji note | `solutions-logic.ts`, `EviMatrix.tsx`, `FocusTable.tsx` | `dbdcb38` |
| White Elephants "drop or delegate" → "skip these — low payoff" | Note 23 | `EviMatrix.tsx` | `dbdcb38` |
| Metadata de-knowledge-work + drop "upload your calendar" | Notes 3/4 | `layout.tsx`, `analyzer/page.tsx` | `ee47bc5` |
| Pareto minimum-5-drains hard gate + coaching | Note 15, scenes 12 & 14 | `DrilldownStep.tsx` | `7b2f614` |

## Pending (next session)
- **VISUAL/HOVER:** F6 hover tooltip (ships with the analyzer type-merge).
- **Safe polish:** Payoff math behind hover; remove blank-state Hours prompt; Payoff Magic-UI styling; over-cap copy.
- **Architectural:** analyzer four-waste-types merge (17 groups → 4 types, touches store + Pareto funnel); focus inline-scoring merge; hero 50–70%-vs-10hrs reconcile.
