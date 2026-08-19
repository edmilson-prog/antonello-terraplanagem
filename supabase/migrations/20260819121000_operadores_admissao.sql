-- Data de admissão do operador.
--
-- O card "Dados cadastrais" já exibia "admissão mar/2021" — sorteado. A coluna
-- que sustentaria esse texto nunca existiu: `created_at` é quando o cadastro
-- foi digitado, não quando a pessoa foi admitida, e usar um pelo outro seria
-- trocar uma mentira por outra mais discreta.
--
-- Nulo é resposta válida: operador cadastrado sem essa informação mostra "—".

alter table public.operadores
  add column if not exists admissao date;

comment on column public.operadores.admissao is
  'Data de admissão. Distinta de created_at (data do cadastro no sistema).';

-- `create or replace` casa por nome E tipos: acrescentar um parâmetro criaria
-- um overload e deixaria o de 10 argumentos órfão, ainda com grant.
drop function if exists public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[]
);

create or replace function public.criar_operador(
  p_nome text,
  p_telefone text,
  p_cpf text,
  p_ativo boolean default true,
  p_vinculo text default null,
  p_data_nascimento date default null,
  p_cnh_categoria text default null,
  p_cnh_validade date default null,
  p_base text default null,
  p_equipamentos_ids uuid[] default null,
  p_admissao date default null
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

  insert into public.operadores (
    nome, telefone, cpf, pin_hash, ativo,
    vinculo, data_nascimento, cnh_categoria, cnh_validade, base, admissao
  )
  values (
    trim(p_nome),
    nullif(trim(coalesce(p_telefone, '')), ''),
    v_cpf,
    extensions.crypt(right(v_cpf, 4), extensions.gen_salt('bf')),
    coalesce(p_ativo, true),
    p_vinculo,
    p_data_nascimento,
    p_cnh_categoria,
    p_cnh_validade,
    p_base,
    p_admissao
  )
  returning * into v_operador;

  if p_equipamentos_ids is not null and array_length(p_equipamentos_ids, 1) > 0 then
    insert into public.operadores_equipamentos (operador_id, equipamento_id)
    select v_operador.id, unnest(p_equipamentos_ids);
  end if;

  return jsonb_build_object(
    'id', v_operador.id,
    'nome', v_operador.nome,
    'telefone', v_operador.telefone,
    'cpf', v_operador.cpf,
    'ativo', v_operador.ativo,
    'vinculo', v_operador.vinculo,
    'data_nascimento', v_operador.data_nascimento,
    'cnh_categoria', v_operador.cnh_categoria,
    'cnh_validade', v_operador.cnh_validade,
    'base', v_operador.base,
    'admissao', v_operador.admissao,
    'created_at', v_operador.created_at,
    'updated_at', v_operador.updated_at
  );
end;
$$;

revoke all on function public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[], date
) from public;
grant execute on function public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[], date
) to authenticated;

-- Habilitação de equipamentos na EDIÇÃO. Até aqui só o cadastro inicial
-- gravava `operadores_equipamentos`: editar um operador não tinha como
-- adicionar ou remover máquina, e o card "Equipamentos habilitados" congelava
-- no que foi escolhido no dia do cadastro.
--
-- Substituição do conjunto inteiro numa transação — mais simples de raciocinar
-- que diff incremental, e a lista é de dezenas de itens, não de milhares.
create or replace function public.definir_equipamentos_operador(
  p_operador_id uuid,
  p_equipamentos_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_retaguarda() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  delete from public.operadores_equipamentos
   where operador_id = p_operador_id
     and (p_equipamentos_ids is null or not (equipamento_id = any (p_equipamentos_ids)));

  if p_equipamentos_ids is not null and array_length(p_equipamentos_ids, 1) > 0 then
    insert into public.operadores_equipamentos (operador_id, equipamento_id)
    select p_operador_id, unnest(p_equipamentos_ids)
    on conflict (operador_id, equipamento_id) do nothing;
  end if;
end;
$$;

revoke all on function public.definir_equipamentos_operador(uuid, uuid[]) from public;
grant execute on function public.definir_equipamentos_operador(uuid, uuid[]) to authenticated;
