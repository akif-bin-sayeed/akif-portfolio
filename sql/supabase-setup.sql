-- Akif Portfolio Supabase setup
-- Run this in Supabase SQL Editor.
-- If your admin login email is different, replace akif.sayeed01@gmail.com everywhere first.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamp with time zone default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  published boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  caption text,
  image_url text not null,
  published boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  year text,
  description text,
  image_url text,
  published boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.site_settings enable row level security;
alter table public.posts enable row level security;
alter table public.gallery enable row level security;
alter table public.certificates enable row level security;
alter table public.messages enable row level security;

-- Remove old policy versions so this script can be safely rerun.
drop policy if exists "site public read" on public.site_settings;
drop policy if exists "site admin manage" on public.site_settings;
drop policy if exists "posts public read" on public.posts;
drop policy if exists "posts admin manage" on public.posts;
drop policy if exists "gallery public read" on public.gallery;
drop policy if exists "gallery admin manage" on public.gallery;
drop policy if exists "certificates public read" on public.certificates;
drop policy if exists "certificates admin manage" on public.certificates;
drop policy if exists "messages public insert" on public.messages;
drop policy if exists "messages admin read" on public.messages;
drop policy if exists "messages admin update" on public.messages;
drop policy if exists "messages admin delete" on public.messages;

create policy "site public read" on public.site_settings
for select using (true);

create policy "site admin manage" on public.site_settings
for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com')
with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

create policy "posts public read" on public.posts
for select using (published = true);

create policy "posts admin manage" on public.posts
for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com')
with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

create policy "gallery public read" on public.gallery
for select using (published = true);

create policy "gallery admin manage" on public.gallery
for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com')
with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

create policy "certificates public read" on public.certificates
for select using (published = true);

create policy "certificates admin manage" on public.certificates
for all using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com')
with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

create policy "messages public insert" on public.messages
for insert with check (true);

create policy "messages admin read" on public.messages
for select using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

create policy "messages admin update" on public.messages
for update using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com')
with check (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

create policy "messages admin delete" on public.messages
for delete using (auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com');

-- Storage buckets for direct image upload from Android/laptop.
insert into storage.buckets (id, name, public)
values
  ('profile','profile',true),
  ('gallery','gallery',true),
  ('certificates','certificates',true),
  ('posts','posts',true),
  ('projects','projects',true)
on conflict (id) do update set public = excluded.public;

-- Storage policies.
drop policy if exists "portfolio images public read" on storage.objects;
drop policy if exists "portfolio images admin insert" on storage.objects;
drop policy if exists "portfolio images admin update" on storage.objects;
drop policy if exists "portfolio images admin delete" on storage.objects;

create policy "portfolio images public read" on storage.objects
for select using (bucket_id in ('profile','gallery','certificates','posts','projects'));

create policy "portfolio images admin insert" on storage.objects
for insert with check (
  bucket_id in ('profile','gallery','certificates','posts','projects')
  and auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com'
);

create policy "portfolio images admin update" on storage.objects
for update using (
  bucket_id in ('profile','gallery','certificates','posts','projects')
  and auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com'
) with check (
  bucket_id in ('profile','gallery','certificates','posts','projects')
  and auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com'
);

create policy "portfolio images admin delete" on storage.objects
for delete using (
  bucket_id in ('profile','gallery','certificates','posts','projects')
  and auth.jwt() ->> 'email' = 'akif.sayeed01@gmail.com'
);
