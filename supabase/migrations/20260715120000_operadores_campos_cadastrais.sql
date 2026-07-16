-- Remove o overload antigo de 4 parâmetros antes de recriar `criar_operador`
-- com a nova assinatura de 10 — `create or replace function` casa por nome
-- E lista de tipos, então uma assinatura maior criaria um segundo overload
-- em vez de substituir o original (que ficaria órfão, ainda GRANTed).
drop function if exists public.criar_operador(text, text, text, boolean);

alter table public.operadores
  add column vinculo text check (vinculo in ('CLT', 'PJ')),
  add column data_nascimento date,
  add column cnh_categoria text,
  add column cnh_validade date,
  add column base text;

create table public.operadores_equipamentos (
  operador_id uuid not null references public.operadores (id) on delete cascade,
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (operador_id, equipamento_id)
);

alter table public.operadores_equipamentos enable row level security;

create policy "retaguarda lê operadores_equipamentos"
  on public.operadores_equipamentos for select
  to authenticated
  using (public.is_retaguarda());

create policy "retaguarda gerencia operadores_equipamentos"
  on public.operadores_equipamentos for all
  to authenticated
  using (public.is_retaguarda())
  with check (public.is_retaguarda());

-- Estende criar_operador com os novos campos cadastrais e a lista de
-- equipamentos habilitados — mantém tudo atômico na mesma transação da RPC
-- (em vez de um insert separado do lado do cliente após o retorno).
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
  p_equipamentos_ids uuid[] default null
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
    vinculo, data_nascimento, cnh_categoria, cnh_validade, base
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
    p_base
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
    'created_at', v_operador.created_at,
    'updated_at', v_operador.updated_at
  );
end;
$$;

revoke all on function public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[]
) from public;
grant execute on function public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[]
) to authenticated;
