"""Tests for HTML report rendering — no network."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from report import render_html  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(__file__), "fixtures", "sample_results.json")


def _results():
    with open(FIXTURE, "r", encoding="utf-8") as f:
        return json.load(f)


def test_render_contains_sections_and_quotes():
    results = _results()
    html_doc = render_html(results, "June 22, 2026", {"scanned": 120, "matched": 38, "analyzed": 3, "included": 3})
    # themes present (apostrophes are HTML-escaped, so match around them)
    assert "switch off after hours" in html_doc
    assert "Buried in meetings" in html_doc
    # a verbatim quote present (apostrophe-free substring to avoid escaping)
    assert "felt actually off the clock in months" in html_doc
    # content angle label present
    assert "Content angle" in html_doc
    # links present
    assert "https://www.reddit.com/r/managers/comments/abc123/example/" in html_doc


def test_render_empty_state():
    html_doc = render_html([], "June 22, 2026", {"scanned": 50, "matched": 0, "analyzed": 0, "included": 0})
    assert "No new pain found" in html_doc


def test_render_escapes_html():
    results = [
        {
            "id": "x",
            "title": "<script>alert(1)</script>",
            "permalink": "https://www.reddit.com/x",
            "subreddit": "managers",
            "score": 1,
            "num_comments": 1,
            "created_utc": 1750550400,
            "engagement": 2,
            "rank_score": 1.0,
            "relevance": 70,
            "pain_quotes": ["<b>raw</b>"],
            "theme": "Test",
            "sentiment": "venting",
            "content_angle": "angle",
            "reasoning": "r",
        }
    ]
    html_doc = render_html(results, "x", {})
    assert "<script>alert(1)</script>" not in html_doc
    assert "&lt;script&gt;" in html_doc
