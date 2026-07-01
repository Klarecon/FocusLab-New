#!/usr/bin/env node
/**
 * Add due dates to the ClickUp launch board per the 13-week Q3 plan.
 * Usage: node scripts/clickup/due-dates.mjs
 * Auth: CLICKUP_TOKEN from env or ../../.env.local
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = "https://api.clickup.com/api/v2";

function loadToken() {
  if (process.env.CLICKUP_TOKEN) return process.env.CLICKUP_TOKEN.trim();
  const env = readFileSync(join(__dirname, "..", "..", ".env.local"), "utf8");
  return env.match(/CLICKUP_TOKEN=(.+)/)[1].trim().replace(/^["']|["']$/g, "");
}
const TOKEN = loadToken();
const { tasks } = JSON.parse(readFileSync(join(__dirname, "task-map.json"), "utf8"));

// Due date per task (local noon → date-only display). Mapped to the 13-week plan.
const DUE = {
  // W1 Jul 1–6  → W4 Jul 21–27 : the build, green-light ~Jul 25–28
  "A1-T1": "2026-07-03", "A1-T2": "2026-07-08", "A1-T3": "2026-07-11", "A1-T4": "2026-07-12",
  "A2-T1": "2026-07-09", "A2-T2": "2026-07-16", "A2-T3": "2026-07-15", "A2-T4": "2026-07-17", "A2-T5": "2026-07-23",
  "A4-T3": "2026-07-14", "A4-T1": "2026-07-18", "A4-T4": "2026-07-18", "A4-T5": "2026-07-24", "A4-T2": "2026-07-25",
  "A3-T1": "2026-07-21", "A3-T2": "2026-07-22", "A3-T3": "2026-07-24", "A3-T4": "2026-07-21",
  "B-T1":  "2026-07-20", "B-T2":  "2026-07-22", "B-T3":  "2026-08-04", "B-T4":  "2026-07-24",
  // W5 Jul 28–Aug 3 : launch week
  "L-T1":  "2026-07-28", "L-T2":  "2026-07-29", "L-T3":  "2026-08-01", "L-T4":  "2026-08-01",
  // Decisions — locked before the thing they gate
  "D6":    "2026-07-10", "D3":    "2026-07-18", "D2":    "2026-07-20", "D1":    "2026-07-22",
  "D5":    "2026-08-01", "D4":    "2026-08-25",
};

async function setDue(id, dateStr) {
  const ms = new Date(`${dateStr}T12:00:00`).getTime();
  const res = await fetch(`${API}/task/${id}`, {
    method: "PUT",
    headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ due_date: ms, due_date_time: false }),
  });
  if (!res.ok) throw new Error(`${id} → ${res.status} ${await res.text()}`);
}

let n = 0;
for (const [key, date] of Object.entries(DUE)) {
  const id = tasks[key];
  if (!id) { console.error(`✗ ${key}: not in map`); continue; }
  await setDue(id, date);
  console.log(`✓ ${key} → ${date}`);
  n++;
}
console.log(`\nDone. ${n} due dates set.`);
