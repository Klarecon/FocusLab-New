"""Render the analyzed results into a dated HTML report in /GTM Plan/.

Styled to match the existing GTM artifacts: warm cream background, serif
headers, FocusLab pink accents. Reads like a briefing, not a data dump.
"""
from __future__ import annotations

import html
import os
from datetime import datetime, timezone

# /GTM Plan/ is the parent of this tool's folder.
_HERE = os.path.dirname(os.path.abspath(__file__))
GTM_DIR = os.path.dirname(_HERE)

PINK = "#c4186a"
ORANGE = "#e03e12"
GOLD = "#edb215"

_SENTIMENT_COLORS = {
    "venting": ORANGE,
    "frustrated": ORANGE,
    "resigned": "#8a7e70",
    "seeking help": PINK,
    "hopeful": GOLD,
}


def _esc(text: str) -> str:
    return html.escape(str(text), quote=True)


def _fmt_date(created_utc: float) -> str:
    if not created_utc:
        return ""
    return datetime.fromtimestamp(created_utc, tz=timezone.utc).strftime("%b %d, %Y")


def _group_by_theme(results: list[dict]) -> list[tuple[str, list[dict]]]:
    themes: dict[str, list[dict]] = {}
    for r in results:
        themes.setdefault(r.get("theme", "Uncategorized"), []).append(r)
    # Themes ranked by total rank_score; threads within a theme likewise.
    for items in themes.values():
        items.sort(key=lambda x: x.get("rank_score", 0), reverse=True)
    return sorted(
        themes.items(),
        key=lambda kv: sum(x.get("rank_score", 0) for x in kv[1]),
        reverse=True,
    )


def _thread_card(r: dict) -> str:
    sentiment = r.get("sentiment", "unknown")
    s_color = _SENTIMENT_COLORS.get(sentiment.lower(), "#8a7e70")
    quotes = "".join(
        f'<blockquote class="quote">{_esc(q)}</blockquote>'
        for q in r.get("pain_quotes", [])
    )
    angle = r.get("content_angle", "")
    angle_html = (
        f'<div class="angle"><span class="angle-label">Content angle</span>{_esc(angle)}</div>'
        if angle
        else ""
    )
    # Build the meta line; only show upvotes/comments when we actually have them
    # (RSS feeds report 0, so they're omitted there).
    parts = [f"r/{_esc(r.get('subreddit',''))}"]
    if r.get("score", 0):
        parts.append(f"{r['score']} upvotes")
    if r.get("num_comments", 0):
        parts.append(f"{r['num_comments']} comments")
    parts.append(f"relevance {r.get('relevance',0)}/100")
    date = _fmt_date(r.get("created_utc", 0))
    if date:
        parts.append(date)
    meta = " &nbsp;·&nbsp; ".join(parts)
    return f"""
      <div class="card">
        <div class="card-head">
          <a class="card-title" href="{_esc(r.get('permalink',''))}" target="_blank" rel="noopener">{_esc(r.get('title',''))}</a>
          <span class="badge" style="background:{s_color}">{_esc(sentiment)}</span>
        </div>
        <div class="meta">{meta}</div>
        {quotes}
        {angle_html}
      </div>"""


def _theme_section(theme: str, items: list[dict]) -> str:
    cards = "".join(_thread_card(r) for r in items)
    return f"""
    <section class="theme">
      <h2 class="theme-title">{_esc(theme)}</h2>
      <div class="theme-meta">{len(items)} thread{'s' if len(items) != 1 else ''}</div>
      {cards}
    </section>"""


