-- Phase 14: editorial workflow table privileges
-- RLS is the authorization layer; these grants allow the authenticated role
-- to use the tables under RLS without exposing data publicly.

grant select, insert, update on public.editorial_workflow_state to authenticated;
grant select, insert on public.editorial_workflow_events to authenticated;
