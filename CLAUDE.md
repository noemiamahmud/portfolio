# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Noemia L. Mahmud — a multi-page static site with a dark-mode design. Features an animated neural network canvas banner on every page.

## Tech Stack

- Plain HTML/CSS/JS (no build tools, no bundler, no framework)
- Google Fonts (Inter)
- Canvas API for the animated neural network banner
- Hosted as a static site (GitHub Pages compatible)

## Development

Open `index.html` in a browser or run `python3 -m http.server`. No build step.

## Architecture

3-page site with shared `styles.css` and `script.js`:

- **`index.html`** — Home: combines intro/about (rectangular avatar, bio, resume link), experience timeline, and skills grid.
- **`projects.html`** — Full project grid with category filter bar and click-to-open detail modals.
- **`contact.html`** — Contact links + message form (no backend — form is cosmetic).
- **`styles.css`** — Dark-mode design system using CSS custom properties (`--color-*`). Responsive breakpoints at 900px, 768px, 480px. Uses `--banner-h` for the neural banner height.
- **`script.js`** — Neural network canvas animation (IIFE at top), navbar scroll shadow, mobile hamburger menu, project filtering by `data-category`, modal logic reading from `projectData` object, hash-based deep-linking to project modals.

## Key Patterns

- All project content (descriptions, tech stacks, links) lives in the `projectData` object in `script.js`. To add/edit a project, update that object and add a matching card in `projects.html`.
- Project cards use `data-category` for filtering and `data-project` to key into `projectData` for the modal.
- URL hash deep-linking: `projects.html#melodify` auto-opens that project's modal on page load.
- The neural banner is drawn on a `<canvas id="neural-canvas">` inside `.neural-banner` on every page. The animation (floating nodes + connecting lines) runs via `requestAnimationFrame` in the IIFE at the top of `script.js`.
- Project modals are large (max-width 960px, near full-viewport height). Click the backdrop or press Escape to close.
- Image placeholders: cards without images show `[Image Placeholder]` text. To add a real image, insert an `<img>` inside `.project-card-img`.
- Experience logos: the Brookhaven National Lab entry has a text placeholder (`BNL`) in `.exp-logo` — replace with an `<img>` tag for the real logo.
- The navbar, footer, banner, and font imports are duplicated across all 3 HTML files (no templating system).
- Images are stored at the repo root alongside source files.




