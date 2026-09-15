-- Phase 14: atomic editorial workflow transition RPC
-- Performs state change and event insert in one database call.

create or replace function public.apply_workflow_transition(
  _entity_id text,
  _new_state text,
  _action text,
  _reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _previous_state text;
  _actor_id uuid;
begin
  _actor_id := auth.uid();

  if _actor_id is null then
    raise exception 'Unauthenticated';
  end if;

  perform pg_advisory_xact_lock(hashtext(_entity_id));

  select workflow_state into _previous_state
  from public.editorial_workflow_state
  where entity_id = _entity_id
  for update;

  if _previous_state is null then
    _previous_state := 'DRAFT';
  end if;

  if _previous_state = _new_state then
    return;
  end if;

  if not public.has_editorial_role('ADMIN') then
    if not public.is_valid_workflow_transition(_previous_state, _new_state) then
      raise exception 'Invalid workflow transition: % -> %', _previous_state, _new_state;
    end if;
  end if;

  insert into public.editorial_workflow_events (
    entity_id, actor_id, previous_state, new_state, action, reason, timestamp
  ) values (
    _entity_id, _actor_id, _previous_state, _new_state, _action, _reason, now()
  );

  insert into public.editorial_workflow_state (
    entity_id, workflow_state, updated_by, updated_at
  ) values (
    _entity_id, _new_state, _actor_id, now()
  )
  on conflict (entity_id) do update set
    workflow_state = excluded.workflow_state,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.apply_workflow_transition(text, text, text, text) from public;
grant execute on function public.apply_workflow_transition(text, text, text, text) to authenticated;
