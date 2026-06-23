#!/usr/bin/env python3
"""Reddit Pain Miner — orchestrator.

Pipeline:  fetch -> keyword pre-filter -> drop already-seen -> cap -> enrich
           with comments -> Claude analysis -> rank -> store -> HTML report.

Usage:
    python run.py              # full live run (needs .env credentials)
    python run.py --dry-run    # no network; builds a sample report from fixtures
    python run.py --max 15     # override the per-run analysis cap for this run
"""
from __future__ import annotations

import argparse
import json
import os
from datetime import date

import config
import report
import store

_HERE = os.path.dirname(os.path.abspath(__file__))


def _load_env() -> None:
    """Load .env if python-dotenv is available; harmless if it isn't."""
    try:
        from dotenv import load_dotenv

        load_dotenv(os.path.join(_HERE, ".env"))
    except ImportError:
        pass


def run_live(max_analyze: int) -> None:
    import reddit_fetch
    import analyze
    import anthropic

    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise SystemExit(
            "Missing ANTHROPIC_API_KEY in .env. See README.md > Setup."
        )

    print("Collecting candidate threads from Reddit (public RSS feeds, no login)...")
    candidates = reddit_fetch.collect_candidates()
    scanned = len(candidates)
    print(f"  {scanned} unique threads pulled.")

    matched = [c for c in candidates if reddit_fetch.candidate_matches(c)]
    print(f"  {len(matched)} passed the keyword pre-filter.")

    seen = store.load_seen()
    fresh = [c for c in matched if c["id"] not in seen]
    print(f"  {len(fresh)} are new (not in previous reports).")

    # RSS gives no engagement signal pre-analysis, so cap by feed order (newest
    # /top feeds first) to control cost; Claude's relevance score does the real
    # ranking afterwards.
    to_analyze = fresh[:max_analyze]
    print(f"  analyzing top {len(to_analyze)} (cap {max_analyze})...")

    print("Analyzing with Claude...")
    client = anthropic.Anthropic()
    results = analyze.analyze_all(client, to_analyze)
    results.sort(key=lambda r: r["rank_score"], reverse=True)
    print(f"  {len(results)} threads scored >= {config.RELEVANCE_THRESHOLD} relevance.")

    stats = {
        "scanned": scanned,
        "matched": len(matched),
        "analyzed": len(to_analyze),
        "included": len(results),
    }
    _finish(results, stats, mark_seen=[c["id"] for c in to_analyze], seen=seen)


def run_dry() -> None:
    """Build a report from recorded fixtures — no network, no API spend."""
    fixture = os.path.join(_HERE, "tests", "fixtures", "sample_results.json")
    with open(fixture, "r", encoding="utf-8") as f:
        results = json.load(f)
    results.sort(key=lambda r: r["rank_score"], reverse=True)
    stats = {
        "scanned": 120,
        "matched": 38,
        "analyzed": len(results),
        "included": len(results),
    }
    print(f"[dry-run] building report from {len(results)} fixture results...")
    _finish(results, stats, mark_seen=[], seen=set(), dry=True)


def _finish(results, stats, mark_seen, seen, dry: bool = False) -> None:
    date_str = date.today().isoformat()
    if not dry:
        archive_path = store.archive_run(date_str, results)
        print(f"  archived raw results -> {archive_path}")
        store.save_seen(seen | set(mark_seen))
    report_path = report.write_report(results, stats, date_str)
    print(f"\nDone. Report written to:\n  {report_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Reddit Pain Miner")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Build a sample report from fixtures (no network, no API spend).",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=config.MAX_ANALYZE,
        help=f"Override per-run analysis cap (default {config.MAX_ANALYZE}).",
    )
    args = parser.parse_args()

    _load_env()
    if args.dry_run:
        run_dry()
    else:
        run_live(args.max)


if __name__ == "__main__":
    main()
