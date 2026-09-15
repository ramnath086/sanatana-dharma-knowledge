-- Phase 17A: editorial claims authoring policies
-- Allows authenticated editorial roles to create and update claims.

create policy "Editorial users can insert claims"
  on public.editorial_claims
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

create policy "Editorial users can update claims"
  on public.editorial_claims
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

grant insert, update on public.editorial_claims to authenticated;

create or replace function public.enforce_claim_entity_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.entity_id <> NEW.entity_id and not public.has_editorial_role('ADMIN') then
    raise exception 'Cannot change entity_id on editorial_claims';
  end if;
  return NEW;
end;
$$;

revoke all on function public.enforce_claim_entity_ownership() from public;

create trigger enforce_claim_entity_ownership_trigger
  before update on public.editorial_claims
  for each row execute function public.enforce_claim_entity_ownership();
