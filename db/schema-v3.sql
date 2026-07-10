-- HeartCraft v3 — aggregate analytics (no personal data, DB-level only).
-- Run once in Supabase Dashboard → SQL Editor. (v1 and v2 must already be applied.)

create table if not exists public.wish_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('created', 'opened')),
  wish_code text,
  occasion text,
  browser text,
  os text,
  device_type text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists wish_events_type_idx on public.wish_events (event_type, created_at);
create index if not exists wish_events_occasion_idx on public.wish_events (occasion);

alter table public.wish_events enable row level security;

-- No RLS policy grants anon direct table access — inserts go only through
-- the function below (same pattern as increment_views), so the public API
-- can log an event but can never read, update, or delete this table.
create or replace function public.log_wish_event(
  p_event_type text, p_wish_code text, p_occasion text,
  p_browser text, p_os text, p_device_type text, p_referrer text
) returns void language sql security definer set search_path = public as
$$
  insert into public.wish_events (event_type, wish_code, occasion, browser, os, device_type, referrer)
  values (p_event_type, p_wish_code, p_occasion, p_browser, p_os, p_device_type, p_referrer);
$$;
grant execute on function public.log_wish_event(text, text, text, text, text, text, text) to anon;

-- Handy views for the queries you'll run most often.
create or replace view public.v_opens_per_day as
  select date(created_at) as day, count(*) as opens
  from public.wish_events where event_type = 'opened'
  group by 1 order by 1;

create or replace view public.v_popular_occasions as
  select occasion, count(*) as wishes_created
  from public.wish_events where event_type = 'created'
  group by 1 order by 2 desc;

create or replace view public.v_browser_breakdown as
  select browser, os, device_type, count(*) as opens
  from public.wish_events where event_type = 'opened'
  group by 1, 2, 3 order by 4 desc;
