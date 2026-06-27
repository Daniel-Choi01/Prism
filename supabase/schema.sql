-- Prism — Supabase schema
-- Run this in the Supabase dashboard → SQL Editor (or `supabase db` if you use the CLI).
--
-- PHASE 1 (current): anonymous shareable reflections + voluntary feedback.
--   All access goes through the serverless functions using the SERVICE ROLE key,
--   which bypasses RLS. We enable RLS with NO broad public policies, so the public
--   anon key cannot read or write these tables directly. Reflections are reachable
--   only by their random share id (the share link).
--
-- PHASE 2 (when you turn on Supabase Auth — Google + anonymous): per-user private
--   history with Row-Level Security so a user can ONLY ever see their own rows.
--   That block is at the bottom, ready to run when auth is enabled.

create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ============================================================
-- PHASE 1
-- ============================================================

-- Saved reflections. Each gets a random share id; the link is the only way in.
create table if not exists public.reflections (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid,                       -- null for guest/anon; set in Phase 2
  situation         text not null,
  lenses            jsonb not null,             -- [{ id, reflection, question }, ...]
  synthesis         text not null,
  lens_ids          text[] not null default '{}',
  care_level        text not null default 'none',
  allow_improvement boolean not null default false,  -- only true with explicit consent
  is_shared         boolean not null default true,   -- Phase 1 rows are share-by-link
  created_at        timestamptz not null default now()
);
alter table public.reflections enable row level security;
-- No broad policies in Phase 1: only the service-role key (server-side) touches this.

-- Voluntary end-of-session feedback. We never store reflection *content* here —
-- only the rating + an optional note the person chooses to write.
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,                  -- null when signed out
  helpful     boolean,               -- thumbs up / down
  rating      smallint,              -- optional 1–5
  message     text,                  -- optional free-text note
  context     text default 'session_end',
  created_at  timestamptz not null default now()
);
alter table public.feedback enable row level security;
-- Phase 1: written via the service-role function only.

-- Optional tidy-up (needs pg_cron; safe to skip for the hackathon):
-- select cron.schedule('prune-reflections', '0 4 * * *',
--   $$ delete from public.reflections where created_at < now() - interval '365 days' $$);


-- ============================================================
-- PHASE 2 — accounts & per-user privacy (run when Supabase Auth is ON)
-- ============================================================
-- Uncomment and run this block once you enable Google + Anonymous sign-in.
-- It makes every user able to read/write ONLY their own rows (true data isolation),
-- while still allowing a deliberately-shared reflection to be opened by link.
--
-- -- one row per user; holds the opt-IN data-usage consent (default false = private)
-- create table if not exists public.profiles (
--   id                  uuid primary key references auth.users(id) on delete cascade,
--   data_usage_consent  boolean not null default false,
--   created_at          timestamptz not null default now(),
--   updated_at          timestamptz not null default now()
-- );
-- alter table public.profiles enable row level security;
-- create policy "profiles: own select" on public.profiles for select using (auth.uid() = id);
-- create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
-- create policy "profiles: own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
--
-- -- auto-create a profile row on signup
-- create or replace function public.handle_new_user() returns trigger
--   language plpgsql security definer set search_path = public as $$
-- begin
--   insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
--   return new;
-- end; $$;
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created after insert on auth.users
--   for each row execute function public.handle_new_user();
--
-- -- reflections become per-user
-- alter table public.reflections alter column user_id set not null;     -- after backfilling/clearing
-- alter table public.reflections add column if not exists share_id uuid not null default gen_random_uuid();
-- create unique index if not exists reflections_share_idx on public.reflections(share_id);
-- create index if not exists reflections_user_idx on public.reflections(user_id, created_at desc);
-- create policy "reflections: own all" on public.reflections for all
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "reflections: read shared" on public.reflections for select using (is_shared = true);
--
-- -- feedback becomes per-user
-- create policy "feedback: insert own" on public.feedback for insert
--   with check (auth.uid() = user_id or user_id is null);
-- create policy "feedback: read own" on public.feedback for select using (auth.uid() = user_id);


-- ============================================================
-- CLOUD SYNC — per-user private bundle (run this once Auth is on)
-- ============================================================
-- This is what makes "Prism remembers you" true ACROSS devices, not just one
-- browser. One row per signed-in user holds their private bundle (reflections,
-- journal, check-ins) as JSON. The browser reads/writes it DIRECTLY with the
-- public anon key — Row-Level Security guarantees a user can only ever touch
-- their OWN row (auth.uid() = user_id). Guests never use this: their data stays
-- on-device only. No service-role key, no server function involved.
--
-- This block is idempotent and safe to run on a fresh project with Auth enabled.

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,   -- { history:[], journal:[], checkins:[] }
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;

drop policy if exists "user_state: own select" on public.user_state;
drop policy if exists "user_state: own insert" on public.user_state;
drop policy if exists "user_state: own update" on public.user_state;
drop policy if exists "user_state: own delete" on public.user_state;

create policy "user_state: own select" on public.user_state for select using (auth.uid() = user_id);
create policy "user_state: own insert" on public.user_state for insert with check (auth.uid() = user_id);
create policy "user_state: own update" on public.user_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_state: own delete" on public.user_state for delete using (auth.uid() = user_id);
