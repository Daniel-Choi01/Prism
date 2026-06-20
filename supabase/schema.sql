-- Prism — Supabase schema
-- Run this in the Supabase dashboard → SQL Editor (or `supabase db` if you use the CLI).
-- One table holds saved reflections. Each gets a random UUID; the share link is the
-- only way to find one. All access goes through the serverless functions using the
-- SERVICE ROLE key, which bypasses RLS — so we enable RLS with NO public policies,
-- meaning the public/anon key cannot read or write this table directly.

create extension if not exists "pgcrypto";   -- for gen_random_uuid()

create table if not exists public.reflections (
  id          uuid primary key default gen_random_uuid(),
  situation   text not null,
  lenses      jsonb not null,            -- [{ id, reflection, question }, ...]
  synthesis   text not null,
  lens_ids    text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- Lock the table down. The service-role key (used only in /api/*) bypasses RLS.
alter table public.reflections enable row level security;

-- No policies for anon/authenticated == no direct client access. (Intentional.)
-- If you later add Supabase Auth and want per-user history, add policies here.

-- Optional: auto-delete reflections older than 1 year to keep things tidy.
-- (Requires pg_cron; safe to skip for the hackathon.)
-- select cron.schedule('prune-reflections', '0 4 * * *',
--   $$ delete from public.reflections where created_at < now() - interval '365 days' $$);
