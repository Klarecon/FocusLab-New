#!/usr/bin/env node
/**
 * FocusLab — ClickUp launch board setup.
 *
 * Builds the whole Q3 launch board via the ClickUp REST API:
 *   Space: "FocusLab Launch — Q3 2026"
 *     Folder 🟢 SAFE — Start Now (No-Regrets)   → build no matter which decisions we make
 *     Folder 🟡 DECISIONS TO LOCK (with Oren)    → the dials we turn at the end
 *   Every task carries a checklist of verifiable steps.
 *
 * Auth: reads CLICKUP_TOKEN from the environment or from ../../.env.local
 * Run:  node scripts/clickup/setup.mjs
 *
 * It writes scripts/clickup/task-map.json — a { taskKey: taskId } map used later
 * by done.mjs to mark tasks complete as we finish them.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = "https://api.clickup.com/api/v2";

// ---- token ---------------------------------------------------------------
function loadToken() {
  if (process.env.CLICKUP_TOKEN) return process.env.CLICKUP_TOKEN.trim();
  try {
    const env = readFileSync(join(__dirname, "..", "..", ".env.local"), "utf8");
    const m = env.match(/^CLICKUP_TOKEN\s*=\s*(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  throw new Error("CLICKUP_TOKEN not found. Add it to .env.local or export it.");
}
const TOKEN = loadToken();

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${res.statusText}\n${text}`);
  }
  return json;
}

// ---- task data -----------------------------------------------------------
// meta line shown at top of each task's description.
const T = (key, name, owner, effort, block, desc, checklist) =>
  ({ key, name, owner, effort, block, desc, checklist });

const SAFE_FOLDER = "🟢 SAFE — Start Now (No-Regrets)";
const DECISION_FOLDER = "🟡 DECISIONS TO LOCK (with Oren)";

const SAFE_LISTS = [
  {
    name: "A1 · Accounts & Persistence",
    tasks: [
      T("A1-T1", "Stand up Supabase project + schema", "Mona", "½ day", "🔴 Blocks",
        "Create the Supabase project and the tables for users, plans, entitlements.",
        ["Create Supabase project; save URL + anon + service-role keys to .env.local + Vercel env (never commit)",
         "Add key names to .env.example as empty placeholders",
         "profiles table (id → auth.users, email, created_at)",
         "plans table (id, user_id FK, payload JSONB, updated_at)",
         "entitlements table (user_id FK, tier, status, current_period_end)",
         "Enable Row Level Security + own-rows-only policies",
         "Commit docs/supabase-schema.sql snapshot (no secrets)"]),
      T("A1-T2", "Auth: magic-link (+ optional Google)", "Mona", "1 day", "🔴 Blocks",
        "Wire Supabase Auth: sign in with a magic-link email.",
        ["Install @supabase/supabase-js + @supabase/ssr; browser + server client helpers",
         "Sign-in screen (pink #c4186a CTA, Fraunces header, Jakarta body)",
         "Magic-link callback route sets the session cookie",
         "Optional Google OAuth behind a config flag",
         "useUser() hook; show signed-in email + sign-out in header",
         "Tests: signed-out vs signed-in render; callback sets session",
         "Verify tsc + vitest green (no regression on 353)"]),
      T("A1-T3", "Persist plans to Supabase (replace localStorage as truth)", "Mona", "1 day", "🔴 Blocks",
        "Save/load the plan to the user's Supabase row instead of Zustand-persist.",
        ["savePlanToCloud() / loadPlanFromCloud() store actions",
         "Debounced autosave on edits — Zustand cache, Supabase truth",
         "On login, hydrate store from cloud plan if present",
         "Keep window.__* OUT (hook check #4)",
         "Offline/error: retry + non-blocking toast, never lose edits",
         "Tests: round-trip JSONB shape rehydrates ParetoResult identically",
         "Verify: edit → clear storage → reload → restored from cloud"]),
      T("A1-T4", "\"Claim your saved plan\" migration for anonymous users", "Mona", "½ day", "🔴 Blocks",
        "On first signup, migrate the existing local plan into the new account.",
        ["Detect local plan + just-authenticated user with no cloud plan",
         "\"We found your saved plan — claim it?\" prompt (pink CTA)",
         "Upload local payload; mark migrated (no re-prompt loop)",
         "Conflict rule: keep cloud, offer explicit \"replace with local\"",
         "Tests: identical migration; no double-migration; conflict path",
         "Manual QA: anon run → build plan → sign up → claimed intact"]),
    ],
  },
  {
    name: "A2 · Billing & Paywall (machinery)",
    tasks: [
      T("A2-T1", "Lemon Squeezy sandbox setup + products", "Mona (Oren advises price)", "½ day", "🔴 Blocks",
        "Sandbox store + both plan variants. NOTE: the final price NUMBER is a decision (see Decisions folder); build both plans regardless.",
        ["Create LS sandbox store; API key + store ID to env",
         "Create variants: Free, Monthly, Yearly (both plans exist)",
         "Generate webhook signing secret; store in env",
         "Document env var names in .env.example",
         "Confirm test-card flow works in sandbox manually"]),
      T("A2-T2", "Checkout: single-email hosted checkout", "Mona", "½ day", "🔴 Blocks",
        "LS checkout prefilled with the already-captured email — never ask twice.",
        ["Read the one captured email; prefill LS checkout[email]",
         "Pass custom.user_id so the webhook maps payment → user",
         "Plan selector (Monthly/Yearly toggle) → hosted checkout (pink)",
         "Assert one email source, never re-prompted",
         "Tests: checkout URL has prefilled email + user_id",
         "Manual: click buy → LS opens with email prefilled"]),
      T("A2-T3", "Webhook: payment succeeded → unlock user", "Mona", "1 day", "🔴 Blocks",
        "Verified LS webhook flips the user's entitlement to paid.",
        ["/api/webhooks/lemonsqueezy; verify HMAC signature",
         "order/subscription created + payment success → upsert entitlements",
         "cancelled / expired → downgrade to free",
         "Idempotency: dedupe by LS event/order id",
         "Map via custom.user_id; fallback match by email",
         "Tests: signed unlocks; bad sig 401; duplicate no-ops; cancel downgrades",
         "Verify: sandbox purchase → entitlement active in seconds"]),
      T("A2-T4", "Paywall gate on the Focus Table", "Mona", "½ day", "🔴 Blocks",
        "Gate /focus behind entitlement. Paywall ONLY here — never on /analyzer. Invariant across A/B.",
        ["Server-check entitlement before /focus; unpaid → paywall",
         "Paywall: value recap + Monthly/Yearly buttons (pink), human emoji",
         "Paid user → table renders immediately",
         "Real-time/poll unlock so just-paid user advances w/o refresh",
         "Tests: unpaid blocked, paid allowed, flip re-renders access",
         "Verify: pre-commit hook passes all 11 checks"]),
      T("A2-T5", "End-to-end sandbox proof + live-swap runbook", "Mona (Oren: live acct)", "½ day", "🔴 Blocks",
        "Prove stranger → pay → unlock end-to-end. This is KR 1.1.",
        ["Full run on deployed preview: analyzer → email gate → checkout (test card) → webhook → /focus unlocked",
         "Confirm plan persists to that account after payment",
         "Screen-record the passing run (KR 1.1 evidence)",
         "Write docs/go-live-lemonsqueezy.md (sandbox→live swap steps)",
         "Playwright coverage of the gate transition where feasible"]),
    ],
  },
  {
    name: "A3 · Return Loop",
    tasks: [
      T("A3-T1", "Snapshot on plan completion", "Mona", "½ day", "🟢 No-block",
        "Timestamped snapshot of key metrics each time a plan/assessment completes.",
        ["snapshots table (user_id, taken_at, metrics JSONB)",
         "Write a snapshot on Analyzer completion + on plan save",
         "Tests: snapshot shape + values match ParetoResult",
         "Verify snapshots accumulate (no overwrite)"]),
      T("A3-T2", "Monthly re-assessment prompt", "Mona · Content (copy)", "½ day", "🟢 No-block",
        "Invite the user to re-run the Analyzer ~monthly. (Compress to 1-week for cohort #1 — see validation doc.)",
        ["\"Due for re-assessment\" from last snapshot (default 30d, config)",
         "Dashboard nudge / re-run CTA (pink) when due",
         "Re-run reuses account; produces a new snapshot",
         "Content: nudge copy (warm/direct, no \"free\")",
         "Tests: due-date logic true after interval, false before"]),
      T("A3-T3", "Before/after progress view (minimal)", "Mona · Content (labels)", "1 day", "🟢 No-block",
        "First vs latest snapshot — hours reclaimed + top-source movement.",
        ["Before/after component: baseline vs latest, deltas",
         "Positive deltas in pink #c4186a (never green)",
         "Empty state for single-snapshot users",
         "Content: before/after headline + labels",
         "Tests: delta math; empty state; pink-not-green grep",
         "Screenshot verify via Playwright and READ the images"]),
      T("A3-T4", "Instrument organic vs. prompted return (separately)", "Mona", "½ day", "🟢 No-block",
        "The one build detail the retention agent insisted on — needed to read conviction.",
        ["Tag each 2nd session as organic vs. email-prompted",
         "Track Focus Table actions taken + plan revisits per user",
         "Expose in analytics so D7/D14 organic-return is readable",
         "Tests: event fires with correct organic/prompted flag"]),
    ],
  },
  {
    name: "A4 · Trust & Polish",
    tasks: [
      T("A4-T3", "Email gate with movable-position config flag", "Mona · Content (copy)", "½ day", "🔴 Blocks",
        "One email capture, position-configurable. THIS is what lets us A/B without choosing. Feeds auth AND checkout.",
        ["EMAIL_GATE_POSITION config flag (serves both A/B variants, one build)",
         "Captured email = single source for auth + checkout (no 2nd/3rd ask)",
         "Paywall stays ONLY on Focus Table regardless of gate position",
         "Content: email-gate headline + subcopy (warm/direct, no \"free\")",
         "Tests: flag moves position; email reused downstream; consent required",
         "Verify both variant positions render correctly"]),
      T("A4-T1", "Privacy policy + terms + consent notice", "Content (draft) · Mona (integrate)", "½ day", "🔴 Blocks",
        "Publish privacy/terms + consent, shipped in the SAME release as email capture.",
        ["Content: privacy + terms copy (Supabase, LS, email, analytics)",
         "/privacy + /terms pages (Fraunces/Jakarta, on-palette)",
         "Consent checkbox/notice at the email gate linking both",
         "Footer links site-wide",
         "Tests: routes render; gate blocks until consent given",
         "Verify pages live on deployed URL"]),
      T("A4-T4", "Funnel analytics (visit→start→complete→email→pay)", "Mona", "½ day", "🔴 Blocks",
        "The measuring instrument. Without this NO decision can be made. Quarantine paid vs PH/Reddit/network traffic.",
        ["Add analytics (Vercel/Plausible/PostHog); keys in env",
         "Fire: visit · analyzer_start · analyzer_complete · email_captured · payment_success",
         "Separate UTM buckets: cold-paid vs PH vs Reddit vs network",
         "payment_success from webhook/return, deduped",
         "Tests: event helper called at each step",
         "Verify on deployed site: all 5 events in dashboard"]),
      T("A4-T5", "Custom domain", "Mona (Oren if he owns DNS)", "½ day", "🔴 Blocks",
        "Connect the production custom domain to Vercel.",
        ["Add domain in Vercel; configure DNS (A/CNAME)",
         "Verify SSL + HTTPS forced",
         "Update LS return + Supabase redirect + magic-link callback URLs",
         "Update webhook URL to custom domain in LS",
         "Smoke test full flow on the custom domain"]),
      T("A4-T2", "Benchmark \"source of truth\" one-pager", "Content (Mona reviews)", "½ day", "🟢 No-block",
        "Public one-pager: where the Analyzer's benchmark numbers come from.",
        ["Content: compile sources/citations per waste-source figure",
         "/methodology page or linked doc",
         "Cross-check figures against static TS benchmark data",
         "Link from Analyzer results",
         "Tests: page renders; a spot-check figure matches the constant"]),
    ],
  },
  {
    name: "B · Content & Community",
    tasks: [
      T("B-T1", "Product Hunt launch kit", "Content · Mona approves", "2 days", "🔴 Blocks launch",
        "Everything to launch on PH the same week as Reddit.",
        ["Tagline + description (warm/direct, no \"free\", consistent time claims)",
         "Gallery images / aha-moment screenshots (on-palette, real UI)",
         "Maker's first comment (story + ask)",
         "Line up a hunter (or self-hunt) + notify supporters",
         "Demo GIF/video of analyzer → aha",
         "Mona review + sign-off"]),
      T("B-T2", "Reddit drafts (value-first, real user language)", "Content · Mona approves", "1.5 days", "🔴 Blocks launch",
        "Non-spammy posts that lead with value, per subreddit.",
        ["Identify 3–4 subreddits + read each self-promo rule",
         "Value-first post per subreddit (use reddit-pain-miner phrasing)",
         "Lead with the insight, link second",
         "Prep responses to likely objections",
         "Mona review + sign-off"]),
      T("B-T3", "Nurture email sequence (non-buyers)", "Content · Mona approves", "1.5 days", "🟢 No-block (needed early Aug)",
        "5–7 emails over 14 days re-selling the Focus Table to captured-but-unpaid leads.",
        ["Map the 5–7 email arc (reinforce waste → show fix → annual anchor)",
         "Write each email (warm/direct, no \"free\")",
         "Wire to email tool (trigger on email_captured, stop on payment)",
         "Annual anchor framed vs the hours they saw wasted",
         "Mona review + sign-off"]),
      T("B-T4", "\"Share your result\" loop asset", "Content · Mona (light build)", "1 day", "🟢 No-block",
        "Shareable result so launch traffic recruits more — de-risks the traffic assumption.",
        ["Shareable result card (on-palette, aha number front and center)",
         "\"Share your result\" CTA on results screen",
         "Copy for the share prompt (warm/direct)",
         "Mona review + sign-off"]),
    ],
  },
  {
    name: "Launch Week",
    tasks: [
      T("L-T1", "Go-live: plug in Oren's account + smoke test", "Oren + Mona", "1 hr", "🔴 Blocks",
        "The final ~30-min swap. This is KR 1.3.",
        ["Follow docs/go-live-lemonsqueezy.md: swap sandbox → live keys",
         "Update live webhook URL + variant IDs",
         "One real transaction → confirm unlock → refund it",
         "Final smoke test on the custom domain"]),
      T("L-T2", "Launch: Product Hunt + Reddit same week", "Mona + Content", "launch day", "🔴 KR 1.5",
        "Execute the launch runbook.",
        ["Schedule PH post (12:01am PT); post maker's first comment",
         "Publish Reddit posts per subreddit (staggered)",
         "Notify supporters to engage early",
         "Respond to every comment within the hour, all day",
         "Share own network / channels"]),
      T("L-T3", "War room: monitor & kill P0s", "Mona", "ongoing", "🔴 KR 1.6",
        "No checkout-blocking or data-loss bug open >4 hours.",
        ["Watch error logs + webhook success rate live",
         "Watch funnel dashboard (visit→start→complete→email→pay)",
         "Triage P0 immediately; hotfix + vercel --prod + verify alias",
         "Log every customer question/objection for the feedback log"]),
      T("L-T4", "Interview every buyer AND every canceller", "Mona", "ongoing", "🟢 No-block (highest-yield)",
        "The highest-yield work of the quarter — how you read conviction.",
        ["15-min call offer to every buyer + every canceller",
         "Buyers: why paid, do you keep it at renewal framing",
         "Cancellers: what was missing (they tell the truth buyers won't)",
         "Log \"specific renewal reason\" vs \"polite yes\" per interview"]),
    ],
  },
];

const DECISION_TASKS = [
  T("D1", "Lock the price (& annual-first?)", "Mona + Oren", "decision", "🟡 Decision",
    "Validation doc recommends $39/$290 annual-first over $29/$199. Blocks going live, NOT the build.",
    ["Review the 60-day validation doc recommendation",
     "Decide: annual-first as the default toggle? (yes/no)",
     "Set final monthly price",
     "Set final annual price",
     "Update the LS products with the locked numbers",
     "Update the OKR doc hypothesis to match"]),
  T("D2", "Choose funnel gate position / A-B plan", "Mona", "decision", "🟡 Decision",
    "Both variants are built (movable flag). This only decides the campaign wiring.",
    ["Decide: ship Variant A, Variant B, or run both as A/B",
     "Set EMAIL_GATE_POSITION default",
     "Define the two ad links (?v=a / ?v=b) if running both",
     "Confirm paywall stays only on Focus Table (invariant)"]),
  T("D3", "Set MRR & customer targets (with Oren)", "Mona + Oren", "decision", "🟡 Decision",
    "The [CONFIRM] numbers from the OKR doc.",
    ["Confirm the launch-week traffic assumption (~1,500?)",
     "Set customer floor / target / stretch (8 / 15 / 25?)",
     "Set the MRR target ($375?)",
     "Agree: score pure MRR or also report prepaid annual cash",
     "Confirm conversion targets (12% capture · 3% email→paid · 0.5% blended)"]),
  T("D4", "Set the September ad budget", "Mona + Oren", "decision", "🟡 Decision",
    "Directional (~$1,500) vs conclusive (~$5k+). Real money decision.",
    ["Decide September paid-ads budget",
     "Confirm expectation: directional read vs statistically conclusive",
     "Confirm the CAC bar ($60?) against the LTV assumption ($150–230)"]),
  T("D5", "Decide the $4k money-math test timing", "Mona + Oren", "decision", "🟡 Decision",
    "Validation doc: pull the $4k cold-ad test forward into August, right after launch.",
    ["Decide: run the $4k / 21-day cold-ad test in August? (yes/no)",
     "Confirm the day-5 / $1k kill gate (<6% email capture → stop)",
     "Confirm channel quarantine (cold-paid bucket only for money math)"]),
  T("D6", "Oren action items (line up now)", "Oren", "parallel", "🟡 Decision",
    "Neither blocks the build, but both are needed by the end.",
    ["Create the live Lemon Squeezy account now (plugged in at the end)",
     "Confirm who owns the custom domain / DNS",
     "Confirm the one-time dev review of the billing/auth layer (recommended)"]),
];

// ---- build ---------------------------------------------------------------
async function findTeam() {
  const { teams } = await api("GET", "/team");
  if (!teams?.length) throw new Error("No ClickUp workspaces found for this token.");
  const wanted = process.env.CLICKUP_WORKSPACE?.toLowerCase();
  const team = wanted ? teams.find((t) => t.name.toLowerCase().includes(wanted)) : teams[0];
  if (!team) throw new Error(`Workspace "${process.env.CLICKUP_WORKSPACE}" not found. Available: ${teams.map((t) => t.name).join(", ")}`);
  console.log(`• Workspace: ${team.name} (${team.id})`);
  return team.id;
}

async function makeTask(listId, t) {
  const desc = `**${t.owner}** · ⏱ ${t.effort} · ${t.block}\n\n${t.desc}`;
  const task = await api("POST", `/list/${listId}/task`, { name: `[${t.key}] ${t.name}`, description: desc });
  const checklist = await api("POST", `/task/${task.id}/checklist`, { name: "Steps" });
  const clId = checklist.checklist.id;
  for (const item of t.checklist) {
    await api("POST", `/checklist/${clId}/checklist_item`, { name: item });
  }
  console.log(`    ✓ ${t.key}  (${t.checklist.length} steps)`);
  return task.id;
}

async function main() {
  const teamId = await findTeam();
  const map = {};

  console.log(`• Creating space…`);
  const space = await api("POST", `/team/${teamId}/space`, {
    name: "FocusLab Launch — Q3 2026",
    multiple_assignees: true,
    features: { due_dates: { enabled: true }, tags: { enabled: true }, checklists: { enabled: true } },
  });

  // SAFE folder
  console.log(`• Folder: ${SAFE_FOLDER}`);
  const safeFolder = await api("POST", `/space/${space.id}/folder`, { name: SAFE_FOLDER });
  for (const list of SAFE_LISTS) {
    const l = await api("POST", `/folder/${safeFolder.id}/list`, { name: list.name });
    console.log(`  • List: ${list.name}`);
    for (const t of list.tasks) map[t.key] = await makeTask(l.id, t);
  }

  // DECISIONS folder
  console.log(`• Folder: ${DECISION_FOLDER}`);
  const decFolder = await api("POST", `/space/${space.id}/folder`, { name: DECISION_FOLDER });
  const decList = await api("POST", `/folder/${decFolder.id}/list`, { name: "Decisions" });
  console.log(`  • List: Decisions`);
  for (const t of DECISION_TASKS) map[t.key] = await makeTask(decList.id, t);

  writeFileSync(join(__dirname, "task-map.json"),
    JSON.stringify({ spaceId: space.id, teamId, tasks: map }, null, 2));
  console.log(`\nDone. ${Object.keys(map).length} tasks created. Map → scripts/clickup/task-map.json`);
}

main().catch((e) => { console.error("\n✗ " + e.message); process.exit(1); });
