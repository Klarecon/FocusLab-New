# Reddit Pain Miner — Design Spec

**Date:** 2026-06-22
**Owner:** Mona
**Status:** Approved design → implementation pending
**Location:** `/GTM Plan/reddit-pain-miner/` (standalone tool, separate from the FocusLab app)

---

## 1. Purpose

A scheduled local job that mines Reddit for the pain points FocusLab speaks to —
overwhelmed managers, people who can't unplug, who are always thinking about work —
and turns them into content fuel: verbatim quotes, recurring themes, and ready-to-use
content angles. The goal is to **speak their language** by capturing the exact words
real people use, ranked by how much the community resonates with them.

## 2. Hard Constraint (the reason this design exists)

**Mona's personal Reddit account must never be at risk of being blocked.**

The design eliminates the risk entirely rather than mitigating it:

- We use the **official Reddit API** (OAuth) via PRAW — the sanctioned, rate-limit-aware path.
- Authentication is through a **dedicated Reddit "script" app registered under a separate
  throwaway account** — never Mona's personal account.
- The job runs **read-only**. It never logs in via a browser, never scrapes HTML, never
  hammers endpoints. PRAW enforces Reddit's 60 req/min OAuth limit and backs off automatically.
- Mona's browsing account is **not involved at any point**, so it cannot be rate-limited
  or banned for automation.

## 3. Decisions (locked)

| Decision | Choice |
|---|---|
| Reddit access | Official Reddit API (OAuth, read-only) via PRAW |
| Language | Python 3.9+ |
| Analysis engine | Claude API — `claude-opus-4-8` via the `anthropic` Python SDK, structured outputs |
| Run cadence | Scheduled weekly via macOS `launchd` (also runnable on demand) |
| Run location | Local on Mona's Mac |
| Output | Dated HTML report in `/GTM Plan/` |
| Communities | Manager/leadership + burnout/mental-load + productivity-tool clusters, **ICP-scored** |
| Extraction | Full analysis: ICP relevance, verbatim quotes, theme, sentiment, engagement, content angle |
| Depth/cost | Balanced — keyword pre-filter, then analyze ~top 40 candidates per run |
| Credentials | Mona needs setup instructions (included in §9) |

## 4. Architecture

One-directional pipeline, no database:

```
Reddit API ──▶ candidates ──▶ keyword pre-filter ──▶ Claude analysis ──▶ rank + dedupe ──▶ HTML report
   (PRAW)        (raw threads)    (cheap, local)       (Opus 4.8)         (vs seen IDs)     (/GTM Plan/)
```

### Components (each single-purpose, independently testable)

