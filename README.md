# Akif Bin Sayeed Portfolio + Mobile Admin App

This version uses a free static website on Netlify/GitHub and a free Supabase backend for:

- private login app at `/app/`
- direct image uploads from Android/laptop
- editable profile, hero text, floating labels, about text, education, experience, projects, skills, certificates, gallery and posts
- contact messages saved in Supabase
- gallery images displayed with their natural ratio instead of forced crop

## Important Supabase URL

The frontend must use the root Supabase URL, not `/rest/v1`.

Correct:

```txt
https://xlytrnbstwlcqzvuivwa.supabase.co
```

Wrong:

```txt
https://xlytrnbstwlcqzvuivwa.supabase.co/rest/v1/
```

If your Supabase dashboard shows a slightly different project URL, edit:

```txt
assets/js/config.js
```

## Setup steps

### 1. Run the SQL setup

Open Supabase → SQL Editor → New query.

Paste and run:

```txt
sql/supabase-setup.sql
```

If your admin email is not `akif.sayeed01@gmail.com`, replace it in the SQL first.

### 2. Create your admin login

Go to Supabase → Authentication → Users.

Create/add this user:

```txt
akif.sayeed01@gmail.com
```

Set a password that you can remember.

### 3. Upload this website to GitHub

Upload the files inside this folder to your existing `akif-portfolio` GitHub repository.

Correct structure:

```txt
akif-portfolio/
  index.html
  app/
  assets/
  data/
  sql/
  thanks.html
  netlify.toml
```

### 4. Netlify redeploys

After GitHub commit, Netlify should redeploy automatically.

### 5. Open your app

```txt
https://akifsayeed.netlify.app/app/
```

Log in with your Supabase admin email and password.

### 6. Seed starter content

Inside the app, click:

```txt
Seed starter content
```

This sends the starter CV-based portfolio content to Supabase.

### 7. Edit from Android/laptop

Use the app tabs:

- Profile
- Floating Labels
- Full Content
- Gallery
- Certificates
- Posts
- Messages

## Gallery image behavior

Profile/main image is displayed as a professional cropped profile visual.

Gallery images are displayed with natural ratio:

```css
.gallery-card img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
```

So portrait, landscape, certificate, event, and fieldwork photos can all appear without forced cropping.

## Security note

This app uses Supabase Auth and Row Level Security. Public users can read public content and send messages. Only the configured admin email can edit content, upload images, manage posts/certificates/gallery and read messages.

Never place a Supabase service_role key in frontend code.
