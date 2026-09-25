-- Jev call log, for guardrails and for the latency figures we publish.
--
-- Two things make this table different from projects and profiles:
--
-- 1. /demo is signed out, so writes happen as `anon`. Rather than shipping a
--    service role key to the app to do that, inserts go through a SECURITY
--    DEFINER function that accepts only the allowed columns and writes exactly
--    one row. `anon` gets execute on that function and nothing else.
--
-- 2. The table holds salted IP hashes, so `anon` gets no select at all. The
--    rate limit is read through a second definer function that returns counts
--    only, never rows.
--
-- No user content is ever stored here. Not the custom input, not the answer.
-- Only: when, which agent, how long it took, and how it ended. See D38.

create table if not exists public.jev_calls (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null check (agent_id in ('intake', 'grounding-checker', 'escalation-router')),
  -- live: a real Jev call. recorded: the cap or an error served a stored result.
  outcome text not null check (outcome in ('live', 'rate_limited', 'daily_cap', 'error')),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  -- sha256 of the IP plus a server-only salt. Not reversible without the salt.
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists jev_calls_created_at_idx
  on public.jev_calls (created_at desc);

create index if not exists jev_calls_ip_hash_created_at_idx
  on public.jev_calls (ip_hash, created_at desc);

alter table public.jev_calls enable row level security;

-- No policy grants select to anon or authenticated on purpose. With RLS on and
-- no permissive policy, the table is unreadable except through the definer
-- functions below and by the service role.
revoke all on public.jev_calls from anon, authenticated;

-- Writes one row, and only the columns a caller is allowed to set.
create or replace function public.log_jev_call(
  p_agent_id text,
  p_outcome text,
  p_latency_ms integer,
  p_ip_hash text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Validated here as well as by the check constraints, so a bad argument
  -- fails loudly rather than being written.
  if p_agent_id not in ('intake', 'grounding-checker', 'escalation-router') then
    raise exception 'unknown agent';
  end if;
  if p_outcome not in ('live', 'rate_limited', 'daily_cap', 'error') then
    raise exception 'unknown outcome';
  end if;

  insert into public.jev_calls (agent_id, outcome, latency_ms, ip_hash)
  values (p_agent_id, p_outcome, p_latency_ms, left(p_ip_hash, 64));
end;
$$;

-- Returns counts only, never rows, so a caller can enforce the limits without
-- being able to read anyone's IP hash.
create or replace function public.jev_call_counts(p_ip_hash text)
returns table (ip_hour_count integer, day_count integer)
language sql
security definer
set search_path = ''
as $$
  select
    (
      select count(*)::integer from public.jev_calls
      where ip_hash = p_ip_hash
        and outcome = 'live'
        and created_at > now() - interval '1 hour'
    ) as ip_hour_count,
    (
      select count(*)::integer from public.jev_calls
      where outcome = 'live'
        and created_at > now() - interval '1 day'
    ) as day_count;
$$;

-- Aggregates for the published metrics. No IP hashes, no per-row data.
create or replace function public.jev_call_stats()
returns table (total_calls integer, live_calls integer, median_latency_ms integer)
language sql
security definer
set search_path = ''
as $$
  select
    count(*)::integer,
    count(*) filter (where outcome = 'live')::integer,
    percentile_cont(0.5) within group (
      order by latency_ms
    ) filter (where outcome = 'live' and latency_ms is not null)::integer
  from public.jev_calls;
$$;

grant execute on function public.log_jev_call(text, text, integer, text) to anon, authenticated;
grant execute on function public.jev_call_counts(text) to anon, authenticated;
grant execute on function public.jev_call_stats() to anon, authenticated;
