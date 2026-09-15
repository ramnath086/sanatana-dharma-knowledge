-- Phase 17B: editorial evidence authoring policies
-- Allows authenticated editorial roles to create and update evidence.

create policy "Editorial users can insert evidence"
  on public.editorial_evidence
  for insert
  to authenticated
  with check (
    entity_id is not null
    and claim_id is not null
    and (
      public.has_editorial_role('ADMIN')
      or public.has_editorial_role('SENIOR_EDITOR')
      or public.has_editorial_role('EDITOR')
      or public.has_editorial_role('TRADITIONAL_REVIEWER')
    )
  );

create policy "Editorial users can update evidence"
  on public.editorial_evidence
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
    and claim_id is not null
  );

grant insert, update on public.editorial_evidence to authenticated;

create or replace function public.enforce_evidence_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (OLD.entity_id <> NEW.entity_id or OLD.claim_id <> NEW.claim_id) and not public.has_editorial_role('ADMIN') then
    raise exception 'Cannot change entity_id or claim_id on editorial_evidence';
  end if;
  return NEW;
end;
$$;

revoke all on function public.enforce_evidence_ownership() from public;

create trigger enforce_evidence_ownership_trigger
  before update on public.editorial_evidence
  for each row execute function public.enforce_evidence_ownership();
