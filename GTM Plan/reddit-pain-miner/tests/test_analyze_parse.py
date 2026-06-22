"""Tests for analysis parsing/normalization — no API calls."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402

from analyze import build_prompt, parse_analysis  # noqa: E402


def test_parse_valid():
    raw = json.dumps(
        {
            "relevance": 85,
            "pain_quotes": ["I can't switch off", "  ", "always on"],
            "theme": "Can't switch off",
            "sentiment": "resigned",
            "content_angle": "A post about the always-on trap.",
            "reasoning": "Clear overwhelm.",
        }
    )
    data = parse_analysis(raw)
    assert data["relevance"] == 85
    # blank quote is dropped
    assert data["pain_quotes"] == ["I can't switch off", "always on"]
    assert data["theme"] == "Can't switch off"


def test_relevance_clamped():
    assert parse_analysis(json.dumps({"relevance": 250}))["relevance"] == 100
    assert parse_analysis(json.dumps({"relevance": -5}))["relevance"] == 0
    assert parse_analysis(json.dumps({"relevance": "oops"}))["relevance"] == 0


def test_defaults_filled():
    data = parse_analysis(json.dumps({"relevance": 50}))
    assert data["pain_quotes"] == []
    assert data["theme"] == "Uncategorized"
    assert data["sentiment"] == "unknown"


def test_invalid_json_raises():
    with pytest.raises(json.JSONDecodeError):
        parse_analysis("not json at all")


def test_build_prompt_includes_fields():
    prompt = build_prompt(
        {
            "subreddit": "managers",
            "score": 10,
            "num_comments": 3,
            "title": "Help",
            "selftext": "I am overwhelmed",
            "comments": ["me too"],
        }
    )
    assert "r/managers" in prompt
    assert "I am overwhelmed" in prompt
    assert "me too" in prompt
