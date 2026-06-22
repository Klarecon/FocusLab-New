"""Persistence: the seen-thread set (so reports surface NEW pain only) and a
raw per-run JSON archive.
"""
from __future__ import annotations

import json
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
SEEN_PATH = os.path.join(_HERE, "seen_ids.json")
ARCHIVE_DIR = os.path.join(_HERE, "archive")


def load_seen() -> set[str]:
    if not os.path.exists(SEEN_PATH):
        return set()
    try:
        with open(SEEN_PATH, "r", encoding="utf-8") as f:
            return set(json.load(f))
    except (json.JSONDecodeError, OSError):
        return set()


def save_seen(ids: set[str]) -> None:
    with open(SEEN_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted(ids), f, indent=2)


def archive_run(date_str: str, results: list[dict]) -> str:
    os.makedirs(ARCHIVE_DIR, exist_ok=True)
    path = os.path.join(ARCHIVE_DIR, f"{date_str}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    return path
