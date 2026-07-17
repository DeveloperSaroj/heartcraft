-- SmileHeart — run once in Supabase Dashboard → SQL Editor.

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  short_code text not null unique,
  payload jsonb not null,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

-- Anyone may create a wish and read one by its code; nobody (anon) may edit or delete.
create policy "anon can insert wishes" on public.wishes
  for insert to anon with check (true);
create policy "anon can read wishes" on public.wishes
  for select to anon using (true);

-- Open counter, callable by viewers without update rights on the table.
create or replace function public.increment_views(code text)
returns void language sql security definer set search_path = public as
$$ update public.wishes set view_count = view_count + 1 where short_code = code; $$;
grant execute on function public.increment_views(text) to anon;

-- Storage bucket for photos (public read).
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "anon can upload photos" on storage.objects
  for insert to anon with check (bucket_id = 'photos');
create policy "public can view photos" on storage.objects
  for select using (bucket_id = 'photos');
