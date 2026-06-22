"""Fetch candidate threads from Reddit's PUBLIC RSS feeds.

Reddit blocks unauthenticated `.json` access (403), but its `.rss` (Atom) feeds
are open. We read those with a descriptive user-agent and polite rate-limiting.
Stdlib only (urllib + xml.etree) — nothing to install.

Account-safety: there is no account, app, or login in the loop at all. Nothing
here can put any Reddit account at risk because none is ever used.

Tradeoff vs the JSON API: RSS does not include upvote/comment counts, so threads
are ranked by Claude's relevance score rather than engagement. Comments are not
fetched in v1 — analysis runs on the post title + body, where the pain usually is.
"""
from __future__ import annotations

import html
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

import config

_ATOM = "{http://www.w3.org/2005/Atom}"
_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


class RedditError(Exception):
    pass


def _user_agent() -> str:
    return os.environ.get("REDDIT_USER_AGENT") or config.USER_AGENT


def _get_bytes(url: str, retries: int = 3) -> bytes:
    """GET a URL with a polite delay and 429 backoff. Returns raw bytes."""
    headers = {"User-Agent": _user_agent()}
    last_exc: Exception | None = None
    for attempt in range(retries):
        time.sleep(config.REQUEST_DELAY)  # polite spacing between every request
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read()
        except urllib.error.HTTPError as exc:
            last_exc = exc
            if exc.code == 429:  # rate limited — back off and retry
                wait = config.RATE_LIMIT_BACKOFF * (attempt + 1)
                print(f"  ! rate limited (429); backing off {wait}s...")
                time.sleep(wait)
                continue
            raise RedditError(f"HTTP {exc.code} for {url}") from exc
        except Exception as exc:  # transient network error — brief backoff
            last_exc = exc
            time.sleep(config.RATE_LIMIT_BACKOFF)
    raise RedditError(f"failed to GET {url}: {last_exc}")


# --- pure helpers (unit-tested, no network) --------------------------------

def keyword_match(text: str) -> bool:
    """True if any configured keyword appears in the given text (case-insensitive)."""
    if not text:
        return False
    haystack = text.lower()
    return any(kw in haystack for kw in config.KEYWORDS)


def candidate_matches(candidate: dict) -> bool:
    """Pre-filter a candidate on its title + body (cheap, before any LLM call)."""
    return keyword_match(candidate.get("title", "")) or keyword_match(
        candidate.get("selftext", "")
    )


def _strip_html(raw: str) -> str:
    """Turn an RSS content HTML blob into plain text for filtering/analysis."""
    if not raw:
        return ""
    text = _TAG_RE.sub(" ", raw)
    text = html.unescape(text)
    return _WS_RE.sub(" ", text).strip()


def _parse_published(value: str) -> float:
    """Parse an Atom <published> timestamp to a UTC epoch float (0.0 on failure)."""
    if not value:
        return 0.0
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


def parse_feed(xml_bytes: bytes) -> list[dict]:
    """Parse a Reddit Atom feed into candidate dicts. Pure — unit-tested.

    RSS gives no score/comment counts, so those are 0 and ranking falls back to
    relevance.
    """
    out: list[dict] = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return out

    for entry in root.findall(f"{_ATOM}entry"):
        id_el = entry.find(f"{_ATOM}id")
        raw_id = (id_el.text or "") if id_el is not None else ""
        thing_id = raw_id.split("_", 1)[-1] if raw_id else ""

        title_el = entry.find(f"{_ATOM}title")
        title = (title_el.text or "") if title_el is not None else ""

        link_el = entry.find(f"{_ATOM}link")
        permalink = link_el.get("href", "") if link_el is not None else ""

        content_el = entry.find(f"{_ATOM}content")
        selftext = _strip_html(content_el.text or "") if content_el is not None else ""

        cat_el = entry.find(f"{_ATOM}category")
        subreddit = ""
        if cat_el is not None:
            subreddit = (cat_el.get("label") or cat_el.get("term") or "").lstrip("r/")

        pub_el = entry.find(f"{_ATOM}published")
        created = _parse_published(pub_el.text if pub_el is not None else "")

        if not thing_id:
            continue
        out.append(
            {
                "id": thing_id,
                "title": title,
                "selftext": selftext,
                "score": 0,          # RSS doesn't expose upvotes
                "num_comments": 0,   # RSS doesn't expose comment counts
                "permalink": permalink,
                "subreddit": subreddit,
                "created_utc": created,
                "comments": [],      # not fetched in v1
            }
        )
    return out


def collect_candidates() -> list[dict]:
    """Pull raw candidate threads from all configured RSS sources."""
    seen: set[str] = set()
    out: list[dict] = []

    def _absorb(candidates: list[dict]):
        for c in candidates:
            if c["id"] in seen:
                continue
            seen.add(c["id"])
            out.append(c)

    # Per-subreddit "new" and "top (week)" feeds.
    for name in config.SUBREDDITS:
        for suffix in ("new/.rss", "top/.rss?t=week"):
            url = f"https://www.reddit.com/r/{name}/{suffix}"
            try:
                _absorb(parse_feed(_get_bytes(url)))
            except Exception as exc:  # private/banned/typo sub — skip, keep going
                print(f"  ! skipping {url}: {exc}")

    # Combined-subreddit search feeds — one request per term.
    combined = "+".join(config.SUBREDDITS)
    for term in config.SEARCH_TERMS:
        q = urllib.parse.quote(term)
        url = (
            f"https://www.reddit.com/r/{combined}/search.rss"
            f"?q={q}&restrict_sr=1&sort=relevance&t=week"
        )
        try:
            _absorb(parse_feed(_get_bytes(url)))
        except Exception as exc:
            print(f"  ! search failed for '{term}': {exc}")

    return out
