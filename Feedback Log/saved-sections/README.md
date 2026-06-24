# Saved Sections — Reuse Archive

These are full copies of homepage sections that were **removed** during the Session 18 Oren-redesign pass, saved here so they can be pulled back and reused later.

| File | What it was | Live location before removal | Why removed |
|------|-------------|------------------------------|-------------|
| `ToolCards.tsx.saved` | "Two tools. One mission." — the two-column Pareto Analyzer / Focus Table & EVI Matrix cards | `src/components/landing/ToolCards.tsx`, rendered in `src/app/page.tsx` | Feedback Note 1 — remove from homepage, but keep recoverable |
| `BenchmarkProof.tsx.saved` | "This isn't guesswork. 🔬 / Our benchmarks come from real research — not folklore." | `src/components/landing/BenchmarkProof.tsx`, rendered in `src/app/page.tsx` | Feedback Note 2 — "not adding value, sounds too AI" |

## How to restore one
1. Copy the `.saved` file back to `src/components/landing/<Name>.tsx` (drop the `.saved`).
2. Re-add its import + `<Component />` in `src/app/page.tsx`.
3. Run `npx vitest --run` to confirm nothing else depends on its removal.

Saved 2026-06-24.
