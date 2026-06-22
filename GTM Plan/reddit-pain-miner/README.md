# Reddit Pain Miner

Mines Reddit for the pain points FocusLab speaks to — overwhelmed managers, people
who can't switch off, who are always thinking about work — and turns them into a
weekly HTML report of verbatim quotes, themes, and content angles.

> **Your personal Reddit account is never logged into and cannot be blocked.** This
> tool talks to Reddit's *official API* in read-only "app-only" mode — it
> authenticates with just the app's `client_id` + `client_secret`, never a username
> or password. No browser login, no HTML scraping, no user session.

---

## What it does

1. Pulls recent + top posts (and runs searches) across manager, burnout, and
   productivity subreddits via the official Reddit API.
2. Filters to threads matching pain keywords (cheap, local — keeps cost down).
3. Sends the top ~40 to Claude (Opus 4.8), which scores each against FocusLab's
   ICP and extracts verbatim pain quotes, a theme, sentiment, and a content angle.
4. Writes a dated HTML report into `/GTM Plan/` (e.g. `2026-06-22-reddit-pain-report.html`).
5. Remembers what it already reported, so each week shows **new** pain only.

---

## Setup (one time)

### 1. Pick which Reddit account owns the app

You need *a* Reddit account to **register the API app** — Reddit won't issue
credentials without one. You have two options:

- **Throwaway account (recommended).** Register a brand-new account just to own the
  app. This makes the blast radius literally zero: even in an unlikely edge case, it
  can never touch your personal account. Takes ~2 minutes.
- **Your existing account (also fine).** The tool runs **read-only and app-only** —
  it authenticates with the app's `client_id`/`client_secret`, never logs in as a
  user, and never touches your account's activity. Legitimate read-only API use does
  **not** get accounts banned, so using your own account is genuinely low-risk.

Either way, the account is only the *owner* of the credentials — you never post with
it, and the tool never logs into it.

If you chose the throwaway: go to [reddit.com](https://www.reddit.com) and register a
new account now, then continue below logged in as it.

### 2. Register a "script" app
1. Logged in as whichever account you chose in step 1, go to <https://www.reddit.com/prefs/apps>.
2. Click **"are you a developer? create an app…"** (bottom of the page).
3. Fill in:
   - **name:** `focuslab-pain-miner`
   - **type:** select **script**  ← important
   - **redirect uri:** `http://localhost:8080` (required but unused)
4. Click **create app**. You'll now see:
   - **client_id** — the string just under the app name (looks like `p-Xy9Z...`)
   - **secret** — labelled `secret`

### 3. Get an Anthropic API key
From <https://console.anthropic.com> → **API Keys** → create one. This powers the
Claude analysis (billed per run — roughly a few cents to ~50¢ weekly at the
Balanced setting).

### 4. Create your `.env`
```bash
cd "GTM Plan/reddit-pain-miner"
cp .env.example .env
```
Then edit `.env` and paste in your four values:
```
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=focuslab-pain-miner/1.0 by u/your_throwaway_username
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Install dependencies (in a virtualenv)
```bash
cd "GTM Plan/reddit-pain-miner"
python3 -m venv .venv
source .venv/bin/activate
pip install -U -r requirements.txt
```

---

## Running it

**Try it with no network / no cost** (builds a sample report from fixtures):
```bash
python run.py --dry-run
```
Open the generated `…-reddit-pain-report.html` in `/GTM Plan/` to see the format.

**Real run** (needs `.env`):
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
| `reddit_fetch.py` | Official-API fetching + keyword filter |
| `analyze.py` | Claude analysis (relevance, quotes, theme, angle) |
| `store.py` | Seen-IDs + raw archive |
| `report.py` | HTML report generator |
| `run.py` | Orchestrator (`--dry-run`, `--max`) |
| `com.focuslab.reddit-pain-miner.plist` | Weekly scheduler |
