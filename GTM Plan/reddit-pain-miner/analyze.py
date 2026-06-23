"""Analyze candidate threads with Claude (Opus 4.8, structured output).

For each thread Claude returns: an ICP-relevance score, verbatim pain quotes,
a theme label, sentiment, and a content angle. Structured outputs guarantee the
response parses to the schema below.
"""
from __future__ import annotations

import json
import re

import config

# Models sometimes emit literal escape sequences (e.g. "—" for an em-dash)
# inside JSON string values. Decode those to real characters so the report reads
# cleanly.
_ESCAPE_RE = re.compile(r"\\u([0-9a-fA-F]{4})")


def _decode_escapes(s: str) -> str:
    return _ESCAPE_RE.sub(lambda m: chr(int(m.group(1), 16)), s)

# JSON schema the model is constrained to. Note: structured outputs don't
# support numeric range constraints, so `relevance` is a plain integer and we
# clamp it in parse_analysis().
ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "relevance": {"type": "integer"},
        "pain_quotes": {"type": "array", "items": {"type": "string"}},
        "theme": {"type": "string"},
        "sentiment": {"type": "string"},
        "content_angle": {"type": "string"},
        "reasoning": {"type": "string"},
    },
    "required": [
        "relevance",
        "pain_quotes",
        "theme",
        "sentiment",
        "content_angle",
        "reasoning",
    ],
    "additionalProperties": False,
}

SYSTEM = f"""You are a B2B content researcher for FocusLab, a productivity tool. \
Analyze ONE Reddit thread, judge how well it matches FocusLab's ideal-customer \
pain point, and extract content-ready material.

IDEAL CUSTOMER (ICP):
{config.ICP_DEFINITION}

Return, via the required schema:
- relevance: integer 0-100. How strongly this thread reflects the ICP pain \
(overwhelmed manager / can't switch off / always thinking about work / buried in \
low-value work). 0 = unrelated; 100 = textbook match. Be strict — a generic \
"I hate my job", a pay complaint, or a bad-boss rant scores low even when emotional.
- pain_quotes: 1-4 SHORT verbatim quotes (the user's exact words, copied from the \
post or comments — never paraphrased) that capture the pain in their own voice. \
Empty array if there are none worth quoting.
- theme: a short 2-5 word label for the underlying pain \
(e.g. "Can't switch off after hours", "Buried in meetings", "Reactive firefighting").
- sentiment: exactly one of: venting, resigned, seeking help, frustrated, hopeful.
- content_angle: one sentence describing a piece of content FocusLab could create \
that speaks directly to this person's pain in their language.
- reasoning: one sentence on why you scored relevance the way you did."""


def build_prompt(candidate: dict) -> str:
    """Assemble the user-turn text for one candidate thread."""
    selftext = (candidate.get("selftext") or "")[: config.MAX_SELFTEXT_CHARS]
    comments = candidate.get("comments") or []
    comment_block = "\n".join(
        f"- {c[: config.MAX_COMMENT_CHARS]}" for c in comments
    ) or "(none fetched)"

    return (
        f"Subreddit: r/{candidate.get('subreddit', '?')}\n"
        f"Upvotes: {candidate.get('score', 0)} | "
        f"Comments: {candidate.get('num_comments', 0)}\n\n"
        f"TITLE:\n{candidate.get('title', '')}\n\n"
        f"BODY:\n{selftext or '(no body text)'}\n\n"
        f"TOP COMMENTS:\n{comment_block}\n"
    )


def parse_analysis(text: str) -> dict:
    """Parse and normalize the model's JSON response. Raises on invalid JSON."""
    data = json.loads(text)
    try:
        relevance = int(data.get("relevance", 0))
    except (TypeError, ValueError):
        relevance = 0
    data["relevance"] = max(0, min(100, relevance))
    quotes = data.get("pain_quotes") or []
    data["pain_quotes"] = [_decode_escapes(str(q)) for q in quotes if str(q).strip()]
    data["theme"] = _decode_escapes((data.get("theme") or "Uncategorized").strip())
    data["sentiment"] = (data.get("sentiment") or "unknown").strip()
    data["content_angle"] = _decode_escapes((data.get("content_angle") or "").strip())
    data["reasoning"] = _decode_escapes((data.get("reasoning") or "").strip())
    return data


def _first_text_block(resp):
    for block in resp.content:
        if getattr(block, "type", None) == "text":
            return block.text
    return None


def analyze_candidate(client, candidate: dict) -> dict | None:
    """Run one candidate through Claude. Returns the analysis dict, or None on failure."""
    try:
        resp = client.messages.create(
            model=config.MODEL,
            max_tokens=1024,
            system=SYSTEM,
            messages=[{"role": "user", "content": build_prompt(candidate)}],
            output_config={"format": {"type": "json_schema", "schema": ANALYSIS_SCHEMA}},
        )
        if resp.stop_reason == "refusal":
            print(f"  ! analysis refused for {candidate['id']}")
            return None
        text = _first_text_block(resp)
        if not text:
            return None
        return parse_analysis(text)
    except Exception as exc:  # one bad thread must never kill the run
        print(f"  ! analysis failed for {candidate['id']}: {exc}")
        return None


def analyze_all(client, candidates: list[dict]) -> list[dict]:
    """Analyze candidates, keep those at/above the relevance threshold.

    Returns a list of flat result dicts ready for ranking and reporting.
    """
    results: list[dict] = []
    total = len(candidates)
    for i, c in enumerate(candidates, 1):
        print(f"  analyzing {i}/{total}: {c['title'][:70]!r}")
        analysis = analyze_candidate(client, c)
        if not analysis:
            continue
        if analysis["relevance"] < config.RELEVANCE_THRESHOLD:
            continue
        engagement = c.get("score", 0) + c.get("num_comments", 0)
        # Relevance-led ranking. When engagement is available (0 from RSS), it
        # nudges ordering; when it isn't, ranking is purely by relevance.
        rank_score = round(analysis["relevance"] * (1 + engagement / 100.0), 2)
        results.append(
            {
                "id": c["id"],
                "title": c["title"],
                "permalink": c["permalink"],
                "subreddit": c["subreddit"],
                "score": c.get("score", 0),
                "num_comments": c.get("num_comments", 0),
                "created_utc": c["created_utc"],
                "engagement": engagement,
                "rank_score": rank_score,
                **analysis,
            }
        )
    return results
