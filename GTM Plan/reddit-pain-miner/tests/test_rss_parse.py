"""Tests for RSS (Atom) feed parsing — pure, no network."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reddit_fetch import _strip_html, candidate_matches, parse_feed  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(__file__), "fixtures", "sample_feed.rss")


def _feed_bytes():
    with open(FIXTURE, "rb") as f:
        return f.read()


def test_parse_feed_extracts_entries():
    candidates = parse_feed(_feed_bytes())
    assert len(candidates) == 2
    first = candidates[0]
    assert first["id"] == "abc123"  # "t3_" prefix stripped
    assert first["title"] == "Overwhelmed and can't switch off"
    assert first["subreddit"] == "managers"
    assert first["permalink"].startswith("https://www.reddit.com/r/managers/comments/abc123")
    assert first["created_utc"] > 0
    # RSS has no engagement signal
    assert first["score"] == 0
    assert first["num_comments"] == 0


def test_parse_feed_strips_html_to_text():
    candidates = parse_feed(_feed_bytes())
    body = candidates[0]["selftext"]
    assert "<div" not in body and "<p>" not in body
    assert "overwhelmed" in body.lower()
    assert "can't switch off" in body.lower()  # entity unescaped


def test_keyword_filter_works_on_parsed_entries():
    candidates = parse_feed(_feed_bytes())
    matched = [c for c in candidates if candidate_matches(c)]
    # only the "overwhelmed / can't switch off" post matches; coffee machine doesn't
    assert len(matched) == 1
    assert matched[0]["id"] == "abc123"


def test_parse_feed_handles_garbage():
    assert parse_feed(b"not xml at all") == []


def test_strip_html_basic():
    assert _strip_html("<p>hello&amp;world</p>") == "hello&world"
    assert _strip_html("") == ""
