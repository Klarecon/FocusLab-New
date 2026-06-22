"""Static configuration for the Reddit Pain Miner.

Everything tunable lives here: which communities to watch, the keyword
pre-filter, the ICP definition fed to Claude, and the cost/depth knobs.
Edit this file to retarget the miner — no other code needs to change.
"""

# ---------------------------------------------------------------------------
# Communities to watch — three clusters, all scored against the ICP by Claude.
# Manager/leadership + burnout/mental-load + productivity-tool.
# Subreddit names are case-insensitive to PRAW.
# ---------------------------------------------------------------------------
SUBREDDITS = [
    # Manager / leadership
    "managers",
    "Leadership",
    "middlemanagement",
    "ExperiencedDevs",
    "engineeringmanagers",
    # Burnout / mental-load
    "antiwork",
    "overemployed",
    "WorkReform",
    "getdisciplined",
    # Productivity-tool (closer to buying intent)
    "productivity",
    "Notion",
    "ObsidianMD",
]

# ---------------------------------------------------------------------------
# Keyword pre-filter (cheap, local). A thread must contain at least one of
# these in its title or body to ever reach the (paid) Claude analysis step.
# Lowercased substring match. Keep these broad — Claude does the precise
# relevance judgement afterwards.
# ---------------------------------------------------------------------------
KEYWORDS = [
    "overwhelmed",
    "can't switch off",
    "cant switch off",
    "can't unplug",
    "cant unplug",
    "always thinking about work",
    "thinking about work",
    "burnt out",
    "burned out",
    "burnout",
    "no boundaries",
    "drowning in work",
    "drowning at work",
    "too much on my plate",
    "can't keep up",
    "cant keep up",
    "working late",
    "after hours",
    "mental load",
    "always on",
    "can't relax",
    "cant relax",
    "spread too thin",
    "firefighting",
    "fire fighting",
    "no time to think",
    "constantly stressed",
    "work follows me home",
    "switch off",
    "disconnect from work",
    "can't disconnect",
    "cant disconnect",
]

# Broader reach: combined-subreddit search runs once per term (one API call each).
SEARCH_TERMS = [
    "can't switch off work",
    "always thinking about work",
    "manager overwhelmed",
    "can't unplug from work",
]

# ---------------------------------------------------------------------------
# ICP definition — fed to Claude for relevance scoring. Plain English.
# ---------------------------------------------------------------------------
ICP_DEFINITION = (
    "FocusLab's ideal customer is a manager, team lead, or knowledge worker "
    "(often in tech, ops, or other fast-moving fields) who feels chronically "
    "overwhelmed by their workload. Their defining pain is that they cannot "
    "switch off: they are always thinking about work, check messages after "
    "hours, and struggle to unplug or be present outside work. They feel buried "
    "in low-value busywork, constant context-switching, and reactive "
    "firefighting, with no time for the work that actually matters. They sense "
    "they are wasting effort but can't see where. "
    "They are NOT: people merely venting about a bad boss or coworker, "
    "salary/compensation complaints, job-search or interview questions, layoff "
    "fears, or generic 'I hate my job' posts that lack the overwhelm / "
    "can't-switch-off angle."
)

# ---------------------------------------------------------------------------
# Depth / cost knobs (Balanced profile).
# ---------------------------------------------------------------------------
NEW_LIMIT = 40          # posts pulled from each subreddit's "new"
TOP_LIMIT = 25          # posts pulled from each subreddit's "top" (past week)
SEARCH_LIMIT = 25       # posts pulled per combined-subreddit search term
TOP_COMMENTS = 5        # top comments fetched per analyzed thread (for context)

MAX_ANALYZE = 40        # hard cap on threads sent to Claude per run (cost ceiling)
RELEVANCE_THRESHOLD = 60  # Claude relevance score (0-100) required to make the report

# Truncation limits to bound token usage per analysis call.
MAX_SELFTEXT_CHARS = 2000
MAX_COMMENT_CHARS = 500

# Claude model used for analysis.
MODEL = "claude-opus-4-8"

# ---------------------------------------------------------------------------
# Public-JSON fetch settings (no Reddit account/app — see reddit_fetch.py).
# ---------------------------------------------------------------------------
# Reddit throttles generic user-agents hard. A descriptive one is required.
# Override per-machine by setting REDDIT_USER_AGENT in .env (optional).
USER_AGENT = "focuslab-pain-miner/1.0 (content research script)"
REQUEST_DELAY = 3.0       # seconds between every request (Reddit RSS throttles tightly)
RATE_LIMIT_BACKOFF = 30   # seconds to wait after a 429 before retrying
