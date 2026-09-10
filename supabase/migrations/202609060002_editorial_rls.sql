-- Phase 14: editorial RLS enforcement
-- Protects editorial_profiles by authenticated role.

-- Users can view their own profile
create policy "Users can view own profile"
  on public.editorial_profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Admins can view all profiles
create policy "Admins can view all profiles"
  on public.editorial_profiles
  for select
  to authenticated
  using (public.current_editorial_role() = 'ADMIN');

-- Users can update their own display_name only
create policy "Users can update own profile"
  on public.editorial_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = public.current_editorial_role()
  );

-- Admins can update any profile
create policy "Admins can update any profile"
  on public.editorial_profiles
  for update
  to authenticated
  using (public.current_editorial_role() = 'ADMIN')
  with check (public.current_editorial_role() = 'ADMIN');
