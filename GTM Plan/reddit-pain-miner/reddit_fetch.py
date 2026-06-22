"""Fetch candidate threads from Reddit via the official API (read-only PRAW).

Account-safety notes:
  * Read-only OAuth via a dedicated "script" app under a throwaway account.
  * PRAW enforces Reddit's 60 req/min OAuth rate limit and backs off.
  * No browser login, no HTML scraping, no personal account involved.
"""
from __future__ import annotations

import os

import config


def make_reddit():
    """Build a read-only PRAW client from environment credentials."""
    import praw  # imported here so tests that only use pure helpers don't need praw

    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    user_agent = os.environ.get("REDDIT_USER_AGENT")

    missing = [
        name
        for name, val in (
            ("REDDIT_CLIENT_ID", client_id),
            ("REDDIT_CLIENT_SECRET", client_secret),
            ("REDDIT_USER_AGENT", user_agent),
        )
        if not val
    ]
    if missing:
        raise SystemExit(
            "Missing Reddit credentials in .env: "
            + ", ".join(missing)
            + "\nSee README.md > Setup. (Reddit creds come from a 'script' app "
            "registered under a THROWAWAY account — never your personal one.)"
        )

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )
    reddit.read_only = True  # belt-and-suspenders: never act as a logged-in user
    return reddit


def keyword_match(text: str) -> bool:
    """True if any configured keyword appears in the given text (case-insensitive).

    Pure function — unit-tested without any network access.
    """
    if not text:
        return False
    haystack = text.lower()
    return any(kw in haystack for kw in config.KEYWORDS)


def candidate_matches(candidate: dict) -> bool:
    """Pre-filter a candidate on its title + body (cheap, before any LLM call)."""
    return keyword_match(candidate.get("title", "")) or keyword_match(
        candidate.get("selftext", "")
    )


def _candidate_from_submission(sub) -> dict:
    return {
        "id": sub.id,
        "title": sub.title or "",
        "selftext": sub.selftext or "",
        "score": int(getattr(sub, "score", 0) or 0),
        "num_comments": int(getattr(sub, "num_comments", 0) or 0),
        "permalink": "https://www.reddit.com" + sub.permalink,
        "subreddit": str(sub.subreddit),
        "created_utc": float(getattr(sub, "created_utc", 0) or 0),
    }


def collect_candidates(reddit) -> list[dict]:
    """Pull raw candidate threads (no comments yet) from all configured sources."""
    seen: set[str] = set()
    out: list[dict] = []

    def _absorb(listing):
        for sub in listing:
            if sub.id in seen:
                continue
            seen.add(sub.id)
            out.append(_candidate_from_submission(sub))

    # Per-subreddit "new" and "top (week)" listings.
    for name in config.SUBREDDITS:
        try:
            sr = reddit.subreddit(name)
            _absorb(sr.new(limit=config.NEW_LIMIT))
            _absorb(sr.top(time_filter="week", limit=config.TOP_LIMIT))
        except Exception as exc:  # private/banned/typo subreddit — skip, keep going
            print(f"  ! skipping r/{name}: {exc}")

    # Combined-subreddit search — one API call per search term.
    try:
        combined = reddit.subreddit("+".join(config.SUBREDDITS))
        for term in config.SEARCH_TERMS:
            try:
                _absorb(
                    combined.search(term, time_filter="week", limit=config.SEARCH_LIMIT)
                )
            except Exception as exc:
                print(f"  ! search failed for '{term}': {exc}")
    except Exception as exc:
        print(f"  ! combined search unavailable: {exc}")

    return out


def enrich_with_comments(reddit, candidate: dict) -> dict:
    """Attach the top N comments to a candidate for richer analysis."""
    try:
        sub = reddit.submission(id=candidate["id"])
        sub.comments.replace_more(limit=0)
        comments = sorted(
            sub.comments.list(),
            key=lambda c: int(getattr(c, "score", 0) or 0),
            reverse=True,
        )
        candidate["comments"] = [
            c.body for c in comments[: config.TOP_COMMENTS] if getattr(c, "body", None)
        ]
    except Exception as exc:
        print(f"  ! could not fetch comments for {candidate['id']}: {exc}")
        candidate["comments"] = []
    return candidate
