-- RPC para a retaguarda cadastrar operador via UI (insert direto exige pin_hash,
-- que só pode ser gerado com pgcrypto no servidor). PIN inicial = últimos 4 dígitos do CPF,
-- mesma convenção usada no cadastro em lote dos 15 operadores reais.
create or replace function public.criar_operador(
  p_nome text,
  p_telefone text,
  p_cpf text,
  p_ativo boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_operador public.operadores;
  v_cpf text := regexp_replace(p_cpf, '\D', '', 'g');
begin
  if not public.is_retaguarda() then
    raise exception 'Acesso negado';
  end if;

  insert into public.operadores (nome, telefone, cpf, pin_hash, ativo)
  values (
    trim(p_nome),
    nullif(trim(coalesce(p_telefone, '')), ''),
    v_cpf,
    extensions.crypt(right(v_cpf, 4), extensions.gen_salt('bf')),
    coalesce(p_ativo, true)
  )
  returning * into v_operador;

  return jsonb_build_object(
    'id', v_operador.id,
    'nome', v_operador.nome,
    'telefone', v_operador.telefone,
    'cpf', v_operador.cpf,
    'ativo', v_operador.ativo,
    'created_at', v_operador.created_at,
    'updated_at', v_operador.updated_at
  );
end;
$$;

revoke all on function public.criar_operador(text, text, text, boolean) from public;
grant execute on function public.criar_operador(text, text, text, boolean) to authenticated;
