# AKIF BIN SAYEED Portfolio V2.3

This is the fixed dark-only Supabase portfolio package.

## Main fixes in V2.3
- Public site no longer crashes if the ABS visual title element is missing.
- Profile image upload now displays correctly on the public site.
- Logo and profile image uploads auto-save after upload.
- Old/legacy JSON data is migrated automatically into the new V2 structure.
- Floating labels are loaded from both old `personal.floatingChips` and new `hero.floatingLabels` structures.
- Dashboard scrolling is fixed to use one natural page scroll.
- Light theme is removed. The website is dark-only.

## Deploy
Upload the inside files to GitHub:

```text
index.html
app/
assets/
data/
sql/
thanks.html
netlify.toml
README.md
```

Then wait for Netlify to deploy.

## After deploy
Open:

```text
https://your-site.netlify.app/app/
```

Login, then use the dashboard. If the public site still shows old data, click **Seed starter content** once in the dashboard, or run:

```text
sql/update-site-content-v2-2.sql
```

in Supabase SQL Editor.
