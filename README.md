# Noemia L. Mahmud — Portfolio

Personal portfolio website showcasing internships, research, projects, and extracurriculars.

## Running locally

Open `index.html` in a browser, or start a local server:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Pages

- **index.html** — Home / landing with hero, Sketchfab 3D model, experience timeline, featured projects
- **projects.html** — Full project grid with category filtering and detail modals
- **about.html** — Visual resume: skills, education, research interests
- **contact.html** — Contact info and message form

## Replacing image placeholders

Project cards and the about page use placeholder slots for images. To add a real image:

1. Add your image file to the repo root (or an `images/` folder if you prefer).
2. In the relevant HTML file, find the `<div class="project-card-img">` for the project you want to update.
3. Replace the `[Image Placeholder]` text with an `<img>` tag:

```html
<!-- Before -->
<div class="project-card-img">[Image Placeholder]</div>

<!-- After -->
<div class="project-card-img">
  <img src="your-image.jpg" alt="Project name" />
</div>
```

4. For the about page headshot, the `<div class="about-avatar">` already references `IMG_6375.JPG`. Replace that `src` with a different photo if desired.

5. For project modal images: if a card has an `<img>` inside `.project-card-img`, the modal will automatically display that same image. No additional change needed.

Recommended image dimensions:
- **Project cards:** 16:10 aspect ratio (e.g. 800x500)
- **Modal images:** 16:9 aspect ratio (e.g. 1280x720)
- **About avatar:** Square (e.g. 400x400)
