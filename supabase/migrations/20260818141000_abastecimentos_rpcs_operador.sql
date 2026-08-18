-- Acesso do operador aos abastecimentos (Onda 20).
--
-- `abastecimentos` só tem policy para `authenticated` com is_retaguarda(), e o
-- App de Campo roda com a anon key. Enquanto a store lia `src/mocks/`, isso não
-- aparecia — mas o operador abastece em campo (`abastecer-page.tsx`), e esse
-- registro ia para memória e evaporava no primeiro reload. Ninguém no
-- escritório jamais viu um abastecimento lançado pelo operador.
--
-- Mesmo padrão de OS, apontamento e manutenção: SECURITY DEFINER com o token
-- opaco da sessão por PIN como parâmetro explícito.
--
-- REGRA FINANCEIRA: a leitura do operador não devolve `preco_litro` nem
-- `custo_total`. As colunas são listadas uma a uma de propósito — `select a.*`
-- passaria a vazar qualquer coluna de valor futura.

create index if not exists idx_abastecimentos_equipamento_id
  on public.abastecimentos (equipamento_id);

create or replace function public.listar_abastecimentos_operador(p_token uuid)
returns table (
  id uuid,
  equipamento_id uuid,
  operador_id uuid,
  litros numeric,
  horimetro numeric,
  local text,
  origem text,
  abastecido_em timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  -- Sem filtro por operador: a ficha do equipamento mostra o consumo da
  -- MÁQUINA, que é resultado do trabalho de todo mundo que a usou.
  return query
    select a.id, a.equipamento_id, a.operador_id, a.litros, a.horimetro,
           a.local, a.origem, a.abastecido_em, a.created_at, a.updated_at
      from public.abastecimentos a
     order by a.abastecido_em desc;
end;
$$;

revoke execute on function public.listar_abastecimentos_operador(uuid)
  from public, anon, authenticated;
grant execute on function public.listar_abastecimentos_operador(uuid) to anon;

-- Registra o abastecimento feito em campo.
--
-- `p_id` é gerado pelo cliente e serve de chave de idempotência, como em
-- `iniciar_apontamento`: reenviar o mesmo registro depois de reconectar
-- devolve a linha existente em vez de duplicar litros.
--
-- As duas validações que a store fazia no cliente vêm junto para cá. A do
-- horímetro compara com o último abastecimento DESTE equipamento — mesmo
-- critério de antes, agora com a lista inteira à vista, não só a da memória
-- daquele aparelho.
create or replace function public.registrar_abastecimento_operador(
  p_token uuid,
  p_id uuid,
  p_equipamento_id uuid,
  p_litros numeric,
  p_horimetro numeric,
  p_local text default null
)
returns setof public.abastecimentos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
  v_existente public.abastecimentos;
  v_ultimo numeric;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  select * into v_existente from public.abastecimentos where id = p_id;
  if found then
    return next v_existente;
    return;
  end if;

  if p_litros is null or p_litros <= 0 then
    raise exception 'Litros inválidos' using errcode = '22023';
  end if;

  select a.horimetro into v_ultimo
    from public.abastecimentos a
   where a.equipamento_id = p_equipamento_id
   order by a.abastecido_em desc
   limit 1;

  if v_ultimo is not null and p_horimetro < v_ultimo then
    raise exception 'Horímetro menor que o do último abastecimento' using errcode = '22023';
  end if;

  return query
    insert into public.abastecimentos
      (id, equipamento_id, operador_id, litros, horimetro, preco_litro, custo_total,
       local, origem, abastecido_em)
    values
      (p_id, p_equipamento_id, v_operador_id, p_litros, p_horimetro, null, null,
       nullif(btrim(coalesce(p_local, '')), ''), 'externo', now())
    returning *;
end;
$$;

revoke execute on function public.registrar_abastecimento_operador(uuid, uuid, uuid, numeric, numeric, text)
  from public, anon, authenticated;
grant execute on function public.registrar_abastecimento_operador(uuid, uuid, uuid, numeric, numeric, text)
  to anon;
