-- Phase 14: persistent editorial workflow storage
-- Append-only event log and current state table.

create table public.editorial_workflow_events (
  id uuid primary key default gen_random_uuid(),
  entity_id text not null,
  actor_id uuid not null references auth.users(id) on delete cascade,
  previous_state text not null,
  new_state text not null,
  action text not null,
  reason text,
  timestamp timestamptz not null default now()
);

create table public.editorial_workflow_state (
  entity_id text primary key,
  workflow_state text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete cascade
);

alter table public.editorial_workflow_events enable row level security;
alter table public.editorial_workflow_state enable row level security;

revoke all on table public.editorial_workflow_events from anon, authenticated;
revoke all on table public.editorial_workflow_state from anon, authenticated;

create or replace function public.has_editorial_role(_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.editorial_profiles
    where id = auth.uid()
      and role = _role::public.editorial_role
  )
$$;

revoke all on function public.has_editorial_role(text) from public;
grant execute on function public.has_editorial_role(text) to authenticated;

create policy "Editorial users can view workflow events"
  on public.editorial_workflow_events
  for select
  to authenticated
  using (
    public.has_editorial_role('ADMIN')
    or public.has_editorial_role('SENIOR_EDITOR')
    or public.has_editorial_role('EDITOR')
    or public.has_editorial_role('TRADITIONAL_REVIEWER')
  );

create policy "Editorial users can insert workflow events"
  on public.editorial_workflow_events
  for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and (
      public.has_editorial_role('ADMIN')
      or public.has_editorial_role('SENIOR_EDITOR')
      or public.has_editorial_role('EDITOR')
      or public.has_editorial_role('TRADITIONAL_REVIEWER')
    )
  );

create policy "Editorial users can view workflow state"
  on public.editorial_workflow_state
  for select
  to authenticated
  using (
    public.has_editorial_role('ADMIN')
    or public.has_editorial_role('SENIOR_EDITOR')
    or public.has_editorial_role('EDITOR')
    or public.has_editorial_role('TRADITIONAL_REVIEWER')
  );

create policy "Editorial users can upsert workflow state"
  on public.editorial_workflow_state
  for insert
  to authenticated
  with check (
    updated_by = auth.uid()
    and (
      public.has_editorial_role('ADMIN')
      or public.has_editorial_role('SENIOR_EDITOR')
      or public.has_editorial_role('EDITOR')
      or public.has_editorial_role('TRADITIONAL_REVIEWER')
    )
  );

create policy "Editorial users can update workflow state"
  on public.editorial_workflow_state
  for update
  to authenticated
  using (
    updated_by = auth.uid()
    or public.has_editorial_role('ADMIN')
  );

create or replace function public.enforce_workflow_state_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.updated_by <> NEW.updated_by and not public.has_editorial_role('ADMIN') then
    raise exception 'Cannot change updated_by on editorial_workflow_state';
  end if;
  return NEW;
end;
$$;

revoke all on function public.enforce_workflow_state_ownership() from public;

create trigger enforce_workflow_state_ownership_trigger
  before update on public.editorial_workflow_state
  for each row execute function public.enforce_workflow_state_ownership();

create or replace function public.is_valid_workflow_transition(_from text, _to text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select _to = any(
    case _from
      when 'DISCOVERED' then array['RESEARCHING']
      when 'RESEARCHING' then array['DRAFT']
      when 'DRAFT' then array['SOURCE_CHECK']
      when 'SOURCE_CHECK' then array['EDITORIAL_REVIEW']
      when 'EDITORIAL_REVIEW' then array['TRADITIONAL_REVIEW', 'APPROVED', 'DRAFT']
      when 'TRADITIONAL_REVIEW' then array['APPROVED', 'DRAFT']
      when 'APPROVED' then array['PUBLISHED', 'DRAFT']
      when 'PUBLISHED' then array['ARCHIVED', 'SOURCE_CHECK']
      when 'ARCHIVED' then array[]::text[]
      else array[]::text[]
    end
  )
$$;

revoke all on function public.is_valid_workflow_transition(text, text) from public;
grant execute on function public.is_valid_workflow_transition(text, text) to authenticated;

create or replace function public.enforce_workflow_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.workflow_state = NEW.workflow_state then
    return NEW;
  end if;

  if not public.has_editorial_role('ADMIN') then
    if not public.is_valid_workflow_transition(OLD.workflow_state, NEW.workflow_state) then
      raise exception 'Invalid workflow transition: % -> %', OLD.workflow_state, NEW.workflow_state;
    end if;
  end if;

  return NEW;
end;
$$;

revoke all on function public.enforce_workflow_transition() from public;

create trigger enforce_workflow_transition_trigger
  before update on public.editorial_workflow_state
  for each row execute function public.enforce_workflow_transition();
