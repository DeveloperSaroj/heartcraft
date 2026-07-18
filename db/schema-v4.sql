-- SmileHeart v4 — creator-owned deletion. Run once in Supabase SQL Editor.
-- Lets a wish's creator permanently delete it so the link stops working,
-- without any login: a secret token (kept only on the creator's device) must
-- match the stored hash. Nobody else can delete the wish.

alter table public.wishes add column if not exists delete_hash text;

-- Deletes the wish only when the caller proves ownership with the secret token.
-- SECURITY DEFINER so it can delete despite RLS; hashes the token server-side
-- so the stored hash being readable is harmless. Reactions cascade-delete.
create or replace function public.delete_wish(p_code text, p_token text)
returns boolean
language plpgsql security definer set search_path = public, extensions as
$$
declare removed int;
begin
  delete from public.wishes
   where short_code = p_code
     and delete_hash is not null
     and delete_hash = encode(digest(p_token, 'sha256'), 'hex');
  get diagnostics removed = row_count;
  if removed > 0 then
    delete from public.wish_events where wish_code = p_code;
  end if;
  return removed > 0;
end
$$;

grant execute on function public.delete_wish(text, text) to anon;
