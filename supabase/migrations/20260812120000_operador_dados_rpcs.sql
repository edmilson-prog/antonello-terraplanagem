-- Acesso do operador aos dados de OS e apontamento.
--
-- O App de Campo roda com a anon key: dentro de /app o Postgres vê a role
-- `anon`, não um usuário autenticado. Como `ordens_servico` e `apontamentos`
-- só têm policy para `authenticated`, e RLS sem policy que case devolve lista
-- vazia em vez de erro, o operador enxergava zero OS — silenciosamente.
--
-- A saída é a mesma já usada pelo login e pelas notificações (PRD-020): função
-- SECURITY DEFINER recebendo o token opaco da sessão como PARÂMETRO EXPLÍCITO,
-- que resolve o operador por operador_do_token() e filtra por ele. O cliente
-- nunca escolhe de quem são as linhas que lê ou escreve, e nenhuma policy de
-- escrita é aberta para `anon` em tabela de negócio.
--
-- Idempotência (ADR-001): o id do apontamento é gerado pelo cliente e serve de
-- opId. Reenviar o mesmo insert depois de reconectar devolve a linha existente
-- em vez de duplicar horas.

-- Os filtros das funções abaixo batem nestas colunas em toda chamada.
create index if not exists idx_apontamentos_operador_id on public.apontamentos (operador_id);
create index if not exists idx_apontamentos_os_id on public.apontamentos (os_id);
create index if not exists idx_ordens_servico_responsavel_id on public.ordens_servico (responsavel_id);

