-- search_path fixo: sem isso, uma role com search_path próprio poderia
-- resolver os nomes internos para objetos plantados em outro schema.
create or replace function public.parametros_campos_de_negocio(registro public.parametros)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select to_jsonb(registro) - array['id','versao','atualizado_por','created_at','updated_at'];
$$;

create or replace function public.parametros_antes_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.parametros_campos_de_negocio(new)
     is distinct from public.parametros_campos_de_negocio(old) then
    new.versao := old.versao + 1;
    new.atualizado_por := auth.uid();
  end if;
  return new;
end;
$$;

-- Nenhuma das três é para ser chamada por RPC: duas são gatilhos e a terceira
-- é auxiliar interna. Revogar pelo nome da role — "from public" não basta,
-- porque anon/authenticated já receberam EXECUTE por default privileges.
revoke execute on function public.parametros_registrar_historico() from anon, authenticated;
revoke execute on function public.parametros_antes_update() from anon, authenticated;
revoke execute on function public.parametros_campos_de_negocio(public.parametros) from anon, authenticated;
