-- Phase 14 foundation: editorial identity and roles only.
-- Markdown remains the canonical content source; this schema persists editorial access later.

create type public.editorial_role as enum (
  'ADMIN',
  'SENIOR_EDITOR',
  'EDITOR',
  'TRADITIONAL_REVIEWER'
);

create table public.editorial_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.editorial_role not null default 'EDITOR',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.editorial_profiles enable row level security;

-- Profiles have no client-facing policies yet. This is intentional default deny.
-- Role lookup is available only through this security-definer function.
create or replace function public.current_editorial_role()
returns public.editorial_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.editorial_profiles
  where id = auth.uid()
$$;

revoke all on table public.editorial_profiles from anon, authenticated;
revoke all on function public.current_editorial_role() from public;
grant execute on function public.current_editorial_role() to authenticated;