-- "Minhas OS" = sou o responsável OU tenho apontamento nela. Espelha
-- ordensDoOperador() em src/features/ordem-servico/derivacoes.ts — a regra é
-- uma só, aplicada no banco para o operador e no cliente para a retaguarda.
-- Interna: não é exposta a nenhum papel, só chamada por quem já validou o token.
create or replace function public.ordens_do_operador_ids(p_operador_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select os.id
    from public.ordens_servico os
   where os.responsavel_id = p_operador_id
      or exists (
           select 1
             from public.apontamentos a
            where a.os_id = os.id
              and a.operador_id = p_operador_id
         );
$$;

revoke all on function public.ordens_do_operador_ids(uuid) from public;

-- Ordens de serviço visíveis ao operador dono do token.
create or replace function public.listar_ordens_operador(p_token uuid)
returns setof public.ordens_servico
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
    select os.*
      from public.ordens_servico os
     where os.id in (select public.ordens_do_operador_ids(v_operador_id))
     order by os.aberta_em desc;
end;
$$;

revoke all on function public.listar_ordens_operador(uuid) from public;
grant execute on function public.listar_ordens_operador(uuid) to anon;

-- Apontamentos que o operador enxerga: os dele, mais os dos colegas nas OS em
-- que ele trabalha. A OS é colaborativa (ADR-001) e a tela de detalhe mostra as
-- horas da equipe; devolver só os próprios apontamentos faria "horas da equipe"
-- virar "minhas horas". Apontamento não carrega dado financeiro, então isso não
-- fura a regra de /app nunca exibir valor.
create or replace function public.listar_apontamentos_operador(p_token uuid)
returns setof public.apontamentos
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
    select a.*
      from public.apontamentos a
     where a.operador_id = v_operador_id
        or a.os_id in (select public.ordens_do_operador_ids(v_operador_id))
     order by a.iniciado_em desc;
end;
$$;

revoke all on function public.listar_apontamentos_operador(uuid) from public;
grant execute on function public.listar_apontamentos_operador(uuid) to anon;

-- Abre um apontamento. p_id é gerado pelo cliente e é a chave de idempotência:
-- o flush da fila offline pode reenviar o mesmo apontamento sem duplicar horas.
create or replace function public.iniciar_apontamento(
  p_token uuid,
  p_id uuid,
  p_equipamento_id uuid,
  p_horimetro_inicial numeric,
  p_os_id uuid default null,
  p_observacao text default null,
  p_foto_inicial_url text default null,
  p_modalidade text default null
)
returns setof public.apontamentos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
  v_existente public.apontamentos;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  -- Reenvio da fila offline: devolve o que já foi gravado, sem duplicar.
  select * into v_existente from public.apontamentos where id = p_id;
  if found then
    if v_existente.operador_id <> v_operador_id then
      raise exception 'Apontamento de outro operador' using errcode = '42501';
    end if;
    return next v_existente;
    return;
  end if;

  -- Premissa do domínio: no máximo um apontamento aberto por operador.
  if exists (
    select 1
      from public.apontamentos
     where operador_id = v_operador_id
       and status = 'em_andamento'
  ) then
    raise exception 'Já existe apontamento em andamento' using errcode = '55006';
  end if;

  if p_horimetro_inicial is null or p_horimetro_inicial < 0 then
    raise exception 'Horímetro inicial inválido' using errcode = '22023';
  end if;

  return query
    insert into public.apontamentos (
      id, equipamento_id, operador_id, os_id, horimetro_inicial,
      observacao, foto_inicial_url, modalidade, status, pendente_sync, iniciado_em
    )
    values (
      p_id, p_equipamento_id, v_operador_id, p_os_id, p_horimetro_inicial,
      nullif(btrim(coalesce(p_observacao, '')), ''), p_foto_inicial_url, p_modalidade,
      'em_andamento', false, now()
    )
    returning *;
end;
$$;

revoke all on function public.iniciar_apontamento(uuid, uuid, uuid, numeric, uuid, text, text, text) from public;
grant execute on function public.iniciar_apontamento(uuid, uuid, uuid, numeric, uuid, text, text, text) to anon;

-- Fecha o apontamento. Só o dono fecha, e só o que está em andamento.
-- Refechar com o MESMO horímetro é no-op bem-sucedido (reenvio da fila);
-- com horímetro diferente é erro, porque aí são duas leituras conflitantes.
create or replace function public.finalizar_apontamento(
  p_token uuid,
  p_id uuid,
  p_horimetro_final numeric,
  p_foto_final_url text default null,
  p_metros_executados numeric default null,
  p_observacao text default null
)
returns setof public.apontamentos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
  v_atual public.apontamentos;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  select * into v_atual from public.apontamentos where id = p_id;
  if not found or v_atual.operador_id <> v_operador_id then
    raise exception 'Apontamento não encontrado' using errcode = 'P0002';
  end if;

  if v_atual.status = 'finalizado' then
    if v_atual.horimetro_final = p_horimetro_final then
      return next v_atual;
      return;
    end if;
    raise exception 'Apontamento já finalizado' using errcode = '55000';
  end if;

  if p_horimetro_final is null or p_horimetro_final < v_atual.horimetro_inicial then
    raise exception 'Horímetro final menor que o inicial' using errcode = '22023';
  end if;

  return query
    update public.apontamentos
       set horimetro_final = p_horimetro_final,
           -- Mesma regra de calcularHoras(): 1 casa, para não acumular drift.
           horas_trabalhadas = round(p_horimetro_final - horimetro_inicial, 1),
           foto_final_url = coalesce(p_foto_final_url, foto_final_url),
           metros_executados = coalesce(p_metros_executados, metros_executados),
           -- A nota do fechamento soma-se à da abertura, não a substitui.
           observacao = case
             when nullif(btrim(coalesce(p_observacao, '')), '') is null then observacao
             else concat_ws(E'\n', nullif(observacao, ''), btrim(p_observacao))
           end,
           status = 'finalizado',
           pendente_sync = false,
           finalizado_em = now(),
           updated_at = now()
     where id = p_id
    returning *;
end;
$$;

revoke all on function public.finalizar_apontamento(uuid, uuid, numeric, text, numeric, text) from public;
grant execute on function public.finalizar_apontamento(uuid, uuid, numeric, text, numeric, text) to anon;
