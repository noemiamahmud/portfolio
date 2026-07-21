# Noemia L. Mahmud — Portfolio

Personal portfolio showcasing research, internships, and projects at the intersection of
neuroscience, AI, and software engineering.

Built from scratch — no frameworks, no build step, no dependencies.

## Running locally

Open `index.html` in a browser, or start a local server:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Pages

- **index.html** — Hero with an interactive particle field, about, animated stats,
  scroll-linked experience timeline, selected work, skills
- **projects.html** — Filterable project grid with detail modals
- **contact.html** — Contact links and message form (Formspree)

## GitHub activity panel

The hero shows a live contribution heatmap, streaks, and a language breakdown.

It renders instantly from a snapshot inlined in `index.html`, then refreshes the calendar in
the background (cached 6 hours). If the network or the upstream service is unavailable, the
snapshot stays on screen and the badge reads `CACHED` instead of `LIVE` — it never shows an
error or an empty box.

To refresh the committed baseline:

```bash
python3 scripts/update-github-stats.py
```

## Features

- Interactive canvas particle field that reacts to the cursor
- Light / dark theme, remembered across visits
- Command palette (⌘K / Ctrl+K) to jump to any page, project, or action
- Scroll-linked timeline, animated counters, tilt + spotlight cards, magnetic buttons
- Deep links: `projects.html#datathon` opens that project; `projects.html?filter=web` preselects a filter
- Keyboard accessible throughout (Tab, Enter/Space, Escape, ←/→ between projects)
- Honors `prefers-reduced-motion` — all animation is disabled for users who ask for it

## Adding a project

1. Add an entry to the `projectData` object in `script.js` (module 12). The `content()`
   function returns the modal's HTML.
2. Add a matching card in `projects.html`:

```html
<article class="card" data-category="ml" data-project="my-project" id="my-project"
         role="button" tabindex="0" aria-label="Open My Project" data-tilt data-reveal>
  <div class="card-media">
    <img src="img/my-project.jpg" alt="…" loading="lazy" decoding="async" />
    <span class="card-open">…</span>
  </div>
  <div class="card-body">
    <h3>My Project</h3>
    <p>One or two sentences on what it does and why it's interesting.</p>
    <div class="card-meta"><span class="chip">Machine Learning</span></div>
  </div>
</article>
```

The filter counts, command palette entry, and modal prev/next order all update automatically.

## Images

Web-optimized images live in `img/` (JPEG, max 1600px, quality 72). The full-resolution
originals stay at the repo root as archives — always reference the `img/` copies.

To add a new one:

```bash
sips -s format jpeg -s formatOptions 72 -Z 1600 "original.png" --out "img/name.jpg"
```

Recommended: 16:10 for cards, 16:9 for modal images, 4:5 for the portrait.
