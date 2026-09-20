-- Phase 18: editorial sources foundation
-- Internal editorial source records linked to entities.

create table public.editorial_sources (
  id text primary key,
  entity_id text not null,
  name text not null,
  source_type text not null,
  authority_level text not null,
  url text not null,
  description text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.editorial_sources enable row level security;

revoke all on table public.editorial_sources from anon, authenticated;

create policy "Editorial users can view sources"
  on public.editorial_sources
  for select
  to authenticated
  using (
    public.has_editorial_role('ADMIN')
    or public.has_editorial_role('SENIOR_EDITOR')
    or public.has_editorial_role('EDITOR')
    or public.has_editorial_role('TRADITIONAL_REVIEWER')
  );

create policy "Editorial users can insert sources"
  on public.editorial_sources
  for insert
  to authenticated
  with check (
    entity_id is not null
    and (
      public.has_editorial_role('ADMIN')
      or public.has_editorial_role('SENIOR_EDITOR')
      or public.has_editorial_role('EDITOR')
      or public.has_editorial_role('TRADITIONAL_REVIEWER')
    )
  );

create policy "Editorial users can update sources"
  on public.editorial_sources
  for update
  to authenticated
  using (
    public.has_editorial_role('ADMIN')
    or public.has_editorial_role('SENIOR_EDITOR')
    or public.has_editorial_role('EDITOR')
    or public.has_editorial_role('TRADITIONAL_REVIEWER')
  )
  with check (
    entity_id is not null
  );

grant select, insert, update on public.editorial_sources to authenticated;

create or replace function public.enforce_source_entity_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.entity_id <> NEW.entity_id and not public.has_editorial_role('ADMIN') then
    raise exception 'Cannot change entity_id on editorial_sources';
  end if;
  return NEW;
end;
$$;

revoke all on function public.enforce_source_entity_ownership() from public;

create trigger enforce_source_entity_ownership_trigger
  before update on public.editorial_sources
  for each row execute function public.enforce_source_entity_ownership();
