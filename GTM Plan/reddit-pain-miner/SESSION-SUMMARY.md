# Reddit Pain Miner — Session Summary

**Date:** 2026-06-22 → 2026-06-23
**Branch:** `feature/reddit-pain-miner` (pushed to GitHub)
**Status:** ✅ Built, tested, working. One real report produced. Blocked only by Reddit rate-limiting on re-runs (external, not a bug).

---

## What this is

A standalone tool that mines Reddit for FocusLab's ICP pain points — overwhelmed
managers who can't switch off / are always thinking about work — and produces a
dated HTML report of verbatim quotes, themes, sentiment, and content angles.
Lives in `GTM Plan/reddit-pain-miner/`, fully separate from the FocusLab app.

## The hard constraint (met)

**No Reddit account is involved at all** — no login, no app, no credentials.
The tool reads Reddit's **public RSS feeds** (`.rss`) anonymously. There is no
account that *can* be blocked. The only secret needed is an Anthropic API key.

## How we got here (the journey)

1. Planned to use the **official Reddit API** (OAuth via PRAW) under a throwaway
   "script" app. → App registration was blocked by Reddit's new-account captcha loop.
2. Pivoted to **public JSON endpoints** (no account). → Reddit returns **403 Blocked**
   for unauthenticated `.json` (confirmed from Mona's own machine).
3. Pivoted to **public RSS feeds** (`.rss`). → **Works** (200). This is the final approach.

## Current state

- **Code:** complete and committed. 16 unit tests passing. `--dry-run` works offline.
- **Credentials:** Anthropic key is in `.env` (gitignored). `Reddit API.rtf` deleted.
  No secrets in git. `.gitignore` hardened to exclude `.env` and `*.rtf`.
- **Reports produced:**
  - `GTM Plan/2026-06-22-reddit-pain-report.html` — **1 strong result** (relevance 88,
    "Overwhelmed senior manager burnout", excellent verbatim quotes). ✅ usable.
  - `GTM Plan/2026-06-23-reddit-pain-report.html` — **0 results** (see issue below).

## Known issue: Reddit RSS rate-limiting

Reddit throttles anonymous RSS hard (HTTP 429). It got worse because an overnight
run **wedged** after the Mac slept and hammered Reddit for hours, putting the IP in
a temporary penalty box. Result: the 2026-06-23 re-run only pulled ~half the feeds
and found 0 new ICP matches.

**Fixed in code:** the fetch phase is now bounded by a wall-clock budget
(`FETCH_TIME_BUDGET`, default 600s) so it can never wedge again — it stops early and
proceeds with whatever it gathered.

**Still external:** the rate-limit penalty resets over time. Re-running right after a
heavy run just hits the wall again.

## Commits on this branch

- `4145fa1` Add Reddit Pain Miner (initial, PRAW version)
- `1ffce49` Switch fetcher from official API to public RSS feeds
- `56fd863` Harden .gitignore: never commit .rtf credential files
- `df1884c` Decode unicode escapes, lower relevance threshold to 50, fix log string
- `8baee94` Bound the fetch phase with a wall-clock budget so runs never wedge

## How to run

```bash
cd "GTM Plan/reddit-pain-miner"
source .venv/bin/activate           # deps already installed (anthropic, python-dotenv)
python run.py --dry-run             # offline sample, no cost
python run.py --max 8               # small live run (~cents)
python run.py                       # full run (analyzes all matched threads)
```
Report lands in `GTM Plan/<date>-reddit-pain-report.html`.

## Next steps (when picking this back up)

1. **Wait for the rate-limit to cool down** (a few hours of not hammering Reddit), then re-run.
2. Optionally **reset the seen-list** (`rm seen_ids.json`) for a fresh comprehensive report
   that re-includes the strong threads instead of only brand-new ones.
3. Optionally **trim the fetch footprint** (config: drop `top` feeds, fewer subreddits) to
   trip the throttle less often.
4. Tune in `config.py`: `SUBREDDITS`, `KEYWORDS`, `ICP_DEFINITION`, `RELEVANCE_THRESHOLD` (now 50).
5. If wanted, schedule weekly via the included `com.focuslab.reddit-pain-miner.plist` (launchd).

## Decision still open

The PR has **not** been opened. Branch is pushed; merge/PR at your discretion.
The tool is content-research tooling under `/GTM Plan/`, not app code.
