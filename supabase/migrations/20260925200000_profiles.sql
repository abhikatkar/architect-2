-- Per-user preferences, scoped to their owner.
--
-- The other half of the database deliverable in D16. Projects shipped in slice
-- 1; this carries the onboarding depth preference, which decides whether the
-- workspace opens its detail disclosures by default.
--
-- Same shape as public.projects on purpose: owner column referencing
-- auth.users, RLS on, and four policies rather than one permissive rule, so a
-- mistake in any single verb cannot silently widen the others.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  depth text not null default 'guided' check (depth in ('guided', 'details')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- public.set_updated_at already exists from the projects migration.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = user_id);
