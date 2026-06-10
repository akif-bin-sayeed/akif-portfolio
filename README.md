# Akif Bin Sayeed Portfolio — Black/Blue/Green Dynamic Version

This is a static portfolio website with a lightweight dashboard. It does **not** use Netlify Identity or Netlify CMS.

## What is included

- Dynamic black → blue → green visual design
- Animated hero section and floating research chips
- SAF floating badge removed
- GIS and RS chips move away when the cursor is placed on the ABS photo/profile box
- Certificate Corner section
- Gallery section
- Contact form prepared for Netlify Forms
- Static dashboard at `/dashboard/` for editing website data
- Data stored in `data/profile.json`

## Deploy

1. Upload all files to your existing GitHub repository root.
2. Make sure `index.html` is directly in the root, not inside another folder.
3. Netlify will redeploy automatically.
4. Open the live site.

## Use the dashboard

Open:

```text
https://your-site.netlify.app/dashboard/
```

Edit content, click **Download profile.json**, then replace:

```text
data/profile.json
```

in GitHub and commit changes.

## Activate contact form

1. Deploy to Netlify.
2. Open the live site.
3. Submit a test contact message.
4. Go to Netlify → Project → Forms.
5. You should see the `contact` form submissions.

## Photo workflow

Best performance:

- Upload profile photo to `assets/images/profile/`
- Upload gallery photos to `assets/images/gallery/`
- Upload certificate images to `assets/images/certificates/`
- Add paths in dashboard, for example:

```text
assets/images/profile/akif.jpg
assets/images/gallery/fieldwork-1.jpg
assets/images/certificates/hult-prize.jpg
```

Quick Android workflow:

- Use the dashboard's image embed option.
- Download the updated `profile.json`.
- Upload it to GitHub.

For many images, do not embed too many base64 images because the JSON file becomes heavy.
