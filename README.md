# Akif Bin Sayeed Portfolio Website Version 2.0

This package contains a dynamic portfolio website and a private mobile-friendly admin app powered by Supabase.

## Public website

- `index.html`
- Black → blue → green premium visual design
- Animated hero area
- ABS visual box with floating labels that vanish and move away on hover
- Gallery keeps image ratios and does not force-crop images
- Dynamic content from Supabase

## Private app

Open after deployment:

```text
https://your-site.netlify.app/app/
```

You can edit from Android/laptop:

- All titles
- Navigation labels
- Section titles/subtitles
- Hero content
- ABS floating labels
- About
- Education
- Experience
- Projects
- Skills
- Research highlights
- Certificates
- Gallery
- Posts
- Messages
- Contact information
- Raw JSON

## Setup steps

1. Upload the package files to your GitHub repository.
2. Deploy the GitHub repository on Netlify.
3. In Supabase SQL Editor, run:

```text
sql/supabase-setup-v2.sql
```

4. Create your admin user in Supabase Authentication:

```text
akif.sayeed01@gmail.com
```

5. Open `/app/` and login with that Supabase email/password.

## Important

The frontend uses only the Supabase publishable/anon key in `assets/js/config.js`. Never place a service role key in frontend code.

## Gallery behavior

Gallery and certificate images are shown with natural ratio. They are not force-cropped. Profile photo is the only one displayed in a cropped professional frame.


## v2.1 logo/name fix
This version adds editable circle logo image support. In `/app/` go to **Profile → Site identity → Upload circle logo PNG/JPG**, upload a square/circle PNG, then click **Save content**. The public logo falls back to the ABS text if no logo image is set.


## Version 2.2 notes
- Dark theme only. The light-theme toggle has been removed.
- Dashboard scrolling has been fixed: the sidebar and editor area now scroll correctly.
- Hero name is set to `AKIF` and `BIN SAYEED` on separate lines.
- Demo content from the previous portfolio JSON is included in `assets/js/default-data.js` and `sql/supabase-setup-v2.sql`.
