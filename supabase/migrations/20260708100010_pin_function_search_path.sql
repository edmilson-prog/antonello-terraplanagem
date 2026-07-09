-- Pins search_path on the two functions flagged by Supabase's security
-- advisor (WARN function_search_path_mutable). Both already fully
-- schema-qualify their internal references, so this is defense-in-depth
-- hardening, not a functional fix. is_retaguarda() gates every RLS
-- policy in the schema, so it's worth pinning explicitly.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_retaguarda()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios_retaguarda where id = auth.uid()
  );
$$;
