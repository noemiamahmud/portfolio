#!/usr/bin/env python3
"""Regenerate the GitHub snapshot inlined in index.html.

The page paints from this snapshot instantly (no request, works over file://)
and then refreshes the contribution calendar in the background. Re-run this
whenever you want the committed baseline to catch up:

    python3 scripts/update-github-stats.py

It rewrites only the <script type="application/json" id="gh-data"> block.

Sources, both public and unauthenticated:
  - contribution calendar : github-contributions-api.jogruber.de
  - repos / languages     : api.github.com  (60 req/hr per IP)

GitHub's own contribution calendar is GraphQL-only and needs a token for every
query, which is why it cannot be fetched from the browser on a static site.
"""

import json
import pathlib
import re
import sys
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone

USER = "noemiamahmud"
ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
UA = {"User-Agent": f"{USER}-portfolio-stats"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    try:
        cal = get(f"https://github-contributions-api.jogruber.de/v4/{USER}?y=last")
        profile = get(f"https://api.github.com/users/{USER}")
        repos = get(f"https://api.github.com/users/{USER}/repos?per_page=100&sort=pushed")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"fetch failed: {e}", file=sys.stderr)
        return 1

    days = cal.get("contributions") or []
    if not days:
        print("no contribution data returned", file=sys.stderr)
        return 1

    # Forks are someone else's work; don't count them as hers.
    owned = [r for r in repos if not r["fork"]]
    langs = Counter(r["language"] for r in owned if r["language"])

    snapshot = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "user": USER,
        "publicRepos": len(owned),
        "languages": langs.most_common(6),
        "calendar": {
            "start": days[0]["date"],
            "counts": [d["count"] for d in days],
        },
    }

    blob = json.dumps(snapshot, separators=(",", ":"))
    html = INDEX.read_text()
    pattern = re.compile(
        r'(<script type="application/json" id="gh-data">).*?(</script>)', re.S
    )
    if not pattern.search(html):
        print("gh-data block not found in index.html", file=sys.stderr)
        return 1

    INDEX.write_text(pattern.sub(lambda m: m.group(1) + blob + m.group(2), html, count=1))

    total = sum(snapshot["calendar"]["counts"])
    active = sum(1 for c in snapshot["calendar"]["counts"] if c > 0)
    print(
        f"updated index.html — {total} contributions, {active} active days, "
        f"{len(owned)} repos, {len(blob)} bytes"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
