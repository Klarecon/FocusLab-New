#!/usr/bin/env node
/**
 * Mark one or more ClickUp tasks complete as we finish them.
 * Usage: node scripts/clickup/done.mjs A1-T1 A1-T2 ...
 *
 * Reads the task-id map written by setup.mjs and flips each task's status.
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
  const m = env.match(/^CLICKUP_TOKEN\s*=\s*(.+)$/m);
  if (!m) throw new Error("CLICKUP_TOKEN not found.");
  return m[1].trim().replace(/^["']|["']$/g, "");
}
const TOKEN = loadToken();
const { tasks } = JSON.parse(readFileSync(join(__dirname, "task-map.json"), "utf8"));

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${await res.text()}`);
  return res.json();
}

const keys = process.argv.slice(2);
if (!keys.length) { console.error("Pass task keys, e.g. A1-T1"); process.exit(1); }

for (const key of keys) {
  const id = tasks[key];
  if (!id) { console.error(`✗ ${key}: not in task-map.json`); continue; }
  // "complete" is ClickUp's built-in closed status; falls back cleanly if list uses a custom done name.
  await api("PUT", `/task/${id}`, { status: "complete" });
  console.log(`✓ ${key} marked complete`);
}
