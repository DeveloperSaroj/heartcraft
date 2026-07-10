-- HeartCraft v2 — run once in Supabase Dashboard → SQL Editor.
-- (Adds recipient reactions; the v1 schema.sql must already be applied.)

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  wish_code text not null references public.wishes(short_code) on delete cascade,
  emoji text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.reactions enable row level security;

create policy "anon can insert reactions" on public.reactions
  for insert to anon with check (true);
create policy "anon can read reactions" on public.reactions
  for select to anon using (true);
