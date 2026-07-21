# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Noemia L. Mahmud — a 3-page static site with a dark-first
"neural editorial" design system, an interactive particle-field hero, and a command palette.

## Tech Stack

- Plain HTML/CSS/JS (no build tools, no bundler, no framework, no dependencies)
- Google Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (labels), Instrument Serif (italic accents)
- Canvas API for the hero particle field
- Hosted as a static site (GitHub Pages compatible)

## Development

Open `index.html` in a browser or run `python3 -m http.server`. No build step.

## Architecture

3 pages sharing `styles.css` and `script.js`:

- **`index.html`** — Hero, tech marquee, about + animated stat counters, scroll-linked
  experience timeline, selected work, skills, CTA band.
- **`projects.html`** — Filterable project grid with click-to-open detail modals.
- **`contact.html`** — Contact cards (with copy-to-clipboard) + Formspree message form.
- **`styles.css`** — Numbered sections (1 reset → 22 print). Design tokens live in `:root`;
  the light theme overrides them under `[data-theme="light"]`. All motion is gated behind
  `prefers-reduced-motion` in section 21.
- **`script.js`** — Numbered modules (1 utils → 18 hero entrance). `projectData` (module 12)
  holds every project's modal content.
- **`img/`** — Web-optimized derivatives (JPEG, ≤1600px, quality 72) of the originals that
  sit at the repo root. **Reference `img/` paths only**; the root-level originals are archives.
- **`scripts/update-github-stats.py`** — regenerates the GitHub snapshot inlined in `index.html`.

## GitHub activity panel

Lives in the hero's right column (`#gh-panel`), rendered by module 11b of `script.js`.

- **Why a snapshot exists**: GitHub's contribution calendar is GraphQL-only and requires a
  token on every request. A token cannot ship in client-side JS, so the committed snapshot is
  the baseline and a public no-auth proxy provides the live refresh.
- **Render order**: the inlined `<script type="application/json" id="gh-data">` paints
  immediately (no request; works over `file://`), then the calendar is refetched in the
  background, cached in `localStorage` for 6h, and swapped in. The badge reads `LIVE` on a
  successful refresh and `CACHED` otherwise. **A failed fetch is silent** — the snapshot stays
  on screen and no error is shown.
- **Only the calendar refreshes live.** Languages and repo count come from the snapshot, which
  keeps this to one small request and avoids GitHub's 60 req/hr unauthenticated REST limit.
- **Refresh the baseline** with `python3 scripts/update-github-stats.py` (rewrites only the
  `gh-data` block). A scheduled GitHub Action could run the same script.
- Stats shown are contributions, active days, longest streak, and public non-fork repos.
  Stars and followers are deliberately omitted. Streaks and level bucketing (quartiles over
  active days) are derived client-side, so both render paths share one implementation.
- A public commit feed is **not possible** for this account — `/users/:user/events/public`
  returns 0 events because the recent work is in private and org repos. The calendar still
  counts it. Don't add an "activity feed" expecting data.

## Key Patterns

- **Theme**: an inline script in each `<head>` reads `localStorage.theme` before first paint to
  avoid a flash. Dark is the default; light is opt-in via the toggle. The canvas re-reads its
  palette on the `themechange` event.
- **Adding a project**: add an entry to `projectData` in `script.js` *and* a matching
  `<article class="card" data-project="key" data-category="…">` in `projects.html`. The two key
  sets must stay identical — modal prev/next order follows DOM card order, and filter counts are
  derived from the DOM at runtime (never hard-code them).
- **Deep links**: `projects.html#datathon` auto-opens that modal; the hash updates as you
  navigate between projects. `?filter=web` preselects a filter.
- **Command palette** (⌘K / Ctrl+K): built in module 15 from `projectData` plus static
  navigation and action entries — new projects appear in it automatically.
- **Cards** are `role="button"` + `tabindex="0"` on the projects page (Enter/Space open the
  modal) but plain `<a>` links on the home page.
- **Cursor-tracked effects**: `.card`, `.skill-card`, and `.tl-card` get `--mx`/`--my` custom
  properties set on pointermove, which drive the radial spotlight. `[data-tilt]` adds 3D tilt and
  `[data-magnetic]` adds magnetic pull — both are skipped on touch and reduced-motion.
- The navbar, footer, command palette, toast, and font links are duplicated across all 3 HTML
  files (no templating system) — edit all three together.