def render_html(results: list[dict], generated_on: str, stats: dict) -> str:
    """Return the full HTML document as a string."""
    if results:
        body = "".join(_theme_section(t, items) for t, items in _group_by_theme(results))
        themes_count = len({r.get("theme") for r in results})
        summary = (
            f"{len(results)} new high-relevance threads across {themes_count} "
            f"pain themes."
        )
    else:
        body = (
            '<section class="theme"><h2 class="theme-title">No new pain found</h2>'
            '<p class="empty">No new high-relevance threads this run. The miner ran '
            "successfully — there just wasn&rsquo;t fresh signal above the relevance "
            "threshold. Try widening the keyword list or lowering the threshold in "
            "<code>config.py</code>.</p></section>"
        )
        summary = "No new high-relevance threads this run."

    stat_line = (
        f"Scanned {stats.get('scanned', 0)} threads &nbsp;·&nbsp; "
        f"{stats.get('matched', 0)} passed keyword filter &nbsp;·&nbsp; "
        f"{stats.get('analyzed', 0)} analyzed by Claude &nbsp;·&nbsp; "
        f"{stats.get('included', 0)} made the report"
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reddit Pain Report — {_esc(generated_on)}</title>
<style>
  :root {{ --pink:{PINK}; --orange:{ORANGE}; --gold:{GOLD}; }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; background: #faf6ef; color: #2b2622;
    font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
    line-height: 1.55;
  }}
  .wrap {{ max-width: 860px; margin: 0 auto; padding: 48px 24px 96px; }}
  header.top {{ border-bottom: 3px solid var(--pink); padding-bottom: 20px; margin-bottom: 36px; }}
  h1 {{
    font-family: Georgia, 'Fraunces', serif; font-size: 2.4rem; line-height: 1.1;
    margin: 0 0 6px; color: #1c1916;
  }}
  .subtitle {{ color: var(--pink); font-weight: 600; font-size: 1.05rem; }}
  .generated {{ color: #8a7e70; font-size: 0.9rem; margin-top: 4px; }}
  .stats {{
    background: #fff; border: 1px solid #ece4d8; border-radius: 12px;
    padding: 14px 18px; font-size: 0.88rem; color: #6b6358; margin-bottom: 40px;
  }}
  .theme {{ margin-bottom: 48px; }}
  .theme-title {{
    font-family: Georgia, 'Fraunces', serif; font-size: 1.7rem; margin: 0 0 2px;
    color: #1c1916;
  }}
  .theme-meta {{ color: #a59a8c; font-size: 0.82rem; text-transform: uppercase;
    letter-spacing: 0.04em; margin-bottom: 18px; }}
  .card {{
    background: #fff; border: 1px solid #ece4d8; border-radius: 14px;
    padding: 22px 24px; margin-bottom: 18px;
  }}
  .card-head {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }}
  .card-title {{ font-weight: 700; font-size: 1.08rem; color: #1c1916; text-decoration: none; }}
  .card-title:hover {{ color: var(--pink); text-decoration: underline; }}
  .badge {{
    color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 10px;
    border-radius: 999px; white-space: nowrap; text-transform: lowercase;
  }}
  .meta {{ color: #8a7e70; font-size: 0.84rem; margin: 8px 0 14px; }}
  .quote {{
    margin: 0 0 10px; padding: 10px 16px; border-left: 3px solid var(--orange);
    background: #fdf0ec; border-radius: 0 8px 8px 0; font-style: italic; color: #4a3f37;
  }}
  .angle {{ margin-top: 12px; font-size: 0.95rem; }}
  .angle-label {{
    display: inline-block; background: var(--pink); color: #fff; font-size: 0.7rem;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    padding: 2px 8px; border-radius: 6px; margin-right: 8px;
  }}
  .empty {{ color: #6b6358; }}
  code {{ background: #f0e9dd; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }}
  footer {{ margin-top: 60px; color: #a59a8c; font-size: 0.8rem; text-align: center; }}
</style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <h1>Reddit Pain Report</h1>
      <div class="subtitle">{_esc(summary)}</div>
      <div class="generated">Generated {_esc(generated_on)} · FocusLab Reddit Pain Miner</div>
    </header>
    <div class="stats">{stat_line}</div>
    {body}
    <footer>Sorted by engagement × relevance. Quotes are verbatim from Reddit. Click any title to open the thread.</footer>
  </div>
</body>
</html>"""


def write_report(results: list[dict], stats: dict, date_str: str) -> str:
    """Render and write the report into /GTM Plan/. Returns the file path."""
    generated_on = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    html_doc = render_html(results, generated_on, stats)
    path = os.path.join(GTM_DIR, f"{date_str}-reddit-pain-report.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html_doc)
    return path
