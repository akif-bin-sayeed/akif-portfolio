# Akif Bin Sayeed Portfolio Website

This is a complete static portfolio website with an online admin panel. It is built from the provided CV/profile content and is ready to deploy on Netlify.

## Design update included

This version has a richer blue-to-green visual system and a more polished interaction layer:

- Bluish-green premium gradient palette
- Animated ambient background, subtle grain, and scroll progress bar
- Smooth section reveal animations
- Animated number counters for key stats
- Interactive hover/tilt cards
- Better project, gallery, skill, education, and experience card styling
- Active navigation highlight while scrolling
- Dark/light mode retained
- Human-looking portfolio copy and fieldwork-oriented design details

## What is included

- Responsive portfolio homepage
- Interactive experience filters
- Expandable experience cards
- Project cards
- Skills, education, achievements and gallery sections
- Contact form using Netlify Forms
- Dark/light theme toggle
- `/admin/` content management panel using Decap CMS + Netlify Identity
- Fallback local JSON editor at `/admin/local-editor.html`

## Best deployment option: Netlify with admin panel

1. Create a GitHub repository and upload all files from this folder.
2. Go to Netlify and choose **Add new site → Import an existing project**.
3. Connect the GitHub repository.
4. Build settings:
   - Build command: leave empty
   - Publish directory: `.`
5. Deploy the site.
6. In Netlify, open **Site configuration → Identity** and enable Identity.
7. In **Identity → Services**, enable **Git Gateway**.
8. Invite yourself as a user under Identity.
9. Visit `https://your-site-name.netlify.app/admin/` and log in.
10. Edit your portfolio content from the admin panel and publish changes.

## Add photos or files

From `/admin/`, use the image fields for:

- Profile image
- Gallery images

Uploaded images will be stored in `assets/uploads/`.

Recommended sizes:

- Profile photo: 800 × 800 px
- Gallery/event photos: 1200 × 800 px
- Project photos: 1200 × 700 px

For speed, keep most images below 1–2 MB when possible.

## Update site content manually

All main text is inside:

```text
data/profile.json
```

You can edit this JSON directly, or use:

```text
/admin/local-editor.html
```

The local editor lets you edit and download a new `profile.json` file. Replace the old file with the downloaded one.

## GitHub Pages note

The public website will work on GitHub Pages, but the `/admin/` editing panel needs Netlify Identity + Git Gateway. For the easiest update workflow, use Netlify.

## Suggested next additions

- Add your real email and social profile links in `data/profile.json`
- Add a professional headshot in `assets/uploads/` and set `personal.profileImage`
- Upload your final CV PDF and set `personal.resumeFile`
- Add publication links, Google Scholar, ResearchGate, GitHub and Google Earth Engine app links when ready
- Replace gallery placeholders with fieldwork, event and presentation photos

## Local preview

Run a small local server from this folder:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Do not open `index.html` directly by double-clicking, because the browser may block loading `data/profile.json` from local files.
