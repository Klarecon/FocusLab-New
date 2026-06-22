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

The design eliminates the risk entirely: **no Reddit account is involved at all.**

- We read Reddit's **public JSON endpoints** (the `.json` version of normal pages),
  fetched with Python's stdlib `urllib`.
- There is **no app, no OAuth, no login, no credentials, and no account** in the loop —
  not even a throwaway. Nothing to register, nothing to authenticate.
- The job is read-only and polite: a descriptive user-agent plus an enforced delay
  between every request, with backoff on HTTP 429.
- Because no account is ever used, no account — personal or otherwise — can be
  rate-limited or banned.
- (Design history: an earlier version used the official OAuth API via PRAW under a
  throwaway "script" app. We switched to public JSON because app registration was
  blocked by Reddit's new-account/captcha flow, and because removing the account
  entirely is a strictly stronger guarantee for the hard constraint above.)

## 3. Decisions (locked)

| Decision | Choice |
|---|---|
| Reddit access | Public JSON endpoints (no account/app/login) via stdlib urllib |
| Language | Python 3.9+ |
| Analysis engine | Claude API — `claude-opus-4-8` via the `anthropic` Python SDK, structured outputs |
| Run cadence | Scheduled weekly via macOS `launchd` (also runnable on demand) |
| Run location | Local on Mona's Mac |
| Output | Dated HTML report in `/GTM Plan/` |
| Communities | Manager/leadership + burnout/mental-load + productivity-tool clusters, **ICP-scored** |
| Extraction | Full analysis: ICP relevance, verbatim quotes, theme, sentiment, engagement, content angle |
| Depth/cost | Balanced — keyword pre-filter, then analyze ~top 40 candidates per run |
| Credentials | Only an Anthropic API key (no Reddit credentials of any kind) |

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

2. **`reddit_fetch.py`** — public-JSON fetcher (stdlib `urllib`, no account/app).
   - Reads recent (`new`) and `top` (past week) listings per subreddit, plus
     combined-subreddit searches, via the `.json` endpoints.
   - Sends a descriptive user-agent + an enforced delay between every request,
     with backoff on HTTP 429.
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

- `.env` (gitignored) holds just `ANTHROPIC_API_KEY` (and optionally `REDDIT_USER_AGENT`
  to customize the fetcher's user-agent). No Reddit secrets exist.
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
| Reddit returns HTTP 429 (rate limit) | Back off and retry; configurable delay/backoff in `config.py` |
| A subreddit/search request fails | Log it, skip that source, continue with the rest |
| One thread fails analysis | Log it, skip it, continue the run |
| Anthropic rate limit / 5xx | SDK retries with exponential backoff automatically |
| Zero new high-relevance threads | Still writes a report saying so, so Mona knows the job ran |
| Missing `ANTHROPIC_API_KEY` | Fail fast at startup with a message pointing to setup §9 |

## 8. Testing

- `reddit_fetch.py`: unit-test the keyword pre-filter against fixture threads (no live API).
- `analyze.py`: test the prompt-building and schema-parsing against a recorded Claude response
  fixture (no live API in tests).
- `report.py`: test that an HTML file is produced with the expected sections from a fixture
  result set.
- A `--dry-run` flag on `run.py` that uses recorded fixtures end-to-end, so the pipeline can be
  verified without spending API calls.

## 9. Credential Setup (included for Mona)

There is **no Reddit setup** — no account, no app, no Reddit credentials. The only
thing required:

1. **Anthropic API key** — from `https://console.anthropic.com` → API keys.
2. `cp .env.example .env` and paste the key into `ANTHROPIC_API_KEY`.

That's it. The fetcher reads Reddit's public JSON endpoints with no authentication.

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
├── requirements.txt        (anthropic, python-dotenv — Reddit uses stdlib urllib)
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