1. **`config.py`** — Static configuration:
   - `SUBREDDITS`: tuned list across the three clusters (e.g. `managers`, `leadership`,
     `middlemanagement`, `ExperiencedDevs`, `antiwork`, `overemployed`, `productivity`,
     `getdisciplined`, `workreform`, `Notion`, `ObsidianMD`). Final list proposed in the
     implementation plan and confirmed.
   - `KEYWORDS`: pre-filter phrases ("overwhelmed", "can't switch off", "always thinking
     about work", "burnt out", "no boundaries", "drowning in work", "can't unplug"…).
   - `ICP_DEFINITION`: plain-English description of FocusLab's target persona, fed to Claude
     for relevance scoring.
   - `RELEVANCE_THRESHOLD`: minimum ICP score (0–100) to include in the report.
   - `MAX_ANALYZE`: 40 (the Balanced cap).

2. **`reddit_fetch.py`** — PRAW read-only client.
   - Pulls recent (`new`) and `top` (past week) posts per subreddit, plus keyword searches.
   - For each candidate collects: `id`, `title`, `selftext`, top N comments, `score`,
     `num_comments`, `permalink`, `subreddit`, `created_utc`.
   - Applies the keyword pre-filter to trim the set before any LLM call.
   - Returns a list of candidate dicts.

3. **`analyze.py`** — Claude API analysis (Opus 4.8, `output_config.format` structured output).
   - Per candidate, returns a validated object:
     `{ relevance: 0-100, pain_quotes: [string], theme: string, sentiment: string,
        content_angle: string, reasoning: string }`.
   - Skips/marks any thread that fails analysis (one bad thread never kills the run).
   - Drops results below `RELEVANCE_THRESHOLD`.

4. **`store.py`** — Persistence.
   - `seen_ids.json`: thread IDs already reported, so each run surfaces **new** pain only.
   - `archive/<date>.json`: raw analyzed results for the run (audit / re-generation).

5. **`report.py`** — HTML report generator.
   - Writes `/GTM Plan/<YYYY-MM-DD>-reddit-pain-report.html`.
   - Sections: themes ranked by `engagement × relevance`; under each theme the top pain
     quotes with permalinks; the suggested content angle; an engagement/sentiment summary.
   - Styled to match existing GTM HTML artifacts (warm, readable, not a code dump).
   - Empty-week case: still writes a report stating no new high-relevance pain was found.

6. **`run.py`** — Orchestrator: fetch → pre-filter → analyze → rank → dedupe → store → report.
   Prints a one-line summary (threads scanned, analyzed, included; report path).

7. **Scheduling** — `com.focuslab.reddit-pain-miner.plist` (launchd) runs `run.py` weekly.
   Documentation includes how to load/unload it and how to trigger a manual run.

## 5. Secrets & Configuration

- `.env` (gitignored) holds: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`,
  `ANTHROPIC_API_KEY`.
- A `.gitignore` in the tool folder excludes `.env`, `archive/`, `seen_ids.json`, and
  `__pycache__/`.
- Nothing secret is committed.

## 6. Cost

Balanced depth ≈ a few cents to ~50¢ per weekly run (≤40 Opus 4.8 calls on short threads,
input-heavy and short-output). The keyword pre-filter is what keeps this bounded — most
non-matching threads never reach the LLM.

## 7. Error Handling

| Failure | Behavior |
|---|---|
| Reddit auth fails | Clear message naming the likely cause (bad creds / app type), exit cleanly — no retry-spam |
| One thread fails analysis | Log it, skip it, continue the run |
| Anthropic rate limit / 5xx | SDK retries with exponential backoff automatically |
| Zero new high-relevance threads | Still writes a report saying so, so Mona knows the job ran |
| Missing `.env` values | Fail fast at startup with a message pointing to setup §9 |

## 8. Testing

- `reddit_fetch.py`: unit-test the keyword pre-filter against fixture threads (no live API).
- `analyze.py`: test the prompt-building and schema-parsing against a recorded Claude response
  fixture (no live API in tests).
- `report.py`: test that an HTML file is produced with the expected sections from a fixture
  result set.
- A `--dry-run` flag on `run.py` that uses recorded fixtures end-to-end, so the pipeline can be
  verified without spending API calls.

## 9. Credential Setup (included for Mona)

The implementation plan will deliver these as exact, copy-pasteable steps:

1. **Throwaway Reddit account** — create a new Reddit account (not the personal one) purely
   to own the API app.
2. **Register a script app** — go to `https://www.reddit.com/prefs/apps` → "create another
   app" → choose **script** → note the `client_id` (under the app name) and `client_secret`.
3. **User agent** — set a descriptive string like `focuslab-pain-miner/1.0 by u/<throwaway>`.
4. **Anthropic API key** — from `https://console.anthropic.com` → API keys.
5. Paste all four into `.env`.

## 10. Out of Scope (v1)

- Posting/commenting on Reddit (read-only only — also keeps the account safe).
- Cloud/always-on hosting (local Mac only for now).
- Auto-publishing reports anywhere (reports land as local HTML for Mona to read).
- Sentiment as a numeric model — v1 uses Claude's qualitative label, not a separate sentiment library.

## 11. File Layout

```
GTM Plan/reddit-pain-miner/
├── SPEC.md                 (this file)
├── README.md               (setup + run instructions — delivered in implementation)
├── .env.example
├── .gitignore
├── requirements.txt        (praw, anthropic, python-dotenv)
├── config.py
├── reddit_fetch.py
├── analyze.py
├── store.py
├── report.py
├── run.py
├── com.focuslab.reddit-pain-miner.plist
├── seen_ids.json           (gitignored, created at runtime)
├── archive/                (gitignored, created at runtime)
└── tests/
    ├── fixtures/
    └── test_*.py
```
