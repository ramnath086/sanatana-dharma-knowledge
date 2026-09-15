-- Phase 16: editorial claims and evidence foundation
-- Read-only tables for internal editorial review.

create table public.editorial_claims (
  id text primary key,
  entity_id text not null,
  claim text not null,
  claim_type text not null,
  source_ids text[] not null default '{}',
  evidence_ids text[] not null default '{}',
  status text not null,
  confidence text not null,
  editorial_notes text,
  conflict_group_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.editorial_evidence (
  id text primary key,
  entity_id text not null,
  claim_id text,
  source_id text not null,
  location text,
  evidence_type text not null,
  confidence text not null,
  review_status text not null,
  perspective text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.editorial_claims enable row level security;
alter table public.editorial_evidence enable row level security;

revoke all on table public.editorial_claims from anon, authenticated;
revoke all on table public.editorial_evidence from anon, authenticated;

create policy "Editorial users can view claims"
  on public.editorial_claims
  for select
  to authenticated
  using (
    public.has_editorial_role('ADMIN')
    or public.has_editorial_role('SENIOR_EDITOR')
    or public.has_editorial_role('EDITOR')
    or public.has_editorial_role('TRADITIONAL_REVIEWER')
  );

create policy "Editorial users can view evidence"
  on public.editorial_evidence
  for select
  to authenticated
  using (
    public.has_editorial_role('ADMIN')
    or public.has_editorial_role('SENIOR_EDITOR')
    or public.has_editorial_role('EDITOR')
    or public.has_editorial_role('TRADITIONAL_REVIEWER')
  );

grant select on public.editorial_claims to authenticated;
grant select on public.editorial_evidence to authenticated;
