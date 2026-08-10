-- API de notificações (PRD-020).
--
-- O operador chama estas funções passando o token opaco da sessão como
-- PARÂMETRO EXPLÍCITO (não header) — mesmo contrato de login_operador. Cada
-- função valida o token e deriva o operador_id dele; o cliente nunca escolhe
-- de quem são as notificações que lê ou marca como lidas.

-- Resolve o operador dono de um token de sessão válido. Retorna null se o
-- token não existe, foi revogado ou expirou.
create or replace function public.operador_do_token(p_token uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select operador_id
    from public.operador_sessoes
   where token = p_token
     and not revogado
     and expira_em > now();
$$;

revoke all on function public.operador_do_token(uuid) from public;

-- Criação de notificação sem checagem de permissão. NÃO é exposta a nenhum
-- papel: existe só para ser chamada de dentro de triggers e de outras funções
-- SECURITY DEFINER que já validaram quem está pedindo.
create or replace function public.criar_notificacao_interna(
  p_operador_id uuid,
  p_tipo text,
  p_titulo text,
  p_mensagem text,
  p_os_id uuid default null,
  p_origem_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_operador_id is null then
    return null;
  end if;

  insert into public.notificacoes (operador_id, tipo, titulo, mensagem, os_id, origem_id)
    values (p_operador_id, p_tipo, p_titulo, p_mensagem, p_os_id, p_origem_id)
    on conflict do nothing
    returning id into v_id;

  -- v_id vem null quando idx_notificacoes_origem_unica barrou a duplicata.
  return v_id;
end;
$$;

revoke all on function public.criar_notificacao_interna(uuid, text, text, text, uuid, uuid) from public;

-- Notificar um operador a partir da retaguarda (apontamento aprovado,
-- correção solicitada, manutenção agendada).
create or replace function public.criar_notificacao(
  p_operador_id uuid,
  p_tipo text,
  p_titulo text,
  p_mensagem text,
  p_os_id uuid default null,
  p_origem_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_retaguarda() then
    raise exception 'Apenas a retaguarda pode notificar operadores' using errcode = '42501';
  end if;

  return public.criar_notificacao_interna(
    p_operador_id, p_tipo, p_titulo, p_mensagem, p_os_id, p_origem_id
  );
end;
$$;

revoke all on function public.criar_notificacao(uuid, text, text, text, uuid, uuid) from public;
grant execute on function public.criar_notificacao(uuid, text, text, text, uuid, uuid) to authenticated;

-- Notificação que o operador gera para si mesmo (comprovante de uma ação que
-- ele acabou de fazer em campo). O operador_id vem do token, nunca do
-- parâmetro, e o tipo é restrito — senão a chave anon viraria um megafone para
-- spammar qualquer operador.
create or replace function public.registrar_notificacao_propria(
  p_token uuid,
  p_tipo text,
  p_titulo text,
  p_mensagem text,
  p_os_id uuid default null,
  p_origem_id uuid default null
)
returns uuid
language plpgsql
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

  if p_tipo <> 'abastecimento_registrado' then
    raise exception 'Tipo de notificação não permitido pelo app de campo: %', p_tipo
      using errcode = '42501';
  end if;

  return public.criar_notificacao_interna(
    v_operador_id, p_tipo, p_titulo, p_mensagem, p_os_id, p_origem_id
  );
end;
$$;

revoke all on function public.registrar_notificacao_propria(uuid, text, text, text, uuid, uuid) from public;
grant execute on function public.registrar_notificacao_propria(uuid, text, text, text, uuid, uuid) to anon;

-- Lista as notificações do operador dono do token, mais recentes primeiro.
create or replace function public.listar_notificacoes(p_token uuid, p_limite integer default 50)
returns setof public.notificacoes
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
    select *
      from public.notificacoes
     where operador_id = v_operador_id
     order by created_at desc
     limit least(coalesce(p_limite, 50), 200);
end;
$$;

revoke all on function public.listar_notificacoes(uuid, integer) from public;
grant execute on function public.listar_notificacoes(uuid, integer) to anon;

-- Marca como lidas. Sem p_ids, marca todas as pendentes do operador (é o botão
-- "Marcar lidas" do cabeçalho). Retorna quantas mudaram — o app usa isso para
-- saber que a fila offline foi aceita.
create or replace function public.marcar_notificacoes_lidas(p_token uuid, p_ids uuid[] default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
  v_afetadas integer;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  update public.notificacoes
     set lida_em = now()
   where operador_id = v_operador_id
     and lida_em is null
     and (p_ids is null or id = any (p_ids));

  get diagnostics v_afetadas = row_count;
  return v_afetadas;
end;
$$;

revoke all on function public.marcar_notificacoes_lidas(uuid, uuid[]) from public;
grant execute on function public.marcar_notificacoes_lidas(uuid, uuid[]) to anon;

-- Guarda (ou atualiza) a inscrição de Web Push do dispositivo. O endpoint é
-- único: reinstalar o app no mesmo aparelho atualiza a linha em vez de
-- duplicar. Trocar de operador no mesmo aparelho reaponta a inscrição.
create or replace function public.registrar_push_subscription(
  p_token uuid,
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns void
language plpgsql
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

  insert into public.push_subscriptions (operador_id, endpoint, p256dh, auth, user_agent)
    values (v_operador_id, p_endpoint, p_p256dh, p_auth, p_user_agent)
    on conflict (endpoint) do update
      set operador_id = excluded.operador_id,
          p256dh      = excluded.p256dh,
          auth        = excluded.auth,
          user_agent  = excluded.user_agent,
          updated_at  = now();
end;
$$;

revoke all on function public.registrar_push_subscription(uuid, text, text, text, text) from public;
grant execute on function public.registrar_push_subscription(uuid, text, text, text, text) to anon;

-- Remove a inscrição deste dispositivo (o operador desligou o push, ou saiu).
create or replace function public.remover_push_subscription(p_token uuid, p_endpoint text)
returns void
language plpgsql
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

  delete from public.push_subscriptions
   where endpoint = p_endpoint
     and operador_id = v_operador_id;
end;
$$;

revoke all on function public.remover_push_subscription(uuid, text) from public;
grant execute on function public.remover_push_subscription(uuid, text) to anon;
