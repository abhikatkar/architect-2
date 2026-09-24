-- Projects, scoped to their owner.
--
-- This is the database deliverable from D16: the one slice of real Postgres in
-- the product. Everything downstream of a project (plan, agents, build, code,
-- deploy) is simulated and reads from lib/seed instead.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  prompt text,
  status text not null default 'draft' check (status in ('draft', 'building', 'built', 'deployed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Home lists a user's projects newest first, so index for exactly that.
create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Four explicit policies rather than one permissive rule, so a mistake in any
-- single verb cannot silently widen the others.
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  to authenticated
  using ((select auth.uid()) = user_id);
