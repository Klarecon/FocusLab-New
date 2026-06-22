# Reddit Pain Miner

Mines Reddit for the pain points FocusLab speaks to — overwhelmed managers, people
who can't switch off, who are always thinking about work — and turns them into a
weekly HTML report of verbatim quotes, themes, and content angles.

> **No Reddit account, app, or login is involved — at all.** This tool reads
> Reddit's *public JSON endpoints* (the `.json` version of normal pages) with a
> polite user-agent and rate-limiting. There is no account in the loop, so no
> account can ever be at risk. The only credential you need is an Anthropic key.

---

## What it does

1. Reads recent + top posts (and runs searches) across manager, burnout, and
   productivity subreddits via Reddit's public JSON endpoints.
2. Filters to threads matching pain keywords (cheap, local — keeps cost down).
3. Sends the top ~40 to Claude (Opus 4.8), which scores each against FocusLab's
   ICP and extracts verbatim pain quotes, a theme, sentiment, and a content angle.
4. Writes a dated HTML report into `/GTM Plan/` (e.g. `2026-06-22-reddit-pain-report.html`).
5. Remembers what it already reported, so each run shows **new** pain only.

> **Note on speed:** unauthenticated public access is rate-limited, so the tool
> spaces out its requests and runs slower than an authenticated API would (a couple
> of minutes per run). That's intentional and polite — fine for a weekly job.

---

## Setup (one time)

You only need **one** thing: an Anthropic API key.

### 1. Get an Anthropic API key
From <https://console.anthropic.com> → **API Keys** → create one. This powers the
Claude analysis (billed per run — roughly a few cents to ~50¢ weekly at the
Balanced setting).

### 2. Create your `.env`
```bash
cd "GTM Plan/reddit-pain-miner"
cp .env.example .env
```
Then edit `.env` and paste in your key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Install dependencies (in a virtualenv)
```bash
cd "GTM Plan/reddit-pain-miner"
python3 -m venv .venv
source .venv/bin/activate
pip install -U -r requirements.txt
```
(No PRAW — Reddit access uses Python's built-in `urllib`.)

---

## Running it

**Try it with no network / no cost** (builds a sample report from fixtures):
```bash
python run.py --dry-run
```
Open the generated `…-reddit-pain-report.html` in `/GTM Plan/` to see the format.

**Real run** (needs your Anthropic key in `.env`):
```bash
python run.py
```

**Cheaper run** (analyze fewer threads):
```bash
python run.py --max 15
```

---

## Scheduling it weekly (optional)

Uses macOS `launchd`. Runs Mondays 9 AM, **only while your Mac is awake** — fine for
content research.

1. Edit the paths in `com.focuslab.reddit-pain-miner.plist` to point at your `.venv`
   python and this folder (defaults assume the current location).
2. Install and load it:
   ```bash
   cp com.focuslab.reddit-pain-miner.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.focuslab.reddit-pain-miner.plist
   ```
3. Run once now to test: `launchctl start com.focuslab.reddit-pain-miner`
4. Stop scheduling: `launchctl unload ~/Library/LaunchAgents/com.focuslab.reddit-pain-miner.plist`

Output and errors are logged to `miner.log`.

---

## Tuning

Everything lives in **`config.py`**:
- `SUBREDDITS` — which communities to watch
- `KEYWORDS` / `SEARCH_TERMS` — the pre-filter
- `ICP_DEFINITION` — who FocusLab is for (drives Claude's relevance scoring)
- `RELEVANCE_THRESHOLD` — how strict to be (default 60/100)
- `MAX_ANALYZE` — cost ceiling (default 40 threads/run)
- `REQUEST_DELAY` / `RATE_LIMIT_BACKOFF` — politeness / rate-limit handling

---

## Tests
```bash
pip install pytest
python -m pytest tests/ -q
```

---

## Files
| File | Purpose |
|------|---------|
| `config.py` | All tunable settings |
| `reddit_fetch.py` | Public-JSON fetching (urllib) + keyword filter |
| `analyze.py` | Claude analysis (relevance, quotes, theme, angle) |
| `store.py` | Seen-IDs + raw archive |
| `report.py` | HTML report generator |
| `run.py` | Orchestrator (`--dry-run`, `--max`) |
| `com.focuslab.reddit-pain-miner.plist` | Weekly scheduler |
