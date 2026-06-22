"""Tests for the keyword pre-filter — pure, no network."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reddit_fetch import candidate_matches, keyword_match  # noqa: E402


def test_keyword_match_hits():
    assert keyword_match("I'm so overwhelmed at work")
    assert keyword_match("I just CAN'T SWITCH OFF anymore")  # case-insensitive
    assert keyword_match("always thinking about work even on weekends")
    assert keyword_match("total burnout this quarter")


def test_keyword_match_misses():
    assert not keyword_match("My boss gave me a raise today")
    assert not keyword_match("Looking for a new job, any tips?")
    assert not keyword_match("")
    assert not keyword_match(None)


def test_candidate_matches_title_or_body():
    assert candidate_matches({"title": "Drowning in work", "selftext": ""})
    assert candidate_matches({"title": "Question", "selftext": "I can't unplug ever"})
    assert not candidate_matches({"title": "Hello", "selftext": "Nice weather"})
