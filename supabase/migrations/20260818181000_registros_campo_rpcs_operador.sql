-- Acesso do operador aos registros de campo (Onda 22).
--
-- Mesmo padrão de OS, apontamento, manutenção e abastecimento: SECURITY
-- DEFINER com o token opaco da sessão por PIN. O app roda como `anon` e a
-- policy de `registros_campo` só atende `authenticated` com is_retaguarda(),
-- então estas duas funções são a única porta.
--
-- `operador_id` NUNCA vem do cliente: é derivado do token. Um aparelho não
-- pode registrar checklist no nome de outro operador.

-- Grava um registro feito em campo.
--
-- IDEMPOTÊNCIA (ADR-001): `p_op_id` é a chave de operação gerada no aparelho.
-- O flush reenvia a fila inteira sempre que reconecta; reenviar o que já subiu
-- devolve a linha existente em vez de duplicar. É o que permite ao motor de
-- flush ser burro e seguro: em caso de dúvida, reenvia.
--
-- `p_registrado_em` também vem do cliente, e é de propósito: o operador
-- preencheu o diário às 8h no canteiro sem sinal e sincronizou às 17h no
-- escritório. A data do FATO é 8h. Usar now() aqui carimbaria a hora do
-- caminhão de volta, não a do trabalho.
create or replace function public.registrar_registro_campo(
  p_token uuid,
  p_id uuid,
  p_op_id uuid,
  p_tipo text,
  p_dados jsonb,
  p_registrado_em timestamptz,
  p_os_id uuid default null,
  p_equipamento_id uuid default null,
  p_assinatura text default null
)
returns setof public.registros_campo
language plpgsql
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
  v_existente public.registros_campo;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  -- Dedup por op_id: o registro já subiu numa tentativa anterior.
  select * into v_existente from public.registros_campo where op_id = p_op_id;
  if found then
    return next v_existente;
    return;
  end if;

  return query
    insert into public.registros_campo
      (id, op_id, tipo, operador_id, os_id, equipamento_id, dados, assinatura, registrado_em)
    values
      (p_id, p_op_id, p_tipo, v_operador_id, p_os_id, p_equipamento_id, p_dados,
       nullif(btrim(coalesce(p_assinatura, '')), ''),
       coalesce(p_registrado_em, now()))
    returning *;
end;
$$;

revoke execute on function public.registrar_registro_campo(uuid, uuid, uuid, text, jsonb, timestamptz, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.registrar_registro_campo(uuid, uuid, uuid, text, jsonb, timestamptz, uuid, uuid, text)
  to anon;

-- Lista os registros DO OPERADOR do token.
--
-- Filtra por operador porque é o histórico dele — diferente da leitura de
-- abastecimento, que mostra o consumo da máquina inteira porque a ficha é do
-- equipamento, não da pessoa.
--
-- NÃO devolve `assinatura`. A assinatura do cliente é dado pessoal (LGPD:
-- minimização) e no app ela é write-only — nenhuma tela do operador a lê de
-- volta, só a coleta. Quem precisa dela é a retaguarda, que lê pela tabela.
-- As colunas são listadas uma a uma justamente para que uma coluna sensível
-- futura não entre de carona num `select r.*`.
create or replace function public.listar_registros_campo_operador(p_token uuid)
returns table (
  id uuid,
  op_id uuid,
  tipo text,
  operador_id uuid,
  os_id uuid,
  equipamento_id uuid,
  dados jsonb,
  registrado_em timestamptz,
  created_at timestamptz
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

  return query
    select r.id, r.op_id, r.tipo, r.operador_id, r.os_id, r.equipamento_id,
           r.dados, r.registrado_em, r.created_at
      from public.registros_campo r
     where r.operador_id = v_operador_id
     order by r.registrado_em desc;
end;
$$;

revoke execute on function public.listar_registros_campo_operador(uuid)
  from public, anon, authenticated;
grant execute on function public.listar_registros_campo_operador(uuid) to anon;
