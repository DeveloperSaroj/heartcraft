-- SmileHeart v5 — pre-launch "Coming Soon" emoji reactions. Run in SQL Editor.

create table if not exists public.launch_reactions (
  id uuid primary key default gen_random_uuid(),
  emoji text not null,
  created_at timestamptz not null default now()
);

alter table public.launch_reactions enable row level security;

-- Anyone may read the counts; inserts go only through the validated RPC.
create policy "anon can read launch reactions" on public.launch_reactions
  for select to anon using (true);

create or replace function public.add_launch_reaction(p_emoji text)
returns void language plpgsql security definer set search_path = public as
$$
begin
  if p_emoji in ('😍','❤️','🎉','🥳','🔥') then
    insert into public.launch_reactions(emoji) values (p_emoji);
  end if;
end
$$;

grant execute on function public.add_launch_reaction(text) to anon;
